import React, { useState, useRef, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { ChevronDown, Check, Users, GraduationCap } from 'lucide-react';

interface ClassDropdownProps {
  value: string;
  onChange: (classId: string) => void;
  className?: string;
  showAllOption?: boolean;
  allOptionLabel?: string;
}

export const ClassDropdown: React.FC<ClassDropdownProps> = ({
  value,
  onChange,
  className = '',
  showAllOption = true,
  allOptionLabel = '전체 보기',
}) => {
  const { classList, getClassStats, students } = useDashboard();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAll = value === 'all';
  const currentMeta = classList.find((c) => c.id === value);
  const currentStudentCount = isAll
    ? students.length
    : currentMeta
    ? getClassStats(currentMeta.id).totalStudents
    : 0;

  const currentLabel = isAll
    ? `${allOptionLabel} (${students.length}명)`
    : `${currentMeta?.name} (${currentStudentCount}명)`;

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between gap-2 px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 shadow-2xs hover:bg-slate-50 hover:border-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer min-w-[170px]"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 truncate">
          <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="truncate">{currentLabel}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-blue-600' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-64 rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100">
          <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>학급 선택</span>
            <Users className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="py-1 max-h-72 overflow-y-auto">
            {/* 1 ~ 7 반 목록 */}
            {classList.map((cls) => {
              const count = getClassStats(cls.id).totalStudents;
              const isSelected = value === cls.id;
              return (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => {
                    onChange(cls.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/80 text-blue-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">{cls.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {cls.department} · {cls.totalLessons}차시
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-blue-100 text-blue-800 font-bold'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {count}명
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 전체 보기 옵션 */}
          {showAllOption && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  onChange('all');
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer ${
                  isAll
                    ? 'bg-blue-50/80 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-semibold">{allOptionLabel}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    1학년 전체 (1~7반)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isAll
                        ? 'bg-blue-100 text-blue-800 font-bold'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {students.length}명
                  </span>
                  {isAll && <Check className="w-4 h-4 text-blue-600" />}
                </div>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
