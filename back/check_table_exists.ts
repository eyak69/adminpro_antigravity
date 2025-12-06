
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

const RawDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "3306"),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: false,
    logging: false,
    entities: [],
});

async function main() {
    try {
        await RawDataSource.initialize();
        const queryRunner = RawDataSource.createQueryRunner();

        console.log("--- Verificando Tablas ---");
        const tables = await queryRunner.query("SHOW TABLES LIKE 'tipos_movimiento'");
        console.log(tables);

    } catch (e) {
        console.error(e);
    } finally {
        await RawDataSource.destroy();
    }
}

main();
