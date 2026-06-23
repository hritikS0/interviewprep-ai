import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sidebar } from '../components/Layout'

const sections = [
  { id: 'intro', title: 'Introduction', questionsCount: 1, status: 'completed' },
  { id: 'tech', title: 'Technical Fundamentals', questionsCount: 4, status: 'completed' },
  { id: 'sysdesign', title: 'System Design', questionsCount: 3, status: 'current' },
  { id: 'behavioral', title: 'Behavioral', questionsCount: 3, status: 'upcoming' },
  { id: 'wrapup', title: 'Wrap-up', questionsCount: 1, status: 'upcoming' }
]

export default function LiveInterview() {
  const [answer, setAnswer] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [timeStr, setTimeStr] = useState('18:42')
  
  const navigate = useNavigate()

  // Live ticking clock for top-right (e.g. 18:42 format)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hrs = String(now.getHours()).padStart(2, '0')
      const mins = String(now.getMinutes()).padStart(2, '0')
      setTimeStr(`${hrs}:${mins}`)
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  // Simulating voice recording typing effect
  useEffect(() => {
    if (!isRecording) return
    
    const mockSpeechText = "To design a real-time collaborative document editor like Notion, we should evaluate Conflict-free Replicated Data Types (CRDTs) versus Operational Transformation (OT) for concurrency. CRDTs are generally preferred for offline-first and decentralized topologies. We can represent the document as an ordered tree structure of blocks..."
    let index = 0
    
    // Clear answer first for demonstration
    setAnswer('')
    
    const textInterval = setInterval(() => {
      if (index < mockSpeechText.length) {
        setAnswer(prev => prev + mockSpeechText[index])
        index++
      } else {
        setIsRecording(false)
      }
    }, 45)

    return () => clearInterval(textInterval)
  }, [isRecording])

  const handleSubmit = () => {
    alert("Answer submitted successfully! Moving to interview summary.")
    navigate('/dashboard')
  }

  return (
    <div className="flex h-screen bg-[#FAFAF9] dark:bg-[#09090B] overflow-hidden select-none font-sans transition-colors duration-200">
      {/* Global Sidebar Navigation */}
      <Sidebar />

      {/* Main Layout Area */}
      <div className="flex-1 ml-60 flex flex-col h-full bg-background transition-colors duration-200">
        {/* Top Header Bar */}
        <header className="h-[56px] border-b border-border bg-surface flex items-center justify-between px-6 flex-shrink-0 transition-colors duration-200">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            <span className="text-[13px] font-bold text-text-primary">Live Interview</span>
            <span className="text-[13px] text-text-secondary">• Senior Frontend Engineer</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[13px] font-bold text-text-primary tracking-wide">
              {timeStr}
            </span>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1 text-[13px] font-bold text-text-secondary hover:text-text-primary transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              End
            </Link>
          </div>
        </header>

        {/* Tripartite Workspace */}
        <div className="flex-1 flex overflow-hidden">
          {/* Column 1: Progress (Left) */}
          <div className="w-[240px] border-r border-border bg-surface flex flex-col justify-between p-5 flex-shrink-0 transition-colors duration-200">
            <div className="space-y-5">
              <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">PROGRESS</div>
              <div className="space-y-3.5">
                {sections.map((sec) => (
                  <div
                    key={sec.id}
                    className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${
                      sec.status === 'current' ? 'bg-[#F3F4F6] dark:bg-[#27272A]' : ''
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {sec.status === 'completed' ? (
                        <div className="w-[18px] h-[18px] rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      ) : sec.status === 'current' ? (
                        <div className="w-[18px] h-[18px] rounded-full border-2 border-black dark:border-white bg-white dark:bg-[#18181B]" />
                      ) : (
                        <div className="w-[18px] h-[18px] rounded-full border-2 border-border bg-white dark:bg-[#18181B]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className={`text-[13px] leading-tight ${sec.status === 'current' ? 'font-bold text-text-primary' : 'text-text-secondary font-semibold'}`}>
                        {sec.title}
                      </div>
                      <div className="text-[11px] text-text-secondary mt-0.5 font-medium">{sec.questionsCount} questions</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Overall Progress Tracker */}
            <div className="border-t border-border pt-4">
              <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">OVERALL</div>
              <div className="text-[13.5px] font-bold text-text-primary mb-2">5 / 12 questions</div>
              <div className="w-full h-1 bg-[#F3F4F6] dark:bg-[#27272A] rounded-full overflow-hidden">
                <div className="h-full bg-black dark:bg-white rounded-full transition-all duration-300" style={{ width: `${(5 / 12) * 100}%` }} />
              </div>
            </div>
          </div>

          {/* Column 2: Question (Center) */}
          <div className="flex-1 border-r border-border bg-surface flex flex-col overflow-y-auto px-10 py-8 transition-colors duration-200">
            <div className="max-w-[620px] w-full">
              <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-4">
                QUESTION 8 OF 12 • SYSTEM DESIGN
              </div>
              <h2 className="text-[25px] font-extrabold text-text-primary leading-snug tracking-[-0.5px]">
                Design a real-time collaborative document editor like Notion. Walk me through the data model, sync strategy, and how you'd handle conflict resolution at scale.
              </h2>

              {/* Difficulty and Time tags */}
              <div className="flex flex-wrap gap-2.5 mt-5 mb-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-neutral-50/50 dark:bg-neutral-800/30 text-[12px] font-bold text-text-secondary transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Medium difficulty
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-neutral-50/50 dark:bg-neutral-800/30 text-[12px] font-bold text-text-secondary transition-colors">
                  Suggested time: 12 minutes
                </div>
              </div>

              <div className="border-t border-border my-8" />

              {/* Hints */}
              <div className="space-y-4">
                <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">HINTS</div>
                <ul className="space-y-2.5 text-[13px] text-text-secondary font-semibold leading-relaxed">
                  <li className="flex items-start">
                    <span className="mr-2 text-text-secondary font-bold">•</span>
                    <span>Consider CRDTs vs operational transforms.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-text-secondary font-bold">•</span>
                    <span>Think about offline-first behavior.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-text-secondary font-bold">•</span>
                    <span>Address presence and cursor sync separately.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Column 3: Your Answer (Right) */}
          <div className="w-[360px] bg-surface flex flex-col overflow-hidden flex-shrink-0 transition-colors duration-200">
            <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider px-5 py-4 border-b border-border flex-shrink-0 transition-colors">
              YOUR ANSWER
            </div>

            {/* Answer Editor Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your response or use voice..."
                className="flex-1 w-full p-5 text-[14px] text-text-primary dark:text-white placeholder:text-text-secondary/60 border-0 outline-none resize-none leading-relaxed focus:ring-0 focus:outline-none bg-surface"
              />
            </div>

            {/* Bottom Button Panel */}
            <div className="border-t border-border p-5 bg-surface space-y-3.5 flex-shrink-0 transition-colors duration-200">
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-full border text-[13px] font-bold transition-all duration-200 cursor-pointer ${
                  isRecording
                    ? 'border-red-500 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 animate-pulse'
                    : 'border-border bg-surface hover:bg-neutral-50 dark:hover:bg-[#27272A] text-text-primary'
                }`}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                </svg>
                {isRecording ? 'Listening... click to stop' : 'Record voice'}
              </button>

              <button
                onClick={handleSubmit}
                className="w-full py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-[13px] font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                Submit answer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
