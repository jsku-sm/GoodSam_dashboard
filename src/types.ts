export type LevelTier = 1 | 2 | 3 | 4 | 5;

export interface LevelConfig {
  level: LevelTier;
  title: string;
  icon: string;
  minCompleted: number;
  maxCompleted: number;
  colorClass: string;
  badgeBg: string;
  badgeText: string;
  barColor: string;
}

export interface Student {
  id: string;
  studentNo?: string; // e.g. "10102"
  name: string;
  classId: string; // "1" ~ "7"
  className: string; // "1학년 1반" ~ "1학년 7반"
  department?: string; // e.g. "국제관광비즈니스과"
  submissions: Record<number, boolean>; // lessonNumber -> isSubmitted
  mentorPoints: number;
  lastUpdated?: string;
  memo?: string;
}

export interface Lesson {
  id: number;
  title: string;
  topic?: string;
  date?: string;
  isActive: boolean;
}

export interface MentorLog {
  id: string;
  timestamp: string;
  mentorStudentId: string;
  mentorName: string;
  menteeStudentId: string;
  menteeName: string;
  lessonId: number;
  note?: string;
}

export interface ClassStats {
  classId: string;
  className: string;
  department?: string;
  weeklyHours: number; // 2 or 1
  totalLessons: number; // 32 or 16
  totalStudents: number;
  activeStudents: number; // submitted at least 1
  totalSubmissions: number;
  maxPossibleSubmissions: number;
  maxLessonSubmitted: number; // highest submitted lesson count by any student in this class
  submissionRate: number; // e.g. 61
  avgSubmissionsPerStudent: number; // e.g. 10.4
  avgLevel: number; // e.g. 3.6
  totalMentorPoints: number;
  levelCounts: Record<LevelTier, number>;
  zeroSubmissionStudents: Student[];
}

export interface OverallStats {
  totalSubmissions: number;
  totalStudents: number;
  activeStudents: number;
  maxLessonSubmitted: number; // highest submitted lesson count by any student across all classes
  currentActiveLessons: number;
  totalPlannedLessons: number;
  totalMentorPoints: number;
  levelCounts: Record<LevelTier, number>;
}
