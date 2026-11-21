import React, { useState, useEffect } from 'react';
import { useLearner } from '../context/LearnerContext';
import { CONCEPTS } from '../data/syllabus';
import { Question, RescueModeType } from '../types/learning';
import {
  LifeBuoy,
  Eye,
  Compass,
  ListOrdered,
  Volume2,
  VolumeX,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Info,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface RescueApiResponse {
  title: string;
  headline: string;
  visualType?: string;
  explanationBlocks: Array<{ stepTitle: string; content: string }>;
  analogyOrVisualCaption: string;
  voiceScript: string;
  checkpointQuestion: Question;
  usedFallback?: boolean;
  fallbackNotice?: string | null;
}

function isValidRescueResponse(data: any): data is RescueApiResponse {
  return (
    !!data &&
    typeof data === 'object' &&
    typeof data.title === 'string' &&
    typeof data.headline === 'string' &&
    Array.isArray(data.explanationBlocks) &&
    data.explanationBlocks.length > 0 &&
    typeof data.analogyOrVisualCaption === 'string' &&
    typeof data.voiceScript === 'string' &&
    !!data.checkpointQuestion &&
    typeof data.checkpointQuestion.questionText === 'string' &&
    Array.isArray(data.checkpointQuestion.options) &&
    data.checkpointQuestion.options.length >= 2 &&
    typeof data.checkpointQuestion.correctOptionId === 'string'
  );
}

interface ConceptRescueViewProps {
  initialConceptId?: string;
  onPracticeConcept?: (conceptId: string) => void;
}

export const ConceptRescueView: React.FC<ConceptRescueViewProps> = ({
  initialConceptId,
  onPracticeConcept,
}) => {
  const { profile, recordRescueAttempt, resolveRescueOutcome } = useLearner();

  // Identify concepts meeting automatic rescue criteria: 3 wrong in a row OR mastery < 40%
  const rescueTriggeredConcepts = CONCEPTS.filter((c) => {
    const mastery = profile.masteryByConcept[c.id]?.masteryPercentage ?? 50;
    const wrongStreak = profile.consecutiveWrongByConcept?.[c.id] || 0;
    return mastery < 40 || wrongStreak >= 3;
  });

  const defaultConceptId =
    initialConceptId ||
    rescueTriggeredConcepts[0]?.id ||
    Object.entries(profile.masteryByConcept).sort(
      ([, a], [, b]) => a.masteryPercentage - b.masteryPercentage
    )[0]?.[0] ||
    'series-circuits';

  const [selectedConceptId, setSelectedConceptId] = useState<string>(defaultConceptId);
  const [chosenMode, setChosenMode] = useState<RescueModeType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rescueContent, setRescueContent] = useState<RescueApiResponse | null>(null);
  const [activeRescueEventId, setActiveRescueEventId] = useState<string | null>(null);
  const [fallbackBanner, setFallbackBanner] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [checkpointResolved, setCheckpointResolved] = useState<boolean>(false);
  const [checkpointImproved, setCheckpointImproved] = useState<boolean | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    if (initialConceptId) {
      setSelectedConceptId(initialConceptId);
      setRescueContent(null);
      setChosenMode(null);
      setCheckpointResolved(false);
    }
  }, [initialConceptId]);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const selectedConcept = CONCEPTS.find((c) => c.id === selectedConceptId) || CONCEPTS[0];
  const currentMastery = profile.masteryByConcept[selectedConceptId]?.masteryPercentage ?? 50;
  const consecutiveWrong = profile.consecutiveWrongByConcept?.[selectedConceptId] || 0;
  const isTriggered = currentMastery < 40 || consecutiveWrong >= 3;

  const rescueModes: Array<{
    id: RescueModeType;
    label: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    accent: string;
  }> = [
    {
      id: 'visual',
      label: 'Visual explanation',
      subtitle: 'Circuit diagram & spatial flow',
      icon: Eye,
      accent: 'text-cyan-300 border-cyan-500/30 bg-cyan-500/10',
    },
    {
      id: 'analogy',
      label: 'Real-world analogy',
      subtitle: 'Everyday mental model',
      icon: Compass,
      accent: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
    },
    {
      id: 'step_by_step',
      label: 'Step-by-step',
      subtitle: '3 zero-skip micro steps',
      icon: ListOrdered,
      accent: 'text-indigo-300 border-indigo-500/30 bg-indigo-500/10',
    },
    {
      id: 'voice',
      label: 'Voice conversation',
      subtitle: 'Spoken walkthrough',
      icon: Volume2,
      accent: 'text-purple-300 border-purple-500/30 bg-purple-500/10',
    },
    {
      id: 'mini_challenge',
      label: 'Mini challenge',
      subtitle: 'Predict-first micro puzzle',
      icon: Zap,
      accent: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
    },
  ];

  const handleLaunchMode = async (mode: RescueModeType) => {
    setChosenMode(mode);
    setIsLoading(true);
    setFallbackBanner(null);
    setRescueContent(null);
    setSelectedOptionId(null);
    setCheckpointResolved(false);
    setCheckpointImproved(null);

    const activeMiscs = profile.misconceptions
      .filter((m) => m.conceptId === selectedConcept.id && m.status === 'active')
      .map((m) => m.title);

    const triggerReason =
      consecutiveWrong >= 3
        ? 'three_wrong_in_a_row'
        : currentMastery < 40
        ? 'low_mastery_below_40'
        : 'manual_launch';

    const recorded = recordRescueAttempt({
      conceptId: selectedConcept.id,
      concept: selectedConcept.name,
      triggerReason,
      chosenMode: mode,
      masteryAtTrigger: currentMastery,
      nextAnswerImproved: null,
      masteryDelta: 0,
    });
    setActiveRescueEventId(recorded.id);

    try {
      const resp = await fetch('/api/concept-rescue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conceptId: selectedConcept.id,
          conceptName: selectedConcept.name,
          rescueMode: mode,
          currentMastery,
          recentMisconceptions: activeMiscs,
        }),
      });

      const raw = await resp.json();
      if (!resp.ok || !isValidRescueResponse(raw)) {
        throw new Error('Invalid rescue response');
      }

      if (raw.usedFallback && raw.fallbackNotice) {
        setFallbackBanner(raw.fallbackNotice);
      }
      setRescueContent(raw);
    } catch {
      setFallbackBanner(
        'Live AI rescue guide could not be reached; loaded a calm local explanation and checkpoint.'
      );
      setRescueContent({
        title: `Fresh Angle on ${selectedConcept.name}`,
        headline: `Let's reset ${selectedConcept.name} clearly (${currentMastery}% mastery).`,
        explanationBlocks: [
          {
            stepTitle: 'Core Picture',
            content: selectedConcept.shortDescription,
          },
          {
            stepTitle: 'Watch Out For',
            content: selectedConcept.commonMisconceptions[0] || 'Keep charge and energy conserved.',
          },
        ],
        analogyOrVisualCaption: selectedConcept.keyFormula || selectedConcept.shortDescription,
        voiceScript: `Let's reset ${selectedConcept.name}. ${selectedConcept.shortDescription}`,
        checkpointQuestion: {
          id: `res-local-${Date.now()}`,
          conceptId: selectedConcept.id,
          conceptName: selectedConcept.name,
          difficulty: 'easy',
          questionText: `Quick verification on ${selectedConcept.name}: which statement is physically true?`,
          options: [
            { id: 'opt-a', text: selectedConcept.shortDescription },
            { id: 'opt-b', text: 'Charges disappear after passing through a component' },
            { id: 'opt-c', text: 'Battery voltage increases automatically with every added wire' },
            { id: 'opt-d', text: 'Resistance drops to zero whenever a switch opens' },
          ],
          correctOptionId: 'opt-a',
          explanation: selectedConcept.shortDescription,
          keyTakeaway: selectedConcept.keyFormula || selectedConcept.shortDescription,
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVoice = (script: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleVerifyCheckpoint = (optionId: string) => {
    if (!rescueContent || checkpointResolved) return;
    setSelectedOptionId(optionId);
    const improved = optionId === rescueContent.checkpointQuestion.correctOptionId;
    setCheckpointImproved(improved);
    setCheckpointResolved(true);

    if (activeRescueEventId) {
      resolveRescueOutcome(
        activeRescueEventId,
        improved,
        improved ? 10 : -2,
        improved
          ? `Solved follow-up check after ${chosenMode} rescue.`
          : `Missed follow-up check after ${chosenMode} rescue; try another modality.`
      );
    }
  };

  const rescueHistory = profile.rescueEvents || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Adaptive Rescue Trigger Banner */}
      <div
        className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isTriggered
            ? 'bg-gradient-to-br from-amber-950/50 via-slate-900 to-slate-900 border-amber-500/40'
            : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
              <LifeBuoy className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
              {isTriggered ? 'Concept Rescue Triggered' : 'Multi-Modality Learning Studio'}
            </span>
          </div>
          <h2 className="text-lg font-bold text-white">Let's try a different way to learn.</h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            {consecutiveWrong >= 3
              ? `Triggered by ${consecutiveWrong} wrong answers in a row on ${selectedConcept.name}. Switching how an idea is represented often unlocks it right away.`
              : currentMastery < 40
              ? `Triggered automatically because ${selectedConcept.name} mastery is ${currentMastery}% (below 40%). Pick a learning angle below and verify whether your next answer improves.`
              : `Pick any concept and explore 5 alternative explanations, then track whether your next answer improves.`}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div
              className={`text-lg font-mono font-bold ${
                currentMastery < 40 ? 'text-rose-400' : 'text-white'
              }`}
            >
              {currentMastery}%
            </div>
            <div className="text-[10px] text-slate-400">{selectedConcept.name}</div>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div
              className={`text-lg font-mono font-bold ${
                consecutiveWrong >= 3 ? 'text-amber-300' : 'text-slate-300'
              }`}
            >
              {consecutiveWrong}x
            </div>
            <div className="text-[10px] text-slate-400">Wrong Streak</div>
          </div>
        </div>
      </div>

      {/* Concept Selector */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">Select Concept</span>
          {rescueTriggeredConcepts.length > 0 && (
            <span className="text-[11px] text-amber-300 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>
                {rescueTriggeredConcepts.length} concept{rescueTriggeredConcepts.length > 1 ? 's' : ''} currently below threshold
              </span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {CONCEPTS.map((c) => {
            const m = profile.masteryByConcept[c.id]?.masteryPercentage ?? 0;
            const wrong = profile.consecutiveWrongByConcept?.[c.id] || 0;
            const flagged = m < 40 || wrong >= 3;
            const active = c.id === selectedConceptId;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedConceptId(c.id);
                  setChosenMode(null);
                  setRescueContent(null);
                  setCheckpointResolved(false);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer ${
                  active
                    ? 'bg-amber-600/20 border-amber-500 text-amber-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span>{c.name}</span>
                <span
                  className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                    flagged ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {m}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5 Rescue Modes Grid */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Choose a fresh way to learn {selectedConcept.name}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {rescueModes.map((m) => {
            const Icon = m.icon;
            const active = chosenMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => handleLaunchMode(m.id)}
                className={`text-left p-4 rounded-2xl border transition-all space-y-2 cursor-pointer ${
                  active
                    ? 'bg-indigo-950/50 border-indigo-400 shadow-lg shadow-indigo-950/40'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className={`inline-flex p-2 rounded-xl border ${m.accent}`}>
                  <Icon className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-xs font-bold text-white">{m.label}</div>
                  <div className="text-[11px] text-slate-400">{m.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse space-y-3">
          <div className="h-5 w-56 bg-slate-800 rounded" />
          <div className="h-24 bg-slate-950 border border-slate-800 rounded-xl" />
          <div className="h-32 bg-slate-950 border border-slate-800 rounded-xl" />
        </div>
      )}

      {fallbackBanner && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{fallbackBanner}</span>
        </div>
      )}

      {/* Rescue Lesson & Verification Checkpoint */}
      {!isLoading && rescueContent && (
        <div className="space-y-5 p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">{rescueContent.title}</h3>
              <p className="text-xs text-slate-300">{rescueContent.headline}</p>
            </div>
            <button
              onClick={() => handleToggleVoice(rescueContent.voiceScript)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-semibold cursor-pointer self-start sm:self-auto"
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4 text-rose-400" />
                  <span>Stop Voice Walkthrough</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>Play Voice Walkthrough</span>
                </>
              )}
            </button>
          </div>

          {/* Inline SVG Physics Diagram for Visual Mode */}
          {chosenMode === 'visual' && (
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                Visual Circuit Flow Blueprint
              </div>
              <svg
                viewBox="0 0 520 150"
                className="w-full max-w-lg mx-auto h-36"
                role="img"
                aria-label="Circuit flow diagram"
              >
                <rect x="45" y="25" width="430" height="100" rx="14" fill="none" stroke="#38bdf8" strokeWidth="3" />
                {/* Battery */}
                <rect x="28" y="55" width="34" height="40" rx="6" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
                <text x="45" y="79" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="bold">
                  12V
                </text>
                {/* Ammeter A1 */}
                <circle cx="155" cy="25" r="16" fill="#0f172a" stroke="#34d399" strokeWidth="2" />
                <text x="155" y="29" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="bold">
                  I₁=2A
                </text>
                {/* Resistor R1 */}
                <rect x="215" y="13" width="60" height="24" rx="5" fill="#1e293b" stroke="#818cf8" strokeWidth="2" />
                <text x="245" y="29" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="bold">
                  R1 (2Ω)
                </text>
                {/* Resistor R2 */}
                <rect x="315" y="13" width="60" height="24" rx="5" fill="#1e293b" stroke="#818cf8" strokeWidth="2" />
                <text x="345" y="29" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="bold">
                  R2 (4Ω)
                </text>
                {/* Ammeter A2 */}
                <circle cx="425" cy="25" r="16" fill="#0f172a" stroke="#34d399" strokeWidth="2" />
                <text x="425" y="29" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="bold">
                  I₂=2A
                </text>
                <text x="260" y="112" textAnchor="middle" fill="#94a3b8" fontSize="11">
                  Equal current enters & exits every series point • Voltage drops V₁ + V₂ = 12V
                </text>
              </svg>
              <p className="text-xs text-cyan-200/90 text-center">
                {rescueContent.analogyOrVisualCaption}
              </p>
            </div>
          )}

          {/* Explanation Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rescueContent.explanationBlocks.map((block, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1"
              >
                <div className="text-xs font-bold text-indigo-300">{block.stepTitle}</div>
                <p className="text-xs text-slate-200 leading-relaxed">{block.content}</p>
              </div>
            ))}
          </div>

          {chosenMode !== 'visual' && (
            <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-100">
              <strong className="text-indigo-300">Key Picture: </strong>
              {rescueContent.analogyOrVisualCaption}
            </div>
          )}

          {/* Verification Checkpoint to track whether next answer improved */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Quick Verification Check (Tracks Next-Answer Improvement)</span>
              </span>
            </div>
            <p className="text-sm font-semibold text-white">
              {rescueContent.checkpointQuestion.questionText}
            </p>
            <div className="space-y-2">
              {rescueContent.checkpointQuestion.options.map((opt) => {
                const chosen = selectedOptionId === opt.id;
                const correct = opt.id === rescueContent.checkpointQuestion.correctOptionId;
                let style =
                  'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';
                if (checkpointResolved) {
                  if (correct) {
                    style = 'bg-emerald-950/40 border-emerald-500 text-emerald-200';
                  } else if (chosen) {
                    style = 'bg-rose-950/40 border-rose-500 text-rose-200';
                  }
                }
                return (
                  <button
                    key={opt.id}
                    disabled={checkpointResolved}
                    onClick={() => handleVerifyCheckpoint(opt.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all cursor-pointer ${style}`}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>

            {checkpointResolved && (
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                  checkpointImproved
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {checkpointImproved
                        ? 'Next Answer Improved! (+10% mastery & recorded in Rescue Log)'
                        : 'Still tricky—recorded outcome. Pick another rescue mode above to try a fresh angle!'}
                    </span>
                  </span>
                  {onPracticeConcept && checkpointImproved && (
                    <button
                      onClick={() => onPracticeConcept(selectedConcept.id)}
                      className="text-emerald-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Back to Practice</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-slate-300">{rescueContent.checkpointQuestion.explanation}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rescue Mode Effectiveness History */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Concept Rescue Log & Next-Answer Impact</h3>
          <span className="text-[11px] text-slate-400">Tracks which modality works best for you</span>
        </div>

        {rescueHistory.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-950/70 border border-slate-800 text-center space-y-1.5">
            <LifeBuoy className="w-7 h-7 text-slate-600 mx-auto" />
            <p className="text-xs font-semibold text-slate-300">No rescue attempts logged yet</p>
            <p className="text-[11px] text-slate-400">
              Select any of the 5 modes above to record your chosen learning mode and measure next-answer improvement.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {rescueHistory.slice(0, 6).map((ev) => (
              <div
                key={ev.id}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <span className="font-bold text-white">{ev.concept}</span>
                  <span className="ml-2 px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 capitalize">
                    {ev.chosenMode.replace('_', ' ')}
                  </span>
                  <span className="text-slate-500 ml-2 inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {ev.timestamp}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {ev.nextAnswerImproved === null ? (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
                      Awaiting next answer
                    </span>
                  ) : ev.nextAnswerImproved ? (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
                      Next Answer Improved (+{ev.masteryDelta}%)
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">
                      Try Another Angle
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
