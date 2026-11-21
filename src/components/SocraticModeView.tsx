import React, { useState } from 'react';
import { useLearner } from '../context/LearnerContext';
import { CONCEPTS } from '../data/syllabus';
import { Question, SocraticTurn } from '../types/learning';
import {
  MessageCircleQuestion,
  Send,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Lightbulb,
  Info,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface SocraticApiResponse {
  tutorNote: string;
  guidingQuestion: string;
  shouldConclude: boolean;
  summary: string | null;
  practiceQuestion: Question | null;
  usedFallback?: boolean;
  fallbackNotice?: string | null;
}

function isValidSocraticResponse(data: any): data is SocraticApiResponse {
  if (!data || typeof data !== 'object') return false;
  if (typeof data.tutorNote !== 'string') return false;
  if (typeof data.guidingQuestion !== 'string' || !data.guidingQuestion.trim()) return false;
  if (typeof data.shouldConclude !== 'boolean') return false;
  if (data.shouldConclude) {
    if (typeof data.summary !== 'string' || !data.summary.trim()) return false;
    if (
      !data.practiceQuestion ||
      typeof data.practiceQuestion.questionText !== 'string' ||
      !Array.isArray(data.practiceQuestion.options) ||
      data.practiceQuestion.options.length < 2 ||
      typeof data.practiceQuestion.correctOptionId !== 'string'
    ) {
      return false;
    }
  }
  return true;
}

interface SocraticModeViewProps {
  onPracticeConcept?: (conceptId: string) => void;
}

export const SocraticModeView: React.FC<SocraticModeViewProps> = ({ onPracticeConcept }) => {
  const { profile, recordSocraticSession } = useLearner();

  const weakestConceptId =
    Object.entries(profile.masteryByConcept).sort(
      ([, a], [, b]) => a.masteryPercentage - b.masteryPercentage
    )[0]?.[0] || 'series-circuits';

  const [selectedConceptId, setSelectedConceptId] = useState<string>(weakestConceptId);
  const [messages, setMessages] = useState<SocraticTurn[]>([]);
  const [latestTutorNote, setLatestTutorNote] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fallbackBanner, setFallbackBanner] = useState<string | null>(null);

  // Conclusion state (after 3-4 turns)
  const [summary, setSummary] = useState<string | null>(null);
  const [practiceQuestion, setPracticeQuestion] = useState<Question | null>(null);
  const [selectedPracticeOption, setSelectedPracticeOption] = useState<string | null>(null);
  const [sessionSaved, setSessionSaved] = useState<boolean>(false);

  const selectedConcept = CONCEPTS.find((c) => c.id === selectedConceptId) || CONCEPTS[0];
  const conceptMastery = profile.masteryByConcept[selectedConceptId]?.masteryPercentage ?? 50;
  const tutorTurns = messages.filter((m) => m.role === 'tutor').length;
  const pastSessions = profile.socraticSessions || [];

  const resetDialogue = () => {
    setMessages([]);
    setLatestTutorNote('');
    setInputValue('');
    setFallbackBanner(null);
    setSummary(null);
    setPracticeQuestion(null);
    setSelectedPracticeOption(null);
    setSessionSaved(false);
  };

  const sendMessage = async (textOverride?: string) => {
    const trimmed = (textOverride ?? inputValue).trim();
    if (!trimmed || isLoading || summary) return;

    const nowLabel = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    const studentTurn: SocraticTurn = {
      role: 'student',
      text: trimmed,
      timestamp: nowLabel,
    };

    const nextHistory = [...messages, studentTurn];
    setMessages(nextHistory);
    if (!textOverride) setInputValue('');
    setIsLoading(true);
    setFallbackBanner(null);

    try {
      const resp = await fetch('/api/socratic-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conceptId: selectedConcept.id,
          conceptName: selectedConcept.name,
          currentMastery: conceptMastery,
          history: messages,
          studentMessage: trimmed,
        }),
      });

      const raw = await resp.json();
      if (!resp.ok || !isValidSocraticResponse(raw)) {
        throw new Error('Unexpected Socratic response shape');
      }

      if (raw.usedFallback && raw.fallbackNotice) {
        setFallbackBanner(raw.fallbackNotice);
      }

      const tutorTurn: SocraticTurn = {
        role: 'tutor',
        text: raw.guidingQuestion,
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }),
      };

      setLatestTutorNote(raw.tutorNote);
      setMessages([...nextHistory, tutorTurn]);

      if (raw.shouldConclude && raw.summary && raw.practiceQuestion) {
        setSummary(raw.summary);
        setPracticeQuestion(raw.practiceQuestion);
      }
    } catch {
      setFallbackBanner(
        'Live Socratic service is temporarily unavailable; guiding you with a structured local physics prompt.'
      );
      const completedTurns = messages.filter((m) => m.role === 'tutor').length;
      if (completedTurns >= 3) {
        const localSummary = `Nice reasoning across ${selectedConcept.name}! You traced how the core quantities relate without skipping conservation principles.`;
        const localQ: Question = {
          id: `soc-local-${Date.now()}`,
          conceptId: selectedConcept.id,
          conceptName: selectedConcept.name,
          difficulty: conceptMastery < 50 ? 'easy' : 'medium',
          questionText: `Quick synthesis check on ${selectedConcept.name}: which statement accurately preserves the physical law we just explored?`,
          options: [
            { id: 'opt-a', text: selectedConcept.shortDescription },
            { id: 'opt-b', text: 'Energy and electric charge are consumed completely inside the first component' },
            { id: 'opt-c', text: 'Voltage depends only on resistor count regardless of the battery' },
            { id: 'opt-d', text: 'Current reverses randomly across identical components' },
          ],
          correctOptionId: 'opt-a',
          explanation: selectedConcept.shortDescription,
          keyTakeaway: selectedConcept.keyFormula || selectedConcept.shortDescription,
        };
        setLatestTutorNote('You worked through all 3 Socratic reasoning steps.');
        setMessages([
          ...nextHistory,
          {
            role: 'tutor',
            text: 'Here is a 1-question check to lock in what you reasoned out:',
            timestamp: nowLabel,
          },
        ]);
        setSummary(localSummary);
        setPracticeQuestion(localQ);
      } else {
        const localQuestions = [
          `Before checking any formula for ${selectedConcept.name}, what happens to charge flow or energy at each component?`,
          `Good reflection. Now, if one resistor value doubles while the battery holds steady voltage, what must adjust?`,
          `Last check before summarizing: how would you test that prediction using a single equation?`,
        ];
        setLatestTutorNote('Let us narrow down one piece at a time.');
        setMessages([
          ...nextHistory,
          {
            role: 'tutor',
            text: localQuestions[Math.min(completedTurns, localQuestions.length - 1)],
            timestamp: nowLabel,
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitPracticeCheck = (optionId: string) => {
    if (!practiceQuestion || sessionSaved) return;
    setSelectedPracticeOption(optionId);
    const isCorrect = optionId === practiceQuestion.correctOptionId;
    const delta = isCorrect ? 8 : 3; // Earned discovery credit either way, larger if solved correctly

    recordSocraticSession({
      conceptId: selectedConcept.id,
      concept: selectedConcept.name,
      masteryAtStart: conceptMastery,
      turnsCount: tutorTurns,
      messages,
      completed: true,
      summary: summary || undefined,
      practiceQuestion,
      practiceAnsweredCorrectly: isCorrect,
      masteryDelta: delta,
    });
    setSessionSaved(true);
  };

  const starterDoubts = [
    `I keep getting confused about how current and voltage behave in ${selectedConcept.name}.`,
    `Why does my intuition feel opposite to the formula for ${selectedConcept.name}?`,
    `Can you guide me through solving a ${selectedConcept.name} problem step by step?`,
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
              <MessageCircleQuestion className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
              Guided Discovery Mode
            </span>
          </div>
          <h2 className="text-lg font-bold text-white">Socratic Mode</h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Ask for help without spoilers. Your tutor responds with one targeted question calibrated to your {conceptMastery}% mastery, then unlocks a summary and checkpoint after 3–4 turns.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-lg font-mono font-bold text-purple-300">
              {Math.min(tutorTurns, 4)} / 4
            </div>
            <div className="text-[10px] text-slate-400">Socratic Turns</div>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-lg font-mono font-bold text-white">{conceptMastery}%</div>
            <div className="text-[10px] text-slate-400">Mastery</div>
          </div>
        </div>
      </div>

      {/* Concept Selector */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">Concept Focus</span>
          <span className="text-[11px] text-purple-300 font-medium">
            Scaffolding tier:{' '}
            {conceptMastery < 50
              ? 'Intuitive analogies'
              : conceptMastery < 75
              ? 'Causal mechanism'
              : 'Exam synthesis'}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {CONCEPTS.map((c) => {
            const m = profile.masteryByConcept[c.id]?.masteryPercentage ?? 0;
            const active = c.id === selectedConceptId;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedConceptId(c.id);
                  resetDialogue();
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer ${
                  active
                    ? 'bg-purple-600/20 border-purple-500 text-purple-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span>{c.name}</span>
                <span className="font-mono text-[10px] text-slate-300">{m}%</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Dialogue Workspace */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Socratic Inquiry Thread • {selectedConcept.name}
          </span>
          {messages.length > 0 && (
            <button
              onClick={resetDialogue}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start Fresh Thread</span>
            </button>
          )}
        </div>

        {fallbackBanner && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{fallbackBanner}</span>
          </div>
        )}

        {/* Empty Initial Prompt State */}
        {messages.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
            <div className="flex items-start gap-3">
              <span className="p-2 rounded-xl bg-purple-500/15 text-purple-300 shrink-0">
                <Lightbulb className="w-5 h-5" />
              </span>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">
                  What feels tricky about {selectedConcept.name}?
                </h3>
                <p className="text-xs text-slate-400">
                  Tell me where you are stuck—I won't spoil the answer. We'll uncover it in 3–4 short turns.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {starterDoubts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(prompt)}
                  className="text-left px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-purple-200 transition-all cursor-pointer"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed border ${
                    msg.role === 'student'
                      ? 'bg-indigo-600/20 border-indigo-500/40 text-slate-100'
                      : 'bg-slate-950 border-purple-500/30 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1 text-[10px] font-bold uppercase tracking-wider">
                    <span className={msg.role === 'student' ? 'text-indigo-300' : 'text-purple-300'}>
                      {msg.role === 'student' ? 'Your Thinking' : 'Socratic Tutor (Guiding Question)'}
                    </span>
                    <span className="text-slate-500">{msg.timestamp}</span>
                  </div>
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-purple-300 animate-pulse">
                  Formulating next guiding question based on your response...
                </div>
              </div>
            )}
          </div>
        )}

        {latestTutorNote && !summary && (
          <div className="px-3 py-2 rounded-xl bg-purple-950/20 border border-purple-500/20 text-[11px] text-purple-200">
            Coach note: {latestTutorNote}
          </div>
        )}

        {/* Input Box (hidden once summary phase starts) */}
        {!summary && (
          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-800">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={
                messages.length === 0
                  ? `Ask what confuses you about ${selectedConcept.name}...`
                  : 'Reply with your reasoning to the guiding question...'
              }
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500"
            />
            <button
              disabled={!inputValue.trim() || isLoading}
              onClick={() => sendMessage()}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Reply</span>
            </button>
          </div>
        )}

        {/* Post-3-Turn Discovery Summary + Synthesis Practice Question */}
        {summary && practiceQuestion && (
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="p-4 rounded-xl bg-emerald-950/25 border border-emerald-500/30 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Socratic Discovery Summary</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{summary}</p>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-purple-300 uppercase tracking-wider">
                  Synthesis Practice Check
                </span>
                <span className="text-slate-400 capitalize">
                  {practiceQuestion.difficulty} tier
                </span>
              </div>
              <p className="text-sm font-semibold text-white">{practiceQuestion.questionText}</p>

              <div className="space-y-2">
                {practiceQuestion.options.map((opt) => {
                  const chosen = selectedPracticeOption === opt.id;
                  const correct = opt.id === practiceQuestion.correctOptionId;
                  let style =
                    'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';
                  if (sessionSaved) {
                    if (correct) {
                      style = 'bg-emerald-950/40 border-emerald-500 text-emerald-200';
                    } else if (chosen) {
                      style = 'bg-rose-950/40 border-rose-500 text-rose-200';
                    }
                  }
                  return (
                    <button
                      key={opt.id}
                      disabled={sessionSaved}
                      onClick={() => handleSubmitPracticeCheck(opt.id)}
                      className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all cursor-pointer ${style}`}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>

              {sessionSaved && (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {selectedPracticeOption === practiceQuestion.correctOptionId
                          ? 'Spot on! Logged +8% mastery boost to Learning Memory.'
                          : 'Session logged (+3% discovery credit) to Learning Memory.'}
                      </span>
                    </span>
                    {onPracticeConcept && (
                      <button
                        onClick={() => onPracticeConcept(selectedConcept.id)}
                        className="text-indigo-300 hover:text-indigo-200 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <span>More Practice</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-slate-300">{practiceQuestion.explanation}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Session History with Empty State */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white">Completed Socratic Dialogues</h3>
        {pastSessions.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-950/70 border border-slate-800 text-center space-y-1.5">
            <MessageCircleQuestion className="w-7 h-7 text-slate-600 mx-auto" />
            <p className="text-xs font-semibold text-slate-300">No Socratic sessions completed yet</p>
            <p className="text-[11px] text-slate-400">
              Work through 3–4 guided turns above to unlock a synthesis question and log your discovery.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {pastSessions.slice(0, 5).map((s) => (
              <div
                key={s.id}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <span className="font-bold text-white">{s.concept}</span>
                  <span className="text-slate-500 ml-2 inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {s.timestamp}
                  </span>
                  {s.summary && <p className="text-slate-400 mt-1 line-clamp-1">{s.summary}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 font-mono">
                    {s.turnsCount} turns
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono font-bold">
                    +{s.masteryDelta}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
