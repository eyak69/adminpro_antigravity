
async function main() {
    try {
        console.log("Testeando API en puerto 3000...");
        const response = await fetch('http://localhost:3000/api/tipos-movimiento');

        console.log("Status:", response.status);
        if (response.ok) {
            const data = await response.json();
            console.log("Datos recibidos (Total):", data.length);
        } else {
            console.log("Error API:", await response.text());
        }
    } catch (e) {
        console.error("No se pudo conectar a la API (3000):", e);
    }
}

main();
