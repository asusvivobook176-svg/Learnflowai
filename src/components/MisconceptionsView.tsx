import React, { useState } from 'react';
import { useLearner } from '../context/LearnerContext';
import { Misconception } from '../types/learning';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface MisconceptionsViewProps {
  onPracticeMisconception?: (conceptId: string) => void;
}

export const MisconceptionsView: React.FC<MisconceptionsViewProps> = ({
  onPracticeMisconception,
}) => {
  const { profile, resolveMisconception, setActiveTab } = useLearner();
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [practicingId, setPracticingId] = useState<string | null>(null);

  const filteredMisconceptions = profile.misconceptions.filter((m) => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  const activeCount = profile.misconceptions.filter((m) => m.status === 'active').length;
  const resolvedCount = profile.misconceptions.filter((m) => m.status === 'resolved').length;

  const handleDebunkAction = (m: Misconception) => {
    setPracticingId(m.id);
    setTimeout(() => {
      resolveMisconception(m.id);
      setPracticingId(null);
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-rose-500/20 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Misconception Insights &amp; Diagnostics
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            LearnFlow AI pinpoints the mental models behind incorrect reasoning so you never repeat the same mistake.
          </p>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs">
            <span className="text-slate-400">Active: </span>
            <strong className="text-rose-400 font-mono">{activeCount}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
            <span className="text-slate-400">Resolved: </span>
            <strong className="text-emerald-400 font-mono">{resolvedCount}</strong>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {(['all', 'active', 'resolved'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
              filter === tab
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tab} Misconceptions
          </button>
        ))}
      </div>

      {/* Misconception Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMisconceptions.length > 0 ? (
          filteredMisconceptions.map((m) => {
            const isResolved = m.status === 'resolved';

            return (
              <div
                key={m.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                  isResolved
                    ? 'bg-slate-950/40 border-slate-800/80 opacity-75'
                    : 'bg-slate-900 border-slate-800 shadow-md shadow-slate-950/50 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                      {m.conceptName}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isResolved
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : m.severity === 'high'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {isResolved ? 'Resolved' : `${m.severity.toUpperCase()} Priority`}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-white leading-snug">
                    {m.title}
                  </h3>

                  {/* Student's Flawed Thinking Snippet */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block mb-1">
                      Detected Student Reasoning (Wispr Flow)
                    </span>
                    <p className="text-slate-300 italic text-xs">
                      "{m.studentExplanationSnippet}"
                    </p>
                  </div>

                  {/* AI Correction & Physical Truth */}
                  <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                      Physical Reality &amp; Correction
                    </span>
                    <p className="text-slate-200 text-xs leading-relaxed font-sans">
                      {m.aiCorrection}
                    </p>
                  </div>
                </div>

                {/* Footer & Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Encountered {m.timesEncountered} times</span>
                  </div>

                  {!isResolved ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDebunkAction(m)}
                        disabled={practicingId === m.id}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                      >
                        {practicingId === m.id ? 'Clearing...' : 'Mark Cleared'}
                      </button>

                      <button
                        onClick={() => {
                          if (onPracticeMisconception) {
                            onPracticeMisconception(m.conceptId);
                          } else {
                            setActiveTab('practice');
                          }
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                      >
                        <span>Target Drill</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-emerald-400 font-semibold text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Conceptual mastery verified</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 p-10 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">No Misconceptions in this View</h4>
            <p className="text-xs text-slate-400">
              Great job! Solve more questions or explain your thinking in practice mode to keep your diagnostics up to date.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
