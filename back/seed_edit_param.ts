import ParametroService from "./src/application/services/parametro.service";
import { AppDataSource } from "./src/infrastructure/database/data-source";

async function main() {
    try {
        await AppDataSource.initialize();
        console.log("DB Connected");

        const KEY = 'EDITARPLANILLAFECHAANTERIOR';
        const exists = await ParametroService.get(KEY);

        if (!exists) {
            console.log(`Creating param ${KEY}...`);
            await ParametroService.set(
                KEY,
                { habilitado: true, dias: 0 },
                "Configura si se pueden editar/anular planillas de fechas anteriores. dias: 0 es infinito."
            );
            console.log("Parameter created.");
        } else {
            console.log(`Parameter ${KEY} already exists:`, exists);
        }

        process.exit(0);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

main();
