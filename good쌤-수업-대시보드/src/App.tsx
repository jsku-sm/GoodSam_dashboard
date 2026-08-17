import React, { useState } from 'react';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { ClassDropdown } from './components/ClassDropdown';
import { OverallTab } from './components/Tabs/OverallTab';
import { IndividualLevelTab } from './components/Tabs/IndividualLevelTab';
import { MentorRankingTab } from './components/Tabs/MentorRankingTab';
import { ClassQuestTab } from './components/Tabs/ClassQuestTab';
import { SubmitModal } from './components/Modals/SubmitModal';
import { MentorAwardModal } from './components/Modals/MentorAwardModal';
import { StudentDetailModal } from './components/Modals/StudentDetailModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { ToastContainer } from './components/ToastContainer';
import { BarChart3, User, Award, Castle } from 'lucide-react';

type TabType = 'overall' | 'individual' | 'mentor' | 'quest';

const DashboardContent: React.FC = () => {
  const { selectedClassId, setSelectedClassId } = useDashboard();
  const [activeTab, setActiveTab] = useState<TabType>('overall');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isMentorModalOpen, setIsMentorModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [submitPreselectedStudentId, setSubmitPreselectedStudentId] = useState<string | undefined>();

  const handleOpenSubmitForStudent = (studentId: string) => {
    setSubmitPreselectedStudentId(studentId);
    setIsSubmitModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Header */}
      <Header
        onOpenSubmitModal={() => {
          setSubmitPreselectedStudentId(undefined);
          setIsSubmitModalOpen(true);
        }}
        onOpenMentorModal={() => setIsMentorModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
      />

      {/* 2. Main Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Metric Cards (Top Summary) */}
        <MetricCards />

        {/* Navigation Tabs & Class Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 gap-3">
          <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto pb-1" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overall')}
              className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'overall'
                  ? 'border-slate-900 text-slate-900 bg-white/60 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>전체 현황</span>
            </button>

            <button
              onClick={() => setActiveTab('individual')}
              className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'individual'
                  ? 'border-slate-900 text-slate-900 bg-white/60 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <User className="w-4 h-4" />
              <span>개인별 레벨</span>
            </button>

            <button
              onClick={() => setActiveTab('mentor')}
              className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'mentor'
                  ? 'border-slate-900 text-slate-900 bg-white/60 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Award className="w-4 h-4 text-amber-500" />
              <span>멘토 랭킹</span>
            </button>

            <button
              onClick={() => setActiveTab('quest')}
              className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'quest'
                  ? 'border-slate-900 text-slate-900 bg-white/60 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Castle className="w-4 h-4 text-indigo-500" />
              <span>반별 퀘스트</span>
            </button>
          </nav>

          {/* Quick Class Dropdown on top-right of tabs */}
          <div className="pb-2 sm:pb-0 flex items-center justify-end">
            <ClassDropdown
              value={selectedClassId}
              onChange={setSelectedClassId}
              showAllOption={true}
              allOptionLabel="전체 보기"
            />
          </div>
        </div>

        {/* Tab Views */}
        <div className="pt-2">
          {activeTab === 'overall' && (
            <OverallTab onSelectStudent={(id) => setSelectedStudentId(id)} />
          )}

          {activeTab === 'individual' && (
            <IndividualLevelTab onSelectStudent={(id) => setSelectedStudentId(id)} />
          )}

          {activeTab === 'mentor' && (
            <MentorRankingTab onOpenMentorModal={() => setIsMentorModalOpen(true)} />
          )}

          {activeTab === 'quest' && <ClassQuestTab />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>Good쌤 수업 대시보드 · 또래 멘토링 시스템</span>
          <span>1학년 1~7반 (총 136명) · 공통수학2 학습지 퀘스트</span>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <SubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        defaultStudentId={submitPreselectedStudentId}
      />

      <MentorAwardModal
        isOpen={isMentorModalOpen}
        onClose={() => setIsMentorModalOpen(false)}
      />

      <StudentDetailModal
        studentId={selectedStudentId}
        onClose={() => setSelectedStudentId(null)}
        onOpenSubmitForStudent={handleOpenSubmitForStudent}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* Real-time Toast Alerts */}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}

export default App;
