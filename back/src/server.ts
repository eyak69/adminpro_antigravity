import "reflect-metadata";
import * as dotenv from "dotenv";
import app from "./app";
import { AppDataSource } from "./infrastructure/database/data-source";
import { TransactionService } from "./application/services/transaction.service";
import { TransactionController } from "./api/controllers/transaction.controller";
import { createTransactionRouter } from "./api/routes/transaction.routes";
import { errorHandler } from "./api/middlewares/error.middleware";

dotenv.config();

const PORT = process.env.PORT || 3000;

import ParametroService from "./application/services/parametro.service";

const startServer = async () => {
    try {
        await AppDataSource.initialize();
        console.log("Data Source has been initialized!");

        // Initialize Parameters
        await ParametroService.seedDefaults();

        // --- Composition Root ---
        // 1. Instantiate Services
        const transactionService = new TransactionService();

        // 2. Instantiate Controllers (Dependency Injection)
        const transactionController = new TransactionController(transactionService);

        // 3. Create Routers (Factory)
        const transactionRouter = createTransactionRouter(transactionController);

        // 4. Mount Routes
        // Mounting at /api/v1/transacciones as requested
        app.use("/api/v1/transacciones", transactionRouter);

        // 5. Error Middleware (Should be last)
        app.use(errorHandler);

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Error during Data Source initialization", error);
        process.exit(1);
    }
};

startServer();
