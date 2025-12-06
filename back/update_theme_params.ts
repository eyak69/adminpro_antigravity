
import { AppDataSource } from "./src/infrastructure/database/data-source";
import { Parametro } from "./src/domain/entities/Parametro";

async function main() {
    try {
        await AppDataSource.initialize();
        const paramRepo = AppDataSource.getRepository(Parametro);

        const params = await paramRepo.find();

        for (const p of params) {
            if (p.valor.includes("DEBE") || p.valor.includes("HABER")) {
                console.log(`Actualizando parámetro: ${p.clave}`);
                let newVal = p.valor.replace(/"DEBE"/g, '"ENTRADA"');
                newVal = newVal.replace(/"HABER"/g, '"SALIDA"');

                // También sin comillas por si acaso es texto plano (aunque el theme es JSON)
                // Pero cuidado con reemplazos parciales. Asumimos JSON Keys.
                // Si es THEME_CONFIG, es JSON.

                if (newVal !== p.valor) {
                    p.valor = newVal;
                    await paramRepo.save(p);
                    console.log(`-> Actualizado.`);
                }
            }
        }

        console.log("Revisión de Parámetros completada.");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await AppDataSource.destroy();
    }
}

main();
