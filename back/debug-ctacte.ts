
import { AppDataSource } from "./src/infrastructure/database/data-source";
import { CtaCteMovimiento } from "./src/domain/entities/CtaCteMovimiento";

async function main() {
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(CtaCteMovimiento);
    const movs = await repo.find({
        relations: ["cliente", "moneda"]
    });

    console.log("--- CtaCte Movimientos ---");
    movs.forEach(m => {
        console.log(`ID: ${m.id} | Cliente: ${m.cliente?.alias} (${m.cliente?.nombre_real}) | Moneda: ${m.moneda?.nombre} (${m.moneda?.id}) | Ingreso: ${m.monto_ingreso} | Egreso: ${m.monto_egreso}`);
    });
    console.log("--------------------------");
    process.exit();
}

main().catch(console.error);
