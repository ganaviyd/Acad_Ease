import React, { useState } from 'react';
import { User, TimetableEntry, TimetableData } from '../types';
import { PlusIcon, TrashIcon, ClockIcon, EditIcon } from './Icons';

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const branches = ["Computer Science", "Mechanical Engineering", "Electrical Engineering", "Civil Engineering", "Biotechnology"];
const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const semesters = ["1st Sem", "2nd Sem", "3rd Sem", "4th Sem", "5th Sem", "6th Sem", "7th Sem", "8th Sem"];
const initialFormState = { day: daysOfWeek[0], subject: '', startTime: '', endTime: '' };

interface TimetableProps {
  user: User;
  timetable: TimetableData;
  onAdd: (entry: Omit<TimetableEntry, 'id'>, branch: string, year: string, semester: string) => void;
  onUpdate: (entry: TimetableEntry, branch: string, year: string, semester: string) => void;
  onDelete: (id: number, branch: string, year: string, semester: string) => void;
}

const AdminTimetableManager: React.FC<Omit<TimetableProps, 'user'>> = ({ timetable, onAdd, onUpdate, onDelete }) => {
  const [formState, setFormState] = useState(initialFormState);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedBranch, setSelectedBranch] = useState(branches[0]);
  const [selectedYear, setSelectedYear] = useState(years[0]);
  const [selectedSemester, setSelectedSemester] = useState(semesters[0]);
  
  const compositeKey = `${selectedBranch}-${selectedYear}-${selectedSemester}`;
  const currentTimetable = timetable[compositeKey] || [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.subject || !formState.startTime || !formState.endTime) return;
    
    if (editingId) {
      onUpdate({ ...formState, id: editingId }, selectedBranch, selectedYear, selectedSemester);
    } else {
      onAdd(formState, selectedBranch, selectedYear, selectedSemester);
    }
    setFormState(initialFormState);
    setEditingId(null);
  };

  const handleEdit = (entry: TimetableEntry) => {
    setEditingId(entry.id);
    setFormState({ day: entry.day, subject: entry.subject, startTime: entry.startTime, endTime: entry.endTime });
  };
  
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormState(initialFormState);
  };
  
  const handleSelectionChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLSelectElement>) => {
      setter(e.target.value);
      handleCancelEdit(); // Reset form when switching selection
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-3 bg-gray-800 rounded-lg mb-4 space-y-2">
        <label className="block text-sm font-medium text-gray-300">Manage Timetable for</label>
        <select value={selectedBranch} onChange={handleSelectionChange(setSelectedBranch)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500">
          {branches.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={selectedYear} onChange={handleSelectionChange(setSelectedYear)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500">
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={selectedSemester} onChange={handleSelectionChange(setSelectedSemester)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500">
          {semesters.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <form onSubmit={handleSubmit} className="mb-4 space-y-3 p-3 bg-gray-800 rounded-lg">
        <h4 className="text-md font-semibold text-white">{editingId ? 'Edit Entry' : 'Add New Entry'}</h4>
        <input type="text" name="subject" value={formState.subject} onChange={handleInputChange} placeholder="Subject Name" className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500" />
        <select name="day" value={formState.day} onChange={handleInputChange} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500">
          {daysOfWeek.map(day => <option key={day} value={day}>{day}</option>)}
        </select>
        <div className="flex gap-2">
            <input type="time" name="startTime" value={formState.startTime} onChange={handleInputChange} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500" />
            <input type="time" name="endTime" value={formState.endTime} onChange={handleInputChange} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500" />
        </div>
        <div className="flex gap-2">
            <button type="submit" className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-bold bg-cyan-500 text-gray-900 hover:bg-cyan-400 transition-colors">
                <PlusIcon className="h-4 w-4" />
                {editingId ? 'Update Entry' : 'Add Entry'}
            </button>
            {editingId && <button type="button" onClick={handleCancelEdit} className="w-full py-2 px-4 rounded-md text-sm font-bold bg-gray-600 text-white hover:bg-gray-500 transition-colors">Cancel</button>}
        </div>
      </form>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {daysOfWeek.map(day => {
          const entriesForDay = currentTimetable.filter(e => e.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
          if (entriesForDay.length === 0) return null;
          return (
            <div key={day}>
              <h5 className="font-bold text-cyan-400 mb-2">{day}</h5>
              <div className="space-y-2">
                {entriesForDay.map(entry => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">{entry.subject}</p>
                      <p className="text-xs text-gray-400">{entry.startTime} - {entry.endTime}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(entry)} className="p-1 text-gray-500 hover:text-cyan-400"><EditIcon className="h-4 w-4" /></button>
                      <button onClick={() => onDelete(entry.id, selectedBranch, selectedYear, selectedSemester)} className="p-1 text-gray-500 hover:text-red-400"><TrashIcon className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
         {currentTimetable.length === 0 && <p className="text-center text-sm text-gray-400 pt-8">No timetable entries for this selection.</p>}
      </div>
    </div>
  );
};

const StudentTimetableView: React.FC<{ timetable: TimetableEntry[] }> = ({ timetable }) => {
  const todayIndex = new Date().getDay(); // Sunday: 0, Monday: 1, ...
  const adjustedTodayIndex = todayIndex === 0 ? 6 : todayIndex - 1; // Monday: 0, ..., Sunday: 6
  const [selectedDay, setSelectedDay] = useState(daysOfWeek[adjustedTodayIndex]);

  const filteredEntries = timetable
    .filter(entry => entry.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="flex flex-col flex-1">
      <div className="flex justify-between mb-4 border-b border-gray-700">
        {daysOfWeek.slice(0, 5).map(day => ( // Show Mon-Fri primarily
          <button 
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`flex-1 text-sm font-bold py-2 ${selectedDay === day ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}
          >
            {day.substring(0, 3)}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filteredEntries.length > 0 ? (
          filteredEntries.map(entry => (
            <div key={entry.id} className="p-3 bg-gray-800 rounded-lg">
              <p className="font-medium text-white">{entry.subject}</p>
              <p className="text-xs text-cyan-400 mt-1">{entry.startTime} - {entry.endTime}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-sm text-gray-400 pt-8">No classes scheduled for {selectedDay}.</p>
        )}
      </div>
    </div>
  );
};

const Timetable: React.FC<TimetableProps> = ({ user, timetable, onAdd, onUpdate, onDelete }) => {
  const studentTimetableKey = user.role === 'student' 
    ? `${user.branch}-${user.year}-${user.semester}` 
    : '';
  const studentTimetable = timetable[studentTimetableKey] || [];
  
  return (
    <div className="p-4 pt-2 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <ClockIcon className="h-5 w-5 text-cyan-400"/>
        <h3 className="text-lg font-bold text-white">Class Timetable</h3>
      </div>
      {user.role === 'admin' ? (
        <AdminTimetableManager timetable={timetable} onAdd={onAdd} onUpdate={onUpdate} onDelete={onDelete} />
      ) : (
        <StudentTimetableView timetable={studentTimetable} />
      )}
    </div>
  );
};

export default Timetable;
