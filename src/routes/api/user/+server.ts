import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import jwt from 'jsonwebtoken';
import { getUsersCollection } from '$lib/db';
import type { UserDocument } from '$lib/db';

export const GET: RequestHandler = async ({ request }) => {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return error(401, 'No token provided');
        }

        // Verify JWT token
        const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
        let decoded: any;
        
        try {
            decoded = jwt.verify(token, jwtSecret);
        } catch (err) {
            return error(401, 'Invalid token');
        }

        // Get user from database
        const usersCollection = await getUsersCollection();
        const user = await usersCollection.findOne({ email: decoded.email }) as UserDocument;

        if (!user) {
            return error(404, 'User not found');
        }

        // Return user data without password
        const { password, ...userWithoutPassword } = user;
        
        return json({
            id: user._id?.toString(),
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        });

    } catch (err) {
        console.error('Profile API error:', err);
        return error(500, 'Internal server error');
    }
};
