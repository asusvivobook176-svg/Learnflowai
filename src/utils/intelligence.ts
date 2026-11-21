import { CONCEPTS } from '../data/syllabus';
import {
  ConceptMastery,
  ConfidenceAnalysis,
  ConfidenceGapItem,
  ConfidenceLevel,
  ConfidenceRecord,
  DifficultyCalibrationResult,
  DifficultyLevel,
  ExamPlanDay,
  ExamPlanState,
  ExamReadinessBreakdown,
  PrerequisiteRecommendation,
  Recommendation,
  StudentProfile,
  StudentTab,
} from '../types/learning';

/**
 * 1. Difficulty Calibrator
 * Computes next question difficulty using recent accuracy, response time, confidence, and mastery.
 */
export function calibrateNextDifficulty(
  profile: StudentProfile,
  conceptId: string,
  overrideLastConfidence?: ConfidenceLevel,
  overrideLastResponseMs?: number
): DifficultyCalibrationResult {
  const masteryPct = profile.masteryByConcept[conceptId]?.masteryPercentage ?? 50;
  const conceptMetrics = (profile.practiceMetrics || []).filter(
    (m) => m.conceptId === conceptId
  );
  const recentPool =
    conceptMetrics.length > 0
      ? conceptMetrics.slice(0, 5)
      : (profile.practiceMetrics || []).slice(0, 5);

  const recentAccuracyPct =
    recentPool.length > 0
      ? Math.round(
          (recentPool.filter((m) => m.isCorrect).length / recentPool.length) * 100
        )
      : masteryPct;

  const avgResponseMs =
    overrideLastResponseMs ??
    (recentPool.length > 0
      ? Math.round(
          recentPool.reduce((acc, m) => acc + (m.responseTimeMs || 15000), 0) /
            recentPool.length
        )
      : 16000);
  const avgResponseSeconds = Math.max(2, Math.round(avgResponseMs / 1000));

  const lastConfidence: ConfidenceLevel =
    overrideLastConfidence ??
    recentPool[0]?.confidence ??
    profile.masteryByConcept[conceptId]?.confidenceAverage ??
    'medium';

  // Weighted composite readiness signal (0 - 100)
  let readinessIndex = masteryPct * 0.45 + recentAccuracyPct * 0.35;

  // Response time factor: quick confident recall boosts, slow struggle softens
  if (avgResponseSeconds <= 12) readinessIndex += 12;
  else if (avgResponseSeconds >= 25) readinessIndex -= 10;
  else readinessIndex += 4;

  // Confidence factor
  if (lastConfidence === 'high' && recentAccuracyPct >= 60) readinessIndex += 10;
  else if (lastConfidence === 'low') readinessIndex -= 8;

  let difficulty: DifficultyLevel = 'medium';
  if (readinessIndex < 52 || recentAccuracyPct < 45) {
    difficulty = 'easy';
  } else if (readinessIndex >= 76 && recentAccuracyPct >= 75 && avgResponseSeconds <= 18) {
    difficulty = 'hard';
  } else {
    difficulty = 'medium';
  }

  const speedTag =
    avgResponseSeconds <= 12
      ? `fast ${avgResponseSeconds}s pace`
      : avgResponseSeconds >= 25
      ? `deliberate ${avgResponseSeconds}s pace`
      : `${avgResponseSeconds}s avg response`;

  const reasonLine =
    difficulty === 'easy'
      ? `Selected Easy: recent accuracy ${recentAccuracyPct}%, ${speedTag}, and ${lastConfidence} confidence suggest reinforcing core steps first.`
      : difficulty === 'hard'
      ? `Escalated to Hard: strong ${recentAccuracyPct}% accuracy, ${speedTag}, and ${lastConfidence} confidence signal readiness for multi-step problems.`
      : `Calibrated to Medium: ${recentAccuracyPct}% recent accuracy with ${speedTag} and ${lastConfidence} confidence fits your zone of proximal development.`;

  return {
    difficulty,
    reasonLine,
    factors: {
      recentAccuracyPct,
      avgResponseSeconds,
      lastConfidence,
      conceptMasteryPct: masteryPct,
    },
  };
}

/**
 * 2. Prerequisite Path Analyzer
 * Walks CONCEPTS[].prerequisites to build full prerequisite chain and flag weak upstream dependencies.
 */
export function getPrerequisiteChainForConcept(conceptId: string): string[] {
  const visited = new Set<string>();
  const ordered: string[] = [];

  const dfs = (id: string) => {
    if (visited.has(id)) return;
    visited.add(id);
    const meta = CONCEPTS.find((c) => c.id === id);
    if (meta) {
      meta.prerequisites.forEach((preId) => dfs(preId));
    }
    ordered.push(id);
  };

  dfs(conceptId);
  return ordered; // [earliest prerequisite, ..., targetConceptId]
}

export function computePrerequisiteRecommendation(
  profile: StudentProfile,
  targetConceptId: string
): PrerequisiteRecommendation {
  const chain = getPrerequisiteChainForConcept(targetConceptId);
  const upstreamIds = chain.slice(0, -1); // exclude target itself

  // Identify the weakest upstream prerequisite below 60% threshold
  const weakUpstream = upstreamIds
    .map((id) => ({
      id,
      name: CONCEPTS.find((c) => c.id === id)?.name || id,
      mastery: profile.masteryByConcept[id]?.masteryPercentage ?? 50,
    }))
    .filter((item) => item.mastery < 60)
    .sort((a, b) => a.mastery - b.mastery);

  const targetName =
    CONCEPTS.find((c) => c.id === targetConceptId)?.name || targetConceptId;

  if (weakUpstream.length > 0) {
    const primary = weakUpstream[0];
    return {
      hasWeakPrerequisite: true,
      targetConceptId,
      recommendedConceptId: primary.id,
      recommendedConceptName: primary.name,
      chain,
      reason: `${targetName} builds on ${primary.name} (currently ${primary.mastery}%). Strengthening ${primary.name} first unlocks faster progress.`,
    };
  }

  return {
    hasWeakPrerequisite: false,
    targetConceptId,
    recommendedConceptId: targetConceptId,
    recommendedConceptName: targetName,
    chain,
    reason: `All upstream prerequisites for ${targetName} are ≥60%. You are cleared to practice directly.`,
  };
}

/**
 * 3. Exam Readiness Score (0 - 100) from 4 weighted components + Top 3 Actions
 */
export function calculateExamReadiness(profile: StudentProfile): ExamReadinessBreakdown {
  const conceptEntries = CONCEPTS.map((c) => {
    const m = profile.masteryByConcept[c.id];
    return {
      id: c.id,
      name: c.name,
      mastery: m?.masteryPercentage ?? 50,
      lastStudiedDate: m?.lastStudiedDate || '2026-10-25',
    };
  });

  // Component A: Concept Mastery (0 - 40 pts)
  const avgMastery =
    conceptEntries.reduce((acc, c) => acc + c.mastery, 0) / (conceptEntries.length || 1);
  const masteryScore = Math.round((avgMastery / 100) * 40);

  // Component B: Retention Recency (0 - 20 pts) based on days since review
  const todayMs = Date.now();
  const conceptRecencyScores = conceptEntries.map((c) => {
    const studiedMs = Date.parse(c.lastStudiedDate);
    // For mock dates like 2026-10-30 when system clock differs, cap diff gracefully between 0..10 days
    const rawDays = Number.isNaN(studiedMs)
      ? 4
      : Math.max(0, Math.min(14, Math.abs(Math.round((todayMs - studiedMs) / 86400000)) % 10));
    return Math.max(0.25, 1 - rawDays * 0.08);
  });
  const avgRetentionRatio =
    conceptRecencyScores.reduce((a, b) => a + b, 0) / (conceptRecencyScores.length || 1);
  const retentionScore = Math.round(avgRetentionRatio * 20);

  // Component C: Open Misconceptions (0 - 20 pts)
  const openMiscs = profile.misconceptions.filter((m) => m.status !== 'resolved');
  const miscPenalty = openMiscs.reduce(
    (sum, m) => sum + (m.severity === 'high' ? 6 : m.severity === 'medium' ? 4 : 2),
    0
  );
  const misconceptionsScore = Math.max(0, 20 - miscPenalty);

  // Component D: Confidence Calibration (0 - 20 pts)
  const confRecords = profile.confidenceRecords || [];
  let calibrationRatio = 0.72;
  if (confRecords.length > 0) {
    const calibratedHits = confRecords.filter(
      (r) =>
        (r.confidenceLevel === 'high' && r.answerCorrect) ||
        (r.confidenceLevel === 'low' && !r.answerCorrect) ||
        (r.confidenceLevel === 'medium' && r.reasoningScore >= 55)
    ).length;
    calibrationRatio = Math.max(0.25, calibratedHits / confRecords.length);
  }
  const calibrationScore = Math.round(calibrationRatio * 20);

  const totalScore = Math.max(
    0,
    Math.min(100, masteryScore + retentionScore + misconceptionsScore + calibrationScore)
  );

  // Build candidate actions ranked by estimated point gain
  const actions: ExamReadinessBreakdown['topActions'] = [];

  const weakest = [...conceptEntries].sort((a, b) => a.mastery - b.mastery)[0];
  if (weakest) {
    const preCheck = computePrerequisiteRecommendation(profile, weakest.id);
    const focusId = preCheck.hasWeakPrerequisite ? preCheck.recommendedConceptId : weakest.id;
    const focusName = preCheck.hasWeakPrerequisite ? preCheck.recommendedConceptName : weakest.name;
    actions.push({
      id: 'act-weakest-concept',
      title: `Boost ${focusName} Mastery (${profile.masteryByConcept[focusId]?.masteryPercentage ?? weakest.mastery}%)`,
      reason: preCheck.hasWeakPrerequisite
        ? `Unlocks ${weakest.name} by reinforcing its foundational prerequisite.`
        : `Your lowest mastery topic weighs down overall readiness most.`,
      estimatedGainPoints: 8,
      estimatedMinutes: 10,
      targetTab: 'practice',
      targetConceptId: focusId,
    });
  }

  if (openMiscs.length > 0) {
    const topMisc =
      openMiscs.find((m) => m.severity === 'high') || openMiscs[0];
    actions.push({
      id: 'act-clear-misc',
      title: `Resolve "${topMisc.title}"`,
      reason: `Clearing this ${topMisc.severity}-severity trap recovers lost Open Misconceptions points.`,
      estimatedGainPoints: topMisc.severity === 'high' ? 6 : 4,
      estimatedMinutes: 6,
      targetTab: 'misconceptions',
      targetConceptId: topMisc.conceptId,
    });
  }

  // Calibration or Mastery Badge challenge
  const eligibleBadgeConcept = conceptEntries.find(
    (c) =>
      c.mastery >= 80 &&
      !(profile.masteryBadges || []).some((b) => b.conceptId === c.id)
  );
  if (eligibleBadgeConcept) {
    actions.push({
      id: 'act-earn-badge',
      title: `Verify Mastery Badge: ${eligibleBadgeConcept.name}`,
      reason: `You hit ${eligibleBadgeConcept.mastery}%! Pass the 5-question challenge to lock retention.`,
      estimatedGainPoints: 5,
      estimatedMinutes: 5,
      targetTab: 'progress',
      targetConceptId: eligibleBadgeConcept.id,
    });
  } else {
    actions.push({
      id: 'act-confidence-gap',
      title: `Calibrate Confidence with Explain My Thinking`,
      reason: `Close overconfidence gaps in circuits by narrating reasoning before submitting.`,
      estimatedGainPoints: 5,
      estimatedMinutes: 7,
      targetTab: 'confidence-analysis',
    });
  }

  // Always ensure 3 actions
  if (actions.length < 3) {
    actions.push({
      id: 'act-spaced-review',
      title: `Complete Today's Spaced Review Queue`,
      reason: `Refreshes retention recency score across developing topics.`,
      estimatedGainPoints: 4,
      estimatedMinutes: 5,
      targetTab: 'revision',
    });
  }

  return {
    totalScore,
    components: {
      mastery: {
        score: masteryScore,
        max: 40,
        label: 'Concept Mastery',
        detail: `${Math.round(avgMastery)}% avg across 7 syllabus topics`,
      },
      retention: {
        score: retentionScore,
        max: 20,
        label: 'Retention Recency',
        detail: `${Math.round(avgRetentionRatio * 100)}% memory freshness`,
      },
      misconceptions: {
        score: misconceptionsScore,
        max: 20,
        label: 'Open Misconceptions',
        detail: `${openMiscs.length} unresolved misconception(s)`,
      },
      calibration: {
        score: calibrationScore,
        max: 20,
        label: 'Confidence Calibration',
        detail: `${Math.round(calibrationRatio * 100)}% alignment score`,
      },
    },
    topActions: actions.slice(0, 3),
  };
}

/**
 * 4. Exam Countdown Planner Generator
 */
export function generateExamCountdownPlan(
  profile: StudentProfile,
  examDateISO: string,
  selectedConceptIds: string[]
): ExamPlanState {
  const conceptsToPlan =
    selectedConceptIds.length > 0 ? selectedConceptIds : CONCEPTS.map((c) => c.id);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const examDate = new Date(examDateISO);
  examDate.setHours(0, 0, 0, 0);

  const rawDays = Math.round((examDate.getTime() - today.getTime()) / 86400000);
  const totalDays = Math.max(2, Math.min(14, Number.isNaN(rawDays) ? 7 : rawDays + 1));

  // Sort selected concepts weakest-first for early focus
  const rankedConcepts = [...conceptsToPlan].sort((a, b) => {
    const ma = profile.masteryByConcept[a]?.masteryPercentage ?? 50;
    const mb = profile.masteryByConcept[b]?.masteryPercentage ?? 50;
    return ma - mb;
  });

  const openMiscs = profile.misconceptions.filter((m) => m.status !== 'resolved');
  const days: ExamPlanDay[] = [];

  for (let i = 0; i < totalDays; i++) {
    const dateObj = new Date(today.getTime() + i * 86400000);
    const dateISO = dateObj.toISOString().split('T')[0];
    const dateLabel =
      i === 0
        ? 'Today'
        : i === 1
        ? 'Tomorrow'
        : dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    const isLastDay = i === totalDays - 1;
    const primaryConceptId = rankedConcepts[i % rankedConcepts.length];
    const secondaryConceptId = rankedConcepts[(i + 1) % rankedConcepts.length];
    const primaryMeta = CONCEPTS.find((c) => c.id === primaryConceptId);
    const secondaryMeta = CONCEPTS.find((c) => c.id === secondaryConceptId);
    const primaryMastery = profile.masteryByConcept[primaryConceptId]?.masteryPercentage ?? 50;
    const secondaryMastery = profile.masteryByConcept[secondaryConceptId]?.masteryPercentage ?? 50;

    const tasks: ExamPlanDay['tasks'] = [];

    if (isLastDay) {
      tasks.push({
        id: `ep-${i}-mock`,
        conceptId: rankedConcepts[0],
        conceptName: 'Full Syllabus',
        title: 'Pre-Exam Mixed Rapid Checkpoint & Formula Audit',
        focusType: 'mock_check',
        estimatedMinutes: 15,
        completed: false,
      });
      tasks.push({
        id: `ep-${i}-rev`,
        conceptId: secondaryConceptId,
        conceptName: secondaryMeta?.name || secondaryConceptId,
        title: `Light Spaced Recall: ${secondaryMeta?.name || secondaryConceptId}`,
        focusType: 'spaced_review',
        estimatedMinutes: 8,
        completed: false,
      });
    } else {
      const matchingMisc = openMiscs.find((m) => m.conceptId === primaryConceptId);
      if (matchingMisc) {
        tasks.push({
          id: `ep-${i}-misc`,
          conceptId: primaryConceptId,
          conceptName: primaryMeta?.name || primaryConceptId,
          title: `Clear Trap: ${matchingMisc.title}`,
          focusType: 'misconception_fix',
          estimatedMinutes: 8,
          completed: false,
        });
      } else {
        tasks.push({
          id: `ep-${i}-drill`,
          conceptId: primaryConceptId,
          conceptName: primaryMeta?.name || primaryConceptId,
          title:
            primaryMastery < 55
              ? `Weak-Concept Repair Drill: ${primaryMeta?.name || primaryConceptId} (${primaryMastery}%)`
              : `Adaptive Practice: ${primaryMeta?.name || primaryConceptId} (${primaryMastery}%)`,
          focusType: primaryMastery < 60 ? 'weak_drill' : 'spaced_review',
          estimatedMinutes: primaryMastery < 55 ? 12 : 8,
          completed: false,
        });
      }

      if (rankedConcepts.length > 1) {
        tasks.push({
          id: `ep-${i}-spaced`,
          conceptId: secondaryConceptId,
          conceptName: secondaryMeta?.name || secondaryConceptId,
          title:
            secondaryMastery >= 75
              ? `Spaced Retention Check: ${secondaryMeta?.name || secondaryConceptId}`
              : `Teach It Back Review: ${secondaryMeta?.name || secondaryConceptId}`,
          focusType: 'spaced_review',
          estimatedMinutes: 7,
          completed: false,
        });
      }
    }

    const theme = isLastDay
      ? 'Final Exam Readiness Polish'
      : primaryMastery < 55
      ? `Weak Concept Repair (${primaryMeta?.name})`
      : 'Spaced Review & Speed Calibration';

    days.push({
      dayNumber: i + 1,
      dateISO,
      dateLabel,
      theme,
      tasks,
    });
  }

  return {
    examDateISO,
    selectedConceptIds: conceptsToPlan,
    generatedAtISO: new Date().toISOString(),
    generatedAtModelVersion: profile.learnerModelVersion || 1,
    needsUpdate: false,
    days,
  };
}

/**
 * 5. Compute Next Best Step Hero Recommendation for Student Dashboard
 */
export interface NextBestStep {
  title: string;
  reason: string;
  estimatedMinutes: number;
  actionLabel: string;
  targetTab: StudentTab;
  targetConceptId?: string;
  badgeText: string;
}

export function computeNextBestStep(profile: StudentProfile): NextBestStep {
  // Check Concept Rescue threshold first (<40% or 3 consecutive wrong)
  const sortedConcepts = CONCEPTS.map((c) => ({
    ...c,
    mastery: profile.masteryByConcept[c.id]?.masteryPercentage ?? 50,
  })).sort((a, b) => a.mastery - b.mastery);

  const weakest = sortedConcepts[0];
  const preCheck = computePrerequisiteRecommendation(profile, weakest.id);

  if (preCheck.hasWeakPrerequisite) {
    const preMastery =
      profile.masteryByConcept[preCheck.recommendedConceptId]?.masteryPercentage ?? 50;
    return {
      title: `Strengthen Prerequisite: ${preCheck.recommendedConceptName}`,
      reason: `${weakest.name} (${weakest.mastery}%) builds directly on ${preCheck.recommendedConceptName} (${preMastery}%). Fixing the foundation first accelerates mastery.`,
      estimatedMinutes: 8,
      actionLabel: `Practice ${preCheck.recommendedConceptName}`,
      targetTab: 'practice',
      targetConceptId: preCheck.recommendedConceptId,
      badgeText: 'Prerequisite Path',
    };
  }

  const activeMisc = profile.misconceptions.find((m) => m.status === 'active');
  if (weakest && weakest.mastery < 50) {
    return {
      title: activeMisc && activeMisc.conceptId === weakest.id
        ? `Clear "${activeMisc.title}" in ${weakest.name}`
        : `Repair Weak Concept: ${weakest.name} (${weakest.mastery}%)`,
      reason: activeMisc && activeMisc.conceptId === weakest.id
        ? `Detected ${activeMisc.timesEncountered}× in your reasoning. Resolving this misconception will lift both Exam Readiness and ${weakest.name} mastery.`
        : `${weakest.name} is currently your lowest-mastery concept. A short calibrated drill will rebuild confidence.`,
      estimatedMinutes: 8,
      actionLabel: `Start Targeted Drill`,
      targetTab: 'practice',
      targetConceptId: weakest.id,
      badgeText: 'Highest Impact',
    };
  }

  const badgeCandidate = sortedConcepts.find(
    (c) =>
      c.mastery >= 80 &&
      !(profile.masteryBadges || []).some((b) => b.conceptId === c.id)
  );
  if (badgeCandidate) {
    return {
      title: `Earn Mastery Badge in ${badgeCandidate.name} (${badgeCandidate.mastery}%)`,
      reason: `You've crossed 80% mastery! Complete the 5-question verification challenge to unlock your verified badge.`,
      estimatedMinutes: 5,
      actionLabel: 'Take 5-Q Challenge',
      targetTab: 'progress',
      targetConceptId: badgeCandidate.id,
      badgeText: 'Badge Unlocked',
    };
  }

  return {
    title: `Review Exam Readiness & Daily Countdown Plan`,
    reason: `Keep your spaced repetition streak alive and tighten calibration ahead of your exam.`,
    estimatedMinutes: 6,
    actionLabel: 'Open Exam Planner',
    targetTab: 'exam-planner',
    badgeText: 'Spaced Review',
  };
}

/**
 * 6. Explainable AI Recommendations ("Why am I seeing this?")
 */
export function generateExplainableRecommendations(profile: StudentProfile): Recommendation[] {
  const openMiscs = profile.misconceptions.filter((m) => m.status !== 'resolved');

  const items: Recommendation[] = CONCEPTS.map((c) => {
    const masteryObj = profile.masteryByConcept[c.id];
    const currentMastery = masteryObj?.masteryPercentage ?? 50;
    const recentIncorrect = Math.max(
      0,
      (masteryObj?.questionsAttempted ?? 0) - (masteryObj?.questionsCorrect ?? 0)
    );
    const conceptMiscs = openMiscs.filter((m) => m.conceptId === c.id);
    const activeMiscCount = conceptMiscs.length;

    const studiedMs = masteryObj?.lastStudiedDate ? Date.parse(masteryObj.lastStudiedDate) : NaN;
    const daysSinceReview = Number.isNaN(studiedMs)
      ? 3
      : Math.max(0, Math.min(14, Math.abs(Math.round((Date.now() - studiedMs) / 86400000)) % 10));

    const preCheck = computePrerequisiteRecommendation(profile, c.id);
    const reasons: string[] = [];

    if (currentMastery < 60) {
      reasons.push(`Current mastery is ${currentMastery}%, below the 60% proficiency threshold.`);
    } else if (currentMastery < 75) {
      reasons.push(`Mastery is developing at ${currentMastery}% and needs consolidation.`);
    } else {
      reasons.push(`Strong mastery (${currentMastery}%) ready for spaced challenge retention.`);
    }

    if (activeMiscCount > 0) {
      reasons.push(
        `Detected ${activeMiscCount} active misconception(s): "${conceptMiscs[0].title}".`
      );
    }

    if (recentIncorrect > 0) {
      reasons.push(
        `${recentIncorrect} incorrect attempt(s) logged across recent ${c.name} checkpoints.`
      );
    }

    if (preCheck.hasWeakPrerequisite) {
      reasons.push(
        `Depends on weak upstream prerequisite ${preCheck.recommendedConceptName}.`
      );
    }

    if (reasons.length < 2) {
      reasons.push(`Last studied ${daysSinceReview} day(s) ago—optimal spaced retrieval window.`);
    }

    const type: Recommendation['type'] =
      activeMiscCount > 0
        ? 'misconception_fix'
        : currentMastery < 55
        ? 'low_mastery'
        : currentMastery >= 80
        ? 'challenge'
        : 'spaced_revision';

    const priority: Recommendation['priority'] =
      currentMastery < 50 || activeMiscCount > 0
        ? 'high'
        : currentMastery < 75
        ? 'medium'
        : 'low';

    const suggestedAction =
      activeMiscCount > 0
        ? `Clear "${conceptMiscs[0].title}" with an adaptive explanation drill`
        : currentMastery < 55
        ? `Run a 2-minute targeted ${c.name} rebuild practice set`
        : currentMastery >= 80
        ? `Take the 5-question ${c.name} Mastery Badge verification challenge`
        : `Complete a spaced review session on ${c.name}`;

    return {
      id: `rec-${c.id}`,
      concept: c.name,
      conceptId: c.id,
      type,
      priority,
      reasons,
      supportingData: {
        currentMastery,
        recentIncorrectAnswers: recentIncorrect,
        activeMisconceptionsCount: activeMiscCount,
        daysSinceReview,
        confidenceAvg: masteryObj?.confidenceAverage,
      },
      suggestedAction,
      estimatedMinutes: priority === 'high' ? 8 : priority === 'medium' ? 6 : 5,
    };
  });

  const priorityRank = { high: 0, medium: 1, low: 2 };
  return items.sort((a, b) => {
    const pDiff = priorityRank[a.priority] - priorityRank[b.priority];
    if (pDiff !== 0) return pDiff;
    return a.supportingData.currentMastery - b.supportingData.currentMastery;
  });
}

/**
 * 7. Confidence vs Actual Knowledge Calibration Analyzer
 */
export function analyzeConfidenceCalibration(
  records: ConfidenceRecord[],
  masteryByConcept: Record<string, ConceptMastery>
): ConfidenceAnalysis {
  const overconfidenceInsights: string[] = [];
  const underconfidenceInsights: string[] = [];
  const wellCalibratedInsights: string[] = [];
  const conceptGaps: ConfidenceGapItem[] = [];

  let calibratedCount = 0;
  let overconfidentCount = 0;
  let underconfidentCount = 0;

  records.forEach((r) => {
    if (r.confidenceLevel === 'high' && !r.answerCorrect) {
      overconfidentCount += 1;
    } else if (r.confidenceLevel === 'low' && r.answerCorrect) {
      underconfidentCount += 1;
    } else {
      calibratedCount += 1;
    }
  });

  CONCEPTS.forEach((c) => {
    const mastery = masteryByConcept[c.id]?.masteryPercentage ?? 50;
    const conceptRecords = records.filter((r) => r.conceptId === c.id);
    const latest = conceptRecords[0];
    const conf: ConfidenceLevel =
      latest?.confidenceLevel || masteryByConcept[c.id]?.confidenceAverage || 'medium';

    const hasOverconfidentRec = conceptRecords.some(
      (r) => r.confidenceLevel === 'high' && (!r.answerCorrect || r.reasoningQuality === 'weak')
    );
    const hasUnderconfidentRec = conceptRecords.some(
      (r) => r.confidenceLevel === 'low' && r.answerCorrect
    );

    if (hasOverconfidentRec || (conf === 'high' && mastery < 55)) {
      const desc = `Reported HIGH confidence in ${c.name}, yet mastery sits at ${mastery}% with reasoning friction.`;
      overconfidenceInsights.push(desc);
      conceptGaps.push({
        conceptId: c.id,
        conceptName: c.name,
        gapType: 'overconfident',
        gapDescription: desc,
        mastery,
        confidenceReported: conf,
      });
    } else if (hasUnderconfidentRec || (conf === 'low' && mastery >= 65)) {
      const desc = `Reported LOW confidence in ${c.name}, despite strong ${mastery}% mastery and sound reasoning.`;
      underconfidenceInsights.push(desc);
      conceptGaps.push({
        conceptId: c.id,
        conceptName: c.name,
        gapType: 'underconfident',
        gapDescription: desc,
        mastery,
        confidenceReported: conf,
      });
    } else {
      const desc = `${c.name} shows well-aligned self-awareness (${mastery}% mastery, ${conf} confidence).`;
      wellCalibratedInsights.push(desc);
      conceptGaps.push({
        conceptId: c.id,
        conceptName: c.name,
        gapType: 'calibrated',
        gapDescription: desc,
        mastery,
        confidenceReported: conf,
      });
    }
  });

  const calibrationScore =
    records.length > 0
      ? Math.max(30, Math.min(98, Math.round((calibratedCount / records.length) * 100)))
      : 72;

  const pattern: ConfidenceAnalysis['pattern'] =
    overconfidentCount > underconfidentCount && overconfidentCount >= 2
      ? 'overconfident'
      : underconfidentCount > overconfidentCount && underconfidentCount >= 2
      ? 'underconfident'
      : calibrationScore >= 75
      ? 'well_calibrated'
      : 'mixed';

  const headline =
    pattern === 'overconfident'
      ? 'High certainty on tricky circuit traps is masking hidden misconceptions—narrate reasoning to verify!'
      : pattern === 'underconfident'
      ? 'You understand more physics than you give yourself credit for—trust your problem-solving intuition!'
      : pattern === 'well_calibrated'
      ? 'Your predicted confidence closely tracks your true exam readiness across syllabus topics.'
      : 'Strong self-awareness on Ohm’s Law paired with mild blindspots on multi-resistor circuits.';

  return {
    calibrationScore,
    pattern,
    headline,
    overconfidenceInsights,
    underconfidenceInsights,
    wellCalibratedInsights,
    conceptGaps,
  };
}

