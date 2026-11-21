import React, { useState } from 'react';
import { Recommendation } from '../types/learning';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Brain,
  Sparkles,
  Target,
  Clock,
  AlertTriangle,
  Award,
  ArrowRight,
} from 'lucide-react';

interface WhyAmISeeingThisProps {
  recommendation: Recommendation;
  variant?: 'button' | 'card' | 'inline';
  onActionClick?: () => void;
}

export const WhyAmISeeingThis: React.FC<WhyAmISeeingThisProps> = ({
  recommendation,
  variant = 'button',
  onActionClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getPriorityBadge = (p: Recommendation['priority']) => {
    switch (p) {
      case 'high':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'medium':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <div className="text-left font-sans">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/50 text-[11px] font-semibold text-indigo-300 hover:text-indigo-200 border border-indigo-500/25 hover:border-indigo-500/40 transition-all cursor-pointer group"
      >
        <Brain className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
        <span>Why am I seeing this?</span>
        {isOpen ? (
          <ChevronUp className="w-3 h-3 text-indigo-400" />
        ) : (
          <ChevronDown className="w-3 h-3 text-indigo-400" />
        )}
      </button>

      {/* Expandable Explanation Panel */}
      {isOpen && (
        <div className="mt-2.5 p-4 rounded-xl bg-slate-950/95 border border-indigo-500/30 shadow-xl space-y-3.5 animate-in fade-in slide-in-from-top-1 duration-200 text-xs">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Explainable AI Recommendation</span>
                  <span
                    className={`text-[9px] uppercase font-bold px-2 py-0.2 rounded-full border ${getPriorityBadge(
                      recommendation.priority
                    )}`}
                  >
                    {recommendation.priority} Priority
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Grounding: Concept "{recommendation.concept}"
                </div>
              </div>
            </div>
            <div className="text-right text-[10px] text-slate-400 font-mono">
              ~{recommendation.estimatedMinutes} mins
            </div>
          </div>

          {/* Numbered Factors */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Reasons Determined by Living Learner Model:
            </span>
            <ol className="space-y-1 text-slate-300 list-decimal list-inside leading-relaxed text-[11px]">
              {recommendation.reasons.map((reason, idx) => (
                <li key={idx} className="pl-1">
                  <span className="text-slate-200">{reason}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Supporting Learner Data Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[10px]">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-slate-500">Current Mastery</div>
              <div className="font-mono font-bold text-white text-xs">
                {recommendation.supportingData.currentMastery}%
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-slate-500">Recent Friction</div>
              <div className="font-mono font-bold text-rose-400 text-xs">
                {recommendation.supportingData.recentIncorrectAnswers} incorrect
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-slate-500">Active Misconceptions</div>
              <div className="font-mono font-bold text-amber-400 text-xs">
                {recommendation.supportingData.activeMisconceptionsCount} detected
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-slate-500">Days Since Review</div>
              <div className="font-mono font-bold text-indigo-400 text-xs">
                {recommendation.supportingData.daysSinceReview} days ago
              </div>
            </div>
          </div>

          {/* Suggested Action Bar */}
          <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold text-indigo-300 uppercase block">
                Suggested Action
              </span>
              <p className="text-[11px] text-slate-200">
                {recommendation.suggestedAction}
              </p>
            </div>

            {onActionClick && (
              <button
                onClick={onActionClick}
                className="self-end sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Take Action</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
