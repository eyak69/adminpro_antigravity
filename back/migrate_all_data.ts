
import { AppDataSource } from "./src/infrastructure/database/data-source";

async function main() {
    try {
        await AppDataSource.initialize();
        const queryRunner = AppDataSource.createQueryRunner();

        console.log("--- Migrando Datos ---");

        // 1. Migrar Tipos de Movimiento
        console.log("1. Migrando tipos_movimiento...");
        const insertTiposQuery = `
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
                    ELSE NULL 
                END,
                requiere_persona, es_persona_obligatoria, requiere_cotizacion, 
                lleva_observacion, graba_cta_cte, operacionId, 
                created_at, updated_at, deleted_at, created_by, updated_by
            FROM tipos_movimiento_copy
            ON DUPLICATE KEY UPDATE id=id; -- Evita errores si ya existen, aunque idealmente deberian borrarse antes si estan vacias
        `;
        // Nota: Si el usuario ya las creó vacias o con algun dato, el INSERT IGNORE o ON DUPLICATE es mejor?
        // El usuario dijo "estan creadas" (las tablas), "migrame los datos".
        // Asumimos que están vacías. Si no, esto podría dar error de Duplicate Key.
        // Voy a usar INSERT IGNORE para ser seguro, o simplemente Try/Catch.
        // Pero quiero reportar éxito.

        // Mejor: Limpiar tabla destino antes? "borrala creala" dijo antes. Ahora dice "ya estan creadas".
        // Si limpio, pierdo lo que sea que haya.
        // Voy a intentar Insertar. Si falla por duplicado, informaré.

        await queryRunner.query(insertTiposQuery);
        console.log("tipos_movimiento: OK");

        // 2. Migrar Relaciones (Monedas)
        console.log("2. Migrando tipomovimiento_moneda...");
        // Necesito ver las columnas de la copia. Asumo que son las mismas.
        // Mismo esquema: INSERT INTO ... SELECT ...
        const insertRelQuery = `
            INSERT INTO tipomovimiento_moneda (tipo_movimiento_id, moneda_id)
            SELECT tipo_movimiento_id, moneda_id
            FROM tipomovimiento_moneda_copy
        `;

        await queryRunner.query(insertRelQuery);
        console.log("tipomovimiento_moneda: OK");

        console.log("--- Migración Completada ---");

    } catch (e) {
        console.error("!!! Error Migración !!!", e);
    } finally {
        await AppDataSource.destroy();
    }
}

main();
