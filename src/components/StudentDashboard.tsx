import React, { useMemo, useState } from 'react';
import { useLearner } from '../context/LearnerContext';
import { CONCEPTS } from '../data/syllabus';
import { calculateExamReadiness, computeNextBestStep } from '../utils/intelligence';
import { WisprFlowBar } from './WisprFlowBar';
import { WhyAmISeeingThis } from './WhyAmISeeingThis';
import { DailyGoalTracker } from './DailyGoalTracker';
import { MasteryBadgeModal } from './MasteryBadgeModal';
import {
  Sparkles,
  Flame,
  Award,
  AlertTriangle,
  Target,
  ArrowRight,
  TrendingUp,
  Brain,
  CheckCircle2,
  Clock,
  CalendarCheck2,
  FileCheck2,
  Network,
  Compass,
  Gauge,
  Rocket,
  ShieldCheck,
} from 'lucide-react';

interface StudentDashboardProps {
  onOpenVoiceWithPrompt: (prompt: string) => void;
  onSelectConceptForPractice: (conceptId: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onOpenVoiceWithPrompt,
  onSelectConceptForPractice,
}) => {
  const { profile, setActiveTab, completeRevisionTask } = useLearner();
  const [badgeModalConcept, setBadgeModalConcept] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const conceptsList = CONCEPTS.map((c) => ({
    ...c,
    mastery: profile.masteryByConcept[c.id]?.masteryPercentage ?? 50,
    status: profile.masteryByConcept[c.id]?.status ?? 'developing',
    attempted: profile.masteryByConcept[c.id]?.questionsAttempted ?? 0,
  }));

  const masteredCount = conceptsList.filter((c) => c.mastery >= 75).length;
  const attentionCount = conceptsList.filter((c) => c.mastery < 50).length;

  const todayTasks = profile.revisionSchedule.filter((t) => t.dueDate === 'Today');
  const activeMisconception = profile.misconceptions.find((m) => m.status === 'active');

  const readiness = useMemo(() => calculateExamReadiness(profile), [profile]);
  const nextBest = useMemo(() => computeNextBestStep(profile), [profile]);

  const earnedBadges = profile.masteryBadges || [];
  const eligibleForBadge = conceptsList.filter(
    (c) => c.mastery >= 80 && !earnedBadges.some((b) => b.conceptId === c.id)
  );

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 75) {
      return {
        bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        label: 'Mastered',
        bar: 'bg-emerald-500',
      };
    }
    if (percentage >= 50) {
      return {
        bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        label: 'Developing',
        bar: 'bg-amber-500',
      };
    }
    return {
      bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      label: 'Needs Focus',
      bar: 'bg-rose-500',
    };
  };

  return (
    <div className="space-y-6">
      {/* 1. Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/30 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Living Learner Model Active • Class 10 Physics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {profile.name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              &quot;Your voice-powered AI tutor that learns how you learn.&quot; Speak with Wispr Flow anytime to clear doubts or diagnose your conceptual reasoning.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              onClick={() => setActiveTab('diagnostic')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 text-xs font-semibold shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <FileCheck2 className="w-4 h-4 text-indigo-300" />
              <span>Diagnostic Assessment</span>
            </button>

            <button
              onClick={() => {
                onSelectConceptForPractice('series-circuits');
                setActiveTab('practice');
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer whitespace-nowrap"
            >
              <Target className="w-4 h-4" />
              <span>Target Weak Concept</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1b. Next Best Step Hero Card + Readiness & Badges Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Next Best Step Hero Card (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-gradient-to-br from-cyan-950/45 via-slate-900 to-slate-900 border border-cyan-500/35 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                <Rocket className="w-3.5 h-3.5" />
                <span>Next Best Step</span>
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-500/30">
                {nextBest.badgeText} · ~{nextBest.estimatedMinutes} min
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
              {nextBest.title}
            </h2>
            <p className="text-xs text-slate-200 leading-relaxed">{nextBest.reason}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                if (nextBest.targetConceptId && nextBest.targetTab === 'practice') {
                  onSelectConceptForPractice(nextBest.targetConceptId);
                } else {
                  setActiveTab(nextBest.targetTab);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <span>{nextBest.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActiveTab('concept-map')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer"
            >
              Inspect Concept Graph
            </button>
          </div>
        </div>

        {/* Exam Readiness & Mastery Badges Summary (5 cols) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5">
          {/* Exam Readiness Card */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                <Gauge className="w-3.5 h-3.5" />
                <span>Exam Readiness</span>
              </div>
              <div className="text-2xl font-mono tabular-nums font-extrabold text-white">
                {readiness.totalScore}
                <span className="text-xs font-normal text-slate-300"> / 100</span>
              </div>
              <p className="text-[11px] text-slate-300">
                {profile.examPlan?.needsUpdate
                  ? 'Plan update available — sync now'
                  : profile.examPlan
                  ? `${profile.examPlan.days.length}-day countdown active`
                  : 'Build your day-by-day countdown'}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('exam-planner')}
              className="px-3.5 py-2 rounded-xl bg-indigo-600/25 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/35 text-xs font-bold shrink-0 cursor-pointer"
            >
              Exam Planner
            </button>
          </div>

          {/* Mastery Badges Card */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-300">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Mastery Badges</span>
              </div>
              <div className="text-2xl font-mono tabular-nums font-extrabold text-white">
                {earnedBadges.length}
                <span className="text-xs font-normal text-slate-300"> / {CONCEPTS.length} earned</span>
              </div>
              <p className="text-[11px] text-slate-300">
                {eligibleForBadge.length > 0
                  ? `${eligibleForBadge[0].name} (${eligibleForBadge[0].mastery}%) ready for 5-Q test!`
                  : 'Reach 80%+ in any concept to unlock'}
              </p>
            </div>
            {eligibleForBadge.length > 0 ? (
              <button
                onClick={() =>
                  setBadgeModalConcept({
                    id: eligibleForBadge[0].id,
                    name: eligibleForBadge[0].name,
                  })
                }
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shrink-0 cursor-pointer"
              >
                Claim {eligibleForBadge[0].name.split(' ')[0]} Badge
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('progress')}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shrink-0 cursor-pointer"
              >
                View Badges
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Quick Voice Input Bar (Wispr Flow) */}
      <WisprFlowBar onOpenVoiceWithPrompt={onOpenVoiceWithPrompt} />

      {/* 3. Learning Overview KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-300 text-xs">
            <span>Overall Mastery</span>
            <Award className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
            {profile.overallMastery}%
          </div>
          <div className="text-[11px] text-emerald-300 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3 h-3" />
            <span>Model v{profile.learnerModelVersion || 1}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-300 text-xs">
            <span>Mastered (&ge;75%)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">
            {masteredCount} <span className="text-sm font-normal text-slate-300">/ 7</span>
          </div>
          <div className="text-[11px] text-slate-300">Ohm&apos;s Law &amp; Current</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-300 text-xs">
            <span>Needs Attention</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono tabular-nums">
            {attentionCount}
          </div>
          <div className="text-[11px] text-slate-300">Series &amp; Parallel Circuits</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-300 text-xs">
            <span>Questions Solved</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono tabular-nums">
            {profile.totalQuestionsAnswered}
          </div>
          <div className="text-[11px] text-slate-300">
            {profile.totalVoiceNotesCount} voice reasonings
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-300 text-xs">
            <span>Study Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono tabular-nums flex items-center gap-1.5">
            {profile.streakDays}
            <span className="text-sm font-semibold text-slate-300">Days</span>
          </div>
          <div className="text-[11px] text-slate-300">Keep momentum alive!</div>
        </div>
      </div>

      {/* 3b. Daily Learning Goal Tracker */}
      <DailyGoalTracker
        onStartPractice={() => {
          const weakest =
            [...conceptsList].sort((a, b) => a.mastery - b.mastery)[0]?.id || 'series-circuits';
          onSelectConceptForPractice(weakest);
          setActiveTab('practice');
        }}
      />

      {/* 4. Split Section: Concept Mastery Cards vs Today's Learning Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Concept Mastery Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Network className="w-4 h-4 text-indigo-400" />
                Living Concept Mastery Topology
              </h3>
              <p className="text-xs text-slate-300">
                Syllabus progress across all 7 Class 10 Electricity concepts.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('concept-map')}
              className="text-xs text-indigo-300 hover:text-indigo-200 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>Interactive Graph</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {conceptsList.map((c) => {
              const badge = getStatusBadge(c.mastery);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    onSelectConceptForPractice(c.id);
                    setActiveTab('practice');
                  }}
                  className="text-left p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-600 transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                        {c.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {c.name}
                    </h4>

                    <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
                      {c.shortDescription}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300">Mastery</span>
                      <span className="text-white font-mono tabular-nums font-bold">
                        {c.mastery}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${c.mastery}%` }}
                        className={`h-full rounded-full ${badge.bar} transition-all duration-500`}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column (5 cols): Today's Learning Plan & Recent AI Insights */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CalendarCheck2 className="w-4 h-4 text-amber-400" />
                Today&apos;s Learning Plan
              </h3>
              <button
                onClick={() => setActiveTab('revision')}
                className="text-xs text-slate-300 hover:text-white cursor-pointer"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {todayTasks.length > 0 ? (
                todayTasks.slice(0, 3).map((task) => {
                  const recData: import('../types/learning').Recommendation = {
                    id: `rec-dash-${task.id}`,
                    concept: task.conceptName,
                    conceptId: task.conceptId,
                    type:
                      task.taskType === 'misconception_clear'
                        ? 'misconception_fix'
                        : 'spaced_revision',
                    priority: task.priority,
                    reasons: [
                      task.reason,
                      `Current mastery on ${task.conceptName} is ${
                        profile.masteryByConcept[task.conceptId]?.masteryPercentage || 40
                      }%.`,
                      `Spaced repetition scheduler flagged retention decay risk.`,
                    ],
                    supportingData: {
                      currentMastery:
                        profile.masteryByConcept[task.conceptId]?.masteryPercentage || 40,
                      recentIncorrectAnswers: 1,
                      activeMisconceptionsCount: task.taskType === 'misconception_clear' ? 1 : 0,
                      daysSinceReview: 2,
                      confidenceAvg: profile.masteryByConcept[task.conceptId]?.confidenceAverage,
                    },
                    suggestedAction: `Complete ${task.estimatedMinutes}-minute ${task.title}.`,
                    estimatedMinutes: task.estimatedMinutes,
                  };

                  return (
                    <div
                      key={task.id}
                      className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-indigo-300 uppercase">
                              {task.conceptName}
                            </span>
                            <span className="text-[10px] text-slate-300 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {task.estimatedMinutes}m
                            </span>
                          </div>
                          <h5 className="font-semibold text-slate-100">{task.title}</h5>
                        </div>

                        <button
                          onClick={() => {
                            completeRevisionTask(task.id);
                            setActiveTab('practice');
                          }}
                          aria-label={`Start ${task.title}`}
                          className="p-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white transition-all shrink-0 cursor-pointer"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="pt-1 flex items-center justify-between">
                        <WhyAmISeeingThis recommendation={recData} />
                        <button
                          onClick={() => {
                            completeRevisionTask(task.id);
                            onSelectConceptForPractice(task.conceptId);
                            setActiveTab('practice');
                          }}
                          className="text-[11px] text-indigo-300 hover:text-indigo-200 font-semibold cursor-pointer"
                        >
                          Start Drill
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-300">
                  All scheduled tasks for today are complete! Open the Exam Planner for upcoming days.
                </div>
              )}
            </div>
          </div>

          {/* Confidence Calibration Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
                  <Compass className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    How Well Do You Know What You Know?
                  </h4>
                  <span className="text-[10px] text-purple-200">
                    Confidence Calibration Engine
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('confidence-analysis')}
                className="text-xs text-purple-300 hover:text-purple-200 font-semibold cursor-pointer"
              >
                Analyze
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-[11px]">Self-Awareness Calibration</span>
                <span className="font-mono font-bold text-purple-200 text-sm">78% Calibrated</span>
              </div>
              <p className="text-[11px] text-slate-200 leading-relaxed">
                &quot;You understand <strong>Electrical Power</strong> better than you think, but watch out for an overconfidence gap on <strong>Series Circuits</strong>.&quot;
              </p>
            </div>

            <button
              onClick={() => setActiveTab('confidence-analysis')}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-100 hover:text-white text-xs font-semibold border border-purple-500/30 transition-all cursor-pointer"
            >
              <span>Explore Confidence Gap Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Misconception Highlight */}
          {activeMisconception && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300">
                    <AlertTriangle className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white">Active Misconception Detected</h4>
                    <span className="text-[10px] text-rose-200">
                      {activeMisconception.conceptName}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('misconceptions')}
                  className="text-xs text-rose-300 hover:text-rose-200 font-semibold cursor-pointer"
                >
                  Debunk
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                <p className="text-slate-200 italic mb-2">
                  &quot;{activeMisconception.studentExplanationSnippet}&quot;
                </p>
                <div className="text-rose-100 text-[11px] leading-relaxed">
                  <strong>Correction: </strong>
                  {activeMisconception.aiCorrection}
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectConceptForPractice(activeMisconception.conceptId);
                  setActiveTab('practice');
                }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/25 transition-all cursor-pointer"
              >
                <span>Clear this Misconception</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Recent AI Interaction Audit */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Brain className="w-3.5 h-3.5 text-cyan-400" />
              Recent AI Interaction Audit
            </h4>

            <div className="space-y-2">
              {profile.recentActivity.length > 0 ? (
                profile.recentActivity.slice(0, 2).map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-slate-300 text-[10px]">
                      <span className="font-semibold text-white">{act.title}</span>
                      <span>{act.timestamp}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{act.details}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-300">No recent activity yet—start a practice drill!</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {badgeModalConcept && (
        <MasteryBadgeModal
          isOpen={!!badgeModalConcept}
          conceptId={badgeModalConcept.id}
          conceptName={badgeModalConcept.name}
          onClose={() => setBadgeModalConcept(null)}
        />
      )}
    </div>
  );
};

