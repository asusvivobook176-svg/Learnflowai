import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Role,
  StudentProfile,
  AgentLog,
  ConceptMastery,
  Misconception,
  RevisionTask,
  ConfidenceLevel,
  DifficultyLevel,
  DailyGoalType,
  DailyGoalState,
  TeachBackRecord,
  SocraticSession,
  RescueEvent,
  RescueModeType,
} from '../types/learning';
import {
  DEMO_STUDENT_ALEX,
  INITIAL_AGENT_LOGS,
  CONCEPTS,
} from '../data/syllabus';
import { useAuth } from './AuthContext';

interface LearnerContextType {
  role: Role;
  setRole: (role: Role) => void;
  profile: StudentProfile;
  agentLogs: AgentLog[];
  addAgentLog: (
    agentName: AgentLog['agentName'],
    action: string,
    details: string,
    badgeType?: AgentLog['badgeType']
  ) => void;
  updateConceptMastery: (
    conceptId: string,
    delta: number,
    reason: string,
    isCorrect: boolean,
    confidence: ConfidenceLevel,
    extra?: {
      reasoningText?: string;
      reasoningScore?: number;
      difficulty?: DifficultyLevel;
      questionTitle?: string;
      minutesSpent?: number;
    }
  ) => void;
  addMisconception: (
    conceptId: string,
    conceptName: string,
    title: string,
    explanationSnippet: string,
    aiCorrection: string,
    severity: 'high' | 'medium' | 'low'
  ) => void;
  resolveMisconception: (id: string) => void;
  completeRevisionTask: (taskId: string) => void;
  updateDailyGoal: (updates: Partial<Pick<DailyGoalState, 'goalType' | 'targetMinutes' | 'targetQuestions'>>) => void;
  logStudyMinutes: (minutes: number) => void;
  resetToDemoAlex: () => void;
  recordVoiceActivity: (conceptName: string, querySnippet: string) => void;
  saveDiagnosticResults: (results: {
    conceptId: string;
    isCorrect: boolean;
    confidence: ConfidenceLevel;
    hasVoiceReasoning: boolean;
  }[]) => void;
  addLearningEvent: (
    event: Omit<import('../types/learning').LearningMemoryEvent, 'id' | 'timestamp' | 'dateKey'>
  ) => void;
  recordConfidenceRecord: (
    record: Omit<import('../types/learning').ConfidenceRecord, 'id' | 'timestamp'>
  ) => void;
  recordTeachBackSession: (
    record: Omit<TeachBackRecord, 'id' | 'timestamp'>
  ) => TeachBackRecord;
  recordSocraticSession: (
    session: Omit<SocraticSession, 'id' | 'timestamp'>
  ) => SocraticSession;
  recordRescueAttempt: (
    event: Omit<RescueEvent, 'id' | 'timestamp'>
  ) => RescueEvent;
  resolveRescueOutcome: (
    rescueId: string,
    improved: boolean,
    masteryDelta: number,
    notes?: string
  ) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const LearnerContext = createContext<LearnerContextType | undefined>(undefined);

const STORAGE_KEY = 'learnflow_student_profile_v1';
const LOGS_STORAGE_KEY = 'learnflow_agent_logs_v1';

export const LearnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const [role, setRoleState] = useState<Role>(auth.role || 'student');
  const [activeTab, setActiveTabState] = useState<string>(
    auth.role === 'teacher' ? 'teacher-overview' : 'dashboard'
  );

  // Sync role and route with AuthContext
  useEffect(() => {
    if (auth.role) {
      setRoleState(auth.role);
      if (auth.role === 'teacher') {
        if (!auth.canAccessRoute(activeTab, 'teacher')) {
          setActiveTabState('teacher-overview');
        }
      } else {
        if (!auth.canAccessRoute(activeTab, 'student')) {
          setActiveTabState('dashboard');
        }
      }
    }
  }, [auth.role]);

  const setActiveTab = (tab: string) => {
    // Route guard check
    if (auth.role === 'student' && (tab.startsWith('teacher-') || tab === 'teacher')) {
      setActiveTabState('dashboard');
      return;
    }
    if (auth.role === 'teacher' && !auth.canAccessRoute(tab, 'teacher')) {
      setActiveTabState('teacher-overview');
      return;
    }
    setActiveTabState(tab);
  };

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    if (newRole !== auth.role) {
      auth.login(newRole);
    }
  };

  const [profile, setProfile] = useState<StudentProfile>(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    try {
      const savedStr = localStorage.getItem(STORAGE_KEY);
      if (savedStr) {
        const saved = JSON.parse(savedStr);
        const savedGoal: DailyGoalState = saved.dailyGoal || DEMO_STUDENT_ALEX.dailyGoal;
        const isSameDay = savedGoal.lastGoalDate === todayStr;
        const hydratedGoal: DailyGoalState = isSameDay
          ? savedGoal
          : {
              ...savedGoal,
              minutesPracticedToday: 0,
              questionsAnsweredToday: 0,
              lastGoalDate: todayStr,
            };

        return {
          ...DEMO_STUDENT_ALEX,
          ...saved,
          dailyGoal: hydratedGoal,
          consecutiveWrongByConcept:
            saved.consecutiveWrongByConcept || DEMO_STUDENT_ALEX.consecutiveWrongByConcept || {},
          teachBackRecords: Array.isArray(saved.teachBackRecords) ? saved.teachBackRecords : [],
          socraticSessions: Array.isArray(saved.socraticSessions) ? saved.socraticSessions : [],
          rescueEvents: Array.isArray(saved.rescueEvents) ? saved.rescueEvents : [],
          learningJourney:
            saved.learningJourney && saved.learningJourney.length > 0
              ? saved.learningJourney
              : DEMO_STUDENT_ALEX.learningJourney,
          confidenceRecords:
            saved.confidenceRecords && saved.confidenceRecords.length > 0
              ? saved.confidenceRecords
              : DEMO_STUDENT_ALEX.confidenceRecords,
        };
      }
    } catch (e) {
      console.error('Failed to load profile from storage:', e);
    }
    return DEMO_STUDENT_ALEX;
  });

  const [agentLogs, setAgentLogs] = useState<AgentLog[]>(() => {
    try {
      const saved = localStorage.getItem(LOGS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load logs:', e);
    }
    return INITIAL_AGENT_LOGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile:', e);
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(agentLogs));
    } catch (e) {
      console.error('Failed to save agent logs:', e);
    }
  }, [agentLogs]);

  const addAgentLog = (
    agentName: AgentLog['agentName'],
    action: string,
    details: string,
    badgeType: AgentLog['badgeType'] = 'info'
  ) => {
    const newLog: AgentLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: 'Just now',
      agentName,
      action,
      details,
      badgeType,
    };
    setAgentLogs((prev) => [newLog, ...prev.slice(0, 19)]);
  };

  const addLearningEvent = (
    event: Omit<import('../types/learning').LearningMemoryEvent, 'id' | 'timestamp' | 'dateKey'>
  ) => {
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const timeFormatted = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const newEvent: import('../types/learning').LearningMemoryEvent = {
      id: `lj-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: `${dateFormatted} - ${timeFormatted}`,
      dateKey: dateFormatted,
      ...event,
    };

    setProfile((prev) => ({
      ...prev,
      learningJourney: [newEvent, ...prev.learningJourney],
    }));
  };

  const recordConfidenceRecord = (
    record: Omit<import('../types/learning').ConfidenceRecord, 'id' | 'timestamp'>
  ) => {
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const timeFormatted = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const newRec: import('../types/learning').ConfidenceRecord = {
      id: `cr-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: `${dateFormatted} - ${timeFormatted}`,
      ...record,
    };

    setProfile((prev) => ({
      ...prev,
      confidenceRecords: [newRec, ...prev.confidenceRecords.slice(0, 49)],
    }));
  };

  const updateConceptMastery = (
    conceptId: string,
    delta: number,
    reason: string,
    isCorrect: boolean,
    confidence: ConfidenceLevel,
    extra?: {
      reasoningText?: string;
      reasoningScore?: number;
      difficulty?: DifficultyLevel;
      questionTitle?: string;
      minutesSpent?: number;
    }
  ) => {
    const conceptMeta = CONCEPTS.find((c) => c.id === conceptId);
    const conceptName = conceptMeta?.name || conceptId;

    setProfile((prev) => {
      const current = prev.masteryByConcept[conceptId] || {
        conceptId,
        masteryPercentage: 50,
        questionsAttempted: 0,
        questionsCorrect: 0,
        lastStudiedDate: new Date().toISOString().split('T')[0],
        confidenceAverage: confidence,
        status: 'developing',
        trend: 'stable',
        history: [],
      };

      const oldScore = current.masteryPercentage;
      const newScore = Math.max(10, Math.min(100, current.masteryPercentage + delta));
      const newStatus = newScore >= 75 ? 'mastered' : newScore >= 50 ? 'developing' : 'weak';
      const newTrend = delta > 0 ? 'improving' : delta < 0 ? 'declining' : 'stable';

      const updatedConcept: ConceptMastery = {
        ...current,
        masteryPercentage: newScore,
        questionsAttempted: current.questionsAttempted + 1,
        questionsCorrect: current.questionsCorrect + (isCorrect ? 1 : 0),
        lastStudiedDate: new Date().toISOString().split('T')[0],
        status: newStatus,
        trend: newTrend,
        confidenceAverage: confidence,
        history: [
          {
            date: new Date().toISOString().split('T')[0],
            scoreDelta: delta,
            reason,
            newScore,
          },
          ...current.history,
        ],
      };

      const updatedMasteryByConcept = {
        ...prev.masteryByConcept,
        [conceptId]: updatedConcept,
      };

      // Recalculate overall mastery average
      const scores = Object.values(updatedMasteryByConcept).map((c) => c.masteryPercentage);
      const overallMastery = Math.round(scores.reduce((a, b) => a + b, 0) / (scores.length || 1));

      // Append timeline event
      const now = new Date();
      const dateFormatted = now.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      const timeFormatted = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      const timelineEvent: import('../types/learning').LearningMemoryEvent = {
        id: `lj-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        timestamp: `${dateFormatted} - ${timeFormatted}`,
        dateKey: dateFormatted,
        eventType: extra?.reasoningText ? 'reasoning_analysis' : 'practice',
        concept: conceptName,
        conceptId,
        title: extra?.reasoningText
          ? `Voice Reasoning Evaluated: ${conceptName}`
          : `Adaptive Practice Question Answered`,
        description: isCorrect
          ? `Answered correctly with ${confidence} confidence. Mastery improved from ${oldScore}% to ${newScore}%.`
          : `Answered incorrectly (${reason}). Mastery shifted from ${oldScore}% to ${newScore}%.`,
        studentAction: extra?.reasoningText
          ? `Spoke: "${extra.reasoningText.slice(0, 80)}..."`
          : `Selected answer with ${confidence} self-reported confidence`,
        aiInsight: isCorrect
          ? `Concept grasp reinforced. Next spaced review scheduled.`
          : `Identified knowledge friction point. Queued targeted debunking drill.`,
        masteryBefore: oldScore,
        masteryAfter: newScore,
      };

      // Record confidence record
      const confRecord: import('../types/learning').ConfidenceRecord = {
        id: `cr-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        timestamp: `${dateFormatted} - ${timeFormatted}`,
        conceptId,
        conceptName,
        difficulty: extra?.difficulty || 'medium',
        confidenceLevel: confidence,
        answerCorrect: isCorrect,
        reasoningQuality:
          (extra?.reasoningScore || 0) >= 75
            ? 'strong'
            : (extra?.reasoningScore || 0) >= 50
            ? 'partial'
            : 'weak',
        reasoningScore: extra?.reasoningScore || (isCorrect ? 80 : 35),
      };

      // Dynamically adjust spaced-repetition schedule for this concept
      const nextDueDate =
        !isCorrect || newScore < 50
          ? 'Today'
          : newScore < 75
          ? 'In 3 days'
          : 'In 7 days';
      const nextPriority: 'high' | 'medium' | 'low' =
        !isCorrect || newScore < 50 ? 'high' : newScore < 75 ? 'medium' : 'low';
      const nextDifficulty: DifficultyLevel =
        newScore < 50 ? 'easy' : newScore < 75 ? 'medium' : 'hard';
      const nextTaskType: RevisionTask['taskType'] =
        !isCorrect || newScore < 50
          ? 'practice_drill'
          : newScore >= 75
          ? 'challenge'
          : 'concept_review';
      const nextReason = !isCorrect
        ? `Incorrect response recorded (${newScore}% mastery). Scheduled immediate spaced retrieval.`
        : newScore >= 75
        ? `Mastery reached ${newScore}%. Spaced interval extended to ${nextDueDate}.`
        : `Developing mastery (${newScore}%). Next review scheduled for ${nextDueDate}.`;

      const existingIdx = prev.revisionSchedule.findIndex((t) => t.conceptId === conceptId);
      let updatedSchedule = [...prev.revisionSchedule];
      if (existingIdx >= 0) {
        updatedSchedule = updatedSchedule.map((t, idx) =>
          idx === existingIdx
            ? {
                ...t,
                dueDate: nextDueDate,
                priority: nextPriority,
                difficulty: nextDifficulty,
                taskType: nextTaskType,
                completed: false,
                reason: nextReason,
              }
            : t
        );
      } else {
        updatedSchedule = [
          {
            id: `rev-${conceptId}-${Date.now()}`,
            conceptId,
            conceptName,
            title: `${conceptName} Adaptive Spaced Review`,
            taskType: nextTaskType,
            dueDate: nextDueDate,
            estimatedMinutes: 5,
            difficulty: nextDifficulty,
            completed: false,
            priority: nextPriority,
            reason: nextReason,
          },
          ...updatedSchedule,
        ];
      }

      const todayStr = new Date().toISOString().split('T')[0];
      const baseGoal = prev.dailyGoal || DEMO_STUDENT_ALEX.dailyGoal;
      const isSameGoalDay = baseGoal.lastGoalDate === todayStr;
      const addedMinutes = Math.max(1, extra?.minutesSpent ?? 2);

      // Track consecutive wrong answers per concept for Concept Rescue trigger
      const prevStreakWrong = prev.consecutiveWrongByConcept?.[conceptId] || 0;
      const nextConsecutiveWrong = isCorrect ? 0 : prevStreakWrong + 1;
      const updatedConsecutiveWrong = {
        ...(prev.consecutiveWrongByConcept || {}),
        [conceptId]: nextConsecutiveWrong,
      };

      // If there is a pending RescueEvent for this concept awaiting nextAnswerImproved, resolve it automatically
      let rescueMarked = false;
      const updatedRescueEvents = (prev.rescueEvents || []).map((re) => {
        if (!rescueMarked && re.conceptId === conceptId && re.nextAnswerImproved === null) {
          rescueMarked = true;
          return {
            ...re,
            nextAnswerImproved: isCorrect,
            masteryDelta: re.masteryDelta + delta,
            notes: isCorrect
              ? 'Next practice answer succeeded after rescue mode.'
              : 'Next practice answer still missed; additional rescue modality recommended.',
          };
        }
        return re;
      });

      return {
        ...prev,
        overallMastery,
        totalQuestionsAnswered: prev.totalQuestionsAnswered + 1,
        dailyGoal: {
          ...baseGoal,
          minutesPracticedToday: (isSameGoalDay ? baseGoal.minutesPracticedToday : 0) + addedMinutes,
          questionsAnsweredToday: (isSameGoalDay ? baseGoal.questionsAnsweredToday : 0) + 1,
          lastGoalDate: todayStr,
        },
        consecutiveWrongByConcept: updatedConsecutiveWrong,
        rescueEvents: updatedRescueEvents,
        masteryByConcept: updatedMasteryByConcept,
        revisionSchedule: updatedSchedule,
        learningJourney: [timelineEvent, ...prev.learningJourney],
        confidenceRecords: [confRecord, ...prev.confidenceRecords.slice(0, 49)],
      };
    });

    addAgentLog(
      'Learner Model Agent',
      'Mastery Recalibrated',
      `Updated ${conceptName}: delta ${delta > 0 ? '+' : ''}${delta}% (${reason}).`,
      delta > 0 ? 'success' : 'warning'
    );
  };

  const addMisconception = (
    conceptId: string,
    conceptName: string,
    title: string,
    explanationSnippet: string,
    aiCorrection: string,
    severity: 'high' | 'medium' | 'low'
  ) => {
    setProfile((prev) => {
      const existing = prev.misconceptions.find((m) => m.title.toLowerCase() === title.toLowerCase());
      const now = new Date();
      const dateFormatted = now.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      const timeFormatted = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      const timelineEvent: import('../types/learning').LearningMemoryEvent = {
        id: `lj-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        timestamp: `${dateFormatted} - ${timeFormatted}`,
        dateKey: dateFormatted,
        eventType: 'misconception_detected',
        concept: conceptName,
        conceptId,
        title: `Misconception Detected: ${title}`,
        description: `Identified flawed mental model: "${explanationSnippet.slice(0, 90)}..."`,
        studentAction: `Spoke in Explain My Thinking Mode`,
        aiInsight: `Misconception Detection Agent flagged ${severity}-priority misconception. Remediation: ${aiCorrection.slice(0, 90)}...`,
        misconceptionTitle: title,
      };

      if (existing) {
        return {
          ...prev,
          misconceptions: prev.misconceptions.map((m) =>
            m.id === existing.id
              ? {
                  ...m,
                  timesEncountered: m.timesEncountered + 1,
                  status: 'active' as const,
                  detectedAt: 'Just now',
                }
              : m
          ),
          learningJourney: [timelineEvent, ...prev.learningJourney],
        };
      }

      const newMisconception: Misconception = {
        id: `misc-${Date.now()}`,
        conceptId,
        conceptName,
        title,
        studentExplanationSnippet: explanationSnippet,
        aiCorrection,
        severity,
        status: 'active',
        detectedAt: 'Just now',
        timesEncountered: 1,
      };

      return {
        ...prev,
        misconceptions: [newMisconception, ...prev.misconceptions],
        learningJourney: [timelineEvent, ...prev.learningJourney],
      };
    });

    addAgentLog(
      'Misconception Detection Agent',
      'New Misconception Indexed',
      `Identified "${title}" in ${conceptName}. Created targeted debunking priority.`,
      'warning'
    );
  };

  const resolveMisconception = (id: string) => {
    setProfile((prev) => {
      const target = prev.misconceptions.find((m) => m.id === id);
      const now = new Date();
      const dateFormatted = now.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      const timeFormatted = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      const timelineEvent: import('../types/learning').LearningMemoryEvent = {
        id: `lj-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        timestamp: `${dateFormatted} - ${timeFormatted}`,
        dateKey: dateFormatted,
        eventType: 'misconception_resolved',
        concept: target?.conceptName || 'Electricity',
        conceptId: target?.conceptId || 'series-circuits',
        title: `Misconception Resolved: ${target?.title || 'Resolved Trap'}`,
        description: `Student demonstrated verified understanding in targeted debunking drill.`,
        studentAction: `Demonstrated sound reasoning and cleared false premise`,
        aiInsight: `Misconception marked as resolved. Learner model stability index increased.`,
        misconceptionTitle: target?.title,
      };

      return {
        ...prev,
        misconceptions: prev.misconceptions.map((m) =>
          m.id === id ? { ...m, status: 'resolved' as const } : m
        ),
        learningJourney: [timelineEvent, ...prev.learningJourney],
      };
    });

    addAgentLog(
      'Misconception Detection Agent',
      'Misconception Cleared',
      `Student demonstrated correct conceptual understanding. Marked misconception as resolved.`,
      'success'
    );
  };

  const completeRevisionTask = (taskId: string) => {
    setProfile((prev) => {
      const task = prev.revisionSchedule.find((t) => t.id === taskId);
      const now = new Date();
      const dateFormatted = now.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      const timeFormatted = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      const timelineEvent: import('../types/learning').LearningMemoryEvent = {
        id: `lj-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        timestamp: `${dateFormatted} - ${timeFormatted}`,
        dateKey: dateFormatted,
        eventType: 'revision',
        concept: task?.conceptName || 'Physics',
        conceptId: task?.conceptId || 'series-circuits',
        title: `Spaced Revision Completed: ${task?.title || 'Daily Review'}`,
        description: `Completed scheduled spaced-repetition session. Ebbinghaus retention refreshed.`,
        studentAction: `Reviewed concept materials and completed checkpoint drill`,
        aiInsight: `Revision Agent calculated extended retention window to +7 days.`,
      };

      const todayStr = new Date().toISOString().split('T')[0];
      const baseGoal = prev.dailyGoal || DEMO_STUDENT_ALEX.dailyGoal;
      const isSameGoalDay = baseGoal.lastGoalDate === todayStr;
      const addedMinutes = task?.estimatedMinutes || 5;

      return {
        ...prev,
        dailyGoal: {
          ...baseGoal,
          minutesPracticedToday: (isSameGoalDay ? baseGoal.minutesPracticedToday : 0) + addedMinutes,
          questionsAnsweredToday: isSameGoalDay ? baseGoal.questionsAnsweredToday : 0,
          lastGoalDate: todayStr,
        },
        revisionSchedule: prev.revisionSchedule.map((t) =>
          t.id === taskId ? { ...t, completed: true } : t
        ),
        learningJourney: [timelineEvent, ...prev.learningJourney],
      };
    });

    addAgentLog(
      'Revision Agent',
      'Spaced Task Completed',
      `Revision task completed. Re-scheduled next spaced retrieval window.`,
      'purple'
    );
  };

  const updateDailyGoal = (
    updates: Partial<Pick<DailyGoalState, 'goalType' | 'targetMinutes' | 'targetQuestions'>>
  ) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setProfile((prev) => {
      const current = prev.dailyGoal || DEMO_STUDENT_ALEX.dailyGoal;
      const isSameGoalDay = current.lastGoalDate === todayStr;
      const nextGoalType: DailyGoalType = updates.goalType ?? current.goalType;
      const nextTargetMinutes =
        updates.targetMinutes !== undefined
          ? Math.max(5, Math.min(240, Math.round(updates.targetMinutes)))
          : current.targetMinutes;
      const nextTargetQuestions =
        updates.targetQuestions !== undefined
          ? Math.max(1, Math.min(50, Math.round(updates.targetQuestions)))
          : current.targetQuestions;

      return {
        ...prev,
        dailyGoal: {
          goalType: nextGoalType,
          targetMinutes: nextTargetMinutes,
          targetQuestions: nextTargetQuestions,
          minutesPracticedToday: isSameGoalDay ? current.minutesPracticedToday : 0,
          questionsAnsweredToday: isSameGoalDay ? current.questionsAnsweredToday : 0,
          lastGoalDate: todayStr,
        },
      };
    });

    addAgentLog(
      'Learner Model Agent',
      'Daily Goal Calibrated',
      `Updated daily study target (${
        updates.goalType === 'minutes'
          ? `${updates.targetMinutes ?? 'current'} minutes`
          : updates.goalType === 'questions'
          ? `${updates.targetQuestions ?? 'current'} questions`
          : 'custom target'
      }).`,
      'info'
    );
  };

  const logStudyMinutes = (minutes: number) => {
    const cleanMinutes = Math.max(1, Math.min(120, Math.round(minutes)));
    const todayStr = new Date().toISOString().split('T')[0];
    setProfile((prev) => {
      const current = prev.dailyGoal || DEMO_STUDENT_ALEX.dailyGoal;
      const isSameGoalDay = current.lastGoalDate === todayStr;
      return {
        ...prev,
        dailyGoal: {
          ...current,
          minutesPracticedToday: (isSameGoalDay ? current.minutesPracticedToday : 0) + cleanMinutes,
          questionsAnsweredToday: isSameGoalDay ? current.questionsAnsweredToday : 0,
          lastGoalDate: todayStr,
        },
      };
    });
  };

  const recordVoiceActivity = (conceptName: string, querySnippet: string) => {
    setProfile((prev) => {
      const conceptMeta = CONCEPTS.find(
        (c) => c.name.toLowerCase() === conceptName.toLowerCase() || c.id === conceptName
      );
      const now = new Date();
      const dateFormatted = now.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      const timeFormatted = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      const timelineEvent: import('../types/learning').LearningMemoryEvent = {
        id: `lj-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        timestamp: `${dateFormatted} - ${timeFormatted}`,
        dateKey: dateFormatted,
        eventType: 'voice_query',
        concept: conceptName,
        conceptId: conceptMeta?.id || 'series-circuits',
        title: `Wispr Flow Voice Query: ${conceptName}`,
        description: `Spoke naturally with hesitations: "${querySnippet.slice(0, 85)}..."`,
        studentAction: `Spoke unscripted conversational doubt to AI Tutor`,
        aiInsight: `Voice Intelligence Agent filtered acoustic hesitation markers and mapped inquiry to syllabus knowledge graph.`,
      };

      const todayStr = new Date().toISOString().split('T')[0];
      const baseGoal = prev.dailyGoal || DEMO_STUDENT_ALEX.dailyGoal;
      const isSameGoalDay = baseGoal.lastGoalDate === todayStr;

      return {
        ...prev,
        totalVoiceNotesCount: prev.totalVoiceNotesCount + 1,
        dailyGoal: {
          ...baseGoal,
          minutesPracticedToday: (isSameGoalDay ? baseGoal.minutesPracticedToday : 0) + 1,
          questionsAnsweredToday: isSameGoalDay ? baseGoal.questionsAnsweredToday : 0,
          lastGoalDate: todayStr,
        },
        recentActivity: [
          {
            id: `act-${Date.now()}`,
            title: 'Wispr Flow Voice Query',
            timestamp: 'Just now',
            type: 'voice_query',
            conceptName,
            details: `Spoke: "${querySnippet.slice(0, 70)}..."`,
          },
          ...prev.recentActivity.slice(0, 9),
        ],
        learningJourney: [timelineEvent, ...prev.learningJourney],
      };
    });
  };

  const resetToDemoAlex = () => {
    setProfile(DEMO_STUDENT_ALEX);
    setAgentLogs(INITIAL_AGENT_LOGS);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LOGS_STORAGE_KEY);
  };

  const saveDiagnosticResults = (
    results: {
      conceptId: string;
      isCorrect: boolean;
      confidence: ConfidenceLevel;
      hasVoiceReasoning: boolean;
    }[]
  ) => {
    setProfile((prev) => {
      const updatedMasteryByConcept = { ...prev.masteryByConcept };
      const newConfRecords: import('../types/learning').ConfidenceRecord[] = [];

      const now = new Date();
      const dateFormatted = now.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      const timeFormatted = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      results.forEach((r) => {
        let baseScore = r.isCorrect ? 70 : 35;
        if (r.confidence === 'high' && r.isCorrect) baseScore += 15;
        if (r.confidence === 'low' && !r.isCorrect) baseScore += 10; // Honest awareness
        if (r.hasVoiceReasoning) baseScore += 5;

        const clamped = Math.max(25, Math.min(95, baseScore));
        updatedMasteryByConcept[r.conceptId] = {
          conceptId: r.conceptId,
          masteryPercentage: clamped,
          questionsAttempted: 1,
          questionsCorrect: r.isCorrect ? 1 : 0,
          lastStudiedDate: new Date().toISOString().split('T')[0],
          confidenceAverage: r.confidence,
          status: clamped >= 75 ? 'mastered' : clamped >= 50 ? 'developing' : 'weak',
          trend: 'stable',
          history: [
            {
              date: new Date().toISOString().split('T')[0],
              scoreDelta: clamped,
              reason: 'Baseline Diagnostic Assessment',
              newScore: clamped,
            },
          ],
        };

        const cMeta = CONCEPTS.find((c) => c.id === r.conceptId);
        newConfRecords.push({
          id: `cr-diag-${Date.now()}-${r.conceptId}`,
          timestamp: `${dateFormatted} - ${timeFormatted}`,
          conceptId: r.conceptId,
          conceptName: cMeta?.name || r.conceptId,
          difficulty: 'medium',
          confidenceLevel: r.confidence,
          answerCorrect: r.isCorrect,
          reasoningQuality: r.hasVoiceReasoning ? 'strong' : 'partial',
          reasoningScore: r.isCorrect ? 85 : 40,
        });
      });

      const scores = Object.values(updatedMasteryByConcept).map((c) => c.masteryPercentage);
      const overallMastery = Math.round(scores.reduce((a, b) => a + b, 0) / (scores.length || 1));

      const diagEvent: import('../types/learning').LearningMemoryEvent = {
        id: `lj-diag-${Date.now()}`,
        timestamp: `${dateFormatted} - ${timeFormatted}`,
        dateKey: dateFormatted,
        eventType: 'diagnostic',
        concept: 'Class 10 Physics – Electricity',
        conceptId: 'electricity-root',
        title: 'Diagnostic Assessment Completed',
        description: `Completed 7-concept baseline diagnostic. Overall mastery calibrated at ${overallMastery}%.`,
        studentAction: `Completed full diagnostic test with confidence self-evaluations`,
        aiInsight: `Learner Model Agent established full syllabus topology. Initial focus: Series Circuits (weakest).`,
        masteryBefore: 50,
        masteryAfter: overallMastery,
      };

      // Regenerate prioritized spaced-repetition schedule from diagnostic baseline
      const calibratedSchedule: RevisionTask[] = results
        .map((r) => {
          const score = updatedMasteryByConcept[r.conceptId]?.masteryPercentage ?? 50;
          const cMeta = CONCEPTS.find((c) => c.id === r.conceptId);
          return {
            id: `rev-diag-${r.conceptId}-${Date.now()}`,
            conceptId: r.conceptId,
            conceptName: cMeta?.name || r.conceptId,
            title:
              score < 50
                ? `Priority Rebuild: ${cMeta?.name || r.conceptId}`
                : score < 75
                ? `Reinforcement Drill: ${cMeta?.name || r.conceptId}`
                : `Retention Challenge: ${cMeta?.name || r.conceptId}`,
            taskType: (score < 50 ? 'practice_drill' : score < 75 ? 'concept_review' : 'challenge') as RevisionTask['taskType'],
            dueDate: score < 50 ? 'Today' : score < 75 ? 'In 2 days' : 'In 7 days',
            estimatedMinutes: score < 50 ? 6 : 4,
            difficulty: (score < 50 ? 'easy' : score < 75 ? 'medium' : 'hard') as DifficultyLevel,
            completed: false,
            priority: (score < 50 ? 'high' : score < 75 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
            reason: `Diagnostic mastery baseline: ${score}%. Scheduled via Ebbinghaus spaced repetition curve.`,
          };
        })
        .sort((a, b) => (a.priority === 'high' ? -1 : b.priority === 'high' ? 1 : 0));

      const todayStr = new Date().toISOString().split('T')[0];
      const baseGoal = prev.dailyGoal || DEMO_STUDENT_ALEX.dailyGoal;
      const isSameGoalDay = baseGoal.lastGoalDate === todayStr;
      const diagMinutes = Math.max(2, Math.round(results.length * 1.5));

      return {
        ...prev,
        overallMastery,
        totalQuestionsAnswered: prev.totalQuestionsAnswered + results.length,
        dailyGoal: {
          ...baseGoal,
          minutesPracticedToday: (isSameGoalDay ? baseGoal.minutesPracticedToday : 0) + diagMinutes,
          questionsAnsweredToday: (isSameGoalDay ? baseGoal.questionsAnsweredToday : 0) + results.length,
          lastGoalDate: todayStr,
        },
        masteryByConcept: updatedMasteryByConcept,
        revisionSchedule: calibratedSchedule,
        recentActivity: [
          {
            id: `act-${Date.now()}`,
            title: 'Diagnostic Test Completed',
            timestamp: 'Just now',
            type: 'diagnostic',
            conceptName: 'Physics – Electricity',
            details: `Calculated baseline mastery at ${overallMastery}% across ${results.length} concepts.`,
          },
          ...prev.recentActivity,
        ],
        learningJourney: [diagEvent, ...prev.learningJourney],
        confidenceRecords: [...newConfRecords, ...prev.confidenceRecords.slice(0, 40)],
      };
    });

    addAgentLog(
      'Learner Model Agent',
      'Diagnostic Baseline Established',
      `Initialized complete student knowledge graph from 7-concept diagnostic evaluation.`,
      'info'
    );
  };

  const formatTimestampNow = () => {
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const timeFormatted = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return { dateFormatted, full: `${dateFormatted} - ${timeFormatted}` };
  };

  const recordTeachBackSession = (
    recordData: Omit<TeachBackRecord, 'id' | 'timestamp'>
  ): TeachBackRecord => {
    const { dateFormatted, full } = formatTimestampNow();
    const newRecord: TeachBackRecord = {
      id: `tb-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: full,
      ...recordData,
    };

    setProfile((prev) => {
      const current = prev.masteryByConcept[recordData.conceptId] || {
        conceptId: recordData.conceptId,
        masteryPercentage: 50,
        questionsAttempted: 0,
        questionsCorrect: 0,
        lastStudiedDate: new Date().toISOString().split('T')[0],
        confidenceAverage: 'medium' as ConfidenceLevel,
        status: 'developing' as const,
        trend: 'stable' as const,
        history: [],
      };
      const oldScore = current.masteryPercentage;
      const newScore = Math.max(10, Math.min(100, oldScore + recordData.masteryDelta));
      const newStatus: ConceptMastery['status'] =
        newScore >= 75 ? 'mastered' : newScore >= 50 ? 'developing' : 'weak';
      const newTrend: ConceptMastery['trend'] =
        recordData.masteryDelta > 0
          ? 'improving'
          : recordData.masteryDelta < 0
          ? 'declining'
          : 'stable';

      const updatedMasteryByConcept = {
        ...prev.masteryByConcept,
        [recordData.conceptId]: {
          ...current,
          masteryPercentage: newScore,
          lastStudiedDate: new Date().toISOString().split('T')[0],
          status: newStatus,
          trend: newTrend,
          history: [
            {
              date: new Date().toISOString().split('T')[0],
              scoreDelta: recordData.masteryDelta,
              reason: `Teach It Back (${recordData.qualityScore}/100)`,
              newScore,
            },
            ...current.history,
          ],
        },
      };

      const scores = Object.values(updatedMasteryByConcept).map((c) => c.masteryPercentage);
      const overallMastery = Math.round(scores.reduce((a, b) => a + b, 0) / (scores.length || 1));

      // Add any detected misconceptions into profile.misconceptions
      let updatedMiscs = [...prev.misconceptions];
      recordData.misconceptions.forEach((miscTitle) => {
        const exists = updatedMiscs.some((m) => m.title.toLowerCase() === miscTitle.toLowerCase());
        if (!exists && miscTitle.trim()) {
          updatedMiscs = [
            {
              id: `misc-tb-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
              conceptId: recordData.conceptId,
              conceptName: recordData.concept,
              title: miscTitle,
              studentExplanationSnippet: recordData.transcript.slice(0, 110),
              aiCorrection: recordData.feedbackSummary,
              severity: 'medium',
              status: 'active',
              detectedAt: 'Just now',
              timesEncountered: 1,
            },
            ...updatedMiscs,
          ];
        }
      });

      const timelineEvent: import('../types/learning').LearningMemoryEvent = {
        id: `lj-tb-${Date.now()}`,
        timestamp: full,
        dateKey: dateFormatted,
        eventType: 'teach_back',
        concept: recordData.concept,
        conceptId: recordData.conceptId,
        title: `Teach It Back Completed: ${recordData.concept} (${recordData.qualityScore}/100)`,
        description: recordData.feedbackSummary,
        studentAction: `Explained "${recordData.concept}" in own words: "${recordData.transcript.slice(0, 80)}..."`,
        aiInsight:
          recordData.missingIdeas.length > 0
            ? `Correctly covered ${recordData.conceptsExplainedCorrectly.length} point(s); missing: ${recordData.missingIdeas[0]}.`
            : `Strong Feynman explanation covering core concepts accurately.`,
        masteryBefore: oldScore,
        masteryAfter: newScore,
        misconceptionTitle: recordData.misconceptions[0],
      };

      const todayStr = new Date().toISOString().split('T')[0];
      const baseGoal = prev.dailyGoal || DEMO_STUDENT_ALEX.dailyGoal;
      const isSameGoalDay = baseGoal.lastGoalDate === todayStr;

      return {
        ...prev,
        overallMastery,
        totalVoiceNotesCount: prev.totalVoiceNotesCount + 1,
        dailyGoal: {
          ...baseGoal,
          minutesPracticedToday: (isSameGoalDay ? baseGoal.minutesPracticedToday : 0) + 3,
          questionsAnsweredToday: isSameGoalDay ? baseGoal.questionsAnsweredToday : 0,
          lastGoalDate: todayStr,
        },
        masteryByConcept: updatedMasteryByConcept,
        misconceptions: updatedMiscs,
        teachBackRecords: [newRecord, ...(prev.teachBackRecords || [])],
        recentActivity: [
          {
            id: `act-tb-${Date.now()}`,
            title: 'Teach It Back Evaluation',
            timestamp: 'Just now',
            type: 'teach_back',
            conceptName: recordData.concept,
            details: `Scored ${recordData.qualityScore}/100 explaining ${recordData.concept}.`,
          },
          ...prev.recentActivity.slice(0, 9),
        ],
        learningJourney: [timelineEvent, ...prev.learningJourney],
      };
    });

    addAgentLog(
      'Learner Model Agent',
      'Teach It Back Scored',
      `Evaluated Feynman explanation on ${recordData.concept}: ${recordData.qualityScore}/100 (Δ${recordData.masteryDelta > 0 ? '+' : ''}${recordData.masteryDelta}%).`,
      recordData.qualityScore >= 70 ? 'success' : 'warning'
    );

    return newRecord;
  };

  const recordSocraticSession = (
    sessionData: Omit<SocraticSession, 'id' | 'timestamp'>
  ): SocraticSession => {
    const { dateFormatted, full } = formatTimestampNow();
    const newSession: SocraticSession = {
      id: `soc-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: full,
      ...sessionData,
    };

    setProfile((prev) => {
      const current = prev.masteryByConcept[sessionData.conceptId] || {
        conceptId: sessionData.conceptId,
        masteryPercentage: 50,
        questionsAttempted: 0,
        questionsCorrect: 0,
        lastStudiedDate: new Date().toISOString().split('T')[0],
        confidenceAverage: 'medium' as ConfidenceLevel,
        status: 'developing' as const,
        trend: 'stable' as const,
        history: [],
      };
      const oldScore = current.masteryPercentage;
      const newScore = Math.max(10, Math.min(100, oldScore + sessionData.masteryDelta));
      const newStatus: ConceptMastery['status'] =
        newScore >= 75 ? 'mastered' : newScore >= 50 ? 'developing' : 'weak';

      const updatedMasteryByConcept = {
        ...prev.masteryByConcept,
        [sessionData.conceptId]: {
          ...current,
          masteryPercentage: newScore,
          questionsAttempted:
            current.questionsAttempted + (sessionData.practiceAnsweredCorrectly !== undefined ? 1 : 0),
          questionsCorrect:
            current.questionsCorrect + (sessionData.practiceAnsweredCorrectly === true ? 1 : 0),
          lastStudiedDate: new Date().toISOString().split('T')[0],
          status: newStatus,
          trend: sessionData.masteryDelta > 0 ? ('improving' as const) : current.trend,
          history: [
            {
              date: new Date().toISOString().split('T')[0],
              scoreDelta: sessionData.masteryDelta,
              reason: `Socratic Dialogue (${sessionData.turnsCount} turns)`,
              newScore,
            },
            ...current.history,
          ],
        },
      };

      const scores = Object.values(updatedMasteryByConcept).map((c) => c.masteryPercentage);
      const overallMastery = Math.round(scores.reduce((a, b) => a + b, 0) / (scores.length || 1));

      const timelineEvent: import('../types/learning').LearningMemoryEvent = {
        id: `lj-soc-${Date.now()}`,
        timestamp: full,
        dateKey: dateFormatted,
        eventType: 'socratic',
        concept: sessionData.concept,
        conceptId: sessionData.conceptId,
        title: `Socratic Discovery Completed: ${sessionData.concept}`,
        description:
          sessionData.summary ||
          `Completed ${sessionData.turnsCount}-turn guided Socratic inquiry on ${sessionData.concept}.`,
        studentAction: `Engaged in ${sessionData.turnsCount} Socratic reasoning turns${
          sessionData.practiceAnsweredCorrectly !== undefined
            ? ` and ${sessionData.practiceAnsweredCorrectly ? 'aced' : 'attempted'} the synthesis check`
            : ''
        }.`,
        aiInsight: `Guided self-discovery reinforced causal understanding without spoon-feeding answers.`,
        masteryBefore: oldScore,
        masteryAfter: newScore,
      };

      const todayStr = new Date().toISOString().split('T')[0];
      const baseGoal = prev.dailyGoal || DEMO_STUDENT_ALEX.dailyGoal;
      const isSameGoalDay = baseGoal.lastGoalDate === todayStr;

      return {
        ...prev,
        overallMastery,
        totalQuestionsAnswered:
          prev.totalQuestionsAnswered + (sessionData.practiceAnsweredCorrectly !== undefined ? 1 : 0),
        dailyGoal: {
          ...baseGoal,
          minutesPracticedToday: (isSameGoalDay ? baseGoal.minutesPracticedToday : 0) + 4,
          questionsAnsweredToday:
            (isSameGoalDay ? baseGoal.questionsAnsweredToday : 0) +
            (sessionData.practiceAnsweredCorrectly !== undefined ? 1 : 0),
          lastGoalDate: todayStr,
        },
        consecutiveWrongByConcept:
          sessionData.practiceAnsweredCorrectly === true
            ? { ...(prev.consecutiveWrongByConcept || {}), [sessionData.conceptId]: 0 }
            : prev.consecutiveWrongByConcept,
        masteryByConcept: updatedMasteryByConcept,
        socraticSessions: [newSession, ...(prev.socraticSessions || [])],
        recentActivity: [
          {
            id: `act-soc-${Date.now()}`,
            title: 'Socratic Mode Session',
            timestamp: 'Just now',
            type: 'socratic',
            conceptName: sessionData.concept,
            details: `Completed ${sessionData.turnsCount}-turn guided discovery on ${sessionData.concept}.`,
          },
          ...prev.recentActivity.slice(0, 9),
        ],
        learningJourney: [timelineEvent, ...prev.learningJourney],
      };
    });

    addAgentLog(
      'Adaptive Learning Agent',
      'Socratic Discovery Logged',
      `Completed ${sessionData.turnsCount}-turn Socratic scaffolding on ${sessionData.concept} (Δ+${sessionData.masteryDelta}%).`,
      'purple'
    );

    return newSession;
  };

  const recordRescueAttempt = (
    eventData: Omit<RescueEvent, 'id' | 'timestamp'>
  ): RescueEvent => {
    const { dateFormatted, full } = formatTimestampNow();
    const newEvent: RescueEvent = {
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: full,
      ...eventData,
    };

    const modeLabels: Record<RescueModeType, string> = {
      visual: 'Visual Explanation',
      analogy: 'Real-World Analogy',
      step_by_step: 'Step-by-Step Breakdown',
      voice: 'Voice Conversation',
      mini_challenge: 'Mini Challenge',
    };

    setProfile((prev) => {
      const timelineEvent: import('../types/learning').LearningMemoryEvent = {
        id: `lj-res-${Date.now()}`,
        timestamp: full,
        dateKey: dateFormatted,
        eventType: 'concept_rescue',
        concept: eventData.concept,
        conceptId: eventData.conceptId,
        title: `Concept Rescue Started: ${modeLabels[eventData.chosenMode]}`,
        description: `Activated alternative learning mode (${modeLabels[eventData.chosenMode]}) for ${eventData.concept} at ${eventData.masteryAtTrigger}% mastery.`,
        studentAction: `Selected ${modeLabels[eventData.chosenMode]} rescue path`,
        aiInsight: `Switched instructional representation to break conceptual friction (${eventData.triggerReason.replace(/_/g, ' ')}).`,
      };

      const todayStr = new Date().toISOString().split('T')[0];
      const baseGoal = prev.dailyGoal || DEMO_STUDENT_ALEX.dailyGoal;
      const isSameGoalDay = baseGoal.lastGoalDate === todayStr;

      return {
        ...prev,
        dailyGoal: {
          ...baseGoal,
          minutesPracticedToday: (isSameGoalDay ? baseGoal.minutesPracticedToday : 0) + 2,
          questionsAnsweredToday: isSameGoalDay ? baseGoal.questionsAnsweredToday : 0,
          lastGoalDate: todayStr,
        },
        rescueEvents: [newEvent, ...(prev.rescueEvents || [])],
        learningJourney: [timelineEvent, ...prev.learningJourney],
      };
    });

    addAgentLog(
      'Adaptive Learning Agent',
      'Concept Rescue Engaged',
      `Switched ${eventData.concept} to ${modeLabels[eventData.chosenMode]} mode.`,
      'warning'
    );

    return newEvent;
  };

  const resolveRescueOutcome = (
    rescueId: string,
    improved: boolean,
    masteryDelta: number,
    notes?: string
  ) => {
    const { dateFormatted, full } = formatTimestampNow();

    setProfile((prev) => {
      const target = (prev.rescueEvents || []).find((r) => r.id === rescueId);
      if (!target) return prev;

      const updatedRescueEvents = (prev.rescueEvents || []).map((r) =>
        r.id === rescueId
          ? {
              ...r,
              nextAnswerImproved: improved,
              masteryDelta,
              notes: notes || (improved ? 'Improved on follow-up verification' : 'Needs another angle'),
            }
          : r
      );

      const current = prev.masteryByConcept[target.conceptId];
      const oldScore = current?.masteryPercentage ?? target.masteryAtTrigger;
      const newScore = Math.max(10, Math.min(100, oldScore + masteryDelta));
      const newStatus: ConceptMastery['status'] =
        newScore >= 75 ? 'mastered' : newScore >= 50 ? 'developing' : 'weak';

      const updatedMasteryByConcept = {
        ...prev.masteryByConcept,
        [target.conceptId]: {
          ...(current || {
            conceptId: target.conceptId,
            questionsAttempted: 0,
            questionsCorrect: 0,
            confidenceAverage: 'medium' as ConfidenceLevel,
            history: [],
          }),
          masteryPercentage: newScore,
          questionsAttempted: (current?.questionsAttempted || 0) + 1,
          questionsCorrect: (current?.questionsCorrect || 0) + (improved ? 1 : 0),
          lastStudiedDate: new Date().toISOString().split('T')[0],
          status: newStatus,
          trend: improved ? ('improving' as const) : ('declining' as const),
          history: [
            {
              date: new Date().toISOString().split('T')[0],
              scoreDelta: masteryDelta,
              reason: `Concept Rescue (${target.chosenMode}) checkpoint`,
              newScore,
            },
            ...(current?.history || []),
          ],
        },
      };

      const scores = Object.values(updatedMasteryByConcept).map((c) => c.masteryPercentage);
      const overallMastery = Math.round(scores.reduce((a, b) => a + b, 0) / (scores.length || 1));

      const timelineEvent: import('../types/learning').LearningMemoryEvent = {
        id: `lj-res-out-${Date.now()}`,
        timestamp: full,
        dateKey: dateFormatted,
        eventType: 'concept_rescue',
        concept: target.concept,
        conceptId: target.conceptId,
        title: improved
          ? `Concept Rescue Succeeded: ${target.concept}`
          : `Concept Rescue Follow-Up Logged: ${target.concept}`,
        description: improved
          ? `After trying ${target.chosenMode.replace('_', ' ')} mode, the student answered the follow-up checkpoint correctly.`
          : `Follow-up checkpoint still missed after ${target.chosenMode.replace('_', ' ')} mode. Another modality is ready.`,
        studentAction: `Completed post-rescue verification check`,
        aiInsight: improved
          ? `Alternative modality (${target.chosenMode.replace('_', ' ')}) unlocked breakthrough!`
          : `Suggest switching to Voice Conversation or Step-by-Step breakdown next.`,
        masteryBefore: oldScore,
        masteryAfter: newScore,
      };

      const todayStr = new Date().toISOString().split('T')[0];
      const baseGoal = prev.dailyGoal || DEMO_STUDENT_ALEX.dailyGoal;
      const isSameGoalDay = baseGoal.lastGoalDate === todayStr;

      return {
        ...prev,
        overallMastery,
        totalQuestionsAnswered: prev.totalQuestionsAnswered + 1,
        dailyGoal: {
          ...baseGoal,
          minutesPracticedToday: (isSameGoalDay ? baseGoal.minutesPracticedToday : 0) + 1,
          questionsAnsweredToday: (isSameGoalDay ? baseGoal.questionsAnsweredToday : 0) + 1,
          lastGoalDate: todayStr,
        },
        consecutiveWrongByConcept: improved
          ? { ...(prev.consecutiveWrongByConcept || {}), [target.conceptId]: 0 }
          : {
              ...(prev.consecutiveWrongByConcept || {}),
              [target.conceptId]: (prev.consecutiveWrongByConcept?.[target.conceptId] || 0) + 1,
            },
        masteryByConcept: updatedMasteryByConcept,
        rescueEvents: updatedRescueEvents,
        recentActivity: [
          {
            id: `act-res-${Date.now()}`,
            title: improved ? 'Concept Rescue Breakthrough' : 'Concept Rescue Attempt',
            timestamp: 'Just now',
            type: 'concept_rescue',
            conceptName: target.concept,
            details: `${target.chosenMode.replace('_', ' ')} mode → ${
              improved ? 'Improved on next answer!' : 'Needs another angle'
            }`,
          },
          ...prev.recentActivity.slice(0, 9),
        ],
        learningJourney: [timelineEvent, ...prev.learningJourney],
      };
    });

    addAgentLog(
      'Learner Model Agent',
      improved ? 'Rescue Breakthrough Recorded' : 'Rescue Retry Needed',
      improved
        ? `Alternative modality succeeded! Mastery updated by +${masteryDelta}%.`
        : `Student still needs reinforcement; queuing second rescue modality.`,
      improved ? 'success' : 'warning'
    );
  };

  return (
    <LearnerContext.Provider
      value={{
        role,
        setRole,
        profile,
        agentLogs,
        addAgentLog,
        updateConceptMastery,
        addMisconception,
        resolveMisconception,
        completeRevisionTask,
        updateDailyGoal,
        logStudyMinutes,
        resetToDemoAlex,
        recordVoiceActivity,
        saveDiagnosticResults,
        addLearningEvent,
        recordConfidenceRecord,
        recordTeachBackSession,
        recordSocraticSession,
        recordRescueAttempt,
        resolveRescueOutcome,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </LearnerContext.Provider>
  );
};

export const useLearner = () => {
  const context = useContext(LearnerContext);
  if (!context) {
    throw new Error('useLearner must be used within a LearnerProvider');
  }
  return context;
};
