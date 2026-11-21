import React, { useState, useMemo } from 'react';
import { useLearner } from '../context/LearnerContext';
import { CONCEPTS } from '../data/syllabus';
import {
  calculateExamReadiness,
  generateExamCountdownPlan,
} from '../utils/intelligence';
import {
  CalendarClock,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  Gauge,
  AlertTriangle,
  Clock,
  Target,
  ShieldCheck,
} from 'lucide-react';

interface ExamPlannerViewProps {
  onSelectConceptForPractice?: (conceptId: string) => void;
}

export const ExamPlannerView: React.FC<ExamPlannerViewProps> = ({
  onSelectConceptForPractice,
}) => {
  const { profile, saveExamPlan, toggleExamPlanTask, setActiveTab, showToast } = useLearner();

  const defaultExamDate = useMemo(() => {
    const d = new Date(Date.now() + 6 * 86400000);
    return d.toISOString().split('T')[0];
  }, []);

  const [examDateISO, setExamDateISO] = useState<string>(
    profile.examPlan?.examDateISO || defaultExamDate
  );
  const [selectedConcepts, setSelectedConcepts] = useState<string[]>(
    profile.examPlan?.selectedConceptIds || CONCEPTS.map((c) => c.id)
  );

  const readiness = useMemo(() => calculateExamReadiness(profile), [profile]);
  const existingPlan = profile.examPlan;

  const isPlanStale =
    !!existingPlan &&
    (existingPlan.needsUpdate ||
      existingPlan.generatedAtModelVersion !== (profile.learnerModelVersion || 1));

  const toggleConceptChoice = (id: string) => {
    setSelectedConcepts((prev) =>
      prev.includes(id)
        ? prev.length > 1
          ? prev.filter((c) => c !== id)
          : prev
        : [...prev, id]
    );
  };

  const handleGeneratePlan = (isRecalibration = false) => {
    const plan = generateExamCountdownPlan(profile, examDateISO, selectedConcepts);
    saveExamPlan(plan, !isRecalibration);
    showToast(
      isRecalibration
        ? 'Exam Countdown Plan updated to reflect your latest learner model!'
        : `Generated ${plan.days.length}-day Exam Countdown Plan.`,
      'success'
    );
  };

  const readinessColor =
    readiness.totalScore >= 80
      ? 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10'
      : readiness.totalScore >= 60
      ? 'text-amber-300 border-amber-500/40 bg-amber-500/10'
      : 'text-rose-300 border-rose-500/40 bg-rose-500/10';

  return (
    <div className="space-y-6">
      {/* 1. Exam Readiness Score Hero Panel */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-300">
              <Gauge className="w-4 h-4" />
              <span>Exam Readiness Engine</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-extrabold text-white">
              Exam Readiness &amp; Countdown Planner
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Your 0–100 readiness score combines concept mastery, retention freshness, unresolved misconceptions, and confidence calibration.
            </p>
          </div>

          <div className={`px-5 py-3.5 rounded-2xl border text-center shrink-0 ${readinessColor}`}>
            <div className="text-3xl font-mono font-extrabold tabular-nums">
              {readiness.totalScore}
              <span className="text-sm font-normal opacity-80"> / 100</span>
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider mt-0.5">
              Exam Readiness
            </div>
          </div>
        </div>

        {/* 4 Component Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.values(readiness.components).map((comp) => {
            const pct = Math.round((comp.score / comp.max) * 100);
            return (
              <div
                key={comp.label}
                className="p-4 rounded-2xl bg-slate-950/75 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{comp.label}</span>
                  <span className="font-mono font-bold text-white tabular-nums">
                    {comp.score}/{comp.max}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      pct >= 75 ? 'bg-emerald-500' : pct >= 55 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-300">{comp.detail}</p>
              </div>
            );
          })}
        </div>

        {/* Top 3 Highest-Impact Score-Boosting Actions */}
        <div className="space-y-2.5 pt-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Top 3 Actions That Raise Your Readiness Most
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {readiness.topActions.map((act, idx) => (
              <div
                key={act.id}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="font-bold text-indigo-300">Action #{idx + 1}</span>
                    <span className="font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      +{act.estimatedGainPoints} pts est.
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white leading-snug">{act.title}</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{act.reason}</p>
                </div>

                <button
                  onClick={() => {
                    if (act.targetConceptId && act.targetTab === 'practice' && onSelectConceptForPractice) {
                      onSelectConceptForPractice(act.targetConceptId);
                    } else {
                      setActiveTab(act.targetTab);
                    }
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-indigo-600/25 hover:bg-indigo-600 text-indigo-200 hover:text-white text-xs font-semibold border border-indigo-500/30 transition-all cursor-pointer"
                >
                  <span>Start ({act.estimatedMinutes}m)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Exam Countdown Planner Builder */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-cyan-400" />
              Exam Countdown Study Schedule
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Choose your exam date and target syllabus topics to generate a mixed weak-concept + spaced-review day-by-day plan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-200">
              <span className="font-semibold">Exam Date:</span>
              <input
                type="date"
                value={examDateISO}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setExamDateISO(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
              />
            </label>

            <button
              onClick={() => handleGeneratePlan(false)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{existingPlan ? 'Regenerate Plan' : 'Generate Countdown Plan'}</span>
            </button>
          </div>
        </div>

        {/* Concept Selection Checkboxes */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
            Selected Concepts ({selectedConcepts.length} / {CONCEPTS.length})
          </span>
          <div className="flex flex-wrap gap-2">
            {CONCEPTS.map((c) => {
              const checked = selectedConcepts.includes(c.id);
              const mastery = profile.masteryByConcept[c.id]?.masteryPercentage ?? 50;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() => toggleConceptChoice(c.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    checked
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] border ${
                      checked
                        ? 'bg-indigo-500 border-indigo-400 text-white'
                        : 'border-slate-600'
                    }`}
                  >
                    {checked ? '✓' : ''}
                  </span>
                  <span>{c.name}</span>
                  <span className="font-mono text-[10px] text-slate-300">{mastery}%</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stale Plan Banner when Learner Model Changed */}
        {isPlanStale && existingPlan && (
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-amber-200">
                  Plan Updated Alert — Your Learner Model Changed
                </div>
                <p className="text-slate-200 mt-0.5">
                  {existingPlan.lastModelChangeReason ||
                    'Concept mastery or misconceptions shifted since this plan was built.'}{' '}
                  Sync now to re-weight upcoming days automatically.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleGeneratePlan(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-sync Plan Now</span>
            </button>
          </div>
        )}

        {/* Day-by-Day Schedule or Empty State */}
        {existingPlan ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
              <span>
                Showing <strong className="text-white">{existingPlan.days.length}-day</strong> plan toward{' '}
                <strong className="text-cyan-300 font-mono">{existingPlan.examDateISO}</strong>
              </span>
              <span className="inline-flex items-center gap-1 text-emerald-300 text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>
                  {isPlanStale ? 'Model update detected — ready to sync' : 'Synced to latest learner model'}
                </span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {existingPlan.days.map((day) => (
                <div
                  key={day.dayNumber}
                  className="p-4 rounded-2xl bg-slate-950/75 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                        Day {day.dayNumber} · {day.dateLabel}
                      </span>
                      <h4 className="text-xs font-bold text-white">{day.theme}</h4>
                    </div>
                    <span className="text-[10px] font-mono text-slate-300">
                      {day.tasks.filter((t) => t.completed).length}/{day.tasks.length} done
                    </span>
                  </div>

                  <div className="space-y-2">
                    {day.tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-2.5 rounded-xl border text-xs flex items-start justify-between gap-2 ${
                          task.completed
                            ? 'bg-emerald-950/20 border-emerald-500/30 opacity-75'
                            : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <button
                            onClick={() => toggleExamPlanTask(day.dayNumber, task.id)}
                            aria-label={`Mark ${task.title} complete`}
                            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 cursor-pointer ${
                              task.completed
                                ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                                : 'border-slate-600 text-transparent hover:border-indigo-400'
                            }`}
                          >
                            ✓
                          </button>
                          <div>
                            <div
                              className={`font-semibold ${
                                task.completed ? 'line-through text-slate-400' : 'text-slate-100'
                              }`}
                            >
                              {task.title}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-300 mt-0.5">
                              <span className="capitalize">
                                {task.focusType.replace('_', ' ')}
                              </span>
                              <span>·</span>
                              <span className="flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                {task.estimatedMinutes}m
                              </span>
                            </div>
                          </div>
                        </div>

                        {!task.completed && (
                          <button
                            onClick={() => {
                              if (onSelectConceptForPractice) {
                                onSelectConceptForPractice(task.conceptId);
                              } else {
                                setActiveTab('practice');
                              }
                            }}
                            aria-label={`Practice ${task.conceptName}`}
                            className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-colors shrink-0 cursor-pointer"
                          >
                            <Target className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-center space-y-3">
            <CalendarClock className="w-9 h-9 text-indigo-400 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">No Exam Countdown Plan Yet</h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Pick your upcoming physics exam date above and click Generate Countdown Plan to build a day-by-day schedule tailored to your weak topics.
              </p>
            </div>
            <button
              onClick={() => handleGeneratePlan(false)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Generate Default 7-Day Plan</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
