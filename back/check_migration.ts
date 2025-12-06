
import { AppDataSource } from "./src/infrastructure/database/data-source";
import { TipoMovimiento } from "./src/domain/entities/TipoMovimiento";

async function main() {
    try {
        await AppDataSource.initialize();
        const tipoMovRepo = AppDataSource.getRepository(TipoMovimiento);

        console.log("--- Verificando Migración ---");
        const ops = await tipoMovRepo.find();
        ops.forEach(op => {
            console.log(`ID: ${op.id}, Contabilizacion: ${op.contabilizacion}`);
        });

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await AppDataSource.destroy();
    }
}

main();
