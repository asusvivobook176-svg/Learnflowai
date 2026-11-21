import React from 'react';
import { useLearner } from '../context/LearnerContext';
import {
  Sparkles,
  Flame,
  Activity,
  Mic,
  RotateCcw,
  GraduationCap,
  Users,
  Cpu,
  Brain,
} from 'lucide-react';

interface NavbarProps {
  onOpenVoice: () => void;
  onOpenAgents: () => void;
  onOpenArchitecture: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenVoice,
  onOpenAgents,
  onOpenArchitecture,
}) => {
  const { role, setRole, profile, resetToDemoAlex, agentLogs, setActiveTab } = useLearner();

  return (
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
                  LearnFlow AI
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Wispr Flow
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-400 font-medium">
                Voice-Powered Adaptive Exam-Prep Tutor
              </p>
            </div>
          </div>
        </div>

        {/* Center / Quick Voice Trigger */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={onOpenVoice}
            className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-indigo-500/30 text-xs font-medium text-slate-200 hover:text-white shadow-sm hover:border-indigo-400 transition-all group"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <Mic className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span>Speak with Wispr Flow</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">
              Voice
            </kbd>
          </button>

          {/* AI Agents Monitor Button */}
          <button
            onClick={onOpenAgents}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-all"
            title="View 5 Autonomous AI Learning Agents"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Agents (5 Active)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </button>

          {/* Intelligence Center Shortcut */}
          <button
            onClick={() => setActiveTab('intelligence-center')}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/40 text-xs font-medium text-slate-300 hover:text-purple-300 transition-all"
            title="Open LearnFlow Intelligence Center"
          >
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span>Intelligence Center</span>
            <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-purple-500/20 text-purple-300">
              New
            </span>
          </button>
        </div>

        {/* Right Actions: Role Switcher & Profile */}
        <div className="flex items-center gap-3">
          {/* Architecture / Docs Modal Button */}
          <button
            onClick={onOpenArchitecture}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 text-xs text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all"
            title="Architecture & Learner Model Specs"
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Architecture</span>
          </button>

          {/* Role Toggle Switch */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => {
                setRole('student');
                setActiveTab('dashboard');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                role === 'student'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student</span>
            </button>
            <button
              onClick={() => {
                setRole('teacher');
                setActiveTab('teacher');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                role === 'teacher'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Teacher</span>
            </button>
          </div>

          {/* Student Status & Reset */}
          {role === 'student' && (
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{profile.streakDays}d streak</span>
              </div>

              <div className="flex items-center gap-2">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-8 h-8 rounded-full object-cover border border-indigo-500/40"
                />
                <div className="hidden xl:block text-left">
                  <div className="text-xs font-bold text-slate-200 leading-tight">
                    {profile.name}
                  </div>
                  <div className="text-[10px] text-slate-400">Mastery: {profile.overallMastery}%</div>
                </div>
              </div>

              <button
                onClick={resetToDemoAlex}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
                title="Reset to Demo State (Alex Rivera)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
