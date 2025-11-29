import * as cron from 'node-cron';
import { getTasksCollection, getSettingsCollection } from '$lib/db';
import { sendDiscordNotification, createTaskReminderMessage } from '$lib/discord';

interface ReminderTask {
  _id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  userId: string;
  status: 'pending' | 'in-progress' | 'completed';
}

interface UserSettings {
  userId: string;
  notificationsEnabled: boolean;
  webhookUrl?: string;
  mentionUser?: boolean;
  userMention?: string;
  notifyOnlyHighPriority: boolean;
  reminderInterval?: number;
  reminderUnit?: 'minutes' | 'hours' | 'days';
}

// Store active cron jobs
const activeJobs = new Map<string, cron.ScheduledTask>();

export function startReminderScheduler() {
  console.log('Starting reminder scheduler...');
  
  // Check for tasks that need reminders every minute
  cron.schedule('* * * * *', async () => {
    console.log('Checking for task reminders...');
    await checkAndSendReminders();
  });
}

export function stopReminderScheduler() {
  console.log('Stopping reminder scheduler...');
  activeJobs.forEach(job => job.stop());
  activeJobs.clear();
}

async function checkAndSendReminders() {
  try {
    const settingsCollection = await getSettingsCollection();
    const tasksCollection = await getTasksCollection();
    
    // Get all users with notifications enabled
    const usersWithNotifications = await settingsCollection.find({
      notificationsEnabled: true,
      webhookUrl: { $exists: true, $ne: '' }
    }).toArray();
    
    console.log(`Found ${usersWithNotifications.length} users with notifications enabled`);
    
    for (const userSettings of usersWithNotifications) {
      await processUserReminders(userSettings as UserSettings, tasksCollection);
    }
  } catch (error) {
    console.error('Error checking reminders:', error);
  }
}

async function processUserReminders(userSettings: UserSettings, tasksCollection: any) {
  try {
    // Get incomplete tasks for this user
    const tasks = await tasksCollection.find({
      userId: userSettings.userId,
      status: { $ne: 'completed' }
    }).toArray();
    
    console.log(`User ${userSettings.userId} has ${tasks.length} incomplete tasks`);
    
    if (tasks.length === 0) return;
    
    // Filter tasks based on priority settings
    let tasksToRemind = tasks as ReminderTask[];
    
    if (userSettings.notifyOnlyHighPriority) {
      tasksToRemind = tasksToRemind.filter(task => task.priority === 'high');
    }
    
    if (tasksToRemind.length === 0) {
      console.log(`No tasks meet reminder criteria for user ${userSettings.userId}`);
      return;
    }
    
    // Check if this user should receive reminders now
    const shouldRemind = shouldSendReminderNow(userSettings);
    
    if (shouldRemind) {
      console.log(`Sending reminders to user ${userSettings.userId}`);
      await sendTaskReminders(userSettings, tasksToRemind);
    }
  } catch (error) {
    console.error(`Error processing reminders for user ${userSettings.userId}:`, error);
  }
}

function shouldSendReminderNow(userSettings: UserSettings): boolean {
  const interval = userSettings.reminderInterval || 1;
  const unit = userSettings.reminderUnit || 'hours';
  
  const now = new Date();
  const currentMinute = now.getMinutes();
  const currentHour = now.getHours();
  
  // Create a unique key for this user's reminder schedule
  const reminderKey = `${userSettings.userId}-${interval}-${unit}`;
  
  switch (unit) {
    case 'minutes':
      // Send every X minutes
      return currentMinute % interval === 0;
      
    case 'hours':
      // Send every X hours at minute 0
      return currentMinute === 0 && currentHour % interval === 0;
      
    case 'days':
      // Send every X days at midnight
      return currentMinute === 0 && currentHour === 0;
      
    default:
      return false;
  }
}

async function sendTaskReminders(userSettings: UserSettings, tasks: ReminderTask[]) {
  try {
    if (!userSettings.webhookUrl) {
      console.log(`No webhook URL for user ${userSettings.userId}`);
      return;
    }
    
    // Create reminder message
    const message = createTaskReminderMessage(tasks, userSettings.mentionUser, userSettings.userMention);
    
    // Send Discord notification
    const success = await sendDiscordNotification(userSettings.webhookUrl, message);
    
    if (success) {
      console.log(`Reminder sent successfully to user ${userSettings.userId} for ${tasks.length} tasks`);
    } else {
      console.error(`Failed to send reminder to user ${userSettings.userId}`);
    }
  } catch (error) {
    console.error(`Error sending reminders to user ${userSettings.userId}:`, error);
  }
}

// Helper function to calculate next reminder time
export function getNextReminderTime(interval: number, unit: 'minutes' | 'hours' | 'days'): Date {
  const now = new Date();
  
  switch (unit) {
    case 'minutes':
      now.setMinutes(now.getMinutes() + interval);
      break;
    case 'hours':
      now.setHours(now.getHours() + interval);
      break;
    case 'days':
      now.setDate(now.getDate() + interval);
      break;
  }
  
  return now;
}
