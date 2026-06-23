import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface">
      <header className="max-w-[1280px] mx-auto px-10 py-5 flex items-center justify-between">
        <span className="text-[19px] font-semibold text-text-primary tracking-[-0.3px]">
          InterviewAI
        </span>
        <Link
          to="/dashboard"
          className="text-[14px] font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          Sign In
        </Link>
      </header>

      <section className="max-w-[1280px] mx-auto px-10">
        <div className="flex items-center gap-16 min-h-[calc(100vh-140px)] py-12">
          <div className="flex-1 max-w-[580px]">
            <h1 className="text-[64px] leading-[1.08] font-semibold tracking-[-1.8px] text-text-primary mb-6">
              Practice interviews that feel real.
            </h1>
            <p className="text-[18px] leading-relaxed text-text-secondary mb-10 max-w-[460px]">
              Prepare for technical, coding, and behavioral interviews with adaptive AI
              interviewers that feel like the real thing.
            </p>
            <div className="flex items-center gap-3">
              <Link
                to="/setup"
                className="inline-flex items-center px-6 py-3 rounded-[12px] bg-accent text-white text-[15px] font-medium hover:bg-accent-hover transition-colors"
              >
                Start Interview
              </Link>
              <Link
                to="/report"
                className="inline-flex items-center px-6 py-3 rounded-[12px] border border-border text-text-primary text-[15px] font-medium hover:bg-[#F9FAFB] transition-colors"
              >
                View Sample Report
              </Link>
            </div>
          </div>

          <div className="flex-1 max-w-[560px]">
            <div className="rounded-[16px] border border-border bg-surface p-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[14px] font-semibold text-text-primary">Recent Interviews</span>
                <span className="text-[12px] font-medium text-text-secondary bg-[#F3F4F6] px-2.5 py-1 rounded-full">This week</span>
              </div>
              <div className="space-y-3">
                {[
                  { role: 'Software Engineer', type: 'Technical', score: 82, date: 'Today' },
                  { role: 'Product Manager', type: 'Behavioral', score: 88, date: 'Yesterday' },
                  { role: 'Data Scientist', type: 'Case Study', score: 76, date: '2 days ago' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-3 px-4 rounded-[10px] border border-border hover:bg-[#F9FAFB] transition-colors"
                  >
                    <div>
                      <div className="text-[14px] font-medium text-text-primary">{item.role}</div>
                      <div className="text-[13px] text-text-secondary">{item.type}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`text-[15px] font-semibold ${item.score >= 80 ? 'text-success' : item.score >= 70 ? 'text-warning' : 'text-error'}`}>
                          {item.score}
                        </div>
                        <div className="text-[12px] text-text-secondary">score</div>
                      </div>
                      <div className="text-[13px] text-text-secondary min-w-[70px] text-right">{item.date}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-center justify-between text-[13px] text-text-secondary">
                  <span>Overall readiness</span>
                  <span className="font-semibold text-text-primary">Ready</span>
                </div>
                <div className="mt-2 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                  <div className="h-full bg-success rounded-full" style={{ width: '82%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
