import React, { useState } from 'react';
import { useLearner } from '../context/LearnerContext';
import { CONCEPTS } from '../data/syllabus';
import { Concept } from '../types/learning';
import {
  Sparkles,
  Zap,
  Target,
  ArrowRight,
  RotateCcw,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Mic,
  ZoomIn,
  ZoomOut,
  Maximize2,
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
  parentId?: string;
  category: string;
}

export const ConceptGraph: React.FC<ConceptGraphProps> = ({
  onSelectConceptForPractice,
  onOpenVoiceForConcept,
}) => {
  const { profile, setActiveTab } = useLearner();
  const [selectedConceptId, setSelectedConceptId] = useState<string>('series-circuits');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Layout node coordinates for SVG graph
  const nodes: NodePosition[] = [
    { id: 'electricity-root', x: 400, y: 50, title: 'Electricity (Class 10)', category: 'Root' },
    { id: 'electric-current', x: 160, y: 160, title: 'Electric Current', parentId: 'electricity-root', category: 'Fundamentals' },
    { id: 'voltage', x: 400, y: 160, title: 'Voltage & Potential', parentId: 'electricity-root', category: 'Fundamentals' },
    { id: 'resistance', x: 640, y: 160, title: 'Resistance & Factors', parentId: 'electricity-root', category: 'Fundamentals' },
    { id: 'ohms-law', x: 520, y: 280, title: "Ohm's Law (V = I*R)", parentId: 'resistance', category: 'Laws' },
    { id: 'series-circuits', x: 300, y: 390, title: 'Series Circuits', parentId: 'ohms-law', category: 'Circuits' },
    { id: 'parallel-circuits', x: 500, y: 390, title: 'Parallel Circuits', parentId: 'ohms-law', category: 'Circuits' },
    { id: 'electrical-power', x: 700, y: 390, title: 'Electrical Power & Heat', parentId: 'ohms-law', category: 'Energy' },
  ];

  const getStatusColor = (percentage: number) => {
    if (percentage >= 75) return {
      border: 'border-emerald-500',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      ring: 'ring-emerald-500/30',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      label: 'Strong Mastery',
      stroke: '#10b981',
    };
    if (percentage >= 50) return {
      border: 'border-amber-500',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      ring: 'ring-amber-500/30',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      label: 'Developing',
      stroke: '#f59e0b',
    };
    return {
      border: 'border-rose-500',
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      ring: 'ring-rose-500/30',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      label: 'Weak Concept',
      stroke: '#f43f5e',
    };
  };

  const selectedConcept = CONCEPTS.find((c) => c.id === selectedConceptId);
  const selectedMastery = selectedConceptId
    ? profile.masteryByConcept[selectedConceptId]
    : null;

  return (
    <div className="space-y-6">
      {/* Top Banner & Legend */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-400" />
              Interactive Concept Graph
            </h2>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Living Topology
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual dependency graph for Class 10 Electricity. Click any node to inspect mastery, mistakes, and practice drills.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300 font-medium">Strong (≥75%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="text-slate-300 font-medium">Developing (50-74%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
            <span className="text-slate-300 font-medium">Weak (&lt;50%)</span>
          </div>
        </div>
      </div>

      {/* Main Canvas & Details Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Graph Canvas */}
        <div className="lg:col-span-8 rounded-2xl bg-slate-950 border border-slate-800 p-4 relative overflow-hidden flex flex-col justify-between min-h-[500px]">
          {/* Zoom controls */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-xl p-1 shadow-md">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono text-slate-400 px-1">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.3, z + 0.1))}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              title="Reset Zoom"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* SVG Diagram with Animated Energy Pulses */}
          <div className="w-full flex-1 flex items-center justify-center overflow-x-auto py-4">
            <div
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
              className="transition-transform duration-200"
            >
              <svg width="800" height="470" className="select-none">
                <defs>
                  {/* Glowing line gradients */}
                  <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Graph Edges / Connections */}
                {nodes.map((node) => {
                  if (!node.parentId) return null;
                  const parent = nodes.find((n) => n.id === node.parentId);
                  if (!parent) return null;

                  const isTargetSelected = selectedConceptId === node.id;
                  const mastery = profile.masteryByConcept[node.id];
                  const color = mastery ? getStatusColor(mastery.masteryPercentage).stroke : '#6366f1';

                  return (
                    <g key={`edge-${node.id}`}>
                      {/* Base connection path */}
                      <path
                        d={`M ${parent.x} ${parent.y + 24} C ${parent.x} ${(parent.y + node.y) / 2}, ${node.x} ${(parent.y + node.y) / 2}, ${node.x} ${node.y - 24}`}
                        fill="none"
                        stroke={isTargetSelected ? color : '#334155'}
                        strokeWidth={isTargetSelected ? '2.5' : '1.5'}
                        strokeDasharray={isTargetSelected ? 'none' : '4 4'}
                      />
                      {/* Animated traveling energy pulse */}
                      <circle r="3.5" fill={color} filter="url(#glow)">
                        <animateMotion
                          dur="3s"
                          repeatCount="indefinite"
                          path={`M ${parent.x} ${parent.y + 24} C ${parent.x} ${(parent.y + node.y) / 2}, ${node.x} ${(parent.y + node.y) / 2}, ${node.x} ${node.y - 24}`}
                        />
                      </circle>
                    </g>
                  );
                })}

                {/* Nodes */}
                {nodes.map((node) => {
                  const isRoot = node.id === 'electricity-root';
                  const isSelected = selectedConceptId === node.id;
                  const mastery = profile.masteryByConcept[node.id];
                  const status = mastery ? getStatusColor(mastery.masteryPercentage) : null;

                  return (
                    <g
                      key={node.id}
                      onClick={() => !isRoot && setSelectedConceptId(node.id)}
                      className={`cursor-pointer transition-all ${isRoot ? 'cursor-default' : 'hover:opacity-90'}`}
                    >
                      {/* Node container pill */}
                      <rect
                        x={node.x - 75}
                        y={node.y - 22}
                        width="150"
                        height="44"
                        rx="12"
                        fill={isRoot ? '#1e1b4b' : isSelected ? '#1e293b' : '#0f172a'}
                        stroke={
                          isRoot
                            ? '#6366f1'
                            : isSelected
                            ? status?.stroke || '#6366f1'
                            : '#334155'
                        }
                        strokeWidth={isSelected ? '2.5' : '1.2'}
                        filter={isSelected ? 'url(#glow)' : undefined}
                      />

                      {/* Node text */}
                      <text
                        x={node.x}
                        y={node.y - 2}
                        textAnchor="middle"
                        fill="#f8fafc"
                        fontSize="11"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                      >
                        {node.title.length > 20 ? node.title.slice(0, 18) + '...' : node.title}
                      </text>

                      {/* Mastery Percentage or Root Label */}
                      <text
                        x={node.x}
                        y={node.y + 13}
                        textAnchor="middle"
                        fill={isRoot ? '#818cf8' : status?.stroke || '#94a3b8'}
                        fontSize="10"
                        fontWeight="600"
                        fontFamily="sans-serif"
                      >
                        {isRoot ? 'Root Syllabus' : `${mastery?.masteryPercentage ?? 0}% Mastery`}
                      </text>

                      {/* Mini status indicator dot */}
                      {!isRoot && (
                        <circle
                          cx={node.x + 60}
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

          <div className="text-[11px] text-slate-500 text-center">
            Tip: Click any concept node to inspect its living learner state and recommended practice drills.
          </div>
        </div>

        {/* Selected Concept Inspection Drawer / Card */}
        <div className="lg:col-span-4 rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between space-y-4">
          {selectedConcept && selectedMastery ? (
            <div className="space-y-4">
              {/* Concept Title & Status */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                <h3 className="text-base font-bold text-white mb-1">
                  {selectedConcept.name}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedConcept.shortDescription}
                </p>
              </div>

              {/* Mastery Meter */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">Current Mastery</span>
                  <span className="text-white font-mono text-sm">
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
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>
                    Questions: {selectedMastery.questionsCorrect} / {selectedMastery.questionsAttempted}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Last: {selectedMastery.lastStudiedDate}
                  </span>
                </div>
              </div>

              {/* Key Formula */}
              {selectedConcept.keyFormula && (
                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs">
                  <span className="text-[10px] font-bold uppercase text-indigo-400 block mb-1">
                    Key Physics Formula
                  </span>
                  <code className="text-xs font-mono font-bold text-indigo-200">
                    {selectedConcept.keyFormula}
                  </code>
                </div>
              )}

              {/* Common Mistakes / Active Misconceptions */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Common Exam Traps
                </span>
                <ul className="space-y-1 text-xs text-slate-400">
                  {selectedConcept.commonMisconceptions.map((misc, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{misc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Next Activity */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase text-cyan-400 block">
                  Recommended Next Activity
                </span>
                <p className="text-slate-300">
                  {selectedConcept.recommendedActivities[0] || 'Solve targeted drill questions'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Zap className="w-8 h-8 text-slate-700 mb-2" />
              <p className="text-xs">Select any concept on the map to inspect its details</p>
            </div>
          )}

          {/* Action CTAs */}
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
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all cursor-pointer"
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
