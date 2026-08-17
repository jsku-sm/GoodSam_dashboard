import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Trophy, Users, Award, Sparkles, BookOpen } from 'lucide-react';

export const ClassQuestTab: React.FC = () => {
  const { allClassStats, classList } = useDashboard();

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>🏰 반별 퀘스트 현황 (1학년 1반 ~ 7반)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            총 7개 학급 단체 학습지 제출 달성률 및 평균 공통수학2 레벨 비교 (1,2,4,5반: 주 2회 32차시 / 3,6,7반: 주 1회 16차시)
          </p>
        </div>

        <div className="flex items-center gap-2 bg-blue-50 text-blue-800 text-xs font-semibold px-3 py-1.5 rounded-xl border border-blue-100">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>퀘스트 목표: 반 평균 Lv.4.0 돌파 & 제출률 80% 달성</span>
        </div>
      </div>

      {/* Grid of All 7 Class Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {allClassStats.map((stats) => {
          const isHighAchiever = stats.submissionRate >= 80;
          return (
            <div
              key={stats.classId}
              className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all hover:shadow-md ${
                isHighAchiever ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200/80'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                      <span>🏰 {stats.className}</span>
                      {isHighAchiever && <span>👑</span>}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {stats.department && (
                        <span className="text-[11px] text-slate-500 font-medium">
                          {stats.department}
                        </span>
                      )}
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">
                        주 {stats.weeklyHours}시간 · {stats.totalLessons}차시
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                    학생 {stats.totalStudents}명
                  </span>
                </div>

                {/* 4 Big Numbers */}
                <div className="grid grid-cols-4 gap-1.5 text-center my-3 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
                      {stats.submissionRate}%
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      제출률
                    </div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
                      {stats.totalSubmissions}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      제출 수
                    </div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
                      {stats.avgSubmissionsPerStudent}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      인당평균
                    </div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
                      Lv.{stats.avgLevel}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      평균레벨
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden my-2.5">
                  <div
                    style={{ width: `${stats.submissionRate}%` }}
                    className="bg-slate-900 h-full rounded-full transition-all duration-700"
                  />
                </div>

                {/* Formula line */}
                <p className="text-[11px] text-slate-500 font-medium">
                  {stats.totalStudents}명 × {stats.totalLessons}차시 = {stats.maxPossibleSubmissions}건 중 {stats.totalSubmissions}건 ·
                  참여 {stats.activeStudents}/{stats.totalStudents}명
                </p>
              </div>

              {/* Level Distribution Pills */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-1">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-100 text-rose-700">
                    🌱 Lv.1: {stats.levelCounts[1]}명
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-orange-100 text-orange-700">
                    📚 Lv.2: {stats.levelCounts[2]}명
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 text-amber-700">
                    ⚔️ Lv.3: {stats.levelCounts[3]}명
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                    🌟 Lv.4: {stats.levelCounts[4]}명
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-100 text-blue-700">
                    👑 Lv.5: {stats.levelCounts[5]}명
                  </span>
                </div>

                {/* Zero Submission Alert */}
                {stats.zeroSubmissionStudents.length > 0 ? (
                  <div className="p-2 rounded-lg bg-rose-50 border border-rose-100 text-[11px] text-rose-700">
                    <strong>미제출 0건 학생 ({stats.zeroSubmissionStudents.length}명):</strong>{' '}
                    {stats.zeroSubmissionStudents.map((s) => s.name).join(', ')}
                  </div>
                ) : (
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-[11px] text-emerald-700 font-medium text-center">
                    ✨ 전원 1건 이상 제출 참여 중
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
