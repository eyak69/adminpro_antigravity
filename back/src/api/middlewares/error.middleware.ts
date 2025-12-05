import { Request, Response, NextFunction } from "express";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Unhandled Error:", err.stack);
    res.status(500).json({
        ok: false,
        message: "Internal Server Error",
        error: err.message || "Unknown error"
    });
};
