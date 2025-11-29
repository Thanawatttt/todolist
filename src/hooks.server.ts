import { startReminderScheduler } from '$lib/scheduler';

// Start the reminder scheduler when the server starts
startReminderScheduler();

console.log('🚀 Todo App Server Started');
console.log('📅 Reminder Scheduler Active');
console.log('⏰ Checking for task reminders every minute');
