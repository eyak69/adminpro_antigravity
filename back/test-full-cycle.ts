import { AppDataSource } from "./src/infrastructure/database/data-source";
import { StockCaja } from "./src/domain/entities/StockCaja";
import { PlanillaDiaria } from "./src/domain/entities/PlanillaDiaria";
import { CtaCteSaldo } from "./src/domain/entities/CtaCteSaldo";
import { CtaCteMovimiento } from "./src/domain/entities/CtaCteMovimiento";
import { Moneda } from "./src/domain/entities/Moneda";
import { TipoMovimiento } from "./src/domain/entities/TipoMovimiento";

async function testFullCycle() {
    console.log("=== INICIANDO TEST DE CICLO COMPLETO (DESDE CERO) ===");

    // 1. Inicializar Conexión DB para Limpieza
    try {
        await AppDataSource.initialize();
        console.log("DB Conectada para limpieza.");
    } catch (e) {
        console.error("Error conectando DB:", e);
        return;
    }

    const stockRepo = AppDataSource.getRepository(StockCaja);
    const planillaRepo = AppDataSource.getRepository(PlanillaDiaria);
    const ctaCteSaldoRepo = AppDataSource.getRepository(CtaCteSaldo);
    const ctaCteMovRepo = AppDataSource.getRepository(CtaCteMovimiento);
    const monedaRepo = AppDataSource.getRepository(Moneda);
    const tipoMovRepo = AppDataSource.getRepository(TipoMovimiento);

    // 2. Limpiar Tablas (Orden inverso a dependencias)
    console.log("Limpiando tablas...");
    // Use query builder delete without where clause to delete all
    await ctaCteMovRepo.createQueryBuilder().delete().execute();
    await ctaCteSaldoRepo.createQueryBuilder().delete().execute();
    await planillaRepo.createQueryBuilder().delete().execute();
    await stockRepo.createQueryBuilder().delete().execute();
    console.log("Tablas limpiadas: Planilla, Stock, CtaCte.");

    // 3. Preparar Datos Iniciales (Stock)
    // Necesitamos Monedas
    const usd = await monedaRepo.findOneBy({ codigo: "USD" });
    const ars = await monedaRepo.findOneBy({ codigo: "ARS" });

    if (!usd || !ars) {
        console.error("Error: Monedas no encontradas en DB (Seed necesario).");
        return;
    }

    // Crear Stock Inicial: 1000 USD, 0 ARS
    console.log("Creando Stock Inicial: 1000 USD, 0 ARS");
    await stockRepo.save(stockRepo.create({ moneda: usd, saldo_actual: 1000 }));
    await stockRepo.save(stockRepo.create({ moneda: ars, saldo_actual: 0 }));

    // Obtener Tipo Movimiento VENTA
    const tipoVenta = await tipoMovRepo.findOneBy({ nombre: "VENTA DE BILLETE" });
    if (!tipoVenta) {
        console.error("Error: Tipo Movimiento VENTA DE BILLETE no encontrado.");
        return;
    }

    // 4. Ejecutar Transacción vía API
    console.log("\n--- EJECUTANDO TRANSACCIÓN VÍA API ---");
    const baseUrl = "http://localhost:3000/api/v1/transacciones";

    const payload = {
        tipoMovimientoId: tipoVenta.id,
        monto: 100, // Venta de 100 USD
        monedaId: usd.id,
        cotizacion: 1000, // a 1000 ARS
        observaciones: "Test Full Cycle Clean"
    };

    try {
        const res = await fetch(baseUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.status === 200) {
            console.log("✅ Transacción API Exitosa:", data);
        } else {
            console.error("❌ Transacción API Fallida:", data);
        }

    } catch (error) {
        console.error("Error llamando API:", error);
    }

    // 5. Verificar Impacto en DB
    console.log("\n--- VERIFICACIÓN DE IMPACTO ---");

    // Planilla
    const planillas = await planillaRepo.find();
    console.log(`Planilla Diaria (${planillas.length} registros):`);
    planillas.forEach(p => console.log(` - ID: ${p.id}, Ingreso: ${p.monto_ingreso}, Egreso: ${p.monto_egreso}`));

    // Stock
    const stocks = await stockRepo.find({ relations: ["moneda"] });
    console.log("Stock Caja:");
    stocks.forEach(s => console.log(` - ${s.moneda.codigo}: ${s.saldo_actual}`));

    // Cta Cte (Debería estar vacía para VENTA, pero verifiquemos)
    const ctaCteMovs = await ctaCteMovRepo.find();
    console.log(`Movimientos Cta Cte: ${ctaCteMovs.length}`);

    console.log("=== TEST FINALIZADO ===");
    process.exit(0);
}

testFullCycle().catch(console.error);
