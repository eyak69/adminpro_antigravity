import { AppDataSource } from "../../infrastructure/database/data-source";
import { Parametro } from "../../domain/entities/Parametro";
import { Repository } from "typeorm";
import { DEFAULT_PARAMS } from "../../config/default-params";
import * as fs from 'fs';
import * as path from 'path';

class ParametroService {
    private get repository(): Repository<Parametro> {
        return AppDataSource.getRepository(Parametro);
    }

    async get(clave: string): Promise<any> {
        const param = await this.repository.findOne({ where: { clave } });
        if (!param) return null;
        try {
            return JSON.parse(param.valor);
        } catch (e) {
            return param.valor;
        }
    }

    async set(clave: string, valor: any, descripcion?: string): Promise<Parametro> {
        // Check if exists for file update logic
        const exists = await this.repository.findOne({ where: { clave } });

        const param = new Parametro();
        param.clave = clave;
        // Ensure valor is stored as a string
        param.valor = typeof valor === 'string' ? valor : JSON.stringify(valor);
        if (descripcion) param.descripcion = descripcion;

        const saved = await this.repository.save(param);

        // If it's a new parameter, add it to default-params.ts
        if (!exists) {
            this.updateDefaultFile(clave, valor);
        }

        return saved;
    }

    private updateDefaultFile(key: string, value: any) {
        try {
            // Locate the file relative to this service file
            // src/application/services/parametro.service.ts -> ../../config/default-params.ts
            // But we are running potentially in dist, so we should be careful.
            // However, the USER request is for development "cada vez que cree" implies updating SOURCE.
            // We need to find the SOURCE file, not the dist file.
            // Assuming standard structure: standard process.cwd() is usually project root.
            const configPath = path.join(process.cwd(), 'src', 'config', 'default-params.ts');

            if (fs.existsSync(configPath)) {
                let content = fs.readFileSync(configPath, 'utf8');

                // Simple check if key already exists in text to avoid duplicates
                if (!content.includes(`"${key}"`) && !content.includes(`'${key}'`)) {
                    // Find the last closing brace of the export object.
                    // We assume the file ends with "};" or similar.
                    const lastBraceIndex = content.lastIndexOf('}');

                    if (lastBraceIndex !== -1) {
                        const newEntry = `,\n    "${key}": ${JSON.stringify(value, null, 4)}`;
                        const newContent = content.slice(0, lastBraceIndex) + newEntry + content.slice(lastBraceIndex);
                        fs.writeFileSync(configPath, newContent);
                        console.log(`Updated default-params.ts with new key: ${key}`);
                    }
                }
            } else {
                console.warn("Could not find default-params.ts at expected path:", configPath);
            }
        } catch (error) {
            console.error("Error updating default-params.ts:", error);
        }
    }

    async getAll(): Promise<Parametro[]> {
        return await this.repository.find();
    }

    async delete(clave: string): Promise<void> {
        await this.repository.delete(clave);
    }

    async seedDefaults() {
        for (const key of Object.keys(DEFAULT_PARAMS)) {
            const exists = await this.repository.findOne({ where: { clave: key } });
            if (!exists) {
                console.log(`Seeding parameter: ${key}`);
                // Use a generic description or specific one if we want to map it, 
                // but usually the value is self-descriptive or implemented in UI logic.
                let desc = "Configuración por defecto";
                if (key === 'COLORESOPERACIONES') desc = 'Configuración de colores para la grilla de operaciones';
                if (key === 'CONTROLSALDO') desc = 'Habilita o deshabilita la validación estricta de saldo suficiente';
                if (key === 'EDITARPLANILLAFECHAANTERIOR') desc = "Configura si se pueden editar/anular planillas de fechas anteriores. dias: 0 es infinito.";
                if (key === 'SEGURIDADGOOGLE') desc = "Activa o desactiva la autenticación obligatoria con Google. (true/false)";

                await this.set(key, DEFAULT_PARAMS[key], desc);
            }
        }
    }
}

export default new ParametroService();
