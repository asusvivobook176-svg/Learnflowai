import React, { useState, useEffect, useRef } from 'react';
import { useLearner } from '../context/LearnerContext';
import { SAMPLE_VOICE_QUERIES } from '../data/syllabus';
import { VoiceProcessResult } from '../types/learning';
import {
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Play,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Brain,
  Sliders,
  Layers,
} from 'lucide-react';

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  contextConcept?: string;
}

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  isOpen,
  onClose,
  initialPrompt,
  contextConcept,
}) => {
  const {
    profile,
    addAgentLog,
    updateConceptMastery,
    addMisconception,
    recordVoiceActivity,
    setActiveTab,
  } = useLearner();

  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState(initialPrompt || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<VoiceProcessResult | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioWave, setAudioWave] = useState<number[]>([15, 30, 45, 20, 60, 40, 70, 25, 50, 35, 65, 30]);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (initialPrompt) {
      setSpokenText(initialPrompt);
    }
  }, [initialPrompt]);

  // Audio wave animation while recording
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setAudioWave((prev) =>
          prev.map(() => Math.floor(Math.random() * 65) + 15)
        );
      }, 120);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Web Speech API integration
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + ' ';
        }
        setSpokenText(currentTranscript.trim());
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      setResult(null);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsRecording(true);
        } catch (e) {
          // If already started or not allowed, fallback simulation
          setIsRecording(true);
        }
      } else {
        // Fallback for browsers without Web Speech
        setIsRecording(true);
        if (!spokenText) {
          setSpokenText("Um, so like... I understand Ohm's law, but I'm confused about Kirchhoff's voltage law and how series current works. Doesn't the first resistor eat up the current?");
        }
      }
    }
  };

  const processSpeech = async (textToProcess?: string) => {
    const speech = textToProcess || spokenText;
    if (!speech.trim()) return;

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    setIsProcessing(true);
    addAgentLog(
      'Voice Intelligence Agent',
      'Wispr Flow Ingestion',
      `Captured natural spoken stream (${speech.split(' ').length} words). Normalizing filler tokens and parsing intent.`,
      'purple'
    );

    try {
      const response = await fetch('/api/voice-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawSpeech: speech,
          studentName: profile.name,
        }),
      });

      const data: VoiceProcessResult = await response.json();
      setResult(data);

      recordVoiceActivity(data.concept, speech);

      // If a misconception was diagnosed
      if (data.detectedMisconception) {
        addMisconception(
          data.conceptId,
          data.concept,
          data.detectedMisconception,
          speech,
          data.educationalResponse,
          'high'
        );
        // Slightly update mastery to reflect diagnosis
        updateConceptMastery(
          data.conceptId,
          -4,
          `Diagnosed misconception: ${data.detectedMisconception}`,
          false,
          data.confidenceLevel
        );
      } else {
        // If they asked a thoughtful query, slightly reinforce mastery
        updateConceptMastery(
          data.conceptId,
          +3,
          `Active conceptual inquiry in ${data.concept}`,
          true,
          data.confidenceLevel
        );
      }

      addAgentLog(
        'Voice Intelligence Agent',
        'Structured Output Emitted',
        `Mapped query to concept: "${data.concept}" | Intent: ${data.studentIntent} | Confidence: ${data.confidenceLevel}.`,
        'success'
      );
    } catch (err) {
      console.error('Failed to process voice query:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSpeakAloud = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const loadSample = (sample: typeof SAMPLE_VOICE_QUERIES[0]) => {
    setSpokenText(sample.rawSpeech);
    setResult(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 shadow-md shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Mic className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Wispr Flow Voice Ingestion</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Adaptive Tutor
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Speak naturally with filler words, pauses, and self-corrections.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
          {/* Quick Voice Demo Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Quick Realistic Speech Samples (Wispr Flow)
              </span>
              <span className="text-[10px] text-slate-500">1-click test</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SAMPLE_VOICE_QUERIES.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => loadSample(sample)}
                  className="text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-indigo-300 mb-1">
                    <span>{sample.title}</span>
                    <span className="text-[10px] text-slate-500">{sample.concept}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                    "{sample.rawSpeech}"
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Voice Input Box & Waveform */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-rose-500 animate-ping' : 'bg-slate-600'}`} />
                <span className="text-xs font-semibold text-slate-300">
                  {isRecording ? 'Listening via Wispr Flow (speak freely)...' : 'Microphone or Text Input'}
                </span>
              </div>
              {spokenText && (
                <button
                  onClick={() => setSpokenText('')}
                  className="text-[11px] text-slate-500 hover:text-slate-300"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Audio Wave Visualizer */}
            <div className="h-12 flex items-center justify-center gap-1.5 bg-slate-900/60 rounded-xl px-4 border border-slate-800/80">
              {audioWave.map((height, i) => (
                <div
                  key={i}
                  style={{ height: `${isRecording ? height : 6}px` }}
                  className={`w-1.5 rounded-full transition-all duration-100 ${
                    isRecording
                      ? 'bg-gradient-to-t from-indigo-500 to-cyan-400'
                      : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Spoken Text Editable Area */}
            <textarea
              value={spokenText}
              onChange={(e) => setSpokenText(e.target.value)}
              placeholder="Speak or paste your thoughts... e.g. 'I understand Ohm's law, but I'm confused why the current doesn't get divided equally across series resistors...'"
              rows={3}
              className="w-full bg-transparent text-sm text-slate-200 placeholder-slate-600 focus:outline-none resize-none font-sans leading-relaxed"
            />

            {/* Mic Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <button
                onClick={toggleRecording}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isRecording
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-indigo-400" />}
                <span>{isRecording ? 'Stop Recording' : 'Start Speaking'}</span>
              </button>

              <button
                disabled={!spokenText.trim() || isProcessing}
                onClick={() => processSpeech()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isProcessing ? 'Agents Analyzing Speech...' : 'Analyze with AI Tutor'}</span>
              </button>
            </div>
          </div>

          {/* Animated Processing Multi-Agent Pipeline Graphic */}
          {isProcessing && (
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-3 animate-pulse">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                  Wispr Flow &amp; Autonomous Agent Pipeline Executing...
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400">Live Trace</span>
              </div>
              <div className="flex items-center justify-between gap-1 text-[9px] font-bold text-slate-300 overflow-x-auto py-1">
                <span className="px-2 py-1 rounded bg-slate-900 border border-indigo-500/40 text-indigo-300">
                  1. RAW ACOUSTIC
                </span>
                <ArrowRight className="w-3 h-3 text-slate-600" />
                <span className="px-2 py-1 rounded bg-slate-900 border border-purple-500/40 text-purple-300">
                  2. VOICE AGENT
                </span>
                <ArrowRight className="w-3 h-3 text-slate-600" />
                <span className="px-2 py-1 rounded bg-slate-900 border border-cyan-500/40 text-cyan-300">
                  3. CONCEPT + INTENT
                </span>
                <ArrowRight className="w-3 h-3 text-slate-600" />
                <span className="px-2 py-1 rounded bg-slate-900 border border-rose-500/40 text-rose-300">
                  4. MISCONCEPTION
                </span>
                <ArrowRight className="w-3 h-3 text-slate-600" />
                <span className="px-2 py-1 rounded bg-slate-900 border border-emerald-500/40 text-emerald-300">
                  5. LEARNER UPDATE
                </span>
              </div>
            </div>
          )}

          {/* Structured Output Pipeline Result (Messy Speech → Structured AI Understanding) */}
          {result && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Show AI Understanding Bar */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-indigo-500/30 text-xs">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <span className="font-bold text-white">Messy Speech → Structured AI Understanding</span>
                    <div className="text-[10px] text-slate-400">
                      Syllabus: {result.subject} &gt; {result.topic}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Wispr Flow Ingested
                </span>
              </div>

              {/* Step 1: Raw Student Voice with Highlighted Filler Words */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Step 1: Raw Student Voice (Unfiltered)
                  </span>
                  <span className="text-[10px] text-slate-500">Includes conversational fillers &amp; hesitations</span>
                </div>
                <p className="text-xs text-slate-300 font-sans italic leading-relaxed">
                  "{result.rawSpeech}"
                </p>
              </div>

              {/* Step 2: Structured AI Understanding Grid */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                    Step 2: Structured AI Understanding
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Entity Schema</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">📚 Detected Concept</span>
                    <strong className="text-white text-xs font-semibold">{result.concept}</strong>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">💬 Student Intent</span>
                    <strong className="text-cyan-300 text-xs capitalize font-semibold">
                      {result.studentIntent.replace('_', ' ')}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">📉 Confidence Level</span>
                    <strong className="text-amber-300 text-xs capitalize font-semibold">
                      {result.confidenceLevel}
                    </strong>
                  </div>
                </div>

                {/* Cleaned Thought vs Raw */}
                <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-xs">
                  <span className="text-[10px] font-bold uppercase text-indigo-400 block mb-0.5">
                    Cleaned Structured Intent
                  </span>
                  <p className="text-slate-200 text-xs font-medium">
                    "{result.cleanedTranscript}"
                  </p>
                </div>

                {result.detectedMisconception && (
                  <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-rose-300 font-bold">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                      <span>🔍 Detected Misconception</span>
                    </div>
                    <p className="text-rose-200/90 text-xs">
                      {result.detectedMisconception}
                    </p>
                  </div>
                )}
              </div>

              {/* Step 3: Personalized AI Response */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-emerald-400" />
                    Step 3: Personalized AI Response (Grounded in Learner Model)
                  </span>
                  <button
                    onClick={() => handleSpeakAloud(result.educationalResponse)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-medium text-slate-300 hover:text-white border border-slate-800 transition-all cursor-pointer"
                  >
                    {isPlayingAudio ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                        <span>Mute</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Listen Aloud</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {result.educationalResponse}
                </p>
              </div>

              {/* Recommended Action & Practice CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
                <div className="text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">🎯 Recommended Next Action: </span>
                  {result.recommendedNextAction}
                </div>

                <button
                  onClick={() => {
                    onClose();
                    setActiveTab('practice');
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <span>Practice {result.concept}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
