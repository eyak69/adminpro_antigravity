
import { AppDataSource } from "./src/infrastructure/database/data-source";

async function main() {
    try {
        await AppDataSource.initialize();
        const queryRunner = AppDataSource.createQueryRunner();

        console.log("--- Iniciando Restauración y Migración ---");

        // 1. Deshabilitar FKs para poder borrar la tabla
        await queryRunner.query("SET FOREIGN_KEY_CHECKS = 0");

        // 2. Borrar la tabla original (que tiene el ENUM bloqueado)
        console.log("Borrando tabla tipos_movimiento...");
        await queryRunner.query("DROP TABLE IF EXISTS tipos_movimiento");

        // 3. Recrear la tabla usando TypeORM (tomará la definición actualizada de la Entidad)
        console.log("Recreando tabla con esquema nuevo (ENTRADA/SALIDA)...");
        await AppDataSource.synchronize(false); // false = no borra otras tablas, solo ajusta (crea la faltante)

        // 4. Migrar datos desde la copia
        console.log("Migrando datos desde tipos_movimiento_copy...");

        // columnas detectadas: id, nombre, tipo_accion, contabilizacion, requiere_persona, es_persona_obligatoria, requiere_cotizacion, lleva_observacion, graba_cta_cte, operacionId, created_at, updated_at, deleted_at, created_by, updated_by

        const insertQuery = `
            INSERT INTO tipos_movimiento (
                id, nombre, tipo_accion, contabilizacion, 
                requiere_persona, es_persona_obligatoria, requiere_cotizacion, 
                lleva_observacion, graba_cta_cte, operacionId, 
                created_at, updated_at, deleted_at, created_by, updated_by
            )
            SELECT 
                id, nombre, tipo_accion, 
                CASE 
                    WHEN contabilizacion = 'DEBE' THEN 'ENTRADA'
                    WHEN contabilizacion = 'HABER' THEN 'SALIDA'
                    WHEN contabilizacion = 'NEUTRO' THEN NULL
                    WHEN contabilizacion = '' THEN NULL
                    ELSE NULL -- O dejar el valor si ya fuera compatible
                END,
                requiere_persona, es_persona_obligatoria, requiere_cotizacion, 
                lleva_observacion, graba_cta_cte, operacionId, 
                created_at, updated_at, deleted_at, created_by, updated_by
            FROM tipos_movimiento_copy
        `;

        await queryRunner.query(insertQuery);
        console.log("Datos migrados exitosamente.");

        // 5. Rehabilitar FKs
        await queryRunner.query("SET FOREIGN_KEY_CHECKS = 1");

        console.log("--- Proceso Terminado Correctamente ---");

    } catch (e) {
        console.error("!!! Error en Restauración !!!", e);
    } finally {
        await AppDataSource.destroy();
    }
}

main();
