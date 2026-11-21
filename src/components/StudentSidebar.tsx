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
  Mic,
  Brain,
  History,
  Compass,
  BookOpenCheck,
  MessageCircleQuestion,
  LifeBuoy,
} from 'lucide-react';

interface StudentSidebarProps {
  onOpenVoice: () => void;
  onOpenArchitecture: () => void;
}

export const StudentSidebar: React.FC<StudentSidebarProps> = ({
  onOpenVoice,
  onOpenArchitecture,
}) => {
  const { activeTab, setActiveTab, profile } = useLearner();

  const activeMisconceptionsCount = profile.misconceptions.filter(
    (m) => m.status === 'active'
  ).length;

  const pendingRevisionCount = profile.revisionSchedule.filter(
    (t) => !t.completed && t.dueDate === 'Today'
  ).length;

  const rescueTriggeredCount = Object.entries(profile.masteryByConcept).filter(
    ([cId, m]) =>
      m.masteryPercentage < 40 || (profile.consecutiveWrongByConcept?.[cId] || 0) >= 3
  ).length;

  const learningModeItems = [
    {
      id: 'teach-back',
      label: 'Teach It Back',
      icon: BookOpenCheck,
      badge: 'Feynman',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'socratic',
      label: 'Socratic Mode',
      icon: MessageCircleQuestion,
      badge: 'Guided',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    {
      id: 'concept-rescue',
      label: 'Concept Rescue',
      icon: LifeBuoy,
      badge: rescueTriggeredCount > 0 ? `${rescueTriggeredCount} alert` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
  ];

  // STRICT STUDENT ONLY NAVIGATION
  const studentNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'intelligence-center',
      label: 'Intelligence Center',
      icon: Brain,
      badge: 'Suite',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    {
      id: 'learning-journey',
      label: 'Learning Journey',
      icon: History,
      badge: `${profile.learningJourney?.length || 0}`,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    {
      id: 'confidence-analysis',
      label: 'Confidence Gap',
      icon: Compass,
    },
    {
      id: 'diagnostic',
      label: 'Diagnostic Test',
      icon: FileCheck2,
      badge: 'Start Here',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'concept-map',
      label: 'Concept Map',
      icon: Network,
    },
    {
      id: 'practice',
      label: 'Adaptive Practice',
      icon: Target,
    },
    {
      id: 'revision',
      label: 'Revision Plan',
      icon: CalendarCheck2,
      badge: pendingRevisionCount > 0 ? `${pendingRevisionCount} due` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'misconceptions',
      label: 'Misconceptions',
      icon: AlertTriangle,
      badge: activeMisconceptionsCount > 0 ? `${activeMisconceptionsCount}` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    {
      id: 'learn',
      label: 'Voice Tutor',
      icon: BookOpen,
    },
    {
      id: 'progress',
      label: 'Progress & Audit',
      icon: TrendingUp,
    },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col border-r border-slate-800 bg-slate-950/60 p-4 justify-between overflow-y-auto custom-scrollbar">
      <div className="space-y-5">
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
            <span>Start Speaking</span>
          </button>
        </div>

        {/* Learning Modes Section */}
        <div className="space-y-1">
          <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
            Learning Modes
          </div>

          <nav className="space-y-0.5">
            {learningModeItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
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
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                        item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Student Navigation Menu */}
        <div className="space-y-1">
          <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">
            Student Learning Path
          </div>

          <nav className="space-y-0.5">
            {studentNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
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
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                        item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Autonomous System Status Footnote */}
      <div className="pt-4 border-t border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Living Model Active</span>
          </span>
          <button
            onClick={onOpenArchitecture}
            className="text-indigo-400 hover:text-indigo-300 text-[10px] font-semibold"
          >
            Specs
          </button>
        </div>
        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/60 text-[10px] text-slate-300">
          Personalized zone of proximal development calibrated for Alex Rivera.
        </div>
      </div>
    </aside>
  );
};
