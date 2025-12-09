import OpenAI from "openai";
import { AppDataSource } from "../../infrastructure/database/data-source";
import { Moneda } from "../../domain/entities/Moneda";
import { Cliente } from "../../domain/entities/Cliente";
import { TipoMovimiento } from "../../domain/entities/TipoMovimiento";
import { Operacion } from "../../domain/entities/Operacion";

export class AiService {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async parseTransaction(text: string) {
        // 1. Fetch Context
        const monedas = await AppDataSource.getRepository(Moneda).find({ select: ["id", "codigo", "nombre"] });
        const clientes = await AppDataSource.getRepository(Cliente).find({ select: ["id", "alias", "nombre_real"] });
        // Fetch operations to give more context about the hierarchy
        const operaciones = await AppDataSource.getRepository(Operacion).find({ select: ["id", "nombre"] });
        const tipos = await AppDataSource.getRepository(TipoMovimiento).find({
            select: ["id", "nombre", "tipo_accion"],
            relations: ["operacion"]
        });

        // 2. Construct Prompt
        const prompt = `
        You are an **EXPERT AI assistant in Currency Exchange and Financial Operations**.
        Your goal is to accurately parse natural language commands into structured transaction data.

        User Input: "${text}"

        *** CONTEXT DATA ***
        - **Operations** (High Level Categories): ${JSON.stringify(operaciones.map((o: any) => ({ id: o.id, name: o.nombre })))}
        - **Transaction Types** (Specific Actions): ${JSON.stringify(tipos.map((t: any) => ({
            id: t.id,
            name: t.nombre,
            action: t.tipo_accion,
            belongs_to_operation: t.operacion?.nombre
        })))}
        - **Currencies**: ${JSON.stringify(monedas.map((m: any) => ({ id: m.id, code: m.codigo, name: m.nombre })))}
        - **Clients**: ${JSON.stringify(clientes.map((c: any) => ({ id: c.id, alias: c.alias, name: c.nombre_real })))}

        *** PARSING RULES ***
        1. **MATCH ACTION**: Look for keywords like "Compra", "Venta", "Gasto", "Ingreso", "Egreso", "Retiro".
           - Map these to the most appropriate 'tipoMovimientoId'.
           - *Example*: "Compra" -> usually matches type "Compra de Divisa" (Entry/Ingreso of stock).
           - *Example*: "Venta" -> usually matches type "Venta de Divisa" (Exit/Egreso of stock).
        2. **MATCH CURRENCY**: Identify standard codes (USD, EUR, BRL) or common names (Dolar, Euro, Real).
           - If "peso" or "pesos" is mentioned, it might be the base currency (ARS) or implicitly the counter-currency.
           - Default to most likely foreign currency if context implies exchange (e.g. buying 100 usually means 100 USD/EUR, not 100 Pesos).
        3. **EXTRACT AMOUNTS**:
           - **'monto'**: The main volume of currency being bought/sold/moved.
           - **'cotizacion'**: The exchange rate (e.g. "a 1200", "cotiz 1220", "x 1200").
        4. **IDENTIFY CLIENT**: Fuzzy match the person/entity name.
        5. **OBSERVATIONS**: Any extra details not captured above.

        *** OUTPUT FORMAT ***
        Return ONLY valid JSON (no markdown):
        {
            "tipoMovimientoId": number | null,
            "monedaId": number | null,
            "clienteId": number | null,
            "monto": number | null,
            "cotizacion": number | null,
            "observaciones": string
        }
        `;

        // 3. Call OpenAI
        try {
            console.log("--- AI PROMPT DEBUG ---");
            console.log(prompt);
            console.log("-----------------------");

            const completion = await this.openai.chat.completions.create({
                messages: [{ role: "system", content: "You are a helpful JSON parser." }, { role: "user", content: prompt }],
                model: "gpt-3.5-turbo",
                temperature: 0.1,
            });

            const content = completion.choices[0].message.content;
            console.log("--- AI RESPONSE DEBUG ---");
            console.log(content);
            console.log("-------------------------");

            if (!content) throw new Error("No response from AI");

            // Clean markdown if present
            const jsonString = content.replace(/```json/g, "").replace(/```/g, "").trim();
            return JSON.parse(jsonString);

        } catch (error) {
            console.error("OpenAI Error:", error);
            throw new Error("Failed to parse transaction with AI");
        }
    }
}
