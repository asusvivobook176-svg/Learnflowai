import React from 'react';
import { useLearner } from '../context/LearnerContext';
import { analyzeConfidenceCalibration } from '../utils/intelligence';
import {
  Compass,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Award,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Brain,
  Sliders,
} from 'lucide-react';

interface ConfidenceAnalysisViewProps {
  onPracticeConcept?: (conceptId: string) => void;
}

export const ConfidenceAnalysisView: React.FC<ConfidenceAnalysisViewProps> = ({
  onPracticeConcept,
}) => {
  const { profile, setActiveTab } = useLearner();

  const analysis = analyzeConfidenceCalibration(
    profile.confidenceRecords || [],
    profile.masteryByConcept
  );

  const records = profile.confidenceRecords || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-900 border border-purple-500/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-purple-500/20 text-purple-400">
              <Compass className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
              Metacognitive Calibration
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white">
            🎯 Confidence Gap Analysis
          </h2>
          <p className="text-xs text-slate-400">
            LearnFlow compares how confident you feel with your actual performance to eliminate blindspots and uncover hidden strengths.
          </p>
        </div>

        {/* Metacognitive Calibration Meter */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[140px] space-y-1">
          <div className="text-2xl font-extrabold text-purple-400 font-mono">
            {analysis.calibrationScore}%
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            Calibration Score
          </div>
          <div className="text-[9px] uppercase font-bold text-emerald-400">
            {analysis.pattern.replace('_', ' ')}
          </div>
        </div>
      </div>

      {/* Main Grid: Metacognitive Quadrant Matrix & Calibration Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 2x2 Confidence vs Performance Matrix Chart */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-400" />
              Metacognitive 2x2 Matrix (Confidence vs Performance)
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">{records.length} interactions logged</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* Top Left: Overconfidence (High Confidence + Low Performance) */}
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-rose-400">
                  ⚠️ Unrecognized Blindspot
                </span>
                <span className="text-[10px] font-mono font-bold text-rose-300">
                  High Conf + Low Accuracy
                </span>
              </div>
              <h4 className="text-xs font-bold text-white">Overconfidence Gap</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Concepts where you felt 100% sure, but underlying reasoning had a misconception.
              </p>
              <div className="text-[10px] font-semibold text-rose-300 pt-1">
                Friction Point: Series Circuits (V=IR inverse trap)
              </div>
            </div>

            {/* Top Right: Well-Calibrated Mastery (High Confidence + High Performance) */}
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-emerald-400">
                  🎯 Mastery Sweetspot
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-300">
                  High Conf + High Accuracy
                </span>
              </div>
              <h4 className="text-xs font-bold text-white">Calibrated Mastery</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                You know the concept deeply and accurately predict your performance.
              </p>
              <div className="text-[10px] font-semibold text-emerald-300 pt-1">
                Benchmark: Ohm's Law (85% mastery)
              </div>
            </div>

            {/* Bottom Left: Calibrated Developing (Low Confidence + Low Performance) */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  🌱 Clear Awareness
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Low Conf + Low Accuracy
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-300">Honest Reflection</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                You accurately recognize when you are guessing, making it easy to teach and improve.
              </p>
              <div className="text-[10px] font-semibold text-slate-400 pt-1">
                Topic: Parallel Equivalent Resistance (1/Rp)
              </div>
            </div>

            {/* Bottom Right: Underconfidence (Low Confidence + High Performance) */}
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-cyan-400">
                  💎 Hidden Strength
                </span>
                <span className="text-[10px] font-mono font-bold text-cyan-300">
                  Low Conf + High Accuracy
                </span>
              </div>
              <h4 className="text-xs font-bold text-white">Underconfidence Gap</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                You know more than you realize! Your intuition and reasoning are sound even when hesitant.
              </p>
              <div className="text-[10px] font-semibold text-cyan-300 pt-1">
                Strength: Electrical Power (P = I²R calculations)
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 p-3 rounded-xl bg-slate-950 border border-slate-800/80 leading-relaxed">
            <strong className="text-slate-200">AI Pedagogical Note: </strong>
            Exam anxiety often stems from underconfidence, while surprise mistakes on test day come from overconfidence. LearnFlow balances your self-awareness so you walk into exams with calibrated certainty.
          </div>
        </div>

        {/* Right Column: Active Overconfidence Alerts & Hidden Strengths */}
        <div className="lg:col-span-5 space-y-4">
          {/* Overconfidence Alert Card */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                <AlertCircle className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-white">
                  Overconfidence Alerts (Potential Blindspots)
                </h4>
                <span className="text-[10px] text-slate-400">Needs reasoning verification</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {analysis.conceptGaps
                .filter((g) => g.gapType === 'overconfident')
                .map((gap, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-950/80 border border-rose-500/30 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between text-rose-300 font-bold">
                      <span>{gap.conceptName}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-200">
                        Reported: {gap.confidenceReported.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {gap.gapDescription}
                    </p>
                    <button
                      onClick={() => {
                        if (onPracticeConcept) onPracticeConcept(gap.conceptId);
                        else setActiveTab('practice');
                      }}
                      className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Debunk with Explain My Thinking</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}

              {analysis.conceptGaps.filter((g) => g.gapType === 'overconfident').length === 0 && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
                  No critical overconfidence blindspots detected. Your self-assessments are accurate!
                </div>
              )}
            </div>
          </div>

          {/* Underconfidence Encouragement Card */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-white">
                  Hidden Knowledge Strengths (Underconfidence)
                </h4>
                <span className="text-[10px] text-slate-400">Trust your reasoning</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {analysis.conceptGaps
                .filter((g) => g.gapType === 'underconfident')
                .map((gap, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between text-cyan-300 font-bold">
                      <span>{gap.conceptName}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-200">
                        Reported: {gap.confidenceReported.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {gap.gapDescription}
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
