import React, { useState } from 'react';
import { useLearner } from '../context/LearnerContext';
import { TEACHER_CLASS_DATA, CONCEPTS } from '../data/syllabus';
import {
  Users,
  TrendingDown,
  AlertTriangle,
  Award,
  BarChart3,
  LayoutDashboard,
  Search,
  Filter,
  Send,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  BellRing,
  FlaskConical,
  FileText,
  Grid,
  ArrowRight,
  TrendingUp,
  Clock,
  Zap,
  Target,
  Layers,
  BookOpen,
} from 'lucide-react';

export const TeacherDashboardView: React.FC = () => {
  const { activeTab, setActiveTab } = useLearner();

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [assignedRemedyId, setAssignedRemedyId] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [assignedLabId, setAssignedLabId] = useState<string | null>(null);

  // Normalize current teacher section
  const currentSection =
    activeTab.startsWith('teacher-')
      ? activeTab
      : 'teacher-overview';

  const getHeatmapColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40';
    if (score >= 65) return 'bg-amber-500/25 text-amber-300 border-amber-500/40';
    return 'bg-rose-500/25 text-rose-300 border-rose-500/40';
  };

  const handleSendRemedy = (miscId: string) => {
    setAssignedRemedyId(miscId);
    setTimeout(() => {
      setAssignedRemedyId(null);
    }, 2500);
  };

  const handleAssignLab = (labId: string) => {
    setAssignedLabId(labId);
    setTimeout(() => {
      setAssignedLabId(null);
    }, 2500);
  };

  const selectedStudent = TEACHER_CLASS_DATA.students.find((s) => s.id === selectedStudentId) || null;

  // Filtered students
  const filteredStudents = TEACHER_CLASS_DATA.students.filter((st) => {
    const matchesSearch =
      st.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      st.weakestConcept.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesRisk =
      riskFilter === 'all'
        ? true
        : riskFilter === 'at_risk'
        ? st.overallMastery < 60
        : riskFilter === 'excelling'
        ? st.overallMastery >= 80
        : st.overallMastery >= 60 && st.overallMastery < 80;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-6">
      {/* 1. Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-900 border border-cyan-500/30 p-6 sm:p-7 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Educator Command Center • Class 10 - Section B (Physics)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, Dr. Priya! 👩‍🏫
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              "Here's what your class needs today." Real-time cohort mastery analytics, concept heatmaps, and systemic misconception triage.
            </p>
          </div>

          {/* Quick KPI Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[85px] shadow-sm">
              <div className="text-2xl font-mono font-extrabold text-cyan-400">
                {TEACHER_CLASS_DATA.totalStudents}
              </div>
              <div className="text-[10px] text-slate-400">Total Students</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[85px] shadow-sm">
              <div className="text-2xl font-mono font-extrabold text-emerald-400">
                {TEACHER_CLASS_DATA.averageMastery}%
              </div>
              <div className="text-[10px] text-slate-400">Class Average</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[85px] shadow-sm">
              <div className="text-2xl font-mono font-extrabold text-rose-400">
                {TEACHER_CLASS_DATA.strugglingStudentsCount}
              </div>
              <div className="text-[10px] text-slate-400">Need Support</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[120px] shadow-sm">
              <div className="text-xs font-bold text-rose-300">
                Series Circuits
              </div>
              <div className="text-[10px] text-slate-400">Lowest (42% Avg)</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Secondary Tab Switcher Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {[
          { id: 'teacher-overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'teacher-analytics', label: 'Class Analytics', icon: BarChart3 },
          { id: 'teacher-students', label: 'Student Performance', icon: Users },
          { id: 'teacher-heatmap', label: 'Concept Heatmap', icon: Grid },
          { id: 'teacher-misconceptions', label: 'Misconception Insights', icon: AlertTriangle },
          { id: 'teacher-alerts', label: 'AI Learning Alerts', icon: BellRing },
          { id: 'teacher-labs', label: 'Targeted Labs', icon: FlaskConical },
          { id: 'teacher-reports', label: 'Class Reports', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = currentSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30 border border-cyan-500'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION: Overview (Default) */}
      {(currentSection === 'teacher-overview' || currentSection === 'teacher') && (
        <div className="space-y-6">
          {/* Top Alerts Highlight */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                <BellRing className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                    High Priority Alert
                  </span>
                  <span className="text-xs text-slate-400">14 Students Impacted</span>
                </div>
                <h4 className="text-sm font-bold text-white">
                  Series Circuit Current Misconception Cluster Detected
                </h4>
                <p className="text-xs text-slate-300">
                  50% of the class believes electric current decreases after each resistor in series. Recommended: Assign Ammeter Placement Lab.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('teacher-misconceptions')}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shrink-0 transition-all cursor-pointer"
            >
              Review Remedy Drill
            </button>
          </div>

          {/* Heatmap Preview & Quick Misconception Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Concept Heatmap Table (7 cols) */}
            <div className="lg:col-span-8 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Grid className="w-4 h-4 text-cyan-400" />
                    Living Cohort Concept Heatmap
                  </h3>
                  <p className="text-xs text-slate-400">
                    Green (&ge;80%), Amber (65-79%), Rose (&lt;65%).
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('teacher-heatmap')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                >
                  <span>Full Matrix</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800 custom-scrollbar">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400">
                      <th className="py-2.5 px-3 font-semibold">Student</th>
                      <th className="py-2.5 px-2 font-semibold text-center">Avg</th>
                      {CONCEPTS.map((c) => (
                        <th
                          key={c.id}
                          className="py-2.5 px-2 font-semibold text-center whitespace-nowrap"
                          title={c.name}
                        >
                          {c.name.split(' ')[0]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {TEACHER_CLASS_DATA.students.map((st) => (
                      <tr
                        key={st.id}
                        className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${
                          selectedStudentId === st.id ? 'bg-cyan-950/30' : ''
                        }`}
                        onClick={() => setSelectedStudentId(st.id)}
                      >
                        <td className="py-2 px-3 font-sans font-medium text-slate-200 whitespace-nowrap flex items-center gap-2">
                          <img
                            src={st.avatar}
                            alt={st.name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span>{st.name}</span>
                        </td>
                        <td className="py-2 px-2 text-center font-bold text-white">
                          {st.overallMastery}%
                        </td>
                        {CONCEPTS.map((c) => {
                          const score =
                            (st.scores as Record<string, number>)[c.id] || 50;
                          return (
                            <td key={c.id} className="py-2 px-1 text-center">
                              <span
                                className={`inline-block w-8 py-0.5 rounded text-[11px] font-bold border ${getHeatmapColor(
                                  score
                                )}`}
                              >
                                {score}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedStudent && (
                <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs animate-in fade-in duration-200">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedStudent.avatar}
                      alt={selectedStudent.name}
                      className="w-10 h-10 rounded-full object-cover border border-cyan-500/40"
                    />
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{selectedStudent.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300">
                          {selectedStudent.riskLevel}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Weakest: <strong className="text-rose-400">{selectedStudent.weakestConcept}</strong> • Active Misconceptions: <strong className="text-amber-300">{selectedStudent.activeMisconceptions}</strong>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedStudentId(null)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-semibold border border-slate-800 self-start sm:self-auto"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>

            {/* Right: AI-Generated Teaching Recommendations (4 cols) */}
            <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">
                  AI Teaching Recommendations
                </h3>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300">Target Series Current</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                      Priority 1
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Dedicate 10 minutes at the start of tomorrow's lecture to demonstrate conservation of charge using the closed-water loop model.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300">Parallel Voltage Reciprocal</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      Priority 2
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Assign the Tollbooth Traffic Model to reinforce why total equivalent resistance decreases when branches are added in parallel.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300">Confidence Recalibration</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                      Metacognitive
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    5 students (including Alex Rivera) exhibit high confidence alongside incorrect circuit reasoning. Encourage voice self-explanations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: Class Analytics */}
      {currentSection === 'teacher-analytics' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Cohort Mastery Distribution &amp; Concept Breakdown
            </h3>

            {/* Distribution Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TEACHER_CLASS_DATA.masteryDistribution.map((dist) => (
                <div
                  key={dist.range}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                >
                  <div className="text-xs font-semibold text-slate-400">{dist.range}</div>
                  <div className="text-2xl font-mono font-bold text-white">
                    {dist.count} <span className="text-xs font-normal text-slate-500">Students</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full ${
                        dist.range.includes('High')
                          ? 'bg-emerald-500'
                          : dist.range.includes('Medium')
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${dist.percentage}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400">{dist.percentage}% of cohort</div>
                </div>
              ))}
            </div>

            {/* Concept Average Bars */}
            <div className="pt-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-300">Concept Mastery Averages Across Syllabus</h4>
              <div className="space-y-2">
                {TEACHER_CLASS_DATA.conceptAverages.map((c) => (
                  <div key={c.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-200">{c.name}</span>
                      <span className="font-mono font-bold text-white">{c.average}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                      <div
                        className={`h-full ${
                          c.average >= 75
                            ? 'bg-emerald-500'
                            : c.average >= 60
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${c.average}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: Student Performance */}
      {currentSection === 'teacher-students' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                Individual Student Performance Roster
              </h3>
              <p className="text-xs text-slate-400">
                Detailed mastery scores, risk flags, and misconception tracking per student.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search student..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Status</option>
                <option value="at_risk">At Risk (&lt;60%)</option>
                <option value="moderate">Moderate</option>
                <option value="excelling">Excelling (&ge;80%)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredStudents.map((st) => (
              <div
                key={st.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={st.avatar}
                      alt={st.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-700"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">{st.name}</div>
                      <div className="text-[10px] text-slate-400">{st.lastActive}</div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      st.overallMastery >= 80
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : st.overallMastery >= 60
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {st.riskLevel}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Overall Mastery</span>
                    <span className="font-mono font-bold text-white">{st.overallMastery}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className={`h-full ${
                        st.overallMastery >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${st.overallMastery}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Weakest: <strong className="text-rose-400 font-semibold">{st.weakestConcept}</strong>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Active Misconceptions: <strong className="text-amber-400 font-semibold">{st.activeMisconceptions}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: Concept Heatmap (Full View) */}
      {currentSection === 'teacher-heatmap' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Grid className="w-4 h-4 text-cyan-400" />
                Complete Class Concept Mastery Matrix
              </h3>
              <p className="text-xs text-slate-400">
                Click any cell or student row to inspect cognitive diagnostic status.
              </p>
            </div>
            <div className="text-xs text-slate-400">
              Cohort: <strong className="text-cyan-400">28 Students Enrolled</strong>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-slate-400">
                  <th className="py-3 px-4 font-semibold">Student Name</th>
                  <th className="py-3 px-3 font-semibold text-center">Avg</th>
                  {CONCEPTS.map((c) => (
                    <th
                      key={c.id}
                      className="py-3 px-3 font-semibold text-center whitespace-nowrap"
                    >
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {TEACHER_CLASS_DATA.students.map((st) => (
                  <tr
                    key={st.id}
                    onClick={() => setSelectedStudentId(st.id)}
                    className={`hover:bg-slate-800/50 transition-colors cursor-pointer ${
                      selectedStudentId === st.id ? 'bg-cyan-950/30' : ''
                    }`}
                  >
                    <td className="py-2.5 px-4 font-sans font-medium text-slate-200 whitespace-nowrap flex items-center gap-2.5">
                      <img
                        src={st.avatar}
                        alt={st.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span>{st.name}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-white">
                      {st.overallMastery}%
                    </td>
                    {CONCEPTS.map((c) => {
                      const score =
                        (st.scores as Record<string, number>)[c.id] || 50;
                      return (
                        <td key={c.id} className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-bold border ${getHeatmapColor(
                              score
                            )}`}
                          >
                            {score}%
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedStudent && (
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="font-bold text-white flex items-center gap-2">
                  <span>Diagnostic Snapshot: {selectedStudent.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300">
                    Overall {selectedStudent.overallMastery}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Weakest area: <strong className="text-rose-400">{selectedStudent.weakestConcept}</strong> • {selectedStudent.activeMisconceptions} active misconceptions • Last active {selectedStudent.lastActive}.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('teacher-labs')}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shrink-0"
              >
                Assign Remedial Lab
              </button>
            </div>
          )}
        </div>
      )}

      {/* SECTION: Misconception Insights */}
      {currentSection === 'teacher-misconceptions' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Systemic Misconceptions Across Class Cohort
            </h3>
            <p className="text-xs text-slate-400">
              Identified through student verbal explanations with Wispr Flow and adaptive question traps.
            </p>
          </div>

          <div className="space-y-4">
            {TEACHER_CLASS_DATA.topClassMisconceptions.map((misc) => (
              <div
                key={misc.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                        {misc.percentage}
                      </span>
                      <span className="text-xs font-bold text-indigo-400">{misc.concept}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-100">
                      "{misc.title}"
                    </h4>
                  </div>

                  <button
                    onClick={() => handleSendRemedy(misc.id)}
                    disabled={assignedRemedyId === misc.id}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0"
                  >
                    {assignedRemedyId === misc.id ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Remedy Drill Deployed!</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Deploy Remediation Drill</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 text-xs space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Recommended Pedagogical Remedy:
                  </div>
                  <p className="text-slate-300 leading-relaxed">{misc.remedy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: AI Learning Alerts */}
      {currentSection === 'teacher-alerts' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BellRing className="w-4 h-4 text-amber-400" />
              Real-Time AI Cognitive Learning Alerts
            </h3>
            <p className="text-xs text-slate-400">
              Autonomous cognitive monitoring detecting student bottlenecks, persistent traps, and milestones.
            </p>
          </div>

          <div className="space-y-3">
            {TEACHER_CLASS_DATA.aiLearningAlerts?.map((alert) => (
              <div
                key={alert.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        alert.priority === 'high'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : alert.priority === 'medium'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {alert.priority} Priority
                    </span>
                    <span className="text-slate-400 font-medium">{alert.timestamp}</span>
                  </div>
                  <span className="text-[11px] font-bold text-cyan-400">{alert.concept}</span>
                </div>

                <h4 className="text-sm font-bold text-white">{alert.title}</h4>
                <p className="text-slate-300 leading-relaxed">{alert.message}</p>

                <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">
                    Action: <strong className="text-slate-200">{alert.suggestedAction}</strong>
                  </span>
                  <button
                    onClick={() => setActiveTab('teacher-labs')}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold text-[11px]"
                  >
                    Take Action &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: Targeted Learning Labs */}
      {currentSection === 'teacher-labs' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-cyan-400" />
              Targeted Remedial Learning Labs
            </h3>
            <p className="text-xs text-slate-400">
              Interactive cognitive labs assigned to remediate systemic cohort misconceptions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TEACHER_CLASS_DATA.targetedLearningLabs?.map((lab) => (
              <div
                key={lab.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                    <span>{lab.concept}</span>
                    <span className="text-slate-400">{lab.durationMinutes} min</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{lab.title}</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {lab.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-900 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{lab.assignedStatus}</span>
                    <span className="font-mono font-bold text-white">{lab.completionRate}% Done</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className="h-full bg-cyan-500"
                      style={{ width: `${lab.completionRate}%` }}
                    />
                  </div>
                  <button
                    onClick={() => handleAssignLab(lab.id)}
                    disabled={assignedLabId === lab.id}
                    className="w-full py-1.5 px-3 rounded-lg bg-cyan-600/30 hover:bg-cyan-600 text-cyan-300 hover:text-white text-xs font-semibold transition-all"
                  >
                    {assignedLabId === lab.id ? 'Lab Assigned!' : 'Assign to Class'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: Class Reports */}
      {currentSection === 'teacher-reports' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                Comprehensive Cohort Pedagogical Report
              </h3>
              <p className="text-xs text-slate-400">
                Generated {TEACHER_CLASS_DATA.classReports?.generatedDate} • Class 10 - Section B
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-xs text-slate-400">Exam Readiness</div>
              <div className="text-xl font-mono font-bold text-emerald-400">
                {TEACHER_CLASS_DATA.classReports?.examReadinessScore}%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Identified Class Strengths</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {TEACHER_CLASS_DATA.classReports?.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Critical Vulnerabilities</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {TEACHER_CLASS_DATA.classReports?.vulnerabilities.map((vuln, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-400 mt-0.5">•</span>
                    <span>{vuln}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">
              Recommended Curriculum Pacing Advice:
            </div>
            <p className="text-slate-300 leading-relaxed font-medium">
              {TEACHER_CLASS_DATA.classReports?.recommendedPacing}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
