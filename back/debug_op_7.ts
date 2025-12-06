
import { AppDataSource } from "./src/infrastructure/database/data-source";
import { PlanillaDiaria } from "./src/domain/entities/PlanillaDiaria";
import { TipoMovimiento } from "./src/domain/entities/TipoMovimiento";

async function main() {
    try {
        await AppDataSource.initialize();
        const planillaRepo = AppDataSource.getRepository(PlanillaDiaria);
        const tipoMovRepo = AppDataSource.getRepository(TipoMovimiento);

        console.log("--- Búsqueda de 'Operación 7' ---");

        // 1. Buscar Planilla ID 7
        const planilla = await planillaRepo.findOne({
            where: { id: 7 },
            relations: ["tipo_movimiento", "moneda_ingreso", "moneda_egreso"]
        });

        if (planilla) {
            console.log("PLANILLA ID 7 Encontrada:");
            console.log(JSON.stringify(planilla, null, 2));
        } else {
            console.log("PLANILLA ID 7: No existe.");
        }

        // 2. Buscar TipoMovimiento ID 7
        const tipoMov = await tipoMovRepo.findOneBy({ id: 7 });
        if (tipoMov) {
            console.log("TIPO MOVIMIENTO ID 7 Encontrada:");
            console.log(JSON.stringify(tipoMov, null, 2));
        } else {
            console.log("TIPO MOVIMIENTO ID 7: No existe.");
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await AppDataSource.destroy();
    }
}

main();
