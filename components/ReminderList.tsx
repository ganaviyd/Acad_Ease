
import React, { useState } from 'react';
import { Reminder, ReminderSettings } from '../types';
import { PlusIcon, TrashIcon, CalendarIcon, SettingsIcon, VolumeIcon, MailIcon, CloseIcon } from './Icons';

interface ReminderListProps {
  reminders: Reminder[];
  settings: ReminderSettings;
  onAddReminder: (text: string, dueDate: string) => void;
  onDeleteReminder: (id: number) => void;
  onUpdateSettings: (settings: ReminderSettings) => void;
}

const ReminderItem: React.FC<{ reminder: Reminder; onDelete: (id: number) => void }> = ({ reminder, onDelete }) => {
    const due = new Date(reminder.dueDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    const dueZero = new Date(due);
    dueZero.setHours(0,0,0,0);

    const isOverdue = dueZero < today;
    const isToday = dueZero.getTime() === today.getTime();

    let statusClass = "border-gray-700 hover:bg-gray-700/50";
    let dateColor = "text-gray-400";
    
    if (isOverdue) {
        statusClass = "border-red-500/50 bg-red-900/10 hover:bg-red-900/20";
        dateColor = "text-red-400 font-bold";
    } else if (isToday) {
        statusClass = "border-yellow-500/50 bg-yellow-900/10 hover:bg-yellow-900/20";
        dateColor = "text-yellow-400 font-bold";
    }

    return (
        <div className={`flex items-start justify-between p-3 rounded-lg border transition-colors ${statusClass}`}>
            <div className="flex-1">
                <p className="text-sm font-medium text-white">{reminder.text}</p>
                <div className={`text-xs mt-1 flex items-center gap-1.5 ${dateColor}`}>
                    <CalendarIcon className="h-3 w-3" />
                    <span>{isOverdue ? 'Overdue: ' : isToday ? 'Due Today: ' : 'Due: '} {due.toLocaleDateString()}</span>
                    {reminder.snoozedUntil && reminder.snoozedUntil > Date.now() && (
                        <span className="ml-2 text-cyan-400 bg-cyan-900/30 px-1.5 rounded">Snoozed</span>
                    )}
                </div>
            </div>
            <button onClick={() => onDelete(reminder.id)} className="ml-4 p-1 text-gray-500 hover:text-red-400 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500">
                <TrashIcon className="h-4 w-4" />
            </button>
        </div>
    );
};

const SettingsModal: React.FC<{ 
    settings: ReminderSettings; 
    onClose: () => void; 
    onSave: (s: ReminderSettings) => void; 
}> = ({ settings, onClose, onSave }) => {
    const [localSettings, setLocalSettings] = useState(settings);

    const handleChange = (key: keyof ReminderSettings, value: any) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        onSave(localSettings);
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <SettingsIcon className="h-5 w-5 text-cyan-400" />
                        Notification Settings
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Sound Settings */}
                    <div className="bg-gray-700/30 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                            <label className="flex items-center gap-2 text-sm font-medium text-white">
                                <VolumeIcon className="h-4 w-4 text-cyan-400" />
                                Sound Notifications
                            </label>
                            <input 
                                type="checkbox" 
                                checked={localSettings.soundEnabled}
                                onChange={(e) => handleChange('soundEnabled', e.target.checked)}
                                className="h-5 w-5 rounded border-gray-600 text-cyan-500 focus:ring-cyan-500 bg-gray-700"
                            />
                        </div>
                        {localSettings.soundEnabled && (
                            <select 
                                value={localSettings.soundType}
                                onChange={(e) => handleChange('soundType', e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            >
                                <option value="beep">Simple Beep</option>
                                <option value="chime">Soft Chime</option>
                                <option value="alert">Urgent Alert</option>
                            </select>
                        )}
                    </div>

                    {/* Email Settings */}
                    <div className="bg-gray-700/30 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                            <label className="flex items-center gap-2 text-sm font-medium text-white">
                                <MailIcon className="h-4 w-4 text-cyan-400" />
                                Email Notifications
                            </label>
                            <input 
                                type="checkbox" 
                                checked={localSettings.emailEnabled}
                                onChange={(e) => handleChange('emailEnabled', e.target.checked)}
                                className="h-5 w-5 rounded border-gray-600 text-cyan-500 focus:ring-cyan-500 bg-gray-700"
                            />
                        </div>
                        {localSettings.emailEnabled && (
                            <input 
                                type="email" 
                                value={localSettings.emailAddress}
                                onChange={(e) => handleChange('emailAddress', e.target.value)}
                                placeholder="Enter email address"
                                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            />
                        )}
                        <p className="text-xs text-gray-500 mt-2 italic">Note: In this demo, emails are simulated via browser notifications.</p>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button 
                        onClick={handleSave} 
                        className="bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold py-2 px-6 rounded-md transition-colors"
                    >
                        Save Preferences
                    </button>
                </div>
            </div>
        </div>
    );
};

const ReminderList: React.FC<ReminderListProps> = ({ reminders, settings, onAddReminder, onDeleteReminder, onUpdateSettings }) => {
  const [text, setText] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && dueDate) {
      onAddReminder(text, dueDate);
      setText('');
      setDueDate('');
    }
  };

  return (
    <div className="p-4 h-full flex flex-col relative">
      <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Assignment Reminders</h3>
          <button onClick={() => setShowSettings(true)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
              <SettingsIcon className="h-5 w-5" />
          </button>
      </div>
      
      {showSettings && (
          <SettingsModal settings={settings} onClose={() => setShowSettings(false)} onSave={onUpdateSettings} />
      )}

      <form onSubmit={handleSubmit} className="mb-4 space-y-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="New assignment..."
          className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
        />
        <button type="submit" className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-bold bg-cyan-500 text-gray-900 hover:bg-cyan-400 transition-colors">
            <PlusIcon className="h-4 w-4" />
            Add Reminder
        </button>
      </form>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {reminders.length > 0 ? (
          reminders.sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map(r => <ReminderItem key={r.id} reminder={r} onDelete={onDeleteReminder} />)
        ) : (
          <p className="text-center text-sm text-gray-400 pt-8">No reminders set.</p>
        )}
      </div>
    </div>
  );
};

export default ReminderList;
