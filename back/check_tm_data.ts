
import { AppDataSource } from "./src/infrastructure/database/data-source";
import { TipoMovimiento } from "./src/domain/entities/TipoMovimiento";

async function main() {
    try {
        await AppDataSource.initialize();
        const repo = AppDataSource.getRepository(TipoMovimiento);

        const ops = await repo.find();
        console.log("--- DATOS DE TIPOS MOVIMIENTO ---");
        ops.forEach(op => {
            console.log(`ID: ${op.id}, Nom: ${op.nombre}, Accion: ${op.tipo_accion}, Contab: ${op.contabilizacion}`);
        });

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await AppDataSource.destroy();
    }
}

main();
