import { AppDataSource } from "../data-source";
import { Operacion } from "../../../domain/entities/Operacion";
import { TipoMovimiento, AccionMovimiento, Contabilizacion } from "../../../domain/entities/TipoMovimiento";
import { Moneda } from "../../../domain/entities/Moneda";
import { PlanillaDiaria } from "../../../domain/entities/PlanillaDiaria";
import { CtaCteRepository } from "../../repositories/ctaCte.repository";
import { TipoMovimientoCtaCte } from "../../../domain/enums/TipoMovimientoCtaCte";
import { Cliente } from "../../../domain/entities/Cliente";

async function seed() {
    try {
        await AppDataSource.initialize();
        console.log("Data Source has been initialized!");

        const operacionRepository = AppDataSource.getRepository(Operacion);
        const tipoMovimientoRepository = AppDataSource.getRepository(TipoMovimiento);
        const monedaRepository = AppDataSource.getRepository(Moneda);
        const planillaRepository = AppDataSource.getRepository(PlanillaDiaria);
        const clienteRepository = AppDataSource.getRepository(Cliente);

        // 1. Seed Operaciones
        const operacionesData = [
            "VARIOS",
            "GASTOS",
            "MOVIMIENTO DE CTA CTE",
            "CAMBIO DE BILLETE",
            "TRANSFERENCIA",
        ];

        const operacionesMap = new Map<string, Operacion>();

        for (const nombre of operacionesData) {
            let operacion = await operacionRepository.findOneBy({ nombre });
            if (!operacion) {
                operacion = operacionRepository.create({ nombre });
                await operacionRepository.save(operacion);
                console.log(`Created Operacion: ${nombre}`);
            }
            operacionesMap.set(nombre, operacion);
        }

        // 2. Seed TiposMovimiento
        const tiposMovimientoData = [
            // CAMBIO DE BILLETE
            {
                nombre: "VENTA DE BILLETE",
                operacion: "CAMBIO DE BILLETE",
                tipo_accion: AccionMovimiento.VENTA,
                contabilizacion: Contabilizacion.SALIDA,
                requiere_cotizacion: true,
            },
            {
                nombre: "COMPRA DE BILLETE",
                operacion: "CAMBIO DE BILLETE",
                tipo_accion: AccionMovimiento.COMPRA,
                contabilizacion: Contabilizacion.ENTRADA,
                requiere_cotizacion: true,
            },
            // GASTOS
            {
                nombre: "GASTOS EN PESOS",
                operacion: "GASTOS",
                tipo_accion: AccionMovimiento.SALIDA,
                contabilizacion: Contabilizacion.SALIDA,
                lleva_observacion: true,
            },
            {
                nombre: "GASTOS EN DLS",
                operacion: "GASTOS",
                tipo_accion: AccionMovimiento.SALIDA,
                contabilizacion: Contabilizacion.SALIDA,
                lleva_observacion: true,
            },
            // VARIOS
            {
                nombre: "VARIOS COMPRA",
                operacion: "VARIOS",
                tipo_accion: AccionMovimiento.COMPRA,
                contabilizacion: Contabilizacion.ENTRADA,
            },
            {
                nombre: "ENTRADA VARIOS",
                operacion: "VARIOS",
                tipo_accion: AccionMovimiento.ENTRADA,
                contabilizacion: Contabilizacion.ENTRADA,
            },
            {
                nombre: "SALIDA VARIOS",
                operacion: "VARIOS",
                tipo_accion: AccionMovimiento.SALIDA,
                contabilizacion: Contabilizacion.SALIDA,
            },
            // MOVIMIENTO DE CTA CTE
            {
                nombre: "ENTRADA DE CTA CTE EN MONEDA EXTRAJERA",
                operacion: "MOVIMIENTO DE CTA CTE",
                tipo_accion: AccionMovimiento.ENTRADA,
                contabilizacion: Contabilizacion.ENTRADA,
                graba_cta_cte: true,
                requiere_persona: true,
            },
            {
                nombre: "ENTRADA DE CTA.CTE A CTA.CTE TESORERIA EN PESOS",
                operacion: "MOVIMIENTO DE CTA CTE",
                tipo_accion: AccionMovimiento.ENTRADA,
                contabilizacion: Contabilizacion.ENTRADA,
                graba_cta_cte: true,
                requiere_persona: true,
            },
            {
                nombre: "SALIDA DE CTA.CTE. TESORERIA A CTA.CTE. EN PESOS",
                operacion: "MOVIMIENTO DE CTA CTE",
                tipo_accion: AccionMovimiento.SALIDA,
                contabilizacion: Contabilizacion.SALIDA,
                graba_cta_cte: true,
                requiere_persona: true,
            },
            {
                nombre: "SALIDA DE CTA CTE MONEDA EXTRANJERA",
                operacion: "MOVIMIENTO DE CTA CTE",
                tipo_accion: AccionMovimiento.SALIDA,
                contabilizacion: Contabilizacion.SALIDA,
                graba_cta_cte: true,
                requiere_persona: true,
            },
            // TRANSFERENCIA
            {
                nombre: "TRANSFERENCIA DE COMPRA",
                operacion: "TRANSFERENCIA",
                tipo_accion: AccionMovimiento.COMPRA,
                contabilizacion: Contabilizacion.ENTRADA,
            },
        ];

        const tiposMap = new Map<string, TipoMovimiento>();

        for (const data of tiposMovimientoData) {
            let tipo = await tipoMovimientoRepository.findOneBy({ nombre: data.nombre });
            if (!tipo) {
                const operacion = operacionesMap.get(data.operacion);
                if (operacion) {
                    tipo = tipoMovimientoRepository.create({
                        ...data,
                        operacion: operacion,
                    });
                    await tipoMovimientoRepository.save(tipo);
                    console.log(`Created TipoMovimiento: ${data.nombre}`);
                }
            }
            if (tipo) tiposMap.set(data.nombre, tipo);
        }

        // 3. Seed Monedas (Ensure USD exists)
        let dolar = await monedaRepository.findOneBy({ codigo: "USD" });
        if (!dolar) {
            dolar = monedaRepository.create({
                codigo: "USD",
                nombre: "Dolar Estadounidense",
                simbolo: "$",
                es_nacional: false,
            });
            await monedaRepository.save(dolar);
            console.log("Created Moneda: USD");
        }

        let peso = await monedaRepository.findOneBy({ codigo: "ARS" });
        if (!peso) {
            peso = monedaRepository.create({
                codigo: "ARS",
                nombre: "Peso Argentino",
                simbolo: "$",
                es_nacional: true,
            });
            await monedaRepository.save(peso);
            console.log("Created Moneda: ARS");
        }

        // 4. Seed PlanillaDiaria (Test Transactions)
        const ventaBillete = tiposMap.get("VENTA DE BILLETE");
        if (ventaBillete && dolar && peso) {
            const existing = await planillaRepository.findOne({
                where: { tipo_movimiento: { id: ventaBillete.id } },
            });

            if (!existing) {
                const transaccion = planillaRepository.create({
                    fecha_operacion: new Date(),
                    tipo_movimiento: ventaBillete,
                    moneda_ingreso: peso,
                    monto_ingreso: 100000, // Entran 100k pesos
                    moneda_egreso: dolar,
                    monto_egreso: 100, // Salen 100 dolares
                    cotizacion_aplicada: 1000,
                    observaciones: "Venta de prueba seed",
                });
                await planillaRepository.save(transaccion);
                console.log("Created PlanillaDiaria: VENTA DE BILLETE");
            }
        }

        const gastoPesos = tiposMap.get("GASTOS EN PESOS");
        if (gastoPesos && peso) {
            const existing = await planillaRepository.findOne({
                where: { tipo_movimiento: { id: gastoPesos.id } },
            });

            if (!existing) {
                const transaccion = planillaRepository.create({
                    fecha_operacion: new Date(),
                    tipo_movimiento: gastoPesos,
                    moneda_ingreso: null,
                    monto_ingreso: 0,
                    moneda_egreso: peso,
                    monto_egreso: 5000, // Salen 5000 pesos
                    cotizacion_aplicada: 1,
                    observaciones: "Compra de insumos",
                });
                await planillaRepository.save(transaccion);
                console.log("Created PlanillaDiaria: GASTOS EN PESOS");
            }
        }

        // 5. Seed Cta Cte (Test Data)
        // Create a client if not exists
        let cliente = await clienteRepository.findOneBy({ alias: "SeedClient" });
        if (!cliente) {
            cliente = clienteRepository.create({
                alias: "SeedClient",
                nombre_real: "Cliente Seed Cta Cte",
                documento: "99999999",
                es_moroso: false
            });
            await clienteRepository.save(cliente);
            console.log("Created Cliente: SeedClient");
        }

        if (cliente && dolar) {
            const saldo = await CtaCteRepository.getSaldo(cliente.id, dolar.id);
            if (saldo === 0) {
                // Initial Debt (DEBITO)
                await CtaCteRepository.registrarMovimiento({
                    fecha_operacion: new Date(),
                    tipo: TipoMovimientoCtaCte.DEBITO,
                    cliente: cliente,
                    moneda: dolar,
                    monto: 1000,
                    observaciones: "Deuda Inicial Seed",
                });
                console.log("Created CtaCte Movimiento: DEBITO 1000 USD");

                // Partial Payment (CREDITO)
                await CtaCteRepository.registrarMovimiento({
                    fecha_operacion: new Date(),
                    tipo: TipoMovimientoCtaCte.CREDITO,
                    cliente: cliente,
                    moneda: dolar,
                    monto: 500,
                    observaciones: "Pago Parcial Seed",
                });
                console.log("Created CtaCte Movimiento: CREDITO 500 USD");
            }
        }

        console.log("Seeding completed.");
        process.exit(0);
    } catch (error) {
        console.error("Error during seeding:", error);
        process.exit(1);
    }
}

seed();
