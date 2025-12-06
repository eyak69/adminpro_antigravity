
import * as dotenv from "dotenv";
import { DataSource } from "typeorm";

dotenv.config();

console.log("--- Diagnóstico de Conexión ---");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_USERNAME:", process.env.DB_USERNAME);
console.log("DB_DATABASE:", process.env.DB_DATABASE);

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

        console.log("Conectado exitosamente.");

        const tables = await queryRunner.query("SHOW TABLES");
        console.log("Tablas en la base de datos:");
        console.log(tables.map((t: any) => Object.values(t)[0]));

    } catch (e) {
        console.error("Error de conexión:", e);
    } finally {
        await RawDataSource.destroy();
    }
}

main();
