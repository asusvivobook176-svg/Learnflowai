import React, { useState } from 'react';
import { useLearner } from '../context/LearnerContext';
import { DailyGoalType } from '../types/learning';
import {
  Target,
  Clock,
  CheckCircle2,
  SlidersHorizontal,
  Plus,
  Minus,
  ArrowRight,
  Check,
  X,
} from 'lucide-react';

interface DailyGoalTrackerProps {
  onStartPractice: () => void;
}

const MINUTE_PRESETS = [10, 15, 20, 30, 45];
const QUESTION_PRESETS = [3, 5, 8, 10, 15];

export const DailyGoalTracker: React.FC<DailyGoalTrackerProps> = ({ onStartPractice }) => {
  const { profile, updateDailyGoal, logStudyMinutes } = useLearner();

  const dailyGoal = profile.dailyGoal || {
    goalType: 'questions' as DailyGoalType,
    targetMinutes: 20,
    targetQuestions: 5,
    minutesPracticedToday: 12,
    questionsAnsweredToday: 3,
    lastGoalDate: new Date().toISOString().split('T')[0],
  };

  const [isEditing, setIsEditing] = useState(false);
  const [draftGoalType, setDraftGoalType] = useState<DailyGoalType>(dailyGoal.goalType);
  const [draftMinutes, setDraftMinutes] = useState<number>(dailyGoal.targetMinutes);
  const [draftQuestions, setDraftQuestions] = useState<number>(dailyGoal.targetQuestions);

  const activeType = dailyGoal.goalType;
  const currentValue =
    activeType === 'minutes' ? dailyGoal.minutesPracticedToday : dailyGoal.questionsAnsweredToday;
  const targetValue =
    activeType === 'minutes' ? dailyGoal.targetMinutes : dailyGoal.targetQuestions;

  const rawPct = targetValue > 0 ? Math.round((currentValue / targetValue) * 100) : 0;
  const clampedPct = Math.max(0, Math.min(100, rawPct));
  const isGoalReached = currentValue >= targetValue;
  const remaining = Math.max(0, targetValue - currentValue);

  // SVG Ring geometry (radius 38, circumference ~238.76)
  const ringRadius = 38;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = ringCircumference * (1 - clampedPct / 100);

  const handleOpenEditor = () => {
    setDraftGoalType(dailyGoal.goalType);
    setDraftMinutes(dailyGoal.targetMinutes);
    setDraftQuestions(dailyGoal.targetQuestions);
    setIsEditing(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    updateDailyGoal({
      goalType: draftGoalType,
      targetMinutes: draftMinutes,
      targetQuestions: draftQuestions,
    });
    setIsEditing(false);
  };

  const handleQuickModeSwitch = (nextType: DailyGoalType) => {
    setDraftGoalType(nextType);
    updateDailyGoal({ goalType: nextType });
  };

  const draftValue = draftGoalType === 'minutes' ? draftMinutes : draftQuestions;
  const setDraftValue = (val: number) => {
    if (draftGoalType === 'minutes') {
      setDraftMinutes(Math.max(5, Math.min(240, val)));
    } else {
      setDraftQuestions(Math.max(1, Math.min(50, val)));
    }
  };
  const stepAmount = draftGoalType === 'minutes' ? 5 : 1;
  const presets = draftGoalType === 'minutes' ? MINUTE_PRESETS : QUESTION_PRESETS;

  return (
    <section
      aria-label="Daily Learning Goal Tracker"
      className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-5"
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`p-1.5 rounded-lg ${
                isGoalReached
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-indigo-500/15 text-indigo-400'
              }`}
            >
              {isGoalReached ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Target className="w-4 h-4" />
              )}
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white">Daily Learning Goal</h3>
            <span className="text-slate-600 text-xs" aria-hidden="true">
              ·
            </span>
            <span
              className={`text-xs font-semibold ${
                isGoalReached ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              {isGoalReached ? 'Completed for Today' : 'In Progress'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {isGoalReached
              ? `Target reached (${currentValue} ${
                  activeType === 'minutes' ? 'min' : 'questions'
                } logged today). Extra practice boosts retention.`
              : `${remaining} more ${
                  activeType === 'minutes'
                    ? remaining === 1
                      ? 'minute'
                      : 'minutes'
                    : remaining === 1
                    ? 'question'
                    : 'questions'
                } to reach today's target.`}
          </p>
        </div>

        {/* Mode Segmented Toggle + Edit Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div
            role="group"
            aria-label="Daily goal metric"
            className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800"
          >
            <button
              type="button"
              onClick={() => handleQuickModeSwitch('minutes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeType === 'minutes'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Minutes</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickModeSwitch('questions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeType === 'questions'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Questions</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => (isEditing ? setIsEditing(false) : handleOpenEditor())}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isEditing ? 'Close' : 'Set Goal'}</span>
          </button>
        </div>
      </div>

      {/* Main Progress Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center pt-1">
        {/* Ring Visualization */}
        <div className="md:col-span-4 flex items-center gap-4">
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96" aria-hidden="true">
              <circle
                cx="48"
                cy="48"
                r={ringRadius}
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-800"
              />
              <circle
                cx="48"
                cy="48"
                r={ringRadius}
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={strokeDashoffset}
                className={`transition-all duration-500 ${
                  isGoalReached ? 'text-emerald-400' : 'text-indigo-500'
                }`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-extrabold text-white font-mono tabular-nums">
                {clampedPct}%
              </span>
            </div>
          </div>

          <div className="space-y-1 min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {activeType === 'minutes' ? 'Practice Time' : 'Questions Solved'}
            </div>
            <div className="text-2xl font-extrabold text-white font-mono tabular-nums">
              {currentValue}
              <span className="text-sm font-semibold text-slate-400">
                {' '}
                / {targetValue} {activeType === 'minutes' ? 'min' : 'qs'}
              </span>
            </div>
            <div className="text-xs text-slate-400 tabular-nums">
              <span>{dailyGoal.minutesPracticedToday} min practiced</span>
              <span aria-hidden="true"> · </span>
              <span>{dailyGoal.questionsAnsweredToday} solved today</span>
            </div>
          </div>
        </div>

        {/* Linear Milestone Progress Bar + Actions */}
        <div className="md:col-span-8 space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono tabular-nums">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span className={isGoalReached ? 'text-emerald-400 font-bold' : ''}>100% Goal</span>
            </div>

            <div
              role="progressbar"
              aria-valuenow={clampedPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Daily learning goal progress"
              className="relative w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden"
            >
              <div
                style={{ width: `${clampedPct}%` }}
                className={`h-full rounded-full transition-all duration-500 ${
                  isGoalReached
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-400'
                }`}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => logStudyMinutes(5)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                title="Log 5 minutes of offline notes or concept review"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                <span>Log +5 min study</span>
              </button>
              <span className="text-[11px] text-slate-500">
                Auto-updates as you solve drills &amp; voice sessions
              </span>
            </div>

            <button
              type="button"
              onClick={onStartPractice}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Practice Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Inline Goal Configurator */}
      {isEditing && (
        <form
          onSubmit={handleSaveGoal}
          className="pt-4 border-t border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
        >
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-200">
              Choose today's {draftGoalType === 'minutes' ? 'practice duration (minutes)' : 'question target'}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDraftValue(preset)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    draftValue === preset
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {preset} {draftGoalType === 'minutes' ? 'min' : 'qs'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1">
              <button
                type="button"
                aria-label="Decrease target"
                onClick={() => setDraftValue(draftValue - stepAmount)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="number"
                aria-label={
                  draftGoalType === 'minutes' ? 'Target minutes of practice' : 'Target questions answered'
                }
                min={draftGoalType === 'minutes' ? 5 : 1}
                max={draftGoalType === 'minutes' ? 240 : 50}
                value={draftValue}
                onChange={(e) => setDraftValue(Number(e.target.value) || (draftGoalType === 'minutes' ? 5 : 1))}
                className="w-16 bg-transparent text-center text-sm font-mono font-bold text-white focus:outline-none tabular-nums"
              />
              <button
                type="button"
                aria-label="Increase target"
                onClick={() => setDraftValue(draftValue + stepAmount)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Goal</span>
            </button>
          </div>
        </form>
      )}
    </section>
  );
};
