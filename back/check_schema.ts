
import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(__dirname, ".env") });
import { AppDataSource } from "./src/infrastructure/database/data-source";

async function checkSchema() {
    try {
        await AppDataSource.initialize();
        const queryRunner = AppDataSource.createQueryRunner();
        const result = await queryRunner.query("DESCRIBE planilla_diaria");
        console.log("Schema Definition:", JSON.stringify(result, null, 2));
        await AppDataSource.destroy();
    } catch (error) {
        console.error("Error checking schema:", error);
    }
}

checkSchema();
