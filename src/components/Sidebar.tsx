import React from 'react';
import { useLearner } from '../context/LearnerContext';
import {
  LayoutDashboard,
  BookOpen,
  Target,
  Network,
  FileCheck2,
  CalendarCheck2,
  AlertTriangle,
  TrendingUp,
  Users,
  Cpu,
  Mic,
  Brain,
  History,
  Compass,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  onOpenVoice: () => void;
  onOpenArchitecture: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenVoice, onOpenArchitecture }) => {
  const { activeTab, setActiveTab, role, setRole, profile } = useLearner();

  const activeMisconceptionsCount = profile.misconceptions.filter(
    (m) => m.status === 'active'
  ).length;

  const pendingRevisionCount = profile.revisionSchedule.filter(
    (t) => !t.completed && t.dueDate === 'Today'
  ).length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['student'],
    },
    {
      id: 'intelligence-center',
      label: 'Intelligence Center',
      icon: Brain,
      badge: 'Suite',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      roles: ['student'],
    },
    {
      id: 'learning-journey',
      label: 'Learning Journey',
      icon: History,
      badge: `${profile.learningJourney?.length || 0}`,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      roles: ['student'],
    },
    {
      id: 'confidence-analysis',
      label: 'Confidence Gap',
      icon: Compass,
      roles: ['student'],
    },
    {
      id: 'diagnostic',
      label: 'Diagnostic Test',
      icon: FileCheck2,
      badge: 'Start Here',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      roles: ['student'],
    },
    {
      id: 'concept-map',
      label: 'Concept Map',
      icon: Network,
      roles: ['student', 'teacher'],
    },
    {
      id: 'practice',
      label: 'Adaptive Practice',
      icon: Target,
      roles: ['student'],
    },
    {
      id: 'revision',
      label: 'Revision Plan',
      icon: CalendarCheck2,
      badge: pendingRevisionCount > 0 ? `${pendingRevisionCount} due` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      roles: ['student'],
    },
    {
      id: 'misconceptions',
      label: 'Misconceptions',
      icon: AlertTriangle,
      badge: activeMisconceptionsCount > 0 ? `${activeMisconceptionsCount}` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      roles: ['student', 'teacher'],
    },
    {
      id: 'learn',
      label: 'Voice Tutor',
      icon: BookOpen,
      roles: ['student'],
    },
    {
      id: 'progress',
      label: 'Progress & Audit',
      icon: TrendingUp,
      roles: ['student'],
    },
    {
      id: 'teacher',
      label: 'Teacher Dashboard',
      icon: Users,
      roles: ['teacher', 'student'],
      highlight: role === 'teacher',
    },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col border-r border-slate-800 bg-slate-950/60 p-4 justify-between">
      <div className="space-y-6">
        {/* Voice Trigger Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 shadow-lg shadow-indigo-950/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 rounded-full bg-indigo-500/10 blur-xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
              <Mic className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-bold text-slate-200">Wispr Flow Ready</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-2.5 leading-relaxed">
            Speak naturally with hesitations and incomplete thoughts. AI converts it into structured learning.
          </p>
          <button
            onClick={onOpenVoice}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Open Voice Input</span>
          </button>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'teacher') {
                    setRole('teacher');
                  } else if (role === 'teacher') {
                    setRole('student');
                  }
                  setActiveTab(item.id);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-indigo-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Specs */}
      <div className="pt-4 border-t border-slate-800 space-y-2">
        <button
          onClick={onOpenArchitecture}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-indigo-300 hover:bg-slate-900 transition-all cursor-pointer"
        >
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span>Agent Architecture & Specs</span>
        </button>

        <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400">
          <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
            <span>Syllabus</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-900/40 text-indigo-300 border border-indigo-700/40">
              CBSE Class 10
            </span>
          </div>
          <div className="text-slate-400 text-[10px]">Physics: Electricity (7 Concepts)</div>
        </div>
      </div>
    </aside>
  );
};
