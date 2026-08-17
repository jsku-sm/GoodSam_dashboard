import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { RefreshCw, Zap, Plus, Award, Settings, Download } from 'lucide-react';
import teacherAvatar from '../assets/images/waving_teacher_avatar_1786951073570.jpg';

interface HeaderProps {
  onOpenSubmitModal: () => void;
  onOpenMentorModal: () => void;
  onOpenSettingsModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSubmitModal,
  onOpenMentorModal,
  onOpenSettingsModal,
}) => {
  const { lastUpdated, isSimulating, setIsSimulating, downloadCSV, selectedClassId } = useDashboard();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const formattedDate = lastUpdated.toString().replace(/\([^)]+\)/, '(한국 표준시)');

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Title & Avatar (Border-free smiling teacher with wavy hair & waving hand) */}
        <div className="flex items-center gap-3">
          <img
            src={teacherAvatar}
            alt="웃으며 손을 흔드는 Good쌤"
            className="h-12 sm:h-14 w-auto object-contain shrink-0 select-none"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Good쌤 수업 대시보드
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                공통수학2
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span>수업 시간 실시간 학습지 제출 및 또래 멘토링 모니터링 시스템</span>
            </p>
          </div>
        </div>

        {/* Status & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Timestamp */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-mono text-[11px]">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline text-slate-400">🕒 마지막 갱신:</span>
            <span className="font-medium truncate max-w-[220px] sm:max-w-none">
              {formattedDate}
            </span>
            <button
              onClick={handleManualRefresh}
              className={`p-1 hover:bg-slate-200 rounded text-slate-500 transition-transform ${
                isRefreshing ? 'rotate-180 duration-300' : ''
              }`}
              title="새로고침"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          {/* Live Simulation Toggle */}
          <button
            onClick={() => setIsSimulating((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors border ${
              isSimulating
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="수업 중 실시간 제출을 가상 시뮬레이션합니다"
          >
            <Zap className={`w-3.5 h-3.5 ${isSimulating ? 'text-white animate-bounce' : 'text-amber-500'}`} />
            <span>실시간 데모 {isSimulating ? 'ON' : 'OFF'}</span>
          </button>

          {/* Submit Worksheet Button */}
          <button
            onClick={onOpenSubmitModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>제출 등록</span>
          </button>

          {/* Mentor Point Button */}
          <button
            onClick={onOpenMentorModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-medium rounded-lg transition-colors"
          >
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>멘토 포인트</span>
          </button>

          {/* CSV Download */}
          <button
            onClick={() => downloadCSV(selectedClassId === 'all' ? undefined : selectedClassId)}
            className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg transition-colors"
            title="CSV 다운로드"
          >
            <Download className="w-4 h-4 text-slate-600" />
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettingsModal}
            className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg transition-colors"
            title="설정 및 관리"
          >
            <Settings className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>
    </header>
  );
};
