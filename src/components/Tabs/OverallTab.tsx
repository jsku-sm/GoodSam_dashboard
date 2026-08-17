import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { LEVEL_CONFIGS, calculateStudentLevel, getLessonsForClass } from '../../data/initialData';
import { LevelTier } from '../../types';
import { Check, X, Search } from 'lucide-react';
import { ClassDropdown } from '../ClassDropdown';

interface OverallTabProps {
  onSelectStudent?: (studentId: string) => void;
}

export const OverallTab: React.FC<OverallTabProps> = ({ onSelectStudent }) => {
  const {
    students,
    activeLessons,
    getLessonsForSelectedClass,
    classList,
    selectedClassId,
    setSelectedClassId,
    toggleSubmission,
    downloadCSV,
    activeLessonSubmissionCounts,
    overallStats,
    getClassStats,
  } = useDashboard();

  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all');
  const [highlightedLessonId, setHighlightedLessonId] = useState<number | null>(null);

  // Current selected class meta
  const currentClassMeta = classList.find((c) => c.id === selectedClassId);
  const currentClassCount =
    selectedClassId === 'all'
      ? students.length
      : getClassStats(selectedClassId).totalStudents;

  // Active lessons for current view (32 for 1,2,4,5 or 'all', 16 for 3,6,7)
  const currentViewLessons = getLessonsForSelectedClass(selectedClassId);

  // Title text matching user request: e.g. "1학년 1반 (17명) 차시별 제출 현황"
  const classTitleText =
    selectedClassId === 'all'
      ? `전체 7개 학급 (${students.length}명)`
      : `${currentClassMeta?.name || `1학년 ${selectedClassId}반`} (${currentClassCount}명, 주 ${currentClassMeta?.weeklyHours || 2}시간 · ${currentClassMeta?.totalLessons || 32}차시)`;

  // Filter students based on selected class, search, and level
  const currentClassStudents = students.filter((s) => {
    if (selectedClassId !== 'all' && s.classId !== selectedClassId) return false;
    if (
      searchQuery &&
      !s.name.includes(searchQuery) &&
      !(s.studentNo && s.studentNo.includes(searchQuery))
    )
      return false;
    if (levelFilter !== 'all') {
      const sLessons = getLessonsForClass(s.classId).filter((l) => l.isActive);
      const completed = sLessons.filter((l) => s.submissions[l.id]).length;
      const lvl = calculateStudentLevel(completed, sLessons.length).level;
      if (lvl !== levelFilter) return false;
    }
    return true;
  });

  // Calculate missing submissions detail for students in current class
  const missingStudentsList = students
    .filter((s) => (selectedClassId === 'all' ? true : s.classId === selectedClassId))
    .map((s) => {
      const sLessons = getLessonsForClass(s.classId).filter((l) => l.isActive);
      const missingLessons = sLessons.filter((l) => !s.submissions[l.id]);
      return {
        student: s,
        missingLessons,
        missingCount: missingLessons.length,
        totalClassLessons: sLessons.length,
      };
    })
    .filter((item) => item.missingCount > 0)
    .sort(
      (a, b) =>
        a.missingCount - b.missingCount ||
        (a.student.studentNo || '').localeCompare(b.student.studentNo || '') ||
        a.student.name.localeCompare(b.student.name)
    );

  const maxBarValue = Math.max(
    selectedClassId === 'all' ? students.length : currentClassCount,
    20
  );

  return (
    <div className="space-y-8">
      {/* 1. 차시별 제출 현황 (Chart Section) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>📊 차시별 제출 현황</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {selectedClassId === 'all'
                ? `전체 7개 학급 ${students.length}명 대상 각 차시별 학습지 완료 학생 수`
                : `${currentClassMeta?.name} (${currentClassMeta?.department}) ${currentClassCount}명 대상 차시별 제출 현황 (${currentClassMeta?.totalLessons}차시)`}
            </p>
          </div>
          <div className="text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            총 {currentViewLessons.length}개 차시 구성
          </div>
        </div>

        {/* Custom High-Precision Bar Chart */}
        <div className="relative pt-6 pb-2">
          {/* Y Axis Grid lines */}
          <div className="absolute inset-0 left-8 right-2 top-6 bottom-8 flex flex-col justify-between pointer-events-none">
            {[140, 100, 75, 50, 25, 10, 0].map((val) => (
              <div key={val} className="w-full flex items-center">
                <span className="text-[11px] font-mono text-slate-400 w-8 text-right pr-2 select-none">
                  {val}
                </span>
                <div className="w-full border-b border-slate-100" />
              </div>
            ))}
          </div>

          {/* Bar Columns Container */}
          <div className="ml-10 overflow-x-auto">
            <div className="min-w-[680px] h-60 flex items-end justify-between gap-1.5 sm:gap-2 px-2 pb-8 pt-4">
              {activeLessonSubmissionCounts.map((lesson) => {
                const heightPercent = Math.min((lesson.count / maxBarValue) * 100, 100);
                const isHighlighted = highlightedLessonId === lesson.lessonId;

                return (
                  <div
                    key={lesson.lessonId}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                    onClick={() =>
                      setHighlightedLessonId(
                        highlightedLessonId === lesson.lessonId ? null : lesson.lessonId
                      )
                    }
                  >
                    {/* Tooltip on Hover */}
                    <div className="absolute -top-12 z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900 text-white text-xs rounded-lg py-1.5 px-2.5 shadow-lg whitespace-nowrap">
                      <p className="font-bold">
                        {lesson.title} : {lesson.count}명 ({lesson.rate}%)
                      </p>
                      {lesson.topic && (
                        <p className="text-[10px] text-slate-300 font-normal">{lesson.topic}</p>
                      )}
                    </div>

                    {/* Bar */}
                    <div className="w-full max-w-[34px] flex flex-col items-center justify-end h-full">
                      <span className="text-[11px] font-semibold text-slate-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {lesson.count}
                      </span>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-md transition-all duration-300 ${
                          isHighlighted
                            ? 'bg-blue-600 ring-2 ring-blue-400 ring-offset-1'
                            : 'bg-slate-900 group-hover:bg-slate-800'
                        }`}
                      />
                    </div>

                    {/* X Axis Label */}
                    <span
                      className={`text-[11px] mt-2 font-medium transition-colors select-none whitespace-nowrap ${
                        isHighlighted ? 'text-blue-600 font-bold' : 'text-slate-600'
                      }`}
                    >
                      {lesson.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. 레벨 분포 현황 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>레벨 분포 현황</span>
            {levelFilter !== 'all' && (
              <span className="text-xs font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Lv.{levelFilter} 필터 적용 중 (클릭 시 해제)
              </span>
            )}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {([1, 2, 3, 4, 5] as LevelTier[]).map((lvl) => {
            const config = LEVEL_CONFIGS[lvl];
            const count = overallStats.levelCounts[lvl] || 0;
            const isSelected = levelFilter === lvl;

            return (
              <div
                key={lvl}
                onClick={() => setLevelFilter(isSelected ? 'all' : lvl)}
                className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-[1.02] ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50/20'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="text-2xl mb-1">{config.icon}</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {count}명
                </div>
                <div className="text-xs font-medium text-slate-500 mt-1">
                  {config.badgeText}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. [반 선택] 차시별 제출 현황 (Grid Table with exact Class (Count) tabs and Title) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        {/* Table Top Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Title with exact class name and student count in () */}
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 whitespace-nowrap">
              <span>📋</span>
              <span>{classTitleText} 차시별 제출 현황</span>
            </h2>

            {/* Class Selector Dropdown */}
            <ClassDropdown
              value={selectedClassId}
              onChange={setSelectedClassId}
              showAllOption={true}
              allOptionLabel="전체 보기"
            />
          </div>

          {/* Search, Filter & CSV */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="학생 이름 / 학번 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 w-36 sm:w-48"
              />
            </div>

            {/* Level Quick Filter */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 px-1">레벨:</span>
              {(['all', 1, 2, 3, 4, 5] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevelFilter(lvl)}
                  className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                    levelFilter === lvl
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {lvl === 'all' ? '전체' : `Lv.${lvl}`}
                </button>
              ))}
            </div>

            {/* CSV Download Button */}
            <button
              onClick={() => downloadCSV(selectedClassId === 'all' ? undefined : selectedClassId)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              📥 CSV 다운로드
            </button>
          </div>
        </div>

        {/* Submission Grid Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold">
                <th className="py-3 px-3 sticky left-0 z-10 bg-slate-900 whitespace-nowrap min-w-[70px]">
                  학번
                </th>
                <th className="py-3 px-4 sticky left-[70px] z-10 bg-slate-900 whitespace-nowrap min-w-[85px]">
                  이름
                </th>
                {selectedClassId === 'all' && (
                  <th className="py-3 px-3 whitespace-nowrap min-w-[85px]">
                    학급
                  </th>
                )}
                <th className="py-3 px-3 whitespace-nowrap text-center min-w-[100px]">
                  레벨
                </th>
                <th className="py-3 px-3 whitespace-nowrap text-center min-w-[70px]">
                  제출 수
                </th>
                {currentViewLessons.map((l) => (
                  <th
                    key={l.id}
                    className={`py-3 px-2 text-center whitespace-nowrap font-medium transition-colors ${
                      highlightedLessonId === l.id ? 'bg-blue-800 text-amber-300 font-bold' : ''
                    }`}
                    title={l.topic}
                  >
                    {l.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentClassStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={currentViewLessons.length + 5}
                    className="py-12 text-center text-slate-400 text-sm"
                  >
                    일치하는 학생 데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                currentClassStudents.map((student) => {
                  const sLessons = getLessonsForClass(student.classId).filter((l) => l.isActive);
                  const completedCount = sLessons.filter(
                    (l) => student.submissions[l.id]
                  ).length;
                  const levelInfo = calculateStudentLevel(completedCount, sLessons.length);

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Student Number */}
                      <td className="py-2.5 px-3 font-mono text-slate-500 sticky left-0 z-10 bg-white group-hover:bg-slate-50 whitespace-nowrap">
                        {student.studentNo || '-'}
                      </td>

                      {/* Name */}
                      <td className="py-2.5 px-4 font-semibold text-slate-900 sticky left-[70px] z-10 bg-white group-hover:bg-slate-50 whitespace-nowrap shadow-xs">
                        <button
                          onClick={() => onSelectStudent?.(student.id)}
                          className="hover:text-blue-600 hover:underline flex items-center gap-1.5 text-left"
                        >
                          <span>{student.name}</span>
                          {student.mentorPoints > 0 && (
                            <span className="text-[10px] font-normal px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                              👑 {student.mentorPoints}pt
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Class name if in all view */}
                      {selectedClassId === 'all' && (
                        <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                          {student.className}
                        </td>
                      )}

                      {/* Level Badge */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            levelInfo.level === 5
                              ? 'bg-blue-100 text-blue-700'
                              : levelInfo.level === 4
                              ? 'bg-emerald-100 text-emerald-700'
                              : levelInfo.level === 3
                              ? 'bg-amber-100 text-amber-700'
                              : levelInfo.level === 2
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          <span>Lv.{levelInfo.level}</span>
                          <span>{levelInfo.config.icon}</span>
                        </span>
                      </td>

                      {/* Submissions count */}
                      <td className="py-2.5 px-3 text-center font-medium text-slate-700 whitespace-nowrap">
                        {completedCount}/{sLessons.length}
                      </td>

                      {/* Lesson Status Badges */}
                      {currentViewLessons.map((lesson) => {
                        const isApplicable = lesson.id <= sLessons.length;
                        const isDone = !!student.submissions[lesson.id];
                        const isHighlightedCol = highlightedLessonId === lesson.id;

                        if (!isApplicable) {
                          return (
                            <td
                              key={lesson.id}
                              className={`py-2 px-1 text-center bg-slate-50/50 ${
                                isHighlightedCol ? 'bg-blue-50/40' : ''
                              }`}
                            >
                              <span className="text-[11px] text-slate-300 font-mono">-</span>
                            </td>
                          );
                        }

                        return (
                          <td
                            key={lesson.id}
                            className={`py-2 px-1 text-center ${
                              isHighlightedCol ? 'bg-blue-50/40' : ''
                            }`}
                          >
                            <button
                              onClick={() => toggleSubmission(student.id, lesson.id)}
                              className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all transform active:scale-90 ${
                                isDone
                                  ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
                                  : 'bg-rose-100 hover:bg-rose-200 text-rose-700'
                              }`}
                              title={`${student.name} - ${lesson.title}: ${
                                isDone ? '제출 완료 (클릭 시 미제출로 변경)' : '미제출 (클릭 시 제출 처리)'
                              }`}
                            >
                              {isDone ? (
                                <Check className="w-4 h-4 stroke-[3]" />
                              ) : (
                                <X className="w-4 h-4 stroke-[3]" />
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. ⚠️ 미제출 상세 */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>⚠️ 미제출 상세</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              학생별 미제출 개수 / 총 제출할 차시 수
            </p>
          </div>
          <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 w-fit">
            총 {missingStudentsList.length}명 미완료
          </span>
        </div>

        <div className="max-h-[380px] overflow-y-auto pr-1">
          {missingStudentsList.length === 0 ? (
            <div className="p-6 text-center text-emerald-600 bg-emerald-50 rounded-xl font-medium text-sm">
              🎉 모든 학생이 현재 차시의 학습지를 100% 제출 완료했습니다!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {missingStudentsList.map(({ student, missingCount, totalClassLessons }) => (
                <div
                  key={student.id}
                  onClick={() => onSelectStudent && onSelectStudent(student.id)}
                  className={`flex items-center justify-between py-2.5 px-3.5 bg-slate-50 hover:bg-slate-100/90 rounded-xl border border-slate-200/70 transition-all ${
                    onSelectStudent ? 'cursor-pointer hover:border-slate-300' : ''
                  }`}
                  title={`${student.name} 학생 상세 보기`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs text-slate-400 shrink-0">
                      {student.studentNo}
                    </span>
                    <span className="font-bold text-xs text-slate-900 truncate">
                      {student.name}
                    </span>
                    {selectedClassId === 'all' && (
                      <span className="text-[10px] text-slate-500 bg-slate-200/80 px-1.5 py-0.5 rounded shrink-0">
                        {student.className}
                      </span>
                    )}
                  </div>

                  <div className="shrink-0 ml-2">
                    <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-100/80 text-rose-700 border border-rose-200">
                      미제출 {missingCount}/{totalClassLessons}개
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. CSV 다운로드 버튼 */}
      <div className="flex justify-start">
        <button
          onClick={() =>
            downloadCSV(selectedClassId === 'all' ? undefined : selectedClassId)
          }
          className="flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
        >
          <span>📥</span>
          <span>
            {selectedClassId === 'all'
              ? '전체 7개 학급'
              : currentClassMeta?.name || `1학년 ${selectedClassId}반`}{' '}
            제출 현황 CSV 다운로드
          </span>
        </button>
      </div>
    </div>
  );
};
