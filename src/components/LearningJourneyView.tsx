import React, { useState } from 'react';
import { useLearner } from '../context/LearnerContext';
import { LearningMemoryEvent } from '../types/learning';
import {
  Brain,
  Filter,
  FileCheck2,
  Mic,
  Target,
  AlertTriangle,
  CheckCircle2,
  CalendarCheck2,
  Award,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Zap,
  BookOpenCheck,
  MessageCircleQuestion,
  LifeBuoy,
} from 'lucide-react';

interface LearningJourneyViewProps {
  onPracticeConcept?: (conceptId: string) => void;
  onOpenVoiceWithPrompt?: (prompt: string) => void;
}

export const LearningJourneyView: React.FC<LearningJourneyViewProps> = ({
  onPracticeConcept,
  onOpenVoiceWithPrompt,
}) => {
  const { profile, setActiveTab } = useLearner();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedConceptFilter, setSelectedConceptFilter] = useState<string>('all');

  const events = profile.learningJourney || [];

  // Filter logic
  const filteredEvents = events.filter((ev) => {
    // Category filter
    if (activeFilter === 'practice' && ev.eventType !== 'practice') return false;
    if (activeFilter === 'voice' && ev.eventType !== 'voice_query' && ev.eventType !== 'reasoning_analysis')
      return false;
    if (
      activeFilter === 'modes' &&
      ev.eventType !== 'teach_back' &&
      ev.eventType !== 'socratic' &&
      ev.eventType !== 'concept_rescue'
    )
      return false;
    if (
      activeFilter === 'misconceptions' &&
      ev.eventType !== 'misconception_detected' &&
      ev.eventType !== 'misconception_resolved'
    )
      return false;
    if (activeFilter === 'revisions' && ev.eventType !== 'revision' && ev.eventType !== 'exam_plan')
      return false;
    if (
      activeFilter === 'achievements' &&
      ev.eventType !== 'milestone' &&
      ev.eventType !== 'diagnostic' &&
      ev.eventType !== 'badge_earned'
    )
      return false;

    // Concept filter
    if (selectedConceptFilter !== 'all' && ev.conceptId !== selectedConceptFilter) {
      return false;
    }

    return true;
  });

  const getEventBadge = (type: LearningMemoryEvent['eventType']) => {
    switch (type) {
      case 'diagnostic':
        return {
          icon: FileCheck2,
          color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
          label: 'Diagnostic Test',
        };
      case 'voice_query':
        return {
          icon: Mic,
          color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
          label: 'Voice Learning (Wispr Flow)',
        };
      case 'reasoning_analysis':
        return {
          icon: Brain,
          color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
          label: 'Reasoning Analyzed',
        };
      case 'practice':
        return {
          icon: Target,
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
          label: 'Practice Drill',
        };
      case 'misconception_detected':
        return {
          icon: AlertTriangle,
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
          label: 'Misconception Detected',
        };
      case 'misconception_resolved':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
          label: 'Misconception Resolved',
        };
      case 'revision':
        return {
          icon: CalendarCheck2,
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
          label: 'Spaced Revision',
        };
      case 'exam_plan':
        return {
          icon: CalendarCheck2,
          color: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/25',
          label: 'Exam Countdown Plan',
        };
      case 'badge_earned':
        return {
          icon: Award,
          color: 'text-amber-300 bg-amber-500/15 border-amber-500/35',
          label: 'Mastery Badge Earned',
        };
      case 'milestone':
        return {
          icon: Award,
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
          label: 'Mastery Milestone',
        };
      case 'teach_back':
        return {
          icon: BookOpenCheck,
          color: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25',
          label: 'Teach It Back',
        };
      case 'socratic':
        return {
          icon: MessageCircleQuestion,
          color: 'text-purple-300 bg-purple-500/10 border-purple-500/25',
          label: 'Socratic Mode',
        };
      case 'concept_rescue':
        return {
          icon: LifeBuoy,
          color: 'text-amber-300 bg-amber-500/10 border-amber-500/25',
          label: 'Concept Rescue',
        };
      default:
        return {
          icon: Sparkles,
          color: 'text-slate-300 bg-slate-500/10 border-slate-500/20',
          label: 'Learning Activity',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
              <Brain className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
              Living Learner Memory
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white">
            🧠 My Learning Journey
          </h2>
          <p className="text-xs text-slate-400">
            Chronological memory log showing every diagnostic, spoken doubt, reasoning evaluation, and mastery evolution.
          </p>
        </div>

        {/* Total Events Count Badge */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-xl font-bold font-mono text-indigo-400">{events.length}</div>
            <div className="text-[10px] text-slate-400">Recorded Memories</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-xl font-bold font-mono text-emerald-400">{profile.overallMastery}%</div>
            <div className="text-[10px] text-slate-400">Current Mastery</div>
          </div>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
        {/* Type filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'all', label: 'All Activity' },
            { id: 'modes', label: 'Learning Modes' },
            { id: 'practice', label: 'Practice' },
            { id: 'voice', label: 'Voice Learning' },
            { id: 'misconceptions', label: 'Misconceptions' },
            { id: 'revisions', label: 'Revisions' },
            { id: 'achievements', label: 'Achievements' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-indigo-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Concept Dropdown Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Concept:</span>
          <select
            value={selectedConceptFilter}
            onChange={(e) => setSelectedConceptFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Concepts</option>
            <option value="series-circuits">Series Circuits</option>
            <option value="parallel-circuits">Parallel Circuits</option>
            <option value="ohms-law">Ohm's Law</option>
            <option value="electric-current">Electric Current</option>
            <option value="voltage">Voltage</option>
            <option value="resistance">Resistance</option>
            <option value="electrical-power">Electrical Power</option>
          </select>
        </div>
      </div>

      {/* Chronological Timeline Container */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-cyan-500 before:to-slate-800">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((ev, index) => {
            const badge = getEventBadge(ev.eventType);
            const Icon = badge.icon;
            const hasDelta = ev.masteryBefore !== undefined && ev.masteryAfter !== undefined;
            const delta = hasDelta ? ev.masteryAfter! - ev.masteryBefore! : 0;

            return (
              <div key={ev.id} className="relative group">
                {/* Timeline node icon */}
                <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-950 border-2 border-indigo-500 flex items-center justify-center text-indigo-400 shadow-md shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>

                {/* Timeline Event Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-md shadow-slate-950/40">
                  {/* Event Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="text-[11px] font-semibold text-indigo-300">
                        {ev.concept}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{ev.timestamp}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white mb-1">
                      {ev.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {ev.description}
                    </p>
                  </div>

                  {/* Student Action & AI Insight */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1 text-xs">
                    {ev.studentAction && (
                      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px]">
                        <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                          Student Action
                        </span>
                        <p className="text-slate-300 italic">{ev.studentAction}</p>
                      </div>
                    )}

                    {ev.aiInsight && (
                      <div className="p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-[11px]">
                        <span className="text-[10px] font-bold uppercase text-indigo-400 block mb-0.5">
                          AI Pedagogical Insight
                        </span>
                        <p className="text-slate-200">{ev.aiInsight}</p>
                      </div>
                    )}
                  </div>

                  {/* Mastery Change or Misconception Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                    <div className="flex items-center gap-2">
                      {hasDelta && delta !== 0 && (
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded ${
                            delta > 0
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          Mastery: {ev.masteryBefore}% → {ev.masteryAfter}% ({delta > 0 ? '+' : ''}{delta}%)
                        </span>
                      )}

                      {ev.misconceptionTitle && (
                        <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                          Trap: {ev.misconceptionTitle}
                        </span>
                      )}
                    </div>

                    {/* Action button */}
                    <button
                      onClick={() => {
                        if (onPracticeConcept && ev.conceptId) {
                          onPracticeConcept(ev.conceptId);
                        } else {
                          setActiveTab('practice');
                        }
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <span>Practice {ev.concept}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2 text-xs text-slate-400">
            <Brain className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="font-semibold text-slate-300">No events found matching this filter</p>
            <p>Try switching filter tabs or complete an adaptive practice question!</p>
          </div>
        )}
      </div>
    </div>
  );
};
