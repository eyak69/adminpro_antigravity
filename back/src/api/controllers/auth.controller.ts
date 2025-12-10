import { Request, Response } from 'express';
import { AuthService } from '../../application/services/auth.service';
import ParametroService from '../../application/services/parametro.service';

const authService = new AuthService();

export class AuthController {
    async googleLogin(req: Request, res: Response) {
        try {
            const { token } = req.body;
            if (!token) {
                return res.status(400).json({ message: "Token is required" });
            }

            const result = await authService.loginWithGoogle(token);
            res.json(result);
        } catch (error) {
            console.error("Login Error:", error);
            res.status(401).json({ message: "Authentication failed" });
        }
    }

    async getStatus(req: Request, res: Response) {
        try {
            const seguridadGoogle = await ParametroService.get('SEGURIDADGOOGLE');
            // 'true' string or boolean true from JSON parse
            const isEnabled = seguridadGoogle === 'true' || seguridadGoogle === true;
            res.json({ enabled: isEnabled });
        } catch (error) {
            console.error("Error checking auth status:", error);
            res.status(500).json({ message: "Error checking status" });
        }
    }
}
