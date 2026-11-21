import React, { useState } from 'react';
import { useLearner } from '../context/LearnerContext';
import { TEACHER_CLASS_DATA, CONCEPTS } from '../data/syllabus';
import { TeacherGeneratedLab } from '../types/learning';
import {
  Users,
  AlertTriangle,
  BarChart3,
  LayoutDashboard,
  Search,
  Send,
  CheckCircle2,
  Sparkles,
  BellRing,
  FlaskConical,
  FileText,
  Grid,
  ArrowRight,
  Printer,
  Download,
  X,
  Eye,
  Loader2,
  Check,
} from 'lucide-react';

interface DrillDownState {
  conceptId: string;
  studentId?: string;
}

export const TeacherDashboardView: React.FC = () => {
  const { activeTab, setActiveTab, showToast } = useLearner();

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [drillDownCell, setDrillDownCell] = useState<DrillDownState | null>(null);
  const [assignedRemedyId, setAssignedRemedyId] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [assignedLabId, setAssignedLabId] = useState<string | null>(null);

  // AI Revision Lab Generator state
  const [generatingLabForId, setGeneratingLabForId] = useState<string | null>(null);
  const [generatedLab, setGeneratedLab] = useState<TeacherGeneratedLab | null>(null);
  const [labSelectedAnswers, setLabSelectedAnswers] = useState<Record<string, string>>({});
  const [labRevealedQuestions, setLabRevealedQuestions] = useState<Record<string, boolean>>({});

  // Normalize current teacher section
  const currentSection = activeTab.startsWith('teacher-') ? activeTab : 'teacher-overview';

  const getHeatmapColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/25 text-emerald-200 border-emerald-500/40 hover:border-emerald-400';
    if (score >= 65) return 'bg-amber-500/25 text-amber-200 border-amber-500/40 hover:border-amber-400';
    return 'bg-rose-500/25 text-rose-200 border-rose-500/40 hover:border-rose-400';
  };

  const handleSendRemedy = (miscId: string) => {
    setAssignedRemedyId(miscId);
    showToast('Remediation drill deployed to impacted cohort students.', 'success');
    setTimeout(() => {
      setAssignedRemedyId(null);
    }, 2500);
  };

  const handleAssignLab = (labId: string) => {
    setAssignedLabId(labId);
    showToast('Learning lab assigned to cohort queue.', 'success');
    setTimeout(() => {
      setAssignedLabId(null);
    }, 2500);
  };

  const handleGenerateRevisionLab = async (params: {
    alertId: string;
    concept: string;
    title: string;
    misconceptionSummary: string;
    impactedCount: number;
  }) => {
    setGeneratingLabForId(params.alertId);
    setLabSelectedAnswers({});
    setLabRevealedQuestions({});

    try {
      const response = await fetch('/api/teacher/generate-lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = (await response.json()) as TeacherGeneratedLab;
      if (
        !data ||
        typeof data.shortExplanation !== 'string' ||
        !Array.isArray(data.practiceQuestions) ||
        data.practiceQuestions.length === 0
      ) {
        throw new Error('Incomplete lab payload');
      }

      setGeneratedLab(data);
      if (data.usedFallback && data.fallbackNotice) {
        showToast(data.fallbackNotice, 'info');
      } else {
        showToast(`Revision Lab generated for ${data.concept}.`, 'success');
      }
    } catch {
      const fallback: TeacherGeneratedLab = {
        id: `gen-lab-local-${Date.now()}`,
        alertId: params.alertId,
        title: `Targeted Revision Lab: ${params.concept}`,
        concept: params.concept,
        shortExplanation: `Focus classroom instruction on physical conservation laws in ${params.concept}. Use concrete meter probes to debunk "${params.misconceptionSummary}".`,
        relatedMisconception: params.misconceptionSummary,
        practiceQuestions: [
          {
            id: 'local-q1',
            questionText: `Concept Check (${params.concept}): What physical quantity remains uniform across a single series loop?`,
            options: [
              { id: 'opt-a', text: 'Electric current (rate of charge flow)' },
              { id: 'opt-b', text: 'Current decreases after every bulb' },
              { id: 'opt-c', text: 'Potential difference stays zero' },
              { id: 'opt-d', text: 'Resistance drops at the second resistor' },
            ],
            correctOptionId: 'opt-a',
            explanation: 'Charge cannot pile up or vanish inside a single series loop, so current is identical everywhere.',
          },
          {
            id: 'local-q2',
            questionText: `Numerical Check: Two resistors (4 Ω and 8 Ω) are connected in series to a 12 V battery. What is the current exiting the 8 Ω resistor?`,
            options: [
              { id: 'opt-a', text: '1.0 A' },
              { id: 'opt-b', text: '1.5 A' },
              { id: 'opt-c', text: '3.0 A' },
              { id: 'opt-d', text: '0 A' },
            ],
            correctOptionId: 'opt-a',
            explanation: 'Total resistance Rs = 4 + 8 = 12 Ω, so I = 12 V / 12 Ω = 1.0 A throughout the circuit.',
          },
          {
            id: 'local-q3',
            questionText: `Transfer Check: Adding a second branch in parallel across a 12 V battery causes total resistance to:`,
            options: [
              { id: 'opt-a', text: 'Decrease, because an extra current path is opened' },
              { id: 'opt-b', text: 'Increase, because Rp = R1 + R2' },
              { id: 'opt-c', text: 'Stay identical to the first branch' },
              { id: 'opt-d', text: 'Split battery voltage in half' },
            ],
            correctOptionId: 'opt-a',
            explanation: 'Parallel wiring adds conductive pathways between the same two nodes (1/Rp = 1/R1 + 1/R2).',
          },
        ],
        usedFallback: true,
      };
      setGeneratedLab(fallback);
      showToast('Live AI unreachable; loaded structured offline Revision Lab.', 'info');
    } finally {
      setGeneratingLabForId(null);
    }
  };

  const handleExportClassReport = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      className: TEACHER_CLASS_DATA.className,
      totalStudents: TEACHER_CLASS_DATA.totalStudents,
      averageMastery: TEACHER_CLASS_DATA.averageMastery,
      strugglingStudentsCount: TEACHER_CLASS_DATA.strugglingStudentsCount,
      conceptAverages: TEACHER_CLASS_DATA.conceptAverages,
      masteryDistribution: TEACHER_CLASS_DATA.masteryDistribution,
      students: TEACHER_CLASS_DATA.students,
      topClassMisconceptions: TEACHER_CLASS_DATA.topClassMisconceptions,
      aiLearningAlerts: TEACHER_CLASS_DATA.aiLearningAlerts,
      classReports: TEACHER_CLASS_DATA.classReports,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `learnflow-class-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Class cohort report exported as JSON.', 'success');
  };

  const selectedStudent =
    TEACHER_CLASS_DATA.students.find((s) => s.id === selectedStudentId) || null;

  const drillDownConcept = drillDownCell
    ? CONCEPTS.find((c) => c.id === drillDownCell.conceptId) || null
    : null;

  const drillDownStudents = drillDownConcept
    ? [...TEACHER_CLASS_DATA.students].sort((a, b) => {
        const aScore = (a.scores as Record<string, number>)[drillDownConcept.id] ?? 50;
        const bScore = (b.scores as Record<string, number>)[drillDownConcept.id] ?? 50;
        return aScore - bScore;
      })
    : [];

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

  const renderDrillDownPanel = () => {
    if (!drillDownCell || !drillDownConcept) return null;
    const conceptAvgObj = TEACHER_CLASS_DATA.conceptAverages.find(
      (c) => c.id === drillDownConcept.id
    );
    const totalMiscForConcept = drillDownStudents.reduce((acc, st) => {
      const list = ((st as any).misconceptionsByConcept?.[drillDownConcept.id] as string[]) || [];
      return acc + list.length;
    }, 0);

    return (
      <div
        role="region"
        aria-label={`Concept drill-down for ${drillDownConcept.name}`}
        className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-4 text-xs shadow-lg"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
              <Grid className="w-3.5 h-3.5" />
              <span>Concept Cell Drill-Down</span>
              {conceptAvgObj && (
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 tabular-nums">
                  Cohort Avg: {conceptAvgObj.average}%
                </span>
              )}
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white mt-0.5">
              {drillDownConcept.name} — Student Mastery &amp; Open Misconceptions ({totalMiscForConcept} flagged)
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                handleGenerateRevisionLab({
                  alertId: `drill-${drillDownConcept.id}`,
                  concept: drillDownConcept.name,
                  title: `${drillDownConcept.name} Cohort Drill-Down Lab`,
                  misconceptionSummary:
                    drillDownConcept.commonMisconceptions[0] ||
                    `Targeted conceptual review for ${drillDownConcept.name}`,
                  impactedCount: drillDownStudents.filter(
                    (st) => ((st.scores as Record<string, number>)[drillDownConcept.id] ?? 50) < 65
                  ).length,
                })
              }
              disabled={generatingLabForId === `drill-${drillDownConcept.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-60"
            >
              {generatingLabForId === `drill-${drillDownConcept.id}` ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FlaskConical className="w-3.5 h-3.5" />
              )}
              <span>Generate Revision Lab</span>
            </button>
            <button
              type="button"
              onClick={() => setDrillDownCell(null)}
              aria-label="Close concept drill-down"
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {drillDownStudents.map((st) => {
            const conceptScore = (st.scores as Record<string, number>)[drillDownConcept.id] ?? 50;
            const conceptMisconceptions =
              ((st as any).misconceptionsByConcept?.[drillDownConcept.id] as string[]) || [];
            const isClickedStudent = drillDownCell.studentId === st.id;

            return (
              <div
                key={st.id}
                className={`p-3.5 rounded-xl border space-y-2 transition-all ${
                  isClickedStudent
                    ? 'bg-cyan-950/35 border-cyan-400/60 ring-1 ring-cyan-400/40'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={st.avatar}
                      alt={st.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-700"
                    />
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{st.name}</span>
                        {isClickedStudent && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-500/40">
                            Selected
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-300">{st.riskLevel}</div>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-md font-mono font-bold tabular-nums border ${getHeatmapColor(
                      conceptScore
                    )}`}
                  >
                    {conceptScore}%
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className={`h-full ${
                      conceptScore >= 80
                        ? 'bg-emerald-500'
                        : conceptScore >= 65
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${conceptScore}%` }}
                  />
                </div>

                {conceptMisconceptions.length > 0 ? (
                  <div className="space-y-1 pt-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-rose-300">
                      Open Misconceptions ({conceptMisconceptions.length})
                    </div>
                    {conceptMisconceptions.map((misc, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-rose-950/35 border border-rose-500/30 text-[11px] text-rose-100 leading-snug"
                      >
                        • {misc}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-emerald-300/90 flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>No open misconceptions flagged for {drillDownConcept.name}.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderGeneratedLabSection = () => {
    if (generatingLabForId) {
      return (
        <div
          aria-busy="true"
          className="p-5 rounded-2xl bg-slate-900 border border-cyan-500/40 space-y-3 animate-pulse"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Synthesizing targeted Revision Lab &amp; 3 diagnostic drills...</span>
          </div>
          <div className="h-4 w-2/3 rounded bg-slate-800" />
          <div className="h-16 w-full rounded-xl bg-slate-800/80" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="h-28 rounded-xl bg-slate-800/60" />
            <div className="h-28 rounded-xl bg-slate-800/60" />
            <div className="h-28 rounded-xl bg-slate-800/60" />
          </div>
        </div>
      );
    }

    if (!generatedLab) return null;

    return (
      <div
        role="region"
        aria-label="AI Generated Revision Lab"
        className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/40 space-y-5 shadow-xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-500/40">
                AI-Generated Revision Lab
              </span>
              <span className="text-xs font-semibold text-indigo-300">{generatedLab.concept}</span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-white">{generatedLab.title}</h3>
          </div>

          <div className="flex items-center gap-2 no-print">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Lab</span>
            </button>
            <button
              type="button"
              onClick={() => setGeneratedLab(null)}
              aria-label="Close generated revision lab"
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Short Explanation + Related Misconception */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
              Classroom Walkthrough Explanation
            </div>
            <p className="text-slate-200 leading-relaxed">{generatedLab.shortExplanation}</p>
          </div>

          <div className="p-4 rounded-xl bg-rose-950/25 border border-rose-500/30 space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Target Cohort Misconception</span>
            </div>
            <p className="text-rose-100 leading-relaxed">{generatedLab.relatedMisconception}</p>
          </div>
        </div>

        {/* 3 Practice Questions */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-white flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-cyan-400" />
            <span>Practice Questions ({generatedLab.practiceQuestions.length})</span>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {generatedLab.practiceQuestions.map((q, qIdx) => {
              const selectedOpt = labSelectedAnswers[q.id];
              const isRevealed = !!labRevealedQuestions[q.id];

              return (
                <div
                  key={q.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-white leading-relaxed">
                      <span className="text-cyan-400 font-mono mr-2">Q{qIdx + 1}.</span>
                      {q.questionText}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setLabRevealedQuestions((prev) => ({
                          ...prev,
                          [q.id]: !prev[q.id],
                        }))
                      }
                      className="no-print flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 text-[11px] font-semibold shrink-0 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>{isRevealed ? 'Hide Key' : 'Reveal Key'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt) => {
                      const isPicked = selectedOpt === opt.id;
                      const isCorrect = opt.id === q.correctOptionId;
                      let optClass =
                        'bg-slate-900/90 border-slate-800 text-slate-200 hover:border-cyan-500/40';
                      if (isRevealed && isCorrect) {
                        optClass = 'bg-emerald-500/15 border-emerald-500/50 text-emerald-100';
                      } else if (isPicked && isCorrect) {
                        optClass = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-100';
                      } else if (isPicked && !isCorrect) {
                        optClass = 'bg-rose-500/20 border-rose-500/50 text-rose-100';
                      }

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setLabSelectedAnswers((prev) => ({ ...prev, [q.id]: opt.id }));
                            setLabRevealedQuestions((prev) => ({ ...prev, [q.id]: true }));
                          }}
                          className={`text-left p-2.5 rounded-lg border flex items-center justify-between gap-2 transition-all cursor-pointer ${optClass}`}
                        >
                          <span>{opt.text}</span>
                          {isRevealed && isCorrect && (
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {isRevealed && (
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-200">
                      <strong className="text-emerald-300">Answer Explanation:</strong>{' '}
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-900 border border-cyan-500/30 p-6 sm:p-7 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Educator Command Center • Class 10 - Section B (Physics)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, Dr. Priya!
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              &ldquo;Here&apos;s what your class needs today.&rdquo; Real-time cohort mastery analytics, concept heatmaps, and systemic misconception triage.
            </p>
          </div>

          {/* Quick KPI Badges */}
          <div className="flex flex-wrap items-center gap-3 tabular-nums">
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[85px] shadow-sm">
              <div className="text-2xl font-mono font-extrabold text-cyan-400">
                {TEACHER_CLASS_DATA.totalStudents}
              </div>
              <div className="text-[11px] text-slate-300">Total Students</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[85px] shadow-sm">
              <div className="text-2xl font-mono font-extrabold text-emerald-400">
                {TEACHER_CLASS_DATA.averageMastery}%
              </div>
              <div className="text-[11px] text-slate-300">Class Average</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[85px] shadow-sm">
              <div className="text-2xl font-mono font-extrabold text-rose-400">
                {TEACHER_CLASS_DATA.strugglingStudentsCount}
              </div>
              <div className="text-[11px] text-slate-300">Need Support</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[120px] shadow-sm">
              <div className="text-xs font-bold text-rose-300">Series Circuits</div>
              <div className="text-[11px] text-slate-300">Lowest (42% Avg)</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Secondary Tab Switcher Pills */}
      <div className="no-print flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
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
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30 border border-cyan-500'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800'
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
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0">
                <BellRing className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200">
                    High Priority Alert
                  </span>
                  <span className="text-xs text-slate-300">14 Students Impacted</span>
                </div>
                <h4 className="text-sm font-bold text-white">
                  Series Circuit Current Misconception Cluster Detected
                </h4>
                <p className="text-xs text-slate-200">
                  50% of the class believes electric current decreases after each resistor in series. Recommended: Assign Ammeter Placement Lab.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0 no-print">
              <button
                type="button"
                onClick={() =>
                  handleGenerateRevisionLab({
                    alertId: 'overview-alert-1',
                    concept: 'Series Circuits',
                    title: 'Series Circuit Current Misconception Cluster',
                    misconceptionSummary:
                      '50% of students believe electric current gets used up after each resistor in series.',
                    impactedCount: 14,
                  })
                }
                disabled={generatingLabForId === 'overview-alert-1'}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-60"
              >
                {generatingLabForId === 'overview-alert-1' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FlaskConical className="w-3.5 h-3.5" />
                )}
                <span>Generate Revision Lab</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('teacher-misconceptions')}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Review Remedy Drill
              </button>
            </div>
          </div>

          {renderGeneratedLabSection()}

          {/* Heatmap Preview & Quick Misconception Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Concept Heatmap Table (8 cols) */}
            <div className="lg:col-span-8 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Grid className="w-4 h-4 text-cyan-400" />
                    Living Cohort Concept Heatmap
                  </h3>
                  <p className="text-xs text-slate-300">
                    Click any score cell or concept column to inspect student mastery &amp; open misconceptions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('teacher-heatmap')}
                  className="text-xs text-cyan-300 hover:text-cyan-200 font-medium flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <span>Full Matrix</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800 custom-scrollbar">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-300">
                      <th className="py-2.5 px-3 font-semibold">Student</th>
                      <th className="py-2.5 px-2 font-semibold text-center">Avg</th>
                      {CONCEPTS.map((c) => (
                        <th key={c.id} className="py-2.5 px-1.5 font-semibold text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setDrillDownCell({ conceptId: c.id })}
                            title={`Inspect ${c.name} cohort scores`}
                            className="hover:text-cyan-300 underline decoration-slate-700 underline-offset-4 cursor-pointer"
                          >
                            {c.name.split(' ')[0]}
                          </button>
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
                        <td className="py-2 px-2 text-center font-bold text-white tabular-nums">
                          {st.overallMastery}%
                        </td>
                        {CONCEPTS.map((c) => {
                          const score = (st.scores as Record<string, number>)[c.id] || 50;
                          const isSelectedCell =
                            drillDownCell?.conceptId === c.id && drillDownCell?.studentId === st.id;
                          return (
                            <td key={c.id} className="py-2 px-1 text-center">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDrillDownCell({ conceptId: c.id, studentId: st.id });
                                  setSelectedStudentId(st.id);
                                }}
                                aria-label={`Inspect ${st.name} on ${c.name}: ${score}%`}
                                className={`inline-block w-9 py-0.5 rounded text-[11px] font-bold border tabular-nums transition-all cursor-pointer ${getHeatmapColor(
                                  score
                                )} ${isSelectedCell ? 'ring-2 ring-cyan-400 scale-105' : ''}`}
                              >
                                {score}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {renderDrillDownPanel()}

              {!drillDownCell && selectedStudent && (
                <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedStudent.avatar}
                      alt={selectedStudent.name}
                      className="w-10 h-10 rounded-full object-cover border border-cyan-500/40"
                    />
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{selectedStudent.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-200">
                          {selectedStudent.riskLevel}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300">
                        Weakest: <strong className="text-rose-300">{selectedStudent.weakestConcept}</strong> • Active Misconceptions: <strong className="text-amber-300">{selectedStudent.activeMisconceptions}</strong>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedStudentId(null)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-[11px] font-semibold border border-slate-800 self-start sm:self-auto cursor-pointer"
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
                <h3 className="text-sm font-bold text-white">AI Teaching Recommendations</h3>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300">Target Series Current</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-200">
                      Priority 1
                    </span>
                  </div>
                  <p className="text-slate-200 text-[11px] leading-relaxed">
                    Dedicate 10 minutes at the start of tomorrow&apos;s lecture to demonstrate conservation of charge using the closed-water loop model.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300">Parallel Voltage Reciprocal</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200">
                      Priority 2
                    </span>
                  </div>
                  <p className="text-slate-200 text-[11px] leading-relaxed">
                    Assign the Tollbooth Traffic Model to reinforce why total equivalent resistance decreases when branches are added in parallel.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300">Confidence Recalibration</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-200">
                      Metacognitive
                    </span>
                  </div>
                  <p className="text-slate-200 text-[11px] leading-relaxed">
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
                  <div className="text-xs font-semibold text-slate-300">{dist.range}</div>
                  <div className="text-2xl font-mono font-bold text-white tabular-nums">
                    {dist.count} <span className="text-xs font-normal text-slate-300">Students</span>
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
                  <div className="text-[11px] text-slate-300">{dist.percentage}% of cohort</div>
                </div>
              ))}
            </div>

            {/* Concept Average Bars */}
            <div className="pt-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-200">
                Concept Mastery Averages Across Syllabus
              </h4>
              <div className="space-y-2">
                {TEACHER_CLASS_DATA.conceptAverages.map((c) => (
                  <div key={c.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-200">{c.name}</span>
                      <span className="font-mono font-bold text-white tabular-nums">{c.average}%</span>
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
              <p className="text-xs text-slate-300">
                Detailed mastery scores, risk flags, and misconception tracking per student.
              </p>
            </div>

            <div className="flex items-center gap-2 no-print">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  aria-label="Search student roster"
                  placeholder="Search student..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <select
                aria-label="Filter students by risk level"
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Status</option>
                <option value="at_risk">At Risk (&lt;60%)</option>
                <option value="moderate">Moderate</option>
                <option value="excelling">Excelling (&ge;80%)</option>
              </select>
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="p-8 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-300">
              No students match the current search and status filter.
            </div>
          ) : (
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
                        <div className="text-[11px] text-slate-300">{st.lastActive}</div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        st.overallMastery >= 80
                          ? 'bg-emerald-500/20 text-emerald-200'
                          : st.overallMastery >= 60
                          ? 'bg-amber-500/20 text-amber-200'
                          : 'bg-rose-500/20 text-rose-200'
                      }`}
                    >
                      {st.riskLevel}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-300 text-[11px]">
                      <span>Overall Mastery</span>
                      <span className="font-mono font-bold text-white tabular-nums">
                        {st.overallMastery}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                      <div
                        className={`h-full ${
                          st.overallMastery >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${st.overallMastery}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Weakest: <strong className="text-rose-300 font-semibold">{st.weakestConcept}</strong>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Active Misconceptions: <strong className="text-amber-300 font-semibold">{st.activeMisconceptions}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION: Concept Heatmap (Full View) */}
      {currentSection === 'teacher-heatmap' && (
        <div className="space-y-5">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Grid className="w-4 h-4 text-cyan-400" />
                  Complete Class Concept Mastery Matrix
                </h3>
                <p className="text-xs text-slate-300">
                  Click any heatmap cell or concept column header to drill down into student mastery and open misconceptions.
                </p>
              </div>
              <div className="text-xs text-slate-300">
                Cohort: <strong className="text-cyan-300">28 Students Enrolled</strong>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-slate-300">
                    <th className="py-3 px-4 font-semibold">Student Name</th>
                    <th className="py-3 px-3 font-semibold text-center">Avg</th>
                    {CONCEPTS.map((c) => (
                      <th
                        key={c.id}
                        className="py-3 px-3 font-semibold text-center whitespace-nowrap"
                      >
                        <button
                          type="button"
                          onClick={() => setDrillDownCell({ conceptId: c.id })}
                          className="hover:text-cyan-300 underline decoration-slate-700 underline-offset-4 cursor-pointer"
                        >
                          {c.name}
                        </button>
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
                      <td className="py-2.5 px-3 text-center font-bold text-white tabular-nums">
                        {st.overallMastery}%
                      </td>
                      {CONCEPTS.map((c) => {
                        const score = (st.scores as Record<string, number>)[c.id] || 50;
                        const isSelectedCell =
                          drillDownCell?.conceptId === c.id && drillDownCell?.studentId === st.id;
                        return (
                          <td key={c.id} className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDrillDownCell({ conceptId: c.id, studentId: st.id });
                                setSelectedStudentId(st.id);
                              }}
                              aria-label={`Inspect ${st.name} on ${c.name}: ${score}%`}
                              className={`inline-block px-2.5 py-1 rounded text-xs font-bold border tabular-nums transition-all cursor-pointer ${getHeatmapColor(
                                score
                              )} ${isSelectedCell ? 'ring-2 ring-cyan-400 scale-105' : ''}`}
                            >
                              {score}%
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {renderDrillDownPanel()}

            {!drillDownCell && selectedStudent && (
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>Diagnostic Snapshot: {selectedStudent.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-200">
                      Overall {selectedStudent.overallMastery}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-200">
                    Weakest area: <strong className="text-rose-300">{selectedStudent.weakestConcept}</strong> • {selectedStudent.activeMisconceptions} active misconceptions • Last active {selectedStudent.lastActive}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('teacher-labs')}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shrink-0 cursor-pointer"
                >
                  Assign Remedial Lab
                </button>
              </div>
            )}
          </div>

          {renderGeneratedLabSection()}
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
            <p className="text-xs text-slate-300">
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
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-200">
                        {misc.percentage}
                      </span>
                      <span className="text-xs font-bold text-indigo-300">{misc.concept}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-100">&ldquo;{misc.title}&rdquo;</h4>
                  </div>

                  <button
                    type="button"
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
                  <div className="text-[10px] uppercase font-bold text-slate-300">
                    Recommended Pedagogical Remedy:
                  </div>
                  <p className="text-slate-200 leading-relaxed">{misc.remedy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: AI Learning Alerts */}
      {currentSection === 'teacher-alerts' && (
        <div className="space-y-5">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BellRing className="w-4 h-4 text-amber-400" />
                Real-Time AI Cognitive Learning Alerts
              </h3>
              <p className="text-xs text-slate-300">
                Autonomous cognitive monitoring detecting student bottlenecks, persistent traps, and milestones. Generate a targeted Revision Lab directly from any cluster alert.
              </p>
            </div>

            <div className="space-y-3">
              {TEACHER_CLASS_DATA.aiLearningAlerts?.map((alert) => {
                const isGeneratingThis = generatingLabForId === alert.id;
                return (
                  <div
                    key={alert.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            alert.priority === 'high'
                              ? 'bg-rose-500/20 text-rose-200 border border-rose-500/30'
                              : alert.priority === 'medium'
                              ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30'
                          }`}
                        >
                          {alert.priority} Priority
                        </span>
                        <span className="text-slate-300 font-medium">{alert.timestamp}</span>
                      </div>
                      <span className="text-[11px] font-bold text-cyan-300">{alert.concept}</span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{alert.title}</h4>
                    <p className="text-slate-200 leading-relaxed">{alert.message}</p>

                    <div className="pt-2.5 border-t border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <span className="text-slate-300 text-[11px]">
                        Action: <strong className="text-slate-100">{alert.suggestedAction}</strong>
                      </span>

                      <div className="flex items-center gap-2 no-print shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            handleGenerateRevisionLab({
                              alertId: alert.id,
                              concept: alert.concept,
                              title: alert.title,
                              misconceptionSummary: alert.message,
                              impactedCount: alert.impactedCount,
                            })
                          }
                          disabled={isGeneratingThis}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold transition-all cursor-pointer disabled:opacity-60"
                        >
                          {isGeneratingThis ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <FlaskConical className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {isGeneratingThis ? 'Generating...' : 'Generate Revision Lab'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTab('teacher-labs')}
                          className="text-cyan-300 hover:text-cyan-200 font-semibold text-[11px] px-2 py-1 cursor-pointer"
                        >
                          Take Action &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {renderGeneratedLabSection()}
        </div>
      )}

      {/* SECTION: Targeted Learning Labs */}
      {currentSection === 'teacher-labs' && (
        <div className="space-y-5">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-cyan-400" />
                Targeted Remedial Learning Labs
              </h3>
              <p className="text-xs text-slate-300">
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
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                      <span>{lab.concept}</span>
                      <span className="text-slate-300">{lab.durationMinutes} min</span>
                    </div>
                    <h4 className="text-xs font-bold text-white">{lab.title}</h4>
                    <p className="text-[11px] text-slate-200 leading-relaxed">{lab.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-900 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <span>{lab.assignedStatus}</span>
                      <span className="font-mono font-bold text-white tabular-nums">
                        {lab.completionRate}% Done
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                      <div
                        className="h-full bg-cyan-500"
                        style={{ width: `${lab.completionRate}%` }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAssignLab(lab.id)}
                      disabled={assignedLabId === lab.id}
                      className="w-full py-1.5 px-3 rounded-lg bg-cyan-600/30 hover:bg-cyan-600 text-cyan-200 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                    >
                      {assignedLabId === lab.id ? 'Lab Assigned!' : 'Assign to Class'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {renderGeneratedLabSection()}
        </div>
      )}

      {/* SECTION: Class Reports */}
      {currentSection === 'teacher-reports' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                Comprehensive Cohort Pedagogical Report
              </h3>
              <p className="text-xs text-slate-300">
                Generated {TEACHER_CLASS_DATA.classReports?.generatedDate} • Class 10 - Section B
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div className="text-[11px] text-slate-300">Exam Readiness</div>
                <div className="text-xl font-mono font-bold text-emerald-400 tabular-nums">
                  {TEACHER_CLASS_DATA.classReports?.examReadinessScore}%
                </div>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="no-print flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-cyan-300" />
                <span>Print Report</span>
              </button>

              <button
                type="button"
                onClick={handleExportClassReport}
                className="no-print flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Identified Class Strengths</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-200">
                {TEACHER_CLASS_DATA.classReports?.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Critical Vulnerabilities</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-200">
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
            <div className="text-[10px] uppercase font-bold text-slate-300">
              Recommended Curriculum Pacing Advice:
            </div>
            <p className="text-slate-200 leading-relaxed font-medium">
              {TEACHER_CLASS_DATA.classReports?.recommendedPacing}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
