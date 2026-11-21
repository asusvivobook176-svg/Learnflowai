export type Role = 'student' | 'teacher';

export type StudentTab =
  | 'dashboard'
  | 'intelligence-center'
  | 'learning-journey'
  | 'confidence-analysis'
  | 'diagnostic'
  | 'concept-map'
  | 'practice'
  | 'revision'
  | 'misconceptions'
  | 'learn'
  | 'progress'
  | 'teach-back'
  | 'socratic'
  | 'concept-rescue';

export type TeacherTab =
  | 'teacher-overview'
  | 'teacher-analytics'
  | 'teacher-students'
  | 'teacher-heatmap'
  | 'teacher-misconceptions'
  | 'teacher-alerts'
  | 'teacher-labs'
  | 'teacher-reports';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  title: string;
  department?: string;
  classSection?: string;
}

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface Concept {
  id: string;
  name: string;
  shortDescription: string;
  category: 'Fundamentals' | 'Laws' | 'Circuits' | 'Energy';
  prerequisites: string[];
  keyFormula?: string;
  commonMisconceptions: string[];
  recommendedActivities: string[];
}

export interface ConceptMastery {
  conceptId: string;
  masteryPercentage: number; // 0 to 100
  questionsAttempted: number;
  questionsCorrect: number;
  lastStudiedDate: string; // ISO date string
  confidenceAverage: ConfidenceLevel;
  status: 'weak' | 'developing' | 'mastered';
  trend: 'improving' | 'stable' | 'declining';
  history: {
    date: string;
    scoreDelta: number;
    reason: string;
    newScore: number;
  }[];
}

export interface Misconception {
  id: string;
  conceptId: string;
  conceptName: string;
  title: string;
  studentExplanationSnippet: string;
  aiCorrection: string;
  severity: 'high' | 'medium' | 'low';
  status: 'active' | 'in_progress' | 'resolved';
  detectedAt: string;
  timesEncountered: number;
}

export interface RevisionTask {
  id: string;
  conceptId: string;
  conceptName: string;
  title: string;
  taskType: 'concept_review' | 'practice_drill' | 'misconception_clear' | 'challenge';
  dueDate: string; // 'Today', 'Tomorrow', 'In 3 days', etc.
  estimatedMinutes: number;
  difficulty: DifficultyLevel;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  misconceptionId?: string; // If selecting this option reveals a specific misconception
}

export interface Question {
  id: string;
  conceptId: string;
  conceptName: string;
  difficulty: DifficultyLevel;
  questionText: string;
  contextOrDiagram?: string;
  diagramSvgType?: 'series_resistors' | 'parallel_resistors' | 'ohms_circuit' | 'power_bulb';
  options: QuestionOption[];
  correctOptionId: string;
  explanation: string;
  trapExplanations?: Record<string, string>;
  keyTakeaway: string;
}

export interface StudentAnswerRecord {
  id: string;
  timestamp: string;
  questionId: string;
  conceptId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  confidence: ConfidenceLevel;
  spokenReasoning?: string;
  cleanedReasoning?: string;
  detectedMisconceptions?: string[];
  masteryDelta: number;
  aiFeedback?: string;
}

export interface LearningMemoryEvent {
  id: string;
  timestamp: string; // e.g. "October 30, 2026 - 4:15 PM"
  dateKey: string; // e.g. "2026-10-30" or "October 30"
  eventType:
    | 'diagnostic'
    | 'voice_query'
    | 'practice'
    | 'reasoning_analysis'
    | 'misconception_detected'
    | 'misconception_resolved'
    | 'revision'
    | 'milestone'
    | 'teach_back'
    | 'socratic'
    | 'concept_rescue';
  concept: string;
  conceptId: string;
  title: string;
  description: string;
  studentAction?: string;
  aiInsight?: string;
  masteryBefore?: number;
  masteryAfter?: number;
  misconceptionTitle?: string;
  metadata?: Record<string, any>;
}

export interface Recommendation {
  id: string;
  concept: string;
  conceptId: string;
  type:
    | 'low_mastery'
    | 'misconception_fix'
    | 'spaced_revision'
    | 'challenge'
    | 'confidence_recalibration';
  priority: 'high' | 'medium' | 'low';
  reasons: string[];
  supportingData: {
    currentMastery: number;
    recentIncorrectAnswers: number;
    activeMisconceptionsCount: number;
    daysSinceReview: number;
    confidenceAvg?: string;
    targetReason?: string;
  };
  suggestedAction: string;
  estimatedMinutes: number;
}

export interface ConfidenceRecord {
  id: string;
  timestamp: string;
  conceptId: string;
  conceptName: string;
  difficulty: DifficultyLevel;
  confidenceLevel: ConfidenceLevel;
  answerCorrect: boolean;
  reasoningQuality: 'strong' | 'partial' | 'weak';
  reasoningScore: number;
}

export interface ConfidenceGapItem {
  conceptId: string;
  conceptName: string;
  gapType: 'overconfident' | 'underconfident' | 'calibrated';
  gapDescription: string;
  mastery: number;
  confidenceReported: ConfidenceLevel;
}

export interface ConfidenceAnalysis {
  calibrationScore: number; // 0 to 100
  pattern: 'overconfident' | 'underconfident' | 'well_calibrated' | 'mixed';
  headline: string;
  overconfidenceInsights: string[];
  underconfidenceInsights: string[];
  wellCalibratedInsights: string[];
  conceptGaps: ConfidenceGapItem[];
}

export type DailyGoalType = 'minutes' | 'questions';

export interface DailyGoalState {
  goalType: DailyGoalType;
  targetMinutes: number;
  targetQuestions: number;
  minutesPracticedToday: number;
  questionsAnsweredToday: number;
  lastGoalDate: string; // YYYY-MM-DD
}

export interface TeachBackRecord {
  id: string;
  timestamp: string;
  conceptId: string;
  concept: string;
  transcript: string;
  qualityScore: number; // 0 to 100
  conceptsExplainedCorrectly: string[];
  missingIdeas: string[];
  misconceptions: string[];
  masteryDelta: number;
  feedbackSummary: string;
}

export interface SocraticTurn {
  role: 'student' | 'tutor';
  text: string;
  timestamp: string;
}

export interface SocraticSession {
  id: string;
  timestamp: string;
  conceptId: string;
  concept: string;
  masteryAtStart: number;
  turnsCount: number;
  messages: SocraticTurn[];
  completed: boolean;
  summary?: string;
  practiceQuestion?: Question;
  practiceAnsweredCorrectly?: boolean;
  masteryDelta: number;
}

export type RescueModeType =
  | 'visual'
  | 'analogy'
  | 'step_by_step'
  | 'voice'
  | 'mini_challenge';

export interface RescueEvent {
  id: string;
  timestamp: string;
  conceptId: string;
  concept: string;
  triggerReason: 'three_wrong_in_a_row' | 'low_mastery_below_40' | 'manual_launch';
  chosenMode: RescueModeType;
  masteryAtTrigger: number;
  nextAnswerImproved: boolean | null;
  masteryDelta: number;
  notes?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  avatar: string;
  grade: string;
  subject: string;
  overallMastery: number;
  streakDays: number;
  totalQuestionsAnswered: number;
  totalVoiceNotesCount: number;
  dailyGoal: DailyGoalState;
  masteryByConcept: Record<string, ConceptMastery>;
  consecutiveWrongByConcept?: Record<string, number>;
  misconceptions: Misconception[];
  revisionSchedule: RevisionTask[];
  recentActivity: {
    id: string;
    title: string;
    timestamp: string;
    type: 'diagnostic' | 'voice_query' | 'practice' | 'revision' | 'teach_back' | 'socratic' | 'concept_rescue';
    conceptName: string;
    details: string;
  }[];
  learningJourney: LearningMemoryEvent[];
  confidenceRecords: ConfidenceRecord[];
  teachBackRecords?: TeachBackRecord[];
  socraticSessions?: SocraticSession[];
  rescueEvents?: RescueEvent[];
}

export interface AgentLog {
  id: string;
  timestamp: string;
  agentName:
    | 'Voice Intelligence Agent'
    | 'Learner Model Agent'
    | 'Misconception Detection Agent'
    | 'Adaptive Learning Agent'
    | 'Revision Agent';
  action: string;
  details: string;
  badgeType: 'info' | 'success' | 'warning' | 'purple';
}

export interface VoiceProcessResult {
  cleanedTranscript: string;
  rawSpeech: string;
  subject: string;
  topic: string;
  concept: string;
  conceptId: string;
  studentIntent: 'clarify_doubt' | 'explain_concept' | 'request_practice' | 'diagnose_error' | 'express_confusion';
  confidenceLevel: ConfidenceLevel;
  detectedMisconception: string | null;
  recommendedNextAction: string;
  agentReasoning: string;
  educationalResponse: string;
  suggestedPracticeQuestion?: Question;
}

export interface ReasoningAnalysisResult {
  isCorrect: boolean;
  reasoningScore: number; // 0 - 100
  errorType: 'none' | 'conceptual_misconception' | 'calculation_mistake' | 'incomplete_explanation';
  rubricScores: {
    conceptualAccuracy: number;
    causalLogic: number;
    formulaApplication: number;
  };
  correctConceptsUsed: string[];
  flawedAssumptions: string[];
  missingKnowledge: string[];
  detectedMisconception: {
    id?: string;
    title: string;
    description: string;
    howToCorrect: string;
    severity: 'high' | 'medium' | 'low';
  } | null;
  supportiveFeedback: string;
  masteryDelta: number;
  recommendedConcept: string;
  recommendedDifficulty: DifficultyLevel;
}

