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
        // 1. Fetch Context (Optimized: No Clients)
        const monedas = await AppDataSource.getRepository(Moneda).find({ select: ["id", "codigo", "nombre"] });
        // Removed Clients list to save tokens. We will resolve client locally.

        // Fetch operations to give more context about the hierarchy
        const operaciones = await AppDataSource.getRepository(Operacion).find({ select: ["id", "nombre"] });
        const tipos = await AppDataSource.getRepository(TipoMovimiento).find({
            select: ["id", "nombre", "tipo_accion"],
            relations: ["operacion"]
        });

        // Fetch recent history for "Learning" capabilities
        const history = await AppDataSource.getRepository("PlanillaDiaria").find({
            where: { observaciones: { $not: null } },
            order: { id: "DESC" },
            take: 10, // Reduced from 20 to 10 for token optimization
            relations: ["tipo_movimiento"]
        });

        const historyExamples = history.map((h: any) => ({
            desc: h.observaciones,
            type: h.tipo_movimiento?.nombre
        })).filter(h => h.desc && h.type);

        // 2. Construct Prompt (Optimized)
        const prompt = `
        You are an **EXPERT AI assistant in Currency Exchange**.
        Parse natural language commands into structured data.

        User Input: "${text}"

        *** CONTEXT ***
        - Ops: ${JSON.stringify(operaciones.map((o: any) => ({ id: o.id, n: o.nombre })))}
        - Types: ${JSON.stringify(tipos.map((t: any) => ({
            id: t.id,
            n: t.nombre,
            act: t.tipo_accion,
        })))}
        - Currencies: ${JSON.stringify(monedas.map((m: any) => ({ id: m.id, c: m.codigo, n: m.nombre })))}
        
        *** HABITS ***
        ${JSON.stringify(historyExamples)}

        *** RULES ***
        1. **MATCH ACTION/TYPE**: Return 'tipoMovimientoId'.
        2. **MATCH CURRENCY**: Return 'monedaId'.
        3. **EXTRACT VALUES**: 'monto' and 'cotizacion'.
        4. **IDENTIFY CLIENT**: Extract the client name mentioned as text string into 'client_guess'. Do not try to find ID.
        5. **OBSERVATIONS**: Extra details.

        *** OUTPUT JSON ***
        {
            "tipoMovimientoId": number | null,
            "monedaId": number | null,
            "client_guess": string | null,
            "monto": number | null,
            "cotizacion": number | null,
            "observaciones": string
        }
        `;

        // 3. Call OpenAI
        try {
            // DEBUG: LOG PROMPT
            console.log("--- AI PARSE PROMPT ---");
            console.log(prompt);
            console.log("-----------------------");

            const completion = await this.openai.chat.completions.create({
                messages: [{ role: "system", content: "Returns JSON only." }, { role: "user", content: prompt }],
                model: "gpt-4o-mini",
                temperature: 0.1,
            });

            const content = completion.choices[0].message.content;

            // DEBUG: LOG RESPONSE
            console.log("--- AI PARSE RESPONSE ---");
            console.log(content);
            console.log("-------------------------");

            const jsonString = content?.replace(/```json/g, "").replace(/```/g, "").trim();
            const result = JSON.parse(jsonString || "{}");

            // 4. Resolve Client Locally (Token Saver)
            if (result.client_guess) {
                const cleanName = result.client_guess.replace(/['"]/g, "");
                // Try fuzzy-ish search
                const client = await AppDataSource.getRepository(Cliente).createQueryBuilder("c")
                    .where("c.alias LIKE :name OR c.nombre_real LIKE :name", { name: `%${cleanName}%` })
                    .getOne();

                if (client) {
                    result.clienteId = client.id;
                }
            }

            return result;

        } catch (error) {
            console.error("OpenAI Error:", error);
            throw new Error("Failed to parse transaction with AI");
        }
    }
    async analyzeAnomaly(data: { monedaId?: number, cotizacion?: number, tipoMovimientoId?: number, monto?: number }) {
        if (!data.cotizacion || !data.monedaId) return { isAnomalous: false, reason: "Datos insuficientes para análisis" };

        // 1. Fetch History (Context)
        // Check both ingress and egress used this currency to get a better rate history
        // 1. Fetch History (Context) - Using QueryBuilder for robust OR clause
        const history = await AppDataSource.getRepository("PlanillaDiaria")
            .createQueryBuilder("p")
            .leftJoinAndSelect("p.moneda_ingreso", "mi")
            .leftJoinAndSelect("p.moneda_egreso", "me")
            .where("mi.id = :monedaId OR me.id = :monedaId", { monedaId: data.monedaId })
            .orderBy("p.id", "DESC")
            .limit(10) // Use limit instead of take to avoid distinctAlias error with custom selects
            .select(["p.cotizacion_aplicada", "p.fecha_operacion", "p.monto_ingreso", "p.monto_egreso"])
            .getMany();

        const recentRates = history
            .map((h: any) => h.cotizacion_aplicada)
            .filter(r => r > 0);

        console.log(`[AI ANALYZE] Found ${recentRates.length} historical rates for currency ${data.monedaId}:`, recentRates);

        if (recentRates.length < 1) return { isAnomalous: false, reason: "Sin historial suficiente" };

        // 2. Prompt
        const prompt = `
        You are a Financial Risk Auditor.
        Analyze if this transaction is anomalous/suspicious based on recent history.

        **New Transaction**:
        - Rate (Cotización): ${data.cotizacion}
        - Amount: ${data.monto}

        **Recent Rate History** (Last ${recentRates.length} entries):
        ${JSON.stringify(recentRates)}

        **Rules**:
        - Flag if the Rate is deviating significantly (>10% variance usually, but use judgement) from the recent average.
        - Flag if it's an outlier.
        - Ignore small fluctuations.
        - **IMPORTANT**: The 'reason' field MUST be in **SPANISH**.

        **Output JSON**:
        {
            "isAnomalous": boolean,
            "severity": "LOW" | "MEDIUM" | "HIGH",
            "reason": "Short explanation in SPANISH",
            "suggestedRate": number | null
        }
        `;

        // 3. AI Call
        try {
            // DEBUG: LOG ANOMALY PROMPT
            console.log("--- AI ANALYZE PROMPT ---");
            console.log(prompt);
            console.log("-------------------------");

            const completion = await this.openai.chat.completions.create({
                messages: [{ role: "system", content: "Returns JSON only." }, { role: "user", content: prompt }],
                model: "gpt-4o-mini",
                temperature: 0.0,
            });

            const content = completion.choices[0].message.content;

            // DEBUG: LOG ANOMALY RESPONSE
            console.log("--- AI ANALYZE RESPONSE ---");
            console.log(content);
            console.log("---------------------------");

            const jsonString = content?.replace(/```json/g, "").replace(/```/g, "").trim();
            return JSON.parse(jsonString || "{}");

        } catch (error) {
            console.error("AI Anomaly Check Failed", error);
            return { isAnomalous: false, reason: "Error de IA" };
        }
    }
    async classifyTransaction(text: string, context: { operaciones: any[], tipos: any[] }) {
        const prompt = `
        You are an intelligent financial assistant.
        Classify the following transaction description into the most appropriate Operation and Movement Type from the provided list.
        Also, refine the description to be more formal and professional, in SPANISH.

        User Input: "${text}"

        *** CONTEXT ***
        - Operations: ${JSON.stringify(context.operaciones.map((o: any) => ({ id: o.id, n: o.nombre })))}
        - Types: ${JSON.stringify(context.tipos.map((t: any) => ({ id: t.id, n: t.nombre, opId: t.operacion?.id })))}

        *** RULES ***
        1. match 'operacionId' and 'tipoMovimientoId'.
        2. 'suggestedObservation': A professional, concise description in Spanish based on the input.
           Example: "pago luz" -> "Pago de servicio eléctrico"
           Example: "alquiler" -> "Pago de alquiler mensual"
        
        *** OUTPUT JSON ***
        {
            "operacionId": number | null,
            "tipoMovimientoId": number | null,
            "suggestedObservation": string
        }
        `;

        try {
            console.log("--- AI CLASSIFY PROMPT ---");
            console.log(prompt);
            console.log("--------------------------");

            const completion = await this.openai.chat.completions.create({
                messages: [{ role: "system", content: "Returns JSON only." }, { role: "user", content: prompt }],
                model: "gpt-4o-mini",
                temperature: 0.1,
            });

            const content = completion.choices[0].message.content;
            console.log("--- AI CLASSIFY RESPONSE ---");
            console.log(content);
            console.log("----------------------------");

            const jsonString = content?.replace(/```json/g, "").replace(/```/g, "").trim();
            return JSON.parse(jsonString || "{}");
        } catch (error) {
            console.error("AI Classify Failed", error);
            return { operacionId: null, tipoMovimientoId: null, suggestedObservation: text };
        }
    }
}
