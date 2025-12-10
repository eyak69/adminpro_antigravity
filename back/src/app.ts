import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./api/routes";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

import { authMiddleware } from "./api/middlewares/auth.middleware";

// Apply Auth Middleware to all API routes
// Note: The middleware itself handles skipping for disabled security
// and we should ensure /auth routes are excluded if we mount it globally on /api
// But express middleware runs sequentially.
// If we mount it here, it applies to all routes in `routes`.
// We need to make sure the middleware allows public access to /auth/google and /auth/status even if security is ON.
// Or we can mount it specifically.
// Let's modify middleware to exclude /auth paths or handle it here.
// Better: Mount it on app.use("/api", authMiddleware, routes);

app.use("/api", authMiddleware, routes);


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
