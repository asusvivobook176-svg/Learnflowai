import React, { useState } from 'react';
import { useLearner } from '../context/LearnerContext';
import { CONCEPTS, SAMPLE_VOICE_QUERIES } from '../data/syllabus';
import {
  Mic,
  Sparkles,
  Volume2,
  VolumeX,
  BookOpen,
  ArrowRight,
  Brain,
  HelpCircle,
  Zap,
} from 'lucide-react';

interface VoiceTutorViewProps {
  onOpenVoiceWithPrompt: (prompt: string) => void;
  onSelectConceptForPractice: (conceptId: string) => void;
}

export const VoiceTutorView: React.FC<VoiceTutorViewProps> = ({
  onOpenVoiceWithPrompt,
  onSelectConceptForPractice,
}) => {
  const { profile, setActiveTab } = useLearner();
  const [selectedConceptId, setSelectedConceptId] = useState<string>('series-circuits');
  const [activeSpeechText, setActiveSpeechText] = useState<string>('');
  const [isSpeakingTutor, setIsSpeakingTutor] = useState<boolean>(false);

  const selectedConcept = CONCEPTS.find((c) => c.id === selectedConceptId) || CONCEPTS[4];
  const mastery = profile.masteryByConcept[selectedConcept.id]?.masteryPercentage ?? 50;

  const handleSpeakAloud = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeakingTutor) {
        window.speechSynthesis.cancel();
        setIsSpeakingTutor(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeakingTutor(false);
      utterance.onerror = () => setIsSpeakingTutor(false);
      setIsSpeakingTutor(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
              <BookOpen className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Voice Tutor &amp; Socratic Learning Studio
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Powered by Wispr Flow speech intelligence. Speak out your thoughts, ask questions, and explore audio explanations.
          </p>
        </div>

        <button
          onClick={() =>
            onOpenVoiceWithPrompt(
              `Can you explain ${selectedConcept.name} and why people get confused about it?`
            )
          }
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer whitespace-nowrap"
        >
          <Mic className="w-4 h-4" />
          <span>Ask Tutor About This</span>
        </button>
      </div>

      {/* Main Grid: Concept Selector & Audio Lecture Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Concept List */}
        <div className="lg:col-span-4 space-y-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
            Select Syllabus Concept
          </span>
          <div className="space-y-2">
            {CONCEPTS.map((c) => {
              const m = profile.masteryByConcept[c.id]?.masteryPercentage ?? 50;
              const isSelected = selectedConceptId === c.id;

              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedConceptId(c.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{c.name}</div>
                    <div className="text-[10px] text-slate-500">{c.category}</div>
                  </div>
                  <span className="text-xs font-mono font-semibold">{m}%</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Audio Lecture & Interactive Tutor Card */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                {selectedConcept.category}
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {selectedConcept.name}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Your Current Mastery:</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                {mastery}%
              </span>
            </div>
          </div>

          {/* Description & Formula */}
          <div className="space-y-3">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              {selectedConcept.shortDescription}
            </p>

            {selectedConcept.keyFormula && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Core Mathematical Law
                  </span>
                  <code className="text-xs font-mono font-bold text-indigo-300">
                    {selectedConcept.keyFormula}
                  </code>
                </div>
                <button
                  onClick={() =>
                    handleSpeakAloud(
                      `The formula for ${selectedConcept.name} is ${selectedConcept.keyFormula}. ${selectedConcept.shortDescription}`
                    )
                  }
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="Listen to Explanation"
                >
                  {isSpeakingTutor ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Common Misconceptions to Watch For */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-2">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              Common Exam Traps in {selectedConcept.name}
            </span>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {selectedConcept.commonMisconceptions.map((misc, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{misc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sample Spoken Prompts */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Try Speaking with Wispr Flow:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                onClick={() =>
                  onOpenVoiceWithPrompt(
                    `Why doesn't current change in a series circuit even when resistors have different values?`
                  )
                }
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 text-left text-slate-300 transition-all cursor-pointer"
              >
                "Why doesn't series current change?"
              </button>
              <button
                onClick={() =>
                  onOpenVoiceWithPrompt(
                    `Can you give me an everyday real-world example of ${selectedConcept.name}?`
                  )
                }
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 text-left text-slate-300 transition-all cursor-pointer"
              >
                "Give me a real-world example"
              </button>
            </div>
          </div>

          {/* Practice Action */}
          <div className="pt-2 flex items-center justify-end">
            <button
              onClick={() => {
                onSelectConceptForPractice(selectedConcept.id);
                setActiveTab('practice');
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <span>Practice Questions for {selectedConcept.name}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
