import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Award, X, Sparkles, HeartHandshake } from 'lucide-react';

interface MentorAwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMentorId?: string;
}

export const MentorAwardModal: React.FC<MentorAwardModalProps> = ({
  isOpen,
  onClose,
  defaultMentorId,
}) => {
  const { students, activeLessons, awardMentorPoints } = useDashboard();

  const [mentorId, setMentorId] = useState<string>(
    defaultMentorId || (students[0]?.id ?? '')
  );
  const [menteeId, setMenteeId] = useState<string>('');
  const [lessonId, setLessonId] = useState<number>(
    activeLessons[activeLessons.length - 1]?.id ?? 1
  );
  const [points, setPoints] = useState<number>(1);
  const [note, setNote] = useState<string>('');

  if (!isOpen) return null;

  const mentorStudent = students.find((s) => s.id === mentorId);
  const menteeCandidates = mentorStudent
    ? students.filter((s) => s.classId === mentorStudent.classId && s.id !== mentorStudent.id)
    : students;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorId) return;

    awardMentorPoints(
      mentorId,
      menteeId || 's-unknown',
      lessonId,
      points,
      note || '또래 학습 질문 해결 멘토링'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-amber-50/60">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-base">
              멘토 포인트 수여하기
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          {/* Mentor selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <span>👑 도움을 준 멘토 학생 *</span>
            </label>
            <select
              value={mentorId}
              onChange={(e) => setMentorId(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  [{s.className}] {s.name} (현재 {s.mentorPoints}pt)
                </option>
              ))}
            </select>
          </div>

          {/* Mentee selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <HeartHandshake className="w-3.5 h-3.5 text-slate-500" />
              <span>도움을 받은 학생 (멘티)</span>
            </label>
            <select
              value={menteeId}
              onChange={(e) => setMenteeId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            >
              <option value="">(지정하지 않음 / 일반 우수 멘토링)</option>
              {menteeCandidates.map((s) => (
                <option key={s.id} value={s.id}>
                  [{s.className}] {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Lesson & Points */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                관련 차시
              </label>
              <select
                value={lessonId}
                onChange={(e) => setLessonId(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                {activeLessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                지급 포인트
              </label>
              <select
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value={1}>+1 포인트 (기본 문제 풀이 지도)</option>
                <option value={2}>+2 포인트 (심화/서술형 열정 멘토링)</option>
                <option value={3}>+3 포인트 (특별 지도 및 단체 멘토링)</option>
              </select>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              활동 내용 및 메모
            </label>
            <input
              type="text"
              placeholder="예: 귀납법 증명 구조를 친절히 설명하여 급우 이해도 향상"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>포인트 부여</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
