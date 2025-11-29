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
      mentionUser: false,
      userMention: '',
      notifyOnlyHighPriority: false,
      reminderInterval: 1,
      reminderUnit: 'hours',
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

  const body = await request.json();
  
  // Log the received body for debugging
  console.log('Settings received:', body);
  
  const { 
    webhookUrl, 
    mention, 
    mentionUser, 
    userMention, 
    notificationsEnabled, 
    enableNotifications,
    notifyOnlyHighPriority,
    reminderInterval,
    reminderUnit 
  } = body;

  try {
    const settingsCollection = await getSettingsCollection();
    const existingSettingsDoc = await settingsCollection.findOne({ userId });

    const now = new Date().toISOString();
    const newSettingsDoc: SettingsDocument = {
      userId,
      webhookUrl: webhookUrl || '',
      mention: mention || '',
      mentionUser: mentionUser || false,
      userMention: userMention || '',
      notificationsEnabled: enableNotifications || notificationsEnabled || false,
      notifyOnlyHighPriority: notifyOnlyHighPriority || false,
      reminderInterval: reminderInterval || 1,
      reminderUnit: reminderUnit || 'hours',
      createdAt: existingSettingsDoc?.createdAt || now,
      updatedAt: now,
    };

    console.log('Saving settings doc:', newSettingsDoc);

    if (existingSettingsDoc) {
      await settingsCollection.updateOne({ userId }, { $set: newSettingsDoc });
    } else {
      await settingsCollection.insertOne(newSettingsDoc);
    }

    // Fetch the updated/inserted document to get the proper _id
    const finalSettingsDoc = await settingsCollection.findOne({ userId });
    
    if (!finalSettingsDoc) {
      console.error('Failed to retrieve saved settings');
      return json({ error: 'Failed to save settings - could not retrieve saved data' }, { status: 500 });
    }

    const newSettings = settingsDocToSettings(finalSettingsDoc);
    console.log('Settings saved successfully:', newSettings);
    return json(newSettings);
  } catch (error) {
    console.error('Database error saving settings:', error);
    return json({ error: 'Database error: ' + (error as Error).message }, { status: 500 });
  }
}
