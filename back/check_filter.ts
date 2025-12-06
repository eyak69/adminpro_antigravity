

const API_URL = 'http://localhost:3000/api/planillas';

async function checkFilter() {
    try {
        console.log('--- Fetching ALL Planillas ---');
        const allRes = await fetch(API_URL);
        const all = await allRes.json();
        console.log(`Total records: ${all.length}`);
        all.forEach((p: any) => {
            console.log(`ID: ${p.id}, Fecha: ${p.fecha_operacion}`);
        });

        const targetDate = '2025-12-04';
        console.log(`\n--- Fetching Filtered: ${targetDate} ---`);
        const filterRes = await fetch(`${API_URL}?fecha=${targetDate}`);

        if (!filterRes.ok) {
            const errBody = await filterRes.text();
            console.error('API Error Response:', errBody);
            return;
        }

        const filtered = await filterRes.json();
        console.log(`Filtered records: ${filtered.length}`);
        filtered.forEach((p: any) => {
            console.log(`ID: ${p.id}, Fecha: ${p.fecha_operacion}`);
        });

    } catch (error) {
        console.error('Error fetching planillas:', error);
    }
}

checkFilter();
