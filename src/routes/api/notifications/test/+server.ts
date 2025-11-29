import { json } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { sendDiscordNotification, createTestNotificationMessage } from '$lib/discord';
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

export async function POST({ request }: { request: Request }) {
  const authHeader = request.headers.get('authorization');
  console.log('Test webhook auth header:', authHeader);
  
  const userId = getUserIdFromToken(authHeader || '');
  console.log('Test webhook userId:', userId);
  
  if (!userId) {
    console.log('Test webhook unauthorized - no userId found');
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { webhookUrl, mentionUser, userMention } = await request.json();

  if (!webhookUrl) {
    return json({ error: 'Webhook URL is required' }, { status: 400 });
  }

  try {
    // Create the Discord message using the helper function
    const message = createTestNotificationMessage(mentionUser, userMention);

    // Send Discord webhook
    const success = await sendDiscordNotification(webhookUrl, message);

    if (!success) {
      return json({ error: 'Failed to send Discord notification' }, { status: 500 });
    }

    console.log('Discord test notification sent successfully:', {
      webhookUrl,
      mentionUser,
      userMention,
      timestamp: new Date().toISOString(),
    });

    return json({ message: 'Test notification sent successfully!' });
  } catch (error) {
    console.error('Failed to send test notification:', error);
    return json({ error: 'Failed to send test notification' }, { status: 500 });
  }
}
