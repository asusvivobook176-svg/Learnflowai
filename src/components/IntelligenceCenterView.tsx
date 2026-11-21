import React, { useState } from 'react';
import { useLearner } from '../context/LearnerContext';
import { generateExplainableRecommendations, analyzeConfidenceCalibration } from '../utils/intelligence';
import { WhyAmISeeingThis } from './WhyAmISeeingThis';
import { SpeechTransformationPipeline } from './SpeechTransformationPipeline';
import {
  Brain,
  Sparkles,
  ArrowRight,
  Target,
  AlertTriangle,
  Compass,
  Clock,
  Award,
  Layers,
  History,
  CheckCircle2,
  Zap,
  Mic,
} from 'lucide-react';

interface IntelligenceCenterViewProps {
  onPracticeConcept: (conceptId: string) => void;
  onOpenVoiceWithPrompt: (prompt: string) => void;
}

export const IntelligenceCenterView: React.FC<IntelligenceCenterViewProps> = ({
  onPracticeConcept,
  onOpenVoiceWithPrompt,
}) => {
  const { profile, setActiveTab } = useLearner();
  const [showSpeechDemo, setShowSpeechDemo] = useState(false);

  const recommendations = generateExplainableRecommendations(profile);
  const confidenceAnalysis = analyzeConfidenceCalibration(
    profile.confidenceRecords || [],
    profile.masteryByConcept
  );

  const activeMisconceptions = profile.misconceptions.filter((m) => m.status === 'active');
  const recentEvents = (profile.learningJourney || []).slice(0, 4);

  // Demo result for the "Show AI Understanding" showcase
  const demoVoiceResult = {
    cleanedTranscript:
      "I understand Ohm's Law (V = IR), but I am confused about series circuits and why current does not decrease after passing through the first resistor.",
    rawSpeech:
      "Um, so I kind of understand V equals I R, but like, I don't know why current doesn't get used up after the resistor.",
    subject: 'Physics',
    topic: 'Class 10 Electricity',
    concept: 'Series Circuits',
    conceptId: 'series-circuits',
    studentIntent: 'express_confusion' as const,
    confidenceLevel: 'low' as const,
    detectedMisconception: 'Belief that electric current is consumed by a resistor in a series loop',
    recommendedNextAction: 'Start a targeted Series Circuits practice session with visual ammeter validation',
    agentReasoning:
      'Voice Intelligence Agent parsed spoken acoustic tokens, filtered verbal hesitation markers ("um", "like"), and mapped inquiry tokens to Series Circuits with low confidence.',
    educationalResponse:
      'You already have a strong understanding of Ohm\'s Law (85%). Your main knowledge gap is how current behaves in a series circuit. Charges cannot pile up or vanish—current is uniform everywhere in a series loop. Let\'s practice this with a quick 2-minute drill!',
  };

  return (
    <div className="space-y-7">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Brain className="w-3.5 h-3.5 text-indigo-400" />
              <span>Living Learner Model Intelligence Suite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              🧠 LearnFlow Intelligence Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Real-time explainability, cognitive calibration, and longitudinal learning memory. Understand exactly how LearnFlow models your brain.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowSpeechDemo((v) => !v)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-indigo-500/30 text-slate-200 text-xs font-semibold shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>{showSpeechDemo ? 'Hide Speech Pipeline' : 'Show AI Understanding'}</span>
            </button>

            <button
              onClick={() => setActiveTab('learning-journey')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer whitespace-nowrap"
            >
              <span>View Full Learning Journey</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Optional Interactive Speech Pipeline Showcase */}
      {showSpeechDemo && (
        <SpeechTransformationPipeline
          rawSpeech={demoVoiceResult.rawSpeech}
          result={demoVoiceResult}
          onPracticeClick={(cId) => onPracticeConcept(cId)}
        />
      )}

      {/* 4 Major Intelligence Center Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SECTION 1: Learning Memory (6 cols) */}
        <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <History className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    1. Learning Memory
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Recent memory milestones &amp; knowledge evolution
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {profile.learningJourney?.length || 0} Events
              </span>
            </div>

            {/* Recent Learning Events List */}
            <div className="space-y-2.5">
              {recentEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-indigo-300 uppercase tracking-wider">
                      {ev.concept}
                    </span>
                    <span className="text-slate-500">{ev.timestamp.split(' - ')[0]}</span>
                  </div>
                  <h4 className="font-semibold text-slate-100 text-xs">{ev.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {ev.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('learning-journey')}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold transition-all cursor-pointer border border-slate-700"
          >
            <span>View Full Learning Journey</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* SECTION 2: AI Recommendations with Explainability (6 cols) */}
        <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <Target className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    2. AI Recommendations
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Top 3 personalized actions with transparent explainability
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Data-Grounded
              </span>
            </div>

            {/* Top 3 Recommendations */}
            <div className="space-y-3">
              {recommendations.slice(0, 3).map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-white text-xs">{rec.concept}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ~{rec.estimatedMinutes} mins
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300">
                    <strong>Suggested Action: </strong>
                    {rec.suggestedAction}
                  </p>

                  {/* Explainable AI "Why am I seeing this?" dropdown */}
                  <div className="pt-1 flex items-center justify-between">
                    <WhyAmISeeingThis
                      recommendation={rec}
                      onActionClick={() => onPracticeConcept(rec.conceptId)}
                    />

                    <button
                      onClick={() => onPracticeConcept(rec.conceptId)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Start Drill</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 text-center pt-2">
            Recommendations adapt dynamically after every question and voice note.
          </div>
        </div>

        {/* SECTION 3: Confidence Intelligence (6 cols) */}
        <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                  <Compass className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    3. Confidence Intelligence
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Metacognitive calibration &amp; knowledge alignment
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold text-purple-400">
                  {confidenceAnalysis.calibrationScore}%
                </span>
                <div className="text-[9px] text-slate-500 uppercase">Calibrated</div>
              </div>
            </div>

            {/* Intelligence Summary Chips */}
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-400">
                  <span>Current Confidence Pattern</span>
                  <span className="text-purple-300 capitalize">{confidenceAnalysis.pattern.replace('_', ' ')}</span>
                </div>
                <p className="text-[11px] text-slate-200 font-medium">
                  "{confidenceAnalysis.headline}"
                </p>
              </div>

              {/* Strongest accurately assessed concept */}
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                <span className="text-[10px] font-bold uppercase text-emerald-400 block">
                  Strongest Accurately Assessed Concept
                </span>
                <p className="text-[11px] text-slate-200">
                  Ohm's Law: High confidence reported and 100% accuracy with sound verbal reasoning.
                </p>
              </div>

              {/* Potential hidden knowledge gap */}
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-1">
                <span className="text-[10px] font-bold uppercase text-rose-400 block">
                  Potential Hidden Knowledge Gap
                </span>
                <p className="text-[11px] text-slate-200">
                  Series Circuits: High confidence was reported, but answers contained the current consumption misconception.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('confidence-analysis')}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-semibold transition-all cursor-pointer border border-slate-700"
          >
            <span>Open Confidence Gap Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* SECTION 4: Active Misconceptions & Rapid Fix (6 cols) */}
        <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    4. Active Misconceptions
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Targeted misconceptions needing conceptual debunking
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {activeMisconceptions.length} Active
              </span>
            </div>

            {/* Active Misconceptions List */}
            <div className="space-y-3">
              {activeMisconceptions.slice(0, 2).map((misc) => (
                <div
                  key={misc.id}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-rose-500/30 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase">
                      {misc.conceptName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Encountered {misc.timesEncountered}x
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-100 text-xs">{misc.title}</h4>

                  <p className="text-[11px] text-slate-300 italic">
                    "{misc.studentExplanationSnippet}"
                  </p>

                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      Target: Debunk series current consumption
                    </span>
                    <button
                      onClick={() => onPracticeConcept(misc.conceptId)}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/30 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Fix This Misconception</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('misconceptions')}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-semibold transition-all cursor-pointer border border-slate-700"
          >
            <span>View All Misconceptions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
