
import { AppDataSource } from "./src/infrastructure/database/data-source";
import { Parametro } from "./src/domain/entities/Parametro";

async function main() {
    try {
        await AppDataSource.initialize();
        const paramRepo = AppDataSource.getRepository(Parametro);

        const param = await paramRepo.findOneBy({ clave: "COLORESOPERACIONES" });
        if (param) {
            console.log("--- CONTENIDO DE COLORESOPERACIONES ---");
            console.log(param.valor);
        } else {
            console.log("No encontrado.");
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await AppDataSource.destroy();
    }
}

main();
