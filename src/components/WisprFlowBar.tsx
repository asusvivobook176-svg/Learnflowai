import React, { useState } from 'react';
import { useLearner } from '../context/LearnerContext';
import { Mic, Sparkles, Volume2, ArrowRight } from 'lucide-react';
import { SAMPLE_VOICE_QUERIES } from '../data/syllabus';

interface WisprFlowBarProps {
  onOpenVoiceWithPrompt?: (prompt: string) => void;
}

export const WisprFlowBar: React.FC<WisprFlowBarProps> = ({ onOpenVoiceWithPrompt }) => {
  const [quickInput, setQuickInput] = useState('');

  const handleLaunch = () => {
    if (onOpenVoiceWithPrompt) {
      onOpenVoiceWithPrompt(
        quickInput ||
          "I understand Ohm's law, but I'm confused about Kirchhoff's voltage law. I think the current gets divided differently, but I'm not completely sure."
      );
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-500/30 p-4 sm:p-6 shadow-xl shadow-indigo-950/30">
      {/* Background ambient glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Mic className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Voice-Powered Learning Input
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Wispr Flow
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Speak naturally with filler words, incomplete thoughts, or questions. AI extracts your intent.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Microphone Listening Ready</span>
          </div>
        </div>

        {/* Spoken input bar */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-indigo-500/60 transition-all">
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleLaunch();
            }}
            placeholder="Click microphone to speak or type: 'I get Ohm's law, but I'm confused about series current...'"
            className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
          />

          <button
            onClick={handleLaunch}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer whitespace-nowrap"
          >
            <Mic className="w-4 h-4" />
            <span className="hidden sm:inline">Start Speaking</span>
            <span className="sm:hidden">Speak</span>
          </button>
        </div>

        {/* Quick Suggestions Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
          <span className="text-slate-500 font-medium">Try speaking:</span>
          {SAMPLE_VOICE_QUERIES.slice(0, 3).map((query, i) => (
            <button
              key={i}
              onClick={() => {
                if (onOpenVoiceWithPrompt) {
                  onOpenVoiceWithPrompt(query.rawSpeech);
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
            >
              "{query.title}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
