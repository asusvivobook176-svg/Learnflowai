import React from 'react';
import { useLearner } from '../context/LearnerContext';
import { CONCEPTS } from '../data/syllabus';
import { WisprFlowBar } from './WisprFlowBar';
import { WhyAmISeeingThis } from './WhyAmISeeingThis';
import { DailyGoalTracker } from './DailyGoalTracker';
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
  Mic,
  CalendarCheck2,
  FileCheck2,
  Network,
  Compass,
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

  // Metrics computation
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

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 75) {
      return {
        bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        label: 'Mastered',
        bar: 'bg-emerald-500',
      };
    }
    if (percentage >= 50) {
      return {
        bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        label: 'Developing',
        bar: 'bg-amber-500',
      };
    }
    return {
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Living Learner Model Active • Class 10 Physics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {profile.name}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              "Your voice-powered AI tutor that learns how you learn." Speak with Wispr Flow anytime to clear doubts or diagnose your conceptual reasoning.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              onClick={() => setActiveTab('diagnostic')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <FileCheck2 className="w-4 h-4 text-indigo-400" />
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

      {/* 2. Quick Voice Input Bar (Wispr Flow) */}
      <WisprFlowBar onOpenVoiceWithPrompt={onOpenVoiceWithPrompt} />

      {/* 3. Learning Overview KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Overall Mastery */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Overall Mastery</span>
            <Award className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {profile.overallMastery}%
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3 h-3" />
            <span>+4% this week</span>
          </div>
        </div>

        {/* Concepts Mastered */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Mastered (≥75%)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
            {masteredCount} <span className="text-sm font-normal text-slate-500">/ 7</span>
          </div>
          <div className="text-[11px] text-slate-400">Ohm's Law &amp; Current</div>
        </div>

        {/* Concepts Needing Attention */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Needs Attention</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono">
            {attentionCount}
          </div>
          <div className="text-[11px] text-slate-400">Series &amp; Parallel Circuits</div>
        </div>

        {/* Questions Completed */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Questions Solved</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">
            {profile.totalQuestionsAnswered}
          </div>
          <div className="text-[11px] text-slate-400">{profile.totalVoiceNotesCount} voice reasonings</div>
        </div>

        {/* Study Streak */}
        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Study Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono flex items-center gap-1.5">
            {profile.streakDays}
            <span className="text-sm font-semibold text-slate-400">Days</span>
          </div>
          <div className="text-[11px] text-slate-400">Keep momentum alive!</div>
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
        {/* Left Column (8 cols): Concept Mastery Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Network className="w-4 h-4 text-indigo-400" />
                Living Concept Mastery Topology
              </h3>
              <p className="text-xs text-slate-400">
                Syllabus progress across all 7 Class 10 Electricity concepts.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('concept-map')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>Interactive Graph</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {conceptsList.map((c) => {
              const badge = getStatusBadge(c.mastery);
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    onSelectConceptForPractice(c.id);
                    setActiveTab('practice');
                  }}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
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

                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {c.shortDescription}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Mastery</span>
                      <span className="text-white font-mono font-bold">{c.mastery}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${c.mastery}%` }}
                        className={`h-full rounded-full ${badge.bar} transition-all duration-500`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (5 cols): Today's Learning Plan & Recent AI Insights */}
        <div className="lg:col-span-5 space-y-5">
          {/* Today's Learning Plan Card with Explainable AI */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CalendarCheck2 className="w-4 h-4 text-amber-400" />
                Today's Learning Plan
              </h3>
              <button
                onClick={() => setActiveTab('revision')}
                className="text-xs text-slate-400 hover:text-white"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {todayTasks.slice(0, 3).map((task) => {
                const recData: import('../types/learning').Recommendation = {
                  id: `rec-dash-${task.id}`,
                  concept: task.conceptName,
                  conceptId: task.conceptId,
                  type: task.taskType === 'misconception_clear' ? 'misconception_fix' : 'spaced_revision',
                  priority: task.priority,
                  reasons: [
                    task.reason,
                    `Current mastery on ${task.conceptName} is ${profile.masteryByConcept[task.conceptId]?.masteryPercentage || 40}%.`,
                    `Spaced repetition scheduler flagged retention decay risk.`,
                  ],
                  supportingData: {
                    currentMastery: profile.masteryByConcept[task.conceptId]?.masteryPercentage || 40,
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
                          <span className="text-[10px] font-bold text-indigo-400 uppercase">
                            {task.conceptName}
                          </span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
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
                        className="p-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-all shrink-0 cursor-pointer"
                        title="Start Task"
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
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        Start Drill
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* New Card: "How Well Do You Know What You Know?" (Feature 3) */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                  <Compass className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    How Well Do You Know What You Know?
                  </h4>
                  <span className="text-[10px] text-purple-300">
                    Confidence Calibration Engine
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('confidence-analysis')}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
              >
                Analyze
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Self-Awareness Calibration</span>
                <span className="font-mono font-bold text-purple-300 text-sm">78% Calibrated</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                "You understand <strong>Electrical Power</strong> better than you think, but watch out for an overconfidence gap on <strong>Series Circuits</strong>."
              </p>
            </div>

            <button
              onClick={() => setActiveTab('confidence-analysis')}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white text-xs font-semibold border border-purple-500/30 transition-all cursor-pointer"
            >
              <span>Explore Confidence Gap Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Recent AI Misconception Highlight */}
          {activeMisconception && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                    <AlertTriangle className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white">Active Misconception Detected</h4>
                    <span className="text-[10px] text-rose-300">
                      {activeMisconception.conceptName}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('misconceptions')}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                >
                  Debunk
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                <p className="text-slate-300 italic mb-2">
                  "{activeMisconception.studentExplanationSnippet}"
                </p>
                <div className="text-rose-200/90 text-[11px] leading-relaxed">
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

          {/* Recent Voice Notes & Activity */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Brain className="w-3.5 h-3.5 text-cyan-400" />
              Recent AI Interaction Audit
            </h4>

            <div className="space-y-2">
              {profile.recentActivity.slice(0, 2).map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span className="font-semibold text-slate-300">{act.title}</span>
                    <span>{act.timestamp}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {act.details}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
