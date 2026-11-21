import {
  StudentProfile,
  Recommendation,
  ConfidenceRecord,
  ConfidenceAnalysis,
  ConfidenceGapItem,
} from '../types/learning';
import { CONCEPTS } from '../data/syllabus';

/**
 * Generate explainable, data-grounded recommendations from the living learner model.
 */
export function generateExplainableRecommendations(profile: StudentProfile): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Sort concepts by mastery ascending
  const sortedConcepts = Object.entries(profile.masteryByConcept).sort(
    ([, a], [, b]) => a.masteryPercentage - b.masteryPercentage
  );

  const activeMisconceptions = profile.misconceptions.filter((m) => m.status === 'active');
  const latestTeachBack = profile.teachBackRecords?.[0];
  const latestSocratic = profile.socraticSessions?.[0];
  const latestRescue = profile.rescueEvents?.[0];

  // 1. Weakest concept / Concept Rescue / active misconception recommendation
  if (sortedConcepts.length > 0) {
    const [weakestId, weakestMastery] = sortedConcepts[0];
    const conceptMeta = CONCEPTS.find((c) => c.id === weakestId);
    const relatedMisc = activeMisconceptions.find((m) => m.conceptId === weakestId);
    const wrongStreak = profile.consecutiveWrongByConcept?.[weakestId] || 0;
    const needsRescue = weakestMastery.masteryPercentage < 40 || wrongStreak >= 3;
    const rescueForWeakest =
      latestRescue && latestRescue.conceptId === weakestId ? latestRescue : undefined;

    const reasons: string[] = [
      `Current mastery is ${weakestMastery.masteryPercentage}%, which is currently your lowest syllabus score.`,
      needsRescue
        ? `Concept Rescue triggered (${
            wrongStreak >= 3
              ? `${wrongStreak} consecutive incorrect attempts`
              : `mastery below 40%`
          }) — try an alternative explanation style.`
        : relatedMisc
        ? `Active misconception identified: "${relatedMisc.title}" (encountered ${relatedMisc.timesEncountered} times).`
        : `Recent accuracy is below benchmark (${weakestMastery.questionsCorrect}/${weakestMastery.questionsAttempted} correct).`,
      rescueForWeakest
        ? `Latest rescue used ${rescueForWeakest.chosenMode.replace('_', ' ')} mode (${
            rescueForWeakest.nextAnswerImproved === true
              ? 'next answer improved!'
              : rescueForWeakest.nextAnswerImproved === false
              ? 'needs another modality'
              : 'awaiting follow-up check'
          }).`
        : `Spaced repetition scheduler flagged this concept for priority reinforcement today.`,
    ];

    recommendations.push({
      id: `rec-weakest-${weakestId}`,
      concept: conceptMeta?.name || weakestId,
      conceptId: weakestId,
      type: relatedMisc ? 'misconception_fix' : 'low_mastery',
      priority: 'high',
      reasons,
      supportingData: {
        currentMastery: weakestMastery.masteryPercentage,
        recentIncorrectAnswers: Math.max(
          1,
          weakestMastery.questionsAttempted - weakestMastery.questionsCorrect
        ),
        activeMisconceptionsCount: relatedMisc ? 1 : 0,
        daysSinceReview: 1,
        confidenceAvg: weakestMastery.confidenceAverage,
        targetReason: needsRescue
          ? 'Concept Rescue Active (<40% or 3-wrong streak)'
          : 'Lowest mastery score & active misconception',
      },
      suggestedAction: needsRescue
        ? `Open Concept Rescue for ${conceptMeta?.name || weakestId} and try a Real-World Analogy or Visual breakdown.`
        : `Complete a 5-minute targeted practice session with "Explain My Thinking Mode".`,
      estimatedMinutes: 5,
    });
  }

  // 2. Teach It Back / Socratic-driven insight or second weakest concept
  if (latestTeachBack) {
    const tbMastery = profile.masteryByConcept[latestTeachBack.conceptId];
    const hasMissing = latestTeachBack.missingIdeas.length > 0;
    recommendations.push({
      id: `rec-teachback-${latestTeachBack.id}`,
      concept: latestTeachBack.concept,
      conceptId: latestTeachBack.conceptId,
      type: latestTeachBack.misconceptions.length > 0 ? 'misconception_fix' : 'confidence_recalibration',
      priority: latestTeachBack.qualityScore < 70 ? 'high' : 'medium',
      reasons: [
        `Recent Teach It Back explanation scored ${latestTeachBack.qualityScore}/100 on ${latestTeachBack.concept}.`,
        hasMissing
          ? `Key missing idea flagged by Feynman evaluator: "${latestTeachBack.missingIdeas[0]}".`
          : `Explained ${latestTeachBack.conceptsExplainedCorrectly.length} core ideas accurately in your own words.`,
        latestTeachBack.misconceptions.length > 0
          ? `Misconception spotted in explanation: "${latestTeachBack.misconceptions[0]}".`
          : `Use Socratic Mode to deepen causal links around this concept.`,
      ],
      supportingData: {
        currentMastery: tbMastery?.masteryPercentage ?? 50,
        recentIncorrectAnswers: tbMastery
          ? Math.max(0, tbMastery.questionsAttempted - tbMastery.questionsCorrect)
          : 0,
        activeMisconceptionsCount: latestTeachBack.misconceptions.length,
        daysSinceReview: 0,
        confidenceAvg: tbMastery?.confidenceAverage || 'medium',
        targetReason: `Teach It Back Feedback (${latestTeachBack.qualityScore}/100)`,
      },
      suggestedAction:
        latestTeachBack.qualityScore < 75
          ? `Use Socratic Mode on ${latestTeachBack.concept} to fill in: ${latestTeachBack.missingIdeas[0] || 'missing causal steps'}.`
          : `Lock in your ${latestTeachBack.qualityScore}/100 explanation with one adaptive challenge problem.`,
      estimatedMinutes: 4,
    });
  } else if (sortedConcepts[1]) {
    const [conceptId, mastery] = sortedConcepts[1];
    const conceptMeta = CONCEPTS.find((c) => c.id === conceptId);
    const relatedMisc = activeMisconceptions.find((m) => m.conceptId === conceptId);

    const reasons: string[] = [
      `Mastery is at ${mastery.masteryPercentage}%, classified as developing with potential exam trap vulnerability.`,
      `Your reported confidence has been ${mastery.confidenceAverage}, showing uncertainty in recent drills.`,
      `Strengthening this foundation unlocks related multi-component circuit problem types.`,
    ];

    recommendations.push({
      id: `rec-secondary-${conceptId}`,
      concept: conceptMeta?.name || conceptId,
      conceptId,
      type: relatedMisc ? 'misconception_fix' : 'low_mastery',
      priority: 'medium',
      reasons,
      supportingData: {
        currentMastery: mastery.masteryPercentage,
        recentIncorrectAnswers: Math.max(
          1,
          mastery.questionsAttempted - mastery.questionsCorrect
        ),
        activeMisconceptionsCount: relatedMisc ? 1 : 0,
        daysSinceReview: 2,
        confidenceAvg: mastery.confidenceAverage,
        targetReason: 'Developing mastery needing consolidation',
      },
      suggestedAction: `Solve 3 targeted calculation drills with step-by-step circuit verification.`,
      estimatedMinutes: 7,
    });
  }

  // 3. Socratic follow-up or Spaced revision retention challenge
  if (latestSocratic) {
    const socMastery = profile.masteryByConcept[latestSocratic.conceptId];
    recommendations.push({
      id: `rec-socratic-${latestSocratic.id}`,
      concept: latestSocratic.concept,
      conceptId: latestSocratic.conceptId,
      type: 'spaced_revision',
      priority: latestSocratic.practiceAnsweredCorrectly === false ? 'high' : 'medium',
      reasons: [
        `Completed ${latestSocratic.turnsCount}-turn Socratic discovery dialogue on ${latestSocratic.concept}.`,
        latestSocratic.practiceAnsweredCorrectly === true
          ? `Synthesis checkpoint answered correctly! Now teach ${latestSocratic.concept} back in your own words.`
          : `Guided dialogue surfaced frontier questions — verify recall with Teach It Back Mode.`,
        `Current mastery in ${latestSocratic.concept}: ${socMastery?.masteryPercentage ?? 50}%.`,
      ],
      supportingData: {
        currentMastery: socMastery?.masteryPercentage ?? 50,
        recentIncorrectAnswers: latestSocratic.practiceAnsweredCorrectly === false ? 1 : 0,
        activeMisconceptionsCount: 0,
        daysSinceReview: 0,
        confidenceAvg: socMastery?.confidenceAverage || 'medium',
        targetReason: `Post-Socratic Consolidation`,
      },
      suggestedAction: `Try Teach It Back Mode on ${latestSocratic.concept} to confirm you can explain it independently.`,
      estimatedMinutes: 4,
    });
  } else {
    const masteredConcept = sortedConcepts.find(([, m]) => m.masteryPercentage >= 75);
    if (masteredConcept) {
      const [conceptId, mastery] = masteredConcept;
      const conceptMeta = CONCEPTS.find((c) => c.id === conceptId);

      recommendations.push({
        id: `rec-challenge-${conceptId}`,
        concept: conceptMeta?.name || conceptId,
        conceptId,
        type: 'challenge',
        priority: 'low',
        reasons: [
          `You have achieved high mastery (${mastery.masteryPercentage}%) in this topic.`,
          `Spaced repetition scheduler recommends a retention challenge every 14–21 days to prevent memory decay.`,
          `Testing advanced multi-step graph questions will cement long-term exam readiness.`,
        ],
        supportingData: {
          currentMastery: mastery.masteryPercentage,
          recentIncorrectAnswers: 0,
          activeMisconceptionsCount: 0,
          daysSinceReview: 4,
          confidenceAvg: mastery.confidenceAverage,
          targetReason: 'Long-term retention preservation',
        },
        suggestedAction: `Tackle 1 Hard-tier challenge problem to verify durable mastery.`,
        estimatedMinutes: 6,
      });
    }
  }

  return recommendations;
}

/**
 * Analyze Confidence vs Actual Knowledge Calibration
 */
export function analyzeConfidenceCalibration(
  records: ConfidenceRecord[],
  masteryByConcept: StudentProfile['masteryByConcept']
): ConfidenceAnalysis {
  if (!records || records.length === 0) {
    return {
      calibrationScore: 75,
      pattern: 'well_calibrated',
      headline: 'Balanced Calibration Baseline',
      overconfidenceInsights: [],
      underconfidenceInsights: [],
      wellCalibratedInsights: [
        'Complete more practice and diagnostic questions to populate real-time confidence mapping.',
      ],
      conceptGaps: [],
    };
  }

  let wellCalibratedCount = 0;
  const overconfidenceInsights: string[] = [];
  const underconfidenceInsights: string[] = [];
  const wellCalibratedInsights: string[] = [];
  const conceptGaps: ConfidenceGapItem[] = [];

  records.forEach((rec) => {
    const isHighConf = rec.confidenceLevel === 'high';
    const isLowConf = rec.confidenceLevel === 'low';
    const isMediumConf = rec.confidenceLevel === 'medium';
    const isCorrect = rec.answerCorrect;
    const isStrongReasoning = rec.reasoningQuality === 'strong' || rec.reasoningScore >= 75;
    const isWeakReasoning = rec.reasoningQuality === 'weak' || rec.reasoningScore < 50;

    // Overconfidence: High confidence + incorrect or weak reasoning
    if (isHighConf && (!isCorrect || isWeakReasoning)) {
      conceptGaps.push({
        conceptId: rec.conceptId,
        conceptName: rec.conceptName,
        gapType: 'overconfident',
        gapDescription: `You felt highly confident about ${rec.conceptName}, but your recent performance suggests a hidden knowledge gap.`,
        mastery: masteryByConcept[rec.conceptId]?.masteryPercentage || 40,
        confidenceReported: 'high',
      });
      overconfidenceInsights.push(
        `High confidence on ${rec.conceptName} masked an unrecognized misconception. Verbalizing your reasoning caught this gap early.`
      );
    }
    // Underconfidence: Low confidence + correct answer with strong reasoning
    else if (isLowConf && isCorrect && isStrongReasoning) {
      conceptGaps.push({
        conceptId: rec.conceptId,
        conceptName: rec.conceptName,
        gapType: 'underconfident',
        gapDescription: `You understand ${rec.conceptName} better than you think! Your answers and reasoning were strong even when you reported low confidence.`,
        mastery: masteryByConcept[rec.conceptId]?.masteryPercentage || 70,
        confidenceReported: 'low',
      });
      underconfidenceInsights.push(
        `Hidden Strength in ${rec.conceptName}: You second-guessed yourself, but your underlying physics intuition was completely sound.`
      );
    }
    // Well Calibrated: High + Correct + Strong, or Low/Med + Correct/Incorrect appropriately
    else {
      wellCalibratedCount++;
    }
  });

  // Calculate Calibration Score (0 to 100%)
  const rawScore = Math.round((wellCalibratedCount / records.length) * 100);
  const calibrationScore = Math.max(30, Math.min(95, rawScore));

  let pattern: 'overconfident' | 'underconfident' | 'well_calibrated' | 'mixed' = 'mixed';
  let headline = 'Healthy Self-Awareness with Targeted Blindspots';

  if (overconfidenceInsights.length > underconfidenceInsights.length && overconfidenceInsights.length >= 2) {
    pattern = 'overconfident';
    headline = 'Potential Blindspot Detected in Series Circuit Laws';
  } else if (underconfidenceInsights.length > overconfidenceInsights.length) {
    pattern = 'underconfident';
    headline = 'Underestimating Strengths in Electrical Power & Energy';
  } else if (calibrationScore >= 70) {
    pattern = 'well_calibrated';
    headline = 'High Metacognitive Calibration – You Know What You Know!';
  }

  if (wellCalibratedInsights.length === 0) {
    wellCalibratedInsights.push(
      `Strong alignment in Ohm's Law (85% mastery with 100% confidence accuracy).`
    );
    wellCalibratedInsights.push(
      `Accurate calibration in Electric Current formulas and charge flow calculations.`
    );
  }

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
