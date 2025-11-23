
import React, { useState, useEffect, useCallback } from 'react';
import { User, Reminder, TimetableEntry, TimetableData, ReminderSettings } from '../types';
import ChatWindow from './ChatWindow';
import ReminderList from './ReminderList';
import Timetable from './Timetable';
import { LogoIcon, LogoutIcon, MenuIcon, CloseIcon, SnoozeIcon, CheckCircleIcon, BellIcon } from './Icons';
import * as db from '../services/databaseService';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const NotificationToast: React.FC<{ 
    reminders: Reminder[]; 
    onDismiss: (id: number) => void; 
    onSnooze: (id: number) => void; 
}> = ({ reminders, onDismiss, onSnooze }) => {
    if (reminders.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 w-80 md:w-96 bg-gray-800 border border-cyan-500/50 shadow-2xl shadow-cyan-500/20 rounded-lg overflow-hidden animate-slide-in-right">
            <div className="bg-gray-900/80 p-3 border-b border-gray-700 flex items-center gap-2">
                <BellIcon className="h-5 w-5 text-cyan-400 animate-pulse" />
                <h3 className="font-bold text-white">Active Reminders</h3>
            </div>
            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                {reminders.map(reminder => (
                    <div key={reminder.id} className="bg-gray-700/50 rounded-md p-3 border-l-4 border-cyan-400">
                        <p className="font-medium text-white mb-1">{reminder.text}</p>
                        <p className="text-xs text-gray-400 mb-3">Due: {new Date(reminder.dueDate).toLocaleDateString()}</p>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => onSnooze(reminder.id)} 
                                className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-gray-600 hover:bg-gray-500 rounded text-xs font-medium text-white transition-colors"
                            >
                                <SnoozeIcon className="h-3 w-3" /> Snooze 1h
                            </button>
                            <button 
                                onClick={() => onDismiss(reminder.id)} 
                                className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-cyan-600 hover:bg-cyan-500 rounded text-xs font-medium text-white transition-colors"
                            >
                                <CheckCircleIcon className="h-3 w-3" /> Dismiss
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [timetable, setTimetable] = useState<TimetableData>({});
  const [settings, setSettings] = useState<ReminderSettings>({ soundEnabled: true, soundType: 'beep', emailEnabled: false, emailAddress: '' });
  const [activeAlerts, setActiveAlerts] = useState<Reminder[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const [storedReminders, storedTimetable, storedSettings] = await Promise.all([
        db.getReminders(user),
        db.getTimetable(),
        db.getReminderSettings(user)
      ]);
      setReminders(storedReminders);
      setTimetable(storedTimetable);
      setSettings(storedSettings);
      setIsLoading(false);
    };
    loadData();
  }, [user]);

  const playNotificationSound = useCallback((type: string) => {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        const now = ctx.currentTime;
        
        if (type === 'chime') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(500, now);
            osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
            gain.gain.setValueAtTime(0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
        } else if (type === 'alert') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.linearRampToValueAtTime(150, now + 0.3);
            gain.gain.setValueAtTime(0.3, now);
            osc.start(now);
            osc.stop(now + 0.3);
            
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.type = 'sawtooth';
            osc2.frequency.setValueAtTime(200, now + 0.4);
            gain2.gain.setValueAtTime(0.3, now + 0.4);
            osc2.start(now + 0.4);
            osc2.stop(now + 0.7);
        } else {
            // Beep
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            gain.gain.setValueAtTime(0.1, now);
            osc.start(now);
            osc.stop(now + 0.2);
        }
    } catch (e) {
        console.error("Audio playback failed", e);
    }
  }, []);

  // Notification Loop
  useEffect(() => {
    const checkReminders = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); 
      const now = Date.now();

      const alertsToTrigger: Reminder[] = [];
      let updated = false;

      const updatedReminders = reminders.map(r => {
          const dueDate = new Date(r.dueDate);
          const dueDateUTC = new Date(Date.UTC(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()));
          const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
          const isDueToday = dueDateUTC.getTime() === todayUTC.getTime();
          
          const snoozeExpired = r.snoozedUntil && now >= r.snoozedUntil;

          if ((isDueToday && !r.notified) || snoozeExpired) {
              alertsToTrigger.push(r);
              updated = true;
              // Mark as notified or clear snooze
              return { ...r, notified: true, snoozedUntil: undefined };
          }
          return r;
      });

      if (updated) {
          setReminders(updatedReminders);
          await db.saveReminders(user, updatedReminders);
      }

      if (alertsToTrigger.length > 0) {
          // 1. Visual Toast
          setActiveAlerts(prev => [...prev, ...alertsToTrigger]);
          
          // 2. Audio
          if (settings.soundEnabled) {
              playNotificationSound(settings.soundType);
          }

          // 3. System Notification
          if (Notification.permission === 'granted') {
             alertsToTrigger.forEach(r => {
                 new Notification('AcadEase Reminder', { body: `Due: ${r.text}` });
             });
          } else if (Notification.permission !== 'denied') {
              Notification.requestPermission();
          }

          // 4. Email (Simulated)
          if (settings.emailEnabled && settings.emailAddress) {
              alertsToTrigger.forEach(r => {
                  // Simulate email sending
                  console.log(`[Simulated Email] Sending email to ${settings.emailAddress} for reminder: ${r.text}`);
                  if (Notification.permission === 'granted') {
                      new Notification('AcadEase Email Sent', { body: `Notification sent to ${settings.emailAddress}`});
                  }
              });
          }
      }
    };

    const intervalId = setInterval(checkReminders, 60000); // Check every minute
    checkReminders(); // Check immediately

    return () => clearInterval(intervalId);
  }, [reminders, user, settings, playNotificationSound]);


  const addReminder = async (text: string, dueDate: string) => {
    const newReminder: Reminder = {
      id: Date.now(),
      text,
      dueDate,
    };
    const updatedReminders = [...reminders, newReminder];
    setReminders(updatedReminders);
    await db.saveReminders(user, updatedReminders);
  };

  const deleteReminder = async (id: number) => {
    const updatedReminders = reminders.filter(r => r.id !== id);
    setReminders(updatedReminders);
    setActiveAlerts(prev => prev.filter(a => a.id !== id));
    await db.saveReminders(user, updatedReminders);
  };

  const handleUpdateSettings = async (newSettings: ReminderSettings) => {
      setSettings(newSettings);
      await db.saveReminderSettings(user, newSettings);
  };

  const handleDismissAlert = (id: number) => {
      setActiveAlerts(prev => prev.filter(a => a.id !== id));
  };

  const handleSnoozeAlert = async (id: number) => {
      // Snooze for 1 hour (3600000 ms)
      const snoozeDuration = 3600000; 
      const updatedReminders = reminders.map(r => 
          r.id === id ? { ...r, snoozedUntil: Date.now() + snoozeDuration } : r
      );
      setReminders(updatedReminders);
      await db.saveReminders(user, updatedReminders);
      setActiveAlerts(prev => prev.filter(a => a.id !== id));
  };

  const addTimetableEntry = async (entry: Omit<TimetableEntry, 'id'>, branch: string, year: string, semester: string) => {
    const key = `${branch}-${year}-${semester}`;
    const newEntry: TimetableEntry = { ...entry, id: Date.now() };
    const groupEntries = timetable[key] || [];
    const updatedTimetable = {
      ...timetable,
      [key]: [...groupEntries, newEntry],
    };
    setTimetable(updatedTimetable);
    await db.saveTimetable(updatedTimetable);
  };

  const updateTimetableEntry = async (updatedEntry: TimetableEntry, branch: string, year: string, semester: string) => {
    const key = `${branch}-${year}-${semester}`;
    const groupEntries = timetable[key] || [];
    const updatedGroupEntries = groupEntries.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry);
    const updatedTimetable = {
      ...timetable,
      [key]: updatedGroupEntries,
    };
    setTimetable(updatedTimetable);
    await db.saveTimetable(updatedTimetable);
  };

  const deleteTimetableEntry = async (id: number, branch: string, year: string, semester: string) => {
    const key = `${branch}-${year}-${semester}`;
    const groupEntries = timetable[key] || [];
    const updatedGroupEntries = groupEntries.filter(entry => entry.id !== id);
    const updatedTimetable = {
      ...timetable,
      [key]: updatedGroupEntries,
    };
    setTimetable(updatedTimetable);
    await db.saveTimetable(updatedTimetable);
  };

  const sidebarContent = (
    <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
            <h2 className="text-xl font-bold">Welcome, {user.name.split(' ')[0]}!</h2>
            {user.role === 'student' && <p className="text-sm text-gray-400">{user.branch} - {user.year} - {user.semester}</p>}
        </div>
        {isLoading ? (
            <div className="flex-grow flex items-center justify-center"><p>Loading data...</p></div>
        ) : (
            <div className="flex-grow overflow-y-auto">
                <ReminderList 
                    reminders={reminders} 
                    settings={settings}
                    onAddReminder={addReminder} 
                    onDeleteReminder={deleteReminder}
                    onUpdateSettings={handleUpdateSettings}
                />
                <div className="px-4"><div className="border-t border-gray-700"></div></div>
                <Timetable 
                    user={user}
                    timetable={timetable}
                    onAdd={addTimetableEntry}
                    onUpdate={updateTimetableEntry}
                    onDelete={deleteTimetableEntry}
                />
            </div>
        )}
        <div className="p-4 border-t border-gray-700 flex-shrink-0">
            <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium bg-red-600/80 hover:bg-red-600 transition-colors"
            >
                <LogoutIcon className="h-5 w-5" />
                Logout
            </button>
        </div>
    </div>
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-800">
        <NotificationToast reminders={activeAlerts} onDismiss={handleDismissAlert} onSnooze={handleSnoozeAlert} />
        
        <header className="flex items-center justify-between p-4 bg-gray-900/70 backdrop-blur-sm border-b border-gray-700 md:hidden">
            <div className="flex items-center gap-2">
                <LogoIcon className="h-8 w-8 text-cyan-400" />
                <span className="font-bold text-lg">AcadEase</span>
            </div>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                {isSidebarOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
        </header>

        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar for large screens */}
            <aside className="hidden md:flex md:flex-col w-80 lg:w-96 bg-gray-900 border-r border-gray-700">
                {sidebarContent}
            </aside>
            
            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col">
                <ChatWindow user={user} />
            </main>

            {/* Mobile Sidebar */}
            {isSidebarOpen && (
                 <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
            )}
            <aside className={`fixed top-0 left-0 h-full w-80 bg-gray-900 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4 flex justify-between items-center border-b border-gray-700">
                    <h2 className="text-lg font-bold">Menu</h2>
                    <button onClick={() => setIsSidebarOpen(false)}>
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </div>
                {sidebarContent}
            </aside>
        </div>
    </div>
  );
};

export default Dashboard;
