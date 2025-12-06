
import axios from 'axios';

async function main() {
    try {
        console.log("Fetching Planillas (Axios)...");
        const paths = [
            'http://localhost:3000/api/planillas',
            'http://localhost:3000/api/v1/planillas',
            // Maybe it is NOT mounted as 'planillas' but just 'transacciones' for GET?
            'http://localhost:3000/api/v1/transacciones'
        ];

        for (const url of paths) {
            try {
                console.log(`Trying ${url}...`);
                const response = await axios.get(url);
                console.log(`Success! Status: ${response.status}`);
                console.log(`Data Type: ${typeof response.data}`);
                if (Array.isArray(response.data)) {
                    console.log(`Count: ${response.data.length}`);
                    if (response.data.length > 0) {
                        console.log("First Record Keys:", Object.keys(response.data[0]));
                        console.log("fecha_operacion:", response.data[0].fecha_operacion);
                        console.log("created_at:", response.data[0].created_at);
                    }
                }
                return; // Stop on first success
            } catch (e: any) {
                console.log(`Failed ${url}: ${e.message}`);
            }
        }

    } catch (e) {
        console.error("Critical Error", e);
    }
}

main();
