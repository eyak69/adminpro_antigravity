import { OAuth2Client, TokenPayload } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { User } from '../../domain/entities/User';
import { AppDataSource } from '../../infrastructure/database/data-source';
import * as fs from 'fs';
import * as path from 'path';

export class AuthService {
    private client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    private userRepository = AppDataSource.getRepository(User);

    async verifyGoogleToken(token: string): Promise<TokenPayload | undefined> {
        try {
            const ticket = await this.client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            return ticket.getPayload();
        } catch (error: any) {
            console.error("Error verifying Google token:", error);
            // DEBUG: Write error to file
            try {
                const logPath = path.join(process.cwd(), 'logs', 'auth_error.log');
                const logDir = path.dirname(logPath);
                if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

                const msg = `[${new Date().toISOString()}] Error: ${error.message}\nStack: ${error.stack}\nToken: ${token.substring(0, 20)}...\nClientID: ${process.env.GOOGLE_CLIENT_ID}\n\n`;
                fs.appendFileSync(logPath, msg);
            } catch (err) {
                console.error("Failed to write log:", err);
            }
            throw new Error("Invalid Google Token: " + error.message);
        }
    }

    async loginWithGoogle(token: string): Promise<{ user: User; token: string }> {
        const payload = await this.verifyGoogleToken(token);
        if (!payload) throw new Error("Invalid Google Payload");

        const { sub: googleId, email, name, picture } = payload;

        if (!email) throw new Error("Email is required from Google");

        let user = await this.userRepository.findOne({ where: { googleId } });

        if (!user) {
            user = this.userRepository.create({
                googleId,
                email,
                name: name || 'Unknown',
                picture: picture,
                role: 'user' // Default role
            });
        } else {
            // Update info
            user.name = name || user.name;
            user.picture = picture || user.picture;
        }

        await this.userRepository.save(user);

        const sessionToken = this.generateToken(user);

        return { user, token: sessionToken };
    }

    private generateToken(user: User): string {
        return jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name,
                picture: user.picture
            },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '24h' }
        );
    }
}
