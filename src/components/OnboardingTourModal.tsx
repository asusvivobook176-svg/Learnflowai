import React, { useState, useEffect } from 'react';
import { Mic, Network, CalendarCheck2, ArrowRight, ArrowLeft, X, Sparkles } from 'lucide-react';

interface OnboardingTourModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onNavigateTab?: (tab: string) => void;
}

const STEPS = [
  {
    title: '1. Voice-First Adaptive Tutoring',
    subtitle: 'Learn Naturally with Wispr Flow',
    description:
      'Speak naturally—even with pauses or self-corrections—or narrate your reasoning inside Adaptive Practice. LearnFlow detects misconceptions from how you think, calibrates question difficulty, and adapts mastery in real time.',
    highlight: 'Difficulty Calibrator adjusts Easy / Medium / Hard using your accuracy, response pace, and confidence.',
    icon: Mic,
    accent: 'text-indigo-300 bg-indigo-500/20 border-indigo-500/40',
  },
  {
    title: '2. Interactive Concept Graph & Prerequisites',
    subtitle: 'See How Topics Depend on Each Other',
    description:
      'Pan and zoom the Class 10 Electricity topology to inspect mastery per concept. When a topic struggles because an upstream foundation is weak, LearnFlow highlights the prerequisite chain and guides you there first.',
    highlight: 'Weak upstream prerequisites (like Ohm\'s Law or Resistance) are flagged before tackling Circuits & Power.',
    icon: Network,
    accent: 'text-cyan-300 bg-cyan-500/20 border-cyan-500/40',
  },
  {
    title: '3. Exam Readiness, Planner & Mastery Badges',
    subtitle: 'Structured Countdown & Verified Mastery',
    description:
      'Set your exam date in the Exam Planner to generate a day-by-day plan synced to your learner model. Once any concept reaches 80%+, unlock its 5-question Mastery Badge challenge across real-world and trap problems.',
    highlight: 'Your Readiness Score tracks Mastery, Retention, Misconceptions, and Confidence Calibration.',
    icon: CalendarCheck2,
    accent: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40',
  },
];

export const OnboardingTourModal: React.FC<OnboardingTourModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    setStepIdx(0);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onComplete();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  const step = STEPS[stepIdx];
  const Icon = step.icon;
  const isLast = stepIdx === STEPS.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-tour-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
    >
      <div className="max-w-lg w-full rounded-3xl bg-slate-900 border border-indigo-500/40 shadow-2xl p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={`p-2.5 rounded-2xl border ${step.accent}`}>
              <Icon className="w-5 h-5" />
            </span>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Quick Tour · Step {stepIdx + 1} of {STEPS.length}</span>
              </div>
              <h2 id="onboarding-tour-title" className="text-base sm:text-lg font-bold text-white mt-0.5">
                {step.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onComplete}
            aria-label="Skip onboarding tour"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="text-xs font-semibold text-cyan-300">{step.subtitle}</div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {step.description}
          </p>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            {step.highlight}
          </div>
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-2 pt-1">
          {STEPS.map((s, idx) => (
            <button
              key={s.title}
              onClick={() => setStepIdx(idx)}
              aria-label={`Go to tour step ${idx + 1}`}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === stepIdx ? 'w-7 bg-indigo-500' : 'w-2 bg-slate-700 hover:bg-slate-600'
              }`}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={onComplete}
            className="text-xs text-slate-300 hover:text-white font-medium px-2 py-1.5 cursor-pointer"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            {stepIdx > 0 && (
              <button
                onClick={() => setStepIdx((s) => Math.max(0, s - 1))}
                className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={() => {
                if (isLast) {
                  onComplete();
                } else {
                  setStepIdx((s) => s + 1);
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              <span>{isLast ? 'Finish Tour' : 'Next'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
