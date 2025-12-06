
async function main() {
    try {
        console.log("Testeando API...");
        const response = await fetch('http://localhost:3001/api/tipos-movimiento'); // Assuming port 3001 based on typical Nest/Express, or user mentioned port? 
        // Wait, metadata says "npm run dev ... back ... 2h...". Port is likely 3000 or 3001. 
        // Environment variable DB_PORT is 3306. API port?
        // Usually 3000.

        console.log("Status:", response.status);
        if (response.ok) {
            const data = await response.json();
            console.log("Datos recibidos (Total):", data.length);
            console.log("Primer item:", data[0]);
        } else {
            console.log("Error API:", await response.text());
        }
    } catch (e) {
        console.error("No se pudo conectar a la API:", e);
    }
}

main();
