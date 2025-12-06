
import { AppDataSource } from "./src/infrastructure/database/data-source";

async function main() {
    try {
        await AppDataSource.initialize();
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();

        console.log("--- Iniciando Migración de Contabilización ---");

        // 1. Convertir DEBE -> ENTRADA
        await queryRunner.query(`UPDATE tipos_movimiento SET contabilizacion = 'ENTRADA' WHERE contabilizacion = 'DEBE'`);
        console.log("DEBE -> ENTRADA: Actualizado.");

        // 2. Convertir HABER -> SALIDA
        await queryRunner.query(`UPDATE tipos_movimiento SET contabilizacion = 'SALIDA' WHERE contabilizacion = 'HABER'`);
        console.log("HABER -> SALIDA: Actualizado.");

        // 3. Limpiar NEUTRO -> NULL (u otra lógica si se prefiere)
        await queryRunner.query(`UPDATE tipos_movimiento SET contabilizacion = NULL WHERE contabilizacion = 'NEUTRO'`);
        console.log("NEUTRO -> NULL: Actualizado.");

        console.log("--- Migración Completada ---");

    } catch (error) {
        console.error("Error durante la migración:", error);
    } finally {
        await AppDataSource.destroy();
    }
}

main();
