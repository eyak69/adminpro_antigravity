import { AppDataSource } from "./src/infrastructure/database/data-source";
import { StockCajaRepository } from "./src/infrastructure/repositories/stockCaja.repository";

async function main() {
    try {
        await AppDataSource.initialize();
        console.log("Database connected");

        const stocks = await StockCajaRepository.find({ relations: ["moneda"] });
        console.log("Stocks found:", stocks);

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

main();
