
import { AppDataSource } from "./src/infrastructure/database/data-source";

async function addImpactaStockColumn() {
    try {
        await AppDataSource.initialize();
        console.log("Data Source has been initialized!");

        const queryRunner = AppDataSource.createQueryRunner();

        const table = await queryRunner.getTable("planilla_diaria");
        const column = table?.findColumnByName("impacta_stock");

        if (!column) {
            console.log("Adding 'impacta_stock' column to 'planilla_diaria' table...");
            // Default 1 (true) for existing records to maintain consistency with past behavior (everything impacted stock)
            await queryRunner.query("ALTER TABLE `planilla_diaria` ADD `impacta_stock` tinyint NOT NULL DEFAULT 1");
            console.log("'impacta_stock' column added.");
        } else {
            console.log("'impacta_stock' column already exists.");
        }

        await AppDataSource.destroy();
    } catch (err) {
        console.error("Error during migration:", err);
        process.exit(1);
    }
}

addImpactaStockColumn();
