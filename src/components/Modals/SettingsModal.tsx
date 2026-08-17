import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Settings, X, Plus, RotateCcw, UserPlus, BookOpen, AlertTriangle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { lessons, addLesson, toggleLessonActive, addStudent, resetData, classList } = useDashboard();

  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonTopic, setNewLessonTopic] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('1');
  const [newStudentNo, setNewStudentNo] = useState('');

  if (!isOpen) return null;

  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle) return;
    addLesson(newLessonTitle, newLessonTopic);
    setNewLessonTitle('');
    setNewLessonTopic('');
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName) return;
    addStudent(newStudentName, newStudentClass, newStudentNo || undefined);
    setNewStudentName('');
    setNewStudentNo('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-base">
              공통수학2 학습지 및 학급 관리 설정
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* 1. Add Lesson */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-xs sm:text-sm">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>신규 차시 개설</span>
            </h4>
            <form onSubmit={handleAddLesson} className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="차시명 (예: 19차시)"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
                <input
                  type="text"
                  placeholder="주제 (예: 공통수학2 종합평가)"
                  value={newLessonTopic}
                  onChange={(e) => setNewLessonTopic(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>차시 등록 및 활성화</span>
              </button>
            </form>

            {/* List of Lessons with toggles */}
            <div className="mt-3 pt-3 border-t border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                현재 등록된 차시 목록 (클릭 시 활성/비활성 전환):
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                {lessons.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => toggleLessonActive(l.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      l.isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-500 line-through'
                    }`}
                  >
                    {l.title} {l.isActive ? '✓' : '(비활성)'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Add Student */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-xs sm:text-sm">
              <UserPlus className="w-4 h-4 text-emerald-600" />
              <span>신규 학생 개별 추가</span>
            </h4>
            <form onSubmit={handleAddStudent} className="space-y-2.5">
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="학번 (예: 10121)"
                  value={newStudentNo}
                  onChange={(e) => setNewStudentNo(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <input
                  type="text"
                  placeholder="학생 이름"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
                <select
                  value={newStudentClass}
                  onChange={(e) => setNewStudentClass(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {classList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>학생 추가</span>
              </button>
            </form>
          </div>

          {/* 3. Reset All Data */}
          <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-200">
            <h4 className="font-bold text-rose-900 mb-1 flex items-center gap-1.5 text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>전체 데이터 초기화</span>
            </h4>
            <p className="text-xs text-rose-700 mb-3 leading-relaxed">
              제출 기록 및 멘토 포인트를 초기 상태(1학년 1~7반 136명 명렬 기준 초기화)로 되돌립니다.
            </p>
            <button
              onClick={() => {
                if (
                  confirm(
                    '정말로 데이터를 1학년 1~7반 (136명) 기본 명렬 상태로 초기화하시겠습니까?'
                  )
                ) {
                  resetData();
                  onClose();
                }
              }}
              className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>1학년 1~7반 명렬 데이터로 초기화</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
