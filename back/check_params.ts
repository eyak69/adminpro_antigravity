
import { AppDataSource } from "./src/infrastructure/database/data-source";
import { Parametro } from "./src/domain/entities/Parametro";

async function main() {
    try {
        await AppDataSource.initialize();
        const paramRepo = AppDataSource.getRepository(Parametro);

        const themeParam = await paramRepo.findOneBy({ key: "THEME_CONFIG" }); // Guessing key name based on context
        // If not found, list all to find it.
        const allParams = await paramRepo.find();
        console.log("--- Parámetros ---");
        allParams.forEach(p => {
            console.log(`Key: ${p.key}`);
            console.log(`Value: ${p.value}`);
        });

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await AppDataSource.destroy();
    }
}

main();
