import React from 'react';
import { useDashboard } from '../context/DashboardContext';

export const MetricCards: React.FC = () => {
  const { selectedClassId, overallStats, getClassStats, classList } = useDashboard();

  const isAll = selectedClassId === 'all';
  const currentClassMeta = classList.find((c) => c.id === selectedClassId);
  const currentClassStats = !isAll ? getClassStats(selectedClassId) : null;

  const totalSubmissions = isAll
    ? overallStats.totalSubmissions
    : currentClassStats?.totalSubmissions || 0;
  const activeStudents = isAll
    ? overallStats.activeStudents
    : currentClassStats?.activeStudents || 0;
  const totalStudents = isAll
    ? overallStats.totalStudents
    : currentClassStats?.totalStudents || 0;
  const progressLessons = isAll
    ? overallStats.maxLessonSubmitted
    : currentClassStats?.maxLessonSubmitted || 0;
  const plannedLessons = isAll ? 32 : currentClassStats?.totalLessons || 32;
  const totalMentorPoints = isAll
    ? overallStats.totalMentorPoints
    : currentClassStats?.totalMentorPoints || 0;

  const scopeLabel = isAll ? '전체 학급' : currentClassMeta?.name || `1학년 ${selectedClassId}반`;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. 총 제출 수 */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col items-center justify-center text-center">
        <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {totalSubmissions}
        </span>
        <div className="flex items-center gap-1.5 mt-1 text-slate-500">
          <span className="text-xs sm:text-sm font-medium">총 제출 수</span>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
            {scopeLabel}
          </span>
        </div>
      </div>

      {/* 2. 참여 학생 */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col items-center justify-center text-center">
        <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {activeStudents}/{totalStudents}명
        </span>
        <div className="flex items-center gap-1.5 mt-1 text-slate-500">
          <span className="text-xs sm:text-sm font-medium">참여 학생</span>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
            {scopeLabel}
          </span>
        </div>
      </div>

      {/* 3. 진행 차시 */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col items-center justify-center text-center">
        <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {progressLessons}/{plannedLessons}차시
        </span>
        <div className="flex items-center gap-1.5 mt-1 text-slate-500">
          <span className="text-xs sm:text-sm font-medium">진행 차시</span>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
            {isAll ? '전체 최고진도' : `${scopeLabel} 최고진도`}
          </span>
        </div>
      </div>

      {/* 4. 멘토 지목 수 */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col items-center justify-center text-center">
        <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-blue-600">
          {totalMentorPoints}
        </span>
        <div className="flex items-center gap-1.5 mt-1 text-slate-500">
          <span className="text-xs sm:text-sm font-medium">멘토 지목 수</span>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
            {scopeLabel}
          </span>
        </div>
      </div>
    </div>
  );
};
