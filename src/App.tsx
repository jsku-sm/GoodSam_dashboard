import React, { useEffect, useMemo, useRef, useState } from 'react';

type Tab = 'overview' | 'levels' | 'mentors' | 'quest';
type ClassFilter = '전체' | '1-1' | '1-2' | '1-3' | '1-4' | '1-5' | '1-6' | '1-7';

type StudentBase = {
  id: string;
  className: Exclude<ClassFilter, '전체'>;
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

const SESSIONS = Array.from({ length: 18 }, (_, i) => i + 1);
const CLASS_NAMES: ClassFilter[] = ['전체', '1-1', '1-2', '1-3', '1-4', '1-5', '1-6', '1-7'];
const STORAGE_KEY = 'goodssam-rpg-v2-students';
const LOG_KEY = 'goodssam-rpg-v2-mentor-logs';

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
  { level: 1, emoji: '🌱', title: '수학 새싹', min: 0, max: 3 },
  { level: 2, emoji: '📚', title: '성실한 학습자', min: 4, max: 7 },
  { level: 3, emoji: '⚔️', title: '베테랑 수학자', min: 8, max: 11 },
  { level: 4, emoji: '🌟', title: '수열 마스터', min: 12, max: 15 },
  { level: 5, emoji: '👑', title: '전설의 수학왕', min: 16, max: 18 },
] as const;

function initialStudents(): StudentState[] {
  return ROSTER.map((s) => ({ ...s, completed: [], mentorPoints: 0 }));
}

function getLevel(count: number) {
  if (count >= 16) {
    return {
      level: 5,
      emoji: '👑',
      title: '전설의 수학왕',
      xp: count - 15,
      maxXp: 3,
      next: 18,
    };
  }
  if (count >= 12) {
    return {
      level: 4,
      emoji: '🌟',
      title: '수열 마스터',
      xp: count - 11,
      maxXp: 4,
      next: 16,
    };
  }
  if (count >= 8) {
    return {
      level: 3,
      emoji: '⚔️',
      title: '베테랑 수학자',
      xp: count - 7,
      maxXp: 4,
      next: 12,
    };
  }
  if (count >= 4) {
    return {
      level: 2,
      emoji: '📚',
      title: '성실한 학습자',
      xp: count - 3,
      maxXp: 4,
      next: 8,
    };
  }
  return {
    level: 1,
    emoji: '🌱',
    title: '수학 새싹',
    xp: count,
    maxXp: 4,
    next: 4,
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
  const resize = () => {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();

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
  const [classFilter, setClassFilter] = useState<ClassFilter>('전체');
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const [students, setStudents] = useState<StudentState[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as StudentState[];
        const stateMap = new Map(parsed.map((s) => [s.id, s]));
        return ROSTER.map((base) => {
          const old = stateMap.get(base.id);
          return old ? { ...base, completed: old.completed ?? [], mentorPoints: old.mentorPoints ?? 0 } : { ...base, completed: [], mentorPoints: 0 };
        });
      }
    } catch {
      // ignore broken local data
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

  const filteredStudents = useMemo(() => {
    const byClass = classFilter === '전체' ? students : students.filter((s) => s.className === classFilter);
    if (levelFilter === null) return byClass;
    return byClass.filter((s) => getLevel(s.completed.length).level === levelFilter);
  }, [students, classFilter, levelFilter]);

  const classOnlyStudents = useMemo(
    () => classFilter === '전체' ? students : students.filter((s) => s.className === classFilter),
    [students, classFilter],
  );

  const totalSubmissions = classOnlyStudents.reduce((sum, s) => sum + s.completed.length, 0);
  const participating = classOnlyStudents.filter((s) => s.completed.length > 0).length;
  const totalMentorPoints = classOnlyStudents.reduce((sum, s) => sum + s.mentorPoints, 0);

  const sessionCounts = useMemo(
    () => SESSIONS.map((session) => classOnlyStudents.filter((s) => s.completed.includes(session)).length),
    [classOnlyStudents],
  );

  const levelCounts = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    classOnlyStudents.forEach((s) => {
      counts[getLevel(s.completed.length).level - 1] += 1;
    });
    return counts;
  }, [classOnlyStudents]);

  const toggleSubmission = (studentId: string, session: number, silent = false) => {
    setStudents((prev) => {
      const target = prev.find((s) => s.id === studentId);
      if (!target) return prev;
      const wasDone = target.completed.includes(session);
      const beforeLevel = getLevel(target.completed.length).level;
      const nextCompleted = wasDone
        ? target.completed.filter((n) => n !== session)
        : [...target.completed, session].sort((a, b) => a - b);
      const afterLevel = getLevel(nextCompleted.length).level;

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

      return prev.map((s) => s.id === studentId ? { ...s, completed: nextCompleted } : s);
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
        SESSIONS.forEach((session) => {
          if (!student.completed.includes(session)) pending.push({ studentId: student.id, session });
        });
      });

      if (pending.length > 0) {
        const pick = pending[Math.floor(Math.random() * pending.length)];
        toggleSubmission(pick.studentId, pick.session, true);
      }

      if (Math.random() < 0.38 && students.length > 1) {
        const mentor = students[Math.floor(Math.random() * students.length)];
        let mentee = students[Math.floor(Math.random() * students.length)];
        while (mentee.id === mentor.id) mentee = students[Math.floor(Math.random() * students.length)];
        giveMentorPoints(mentor.id, mentee.id, 1, true);
      }
    }, 1200);

    return () => {
      if (demoTimer.current) window.clearInterval(demoTimer.current);
      demoTimer.current = null;
    };
  // demo simulation intentionally uses current snapshot and is refreshed when state changes
  }, [demoOn, students]);

  const selectedStudent = selectedStudentId ? students.find((s) => s.id === selectedStudentId) ?? null : null;

  const resetData = () => {
    if (!window.confirm('제출 현황과 멘토 포인트를 모두 0으로 초기화할까요?')) return;
    setStudents(initialStudents());
    setMentorLogs([]);
    setLevelFilter(null);
    setToast({ kind: 'info', message: '대시보드 데이터를 초기화했습니다.' });
  };

  const downloadCsv = () => {
    const targets = classOnlyStudents;
    const header = ['반', '학번', '이름', '레벨', '멘토포인트', ...SESSIONS.map((n) => `${n}차시`), '제출합계'];
    const rows = targets.map((student) => {
      const level = getLevel(student.completed.length);
      return [
        student.className,
        student.id,
        student.name,
        `Lv.${level.level}`,
        student.mentorPoints,
        ...SESSIONS.map((session) => student.completed.includes(session) ? '제출' : '미제출'),
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
    link.download = `${classFilter === '전체' ? '1학년_전체' : classFilter}_수학_RPG_제출현황.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard-app">
      <header className="dashboard-header">
        <div className="brand-block">
          <h1>🎮 수학 학습 RPG 대시보드</h1>
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
          <div className="class-pills" aria-label="반 선택">
            {CLASS_NAMES.map((name) => (
              <button
                key={name}
                className={classFilter === name ? 'active' : ''}
                onClick={() => {
                  setClassFilter(name);
                  setLevelFilter(null);
                }}
              >
                {name === '전체' ? '전체' : `${name}반`}
              </button>
            ))}
          </div>
          <div className="roster-count">명렬 적용 학생 <b>{classOnlyStudents.length}명</b> / 전체 {students.length}명</div>
        </div>

        <div className="summary-grid">
          <StatCard value={totalSubmissions.toLocaleString()} label="총 제출 수" />
          <StatCard value={`${participating}/${classOnlyStudents.length}명`} label="참여 학생" />
          <StatCard value="18/18차시" label="관리 차시" />
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
            sessionCounts={sessionCounts}
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

type OverviewProps = {
  students: StudentState[];
  classStudents: StudentState[];
  classFilter: ClassFilter;
  sessionCounts: number[];
  levelCounts: number[];
  levelFilter: number | null;
  setLevelFilter: (level: number | null) => void;
  toggleSubmission: (studentId: string, session: number) => void;
  downloadCsv: () => void;
};

function Overview({
  students,
  classStudents,
  classFilter,
  sessionCounts,
  levelCounts,
  levelFilter,
  setLevelFilter,
  toggleSubmission,
  downloadCsv,
}: OverviewProps) {
  const maxStudents = Math.max(1, classStudents.length);
  const missing = useMemo(() => classStudents
    .map((student) => ({ ...student, missing: SESSIONS.filter((s) => !student.completed.includes(s)) }))
    .filter((student) => student.missing.length > 0)
    .sort((a, b) => a.missing.length - b.missing.length || a.className.localeCompare(b.className) || a.id.localeCompare(b.id)),
  [classStudents]);

  return (
    <section className="content-section">
      <div className="section-heading">
        <div>
          <h2>차시별 제출 현황</h2>
          <p>{classFilter === '전체' ? '1학년 전체' : `${classFilter}반`} · 차시별 완료 학생 수와 달성률</p>
        </div>
        <button className="download-btn" onClick={downloadCsv}>📥 CSV 다운로드</button>
      </div>

      <div className="chart-card vertical-chart">
        <div className="y-axis">
          {[100, 80, 60, 40, 20, 0].map((n) => <span key={n}>{n}%</span>)}
        </div>
        <div className="bars-wrap">
          {SESSIONS.map((session, index) => {
            const count = sessionCounts[index];
            const pct = Math.round((count / maxStudents) * 100);
            return (
              <div className="bar-item" key={session}>
                <div className="bar-tooltip">{count}명 · {pct}%</div>
                <div className="bar-column" style={{ height: `${pct}%` }} />
                <span>{session}차시</span>
              </div>
            );
          })}
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
        <p className="card-help">빨간 차시 칩을 누르면 즉시 제출 완료로 바뀝니다.</p>
        <div className="missing-list">
          {missing.length === 0 ? (
            <div className="empty-state">🎉 현재 선택된 반은 모든 차시를 제출했습니다.</div>
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

      <SubmissionTable students={students} toggleSubmission={toggleSubmission} />
    </section>
  );
}

function SubmissionTable({
  students,
  toggleSubmission,
}: {
  students: StudentState[];
  toggleSubmission: (studentId: string, session: number) => void;
}) {
  const sorted = [...students].sort((a, b) => a.className.localeCompare(b.className) || a.id.localeCompare(b.id));

  return (
    <div className="table-card">
      <div className="table-title">
        <h2>📋 실시간 제출 체크 표</h2>
        <span>✅ / ❌ 버튼을 눌러 즉시 변경</span>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>반</th>
              <th>학번</th>
              <th>이름</th>
              <th>레벨</th>
              <th>제출 수</th>
              {SESSIONS.map((s) => <th key={s}>{s}차시</th>)}
            </tr>
          </thead>
          <tbody>
            {sorted.map((student) => {
              const meta = getLevel(student.completed.length);
              return (
                <tr key={student.id}>
                  <td>{student.className}</td>
                  <td>{student.id}</td>
                  <td className="name-cell">{student.name}</td>
                  <td><span className={`mini-level mini-${meta.level}`}>Lv.{meta.level} {meta.emoji}</span></td>
                  <td><b>{student.completed.length}/18</b></td>
                  {SESSIONS.map((session) => {
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
    b.completed.length - a.completed.length ||
    b.mentorPoints - a.mentorPoints ||
    a.className.localeCompare(b.className) ||
    a.id.localeCompare(b.id),
  );

  const counts = LEVELS.map((level) => sorted.filter((s) => getLevel(s.completed.length).level === level.level).length);

  return (
    <section className="content-section">
      <div className="section-heading">
        <div>
          <h2>👤 개인별 레벨 및 경험치</h2>
          <p>학생 카드를 클릭하면 차시별 체크리스트와 멘토링 내역을 확인할 수 있습니다.</p>
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
          const meta = getLevel(student.completed.length);
          const percent = Math.min(100, (meta.xp / meta.maxXp) * 100);
          const helpCount = mentorLogs.filter((log) => log.mentorId === student.id).length;
          return (
            <button className={`level-card level-${meta.level}`} key={student.id} onClick={() => onOpen(student.id)}>
              <div className="level-top">
                <div className="student-name">
                  <span className="rank-num">{index < 3 ? ['🥇', '🥈', '🥉'][index] : `${index + 1}위`}</span>
                  <span>{meta.emoji}</span>
                  <strong>{student.name}</strong>
                </div>
                <span className="level-pill">Lv.{meta.level}</span>
              </div>
              <p>{student.className} · {student.id} · {meta.title} · {student.completed.length}/18 차시 완료</p>
              <div className="xp-track"><span style={{ width: `${percent}%` }} /></div>
              <div className="xp-meta">
                <span>{meta.xp}/{meta.maxXp} XP</span>
                <span>{meta.level === 5 && student.completed.length === 18 ? '✨ 완전 정복!' : `다음 단계까지 ${Math.max(0, meta.next - student.completed.length)}회`}</span>
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
    .sort((a, b) => b.mentorPoints - a.mentorPoints || b.completed.length - a.completed.length || a.id.localeCompare(b.id));
  const visible = ranked.length > 0 ? ranked.slice(0, 20) : [...students].slice(0, 10);
  const max = Math.max(18, ...visible.map((s) => s.mentorPoints));

  const studentMap = new Map(allStudents.map((s) => [s.id, s]));

  return (
    <section className="content-section">
      <div className="section-heading">
        <div>
          <h2>👑 멘토 포인트 랭킹</h2>
          <p>친구를 도와 문제 해결을 지원한 학생에게 포인트를 지급합니다.</p>
        </div>
        <button className="primary-btn" onClick={onOpenGive}>＋ 멘토 포인트 주기</button>
      </div>

      <div className="mentor-layout">
        <div className="mentor-list-card">
          <h3>랭킹 리스트</h3>
          {visible.map((mentor, index) => (
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
          {visible.every((s) => s.mentorPoints === 0) && (
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
  const stats = CLASS_NAMES.filter((c): c is Exclude<ClassFilter, '전체'> => c !== '전체').map((className) => {
    const list = students.filter((s) => s.className === className);
    const total = list.reduce((sum, s) => sum + s.completed.length, 0);
    const possible = list.length * 18;
    const rate = possible ? (total / possible) * 100 : 0;
    const avg = list.length ? total / list.length : 0;
    const avgLevel = list.length ? list.reduce((sum, s) => sum + getLevel(s.completed.length).level, 0) / list.length : 0;
    const levelDist = LEVELS.map((level) => list.filter((s) => getLevel(s.completed.length).level === level.level).length);
    const zeroStudents = list.filter((s) => s.completed.length === 0);
    return { className, list, total, rate, avg, avgLevel, levelDist, zeroStudents };
  }).sort((a, b) => b.rate - a.rate || b.total - a.total);

  return (
    <section className="content-section">
      <div className="section-heading">
        <div>
          <h2>🏰 반별 퀘스트 대항전</h2>
          <p>1학년 1반부터 7반까지 제출률·제출 건수·평균 레벨을 비교합니다.</p>
        </div>
      </div>

      <div className="quest-podium">
        {stats.slice(0, 3).map((stat, index) => (
          <div className={`podium-card podium-${index + 1}`} key={stat.className}>
            <span>{['🥇', '🥈', '🥉'][index]}</span>
            <strong>{stat.className}반</strong>
            <b>{stat.rate.toFixed(1)}%</b>
          </div>
        ))}
      </div>

      <div className="quest-grid">
        {stats.map((stat, rank) => (
          <article className="quest-card" key={stat.className}>
            <div className="quest-title">
              <div>
                <span className="quest-rank">{rank + 1}위</span>
                <h3>{stat.className}반</h3>
              </div>
              <strong>{stat.rate.toFixed(1)}%</strong>
            </div>
            <div className="quest-progress"><span style={{ width: `${stat.rate}%` }} /></div>

            <div className="quest-metrics">
              <div><span>제출 건수</span><b>{stat.total}</b></div>
              <div><span>인당 평균</span><b>{stat.avg.toFixed(1)}</b></div>
              <div><span>평균 레벨</span><b>Lv.{stat.avgLevel.toFixed(2)}</b></div>
              <div><span>학생 수</span><b>{stat.list.length}명</b></div>
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
  const meta = getLevel(student.completed.length);
  const map = new Map(students.map((s) => [s.id, s]));
  const logs = mentorLogs.filter((log) => log.mentorId === student.id || log.menteeId === student.id).slice(0, 10);

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal-card student-modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="student-modal-head">
          <span className="modal-avatar">{meta.emoji}</span>
          <div>
            <h2>{student.name}</h2>
            <p>{student.className} · {student.id} · {meta.title}</p>
          </div>
          <span className={`level-pill modal-level level-${meta.level}`}>Lv.{meta.level}</span>
        </div>

        <h3>차시별 체크리스트</h3>
        <div className="session-check-grid">
          {SESSIONS.map((session) => {
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
