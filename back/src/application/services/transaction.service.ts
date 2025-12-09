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
    private async validateDateRestriction(fechaOperacion: string | Date): Promise<void> {
        const paramStr = await parametroService.get('EDITARPLANILLAFECHAANTERIOR');

        let config = { habilitado: true, dias: 0 };
        if (paramStr) {
            // paramStr comes as parsed JSON from service.get() if it's valid JSON
            // But let's handle if it returns the string or object
            config = (typeof paramStr === 'string' ? JSON.parse(paramStr) : paramStr) || config;
        }

        if (!config.habilitado) {
            // Verify if today matches operation date
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const opDate = new Date(fechaOperacion);
            // Handle timezones loosely or strictly? 
            // Better to normalize to YYYY-MM-DD
            const opDateStr = opDate.toISOString().split('T')[0];
            const todayStr = today.toISOString().split('T')[0];

            if (opDateStr !== todayStr) {
                throw new Error("No está habilitada la edición/creación de operaciones en fechas anteriores.");
            }
        } else {
            // Habilitado is true. Check 'dias'.
            if (config.dias > 0) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const opDate = new Date(fechaOperacion);
                opDate.setHours(0, 0, 0, 0);

                const diffTime = Math.abs(today.getTime() - opDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                // If opDate is in the future? Usually allowed unless restricted.
                // Assuming restriction is for PAST dates.
                if (opDate < today && diffDays > config.dias) {
                    throw new Error(`Solo se pueden editar/crear operaciones de hasta ${config.dias} días de antigüedad.`);
                }
            }
        }
    }

    async procesarTransaccion(dto: TransactionDTO): Promise<PlanillaDiaria> {
        // Validate Date Restriction BEFORE transaction
        await this.validateDateRestriction(dto.fecha_operacion);

        return await AppDataSource.transaction<PlanillaDiaria>(async (entityManager) => {
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

            if (tipoMov.lleva_observacion && !dto.observaciones) {
                throw new Error(`El movimiento ${tipoMov.nombre} requiere una observación obligatoria.`);
            }

            // Determinar si impacta en stock (VIP o Anónimo = SI, No VIP = NO)
            // Default: Si no hay cliente, impacta. Si hay cliente, depende del flag es_vip.
            const impactaStock = !cliente || cliente.es_vip;

            // Determinar fecha de operación
            const fechaOperacion: any = dto.fecha_operacion;

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

            // Normalizar Acción
            let accion = tipoMov.tipo_accion;
            if (!accion) {
                if (tipoMov.contabilizacion === Contabilizacion.ENTRADA) {
                    accion = AccionMovimiento.ENTRADA;
                } else if (tipoMov.contabilizacion === Contabilizacion.SALIDA) {
                    accion = AccionMovimiento.SALIDA;
                }
            }

            if (accion === AccionMovimiento.VENTA) {
                // VENTA: Sale Moneda Extranjera (Egreso)
                monedaEgreso = moneda;
                montoEgreso = dto.monto;

                if (impactaStock) {
                    const stockSalida = await stockRepo.findOneBy({ moneda: { id: moneda.id } });
                    if (shouldValidate) {
                        if (!stockSalida || Number(stockSalida.saldo_actual) < dto.monto) {
                            throw new Error(`Saldo insuficiente en ${moneda.codigo} para realizar la venta.`);
                        }
                    }
                    if (stockSalida) {
                        stockUpdatePromises.push(
                            stockRepo.decrement({ id: stockSalida.id }, "saldo_actual", dto.monto)
                        );
                    } else {
                        const newStock = stockRepo.create({ moneda: moneda, saldo_actual: -dto.monto });
                        stockUpdatePromises.push(stockRepo.save(newStock));
                    }
                }

                // INGRESO
                if (esCambio) {
                    monedaIngreso = monedaNacional;
                    montoIngreso = dto.monto * (dto.cotizacion || 1);

                    if (impactaStock) {
                        let stockEntrada = await stockRepo.findOneBy({ moneda: { id: monedaNacional.id } });
                        if (!stockEntrada) {
                            stockEntrada = stockRepo.create({ moneda: monedaNacional, saldo_actual: 0 });
                            await stockRepo.save(stockEntrada);
                        }
                        stockUpdatePromises.push(
                            stockRepo.increment({ id: stockEntrada.id }, "saldo_actual", montoIngreso)
                        );
                    }
                } else {
                    monedaIngreso = null;
                    montoIngreso = 0;
                }

            } else if (accion === AccionMovimiento.COMPRA) {
                // COMPRA: Entra Moneda Extranjera (Ingreso)
                monedaIngreso = moneda;
                montoIngreso = dto.monto;

                if (impactaStock) {
                    let stockEntrada = await stockRepo.findOneBy({ moneda: { id: moneda.id } });
                    if (!stockEntrada) {
                        stockEntrada = stockRepo.create({ moneda: moneda, saldo_actual: 0 });
                        await stockRepo.save(stockEntrada);
                    }
                    stockUpdatePromises.push(
                        stockRepo.increment({ id: stockEntrada.id }, "saldo_actual", montoIngreso)
                    );
                }

                // EGRESO
                if (esCambio) {
                    const montoPesos = dto.monto * (dto.cotizacion || 1);
                    monedaEgreso = monedaNacional;
                    montoEgreso = montoPesos;

                    if (impactaStock) {
                        const stockSalida = await stockRepo.findOneBy({ moneda: { id: monedaNacional.id } });
                        if (shouldValidate) {
                            if (!stockSalida || Number(stockSalida.saldo_actual) < montoPesos) {
                                throw new Error(`Saldo insuficiente en ${monedaNacional.codigo} para realizar la compra.`);
                            }
                        }
                        if (stockSalida) {
                            stockUpdatePromises.push(
                                stockRepo.decrement({ id: stockSalida.id }, "saldo_actual", montoEgreso)
                            );
                        } else {
                            const newStock = stockRepo.create({ moneda: monedaNacional, saldo_actual: -montoEgreso });
                            stockUpdatePromises.push(stockRepo.save(newStock));
                        }
                    }
                } else {
                    monedaEgreso = null;
                    montoEgreso = 0;
                }

            } else if (accion === AccionMovimiento.ENTRADA) {
                // Entrada simple
                monedaIngreso = moneda;
                montoIngreso = dto.monto;
                monedaEgreso = null;
                montoEgreso = 0;

                if (impactaStock) {
                    let stockEntrada = await stockRepo.findOneBy({ moneda: { id: moneda.id } });
                    if (!stockEntrada) {
                        stockEntrada = stockRepo.create({ moneda: moneda, saldo_actual: 0 });
                        await stockRepo.save(stockEntrada);
                    }
                    stockUpdatePromises.push(
                        stockRepo.increment({ id: stockEntrada.id }, "saldo_actual", montoIngreso)
                    );
                }

            } else if (accion === AccionMovimiento.SALIDA) {
                // Salida simple
                monedaEgreso = moneda;
                montoEgreso = dto.monto;
                monedaIngreso = null;
                montoIngreso = 0;

                if (impactaStock) {
                    const stockSalida = await stockRepo.findOneBy({ moneda: { id: moneda.id } });
                    if (shouldValidate) {
                        if (!stockSalida || Number(stockSalida.saldo_actual) < dto.monto) {
                            throw new Error(`Saldo insuficiente en ${moneda.codigo} para realizar la salida.`);
                        }
                    }
                    if (stockSalida) {
                        stockUpdatePromises.push(
                            stockRepo.decrement({ id: stockSalida.id }, "saldo_actual", montoEgreso)
                        );
                    } else {
                        const newStock = stockRepo.create({ moneda: moneda, saldo_actual: -montoEgreso });
                        stockUpdatePromises.push(stockRepo.save(newStock));
                    }
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
                impacta_stock: impactaStock // Guardamos el flag
            });

            const savedPlanilla = await planillaRepo.save(planilla);

            // 6. Impacto en Cta Cte (Si corresponde) - Esto sigue igual, independiente del Stock
            if (tipoMov.graba_cta_cte && cliente) {
                let montoIngresoCtaCte = 0;
                let montoEgresoCtaCte = 0;
                let isEntrada = (tipoMov.contabilizacion as any) === Contabilizacion.ENTRADA;
                let isSalida = (tipoMov.contabilizacion as any) === Contabilizacion.SALIDA;

                if (!isEntrada && !isSalida) {
                    const accion = tipoMov.tipo_accion;
                    if (accion === AccionMovimiento.COMPRA || accion === AccionMovimiento.ENTRADA) {
                        isEntrada = true;
                    } else if (accion === AccionMovimiento.VENTA || accion === AccionMovimiento.SALIDA) {
                        isSalida = true;
                    }
                }

                if (!isEntrada && !isSalida) {
                    throw new Error("Configuración inconsistente: graba_cta_cte es true pero no se puede determinar si es ENTRADA o SALIDA.");
                }

                if (isEntrada) {
                    montoEgresoCtaCte = dto.monto;
                } else {
                    montoIngresoCtaCte = dto.monto;
                }

                const ctaCteMov = ctaCteMovRepo.create({
                    fecha_operacion: fechaOperacion,
                    cliente: cliente,
                    moneda: moneda,
                    monto_ingreso: montoIngresoCtaCte,
                    monto_egreso: montoEgresoCtaCte,
                    observaciones: `Ref: Planilla #${savedPlanilla.id} - ${dto.observaciones || ''}`,
                    planilla_asociada: savedPlanilla
                });
                await ctaCteMovRepo.save(ctaCteMov);

                let saldoEntity = await ctaCteSaldoRepo.findOne({
                    where: { cliente: { id: cliente.id }, moneda: { id: moneda.id } }
                });

                if (!saldoEntity) {
                    saldoEntity = ctaCteSaldoRepo.create({
                        cliente: cliente,
                        moneda: moneda,
                        saldo_actual: 0
                    });
                    await ctaCteSaldoRepo.save(saldoEntity);
                }

                if (montoIngresoCtaCte > 0) {
                    await ctaCteSaldoRepo.increment({ id: saldoEntity.id }, "saldo_actual", montoIngresoCtaCte);
                }
                if (montoEgresoCtaCte > 0) {
                    await ctaCteSaldoRepo.decrement({ id: saldoEntity.id }, "saldo_actual", montoEgresoCtaCte);
                }
            }

            return savedPlanilla;
        });
    }

    async anularTransaccion(id: number): Promise<void> {
        // Preliminary check and validation outside transaction
        const planillaCheck = await AppDataSource.getRepository(PlanillaDiaria).findOneBy({ id });
        if (!planillaCheck) throw new Error("Transacción no encontrada");

        await this.validateDateRestriction(planillaCheck.fecha_operacion);

        return await AppDataSource.transaction(async (entityManager) => {
            const planillaRepo = entityManager.getRepository(PlanillaDiaria);
            const stockRepo = entityManager.getRepository(StockCaja);
            const ctaCteMovRepo = entityManager.getRepository(CtaCteMovimiento);
            const ctaCteSaldoRepo = entityManager.getRepository(CtaCteSaldo);

            // 1. Obtener la planilla (Need to fetch again inside transaction for consistency/locking)
            const planilla = await planillaRepo.findOne({
                where: { id },
                relations: ["tipo_movimiento", "moneda_ingreso", "moneda_egreso", "cliente"]
            });

            if (!planilla) throw new Error("Transacción no encontrada");

            // 2. Revertir Stock
            // Solo si la planilla dice que impactó stock
            if (planilla.impacta_stock) {
                if (planilla.moneda_ingreso && planilla.monto_ingreso > 0) {
                    const stockIngreso = await stockRepo.findOneBy({ moneda: { id: planilla.moneda_ingreso.id } });
                    if (stockIngreso) {
                        await stockRepo.decrement({ id: stockIngreso.id }, "saldo_actual", planilla.monto_ingreso);
                    }
                }

                if (planilla.moneda_egreso && planilla.monto_egreso > 0) {
                    let stockEgreso = await stockRepo.findOneBy({ moneda: { id: planilla.moneda_egreso.id } });
                    if (!stockEgreso) {
                        stockEgreso = stockRepo.create({ moneda: planilla.moneda_egreso, saldo_actual: 0 });
                        await stockRepo.save(stockEgreso);
                    }
                    await stockRepo.increment({ id: stockEgreso.id }, "saldo_actual", planilla.monto_egreso);
                }
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
                    // Si fue DEUDA (Egreso), ahora RESTAMOS (decrement).
                    // Si fue PAGO (Ingreso), ahora SUMAMOS (increment) -> Returning debt basically.
                    // Invertir el impacto (Anulación):
                    // Si fue INGRESO (Deuda subió), ahora RESTAMOS.
                    // Si fue EGRESO (Deuda bajó/pagó), ahora SUMAMOS.
                    if (ctaCteMov.monto_ingreso > 0) {
                        await ctaCteSaldoRepo.decrement({ id: saldoEntity.id }, "saldo_actual", ctaCteMov.monto_ingreso);
                    }
                    if (ctaCteMov.monto_egreso > 0) {
                        await ctaCteSaldoRepo.increment({ id: saldoEntity.id }, "saldo_actual", ctaCteMov.monto_egreso);
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
