import { useState, useEffect } from 'react'
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
  const handleSubmit = () => {
    toast.success("Code submitted successfully! Moving to next round.")

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
