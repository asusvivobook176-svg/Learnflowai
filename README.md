# LearnFlow AI – Voice-Powered Adaptive Exam-Prep Tutor

> **Tagline:** "Your voice-powered AI tutor that learns how you learn."

LearnFlow AI is an intelligent exam-preparation platform designed around a **living learner model** that understands what each student knows, where they struggle, what misconceptions they harbor, and what they should study next.

Built with a **voice-first** philosophy, LearnFlow AI integrates **Wispr Flow** to allow students to speak naturally—with filler words, hesitations, digressions, and self-corrections—transforming conversational thoughts into structured pedagogical intelligence.

---

## 🌟 Key Features

### 1. Voice-Powered Learning Input (Wispr Flow)
- Ingests natural, unscripted speech using acoustic and semantic token normalization.
- Converts conversational speech into structured learning models:
  - **Subject & Topic**: Class 10 Physics – Electricity
  - **Concept Mapping**: Normalized syllabus node (e.g., *Series Circuits*, *Ohm's Law*)
  - **Student Intent**: `clarify_doubt`, `explain_concept`, `request_practice`, `express_confusion`
  - **Confidence Level**: `Low`, `Medium`, `High`
  - **Detected Misconception**: Real-time diagnostic flag
  - **Recommended Action**: Targeted next step
  - **Text-to-Speech**: SpeechSynthesis audio playback of tutor explanations.

### 2. Diagnostic Assessment
- Baseline evaluation for **Class 10 Physics – Electricity**:
  - *Electric Current* ($I = Q/t$)
  - *Voltage & Potential Difference* ($V = W/Q$)
  - *Resistance & Physical Factors* ($R = \rho L/A$)
  - *Ohm's Law* ($V = IR$)
  - *Series Circuits* ($R_s = R_1 + R_2$, uniform current)
  - *Parallel Circuits* ($1/R_p = 1/R_1 + 1/R_2$, uniform voltage)
  - *Electrical Power & Joule Heating* ($P = VI = I^2R$)
- Collects answer, confidence rating, and optional verbal reasoning.
- Calibrates initial baseline mastery across all 7 concepts.

### 3. Interactive Concept Graph
- Visual topology showing syllabus hierarchy and dependency pathways.
- Live color coding based on mastery:
  - 🟢 **Strong Mastery** ($\ge 75\%$)
  - 🟡 **Developing Mastery** ($50\% - 74\%$)
  - 🔴 **Weak Concept** ($< 50\%$)
- Animated energy pulses representing charge flow along circuit connections.
- Interactive inspection drawer with formulas, common traps, last studied date, and direct practice launch.

### 4. Living Learner Model
- Dynamic probabilistic state representation for every student.
- Persisted locally with audit trail of historical mastery updates.
- Preloaded with hackathon demo student **Alex Rivera**:
  - *Ohm's Law*: 85%
  - *Electric Current*: 75%
  - *Voltage*: 68%
  - *Resistance*: 55%
  - *Series Circuits*: 35%
  - *Parallel Circuits*: 42%
  - *Electrical Power*: 70%

### 5. Misconception Detection Agent ("Explain My Thinking Mode")
- Evaluates student's verbal reasoning beyond basic correctness.
- Pinpoints common traps:
  - *Current consumed along series circuit* (thinking the first resistor eats current)
  - *Causality inversion in $V = IR$* (thinking higher resistance increases battery voltage)
  - *Branch voltage confusion* (thinking voltage splits in parallel)
- Provides supportive, constructive explanations and targeted debunking drills.

### 6. Adaptive Question Generator
- AI-generated questions via Gemini 3.8 Flash calibrated to zone of proximal development.
- Three difficulty tiers: Easy, Medium, Hard.
- Incorporates misconception traps as distractor choices to verify true understanding.

### 7. Smart Spaced-Repetition Scheduler
- Ebbinghaus-derived retention intervals:
  - **Low Mastery ($< 50\%$):** Review 1 day $\to$ Practice 3 days $\to$ Check 7 days.
  - **Developing ($50-74\%$):** Review 3 days $\to$ Practice 7 days $\to$ Test 14 days.
  - **High Mastery ($\ge 75\%$):** Review 7 days $\to$ Challenge 21 days.
- Actionable "Today's Learning Plan" on the dashboard.

### 8. Teacher Command Center
- Cohort heatmap matrix across all students and concepts.
- Class-wide average mastery (67%) and difficulty rankings.
- Systemic misconception triage with 1-click targeted remediation drills.

---

## 🧠 LearnFlow Intelligence Center

A dedicated intelligence suite making the learner model fully visible, explainable, personalized, and actionable:

### 1. Learning Memory Timeline (`My Learning Journey`)
- Chronological timeline tracking 8 distinct pedagogical event types:
  - *Diagnostic test completed*
  - *Voice question asked (Wispr Flow)*
  - *Practice question answered*
  - *Reasoning analyzed*
  - *Misconception detected*
  - *Misconception resolved*
  - *Spaced revision completed*
  - *Mastery milestone achieved*
- Interactive category filtering (*All Activity*, *Practice*, *Voice Learning*, *Misconceptions*, *Revisions*, *Achievements*) plus concept-level filtering.
- Visual delta badges showing exact score changes ($\Delta M$) and before/after mastery percentages.
- Preloaded with realistic historical memory for demo student Alex Rivera dating back to initial diagnostic.

### 2. Explainable AI ("Why am I seeing this?")
- Transparent explainability component integrated across Student Dashboard, Today's Learning Plan, Adaptive Practice, and Revision Plan.
- Generates structured, deterministic explanations from actual learner profile metrics:
  - Concept mastery score and zone of proximal development
  - Recent incorrect answers and error patterns
  - Active misconceptions and verbal traps
  - Time decay since last spaced review
  - Metacognitive confidence calibration gap
- Displays priority badge (`high`, `medium`, `low`), specific bulleted reasons, supporting data chips, and 1-click action triggers.

### 3. Confidence vs Actual Knowledge Analysis (Metacognitive Calibration)
- Tracks student confidence vs actual question outcome and verbal reasoning depth across four quadrants:
  - 🔴 **Overconfident Trap**: High confidence, but incorrect answer or flawed reasoning.
  - 🔵 **Underconfident Hidden Strength**: Low confidence, but correct answer and sound reasoning.
  - 🟢 **Calibrated Mastery**: High confidence and strong performance.
  - 🟡 **Calibrated Growth Zone**: Low confidence and learning frontier.
- Overall calibration percentage score and personalized metacognitive coaching card: *"How Well Do You Know What You Know?"*.

### 4. Messy Speech → Structured AI Understanding Pipeline
- Visual 3-stage animated transformation pipeline:
  1. **Raw Student Voice**: Displays natural speech with acoustic fillers highlighted (`um`, `like`, `you know`, `uh`, `wait no`).
  2. **Structured AI Schema**: Wispr Flow normalization extracting Subject, Topic, Concept, Intent, Confidence, and Diagnosed Misconception.
  3. **Personalized AI Response**: Grounded pedagogical tutoring targeting the underlying confusion.
- Interactive showcase and toggle in voice dialogs to build student confidence in AI understanding.

---

## 🔐 Role-Based Authentication & Dual Layout Architecture

LearnFlow AI features strict Role-Based Access Control (RBAC) with completely segregated application layouts:

### 1. Dedicated Modern Login Page
- Clean, aesthetic authentication gateway with platform branding, tagline (*"Your voice-powered AI tutor that learns how you learn."*), and Wispr Flow status.
- **Judge & Demo Fast-Track Cards**:
  - 🎓 **Student Demo (Alex Rivera)**: Enter personalized adaptive learning workspace with voice tutoring, diagnostic testing, and living memory.
  - 👩‍🏫 **Teacher Demo (Dr. Priya Sharma)**: Enter class-wide learning intelligence workspace with cohort heatmaps and systemic triage.
- Support for personalized name input.

### 2. Independent Application Layouts
- **Student Layout**:
  - `StudentHeader`: Student branding, streak badge, Wispr Flow trigger, agents status, student profile menu, and logout modal.
  - `StudentSidebar`: Learning Modes (**Teach It Back**, **Socratic Mode**, **Concept Rescue**) + Student Learning Path (Dashboard, Intelligence Center, Learning Journey, Confidence Gap, Diagnostic Test, Concept Map, Adaptive Practice, Revision Plan, Misconceptions, Voice Tutor, Progress).
- **Teacher Layout**:
  - `TeacherHeader`: Teacher Command Center branding, active section indicator (*Class 10 - Section B*), class average mastery, teacher profile menu, and logout modal.
  - `TeacherSidebar`: Strictly teacher navigation (Teacher Overview, Class Analytics, Student Performance, Concept Heatmap, Misconception Insights, AI Learning Alerts, Targeted Learning Labs, Class Reports).

### 3. Route Guarding & Access Control
- Centralized `AuthContext` managing authentication state, tokens, user permissions, and route policies.
- Automatic route protection: Students attempting to access teacher routes are redirected to `dashboard`; Teachers attempting to access student-only practice routes are redirected to `teacher-overview`.
- Smooth logout confirmation modal with instant demo role switcher for evaluators.

---

## 🎯 Adaptive Learning Modes

### 1. Teach It Back (`/api/teach-back`)
- Feynman-style voice or text teaching mode where the student explains a chosen concept in their own words.
- Backend Gemini evaluation returns validated structured JSON:
  - `conceptsExplainedCorrectly`, `missingIdeas`, `misconceptions`, `qualityScore` (`0–100`), `masteryDelta`, and `feedbackSummary`.
- Updates concept mastery, logs detected misconceptions, persists `TeachBackRecord`, and records an event in **My Learning Journey**.

### 2. Socratic Mode (`/api/socratic-turn`)
- Guided inquiry dialogue where the tutor responds with **one guiding question** (never the answer), calibrated to the student's previous response and current mastery.
- After 3–4 turns, reveals a concise Socratic summary and a targeted synthesis practice question.
- Persists `SocraticSession` records and updates learner mastery and Learning Memory.

### 3. Concept Rescue (`/api/concept-rescue`)
- Triggers automatically when a student gets **3 wrong answers in a row** on the same concept or mastery drops **below 40%** (`"Let's try a different way to learn."`).
- Offers 5 alternative modalities: **Visual explanation** (circuit SVG), **Real-world analogy**, **Step-by-step**, **Voice conversation**, and **Mini challenge**.
- Persists `RescueEvent` records including `chosenMode` and tracks whether the student's **next answer improved** (`nextAnswerImproved`).

---

## 🤖 5-Agent Architecture

```
                       [ Student Voice Input ]
                                  │
                                  ▼
                    ┌───────────────────────────┐
                    │ Voice Intelligence Agent  │  (Wispr Flow Ingestion)
                    └─────────────┬─────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
┌──────────────────┐    ┌──────────────────┐     ┌──────────────────┐
│  Misconception   │    │  Learner Model   │     │ Adaptive Question│
│ Detection Agent  │    │      Agent       │     │ Generator Agent  │
└────────┬─────────┘    └─────────┬────────┘     └─────────┬────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                                  ▼
                    ┌───────────────────────────┐
                    │      Revision Agent       │  (Spaced Repetition)
                    └───────────────────────────┘
```

1. **Voice Intelligence Agent**: Ingests natural acoustic stream, filters verbal fillers ("um", "like"), resolves self-corrections, and outputs structured entity schemas.
2. **Learner Model Agent**: Updates concept weights, maintains knowledge matrix, and tracks confidence history.
3. **Misconception Detection Agent**: Diagnoses mental models in verbal explanations and classifies severity.
4. **Adaptive Question Generator**: Generates new problem sets calibrated to active learning frontiers.
5. **Revision Agent**: Computes optimal memory retrieval schedules based on retention decay curves.

---

## 📐 Adaptive Mastery Mathematical Model

Mastery score updates after every student interaction using:

$$\Delta M = \text{BaseOutcome} \times W_{\text{difficulty}} + \text{ReasoningScore} \times W_{\text{confidence}} - \text{MisconceptionPenalty}$$

- **Correct + Sound Reasoning:** $+12\%$ to $+15\%$
- **Correct + Guess / Weak Reasoning:** $+3\%$ to $+5\%$
- **Incorrect + Diagnosed Misconception:** $-8\%$ to $-10\%$
- **Repeated Mistake ($3\times$):** Priority intervention escalation flag.

---

## 🚀 LearnFlow AI 2.0 Intelligence & Classroom Suite

### 1. Misconception Library (12 Class 10 Physics – Electricity Entries)
- Curated diagnostic reference in **Misconceptions → Misconception Library** covering traps such as *"Current Gets Used Up by a Resistor"*, *"Parallel Resistors Add Up Directly"*, and *"Voltage Divides Across Parallel Branches"*.
- Each entry includes an `exampleStudentPhrase`, conceptual physics `explanation`, and `correctivePractice`.
- When reasoning evaluation detects a match (`/api/evaluate-reasoning`), it links directly to `libraryEntryId` and displays the corrective drill.

### 2. Difficulty Calibrator
- Deterministic calibration engine (`calibrateNextDifficulty`) evaluates recent accuracy, response time (`responseTimeMs`), self-reported confidence, and concept mastery.
- Automatically selects `easy`, `medium`, or `hard` questions and surfaces a transparent **"Why this difficulty?"** line above every adaptive practice prompt.

### 3. Prerequisite Path & Interactive Concept Graph
- Syllabus concepts track upstream dependencies (`CONCEPTS[].prerequisites`, e.g., *Resistance → Ohm's Law → Series Circuits*).
- When a concept struggles because an upstream prerequisite is below `60%`, Adaptive Practice and Concept Graph recommend the prerequisite first and highlight the dependency chain in rose/indigo.
- Concept Graph supports **pointer-drag pan, arrow-pad navigation, zoom controls (`75%–140%`), keyboard focus navigation, and an inspection drawer**.

### 4. Exam Countdown Planner & Model-Sync Alerts
- Students choose an exam date and syllabus concepts in **Exam Planner** (`exam-planner`) to build a day-by-day schedule blending weak-concept drills and spaced reviews.
- Whenever learner mastery or misconceptions mutate (`learnerModelVersion`), any existing plan sets `needsUpdate: true` and displays a **"Plan Updated Alert — Your Learner Model Changed"** banner with a **1-click "Re-sync Plan Now"** button.

### 5. Exam Readiness Score (`0–100`)
- Deterministic 4-component breakdown across **Concept Mastery (40 pts)**, **Retention Recency (20 pts)**, **Open Misconceptions (20 pts)**, and **Confidence Calibration (20 pts)**, paired with the **Top 3 score-boosting actions**.

### 6. Mastery Badges (5-Question Verification Challenge)
- Concepts at `>= 80%` mastery (including Alex Rivera's *Ohm's Law* at `85%`) unlock a **5-question Mastery Challenge** (`/api/mastery-challenge`) spanning `basic`, `application`, `misconception`, and `real-world` items.
- Scoring `>= 80%` (`4+ / 5`) awards a Gold/Silver Mastery Badge, updates mastery, and logs `'badge_earned'` in **My Learning Journey**.

### 7. Teacher Heatmap Drill-Down & AI Revision Lab Generator
- Clicking any cell or concept header in the **Teacher Concept Heatmap** opens a **Class Drill-Down Panel** displaying every student's concept mastery and open misconceptions (`misconceptionsByConcept`).
- Cluster alerts include a **"Generate Revision Lab"** button calling `POST /api/teacher/generate-lab`, returning validated JSON with a classroom walkthrough explanation, related misconception summary, and **3 interactive practice questions** with revealable answer keys.

### 8. Accessibility, Navigation & Export Enhancements
- **Grouped Student Sidebar**: Cleanly organized into **Learn**, **Track**, and **Plan**, plus a **4-item mobile bottom navigation bar** (*Dashboard*, *Practice*, *Concept Map*, *Exam Plan*).
- **3-Step Onboarding Tour**: First-time student sign-ins display a skippable guided tour (replayable from the profile menu).
- **Schema v2 Migration**: Pre-existing `localStorage` profiles automatically upgrade via `migrateLearnerProfile` without data loss.
- **Print & Export**: Both **Student Progress** and **Teacher Class Reports** provide **Print Report** (`@media print` hiding sidebar/chrome) and **Export JSON** downloads.

---

## 🚀 Running the Project

```bash
# Install dependencies
npm install

# Start full-stack development server with tsx
npm run dev

# Build for production
npm run build
npm run start
```

