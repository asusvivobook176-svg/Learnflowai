import React from 'react';
import { useLearner } from '../context/LearnerContext';
import { CONCEPTS } from '../data/syllabus';
import {
  TrendingUp,
  Award,
  Calendar,
  Clock,
  History,
  Target,
  Brain,
  Zap,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const ProgressView: React.FC = () => {
  const { profile, resetToDemoAlex } = useLearner();

  // Aggregate history across all concepts
  const allHistory = Object.entries(profile.masteryByConcept).flatMap(
    ([conceptId, mastery]) =>
      mastery.history.map((h) => ({
        ...h,
        conceptId,
        conceptName: CONCEPTS.find((c) => c.id === conceptId)?.name || conceptId,
      }))
  ).sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Living Learner Model Progress &amp; Audit Trail
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Transparent view into how the Learner Model Agent updates mastery scores and tracks learning history.
          </p>
        </div>

        <button
          onClick={resetToDemoAlex}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          Reset Demo Benchmark
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Weighted Average Mastery</div>
          <div className="text-2xl font-extrabold text-indigo-400 font-mono">
            {profile.overallMastery}%
          </div>
          <div className="text-[11px] text-slate-500">Target for Grade 10: &ge;80%</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Total Practice Attempts</div>
          <div className="text-2xl font-extrabold text-cyan-400 font-mono">
            {profile.totalQuestionsAnswered}
          </div>
          <div className="text-[11px] text-slate-500">Across 7 core syllabus nodes</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Voice Reasonings Analyzed</div>
          <div className="text-2xl font-extrabold text-purple-400 font-mono">
            {profile.totalVoiceNotesCount}
          </div>
          <div className="text-[11px] text-slate-500">Wispr Flow verbal thoughts</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Retention Consistency</div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            {profile.streakDays} Days
          </div>
          <div className="text-[11px] text-slate-500">Daily spaced practice active</div>
        </div>
      </div>

      {/* Concept Comparison Breakdown */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-400" />
          Concept Mastery Breakdown &amp; Status
        </h3>

        <div className="space-y-3">
          {CONCEPTS.map((c) => {
            const m = profile.masteryByConcept[c.id];
            const score = m ? m.masteryPercentage : 0;
            const accuracy = m && m.questionsAttempted > 0
              ? Math.round((m.questionsCorrect / m.questionsAttempted) * 100)
              : 0;

            return (
              <div
                key={c.id}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <span className="text-xs font-bold text-slate-200">{c.name}</span>
                    <span className="text-[10px] text-slate-400 ml-2">({c.category})</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-slate-400">
                      Accuracy: <strong className="text-slate-200">{accuracy}%</strong> ({m?.questionsCorrect || 0}/{m?.questionsAttempted || 0})
                    </span>
                    <span className="font-bold text-white">{score}%</span>
                  </div>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${score}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      score >= 75
                        ? 'bg-emerald-500'
                        : score >= 50
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit Trail Log */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            Audit Trail: Real-Time Score Updates
          </h3>
          <span className="text-xs text-slate-400">Immutable scoring history</span>
        </div>

        <div className="space-y-2.5 max-h-80 overflow-y-auto custom-scrollbar pr-1">
          {allHistory.slice(0, 10).map((h, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between gap-3"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200">{h.conceptName}</span>
                  <span className="text-[10px] text-slate-500">• {h.date}</span>
                </div>
                <p className="text-[11px] text-slate-400">{h.reason}</p>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                    h.scoreDelta > 0
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-rose-500/10 text-rose-400'
                  }`}
                >
                  {h.scoreDelta > 0 ? '+' : ''}
                  {h.scoreDelta}%
                </span>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Result: {h.newScore}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
