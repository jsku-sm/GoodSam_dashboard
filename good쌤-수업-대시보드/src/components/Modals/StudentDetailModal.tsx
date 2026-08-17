import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { calculateStudentLevel, getLessonsForClass } from '../../data/initialData';
import { X, Check, Award, Plus, Trash2, BookOpen } from 'lucide-react';

interface StudentDetailModalProps {
  studentId: string | null;
  onClose: () => void;
  onOpenSubmitForStudent: (studentId: string) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  studentId,
  onClose,
  onOpenSubmitForStudent,
}) => {
  const { students, toggleSubmission, mentorLogs, deleteStudent } = useDashboard();

  if (!studentId) return null;

  const student = students.find((s) => s.id === studentId);
  if (!student) return null;

  const studentLessons = getLessonsForClass(student.classId).filter((l) => l.isActive);
  const completedCount = studentLessons.filter((l) => student.submissions[l.id]).length;
  const levelInfo = calculateStudentLevel(completedCount, studentLessons.length);
  const rate =
    studentLessons.length > 0 ? Math.round((completedCount / studentLessons.length) * 100) : 0;

  const relatedLogs = mentorLogs.filter(
    (log) => log.mentorStudentId === student.id || log.menteeStudentId === student.id
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl shadow-xs">
              {levelInfo.config.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-900 text-lg">{student.name}</h3>
                {student.studentNo && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
                    {student.studentNo}
                  </span>
                )}
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-700 font-medium">
                  {student.className}
                </span>
                {student.department && (
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium">
                    {student.department}
                  </span>
                )}
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
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
                  Lv.{levelInfo.level} {levelInfo.config.title}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                완료: {completedCount}/{studentLessons.length}차시 ({rate}%) · 멘토 포인트:{' '}
                <strong className="text-amber-600">{student.mentorPoints}pt</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* XP Progress */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center text-xs font-medium mb-1.5">
              <span className="text-slate-600">공통수학2 레벨 경험치</span>
              <span className="text-slate-900 font-bold">
                {levelInfo.currentXp}/{levelInfo.maxXp} XP ({levelInfo.xpText})
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                style={{
                  width: `${Math.min((levelInfo.currentXp / levelInfo.maxXp) * 100, 100)}%`,
                }}
                className={`h-full rounded-full transition-all duration-300 ${levelInfo.config.barColor}`}
              />
            </div>
          </div>

          {/* Lesson Checklist Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>차시별 학습지 제출 체크리스트 ({studentLessons.length}차시)</span>
              </h4>
              <span className="text-xs text-slate-400">클릭하여 즉시 토글</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {studentLessons.map((lesson) => {
                const isDone = !!student.submissions[lesson.id];
                return (
                  <button
                    key={lesson.id}
                    onClick={() => toggleSubmission(student.id, lesson.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isDone
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">{lesson.title}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[90px]">
                        {lesson.topic || '공통수학2'}
                      </div>
                    </div>
                    <span
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '미'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mentoring Activity History */}
          {relatedLogs.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>관련 멘토링 활동 내역 ({relatedLogs.length}건)</span>
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {relatedLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 bg-amber-50/50 border border-amber-200/60 rounded-xl text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">
                        {log.mentorStudentId === student.id ? (
                          <span className="text-amber-700">👑 멘토 활동: {log.menteeName} 학생 지도</span>
                        ) : (
                          <span className="text-blue-700">💡 멘티 수혜: {log.mentorName} 멘토 도움</span>
                        )}
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        {log.lessonId}차시 · {log.note}
                      </div>
                    </div>
                    <span className="text-slate-400 text-[10px] font-mono">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm(`${student.name} 학생을 명단에서 삭제하시겠습니까?`)) {
                deleteStudent(student.id);
                onClose();
              }
            }}
            className="text-xs text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>학생 삭제</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenSubmitForStudent(student.id);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>학습지 제출 등록</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
