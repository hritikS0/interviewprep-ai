import { useState, useEffect, useRef } from 'react'
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
  const [interimText, setInterimText] = useState('')
  const [micNetworkError, setMicNetworkError] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const lastProcessedIndexRef = useRef(-1)
  const [isGrading, setIsGrading] = useState(false)
  const [gradingError, setGradingError] = useState('')
  const navigate = useNavigate()
  const { interviewId } = useParams<{ interviewId: string }>()

  const rounds = interview?.interviewPlan?.rounds || []
  
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
  const isCompleted = totalQuestions > 0 && flatQuestionIndex >= totalQuestions
  const currentQuestion = isCompleted ? allQuestions[totalQuestions - 1] : allQuestions[flatQuestionIndex]
  const activeRoundIndex = isCompleted ? rounds.length : currentQuestion?.roundIdx

  const answerRef = useRef(answer)
  useEffect(() => {
    answerRef.current = answer
  }, [answer])

  const currentQuestionRef = useRef(currentQuestion)
  useEffect(() => {
    currentQuestionRef.current = currentQuestion
  }, [currentQuestion])

  const lastLoadedQuestionRef = useRef<string>('');

  // Load previous answer if it exists when question index changes
  useEffect(() => {
    if (!interview || !currentQuestion) return;
    if (currentQuestion.question === lastLoadedQuestionRef.current) return;
    
    lastLoadedQuestionRef.current = currentQuestion.question;
    const savedQ = interview.questions?.find((q: any) => q.questionText === currentQuestion.question);
    if (savedQ && savedQ.answerText) {
      if (savedQ.answerText === "Skipped (No answer provided)") {
        setAnswer("");
      } else {
        setAnswer(savedQ.answerText);
      }
    } else {
      setAnswer("");
    }
  }, [currentQuestion, interview]);
  
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

  const updateLocalAnswer = (questionText: string, answerText: string) => {
    setInterview((prev: any) => {
      if (!prev) return prev;
      const questions = prev.questions || [];
      const index = questions.findIndex((q: any) => q.questionText === questionText);
      let updatedQuestions;
      if (index !== -1) {
        updatedQuestions = questions.map((q: any, i: number) => 
          i === index ? { ...q, answerText } : q
        );
      } else {
        updatedQuestions = [...questions, { questionText, answerText }];
      }
      return { ...prev, questions: updatedQuestions };
    });
  }

  // Save current interviewId to local storage
  useEffect(() => {
    if (interviewId) {
      localStorage.setItem('currentInterviewId', interviewId)
    }
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

  // Handle auto-submit when timer expires
  useEffect(() => {
    if (timeLeft !== null && timeLeft <= 0 && !isCompleted && !loading) {
      const forceFinishInterview = async () => {
        const curQuestion = currentQuestionRef.current
        const curAnswer = answerRef.current
        
        if (curQuestion && curQuestion.type !== 'CODING' && curAnswer.trim()) {
          try {
            await interviewService.saveAnswer(interviewId!, curQuestion.question, curAnswer)
            updateLocalAnswer(curQuestion.question, curAnswer)
          } catch (err) {
            console.error('Failed to save final answer on timeout:', err)
          }
        }
        
        toast.error("Time is up! Submitting your interview...")
        setFlatQuestionIndex(totalQuestions)
      }

      forceFinishInterview()
    }
  }, [timeLeft, isCompleted, loading, interviewId, totalQuestions])

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

  // MediaRecorder for voice recording and server-side speech transcription
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    const startRecording = async () => {
      setMicNetworkError(false);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        activeStream = stream;
        
        // Find best mimeType supported
        let options = { mimeType: 'audio/webm' };
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          options = { mimeType: 'audio/webm' };
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          options = { mimeType: 'audio/mp4' };
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          options = { mimeType: 'audio/ogg' };
        } else if (MediaRecorder.isTypeSupported('audio/wav')) {
          options = { mimeType: 'audio/wav' };
        }
        
        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: options.mimeType || 'audio/webm' });
          
          // Stop stream tracks to release device
          stream.getTracks().forEach(track => track.stop());

          if (audioBlob.size === 0) return;

          try {
            setIsTranscribing(true);
            const transcriptText = await interviewService.transcribeAudio(interviewId!, audioBlob);
            
            if (transcriptText && transcriptText.trim()) {
              setAnswer(prev => {
                const trimmed = prev.trim();
                return trimmed ? `${trimmed} ${transcriptText.trim()}` : transcriptText.trim();
              });
              toast.success('Transcription complete!');
            }
          } catch (err: any) {
            console.error('ASR Transcription failed:', err);
            setMicNetworkError(true);
            toast.error('Speech recognition server error. Please type your response.');
          } finally {
            setIsTranscribing(false);
          }
        };

        mediaRecorder.start();
      } catch (err: any) {
        console.error('Failed to access microphone:', err);
        toast.error('Microphone access denied or not found. Please verify permissions.');
        setIsRecording(false);
      }
    };

    if (isRecording) {
      startRecording();
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording, interviewId]);

  // Automatically trigger report generation when interview is completed
  useEffect(() => {
    if (!isCompleted || !interviewId) return

    const generateReport = async () => {
      setIsGrading(true)
      setGradingError('')
      try {
        await interviewService.submitInterview(interviewId)
        toast.success('Report generated successfully!')
        localStorage.removeItem(`interview_progress_${interviewId}`)
        navigate(`/report?interviewId=${interviewId}`)
      } catch (err: any) {
        console.error('Failed to generate report:', err)
        setGradingError(err.message || 'Failed to generate report')
        toast.error('Failed to generate report')
      } finally {
        setIsGrading(false)
      }
    }

    generateReport()
  }, [isCompleted, interviewId, navigate])

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
          {isGrading ? (
            <>
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/20 text-blue-500 flex items-center justify-center mx-auto mb-4 animate-spin">
                <svg className="h-6 w-6 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h2 className="text-[20px] font-extrabold mb-2">Grading Interview...</h2>
              <p className="text-[13px] text-text-secondary mb-6 leading-relaxed">
                Please wait while our AI grades your responses and compiles your feedback report. This might take up to a minute.
              </p>
            </>
          ) : gradingError ? (
            <>
              <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h2 className="text-[20px] font-extrabold mb-2">Grading Failed</h2>
              <p className="text-[13px] text-red-500 font-semibold mb-6 leading-relaxed">
                {gradingError}
              </p>
              <div className="space-y-2">
                <button
                  onClick={async () => {
                    setIsGrading(true);
                    setGradingError('');
                    try {
                      await interviewService.submitInterview(interviewId!);
                      toast.success('Report generated successfully!');
                      localStorage.removeItem(`interview_progress_${interviewId}`);
                      navigate(`/report?interviewId=${interviewId}`);
                    } catch (err: any) {
                      setGradingError(err.message || 'Failed to generate report');
                    } finally {
                      setIsGrading(false);
                    }
                  }}
                  className="w-full py-2.5 rounded-[12px] bg-black dark:bg-white text-white dark:text-black text-[13.5px] font-bold hover:bg-neutral-850 dark:hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  Retry Grading
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem(`interview_progress_${interviewId}`);
                    navigate('/dashboard');
                  }}
                  className="w-full py-2.5 rounded-[12px] border border-border text-text-primary text-[13.5px] font-bold hover:bg-neutral-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Back to Dashboard
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-950/20 text-green-500 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h2 className="text-[20px] font-extrabold mb-2">Interview Completed!</h2>
              <p className="text-[13px] text-text-secondary mb-6 leading-relaxed">
                You have answered all questions. Click below to view your report.
              </p>
              <button
                onClick={() => {
                  localStorage.removeItem(`interview_progress_${interviewId}`);
                  navigate(`/report?interviewId=${interviewId}`);
                }}
                className="w-full py-2.5 rounded-[12px] bg-black dark:bg-white text-white dark:text-black text-[13.5px] font-bold hover:bg-neutral-850 dark:hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                View Report
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Handle submit answer
  const handleSubmit = async () => {
    if (currentQuestion.type === 'CODING') {
      navigate(`/coding?interviewId=${interviewId}`)
      return
    }

    try {
      await interviewService.saveAnswer(interviewId!, currentQuestion.question, answer);
      updateLocalAnswer(currentQuestion.question, answer);
    } catch (err: any) {
      console.error('Failed to save answer:', err);
      toast.error('Failed to save answer. Proceeding anyway...');
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

  // Handle skip answer
  const handleSkip = async () => {
    try {
      await interviewService.saveAnswer(interviewId!, currentQuestion.question, "Skipped (No answer provided)");
      updateLocalAnswer(currentQuestion.question, "Skipped (No answer provided)");
    } catch (err: any) {
      console.error('Failed to save answer:', err);
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

  // Handle back to previous question
  const handleBack = async () => {
    if (answer.trim()) {
      try {
        await interviewService.saveAnswer(interviewId!, currentQuestion.question, answer);
        updateLocalAnswer(currentQuestion.question, answer);
      } catch (err) {
        console.error('Failed to save answer before going back:', err);
      }
    }

    const prevIndex = flatQuestionIndex - 1;
    if (prevIndex >= 0) {
      localStorage.setItem(`interview_progress_${interviewId}`, String(prevIndex));
      setFlatQuestionIndex(prevIndex);
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
            <span className="text-[13px] font-bold text-text-primary tracking-wide font-mono">
              {formatTimeLeft(timeLeft)}
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
                <>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your response or use voice..."
                    className="flex-1 w-full p-5 text-[14px] text-text-primary dark:text-white placeholder:text-text-secondary/60 border-0 outline-none resize-none leading-relaxed focus:ring-0 focus:outline-none bg-surface"
                  />
                  {isRecording && (
                    <div className="px-5 py-3 text-[12px] text-text-secondary italic border-t border-border bg-neutral-50/30 dark:bg-[#18181b]/30 flex items-center gap-2 flex-shrink-0">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                      </span>
                      <span>Recording voice... speak clearly. Click stop to transcribe.</span>
                    </div>
                  )}
                  {isTranscribing && (
                    <div className="px-5 py-3 text-[12px] text-text-secondary italic border-t border-border bg-neutral-50/30 dark:bg-[#18181b]/30 flex items-center gap-2 flex-shrink-0">
                      <svg className="animate-spin h-3.5 w-3.5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Transcribing your audio using AI...</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="border-t border-border p-5 bg-surface space-y-3.5 flex-shrink-0 transition-colors duration-200">
              {currentQuestion.type !== 'CODING' && (
                <>
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
                  {micNetworkError && (
                    <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-950/10 text-[11.5px] text-amber-700 dark:text-amber-400 leading-normal font-medium">
                      ⚠️ Speech recognition server is unreachable. If you're using macOS, try opening this page in <strong>Safari</strong> (which uses Apple's offline-supported transcription engine) or type your answer directly.
                    </div>
                  )}
                </>
              )}

              {currentQuestion.type === 'CODING' ? (
                <button
                  onClick={handleSubmit}
                  className="w-full py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-[13px] font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  Start coding
                </button>
              ) : (
                <div className="flex gap-3">
                  {flatQuestionIndex > 0 && (
                    <button
                      onClick={handleBack}
                      className="flex-1 py-2.5 rounded-full border border-border bg-surface hover:bg-neutral-50 dark:hover:bg-[#27272A] text-text-primary text-[13px] font-bold transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                  )}
                  <button
                    onClick={handleSkip}
                    className="flex-1 py-2.5 rounded-full border border-border bg-surface hover:bg-neutral-50 dark:hover:bg-[#27272A] text-text-primary text-[13px] font-bold transition-colors cursor-pointer"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-[13px] font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
                  >
                    Submit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
