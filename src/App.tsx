import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LearnerProvider, useLearner } from './context/LearnerContext';
import { LoginPage } from './components/LoginPage';
import { StudentHeader } from './components/StudentHeader';
import { StudentSidebar } from './components/StudentSidebar';
import { TeacherHeader } from './components/TeacherHeader';
import { TeacherSidebar } from './components/TeacherSidebar';
import { StudentDashboard } from './components/StudentDashboard';
import { ConceptGraph } from './components/ConceptGraph';
import { DiagnosticTest } from './components/DiagnosticTest';
import { AdaptivePractice } from './components/AdaptivePractice';
import { MisconceptionsView } from './components/MisconceptionsView';
import { RevisionPlanView } from './components/RevisionPlanView';
import { ProgressView } from './components/ProgressView';
import { TeacherDashboardView } from './components/TeacherDashboardView';
import { VoiceTutorView } from './components/VoiceTutorView';
import { IntelligenceCenterView } from './components/IntelligenceCenterView';
import { LearningJourneyView } from './components/LearningJourneyView';
import { ConfidenceAnalysisView } from './components/ConfidenceAnalysisView';
import { VoiceInputModal } from './components/VoiceInputModal';
import { AgentActivityPanel } from './components/AgentActivityPanel';
import { ArchitectureModal } from './components/ArchitectureModal';
import { TeachBackView } from './components/TeachBackView';
import { SocraticModeView } from './components/SocraticModeView';
import { ConceptRescueView } from './components/ConceptRescueView';
import {
  LayoutDashboard,
  Target,
  Network,
  Mic,
  Brain,
  BarChart3,
  Users,
  Grid,
  AlertTriangle,
  FileText,
  BookOpenCheck,
  MessageCircleQuestion,
  LifeBuoy,
} from 'lucide-react';

function AuthenticatedApp() {
  const { isAuthenticated, isStudent, isTeacher, role, canAccessRoute, getDefaultRouteForRole } =
    useAuth();
  const { activeTab, setActiveTab } = useLearner();

  // Modals state
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [voiceInitialPrompt, setVoiceInitialPrompt] = useState<string>('');
  const [isAgentsOpen, setIsAgentsOpen] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);

  // Practice & rescue targeting
  const [practiceConceptId, setPracticeConceptId] = useState<string>('series-circuits');
  const [rescueConceptId, setRescueConceptId] = useState<string | undefined>(undefined);

  // Enforce route protection
  useEffect(() => {
    if (isAuthenticated && role) {
      if (!canAccessRoute(activeTab, role)) {
        setActiveTab(getDefaultRouteForRole(role));
      }
    }
  }, [isAuthenticated, role, activeTab]);

  const handleOpenVoiceWithPrompt = (prompt: string) => {
    setVoiceInitialPrompt(prompt);
    setIsVoiceOpen(true);
  };

  const handleSelectConceptForPractice = (conceptId: string) => {
    setPracticeConceptId(conceptId);
    setActiveTab('practice');
  };

  const handleLaunchRescue = (conceptId: string) => {
    setRescueConceptId(conceptId);
    setActiveTab('concept-rescue');
  };

  // If not logged in, render the dedicated Login Page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // ==========================================
  // TEACHER LAYOUT & WORKSPACE
  // ==========================================
  if (isTeacher) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
        {/* Dedicated Teacher Header */}
        <TeacherHeader onOpenArchitecture={() => setIsArchitectureOpen(true)} />

        {/* Teacher Layout Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Dedicated Teacher Sidebar */}
          <TeacherSidebar onOpenArchitecture={() => setIsArchitectureOpen(true)} />

          {/* Teacher Content Workspace */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full custom-scrollbar">
            <TeacherDashboardView />
          </main>
        </div>

        {/* Teacher Mobile Bottom Navigation Bar */}
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-md px-3 py-2 flex items-center justify-around z-30">
          <button
            onClick={() => setActiveTab('teacher-overview')}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
              activeTab === 'teacher-overview' || activeTab === 'teacher'
                ? 'text-cyan-400'
                : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('teacher-analytics')}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
              activeTab === 'teacher-analytics' ? 'text-cyan-400' : 'text-slate-400'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('teacher-heatmap')}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
              activeTab === 'teacher-heatmap' ? 'text-cyan-400' : 'text-slate-400'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Heatmap</span>
          </button>

          <button
            onClick={() => setActiveTab('teacher-misconceptions')}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
              activeTab === 'teacher-misconceptions' ? 'text-rose-400' : 'text-slate-400'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Misconceptions</span>
          </button>

          <button
            onClick={() => setActiveTab('teacher-reports')}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
              activeTab === 'teacher-reports' ? 'text-cyan-400' : 'text-slate-400'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Reports</span>
          </button>
        </div>

        {/* System Architecture Modal */}
        <ArchitectureModal
          isOpen={isArchitectureOpen}
          onClose={() => setIsArchitectureOpen(false)}
        />
      </div>
    );
  }

  // ==========================================
  // STUDENT LAYOUT & WORKSPACE
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Dedicated Student Header */}
      <StudentHeader
        onOpenVoice={() => {
          setVoiceInitialPrompt('');
          setIsVoiceOpen(true);
        }}
        onOpenAgents={() => setIsAgentsOpen(true)}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
      />

      {/* Student Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Dedicated Student Sidebar */}
        <StudentSidebar
          onOpenVoice={() => {
            setVoiceInitialPrompt('');
            setIsVoiceOpen(true);
          }}
          onOpenArchitecture={() => setIsArchitectureOpen(true)}
        />

        {/* Student Workspace Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full custom-scrollbar">
          {activeTab === 'dashboard' && (
            <StudentDashboard
              onOpenVoiceWithPrompt={handleOpenVoiceWithPrompt}
              onSelectConceptForPractice={handleSelectConceptForPractice}
            />
          )}

          {activeTab === 'intelligence-center' && (
            <IntelligenceCenterView
              onPracticeConcept={handleSelectConceptForPractice}
              onOpenVoiceWithPrompt={handleOpenVoiceWithPrompt}
            />
          )}

          {activeTab === 'learning-journey' && (
            <LearningJourneyView
              onPracticeConcept={handleSelectConceptForPractice}
              onOpenVoiceWithPrompt={handleOpenVoiceWithPrompt}
            />
          )}

          {activeTab === 'confidence-analysis' && (
            <ConfidenceAnalysisView
              onPracticeConcept={handleSelectConceptForPractice}
            />
          )}

          {activeTab === 'diagnostic' && (
            <DiagnosticTest
              onOpenVoiceWithPrompt={handleOpenVoiceWithPrompt}
              onTestComplete={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'concept-map' && (
            <ConceptGraph
              onSelectConceptForPractice={handleSelectConceptForPractice}
              onOpenVoiceForConcept={(conceptName) =>
                handleOpenVoiceWithPrompt(
                  `I am studying ${conceptName}. What are the most important rules and formulas I need to remember?`
                )
              }
            />
          )}

          {activeTab === 'practice' && (
            <AdaptivePractice
              initialConceptId={practiceConceptId}
              onOpenVoiceWithPrompt={handleOpenVoiceWithPrompt}
              onLaunchRescue={handleLaunchRescue}
            />
          )}

          {activeTab === 'misconceptions' && (
            <MisconceptionsView
              onPracticeMisconception={handleSelectConceptForPractice}
            />
          )}

          {activeTab === 'revision' && <RevisionPlanView />}

          {activeTab === 'learn' && (
            <VoiceTutorView
              onOpenVoiceWithPrompt={handleOpenVoiceWithPrompt}
              onSelectConceptForPractice={handleSelectConceptForPractice}
            />
          )}

          {activeTab === 'progress' && <ProgressView />}

          {activeTab === 'teach-back' && (
            <TeachBackView onPracticeConcept={handleSelectConceptForPractice} />
          )}

          {activeTab === 'socratic' && (
            <SocraticModeView onPracticeConcept={handleSelectConceptForPractice} />
          )}

          {activeTab === 'concept-rescue' && (
            <ConceptRescueView
              initialConceptId={rescueConceptId}
              onPracticeConcept={handleSelectConceptForPractice}
            />
          )}
        </main>
      </div>

      {/* Mobile Learning Modes Strip */}
      <div className="md:hidden border-t border-slate-800/80 bg-slate-950/90 px-3 py-1.5 flex items-center justify-center gap-2">
        <button
          onClick={() => setActiveTab('teach-back')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold ${
            activeTab === 'teach-back'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400'
          }`}
        >
          <BookOpenCheck className="w-3.5 h-3.5" />
          <span>Teach Back</span>
        </button>
        <button
          onClick={() => setActiveTab('socratic')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold ${
            activeTab === 'socratic'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              : 'text-slate-400'
          }`}
        >
          <MessageCircleQuestion className="w-3.5 h-3.5" />
          <span>Socratic</span>
        </button>
        <button
          onClick={() => setActiveTab('concept-rescue')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold ${
            activeTab === 'concept-rescue'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400'
          }`}
        >
          <LifeBuoy className="w-3.5 h-3.5" />
          <span>Rescue</span>
        </button>
      </div>

      {/* Student Mobile Bottom Navigation Bar */}
      <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-md px-3 py-2 flex items-center justify-around z-30">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            activeTab === 'dashboard' ? 'text-indigo-400' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('intelligence-center')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            activeTab === 'intelligence-center' ? 'text-purple-400' : 'text-slate-400'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>Intelligence</span>
        </button>

        {/* Central Voice Button */}
        <button
          onClick={() => {
            setVoiceInitialPrompt('');
            setIsVoiceOpen(true);
          }}
          className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center -mt-5 shadow-lg shadow-indigo-600/40 border-2 border-slate-950"
        >
          <Mic className="w-5 h-5" />
        </button>

        <button
          onClick={() => setActiveTab('concept-map')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            activeTab === 'concept-map' ? 'text-indigo-400' : 'text-slate-400'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Graph</span>
        </button>

        <button
          onClick={() => setActiveTab('practice')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            activeTab === 'practice' ? 'text-indigo-400' : 'text-slate-400'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Practice</span>
        </button>
      </div>

      {/* Student Modals */}
      <VoiceInputModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        initialPrompt={voiceInitialPrompt}
      />

      <AgentActivityPanel
        isOpen={isAgentsOpen}
        onClose={() => setIsAgentsOpen(false)}
      />

      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LearnerProvider>
        <AuthenticatedApp />
      </LearnerProvider>
    </AuthProvider>
  );
}
