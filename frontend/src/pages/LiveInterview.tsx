import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Sidebar } from '../components/Layout'
import { interviewService } from '../services/interview'
import { toast } from 'sonner'

export default function LiveInterview() {
  const [interview, setInterview] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [flatQuestionIndex, setFlatQuestionIndex] = useState(0)
  
  const [answer, setAnswer] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [timeStr, setTimeStr] = useState('12:00')
  
  const navigate = useNavigate()
  const { interviewId } = useParams<{ interviewId: string }>()
  
  // Load interview details
  useEffect(() => {
    if (!interviewId) return
    
    const loadInterview = async () => {
      try {
        setLoading(true)
        const data = await interviewService.getInterviewById(interviewId)
        setInterview(data)
        
        // Restore progress if it exists in local storage
        const savedProgress = localStorage.getItem(`interview_progress_${interviewId}`)
        if (savedProgress) {
          const idx = parseInt(savedProgress, 10)
          setFlatQuestionIndex(idx)
        }
      } catch (err: any) {
        console.error('Failed to load interview:', err)
        setError(err.message || 'Failed to load interview')
        toast.error('Failed to load interview')
      } finally {
        setLoading(false)
      }
    }
    
    loadInterview()
  }, [interviewId])

  // Save current interviewId to local storage
  useEffect(() => {
    if (interviewId) {
      localStorage.setItem('currentInterviewId', interviewId)
    }
  }, [interviewId])

  // Live ticking clock for top-right
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
    
    const mockSpeechText = "To address this question, we should first establish the core constraints. We need to evaluate the optimal approach here, ensuring the solution is robust and handles boundary cases at scale. From a technical standpoint, we want to achieve minimal latency and optimal resource usage..."
    let index = 0
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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAFAF9] dark:bg-[#09090B] text-text-primary">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-black dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-[14px] font-bold">Loading interview plan...</span>
        </div>
      </div>
    )
  }

  if (error || !interview || !interview.interviewPlan) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAFAF9] dark:bg-[#09090B] text-text-primary p-6">
        <div className="text-center max-w-md">
          <h2 className="text-[20px] font-bold text-red-600 mb-2">Error Loading Interview</h2>
          <p className="text-[14px] text-text-secondary mb-6">{error || 'Interview plan is missing or was not generated.'}</p>
          <Link to="/dashboard" className="px-6 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-[13px] hover:opacity-90 transition-opacity">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const rounds = interview.interviewPlan.rounds || []
  
  // Flatten all questions for indexing and total progress count
  const allQuestions: any[] = []
  rounds.forEach((round: any, roundIdx: number) => {
    const questions = round.questions || []
    questions.forEach((q: any) => {
      allQuestions.push({
        ...q,
        roundName: round.name,
        roundIdx,
      })
    })
  })

  const totalQuestions = allQuestions.length

  if (totalQuestions === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAFAF9] dark:bg-[#09090B] text-text-primary">
        <div className="text-center">
          <h2 className="text-[18px] font-bold mb-4">No questions found in this interview plan.</h2>
          <Link to="/dashboard" className="px-6 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Get active question
  // Handle case where index exceeds bounds (interview completed)
  const isCompleted = flatQuestionIndex >= totalQuestions
  const currentQuestion = isCompleted ? allQuestions[totalQuestions - 1] : allQuestions[flatQuestionIndex]
  const activeRoundIndex = isCompleted ? rounds.length : currentQuestion.roundIdx

  // Build sections display list dynamically
  const sections = rounds.map((round: any, rIndex: number) => {
    let status = 'upcoming'
    if (rIndex < activeRoundIndex) {
      status = 'completed'
    } else if (rIndex === activeRoundIndex) {
      status = 'current'
    }
    return {
      id: round.id,
      title: round.name,
      questionsCount: round.questions?.length || 0,
      status
    }
  })

  if (isCompleted) {
    return (
      <div className="flex h-screen bg-[#FAFAF9] dark:bg-[#09090B] items-center justify-center p-6 text-text-primary">
        <div className="text-center max-w-sm border border-border bg-surface p-8 rounded-[16px] shadow-xs">
          <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-950/20 text-green-500 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h2 className="text-[20px] font-extrabold mb-2">Interview Completed!</h2>
          <p className="text-[13px] text-text-secondary mb-6 leading-relaxed">
            You have answered all questions. Our AI is now grading your responses to generate a detailed feedback report.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem(`interview_progress_${interviewId}`);
              navigate('/dashboard');
            }}
            className="w-full py-2.5 rounded-[12px] bg-black dark:bg-white text-white dark:text-black text-[13.5px] font-bold hover:bg-neutral-850 dark:hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Handle submit answer
  const handleSubmit = () => {
    if (currentQuestion.type === 'CODING') {
      navigate(`/coding?interviewId=${interviewId}`)
      return
    }

    setAnswer('') // Clear answer box

    const nextIndex = flatQuestionIndex + 1;
    localStorage.setItem(`interview_progress_${interviewId}`, String(nextIndex));

    if (nextIndex < totalQuestions) {
      const nextQuestion = allQuestions[nextIndex]
      if (nextQuestion.type === 'CODING') {
        navigate(`/coding?interviewId=${interviewId}`)
      } else {
        setFlatQuestionIndex(nextIndex)
      }
    } else {
      setFlatQuestionIndex(nextIndex)
      toast.success('Interview completed!')
    }
  }

  return (
    <div className="flex h-screen bg-[#FAFAF9] dark:bg-[#09090B] overflow-hidden select-none font-sans transition-colors duration-200">
      <Sidebar />

      <div className="flex-1 ml-60 flex flex-col h-full bg-background transition-colors duration-200">
        <header className="h-[56px] border-b border-border bg-surface flex items-center justify-between px-6 flex-shrink-0 transition-colors duration-200">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            <span className="text-[13px] font-bold text-text-primary">Live Interview</span>
            <span className="text-[13px] text-text-secondary">• {interview.role} ({interview.experienceLevel} exp)</span>
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

        <div className="flex-1 flex overflow-hidden">
          {/* Column 1: Progress (Left) */}
          <div className="w-[240px] border-r border-border bg-surface flex flex-col justify-between p-5 flex-shrink-0 transition-colors duration-200">
            <div className="space-y-5">
              <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">PROGRESS</div>
              <div className="space-y-3.5">
                {sections.map((sec: any) => (
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

            <div className="border-t border-border pt-4">
              <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">OVERALL</div>
              <div className="text-[13.5px] font-bold text-text-primary mb-2">{Math.min(flatQuestionIndex + 1, totalQuestions)} / {totalQuestions} questions</div>
              <div className="w-full h-1 bg-[#F3F4F6] dark:bg-[#27272A] rounded-full overflow-hidden">
                <div className="h-full bg-black dark:bg-white rounded-full transition-all duration-300" style={{ width: `${(Math.min(flatQuestionIndex + 1, totalQuestions) / totalQuestions) * 100}%` }} />
              </div>
            </div>
          </div>

          {/* Column 2: Question (Center) */}
          <div className="flex-1 border-r border-border bg-surface flex flex-col overflow-y-auto px-10 py-8 transition-colors duration-200">
            <div className="max-w-[620px] w-full">
              <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-4">
                QUESTION {flatQuestionIndex + 1} OF {totalQuestions} • {currentQuestion.roundName.toUpperCase()}
              </div>
              <h2 className="text-[25px] font-extrabold text-text-primary leading-snug tracking-[-0.5px] whitespace-pre-line">
                {currentQuestion.type === 'CODING' 
                  ? `Coding Challenge: ${currentQuestion.metadata?.title || 'Coding task'}.\n\nYou will be redirected to the code editor to complete this challenge.`
                  : currentQuestion.question}
              </h2>

              <div className="flex flex-wrap gap-2.5 mt-5 mb-8">
                {currentQuestion.difficulty && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-neutral-50/50 dark:bg-neutral-800/30 text-[12px] font-bold text-text-secondary transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {currentQuestion.difficulty} difficulty
                  </div>
                )}
                {currentQuestion.topic && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-neutral-50/50 dark:bg-neutral-800/30 text-[12px] font-bold text-text-secondary transition-colors">
                    Topic: {currentQuestion.topic}
                  </div>
                )}
              </div>

              <div className="border-t border-border my-8" />

              <div className="space-y-4">
                <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                  {currentQuestion.type === 'CODING' ? 'PROBLEM OVERVIEW' : 'INSTRUCTIONS'}
                </div>
                {currentQuestion.type === 'CODING' ? (
                  <div className="text-[13.5px] text-text-secondary leading-relaxed font-semibold">
                    <p className="mb-2"><strong>Title:</strong> {currentQuestion.metadata?.title}</p>
                    <p className="mb-4"><strong>Description:</strong> {currentQuestion.metadata?.description}</p>
                    <p className="text-text-primary mt-4">Click "Start coding" to open the interactive code workspace and solve this problem.</p>
                  </div>
                ) : (
                  <ul className="space-y-2.5 text-[13px] text-text-secondary font-semibold leading-relaxed">
                    <li className="flex items-start">
                      <span className="mr-2 text-text-secondary font-bold">•</span>
                      <span>Speak clearly or type your response in the right-hand panel.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-text-secondary font-bold">•</span>
                      <span>Include design trade-offs, architecture patterns, and technical reasoning.</span>
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Column 3: Your Answer (Right) */}
          <div className="w-[360px] bg-surface flex flex-col overflow-hidden flex-shrink-0 transition-colors duration-200">
            <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider px-5 py-4 border-b border-border flex-shrink-0 transition-colors">
              {currentQuestion.type === 'CODING' ? 'CODING ROUND' : 'YOUR ANSWER'}
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
              {currentQuestion.type === 'CODING' ? (
                <div className="p-5 text-[13.5px] text-text-secondary font-semibold leading-relaxed flex items-center justify-center h-full text-center">
                  <div>
                    <svg className="mx-auto mb-4 text-text-secondary animate-pulse" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 18 22 12 16 6" />
                      <polyline points="8 6 2 12 8 18" />
                    </svg>
                    Ready to code? Click "Start coding" to proceed to the coding round.
                  </div>
                </div>
              ) : (
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your response or use voice..."
                  className="flex-1 w-full p-5 text-[14px] text-text-primary dark:text-white placeholder:text-text-secondary/60 border-0 outline-none resize-none leading-relaxed focus:ring-0 focus:outline-none bg-surface"
                />
              )}
            </div>

            <div className="border-t border-border p-5 bg-surface space-y-3.5 flex-shrink-0 transition-colors duration-200">
              {currentQuestion.type !== 'CODING' && (
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
              )}

              <button
                onClick={handleSubmit}
                className="w-full py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-[13px] font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                {currentQuestion.type === 'CODING' ? 'Start coding' : 'Submit answer'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
