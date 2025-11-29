import { json } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { User, UserDocument } from '$lib/db';
import { getUsersCollection, userDocToUser } from '$lib/db';
import { env } from '$env/dynamic/private';

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export async function POST({ request, url }: { request: Request; url: URL }) {
  const { username, password, email } = await request.json();

  if (url.searchParams.get('action') === 'register' || url.pathname.includes('register')) {
    // Register
    if (!username || !password || !email) {
      return json({ error: 'Username, email, and password are required' }, { status: 400 });
    }

    const usersCollection = await getUsersCollection();
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();
    
    const userDoc: UserDocument = {
      username,
      email,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    };

    const result = await usersCollection.insertOne(userDoc);
    const insertedDoc = await usersCollection.findOne({ _id: result.insertedId });
    
    if (!insertedDoc) {
      return json({ error: 'Failed to create user' }, { status: 500 });
    }
    
    const user = userDocToUser(insertedDoc);

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    return json({
      token,
      user: { id: user.id, username: user.username, email: user.email, createdAt: user.createdAt }
    });
  } else {
    // Login
    if (!username || !password) {
      return json({ error: 'Username and password are required' }, { status: 400 });
    }

    const usersCollection = await getUsersCollection();
    const userDoc = await usersCollection.findOne({ username });

    if (!userDoc || !(await bcrypt.compare(password, userDoc.password))) {
      return json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = userDocToUser(userDoc);

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    return json({
      token,
      user: { id: user.id, username: user.username, email: user.email, createdAt: user.createdAt }
    });
  }
};
