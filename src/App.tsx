import React, { useMemo, useState } from 'react';

type Tab = 'overview' | 'levels' | 'mentors' | 'class';

type Student = {
  name: string;
  completed: number[];
};

const sessions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18];

const students: Student[] = [
  { name: '여민겸', completed: sessions },
  { name: '전재훈', completed: sessions },
  { name: '안효은', completed: sessions },
  { name: '정연아', completed: sessions },
  { name: '류효연', completed: sessions.filter((n) => n !== 17) },
  { name: '이예은', completed: sessions.filter((n) => n !== 17) },
  { name: '전하은', completed: sessions.filter((n) => ![16, 17, 18].includes(n)) },
  { name: '양수현', completed: sessions.filter((n) => ![9, 12, 13, 17, 18].includes(n)) },
  { name: '윤영민', completed: sessions.filter((n) => ![14, 15, 16, 17, 18].includes(n)) },
  { name: '김유주', completed: sessions.filter((n) => ![11, 12, 13, 17, 18].includes(n)) },
  { name: '김채민', completed: sessions.filter((n) => ![9, 12, 13, 16, 17, 18].includes(n)) },
  { name: '김예원', completed: sessions.filter((n) => ![8, 14, 15, 16, 17, 18].includes(n)) },
  { name: '안혜준', completed: sessions.filter((n) => ![7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18].includes(n)) },
  { name: '이다인', completed: sessions.filter((n) => ![5, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18].includes(n)) },
  { name: '송민경', completed: sessions.filter((n) => ![5, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18].includes(n)) },
  { name: '양준환', completed: sessions.filter((n) => ![4, 5, 6, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18].includes(n)) },
  { name: '이도윤', completed: sessions.filter((n) => ![4, 5, 6, 7, 9, 11, 12, 13, 14, 15, 16, 17, 18].includes(n)) },
  { name: '전진우', completed: [] },
  { name: '이연서', completed: [] },
];

const mentorData = [
  { name: '김제니아', points: 18 },
  { name: '김하윤', points: 15 },
  { name: '김채민', points: 13 },
  { name: '전하은', points: 11 },
  { name: '여민겸', points: 11 },
  { name: '윤영민', points: 11 },
  { name: '이시원', points: 6 },
  { name: '전유영', points: 4 },
  { name: '이예은', points: 4 },
  { name: '양수현', points: 4 },
];

const overviewCounts = [34, 35, 34, 29, 28, 30, 29, 24, 22, 22, 20, 22, 22, 17, 19, 14, 16];

const levelMeta = [
  { level: 1, emoji: '🌱', title: '수학 새싹', count: 3 },
  { level: 2, emoji: '📚', title: '성실한 학습자', count: 5 },
  { level: 3, emoji: '⚔️', title: '베테랑 수학자', count: 7 },
  { level: 4, emoji: '🌟', title: '수열 마스터', count: 7 },
  { level: 5, emoji: '👑', title: '전설의 수학왕', count: 16 },
];

function getLevel(count: number) {
  if (count >= 16) return { level: 5, emoji: '👑', title: '전설의 수학왕', xp: count === 17 ? 2 : 1, maxXp: 5 };
  if (count >= 11) return { level: 4, emoji: '🌟', title: '수열 마스터', xp: count - 10, maxXp: 5 };
  if (count >= 6) return { level: 3, emoji: '⚔️', title: '베테랑 수학자', xp: count - 6, maxXp: 4 };
  if (count >= 3) return { level: 2, emoji: '📚', title: '성실한 학습자', xp: Math.max(1, count - 3), maxXp: 3 };
  return { level: 1, emoji: '🌱', title: '수학 새싹', xp: count, maxXp: 3 };
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="summary-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function Overview() {
  const max = Math.max(...overviewCounts);
  return (
    <section className="content-section">
      <h2>차시별 제출 현황</h2>
      <div className="chart-card vertical-chart">
        <div className="y-axis">
          {[35, 30, 25, 20, 15, 10, 5, 0].map((n) => <span key={n}>{n}</span>)}
        </div>
        <div className="bars-wrap">
          {overviewCounts.map((count, index) => (
            <div className="bar-item" key={sessions[index]}>
              <div className="bar-column" title={`${sessions[index]}차시: ${count}명`} style={{ height: `${(count / max) * 100}%` }} />
              <span>{sessions[index]}차시</span>
            </div>
          ))}
        </div>
      </div>
      <div className="insight-grid">
        <div className="info-card"><b>📈 가장 높은 제출률</b><strong>2차시 · 35명</strong><span>초반 학습 참여가 매우 안정적입니다.</span></div>
        <div className="info-card"><b>🔎 최근 확인 필요</b><strong>17차시 · 14명</strong><span>미제출 학생을 우선 확인해 주세요.</span></div>
        <div className="info-card"><b>🎯 진행 상황</b><strong>17 / 19차시</strong><span>수업 종료까지 2차시 남았습니다.</span></div>
      </div>
    </section>
  );
}

function Levels() {
  const sorted = [...students].sort((a, b) => b.completed.length - a.completed.length);
  return (
    <section className="content-section">
      <div className="section-title-row">
        <div><h2>2학년 6반 개인 레벨</h2><p>차시 완료 수를 바탕으로 현재 성장 레벨을 보여줍니다.</p></div>
      </div>
      <div className="level-grid">
        {sorted.map((student, index) => {
          const meta = getLevel(student.completed.length);
          const percent = Math.min(100, (meta.xp / meta.maxXp) * 100);
          return (
            <article className={`level-card level-${meta.level}`} key={student.name}>
              <div className="level-top">
                <div className="student-name"><span className="rank-num">{index + 1}위</span><span>{meta.emoji}</span><strong>{student.name}</strong></div>
                <span className="level-pill">Lv.{meta.level}</span>
              </div>
              <p>{meta.title} · {student.completed.length}/17 차시 완료</p>
              <div className="xp-track"><span style={{ width: `${percent}%` }} /></div>
              <div className="xp-meta"><span>{meta.xp}/{meta.maxXp} XP</span><span>{meta.level === 5 ? '✨ 전설 달성!' : `다음 레벨까지 ${Math.max(0, meta.maxXp - meta.xp)} XP`}</span></div>
            </article>
          );
        })}
      </div>

      <h2 className="subheading">레벨 분포 현황</h2>
      <div className="distribution-grid">
        {levelMeta.map((item) => (
          <div className="distribution-card" key={item.level}>
            <span className="big-emoji">{item.emoji}</span>
            <strong>{item.count}명</strong>
            <span>Lv.{item.level} {item.title}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Mentors() {
  const max = Math.max(...mentorData.map((m) => m.points));
  return (
    <section className="content-section">
      <h2>👑 멘토 포인트 랭킹</h2>
      <p className="section-desc">친구를 도와줄수록 멘토 포인트가 쌓여요!</p>
      <div className="mentor-layout">
        <div className="mentor-list-card">
          {mentorData.map((mentor, index) => (
            <div className="mentor-row" key={mentor.name}>
              <div className="mentor-rank">{index < 3 ? ['🥇','🥈','🥉'][index] : `${index + 1}위`}</div>
              <strong>{mentor.name}</strong>
              <div className="mentor-progress"><span style={{ width: `${(mentor.points / max) * 100}%` }} /></div>
              <b>{mentor.points}pt</b>
            </div>
          ))}
        </div>
        <div className="mentor-chart-card">
          {mentorData.map((mentor) => (
            <div className="hbar-row" key={mentor.name}>
              <span>{mentor.name}</span>
              <div><i style={{ width: `${(mentor.points / max) * 100}%` }} /></div>
              <b>{mentor.points}</b>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClassStatus() {
  const missing = useMemo(() => students.map((student) => ({
    ...student,
    missing: sessions.filter((s) => !student.completed.includes(s)),
  })).filter((s) => s.missing.length > 0), []);

  const downloadCsv = () => {
    const header = ['이름', ...sessions.map((s) => `${s}차시`)];
    const rows = students.map((student) => [
      student.name,
      ...sessions.map((session) => student.completed.includes(session) ? '제출' : '미제출'),
    ]);
    const csv = '\ufeff' + [header, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '2학년6반_차시별_제출현황.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="content-section class-status-section">
      <div className="download-row">
        <button className="download-btn" onClick={downloadCsv}>📥 2학년 6반 제출 현황 CSV 다운로드</button>
      </div>

      <div className="missing-card">
        <h2>⚠️ 미제출 상세</h2>
        <div className="missing-list">
          {missing.map((student) => (
            <div className="missing-row" key={student.name}>
              <strong>{student.name}</strong>
              <span>· 미제출 {student.missing.length}개:</span>
              <div className="missing-pills">
                {student.missing.map((lesson) => <em key={lesson}>{lesson}차시</em>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="table-card">
        <h2>📋 2학년 6반 차시별 제출 현황</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>이름</th><th>레벨</th><th>제출 수</th>{sessions.map((s) => <th key={s}>{s}차시</th>)}</tr>
            </thead>
            <tbody>
              {[...students].sort((a,b) => b.completed.length - a.completed.length).map((student) => {
                const meta = getLevel(student.completed.length);
                return (
                  <tr key={student.name}>
                    <td className="name-cell">{student.name}</td>
                    <td><span className={`mini-level mini-${meta.level}`}>Lv.{meta.level} {meta.emoji}</span></td>
                    <td>{student.completed.length}/17</td>
                    {sessions.map((s) => <td key={s}><span className={student.completed.includes(s) ? 'done-cell' : 'miss-cell'}>{student.completed.includes(s) ? '✅' : '❌'}</span></td>)}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>('overview');
  const updated = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'medium' }).format(new Date());

  return (
    <div className="dashboard-app">
      <header className="dashboard-header">
        <h1>🎮 수열 학습 RPG 대시보드</h1>
        <span className="updated-pill">⏱ 마지막 갱신: {updated}</span>
      </header>

      <main className="dashboard-main">
        <section className="summary-grid">
          <StatCard value="417" label="총 제출 수" />
          <StatCard value="35/38명" label="참여 학생" />
          <StatCard value="17/19차시" label="진행 차시" />
          <StatCard value="122" label="멘토 기록 수" />
        </section>

        <nav className="tabs" aria-label="대시보드 메뉴">
          <button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>📊 전체 현황</button>
          <button className={tab === 'levels' ? 'active' : ''} onClick={() => setTab('levels')}>⚔️ 개인 레벨</button>
          <button className={tab === 'mentors' ? 'active' : ''} onClick={() => setTab('mentors')}>👑 멘토 랭킹</button>
          <button className={tab === 'class' ? 'active' : ''} onClick={() => setTab('class')}>🏫 반별 현황</button>
        </nav>

        {tab === 'overview' && <Overview />}
        {tab === 'levels' && <Levels />}
        {tab === 'mentors' && <Mentors />}
        {tab === 'class' && <ClassStatus />}
      </main>
    </div>
  );
}
