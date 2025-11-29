import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { env } from '$env/dynamic/private';

if (!env.MONGODB_URI) {
  throw new Error('Please add your MONGODB_URI to .env.local');
}

const uri = env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

// Database helper functions
export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db('todo');
}

export async function getUsersCollection(): Promise<Collection<UserDocument>> {
  const db = await getDatabase();
  return db.collection('users');
}

export async function getTasksCollection(): Promise<Collection<TaskDocument>> {
  const db = await getDatabase();
  return db.collection('tasks');
}

export async function getSettingsCollection(): Promise<Collection<SettingsDocument>> {
  const db = await getDatabase();
  return db.collection('settings');
}

// User interface (for application use)
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

// User document (for MongoDB use)
export interface UserDocument extends Omit<User, 'id'> {
  _id?: ObjectId;
}

// Task interface (for application use)
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Task document (for MongoDB use)
export interface TaskDocument extends Omit<Task, 'id'> {
  _id?: ObjectId;
}

// Settings interface (for application use)
export interface Settings {
  userId: string;
  notificationsEnabled: boolean;
  webhookUrl?: string;
  mention?: string;
  mentionUser?: boolean;
  userMention?: string;
  notifyOnlyHighPriority: boolean;
  reminderInterval?: number;
  reminderUnit?: 'minutes' | 'hours' | 'days';
  createdAt: string;
  updatedAt: string;
}

// Settings document (for MongoDB use)
export interface SettingsDocument extends Settings {
  _id?: ObjectId;
}

// Helper functions to convert between document and application types
export function userDocToUser(doc: UserDocument & { _id: ObjectId }): User {
  return {
    id: doc._id.toString(),
    username: doc.username,
    email: doc.email,
    password: doc.password,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function taskDocToTask(doc: TaskDocument & { _id: ObjectId }): Task {
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    priority: doc.priority,
    status: doc.status,
    dueDate: doc.dueDate,
    userId: doc.userId,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function settingsDocToSettings(doc: SettingsDocument & { _id: ObjectId }): Settings {
  return {
    userId: doc.userId,
    notificationsEnabled: doc.notificationsEnabled,
    webhookUrl: doc.webhookUrl,
    mention: doc.mention,
    mentionUser: doc.mentionUser,
    userMention: doc.userMention,
    notifyOnlyHighPriority: doc.notifyOnlyHighPriority,
    reminderInterval: doc.reminderInterval,
    reminderUnit: doc.reminderUnit,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
