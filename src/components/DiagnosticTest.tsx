import React, { useState } from 'react';
import { useLearner } from '../context/LearnerContext';
import { DIAGNOSTIC_QUESTIONS, CONCEPTS } from '../data/syllabus';
import { ConfidenceLevel, Question } from '../types/learning';
import {
  FileCheck2,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Mic,
  Sparkles,
  Volume2,
  RotateCcw,
  Award,
  Zap,
  TrendingUp,
} from 'lucide-react';

interface DiagnosticTestProps {
  onTestComplete?: () => void;
  onOpenVoiceWithPrompt?: (prompt: string) => void;
}

export const DiagnosticTest: React.FC<DiagnosticTestProps> = ({
  onTestComplete,
  onOpenVoiceWithPrompt,
}) => {
  const { saveDiagnosticResults, setActiveTab } = useLearner();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [confidenceRatings, setConfidenceRatings] = useState<Record<string, ConfidenceLevel>>({});
  const [spokenReasonings, setSpokenReasonings] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [diagnosticReport, setDiagnosticReport] = useState<any>(null);

  const currentQ: Question = DIAGNOSTIC_QUESTIONS[currentIndex];

  const handleSelectOption = (optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionId,
    }));
    // Default confidence to medium if not set
    if (!confidenceRatings[currentQ.id]) {
      setConfidenceRatings((prev) => ({
        ...prev,
        [currentQ.id]: 'medium',
      }));
    }
  };

  const handleSetConfidence = (level: ConfidenceLevel) => {
    setConfidenceRatings((prev) => ({
      ...prev,
      [currentQ.id]: level,
    }));
  };

  const handleSetReasoning = (text: string) => {
    setSpokenReasonings((prev) => ({
      ...prev,
      [currentQ.id]: text,
    }));
  };

  const handleNext = () => {
    if (currentIndex < DIAGNOSTIC_QUESTIONS.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      finishTest();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const finishTest = () => {
    const results = DIAGNOSTIC_QUESTIONS.map((q) => {
      const selected = selectedAnswers[q.id];
      const isCorrect = selected === q.correctOptionId;
      const confidence = confidenceRatings[q.id] || 'medium';
      const reasoning = spokenReasonings[q.id] || '';
      return {
        questionId: q.id,
        conceptId: q.conceptId,
        conceptName: q.conceptName,
        isCorrect,
        confidence,
        hasVoiceReasoning: reasoning.trim().length > 10,
        reasoning,
      };
    });

    const totalCorrect = results.filter((r) => r.isCorrect).length;
    const scorePct = Math.round((totalCorrect / DIAGNOSTIC_QUESTIONS.length) * 100);

    const strongConcepts = results.filter((r) => r.isCorrect).map((r) => r.conceptName);
    const weakConcepts = results.filter((r) => !r.isCorrect).map((r) => r.conceptName);

    setDiagnosticReport({
      totalQuestions: DIAGNOSTIC_QUESTIONS.length,
      totalCorrect,
      scorePct,
      results,
      strongConcepts,
      weakConcepts,
    });

    setIsSubmitted(true);
    saveDiagnosticResults(results);
  };

  const handleApplyResultsAndExit = () => {
    setActiveTab('dashboard');
    if (onTestComplete) onTestComplete();
  };

  // If test is completed, render Diagnostic Report
  if (isSubmitted && diagnosticReport) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/30 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Diagnostic Assessment Complete
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-2">
              Initial Learner Model Calibrated
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Your living learner model has evaluated your answers, confidence self-ratings, and verbal reasoning.
            </p>
          </div>

          {/* Score Circle / Metric */}
          <div className="flex items-center justify-center gap-6 pt-2">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-center min-w-[120px]">
              <div className="text-3xl font-extrabold text-indigo-400 font-mono">
                {diagnosticReport.scorePct}%
              </div>
              <div className="text-[11px] text-slate-400 font-medium">Initial Baseline</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-center min-w-[120px]">
              <div className="text-3xl font-extrabold text-emerald-400 font-mono">
                {diagnosticReport.totalCorrect} / {diagnosticReport.totalQuestions}
              </div>
              <div className="text-[11px] text-slate-400 font-medium">Concepts Cleared</div>
            </div>
          </div>
        </div>

        {/* Concept Breakdown Grid */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            Concept-by-Concept Initial Mastery
          </h3>

          <div className="space-y-3">
            {diagnosticReport.results.map((res: any, idx: number) => {
              const isOk = res.isCorrect;
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isOk
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {isOk ? '✓' : '✗'}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-200">{res.conceptName}</div>
                      <div className="text-[11px] text-slate-400">
                        Confidence: <span className="capitalize text-slate-300">{res.confidence}</span>
                        {res.hasVoiceReasoning && ' • Voice Reasoning Analyzed'}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${
                      isOk
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {isOk ? 'Developing / Mastered' : 'Needs Practice (Weak)'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={() => {
              setIsSubmitted(false);
              setCurrentIndex(0);
              setSelectedAnswers({});
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all cursor-pointer flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Diagnostic</span>
          </button>

          <button
            onClick={handleApplyResultsAndExit}
            className="flex-1 max-w-sm flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <span>Proceed to Dashboard &amp; Adaptive Practice</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Active question render
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Test Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
              <FileCheck2 className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white">Diagnostic Baseline Evaluation</h2>
          </div>
          <p className="text-xs text-slate-400">
            Class 10 Physics – Electricity (7 Core Diagnostic Concepts)
          </p>
        </div>

        {/* Progress Tracker */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-slate-200">
              Question {currentIndex + 1} of {DIAGNOSTIC_QUESTIONS.length}
            </span>
            <div className="text-[10px] text-slate-400">{currentQ.conceptName}</div>
          </div>
          <div className="w-24 h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              style={{
                width: `${((currentIndex + 1) / DIAGNOSTIC_QUESTIONS.length) * 100}%`,
              }}
              className="h-full bg-indigo-500 rounded-full transition-all"
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {currentQ.conceptName}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {currentQ.difficulty}
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed">
            {currentQ.questionText}
          </h3>
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {currentQ.options.map((option) => {
            const isSelected = selectedAnswers[currentQ.id] === option.id;
            return (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option.id)}
                className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-start gap-3 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-md shadow-indigo-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-950'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    isSelected
                      ? 'border-indigo-400 bg-indigo-500 text-white'
                      : 'border-slate-700 text-slate-500'
                  }`}
                >
                  {option.id.replace('opt-', '').toUpperCase()}
                </span>
                <span className="leading-relaxed">{option.text}</span>
              </button>
            );
          })}
        </div>

        {/* Confidence Level Selector */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              How confident are you in this answer?
            </span>
            <span className="text-[11px] text-slate-400">Calibrates living learner model</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { level: 'low' as ConfidenceLevel, label: 'Just Guessing (Low)', desc: '10-30%' },
              { level: 'medium' as ConfidenceLevel, label: 'Fairly Sure (Medium)', desc: '40-70%' },
              { level: 'high' as ConfidenceLevel, label: '100% Confident (High)', desc: '80-100%' },
            ].map((c) => {
              const isChosen = confidenceRatings[currentQ.id] === c.level;
              return (
                <button
                  key={c.level}
                  onClick={() => handleSetConfidence(c.level)}
                  className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                    isChosen
                      ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs">{c.label}</div>
                  <div className="text-[10px] text-slate-400">{c.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Spoken Reasoning (Wispr Flow) */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-indigo-400" />
              Explain Your Thinking (Optional Spoken Reasoning)
            </span>
            <span className="text-[10px] text-slate-400">Wispr Flow Voice Analysis</span>
          </div>

          <textarea
            value={spokenReasonings[currentQ.id] || ''}
            onChange={(e) => handleSetReasoning(e.target.value)}
            placeholder="Why did you choose this? e.g., 'I know V = I * R, so if resistance is doubled with constant voltage...'"
            rows={2}
            className="w-full bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 resize-none font-sans"
          />

          {/* Quick voice preset injection */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] text-slate-500">Demo thought:</span>
            <button
              onClick={() =>
                handleSetReasoning(
                  "I calculated the equivalent resistance by adding them up, then applied Ohm's law to find the total circuit current."
                )
              }
              className="text-[10px] text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
            >
              "Insert sample reasoned explanation"
            </button>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            disabled={!selectedAnswers[currentQ.id]}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <span>
              {currentIndex === DIAGNOSTIC_QUESTIONS.length - 1
                ? 'Finish Diagnostic & Score'
                : 'Next Question'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
