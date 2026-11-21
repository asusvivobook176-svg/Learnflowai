import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLearner } from '../context/LearnerContext';
import { LogoutConfirmModal } from './LogoutConfirmModal';
import {
  Sparkles,
  Flame,
  Activity,
  Mic,
  RotateCcw,
  GraduationCap,
  LogOut,
  Cpu,
  Brain,
  ChevronDown,
} from 'lucide-react';

interface StudentHeaderProps {
  onOpenVoice: () => void;
  onOpenAgents: () => void;
  onOpenArchitecture: () => void;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({
  onOpenVoice,
  onOpenAgents,
  onOpenArchitecture,
}) => {
  const { user } = useAuth();
  const { profile, resetToDemoAlex, setActiveTab, activeTab } = useLearner();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Brand / Logo */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base lg:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                    LearnFlow AI 2.0
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Student
                  </span>
                </div>
                <p className="hidden md:block text-[11px] text-slate-400 font-medium">
                  Learn Smarter · Understand Deeper
                </p>
              </div>
            </div>
          </div>

          {/* Center Voice & Intelligence Shortcuts */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={onOpenVoice}
              className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-indigo-500/30 text-xs font-medium text-slate-200 hover:text-white shadow-sm hover:border-indigo-400 transition-all group"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
              </span>
              <Mic className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span>Speak with Wispr Flow</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">
                Voice
              </kbd>
            </button>

            {/* AI Agents Monitor */}
            <button
              onClick={onOpenAgents}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-all"
              title="View 5 Autonomous AI Learning Agents"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Agents (5 Active)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </button>

            {/* Intelligence Center Shortcut */}
            <button
              onClick={() => setActiveTab('intelligence-center')}
              className={`hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                activeTab === 'intelligence-center'
                  ? 'bg-purple-600/20 text-purple-300 border-purple-500/50'
                  : 'bg-slate-900/80 hover:bg-purple-950/40 border-slate-800 hover:border-purple-500/40 text-slate-300 hover:text-purple-300'
              }`}
              title="Open LearnFlow Intelligence Center"
            >
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              <span>Intelligence Center</span>
            </button>
          </div>

          {/* Right Section: Streak, Student Profile, and Logout */}
          <div className="flex items-center gap-3">
            {/* Architecture Modal Button */}
            <button
              onClick={onOpenArchitecture}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 text-xs text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
              title="Architecture & 8/8 Judging Verification"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>8/8 Checklist</span>
            </button>

            {/* Streak Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{profile.streakDays}d streak</span>
            </div>

            {/* Student Profile Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all text-left"
              >
                <img
                  src={user?.avatar || profile.avatar}
                  alt={user?.name || profile.name}
                  className="w-7 h-7 rounded-full object-cover border border-indigo-500/40"
                />
                <div className="hidden md:block">
                  <div className="text-xs font-bold text-slate-200 leading-tight">
                    {user?.name || profile.name}
                  </div>
                  <div className="text-[10px] text-indigo-400 font-semibold flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    <span>Student</span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-40 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3.5 py-2 border-b border-slate-800">
                      <div className="font-bold text-white">{user?.name || profile.name}</div>
                      <div className="text-[11px] text-slate-400">{user?.email || 'alex.rivera@learnflow.ai'}</div>
                      <div className="text-[10px] text-indigo-400 mt-1 font-semibold">
                        Mastery: {profile.overallMastery}% • Class 10 Physics
                      </div>
                    </div>

                    <div className="p-1 space-y-0.5">
                      <button
                        onClick={() => {
                          resetToDemoAlex();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                        <span>Reset Alex Demo Data</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setIsLogoutModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-indigo-950/40 text-indigo-300 hover:text-indigo-200 transition-colors"
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Switch Demo Account</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setIsLogoutModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-400" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Direct Logout Button */}
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
              title="Log Out of LearnFlow AI"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
};
