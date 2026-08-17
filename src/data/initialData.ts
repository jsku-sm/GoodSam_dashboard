import { Lesson, LevelConfig, Student, MentorLog } from '../types';

export interface ClassMeta {
  id: string;
  name: string;
  shortName: string;
  department: string;
  weeklyHours: number; // 2 for 1,2,4,5 / 1 for 3,6,7
  totalLessons: number; // 32 for 1,2,4,5 / 16 for 3,6,7
}

export const CLASS_LIST: ClassMeta[] = [
  { id: '1', name: '1학년 1반', shortName: '1-1', department: '국제관광비즈니스과', weeklyHours: 2, totalLessons: 32 },
  { id: '2', name: '1학년 2반', shortName: '1-2', department: '국제관광비즈니스과', weeklyHours: 2, totalLessons: 32 },
  { id: '3', name: '1학년 3반', shortName: '1-3', department: '스마트경영과', weeklyHours: 1, totalLessons: 16 },
  { id: '4', name: '1학년 4반', shortName: '1-4', department: 'AI융합콘텐츠과', weeklyHours: 2, totalLessons: 32 },
  { id: '5', name: '1학년 5반', shortName: '1-5', department: 'AI융합콘텐츠과', weeklyHours: 2, totalLessons: 32 },
  { id: '6', name: '1학년 6반', shortName: '1-6', department: '콘텐츠디자인과', weeklyHours: 1, totalLessons: 16 },
  { id: '7', name: '1학년 7반', shortName: '1-7', department: '콘텐츠디자인과', weeklyHours: 1, totalLessons: 16 },
];

// Helper to generate clean lesson lists (just 차시 numbers)
export const generateLessons = (count: number): Lesson[] => {
  return Array.from({ length: count }, (_, idx) => ({
    id: idx + 1,
    title: `${idx + 1}차시`,
    isActive: true,
  }));
};

export const LESSON_LIST_32: Lesson[] = generateLessons(32);
export const LESSON_LIST_16: Lesson[] = generateLessons(16);

// Default 32 lessons for global fallback
export const LESSON_LIST: Lesson[] = LESSON_LIST_32;

// Get total lesson count for a specific class (1,2,4,5: 32 / 3,6,7: 16)
export const getClassLessonCount = (classId: string): number => {
  if (['3', '6', '7'].includes(classId)) {
    return 16;
  }
  return 32;
};

// Get lessons for a class or general view
export const getLessonsForClass = (classId: string): Lesson[] => {
  const count = getClassLessonCount(classId);
  return count === 16 ? LESSON_LIST_16 : LESSON_LIST_32;
};

export const LEVEL_CONFIGS: Record<number, LevelConfig> = {
  1: {
    level: 1,
    title: '수학 새싹',
    icon: '🌱',
    minCompleted: 0,
    maxCompleted: 3,
    colorClass: 'text-rose-600 bg-rose-50 border-rose-200',
    badgeBg: 'bg-rose-100 text-rose-700',
    badgeText: 'Lv.1 수학 새싹',
    barColor: 'bg-rose-500',
  },
  2: {
    level: 2,
    title: '성실한 학습자',
    icon: '📚',
    minCompleted: 4,
    maxCompleted: 5,
    colorClass: 'text-orange-600 bg-orange-50 border-orange-200',
    badgeBg: 'bg-orange-100 text-orange-700',
    badgeText: 'Lv.2 성실한 학습자',
    barColor: 'bg-orange-500',
  },
  3: {
    level: 3,
    title: '베테랑 수학자',
    icon: '⚔️',
    minCompleted: 6,
    maxCompleted: 10,
    colorClass: 'text-amber-600 bg-amber-50 border-amber-200',
    badgeBg: 'bg-amber-100 text-amber-700',
    badgeText: 'Lv.3 베테랑 수학자',
    barColor: 'bg-amber-500',
  },
  4: {
    level: 4,
    title: '마스터',
    icon: '🌟',
    minCompleted: 11,
    maxCompleted: 15,
    colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    badgeBg: 'bg-emerald-100 text-emerald-700',
    badgeText: 'Lv.4 마스터',
    barColor: 'bg-emerald-500',
  },
  5: {
    level: 5,
    title: '전설의 수학왕',
    icon: '👑',
    minCompleted: 16,
    maxCompleted: 99,
    colorClass: 'text-blue-600 bg-blue-50 border-blue-200',
    badgeBg: 'bg-blue-100 text-blue-700',
    badgeText: 'Lv.5 전설의 수학왕',
    barColor: 'bg-blue-600',
  },
};

export function calculateStudentLevel(
  completedCount: number,
  maxLessons: number = 32
): {
  level: 1 | 2 | 3 | 4 | 5;
  config: LevelConfig;
  currentXp: number;
  maxXp: number;
  xpText: string;
  isMax: boolean;
} {
  // Proportional thresholds based on 32 or 16 lessons
  // For 32 lessons: Lv.1 (0~5), Lv.2 (6~12), Lv.3 (13~20), Lv.4 (21~27), Lv.5 (28~32)
  // For 16 lessons: Lv.1 (0~2), Lv.2 (3~6), Lv.3 (7~10), Lv.4 (11~13), Lv.5 (14~16)
  const is16 = maxLessons <= 16;
  const t1 = is16 ? 3 : 6;
  const t2 = is16 ? 7 : 13;
  const t3 = is16 ? 11 : 21;
  const t4 = is16 ? 14 : 28;

  if (completedCount >= t4) {
    const currentXp = completedCount - (t4 - 1);
    const maxXp = maxLessons - t4 + 1;
    return {
      level: 5,
      config: LEVEL_CONFIGS[5],
      currentXp: Math.min(currentXp, maxXp),
      maxXp,
      xpText: '✨ 전설 달성!',
      isMax: true,
    };
  } else if (completedCount >= t3) {
    const currentXp = completedCount - (t3 - 1);
    const maxXp = t4 - t3;
    const needed = t4 - completedCount;
    return {
      level: 4,
      config: LEVEL_CONFIGS[4],
      currentXp,
      maxXp,
      xpText: `다음 레벨까지 ${needed} 차시`,
      isMax: false,
    };
  } else if (completedCount >= t2) {
    const currentXp = completedCount - (t2 - 1);
    const maxXp = t3 - t2;
    const needed = t3 - completedCount;
    return {
      level: 3,
      config: LEVEL_CONFIGS[3],
      currentXp,
      maxXp,
      xpText: `다음 레벨까지 ${needed} 차시`,
      isMax: false,
    };
  } else if (completedCount >= t1) {
    const currentXp = completedCount - (t1 - 1);
    const maxXp = t2 - t1;
    const needed = t2 - completedCount;
    return {
      level: 2,
      config: LEVEL_CONFIGS[2],
      currentXp,
      maxXp,
      xpText: `다음 레벨까지 ${needed} 차시`,
      isMax: false,
    };
  } else {
    const currentXp = completedCount;
    const maxXp = t1;
    const needed = t1 - completedCount;
    return {
      level: 1,
      config: LEVEL_CONFIGS[1],
      currentXp,
      maxXp,
      xpText: `다음 레벨까지 ${needed} 차시`,
      isMax: false,
    };
  }
}

// Helper to create a student with clean initialized data
const createStudent = (
  studentNo: string,
  name: string,
  classId: string,
  className: string,
  department: string
): Student => ({
  id: `s${studentNo}`,
  studentNo,
  name,
  classId,
  className,
  department,
  submissions: {},
  mentorPoints: 0,
});

export const INITIAL_STUDENTS: Student[] = [
  // ==================== 1학년 1반 (국제관광비즈니스과 - 17명) ====================
  createStudent('10102', '권현정', '1', '1학년 1반', '국제관광비즈니스과'),
  createStudent('10103', '김도윤', '1', '1학년 1반', '국제관광비즈니스과'),
  createStudent('10104', '김초희', '1', '1학년 1반', '국제관광비즈니스과'),
  createStudent('10105', '박규연', '1', '1학년 1반', '국제관광비즈니스과'),
  createStudent('10106', '박세현', '1', '1학년 1반', '국제관광비즈니스과'),
  createStudent('10107', '박채원', '1', '1학년 1반', '국제관광비즈니스과'),
  createStudent('10108', '박태윤', '1', '1학년 1반', '국제관광비즈니스과'),
  createStudent('10109', '방채현', '1', '1학년 1반', '국제관광비즈니스과'),
  createStudent('10110', '배지성', '1', '1학년 1반', '국제관광비즈니스과'),
  createStudent('10111', '서유진', '1', '1학년 1반', '국제관광비즈니스과'),
  createStudent('10112', '설온찬', '1', '1학년 1반', '국제관광비즈니스과'),
  createStudent('10113', '오하율', '1', '1학년 1반', '국제관광비즈니스과'),
  createStudent('10114', '오혜성', '1', '1학년 1반', '국제관광비즈니스과'),
  createStudent('10115', '윤소이', '1', '1학년 1반', '국제관광비즈니스과'),
  createStudent('10117', '윤지희', '1', '1학년 1반', '국제관광비즈니스과'),
  createStudent('10118', '장채민', '1', '1학년 1반', '국제관광비즈니스과'),
  createStudent('10119', '최민서', '1', '1학년 1반', '국제관광비즈니스과'),
  createStudent('10120', '한다정', '1', '1학년 1반', '국제관광비즈니스과'),

  // ==================== 1학년 2반 (국제관광비즈니스과 - 20명) ====================
  createStudent('10201', '강도희', '2', '1학년 2반', '국제관광비즈니스과'),
  createStudent('10202', '공도경', '2', '1학년 2반', '국제관광비즈니스과'),
  createStudent('10203', '김세영', '2', '1학년 2반', '국제관광비즈니스과'),
  createStudent('10204', '김유라', '2', '1학년 2반', '국제관광비즈니스과'),
  createStudent('10205', '김태영', '2', '1학년 2반', '국제관광비즈니스과'),
  createStudent('10206', '김한나', '2', '1학년 2반', '국제관광비즈니스과'),
  createStudent('10207', '김휘성', '2', '1학년 2반', '국제관광비즈니스과'),
  createStudent('10208', '문소현', '2', '1학년 2반', '국제관광비즈니스과'),
  createStudent('10209', '박사랑', '2', '1학년 2반', '국제관광비즈니스과'),
  createStudent('10210', '박예나', '2', '1학년 2반', '국제관광비즈니스과'),
  createStudent('10211', '소재연', '2', '1학년 2반', '국제관광비즈니스과'),
  createStudent('10212', '송채원', '2', '1학년 2반', '국제관광비즈니스과'),
  createStudent('10213', '이수찬', '2', '1학년 2반', '국제관광비즈니스과'),
  createStudent('10214', '이우주', '2', '1학년 2반', '국제관광비즈니스과'),
  createStudent('10215', '이준희', '2', '1학년 2반', '국제관광비즈니스과'),
  createStudent('10216', '정다영', '2', '1학년 2반', '국제관광비즈니스과'),
  createStudent('10217', '조일국', '2', '1학년 2반', '국제관광비즈니스과'),
  createStudent('10218', '최마린', '2', '1학년 2반', '국제관광비즈니스과'),
  createStudent('10219', '최예린', '2', '1학년 2반', '국제관광비즈니스과'),
  createStudent('10220', '최윤호', '2', '1학년 2반', '국제관광비즈니스과'),

  // ==================== 1학년 3반 (스마트경영과 - 20명) ====================
  createStudent('10301', '고은유', '3', '1학년 3반', '스마트경영과'),
  createStudent('10302', '권민지', '3', '1학년 3반', '스마트경영과'),
  createStudent('10303', '김다은', '3', '1학년 3반', '스마트경영과'),
  createStudent('10304', '김도윤', '3', '1학년 3반', '스마트경영과'),
  createStudent('10305', '김민서', '3', '1학년 3반', '스마트경영과'),
  createStudent('10306', '김세은', '3', '1학년 3반', '스마트경영과'),
  createStudent('10307', '김인우', '3', '1학년 3반', '스마트경영과'),
  createStudent('10308', '노현수', '3', '1학년 3반', '스마트경영과'),
  createStudent('10309', '민서영', '3', '1학년 3반', '스마트경영과'),
  createStudent('10310', '박윤서', '3', '1학년 3반', '스마트경영과'),
  createStudent('10311', '엄서현', '3', '1학년 3반', '스마트경영과'),
  createStudent('10312', '윤은서', '3', '1학년 3반', '스마트경영과'),
  createStudent('10313', '이수현', '3', '1학년 3반', '스마트경영과'),
  createStudent('10314', '이승준', '3', '1학년 3반', '스마트경영과'),
  createStudent('10315', '이유진', '3', '1학년 3반', '스마트경영과'),
  createStudent('10316', '이지윤', '3', '1학년 3반', '스마트경영과'),
  createStudent('10317', '이현민', '3', '1학년 3반', '스마트경영과'),
  createStudent('10318', '조정우', '3', '1학년 3반', '스마트경영과'),
  createStudent('10319', '차준수', '3', '1학년 3반', '스마트경영과'),
  createStudent('10320', '현별', '3', '1학년 3반', '스마트경영과'),

  // ==================== 1학년 4반 (AI융합콘텐츠과 - 20명) ====================
  createStudent('10401', '김나현', '4', '1학년 4반', 'AI융합콘텐츠과'),
  createStudent('10402', '김민완', '4', '1학년 4반', 'AI융합콘텐츠과'),
  createStudent('10403', '김시우', '4', '1학년 4반', 'AI융합콘텐츠과'),
  createStudent('10404', '김은우', '4', '1학년 4반', 'AI융합콘텐츠과'),
  createStudent('10405', '문준혁', '4', '1학년 4반', 'AI융합콘텐츠과'),
  createStudent('10406', '박정우', '4', '1학년 4반', 'AI융합콘텐츠과'),
  createStudent('10407', '박주원', '4', '1학년 4반', 'AI융합콘텐츠과'),
  createStudent('10408', '박하진', '4', '1학년 4반', 'AI융합콘텐츠과'),
  createStudent('10409', '박현아', '4', '1학년 4반', 'AI융합콘텐츠과'),
  createStudent('10410', '배지호', '4', '1학년 4반', 'AI융합콘텐츠과'),
  createStudent('10411', '손예찬', '4', '1학년 4반', 'AI융합콘텐츠과'),
  createStudent('10412', '신지민', '4', '1학년 4반', 'AI융합콘텐츠과'),
  createStudent('10413', '유가온', '4', '1학년 4반', 'AI융합콘텐츠과'),
  createStudent('10414', '이광욱', '4', '1학년 4반', 'AI융합콘텐츠과'),
  createStudent('10415', '이재준', '4', '1학년 4반', 'AI융합콘텐츠과'),
  createStudent('10416', '이현수', '4', '1학년 4반', 'AI융합콘텐츠과'),
  createStudent('10417', '임지민', '4', '1학년 4반', 'AI융합콘텐츠과'),
  createStudent('10418', '장준영', '4', '1학년 4반', 'AI융합콘텐츠과'),
  createStudent('10419', '정동렬', '4', '1학년 4반', 'AI융합콘텐츠과'),
  createStudent('10420', '최민서', '4', '1학년 4반', 'AI융합콘텐츠과'),

  // ==================== 1학년 5반 (AI융합콘텐츠과 - 20명) ====================
  createStudent('10501', '김도현', '5', '1학년 5반', 'AI융합콘텐츠과'),
  createStudent('10502', '김범', '5', '1학년 5반', 'AI융합콘텐츠과'),
  createStudent('10503', '김시원', '5', '1학년 5반', 'AI융합콘텐츠과'),
  createStudent('10504', '김태윤', '5', '1학년 5반', 'AI융합콘텐츠과'),
  createStudent('10505', '김태희', '5', '1학년 5반', 'AI융합콘텐츠과'),
  createStudent('10506', '남현우', '5', '1학년 5반', 'AI융합콘텐츠과'),
  createStudent('10507', '박보람', '5', '1학년 5반', 'AI융합콘텐츠과'),
  createStudent('10508', '박의진', '5', '1학년 5반', 'AI융합콘텐츠과'),
  createStudent('10509', '변희찬', '5', '1학년 5반', 'AI융합콘텐츠과'),
  createStudent('10510', '신우경', '5', '1학년 5반', 'AI융합콘텐츠과'),
  createStudent('10511', '신유찬', '5', '1학년 5반', 'AI융합콘텐츠과'),
  createStudent('10512', '이다솔', '5', '1학년 5반', 'AI융합콘텐츠과'),
  createStudent('10513', '이동준', '5', '1학년 5반', 'AI융합콘텐츠과'),
  createStudent('10514', '이승혜', '5', '1학년 5반', 'AI융합콘텐츠과'),
  createStudent('10515', '이재민', '5', '1학년 5반', 'AI융합콘텐츠과'),
  createStudent('10516', '장대한', '5', '1학년 5반', 'AI융합콘텐츠과'),
  createStudent('10517', '정도겸', '5', '1학년 5반', 'AI융합콘텐츠과'),
  createStudent('10518', '정민유', '5', '1학년 5반', 'AI융합콘텐츠과'),
  createStudent('10519', '정창민', '5', '1학년 5반', 'AI융합콘텐츠과'),
  createStudent('10520', '홍경천', '5', '1학년 5반', 'AI융합콘텐츠과'),

  // ==================== 1학년 6반 (콘텐츠디자인과 - 20명) ====================
  createStudent('10601', '곽소희', '6', '1학년 6반', '콘텐츠디자인과'),
  createStudent('10602', '구나연', '6', '1학년 6반', '콘텐츠디자인과'),
  createStudent('10603', '김도윤', '6', '1학년 6반', '콘텐츠디자인과'),
  createStudent('10604', '김미나', '6', '1학년 6반', '콘텐츠디자인과'),
  createStudent('10605', '김수민', '6', '1학년 6반', '콘텐츠디자인과'),
  createStudent('10606', '김시호', '6', '1학년 6반', '콘텐츠디자인과'),
  createStudent('10607', '민정원', '6', '1학년 6반', '콘텐츠디자인과'),
  createStudent('10608', '서혜영', '6', '1학년 6반', '콘텐츠디자인과'),
  createStudent('10609', '선한별', '6', '1학년 6반', '콘텐츠디자인과'),
  createStudent('10610', '신가은', '6', '1학년 6반', '콘텐츠디자인과'),
  createStudent('10611', '이서현', '6', '1학년 6반', '콘텐츠디자인과'),
  createStudent('10612', '이시진', '6', '1학년 6반', '콘텐츠디자인과'),
  createStudent('10613', '이하윤', '6', '1학년 6반', '콘텐츠디자인과'),
  createStudent('10614', '이학열', '6', '1학년 6반', '콘텐츠디자인과'),
  createStudent('10615', '정연아', '6', '1학년 6반', '콘텐츠디자인과'),
  createStudent('10616', '정지후', '6', '1학년 6반', '콘텐츠디자인과'),
  createStudent('10617', '조연수', '6', '1학년 6반', '콘텐츠디자인과'),
  createStudent('10618', '추아련', '6', '1학년 6반', '콘텐츠디자인과'),
  createStudent('10619', '허유희', '6', '1학년 6반', '콘텐츠디자인과'),
  createStudent('10620', '황예지', '6', '1학년 6반', '콘텐츠디자인과'),

  // ==================== 1학년 7반 (콘텐츠디자인과 - 19명) ====================
  createStudent('10701', '강수', '7', '1학년 7반', '콘텐츠디자인과'),
  createStudent('10702', '강지우', '7', '1학년 7반', '콘텐츠디자인과'),
  createStudent('10703', '곽윤서', '7', '1학년 7반', '콘텐츠디자인과'),
  createStudent('10704', '구민아', '7', '1학년 7반', '콘텐츠디자인과'),
  createStudent('10705', '김홍준', '7', '1학년 7반', '콘텐츠디자인과'),
  createStudent('10706', '도가윤', '7', '1학년 7반', '콘텐츠디자인과'),
  createStudent('10707', '박서아', '7', '1학년 7반', '콘텐츠디자인과'),
  createStudent('10708', '박혜원', '7', '1학년 7반', '콘텐츠디자인과'),
  createStudent('10709', '방지윤', '7', '1학년 7반', '콘텐츠디자인과'),
  createStudent('10710', '서윤아', '7', '1학년 7반', '콘텐츠디자인과'),
  createStudent('10711', '유승아', '7', '1학년 7반', '콘텐츠디자인과'),
  createStudent('10712', '이채윤', '7', '1학년 7반', '콘텐츠디자인과'),
  createStudent('10714', '임사랑', '7', '1학년 7반', '콘텐츠디자인과'),
  createStudent('10715', '정주연', '7', '1학년 7반', '콘텐츠디자인과'),
  createStudent('10716', '조민정', '7', '1학년 7반', '콘텐츠디자인과'),
  createStudent('10717', '조시연', '7', '1학년 7반', '콘텐츠디자인과'),
  createStudent('10718', '진주아', '7', '1학년 7반', '콘텐츠디자인과'),
  createStudent('10719', '한지홍', '7', '1학년 7반', '콘텐츠디자인과'),
  createStudent('10720', '황예원', '7', '1학년 7반', '콘텐츠디자인과'),
];

export const INITIAL_MENTOR_LOGS: MentorLog[] = [];
