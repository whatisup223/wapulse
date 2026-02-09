import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/database';
import { jwtConfig } from '../config/jwt';

// Validation schemas
const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters')
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
});

// Register new user
export const register = async (req: Request, res: Response) => {
    try {
        // Validate input
        const { name, email, password } = registerSchema.parse(req.body);

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({
                error: 'Email already registered'
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash
            }
        });

        // Generate tokens
        const accessToken = jwt.sign(
            { userId: user.id, email: user.email },
            jwtConfig.accessToken.secret,
            { expiresIn: jwtConfig.accessToken.expiresIn }
        );

        const refreshToken = jwt.sign(
            { userId: user.id },
            jwtConfig.refreshToken.secret,
            { expiresIn: jwtConfig.refreshToken.expiresIn }
        );

        // Return user data and tokens
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                emailVerified: user.emailVerified,
                subscriptionPlan: user.subscriptionPlan
            },
            accessToken,
            refreshToken
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Validation error',
                details: error.errors
            });
        }

        console.error('Register error:', error);
        res.status(500).json({
            error: 'Registration failed. Please try again.'
        });
    }
};

// Login user
export const login = async (req: Request, res: Response) => {
    try {
        // Validate input
        const { email, password } = loginSchema.parse(req.body);

        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);

        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        // Generate tokens
        const accessToken = jwt.sign(
            { userId: user.id, email: user.email },
            jwtConfig.accessToken.secret,
            { expiresIn: jwtConfig.accessToken.expiresIn }
        );

        const refreshToken = jwt.sign(
            { userId: user.id },
            jwtConfig.refreshToken.secret,
            { expiresIn: jwtConfig.refreshToken.expiresIn }
        );

        // Return user data and tokens
        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                emailVerified: user.emailVerified,
                subscriptionPlan: user.subscriptionPlan
            },
            accessToken,
            refreshToken
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Validation error',
                details: error.errors
            });
        }

        console.error('Login error:', error);
        res.status(500).json({
            error: 'Login failed. Please try again.'
        });
    }
};

// Refresh access token
export const refreshAccessToken = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                error: 'Refresh token is required'
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, jwtConfig.refreshToken.secret) as {
            userId: string;
        };

        // Generate new access token
        const accessToken = jwt.sign(
            { userId: decoded.userId },
            jwtConfig.accessToken.secret,
            { expiresIn: jwtConfig.accessToken.expiresIn }
        );

        res.json({ accessToken });

    } catch (error) {
        res.status(401).json({
            error: 'Invalid or expired refresh token'
        });
    }
};

// Logout (client-side token removal)
export const logout = async (req: Request, res: Response) => {
    res.json({
        message: 'Logged out successfully'
    });
};
