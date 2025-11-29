import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { getUsersCollection } from '$lib/db';
import type { UserDocument } from '$lib/db';
import { env } from '$env/dynamic/private';

function getUserIdFromToken(authHeader: string): string | null {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET || 'your-secret-key') as any;
    return decoded.userId;
  } catch {
    return null;
  }
}

export const GET: RequestHandler = async ({ request }) => {
    try {
        const authHeader = request.headers.get('authorization');
        const userId = getUserIdFromToken(authHeader || '');
        
        if (!userId) {
            return error(401, 'Invalid token');
        }

        // Get user from database by ID
        const usersCollection = await getUsersCollection();
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) }) as UserDocument;

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
