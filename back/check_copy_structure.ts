
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

        console.log("--- Estructura de tipos_movimiento_copy ---");
        const columns = await queryRunner.query("DESCRIBE tipos_movimiento_copy");
        console.log(columns.map((c: any) => c.Field));

    } catch (e) {
        console.error(e);
    } finally {
        await RawDataSource.destroy();
    }
}

main();
