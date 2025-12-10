import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import ParametroService from '../../application/services/parametro.service';

interface AuthRequest extends Request {
    user?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // Skip auth check for auth routes and public dolar route
        if (req.path.startsWith('/auth') || req.baseUrl.includes('/auth') || req.baseUrl.includes('/dolar')) {
            return next();
        }

        const seguridadGoogle = await ParametroService.get('SEGURIDADGOOGLE');

        // Check if disabled (false or 'false')
        if (!seguridadGoogle || seguridadGoogle === 'false' || seguridadGoogle === false) {
            return next();
        }

        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "No Authorization header" });
        }

        const token = authHeader.split(' ')[1]; // Bearer <token>
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err: any, decoded: any) => {
            if (err) {
                return res.status(403).json({ message: "Invalid or expired token" });
            }
            req.user = decoded;
            next();
        });
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        res.status(500).json({ message: "Internal Server Error in Auth" });
    }
};
