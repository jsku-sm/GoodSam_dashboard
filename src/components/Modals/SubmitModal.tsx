import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { getLessonsForClass } from '../../data/initialData';
import { X, CheckCircle2, UserCheck, BookOpen, MessageSquare } from 'lucide-react';

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStudentId?: string;
  defaultLessonId?: number;
}

export const SubmitModal: React.FC<SubmitModalProps> = ({
  isOpen,
  onClose,
  defaultStudentId,
  defaultLessonId,
}) => {
  const { students, submitWorksheetWithMentor } = useDashboard();

  const [studentId, setStudentId] = useState<string>(
    defaultStudentId || (students[0]?.id ?? '')
  );
  const [lessonId, setLessonId] = useState<number>(defaultLessonId || 1);
  const [mentorId, setMentorId] = useState<string>('');
  const [memo, setMemo] = useState<string>('');

  if (!isOpen) return null;

  const currentStudent = students.find((s) => s.id === studentId);
  const studentLessons = currentStudent
    ? getLessonsForClass(currentStudent.classId).filter((l) => l.isActive)
    : [];

  const currentClassStudents = currentStudent
    ? students.filter((s) => s.classId === currentStudent.classId && s.id !== currentStudent.id)
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !lessonId) return;

    submitWorksheetWithMentor(studentId, lessonId, mentorId || undefined, memo || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">
              학습지 실시간 제출 등록
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          {/* Student selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>제출 학생 선택 *</span>
            </label>
            <select
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value);
                setMentorId('');
              }}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              {students.map((s) => {
                const sLessons = getLessonsForClass(s.classId).filter((l) => l.isActive);
                const doneCount = sLessons.filter((l) => s.submissions[l.id]).length;
                return (
                  <option key={s.id} value={s.id}>
                    [{s.className}] {s.name} (완료: {doneCount}/{sLessons.length}차시)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Lesson selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>학습지 차시 선택 * ({studentLessons.length}차시)</span>
            </label>
            <select
              value={lessonId}
              onChange={(e) => setLessonId(Number(e.target.value))}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              {studentLessons.map((l) => {
                const isAlready = currentStudent?.submissions[l.id];
                return (
                  <option key={l.id} value={l.id}>
                    {l.title} {l.topic ? `- ${l.topic}` : ''}{' '}
                    {isAlready ? '(이미 제출됨)' : '(미제출)'}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Optional Mentor selection */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5">
            <label className="block text-xs font-bold text-amber-900 mb-1 flex items-center gap-1.5">
              <span>👑 도움을 준 또래 멘토 지정 (선택 시 멘토 +1pt)</span>
            </label>
            <p className="text-[11px] text-amber-700 mb-2">
              이 문제나 학습지를 풀 때 도움을 준 친구가 있다면 지목해 주세요!
            </p>
            <select
              value={mentorId}
              onChange={(e) => setMentorId(e.target.value)}
              className="w-full bg-white border border-amber-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            >
              <option value="">(멘토 없음 / 스스로 해결)</option>
              {currentClassStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (현재 {s.mentorPoints}pt)
                </option>
              ))}
            </select>
          </div>

          {/* Memo / Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>선생님 확인 메모 (선택)</span>
            </label>
            <input
              type="text"
              placeholder="예: 방과후 지도 확인, 풀이과정 우수 등"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors"
            >
              제출 등록 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
