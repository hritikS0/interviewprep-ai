import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Sidebar } from '../components/Layout'
import { interviewService } from '../services/interview'
import { toast } from 'sonner'

export default function CodingRound() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Extract interviewId from query parameters
  const queryParams = new URLSearchParams(location.search)
  const interviewId = queryParams.get('interviewId')
  
  const [interview, setInterview] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [codingQuestion, setCodingQuestion] = useState<any>(null)

  const [code, setCode] = useState(`// Write your code here...`)
  const [language, setLanguage] = useState('TypeScript')
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  const codeRef = useRef(code)
  useEffect(() => {
    codeRef.current = code
  }, [code])

  const codingQuestionRef = useRef(codingQuestion)
  useEffect(() => {
    codingQuestionRef.current = codingQuestion
  }, [codingQuestion])

  // Load interview details
  useEffect(() => {
    if (!interviewId) {
      setError('Interview ID is missing in query parameters.')
      setLoading(false)
      return
    }
    
    const loadInterview = async () => {
      try {
        setLoading(true)
        const data = await interviewService.getInterviewById(interviewId)
        setInterview(data)
        
        // Find the coding question inside rounds
        let foundCodingQ: any = null
        const rounds = data.interviewPlan?.rounds || []
        for (const round of rounds) {
          const codingQ = round.questions?.find((q: any) => q.type === 'CODING')
          if (codingQ) {
            foundCodingQ = codingQ
            break
          }
        }
        
        if (foundCodingQ) {
          setCodingQuestion(foundCodingQ)
          // Set function boilerplate based on metadata
          const title = foundCodingQ.metadata?.title || 'challenge'
          const functionName = title.replace(/\s+/g, '').replace(/^\w/, (c: any) => c.toLowerCase())
          setCode(`function ${functionName}() {\n  // Write your solution here\n  return;\n}`)
        } else {
          setError('No coding challenge found in this interview plan.')
        }
      } catch (err: any) {
        console.error('Failed to load coding challenge:', err)
        setError(err.message || 'Failed to load coding challenge')
        toast.error('Failed to load coding challenge')
      } finally {
        setLoading(false)
      }
    }
    
    loadInterview()
  }, [interviewId])

  // Synchronized countdown timer utilizing localStorage
  useEffect(() => {
    if (!interview || !interviewId) return

    const storageKey = `interview_end_time_${interviewId}`
    let endTimeStr = localStorage.getItem(storageKey)
    let endTime = endTimeStr ? parseInt(endTimeStr, 10) : null

    if (!endTime) {
      const durationMin = interview.duration || 30
      endTime = Date.now() + durationMin * 60 * 1000
      localStorage.setItem(storageKey, String(endTime))
    }

    const calculateTimeLeft = () => {
      const difference = endTime! - Date.now()
      if (difference <= 0) {
        return 0
      }
      return Math.floor(difference / 1000)
    }

    setTimeLeft(calculateTimeLeft())

    const intervalId = setInterval(() => {
      const remaining = calculateTimeLeft()
      setTimeLeft(remaining)
      if (remaining <= 0) {
        clearInterval(intervalId)
      }
    }, 1000)

    return () => clearInterval(intervalId)
  }, [interview, interviewId])

  // Handle auto-submit on timer expiration
  useEffect(() => {
    if (timeLeft !== null && timeLeft <= 0 && !loading) {
      const forceFinishInterview = async () => {
        const curCode = codeRef.current
        const curQuestion = codingQuestionRef.current
        
        if (curQuestion && curCode.trim()) {
          try {
            await interviewService.saveAnswer(interviewId!, curQuestion.question, curCode)
          } catch (err) {
            console.error('Failed to save code on timeout:', err)
          }
        }

        if (interview && interview.interviewPlan) {
          const roundsList = interview.interviewPlan.rounds || []
          const allQ: any[] = []
          roundsList.forEach((round: any) => {
            const questions = round.questions || []
            questions.forEach((q: any) => {
              allQ.push(q)
            })
          })
          localStorage.setItem(`interview_progress_${interviewId}`, String(allQ.length))
        }

        toast.error("Time is up! Submitting your coding challenge...")
        navigate(`/interview/${interviewId}`)
      }

      forceFinishInterview()
    }
  }, [timeLeft, loading, interviewId, interview, navigate])

  const formatTimeLeft = (seconds: number | null) => {
    if (seconds === null) return '--:--'
    if (seconds <= 0) return '00:00'
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }


  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAFAF9] dark:bg-[#09090B] text-text-primary">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-black dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-[14px] font-bold">Loading coding challenge...</span>
        </div>
      </div>
    )
  }

  if (error || !codingQuestion) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAFAF9] dark:bg-[#09090B] text-text-primary p-6">
        <div className="text-center max-w-md">
          <h2 className="text-[20px] font-bold text-red-600 mb-2">Error Loading Coding Challenge</h2>
          <p className="text-[14px] text-text-secondary mb-6">{error || 'Coding challenge is missing in this interview plan.'}</p>
          <Link to="/dashboard" className="px-6 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-[13px] hover:opacity-90 transition-opacity">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const metadata = codingQuestion.metadata || {}
  const examples = metadata.examples || []
  const testCases = metadata.hiddenTestCases || []

  // Submit and advance progress
  const handleSubmit = async () => {
    try {
      await interviewService.saveAnswer(interviewId!, codingQuestion.question, code);
      toast.success("Code submitted successfully! Moving to next round.");
    } catch (err: any) {
      console.error('Failed to save coding answer:', err);
      toast.error('Failed to submit code. Proceeding anyway...');
    }

    if (interview && interview.interviewPlan) {
      const roundsList = interview.interviewPlan.rounds || []
      const allQ: any[] = []
      roundsList.forEach((round: any, roundIdx: number) => {
        const questions = round.questions || []
        questions.forEach((q: any) => {
          allQ.push({
            ...q,
            roundIdx,
          })
        })
      })

      const codingIdx = allQ.findIndex(q => q.type === 'CODING')
      if (codingIdx !== -1) {
        localStorage.setItem(`interview_progress_${interviewId}`, String(codingIdx + 1))
      }
    }

    navigate(`/interview/${interviewId}`)
  }

  // Skip and advance progress
  const handleSkip = async () => {
    try {
      await interviewService.saveAnswer(interviewId!, codingQuestion.question, "Skipped (No solution provided)");
      toast.success("Coding challenge skipped.");
    } catch (err: any) {
      console.error('Failed to skip coding challenge:', err);
      toast.error('Failed to skip. Proceeding anyway...');
    }

    if (interview && interview.interviewPlan) {
      const roundsList = interview.interviewPlan.rounds || []
      const allQ: any[] = []
      roundsList.forEach((round: any, roundIdx: number) => {
        const questions = round.questions || []
        questions.forEach((q: any) => {
          allQ.push({
            ...q,
            roundIdx,
          })
        })
      })

      const codingIdx = allQ.findIndex(q => q.type === 'CODING')
      if (codingIdx !== -1) {
        localStorage.setItem(`interview_progress_${interviewId}`, String(codingIdx + 1))
      }
    }

    navigate(`/interview/${interviewId}`)
  }

  // Back to previous question
  const handleBack = async () => {
    if (code.trim()) {
      try {
        await interviewService.saveAnswer(interviewId!, codingQuestion.question, code);
      } catch (err) {
        console.error('Failed to save code before going back:', err);
      }
    }

    if (interview && interview.interviewPlan) {
      const roundsList = interview.interviewPlan.rounds || []
      const allQ: any[] = []
      roundsList.forEach((round: any, roundIdx: number) => {
        const questions = round.questions || []
        questions.forEach((q: any) => {
          allQ.push({
            ...q,
            roundIdx,
          })
        })
      })

      const codingIdx = allQ.findIndex(q => q.type === 'CODING')
      if (codingIdx > 0) {
        localStorage.setItem(`interview_progress_${interviewId}`, String(codingIdx - 1))
      }
    }

    navigate(`/interview/${interviewId}`)
  }

  return (
    <div className="flex h-screen bg-[#FAFAF9] dark:bg-[#09090B] overflow-hidden select-none font-sans transition-colors duration-200">
      <Sidebar />

      <div className="flex-1 ml-60 flex h-full bg-[#FAFAF9] dark:bg-[#09090B] overflow-hidden">
        {/* Left Column - Problem Description */}
        <div className="w-[440px] border-r border-border bg-surface overflow-auto flex flex-col transition-colors duration-200">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <Link to="/dashboard" className="text-[13px] font-bold text-text-secondary hover:text-text-primary transition-colors">
              Exit
            </Link>

            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              <span className="text-[13px] font-bold text-red-600 dark:text-red-400 tracking-wide font-mono">
                {formatTimeLeft(timeLeft)}
              </span>
            </div>

            <span className="text-[12px] font-semibold text-text-secondary bg-[#F3F4F6] dark:bg-[#27272A] px-2.5 py-0.5 rounded-full">
              Complexity: {metadata.expectedComplexity || 'N/A'}
            </span>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[11px] font-bold text-success bg-success-light px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {codingQuestion.difficulty || 'Medium'}
              </span>
              <span className="text-[13px] text-text-secondary font-semibold">Coding Round</span>
            </div>

            <h1 className="text-[22px] font-extrabold text-text-primary mb-4 tracking-[-0.4px]">
              {metadata.title || 'Coding Challenge'}
            </h1>

            <p className="text-[13.5px] text-text-secondary leading-relaxed mb-5 font-medium whitespace-pre-wrap">
              {metadata.description || codingQuestion.question}
            </p>

            {examples.map((ex: any, idx: number) => (
              <div key={idx} className="mb-5">
                <h3 className="text-[13.5px] font-bold text-text-primary mb-2">Example {idx + 1}</h3>
                <div className="bg-neutral-50 dark:bg-neutral-900/40 border border-border rounded-[10px] p-3.5 font-mono text-[12.5px] text-text-secondary leading-relaxed">
                  <div className="font-bold text-text-primary">Input: <span className="font-normal text-text-secondary">{ex.input}</span></div>
                  <div className="font-bold text-text-primary mt-1">Output: <span className="font-normal text-text-secondary">{ex.output}</span></div>
                  {ex.explanation && (
                    <div className="text-[11.5px] text-neutral-400 dark:text-neutral-500 mt-2">Explanation: {ex.explanation}</div>
                  )}
                </div>
              </div>
            ))}

            {metadata.constraints && (
              <div className="mb-5">
                <h3 className="text-[13.5px] font-bold text-text-primary mb-2">Constraints</h3>
                <div className="text-[12.5px] text-text-secondary font-mono leading-relaxed bg-neutral-50 dark:bg-neutral-900/10 p-3 rounded-[10px] border border-border whitespace-pre-wrap">
                  {metadata.constraints}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center - Editor */}
        <div className="flex-1 flex flex-col bg-[#121212]">
          <div className="px-4 py-3 border-b border-[#222] flex items-center justify-between bg-[#181818]">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-[#2D2D2D] text-[#CCC] text-[12.5px] rounded-[6px] px-2.5 py-1 border-0 focus:outline-none cursor-pointer"
            >
              <option>TypeScript</option>
              <option>JavaScript</option>
              <option>Python</option>
              <option>Java</option>
              <option>Go</option>
            </select>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleBack}
                className="px-4 py-1.5 rounded-full border border-[#444] text-[#CCC] bg-transparent text-[12.5px] font-bold hover:bg-[#222] transition-colors cursor-pointer"
              >
                Back
              </button>
              <button 
                onClick={handleSkip}
                className="px-4 py-1.5 rounded-full border border-[#444] text-[#CCC] bg-transparent text-[12.5px] font-bold hover:bg-[#222] transition-colors cursor-pointer"
              >
                Skip
              </button>
              <button 
                onClick={() => toast.success("Running tests...")}
                className="px-4 py-1.5 rounded-full bg-[#2D2D2D] text-[#CCC] text-[12.5px] font-bold hover:bg-[#3D3D3D] transition-colors cursor-pointer"
              >
                Run
              </button>
              <button 
                onClick={handleSubmit}
                className="px-4 py-1.5 rounded-full bg-success text-white text-[12.5px] font-bold hover:bg-[#15803D] transition-colors cursor-pointer"
              >
                Submit
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-[#121212]">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-[#121212] text-[#D4D4D4] font-mono text-[13px] leading-relaxed p-5 resize-none focus:outline-none focus:ring-0"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right - Test Cases */}
        <div className="w-[340px] border-l border-border bg-surface overflow-auto transition-colors duration-200">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">TEST CASES</h2>
          </div>

          <div className="p-4 space-y-2">
            {testCases.map((tc: any, index: number) => (
              <div key={index} className="rounded-[10px] border border-border p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-bold text-text-primary">Case {index + 1}</span>
                  <span className="text-[12px] font-bold text-text-secondary">Pending</span>
                </div>
                <div className="text-[12px] font-mono text-text-secondary space-y-0.5">
                  <div>Input: {tc.input}</div>
                  <div>Expected: {tc.output}</div>
                </div>
              </div>
            ))}
            {testCases.length === 0 && (
              <div className="text-center py-8 text-[13px] text-text-secondary font-medium">
                No custom test cases provided.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
