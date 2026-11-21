import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: !!ai,
    model: 'gemini-4-hydrogen',
    platform: 'LearnFlow AI 2.0 Server',
    syllabus: 'Class 10 Physics – Electricity',
  });
});

// Demo Users database
const DEMO_USERS = [
  {
    id: 'student-alex-01',
    name: 'Alex Rivera',
    email: 'alex.rivera@learnflow.ai',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Class 10 Physics Scholar',
    classSection: 'Class 10 - Section B',
  },
  {
    id: 'teacher-priya-01',
    name: 'Dr. Priya Sharma',
    email: 'dr.priya.sharma@learnflow.ai',
    role: 'teacher',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    title: 'Senior Physics Faculty & Head of Science',
    department: 'Department of Physical Sciences',
    classSection: 'Class 10 - Section B (Physics)',
  },
];

// Authentication: Get available accounts
app.get('/api/auth/users', (req: Request, res: Response) => {
  res.json({ users: DEMO_USERS });
});

// Authentication: Login endpoint
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { role, customName, userId } = req.body;

  let selectedUser = DEMO_USERS.find((u) => (userId ? u.id === userId : u.role === role));

  if (!selectedUser) {
    selectedUser = role === 'teacher' ? DEMO_USERS[1] : DEMO_USERS[0];
  }

  // If user provided a custom name
  const finalUser = customName
    ? {
        ...selectedUser,
        name: customName,
        id: `user-${Date.now()}`,
      }
    : selectedUser;

  const sessionToken = `lf_token_${Buffer.from(finalUser.id + ':' + Date.now()).toString('base64')}`;

  res.json({
    success: true,
    user: finalUser,
    token: sessionToken,
    permissions:
      finalUser.role === 'teacher'
        ? ['view:cohort_analytics', 'manage:remedies', 'view:student_roster']
        : ['practice:adaptive', 'use:wispr_voice', 'take:diagnostic', 'view:learner_model'],
  });
});

// 1. Voice Intelligence Agent
// Processes spoken natural language with filler words, incomplete sentences, digressions, and self-corrections
app.post('/api/voice-process', async (req: Request, res: Response) => {
  const { rawSpeech, studentName = 'Alex' } = req.body;

  if (!rawSpeech || typeof rawSpeech !== 'string') {
    return res.status(400).json({ error: 'rawSpeech is required' });
  }

  // Fallback heuristic extraction if Gemini is not available or errors
  const fallbackExtract = () => {
    const lower = rawSpeech.toLowerCase();
    let concept = 'Series Circuits';
    let conceptId = 'series-circuits';
    let intent: 'clarify_doubt' | 'explain_concept' | 'request_practice' | 'diagnose_error' | 'express_confusion' = 'clarify_doubt';
    let detectedMisconception: string | null = null;

    if (lower.includes('ohm') || lower.includes('v = ir') || lower.includes('volts') && lower.includes('resistance')) {
      concept = "Ohm's Law";
      conceptId = 'ohms-law';
    } else if (lower.includes('parallel') || lower.includes('branch')) {
      concept = 'Parallel Circuits';
      conceptId = 'parallel-circuits';
    } else if (lower.includes('power') || lower.includes('watt') || lower.includes('kwh') || lower.includes('heat') || lower.includes('joule')) {
      concept = 'Electrical Power & Energy';
      conceptId = 'electrical-power';
    } else if (lower.includes('current') && (lower.includes('used up') || lower.includes('eat') || lower.includes('first bulb') || lower.includes('smaller'))) {
      concept = 'Series Circuits';
      conceptId = 'series-circuits';
      detectedMisconception = 'Believing current is consumed or decreases along resistors in series.';
    } else if (lower.includes('resist') || lower.includes('length') || lower.includes('area') || lower.includes('wire')) {
      concept = 'Resistance & Factors';
      conceptId = 'resistance';
    } else if (lower.includes('potential') || lower.includes('voltage')) {
      concept = 'Voltage & Potential Difference';
      conceptId = 'voltage';
    } else if (lower.includes('charge') || lower.includes('ampere') || lower.includes('current')) {
      concept = 'Electric Current';
      conceptId = 'electric-current';
    }

    if (lower.includes('practice') || lower.includes('question') || lower.includes('give me')) {
      intent = 'request_practice';
    } else if (lower.includes('confus') || lower.includes('don\'t get') || lower.includes('lost')) {
      intent = 'express_confusion';
    }

    // Strip common filler words
    const cleaned = rawSpeech
      .replace(/\b(um|uh|er|ah|like|you know|so like|basically|sort of|kind of|i guess|wait no|i mean)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      cleanedTranscript: cleaned || rawSpeech,
      rawSpeech,
      subject: 'Physics',
      topic: 'Class 10 Electricity',
      concept,
      conceptId,
      studentIntent: intent,
      confidenceLevel: lower.includes('not sure') || lower.includes('confused') ? 'low' : 'medium',
      detectedMisconception: detectedMisconception || (lower.includes('more volts') ? 'Assuming higher resistance increases battery voltage' : null),
      recommendedNextAction: `Review key principles of ${concept} and solve a 2-minute visual checkpoint problem.`,
      agentReasoning: `Voice Intelligence Agent parsed spoken acoustic tokens, filtered verbal hesitation markers ('um', 'like'), and mapped inquiry tokens to ${concept}.`,
      educationalResponse: `That is an excellent question! In ${concept}, it is very common to wonder about this. Remember that electric charges flow continuously without piling up or being destroyed. In a series loop, current is uniform everywhere. Let's look at a quick ammeter diagram to solidify this!`,
    };
  };

  if (!ai) {
    return res.json(fallbackExtract());
  }

  try {
    const prompt = `You are the Voice Intelligence Agent for "LearnFlow AI", an adaptive exam-prep tutor for Class 10 Physics (Electricity).
A student named ${studentName} just spoke naturally into their microphone using Wispr Flow.
Spoken Natural Speech:
"${rawSpeech}"

Analyze this natural speech (which may include filler words like "um", "uh", "like", self-corrections, and incomplete phrasing).
Provide a structured JSON output with:
1. cleanedTranscript: Clean, coherent version of what the student is expressing.
2. subject: "Physics"
3. topic: "Electricity"
4. concept: The exact Class 10 Physics concept (e.g., "Series Circuits", "Parallel Circuits", "Ohm's Law", "Electric Current", "Voltage & Potential Difference", "Resistance & Factors", "Electrical Power & Energy").
5. conceptId: kebab-case id ("series-circuits", "parallel-circuits", "ohms-law", "electric-current", "voltage", "resistance", "electrical-power").
6. studentIntent: one of "clarify_doubt", "explain_concept", "request_practice", "diagnose_error", "express_confusion".
7. confidenceLevel: "low", "medium", or "high".
8. detectedMisconception: A clear description of any physics misconception detected in their reasoning, or null if none.
9. recommendedNextAction: An actionable learning step for the student.
10. agentReasoning: A transparent 1-2 sentence explanation of how the Voice Intelligence Agent processed the speech tokens and identified the core need.
11. educationalResponse: A warm, encouraging, pedagogically sound 2-3 sentence explanation directly resolving their confusion.`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cleanedTranscript: { type: Type.STRING },
            subject: { type: Type.STRING },
            topic: { type: Type.STRING },
            concept: { type: Type.STRING },
            conceptId: { type: Type.STRING },
            studentIntent: {
              type: Type.STRING,
              enum: ['clarify_doubt', 'explain_concept', 'request_practice', 'diagnose_error', 'express_confusion'],
            },
            confidenceLevel: {
              type: Type.STRING,
              enum: ['low', 'medium', 'high'],
            },
            detectedMisconception: { type: Type.STRING, nullable: true },
            recommendedNextAction: { type: Type.STRING },
            agentReasoning: { type: Type.STRING },
            educationalResponse: { type: Type.STRING },
          },
          required: [
            'cleanedTranscript',
            'subject',
            'topic',
            'concept',
            'conceptId',
            'studentIntent',
            'confidenceLevel',
            'recommendedNextAction',
            'agentReasoning',
            'educationalResponse',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      rawSpeech,
      ...parsed,
    });
  } catch (err) {
    console.warn('Gemini voice processing error, falling back to rule engine:', err);
    return res.json(fallbackExtract());
  }
});

// 2. Misconception Detection Agent ("Explain My Thinking Mode")
// Evaluates student reasoning behind an answer
app.post('/api/evaluate-reasoning', async (req: Request, res: Response) => {
  const {
    questionText,
    selectedOptionText,
    correctOptionText,
    isCorrect,
    studentReasoning: rawStudentReasoning,
    spokenReasoning,
    conceptName = 'Electricity',
    confidence = 'medium',
  } = req.body;
  const studentReasoning = rawStudentReasoning || spokenReasoning || '';

  const fallbackReasoning = () => {
    const text = (studentReasoning || '').toLowerCase();
    const isActuallyCorrect = !!isCorrect;

    let misconception = null;
    let errorType: 'none' | 'conceptual_misconception' | 'calculation_mistake' | 'incomplete_explanation' = isActuallyCorrect ? 'none' : 'incomplete_explanation';
    let flawedAssumptions: string[] = [];
    let correctConceptsUsed: string[] = ['Understands basic circuit connection'];
    let missingKnowledge: string[] = [];
    let delta = isActuallyCorrect ? (confidence === 'high' ? 12 : 6) : -6;
    let conceptualAccuracy = isActuallyCorrect ? 88 : 42;
    let causalLogic = isActuallyCorrect ? 85 : 40;
    let formulaApplication = isActuallyCorrect ? 86 : 45;

    if (
      text.includes('eat') ||
      text.includes('used up') ||
      text.includes('uses up') ||
      text.includes('consum') ||
      text.includes('gets less') ||
      text.includes('smaller current') ||
      text.includes('first resistor gets more')
    ) {
      errorType = 'conceptual_misconception';
      misconception = {
        title: 'Current Gets Used Up by a Resistor',
        description: 'Believing electric current is consumed or depleted along the circuit path.',
        howToCorrect: 'Recall that in a single loop, rate of charge flow (Amperes) must be equal at every point due to conservation of charge.',
        severity: 'high' as const,
      };
      flawedAssumptions.push('Resistors use up current rather than limiting the total flow rate');
      missingKnowledge.push('Law of conservation of electric charge in closed loops');
      conceptualAccuracy = 25;
      causalLogic = 30;
      delta = -10;
    } else if (
      text.includes('parallel add') ||
      text.includes('resistors in parallel add') ||
      text.includes('increases total resistance') ||
      text.includes('20 ohm')
    ) {
      errorType = 'conceptual_misconception';
      misconception = {
        title: 'Parallel Resistors Add Up Directly',
        description: 'Adding parallel branch resistances directly (R1 + R2) instead of reciprocals (1/R1 + 1/R2).',
        howToCorrect: 'Adding parallel branches opens extra pathways for charge, so total resistance decreases: 1/Rp = 1/R1 + 1/R2.',
        severity: 'high' as const,
      };
      flawedAssumptions.push('Applied series resistance formula R1 + R2 to a parallel network');
      missingKnowledge.push('Reciprocal resistance law for parallel branches');
      conceptualAccuracy = 28;
      causalLogic = 32;
      delta = -10;
    } else if (
      text.includes('voltage splits') ||
      text.includes('voltage divides') ||
      text.includes('used up in parallel')
    ) {
      errorType = 'conceptual_misconception';
      misconception = {
        title: 'Voltage Divides Across Parallel Branches',
        description: 'Assuming battery voltage splits between parallel branches.',
        howToCorrect: 'Every parallel branch connects directly across the same source terminals, receiving full supply voltage while current splits.',
        severity: 'medium' as const,
      };
      flawedAssumptions.push('Treated parallel potential difference as divided like a series loop');
      missingKnowledge.push('Parallel branches share identical potential difference');
      conceptualAccuracy = 32;
      causalLogic = 36;
      delta = -8;
    } else if (
      (text.includes('current increases') && text.includes('resistance increases')) ||
      text.includes('directly proportional')
    ) {
      errorType = 'conceptual_misconception';
      misconception = {
        title: "Ohm's Law Inverse Proportionality Misconception",
        description: 'The relationship between current and resistance at constant voltage is misunderstood (believing current increases with resistance).',
        howToCorrect: 'At constant voltage (V), current is inversely proportional to resistance (I = V/R): when resistance increases, current decreases.',
        severity: 'high' as const,
      };
      flawedAssumptions.push('Assumed I and R increase together instead of I = V/R inverse proportionality');
      missingKnowledge.push("Inverse relationship I ∝ 1/R at constant potential difference");
      conceptualAccuracy = 28;
      causalLogic = 32;
      formulaApplication = 45;
      delta = -10;
    } else if (text.includes('resistance increases voltage') || text.includes('more resistance makes more volts')) {
      errorType = 'conceptual_misconception';
      misconception = {
        title: 'V=IR Causality Inversion',
        description: 'Assuming increasing component resistance increases supply voltage.',
        howToCorrect: 'Battery voltage is constant; increasing resistance forces the current to decrease (I = V/R).',
        severity: 'medium' as const,
      };
      flawedAssumptions.push('Voltage depends on resistor value rather than battery supply');
      conceptualAccuracy = 35;
      causalLogic = 35;
      delta = -8;
    } else if (
      !isActuallyCorrect &&
      (text.includes('divided') || text.includes('arithmetic') || text.includes('miscalculat') || (text.includes('i = v/r') && text.match(/\d/)))
    ) {
      errorType = 'calculation_mistake';
      correctConceptsUsed = ['Selected the right physical formula (V = IR)', 'Correctly identified variable relationships'];
      flawedAssumptions = ['Minor arithmetic or unit substitution slip during calculation'];
      conceptualAccuracy = 82;
      causalLogic = 78;
      formulaApplication = 48;
      delta = -3;
    }

    const reasoningScore = isActuallyCorrect
      ? misconception
        ? 45
        : 90
      : errorType === 'calculation_mistake'
      ? 68
      : 32;

    const LIBRARY_MATCHERS: { id: string; conceptId: string; keywords: string[] }[] = [
      { id: 'lib-1', conceptId: 'series-circuits', keywords: ['used up', 'uses up', 'eat', 'consum', 'gets less', 'first resistor gets more', 'smaller current'] },
      { id: 'lib-2', conceptId: 'parallel-circuits', keywords: ['parallel add', 'resistors in parallel add', 'increases total resistance', '20 ohm'] },
      { id: 'lib-3', conceptId: 'voltage', keywords: ['voltage flows', 'volts flow', 'voltmeter in series'] },
      { id: 'lib-4', conceptId: 'ohms-law', keywords: ['current increases', 'resistance increases current', 'directly proportional'] },
      { id: 'lib-5', conceptId: 'ohms-law', keywords: ['resistance increases voltage', 'more resistance makes more volts', 'battery gives more volts'] },
      { id: 'lib-6', conceptId: 'parallel-circuits', keywords: ['voltage splits', 'voltage divides', 'used up in parallel', '6v'] },
      { id: 'lib-7', conceptId: 'series-circuits', keywords: ['other bulbs stay on', 'first bulb stays lit'] },
      { id: 'lib-8', conceptId: 'resistance', keywords: ['thicker wire', 'area increases resistance'] },
      { id: 'lib-9', conceptId: 'resistance', keywords: ['double length', '40 ohm', 'area unchanged'] },
      { id: 'lib-10', conceptId: 'electrical-power', keywords: ['always brighter', 'high resistance always'] },
      { id: 'lib-11', conceptId: 'electrical-power', keywords: ['watt is energy', 'kwh is power', '60000 kwh'] },
      { id: 'lib-12', conceptId: 'electric-current', keywords: ['60 a', 'divided by 5 minutes'] },
    ];

    const matchLibraryId = (text: string): string | undefined => {
      const lower = (text || '').toLowerCase();
      for (const entry of LIBRARY_MATCHERS) {
        if (entry.keywords.some((kw) => lower.includes(kw))) {
          return entry.id;
        }
      }
      return undefined;
    };

    const matchedLibId = misconception ? matchLibraryId(`${studentReasoning || ''} ${misconception.title || ''}`) : undefined;

    return {
      isCorrect: isActuallyCorrect,
      reasoningScore,
      errorType,
      rubricScores: {
        conceptualAccuracy,
        causalLogic,
        formulaApplication,
      },
      correctConceptsUsed,
      flawedAssumptions,
      missingKnowledge,
      detectedMisconception: misconception
        ? { ...misconception, libraryEntryId: matchedLibId }
        : null,
      supportiveFeedback: isActuallyCorrect
        ? 'Great job selecting the right answer! Your intuition and physics reasoning are aligned. Keep practicing higher-tier problems to lock in mastery.'
        : errorType === 'calculation_mistake'
        ? 'Your conceptual understanding and formula choice are actually solid—this looks like a minor calculation slip rather than a misconception! Double-check your arithmetic step.'
        : 'You are close! It is very common to think this way. Notice how the physical law constrains the direction of change. Let\'s revisit the core relationship with a targeted step-by-step checkpoint.',
      masteryDelta: delta,
      recommendedConcept: conceptName,
      recommendedDifficulty: isActuallyCorrect ? 'hard' : errorType === 'calculation_mistake' ? 'medium' : 'easy',
    };
  };

  if (!ai) {
    return res.json(fallbackReasoning());
  }

  try {
    const prompt = `You are the Misconception Detection Agent for "LearnFlow AI 2.0" (Class 10 Physics - Electricity).
Question: "${questionText}"
Student Selected: "${selectedOptionText}"
Correct Answer: "${correctOptionText}"
Did Student Get It Correct: ${isCorrect ? 'YES' : 'NO'}
Student's Stated Verbal Reasoning: "${studentReasoning || 'No verbal explanation provided'}"
Student Self-Reported Confidence: "${confidence}"

Evaluate the student's reasoning using a structured 3-part rubric:
- conceptualAccuracy (0-100): Does the student grasp the core physical law?
- causalLogic (0-100): Are cause-and-effect relationships sound?
- formulaApplication (0-100): Did they apply equations/units/arithmetic accurately?

CRITICAL RUBRIC DISTINCTION:
Distinguish strictly between:
- "none": Answer and reasoning are sound.
- "conceptual_misconception": Student holds a false mental model (e.g. believing current is consumed in series, thinking current increases when resistance increases at constant V, or thinking parallel resistors increase total R).
- "calculation_mistake": Student applied the right physics concept/formula (e.g. I = V/R) but made an arithmetic/unit conversion error. Do NOT flag a conceptual misconception for a simple math slip!
- "incomplete_explanation": Answer is wrong or reasoning is too brief/vague to confirm mastery.

Compute a mastery delta (-12 to +15) based on correctness, errorType, and reasoning depth (calculation_mistake gets a gentle -3 penalty, conceptual_misconception gets -8 to -12).`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isCorrect: { type: Type.BOOLEAN },
              reasoningScore: { type: Type.NUMBER, description: '0 to 100 score of reasoning depth' },
              errorType: {
                type: Type.STRING,
                enum: ['none', 'conceptual_misconception', 'calculation_mistake', 'incomplete_explanation'],
              },
              rubricScores: {
                type: Type.OBJECT,
                properties: {
                  conceptualAccuracy: { type: Type.NUMBER },
                  causalLogic: { type: Type.NUMBER },
                  formulaApplication: { type: Type.NUMBER },
                },
                required: ['conceptualAccuracy', 'causalLogic', 'formulaApplication'],
              },
              correctConceptsUsed: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              flawedAssumptions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              missingKnowledge: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              detectedMisconception: {
                type: Type.OBJECT,
                nullable: true,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  howToCorrect: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
                },
              },
              supportiveFeedback: { type: Type.STRING },
              masteryDelta: { type: Type.NUMBER },
              recommendedConcept: { type: Type.STRING },
              recommendedDifficulty: { type: Type.STRING, enum: ['easy', 'medium', 'hard'] },
            },
            required: [
              'isCorrect',
              'reasoningScore',
              'errorType',
              'rubricScores',
              'correctConceptsUsed',
              'flawedAssumptions',
              'missingKnowledge',
              'supportiveFeedback',
              'masteryDelta',
              'recommendedConcept',
              'recommendedDifficulty',
            ],
          },
        },
      }),
      8000
    );

    const parsed = JSON.parse(response.text || '{}');
    if (parsed?.detectedMisconception) {
      const combined = `${studentReasoning || ''} ${parsed.detectedMisconception.title || ''} ${parsed.detectedMisconception.description || ''}`.toLowerCase();
      if (combined.includes('used up') || combined.includes('consum')) parsed.detectedMisconception.libraryEntryId = 'lib-1';
      else if (combined.includes('parallel') && combined.includes('add')) parsed.detectedMisconception.libraryEntryId = 'lib-2';
      else if (combined.includes('voltage') && combined.includes('flow')) parsed.detectedMisconception.libraryEntryId = 'lib-3';
      else if (combined.includes('current increases') && combined.includes('resistance')) parsed.detectedMisconception.libraryEntryId = 'lib-4';
      else if (combined.includes('battery') || combined.includes('source voltage')) parsed.detectedMisconception.libraryEntryId = 'lib-5';
      else if (combined.includes('parallel') && (combined.includes('divide') || combined.includes('split'))) parsed.detectedMisconception.libraryEntryId = 'lib-6';
      else if (combined.includes('stretch')) parsed.detectedMisconception.libraryEntryId = 'lib-9';
    }
    return res.json(parsed);
  } catch (err) {
    console.warn('Gemini reasoning evaluation error, using fallback:', err);
    return res.json(fallbackReasoning());
  }
});

// Shared Fallback Question Bank across Adaptive Practice, Socratic Mode, and Concept Rescue
const FALLBACK_QUESTIONS_BY_CONCEPT: Record<string, any> = {
  'electric-current': {
    id: 'gen-curr-fallback',
    conceptId: 'electric-current',
    conceptName: 'Electric Current',
    difficulty: 'medium',
    questionText: 'If 24 Coulombs of electric charge flow past a cross-section of a copper wire in 8 seconds, what is the electric current flowing through the wire?',
    options: [
      { id: 'opt-a', text: '3.0 A' },
      { id: 'opt-b', text: '192 A' },
      { id: 'opt-c', text: '0.33 A' },
      { id: 'opt-d', text: '16 A' },
    ],
    correctOptionId: 'opt-a',
    explanation: 'Electric current I = Q / t = 24 C / 8 s = 3.0 A.',
    keyTakeaway: 'Current measures the rate of charge flow per second: I = Q / t.',
  },
  voltage: {
    id: 'gen-volt-fallback',
    conceptId: 'voltage',
    conceptName: 'Voltage & Potential Difference',
    difficulty: 'medium',
    questionText: 'How much work is done in moving a charge of 4 C across two points having a potential difference of 12 V?',
    options: [
      { id: 'opt-a', text: '48 J' },
      { id: 'opt-b', text: '3 J' },
      { id: 'opt-c', text: '0.33 J' },
      { id: 'opt-d', text: '16 J' },
    ],
    correctOptionId: 'opt-a',
    explanation: 'Potential difference V = W / Q, therefore Work done W = V × Q = 12 V × 4 C = 48 Joules.',
    keyTakeaway: 'Voltage is energy transferred per unit charge: W = V × Q.',
  },
  resistance: {
    id: 'gen-res-fallback',
    conceptId: 'resistance',
    conceptName: 'Resistance & Factors',
    difficulty: 'medium',
    questionText: 'A nichrome wire of resistance 10 Ω is stretched uniformly so its length doubles while its cross-sectional area halves. What is its new resistance?',
    options: [
      { id: 'opt-a', text: '40 Ω' },
      { id: 'opt-b', text: '20 Ω' },
      { id: 'opt-c', text: '5 Ω' },
      { id: 'opt-d', text: '10 Ω' },
    ],
    correctOptionId: 'opt-a',
    explanation: 'Since R = ρL/A, doubling L (×2) and halving A (÷0.5) multiplies resistance by 2 / 0.5 = 4, giving 4 × 10 Ω = 40 Ω.',
    keyTakeaway: 'Resistance scales directly with length and inversely with cross-sectional area.',
  },
  'ohms-law': {
    id: 'gen-ohm-fallback',
    conceptId: 'ohms-law',
    conceptName: "Ohm's Law",
    difficulty: 'medium',
    questionText: 'A circuit connected to a constant 12 V battery initially has a 4 Ω resistor. If the resistor is replaced with an 8 Ω resistor while voltage remains constant, what happens to the current?',
    options: [
      { id: 'opt-a', text: 'Current halves from 3 A to 1.5 A' },
      { id: 'opt-b', text: 'Current doubles from 3 A to 6 A' },
      { id: 'opt-c', text: 'Current stays 3 A while battery voltage doubles to 24 V' },
      { id: 'opt-d', text: 'Current drops to zero' },
    ],
    correctOptionId: 'opt-a',
    explanation: 'At constant voltage (12 V), current is inversely proportional to resistance (I = V/R). Changing R from 4 Ω to 8 Ω changes current from 12/4 = 3 A to 12/8 = 1.5 A.',
    keyTakeaway: 'At constant voltage, increasing resistance always decreases current (I ∝ 1/R).',
  },
  'series-circuits': {
    id: 'gen-series-fallback',
    conceptId: 'series-circuits',
    conceptName: 'Series Circuits',
    difficulty: 'medium',
    questionText: 'In a series circuit consisting of a 9V battery and three identical 3Ω resistors labeled R1, R2, and R3 in sequence, what is the current passing through R3?',
    options: [
      { id: 'opt-a', text: '1.0 A' },
      { id: 'opt-b', text: '0.33 A' },
      { id: 'opt-c', text: '3.0 A' },
      { id: 'opt-d', text: '0 A (current was used up)' },
    ],
    correctOptionId: 'opt-a',
    explanation: 'Total series resistance is Rs = 3 + 3 + 3 = 9Ω. Total current I = V / Rs = 9V / 9Ω = 1.0A. Since charges have only a single path, current through R3 is exactly 1.0A.',
    keyTakeaway: 'Current does not deplete; it remains constant across all elements in series.',
  },
  'parallel-circuits': {
    id: 'gen-parallel-fallback',
    conceptId: 'parallel-circuits',
    conceptName: 'Parallel Circuits',
    difficulty: 'medium',
    questionText: 'A 6V battery is connected across two parallel branches with 6Ω and 12Ω resistors. What is the total current drawn from the battery?',
    options: [
      { id: 'opt-a', text: '1.5 A' },
      { id: 'opt-b', text: '0.33 A' },
      { id: 'opt-c', text: '3.0 A' },
      { id: 'opt-d', text: '0.75 A' },
    ],
    correctOptionId: 'opt-a',
    explanation: 'Current in branch 1 is I1 = 6V / 6Ω = 1.0A. Current in branch 2 is I2 = 6V / 12Ω = 0.5A. Total current I_total = 1.0A + 0.5A = 1.5A.',
    keyTakeaway: 'Total current in parallel equals the sum of branch currents, while voltage across branches is identical.',
  },
  'electrical-power': {
    id: 'gen-power-fallback',
    conceptId: 'electrical-power',
    conceptName: 'Electrical Power & Energy',
    difficulty: 'medium',
    questionText: 'An electric heater rated 1000 W operates on a 220 V supply for 3 hours a day. How much electrical energy does it consume in 1 day in commercial kWh units?',
    options: [
      { id: 'opt-a', text: '3.0 kWh' },
      { id: 'opt-b', text: '3000 kWh' },
      { id: 'opt-c', text: '0.33 kWh' },
      { id: 'opt-d', text: '660 kWh' },
    ],
    correctOptionId: 'opt-a',
    explanation: '1000 W = 1 kW. Energy consumed E = Power (kW) × Time (h) = 1 kW × 3 h = 3.0 kWh.',
    keyTakeaway: '1 Unit = 1 kWh = Power in kilowatts × Time in hours.',
  },
};

// 3. Adaptive Question Generator Agent
app.post('/api/generate-question', async (req: Request, res: Response) => {
  const {
    conceptId = 'series-circuits',
    conceptName = 'Series Circuits',
    difficulty = 'medium',
    targetMisconception,
  } = req.body;

  const getFallbackQuestion = () => {
    const base = FALLBACK_QUESTIONS_BY_CONCEPT[conceptId] || FALLBACK_QUESTIONS_BY_CONCEPT['series-circuits'];
    return {
      ...base,
      id: `gen-${conceptId}-${Date.now()}`,
      difficulty,
    };
  };

  if (!ai) {
    return res.json(getFallbackQuestion());
  }

  try {
    const prompt = `You are the Adaptive Learning Agent for LearnFlow AI 2.0.
Generate a targeted, high quality multiple-choice question for Class 10 Physics.
Concept: ${conceptName} (conceptId: ${conceptId})
Difficulty: ${difficulty} (${difficulty === 'easy' ? 'basic definition or single-step recall' : difficulty === 'medium' ? 'numerical formula application' : 'multi-step conceptual challenge'})
Target Misconception to diagnose: ${targetMisconception || 'General conceptual understanding and formula application'}

Ensure:
- 4 clear options (opt-a, opt-b, opt-c, opt-d)
- At least one option is a specific misconception trap
- Include clear explanation and key takeaway.`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            conceptId: { type: Type.STRING },
            conceptName: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ['easy', 'medium', 'hard'] },
            questionText: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING },
                },
                required: ['id', 'text'],
              },
            },
            correctOptionId: { type: Type.STRING },
            explanation: { type: Type.STRING },
            keyTakeaway: { type: Type.STRING },
          },
          required: [
            'id',
            'conceptId',
            'conceptName',
            'difficulty',
            'questionText',
            'options',
            'correctOptionId',
            'explanation',
            'keyTakeaway',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err) {
    console.warn('Gemini question generation error, using fallback:', err);
    return res.json(getFallbackQuestion());
  }
});

// Helper: Race a promise against a clean timeout so UI never hangs
function withTimeout<T>(promise: Promise<T>, ms = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`AI request timed out after ${ms}ms`)), ms)
    ),
  ]);
}

// Helper: Validate Teach It Back JSON shape
function isValidTeachBackShape(obj: any): boolean {
  return (
    obj &&
    typeof obj === 'object' &&
    Array.isArray(obj.conceptsExplainedCorrectly) &&
    Array.isArray(obj.missingIdeas) &&
    Array.isArray(obj.misconceptions) &&
    typeof obj.qualityScore === 'number' &&
    !Number.isNaN(obj.qualityScore) &&
    typeof obj.feedbackSummary === 'string' &&
    obj.feedbackSummary.trim().length > 0
  );
}

// 4. Teach It Back Mode Endpoint
app.post('/api/teach-back', async (req: Request, res: Response) => {
  const {
    conceptId = 'series-circuits',
    conceptName = 'Series Circuits',
    transcript,
    currentMastery = 50,
  } = req.body;

  if (!transcript || typeof transcript !== 'string' || transcript.trim().length < 5) {
    return res.status(400).json({ error: 'Please share a spoken or written explanation before submitting.' });
  }

  const computeDelta = (score: number) => {
    if (score >= 85) return 10;
    if (score >= 70) return 6;
    if (score >= 50) return 2;
    return -4;
  };

  const fallbackTeachBack = (notice?: string) => {
    const lower = transcript.toLowerCase();
    const explained: string[] = [];
    const missing: string[] = [];
    const misconceptions: string[] = [];

    const conceptRubrics: Record<
      string,
      { ideaKeywords: string[][]; coreIdeas: string[]; trapPhrases: { match: string[]; label: string }[] }
    > = {
      'series-circuits': {
        ideaKeywords: [
          ['same current', 'constant current', 'equal current', 'uniform current', 'single path', 'one path'],
          ['total resistance', 'adds up', 'sum', 'r1 + r2', 'rs'],
          ['voltage splits', 'voltage divides', 'voltage drops', 'v1 + v2'],
        ],
        coreIdeas: [
          'Current stays identical through every resistor in a single loop',
          'Total resistance equals the sum of individual resistances (Rs = R1 + R2)',
          'Battery voltage divides across components (V = V1 + V2)',
        ],
        trapPhrases: [
          { match: ['used up', 'uses up', 'eats', 'gets less', 'consumed', 'decreases after', 'smaller current'], label: 'Believing current is consumed after passing through a resistor' },
        ],
      },
      'parallel-circuits': {
        ideaKeywords: [
          ['same voltage', 'equal voltage', 'full voltage'],
          ['current splits', 'current divides', 'branches', 'i1 + i2'],
          ['1/r', 'lower resistance', 'decreases'],
        ],
        coreIdeas: [
          'Every parallel branch receives the full source voltage',
          'Total current splits among branches (I = I1 + I2)',
          'Adding parallel branches decreases equivalent resistance (1/Rp = 1/R1 + 1/R2)',
        ],
        trapPhrases: [
          { match: ['voltage divides', 'voltage splits', 'resistance increases'], label: 'Confusing parallel resistance/voltage rules with series behavior' },
        ],
      },
      'ohms-law': {
        ideaKeywords: [
          ['v = ir', 'v=ir', 'proportional', 'voltage and current'],
          ['inverse', 'decreases', 'goes down', 'i = v/r'],
          ['constant temperature', 'conductor'],
        ],
        coreIdeas: [
          'Voltage is directly proportional to current at constant temperature (V = I·R)',
          'At constant voltage, current is inversely proportional to resistance (I = V/R)',
          'Resistance is an intrinsic property of the conductor, not altered by voltage',
        ],
        trapPhrases: [
          { match: ['current increases when resistance increases', 'more resistance more volts'], label: 'Inverting I = V/R proportionality or battery voltage causality' },
        ],
      },
      'electric-current': {
        ideaKeywords: [
          ['q/t', 'q / t', 'rate of flow', 'charge'],
          ['ampere', 'coulomb'],
        ],
        coreIdeas: [
          'Current is the rate of flow of electric charge (I = Q / t)',
          'Measured in Amperes (1 A = 1 Coulomb per second)',
        ],
        trapPhrases: [
          { match: ['used up', 'destroyed'], label: 'Assuming charge carriers are destroyed in circuits' },
        ],
      },
      voltage: {
        ideaKeywords: [
          ['work', 'w/q', 'energy'],
          ['volt', 'two points', 'potential'],
        ],
        coreIdeas: [
          'Potential difference is work done per unit positive charge (V = W / Q)',
          'Measured in Volts between two points in a circuit',
        ],
        trapPhrases: [
          { match: ['voltage flows'], label: 'Treating voltage as a flowing substance rather than potential difference' },
        ],
      },
      resistance: {
        ideaKeywords: [
          ['oppose', 'opposition', 'slows'],
          ['length', 'area', 'resistivity', 'thickness'],
        ],
        coreIdeas: [
          'Opposition offered to the flow of charge carriers',
          'Directly proportional to length and inversely proportional to cross-sectional area (R = ρL/A)',
        ],
        trapPhrases: [
          { match: ['area increases resistance'], label: 'Confusing wire thickness relationship with resistance' },
        ],
      },
      'electrical-power': {
        ideaKeywords: [
          ['watt', 'v*i', 'i^2r', 'rate of energy'],
          ['kwh', 'kilowatt', 'energy', 'unit'],
        ],
        coreIdeas: [
          'Rate of electrical energy transfer: P = V·I = I²R = V²/R',
          'Commercial electrical energy is measured in kilowatt-hours (kWh)',
        ],
        trapPhrases: [
          { match: ['watt is energy'], label: 'Confusing power (Watts) with energy (kWh / Joules)' },
        ],
      },
    };

    const rubric = conceptRubrics[conceptId] || conceptRubrics['series-circuits'];
    rubric.trapPhrases.forEach((trap) => {
      if (trap.match.some((m) => lower.includes(m))) {
        misconceptions.push(trap.label);
      }
    });

    rubric.coreIdeas.forEach((idea, idx) => {
      const kws = rubric.ideaKeywords[idx] || [];
      const matched = kws.some((kw) => lower.includes(kw));
      // Avoid crediting current uniformity if current-consumption misconception was stated
      if (matched && !(idx === 0 && conceptId === 'series-circuits' && misconceptions.length > 0)) {
        explained.push(idea);
      } else {
        missing.push(idea);
      }
    });

    if (explained.length === 0) {
      explained.push(`Shared initial intuition on ${conceptName} in your own words`);
    }

    const baseScore = Math.round(
      40 + (explained.length / rubric.coreIdeas.length) * 50 - misconceptions.length * 18
    );
    const qualityScore = Math.max(20, Math.min(96, baseScore));

    return {
      conceptsExplainedCorrectly: explained,
      missingIdeas: missing,
      misconceptions,
      qualityScore,
      masteryDelta: computeDelta(qualityScore),
      feedbackSummary:
        misconceptions.length > 0
          ? `Nice attempt teaching ${conceptName}! Watch out for "${misconceptions[0]}" and review the missing ideas below.`
          : qualityScore >= 75
          ? `Clear Feynman-style explanation of ${conceptName}! You covered the core principles accurately in your own words.`
          : `Good start on ${conceptName}. Adding the missing causal links below will push your mastery above 75%.`,
      usedFallback: true,
      fallbackNotice: notice || null,
    };
  };

  if (!ai) {
    return res.json(fallbackTeachBack('Live AI service is currently offline; evaluated with local physics rubric.'));
  }

  try {
    const prompt = `You are evaluating a student using the Feynman "Teach It Back" technique for Class 10 Physics (Electricity).
Concept chosen: ${conceptName} (ID: ${conceptId}, current mastery: ${currentMastery}%).
Student's explanation in their own words:
"${transcript.trim()}"

Return structured JSON evaluating how accurately and completely the student explained this concept:
- conceptsExplainedCorrectly: array of 1-4 concise bullet strings describing parts they explained accurately.
- missingIdeas: array of 0-4 important ideas or formulas from ${conceptName} they left out.
- misconceptions: array of 0-3 physics misconceptions spotted in their explanation (empty array if none).
- qualityScore: integer 0-100 reflecting conceptual accuracy, clarity, and completeness.
- feedbackSummary: warm, encouraging 2-sentence pedagogical summary addressed directly to the student.`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              conceptsExplainedCorrectly: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingIdeas: { type: Type.ARRAY, items: { type: Type.STRING } },
              misconceptions: { type: Type.ARRAY, items: { type: Type.STRING } },
              qualityScore: { type: Type.NUMBER },
              feedbackSummary: { type: Type.STRING },
            },
            required: [
              'conceptsExplainedCorrectly',
              'missingIdeas',
              'misconceptions',
              'qualityScore',
              'feedbackSummary',
            ],
          },
        },
      }),
      8000
    );

    const parsed = JSON.parse(response.text || '{}');
    if (!isValidTeachBackShape(parsed)) {
      return res.json(fallbackTeachBack('Received an unexpected AI response format; switched to local physics rubric.'));
    }

    const clampedScore = Math.max(0, Math.min(100, Math.round(parsed.qualityScore)));
    return res.json({
      conceptsExplainedCorrectly: parsed.conceptsExplainedCorrectly.map(String),
      missingIdeas: parsed.missingIdeas.map(String),
      misconceptions: parsed.misconceptions.map(String),
      qualityScore: clampedScore,
      masteryDelta: computeDelta(clampedScore),
      feedbackSummary: parsed.feedbackSummary,
      usedFallback: false,
    });
  } catch (err) {
    console.warn('Gemini teach-back error, using fallback:', err);
    return res.json(fallbackTeachBack('Live AI coach could not be reached right now; evaluated using local physics rubric.'));
  }
});

// Helper: Validate Socratic Turn JSON shape
function isValidSocraticShape(obj: any): boolean {
  if (!obj || typeof obj !== 'object') return false;
  if (typeof obj.guidingQuestion !== 'string' || !obj.guidingQuestion.trim()) return false;
  if (typeof obj.tutorNote !== 'string') return false;
  if (typeof obj.shouldConclude !== 'boolean') return false;
  if (obj.shouldConclude) {
    if (typeof obj.summary !== 'string' || !obj.summary.trim()) return false;
    if (
      !obj.practiceQuestion ||
      typeof obj.practiceQuestion.questionText !== 'string' ||
      !Array.isArray(obj.practiceQuestion.options) ||
      obj.practiceQuestion.options.length < 2 ||
      typeof obj.practiceQuestion.correctOptionId !== 'string'
    ) {
      return false;
    }
  }
  return true;
}

// 5. Socratic Mode Endpoint
app.post('/api/socratic-turn', async (req: Request, res: Response) => {
  const {
    conceptId = 'series-circuits',
    conceptName = 'Series Circuits',
    currentMastery = 50,
    history = [],
    studentMessage = '',
  } = req.body;

  if (!studentMessage || typeof studentMessage !== 'string') {
    return res.status(400).json({ error: 'studentMessage is required' });
  }

  const tutorTurnsSoFar = Array.isArray(history)
    ? history.filter((m: any) => m.role === 'tutor').length
    : 0;
  const shouldConcludeNow = tutorTurnsSoFar >= 3; // After 3-4 turns, conclude with summary + practice question

  const fallbackSocratic = (notice?: string) => {
    const questionTrees: Record<string, string[]> = {
      'series-circuits': [
        'Picture a single-lane loop road with 2 speed bumps (resistors). Can cars vanish after passing the first bump, or does the same number of cars per minute pass both?',
        'Right—now connect that to electric charges: if charge cannot pile up or vanish in a single wire loop, what does that tell us about the current before and after each resistor?',
        'Since the current I is identical everywhere in series, how must the battery voltage V divide across a 2Ω resistor and a 4Ω resistor (hint: think V = I × R)?',
      ],
      'parallel-circuits': [
        'Imagine two separate highway toll lanes opening side-by-side between the same two cities. Does each lane connect directly to the exact same start and end voltage?',
        'If each parallel branch connects directly across the battery terminals, what happens to the total current flowing out of the battery when you add a second branch?',
        'And since the battery voltage stayed constant while total current increased, what must have happened to the total equivalent resistance?',
      ],
      'ohms-law': [
        'Think of voltage as water pressure and resistance as pipe narrowness. If the battery holds voltage constant and you put in a narrower pipe (higher R), how should the flow rate (I) respond?',
        'Look at I = V / R: what stays fixed when only the resistor is swapped on an ideal battery?',
        'So why doesn’t swapping a resistor make the battery produce more Volts?',
      ],
      'electric-current': [
        'If 12 Coulombs of charge pass a checkpoint in 4 seconds, what does "rate of flow per second" tell you to compute?',
        'How is current in Amperes related to charge Q and time t if time is given in minutes instead of seconds?',
        'If electrons move slowly along a wire, why does a bulb light up almost instantly when you close the switch?',
      ],
      voltage: [
        'Think of voltage like height on a ski slope for charges. Is potential difference a property of a single point, or a comparison between two points?',
        'If 1 Volt means 1 Joule of work per Coulomb of charge, how much energy transfers when 3 Coulombs drop across 12 Volts?',
        'Why do we connect a voltmeter in parallel across a component instead of breaking the wire to put it in series?',
      ],
      resistance: [
        'Suppose you double the length of a hallway students must walk through—does crowding/opposition go up or down?',
        'Now suppose you also make the hallway twice as wide (cross-sectional area). How does that affect the flow of charges?',
        'Combining length L and area A in R = ρL/A, what happens if a wire is stretched to double its length without changing its volume?',
      ],
      'electrical-power': [
        'Power is energy transformed per second. If two bulbs have the same current passing through them in series, which formula compares their power directly: I²R or V²/R?',
        'Why is Power in Watts multiplied by time in Hours used for electricity bills instead of Joules?',
        'If a 1000 W iron runs for 2 hours, how many kilowatt-hour (kWh) units does the meter count?',
      ],
    };

    const fallbackPractice: Record<string, any> = {
      'series-circuits': {
        id: `soc-q-${Date.now()}`,
        conceptId: 'series-circuits',
        conceptName: 'Series Circuits',
        difficulty: currentMastery < 50 ? 'easy' : 'medium',
        questionText: 'In a series circuit with a 3Ω and a 6Ω resistor connected to an 18V battery, how does the current through the 3Ω resistor compare to the current through the 6Ω resistor?',
        options: [
          { id: 'opt-a', text: 'Both resistors carry the exact same current (2.0 A)' },
          { id: 'opt-b', text: 'The 3Ω resistor gets more current because it comes first' },
          { id: 'opt-c', text: 'The 6Ω resistor carries half the current of the 3Ω resistor' },
          { id: 'opt-d', text: 'The 6Ω resistor uses up all remaining current' },
        ],
        correctOptionId: 'opt-a',
        explanation: 'Total resistance Rs = 3 + 6 = 9Ω, so I = 18/9 = 2.0A everywhere in the single series loop.',
        keyTakeaway: 'Current is uniform everywhere in a series loop; only voltage divides.',
      },
      'ohms-law': {
        id: `soc-q-${Date.now()}`,
        conceptId: 'ohms-law',
        conceptName: "Ohm's Law",
        difficulty: currentMastery < 50 ? 'easy' : 'medium',
        questionText: 'A 12V battery supplies a 4Ω resistor. If replaced with a 12Ω resistor on the same 12V battery, what happens to current?',
        options: [
          { id: 'opt-a', text: 'Current drops from 3 A to 1 A' },
          { id: 'opt-b', text: 'Current increases from 3 A to 9 A' },
          { id: 'opt-c', text: 'Battery voltage increases to 36 V' },
          { id: 'opt-d', text: 'Current stays 3 A' },
        ],
        correctOptionId: 'opt-a',
        explanation: 'At constant V = 12V, I = V/R drops from 12/4 = 3A to 12/12 = 1A.',
        keyTakeaway: 'At constant voltage, I is inversely proportional to R.',
      },
    };

    const tree = questionTrees[conceptId] || questionTrees['series-circuits'];
    const stepIdx = Math.min(tutorTurnsSoFar, tree.length - 1);

    if (shouldConcludeNow) {
      return {
        tutorNote: 'You traced the causal chain nicely through those steps!',
        guidingQuestion: 'Let’s lock in what you discovered with this quick synthesis check:',
        shouldConclude: true,
        summary: `Through our guided steps on ${conceptName}, you connected how the underlying physical quantity behaves across the circuit and why formula relationships constrain the outcome.`,
        practiceQuestion:
          fallbackPractice[conceptId] ||
          FALLBACK_QUESTIONS_BY_CONCEPT[conceptId] ||
          fallbackPractice['series-circuits'],
        usedFallback: true,
        fallbackNotice: notice || null,
      };
    }

    return {
      tutorNote:
        tutorTurnsSoFar === 0
          ? `Great starting point—let's build ${conceptName} step by step (calibrated to your ${currentMastery}% mastery).`
          : `Good thinking on "${studentMessage.slice(0, 45)}${studentMessage.length > 45 ? '...' : ''}". Let's push one step deeper.`,
      guidingQuestion: tree[stepIdx],
      shouldConclude: false,
      summary: null,
      practiceQuestion: null,
      usedFallback: true,
      fallbackNotice: notice || null,
    };
  };

  if (!ai) {
    return res.json(fallbackSocratic('Live AI tutor is offline; using guided Socratic question tree.'));
  }

  try {
    const formattedHistory = Array.isArray(history)
      ? history.map((m: any) => `${m.role === 'student' ? 'Student' : 'Tutor'}: ${m.text}`).join('\n')
      : '';

    const prompt = `You are a Socratic Physics Tutor for Class 10 Electricity ("LearnFlow AI 2.0").
Concept: ${conceptName} (conceptId: ${conceptId})
Learner Mastery: ${currentMastery}% (${currentMastery < 50 ? 'use concrete intuitive analogies & gentle scaffolding' : currentMastery < 75 ? 'probe causal mechanism & variable tradeoffs' : 'ask synthesis/edge-case probing questions'})
Conversation so far (${tutorTurnsSoFar} tutor turns already completed):
${formattedHistory || '(Session start)'}
Latest student response:
"${studentMessage}"

STRICT SOCRATIC RULES:
1. If tutorTurnsSoFar < 3:
   - Set shouldConclude: false, summary: null, practiceQuestion: null.
   - Reply in guidingQuestion with EXACTLY ONE short, focused guiding question—NEVER give away the final answer or lecture!
   - Base the question directly on the student's previous response and their mastery level (${currentMastery}%).
   - Provide a brief 1-sentence encouraging tutorNote acknowledging what they said without spoiling the answer.
2. If tutorTurnsSoFar >= 3:
   - Set shouldConclude: true.
   - Provide a concise 2-sentence summary of what the student reasoned through.
   - Set guidingQuestion to a brief 1-line invitation to solve the follow-up check.
   - Generate a 4-option multiple-choice practiceQuestion on ${conceptName} (options ids: opt-a, opt-b, opt-c, opt-d).`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tutorNote: { type: Type.STRING },
              guidingQuestion: { type: Type.STRING },
              shouldConclude: { type: Type.BOOLEAN },
              summary: { type: Type.STRING, nullable: true },
              practiceQuestion: {
                type: Type.OBJECT,
                nullable: true,
                properties: {
                  id: { type: Type.STRING },
                  conceptId: { type: Type.STRING },
                  conceptName: { type: Type.STRING },
                  difficulty: { type: Type.STRING, enum: ['easy', 'medium', 'hard'] },
                  questionText: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        text: { type: Type.STRING },
                      },
                      required: ['id', 'text'],
                    },
                  },
                  correctOptionId: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  keyTakeaway: { type: Type.STRING },
                },
              },
            },
            required: ['tutorNote', 'guidingQuestion', 'shouldConclude'],
          },
        },
      }),
      8000
    );

    const parsed = JSON.parse(response.text || '{}');
    if (!isValidSocraticShape(parsed)) {
      return res.json(fallbackSocratic('AI Socratic response shape was incomplete; switched to structured fallback turn.'));
    }

    return res.json({
      ...parsed,
      usedFallback: false,
    });
  } catch (err) {
    console.warn('Gemini socratic turn error, using fallback:', err);
    return res.json(fallbackSocratic('Live AI tutor encountered a temporary issue; continuing with offline Socratic step.'));
  }
});

// Helper: Validate Concept Rescue JSON shape
function isValidRescueShape(obj: any): boolean {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.title === 'string' &&
    typeof obj.headline === 'string' &&
    Array.isArray(obj.explanationBlocks) &&
    obj.explanationBlocks.length > 0 &&
    typeof obj.analogyOrVisualCaption === 'string' &&
    typeof obj.voiceScript === 'string' &&
    obj.checkpointQuestion &&
    typeof obj.checkpointQuestion.questionText === 'string' &&
    Array.isArray(obj.checkpointQuestion.options) &&
    obj.checkpointQuestion.options.length >= 2 &&
    typeof obj.checkpointQuestion.correctOptionId === 'string'
  );
}

// 6. Concept Rescue Endpoint
app.post('/api/concept-rescue', async (req: Request, res: Response) => {
  const {
    conceptId = 'series-circuits',
    conceptName = 'Series Circuits',
    rescueMode = 'visual',
    currentMastery = 35,
    recentMisconceptions = [],
  } = req.body;

  const fallbackRescue = (notice?: string) => {
    const modeLabels: Record<string, string> = {
      visual: 'Visual Circuit Blueprint',
      analogy: 'Real-World Analogy',
      step_by_step: 'Step-by-Step Breakdown',
      voice: 'Conversational Voice Walkthrough',
      mini_challenge: 'Interactive Mini Challenge',
    };

    const analogyMap: Record<string, string> = {
      'series-circuits': 'Think of a single-track circular train line: every train car moves at the exact same speed around the loop—none of the cars get eaten by the stations.',
      'parallel-circuits': 'Think of multi-lane toll plazas on a highway: opening another parallel lane lets MORE total cars pass at once, lowering total traffic resistance.',
      'ohms-law': 'Imagine water pressure (Voltage) pushing through a nozzle (Resistance): squeezing the nozzle tighter does not change the pump pressure, it slows down the water flow (Current).',
      'electric-current': 'Current is like counting students walking through a doorway each second—more charges passing per second means higher Amperes.',
      voltage: 'Voltage is the height difference between the top and bottom of a slide: it measures how much push energy each Coulomb of charge receives.',
      resistance: 'Resistance is like walking through a corridor: a longer corridor increases opposition, while a wider corridor makes passage easier.',
      'electrical-power': 'Power (Watts) is how fast energy is spent each second; Energy (kWh) is the total billable consumption over hours.',
    };

    const blocksByMode: Record<string, Array<{ stepTitle: string; content: string }>> = {
      visual: [
        { stepTitle: '1. Inspect the Flow Path', content: `Trace the closed conductor loop for ${conceptName}. Notice where potential stays steady versus where energy drops across components.` },
        { stepTitle: '2. Compare Meter Readings', content: 'Watch the virtual ammeter readings: identical current flows along a single unbranched path, while branches in parallel share full source voltage.' },
        { stepTitle: '3. Verify Conservation', content: 'Charge entering a junction or component always equals charge leaving it—current is never consumed.' },
      ],
      analogy: [
        { stepTitle: 'Everyday Mental Model', content: analogyMap[conceptId] || analogyMap['series-circuits'] },
        { stepTitle: 'Mapping Analogy → Physics', content: `In ${conceptName}, the moving crowd/cars correspond to Coulombs per second (Current), while elevation or pump pressure corresponds to Volts.` },
      ],
      step_by_step: [
        { stepTitle: 'Step 1: Identify Knowns & Circuit Topology', content: `List battery voltage V and individual resistor values R1, R2 for ${conceptName}.` },
        { stepTitle: 'Step 2: Find Equivalent Resistance', content: 'Combine resistors according to connection type before solving for total current I = V / R_eq.' },
        { stepTitle: 'Step 3: Check Units & Physical Sense', content: 'Confirm current is in Amperes, voltage in Volts, and check whether your result respects energy & charge conservation.' },
      ],
      voice: [
        { stepTitle: 'Listen & Reflect Aloud', content: `Press "Play Voice Rescue" below to hear a calm, plain-language explanation of ${conceptName}, then test yourself on the 1-question checkpoint.` },
      ],
      mini_challenge: [
        { stepTitle: 'Rapid Intuition Micro-Drill', content: `Predict what happens when one resistor doubles in ${conceptName} BEFORE doing arithmetic, then check your prediction in the checkpoint below.` },
      ],
    };

    const q =
      FALLBACK_QUESTIONS_BY_CONCEPT[conceptId] ||
      FALLBACK_QUESTIONS_BY_CONCEPT['series-circuits'];
    return {
      title: `${modeLabels[rescueMode] || 'Concept Rescue'}: ${conceptName}`,
      headline: `Let's unlock ${conceptName} from a fresh angle (${currentMastery}% mastery).`,
      visualType: conceptId,
      explanationBlocks: blocksByMode[rescueMode] || blocksByMode.visual,
      analogyOrVisualCaption: analogyMap[conceptId] || analogyMap['series-circuits'],
      voiceScript: `Here is a clearer way to picture ${conceptName}. ${analogyMap[conceptId] || ''} Keep that mental picture in mind as you try the quick checkpoint below.`,
      checkpointQuestion: {
        ...q,
        id: `rescue-q-${Date.now()}`,
        difficulty: 'easy',
      },
      usedFallback: true,
      fallbackNotice: notice || null,
    };
  };

  if (!ai) {
    return res.json(fallbackRescue('Live AI coach is offline; loaded structured offline Concept Rescue guide.'));
  }

  try {
    const prompt = `You are the Concept Rescue Tutor in "LearnFlow AI 2.0" (Class 10 Physics - Electricity).
A student is struggling on ${conceptName} (mastery: ${currentMastery}%).
Recent misconceptions: ${Array.isArray(recentMisconceptions) && recentMisconceptions.length ? recentMisconceptions.join('; ') : 'General conceptual confusion'}.
The student selected the rescue learning mode: "${rescueMode}".

Tailor the response strictly to "${rescueMode}":
- "visual": describe clear spatial diagram mental imagery and meter observations.
- "analogy": give a vivid everyday real-world analogy (traffic lanes, water pipes, ski hill) and map every part back to physics.
- "step_by_step": break the concept into 3 crystal-clear numbered micro-steps with zero skipped logic.
- "voice": write warm, conversational spoken tutoring blocks & voiceScript suited for listening aloud.
- "mini_challenge": frame an intuitive "predict first, verify second" micro-puzzle before the checkpoint.

Also return a targeted "easy" 4-option checkpointQuestion (opt-a, opt-b, opt-c, opt-d) to verify if the student's next answer improves.`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              headline: { type: Type.STRING },
              visualType: { type: Type.STRING },
              explanationBlocks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stepTitle: { type: Type.STRING },
                    content: { type: Type.STRING },
                  },
                  required: ['stepTitle', 'content'],
                },
              },
              analogyOrVisualCaption: { type: Type.STRING },
              voiceScript: { type: Type.STRING },
              checkpointQuestion: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  conceptId: { type: Type.STRING },
                  conceptName: { type: Type.STRING },
                  difficulty: { type: Type.STRING, enum: ['easy', 'medium', 'hard'] },
                  questionText: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        text: { type: Type.STRING },
                      },
                      required: ['id', 'text'],
                    },
                  },
                  correctOptionId: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  keyTakeaway: { type: Type.STRING },
                },
                required: ['id', 'conceptId', 'conceptName', 'difficulty', 'questionText', 'options', 'correctOptionId', 'explanation', 'keyTakeaway'],
              },
            },
            required: ['title', 'headline', 'explanationBlocks', 'analogyOrVisualCaption', 'voiceScript', 'checkpointQuestion'],
          },
        },
      }),
      8000
    );

    const parsed = JSON.parse(response.text || '{}');
    if (!isValidRescueShape(parsed)) {
      return res.json(fallbackRescue('AI rescue payload missed a required field; loaded structured offline guide.'));
    }

    return res.json({
      ...parsed,
      usedFallback: false,
    });
  } catch (err) {
    console.warn('Gemini concept rescue error, using fallback:', err);
    return res.json(fallbackRescue('Live AI tutor is temporarily unavailable; loaded structured offline Concept Rescue guide.'));
  }
});

// Helper: Validate Teacher Generated Revision Lab JSON
function isValidGeneratedLabShape(obj: any): boolean {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.title === 'string' &&
    obj.title.trim().length > 0 &&
    typeof obj.concept === 'string' &&
    typeof obj.shortExplanation === 'string' &&
    obj.shortExplanation.trim().length > 0 &&
    typeof obj.relatedMisconception === 'string' &&
    Array.isArray(obj.practiceQuestions) &&
    obj.practiceQuestions.length === 3 &&
    obj.practiceQuestions.every(
      (q: any) =>
        q &&
        typeof q.questionText === 'string' &&
        Array.isArray(q.options) &&
        q.options.length >= 2 &&
        typeof q.correctOptionId === 'string' &&
        typeof q.explanation === 'string'
    )
  );
}

// 7. Teacher Revision Lab Generator Endpoint
app.post('/api/teacher/generate-lab', async (req: Request, res: Response) => {
  const {
    alertId = '',
    concept = 'Series Circuits',
    title = 'Concept Cluster Alert',
    misconceptionSummary = 'Students hold a conceptual misconception on this topic.',
    impactedCount = 10,
  } = req.body;

  const fallbackLab = (notice?: string) => ({
    id: `gen-lab-${Date.now()}`,
    alertId,
    title: `Targeted Revision Lab: ${concept}`,
    concept,
    shortExplanation: `In ${concept}, start with physical conservation rules before plugging numbers into equations. Compare meters across circuit points to observe why ${misconceptionSummary.toLowerCase()}`,
    relatedMisconception: misconceptionSummary,
    practiceQuestions: [
      {
        id: `lab-q1-${Date.now()}`,
        questionText: `Concept Check (Foundation): In ${concept}, what physical quantity stays constant across identical supply terminals or a single unbranched loop?`,
        options: [
          { id: 'opt-a', text: 'Current in a single series loop; Voltage across parallel branches' },
          { id: 'opt-b', text: 'Current shrinks after every resistor in series' },
          { id: 'opt-c', text: 'Voltage shrinks equally across parallel branches' },
          { id: 'opt-d', text: 'Resistance doubles automatically when battery voltage doubles' },
        ],
        correctOptionId: 'opt-a',
        explanation: 'Charge conservation guarantees identical series current; identical node pairs guarantee full parallel voltage.',
      },
      {
        id: `lab-q2-${Date.now()}`,
        questionText: `Numerical Drill (${concept}): A 12 V battery powers two resistors (4 Ω and 8 Ω). If connected in series, what is the current reading after the 8 Ω resistor?`,
        options: [
          { id: 'opt-a', text: '1.0 A (same as before the 4 Ω resistor)' },
          { id: 'opt-b', text: '3.0 A before and 1.5 A after' },
          { id: 'opt-c', text: '0 A (current used up)' },
          { id: 'opt-d', text: '1.5 A total' },
        ],
        correctOptionId: 'opt-a',
        explanation: 'Rs = 4 + 8 = 12 Ω, so I = 12 V / 12 Ω = 1.0 A at every point in the loop.',
      },
      {
        id: `lab-q3-${Date.now()}`,
        questionText: `Diagnostic Transfer (${concept}): If a third parallel branch is opened across a fixed 12 V supply, how does total current drawn from the battery change?`,
        options: [
          { id: 'opt-a', text: 'Total current increases because equivalent resistance decreases' },
          { id: 'opt-b', text: 'Total current decreases because resistors add up' },
          { id: 'opt-c', text: 'Battery voltage triples to compensate' },
          { id: 'opt-d', text: 'Existing branches go dark' },
        ],
        correctOptionId: 'opt-a',
        explanation: 'Adding a parallel pathway lowers total resistance Rp and adds a new branch current I3, increasing total current drawn.',
      },
    ],
    usedFallback: true,
    fallbackNotice: notice || null,
  });

  if (!ai) {
    return res.json(fallbackLab('Live AI service is offline; generated structured offline Revision Lab.'));
  }

  try {
    const prompt = `You are a Class 10 Physics Curriculum Designer helping Dr. Priya Sharma address a class-wide struggle alert.
Alert Title: "${title}"
Concept: "${concept}"
Cohort Impact: ${impactedCount} students
Observed Misconception: "${misconceptionSummary}"

Generate a focused Revision Lab as strict JSON with:
- title: concise lab title for ${concept}
- concept: "${concept}"
- shortExplanation: 2-3 clear sentences directly debunking the misconception for classroom walkthrough
- relatedMisconception: clear 1-sentence statement of the underlying student misconception
- practiceQuestions: EXACTLY 3 multiple-choice questions (ids: q1, q2, q3), each with questionText, 4 options (opt-a, opt-b, opt-c, opt-d), correctOptionId, and explanation.`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              concept: { type: Type.STRING },
              shortExplanation: { type: Type.STRING },
              relatedMisconception: { type: Type.STRING },
              practiceQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    questionText: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          text: { type: Type.STRING },
                        },
                        required: ['id', 'text'],
                      },
                    },
                    correctOptionId: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                  },
                  required: ['id', 'questionText', 'options', 'correctOptionId', 'explanation'],
                },
              },
            },
            required: ['title', 'concept', 'shortExplanation', 'relatedMisconception', 'practiceQuestions'],
          },
        },
      }),
      8000
    );

    const parsed = JSON.parse(response.text || '{}');
    if (!isValidGeneratedLabShape(parsed)) {
      return res.json(fallbackLab('AI lab format was incomplete; switched to validated classroom template.'));
    }

    return res.json({
      id: `gen-lab-${Date.now()}`,
      alertId,
      ...parsed,
      usedFallback: false,
    });
  } catch (err) {
    console.warn('Gemini generate-lab error, using fallback:', err);
    return res.json(fallbackLab('Live AI lab generator timed out; loaded structured Revision Lab.'));
  }
});

// Helper: Validate 5-Question Mastery Badge Challenge
function isValidMasteryChallengeShape(obj: any): boolean {
  return (
    obj &&
    typeof obj === 'object' &&
    Array.isArray(obj.questions) &&
    obj.questions.length === 5 &&
    obj.questions.every(
      (q: any) =>
        q &&
        typeof q.questionText === 'string' &&
        Array.isArray(q.options) &&
        q.options.length >= 2 &&
        typeof q.correctOptionId === 'string' &&
        typeof q.explanation === 'string'
    )
  );
}

// 8. Mastery Badge 5-Question Verification Challenge Endpoint
app.post('/api/mastery-challenge', async (req: Request, res: Response) => {
  const { conceptId = 'ohms-law', conceptName = "Ohm's Law" } = req.body;

  const fallbackChallenge = (notice?: string) => {
    const banks: Record<string, any[]> = {
      'ohms-law': [
        {
          id: 'mc-ohm-1',
          conceptId: 'ohms-law',
          conceptName: "Ohm's Law",
          difficulty: 'easy',
          dimension: 'basic',
          questionText: '[Basic] At constant temperature, what is the mathematical relationship stated by Ohm\'s Law between potential difference V and current I?',
          options: [
            { id: 'opt-a', text: 'V = I × R (V is directly proportional to I)' },
            { id: 'opt-b', text: 'V = I / R' },
            { id: 'opt-c', text: 'I = V × R' },
            { id: 'opt-d', text: 'R = V × I' },
          ],
          correctOptionId: 'opt-a',
          explanation: 'Ohm\'s law states V ∝ I at constant physical conditions, with constant of proportionality R (V = IR).',
          keyTakeaway: 'Slope of a V-vs-I linear plot gives resistance R.',
        },
        {
          id: 'mc-ohm-2',
          conceptId: 'ohms-law',
          conceptName: "Ohm's Law",
          difficulty: 'medium',
          dimension: 'application',
          questionText: '[Application] A toaster heating element draws 5.0 A when connected to a 220 V supply. What is its operating resistance?',
          options: [
            { id: 'opt-a', text: '44 Ω' },
            { id: 'opt-b', text: '1100 Ω' },
            { id: 'opt-c', text: '215 Ω' },
            { id: 'opt-d', text: '0.023 Ω' },
          ],
          correctOptionId: 'opt-a',
          explanation: 'R = V / I = 220 V / 5.0 A = 44 Ω.',
          keyTakeaway: 'Always rearrange V = IR carefully: R = V / I.',
        },
        {
          id: 'mc-ohm-3',
          conceptId: 'ohms-law',
          conceptName: "Ohm's Law",
          difficulty: 'medium',
          dimension: 'misconception',
          questionText: '[Misconception Trap] You swap a 4 Ω resistor on a 12 V battery for a 12 Ω resistor at constant temperature. Which statement is true?',
          options: [
            { id: 'opt-a', text: 'Battery voltage remains 12 V and current drops from 3 A to 1 A' },
            { id: 'opt-b', text: 'Battery voltage triples to 36 V to maintain 3 A current' },
            { id: 'opt-c', text: 'Current triples from 3 A to 9 A' },
            { id: 'opt-d', text: 'The resistor forces its own resistance down to match 12 V' },
          ],
          correctOptionId: 'opt-a',
          explanation: 'Battery EMF stays fixed at 12 V; raising R cuts current proportionally (I = V/R = 1 A).',
          keyTakeaway: 'Increasing resistance never increases ideal source voltage.',
        },
        {
          id: 'mc-ohm-4',
          conceptId: 'ohms-law',
          conceptName: "Ohm's Law",
          difficulty: 'hard',
          dimension: 'real-world',
          questionText: '[Real-World] Two metallic wires X and Y are tested on a V-I graph (V on vertical axis, I on horizontal axis). Wire X has a steeper slope than Wire Y. Which wire is better suited for low-loss power transmission cables?',
          options: [
            { id: 'opt-a', text: 'Wire Y, because a gentler V-I slope means lower electrical resistance' },
            { id: 'opt-b', text: 'Wire X, because steeper slope means zero resistance' },
            { id: 'opt-c', text: 'Wire X, because steeper slope carries higher current per volt' },
            { id: 'opt-d', text: 'Both have equal resistance' },
          ],
          correctOptionId: 'opt-a',
          explanation: 'On a V-versus-I graph, slope = ΔV / ΔI = R. Wire Y\'s flatter slope gives lower resistance and less I²R heat loss.',
          keyTakeaway: 'Check graph axes first: R = V/I (slope when V is y-axis).',
        },
        {
          id: 'mc-ohm-5',
          conceptId: 'ohms-law',
          conceptName: "Ohm's Law",
          difficulty: 'medium',
          dimension: 'application',
          questionText: '[Application] A thermistor shows a current of 0.4 A at 8 V and 1.2 A at 16 V because it heats up. Does it strictly obey Ohm\'s law across this range?',
          options: [
            { id: 'opt-a', text: 'No, because R changed from 20 Ω to 13.3 Ω as temperature varied (non-ohmic)' },
            { id: 'opt-b', text: 'Yes, because current increased when voltage increased' },
            { id: 'opt-c', text: 'Yes, because V = IR holds with constant R' },
            { id: 'opt-d', text: 'No, because voltage exceeded 10 V' },
          ],
          correctOptionId: 'opt-a',
          explanation: 'Ohmic behavior requires constant R (and constant temperature); changing V/I ratio means it is non-ohmic.',
          keyTakeaway: 'Ohm\'s law holds only when the V/I ratio stays constant.',
        },
      ],
    };

    const selectedList =
      banks[conceptId] ||
      [
        {
          id: `mc-${conceptId}-1`,
          conceptId,
          conceptName,
          difficulty: 'easy',
          dimension: 'basic',
          questionText: `[Basic] Which foundational principle defines ${conceptName} in Class 10 Electricity?`,
          options: [
            { id: 'opt-a', text: 'Conservation of electric charge and energy across circuit elements' },
            { id: 'opt-b', text: 'Consumption of electrons inside passive resistors' },
            { id: 'opt-c', text: 'Voltage flowing one-way from resistors back to the battery' },
            { id: 'opt-d', text: 'Resistance varying freely with battery brand' },
          ],
          correctOptionId: 'opt-a',
          explanation: `${conceptName} obeys charge conservation and energy transfer laws consistently.`,
          keyTakeaway: 'Anchor every circuit formula in conservation laws.',
        },
        {
          id: `mc-${conceptId}-2`,
          conceptId,
          conceptName,
          difficulty: 'medium',
          dimension: 'application',
          questionText: `[Application] ${(FALLBACK_QUESTIONS_BY_CONCEPT[conceptId] || FALLBACK_QUESTIONS_BY_CONCEPT['ohms-law']).questionText}`,
          options: (FALLBACK_QUESTIONS_BY_CONCEPT[conceptId] || FALLBACK_QUESTIONS_BY_CONCEPT['ohms-law']).options,
          correctOptionId: (FALLBACK_QUESTIONS_BY_CONCEPT[conceptId] || FALLBACK_QUESTIONS_BY_CONCEPT['ohms-law']).correctOptionId,
          explanation: (FALLBACK_QUESTIONS_BY_CONCEPT[conceptId] || FALLBACK_QUESTIONS_BY_CONCEPT['ohms-law']).explanation,
          keyTakeaway: (FALLBACK_QUESTIONS_BY_CONCEPT[conceptId] || FALLBACK_QUESTIONS_BY_CONCEPT['ohms-law']).keyTakeaway,
        },
        {
          id: `mc-${conceptId}-3`,
          conceptId,
          conceptName,
          difficulty: 'medium',
          dimension: 'misconception',
          questionText: `[Misconception Trap] A student claims: "Charges lose speed and disappear after lighting a bulb, so current leaves smaller than it enters." Why is this false?`,
          options: [
            { id: 'opt-a', text: 'Energy transfers to light/heat, but total charge flow (Amperes) is conserved' },
            { id: 'opt-b', text: 'Bulbs generate new electrons inside the tungsten filament' },
            { id: 'opt-c', text: 'Voltmeters absorb extra electrons' },
            { id: 'opt-d', text: 'Current only flows during the first second after closing the switch' },
          ],
          correctOptionId: 'opt-a',
          explanation: 'Electrical potential energy drops across loads, while charge flow rate (I) in a single path stays constant.',
          keyTakeaway: 'Loads transform electrical energy, not electric charge.',
        },
        {
          id: `mc-${conceptId}-4`,
          conceptId,
          conceptName,
          difficulty: 'hard',
          dimension: 'real-world',
          questionText: `[Real-World] Why are household lighting and appliance outlets wired in parallel rather than series?`,
          options: [
            { id: 'opt-a', text: 'Each appliance receives full mains voltage and operates independently if another switches off' },
            { id: 'opt-b', text: 'Parallel wiring maximizes total circuit resistance to save fuses' },
            { id: 'opt-c', text: 'Series wiring supplies too much current to distant rooms' },
            { id: 'opt-d', text: 'Parallel wiring splits 220 V into safer 22 V branches' },
          ],
          correctOptionId: 'opt-a',
          explanation: 'Parallel sockets guarantee each device gets full supply voltage and independent switching.',
          keyTakeaway: 'Household circuits rely on parallel nodes for constant voltage & independent control.',
        },
        {
          id: `mc-${conceptId}-5`,
          conceptId,
          conceptName,
          difficulty: 'hard',
          dimension: 'application',
          questionText: `[Application] A 24 V source drives two resistors (6 Ω and 6 Ω). Compare total power drawn if connected in parallel vs. series:`,
          options: [
            { id: 'opt-a', text: 'Parallel draws 4× the power of series because Rp = R/2 vs Rs = 2R' },
            { id: 'opt-b', text: 'Both connections draw identical power' },
            { id: 'opt-c', text: 'Series draws more power because voltage adds up' },
            { id: 'opt-d', text: 'Parallel draws half the power of series' },
          ],
          correctOptionId: 'opt-a',
          explanation: 'Rp = 3 Ω (P = 24²/3 = 192 W), whereas Rs = 12 Ω (P = 24²/12 = 48 W): 192 / 48 = 4×.',
          keyTakeaway: 'Lowering equivalent resistance at constant voltage sharply increases power drawn (P = V²/Req).',
        },
      ];

    return {
      conceptId,
      conceptName,
      questions: selectedList,
      usedFallback: true,
      fallbackNotice: notice || null,
    };
  };

  if (!ai) {
    return res.json(fallbackChallenge('Live AI service is offline; loaded verified 5-question mastery challenge.'));
  }

  try {
    const prompt = `Generate a 5-question Mastery Badge Verification Challenge for Class 10 Physics: "${conceptName}" (conceptId: ${conceptId}).
Include EXACTLY 5 multiple-choice questions covering all 4 dimensions:
- Question 1: dimension "basic" (easy core definition)
- Question 2: dimension "application" (medium numerical problem)
- Question 3: dimension "misconception" (medium/hard common misconception trap distractor)
- Question 4: dimension "real-world" (hard everyday appliance/circuit application)
- Question 5: dimension "application" (hard multi-step transfer)

Each question must use option ids "opt-a", "opt-b", "opt-c", "opt-d" and include id, conceptId ("${conceptId}"), conceptName ("${conceptName}"), difficulty, dimension, questionText, options, correctOptionId, explanation, and keyTakeaway.`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    conceptId: { type: Type.STRING },
                    conceptName: { type: Type.STRING },
                    difficulty: { type: Type.STRING, enum: ['easy', 'medium', 'hard'] },
                    dimension: { type: Type.STRING, enum: ['basic', 'application', 'misconception', 'real-world'] },
                    questionText: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          text: { type: Type.STRING },
                        },
                        required: ['id', 'text'],
                      },
                    },
                    correctOptionId: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    keyTakeaway: { type: Type.STRING },
                  },
                  required: [
                    'id',
                    'conceptId',
                    'conceptName',
                    'difficulty',
                    'dimension',
                    'questionText',
                    'options',
                    'correctOptionId',
                    'explanation',
                    'keyTakeaway',
                  ],
                },
              },
            },
            required: ['questions'],
          },
        },
      }),
      8000
    );

    const parsed = JSON.parse(response.text || '{}');
    if (!isValidMasteryChallengeShape(parsed)) {
      return res.json(fallbackChallenge('AI challenge payload was incomplete; loaded verified 5-question challenge.'));
    }

    return res.json({
      conceptId,
      conceptName,
      questions: parsed.questions,
      usedFallback: false,
    });
  } catch (err) {
    console.warn('Gemini mastery challenge error, using fallback:', err);
    return res.json(fallbackChallenge('Live AI challenge generator timed out; loaded verified 5-question challenge.'));
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`LearnFlow AI server running at http://localhost:${PORT}`);
  });
}

startServer();
