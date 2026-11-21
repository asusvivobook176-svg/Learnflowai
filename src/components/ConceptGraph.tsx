import React, { useState, useMemo, useRef } from 'react';
import { useLearner } from '../context/LearnerContext';
import { CONCEPTS } from '../data/syllabus';
import {
  computePrerequisiteRecommendation,
  getPrerequisiteChainForConcept,
} from '../utils/intelligence';
import {
  Zap,
  Target,
  ArrowRight,
  AlertTriangle,
  Clock,
  Mic,
  ZoomIn,
  ZoomOut,
  Maximize2,
  GitBranch,
  Move,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
} from 'lucide-react';

interface ConceptGraphProps {
  onSelectConceptForPractice?: (conceptId: string) => void;
  onOpenVoiceForConcept?: (conceptName: string) => void;
}

interface NodePosition {
  id: string;
  x: number;
  y: number;
  title: string;
  category: string;
}

export const ConceptGraph: React.FC<ConceptGraphProps> = ({
  onSelectConceptForPractice,
  onOpenVoiceForConcept,
}) => {
  const { profile, setActiveTab } = useLearner();
  const [selectedConceptId, setSelectedConceptId] = useState<string>('series-circuits');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; origX: number; origY: number } | null>(
    null
  );

  const nodes: NodePosition[] = [
    { id: 'electricity-root', x: 400, y: 48, title: 'Electricity (Class 10)', category: 'Root' },
    { id: 'electric-current', x: 170, y: 150, title: 'Electric Current', category: 'Fundamentals' },
    { id: 'voltage', x: 400, y: 150, title: 'Voltage & Potential', category: 'Fundamentals' },
    { id: 'resistance', x: 630, y: 150, title: 'Resistance & Factors', category: 'Fundamentals' },
    { id: 'ohms-law', x: 460, y: 268, title: "Ohm's Law (V = I·R)", category: 'Laws' },
    { id: 'series-circuits', x: 185, y: 392, title: 'Series Circuits', category: 'Circuits' },
    { id: 'parallel-circuits', x: 425, y: 392, title: 'Parallel Circuits', category: 'Circuits' },
    { id: 'electrical-power', x: 660, y: 392, title: 'Electrical Power', category: 'Energy' },
  ];

  const prerequisiteChain = useMemo(
    () => getPrerequisiteChainForConcept(selectedConceptId),
    [selectedConceptId]
  );

  const prerequisiteRec = useMemo(
    () => computePrerequisiteRecommendation(profile, selectedConceptId),
    [profile, selectedConceptId]
  );

  // Build edges directly from CONCEPTS[].prerequisites plus root connections
  const edges = useMemo(() => {
    const list: { from: string; to: string; isRootEdge: boolean }[] = [
      { from: 'electricity-root', to: 'electric-current', isRootEdge: true },
      { from: 'electricity-root', to: 'voltage', isRootEdge: true },
    ];
    CONCEPTS.forEach((c) => {
      c.prerequisites.forEach((preId) => {
        list.push({ from: preId, to: c.id, isRootEdge: false });
      });
    });
    return list;
  }, []);

  const getStatusColor = (percentage: number) => {
    if (percentage >= 75)
      return {
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        label: 'Strong Mastery',
        stroke: '#10b981',
      };
    if (percentage >= 50)
      return {
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        label: 'Developing',
        stroke: '#f59e0b',
      };
    return {
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      label: 'Weak Concept',
      stroke: '#f43f5e',
    };
  };

  const selectedConcept = CONCEPTS.find((c) => c.id === selectedConceptId);
  const selectedMastery = selectedConceptId
    ? profile.masteryByConcept[selectedConceptId]
    : null;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, [role="button"]')) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      origX: panOffset.x,
      origY: panOffset.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPanOffset({
      x: Math.max(-220, Math.min(220, dragStartRef.current.origX + dx)),
      y: Math.max(-160, Math.min(160, dragStartRef.current.origY + dy)),
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const resetViewport = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Legend */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-400" />
              Interactive Prerequisite &amp; Concept Graph
            </h2>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">
              Living Topology
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Drag to pan or use zoom/arrow controls. Selecting a concept highlights its upstream prerequisite chain.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-slate-200 font-medium">Strong (&ge;75%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-slate-200 font-medium">Developing (50–74%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="text-slate-200 font-medium">Weak (&lt;50%)</span>
          </div>
        </div>
      </div>

      {/* Main Canvas & Details Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Graph Canvas */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className={`lg:col-span-8 rounded-2xl bg-slate-950 border border-slate-800 p-4 relative overflow-hidden flex flex-col justify-between min-h-[520px] ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {/* Zoom & Pan Controls */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-slate-900/95 border border-slate-700 rounded-xl p-1 shadow-md">
            <div className="hidden sm:flex items-center gap-0.5 pr-1.5 border-r border-slate-700">
              <button
                type="button"
                aria-label="Pan left"
                onClick={() => setPanOffset((p) => ({ ...p, x: Math.min(220, p.x + 30) }))}
                className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label="Pan up"
                onClick={() => setPanOffset((p) => ({ ...p, y: Math.min(160, p.y + 30) }))}
                className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label="Pan down"
                onClick={() => setPanOffset((p) => ({ ...p, y: Math.max(-160, p.y - 30) }))}
                className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label="Pan right"
                onClick={() => setPanOffset((p) => ({ ...p, x: Math.max(-220, p.x - 30) }))}
                className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.75, +(z - 0.1).toFixed(2)))}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono tabular-nums text-slate-200 px-1">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(1.4, +(z + 0.1).toFixed(2)))}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={resetViewport}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              aria-label="Reset pan and zoom"
              title="Reset view"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Active Prerequisite Chain Pill */}
          <div className="relative z-10 flex flex-wrap items-center gap-1.5 text-[11px] mb-2 pr-44">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 font-semibold">
              <GitBranch className="w-3 h-3" />
              <span>Prerequisite Chain:</span>
            </span>
            {prerequisiteChain.map((cid, idx) => {
              const meta = CONCEPTS.find((c) => c.id === cid);
              const pct = profile.masteryByConcept[cid]?.masteryPercentage ?? 50;
              const isWeak = pct < 60 && cid !== selectedConceptId;
              return (
                <React.Fragment key={cid}>
                  {idx > 0 && <span className="text-slate-400">→</span>}
                  <button
                    type="button"
                    onClick={() => setSelectedConceptId(cid)}
                    className={`px-2 py-0.5 rounded-md font-semibold border cursor-pointer ${
                      cid === selectedConceptId
                        ? 'bg-indigo-600 text-white border-indigo-400'
                        : isWeak
                        ? 'bg-rose-500/20 text-rose-200 border-rose-500/40'
                        : 'bg-slate-900 text-slate-200 border-slate-700'
                    }`}
                  >
                    {meta?.name || cid} ({pct}%)
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          {/* SVG Diagram */}
          <div className="w-full flex-1 flex items-center justify-center overflow-hidden py-2">
            <div
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                transformOrigin: 'center center',
              }}
              className="transition-transform duration-150"
            >
              <svg width="800" height="460" className="select-none">
                <defs>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Prerequisite & Syllabus Edges */}
                {edges.map((edge) => {
                  const parent = nodes.find((n) => n.id === edge.from);
                  const child = nodes.find((n) => n.id === edge.to);
                  if (!parent || !child) return null;

                  const inChain =
                    prerequisiteChain.includes(edge.from) &&
                    prerequisiteChain.includes(edge.to);
                  const fromMastery = profile.masteryByConcept[edge.from]?.masteryPercentage ?? 50;
                  const isWeakUpstreamEdge = inChain && !edge.isRootEdge && fromMastery < 60;
                  const strokeColor = isWeakUpstreamEdge
                    ? '#f43f5e'
                    : inChain
                    ? '#818cf8'
                    : '#334155';

                  const d = `M ${parent.x} ${parent.y + 22} C ${parent.x} ${
                    (parent.y + child.y) / 2
                  }, ${child.x} ${(parent.y + child.y) / 2}, ${child.x} ${child.y - 22}`;

                  return (
                    <g key={`edge-${edge.from}-${edge.to}`}>
                      <path
                        d={d}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={inChain ? '2.5' : '1.4'}
                        strokeDasharray={inChain ? 'none' : '4 4'}
                        opacity={inChain ? 1 : 0.7}
                      />
                      {inChain && (
                        <circle r="3.5" fill={strokeColor} filter="url(#glow)">
                          <animateMotion dur="2.8s" repeatCount="indefinite" path={d} />
                        </circle>
                      )}
                    </g>
                  );
                })}

                {/* Nodes */}
                {nodes.map((node) => {
                  const isRoot = node.id === 'electricity-root';
                  const isSelected = selectedConceptId === node.id;
                  const inChain = prerequisiteChain.includes(node.id);
                  const mastery = profile.masteryByConcept[node.id];
                  const pct = mastery?.masteryPercentage ?? 50;
                  const status = mastery ? getStatusColor(pct) : null;
                  const isWeakPrerequisite = inChain && !isSelected && pct < 60;

                  return (
                    <g
                      key={node.id}
                      role={isRoot ? undefined : 'button'}
                      tabIndex={isRoot ? undefined : 0}
                      aria-label={
                        isRoot
                          ? node.title
                          : `${node.title}, ${pct}% mastery${
                              isWeakPrerequisite ? ', weak prerequisite' : ''
                            }`
                      }
                      onClick={() => !isRoot && setSelectedConceptId(node.id)}
                      onKeyDown={(e) => {
                        if (!isRoot && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          setSelectedConceptId(node.id);
                        }
                      }}
                      className={`focus:outline-none ${
                        isRoot ? 'cursor-default' : 'cursor-pointer hover:opacity-95'
                      }`}
                    >
                      <rect
                        x={node.x - 78}
                        y={node.y - 22}
                        width="156"
                        height="44"
                        rx="12"
                        fill={
                          isRoot
                            ? '#1e1b4b'
                            : isSelected
                            ? '#1e293b'
                            : inChain
                            ? '#172554'
                            : '#0f172a'
                        }
                        stroke={
                          isRoot
                            ? '#6366f1'
                            : isSelected
                            ? status?.stroke || '#818cf8'
                            : isWeakPrerequisite
                            ? '#f43f5e'
                            : inChain
                            ? '#818cf8'
                            : '#334155'
                        }
                        strokeWidth={isSelected || isWeakPrerequisite ? '2.5' : '1.4'}
                        filter={isSelected || isWeakPrerequisite ? 'url(#glow)' : undefined}
                      />

                      <text
                        x={node.x}
                        y={node.y - 2}
                        textAnchor="middle"
                        fill="#f8fafc"
                        fontSize="11"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                      >
                        {node.title.length > 21 ? node.title.slice(0, 19) + '…' : node.title}
                      </text>

                      <text
                        x={node.x}
                        y={node.y + 13}
                        textAnchor="middle"
                        fill={isRoot ? '#a5b4fc' : status?.stroke || '#cbd5e1'}
                        fontSize="10"
                        fontWeight="600"
                        fontFamily="sans-serif"
                      >
                        {isRoot ? 'Root Syllabus' : `${pct}% Mastery`}
                      </text>

                      {!isRoot && (
                        <circle
                          cx={node.x + 64}
                          cy={node.y}
                          r="4"
                          fill={status?.stroke || '#94a3b8'}
                        />
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-300">
            <Move className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              Drag canvas to pan · Tab + Enter on any node · Highlighted edges trace upstream prerequisites
            </span>
          </div>
        </div>

        {/* Selected Concept Inspection Drawer */}
        <div className="lg:col-span-4 rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between space-y-4">
          {selectedConcept && selectedMastery ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    {selectedConcept.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      getStatusColor(selectedMastery.masteryPercentage).badge
                    }`}
                  >
                    {getStatusColor(selectedMastery.masteryPercentage).label}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">{selectedConcept.name}</h3>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedConcept.shortDescription}
                </p>
              </div>

              {/* Prerequisite Path Check Card */}
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                  prerequisiteRec.hasWeakPrerequisite
                    ? 'bg-rose-950/30 border-rose-500/40'
                    : 'bg-emerald-950/20 border-emerald-500/30'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <GitBranch className="w-3.5 h-3.5 text-indigo-300" />
                  <span>
                    {prerequisiteRec.hasWeakPrerequisite
                      ? `Prerequisite Alert: ${prerequisiteRec.recommendedConceptName}`
                      : 'Prerequisite Path Clear'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-200 leading-relaxed">
                  {prerequisiteRec.reason}
                </p>
                {prerequisiteRec.hasWeakPrerequisite && (
                  <button
                    onClick={() => {
                      setSelectedConceptId(prerequisiteRec.recommendedConceptId);
                      if (onSelectConceptForPractice) {
                        onSelectConceptForPractice(prerequisiteRec.recommendedConceptId);
                      }
                    }}
                    className="w-full py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Practice Prerequisite: {prerequisiteRec.recommendedConceptName}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Mastery Meter */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300">Current Mastery</span>
                  <span className="text-white font-mono tabular-nums text-sm">
                    {selectedMastery.masteryPercentage}%
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${selectedMastery.masteryPercentage}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      selectedMastery.masteryPercentage >= 75
                        ? 'bg-emerald-500'
                        : selectedMastery.masteryPercentage >= 50
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1">
                  <span>
                    Questions: {selectedMastery.questionsCorrect} / {selectedMastery.questionsAttempted}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Last: {selectedMastery.lastStudiedDate}
                  </span>
                </div>
              </div>

              {selectedConcept.keyFormula && (
                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/25 text-xs">
                  <span className="text-[10px] font-bold uppercase text-indigo-300 block mb-1">
                    Key Physics Formula
                  </span>
                  <code className="text-xs font-mono font-bold text-indigo-100">
                    {selectedConcept.keyFormula}
                  </code>
                </div>
              )}

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Common Exam Traps
                </span>
                <ul className="space-y-1 text-xs text-slate-300">
                  {selectedConcept.commonMisconceptions.map((misc, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{misc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-300">
              <Zap className="w-8 h-8 text-slate-500 mb-2" />
              <p className="text-xs">Select any concept on the map to inspect its details</p>
            </div>
          )}

          {selectedConcept && (
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <button
                onClick={() => {
                  if (onSelectConceptForPractice) {
                    onSelectConceptForPractice(selectedConcept.id);
                  } else {
                    setActiveTab('practice');
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Target className="w-4 h-4" />
                <span>Practice {selectedConcept.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  if (onOpenVoiceForConcept) {
                    onOpenVoiceForConcept(selectedConcept.name);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-medium border border-slate-700 transition-all cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5 text-indigo-400" />
                <span>Ask Voice Tutor About This</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

