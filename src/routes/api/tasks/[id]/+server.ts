import { json } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';

// Mock task storage (in production, use a database)
const tasks = new Map<string, any[]>();

function getUserIdFromToken(authHeader: string): string | null {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
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

  const userTasks = tasks.get(userId) || [];
  const taskIndex = userTasks.findIndex(t => t.id === id);
  
  if (taskIndex === -1) {
    return json({ error: 'Task not found' }, { status: 404 });
  }

  userTasks.splice(taskIndex, 1);
  tasks.set(userId, userTasks);

  return new Response(null, { status: 204 });
};
