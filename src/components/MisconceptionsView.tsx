import React, { useState, useMemo } from 'react';
import { useLearner } from '../context/LearnerContext';
import {
  CONCEPTS,
  MISCONCEPTION_LIBRARY,
  matchMisconceptionLibrary,
} from '../data/syllabus';
import { Misconception } from '../types/learning';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Target,
  BookOpen,
  Search,
  Library,
} from 'lucide-react';

interface MisconceptionsViewProps {
  onPracticeMisconception?: (conceptId: string) => void;
}

export const MisconceptionsView: React.FC<MisconceptionsViewProps> = ({
  onPracticeMisconception,
}) => {
  const { profile, resolveMisconception, setActiveTab, showToast } = useLearner();
  const [viewMode, setViewMode] = useState<'detected' | 'library'>('detected');
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [conceptFilter, setConceptFilter] = useState<string>('all');
  const [practicingId, setPracticingId] = useState<string | null>(null);

  const filteredMisconceptions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return profile.misconceptions.filter((m) => {
      if (filter !== 'all' && m.status !== filter) return false;
      if (conceptFilter !== 'all' && m.conceptId !== conceptFilter) return false;
      if (
        q &&
        !m.title.toLowerCase().includes(q) &&
        !m.conceptName.toLowerCase().includes(q) &&
        !m.studentExplanationSnippet.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [profile.misconceptions, filter, conceptFilter, searchQuery]);

  const filteredLibrary = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return MISCONCEPTION_LIBRARY.filter((entry) => {
      if (conceptFilter !== 'all' && entry.conceptId !== conceptFilter) return false;
      if (
        q &&
        !entry.name.toLowerCase().includes(q) &&
        !entry.concept.toLowerCase().includes(q) &&
        !entry.exampleStudentPhrase.toLowerCase().includes(q) &&
        !entry.explanation.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [conceptFilter, searchQuery]);

  const activeCount = profile.misconceptions.filter((m) => m.status === 'active').length;
  const resolvedCount = profile.misconceptions.filter((m) => m.status === 'resolved').length;

  const handleDebunkAction = (m: Misconception) => {
    setPracticingId(m.id);
    setTimeout(() => {
      resolveMisconception(m.id);
      setPracticingId(null);
      showToast(`Cleared misconception: "${m.title}"`, 'success');
    }, 650);
  };

  const launchDrill = (conceptId: string) => {
    if (onPracticeMisconception) {
      onPracticeMisconception(conceptId);
    } else {
      setActiveTab('practice');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-rose-500/20 text-rose-300">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Misconception Insights &amp; Physics Library
            </h2>
          </div>
          <p className="text-xs text-slate-300">
            LearnFlow AI matches flawed reasoning against our 12-entry Class 10 Electricity Misconception Library and recommends targeted fixes.
          </p>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs">
            <span className="text-slate-300">Active: </span>
            <strong className="text-rose-300 font-mono tabular-nums">{activeCount}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
            <span className="text-slate-300">Resolved: </span>
            <strong className="text-emerald-300 font-mono tabular-nums">{resolvedCount}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs">
            <span className="text-slate-300">Library: </span>
            <strong className="text-indigo-300 font-mono tabular-nums">
              {MISCONCEPTION_LIBRARY.length}
            </strong>
          </div>
        </div>
      </div>

      {/* Mode Switcher + Search & Concept Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setViewMode('detected')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'detected'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Detected Misconceptions ({profile.misconceptions.length})</span>
          </button>

          <button
            onClick={() => setViewMode('library')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'library'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Library className="w-3.5 h-3.5" />
            <span>Misconception Library ({MISCONCEPTION_LIBRARY.length})</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-300 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search misconceptions"
              placeholder="Search phrase or trap..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400"
            />
          </div>

          <select
            value={conceptFilter}
            onChange={(e) => setConceptFilter(e.target.value)}
            aria-label="Filter by concept"
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-400"
          >
            <option value="all">All Concepts</option>
            {CONCEPTS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub-filter tabs for Detected view */}
      {viewMode === 'detected' && (
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          {(['all', 'active', 'resolved'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              {tab} Misconceptions
            </button>
          ))}
        </div>
      )}

      {/* VIEW 1: DETECTED MISCONCEPTIONS */}
      {viewMode === 'detected' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMisconceptions.length > 0 ? (
            filteredMisconceptions.map((m) => {
              const isResolved = m.status === 'resolved';
              const libMatch =
                (m.libraryEntryId &&
                  MISCONCEPTION_LIBRARY.find((e) => e.id === m.libraryEntryId)) ||
                matchMisconceptionLibrary(
                  `${m.title} ${m.studentExplanationSnippet}`,
                  m.conceptId
                );

              return (
                <div
                  key={m.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                    isResolved
                      ? 'bg-slate-950/40 border-slate-800/80 opacity-80'
                      : 'bg-slate-900 border-slate-800 shadow-md shadow-slate-950/50 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-200">
                          {m.conceptName}
                        </span>
                        {libMatch && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">
                            Library #{libMatch.id.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isResolved
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : m.severity === 'high'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {isResolved ? 'Resolved' : `${m.severity.toUpperCase()} Priority`}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white leading-snug">{m.title}</h3>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 block mb-1">
                        Detected Student Reasoning
                      </span>
                      <p className="text-slate-200 italic text-xs">
                        &quot;{m.studentExplanationSnippet}&quot;
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-indigo-950/35 border border-indigo-500/25 text-xs space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">
                        Physical Reality &amp; Library Fix
                      </span>
                      <p className="text-slate-200 text-xs leading-relaxed font-sans">
                        {libMatch?.explanation || m.aiCorrection}
                      </p>
                      {libMatch && (
                        <p className="text-[11px] text-cyan-200 pt-1 border-t border-indigo-500/20">
                          <strong>Corrective Drill: </strong>
                          {libMatch.correctivePractice}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Encountered {m.timesEncountered} times</span>
                    </div>

                    {!isResolved ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDebunkAction(m)}
                          disabled={practicingId === m.id}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                        >
                          {practicingId === m.id ? 'Clearing...' : 'Mark Cleared'}
                        </button>

                        <button
                          onClick={() => launchDrill(m.conceptId)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                        >
                          <span>Corrective Drill</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-emerald-300 font-semibold text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Conceptual mastery verified</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 p-10 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Misconceptions in This View</h4>
              <p className="text-xs text-slate-300">
                Try clearing search filters or explore our 12-entry Physics Misconception Library.
              </p>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: 12-ENTRY CLASS 10 PHYSICS MISCONCEPTION LIBRARY */}
      {viewMode === 'library' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLibrary.length > 0 ? (
            filteredLibrary.map((entry) => {
              const isDetectedInProfile = profile.misconceptions.some(
                (m) =>
                  m.status === 'active' &&
                  (m.libraryEntryId === entry.id ||
                    m.title.toLowerCase() === entry.name.toLowerCase())
              );

              return (
                <div
                  key={entry.id}
                  className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                    isDetectedInProfile
                      ? 'bg-amber-950/15 border-amber-500/40'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 text-[10px] font-bold uppercase">
                          {entry.concept}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-200 text-[10px] font-mono font-bold">
                          {entry.id.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isDetectedInProfile && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/40 text-[10px] font-bold">
                            Active in Your Model
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${
                            entry.severity === 'high'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : entry.severity === 'medium'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                          }`}
                        >
                          {entry.severity}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-white leading-snug">{entry.name}</h3>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 block mb-1">
                        Example Student Phrase
                      </span>
                      <p className="text-slate-200 italic">{entry.exampleStudentPhrase}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs space-y-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block mb-0.5">
                          Why This Happens &amp; Physics Fix
                        </span>
                        <p className="text-slate-200 leading-relaxed">{entry.explanation}</p>
                      </div>
                      <div className="pt-1.5 border-t border-indigo-500/20">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block mb-0.5">
                          Corrective Practice
                        </span>
                        <p className="text-slate-200">{entry.correctivePractice}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-300 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Class 10 Electricity Catalog</span>
                    </span>
                    <button
                      onClick={() => launchDrill(entry.conceptId)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
                    >
                      <Target className="w-3.5 h-3.5" />
                      <span>Practice Corrective Drill</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 p-10 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <Library className="w-9 h-9 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Matching Library Entries</h4>
              <p className="text-xs text-slate-300">
                Clear the search input or select &quot;All Concepts&quot; to browse all 12 entries.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

