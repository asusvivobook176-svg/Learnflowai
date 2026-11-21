import React, { useState } from 'react';
import { VoiceProcessResult } from '../types/learning';
import {
  Mic,
  Brain,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Zap,
  Target,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface SpeechTransformationPipelineProps {
  rawSpeech: string;
  result: VoiceProcessResult;
  onPracticeClick?: (conceptId: string) => void;
}

export const SpeechTransformationPipeline: React.FC<SpeechTransformationPipelineProps> = ({
  rawSpeech,
  result,
  onPracticeClick,
}) => {
  const [activeStep, setActiveStep] = useState<number>(3); // 1, 2, or 3
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Highlight filler words in raw speech
  const renderHighlightedSpeech = (text: string) => {
    const fillerRegex = /\b(um|uh|er|ah|like|you know|so like|basically|sort of|kind of|i guess|wait no|i mean)\b/gi;
    const parts = text.split(fillerRegex);

    return parts.map((part, index) => {
      if (fillerRegex.test(part)) {
        return (
          <span
            key={index}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold"
            title="Wispr Flow normalized filler token"
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const handleSpeakAloud = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="rounded-2xl bg-slate-950 border border-indigo-500/30 p-5 sm:p-6 space-y-6 text-xs text-slate-300 shadow-xl">
      {/* Header & Step Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
              <Zap className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Messy Speech → Structured AI Understanding
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Demonstrating how Wispr Flow conversational speech transforms into structured pedagogical knowledge.
          </p>
        </div>

        {/* 3 Steps Navigation Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
          {[
            { step: 1, label: '1. Raw Voice' },
            { step: 2, label: '2. AI Understanding' },
            { step: 3, label: '3. Personalized Response' },
          ].map((s) => (
            <button
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                activeStep === s.step
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Animated Pipeline Graphic */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 overflow-x-auto custom-scrollbar">
        <div className="flex items-center justify-between gap-2 min-w-[620px] text-[10px] font-bold text-slate-300">
          <div className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-indigo-500/30 text-indigo-300 flex items-center gap-1.5">
            <Mic className="w-3 h-3 text-indigo-400" />
            <span>RAW VOICE INPUT</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
          <div className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-purple-500/30 text-purple-300 flex items-center gap-1.5">
            <Brain className="w-3 h-3 text-purple-400" />
            <span>VOICE INTELLIGENCE</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
          <div className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-cyan-500/30 text-cyan-300 flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-cyan-400" />
            <span>CONCEPT + INTENT</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
          <div className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-rose-500/30 text-rose-300 flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>MISCONCEPTION CHECK</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
          <div className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>LEARNER UPDATE</span>
          </div>
        </div>
      </div>

      {/* 3 Step Visual Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1: Raw Student Voice */}
        <div
          className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
            activeStep === 1
              ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/20'
              : 'bg-slate-900/60 border-slate-800'
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Step 1: Raw Student Voice
              </span>
              <Mic className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] leading-relaxed text-slate-300 font-sans italic">
              "{renderHighlightedSpeech(rawSpeech)}"
            </div>
          </div>
          <div className="text-[10px] text-slate-400">
            Captures conversational hesitations, self-corrections, and pauses via Wispr Flow.
          </div>
        </div>

        {/* Step 2: AI Understanding */}
        <div
          className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
            activeStep === 2
              ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/20'
              : 'bg-slate-900/60 border-slate-800'
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                Step 2: Structured AI Understanding
              </span>
              <Brain className="w-3.5 h-3.5 text-cyan-400" />
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">📚 Detected Concept</span>
                <span className="font-bold text-white">{result.concept}</span>
              </div>

              <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">💬 Student Intent</span>
                <span className="font-semibold text-cyan-300 capitalize">
                  {result.studentIntent.replace('_', ' ')}
                </span>
              </div>

              <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">📉 Confidence Level</span>
                <span className="font-mono font-bold text-amber-300 capitalize">
                  {result.confidenceLevel}
                </span>
              </div>

              {result.detectedMisconception && (
                <div className="p-2 rounded bg-rose-950/40 border border-rose-500/30 text-[10px] text-rose-200">
                  <div className="font-bold text-rose-300 mb-0.5">🔍 Detected Misconception</div>
                  {result.detectedMisconception}
                </div>
              )}
            </div>
          </div>

          <div className="text-[10px] text-slate-400">
            Target: <strong>{result.recommendedNextAction}</strong>
          </div>
        </div>

        {/* Step 3: Personalized AI Response */}
        <div
          className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
            activeStep === 3
              ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/20'
              : 'bg-slate-900/60 border-slate-800'
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Step 3: Personalized AI Response
              </span>
              <button
                onClick={() => handleSpeakAloud(result.educationalResponse)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                title="Listen to audio"
              >
                {isPlayingAudio ? (
                  <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] leading-relaxed text-slate-200 font-sans">
              "{result.educationalResponse}"
            </div>
          </div>

          <button
            onClick={() => {
              if (onPracticeClick) onPracticeClick(result.conceptId);
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition-all shadow cursor-pointer"
          >
            <span>Practice {result.concept}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
