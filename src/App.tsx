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
import { ExamPlannerView } from './components/ExamPlannerView';
import { ToastContainer } from './components/ToastContainer';
import { OnboardingTourModal } from './components/OnboardingTourModal';
import {
  LayoutDashboard,
  Target,
  Network,
  CalendarClock,
  BarChart3,
  Grid,
  AlertTriangle,
  FileText,
} from 'lucide-react';

function AuthenticatedApp() {
  const { isAuthenticated, isStudent, isTeacher, role, canAccessRoute, getDefaultRouteForRole } =
    useAuth();
  const { activeTab, setActiveTab, profile, markOnboardingComplete } = useLearner();

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
        <nav
          aria-label="Teacher mobile navigation"
          className="no-print md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-md px-3 py-2 flex items-center justify-around z-30"
        >
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
              activeTab === 'teacher-reports' ? 'text-cyan-400' : 'text-slate-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Reports</span>
          </button>
        </nav>

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

          {activeTab === 'exam-planner' && (
            <ExamPlannerView onSelectConceptForPractice={handleSelectConceptForPractice} />
          )}

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

      {/* Student Mobile Bottom Navigation Bar (4 Most-Used Pages) */}
      <nav
        aria-label="Student mobile navigation"
        className="no-print md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-md px-4 py-2.5 flex items-center justify-around z-30"
      >
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          aria-current={activeTab === 'dashboard' ? 'page' : undefined}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold cursor-pointer ${
            activeTab === 'dashboard' ? 'text-indigo-300' : 'text-slate-300'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('practice')}
          aria-current={activeTab === 'practice' ? 'page' : undefined}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold cursor-pointer ${
            activeTab === 'practice' ? 'text-indigo-300' : 'text-slate-300'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Practice</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('concept-map')}
          aria-current={activeTab === 'concept-map' ? 'page' : undefined}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold cursor-pointer ${
            activeTab === 'concept-map' ? 'text-indigo-300' : 'text-slate-300'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Concept Map</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('exam-planner')}
          aria-current={activeTab === 'exam-planner' ? 'page' : undefined}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold cursor-pointer ${
            activeTab === 'exam-planner' ? 'text-indigo-300' : 'text-slate-300'
          }`}
        >
          <CalendarClock className="w-4 h-4" />
          <span>Exam Plan</span>
        </button>
      </nav>

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

      <OnboardingTourModal
        isOpen={isStudent && !profile.onboardingCompleted}
        onComplete={() => markOnboardingComplete(true)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LearnerProvider>
        <AuthenticatedApp />
        <ToastContainer />
      </LearnerProvider>
    </AuthProvider>
  );
}
