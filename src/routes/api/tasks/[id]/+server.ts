import { json } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { getTasksCollection } from '$lib/db';
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

export async function DELETE({ request, params }: { request: Request; params: { id: string } }) {
  const authHeader = request.headers.get('authorization');
  const userId = getUserIdFromToken(authHeader || '');
  
  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  
  if (!id) {
    return json({ error: 'Task ID is required' }, { status: 400 });
  }

  try {
    const tasksCollection = await getTasksCollection();
    
    // Find and delete the task
    const result = await tasksCollection.deleteOne({
      _id: new ObjectId(id),
      userId: userId
    });

    if (result.deletedCount === 0) {
      return json({ error: 'Task not found' }, { status: 404 });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete task:', error);
    return json({ error: 'Failed to delete task' }, { status: 500 });
  }
};
