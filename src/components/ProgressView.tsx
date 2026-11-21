import React, { useState } from 'react';
import { useLearner } from '../context/LearnerContext';
import { CONCEPTS } from '../data/syllabus';
import { MasteryBadgeModal } from './MasteryBadgeModal';
import {
  TrendingUp,
  Award,
  History,
  Zap,
  ShieldCheck,
  Printer,
  Download,
  Lock,
  Sparkles,
} from 'lucide-react';

export const ProgressView: React.FC = () => {
  const { profile, resetToDemoAlex, showToast } = useLearner();
  const [challengeTarget, setChallengeTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const allHistory = Object.entries(profile.masteryByConcept)
    .flatMap(([conceptId, mastery]) =>
      mastery.history.map((h) => ({
        ...h,
        conceptId,
        conceptName: CONCEPTS.find((c) => c.id === conceptId)?.name || conceptId,
      }))
    )
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const earnedBadges = profile.masteryBadges || [];

  const handleExportReport = () => {
    const reportPayload = {
      generatedAt: new Date().toISOString(),
      student: profile.name,
      subject: profile.subject,
      overallMastery: profile.overallMastery,
      streakDays: profile.streakDays,
      totalQuestionsAnswered: profile.totalQuestionsAnswered,
      masteryByConcept: Object.entries(profile.masteryByConcept).map(([id, m]) => ({
        concept: CONCEPTS.find((c) => c.id === id)?.name || id,
        masteryPercentage: m.masteryPercentage,
        status: m.status,
        questionsCorrect: m.questionsCorrect,
        questionsAttempted: m.questionsAttempted,
      })),
      masteryBadges: earnedBadges,
      activeMisconceptions: profile.misconceptions
        .filter((m) => m.status !== 'resolved')
        .map((m) => ({ concept: m.conceptName, title: m.title, severity: m.severity })),
    };

    const blob = new Blob([JSON.stringify(reportPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learnflow-progress-${profile.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Student progress report exported!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-300">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Progress, Mastery Badges &amp; Audit Trail
            </h2>
          </div>
          <p className="text-xs text-slate-300">
            Transparent view into concept mastery, verified Mastery Badges (unlocked at &ge;80%), and printable student reports.
          </p>
        </div>

        <div className="no-print flex flex-wrap items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-100 border border-slate-700 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-300" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleExportReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => {
              resetToDemoAlex();
              showToast('Demo benchmark reset.', 'info');
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 hover:text-white transition-all cursor-pointer"
          >
            Reset Demo
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-300">Weighted Average Mastery</div>
          <div className="text-2xl font-extrabold text-indigo-300 font-mono tabular-nums">
            {profile.overallMastery}%
          </div>
          <div className="text-[11px] text-slate-300">Target for Grade 10: &ge;80%</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-300">Total Practice Attempts</div>
          <div className="text-2xl font-extrabold text-cyan-300 font-mono tabular-nums">
            {profile.totalQuestionsAnswered}
          </div>
          <div className="text-[11px] text-slate-300">Across 7 core syllabus nodes</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-300">Voice Reasonings Analyzed</div>
          <div className="text-2xl font-extrabold text-purple-300 font-mono tabular-nums">
            {profile.totalVoiceNotesCount}
          </div>
          <div className="text-[11px] text-slate-300">Wispr Flow verbal thoughts</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-300">Verified Mastery Badges</div>
          <div className="text-2xl font-extrabold text-amber-300 font-mono tabular-nums">
            {earnedBadges.length} / {CONCEPTS.length}
          </div>
          <div className="text-[11px] text-slate-300">Unlock at &ge;80% + 5-Q check</div>
        </div>
      </div>

      {/* Mastery Badges Section */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Verified Concept Mastery Badges
            </h3>
            <p className="text-xs text-slate-300">
              Reach 80%+ in a concept to unlock its 5-question verification challenge (basic, application, misconception, and real-world checks).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CONCEPTS.map((c) => {
            const mastery = profile.masteryByConcept[c.id]?.masteryPercentage ?? 0;
            const badge = earnedBadges.find((b) => b.conceptId === c.id);
            const isEligible = mastery >= 80 && !badge;

            return (
              <div
                key={c.id}
                className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                  badge
                    ? 'bg-emerald-950/25 border-emerald-500/40'
                    : isEligible
                    ? 'bg-amber-950/25 border-amber-500/40'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white">{c.name}</span>
                    <span className="font-mono tabular-nums text-xs font-bold text-slate-200">
                      {mastery}%
                    </span>
                  </div>

                  {badge ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>
                        Earned {badge.tier.toUpperCase()} ({badge.correctCount}/{badge.totalQuestions}) · {badge.earnedAt}
                      </span>
                    </div>
                  ) : isEligible ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-200 font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Challenge unlocked! Pass 4/5 to claim badge.</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Need {Math.max(0, 80 - mastery)}% more mastery to unlock</span>
                    </div>
                  )}
                </div>

                {badge ? (
                  <button
                    onClick={() => setChallengeTarget({ id: c.id, name: c.name })}
                    className="no-print w-full py-1.5 px-3 rounded-lg bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-200 text-xs font-semibold border border-emerald-500/30 cursor-pointer"
                  >
                    Retake 5-Q Challenge
                  </button>
                ) : isEligible ? (
                  <button
                    onClick={() => setChallengeTarget({ id: c.id, name: c.name })}
                    className="no-print w-full py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                  >
                    Start 5-Q Challenge
                  </button>
                ) : (
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500"
                      style={{ width: `${Math.min(100, Math.round((mastery / 80) * 100))}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
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
            const accuracy =
              m && m.questionsAttempted > 0
                ? Math.round((m.questionsCorrect / m.questionsAttempted) * 100)
                : 0;

            return (
              <div
                key={c.id}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <span className="text-xs font-bold text-slate-100">{c.name}</span>
                    <span className="text-[10px] text-slate-300 ml-2">({c.category})</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono tabular-nums">
                    <span className="text-slate-300">
                      Accuracy: <strong className="text-white">{accuracy}%</strong> (
                      {m?.questionsCorrect || 0}/{m?.questionsAttempted || 0})
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
          <span className="text-xs text-slate-300">Immutable scoring history</span>
        </div>

        <div className="space-y-2.5 max-h-80 overflow-y-auto custom-scrollbar pr-1">
          {allHistory.length > 0 ? (
            allHistory.slice(0, 12).map((h, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100">{h.conceptName}</span>
                    <span className="text-[10px] text-slate-300">• {h.date}</span>
                  </div>
                  <p className="text-[11px] text-slate-300">{h.reason}</p>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-xs font-mono tabular-nums font-bold px-2 py-0.5 rounded-md ${
                      h.scoreDelta > 0
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-rose-500/15 text-rose-300'
                    }`}
                  >
                    {h.scoreDelta > 0 ? '+' : ''}
                    {h.scoreDelta}%
                  </span>
                  <div className="text-[10px] text-slate-300 font-mono tabular-nums mt-0.5">
                    Result: {h.newScore}%
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-slate-300">
              No mastery audit entries recorded yet.
            </div>
          )}
        </div>
      </div>

      {challengeTarget && (
        <MasteryBadgeModal
          isOpen={!!challengeTarget}
          conceptId={challengeTarget.id}
          conceptName={challengeTarget.name}
          onClose={() => setChallengeTarget(null)}
        />
      )}
    </div>
  );
};

