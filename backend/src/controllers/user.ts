import { Request, Response } from 'express';
import prisma from '../config/database';

// Get current user profile
export const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                emailVerified: true,
                subscriptionPlan: true,
                subscriptionExpiry: true,
                createdAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { name } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: { name },
            select: {
                id: true,
                name: true,
                email: true,
                emailVerified: true,
                subscriptionPlan: true
            }
        });

        res.json({
            message: 'Profile updated successfully',
            user
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};
