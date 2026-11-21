import React from 'react';
import { useLearner } from '../context/LearnerContext';
import { TEACHER_CLASS_DATA } from '../data/syllabus';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Grid,
  AlertTriangle,
  BellRing,
  FlaskConical,
  FileText,
  TrendingDown,
  ShieldCheck,
} from 'lucide-react';

interface TeacherSidebarProps {
  onOpenArchitecture: () => void;
}

export const TeacherSidebar: React.FC<TeacherSidebarProps> = ({ onOpenArchitecture }) => {
  const { activeTab, setActiveTab } = useLearner();

  // STRICT TEACHER ONLY NAVIGATION
  const teacherNavItems = [
    {
      id: 'teacher-overview',
      label: 'Teacher Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'teacher-analytics',
      label: 'Class Analytics',
      icon: BarChart3,
    },
    {
      id: 'teacher-students',
      label: 'Student Performance',
      icon: Users,
      badge: `${TEACHER_CLASS_DATA.totalStudents}`,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    {
      id: 'teacher-heatmap',
      label: 'Concept Heatmap',
      icon: Grid,
      badge: 'Matrix',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'teacher-misconceptions',
      label: 'Misconception Insights',
      icon: AlertTriangle,
      badge: '3 Systemic',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    {
      id: 'teacher-alerts',
      label: 'AI Learning Alerts',
      icon: BellRing,
      badge: `${TEACHER_CLASS_DATA.aiLearningAlerts?.length || 4} Live`,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'teacher-labs',
      label: 'Targeted Learning Labs',
      icon: FlaskConical,
    },
    {
      id: 'teacher-reports',
      label: 'Class Reports',
      icon: FileText,
    },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col border-r border-slate-800 bg-slate-950/70 p-4 justify-between">
      <div className="space-y-6">
        {/* Class Overview Pill Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-950/60 via-slate-900 to-slate-900 border border-cyan-500/30 shadow-lg shadow-cyan-950/30">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              Active Cohort
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <h4 className="text-xs font-bold text-white leading-snug">
            {TEACHER_CLASS_DATA.className}
          </h4>
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-center">
            <div className="p-1.5 rounded-lg bg-slate-950/60">
              <div className="text-sm font-mono font-bold text-cyan-300">
                {TEACHER_CLASS_DATA.totalStudents}
              </div>
              <div className="text-[9px] text-slate-400">Enrolled</div>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-950/60">
              <div className="text-sm font-mono font-bold text-emerald-400">
                {TEACHER_CLASS_DATA.averageMastery}%
              </div>
              <div className="text-[9px] text-slate-400">Class Avg</div>
            </div>
          </div>
        </div>

        {/* Teacher Navigation Menu */}
        <div className="space-y-1">
          <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Educator Command Menu
          </div>

          <nav className="space-y-0.5">
            {teacherNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeTab === item.id ||
                (item.id === 'teacher-overview' && activeTab === 'teacher');

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-cyan-400' : 'text-slate-400'
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

      {/* Teacher Interventions Status */}
      <div className="pt-4 border-t border-slate-800/80 space-y-2">
        <div className="p-3 rounded-xl bg-slate-950/80 border border-rose-500/20 space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-rose-400 font-bold text-[11px]">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Priority Intervention</span>
          </div>
          <p className="text-[10px] text-slate-300">
            5 students urgently need support in <strong>Series Circuits</strong> current conservation.
          </p>
          <button
            onClick={() => setActiveTab('teacher-misconceptions')}
            className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold mt-1 inline-block"
          >
            Deploy Remedy &rarr;
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Faculty Mode</span>
          </span>
          <button
            onClick={onOpenArchitecture}
            className="text-cyan-400 hover:text-cyan-300 text-[10px] font-semibold"
          >
            Specs
          </button>
        </div>
      </div>
    </aside>
  );
};
