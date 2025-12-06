import { AppDataSource } from "../../infrastructure/database/data-source";
import { PlanillaDiaria } from "../../domain/entities/PlanillaDiaria";
import { StockCaja } from "../../domain/entities/StockCaja";
import { CtaCteMovimiento } from "../../domain/entities/CtaCteMovimiento";
import { CtaCteSaldo } from "../../domain/entities/CtaCteSaldo";
import { TipoMovimiento, AccionMovimiento, Contabilizacion } from "../../domain/entities/TipoMovimiento";
import { Moneda } from "../../domain/entities/Moneda";
import { Cliente } from "../../domain/entities/Cliente";
import { TipoMovimientoCtaCte } from "../../domain/enums/TipoMovimientoCtaCte";
import parametroService from "./parametro.service";

export interface TransactionDTO {
    tipoMovimientoId: number;
    monto: number; // Monto de la moneda principal (generalmente la extranjera en cambios)
    monedaId: number; // ID de la moneda del monto
    cotizacion?: number;
    clienteId?: number;
    observaciones?: string;
    usuarioId?: number; // Para auditoría futura
    fecha_operacion: string | Date; // Fecha obligatoria de la operación
}

export class TransactionService {
    async procesarTransaccion(dto: TransactionDTO): Promise<PlanillaDiaria> {
        return await AppDataSource.transaction(async (entityManager) => {
            // 1. Repositorios (dentro de la transacción)
            const tipoMovRepo = entityManager.getRepository(TipoMovimiento);
            const monedaRepo = entityManager.getRepository(Moneda);
            const clienteRepo = entityManager.getRepository(Cliente);
            const stockRepo = entityManager.getRepository(StockCaja);
            const planillaRepo = entityManager.getRepository(PlanillaDiaria);
            const ctaCteMovRepo = entityManager.getRepository(CtaCteMovimiento);
            const ctaCteSaldoRepo = entityManager.getRepository(CtaCteSaldo);

            // 2. Validaciones Iniciales
            if (!dto.fecha_operacion) {
                throw new Error("La fecha de operación es obligatoria.");
            }

            const tipoMov = await tipoMovRepo.findOneBy({ id: dto.tipoMovimientoId });
            if (!tipoMov) throw new Error("Tipo de Movimiento no encontrado");

            const moneda = await monedaRepo.findOneBy({ id: dto.monedaId });
            if (!moneda) throw new Error("Moneda no encontrada");

            let cliente: Cliente | null = null;
            if (dto.clienteId) {
                cliente = await clienteRepo.findOneBy({ id: dto.clienteId });
                if (!cliente) throw new Error("Cliente no encontrado");
            }

            if (tipoMov.requiere_persona && !cliente) {
                throw new Error(`El movimiento ${tipoMov.nombre} requiere un cliente asignado.`);
            }

            if (tipoMov.requiere_cotizacion && (!dto.cotizacion || dto.cotizacion <= 0)) {
                throw new Error(`El movimiento ${tipoMov.nombre} requiere una cotización válida.`);
            }

            // Determinar fecha de operación
            const fechaOperacion = new Date(dto.fecha_operacion);

            // 3. Determinar Moneda Nacional (para contraparte en cambios)
            const monedaNacional = await monedaRepo.findOneBy({ es_nacional: true });
            if (!monedaNacional) throw new Error("No hay moneda nacional configurada en el sistema.");

            // 4. Preparar datos de Planilla y Stock
            let montoIngreso = 0;
            let montoEgreso = 0;
            let monedaIngreso: Moneda | null = null;
            let monedaEgreso: Moneda | null = null;
            let stockUpdatePromises: Promise<any>[] = [];

            // Lógica según Acción - Check CONTROLSALDO
            const controlSaldo = await parametroService.get('CONTROLSALDO');
            const shouldValidate = controlSaldo !== false;

            // Determinar si es Circuito Completo (Cambio) o Unilateral
            const esCambio = tipoMov.requiere_cotizacion;

            // Normalizar Acción: Si no tiene tipo_accion, usamos contabilizacion
            let accion = tipoMov.tipo_accion;
            if (!accion) {
                if (tipoMov.contabilizacion === Contabilizacion.ENTRADA) {
                    accion = AccionMovimiento.ENTRADA; // ENTRADA = Entra dinero (Activo aumenta)
                } else if (tipoMov.contabilizacion === Contabilizacion.SALIDA) {
                    accion = AccionMovimiento.SALIDA;  // SALIDA = Sale dinero (Activo disminuye)
                }
            }

            if (accion === AccionMovimiento.VENTA) {
                // VENTA: Sale Moneda Extranjera (Egreso) de la caja
                const stockSalida = await stockRepo.findOneBy({ moneda: { id: moneda.id } });

                if (shouldValidate) {
                    if (!stockSalida || Number(stockSalida.saldo_actual) < dto.monto) {
                        throw new Error(`Saldo insuficiente en ${moneda.codigo} para realizar la venta.`);
                    }
                }

                monedaEgreso = moneda;
                montoEgreso = dto.monto;

                // Actualizar Stock de SALIDA (Decrementar)
                if (stockSalida) {
                    stockUpdatePromises.push(
                        stockRepo.decrement({ id: stockSalida.id }, "saldo_actual", dto.monto)
                    );
                } else {
                    const newStock = stockRepo.create({ moneda: moneda, saldo_actual: -dto.monto });
                    stockUpdatePromises.push(stockRepo.save(newStock));
                }

                // INGRESO
                if (esCambio) {
                    // Es Cambio: Calculamos Ingreso en Moneda Nacional
                    monedaIngreso = monedaNacional;
                    montoIngreso = dto.monto * (dto.cotizacion || 1);

                    let stockEntrada = await stockRepo.findOneBy({ moneda: { id: monedaNacional.id } });
                    if (!stockEntrada) {
                        stockEntrada = stockRepo.create({ moneda: monedaNacional, saldo_actual: 0 });
                        await stockRepo.save(stockEntrada);
                    }
                    stockUpdatePromises.push(
                        stockRepo.increment({ id: stockEntrada.id }, "saldo_actual", montoIngreso)
                    );
                } else {
                    // Unilateral: No hay ingreso registrado
                    monedaIngreso = null;
                    montoIngreso = 0;
                }

            } else if (accion === AccionMovimiento.COMPRA) {
                // COMPRA: Entra Moneda Extranjera (Ingreso)
                monedaIngreso = moneda;
                montoIngreso = dto.monto;

                // Actualizar Stock de ENTRADA (Incrementar)
                let stockEntrada = await stockRepo.findOneBy({ moneda: { id: moneda.id } });
                if (!stockEntrada) {
                    stockEntrada = stockRepo.create({ moneda: moneda, saldo_actual: 0 });
                    await stockRepo.save(stockEntrada);
                }
                stockUpdatePromises.push(
                    stockRepo.increment({ id: stockEntrada.id }, "saldo_actual", montoIngreso)
                );

                // EGRESO
                if (esCambio) {
                    // Es Cambio: Sale Moneda Nacional
                    const montoPesos = dto.monto * (dto.cotizacion || 1);
                    const stockSalida = await stockRepo.findOneBy({ moneda: { id: monedaNacional.id } });

                    if (shouldValidate) {
                        if (!stockSalida || Number(stockSalida.saldo_actual) < montoPesos) {
                            throw new Error(`Saldo insuficiente en ${monedaNacional.codigo} para realizar la compra.`);
                        }
                    }

                    monedaEgreso = monedaNacional;
                    montoEgreso = montoPesos;

                    if (stockSalida) {
                        stockUpdatePromises.push(
                            stockRepo.decrement({ id: stockSalida.id }, "saldo_actual", montoEgreso)
                        );
                    } else {
                        const newStock = stockRepo.create({ moneda: monedaNacional, saldo_actual: -montoEgreso });
                        stockUpdatePromises.push(stockRepo.save(newStock));
                    }
                } else {
                    // Unilateral: No hay egreso registrado
                    monedaEgreso = null;
                    montoEgreso = 0;
                }

            } else if (accion === AccionMovimiento.ENTRADA) {
                // Entrada simple
                monedaIngreso = moneda;
                montoIngreso = dto.monto;
                monedaEgreso = null;
                montoEgreso = 0;

                let stockEntrada = await stockRepo.findOneBy({ moneda: { id: moneda.id } });
                if (!stockEntrada) {
                    stockEntrada = stockRepo.create({ moneda: moneda, saldo_actual: 0 });
                    await stockRepo.save(stockEntrada);
                }
                stockUpdatePromises.push(
                    stockRepo.increment({ id: stockEntrada.id }, "saldo_actual", montoIngreso)
                );

            } else if (accion === AccionMovimiento.SALIDA) {
                // Salida simple
                const stockSalida = await stockRepo.findOneBy({ moneda: { id: moneda.id } });

                if (shouldValidate) {
                    if (!stockSalida || Number(stockSalida.saldo_actual) < dto.monto) {
                        throw new Error(`Saldo insuficiente en ${moneda.codigo} para realizar la salida.`);
                    }
                }

                monedaEgreso = moneda;
                montoEgreso = dto.monto;
                monedaIngreso = null;
                montoIngreso = 0;

                if (stockSalida) {
                    stockUpdatePromises.push(
                        stockRepo.decrement({ id: stockSalida.id }, "saldo_actual", montoEgreso)
                    );
                } else {
                    const newStock = stockRepo.create({ moneda: moneda, saldo_actual: -montoEgreso });
                    stockUpdatePromises.push(stockRepo.save(newStock));
                }
            }

            await Promise.all(stockUpdatePromises);

            // 5. Crear Registro en Planilla
            const planilla = planillaRepo.create({
                fecha_operacion: fechaOperacion,
                tipo_movimiento: tipoMov,
                cliente: cliente,
                moneda_ingreso: monedaIngreso,
                monto_ingreso: montoIngreso,
                moneda_egreso: monedaEgreso,
                monto_egreso: montoEgreso,
                cotizacion_aplicada: dto.cotizacion,
                observaciones: dto.observaciones,
            });

            const savedPlanilla = await planillaRepo.save(planilla);

            // 6. Impacto en Cta Cte (Si corresponde)
            if (tipoMov.graba_cta_cte && cliente) {
                // Lógica de Mapeo:
                // Caja DEBE (Entrada) -> Cta Cte CREDITO (Disminuye deuda)
                // Caja HABER (Salida) -> Cta Cte DEBITO (Aumenta deuda)

                let tipoCtaCte: TipoMovimientoCtaCte;

                if (tipoMov.contabilizacion === Contabilizacion.ENTRADA) {
                    tipoCtaCte = TipoMovimientoCtaCte.CREDITO;
                } else if (tipoMov.contabilizacion === Contabilizacion.SALIDA) {
                    tipoCtaCte = TipoMovimientoCtaCte.DEBITO;
                } else {
                    // Si es NEUTRO o no definido, y graba_cta_cte es true, necesitamos una regla por defecto o error.
                    // Asumiremos que si es VENTA (Sale dinero) es DEBITO, si es COMPRA (Entra dinero) es CREDITO?
                    // Mejor basarse estrictamente en la contabilización de la caja.
                    throw new Error("Configuración inconsistente: graba_cta_cte es true pero la contabilización no es ENTRADA ni SALIDA.");
                }

                const ctaCteMov = ctaCteMovRepo.create({
                    fecha_operacion: fechaOperacion,
                    tipo: tipoCtaCte,
                    cliente: cliente,
                    moneda: moneda, // La moneda de la Cta Cte suele ser la moneda de la operación principal
                    monto: dto.monto, // El monto nominal
                    cotizacion_aplicada: dto.cotizacion,
                    observaciones: `Ref: Planilla #${savedPlanilla.id} - ${dto.observaciones || ''}`,
                    planilla_asociada: savedPlanilla
                });
                await ctaCteMovRepo.save(ctaCteMov);

                // Actualizar Saldo Cta Cte
                let saldoEntity = await ctaCteSaldoRepo.findOne({
                    where: { cliente: { id: cliente.id }, moneda: { id: moneda.id } }
                });

                if (!saldoEntity) {
                    saldoEntity = ctaCteSaldoRepo.create({
                        cliente: cliente,
                        moneda: moneda,
                        saldo_actual: 0
                    });
                    await ctaCteSaldoRepo.save(saldoEntity); // Save first to get ID if needed, though not strictly necessary for create
                }

                // Actualización atómica del saldo
                if (tipoCtaCte === TipoMovimientoCtaCte.DEBITO) {
                    await ctaCteSaldoRepo.increment({ id: saldoEntity.id }, "saldo_actual", dto.monto);
                } else {
                    await ctaCteSaldoRepo.decrement({ id: saldoEntity.id }, "saldo_actual", dto.monto);
                }
            }

            return savedPlanilla;
        });
    }
    async anularTransaccion(id: number): Promise<void> {
        return await AppDataSource.transaction(async (entityManager) => {
            const planillaRepo = entityManager.getRepository(PlanillaDiaria);
            const stockRepo = entityManager.getRepository(StockCaja);
            const ctaCteMovRepo = entityManager.getRepository(CtaCteMovimiento);
            const ctaCteSaldoRepo = entityManager.getRepository(CtaCteSaldo);

            // 1. Obtener la planilla
            const planilla = await planillaRepo.findOne({
                where: { id },
                relations: ["tipo_movimiento", "moneda_ingreso", "moneda_egreso", "cliente"]
            });

            if (!planilla) throw new Error("Transacción no encontrada");

            // 2. Revertir Stock
            // Si hubo ingreso, ahora sale (decrement). Si hubo egreso, ahora entra (increment).
            if (planilla.moneda_ingreso && planilla.monto_ingreso > 0) {
                const stockIngreso = await stockRepo.findOneBy({ moneda: { id: planilla.moneda_ingreso.id } });
                if (stockIngreso) {
                    await stockRepo.decrement({ id: stockIngreso.id }, "saldo_actual", planilla.monto_ingreso);
                }
            }

            if (planilla.moneda_egreso && planilla.monto_egreso > 0) {
                let stockEgreso = await stockRepo.findOneBy({ moneda: { id: planilla.moneda_egreso.id } });
                if (!stockEgreso) {
                    // Si por alguna razón no existe, lo creamos para poder devolver el saldo
                    stockEgreso = stockRepo.create({ moneda: planilla.moneda_egreso, saldo_actual: 0 });
                    await stockRepo.save(stockEgreso);
                }
                await stockRepo.increment({ id: stockEgreso.id }, "saldo_actual", planilla.monto_egreso);
            }

            // 3. Revertir Cta Cte (Si aplica)
            // Buscamos el movimiento de Cta Cte asociado a esta planilla
            const ctaCteMov = await ctaCteMovRepo.findOne({
                where: { planilla_asociada: { id: planilla.id } },
                relations: ["cliente", "moneda"]
            });

            if (ctaCteMov) {
                const saldoEntity = await ctaCteSaldoRepo.findOne({
                    where: { cliente: { id: ctaCteMov.cliente.id }, moneda: { id: ctaCteMov.moneda.id } }
                });

                if (saldoEntity) {
                    // Invertir el impacto:
                    // Si fue DEBITO (aumentó deuda), ahora restamos (decrement).
                    // Si fue CREDITO (disminuyó deuda), ahora sumamos (increment).
                    if (ctaCteMov.tipo === TipoMovimientoCtaCte.DEBITO) {
                        await ctaCteSaldoRepo.decrement({ id: saldoEntity.id }, "saldo_actual", ctaCteMov.monto);
                    } else {
                        await ctaCteSaldoRepo.increment({ id: saldoEntity.id }, "saldo_actual", ctaCteMov.monto);
                    }
                }

                // Soft delete del movimiento de Cta Cte
                await ctaCteMovRepo.softRemove(ctaCteMov);
            }

            // 4. Soft delete de la planilla
            await planillaRepo.softRemove(planilla);
        });
    }
}
