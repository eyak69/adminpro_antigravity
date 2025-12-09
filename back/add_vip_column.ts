
import { AppDataSource } from "./src/infrastructure/database/data-source";

async function addEsVipColumn() {
    try {
        await AppDataSource.initialize();
        console.log("Data Source has been initialized!");

        const queryRunner = AppDataSource.createQueryRunner();

        // check if column exists
        const table = await queryRunner.getTable("clientes");
        const column = table?.findColumnByName("es_vip");

        if (!column) {
            console.log("Adding 'es_vip' column to 'clientes' table...");
            await queryRunner.query("ALTER TABLE `clientes` ADD `es_vip` tinyint NOT NULL DEFAULT 0");
            console.log("'es_vip' column added.");
        } else {
            console.log("'es_vip' column already exists.");
        }

        await AppDataSource.destroy();
    } catch (err) {
        console.error("Error during migration:", err);
        process.exit(1);
    }
}

addEsVipColumn();
