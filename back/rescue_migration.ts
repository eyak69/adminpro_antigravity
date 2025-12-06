
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
    synchronize: false, // Critical: Do NOT sync automatically
    logging: true,
    entities: [], // Critical: No entities loaded to avoid validation errors
});

async function main() {
    try {
        await RawDataSource.initialize();
        const queryRunner = RawDataSource.createQueryRunner();
        console.log("--- Conexión 'Rescue' Establecida ---");

        // 1. Romper la restricción ENUM (pasar a VARCHAR)
        console.log("Paso 1: Convertir columa a VARCHAR...");
        await queryRunner.query("ALTER TABLE tipos_movimiento MODIFY COLUMN contabilizacion VARCHAR(50) NULL");

        // 2. Actualizar los datos
        console.log("Paso 2: Actualizando datos (DEBE->ENTRADA, HABER->SALIDA)...");
        await queryRunner.query("UPDATE tipos_movimiento SET contabilizacion = 'ENTRADA' WHERE contabilizacion = 'DEBE'");
        await queryRunner.query("UPDATE tipos_movimiento SET contabilizacion = 'SALIDA' WHERE contabilizacion = 'HABER'");

        // Limpieza de neutros o vacíos erróneos
        await queryRunner.query("UPDATE tipos_movimiento SET contabilizacion = NULL WHERE contabilizacion = 'NEUTRO' OR contabilizacion = ''");

        // Corrección asegurada para ID 6 y 7
        await queryRunner.query("UPDATE tipos_movimiento SET contabilizacion = 'ENTRADA' WHERE id = 6");
        await queryRunner.query("UPDATE tipos_movimiento SET contabilizacion = 'SALIDA' WHERE id = 7");

        // 3. Re-aplicar el nuevo ENUM
        console.log("Paso 3: Re-aplicar estructura ENUM('ENTRADA', 'SALIDA')...");
        // Nota: Si hay algún valor que no sea ENTRADA/SALIDA/NULL, esto fallará. 
        // Como limpiamos antes, debería funcionar.
        await queryRunner.query("ALTER TABLE tipos_movimiento MODIFY COLUMN contabilizacion ENUM('ENTRADA', 'SALIDA') NULL");

        console.log("--- ¡Rescate Exitoso! ---");

    } catch (e) {
        console.error("!!! Error en Rescue !!!", e);
    } finally {
        await RawDataSource.destroy();
    }
}

main();
