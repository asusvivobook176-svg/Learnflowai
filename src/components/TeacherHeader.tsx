import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLearner } from '../context/LearnerContext';
import { TEACHER_CLASS_DATA } from '../data/syllabus';
import { LogoutConfirmModal } from './LogoutConfirmModal';
import {
  Sparkles,
  Users,
  BarChart3,
  LogOut,
  Cpu,
  ChevronDown,
  Layers,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';

interface TeacherHeaderProps {
  onOpenArchitecture: () => void;
}

export const TeacherHeader: React.FC<TeacherHeaderProps> = ({ onOpenArchitecture }) => {
  const { user } = useAuth();
  const { setActiveTab } = useLearner();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <>
      <header className="no-print sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Brand & Class Identity */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => setActiveTab('teacher-overview')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-indigo-500 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base lg:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent">
                    LearnFlow AI 2.0
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
                    Teacher Command Center
                  </span>
                </div>
                <p className="hidden md:block text-[11px] text-slate-300 font-medium">
                  Classroom Learning Intelligence &amp; Intervention System
                </p>
              </div>
            </div>
          </div>

          {/* Center Class Selector & Cohort Pulse */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-semibold text-white">{TEACHER_CLASS_DATA.className}</span>
              <span className="text-slate-400">•</span>
              <span className="text-cyan-300">{TEACHER_CLASS_DATA.totalStudents} Students Enrolled</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Avg Mastery: </span>
              <strong className="text-emerald-400 font-mono">{TEACHER_CLASS_DATA.averageMastery}%</strong>
            </div>
          </div>

          {/* Right Section: Teacher Profile & Logout */}
          <div className="flex items-center gap-3">
            {/* Architecture Modal Button */}
            <button
              onClick={onOpenArchitecture}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 text-xs text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
              title="Architecture & 8/8 Judging Verification"
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>8/8 Checklist</span>
            </button>

            {/* Profile Menu Trigger */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all text-left"
              >
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'}
                  alt={user?.name || 'Dr. Priya Sharma'}
                  className="w-7 h-7 rounded-full object-cover border border-cyan-500/40"
                />
                <div className="hidden md:block">
                  <div className="text-xs font-bold text-slate-200 leading-tight">
                    {user?.name || 'Dr. Priya Sharma'}
                  </div>
                  <div className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>Faculty / Teacher</span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
              </button>

              {/* Teacher Dropdown Menu */}
              {isProfileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-40 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3.5 py-2 border-b border-slate-800">
                      <div className="font-bold text-white">{user?.name || 'Dr. Priya Sharma'}</div>
                      <div className="text-[11px] text-slate-400">{user?.email || 'dr.priya.sharma@learnflow.ai'}</div>
                      <div className="text-[10px] text-cyan-400 mt-1 font-semibold">
                        Senior Physics Faculty • Head of Science
                      </div>
                    </div>

                    <div className="p-1 space-y-0.5">
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setIsLogoutModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-cyan-950/40 text-cyan-300 hover:text-cyan-200 transition-colors"
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
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
