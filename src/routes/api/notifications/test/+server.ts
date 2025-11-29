import { json } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';

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

export async function POST({ request }: { request: Request }) {
  const authHeader = request.headers.get('authorization');
  const userId = getUserIdFromToken(authHeader || '');
  
  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { webhookUrl, mention } = await request.json();

  if (!webhookUrl) {
    return json({ error: 'Webhook URL is required' }, { status: 400 });
  }

  try {
    // Mock Discord webhook call (in production, use actual webhook)
    console.log('Mock Discord notification:', {
      webhookUrl,
      mention,
      message: '🧪 Test notification from Todo App',
      timestamp: new Date().toISOString(),
    });

    return json({ message: 'Test notification sent successfully!' });
  } catch (error) {
    console.error('Failed to send test notification:', error);
    return json({ error: 'Failed to send test notification' }, { status: 500 });
  }
}
