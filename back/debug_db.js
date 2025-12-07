const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
        });
        const [rows] = await conn.execute('DESCRIBE tipos_movimiento');
        console.log(rows);
        await conn.end();
    } catch (e) {
        console.error(e);
    }
}
main();
