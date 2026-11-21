import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types/learning';
import { DEMO_STUDENT_USER, DEMO_TEACHER_USER } from '../data/syllabus';
import {
  Sparkles,
  GraduationCap,
  Users,
  ArrowRight,
  Mic,
  Brain,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Flame,
  Award,
  Layers,
  Zap,
  Info,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [selectedRoleTab, setSelectedRoleTab] = useState<Role>('student');
  const [customName, setCustomName] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [loadingRole, setLoadingRole] = useState<Role | null>(null);

  const handleLogin = async (role: Role, nameToUse?: string) => {
    setLoadingRole(role);
    try {
      await login(role, nameToUse && nameToUse.trim() ? nameToUse.trim() : undefined);
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 -mt-32 w-96 h-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 -mb-32 w-96 h-96 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-72 h-72 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  LearnFlow AI 2.0
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
                  Wispr Flow
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Adaptive AI-Powered Exam-Prep Tutor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-slate-400 hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Class 10 Physics Syllabus Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Hero */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col items-center justify-center">
        {/* Title & Tagline Banner */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-inner">
            <Brain className="w-3.5 h-3.5 text-indigo-400" />
            <span>Intelligent Learner Model • Learn Smarter. Understand Deeper. Improve Continuously.</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Adaptive AI-Powered{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
              Exam-Prep Tutor
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 font-medium italic">
            "Learn Smarter. Understand Deeper. Improve Continuously."
          </p>

          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Choose your role to access your dedicated workspace. Experience personalized unscripted voice tutoring or class-wide learning intelligence.
          </p>
        </div>

        {/* Demo Fast-Track Cards Grid */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 1. STUDENT DEMO CARD */}
          <div
            className={`rounded-3xl border transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between relative group ${
              selectedRoleTab === 'student'
                ? 'bg-gradient-to-b from-slate-900/90 to-indigo-950/40 border-indigo-500/60 shadow-xl shadow-indigo-950/40'
                : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
            }`}
            onClick={() => setSelectedRoleTab('student')}
          >
            <div className="space-y-5">
              {/* Card Header Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-md">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                      Role 1 • Learner
                    </span>
                    <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                      Continue as Student
                    </h3>
                  </div>
                </div>

                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  Adaptive
                </span>
              </div>

              {/* Demo Account Info Box */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    🎓 Student Demo Account
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    5d Streak
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={DEMO_STUDENT_USER.avatar}
                    alt={DEMO_STUDENT_USER.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/40 shadow-sm"
                  />
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-1.5">
                      {DEMO_STUDENT_USER.name}
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="text-[11px] text-slate-400">{DEMO_STUDENT_USER.title}</div>
                    <div className="text-[10px] text-indigo-300 font-medium">
                      Class 10 Physics • 62% Mastery
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 italic border-t border-slate-900 pt-2">
                  "Explore a personalized AI learning journey with Wispr Flow voice tutoring and living memory."
                </p>
              </div>

              {/* Student Features List */}
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Unscripted voice doubt-clearing with <strong>Wispr Flow</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span><strong>Intelligence Center</strong> &amp; Learning Memory Timeline</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span><strong>Confidence Gap Analysis</strong> &amp; Metacognitive Calibration</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Adaptive practice drills &amp; Ebbinghaus spaced revision</span>
                </li>
              </ul>
            </div>

            {/* Action CTA Button */}
            <div className="pt-6 mt-2 border-t border-slate-800/60">
              <button
                onClick={() => handleLogin('student')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all cursor-pointer group-hover:scale-[1.01]"
              >
                {isLoading && loadingRole === 'student' ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Entering Student Experience...
                  </span>
                ) : (
                  <>
                    <span>Enter Student Demo</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 2. TEACHER DEMO CARD */}
          <div
            className={`rounded-3xl border transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between relative group ${
              selectedRoleTab === 'teacher'
                ? 'bg-gradient-to-b from-slate-900/90 to-cyan-950/40 border-cyan-500/60 shadow-xl shadow-cyan-950/40'
                : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
            }`}
            onClick={() => setSelectedRoleTab('teacher')}
          >
            <div className="space-y-5">
              {/* Card Header Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-md">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                      Role 2 • Educator
                    </span>
                    <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                      Continue as Teacher
                    </h3>
                  </div>
                </div>

                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  Command Center
                </span>
              </div>

              {/* Demo Account Info Box */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    👩‍🏫 Teacher Demo Account
                  </span>
                  <span className="text-[10px] font-semibold text-cyan-400 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    28 Students
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={DEMO_TEACHER_USER.avatar}
                    alt={DEMO_TEACHER_USER.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-cyan-500/40 shadow-sm"
                  />
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-1.5">
                      {DEMO_TEACHER_USER.name}
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    </div>
                    <div className="text-[11px] text-slate-400">{DEMO_TEACHER_USER.title}</div>
                    <div className="text-[10px] text-cyan-300 font-medium">
                      Class 10 - Section B (Physics) • 67% Avg
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 italic border-t border-slate-900 pt-2">
                  "Explore class-wide learning intelligence, cohort mastery heatmaps, and systemic misconception triage."
                </p>
              </div>

              {/* Teacher Features List */}
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Living <strong>Cohort Concept Heatmap</strong> &amp; mastery matrix</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span><strong>Systemic Misconception Triage</strong> with 1-click drill assignments</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Real-time <strong>AI Learning Alerts</strong> and intervention triggers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span><strong>Targeted Learning Labs</strong> &amp; printable class reports</span>
                </li>
              </ul>
            </div>

            {/* Action CTA Button */}
            <div className="pt-6 mt-2 border-t border-slate-800/60">
              <button
                onClick={() => handleLogin('teacher')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-cyan-600/30 hover:shadow-cyan-600/50 transition-all cursor-pointer group-hover:scale-[1.01]"
              >
                {isLoading && loadingRole === 'teacher' ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Entering Teacher Command Center...
                  </span>
                ) : (
                  <>
                    <span>Enter Teacher Demo</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Optional Custom User Name Input Toggle */}
        <div className="w-full max-w-md mx-auto text-center space-y-3">
          {!showCustomInput ? (
            <button
              onClick={() => setShowCustomInput(true)}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors underline cursor-pointer"
            >
              Want to try with your own name? Click to personalize
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold">Personalized Demo Login</span>
                <button
                  onClick={() => setShowCustomInput(false)}
                  className="text-slate-500 hover:text-slate-300 text-[11px]"
                >
                  Cancel
                </button>
              </div>
              <input
                type="text"
                placeholder="Enter your name (e.g. Maya Lin)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleLogin('student', customName)}
                  disabled={isLoading || !customName.trim()}
                  className="py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition-all"
                >
                  Enter as Student
                </button>
                <button
                  onClick={() => handleLogin('teacher', customName)}
                  disabled={isLoading || !customName.trim()}
                  className="py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold transition-all"
                >
                  Enter as Teacher
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-slate-800/60 bg-slate-950/70 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            LearnFlow AI • Role-Based Educational Architecture
          </span>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <Mic className="w-3 h-3 text-indigo-400" />
              Wispr Flow
            </span>
            <span className="flex items-center gap-1">
              <Brain className="w-3 h-3 text-purple-400" />
              Gemini 3.8 Flash
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              RBAC Protected
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
