import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

function useFadeIn() {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, isVisible }
}

function FadeSection({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const { ref, isVisible } = useFadeIn()
  return (
    <div
      ref={ref}
      className={`${isVisible ? 'animate-fade-in-up' : 'opacity-0'} ${className}`}
      style={isVisible ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <a
      href={to}
      className="text-[14px] font-medium text-text-secondary hover:text-text-primary transition-colors duration-200"
    >
      {children}
    </a>
  )
}

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* ---- Navigation ---- */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-surface/80 backdrop-blur-xl border-b border-border'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-8 h-[56px] flex items-center justify-between">
          <Link to="/" className="text-[17px] font-semibold tracking-[-0.3px] text-text-primary transition-opacity duration-200 hover:opacity-80">
            InterviewAI
          </Link>
          <div className="flex items-center gap-8">
            <NavLink to="#features">Features</NavLink>
            <NavLink to="#why">About</NavLink>
            <NavLink to="#cta">Pricing</NavLink>
            <Link
              to="/login"
              className="text-[14px] font-medium text-text-secondary hover:text-text-primary transition-colors duration-200"
            >
              Login
            </Link>
            <Link
              to="/setup"
              className="inline-flex items-center px-4 py-2 rounded-[12px] bg-accent text-white text-[14px] font-medium hover:bg-accent-hover hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
            >
              Start Interview
            </Link>
          </div>
        </div>
      </nav>

      {/* ---- Hero ---- */}
      <section className="max-w-[1200px] mx-auto px-8 pt-[120px] pb-24">
        <div className="flex items-center gap-16">
          <div className="flex-1 max-w-[540px] animate-fade-in-up">
            <h1 className="text-[66px] leading-[1.06] font-semibold tracking-[-2px] text-text-primary mb-6">
              Practice interviews that actually feel real.
            </h1>
            <p className="text-[18px] leading-relaxed text-text-secondary mb-10 max-w-[460px]">
              Prepare for technical, coding, and behavioral interviews through adaptive AI
              conversations designed to simulate real hiring processes.
            </p>
            <div className="flex items-center gap-3">
              <Link
                to="/setup"
                className="inline-flex items-center px-6 py-3 rounded-[12px] bg-accent text-white text-[15px] font-medium hover:bg-accent-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Start Free Interview
              </Link>
              <a
                href="#product-preview"
                className="inline-flex items-center px-6 py-3 rounded-[12px] border border-border text-text-primary text-[15px] font-medium hover:bg-[#F5F5F2] hover:border-[#D1D5DB] transition-all duration-200"
              >
                View Demo
              </a>
            </div>
          </div>

          {/* Hero preview card */}
          <div className="flex-1 max-w-[520px] animate-scale-in" style={{ animationDelay: '150ms' }}>
            <div className="rounded-[16px] border border-border bg-surface p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow duration-300">
              <div className="flex items-center justify-between mb-5">
                <span className="text-[13px] font-semibold text-text-primary">Interview in Progress</span>
                <span className="text-[12px] font-medium text-text-secondary bg-[#F3F4F6] px-2.5 py-1 rounded-full animate-pulse">Live</span>
              </div>

              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-medium text-text-secondary">Progress</span>
                  <span className="text-[12px] font-semibold text-text-primary">6 / 10</span>
                </div>
                <div className="flex gap-1.5">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                        i < 6 ? 'bg-accent' : 'bg-[#E5E7EB]'
                      }`}
                      style={{ transitionDelay: `${i * 80}ms` }}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-[10px] bg-[#F9FAFB] p-4 mb-4">
                <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Question 5</span>
                <p className="text-[14px] font-medium text-text-primary mt-1.5 leading-snug">
                  Explain the key differences between REST and GraphQL. When would you choose one over the other?
                </p>
              </div>

              <div className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span className="font-medium">12:45</span>
                  </div>
                  <span className="text-border">|</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-text-secondary font-medium">Round</span>
                    <span className="font-semibold text-text-primary">2 of 5</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-text-secondary font-medium">Score</span>
                  <span className="text-[15px] font-semibold text-success">85</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border flex items-center gap-3">
                {['Technical', 'Coding', 'Behavioral'].map((label) => (
                  <span
                    key={label}
                    className="text-[11px] font-medium text-text-secondary bg-[#F3F4F6] px-2.5 py-1 rounded-full"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Social Proof ---- */}
      <FadeSection>
        <section className="max-w-[1200px] mx-auto px-8 pb-32 pt-8">
          <p className="text-center text-[14px] font-medium text-text-secondary mb-8">
            Trusted by aspiring engineers preparing for interviews at
          </p>
          <div className="flex items-center justify-center gap-16">
            {[
              { name: 'Google', className: 'text-[22px] font-[450] tracking-[-0.5px]' },
              { name: 'Microsoft', className: 'text-[22px] font-[500] tracking-[-0.3px]' },
              { name: 'Amazon', className: 'text-[22px] font-[600] tracking-[-0.2px]' },
              { name: 'Meta', className: 'text-[22px] font-[600] tracking-[-0.4px]' },
              { name: 'Adobe', className: 'text-[22px] font-[500] tracking-[-0.3px]' },
            ].map((company, i) => (
              <span
                key={company.name}
                className={`text-[#9CA3AF] select-none transition-all duration-300 hover:text-[#6B7280] ${company.className}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                {company.name}
              </span>
            ))}
          </div>
        </section>
      </FadeSection>

      {/* ---- Features ---- */}
      <section id="features" className="max-w-[1200px] mx-auto px-8 pb-32 scroll-mt-24">
        <FadeSection>
          <div className="text-center mb-16">
            <h2 className="text-[42px] leading-[1.15] font-semibold tracking-[-1.2px] text-text-primary mb-4">
              Everything you need to prepare
            </h2>
            <p className="text-[18px] text-text-secondary max-w-[480px] mx-auto">
              Purpose-built tools designed to simulate every aspect of the modern technical interview.
            </p>
          </div>
        </FadeSection>

        <div className="grid grid-cols-3 gap-6">
          {[
            {
              title: 'Adaptive Interviews',
              description:
                'Questions adjust in real-time based on your responses, just like a real interviewer would.',
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                  <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
                  <path d="M12 2a10 10 0 0 0-10 10h10V2z" />
                  <path d="M12 22a10 10 0 0 0 10-10H12v10z" />
                  <path d="M12 22A10 10 0 0 1 2 12h10v10z" />
                </svg>
              ),
            },
            {
              title: 'Coding Assessments',
              description:
                'Solve real-world problems in a live code editor with instant execution and test validation.',
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              ),
            },
            {
              title: 'Personalized Feedback',
              description:
                'Get detailed performance reports with scores, strengths, weaknesses, and a clear improvement roadmap.',
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              ),
            },
          ].map((feature, i) => (
            <FadeSection key={feature.title} delay={i * 100}>
              <div className="rounded-[16px] border border-border bg-surface p-8 hover:border-[#D1D5DB] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:-translate-y-[2px] transition-all duration-300">
                <div className="w-10 h-10 rounded-[10px] bg-[#F3F4F6] flex items-center justify-center mb-5 transition-colors duration-200 group-hover:bg-[#EBF0FF]">
                  {feature.icon}
                </div>
                <h3 className="text-[17px] font-semibold text-text-primary mb-2">{feature.title}</h3>
                <p className="text-[14px] leading-relaxed text-text-secondary">{feature.description}</p>
              </div>
            </FadeSection>
          ))}
        </div>
      </section>

      {/* ---- Product Preview ---- */}
      <FadeSection>
        <section id="product-preview" className="scroll-mt-24 pb-32">
          <div className="bg-[#F5F5F2] py-20">
            <div className="max-w-[1200px] mx-auto px-8">
              <div className="text-center mb-14">
                <h2 className="text-[42px] leading-[1.15] font-semibold tracking-[-1.2px] text-text-primary mb-4">
                  A better way to practice
                </h2>
                <p className="text-[18px] text-text-secondary max-w-[480px] mx-auto">
                  Everything you need in one clean interface. No clutter, no distractions.
                </p>
              </div>

              <div className="rounded-[20px] border border-border bg-surface overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-shadow duration-300">
                {/* Top bar */}
                <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-[#FAFAFA]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#E5E7EB] transition-colors duration-200 hover:bg-[#F87171]" />
                    <div className="w-3 h-3 rounded-full bg-[#E5E7EB] transition-colors duration-200 hover:bg-[#FBBF24]" />
                    <div className="w-3 h-3 rounded-full bg-[#E5E7EB] transition-colors duration-200 hover:bg-[#34D399]" />
                  </div>
                  <span className="text-[12px] font-medium text-text-secondary ml-3">Interview Dashboard</span>
                </div>

                {/* Dashboard body */}
                <div className="flex min-h-[480px]">
                  {/* Sidebar */}
                  <div className="w-[180px] border-r border-border bg-[#FAFAFA] p-4 flex flex-col gap-0.5">
                    {[
                      { label: 'Home', active: false },
                      { label: 'Interviews', active: true },
                      { label: 'Reports', active: false },
                      { label: 'Jobs', active: false },
                      { label: 'Settings', active: false },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`px-3 py-2 rounded-[8px] text-[13px] font-medium cursor-default transition-all duration-200 ${
                          item.active
                            ? 'bg-white text-text-primary shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                            : 'text-text-secondary hover:text-text-primary hover:bg-white/50'
                        }`}
                      >
                        {item.label}
                      </div>
                    ))}
                  </div>

                  {/* Main content */}
                  <div className="flex-1 p-6 flex gap-5">
                    {/* Timeline */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[14px] font-semibold text-text-primary">Interview Timeline</h3>
                        <span className="text-[11px] font-medium text-text-secondary bg-[#F3F4F6] px-2 py-0.5 rounded-full">Last 7 days</span>
                      </div>
                      <div className="space-y-2.5">
                        {[
                          { role: 'Software Engineer', type: 'Technical', score: 85, time: '2h ago', color: 'text-success' },
                          { role: 'Frontend Developer', type: 'Coding', score: 78, time: 'Yesterday', color: 'text-warning' },
                          { role: 'Engineering Manager', type: 'System Design', score: 92, time: '2 days ago', color: 'text-success' },
                          { role: 'Product Manager', type: 'Behavioral', score: 88, time: '3 days ago', color: 'text-success' },
                        ].map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] border border-border hover:bg-[#F9FAFB] hover:border-[#D1D5DB] hover:translate-x-1 transition-all duration-200"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] font-medium text-text-primary truncate">{item.role}</div>
                              <div className="text-[12px] text-text-secondary">{item.type}</div>
                            </div>
                            <span className={`text-[14px] font-semibold ${item.color}`}>{item.score}</span>
                            <span className="text-[12px] text-text-secondary w-16 text-right">{item.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Question panel */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[14px] font-semibold text-text-primary">Active Question</h3>
                        <span className="text-[11px] font-medium text-accent bg-accent-light px-2 py-0.5 rounded-full">Technical</span>
                      </div>
                      <div className="rounded-[12px] border border-border bg-[#F9FAFB] p-4 mb-4 hover:border-[#D1D5DB] transition-colors duration-200">
                        <p className="text-[13px] leading-relaxed text-text-primary">
                          Design a URL shortening service like bit.ly. Discuss the system architecture,
                          database schema, and how you would handle high traffic.
                        </p>
                      </div>
                      <div className="text-[12px] font-medium text-text-secondary flex items-center gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        Time remaining: 14:30
                      </div>
                    </div>

                    {/* Score widgets */}
                    <div className="w-[180px] space-y-3">
                      <h3 className="text-[14px] font-semibold text-text-primary mb-4">Scores</h3>
                      {[
                        { label: 'Overall', value: 82, color: 'bg-accent' },
                        { label: 'Technical', value: 85, color: 'bg-accent' },
                        { label: 'Coding', value: 78, color: 'bg-warning' },
                        { label: 'Communication', value: 90, color: 'bg-success' },
                      ].map((score) => (
                        <div key={score.label} className="group">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[12px] font-medium text-text-secondary group-hover:text-text-primary transition-colors duration-200">{score.label}</span>
                            <span className="text-[13px] font-semibold text-text-primary">{score.value}%</span>
                          </div>
                          <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${score.color} transition-all duration-700 ease-out`}
                              style={{ width: `${score.value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeSection>

      {/* ---- Why InterviewAI ---- */}
      <section id="why" className="max-w-[1200px] mx-auto px-8 pb-32 scroll-mt-24">
        <div className="grid grid-cols-2 gap-20 items-center">
          <FadeSection>
            <h2 className="text-[42px] leading-[1.15] font-semibold tracking-[-1.2px] text-text-primary mb-6">
              Why engineers choose InterviewAI
            </h2>
            <p className="text-[16px] leading-relaxed text-text-secondary max-w-[420px]">
              Most interview prep tools feel like toys. InterviewAI is built for professionals
              who want realistic practice that mirrors actual hiring pipelines at top tech companies.
            </p>
          </FadeSection>

          <div className="space-y-3">
            {[
              { label: 'AI Follow-up Questions', desc: 'The AI asks contextual follow-ups based on your answers.' },
              { label: 'Real Coding Challenges', desc: 'Write, run, and test code in a full in-browser editor.' },
              { label: 'Instant Evaluation', desc: 'Get scores and feedback immediately after each session.' },
              { label: 'Performance Reports', desc: 'Track progress over time with detailed analytics and trends.' },
            ].map((benefit, i) => (
              <FadeSection key={i} delay={i * 100}>
                <div className="flex gap-4 p-4 rounded-[12px] border border-border hover:border-[#D1D5DB] hover:shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:translate-x-1 transition-all duration-300">
                  <div className="w-5 h-5 rounded-full bg-[#F3F4F6] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-accent">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-[14px] font-semibold text-text-primary mb-0.5">{benefit.label}</h4>
                    <p className="text-[13px] text-text-secondary leading-relaxed">{benefit.desc}</p>
                  </div>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Report Preview ---- */}
      <FadeSection>
        <section className="max-w-[1200px] mx-auto px-8 pb-32">
          <div className="text-center mb-14">
            <h2 className="text-[42px] leading-[1.15] font-semibold tracking-[-1.2px] text-text-primary mb-4">
              Detailed reports you can share
            </h2>
            <p className="text-[18px] text-text-secondary max-w-[480px] mx-auto">
              Every interview generates a comprehensive performance report designed to highlight what matters.
            </p>
          </div>

          <div className="rounded-[20px] border border-border bg-surface p-8 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-shadow duration-300">
            <div className="grid grid-cols-3 gap-10">
              {/* Left: Scores */}
              <div>
                <div className="mb-8">
                  <span className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Software Engineer Report</span>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-[56px] font-semibold tracking-[-2px] text-text-primary leading-none transition-all duration-300">85</span>
                    <span className="text-[18px] text-text-secondary">/ 100</span>
                  </div>
                  <span className="inline-block mt-2 text-[13px] font-semibold text-success bg-success-light px-2.5 py-0.5 rounded-full">Ready to interview</span>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Technical', score: 88 },
                    { label: 'Coding', score: 82 },
                    { label: 'Communication', score: 90 },
                  ].map((s) => (
                    <div key={s.label} className="group">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[13px] font-medium text-text-secondary group-hover:text-text-primary transition-colors duration-200">{s.label}</span>
                        <span className="text-[14px] font-semibold text-text-primary">{s.score}%</span>
                      </div>
                      <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full transition-all duration-700 ease-out" style={{ width: `${s.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <span className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Hiring Readiness</span>
                  <div className="mt-2.5 flex items-center gap-3">
                    <div className="h-1.5 flex-1 bg-[#F3F4F6] rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full transition-all duration-700 ease-out" style={{ width: '82%' }} />
                    </div>
                    <span className="text-[14px] font-semibold text-text-primary">82%</span>
                  </div>
                </div>
              </div>

              {/* Center: Radar Chart */}
              <div className="flex items-center justify-center">
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <defs>
                    <linearGradient id="radarGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  {[40, 70, 95].map((r) => (
                    <polygon
                      key={r}
                      points={getRadarPoints(100, 100, r, 5)}
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="1"
                    />
                  ))}
                  {['Technical', 'Coding', 'Communication', 'System Design', 'Behavioral'].map((label, i) => {
                    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2
                    const x = 100 + 105 * Math.cos(angle)
                    const y = 100 + 105 * Math.sin(angle)
                    return (
                      <text
                        key={i}
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-text-secondary"
                        style={{ fontSize: '10px', fontWeight: 500 }}
                      >
                        {label}
                      </text>
                    )
                  })}
                  <polygon
                    points={getRadarPoints(100, 100, 60, 5, [0.88, 0.82, 0.90, 0.76, 0.85])}
                    fill="url(#radarGrad)"
                    stroke="#2563EB"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  {[0.88, 0.82, 0.90, 0.76, 0.85].map((val, i) => {
                    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2
                    const r = val * 80
                    const x = 100 + r * Math.cos(angle)
                    const y = 100 + r * Math.sin(angle)
                    return (
                      <circle key={i} cx={x} cy={y} r="4" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
                    )
                  })}
                </svg>
              </div>

              {/* Right: Improvement */}
              <div>
                <h4 className="text-[15px] font-semibold text-text-primary mb-5">Improvement Roadmap</h4>
                <div className="space-y-4">
                  {[
                    { label: 'System Design', desc: 'Practice distributed systems patterns' },
                    { label: 'API Design', desc: 'Focus on RESTful conventions and versioning' },
                    { label: 'Scalability', desc: 'Study caching strategies and load balancing' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3 group hover:translate-x-1 transition-transform duration-200">
                      <div className="w-6 h-6 rounded-full border-2 border-[#D1D5DB] group-hover:border-accent flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors duration-200">
                        <span className="text-[12px] font-semibold text-text-secondary group-hover:text-accent transition-colors duration-200">{i + 1}</span>
                      </div>
                      <div>
                        <div className="text-[14px] font-medium text-text-primary">{item.label}</div>
                        <div className="text-[13px] text-text-secondary">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeSection>

      {/* ---- CTA ---- */}
      <FadeSection>
        <section id="cta" className="max-w-[1200px] mx-auto px-8 pb-32 scroll-mt-24">
          <div className="text-center max-w-[560px] mx-auto">
            <h2 className="text-[48px] leading-[1.1] font-semibold tracking-[-1.5px] text-text-primary mb-5">
              Ready for your next interview?
            </h2>
            <p className="text-[18px] leading-relaxed text-text-secondary mb-10">
              Practice with confidence before the real interview. Start in seconds, no setup required.
            </p>
            <Link
              to="/setup"
              className="inline-flex items-center px-8 py-3.5 rounded-[12px] bg-accent text-white text-[16px] font-medium hover:bg-accent-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Start Your First Interview
            </Link>
          </div>
        </section>
      </FadeSection>

      {/* ---- Footer ---- */}
      <footer className="border-t border-border">
        <div className="max-w-[1200px] mx-auto px-8 py-12">
          <div className="flex items-center justify-between mb-10">
            <Link to="/" className="text-[17px] font-semibold tracking-[-0.3px] text-text-primary transition-opacity duration-200 hover:opacity-80">
              InterviewAI
            </Link>
            <div className="flex items-center gap-8">
              <NavLink to="#features">Features</NavLink>
              <NavLink to="#why">About</NavLink>
              <NavLink to="#cta">Pricing</NavLink>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[14px] font-medium text-text-secondary hover:text-text-primary transition-colors duration-200 inline-flex items-center gap-1.5"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
                GitHub
              </a>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-border">
            <span className="text-[13px] text-text-secondary">
              &copy; {new Date().getFullYear()} InterviewAI. All rights reserved.
            </span>
            <div className="flex items-center gap-6">
              <span className="text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors duration-200 cursor-pointer">
                Privacy
              </span>
              <span className="text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors duration-200 cursor-pointer">
                Terms
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function getRadarPoints(
  cx: number,
  cy: number,
  radius: number,
  sides: number,
  values?: number[]
): string {
  return Array.from({ length: sides })
    .map((_, i) => {
      const angle = (Math.PI * 2 * i) / sides - Math.PI / 2
      const r = values ? values[i] * radius : radius
      const x = cx + r * Math.cos(angle)
      const y = cy + r * Math.sin(angle)
      return `${x},${y}`
    })
    .join(' ')
}
