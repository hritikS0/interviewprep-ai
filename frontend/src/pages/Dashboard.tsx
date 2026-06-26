import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { interviewService } from '../services/interview'
import { toast } from 'sonner'



const recentInterviews = [
  { date: 'Jun 21, 2026', role: 'Software Engineer', type: 'Technical', score: 82, status: 'Completed' },
  { date: 'Jun 20, 2026', role: 'Product Manager', type: 'Behavioral', score: 88, status: 'Completed' },
  { date: 'Jun 18, 2026', role: 'Data Scientist', type: 'Case Study', score: 76, status: 'Completed' },
  { date: 'Jun 15, 2026', role: 'Frontend Developer', type: 'Coding', score: 90, status: 'Completed' },
  { date: 'Jun 12, 2026', role: 'Engineering Manager', type: 'System Design', score: 71, status: 'Completed' },
]

export default function Dashboard() {
  const [interviews, setInterviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState([
    { id: 1, label: 'Practice Frontend coding (30 min)', completed: true },
    { id: 2, label: 'Review System Design checklists', completed: true },
    { id: 3, label: 'Complete 1 Mock Interview session', completed: false },
    { id: 4, label: 'Analyze Reports feedback reports', completed: false }
  ])

  useEffect(() => {
    const loadInterviews = async () => {
      try {
        setLoading(true)
        const data = await interviewService.getInterviews()
        setInterviews(data)
      } catch (err: any) {
        console.error('Failed to load interviews:', err)
        toast.error('Failed to load recent interviews')
      } finally {
        setLoading(false)
      }
    }
    loadInterviews()
  }, [])

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const userJson = localStorage.getItem('user')
  const user = userJson ? JSON.parse(userJson) : { name: 'John Doe' }
  const firstName = user.name ? user.name.split(' ')[0] : 'User'

  const completedDbInterviews = interviews.filter((i) => i.status === 'COMPLETED' && i.report)
  const completedCount = completedDbInterviews.length
  
  // Calculate average score
  const totalScore = completedDbInterviews.reduce((acc, curr) => acc + (curr.report?.overallScore || 0), 0)
  const avgScore = completedCount > 0 ? Math.round(totalScore / completedCount) : null

  // Hiring Readiness
  let readiness = 'N/A'
  if (avgScore !== null) {
    readiness = avgScore >= 80 ? 'High' : avgScore >= 70 ? 'Medium' : 'Low'
  }

  const statsList = [
    {
      label: 'Interviews Completed',
      value: completedCount > 0 ? String(completedCount) : '24',
      subtitle: completedCount > 0 ? 'Real completed sessions' : '+3 this week',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-blue-500">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      bg: 'bg-blue-50/50 dark:bg-blue-950/15'
    },
    {
      label: 'Average Score',
      value: avgScore !== null ? `${avgScore}%` : '78%',
      subtitle: avgScore !== null ? 'Dynamic score average' : '+5% vs last month',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-emerald-500">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      bg: 'bg-emerald-50/50 dark:bg-emerald-950/15'
    },
    {
      label: 'Hiring Readiness',
      value: readiness !== 'N/A' ? readiness : 'High',
      subtitle: readiness !== 'N/A' ? 'Based on graded score' : 'Above target threshold',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-amber-500">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
      bg: 'bg-amber-50/50 dark:bg-amber-950/15'
    },
    {
      label: 'Study Streak',
      value: '5 Days',
      subtitle: 'Next milestone: 7 Days',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-orange-500">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      ),
      bg: 'bg-orange-50/50 dark:bg-orange-950/15'
    }
  ]

  const displayInterviews = completedCount > 0 
    ? completedDbInterviews.map((i) => ({
        id: i.id,
        date: new Date(i.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        role: i.role,
        type: i.interviewType,
        score: i.report?.overallScore || 0,
        status: 'Completed'
      }))
    : recentInterviews.map((i) => ({ ...i, id: null }))

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center text-text-primary">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-black dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-[14px] font-bold">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full select-none space-y-6">
      {/* Welcome Banner Card */}
      <div className="relative overflow-hidden rounded-[16px] bg-neutral-900 dark:bg-zinc-950 text-white p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border border-neutral-800 transition-colors">
        {/* Subtle grid accent background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-1.5 text-center md:text-left relative z-10">
          <h1 className="text-[23px] md:text-[25px] font-extrabold tracking-tight">Good morning, {firstName} 👋</h1>
          <p className="text-[13.5px] text-zinc-300 max-w-md leading-relaxed">
            You've completed 24 practice interviews with a high average score. Ready to run your next simulation?
          </p>
        </div>
        <Link
          to="/setup"
          className="relative z-10 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white dark:bg-white text-black font-bold text-[13px] hover:bg-neutral-100 transition-all cursor-pointer shrink-0 shadow-sm"
        >
          Start New Interview
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </Link>
      </div>

      {/* Stats Cards Grid - 4 Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsList.map((stat) => (
          <div
            key={stat.label}
            className="rounded-[16px] border border-border bg-surface p-5 hover:translate-y-[-2px] transition-all duration-200 shadow-2xs flex items-center justify-between"
          >
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">{stat.label}</div>
              <div className="text-[26px] font-extrabold text-text-primary tracking-tight leading-tight">
                {stat.value}
              </div>
              <div className="text-[11.5px] text-text-secondary font-medium">{stat.subtitle}</div>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.bg} flex-shrink-0`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Split Columns Content Area - Left 2, Right 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Span 2 Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Chart Card */}
          <div className="rounded-[16px] border border-border bg-surface p-5 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-[15px] font-bold text-text-primary">Performance Trend</h2>
                <p className="text-[12.5px] text-text-secondary">Recent mock interview score history</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-[12px] font-semibold text-text-secondary">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" />
                  Score %
                </span>
              </div>
            </div>
            
            {/* Custom SVG Line Chart */}
            <div className="w-full overflow-hidden">
              <svg className="w-full h-[180px] overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                
                {/* Horizontal Grid Lines */}
                <line x1="30" y1="20" x2="470" y2="20" stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="30" y1="60" x2="470" y2="60" stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="30" y1="100" x2="470" y2="100" stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="30" y1="140" x2="470" y2="140" stroke="var(--border)" strokeWidth="1.5" />

                {/* Score Labels on Y Axis */}
                <text x="12" y="24" className="text-[9px] fill-text-secondary font-bold text-right">100%</text>
                <text x="12" y="64" className="text-[9px] fill-text-secondary font-bold text-right">80%</text>
                <text x="12" y="104" className="text-[9px] fill-text-secondary font-bold text-right">60%</text>
                <text x="12" y="144" className="text-[9px] fill-text-secondary font-bold text-right">40%</text>
                
                {/* Area Gradient Fill */}
                <path 
                  d="M 40,140 L 40,78 C 90,59 90,40 140,40 C 190,40 190,68 240,68 C 290,68 290,44 340,44 C 390,44 390,56 440,56 L 440,140 Z" 
                  fill="url(#chartGradient)" 
                />
                
                {/* Smooth Bezier Line */}
                <path 
                  d="M 40,78 C 90,59 90,40 140,40 C 190,40 190,68 240,68 C 290,68 290,44 340,44 C 390,44 390,56 440,56" 
                  fill="none" 
                  stroke="#2563EB" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                />
                
                {/* Dots on Data Points */}
                {[
                  { x: 40, y: 78, val: '71%', label: 'Jun 12' },
                  { x: 140, y: 40, val: '90%', label: 'Jun 15' },
                  { x: 240, y: 68, val: '76%', label: 'Jun 18' },
                  { x: 340, y: 44, val: '88%', label: 'Jun 20' },
                  { x: 440, y: 56, val: '82%', label: 'Jun 21' }
                ].map((pt, i) => (
                  <g key={i} className="group/dot cursor-pointer">
                    <circle 
                      cx={pt.x} 
                      cy={pt.y} 
                      r="5" 
                      fill="var(--surface)" 
                      stroke="#2563EB" 
                      strokeWidth="3" 
                      className="transition-all group-hover/dot:r-7" 
                    />
                    <circle 
                      cx={pt.x} 
                      cy={pt.y} 
                      r="10" 
                      fill="transparent" 
                    />
                    {/* Tooltip Overlay */}
                    <g className="opacity-0 group-hover/dot:opacity-100 transition-opacity duration-150 pointer-events-none">
                      <rect 
                        x={pt.x - 22} 
                        y={pt.y - 30} 
                        width="44" 
                        height="20" 
                        rx="4" 
                        fill="var(--text-primary)" 
                        className="shadow-xs"
                      />
                      <text 
                        x={pt.x} 
                        y={pt.y - 16} 
                        className="text-[10px] font-extrabold fill-surface text-center" 
                        textAnchor="middle"
                      >
                        {pt.val}
                      </text>
                    </g>
                  </g>
                ))}

                {/* X Axis Labels */}
                <text x="40" y="158" className="text-[10px] fill-text-secondary font-bold" textAnchor="middle">Jun 12</text>
                <text x="140" y="158" className="text-[10px] fill-text-secondary font-bold" textAnchor="middle">Jun 15</text>
                <text x="240" y="158" className="text-[10px] fill-text-secondary font-bold" textAnchor="middle">Jun 18</text>
                <text x="340" y="158" className="text-[10px] fill-text-secondary font-bold" textAnchor="middle">Jun 20</text>
                <text x="440" y="158" className="text-[10px] fill-text-secondary font-bold" textAnchor="middle">Jun 21</text>
              </svg>
            </div>
          </div>

          {/* Table Container (Recent Interviews) */}
          <div className="rounded-[16px] border border-border bg-surface overflow-hidden transition-colors">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-text-primary">Recent Mock Interviews</h2>
              <span className="text-[12px] font-semibold text-text-secondary">Showing last 5</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-3 text-[12px] font-bold text-text-secondary uppercase tracking-wider">Date</th>
                    <th className="px-5 py-3 text-[12px] font-bold text-text-secondary uppercase tracking-wider">Role</th>
                    <th className="px-5 py-3 text-[12px] font-bold text-text-secondary uppercase tracking-wider">Type</th>
                    <th className="px-5 py-3 text-[12px] font-bold text-text-secondary uppercase tracking-wider">Score</th>
                    <th className="px-5 py-3 text-[12px] font-bold text-text-secondary uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {displayInterviews.map((row, i) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-[#FAFAF9] dark:hover:bg-zinc-900/30 transition-colors">
                      <td className="px-5 py-3.5 text-[13px] font-semibold text-text-secondary">{row.date}</td>
                      <td className="px-5 py-3.5 text-[13.5px] font-bold text-text-primary">{row.role}</td>
                      <td className="px-5 py-3.5 text-[13px] font-semibold text-text-secondary">{row.type}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[13.5px] font-bold ${row.score >= 80 ? 'text-success' : row.score >= 70 ? 'text-warning' : 'text-error'}`}>
                          {row.score}%
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-success-light text-success uppercase tracking-wider">
                          {row.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to={row.id ? `/report?interviewId=${row.id}` : "/report"}
                          className="text-[12.5px] font-bold text-accent hover:text-accent-hover transition-colors"
                        >
                          View Report
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Span 1 Widgets Area */}
        <div className="space-y-6">
          {/* Quick Start Card */}
          <div className="rounded-[16px] border border-border bg-surface p-5 transition-colors">
            <h2 className="text-[15px] font-bold text-text-primary mb-1">Quick Start</h2>
            <p className="text-[13px] text-text-secondary mb-5">
              Launch a simulation in seconds.
            </p>

            <div className="space-y-3.5">
              <div>
                <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">Select Role</label>
                <select className="w-full mt-1.5 rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[13.5px] text-text-primary focus:outline-none focus:border-black dark:focus:border-white transition-colors cursor-pointer">
                  <option>Software Engineer</option>
                  <option>Product Manager</option>
                  <option>Data Scientist</option>
                  <option>Frontend Developer</option>
                </select>
              </div>

              <Link
                to="/setup"
                className="block w-full text-center py-2.5 rounded-[10px] bg-black dark:bg-white text-white dark:text-black text-[13px] font-bold hover:bg-neutral-850 dark:hover:bg-neutral-100 transition-colors cursor-pointer shadow-2xs"
              >
                Start Simulation
              </Link>
            </div>
          </div>

          {/* AI Prep Coach Advice Card */}
          <div className="rounded-[16px] border border-border bg-surface p-5 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 dark:bg-amber-500/3 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="text-[15px] font-bold text-text-primary">AI Coach Insights</h2>
            </div>
            <p className="text-[12.5px] text-text-secondary leading-relaxed">
              Based on your latest Software Engineer session:
            </p>
            <ul className="mt-3 space-y-2.5">
              <li className="text-[12px] text-text-secondary flex gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>Your communication was 85%. Discuss architectural trade-offs explicitly in system design questions.</span>
              </li>
              <li className="text-[12px] text-text-secondary flex gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>Try to practice 1-2 coding round simulations this week to improve your debugging speed.</span>
              </li>
            </ul>
          </div>

          {/* Goals / Daily Task Checklist */}
          <div className="rounded-[16px] border border-border bg-surface p-5 transition-colors">
            <h2 className="text-[15px] font-bold text-text-primary mb-1">Weekly Goals</h2>
            <p className="text-[12.5px] text-text-secondary mb-4">Complete daily tasks to stay prepared.</p>

            <div className="space-y-3">
              {tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="w-full flex items-center gap-3 text-left focus:outline-none cursor-pointer group"
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                    task.completed
                      ? 'bg-black dark:bg-white border-black dark:border-white text-white dark:text-black'
                      : 'border-border bg-surface group-hover:border-neutral-400 dark:group-hover:border-neutral-600'
                  }`}>
                    {task.completed && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-[12.5px] font-semibold leading-tight transition-all ${
                    task.completed 
                      ? 'text-text-secondary line-through font-medium opacity-80' 
                      : 'text-text-primary group-hover:text-black dark:group-hover:text-white'
                  }`}>
                    {task.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
