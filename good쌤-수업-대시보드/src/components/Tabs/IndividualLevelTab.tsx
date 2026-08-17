import React, { useState, useMemo } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { calculateStudentLevel, getLessonsForClass } from '../../data/initialData';
import { Search, ChevronRight, Award, X } from 'lucide-react';
import { ClassDropdown } from '../ClassDropdown';

interface IndividualLevelTabProps {
  onSelectStudent: (studentId: string) => void;
}

export const IndividualLevelTab: React.FC<IndividualLevelTabProps> = ({ onSelectStudent }) => {
  const {
    students,
    classList,
    selectedClassId,
    setSelectedClassId,
    getClassStats,
  } = useDashboard();

  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'rank' | 'name' | 'mentor'>('rank');

  // Filter students based on class selection, search, and level filter
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        if (selectedClassId !== 'all' && s.classId !== selectedClassId) return false;
        if (
          searchQuery &&
          !s.name.includes(searchQuery) &&
          !(s.studentNo && s.studentNo.includes(searchQuery))
        )
          return false;

        const sLessons = getLessonsForClass(s.classId).filter((l) => l.isActive);
        const completed = sLessons.filter((l) => s.submissions[l.id]).length;
        const levelInfo = calculateStudentLevel(completed, sLessons.length);

        if (levelFilter !== 'all' && levelInfo.level !== levelFilter) return false;

        return true;
      })
      .map((student) => {
        const sLessons = getLessonsForClass(student.classId).filter((l) => l.isActive);
        const completed = sLessons.filter((l) => student.submissions[l.id]).length;
        const levelInfo = calculateStudentLevel(completed, sLessons.length);
        return {
          student,
          completed,
          totalLessons: sLessons.length,
          levelInfo,
        };
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return (
            (a.student.studentNo || '').localeCompare(b.student.studentNo || '') ||
            a.student.name.localeCompare(b.student.name)
          );
        }
        if (sortBy === 'mentor') {
          return (
            b.student.mentorPoints - a.student.mentorPoints ||
            b.completed - a.completed ||
            a.student.name.localeCompare(b.student.name)
          );
        }
        // default rank (most submissions first)
        return (
          b.completed - a.completed ||
          b.student.mentorPoints - a.student.mentorPoints ||
          (a.student.studentNo || '').localeCompare(b.student.studentNo || '') ||
          a.student.name.localeCompare(b.student.name)
        );
      });
  }, [students, selectedClassId, searchQuery, levelFilter, sortBy]);

  const currentClassMeta = classList.find((c) => c.id === selectedClassId);

  return (
    <div className="space-y-6">
      {/* Top Filter & Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Class Selection & Level Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <ClassDropdown
            value={selectedClassId}
            onChange={setSelectedClassId}
            showAllOption={true}
            allOptionLabel="전체 보기"
          />

          {/* Level Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setLevelFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                levelFilter === 'all'
                  ? 'bg-slate-900 text-white font-bold'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              전체
            </button>
            {[5, 4, 3, 2, 1].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={`px-2 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                  levelFilter === lvl
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <span>Lv.{lvl}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="학생 이름/학번 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-44"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
          >
            <option value="rank">제출순 정렬</option>
            <option value="name">학번/이름순</option>
            <option value="mentor">멘토포인트순</option>
          </select>
        </div>
      </div>

      {/* Class Section Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">
          {selectedClassId === 'all'
            ? `전체 학생 레벨 현황 (${students.length}명)`
            : `${currentClassMeta?.name || `1학년 ${selectedClassId}반`} (${getClassStats(selectedClassId).totalStudents}명, ${currentClassMeta?.totalLessons}차시)`}
        </h2>
        <span className="text-xs text-slate-500 font-medium">
          총 {filteredStudents.length}명 표시
        </span>
      </div>

      {/* Student Cards 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStudents.length === 0 ? (
          <div className="col-span-2 py-16 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
            조건에 맞는 학생이 없습니다.
          </div>
        ) : (
          filteredStudents.map(({ student, completed, totalLessons, levelInfo }, index) => {
            const rank = index + 1;
            const isTop3 = rank <= 3 && completed > 0;
            const rankIcon =
              rank === 1 && completed > 0
                ? '🥇'
                : rank === 2 && completed > 0
                ? '🥈'
                : rank === 3 && completed > 0
                ? '🥉'
                : `${rank}위`;

            // Progress bar percentage
            const xpPercent = Math.min((levelInfo.currentXp / levelInfo.maxXp) * 100, 100);

            // Progress bar color based on level
            const barColor =
              levelInfo.level === 5
                ? 'bg-blue-600'
                : levelInfo.level === 4
                ? 'bg-emerald-600'
                : levelInfo.level === 3
                ? 'bg-amber-500'
                : levelInfo.level === 2
                ? 'bg-orange-600'
                : 'bg-rose-500';

            // Badge styling
            const badgeStyle =
              levelInfo.level === 5
                ? 'bg-blue-100 text-blue-700'
                : levelInfo.level === 4
                ? 'bg-emerald-100 text-emerald-700'
                : levelInfo.level === 3
                ? 'bg-amber-100 text-amber-700'
                : levelInfo.level === 2
                ? 'bg-orange-100 text-orange-700'
                : 'bg-rose-100 text-rose-700';

            return (
              <div
                key={student.id}
                onClick={() => onSelectStudent(student.id)}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all hover:shadow-md hover:border-blue-300 cursor-pointer flex flex-col justify-between ${
                  levelInfo.level === 5
                    ? 'border-blue-200/90'
                    : 'border-slate-200/80'
                }`}
              >
                <div>
                  {/* Top Row: Rank, Icon, Name and Level Badge */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-extrabold ${
                          isTop3 ? 'text-amber-500' : 'text-slate-400'
                        }`}
                      >
                        {rankIcon}
                      </span>
                      <span className="text-lg">{levelInfo.config.icon}</span>
                      <span className="font-bold text-base text-slate-900">
                        {student.name}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        ({student.studentNo})
                      </span>
                      {student.mentorPoints > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                          <Award className="w-3 h-3 text-amber-600" />
                          <span>{student.mentorPoints}pt</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${badgeStyle}`}
                      >
                        Lv.{levelInfo.level}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                    </div>
                  </div>

                  {/* Subtitle: Title and completed count */}
                  <p className="text-xs text-slate-500 mb-3.5">
                    {student.className} · {levelInfo.config.title} · {completed}/{totalLessons} 차시 완료
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-2">
                    <div
                      style={{ width: `${Math.max(xpPercent, 3)}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    />
                  </div>
                </div>

                {/* Bottom Row: Current XP and Next Level Target */}
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 pt-1">
                  <span>
                    {levelInfo.currentXp}/{levelInfo.maxXp} XP
                  </span>
                  <span
                    className={
                      levelInfo.isMax ? 'text-amber-600 font-bold' : 'text-slate-500'
                    }
                  >
                    {levelInfo.xpText}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
