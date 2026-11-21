import React, { useState, useEffect } from 'react';
import { useLearner } from '../context/LearnerContext';
import { Question } from '../types/learning';
import { Award, CheckCircle2, XCircle, X, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

interface MasteryBadgeModalProps {
  isOpen: boolean;
  conceptId: string;
  conceptName: string;
  onClose: () => void;
}

export const MasteryBadgeModal: React.FC<MasteryBadgeModalProps> = ({
  isOpen,
  conceptId,
  conceptName,
  onClose,
}) => {
  const { awardMasteryBadge, showToast } = useLearner();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const loadChallenge = async () => {
      setIsLoading(true);
      setQuestions([]);
      setCurrentIndex(0);
      setAnswers({});
      setIsCompleted(false);

      try {
        const res = await fetch('/api/mastery-challenge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conceptId, conceptName }),
        });
        const data = await res.json();
        if (Array.isArray(data?.questions) && data.questions.length === 5) {
          setQuestions(data.questions);
          if (data.usedFallback && data.fallbackNotice) {
            showToast(data.fallbackNotice, 'info');
          }
        } else {
          throw new Error('Challenge shape invalid');
        }
      } catch {
        showToast('Could not reach live AI generator; please retry in a moment.', 'warning');
      } finally {
        setIsLoading(false);
      }
    };

    loadChallenge();
  }, [isOpen, conceptId, conceptName]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentQuestion = questions[currentIndex];
  const selectedForCurrent = currentQuestion ? answers[currentQuestion.id] : undefined;

  const handleFinish = () => {
    const correctCount = questions.filter(
      (q) => answers[q.id] === q.correctOptionId
    ).length;
    const scorePercentage = Math.round((correctCount / (questions.length || 5)) * 100);
    setIsCompleted(true);

    if (scorePercentage >= 80) {
      awardMasteryBadge({
        conceptId,
        conceptName,
        scorePercentage,
        correctCount,
        totalQuestions: questions.length,
        tier: scorePercentage === 100 ? 'gold' : 'silver',
      });
      showToast(`Mastery Badge earned in ${conceptName} (${scorePercentage}%)!`, 'success');
    } else {
      showToast(`Scored ${scorePercentage}% (${correctCount}/5). 80%+ is needed for the badge.`, 'info');
    }
  };

  const correctCount = questions.filter(
    (q) => answers[q.id] === q.correctOptionId
  ).length;
  const finalPct = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
  const passed = finalPct >= 80;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mastery-challenge-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4"
    >
      <div className="max-w-2xl w-full rounded-3xl bg-slate-900 border border-indigo-500/40 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-300">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                5-Question Mastery Verification
              </div>
              <h2 id="mastery-challenge-title" className="text-base sm:text-lg font-bold text-white">
                {conceptName} Badge Challenge
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close challenge modal"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-4 py-4" aria-label="Loading 5-question challenge">
            <div className="h-4 w-48 rounded bg-slate-800 animate-pulse" />
            <div className="h-16 w-full rounded-xl bg-slate-800 animate-pulse" />
            <div className="space-y-2.5">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-11 w-full rounded-xl bg-slate-800/80 animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {/* Active Question */}
        {!isLoading && !isCompleted && currentQuestion && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-200">
                  Question {currentIndex + 1} / {questions.length}
                </span>
                {currentQuestion.dimension && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 text-[10px] font-bold uppercase">
                    {currentQuestion.dimension}
                  </span>
                )}
              </div>
              <span className="text-slate-300 capitalize">
                Tier: {currentQuestion.difficulty}
              </span>
            </div>

            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            <p className="text-sm font-semibold text-white leading-relaxed">
              {currentQuestion.questionText}
            </p>

            <div className="space-y-2.5">
              {currentQuestion.options.map((opt) => {
                const isSelected = selectedForCurrent === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        [currentQuestion.id]: opt.id,
                      }))
                    }
                    className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/25 border-indigo-400 text-white'
                        : 'bg-slate-950/70 border-slate-800 text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full border flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-indigo-500 border-indigo-400 text-white'
                          : 'border-slate-600 text-slate-300'
                      }`}
                    >
                      {opt.id.replace('opt-', '').toUpperCase()}
                    </span>
                    <span>{opt.text}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-200 cursor-pointer"
              >
                Previous
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  disabled={!selectedForCurrent}
                  onClick={() => setCurrentIndex((i) => i + 1)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold cursor-pointer"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  disabled={!selectedForCurrent}
                  onClick={handleFinish}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Submit 5-Question Challenge</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Challenge Result Summary */}
        {!isLoading && isCompleted && (
          <div className="space-y-4">
            <div
              className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                passed
                  ? 'bg-emerald-950/40 border-emerald-500/40'
                  : 'bg-amber-950/30 border-amber-500/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`p-3 rounded-2xl ${
                    passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {passed ? <ShieldCheck className="w-7 h-7" /> : <Award className="w-7 h-7" />}
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {passed
                      ? `Mastery Badge Unlocked: ${conceptName}!`
                      : `Almost There (${correctCount} / 5 Correct)`}
                  </h3>
                  <p className="text-xs text-slate-200 mt-0.5">
                    {passed
                      ? 'Badge recorded in your profile and Learning Memory timeline (+5% mastery bonus).'
                      : 'Review the explanations below and retry once you hit 4/5 (80%) to claim the badge.'}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-2xl font-mono font-extrabold text-white animate-mastery-delta">
                  {finalPct}%
                </div>
                <div className="text-[11px] text-slate-300">{correctCount}/5 Passed</div>
              </div>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
              {questions.map((q, idx) => {
                const isRight = answers[q.id] === q.correctOptionId;
                return (
                  <div
                    key={q.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-200">
                        Q{idx + 1} · {q.dimension || 'check'}
                      </span>
                      <span
                        className={`flex items-center gap-1 font-semibold ${
                          isRight ? 'text-emerald-300' : 'text-rose-300'
                        }`}
                      >
                        {isRight ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>{isRight ? 'Correct' : 'Missed'}</span>
                      </span>
                    </div>
                    <p className="text-slate-300">{q.explanation}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
