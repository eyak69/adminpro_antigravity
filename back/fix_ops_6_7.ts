
import { AppDataSource } from "./src/infrastructure/database/data-source";
import { TipoMovimiento, Contabilizacion } from "./src/domain/entities/TipoMovimiento";

async function main() {
    try {
        await AppDataSource.initialize();
        const tipoMovRepo = AppDataSource.getRepository(TipoMovimiento);

        console.log("--- Corrigiendo Configuraciones Invertidas ---");

        // Corregir ID 6: ENTRADA VARIOS -> Debe ser DEBE
        await tipoMovRepo.update({ id: 6 }, { contabilizacion: Contabilizacion.DEBE });
        console.log("ID 6 (ENTRADA VARIOS) actualizado a DEBE.");

        // Corregir ID 7: SALIDA VARIOS -> Debe ser HABER
        await tipoMovRepo.update({ id: 7 }, { contabilizacion: Contabilizacion.HABER });
        console.log("ID 7 (SALIDA VARIOS) actualizado a HABER.");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await AppDataSource.destroy();
    }
}

main();
