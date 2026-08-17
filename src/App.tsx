import React, { useEffect, useMemo, useRef, useState } from 'react';

type Tab = 'overview' | 'levels' | 'mentors' | 'quest';
type ClassName = '1-1' | '1-2' | '1-3' | '1-4' | '1-5' | '1-6' | '1-7';
type ClassFilter = '전체' | ClassName;

type StudentBase = {
  id: string;
  className: ClassName;
  name: string;
};

type StudentState = StudentBase & {
  completed: number[];
  mentorPoints: number;
};

type MentorLog = {
  id: string;
  mentorId: string;
  menteeId: string;
  points: number;
  at: string;
};

type ToastState = {
  message: string;
  kind: 'success' | 'level' | 'info';
} | null;

const CLASS_NAMES: ClassName[] = ['1-1', '1-2', '1-3', '1-4', '1-5', '1-6', '1-7'];
const STORAGE_KEY = 'goodssam-rpg-v3-reset-students';
const LOG_KEY = 'goodssam-rpg-v3-reset-mentor-logs';

// 1,2,4,5반: 주 2회 × 16주 = 32차시
// 3,6,7반: 주 1회 × 16주 = 16차시
const CLASS_SESSION_LIMIT: Record<ClassName, number> = {
  '1-1': 32,
  '1-2': 32,
  '1-3': 16,
  '1-4': 32,
  '1-5': 32,
  '1-6': 16,
  '1-7': 16,
};

const ROSTER: StudentBase[] = [
  // 1-1
  { id: '10102', className: '1-1', name: '권현정' },
  { id: '10103', className: '1-1', name: '김도윤' },
  { id: '10104', className: '1-1', name: '김초희' },
  { id: '10105', className: '1-1', name: '박규연' },
  { id: '10106', className: '1-1', name: '박세현' },
  { id: '10107', className: '1-1', name: '박재원' },
  { id: '10108', className: '1-1', name: '박태윤' },
  { id: '10109', className: '1-1', name: '방재현' },
  { id: '10110', className: '1-1', name: '배지성' },
  { id: '10111', className: '1-1', name: '서유진' },
  { id: '10112', className: '1-1', name: '설윤찬' },
  { id: '10113', className: '1-1', name: '오하율' },
  { id: '10114', className: '1-1', name: '오혜성' },
  { id: '10115', className: '1-1', name: '윤소이' },
  { id: '10117', className: '1-1', name: '윤지희' },
  { id: '10118', className: '1-1', name: '장채민' },
  { id: '10119', className: '1-1', name: '최민서' },
  { id: '10120', className: '1-1', name: '한다정' },

  // 1-2
  { id: '10201', className: '1-2', name: '강도희' },
  { id: '10202', className: '1-2', name: '공도경' },
  { id: '10203', className: '1-2', name: '김세영' },
  { id: '10204', className: '1-2', name: '김유라' },
  { id: '10205', className: '1-2', name: '김태영' },
  { id: '10206', className: '1-2', name: '김한나' },
  { id: '10207', className: '1-2', name: '김휘성' },
  { id: '10208', className: '1-2', name: '문소현' },
  { id: '10209', className: '1-2', name: '박사랑' },
  { id: '10210', className: '1-2', name: '박예나' },
  { id: '10211', className: '1-2', name: '소재연' },
  { id: '10212', className: '1-2', name: '송채원' },
  { id: '10213', className: '1-2', name: '이수찬' },
  { id: '10214', className: '1-2', name: '이우주' },
  { id: '10215', className: '1-2', name: '이준희' },
  { id: '10216', className: '1-2', name: '정다영' },
  { id: '10217', className: '1-2', name: '조일국' },
  { id: '10218', className: '1-2', name: '최마린' },
  { id: '10219', className: '1-2', name: '최예린' },
  { id: '10220', className: '1-2', name: '최윤호' },

  // 1-3
  { id: '10301', className: '1-3', name: '고은유' },
  { id: '10302', className: '1-3', name: '권민지' },
  { id: '10303', className: '1-3', name: '김다은' },
  { id: '10304', className: '1-3', name: '김도윤' },
  { id: '10305', className: '1-3', name: '김민서' },
  { id: '10306', className: '1-3', name: '김세은' },
  { id: '10307', className: '1-3', name: '김인우' },
  { id: '10308', className: '1-3', name: '노현수' },
  { id: '10309', className: '1-3', name: '민서영' },
  { id: '10310', className: '1-3', name: '박윤서' },
  { id: '10311', className: '1-3', name: '엄서현' },
  { id: '10312', className: '1-3', name: '윤은서' },
  { id: '10313', className: '1-3', name: '이수현' },
  { id: '10314', className: '1-3', name: '이승준' },
  { id: '10315', className: '1-3', name: '이우진' },
  { id: '10316', className: '1-3', name: '이지윤' },
  { id: '10317', className: '1-3', name: '이현민' },
  { id: '10318', className: '1-3', name: '조정우' },
  { id: '10319', className: '1-3', name: '차준수' },
  { id: '10320', className: '1-3', name: '현별' },

  // 1-4
  { id: '10401', className: '1-4', name: '김나현' },
  { id: '10402', className: '1-4', name: '김민완' },
  { id: '10403', className: '1-4', name: '김시우' },
  { id: '10404', className: '1-4', name: '김은우' },
  { id: '10405', className: '1-4', name: '문준혁' },
  { id: '10406', className: '1-4', name: '박정우' },
  { id: '10407', className: '1-4', name: '박주원' },
  { id: '10408', className: '1-4', name: '박하진' },
  { id: '10409', className: '1-4', name: '박현아' },
  { id: '10410', className: '1-4', name: '배지호' },
  { id: '10411', className: '1-4', name: '손예찬' },
  { id: '10412', className: '1-4', name: '신지민' },
  { id: '10413', className: '1-4', name: '유가은' },
  { id: '10414', className: '1-4', name: '이강욱' },
  { id: '10415', className: '1-4', name: '이제준' },
  { id: '10416', className: '1-4', name: '이현수' },
  { id: '10417', className: '1-4', name: '임지민' },
  { id: '10418', className: '1-4', name: '장준영' },
  { id: '10419', className: '1-4', name: '정동렬' },
  { id: '10420', className: '1-4', name: '최민서' },

  // 1-5
  { id: '10501', className: '1-5', name: '김도현' },
  { id: '10502', className: '1-5', name: '김범' },
  { id: '10503', className: '1-5', name: '김시원' },
  { id: '10504', className: '1-5', name: '김태윤' },
  { id: '10505', className: '1-5', name: '김태희' },
  { id: '10506', className: '1-5', name: '남현우' },
  { id: '10507', className: '1-5', name: '박보람' },
  { id: '10508', className: '1-5', name: '박의진' },
  { id: '10509', className: '1-5', name: '변희찬' },
  { id: '10510', className: '1-5', name: '신우경' },
  { id: '10511', className: '1-5', name: '신유찬' },
  { id: '10512', className: '1-5', name: '이다솔' },
  { id: '10513', className: '1-5', name: '이동준' },
  { id: '10514', className: '1-5', name: '이승혜' },
  { id: '10515', className: '1-5', name: '이재민' },
  { id: '10516', className: '1-5', name: '장대한' },
  { id: '10517', className: '1-5', name: '정도겸' },
  { id: '10518', className: '1-5', name: '정민유' },
  { id: '10519', className: '1-5', name: '정창민' },
  { id: '10520', className: '1-5', name: '홍경천' },

  // 1-6
  { id: '10601', className: '1-6', name: '곽소희' },
  { id: '10602', className: '1-6', name: '구나연' },
  { id: '10603', className: '1-6', name: '김도윤' },
  { id: '10604', className: '1-6', name: '김미나' },
  { id: '10605', className: '1-6', name: '김수민' },
  { id: '10606', className: '1-6', name: '김시호' },
  { id: '10607', className: '1-6', name: '민정원' },
  { id: '10608', className: '1-6', name: '서혜영' },
  { id: '10609', className: '1-6', name: '선한별' },
  { id: '10610', className: '1-6', name: '신가은' },
  { id: '10611', className: '1-6', name: '이서현' },
  { id: '10612', className: '1-6', name: '이시진' },
  { id: '10613', className: '1-6', name: '이하윤' },
  { id: '10614', className: '1-6', name: '이학열' },
  { id: '10615', className: '1-6', name: '정연아' },
  { id: '10616', className: '1-6', name: '정지후' },
  { id: '10617', className: '1-6', name: '조연수' },
  { id: '10618', className: '1-6', name: '추아련' },
  { id: '10619', className: '1-6', name: '허유희' },
  { id: '10620', className: '1-6', name: '황예지' },

  // 1-7
  { id: '10701', className: '1-7', name: '강수' },
  { id: '10702', className: '1-7', name: '강지우' },
  { id: '10703', className: '1-7', name: '곽윤서' },
  { id: '10704', className: '1-7', name: '구민아' },
  { id: '10705', className: '1-7', name: '김홍준' },
  { id: '10706', className: '1-7', name: '도가온' },
  { id: '10707', className: '1-7', name: '박서아' },
  { id: '10708', className: '1-7', name: '박해원' },
  { id: '10709', className: '1-7', name: '방지윤' },
  { id: '10710', className: '1-7', name: '서윤아' },
  { id: '10711', className: '1-7', name: '유승아' },
  { id: '10712', className: '1-7', name: '이채윤' },
  { id: '10714', className: '1-7', name: '임사랑' },
  { id: '10715', className: '1-7', name: '정주연' },
  { id: '10716', className: '1-7', name: '주민정' },
  { id: '10717', className: '1-7', name: '조시연' },
  { id: '10718', className: '1-7', name: '진주아' },
  { id: '10719', className: '1-7', name: '한지홍' },
  { id: '10720', className: '1-7', name: '황예원' },
];

const LEVELS = [
  { level: 1, emoji: '🌱', title: '수학 새싹' },
  { level: 2, emoji: '📚', title: '성실한 학습자' },
  { level: 3, emoji: '⚔️', title: '베테랑 수학자' },
  { level: 4, emoji: '🌟', title: '수학 마스터' },
  { level: 5, emoji: '👑', title: '전설의 수학왕' },
] as const;

function classStudentCount(className: ClassName) {
  return ROSTER.filter((s) => s.className === className).length;
}

function sessionsForClass(className: ClassName) {
  return Array.from({ length: CLASS_SESSION_LIMIT[className] }, (_, i) => i + 1);
}

function initialStudents(): StudentState[] {
  // 완전 초기화: 제출 0, 멘토 포인트 0
  return ROSTER.map((s) => ({ ...s, completed: [], mentorPoints: 0 }));
}

function getLevel(student: StudentState) {
  const total = CLASS_SESSION_LIMIT[student.className];
  const ratio = total === 0 ? 0 : student.completed.length / total;

  let level = 1;
  if (ratio >= 0.8) level = 5;
  else if (ratio >= 0.6) level = 4;
  else if (ratio >= 0.4) level = 3;
  else if (ratio >= 0.2) level = 2;

  const starts = [0, 0, 0.2, 0.4, 0.6, 0.8];
  const ends = [0, 0.2, 0.4, 0.6, 0.8, 1];
  const startCount = Math.ceil(total * starts[level]);
  const endCount = level === 5 ? total : Math.ceil(total * ends[level]);
  const xp = Math.max(0, student.completed.length - startCount);
  const maxXp = Math.max(1, endCount - startCount);

  return {
    level,
    emoji: LEVELS[level - 1].emoji,
    title: LEVELS[level - 1].title,
    xp,
    maxXp,
    next: endCount,
  };
}

function formatTime(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function fireConfetti() {
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti-canvas';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const colors = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const particles = Array.from({ length: 110 }, () => ({
    x: window.innerWidth / 2 + (Math.random() - 0.5) * 180,
    y: window.innerHeight * 0.2,
    vx: (Math.random() - 0.5) * 12,
    vy: -6 - Math.random() * 10,
    gravity: 0.28 + Math.random() * 0.16,
    angle: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * 0.3,
    size: 5 + Math.random() * 7,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  let frame = 0;
  const animate = () => {
    frame += 1;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.angle += p.spin;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    });
    if (frame < 120) requestAnimationFrame(animate);
    else canvas.remove();
  };
  animate();
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [classFilter, setClassFilter] = useState<ClassFilter>('1-1');
  const [levelFilter, setLevelFilter] = useState<number | null>(null);

  // v3에서는 키를 새로 사용하므로 기존 예시/테스트 데이터가 자동으로 섞이지 않습니다.
  const [students, setStudents] = useState<StudentState[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as StudentState[];
        const stateMap = new Map(parsed.map((s) => [s.id, s]));
        return ROSTER.map((base) => {
          const old = stateMap.get(base.id);
          const limit = CLASS_SESSION_LIMIT[base.className];
          return old
            ? {
                ...base,
                completed: (old.completed ?? []).filter((n) => n >= 1 && n <= limit),
                mentorPoints: old.mentorPoints ?? 0,
              }
            : { ...base, completed: [], mentorPoints: 0 };
        });
      }
    } catch {
      // 손상된 로컬 데이터는 무시
    }
    return initialStudents();
  });

  const [mentorLogs, setMentorLogs] = useState<MentorLog[]>(() => {
    try {
      const saved = localStorage.getItem(LOG_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [mentorModalOpen, setMentorModalOpen] = useState(false);
  const [mentorId, setMentorId] = useState('');
  const [menteeId, setMenteeId] = useState('');
  const [mentorPointValue, setMentorPointValue] = useState(1);
  const [demoOn, setDemoOn] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [updatedAt, setUpdatedAt] = useState(new Date());
  const demoTimer = useRef<number | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    setUpdatedAt(new Date());
  }, [students]);

  useEffect(() => {
    localStorage.setItem(LOG_KEY, JSON.stringify(mentorLogs));
    setUpdatedAt(new Date());
  }, [mentorLogs]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const classOnlyStudents = useMemo(
    () => classFilter === '전체' ? students : students.filter((s) => s.className === classFilter),
    [students, classFilter],
  );

  const filteredStudents = useMemo(() => {
    if (levelFilter === null) return classOnlyStudents;
    return classOnlyStudents.filter((s) => getLevel(s).level === levelFilter);
  }, [classOnlyStudents, levelFilter]);

  const displaySessions = useMemo(() => {
    if (classFilter === '전체') return Array.from({ length: 32 }, (_, i) => i + 1);
    return sessionsForClass(classFilter);
  }, [classFilter]);

  const totalSubmissions = classOnlyStudents.reduce((sum, s) => sum + s.completed.length, 0);
  const participating = classOnlyStudents.filter((s) => s.completed.length > 0).length;
  const totalMentorPoints = classOnlyStudents.reduce((sum, s) => sum + s.mentorPoints, 0);

  const progressValue = useMemo(() => {
    if (classFilter !== '전체') {
      const maxDone = classOnlyStudents.reduce((max, s) => Math.max(max, s.completed.length), 0);
      return `${maxDone}/${CLASS_SESSION_LIMIT[classFilter]}차시`;
    }

    const classes32: ClassName[] = ['1-1', '1-2', '1-4', '1-5'];
    const classes16: ClassName[] = ['1-3', '1-6', '1-7'];
    const max32 = students
      .filter((s) => classes32.includes(s.className))
      .reduce((max, s) => Math.max(max, s.completed.length), 0);
    const max16 = students
      .filter((s) => classes16.includes(s.className))
      .reduce((max, s) => Math.max(max, s.completed.length), 0);
    return `${max32}/32 · ${max16}/16`;
  }, [students, classFilter, classOnlyStudents]);

  const progressLabel = classFilter === '전체' ? '진행 차시 (주2회 · 주1회)' : '진행 차시';

  const sessionStats = useMemo(() => {
    return displaySessions.map((session) => {
      const eligible = classOnlyStudents.filter((s) => session <= CLASS_SESSION_LIMIT[s.className]);
      const submitted = eligible.filter((s) => s.completed.includes(session)).length;
      const pct = eligible.length ? Math.round((submitted / eligible.length) * 100) : 0;
      return { session, submitted, eligible: eligible.length, pct };
    });
  }, [classOnlyStudents, displaySessions]);

  const levelCounts = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    classOnlyStudents.forEach((s) => counts[getLevel(s).level - 1] += 1);
    return counts;
  }, [classOnlyStudents]);

  const toggleSubmission = (studentId: string, session: number, silent = false) => {
    setStudents((prev) => {
      const target = prev.find((s) => s.id === studentId);
      if (!target) return prev;
      if (session > CLASS_SESSION_LIMIT[target.className]) return prev;

      const wasDone = target.completed.includes(session);
      const beforeLevel = getLevel(target).level;
      const nextCompleted = wasDone
        ? target.completed.filter((n) => n !== session)
        : [...target.completed, session].sort((a, b) => a - b);
      const afterState = { ...target, completed: nextCompleted };
      const afterLevel = getLevel(afterState).level;

      if (!wasDone && afterLevel > beforeLevel) {
        window.setTimeout(() => {
          fireConfetti();
          setToast({
            kind: 'level',
            message: `🎉 ${target.className} ${target.name} 학생이 Lv.${afterLevel}로 레벨업!`,
          });
        }, 30);
      } else if (!silent) {
        setToast({
          kind: 'success',
          message: `${target.className} ${target.name} · ${session}차시 ${wasDone ? '미제출로 변경' : '제출 완료'}`,
        });
      }

      return prev.map((s) => s.id === studentId ? afterState : s);
    });
  };

  const giveMentorPoints = (mentor: string, mentee: string, points: number, silent = false) => {
    if (!mentor || !mentee || mentor === mentee) {
      if (!silent) setToast({ kind: 'info', message: '멘토와 멘티를 서로 다르게 선택해 주세요.' });
      return;
    }
    const mentorStudent = students.find((s) => s.id === mentor);
    const menteeStudent = students.find((s) => s.id === mentee);
    if (!mentorStudent || !menteeStudent) return;

    setStudents((prev) => prev.map((s) => s.id === mentor ? { ...s, mentorPoints: s.mentorPoints + points } : s));
    setMentorLogs((prev) => [{
      id: `${Date.now()}-${Math.random()}`,
      mentorId: mentor,
      menteeId: mentee,
      points,
      at: new Date().toISOString(),
    }, ...prev].slice(0, 100));

    if (!silent) {
      setToast({
        kind: 'success',
        message: `👑 ${mentorStudent.name} → ${menteeStudent.name} 도움 · +${points}pt`,
      });
      setMentorModalOpen(false);
    }
  };

  useEffect(() => {
    if (!demoOn) {
      if (demoTimer.current) window.clearInterval(demoTimer.current);
      demoTimer.current = null;
      return;
    }

    demoTimer.current = window.setInterval(() => {
      const pending: Array<{ studentId: string; session: number }> = [];
      students.forEach((student) => {
        sessionsForClass(student.className).forEach((session) => {
          if (!student.completed.includes(session)) pending.push({ studentId: student.id, session });
        });
      });

      if (pending.length > 0) {
        const pick = pending[Math.floor(Math.random() * pending.length)];
        toggleSubmission(pick.studentId, pick.session, true);
      }

      if (Math.random() < 0.32 && students.length > 1) {
        const mentor = students[Math.floor(Math.random() * students.length)];
        let mentee = students[Math.floor(Math.random() * students.length)];
        while (mentee.id === mentor.id) mentee = students[Math.floor(Math.random() * students.length)];
        giveMentorPoints(mentor.id, mentee.id, 1, true);
      }
    }, 1300);

    return () => {
      if (demoTimer.current) window.clearInterval(demoTimer.current);
      demoTimer.current = null;
    };
  }, [demoOn, students]);

  const selectedStudent = selectedStudentId ? students.find((s) => s.id === selectedStudentId) ?? null : null;

  const resetData = () => {
    if (!window.confirm('모든 반의 제출 현황과 멘토 포인트를 0으로 초기화할까요?')) return;
    setStudents(initialStudents());
    setMentorLogs([]);
    setLevelFilter(null);
    setToast({ kind: 'info', message: '모든 수업 데이터를 초기화했습니다.' });
  };

  const downloadCsv = () => {
    const targets = classOnlyStudents;
    const csvSessions = classFilter === '전체'
      ? Array.from({ length: 32 }, (_, i) => i + 1)
      : sessionsForClass(classFilter);

    const header = ['반', '학번', '이름', '총차시', '레벨', '멘토포인트', ...csvSessions.map((n) => `${n}차시`), '제출합계'];
    const rows = targets.map((student) => {
      const level = getLevel(student);
      const maxSession = CLASS_SESSION_LIMIT[student.className];
      return [
        student.className,
        student.id,
        student.name,
        maxSession,
        `Lv.${level.level}`,
        student.mentorPoints,
        ...csvSessions.map((session) => session > maxSession ? '해당없음' : student.completed.includes(session) ? '제출' : '미제출'),
        student.completed.length,
      ];
    });

    const csv = '\ufeff' + [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${classFilter === '전체' ? '1학년_전체' : classFilter}_공통수학2_제출현황.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard-app">
      <header className="dashboard-header">
        <div className="brand-block">
          <h1>🎮 공통수학2 학습 RPG 대시보드</h1>
          <span>2026학년도 1학년 · 1반~7반</span>
        </div>
        <div className="header-actions">
          <button className={demoOn ? 'demo-btn on' : 'demo-btn'} onClick={() => setDemoOn((v) => !v)}>
            ⚡ 실시간 데모 {demoOn ? 'ON' : 'OFF'}
          </button>
          <button className="reset-btn" onClick={resetData}>초기화</button>
          <span className="updated-pill">◷ 마지막 갱신: {updatedAt.toLocaleTimeString('ko-KR')}</span>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="control-row">
          <div className="class-pills" aria-label="학급 선택">
            <button
              className={classFilter === '전체' ? 'active' : ''}
              onClick={() => { setClassFilter('전체'); setLevelFilter(null); }}
            >
              전체 ({students.length}명)
            </button>
            {CLASS_NAMES.map((name) => {
              const classNo = name.split('-')[1];
              return (
                <button
                  key={name}
                  className={classFilter === name ? 'active' : ''}
                  onClick={() => { setClassFilter(name); setLevelFilter(null); }}
                >
                  1학년 {classNo}반 ({classStudentCount(name)}명)
                </button>
              );
            })}
          </div>
          <div className="roster-count">
            {classFilter === '전체'
              ? <>총 <b>{students.length}명</b> · 32차시반 4개 / 16차시반 3개</>
              : <><b>{CLASS_SESSION_LIMIT[classFilter]}차시</b> 운영 · {classStudentCount(classFilter)}명</>
            }
          </div>
        </div>

        <div className="summary-grid">
          <StatCard value={totalSubmissions.toLocaleString()} label="총 제출 수" />
          <StatCard value={`${participating}/${classOnlyStudents.length}명`} label="참여 학생" />
          <StatCard value={progressValue} label={progressLabel} />
          <StatCard value={`${totalMentorPoints}pt`} label="멘토 포인트" />
        </div>

        <nav className="tabs">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>📊 전체 현황</button>
          <button className={activeTab === 'levels' ? 'active' : ''} onClick={() => setActiveTab('levels')}>⚔️ 개인별 레벨</button>
          <button className={activeTab === 'mentors' ? 'active' : ''} onClick={() => setActiveTab('mentors')}>👑 멘토 랭킹</button>
          <button className={activeTab === 'quest' ? 'active' : ''} onClick={() => setActiveTab('quest')}>🏰 반별 퀘스트</button>
        </nav>

        {activeTab === 'overview' && (
          <Overview
            students={filteredStudents}
            classStudents={classOnlyStudents}
            classFilter={classFilter}
            displaySessions={displaySessions}
            sessionStats={sessionStats}
            levelCounts={levelCounts}
            levelFilter={levelFilter}
            setLevelFilter={setLevelFilter}
            toggleSubmission={toggleSubmission}
            downloadCsv={downloadCsv}
          />
        )}

        {activeTab === 'levels' && (
          <Levels
            students={filteredStudents}
            mentorLogs={mentorLogs}
            onOpen={(id) => setSelectedStudentId(id)}
            levelFilter={levelFilter}
            setLevelFilter={setLevelFilter}
          />
        )}

        {activeTab === 'mentors' && (
          <Mentors
            students={classOnlyStudents}
            allStudents={students}
            logs={mentorLogs}
            onOpenGive={() => {
              const first = classOnlyStudents[0]?.id ?? students[0]?.id ?? '';
              setMentorId(first);
              setMenteeId(classOnlyStudents[1]?.id ?? students[1]?.id ?? '');
              setMentorPointValue(1);
              setMentorModalOpen(true);
            }}
          />
        )}

        {activeTab === 'quest' && <ClassQuest students={students} />}
      </main>

      {selectedStudent && (
        <StudentModal
          student={selectedStudent}
          mentorLogs={mentorLogs}
          students={students}
          toggleSubmission={toggleSubmission}
          onClose={() => setSelectedStudentId(null)}
        />
      )}

      {mentorModalOpen && (
        <MentorModal
          students={students}
          mentorId={mentorId}
          menteeId={menteeId}
          points={mentorPointValue}
          setMentorId={setMentorId}
          setMenteeId={setMenteeId}
          setPoints={setMentorPointValue}
          onGive={() => giveMentorPoints(mentorId, menteeId, mentorPointValue)}
          onClose={() => setMentorModalOpen(false)}
        />
      )}

      {toast && <div className={`toast ${toast.kind}`}>{toast.message}</div>}
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="summary-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function Overview({
  students,
  classStudents,
  classFilter,
  displaySessions,
  sessionStats,
  levelCounts,
  levelFilter,
  setLevelFilter,
  toggleSubmission,
  downloadCsv,
}: {
  students: StudentState[];
  classStudents: StudentState[];
  classFilter: ClassFilter;
  displaySessions: number[];
  sessionStats: Array<{session:number; submitted:number; eligible:number; pct:number}>;
  levelCounts: number[];
  levelFilter: number | null;
  setLevelFilter: (level: number | null) => void;
  toggleSubmission: (studentId: string, session: number) => void;
  downloadCsv: () => void;
}) {
  const missing = useMemo(() => classStudents
    .map((student) => {
      const allowed = sessionsForClass(student.className);
      return { ...student, missing: allowed.filter((s) => !student.completed.includes(s)) };
    })
    .filter((student) => student.missing.length > 0)
    .sort((a, b) => a.missing.length - b.missing.length || a.className.localeCompare(b.className) || a.id.localeCompare(b.id)),
  [classStudents]);

  return (
    <section className="content-section">
      <div className="section-heading">
        <div>
          <h2>차시별 제출 현황</h2>
          <p>
            {classFilter === '전체'
              ? '전체 보기 · 1·2·4·5반 32차시 / 3·6·7반 16차시'
              : `${classFilter}반 · 총 ${CLASS_SESSION_LIMIT[classFilter]}차시`
            }
          </p>
        </div>
        <button className="download-btn" onClick={downloadCsv}>📥 CSV 다운로드</button>
      </div>

      <div className={`chart-card vertical-chart ${displaySessions.length > 20 ? 'many-bars' : ''}`}>
        <div className="y-axis">
          {[100, 80, 60, 40, 20, 0].map((n) => <span key={n}>{n}%</span>)}
        </div>
        <div className="bars-scroller">
          <div className="bars-wrap">
            {sessionStats.map((stat) => (
              <div className="bar-item" key={stat.session}>
                <div className="bar-tooltip">{stat.submitted}/{stat.eligible}명 · {stat.pct}%</div>
                <div className="bar-column" style={{ height: `${stat.pct}%` }} />
                <span>{stat.session}차시</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h2 className="subheading">5단계 레벨 분포</h2>
      <div className="distribution-grid">
        {LEVELS.map((item, index) => (
          <button
            className={`distribution-card ${levelFilter === item.level ? 'selected' : ''}`}
            key={item.level}
            onClick={() => setLevelFilter(levelFilter === item.level ? null : item.level)}
          >
            <span className="big-emoji">{item.emoji}</span>
            <strong>{levelCounts[index]}명</strong>
            <span>Lv.{item.level} {item.title}</span>
          </button>
        ))}
      </div>
      {levelFilter !== null && (
        <button className="clear-filter" onClick={() => setLevelFilter(null)}>레벨 필터 해제 ✕</button>
      )}

      <div className="missing-card">
        <h2>⚠️ 미제출 상세</h2>
        <p className="card-help">
          각 반의 실제 운영 차시까지만 표시합니다. 빨간 차시 칩을 누르면 제출 완료로 변경됩니다.
        </p>
        <div className="missing-list">
          {missing.length === 0 ? (
            <div className="empty-state">🎉 현재 선택된 학생들은 해당 차시를 모두 제출했습니다.</div>
          ) : missing.map((student) => (
            <div className="missing-row" key={student.id}>
              <div className="missing-name">
                <strong>{student.name}</strong>
                <span>{student.className} · {student.id}</span>
              </div>
              <b>미제출 {student.missing.length}개</b>
              <div className="missing-pills">
                {student.missing.map((lesson) => (
                  <button key={lesson} onClick={() => toggleSubmission(student.id, lesson)}>{lesson}차시</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <SubmissionTable
        students={students}
        displaySessions={displaySessions}
        toggleSubmission={toggleSubmission}
      />
    </section>
  );
}

function SubmissionTable({
  students,
  displaySessions,
  toggleSubmission,
}: {
  students: StudentState[];
  displaySessions: number[];
  toggleSubmission: (studentId: string, session: number) => void;
}) {
  const sorted = [...students].sort((a, b) => a.className.localeCompare(b.className) || a.id.localeCompare(b.id));

  return (
    <div className="table-card">
      <div className="table-title">
        <h2>📋 실시간 제출 체크 표</h2>
        <span>반별 운영 차시에 맞춰 ✅ / ❌ 버튼으로 변경</span>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>반</th>
              <th>학번</th>
              <th>이름</th>
              <th>총차시</th>
              <th>레벨</th>
              <th>제출 수</th>
              {displaySessions.map((s) => <th key={s}>{s}차시</th>)}
            </tr>
          </thead>
          <tbody>
            {sorted.map((student) => {
              const meta = getLevel(student);
              const limit = CLASS_SESSION_LIMIT[student.className];
              return (
                <tr key={student.id}>
                  <td>{student.className}</td>
                  <td>{student.id}</td>
                  <td className="name-cell">{student.name}</td>
                  <td>{limit}</td>
                  <td><span className={`mini-level mini-${meta.level}`}>Lv.{meta.level} {meta.emoji}</span></td>
                  <td><b>{student.completed.length}/{limit}</b></td>
                  {displaySessions.map((session) => {
                    if (session > limit) {
                      return <td key={session}><span className="not-applicable">—</span></td>;
                    }
                    const done = student.completed.includes(session);
                    return (
                      <td key={session}>
                        <button
                          className={done ? 'status-btn done' : 'status-btn miss'}
                          onClick={() => toggleSubmission(student.id, session)}
                          title={`${student.name} ${session}차시 ${done ? '제출 취소' : '제출 처리'}`}
                        >
                          {done ? '✅' : '❌'}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Levels({
  students,
  mentorLogs,
  onOpen,
  levelFilter,
  setLevelFilter,
}: {
  students: StudentState[];
  mentorLogs: MentorLog[];
  onOpen: (id: string) => void;
  levelFilter: number | null;
  setLevelFilter: (level: number | null) => void;
}) {
  const sorted = [...students].sort((a, b) =>
    (b.completed.length / CLASS_SESSION_LIMIT[b.className]) - (a.completed.length / CLASS_SESSION_LIMIT[a.className]) ||
    b.completed.length - a.completed.length ||
    b.mentorPoints - a.mentorPoints ||
    a.className.localeCompare(b.className) ||
    a.id.localeCompare(b.id),
  );

  const counts = LEVELS.map((level) => sorted.filter((s) => getLevel(s).level === level.level).length);
  const hasLearningData = sorted.some((s) => s.completed.length > 0);

  return (
    <section className="content-section">
      <div className="section-heading">
        <div>
          <h2>👤 개인별 레벨 및 경험치</h2>
          <p>32차시반과 16차시반을 공정하게 비교하기 위해 제출률 기준으로 레벨이 계산됩니다.</p>
        </div>
      </div>

      <div className="level-filter-row">
        <button className={levelFilter === null ? 'active' : ''} onClick={() => setLevelFilter(null)}>전체</button>
        {LEVELS.map((level, index) => (
          <button
            key={level.level}
            className={levelFilter === level.level ? 'active' : ''}
            onClick={() => setLevelFilter(level.level)}
          >
            {level.emoji} Lv.{level.level} · {counts[index]}명
          </button>
        ))}
      </div>

      <div className="level-grid">
        {sorted.map((student, index) => {
          const meta = getLevel(student);
          const total = CLASS_SESSION_LIMIT[student.className];
          const percent = Math.min(100, (meta.xp / meta.maxXp) * 100);
          const helpCount = mentorLogs.filter((log) => log.mentorId === student.id).length;
          return (
            <button className={`level-card level-${meta.level}`} key={student.id} onClick={() => onOpen(student.id)}>
              <div className="level-top">
                <div className="student-name">
                  <span className="rank-num">{!hasLearningData ? '–' : index < 3 ? ['🥇', '🥈', '🥉'][index] : `${index + 1}위`}</span>
                  <span>{meta.emoji}</span>
                  <strong>{student.name}</strong>
                </div>
                <span className="level-pill">Lv.{meta.level}</span>
              </div>
              <p>{student.className} · {student.id} · {meta.title} · {student.completed.length}/{total} 차시 완료</p>
              <div className="xp-track"><span style={{ width: `${percent}%` }} /></div>
              <div className="xp-meta">
                <span>{meta.xp}/{meta.maxXp} XP</span>
                <span>{student.completed.length === total ? '✨ 완전 정복!' : `다음 레벨까지 ${Math.max(0, meta.next - student.completed.length)}회`}</span>
              </div>
              <div className="mentor-mini">👑 멘토 {student.mentorPoints}pt · 도움 {helpCount}회</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Mentors({
  students,
  allStudents,
  logs,
  onOpenGive,
}: {
  students: StudentState[];
  allStudents: StudentState[];
  logs: MentorLog[];
  onOpenGive: () => void;
}) {
  const ranked = [...students]
    .filter((s) => s.mentorPoints > 0)
    .sort((a, b) => b.mentorPoints - a.mentorPoints || a.className.localeCompare(b.className) || a.id.localeCompare(b.id));
  const visible = ranked.slice(0, 20);
  const max = Math.max(18, ...visible.map((s) => s.mentorPoints));
  const studentMap = new Map(allStudents.map((s) => [s.id, s]));

  return (
    <section className="content-section">
      <div className="section-heading">
        <div>
          <h2>👑 멘토 포인트 랭킹</h2>
          <p>초기 상태는 모두 0pt입니다. 수업 중 친구를 도운 학생에게 포인트를 지급합니다.</p>
        </div>
        <button className="primary-btn" onClick={onOpenGive}>＋ 멘토 포인트 주기</button>
      </div>

      <div className="mentor-layout">
        <div className="mentor-list-card">
          <h3>랭킹 리스트</h3>
          {visible.length === 0 ? (
            <div className="empty-state">아직 멘토 포인트가 없습니다. 수업이 시작되면 랭킹이 표시됩니다.</div>
          ) : visible.map((mentor, index) => (
            <div className="mentor-row" key={mentor.id}>
              <div className="mentor-rank">{index < 3 ? ['🥇', '🥈', '🥉'][index] : `${index + 1}위`}</div>
              <div className="mentor-person">
                <strong>{mentor.name}</strong>
                <span>{mentor.className} · {mentor.id}</span>
              </div>
              <div className="mentor-progress"><span style={{ width: `${(mentor.mentorPoints / max) * 100}%` }} /></div>
              <b>{mentor.mentorPoints}pt</b>
            </div>
          ))}
        </div>

        <div className="mentor-chart-card">
          <h3>포인트 바 차트</h3>
          {visible.slice(0, 12).map((mentor) => (
            <div className="hbar-row" key={mentor.id}>
              <span>{mentor.name}</span>
              <div><i style={{ width: `${(mentor.mentorPoints / max) * 100}%` }} /></div>
              <b>{mentor.mentorPoints}</b>
            </div>
          ))}
          {visible.length === 0 && (
            <div className="chart-empty">포인트를 지급하면 그래프가 채워집니다.</div>
          )}
        </div>
      </div>

      <div className="timeline-card">
        <h3>🕒 최근 멘토링 활동</h3>
        {logs.length === 0 ? (
          <div className="empty-state">아직 멘토링 활동이 없습니다.</div>
        ) : logs.slice(0, 20).map((log) => {
          const mentor = studentMap.get(log.mentorId);
          const mentee = studentMap.get(log.menteeId);
          return (
            <div className="timeline-row" key={log.id}>
              <span className="timeline-dot" />
              <div>
                <strong>{mentor?.className} {mentor?.name}</strong>
                <span> → {mentee?.className} {mentee?.name} 도움</span>
              </div>
              <b>+{log.points}pt</b>
              <time>{formatTime(log.at)}</time>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ClassQuest({ students }: { students: StudentState[] }) {
  const hasClassActivity = students.some((s) => s.completed.length > 0);

  const stats = CLASS_NAMES.map((className) => {
    const list = students.filter((s) => s.className === className);
    const maxSessions = CLASS_SESSION_LIMIT[className];
    const total = list.reduce((sum, s) => sum + s.completed.length, 0);
    const possible = list.length * maxSessions;
    const rate = possible ? (total / possible) * 100 : 0;
    const avg = list.length ? total / list.length : 0;
    const avgLevel = list.length ? list.reduce((sum, s) => sum + getLevel(s).level, 0) / list.length : 0;
    const levelDist = LEVELS.map((level) => list.filter((s) => getLevel(s).level === level.level).length);
    const zeroStudents = list.filter((s) => s.completed.length === 0);
    const progress = list.reduce((max, s) => Math.max(max, s.completed.length), 0);
    return { className, list, maxSessions, progress, total, rate, avg, avgLevel, levelDist, zeroStudents };
  }).sort((a, b) => b.rate - a.rate || b.total - a.total || a.className.localeCompare(b.className));

  return (
    <section className="content-section">
      <div className="section-heading">
        <div>
          <h2>🏰 반별 퀘스트 대항전</h2>
          <p>반마다 실제 수업 차시가 다르므로 제출률 기준으로 비교합니다.</p>
        </div>
      </div>

      {hasClassActivity ? (
        <div className="quest-podium">
          {stats.slice(0, 3).map((stat, index) => (
            <div className={`podium-card podium-${index + 1}`} key={stat.className}>
              <span>{['🥇', '🥈', '🥉'][index]}</span>
              <strong>{stat.className}반</strong>
              <b>{stat.rate.toFixed(1)}%</b>
            </div>
          ))}
        </div>
      ) : (
        <div className="preclass-banner">📘 아직 수업 전입니다. 첫 제출이 생기면 반별 순위가 자동으로 시작됩니다.</div>
      )}

      <div className="quest-grid">
        {stats.map((stat, rank) => (
          <article className="quest-card" key={stat.className}>
            <div className="quest-title">
              <div>
                <span className="quest-rank">{hasClassActivity ? `${rank + 1}위` : '수업 전'}</span>
                <h3>{stat.className}반</h3>
              </div>
              <strong>{stat.rate.toFixed(1)}%</strong>
            </div>
            <div className="quest-progress"><span style={{ width: `${stat.rate}%` }} /></div>

            <div className="quest-metrics">
              <div><span>진행 차시</span><b>{stat.progress}/{stat.maxSessions}</b></div>
              <div><span>제출 건수</span><b>{stat.total}</b></div>
              <div><span>인당 평균</span><b>{stat.avg.toFixed(1)}</b></div>
              <div><span>평균 레벨</span><b>Lv.{stat.avgLevel.toFixed(2)}</b></div>
            </div>

            <div className="quest-levels">
              {LEVELS.map((level, i) => (
                <span key={level.level} title={`Lv.${level.level} ${level.title}`}>
                  {level.emoji} {stat.levelDist[i]}
                </span>
              ))}
            </div>

            <div className="warning-zone">
              <b>⚠️ 한 번도 제출하지 않은 학생</b>
              <div>
                {stat.zeroStudents.length === 0
                  ? <span className="safe-chip">없음</span>
                  : stat.zeroStudents.map((s) => <span className="warning-chip" key={s.id}>{s.name}</span>)}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function StudentModal({
  student,
  mentorLogs,
  students,
  toggleSubmission,
  onClose,
}: {
  student: StudentState;
  mentorLogs: MentorLog[];
  students: StudentState[];
  toggleSubmission: (studentId: string, session: number) => void;
  onClose: () => void;
}) {
  const meta = getLevel(student);
  const map = new Map(students.map((s) => [s.id, s]));
  const logs = mentorLogs.filter((log) => log.mentorId === student.id || log.menteeId === student.id).slice(0, 10);
  const sessions = sessionsForClass(student.className);

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal-card student-modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="student-modal-head">
          <span className="modal-avatar">{meta.emoji}</span>
          <div>
            <h2>{student.name}</h2>
            <p>{student.className} · {student.id} · 총 {CLASS_SESSION_LIMIT[student.className]}차시 · {meta.title}</p>
          </div>
          <span className={`level-pill modal-level level-${meta.level}`}>Lv.{meta.level}</span>
        </div>

        <h3>차시별 체크리스트</h3>
        <div className="session-check-grid">
          {sessions.map((session) => {
            const done = student.completed.includes(session);
            return (
              <button className={done ? 'done' : 'miss'} key={session} onClick={() => toggleSubmission(student.id, session)}>
                <b>{session}차시</b>
                <span>{done ? '✅ 제출' : '❌ 미제출'}</span>
              </button>
            );
          })}
        </div>

        <h3>또래 멘토링 활동</h3>
        <div className="modal-log-list">
          {logs.length === 0 ? <div className="empty-state">멘토링 기록이 없습니다.</div> : logs.map((log) => {
            const mentor = map.get(log.mentorId);
            const mentee = map.get(log.menteeId);
            return (
              <div className="modal-log" key={log.id}>
                <span>{log.mentorId === student.id ? '👑 도움 제공' : '🤝 도움 받음'}</span>
                <strong>{mentor?.name} → {mentee?.name}</strong>
                <b>+{log.points}pt</b>
                <time>{formatTime(log.at)}</time>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MentorModal({
  students,
  mentorId,
  menteeId,
  points,
  setMentorId,
  setMenteeId,
  setPoints,
  onGive,
  onClose,
}: {
  students: StudentState[];
  mentorId: string;
  menteeId: string;
  points: number;
  setMentorId: (id: string) => void;
  setMenteeId: (id: string) => void;
  setPoints: (points: number) => void;
  onGive: () => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal-card mentor-modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>👑 멘토 포인트 주기</h2>
        <p>친구의 문제 해결을 도운 학생에게 포인트를 지급합니다.</p>

        <label>
          <span>멘토</span>
          <select value={mentorId} onChange={(e) => setMentorId(e.target.value)}>
            {students.map((s) => <option key={s.id} value={s.id}>{s.className} {s.id} {s.name}</option>)}
          </select>
        </label>

        <label>
          <span>멘티</span>
          <select value={menteeId} onChange={(e) => setMenteeId(e.target.value)}>
            {students.map((s) => <option key={s.id} value={s.id}>{s.className} {s.id} {s.name}</option>)}
          </select>
        </label>

        <div className="point-buttons">
          {[1, 2, 3].map((p) => (
            <button key={p} className={points === p ? 'active' : ''} onClick={() => setPoints(p)}>+{p}pt</button>
          ))}
        </div>

        <button className="give-btn" onClick={onGive}>포인트 지급</button>
      </div>
    </div>
  );
}

export default App;
