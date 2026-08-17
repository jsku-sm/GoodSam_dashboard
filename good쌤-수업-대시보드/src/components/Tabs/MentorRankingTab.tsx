import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Award, Plus, Sparkles, Clock, HeartHandshake } from 'lucide-react';
import { ClassDropdown } from '../ClassDropdown';

interface MentorRankingTabProps {
  onOpenMentorModal: () => void;
}

export const MentorRankingTab: React.FC<MentorRankingTabProps> = ({
  onOpenMentorModal,
}) => {
  const { mentorRankings, mentorLogs, classList, getClassStats, students } = useDashboard();
  const [filterClass, setFilterClass] = useState<string>('all');

  const filteredRankings = mentorRankings.filter((item) => {
    if (filterClass !== 'all' && item.classId !== filterClass) return false;
    return true;
  });

  const maxPoints = Math.max(...mentorRankings.map((m) => m.points), 10);
  const top10 = filteredRankings.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header & Subtitle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>👑 멘토 포인트 랭킹 (1학년 1반 ~ 7반)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            친구를 도와줄수록 멘토 포인트가 쌓여요! 또래 멘토링으로 공통수학2를 함께 정복합니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Class Filter Dropdown */}
          <ClassDropdown
            value={filterClass}
            onChange={setFilterClass}
            showAllOption={true}
            allOptionLabel="전체 보기"
          />

          <button
            onClick={onOpenMentorModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>멘토 포인트 주기</span>
          </button>
        </div>
      </div>

      {/* 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Leaderboard List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>명예의 전당 Top 10</span>
              </span>
              <span className="text-xs text-slate-400 font-normal">포인트 기준</span>
            </h3>

            <div className="space-y-3.5">
              {top10.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  아직 등록된 멘토 포인트가 없습니다. 우측 버튼으로 멘토 포인트를 등록해보세요!
                </div>
              ) : (
                top10.map((item, idx) => {
                  const rankNum = idx + 1;
                  const percent = Math.min((item.points / maxPoints) * 100, 100);
                  const isTop1 = rankNum === 1;
                  const isTop2 = rankNum === 2;
                  const isTop3 = rankNum === 3;

                  return (
                    <div key={item.student.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-5 font-bold ${
                              isTop1
                                ? 'text-amber-500 text-sm'
                                : isTop2
                                ? 'text-slate-400 text-sm'
                                : isTop3
                                ? 'text-amber-700 text-sm'
                                : 'text-slate-400'
                            }`}
                          >
                            {isTop1 ? '🥇' : isTop2 ? '🥈' : isTop3 ? '🥉' : `${rankNum}.`}
                          </span>
                          <span className="font-semibold text-slate-900">
                            {item.student.name}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            {item.student.className} {item.student.studentNo && `(${item.student.studentNo})`}
                          </span>
                        </div>
                        <span className="font-bold text-amber-600">
                          {item.points} pt
                        </span>
                      </div>

                      {/* Bar */}
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${percent}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            isTop1
                              ? 'bg-amber-500'
                              : isTop2
                              ? 'bg-blue-500'
                              : isTop3
                              ? 'bg-emerald-500'
                              : 'bg-slate-400'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Mentor Feed & Stats */}
        <div className="space-y-6">
          {/* Mentor Benefit Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200/80 rounded-2xl p-5">
            <h4 className="text-sm font-bold text-amber-900 flex items-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>또래 멘토링 활동 혜택</span>
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              학습지를 먼저 완성한 학생이 어려워하는 동급생에게 공통수학2 문제 풀이를 설명해주면
              <strong> 멘토 포인트</strong>가 지급됩니다. 학기말 성실 멘토 표창 및 수학 세특(세부능력 및 특기사항)에
              활동 내용이 상세히 기록됩니다!
            </p>
          </div>

          {/* Recent Mentor Activity Logs */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>실시간 멘토링 활동 로그</span>
              </span>
              <span className="text-xs text-slate-400">
                총 {mentorLogs.length}건
              </span>
            </h3>

            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {mentorLogs.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  아직 기록된 멘토링 활동이 없습니다.
                </div>
              ) : (
                mentorLogs.slice(0, 10).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-50 rounded-xl text-xs flex items-center justify-between gap-2 border border-slate-100"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <HeartHandshake className="w-4 h-4 text-amber-600 shrink-0" />
                      <div className="truncate">
                        <span className="font-bold text-slate-900">{log.mentorName}</span>
                        <span className="text-slate-500 mx-1">멘토가</span>
                        <span className="font-medium text-slate-800">{log.menteeName}</span>
                        <span className="text-slate-500">
                          에게 {log.lessonId}차시 지도
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                      {log.timestamp}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
