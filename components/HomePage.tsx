import React, { useState } from 'react';
import { User } from '../types';
import { LogoIcon, BotIcon } from './Icons';

interface HomePageProps {
  onLogin: (user: User) => void;
}

const branches = ["Computer Science", "Mechanical Engineering", "Electrical Engineering", "Civil Engineering", "Biotechnology"];
const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const semesters = ["1st Sem", "2nd Sem", "3rd Sem", "4th Sem", "5th Sem", "6th Sem", "7th Sem", "8th Sem"];

const HomePage: React.FC<HomePageProps> = ({ onLogin }) => {
  const [loginMode, setLoginMode] = useState<'student' | 'admin'>('student');
  
  // Student form state
  const [name, setName] = useState('');
  const [branch, setBranch] = useState(branches[0]);
  const [year, setYear] = useState(years[0]);
  const [semester, setSemester] = useState(semesters[0]);

  // Admin form state
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [error, setError] = useState('');

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    setError('');
    onLogin({ name, branch, year, semester, role: 'student' });
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would be a secure API call.
    if (adminUsername.trim().toLowerCase() === 'admin' && adminPassword.trim() === 'admin123') {
      setError('');
      onLogin({ name: 'Admin', role: 'admin', branch: '', year: '', semester: '' });
    } else {
      setError('Invalid admin credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-gray-700/[0.2] bg-[size:20px_20px]"></div>
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-gray-900 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <LogoIcon className="h-16 w-16 text-cyan-400" />
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
            AcadEase
          </h1>
        </div>
        <p className="mt-4 text-xl md:text-2xl text-gray-300 max-w-2xl">
          Your Personal AI Assistant for Academic Excellence. Get instant answers, resource recommendations, and stay on top of your deadlines.
        </p>
      </div>

      <div className="relative z-10 w-full max-w-md mt-12 bg-gray-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-2xl p-8 shadow-2xl shadow-cyan-500/10">
        <div className="flex border-b border-gray-700 mb-6">
            <button onClick={() => { setLoginMode('student'); setError(''); }} className={`flex-1 font-medium py-2 transition-colors ${loginMode === 'student' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}>
                Student
            </button>
            <button onClick={() => { setLoginMode('admin'); setError(''); }} className={`flex-1 font-medium py-2 transition-colors ${loginMode === 'admin' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}>
                Admin
            </button>
        </div>
        
        {loginMode === 'student' ? (
             <form onSubmit={handleStudentSubmit} className="space-y-6">
                <div className="text-center mb-8 -mt-2">
                    <h2 className="text-xl font-bold text-white">Student Login</h2>
                    <p className="text-gray-400 text-sm">Tell us about yourself to begin.</p>
                </div>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300">Full Name</label>
                    <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="e.g., Ada Lovelace"/>
                </div>
                <div>
                    <label htmlFor="branch" className="block text-sm font-medium text-gray-300">Branch</label>
                    <select id="branch" value={branch} onChange={(e) => setBranch(e.target.value)} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                        {branches.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-300">Year</label>
                    <select id="year" value={year} onChange={(e) => setYear(e.target.value)} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="semester" className="block text-sm font-medium text-gray-300">Semester</label>
                    <select id="semester" value={semester} onChange={(e) => setSemester(e.target.value)} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                        {semesters.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-gray-900 bg-cyan-400 hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-all duration-300">Start Assisting</button>
            </form>
        ) : (
             <form onSubmit={handleAdminSubmit} className="space-y-6">
                <div className="text-center mb-8 -mt-2">
                    <h2 className="text-xl font-bold text-white">Admin Login</h2>
                    <p className="text-gray-400 text-sm">Access the management panel.</p>
                </div>
                 <div>
                    <label htmlFor="admin-username" className="block text-sm font-medium text-gray-300">Username</label>
                    <input id="admin-username" type="text" value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="admin"/>
                </div>
                <div>
                    <label htmlFor="admin-password" className="block text-sm font-medium text-gray-300">Password</label>
                    <input id="admin-password" type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="admin123"/>
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-gray-900 bg-cyan-400 hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-all duration-300">Login</button>
             </form>
        )}
      </div>
    </div>
  );
};

export default HomePage;