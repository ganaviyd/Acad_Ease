
import { User, Reminder, TimetableData, Message, ReminderSettings } from '../types';

const USER_KEY = 'acadease_user';
const REMINDERS_KEY = 'acadease_reminders';
const TIMETABLE_KEY = 'acadease_timetable';
const CHAT_HISTORY_KEY = 'acadease_chat_history';
const SETTINGS_KEY = 'acadease_settings';

// Simulate network latency
const FAKE_DELAY = 300; 

const fakeNetworkDelay = () => new Promise(res => setTimeout(res, FAKE_DELAY));

// --- User Management ---

export const getStoredUser = async (): Promise<User | null> => {
  await fakeNetworkDelay();
  const storedUser = localStorage.getItem(USER_KEY);
  return storedUser ? JSON.parse(storedUser) : null;
};

export const storeUser = async (user: User): Promise<void> => {
  await fakeNetworkDelay();
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearStoredUser = async (): Promise<void> => {
  await fakeNetworkDelay();
  localStorage.removeItem(USER_KEY);
};

// --- Helper for user-specific keys ---
const getUserSpecificKey = (user: User, prefix: string): string => {
  if (user.role === 'admin') {
    return `${prefix}_admin`;
  }
  // Create a unique identifier for the student to scope their data.
  const userIdentifier = `${user.name}-${user.branch}-${user.year}-${user.semester}`
    .replace(/\s+/g, '_')
    .toLowerCase();
  return `${prefix}_${userIdentifier}`;
}

// --- Reminders ---

export const getReminders = async (user: User): Promise<Reminder[]> => {
    await fakeNetworkDelay();
    const userRemindersKey = getUserSpecificKey(user, REMINDERS_KEY);
    const storedReminders = localStorage.getItem(userRemindersKey);
    return storedReminders ? JSON.parse(storedReminders) : [];
};

export const saveReminders = async (user: User, reminders: Reminder[]): Promise<void> => {
    await fakeNetworkDelay();
    const userRemindersKey = getUserSpecificKey(user, REMINDERS_KEY);
    localStorage.setItem(userRemindersKey, JSON.stringify(reminders));
};

// --- Reminder Settings ---

const DEFAULT_SETTINGS: ReminderSettings = {
  soundEnabled: true,
  soundType: 'beep',
  emailEnabled: false,
  emailAddress: '',
};

export const getReminderSettings = async (user: User): Promise<ReminderSettings> => {
  await fakeNetworkDelay();
  const key = getUserSpecificKey(user, SETTINGS_KEY);
  const stored = localStorage.getItem(key);
  return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
};

export const saveReminderSettings = async (user: User, settings: ReminderSettings): Promise<void> => {
  await fakeNetworkDelay();
  const key = getUserSpecificKey(user, SETTINGS_KEY);
  localStorage.setItem(key, JSON.stringify(settings));
};


// --- Timetable ---

export const getTimetable = async (): Promise<TimetableData> => {
    await fakeNetworkDelay();
    const storedTimetable = localStorage.getItem(TIMETABLE_KEY);
    return storedTimetable ? JSON.parse(storedTimetable) : {};
};

export const saveTimetable = async (timetable: TimetableData): Promise<void> => {
    await fakeNetworkDelay();
    localStorage.setItem(TIMETABLE_KEY, JSON.stringify(timetable));
};

// --- Chat History ---

export const getChatHistory = async (user: User): Promise<Message[]> => {
  await fakeNetworkDelay();
  const key = getUserSpecificKey(user, CHAT_HISTORY_KEY);
  const storedHistory = localStorage.getItem(key);
  return storedHistory ? JSON.parse(storedHistory) : [];
};

export const saveChatHistory = async (user: User, messages: Message[]): Promise<void> => {
  // We skip the fake delay for saving chat history to ensure the UI remains responsive 
  // and updates are "fire-and-forget" in the background.
  const key = getUserSpecificKey(user, CHAT_HISTORY_KEY);
  localStorage.setItem(key, JSON.stringify(messages));
};
