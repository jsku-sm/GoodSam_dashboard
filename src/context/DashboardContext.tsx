import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Student,
  Lesson,
  MentorLog,
  ClassStats,
  OverallStats,
  LevelTier,
} from '../types';
import {
  INITIAL_STUDENTS,
  LESSON_LIST,
  INITIAL_MENTOR_LOGS,
  CLASS_LIST,
  ClassMeta,
  calculateStudentLevel,
  getClassLessonCount,
  getLessonsForClass,
} from '../data/initialData';

export interface ToastMessage {
  id: string;
  type: 'submit' | 'levelup' | 'mentor' | 'info';
  title: string;
  description: string;
  timestamp: Date;
}

interface DashboardContextType {
  students: Student[];
  lessons: Lesson[];
  activeLessons: Lesson[];
  getLessonsForSelectedClass: (classId?: string) => Lesson[];
  mentorLogs: MentorLog[];
  classList: ClassMeta[];
  selectedClassId: string;
  setSelectedClassId: (classId: string) => void;
  lastUpdated: Date;
  isSimulating: boolean;
  setIsSimulating: React.Dispatch<React.SetStateAction<boolean>>;
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
  addToast: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => void;
  
  // Actions
  toggleSubmission: (studentId: string, lessonId: number) => void;
  submitWorksheetWithMentor: (
    studentId: string,
    lessonId: number,
    mentorStudentId?: string,
    memo?: string
  ) => void;
  awardMentorPoints: (
    mentorStudentId: string,
    menteeStudentId: string,
    lessonId: number,
    points: number,
    note?: string
  ) => void;
  addLesson: (title: string, topic?: string) => void;
  toggleLessonActive: (lessonId: number) => void;
  addStudent: (name: string, classId: string, studentNo?: string) => void;
  deleteStudent: (studentId: string) => void;
  resetData: () => void;
  downloadCSV: (targetClassId?: string) => void;
  
  // Computed
  overallStats: OverallStats;
  getClassStats: (classId: string) => ClassStats;
  allClassStats: ClassStats[];
  mentorRankings: {
    rank: number;
    student: Student;
    points: number;
    classId: string;
  }[];
  activeLessonSubmissionCounts: {
    lessonId: number;
    title: string;
    topic?: string;
    count: number;
    totalPossible: number;
    rate: number;
  }[];
}

const STORAGE_KEY_STUDENTS = 'guteacher_math2_students_v7_clean';
const STORAGE_KEY_LESSONS = 'guteacher_math2_lessons_v7_clean';
const STORAGE_KEY_MENTORS = 'guteacher_math2_mentors_v7_clean';

const DashboardContext = createContext<DashboardContextType | null>(null);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STUDENTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_STUDENTS;
  });

  const [lessons, setLessons] = useState<Lesson[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LESSONS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return LESSON_LIST;
  });

  const [mentorLogs, setMentorLogs] = useState<MentorLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MENTORS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_MENTOR_LOGS;
  });

  const [selectedClassId, setSelectedClassId] = useState<string>('1'); // default 1학년 1반
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    } catch {}
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LESSONS, JSON.stringify(lessons));
    } catch {}
  }, [lessons]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MENTORS, JSON.stringify(mentorLogs));
    } catch {}
  }, [mentorLogs]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = {
      ...toast,
      id,
      timestamp: new Date(),
    };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const activeLessons = useMemo(() => lessons.filter((l) => l.isActive), [lessons]);

  // Helper to get class-specific lessons
  const getLessonsForSelectedClass = useCallback(
    (classId?: string) => {
      const targetId = classId || selectedClassId;
      if (targetId === 'all') {
        return activeLessons;
      }
      const classLessons = getLessonsForClass(targetId);
      const activeIds = new Set(activeLessons.map((l) => l.id));
      return classLessons.filter((l) => activeIds.has(l.id));
    },
    [selectedClassId, activeLessons]
  );

  // Helper to get completed count for a student
  const getStudentCompletedCount = useCallback(
    (studentSubmissions: Record<number, boolean>, classId?: string) => {
      const maxL = classId ? getClassLessonCount(classId) : 32;
      return Object.entries(studentSubmissions).filter(
        ([k, v]) => Boolean(v) && Number(k) <= maxL
      ).length;
    },
    []
  );

  // Trigger celebration
  const triggerLevelUpCelebration = useCallback((studentName: string, newLevelTitle: string) => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {}

    addToast({
      type: 'levelup',
      title: `🎉 레벨 업! ${studentName}`,
      description: `축하합니다! ${newLevelTitle} 단계에 도달했습니다!`,
    });
  }, [addToast]);

  // Toggle single submission
  const toggleSubmission = useCallback(
    (studentId: string, lessonId: number) => {
      setStudents((prev) =>
        prev.map((student) => {
          if (student.id !== studentId) return student;

          const currentStatus = !!student.submissions[lessonId];
          const newStatus = !currentStatus;
          const maxL = getClassLessonCount(student.classId);
          const prevCompletedCount = getStudentCompletedCount(student.submissions, student.classId);
          
          const newSubmissions = {
            ...student.submissions,
            [lessonId]: newStatus,
          };
          const newCompletedCount = getStudentCompletedCount(newSubmissions, student.classId);

          // Check level up
          const prevLevel = calculateStudentLevel(prevCompletedCount, maxL).level;
          const newLevel = calculateStudentLevel(newCompletedCount, maxL).level;

          if (newStatus && newLevel > prevLevel) {
            triggerLevelUpCelebration(
              student.name,
              calculateStudentLevel(newCompletedCount, maxL).config.title
            );
          } else if (newStatus) {
            addToast({
              type: 'submit',
              title: `✅ 학습지 제출 완료`,
              description: `${student.className} ${student.name} 학생이 ${lessonId}차시를 제출했습니다.`,
            });
          }

          return {
            ...student,
            submissions: newSubmissions,
            lastUpdated: new Date().toISOString(),
          };
        })
      );
      setLastUpdated(new Date());
    },
    [getStudentCompletedCount, triggerLevelUpCelebration, addToast]
  );

  // Submit with mentor attribution
  const submitWorksheetWithMentor = useCallback(
    (studentId: string, lessonId: number, mentorStudentId?: string, memo?: string) => {
      setStudents((prev) => {
        let mentorName = '';
        let menteeName = '';
        let menteeClassName = '';

        const updated = prev.map((s) => {
          if (s.id === studentId) {
            menteeName = s.name;
            menteeClassName = s.className;
            const maxL = getClassLessonCount(s.classId);
            const prevCount = getStudentCompletedCount(s.submissions, s.classId);
            const newSubmissions = { ...s.submissions, [lessonId]: true };
            const newCount = getStudentCompletedCount(newSubmissions, s.classId);
            
            const prevL = calculateStudentLevel(prevCount, maxL).level;
            const newL = calculateStudentLevel(newCount, maxL).level;
            if (newL > prevL) {
              triggerLevelUpCelebration(s.name, calculateStudentLevel(newCount, maxL).config.title);
            }
            return {
              ...s,
              submissions: newSubmissions,
              memo: memo || s.memo,
              lastUpdated: new Date().toISOString(),
            };
          }
          return s;
        });

        if (mentorStudentId && mentorStudentId !== studentId) {
          const updatedWithMentor = updated.map((s) => {
            if (s.id === mentorStudentId) {
              mentorName = s.name;
              return {
                ...s,
                mentorPoints: s.mentorPoints + 1,
              };
            }
            return s;
          });

          // Log mentor activity
          const newLog: MentorLog = {
            id: 'log-' + Date.now(),
            timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            mentorStudentId,
            mentorName,
            menteeStudentId: studentId,
            menteeName,
            lessonId,
            note: memo || `${lessonId}차시 문제 풀이 멘토링`,
          };
          setMentorLogs((prevLogs) => [newLog, ...prevLogs]);

          addToast({
            type: 'mentor',
            title: `👑 멘토 포인트 획득! (+1pt)`,
            description: `${mentorName} 학생이 ${menteeName} 학생을 도와 멘토 포인트를 획득했습니다.`,
          });

          return updatedWithMentor;
        }

        addToast({
          type: 'submit',
          title: `✅ 학습지 제출 등록`,
          description: `${menteeClassName} ${menteeName} 학생의 ${lessonId}차시 제출이 완료되었습니다.`,
        });

        return updated;
      });
      setLastUpdated(new Date());
    },
    [getStudentCompletedCount, triggerLevelUpCelebration, addToast]
  );

  // Award Mentor Points directly
  const awardMentorPoints = useCallback(
    (
      mentorStudentId: string,
      menteeStudentId: string,
      lessonId: number,
      points: number,
      note?: string
    ) => {
      let mentorName = '';
      let menteeName = '';

      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === mentorStudentId) {
            mentorName = s.name;
            return { ...s, mentorPoints: s.mentorPoints + points };
          }
          if (s.id === menteeStudentId) {
            menteeName = s.name;
          }
          return s;
        })
      );

      const newLog: MentorLog = {
        id: 'log-' + Date.now(),
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        mentorStudentId,
        mentorName: mentorName || '멘토',
        menteeStudentId,
        menteeName: menteeName || '학생',
        lessonId,
        note: note || '또래 멘토링 활동 인정',
      };
      setMentorLogs((prev) => [newLog, ...prev]);

      addToast({
        type: 'mentor',
        title: `👑 멘토 포인트 지급 완료 (+${points}pt)`,
        description: `${mentorName} 학생에게 또래 지도 멘토 포인트가 적립되었습니다.`,
      });
      setLastUpdated(new Date());
    },
    [addToast]
  );

  // Add Lesson
  const addLesson = useCallback((title: string, topic?: string) => {
    setLessons((prev) => {
      const nextId = Math.max(...prev.map((l) => l.id), 0) + 1;
      return [...prev, { id: nextId, title, topic: topic || undefined, isActive: true }];
    });
    addToast({
      type: 'info',
      title: '📖 신규 차시 개설',
      description: `${title} 차시가 등록되었습니다.`,
    });
    setLastUpdated(new Date());
  }, [addToast]);

  const toggleLessonActive = useCallback((lessonId: number) => {
    setLessons((prev) =>
      prev.map((l) => (l.id === lessonId ? { ...l, isActive: !l.isActive } : l))
    );
    setLastUpdated(new Date());
  }, []);

  // Add Student
  const addStudent = useCallback((name: string, classId: string, studentNo?: string) => {
    const meta = CLASS_LIST.find((c) => c.id === classId);
    const className = meta ? meta.name : `1학년 ${classId}반`;
    const department = meta?.department || '공통수학2';
    const autoNo = studentNo || `10${classId}${Date.now().toString().slice(-2)}`;
    
    const newStudent: Student = {
      id: `s${autoNo}-${Date.now().toString(36)}`,
      studentNo: autoNo,
      name,
      classId,
      className,
      department,
      mentorPoints: 0,
      submissions: {},
    };
    setStudents((prev) => [...prev, newStudent]);
    addToast({
      type: 'info',
      title: '👤 학생 등록',
      description: `${className} ${name} 학생이 등록되었습니다.`,
    });
    setLastUpdated(new Date());
  }, [addToast]);

  const deleteStudent = useCallback((studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setLastUpdated(new Date());
  }, []);

  // Reset to initial
  const resetData = useCallback(() => {
    setStudents(INITIAL_STUDENTS);
    setLessons(LESSON_LIST);
    setMentorLogs(INITIAL_MENTOR_LOGS);
    localStorage.removeItem(STORAGE_KEY_STUDENTS);
    localStorage.removeItem(STORAGE_KEY_LESSONS);
    localStorage.removeItem(STORAGE_KEY_MENTORS);
    setLastUpdated(new Date());
    addToast({
      type: 'info',
      title: '🔄 데이터 초기화 완료',
      description: '1학년 1~7반 (1,2,4,5반: 32차시 / 3,6,7반: 16차시) 기준으로 초기화되었습니다.',
    });
  }, [addToast]);

  // CSV Export with class-specific lesson count
  const downloadCSV = useCallback((targetClassId?: string) => {
    const targetStudents = targetClassId
      ? students.filter((s) => s.classId === targetClassId)
      : students;

    const classMeta = CLASS_LIST.find((c) => c.id === targetClassId);
    const classLabel = classMeta ? classMeta.name.replace(' ', '_') : '전체_7개반';
    
    const targetLessons = targetClassId
      ? getLessonsForClass(targetClassId).filter((l) => l.isActive)
      : activeLessons;

    // Header
    const headers = ['학번', '이름', '학급', '학과', '주당시수', '총차시', '레벨', '제출수', '제출률(%)', '멘토포인트'];
    targetLessons.forEach((l) => headers.push(l.title));

    const rows = targetStudents.map((s) => {
      const sLessons = getLessonsForClass(s.classId).filter((l) => l.isActive);
      const completed = sLessons.filter((l) => s.submissions[l.id]).length;
      const rate = sLessons.length > 0 ? Math.round((completed / sLessons.length) * 100) : 0;
      const lvl = calculateStudentLevel(completed, sLessons.length).config.badgeText;
      const sMeta = CLASS_LIST.find((c) => c.id === s.classId);

      const row = [
        s.studentNo || '-',
        s.name,
        s.className,
        s.department || '-',
        `${sMeta?.weeklyHours || 2}시간`,
        `${sLessons.length}차시`,
        lvl,
        `${completed}/${sLessons.length}`,
        `${rate}%`,
        `${s.mentorPoints}pt`,
      ];
      targetLessons.forEach((l) => {
        if (l.id > sLessons.length) {
          row.push('해당없음(-)');
        } else {
          row.push(s.submissions[l.id] ? '제출(O)' : '미제출(X)');
        }
      });
      return row;
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `구쌤_공통수학2_${classLabel}_제출현황_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [students, activeLessons]);

  // Real-time Simulation Engine
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setStudents((prev) => {
        const candidates = prev.filter((s) => {
          const sLessons = getLessonsForClass(s.classId).filter((l) => l.isActive);
          const missing = sLessons.filter((l) => !s.submissions[l.id]);
          return missing.length > 0;
        });

        if (candidates.length === 0) return prev;

        const randomStudent = candidates[Math.floor(Math.random() * candidates.length)];
        const sLessons = getLessonsForClass(randomStudent.classId).filter((l) => l.isActive);
        const missingLessons = sLessons.filter((l) => !randomStudent.submissions[l.id]);
        if (missingLessons.length === 0) return prev;

        const randomLesson = missingLessons[Math.floor(Math.random() * missingLessons.length)];

        // Maybe attribute to a mentor in same class who already finished this lesson
        const possibleMentors = prev.filter(
          (s) => s.classId === randomStudent.classId && s.id !== randomStudent.id && s.submissions[randomLesson.id]
        );
        const willHaveMentor = possibleMentors.length > 0 && Math.random() > 0.4;
        const chosenMentor = willHaveMentor
          ? possibleMentors[Math.floor(Math.random() * possibleMentors.length)]
          : null;

        const prevCount = sLessons.filter((l) => randomStudent.submissions[l.id]).length;
        const newSubmissions = { ...randomStudent.submissions, [randomLesson.id]: true };
        const newCount = prevCount + 1;

        const prevLvl = calculateStudentLevel(prevCount, sLessons.length).level;
        const newLvl = calculateStudentLevel(newCount, sLessons.length).level;

        if (newLvl > prevLvl) {
          triggerLevelUpCelebration(randomStudent.name, calculateStudentLevel(newCount, sLessons.length).config.title);
        } else {
          addToast({
            type: 'submit',
            title: `⚡ [실시간] ${randomStudent.name} 학생 제출`,
            description: `${randomStudent.className} ${randomLesson.title} 제출 완료!${
              chosenMentor ? ` (멘토: ${chosenMentor.name} +1pt)` : ''
            }`,
          });
        }

        if (chosenMentor) {
          const newLog: MentorLog = {
            id: 'log-' + Date.now(),
            timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            mentorStudentId: chosenMentor.id,
            mentorName: chosenMentor.name,
            menteeStudentId: randomStudent.id,
            menteeName: randomStudent.name,
            lessonId: randomLesson.id,
            note: `${randomLesson.title} 실시간 또래 질문 해결`,
          };
          setMentorLogs((prevLogs) => [newLog, ...prevLogs]);
        }

        return prev.map((s) => {
          if (s.id === randomStudent.id) {
            return {
              ...s,
              submissions: newSubmissions,
              lastUpdated: new Date().toISOString(),
            };
          }
          if (chosenMentor && s.id === chosenMentor.id) {
            return {
              ...s,
              mentorPoints: s.mentorPoints + 1,
            };
          }
          return s;
        });
      });
      setLastUpdated(new Date());
    }, 4000);

    return () => clearInterval(interval);
  }, [isSimulating, triggerLevelUpCelebration, addToast]);

  // Compute Class Stats Helper
  const getClassStats = useCallback(
    (classId: string): ClassStats => {
      const classMeta = CLASS_LIST.find((c) => c.id === classId);
      const classStudents = students.filter((s) => s.classId === classId);
      const totalStudents = classStudents.length;
      const classLessons = getLessonsForClass(classId).filter((l) => l.isActive);
      const totalLessonsCount = classLessons.length;
      const maxPossibleSubmissions = totalStudents * totalLessonsCount;

      let totalSubmissions = 0;
      let activeStudents = 0;
      let totalMentorPoints = 0;
      let maxLessonSubmitted = 0;
      const zeroSubmissionStudents: Student[] = [];
      const levelCounts: Record<LevelTier, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      let sumOfLevels = 0;

      classStudents.forEach((student) => {
        const completed = classLessons.filter((l) => student.submissions[l.id]).length;
        totalSubmissions += completed;
        totalMentorPoints += student.mentorPoints || 0;
        if (completed > maxLessonSubmitted) {
          maxLessonSubmitted = completed;
        }

        if (completed > 0) {
          activeStudents++;
        } else {
          zeroSubmissionStudents.push(student);
        }

        const lvl = calculateStudentLevel(completed, totalLessonsCount).level;
        levelCounts[lvl] = (levelCounts[lvl] || 0) + 1;
        sumOfLevels += lvl;
      });

      const submissionRate =
        maxPossibleSubmissions > 0
          ? Math.round((totalSubmissions / maxPossibleSubmissions) * 100)
          : 0;

      const avgSubmissionsPerStudent =
        totalStudents > 0 ? Number((totalSubmissions / totalStudents).toFixed(1)) : 0;

      const avgLevel =
        totalStudents > 0 ? Number((sumOfLevels / totalStudents).toFixed(1)) : 1.0;

      return {
        classId,
        className: classMeta ? classMeta.name : `1학년 ${classId}반`,
        department: classMeta?.department,
        weeklyHours: classMeta?.weeklyHours || 2,
        totalLessons: totalLessonsCount,
        totalStudents,
        activeStudents,
        totalSubmissions,
        maxPossibleSubmissions,
        maxLessonSubmitted,
        submissionRate,
        avgSubmissionsPerStudent,
        avgLevel,
        totalMentorPoints,
        levelCounts,
        zeroSubmissionStudents,
      };
    },
    [students]
  );

  const allClassStats = useMemo(() => {
    return CLASS_LIST.map((c) => getClassStats(c.id));
  }, [getClassStats]);

  // Overall stats across all classes
  const overallStats = useMemo<OverallStats>(() => {
    const totalStudents = students.length;
    let totalSubmissions = 0;
    let activeStudents = 0;
    let totalMentorPoints = 0;
    let maxLessonSubmitted = 0;
    const levelCounts: Record<LevelTier, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    students.forEach((s) => {
      const sLessons = getLessonsForClass(s.classId).filter((l) => l.isActive);
      const completed = sLessons.filter((l) => s.submissions[l.id]).length;
      totalSubmissions += completed;
      if (completed > 0) activeStudents++;
      totalMentorPoints += s.mentorPoints || 0;
      if (completed > maxLessonSubmitted) {
        maxLessonSubmitted = completed;
      }

      const lvl = calculateStudentLevel(completed, sLessons.length).level;
      levelCounts[lvl] = (levelCounts[lvl] || 0) + 1;
    });

    return {
      totalSubmissions,
      totalStudents,
      activeStudents,
      maxLessonSubmitted,
      currentActiveLessons: activeLessons.length,
      totalPlannedLessons: lessons.length,
      totalMentorPoints,
      levelCounts,
    };
  }, [students, activeLessons, lessons]);

  // Mentor Rankings
  const mentorRankings = useMemo(() => {
    const sorted = [...students]
      .filter((s) => s.mentorPoints > 0)
      .sort((a, b) => b.mentorPoints - a.mentorPoints || a.name.localeCompare(b.name));

    return sorted.map((student, index) => ({
      rank: index + 1,
      student,
      points: student.mentorPoints,
      classId: student.classId,
    }));
  }, [students]);

  // Active Lesson Submission Counts for Charts (respects selected class or shows 32 with target audience counts)
  const activeLessonSubmissionCounts = useMemo(() => {
    const targetLessons =
      selectedClassId === 'all'
        ? activeLessons
        : getLessonsForClass(selectedClassId).filter((l) => l.isActive);

    const relevantStudents =
      selectedClassId === 'all'
        ? students
        : students.filter((s) => s.classId === selectedClassId);

    return targetLessons.map((lesson) => {
      // If 'all', only students whose class includes this lesson are part of totalPossible
      const eligibleStudents =
        selectedClassId === 'all'
          ? relevantStudents.filter((s) => getClassLessonCount(s.classId) >= lesson.id)
          : relevantStudents;

      const count = eligibleStudents.filter((s) => s.submissions[lesson.id]).length;
      const totalPossible = eligibleStudents.length;
      const rate = totalPossible > 0 ? Math.round((count / totalPossible) * 100) : 0;
      return {
        lessonId: lesson.id,
        title: lesson.title,
        topic: lesson.topic,
        count,
        totalPossible,
        rate,
      };
    });
  }, [activeLessons, selectedClassId, students]);

  const value = {
    students,
    lessons,
    activeLessons,
    getLessonsForSelectedClass,
    mentorLogs,
    classList: CLASS_LIST,
    selectedClassId,
    setSelectedClassId,
    lastUpdated,
    isSimulating,
    setIsSimulating,
    toasts,
    removeToast,
    addToast,
    toggleSubmission,
    submitWorksheetWithMentor,
    awardMentorPoints,
    addLesson,
    toggleLessonActive,
    addStudent,
    deleteStudent,
    resetData,
    downloadCSV,
    overallStats,
    getClassStats,
    allClassStats,
    mentorRankings,
    activeLessonSubmissionCounts,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

