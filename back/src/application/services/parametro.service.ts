import { AppDataSource } from "../../infrastructure/database/data-source";
import { Parametro } from "../../domain/entities/Parametro";
import { Repository } from "typeorm";

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
        const param = new Parametro();
        param.clave = clave;
        // Ensure valor is stored as a string
        param.valor = typeof valor === 'string' ? valor : JSON.stringify(valor);
        if (descripcion) param.descripcion = descripcion;

        return await this.repository.save(param);
    }

    async getAll(): Promise<Parametro[]> {
        return await this.repository.find();
    }

    async delete(clave: string): Promise<void> {
        await this.repository.delete(clave);
    }

    async seedDefaults() {
        // Initial seed for COLORS
        const exists = await this.repository.findOne({ where: { clave: 'COLORESOPERACIONES' } });
        if (!exists) {
            const initialConfig = {
                "themeConfig": {
                    "DEBE": {
                        "textColor": "#c62828",
                        "rowColor": "#ffebee",
                        "descripcion": "Salidas o Deudas. Texto Rojo, Fila Rojo suave."
                    },
                    "HABER": {
                        "textColor": "#1565c0",
                        "rowColor": "#e3f2fd",
                        "descripcion": "Entradas o Créditos. Texto Azul, Fila Azul suave."
                    },
                    "COMPRA": {
                        "textColor": "#1565c0",
                        "rowColor": "#e3f2fd",
                        "descripcion": "Acción de Compra. Hereda colores de HABER."
                    },
                    "VENTA": {
                        "textColor": "#c62828",
                        "rowColor": "#ffebee",
                        "descripcion": "Acción de Venta. Hereda colores de DEBE."
                    },
                    "CRUZADO": {
                        "textColor": null,
                        "rowColor": "#e8f5e9",
                        "descripcion": "Intercambio de monedas. Fila Verde suave. El textColor SE MANTIENE según la acción original (Compra/Venta)."
                    }
                }
            };
            await this.set('COLORESOPERACIONES', initialConfig, 'Configuración de colores para la grilla de operaciones');
            console.log('Semillado COLORESOPERACIONES');
        }

        // Seed CONTROLSALDO
        const existsSaldo = await this.repository.findOne({ where: { clave: 'CONTROLSALDO' } });
        if (!existsSaldo) {
            await this.set('CONTROLSALDO', false, 'Habilita o deshabilita la validación estricta de saldo suficiente');
            console.log('Semillado CONTROLSALDO');
        }
    }
}

export default new ParametroService();
