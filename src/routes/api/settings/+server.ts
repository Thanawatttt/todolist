import { json } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import type { Settings, SettingsDocument } from '$lib/db';
import { getSettingsCollection, settingsDocToSettings } from '$lib/db';
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

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export async function GET({ request }: { request: Request }) {
  const authHeader = request.headers.get('authorization');
  const userId = getUserIdFromToken(authHeader || '');
  
  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const settingsCollection = await getSettingsCollection();
  let userSettingsDoc = await settingsCollection.findOne({ userId });

  if (!userSettingsDoc) {
    // Create default settings if none exist
    const now = new Date().toISOString();
    const defaultSettingsDoc: SettingsDocument = {
      userId,
      notificationsEnabled: false,
      webhookUrl: '',
      mention: '',
      notifyOnlyHighPriority: false,
      createdAt: now,
      updatedAt: now,
    };
    
    const result = await settingsCollection.insertOne(defaultSettingsDoc);
    // Get the inserted document with the _id
    userSettingsDoc = await settingsCollection.findOne({ _id: result.insertedId });
  }

  if (!userSettingsDoc) {
    return json({ error: 'Failed to create or retrieve settings' }, { status: 500 });
  }

  const userSettings = settingsDocToSettings(userSettingsDoc);
  return json(userSettings);
}

export async function POST({ request }: { request: Request }) {
  const authHeader = request.headers.get('authorization');
  const userId = getUserIdFromToken(authHeader || '');
  
  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { webhookUrl, mention, notificationsEnabled, notifyOnlyHighPriority } = await request.json();

  const settingsCollection = await getSettingsCollection();
  const existingSettingsDoc = await settingsCollection.findOne({ userId });

  const now = new Date().toISOString();
  const newSettingsDoc: SettingsDocument = {
    userId,
    webhookUrl: webhookUrl || '',
    mention: mention || '',
    notificationsEnabled: notificationsEnabled || false,
    notifyOnlyHighPriority: notifyOnlyHighPriority || false,
    createdAt: existingSettingsDoc?.createdAt || now,
    updatedAt: now,
  };

  if (existingSettingsDoc) {
    await settingsCollection.updateOne({ userId }, { $set: newSettingsDoc });
  } else {
    await settingsCollection.insertOne(newSettingsDoc);
  }

  // Fetch the updated/inserted document to get the proper _id
  const finalSettingsDoc = await settingsCollection.findOne({ userId });
  
  if (!finalSettingsDoc) {
    return json({ error: 'Failed to save settings' }, { status: 500 });
  }

  const newSettings = settingsDocToSettings(finalSettingsDoc);
  return json(newSettings);
}
