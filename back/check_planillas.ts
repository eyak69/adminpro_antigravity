
async function main() {
    try {
        console.log("Fetching Planillas...");
        // Assuming /api/v1/planillas ?? Or just /api/planillas?
        // Server.ts mounted /api/v1/transacciones.
        // What about planillas?
        // I need to find where PlanillaRouter is mounted.
        // I'll try generic /api/planillas first based on service.js usually mapping to root API.
        // But Server.ts showed only `app.use("/api/v1/transacciones", ...)`?
        // If Planillas are fetched via `planillas` endpoint, I need to know where it is.

        // I'll try multiple common paths.
        const paths = [
            'http://localhost:3000/api/planillas',
            'http://localhost:3000/api/v1/planillas',
            'http://localhost:3000/planillas'
        ];

        for (const url of paths) {
            try {
                console.log(`Trying ${url}...`);
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    console.log(`Success! Count: ${data.length}`);
                    if (data.length > 0) {
                        console.log("First Record:", JSON.stringify(data[0], null, 2));
                    }
                    return;
                } else {
                    console.log(`Failed: ${response.status}`);
                }
            } catch (e) {
                console.log(`Error: ${e.message}`);
            }
        }

        console.log("Could not fetch planillas from any path.");

    } catch (e) {
        console.error("Critical Error", e);
    }
}

main();
