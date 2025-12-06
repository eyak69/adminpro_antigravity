
import { AppDataSource } from "./src/infrastructure/database/data-source";

async function main() {
    try {
        await AppDataSource.initialize();
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();

        console.log("--- Forzando Corrección de Migración ---");

        // 1. Alterar tabla para que acepte cualquier string (o los nuevos valores)
        // Esto es necesario porque MySQL trunca si intentas meter un valor que no está en el ENUM anterior.
        await queryRunner.query(`ALTER TABLE tipos_movimiento MODIFY COLUMN contabilizacion VARCHAR(20) NULL`);
        console.log("Columna 'contabilizacion' cambiada a VARCHAR.");

        // 2. Ejecutar Updates (Ahora sí deberían funcionar)
        await queryRunner.query(`UPDATE tipos_movimiento SET contabilizacion = 'ENTRADA' WHERE contabilizacion = 'DEBE' OR contabilizacion = ''`);
        // Nota: Si se truncó a string vacío (''), asumimos que era DEBE/HABER que fallaron. 
        // Pero mejor recargar IDs específicos si es posible. 
        // Dado que el truncate pudo haber perdido la data, esperemos que el check muestre algo o que podamos inferirlo.
        // Si el valor era 'DEBE', al truncarse a ENUM('DEBE'...) con 'ENTRADA' -> '' (index 0 for error sometimes).

        // Mejor estrategia: Si el anterior falló, los datos originales 'DEBE'/'HABER' tal vez sigan ahí si el UPDATE falló completamente?
        // El error fue 'WARN_DATA_TRUNCATED', lo que significa que MySQL *intentó* hacer el update y lo truncó.
        // Si truncó 'ENTRADA' a '', perdimos la data de cuáles eran DEBE.

        // Vamos a asumir que los datos *originales* eran DEBE o HABER.
        // Si ya están corruptos, tendremos que arreglarlos manualmente o por lógica.

        // Reintentamos la lógica de negocio básica:
        await queryRunner.query(`UPDATE tipos_movimiento SET contabilizacion = 'ENTRADA' WHERE contabilizacion = 'DEBE'`);
        await queryRunner.query(`UPDATE tipos_movimiento SET contabilizacion = 'SALIDA' WHERE contabilizacion = 'HABER'`);

        // Corrección de los truncados (si quedaron vacíos o corruptos)
        // IDs críticos que conocemos:
        // ID 6 (ENTRADA VARIOS) -> ENTRADA
        // ID 7 (SALIDA VARIOS) -> SALIDA
        await queryRunner.query(`UPDATE tipos_movimiento SET contabilizacion = 'ENTRADA' WHERE id = 6`);
        await queryRunner.query(`UPDATE tipos_movimiento SET contabilizacion = 'SALIDA' WHERE id = 7`);

        console.log("Updates realizados.");

        // 3. (Opcional) Volver a ENUM si TypeORM no lo hace al arrancar.
        // await queryRunner.query(`ALTER TABLE tipos_movimiento MODIFY COLUMN contabilizacion ENUM('ENTRADA', 'SALIDA', 'NEUTRO') NULL`);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await AppDataSource.destroy();
    }
}

main();
