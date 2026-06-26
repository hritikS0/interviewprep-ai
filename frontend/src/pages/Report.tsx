import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { interviewService } from '../services/interview'
import { toast } from 'sonner'

export default function Report() {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const interviewId = queryParams.get('interviewId')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [interview, setInterview] = useState<any>(null)
  const [report, setReport] = useState<any>(null)
  const [allInterviews, setAllInterviews] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError('')
        if (interviewId) {
          const data = await interviewService.getInterviewById(interviewId)
          setInterview(data)
          if (data.report) {
            setReport(data.report)
          } else {
            setError('No evaluation report is generated for this interview yet.')
          }
        } else {
          const data = await interviewService.getInterviews()
          setAllInterviews(data)
        }
      } catch (err: any) {
        console.error('Failed to load data:', err)
        setError(err.message || 'Failed to load data')
        toast.error('Failed to load reports')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [interviewId])

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center text-text-primary">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-black dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-[14px] font-bold">Loading reports...</span>
        </div>
      </div>
    )
  }

  // Listing View: No interviewId provided
  if (!interviewId) {
    const completedReports = allInterviews.filter((i) => i.status === 'COMPLETED' && i.report)

    if (completedReports.length === 0) {
      return (
        <div className="max-w-[1040px] mx-auto select-none space-y-6">
          <div>
            <h1 className="text-[28px] font-extrabold tracking-tight text-text-primary mb-1">
              Interview Reports
            </h1>
            <p className="text-[14px] text-text-secondary font-medium">Browse and review all your previously completed mock interview sessions.</p>
          </div>
          
          <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-[16px] bg-surface text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/20 text-blue-500 flex items-center justify-center mx-auto">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-[16px] font-bold text-text-primary">No reports generated yet</h3>
              <p className="text-[13px] text-text-secondary max-w-sm leading-relaxed">
                You haven't completed any mock interviews yet. Once you complete an interview, your personalized AI report will be listed here.
              </p>
            </div>
            <Link
              to="/setup"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-[13px] hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all cursor-pointer shadow-sm"
            >
              Start Your First Interview
            </Link>
          </div>
        </div>
      )
    }

    return (
      <div className="max-w-[1040px] mx-auto select-none space-y-6">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-text-primary mb-1">
            Interview Reports
          </h1>
          <p className="text-[14px] text-text-secondary font-medium">Browse and review all your previously completed mock interview sessions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {completedReports.map((item) => {
            const score = item.report?.overallScore ?? 0
            const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
            return (
              <Link
                key={item.id}
                to={`/report?interviewId=${item.id}`}
                className="group flex flex-col justify-between p-5 rounded-[16px] border border-border bg-surface hover:translate-y-[-2px] transition-all duration-200 shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="text-[11px] font-bold text-text-secondary bg-[#F3F4F6] dark:bg-[#27272A] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {item.interviewType}
                    </span>
                    <div className="flex items-center gap-1.5 text-right">
                      <span className={`text-[20px] font-extrabold ${score >= 80 ? 'text-success' : score >= 70 ? 'text-warning' : 'text-error'}`}>
                        {score}
                      </span>
                      <span className="text-[11px] font-bold text-text-secondary uppercase">Score</span>
                    </div>
                  </div>
                  <h3 className="text-[16px] font-bold text-text-primary group-hover:text-accent transition-colors leading-snug">
                    {item.role}
                  </h3>
                  <p className="text-[12.5px] text-text-secondary font-medium mt-1">
                    Level: {item.experienceLevel} · Difficulty: {item.difficulty}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-4 mt-5">
                  <span className="text-[12px] text-text-secondary font-semibold">{dateStr}</span>
                  <div className="flex items-center gap-1 text-[13px] font-bold text-accent group-hover:translate-x-0.5 transition-transform">
                    View Report
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    )
  }

  // Detail view (existing report UI)
  if (error || !report) {
    return (
      <div className="flex h-[400px] items-center justify-center p-6 text-text-primary">
        <div className="text-center max-w-md border border-border bg-surface p-8 rounded-[16px] shadow-xs">
          <h2 className="text-[20px] font-bold text-red-600 mb-2">Failed to Load Report</h2>
          <p className="text-[14px] text-text-secondary mb-6">{error || 'Report could not be retrieved.'}</p>
          <Link to="/report" className="px-6 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-[13px] hover:opacity-90 transition-opacity">
            Back to All Reports
          </Link>
        </div>
      </div>
    )
  }

  const strengths = report.strengths || []
  const improvements = report.improvements || []
  const skills = report.skills || []
  const roadmap = report.roadmap || []
  const overallScore = report.overallScore || 0
  const formattedDate = interview ? new Date(interview.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : ''

  return (
    <div className="max-w-[1040px] mx-auto select-none space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/report"
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-text-secondary hover:text-text-primary transition-colors mb-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rotate-180">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
          Back to all reports
        </Link>
      </div>

      {/* Header section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-text-primary mb-1">
            Interview Report
          </h1>
          <p className="text-[14px] text-text-secondary font-medium">
            {interview.role} · {formattedDate}
          </p>
        </div>
        <div className="text-right">
          <div className="text-[64px] font-extrabold tracking-tighter text-text-primary leading-none">
            {overallScore}
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
            {strengths.map((s: any) => (
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
            {improvements.map((imp: any) => (
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
            {skills.map((skill: any) => (
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
              <span className="text-[12.5px] font-semibold text-text-secondary">{skills.length} skills evaluated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap Container */}
      <div className="rounded-[16px] border border-border bg-surface p-6 transition-colors">
        <h2 className="text-[15px] font-bold text-text-primary mb-5">Improvement Roadmap</h2>
        <div className="space-y-0">
          {roadmap.map((item: any, i: number) => (
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
