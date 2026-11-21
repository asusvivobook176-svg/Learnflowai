import React, { useState, useEffect, useRef } from 'react';
import { useLearner } from '../context/LearnerContext';
import { SAMPLE_PRACTICE_QUESTIONS, CONCEPTS } from '../data/syllabus';
import {
  DifficultyLevel,
  Question,
  ReasoningAnalysisResult,
  ConfidenceLevel,
  Recommendation,
} from '../types/learning';
import { WhyAmISeeingThis } from './WhyAmISeeingThis';
import {
  Target,
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Brain,
  Zap,
  TrendingUp,
  LifeBuoy,
} from 'lucide-react';

interface AdaptivePracticeProps {
  initialConceptId?: string;
  onOpenVoiceWithPrompt?: (prompt: string) => void;
  onLaunchRescue?: (conceptId: string) => void;
}

export const AdaptivePractice: React.FC<AdaptivePracticeProps> = ({
  initialConceptId,
  onOpenVoiceWithPrompt,
  onLaunchRescue,
}) => {
  const {
    profile,
    updateConceptMastery,
    addMisconception,
    addAgentLog,
    setActiveTab,
  } = useLearner();

  // Find weakest concept to recommend by default (e.g. Series Circuits 35%)
  const weakestConceptId = Object.entries(profile.masteryByConcept).sort(
    ([, a], [, b]) => a.masteryPercentage - b.masteryPercentage
  )[0]?.[0] || 'series-circuits';

  const calibrateDifficultyForConcept = (conceptId: string): DifficultyLevel => {
    const m = profile.masteryByConcept[conceptId]?.masteryPercentage ?? 50;
    if (m < 50) return 'easy';
    if (m < 75) return 'medium';
    return 'hard';
  };

  const startingConceptId = initialConceptId || weakestConceptId;
  const [selectedConceptId, setSelectedConceptId] = useState<string>(startingConceptId);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>(() =>
    calibrateDifficultyForConcept(startingConceptId)
  );
  const [isAutoCalibrated, setIsAutoCalibrated] = useState<boolean>(true);
  const [currentQuestion, setCurrentQuestion] = useState<Question>(
    SAMPLE_PRACTICE_QUESTIONS.find((q) => q.conceptId === startingConceptId) || SAMPLE_PRACTICE_QUESTIONS[0]
  );
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<ConfidenceLevel>('medium');

  // Explain My Thinking mode
  const [explainMode, setExplainMode] = useState<boolean>(true);
  const [verbalReasoning, setVerbalReasoning] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);

  // Evaluation & Results
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<ReasoningAnalysisResult | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const questionStartedAtRef = useRef<number>(Date.now());

  // Sync if initialConceptId changes
  useEffect(() => {
    if (initialConceptId) {
      const calibrated = calibrateDifficultyForConcept(initialConceptId);
      setSelectedConceptId(initialConceptId);
      setSelectedDifficulty(calibrated);
      setIsAutoCalibrated(true);
      loadQuestionForConcept(initialConceptId, calibrated);
    }
  }, [initialConceptId]);

  const loadQuestionForConcept = (conceptId: string, diff: DifficultyLevel) => {
    const matching = SAMPLE_PRACTICE_QUESTIONS.find(
      (q) => q.conceptId === conceptId && q.difficulty === diff
    );
    if (matching) {
      setCurrentQuestion(matching);
    } else {
      const fallback = SAMPLE_PRACTICE_QUESTIONS.find((q) => q.conceptId === conceptId) ||
        SAMPLE_PRACTICE_QUESTIONS[0];
      setCurrentQuestion({
        ...fallback,
        id: `q-${Date.now()}`,
        difficulty: diff,
      });
    }
    // Reset state
    setSelectedOptionId(null);
    setVerbalReasoning('');
    setHasSubmitted(false);
    setEvaluationResult(null);
    questionStartedAtRef.current = Date.now();
  };

  const handleDifficultyChange = (diff: DifficultyLevel) => {
    setSelectedDifficulty(diff);
    setIsAutoCalibrated(false);
    loadQuestionForConcept(selectedConceptId, diff);
  };

  const handleConceptChange = (cId: string) => {
    const calibrated = calibrateDifficultyForConcept(cId);
    setSelectedConceptId(cId);
    setSelectedDifficulty(calibrated);
    setIsAutoCalibrated(true);
    loadQuestionForConcept(cId, calibrated);
  };

  // Generate new adaptive question via server AI
  const handleFetchAdaptiveQuestion = async (overrideDifficulty?: DifficultyLevel) => {
    const effectiveDifficulty = overrideDifficulty || selectedDifficulty;
    if (overrideDifficulty) {
      setSelectedDifficulty(overrideDifficulty);
      setIsAutoCalibrated(true);
    }
    const activeMisc = profile.misconceptions.find(
      (m) => m.conceptId === selectedConceptId && m.status === 'active'
    );

    setIsEvaluating(true);
    addAgentLog(
      'Adaptive Learning Agent',
      'Generating Calibrated Item',
      `Querying for ${selectedConceptId} at difficulty: ${effectiveDifficulty}${activeMisc ? ` (targeting "${activeMisc.title}")` : ''}.`,
      'info'
    );

    try {
      const resp = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conceptId: selectedConceptId,
          conceptName: CONCEPTS.find((c) => c.id === selectedConceptId)?.name || 'Electricity',
          difficulty: effectiveDifficulty,
          targetMisconception: activeMisc?.title,
        }),
      });

      const newQ = await resp.json();
      if (newQ && newQ.questionText) {
        setCurrentQuestion(newQ);
        setSelectedOptionId(null);
        setVerbalReasoning('');
        setHasSubmitted(false);
        setEvaluationResult(null);
        questionStartedAtRef.current = Date.now();
      }
    } catch (e) {
      console.warn('Failed to fetch AI question, cycling sample:', e);
      loadQuestionForConcept(selectedConceptId, effectiveDifficulty);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOptionId) return;

    setIsEvaluating(true);
    const isCorrect = selectedOptionId === currentQuestion.correctOptionId;
    const selectedText = currentQuestion.options.find((o) => o.id === selectedOptionId)?.text || '';
    const correctText = currentQuestion.options.find((o) => o.id === currentQuestion.correctOptionId)?.text || '';

    addAgentLog(
      'Misconception Detection Agent',
      'Reasoning Audit Initiated',
      `Evaluating student answer & reasoning on "${currentQuestion.conceptName}".`,
      'warning'
    );

    try {
      const response = await fetch('/api/evaluate-reasoning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: currentQuestion.questionText,
          selectedOptionText: selectedText,
          correctOptionText: correctText,
          isCorrect,
          studentReasoning: verbalReasoning,
          conceptName: currentQuestion.conceptName,
          confidence,
        }),
      });

      const evalData: ReasoningAnalysisResult = await response.json();
      setEvaluationResult(evalData);
      setHasSubmitted(true);

      // Compute elapsed practice minutes (min 1 minute, typical 2 mins if rapid)
      const elapsedMinutes = Math.max(
        1,
        Math.round((Date.now() - questionStartedAtRef.current) / 60000) || 2
      );

      // Update Living Learner Model
      updateConceptMastery(
        currentQuestion.conceptId,
        evalData.masteryDelta,
        `Answered ${isCorrect ? 'Correctly' : 'Incorrectly'} (Reasoning score: ${evalData.reasoningScore}/100)`,
        isCorrect,
        confidence,
        {
          reasoningText: verbalReasoning,
          reasoningScore: evalData.reasoningScore,
          difficulty: selectedDifficulty,
          questionTitle: currentQuestion.questionText,
          minutesSpent: elapsedMinutes,
        }
      );

      // Record Misconception if detected
      if (evalData.detectedMisconception) {
        addMisconception(
          currentQuestion.conceptId,
          currentQuestion.conceptName,
          evalData.detectedMisconception.title,
          verbalReasoning || selectedText,
          evalData.detectedMisconception.howToCorrect,
          evalData.detectedMisconception.severity || 'medium'
        );
      }

      addAgentLog(
        'Learner Model Agent',
        'State Mutation Commited',
        `Mastery change: ${evalData.masteryDelta > 0 ? '+' : ''}${evalData.masteryDelta}% on ${currentQuestion.conceptName}.`,
        evalData.masteryDelta > 0 ? 'success' : 'warning'
      );
    } catch (err) {
      console.error('Failed to evaluate reasoning:', err);
      // Fallback evaluation
      const fallbackDelta = isCorrect ? 8 : -6;
      setEvaluationResult({
        isCorrect,
        reasoningScore: isCorrect ? 80 : 35,
        errorType: isCorrect ? 'none' : 'conceptual_misconception',
        rubricScores: {
          conceptualAccuracy: isCorrect ? 85 : 35,
          causalLogic: isCorrect ? 82 : 30,
          formulaApplication: isCorrect ? 80 : 40,
        },
        correctConceptsUsed: ['Understands circuit setup'],
        flawedAssumptions: isCorrect ? [] : ['Assumed voltage and current vary in lockstep'],
        missingKnowledge: [],
        detectedMisconception: isCorrect ? null : {
          title: 'Circuit Property Confusion',
          description: 'Mixed up series and parallel properties.',
          howToCorrect: 'Recall that current is constant in series circuits.',
          severity: 'medium',
        },
        supportiveFeedback: isCorrect
          ? 'Well reasoned! Your conceptual foundation on this question is solid.'
          : 'Good try! You are very close. Remember that current cannot be used up or lost along a wire.',
        masteryDelta: fallbackDelta,
        recommendedConcept: currentQuestion.conceptName,
        recommendedDifficulty: isCorrect ? 'hard' : 'easy',
      });
      setHasSubmitted(true);
      const elapsedMinutes = Math.max(
        1,
        Math.round((Date.now() - questionStartedAtRef.current) / 60000) || 2
      );
      updateConceptMastery(
        currentQuestion.conceptId,
        fallbackDelta,
        'Practice answer',
        isCorrect,
        confidence,
        { minutesSpent: elapsedMinutes }
      );
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSpeakTutorAudio = (text: string) => {
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

  const currentConceptMastery = profile.masteryByConcept[selectedConceptId]?.masteryPercentage ?? 50;
  const consecutiveWrongForConcept = profile.consecutiveWrongByConcept?.[selectedConceptId] || 0;
  const shouldTriggerRescue = currentConceptMastery < 40 || consecutiveWrongForConcept >= 3;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Controller Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
                <Target className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-white">Adaptive Question Generator</h2>
            </div>
            <p className="text-xs text-slate-400">
              Questions dynamically adjust based on weak concepts, past mistakes, and reasoning analysis.
            </p>
          </div>

          {/* Difficulty Selector with Auto-Calibration Indicator */}
          <div className="flex flex-col items-start md:items-end gap-1.5">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
              {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => handleDifficultyChange(diff)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                    selectedDifficulty === diff
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-indigo-300 font-medium">
              {isAutoCalibrated
                ? `Auto-calibrated to ${selectedDifficulty} (${currentConceptMastery}% mastery)`
                : `Manual override: ${selectedDifficulty}`}
            </span>
          </div>
        </div>

        {/* Concept Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {CONCEPTS.map((c) => {
            const mastery = profile.masteryByConcept[c.id]?.masteryPercentage ?? 0;
            const isSelected = selectedConceptId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => handleConceptChange(c.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span>{c.name}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                    mastery >= 75
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : mastery >= 50
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {mastery}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Automatic Concept Rescue Trigger Banner */}
      {shouldTriggerRescue && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-900 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0 mt-0.5">
              <LifeBuoy className="w-4 h-4" />
            </span>
            <div>
              <div className="text-xs font-bold text-amber-200">
                Let's try a different way to learn.
              </div>
              <p className="text-[11px] text-slate-300">
                {consecutiveWrongForConcept >= 3
                  ? `${consecutiveWrongForConcept} wrong answers in a row on ${currentQuestion.conceptName}. Try a visual diagram, analogy, step-by-step guide, voice walkthrough, or mini challenge.`
                  : `${currentQuestion.conceptName} mastery is ${currentConceptMastery}% (below 40%). Switch to a fresh learning mode and track if your next answer improves.`}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (onLaunchRescue) {
                onLaunchRescue(selectedConceptId);
              } else {
                setActiveTab('concept-rescue');
              }
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold whitespace-nowrap cursor-pointer shrink-0"
          >
            Open Concept Rescue
          </button>
        </div>
      )}

      {/* Main Question Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        {/* Header tags & Explainability */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {currentQuestion.conceptName}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
              Difficulty: {currentQuestion.difficulty}
            </span>
            <WhyAmISeeingThis
              recommendation={{
                id: `rec-prac-${currentQuestion.conceptId}`,
                concept: currentQuestion.conceptName,
                conceptId: currentQuestion.conceptId,
                type: currentConceptMastery < 50 ? 'low_mastery' : 'spaced_revision',
                priority: currentConceptMastery < 50 ? 'high' : 'medium',
                reasons: [
                  `Current mastery in ${currentQuestion.conceptName} is ${currentConceptMastery}%.`,
                  currentConceptMastery < 50
                    ? `This is currently your lowest-scoring concept in Class 10 Electricity.`
                    : `Spaced repetition scheduler flagged this concept to maintain durable retention.`,
                  `Calibrated at ${selectedDifficulty} tier to test conceptual understanding and detect misconceptions.`,
                ],
                supportingData: {
                  currentMastery: currentConceptMastery,
                  recentIncorrectAnswers: 1,
                  activeMisconceptionsCount: profile.misconceptions.filter(
                    (m) => m.conceptId === currentQuestion.conceptId && m.status === 'active'
                  ).length,
                  daysSinceReview: 1,
                  confidenceAvg: confidence,
                },
                suggestedAction: `Solve this question and verbalize your reasoning in Explain My Thinking Mode.`,
                estimatedMinutes: 3,
              }}
            />
          </div>

          <div className="text-xs text-slate-400">
            Current Concept Mastery:{' '}
            <span className="font-mono font-bold text-white">
              {currentConceptMastery}%
            </span>
          </div>
        </div>

        {/* Question Text */}
        <h3 className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed">
          {currentQuestion.questionText}
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            const isCorrect = opt.id === currentQuestion.correctOptionId;

            let optionStyle =
              'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-950';
            if (hasSubmitted) {
              if (isCorrect) {
                optionStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200';
              } else if (isSelected) {
                optionStyle = 'bg-rose-950/40 border-rose-500 text-rose-200';
              }
            } else if (isSelected) {
              optionStyle =
                'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-md shadow-indigo-500/10';
            }

            return (
              <button
                key={opt.id}
                disabled={hasSubmitted}
                onClick={() => setSelectedOptionId(opt.id)}
                className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-start gap-3 cursor-pointer ${optionStyle}`}
              >
                <span
                  className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    hasSubmitted && isCorrect
                      ? 'border-emerald-400 bg-emerald-500 text-white'
                      : hasSubmitted && isSelected
                      ? 'border-rose-400 bg-rose-500 text-white'
                      : isSelected
                      ? 'border-indigo-400 bg-indigo-500 text-white'
                      : 'border-slate-700 text-slate-500'
                  }`}
                >
                  {opt.id.replace('opt-', '').replace('p1-', '').replace('p2-', '').replace('p3-', '').toUpperCase()}
                </span>
                <span className="leading-relaxed">{opt.text}</span>
              </button>
            );
          })}
        </div>

        {/* Confidence & Explain My Thinking Section */}
        {!hasSubmitted && (
          <div className="space-y-4 pt-2 border-t border-slate-800">
            {/* Confidence Selection */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                Confidence in this choice:
              </span>
              <div className="flex items-center gap-1.5">
                {(['low', 'medium', 'high'] as ConfidenceLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setConfidence(lvl)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
                      confidence === lvl
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Explain My Thinking Mode (Wispr Flow) */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 via-slate-950 to-slate-950 border border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                    <Mic className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      Explain My Thinking Mode (Wispr Flow)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Speak or write why you chose this answer. AI checks your reasoning for misconceptions.
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Recommended
                </span>
              </div>

              <textarea
                value={verbalReasoning}
                onChange={(e) => setVerbalReasoning(e.target.value)}
                placeholder="Explain your thought process... e.g. 'I selected option B because I thought resistance increases the voltage directly, but in series current stays constant...'"
                rows={2}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 resize-none font-sans leading-relaxed"
              />

              {/* Quick sample inject */}
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="text-slate-500">Insert sample thinking:</span>
                <button
                  onClick={() =>
                    setVerbalReasoning(
                      'I thought the first resistor consumes more current from the battery, so the second one gets less current.'
                    )
                  }
                  className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-indigo-300 text-[10px] border border-indigo-500/20 cursor-pointer"
                >
                  "Current consumed trap"
                </button>
                <button
                  onClick={() =>
                    setVerbalReasoning(
                      'Current increases because resistance increases when voltage stays constant.'
                    )
                  }
                  className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 text-[10px] border border-amber-500/20 cursor-pointer"
                >
                  "Ohm's Law inverse trap"
                </button>
                <button
                  onClick={() =>
                    setVerbalReasoning(
                      'I used I = V/R so current should decrease, and I divided 12V by 8 ohms and got 4A by arithmetic slip.'
                    )
                  }
                  className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 text-[10px] border border-cyan-500/20 cursor-pointer"
                >
                  "Calculation slip only"
                </button>
                <button
                  onClick={() =>
                    setVerbalReasoning(
                      'Because the resistors are in series, the same current flows through each, so power P = I²R is highest for the larger resistor.'
                    )
                  }
                  className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-emerald-300 text-[10px] border border-emerald-500/20 cursor-pointer"
                >
                  "Solid P = I²R reasoning"
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => handleFetchAdaptiveQuestion()}
                disabled={isEvaluating}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Generate New AI Question</span>
              </button>

              <button
                disabled={!selectedOptionId || isEvaluating}
                onClick={handleSubmitAnswer}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isEvaluating ? 'Agents Evaluating...' : 'Submit Answer & Evaluate Thinking'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Evaluation Feedback Panel */}
        {hasSubmitted && evaluationResult && (
          <div className="space-y-4 pt-4 border-t border-slate-800 animate-in fade-in duration-300">
            {/* Header Result Pill */}
            <div
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                evaluationResult.isCorrect
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg ${
                    evaluationResult.isCorrect
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {evaluationResult.isCorrect ? '✓' : '✗'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {evaluationResult.isCorrect
                      ? 'Correct Answer!'
                      : 'Incorrect Answer'}
                  </h4>
                  <p className="text-xs text-slate-300">
                    Reasoning Depth Score: {evaluationResult.reasoningScore}/100
                  </p>
                </div>
              </div>

              {/* Mastery Delta Pill */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border shadow-sm ${
                    evaluationResult.masteryDelta > 0
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}
                >
                  Mastery Delta: {evaluationResult.masteryDelta > 0 ? '+' : ''}
                  {evaluationResult.masteryDelta}%
                </span>
              </div>
            </div>

            {/* Error Type & Structured Rubric Breakdown */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  AI Reasoning Rubric Classification
                </span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    evaluationResult.errorType === 'none'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : evaluationResult.errorType === 'calculation_mistake'
                      ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                      : evaluationResult.errorType === 'conceptual_misconception'
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {evaluationResult.errorType === 'none'
                    ? 'Sound Conceptual Mastery'
                    : evaluationResult.errorType === 'calculation_mistake'
                    ? 'Calculation Mistake Only (Concept Intact)'
                    : evaluationResult.errorType === 'conceptual_misconception'
                    ? 'Conceptual Misconception Flagged'
                    : 'Incomplete Explanation'}
                </span>
              </div>

              {evaluationResult.rubricScores && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {[
                    { label: 'Conceptual Accuracy', val: evaluationResult.rubricScores.conceptualAccuracy },
                    { label: 'Causal Logic', val: evaluationResult.rubricScores.causalLogic },
                    { label: 'Formula & Math', val: evaluationResult.rubricScores.formulaApplication },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">{item.label}</span>
                        <span className="font-mono font-bold text-slate-200">{item.val}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                        <div
                          className={`h-full ${
                            item.val >= 75 ? 'bg-emerald-500' : item.val >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${item.val}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Misconception Alert if Detected */}
            {evaluationResult.detectedMisconception && (
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>Misconception Detected: {evaluationResult.detectedMisconception.title}</span>
                </div>
                <p className="text-amber-200/90 text-xs leading-relaxed">
                  {evaluationResult.detectedMisconception.description}
                </p>
                <div className="p-2.5 rounded-lg bg-amber-900/30 border border-amber-500/20 text-amber-100 text-[11px]">
                  <strong>How to correct: </strong>
                  {evaluationResult.detectedMisconception.howToCorrect}
                </div>
              </div>
            )}

            {/* Thinking Analysis Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-emerald-400 block mb-1">
                  Correct Concepts Applied
                </span>
                <ul className="space-y-1 text-slate-300">
                  {evaluationResult.correctConceptsUsed.map((c, i) => (
                    <li key={i}>✓ {c}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-rose-400 block mb-1">
                  Flawed Assumptions
                </span>
                <ul className="space-y-1 text-slate-300">
                  {evaluationResult.flawedAssumptions.length > 0 ? (
                    evaluationResult.flawedAssumptions.map((fa, i) => (
                      <li key={i}>• {fa}</li>
                    ))
                  ) : (
                    <li className="text-slate-500">None detected. Sound reasoning!</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Supportive Pedagogical Explanation with Audio Readout */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-cyan-400" />
                  Supportive Pedagogical Feedback
                </span>
                <button
                  onClick={() => handleSpeakTutorAudio(evaluationResult.supportiveFeedback)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-medium text-slate-300 hover:text-white border border-slate-800 transition-all cursor-pointer"
                >
                  {isPlayingAudio ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Listen to Tutor</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {evaluationResult.supportiveFeedback}
              </p>

              {currentQuestion.keyTakeaway && (
                <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-900">
                  <strong className="text-slate-300">Key Exam Takeaway: </strong>
                  {currentQuestion.keyTakeaway}
                </div>
              )}
            </div>

            {/* Next Question CTA */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-400">
                Auto-calibrated next difficulty:{' '}
                <strong className="text-indigo-300 capitalize">
                  {evaluationResult.recommendedDifficulty}
                </strong>
              </div>

              <button
                onClick={() => handleFetchAdaptiveQuestion(evaluationResult.recommendedDifficulty)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <span>Continue Adaptive Practice ({evaluationResult.recommendedDifficulty})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
