export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  deadline: string;
  notify: boolean;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface Settings {
  id: string;
  webhookUrl?: string;
  mention?: string;
  interval: number;
  notificationsEnabled: boolean;
  notifyOnlyHighPriority: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
