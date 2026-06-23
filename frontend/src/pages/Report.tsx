const strengths = [
  { label: 'Problem Solving', score: 91 },
  { label: 'Technical Communication', score: 85 },
  { label: 'System Design', score: 79 },
]

const improvements = [
  {
    label: 'STAR Method Depth',
    description: 'Add more specific metrics and quantified results to your examples.',
  },
  {
    label: 'Handling Ambiguity',
    description: 'Practice asking clarifying questions before jumping to solutions.',
  },
  {
    label: 'Time Management',
    description: 'Structure responses to fit within 2-3 minutes consistently.',
  },
]

const skills = [
  { name: 'Algorithms', score: 88 },
  { name: 'System Design', score: 79 },
  { name: 'Behavioral', score: 85 },
  { name: 'Communication', score: 90 },
  { name: 'Coding Speed', score: 72 },
  { name: 'Architecture', score: 76 },
]

const roadmap = [
  'Practice 2 more system design interviews this week',
  'Review STAR method with concrete metrics',
  'Complete LeetCode Medium problems in Hash Tables',
  'Schedule mock interview with peer',
]

export default function Report() {
  return (
    <div className="max-w-[1040px] mx-auto select-none space-y-6">
      {/* Header section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-text-primary mb-1">
            Interview Report
          </h1>
          <p className="text-[14px] text-text-secondary font-medium">Software Engineer · Jun 21, 2026</p>
        </div>
        <div className="text-right">
          <div className="text-[64px] font-extrabold tracking-tighter text-text-primary leading-none">
            82
          </div>
          <div className="text-[13px] font-bold text-text-secondary mt-1 uppercase tracking-wider">Interview Score</div>
        </div>
      </div>

      {/* Main Grid: Strengths & Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths Card */}
        <div className="rounded-[16px] border border-border bg-surface p-6 transition-colors">
          <h2 className="text-[15px] font-bold text-text-primary mb-5 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-success">
              <path d="M5 10l3 3 5-6"/>
              <circle cx="9" cy="9" r="8"/>
            </svg>
            Strengths
          </h2>
          <div className="space-y-4">
            {strengths.map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13.5px] font-bold text-text-primary">{s.label}</span>
                  <span className="text-[13px] font-bold text-success">{s.score}%</span>
                </div>
                <div className="h-2 bg-[#F3F4F6] dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-success rounded-full transition-all" style={{ width: `${s.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Areas to Improve Card */}
        <div className="rounded-[16px] border border-border bg-surface p-6 transition-colors">
          <h2 className="text-[15px] font-bold text-text-primary mb-5 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-warning">
              <path d="M9 5v4M9 12.5v.5"/>
              <circle cx="9" cy="9" r="8"/>
            </svg>
            Areas to Improve
          </h2>
          <div className="space-y-3.5">
            {improvements.map((imp) => (
              <div key={imp.label} className="rounded-[12px] bg-warning-light/40 border border-warning/10 p-4 transition-colors">
                <div className="text-[13.5px] font-bold text-warning">{imp.label}</div>
                <div className="text-[12.5px] text-text-secondary mt-1 leading-relaxed">{imp.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skills breakdown and Radar overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Skill Breakdown (Span 2) */}
        <div className="md:col-span-2 rounded-[16px] border border-border bg-surface p-6 transition-colors">
          <h2 className="text-[15px] font-bold text-text-primary mb-5">Skill Breakdown</h2>
          <div className="space-y-4">
            {skills.map((skill) => (
              <div key={skill.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13.5px] font-bold text-text-primary">{skill.name}</span>
                  <span className="text-[13px] font-bold text-text-secondary">{skill.score}%</span>
                </div>
                <div className="h-2 bg-[#F3F4F6] dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      skill.score >= 85 ? 'bg-success' : skill.score >= 75 ? 'bg-accent' : 'bg-warning'
                    }`}
                    style={{ width: `${skill.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Radar Overview (Span 1) */}
        <div className="rounded-[16px] border border-border bg-surface p-6 flex flex-col justify-between transition-colors">
          <h2 className="text-[15px] font-bold text-text-primary">Radar Overview</h2>
          <div className="flex-1 flex items-center justify-center py-6 text-text-secondary">
            <div className="text-center">
              <svg width="140" height="140" viewBox="0 0 140 140" className="mx-auto mb-3">
                <polygon
                  points="70,15 125,50 110,110 30,110 15,50"
                  fill="var(--accent-light)"
                  stroke="rgba(37,99,235,0.4)"
                  strokeWidth="1.5"
                />
                <polygon
                  points="70,20 120,52 107,105 33,105 20,52"
                  fill="rgba(37,99,235,0.08)"
                  stroke="#2563EB"
                  strokeWidth="2"
                />
                <circle cx="70" cy="70" r="3" fill="#2563EB" />
              </svg>
              <span className="text-[12.5px] font-semibold text-text-secondary">6 skills evaluated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap Container */}
      <div className="rounded-[16px] border border-border bg-surface p-6 transition-colors">
        <h2 className="text-[15px] font-bold text-text-primary mb-5">Improvement Roadmap</h2>
        <div className="space-y-0">
          {roadmap.map((item, i) => (
            <div key={i} className="flex items-start gap-4 py-3.5 border-b border-border last:border-0">
              <div className="w-7 h-7 rounded-full bg-accent-light text-accent flex items-center justify-center text-[13px] font-bold flex-shrink-0">
                {i + 1}
              </div>
              <div className="text-[13.5px] text-text-primary leading-relaxed pt-0.5">{item}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
