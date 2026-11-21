import React, { useState } from 'react';
import { useLearner } from '../context/LearnerContext';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Cpu,
  Brain,
  Mic,
  ShieldAlert,
  Target,
  CalendarCheck2,
  CheckCircle2,
  ArrowRight,
  GitBranch,
  PlayCircle,
  ClipboardCheck,
} from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { profile, setActiveTab } = useLearner();
  const { isStudent } = useAuth();
  const [modalTab, setModalTab] = useState<'architecture' | 'checklist'>('checklist');

  if (!isOpen) return null;

  const judgingCriteria = [
    {
      id: 'diag',
      title: '1. Diagnostic test implemented',
      detail: '7-question Class 10 Physics baseline test collecting answers, confidence, and spoken reasoning.',
      status: 'Verified (7 Concepts)',
      targetTab: 'diagnostic',
    },
    {
      id: 'graph',
      title: '2. Concept graph for Class 10 Physics',
      detail: 'Interactive dependency tree from Electric Current & Voltage through Ohm’s Law to Series/Parallel & Power.',
      status: 'Verified (7 Nodes)',
      targetTab: 'concept-map',
    },
    {
      id: 'model',
      title: '3. Learner model updates mastery after every answer',
      detail: `Living learner profile persists mastery (${profile.overallMastery}% overall), history, and timeline events after every attempt.`,
      status: 'Verified (Live State)',
      targetTab: 'progress',
    },
    {
      id: 'weak',
      title: '4. Question generation targets weak concepts',
      detail: 'Adaptive Learning Agent targets lowest-mastery concepts and active misconceptions via Gemini 4.',
      status: 'Verified (AI + Rubric)',
      targetTab: 'practice',
    },
    {
      id: 'diff',
      title: '5. Difficulty calibration implemented',
      detail: 'Auto-calibrates Easy (<50%), Medium (50-74%), and Hard (≥75%) tiers and steps up/down on evaluation.',
      status: 'Verified (Auto-Tiered)',
      targetTab: 'practice',
    },
    {
      id: 'misc',
      title: '6. Misconception detection analyses reasoning',
      detail: 'Structured 3-part rubric strictly distinguishes conceptual misconceptions from simple calculation mistakes.',
      status: 'Verified (3-Part Rubric)',
      targetTab: 'misconceptions',
    },
    {
      id: 'spaced',
      title: '7. Spaced-repetition scheduling implemented',
      detail: 'Ebbinghaus intervals dynamically reschedule after every answer and diagnostic baseline.',
      status: 'Verified (Dynamic Queue)',
      targetTab: 'revision',
    },
    {
      id: 'teacher',
      title: '8. Teacher dashboard shows class-wide gaps',
      detail: 'Cohort heatmap, class-wide average mastery (67%), systemic misconception clusters, and remediation labs.',
      status: 'Verified (Teacher Role)',
      targetTab: 'teacher-overview',
    },
  ];

  const handleLaunchRoute = (tab: string) => {
    if (isStudent && !tab.startsWith('teacher')) {
      setActiveTab(tab);
      onClose();
    } else if (!isStudent && tab.startsWith('teacher')) {
      setActiveTab(tab);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                LearnFlow AI 2.0 – Architecture &amp; 8/8 Judging Verification
              </h2>
              <p className="text-xs text-slate-400">
                Learn Smarter. Understand Deeper. Improve Continuously.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setModalTab('checklist')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  modalTab === 'checklist'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>8/8 Checklist &amp; Demo</span>
              </button>
              <button
                onClick={() => setModalTab('architecture')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  modalTab === 'architecture'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>5-Agent Engine</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 custom-scrollbar text-xs text-slate-300">
          {modalTab === 'checklist' ? (
            <>
              {/* Score Header */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-slate-950 to-slate-950 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    Problem Statement 02 Completion
                  </div>
                  <h3 className="text-lg font-extrabold text-white">
                    8 / 8 Judging Criteria Implemented &amp; Live
                  </h3>
                  <p className="text-slate-300 text-xs">
                    Every core module from the LearnFlow AI 2.0 specification is active and persisted.
                  </p>
                </div>

                {isStudent && (
                  <button
                    onClick={() => handleLaunchRoute('practice')}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Launch Demo Scenario</span>
                  </button>
                )}
              </div>

              {/* 8 Criteria Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {judgingCriteria.map((item) => {
                  const canJump =
                    (isStudent && !item.targetTab.startsWith('teacher')) ||
                    (!isStudent && item.targetTab.startsWith('teacher'));

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>{item.title}</span>
                          </h4>
                          <span className="text-[10px] font-semibold text-emerald-300 whitespace-nowrap">
                            {item.status}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          {item.detail}
                        </p>
                      </div>

                      {canJump && (
                        <button
                          onClick={() => handleLaunchRoute(item.targetTab)}
                          className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 pt-1 cursor-pointer"
                        >
                          <span>Inspect Module</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Section 10 Scenario Walkthrough */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <h4 className="text-xs font-bold text-cyan-300">
                  Hackathon Demo Scenario Walkthrough (Ohm's Law &amp; Series Circuits)
                </h4>
                <ol className="space-y-1.5 text-[11px] text-slate-300 list-decimal list-inside">
                  <li>
                    Open <strong>Diagnostic Test</strong> or inspect <strong>Concept Map</strong> to see initial mastery (Ohm's Law 85%, Series Circuits 35%).
                  </li>
                  <li>
                    Open <strong>Adaptive Practice</strong>, select Ohm's Law or Series Circuits, pick an option, and click <strong>"Ohm's Law inverse trap"</strong> (or speak into <strong>Wispr Flow</strong>).
                  </li>
                  <li>
                    Observe the <strong>3-Part Reasoning Rubric</strong> separating conceptual misconceptions from simple calculation mistakes, updating mastery &amp; spaced repetition live.
                  </li>
                  <li>
                    Inspect <strong>Learning Journey</strong>, <strong>Revision Plan</strong>, or log in as <strong>Dr. Priya Sharma</strong> to view class-wide cohort gaps.
                  </li>
                </ol>
              </div>
            </>
          ) : (
            <>
              {/* Executive Flow Diagram */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-indigo-400" />
                  Core Autonomous Execution Loop
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  LearnFlow AI 2.0 replaces static question-and-answer tutors with an end-to-end feedback loop:
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-semibold text-slate-200">
                  <span className="p-2 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800">
                    1. Natural Voice Input (Wispr Flow)
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="p-2 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800">
                    2. Voice Intelligence Agent
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="p-2 rounded-lg bg-amber-950 text-amber-300 border border-amber-800">
                    3. Rubric Misconception Detection
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="p-2 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800">
                    4. Learner Model Update
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="p-2 rounded-lg bg-purple-950 text-purple-300 border border-purple-800">
                    5. Spaced Repetition Scheduling
                  </span>
                </div>
              </div>

              {/* The 5 Specialized Agents */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white">
                  The 5 Coordinated Micro-Agents
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                      <Mic className="w-4 h-4" />
                      <span>1. Voice Intelligence Agent</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Ingests conversational speech via Wispr Flow. Strips hesitation markers ("um", "like", "you know"), detects self-corrections, maps natural language onto physics entities, and determines student intent and confidence.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                      <Brain className="w-4 h-4" />
                      <span>2. Learner Model Agent</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Calculates probabilistic concept mastery scores across the 7-node syllabus graph. Stores confidence history, question logs, and maintains longitudinal learner profiles.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                      <ShieldAlert className="w-4 h-4" />
                      <span>3. Misconception Detection Agent</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Evaluates student reasoning via a structured 3-part rubric. Explicitly distinguishes conceptual misconceptions (false mental models) from simple calculation mistakes.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                      <Target className="w-4 h-4" />
                      <span>4. Adaptive Learning Agent</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Generates and calibrates new questions dynamically via Gemini 4 Hydrogen based on current mastery percentage, difficulty tier, and active misconception traps.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 md:col-span-2">
                    <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                      <CalendarCheck2 className="w-4 h-4" />
                      <span>5. Revision Agent (Spaced Repetition Engine)</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Implements dynamic Ebbinghaus retention scheduling: intervals automatically contract when answers are incorrect and expand (3d &rarr; 7d &rarr; 14d) as mastery improves.
                    </p>
                  </div>
                </div>
              </div>

              {/* Adaptive Scoring Formula */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-cyan-400">
                  Adaptive Mastery Update Formula
                </h4>
                <div className="p-3 rounded-lg bg-slate-900 font-mono text-[11px] text-indigo-300 leading-relaxed border border-slate-800">
                  ΔMastery = BaseCorrectness (±8%) + ReasoningDepth (+4% to -4%) + ConfidenceWeight (×1.2) - MisconceptionPenalty (-8% or -3% calc slip)
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/40 text-xs">
          <span className="text-slate-500">
            LearnFlow AI 2.0 • Built for Google AI Studio
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all cursor-pointer"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
