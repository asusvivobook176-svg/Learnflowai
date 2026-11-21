import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLearner } from '../context/LearnerContext';
import {
  SAMPLE_PRACTICE_QUESTIONS,
  CONCEPTS,
  MISCONCEPTION_LIBRARY,
  matchMisconceptionLibrary,
} from '../data/syllabus';
import {
  DifficultyLevel,
  Question,
  ReasoningAnalysisResult,
  ConfidenceLevel,
} from '../types/learning';
import {
  calibrateNextDifficulty,
  computePrerequisiteRecommendation,
} from '../utils/intelligence';
import { WhyAmISeeingThis } from './WhyAmISeeingThis';
import { MasteryBadgeModal } from './MasteryBadgeModal';
import {
  Target,
  Mic,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Brain,
  LifeBuoy,
  GitBranch,
  Award,
  BookOpen,
  SlidersHorizontal,
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
    showToast,
  } = useLearner();

  const weakestConceptId =
    Object.entries(profile.masteryByConcept).sort(
      ([, a], [, b]) => a.masteryPercentage - b.masteryPercentage
    )[0]?.[0] || 'series-circuits';

  const startingConceptId = initialConceptId || weakestConceptId;
  const [selectedConceptId, setSelectedConceptId] = useState<string>(startingConceptId);

  const calibration = useMemo(
    () => calibrateNextDifficulty(profile, selectedConceptId),
    [profile, selectedConceptId]
  );

  const prerequisiteRec = useMemo(
    () => computePrerequisiteRecommendation(profile, selectedConceptId),
    [profile, selectedConceptId]
  );

  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>(
    () => calibrateNextDifficulty(profile, startingConceptId).difficulty
  );
  const [isAutoCalibrated, setIsAutoCalibrated] = useState<boolean>(true);
  const [currentQuestion, setCurrentQuestion] = useState<Question>(
    SAMPLE_PRACTICE_QUESTIONS.find((q) => q.conceptId === startingConceptId) ||
      SAMPLE_PRACTICE_QUESTIONS[0]
  );
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<ConfidenceLevel>('medium');

  // Explain My Thinking mode
  const [verbalReasoning, setVerbalReasoning] = useState<string>('');

  // Evaluation & Results
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<ReasoningAnalysisResult | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState<boolean>(false);
  const questionStartedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    if (initialConceptId) {
      const nextCal = calibrateNextDifficulty(profile, initialConceptId);
      setSelectedConceptId(initialConceptId);
      setSelectedDifficulty(nextCal.difficulty);
      setIsAutoCalibrated(true);
      loadQuestionForConcept(initialConceptId, nextCal.difficulty);
    }
  }, [initialConceptId]);

  const loadQuestionForConcept = (conceptId: string, diff: DifficultyLevel) => {
    const matching = SAMPLE_PRACTICE_QUESTIONS.find(
      (q) => q.conceptId === conceptId && q.difficulty === diff
    );
    if (matching) {
      setCurrentQuestion(matching);
    } else {
      const fallback =
        SAMPLE_PRACTICE_QUESTIONS.find((q) => q.conceptId === conceptId) ||
        SAMPLE_PRACTICE_QUESTIONS[0];
      const conceptMeta = CONCEPTS.find((c) => c.id === conceptId);
      setCurrentQuestion({
        ...fallback,
        id: `q-${conceptId}-${Date.now()}`,
        conceptId,
        conceptName: conceptMeta?.name || fallback.conceptName,
        difficulty: diff,
      });
    }
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
    const nextCal = calibrateNextDifficulty(profile, cId);
    setSelectedConceptId(cId);
    setSelectedDifficulty(nextCal.difficulty);
    setIsAutoCalibrated(true);
    loadQuestionForConcept(cId, nextCal.difficulty);
  };

  const handleFetchAdaptiveQuestion = async (overrideDifficulty?: DifficultyLevel) => {
    const freshCal = calibrateNextDifficulty(profile, selectedConceptId);
    const effectiveDifficulty = overrideDifficulty || freshCal.difficulty;
    setSelectedDifficulty(effectiveDifficulty);
    setIsAutoCalibrated(true);

    const activeMisc = profile.misconceptions.find(
      (m) => m.conceptId === selectedConceptId && m.status === 'active'
    );

    setIsGeneratingQuestion(true);
    addAgentLog(
      'Adaptive Learning Agent',
      'Generating Calibrated Item',
      `Calibrated ${selectedConceptId} to ${effectiveDifficulty}${
        activeMisc ? ` (targeting "${activeMisc.title}")` : ''
      }.`,
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
      if (newQ && newQ.questionText && Array.isArray(newQ.options) && newQ.options.length >= 2) {
        setCurrentQuestion({
          ...newQ,
          conceptId: newQ.conceptId || selectedConceptId,
          conceptName:
            newQ.conceptName ||
            CONCEPTS.find((c) => c.id === selectedConceptId)?.name ||
            'Electricity',
        });
        setSelectedOptionId(null);
        setVerbalReasoning('');
        setHasSubmitted(false);
        setEvaluationResult(null);
        questionStartedAtRef.current = Date.now();
      } else {
        throw new Error('Invalid AI question payload');
      }
    } catch {
      showToast('Using curated syllabus backup question while AI reconnects.', 'info');
      loadQuestionForConcept(selectedConceptId, effectiveDifficulty);
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOptionId) return;

    setIsEvaluating(true);
    const responseTimeMs = Math.max(2000, Date.now() - questionStartedAtRef.current);
    const isCorrect = selectedOptionId === currentQuestion.correctOptionId;
    const selectedText =
      currentQuestion.options.find((o) => o.id === selectedOptionId)?.text || '';
    const correctText =
      currentQuestion.options.find((o) => o.id === currentQuestion.correctOptionId)?.text || '';

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
          conceptId: currentQuestion.conceptId,
          conceptName: currentQuestion.conceptName,
          confidence,
        }),
      });

      const evalData: ReasoningAnalysisResult = await response.json();
      const matchedLib =
        (evalData.detectedMisconception?.libraryEntryId &&
          MISCONCEPTION_LIBRARY.find(
            (e) => e.id === evalData.detectedMisconception?.libraryEntryId
          )) ||
        (evalData.detectedMisconception
          ? matchMisconceptionLibrary(
              `${evalData.detectedMisconception.title} ${verbalReasoning} ${selectedText}`,
              currentQuestion.conceptId
            )
          : null);

      const enrichedEval: ReasoningAnalysisResult = evalData.detectedMisconception
        ? {
            ...evalData,
            detectedMisconception: {
              ...evalData.detectedMisconception,
              libraryEntryId:
                evalData.detectedMisconception.libraryEntryId || matchedLib?.id,
            },
          }
        : evalData;

      setEvaluationResult(enrichedEval);
      setHasSubmitted(true);

      const elapsedMinutes = Math.max(1, Math.round(responseTimeMs / 60000) || 2);

      updateConceptMastery(
        currentQuestion.conceptId,
        enrichedEval.masteryDelta,
        `Answered ${isCorrect ? 'Correctly' : 'Incorrectly'} (Reasoning score: ${enrichedEval.reasoningScore}/100)`,
        isCorrect,
        confidence,
        {
          reasoningText: verbalReasoning,
          reasoningScore: enrichedEval.reasoningScore,
          difficulty: selectedDifficulty,
          questionTitle: currentQuestion.questionText,
          minutesSpent: elapsedMinutes,
          responseTimeMs,
        }
      );

      if (enrichedEval.detectedMisconception) {
        addMisconception(
          currentQuestion.conceptId,
          currentQuestion.conceptName,
          enrichedEval.detectedMisconception.title,
          verbalReasoning || selectedText,
          enrichedEval.detectedMisconception.howToCorrect,
          enrichedEval.detectedMisconception.severity || 'medium',
          enrichedEval.detectedMisconception.libraryEntryId
        );
      }

      addAgentLog(
        'Learner Model Agent',
        'State Mutation Committed',
        `Mastery change: ${enrichedEval.masteryDelta > 0 ? '+' : ''}${enrichedEval.masteryDelta}% on ${currentQuestion.conceptName}.`,
        enrichedEval.masteryDelta > 0 ? 'success' : 'warning'
      );
    } catch {
      showToast('Using offline reasoning evaluator fallback — progress still saved.', 'info');
      const fallbackDelta = isCorrect ? 8 : -6;
      const libMatch = !isCorrect
        ? matchMisconceptionLibrary(`${verbalReasoning} ${selectedText}`, currentQuestion.conceptId)
        : null;

      setEvaluationResult({
        isCorrect,
        reasoningScore: isCorrect ? 80 : 35,
        errorType: isCorrect ? 'none' : 'conceptual_misconception',
        rubricScores: {
          conceptualAccuracy: isCorrect ? 85 : 35,
          causalLogic: isCorrect ? 82 : 30,
          formulaApplication: isCorrect ? 80 : 40,
        },
        correctConceptsUsed: ['Applied circuit fundamentals'],
        flawedAssumptions: isCorrect
          ? []
          : [libMatch?.exampleStudentPhrase || 'Confused series and parallel behavior'],
        missingKnowledge: [],
        detectedMisconception: isCorrect
          ? null
          : {
              title: libMatch?.name || 'Circuit Property Confusion',
              description:
                libMatch?.explanation ||
                'Mixed up series current conservation and parallel voltage constancy.',
              howToCorrect:
                libMatch?.correctivePractice ||
                'Recall that current is constant in series circuits and voltage is constant across parallel branches.',
              severity: libMatch?.severity || 'medium',
              libraryEntryId: libMatch?.id,
            },
        supportiveFeedback: isCorrect
          ? 'Well reasoned! Your conceptual foundation on this question is solid.'
          : 'Good effort! Check which physical quantity stays constant in this circuit configuration before calculating.',
        masteryDelta: fallbackDelta,
        recommendedConcept: currentQuestion.conceptName,
        recommendedDifficulty: isCorrect ? 'hard' : 'easy',
      });
      setHasSubmitted(true);

      const elapsedMinutes = Math.max(1, Math.round(responseTimeMs / 60000) || 2);
      updateConceptMastery(
        currentQuestion.conceptId,
        fallbackDelta,
        'Practice answer',
        isCorrect,
        confidence,
        {
          minutesSpent: elapsedMinutes,
          responseTimeMs,
          difficulty: selectedDifficulty,
        }
      );
      if (!isCorrect && libMatch) {
        addMisconception(
          currentQuestion.conceptId,
          currentQuestion.conceptName,
          libMatch.name,
          verbalReasoning || selectedText,
          libMatch.explanation,
          libMatch.severity,
          libMatch.id
        );
      }
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

  const currentConceptMastery =
    profile.masteryByConcept[selectedConceptId]?.masteryPercentage ?? 50;
  const currentConceptName =
    CONCEPTS.find((c) => c.id === selectedConceptId)?.name || currentQuestion.conceptName;
  const consecutiveWrongForConcept =
    profile.consecutiveWrongByConcept?.[selectedConceptId] || 0;
  const shouldTriggerRescue =
    currentConceptMastery < 40 || consecutiveWrongForConcept >= 3;

  const hasEarnedBadgeForSelected = (profile.masteryBadges || []).some(
    (b) => b.conceptId === selectedConceptId
  );

  const matchedLibraryEntry = evaluationResult?.detectedMisconception?.libraryEntryId
    ? MISCONCEPTION_LIBRARY.find(
        (e) => e.id === evaluationResult.detectedMisconception?.libraryEntryId
      )
    : evaluationResult?.detectedMisconception
    ? matchMisconceptionLibrary(
        evaluationResult.detectedMisconception.title,
        currentQuestion.conceptId
      )
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Controller Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-300">
                <Target className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-white">Adaptive Question Generator</h2>
            </div>
            <p className="text-xs text-slate-300">
              Difficulty calibrates dynamically from recent accuracy, response speed, confidence, and mastery.
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
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-indigo-300 font-medium">
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
                    ? 'bg-indigo-600/25 border-indigo-400 text-white shadow-sm'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span>{c.name}</span>
                <span
                  className={`text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded-md ${
                    mastery >= 75
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : mastery >= 50
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {mastery}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Prerequisite Path Warning Banner */}
      {prerequisiteRec.hasWeakPrerequisite && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 shrink-0 mt-0.5">
              <GitBranch className="w-4 h-4" />
            </span>
            <div>
              <div className="text-xs font-bold text-indigo-200">
                Prerequisite Path Recommended: {prerequisiteRec.recommendedConceptName} First
              </div>
              <p className="text-[11px] text-slate-200 mt-0.5 leading-relaxed">
                {prerequisiteRec.reason}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleConceptChange(prerequisiteRec.recommendedConceptId)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold whitespace-nowrap cursor-pointer shrink-0 flex items-center gap-1.5"
          >
            <span>Switch to {prerequisiteRec.recommendedConceptName}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Mastery Badge Eligible Banner (>= 80%) */}
      {currentConceptMastery >= 80 && !hasEarnedBadgeForSelected && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0">
              <Award className="w-4 h-4" />
            </span>
            <div>
              <div className="text-xs font-bold text-amber-200">
                Mastery Badge Unlocked for {currentConceptName} ({currentConceptMastery}%)
              </div>
              <p className="text-[11px] text-slate-200 mt-0.5">
                Pass the 5-question multi-dimensional challenge (basic, application, misconception, real-world) to earn your verified badge.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsBadgeModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold whitespace-nowrap cursor-pointer shrink-0"
          >
            Claim Mastery Badge (5-Q)
          </button>
        </div>
      )}

      {/* Automatic Concept Rescue Trigger Banner */}
      {shouldTriggerRescue && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-900 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0 mt-0.5">
              <LifeBuoy className="w-4 h-4" />
            </span>
            <div>
              <div className="text-xs font-bold text-amber-200">
                Let&apos;s try a different way to learn.
              </div>
              <p className="text-[11px] text-slate-200">
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
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
        {isGeneratingQuestion ? (
          <div className="space-y-4 py-4" aria-label="Loading next calibrated question">
            <div className="h-4 w-56 rounded bg-slate-800 animate-pulse" />
            <div className="h-14 w-full rounded-xl bg-slate-800 animate-pulse" />
            <div className="space-y-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 w-full rounded-xl bg-slate-800/80 animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Header tags & Explainability */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">
                  {currentQuestion.conceptName}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200">
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
                      calibration.reasonLine,
                      prerequisiteRec.hasWeakPrerequisite
                        ? prerequisiteRec.reason
                        : 'All upstream prerequisites meet threshold.',
                    ],
                    supportingData: {
                      currentMastery: currentConceptMastery,
                      recentIncorrectAnswers: consecutiveWrongForConcept,
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

              <div className="text-xs text-slate-300">
                Current Concept Mastery:{' '}
                <span className="font-mono tabular-nums font-bold text-white">
                  {currentConceptMastery}%
                </span>
              </div>
            </div>

            {/* Why this difficulty? Calibrator transparency line */}
            <div className="px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5 text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-cyan-300">Why this difficulty? </span>
                <span className="text-slate-200">
                  {isAutoCalibrated
                    ? calibration.reasonLine
                    : `Manually selected ${selectedDifficulty} tier (auto-calibrator recommends ${calibration.difficulty}: ${calibration.factors.recentAccuracyPct}% recent accuracy, ${calibration.factors.avgResponseSeconds}s avg pace).`}
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
                  'bg-slate-950/60 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-950';
                if (hasSubmitted) {
                  if (isCorrect) {
                    optionStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200';
                  } else if (isSelected) {
                    optionStyle = 'bg-rose-950/40 border-rose-500 text-rose-200';
                  }
                } else if (isSelected) {
                  optionStyle =
                    'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10';
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
                          ? 'border-emerald-400 bg-emerald-500 text-slate-950'
                          : hasSubmitted && isSelected
                          ? 'border-rose-400 bg-rose-500 text-white'
                          : isSelected
                          ? 'border-indigo-400 bg-indigo-500 text-white'
                          : 'border-slate-600 text-slate-300'
                      }`}
                    >
                      {opt.id
                        .replace('opt-', '')
                        .replace('p1-', '')
                        .replace('p2-', '')
                        .replace('p3-', '')
                        .replace('p4-', '')
                        .toUpperCase()}
                    </span>
                    <span className="leading-relaxed">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Confidence & Explain My Thinking Section */}
            {!hasSubmitted && (
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-200 font-semibold flex items-center gap-1.5">
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
                            : 'bg-slate-900 text-slate-300 hover:text-white'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Explain My Thinking Mode (Wispr Flow) */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 via-slate-950 to-slate-950 border border-indigo-500/30 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300">
                        <Mic className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-white">
                          Explain My Thinking Mode (Wispr Flow)
                        </h4>
                        <p className="text-[11px] text-slate-300">
                          Speak or write why you chose this answer. AI checks your reasoning against our Physics Misconception Library.
                        </p>
                      </div>
                    </div>

                    {onOpenVoiceWithPrompt && (
                      <button
                        type="button"
                        onClick={() =>
                          onOpenVoiceWithPrompt(
                            `I am solving a ${currentQuestion.conceptName} question: "${currentQuestion.questionText}". Let me explain my thinking:`
                          )
                        }
                        className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-indigo-600/25 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30 whitespace-nowrap cursor-pointer"
                      >
                        Speak Thinking
                      </button>
                    )}
                  </div>

                  <textarea
                    value={verbalReasoning}
                    onChange={(e) => setVerbalReasoning(e.target.value)}
                    aria-label="Explain your reasoning"
                    placeholder="Explain your thought process... e.g. 'I selected option B because I thought resistance increases the voltage directly, but in series current stays constant...'"
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-400 resize-none font-sans leading-relaxed"
                  />

                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="text-slate-300">Insert sample thinking:</span>
                    <button
                      type="button"
                      onClick={() =>
                        setVerbalReasoning(
                          'I thought the first resistor uses up more current from the battery, so the second one gets less current.'
                        )
                      }
                      className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-indigo-300 text-[10px] border border-indigo-500/30 cursor-pointer"
                    >
                      &quot;Current consumed trap&quot;
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setVerbalReasoning(
                          'Current increases when resistance increases while voltage stays constant.'
                        )
                      }
                      className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 text-[10px] border border-amber-500/30 cursor-pointer"
                    >
                      &quot;Ohm&apos;s Law inverse trap&quot;
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setVerbalReasoning(
                          'I used I = V/R so current decreases, and I divided 12V by 8 ohms and got 4A by arithmetic slip.'
                        )
                      }
                      className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 text-[10px] border border-cyan-500/30 cursor-pointer"
                    >
                      &quot;Calculation slip only&quot;
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setVerbalReasoning(
                          'Because the resistors are in series, the same current flows through each, so power P = I²R is highest for the larger resistor.'
                        )
                      }
                      className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-emerald-300 text-[10px] border border-emerald-500/30 cursor-pointer"
                    >
                      &quot;Solid P = I²R reasoning&quot;
                    </button>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => handleFetchAdaptiveQuestion()}
                    disabled={isEvaluating || isGeneratingQuestion}
                    className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
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
                    <span>
                      {isEvaluating ? 'Agents Evaluating...' : 'Submit Answer & Evaluate Thinking'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Evaluation Feedback Panel */}
            {hasSubmitted && evaluationResult && (
              <div className="space-y-4 pt-4 border-t border-slate-800 animate-in fade-in duration-300">
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
                        {evaluationResult.isCorrect ? 'Correct Answer!' : 'Incorrect Answer'}
                      </h4>
                      <p className="text-xs text-slate-200">
                        Reasoning Depth Score: {evaluationResult.reasoningScore}/100
                      </p>
                    </div>
                  </div>

                  {/* Animated Mastery Delta Pill */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                      className={`animate-mastery-delta px-3 py-1.5 rounded-xl text-xs font-mono tabular-nums font-bold border shadow-sm ${
                        evaluationResult.masteryDelta > 0
                          ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-200 border-rose-500/40'
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
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
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
                        {
                          label: 'Conceptual Accuracy',
                          val: evaluationResult.rubricScores.conceptualAccuracy,
                        },
                        { label: 'Causal Logic', val: evaluationResult.rubricScores.causalLogic },
                        {
                          label: 'Formula & Math',
                          val: evaluationResult.rubricScores.formulaApplication,
                        },
                      ].map((item) => (
                        <div key={item.label} className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-300">{item.label}</span>
                            <span className="font-mono tabular-nums font-bold text-slate-100">
                              {item.val}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                            <div
                              className={`h-full ${
                                item.val >= 75
                                  ? 'bg-emerald-500'
                                  : item.val >= 50
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${item.val}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Misconception Alert + Linked Library Fix */}
                {evaluationResult.detectedMisconception && (
                  <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-amber-200 font-bold">
                        <AlertCircle className="w-4 h-4 text-amber-300" />
                        <span>
                          Misconception Detected: {evaluationResult.detectedMisconception.title}
                        </span>
                      </div>
                      {matchedLibraryEntry && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-[10px] font-bold">
                          Matched Library #{matchedLibraryEntry.id.toUpperCase()}
                        </span>
                      )}
                    </div>

                    <p className="text-amber-100 text-xs leading-relaxed">
                      {matchedLibraryEntry?.explanation ||
                        evaluationResult.detectedMisconception.description}
                    </p>

                    <div className="p-3 rounded-lg bg-amber-900/30 border border-amber-500/25 text-amber-100 text-[11px] space-y-1.5">
                      <div>
                        <strong>Corrective Practice Fix: </strong>
                        {matchedLibraryEntry?.correctivePractice ||
                          evaluationResult.detectedMisconception.howToCorrect}
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          onClick={() => handleFetchAdaptiveQuestion('easy')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold cursor-pointer"
                        >
                          <Target className="w-3 h-3" />
                          <span>Run Corrective Drill</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('misconceptions')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-[11px] font-semibold cursor-pointer"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>Open Misconception Library</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Thinking Analysis Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-emerald-300 block mb-1">
                      Correct Concepts Applied
                    </span>
                    <ul className="space-y-1 text-slate-200">
                      {evaluationResult.correctConceptsUsed.map((c, i) => (
                        <li key={i}>✓ {c}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-rose-300 block mb-1">
                      Flawed Assumptions
                    </span>
                    <ul className="space-y-1 text-slate-200">
                      {evaluationResult.flawedAssumptions.length > 0 ? (
                        evaluationResult.flawedAssumptions.map((fa, i) => (
                          <li key={i}>• {fa}</li>
                        ))
                      ) : (
                        <li className="text-slate-300">None detected. Sound reasoning!</li>
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
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-medium text-slate-200 hover:text-white border border-slate-700 transition-all cursor-pointer"
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
                    <div className="pt-2 text-[11px] text-slate-300 border-t border-slate-900">
                      <strong className="text-white">Key Exam Takeaway: </strong>
                      {currentQuestion.keyTakeaway}
                    </div>
                  )}
                </div>

                {/* Next Question CTA */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-slate-300">
                    Next calibrated difficulty:{' '}
                    <strong className="text-indigo-300 capitalize">
                      {calibration.difficulty}
                    </strong>
                  </div>

                  <button
                    onClick={() => handleFetchAdaptiveQuestion(calibration.difficulty)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    <span>Continue Adaptive Practice ({calibration.difficulty})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <MasteryBadgeModal
        isOpen={isBadgeModalOpen}
        conceptId={selectedConceptId}
        conceptName={currentConceptName}
        onClose={() => setIsBadgeModalOpen(false)}
      />
    </div>
  );
};

