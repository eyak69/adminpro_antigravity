import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./api/routes";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use("/api", routes);

import LogService from "./application/services/log.service";

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled Error:', err);

    // Log fatal error to system logs
    LogService.log({
        type: 'error',
        message: `System Error: ${err.message || 'Unknown error'}`
    }).catch(console.error);

    res.status(500).json({ message: 'Internal Server Error' });
});

export default app;
