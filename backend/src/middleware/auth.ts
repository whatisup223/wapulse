import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                email?: string;
            };
        }
    }
}

// Verify JWT token middleware
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get token from header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                error: 'Access token is required'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, jwtConfig.accessToken.secret) as {
            userId: string;
            email?: string;
        };

        // Attach user to request
        req.user = decoded;
        next();

    } catch (error) {
        return res.status(403).json({
            error: 'Invalid or expired token'
        });
    }
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, jwtConfig.accessToken.secret) as {
                userId: string;
                email?: string;
            };
            req.user = decoded;
        }

        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};
