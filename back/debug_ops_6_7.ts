
import { AppDataSource } from "./src/infrastructure/database/data-source";
import { TipoMovimiento } from "./src/domain/entities/TipoMovimiento";

async function main() {
    try {
        await AppDataSource.initialize();
        const tipoMovRepo = AppDataSource.getRepository(TipoMovimiento);

        console.log("--- Búsqueda de Configuraciones ---");

        const ops = await tipoMovRepo.findByIds([6, 7]);
        console.log(JSON.stringify(ops, null, 2));

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await AppDataSource.destroy();
    }
}

main();
