import React from 'react';
import { useLearner } from '../context/LearnerContext';
import {
  X,
  Bot,
  Activity,
  Mic,
  Brain,
  ShieldAlert,
  Target,
  CalendarCheck2,
  CheckCircle2,
} from 'lucide-react';

interface AgentActivityPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AgentActivityPanel: React.FC<AgentActivityPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const { agentLogs } = useLearner();

  if (!isOpen) return null;

  const agents = [
    {
      name: 'Voice Intelligence Agent',
      role: 'Speech-to-Intent Pipeline',
      description: 'Filters verbal hesitation tokens ("um", "like") via Wispr Flow and structures natural speech into physics entities & intents.',
      icon: Mic,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      status: 'Active',
    },
    {
      name: 'Learner Model Agent',
      role: 'Mastery & Knowledge Graph Engine',
      description: 'Maintains student knowledge matrix, updates probabilistic mastery after every interaction, and maintains confidence history.',
      icon: Brain,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      status: 'Active',
    },
    {
      name: 'Misconception Detection Agent',
      role: 'Verbal Reasoning Diagnostics',
      description: 'Analyzes why the student arrived at an answer, detects flawed mental models, and tracks recurring conceptual traps.',
      icon: ShieldAlert,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      status: 'Active',
    },
    {
      name: 'Adaptive Learning Agent',
      role: 'Dynamic Challenge Generator',
      description: 'Generates targeted practice questions calibrated to user weak points and active misconceptions at optimal zone of proximal development.',
      icon: Target,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      status: 'Active',
    },
    {
      name: 'Revision Agent',
      role: 'Spaced Repetition Scheduler',
      description: 'Calculates memory decay intervals (1d, 3d, 7d, 21d) based on mastery strength and builds daily revision queues.',
      icon: CalendarCheck2,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      status: 'Active',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg h-full bg-slate-900 border-l border-slate-800 p-6 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Autonomous AI Agent Swarm
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                5 coordinated micro-agents powering LearnFlow AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Tabs / Scroll Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1 custom-scrollbar">
          {/* Active Agents Roster */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Active Agents Roster
            </h3>
            <div className="space-y-2.5">
              {agents.map((ag) => {
                const Icon = ag.icon;
                return (
                  <div
                    key={ag.name}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`p-1.5 rounded-lg border ${ag.color}`}>
                          <Icon className="w-4 h-4" />
                        </span>
                        <div>
                          <div className="text-xs font-bold text-slate-200">{ag.name}</div>
                          <div className="text-[10px] text-slate-400">{ag.role}</div>
                        </div>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        {ag.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {ag.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Chronological Agent Activity Log */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Live Agent Decision Stream
              </h3>
              <span className="text-[10px] text-slate-500">Real-time trace</span>
            </div>

            <div className="space-y-2.5">
              {agentLogs.map((log) => {
                const badgeStyles = {
                  info: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
                  success: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
                  warning: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
                  purple: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
                }[log.badgeType];

                return (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${badgeStyles}`}>
                        {log.agentName}
                      </span>
                      <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                    </div>
                    <div className="font-semibold text-slate-200 text-xs mb-1">
                      {log.action}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {log.details}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">
            LearnFlow AI Engine • Multi-Agent Autonomous Framework
          </p>
        </div>
      </div>
    </div>
  );
};
