export interface DiscordMessage {
  content?: string;
  embeds?: DiscordEmbed[];
  username?: string;
  avatar_url?: string;
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: DiscordEmbedField[];
  timestamp?: string;
  footer?: DiscordEmbedFooter;
}

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbedFooter {
  text: string;
  icon_url?: string;
}

export async function sendDiscordNotification(
  webhookUrl: string,
  message: DiscordMessage
): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Discord webhook error:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send Discord notification:', error);
    return false;
  }
}

export function createTaskNotificationMessage(
  task: {
    title: string;
    description?: string;
    priority: string;
    dueDate?: string;
  },
  mentionUser?: boolean,
  userMention?: string
): DiscordMessage {
  const priorityColors = {
    low: 0x00ff00,
    medium: 0xffff00,
    high: 0xff0000,
  };

  const priorityEmojis = {
    low: '🟢',
    medium: '🟡',
    high: '🔴',
  };

  const content = mentionUser && userMention 
    ? `<@${userMention.replace('@', '')}> 📋 New task created!`
    : '📋 New task created!';

  const embed: DiscordEmbed = {
    title: `${priorityEmojis[task.priority as keyof typeof priorityEmojis]} ${task.title}`,
    description: task.description || undefined,
    color: priorityColors[task.priority as keyof typeof priorityColors] || 0x5865F2,
    fields: [],
    timestamp: new Date().toISOString(),
    footer: {
      text: 'Todo App',
    },
  };

  if (task.dueDate) {
    embed.fields?.push({
      name: '📅 Due Date',
      value: new Date(task.dueDate).toLocaleDateString(),
      inline: true,
    });
  }

  embed.fields?.push({
    name: '🎯 Priority',
    value: task.priority.charAt(0).toUpperCase() + task.priority.slice(1),
    inline: true,
  });

  return {
    content,
    embeds: [embed],
    username: 'Todo App',
  };
}

export function createTestNotificationMessage(
  mentionUser?: boolean,
  userMention?: string
): DiscordMessage {
  const content = mentionUser && userMention 
    ? `<@${userMention.replace('@', '')}> 🧪 Test notification from Todo App`
    : '🧪 Test notification from Todo App';

  return {
    content,
    embeds: [{
      title: '🔔 Test Notification',
      description: 'This is a test notification from your Todo App! Webhook is working correctly.',
      color: 0x5865F2,
      timestamp: new Date().toISOString(),
      footer: {
        text: 'Todo App Test',
      },
    }],
    username: 'Todo App',
  };
}

export function createTaskReminderMessage(
  tasks: any[],
  mentionUser?: boolean,
  userMention?: string
): DiscordMessage {
  const content = mentionUser && userMention 
    ? `<@${userMention.replace('@', '')}> You have task`
    : 'You have task';

  let taskList = '';
  
  // Sort tasks by deadline (tasks with deadlines first, then by date)
  const sortedTasks = tasks.sort((a, b) => {
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    return 0;
  });

  sortedTasks.forEach(task => {
    const priorityEmojis: Record<string, string> = {
      high: '🔴',
      medium: '🟡', 
      low: '🟢'
    };
    
    const emoji = priorityEmojis[task.priority] || '📋';
    
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      let deadlineText = '';
      if (daysLeft === 0) {
        deadlineText = '(Today)';
      } else if (daysLeft === 1) {
        deadlineText = '(Tomorrow)';
      } else if (daysLeft > 0) {
        deadlineText = `(${daysLeft} days)`;
      } else {
        deadlineText = `(Overdue by ${Math.abs(daysLeft)} days)`;
      }
      
      taskList += `- ${emoji} ${task.title} ${deadlineText}\n`;
    } else {
      taskList += `- ${emoji} ${task.title}\n`;
    }
  });

  const embed: DiscordEmbed = {
    title: `You have ${tasks.length} pending task${tasks.length > 1 ? 's' : ''}`,
    description: taskList,
    color: 0x5865F2,
    timestamp: new Date().toISOString(),
    footer: {
      text: 'Todo App Reminder System',
    },
  };

  return {
    content,
    embeds: [embed],
    username: 'Todo App',
  };
}
