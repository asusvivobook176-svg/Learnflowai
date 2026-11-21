import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LogOut,
  X,
  GraduationCap,
  Users,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({ isOpen, onClose }) => {
  const { user, logout, switchDemoAccount, role } = useAuth();

  if (!isOpen || !user) return null;

  const targetSwitchRole = role === 'student' ? 'teacher' : 'student';

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleSwitchRole = async () => {
    await switchDemoAccount(targetSwitchRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Log Out Confirmation</h3>
              <p className="text-xs text-slate-400">Leave your active session</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-11 h-11 rounded-full object-cover border border-slate-700"
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate">{user.name}</div>
            <div className="text-[11px] text-slate-400 truncate">{user.title}</div>
            <span
              className={`inline-block mt-0.5 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                user.role === 'student'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              }`}
            >
              Active {user.role === 'student' ? 'Student' : 'Teacher'} Role
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Are you sure you want to log out? Your learner profile and test progress remain securely persisted for future logins.
        </p>

        {/* Quick Demo Switcher helper */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Judge &amp; Demo Shortcut
          </div>
          <button
            onClick={handleSwitchRole}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/40 text-xs text-slate-200 hover:text-white transition-all text-left"
          >
            <span className="flex items-center gap-2">
              {targetSwitchRole === 'teacher' ? (
                <Users className="w-4 h-4 text-cyan-400" />
              ) : (
                <GraduationCap className="w-4 h-4 text-indigo-400" />
              )}
              <span>Switch directly to <strong>{targetSwitchRole === 'teacher' ? 'Teacher Demo (Dr. Priya)' : 'Student Demo (Alex)'}</strong></span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Stay Signed In
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Confirm Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
