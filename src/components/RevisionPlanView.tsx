import React from 'react';
import { useLearner } from '../context/LearnerContext';
import { RevisionTask, Recommendation } from '../types/learning';
import { WhyAmISeeingThis } from './WhyAmISeeingThis';
import {
  CalendarCheck2,
  CheckCircle2,
  Clock,
  ArrowRight,
  Flame,
  Target,
  Sparkles,
  Calendar,
  AlertCircle,
  Brain,
} from 'lucide-react';

interface RevisionPlanViewProps {
  onStartTask?: (task: RevisionTask) => void;
}

export const RevisionPlanView: React.FC<RevisionPlanViewProps> = ({ onStartTask }) => {
  const { profile, completeRevisionTask, setActiveTab } = useLearner();

  const todayTasks = profile.revisionSchedule.filter((t) => t.dueDate === 'Today');
  const upcomingTasks = profile.revisionSchedule.filter((t) => t.dueDate !== 'Today');

  const getTaskIconColor = (type: RevisionTask['taskType']) => {
    switch (type) {
      case 'misconception_clear':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'practice_drill':
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'challenge':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      default:
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    }
  };

  const formatTaskType = (type: RevisionTask['taskType']) => {
    switch (type) {
      case 'misconception_clear':
        return 'Misconception Cleared';
      case 'practice_drill':
        return 'Targeted Practice Drill';
      case 'challenge':
        return 'Retention Challenge';
      default:
        return 'Concept Review';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-purple-500/20 text-purple-400">
              <CalendarCheck2 className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Smart Spaced-Repetition Scheduler
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Powered by the Revision Agent. Mathematical decay scheduling: Low mastery &lt;50% reviews at Day 1, 3, 7. High mastery &ge;75% reviews at Day 7, 21.
          </p>
        </div>

        {/* Retention status pill */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
            <div className="text-base font-extrabold text-indigo-400 font-mono">92%</div>
            <div className="text-[10px] text-slate-400 font-medium">Memory Retention</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
            <div className="text-base font-extrabold text-amber-400 font-mono">
              {profile.streakDays} Days
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Study Streak</div>
          </div>
        </div>
      </div>

      {/* Spaced Intervals Guide Banner */}
      <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="font-bold text-rose-300 text-xs mb-1">Low Mastery (&lt;50%)</div>
          <div className="text-slate-400 text-[11px]">
            Intensive intervals: Review 1 day → Practice 3 days → Check 7 days.
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="font-bold text-amber-300 text-xs mb-1">Developing (50-74%)</div>
          <div className="text-slate-400 text-[11px]">
            Consolidation intervals: Review 3 days → Practice 7 days → Test 14 days.
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="font-bold text-emerald-300 text-xs mb-1">High Mastery (&ge;75%)</div>
          <div className="text-slate-400 text-[11px]">
            Long-term retention: Review 7 days → Challenge question 21 days.
          </div>
        </div>
      </div>

      {/* Today's Learning Plan */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Today's Learning Plan
          </h3>
          <span className="text-xs text-slate-400">
            {todayTasks.filter((t) => t.completed).length} / {todayTasks.length} Completed
          </span>
        </div>

        <div className="space-y-3">
          {todayTasks.length > 0 ? (
            todayTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  task.completed
                    ? 'bg-slate-950/40 border-slate-800/80 opacity-60'
                    : 'bg-slate-900 border-slate-800 shadow-md shadow-slate-950/40 hover:border-indigo-500/40'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <button
                    onClick={() => completeRevisionTask(task.id)}
                    className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer ${
                      task.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-700 hover:border-indigo-500 text-transparent'
                    }`}
                  >
                    ✓
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                        {task.conceptName}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTaskIconColor(task.taskType)}`}>
                        {formatTaskType(task.taskType)}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.estimatedMinutes} mins
                      </span>
                    </div>

                    <h4
                      className={`text-sm font-bold ${
                        task.completed ? 'line-through text-slate-400' : 'text-white'
                      }`}
                    >
                      {task.title}
                    </h4>

                    <p className="text-xs text-slate-400">
                      Reason: {task.reason}
                    </p>

                    <div className="pt-1.5">
                      <WhyAmISeeingThis
                        recommendation={{
                          id: `rec-rev-${task.id}`,
                          concept: task.conceptName,
                          conceptId: task.conceptId,
                          type:
                            task.taskType === 'misconception_clear'
                              ? 'misconception_fix'
                              : 'spaced_revision',
                          priority: task.priority,
                          reasons: [
                            task.reason,
                            `Concept mastery is currently ${profile.masteryByConcept[task.conceptId]?.masteryPercentage || 45}%.`,
                            `Spaced Repetition Scheduler calculated memory half-life threshold reached.`,
                          ],
                          supportingData: {
                            currentMastery: profile.masteryByConcept[task.conceptId]?.masteryPercentage || 45,
                            recentIncorrectAnswers: 1,
                            activeMisconceptionsCount: task.taskType === 'misconception_clear' ? 1 : 0,
                            daysSinceReview: 2,
                          },
                          suggestedAction: `Complete ${task.estimatedMinutes}-minute revision drill.`,
                          estimatedMinutes: task.estimatedMinutes,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Action */}
                {!task.completed && (
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => {
                        completeRevisionTask(task.id);
                        setActiveTab('practice');
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                    >
                      <span>Start Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
              No pending tasks for today! Check upcoming tasks below.
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Spaced Schedule */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-400" />
          Upcoming Spaced Repetition Queue
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {upcomingTasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-indigo-400">
                    Due: {task.dueDate}
                  </span>
                  <span className="text-[10px] text-slate-500">•</span>
                  <span className="text-[10px] text-slate-400">{task.conceptName}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-200">{task.title}</h4>
                <p className="text-[11px] text-slate-500">{task.reason}</p>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 shrink-0">
                {task.estimatedMinutes}m
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
