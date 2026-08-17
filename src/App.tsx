import React from 'react';

const classes = [
  { name: '1학년 1반', submitted: 22, total: 25, lesson: '평면좌표' },
  { name: '1학년 2반', submitted: 19, total: 24, lesson: '두 점 사이의 거리' },
  { name: '1학년 3반', submitted: 23, total: 25, lesson: '중점' },
  { name: '1학년 4반', submitted: 18, total: 24, lesson: '내분점' },
];

const mentors = [
  { rank: 1, name: '김하늘', points: 128, badge: '🏆' },
  { rank: 2, name: '이서준', points: 112, badge: '🥈' },
  { rank: 3, name: '박지민', points: 97, badge: '🥉' },
  { rank: 4, name: '최유나', points: 84, badge: '⭐' },
];

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <section className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-hint">{hint}</div>
    </section>
  );
}

export default function App() {
  const submitted = classes.reduce((sum, item) => sum + item.submitted, 0);
  const total = classes.reduce((sum, item) => sum + item.total, 0);
  const rate = Math.round((submitted / total) * 100);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">GOOD쌤 CLASSROOM</p>
          <h1>Good쌤 수업 대시보드</h1>
          <p className="subtitle">학습지 제출 현황과 또래 멘토링을 한눈에 확인하세요.</p>
        </div>
        <div className="status-pill"><span></span> 수업 진행 중</div>
      </header>

      <main>
        <div className="stats-grid">
          <StatCard label="전체 제출률" value={`${rate}%`} hint={`${submitted} / ${total}명 제출`} />
          <StatCard label="오늘 수업" value="4개 반" hint="공통수학2 · 도형의 방정식" />
          <StatCard label="활성 멘토" value="12명" hint="오늘 도움 기록 27회" />
          <StatCard label="현재 레벨" value="Lv. 7" hint="다음 레벨까지 320 XP" />
        </div>

        <div className="main-grid">
          <section className="panel">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">REAL-TIME</p>
                <h2>학급별 학습지 제출 현황</h2>
              </div>
              <button type="button" onClick={() => window.location.reload()}>새로고침</button>
            </div>

            <div className="class-list">
              {classes.map((item) => {
                const percent = Math.round((item.submitted / item.total) * 100);
                return (
                  <article className="class-row" key={item.name}>
                    <div className="class-title">
                      <strong>{item.name}</strong>
                      <span>{item.lesson}</span>
                    </div>
                    <div className="progress-block">
                      <div className="progress-meta">
                        <span>{item.submitted}/{item.total}명</span>
                        <strong>{percent}%</strong>
                      </div>
                      <div className="track"><div className="bar" style={{ width: `${percent}%` }} /></div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="panel ranking-panel">
            <div className="panel-heading compact">
              <div>
                <p className="panel-kicker">PEER MENTOR</p>
                <h2>멘토 포인트 랭킹</h2>
              </div>
            </div>
            <div className="ranking-list">
              {mentors.map((mentor) => (
                <div className="ranking-row" key={mentor.name}>
                  <div className="rank-badge">{mentor.badge}</div>
                  <div className="mentor-name"><strong>{mentor.name}</strong><span>{mentor.rank}위</span></div>
                  <div className="points">{mentor.points} P</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mission-card">
          <div>
            <p className="panel-kicker">TODAY'S MISSION</p>
            <h2>오늘의 수학 미션</h2>
            <p>생활 속 좌표를 찾아 사진으로 기록하고, 두 점 사이의 거리를 자신의 말로 설명해 보세요.</p>
          </div>
          <div className="xp-box"><strong>+120 XP</strong><span>완료 보상</span></div>
        </section>
      </main>

      <footer>Good쌤 수업 · 학생의 작은 성장을 실시간으로 발견하는 교실</footer>
    </div>
  );
}
