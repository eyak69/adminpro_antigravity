import OpenAI from "openai";
import * as dotenv from "dotenv";
import path from "path";

// Explicitly load .env from current directory
dotenv.config({ path: path.resolve(__dirname, ".env") });

async function test() {
    console.log("--- Test Inicio ---");
    const key = process.env.OPENAI_API_KEY;
    console.log("API Key detectada:", key ? "SÍ (" + key.substring(0, 5) + "...)" : "NO");

    if (!key) {
        console.error("ERROR: No se encontró OPENAI_API_KEY en .env");
        return;
    }

    const openai = new OpenAI({ apiKey: key });

    try {
        console.log("Enviando solicitud a OpenAI (gpt-3.5-turbo)...");
        const start = Date.now();
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: "Responde solo con la palabra: FUNCIONA" }],
            model: "gpt-3.5-turbo",
            max_tokens: 5
        });
        const duration = Date.now() - start;
        console.log(`Respuesta recibida en ${duration}ms:`, completion.choices[0].message.content);
        console.log("--- Test Exitoso ---");
    } catch (error: any) {
        console.error("--- Test Fallido ---");
        console.error("Error:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        }
    }
}

test();
