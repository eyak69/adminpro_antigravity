
import { AppDataSource } from "./src/infrastructure/database/data-source";

async function main() {
    try {
        await AppDataSource.initialize();
        const queryRunner = AppDataSource.createQueryRunner();

        console.log("--- Restauración Manual (Bypass Sync) ---");

        // 1. Deshabilitar FKs
        await queryRunner.query("SET FOREIGN_KEY_CHECKS = 0");

        // 2. Borrar tabla
        await queryRunner.query("DROP TABLE IF EXISTS tipos_movimiento");

        // 3. Crear Tabla Manualmente (Esquema Exacto)
        // Nota: Asegurando que las columnas coincidad con la entidad
        const createTableQuery = `
            CREATE TABLE tipos_movimiento (
                id int NOT NULL AUTO_INCREMENT,
                nombre varchar(100) NOT NULL,
                tipo_accion enum('COMPRA','VENTA','ENTRADA','SALIDA','NEUTRO') DEFAULT NULL,
                contabilizacion enum('ENTRADA','SALIDA') DEFAULT NULL,
                requiere_persona tinyint NOT NULL DEFAULT '0',
                es_persona_obligatoria tinyint NOT NULL DEFAULT '0',
                requiere_cotizacion tinyint NOT NULL DEFAULT '0',
                lleva_observacion tinyint NOT NULL DEFAULT '0',
                graba_cta_cte tinyint NOT NULL DEFAULT '0',
                created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                deleted_at datetime(6) DEFAULT NULL,
                created_by varchar(255) DEFAULT NULL,
                updated_by varchar(255) DEFAULT NULL,
                operacionId int DEFAULT NULL,
                PRIMARY KEY (id),
                KEY FK_operacion (operacionId),
                CONSTRAINT FK_operacion FOREIGN KEY (operacionId) REFERENCES operacion (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
        `;

        await queryRunner.query(createTableQuery);
        console.log("Tabla creada manualmente.");

        // 4. Migrar Datos
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
                    ELSE NULL 
                END,
                requiere_persona, es_persona_obligatoria, requiere_cotizacion, 
                lleva_observacion, graba_cta_cte, operacionId, 
                created_at, updated_at, deleted_at, created_by, updated_by
            FROM tipos_movimiento_copy
        `;

        await queryRunner.query(insertQuery);
        console.log("Datos insertados.");

        // 5. Rehabilitar FK
        await queryRunner.query("SET FOREIGN_KEY_CHECKS = 1");

        console.log("--- Restauración Completa ---");

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await AppDataSource.destroy();
    }
}

main();
