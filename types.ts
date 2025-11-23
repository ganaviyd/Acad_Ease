
export interface User {
  name: string;
  branch: string;
  year: string;
  semester: string;
  role: 'student' | 'admin';
}

export enum MessageSender {
  USER = 'user',
  BOT = 'bot',
}

export interface Message {
  text: string;
  sender: MessageSender;
}

export interface Reminder {
  id: number;
  text: string;
  dueDate: string;
  snoozedUntil?: number; // Timestamp in ms
  notified?: boolean; // Whether the initial due date notification has been sent
}

export interface ReminderSettings {
  soundEnabled: boolean;
  soundType: 'beep' | 'chime' | 'alert';
  emailEnabled: boolean;
  emailAddress: string;
}

export interface TimetableEntry {
  id: number;
  day: string;
  subject: string;
  startTime: string;
  endTime: string;
}

export type TimetableData = {
  [compositeKey: string]: TimetableEntry[];
};
