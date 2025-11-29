import { json } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import type { Task, TaskDocument } from '$lib/db';
import { getTasksCollection, taskDocToTask } from '$lib/db';
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

  const tasksCollection = await getTasksCollection();
  const userTaskDocs = await tasksCollection.find({ userId }).sort({ createdAt: -1 }).toArray();
  const userTasks = userTaskDocs.map(taskDocToTask);
  return json(userTasks);
}

export async function POST({ request }: { request: Request }) {
  const authHeader = request.headers.get('authorization');
  const userId = getUserIdFromToken(authHeader || '');
  
  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, description, priority, deadline } = await request.json();
  
  if (!title) {
    return json({ error: 'Title is required' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const taskDoc: TaskDocument = {
    title,
    description: description || '',
    priority: priority || 'medium',
    status: 'pending',
    dueDate: deadline || '',
    userId,
    createdAt: now,
    updatedAt: now,
  };

  const tasksCollection = await getTasksCollection();
  const result = await tasksCollection.insertOne(taskDoc);
  const insertedDoc = await tasksCollection.findOne({ _id: result.insertedId });
  
  if (!insertedDoc) {
    return json({ error: 'Failed to create task' }, { status: 500 });
  }
  
  const task = taskDocToTask(insertedDoc);

  return json(task, { status: 201 });
};

export async function PUT({ request }: { request: Request }) {
  const authHeader = request.headers.get('authorization');
  const userId = getUserIdFromToken(authHeader || '');
  
  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, ...updates } = await request.json();
  
  if (!id) {
    return json({ error: 'Task ID is required' }, { status: 400 });
  }

  const tasksCollection = await getTasksCollection();
  const existingTaskDoc = await tasksCollection.findOne({ userId, _id: new ObjectId(id) });
  
  if (!existingTaskDoc) {
    return json({ error: 'Task not found' }, { status: 404 });
  }

  const updatedTaskDoc = { ...existingTaskDoc, ...updates, updatedAt: new Date().toISOString() };
  await tasksCollection.updateOne({ userId, _id: new ObjectId(id) }, { $set: updatedTaskDoc });

  const updatedTask = taskDocToTask(updatedTaskDoc);
  return json(updatedTask);
};

export async function DELETE({ request }: { request: Request }) {
  const authHeader = request.headers.get('authorization');
  const userId = getUserIdFromToken(authHeader || '');
  
  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  
  if (!id) {
    return json({ error: 'Task ID is required' }, { status: 400 });
  }

  const tasksCollection = await getTasksCollection();
  const result = await tasksCollection.deleteOne({ userId, _id: new ObjectId(id) });
  
  if (result.deletedCount === 0) {
    return json({ error: 'Task not found' }, { status: 404 });
  }

  return json({ success: true });
};
