import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useCreateInterview } from '../hooks/useCreateInterview'
import { interviewService } from '../services/interview'

const roles = [
  {
    id: 'frontend',
    title: 'Frontend Engineer',
    description: 'React, TypeScript, UI architecture',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    )
  },
  {
    id: 'backend',
    title: 'Backend Engineer',
    description: 'APIs, databases, distributed systems',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5V19A9 3 0 0 0 21 19V5" />
        <path d="M3 12A9 3 0 0 0 21 12" />
      </svg>
    )
  },
  {
    id: 'fullstack',
    title: 'Full Stack Engineer',
    description: 'End-to-end product engineering',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    )
  },
  {
    id: 'product',
    title: 'Product Engineer',
    description: 'Product sense and execution',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    )
  },
  {
    id: 'customer',
    title: 'Customer Success / Support',
    description: 'Client communication, relationships, problem resolution',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  },
  {
    id: 'custom',
    title: 'Custom Role',
    description: 'Input any job title you would like to mock interview for',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" />
      </svg>
    )
  }
]

const levels = [
  { id: '0-1', title: 'Junior (0-1 years)', description: 'Entry-level or internship experience' },
  { id: '1-3', title: 'Mid-Level (1-3 years)', description: 'Some professional experience' },
  { id: '3-5', title: 'Senior (3-5 years)', description: 'Solid professional experience' },
  { id: '5-10', title: 'Lead (5-10 years)', description: 'Extensive experience' },
  { id: '10+', title: 'Staff / Principal (10+ years)', description: 'Industry expert' }
]

const interviewTypes = [
  { id: 'Technical', title: 'Technical', description: 'Algorithms, data structures, system design' },
  { id: 'Behavioral', title: 'Behavioral', description: 'Leadership, collaboration, soft skills' },
  { id: 'Full Stack', title: 'Full Stack', description: 'Technical + behavioral combined' }
]

const difficulties = [
  { id: 'Easy', title: 'Easy', description: 'Fundamental concepts and basic problem-solving' },
  { id: 'Medium', title: 'Medium', description: 'Moderate depth with some advanced topics' },
  { id: 'Hard', title: 'Hard', description: 'Complex problems and deep expertise' }
]

const languages = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'Swift', 'Kotlin', 'SQL'
]

export default function InterviewSetup() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedRole, setSelectedRole] = useState('frontend')
  const [customRoleTitle, setCustomRoleTitle] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('3-5')
  const [selectedType, setSelectedType] = useState('Technical')
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium')
  const [selectedLanguage, setSelectedLanguage] = useState('TypeScript')
  const [duration, setDuration] = useState(45)
  const [companyName, setCompanyName] = useState('')
  const [jd, setJd] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [serverError, setServerError] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const navigate = useNavigate()
  const createInterview = useCreateInterview()

  const handleStartInterview = async () => {
    setServerError('')

    if (duration < 15 || duration > 120) {
      toast.error('Duration must be between 15 and 120 minutes')
      return
    }

    setIsGenerating(true)

    createInterview.mutate(
      {
        role: selectedRole === 'custom' ? (customRoleTitle.trim() || 'Custom Role') : (roles.find((r) => r.id === selectedRole)?.title || selectedRole),
        experienceLevel: selectedLevel,
        interviewType: selectedType,
        difficulty: selectedDifficulty,
        preferredLanguage: selectedLanguage,
        duration,
        companyName: companyName.trim() || undefined,
        jobDescription: jd.trim() || undefined,
      },
      {
        onSuccess: async (data) => {
          try {
            toast('Generating AI interview plan, please wait...')
            await interviewService.generateInterviewPlan(data.interviewId)
            toast.success('Interview plan generated successfully!')
            navigate(`/interview/${data.interviewId}`)
          } catch (genError: any) {
            console.error('💥 AI Generation error:', genError)
            const message = genError.response?.data?.message || genError.message || 'Failed to generate AI interview. Please try again.'
            setServerError(message)
            toast.error(message)
          } finally {
            setIsGenerating(false)
          }
        },
        onError: (error) => {
          const message =
            error.message || 'Failed to create interview. Please try again.'
          setServerError(message)
          toast.error(message)
          setIsGenerating(false)
        },
      }
    )
  }

  const handleFileUpload = (file: File) => {
    if (!file) return

    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        setJd(text)
        toast.success("Job description text extracted successfully!")
      }
      reader.readAsText(file)
    } else {
      toast.error("Format not supported for auto-extraction. Please copy and paste PDF/Word text directly below.")
    }
  }

  const getRoleTitle = () => selectedRole === 'custom' ? (customRoleTitle.trim() || 'Custom Role') : (roles.find((r) => r.id === selectedRole)?.title || selectedRole)
  const getLevelTitle = () => levels.find((l) => l.id === selectedLevel)?.title || selectedLevel
  const getTypeTitle = () => interviewTypes.find((t) => t.id === selectedType)?.title || selectedType
  const getDifficultyTitle = () => difficulties.find((d) => d.id === selectedDifficulty)?.title || selectedDifficulty

  const stepLabels = ['Role', 'Experience', 'Setup', 'Details', 'Review']

  return (
    <div className="max-w-[760px] mx-auto pt-4 pb-12 select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="w-20" />
        <h1 className="text-[20px] font-bold text-text-primary text-center">New Interview</h1>
        <div className="w-20 text-right">
          <Link
            to="/dashboard"
            className="text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </Link>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="flex items-center justify-between max-w-[620px] mx-auto mb-10">
        {stepLabels.map((step, i) => (
          <div key={step} className="flex items-center flex-1 last:flex-initial">
            <div className="flex items-center gap-2">
              <div
                className={`w-[22px] h-[22px] rounded-full border flex items-center justify-center text-[10px] font-semibold transition-colors ${
                  i === currentStep
                    ? 'border-black text-black bg-white dark:border-white dark:text-white dark:bg-[#09090B]'
                    : i < currentStep
                    ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                    : 'border-border text-text-secondary'
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-[13px] font-medium transition-colors ${
                  i === currentStep ? 'text-black dark:text-white' : 'text-text-secondary'
                }`}
              >
                {step}
              </span>
            </div>
            {i < stepLabels.length - 1 && (
              <div className="flex-1 mx-4 h-[1px] bg-border" />
            )}
          </div>
        ))}
      </div>

      {/* Main Container Card */}
      <div className="rounded-[16px] border border-border bg-surface px-8 py-8 shadow-xs transition-colors">
        {/* Step 0: Role */}
        {currentStep === 0 && (
          <div>
            <h2 className="text-[18px] font-bold text-text-primary tracking-[-0.2px] mb-1">Select a role</h2>
            <p className="text-[13px] text-text-secondary mb-6">Choose the position you're preparing for.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`text-left p-5 rounded-[12px] border transition-all duration-200 cursor-pointer ${
                    selectedRole === role.id
                      ? 'border-black dark:border-white bg-surface shadow-xs'
                      : 'border-border hover:border-neutral-300 dark:hover:border-neutral-700 bg-surface'
                  }`}
                >
                  <div className="text-black dark:text-white mb-4 flex">
                    {role.icon}
                  </div>
                  <div className="text-[14px] font-bold text-text-primary leading-tight">{role.title}</div>
                  <div className="text-[12px] text-text-secondary mt-1 leading-normal">{role.description}</div>
                </button>
              ))}
            </div>

            {selectedRole === 'custom' && (
              <div className="mt-6">
                <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider mb-2 block">
                  Custom Role Title
                </label>
                <input
                  type="text"
                  value={customRoleTitle}
                  onChange={(e) => setCustomRoleTitle(e.target.value)}
                  placeholder="e.g. Data Engineer, DevOps Specialist, Customer Support Agent"
                  className="w-full rounded-[12px] border border-border bg-surface px-4 py-3 text-[13.5px] text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-black dark:focus:border-white leading-relaxed transition-colors"
                />
              </div>
            )}
          </div>
        )}

        {/* Step 1: Experience Level */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-[18px] font-bold text-text-primary tracking-[-0.2px] mb-1">Experience level</h2>
            <p className="text-[13px] text-text-secondary mb-6">Select the target seniority for this interview.</p>

            <div className="space-y-2.5">
              {levels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setSelectedLevel(level.id)}
                  className={`w-full text-left p-4 rounded-[12px] border transition-all duration-200 cursor-pointer ${
                    selectedLevel === level.id
                      ? 'border-black dark:border-white bg-surface shadow-xs'
                      : 'border-border hover:border-neutral-300 dark:hover:border-neutral-700 bg-surface'
                  }`}
                >
                  <div className="text-[14px] font-bold text-text-primary leading-tight">{level.title}</div>
                  <div className="text-[12px] text-text-secondary mt-0.5 leading-normal">{level.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Interview Type + Difficulty + Language + Duration */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-[18px] font-bold text-text-primary tracking-[-0.2px] mb-1">Interview setup</h2>
            <p className="text-[13px] text-text-secondary mb-6">Configure the type, difficulty, and preferences.</p>

            {/* Interview Type */}
            <div className="mb-6">
              <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider mb-2 block">
                Interview Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {interviewTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`text-left p-4 rounded-[12px] border transition-all duration-200 cursor-pointer ${
                      selectedType === type.id
                        ? 'border-black dark:border-white bg-surface shadow-xs'
                        : 'border-border hover:border-neutral-300 dark:hover:border-neutral-700 bg-surface'
                    }`}
                  >
                    <div className="text-[13px] font-bold text-text-primary leading-tight">{type.title}</div>
                    <div className="text-[11px] text-text-secondary mt-0.5 leading-normal">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="mb-6">
              <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider mb-2 block">
                Difficulty
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {difficulties.map((diff) => (
                  <button
                    key={diff.id}
                    onClick={() => setSelectedDifficulty(diff.id)}
                    className={`text-left p-4 rounded-[12px] border transition-all duration-200 cursor-pointer ${
                      selectedDifficulty === diff.id
                        ? 'border-black dark:border-white bg-surface shadow-xs'
                        : 'border-border hover:border-neutral-300 dark:hover:border-neutral-700 bg-surface'
                    }`}
                  >
                    <div className="text-[13px] font-bold text-text-primary leading-tight">{diff.title}</div>
                    <div className="text-[11px] text-text-secondary mt-0.5 leading-normal">{diff.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="mb-6">
              <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider mb-2 block">
                Preferred Language
              </label>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`px-4 py-2 rounded-full text-[13px] font-semibold border transition-all duration-200 cursor-pointer ${
                      selectedLanguage === lang
                        ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                        : 'border-border hover:border-neutral-300 dark:hover:border-neutral-700 text-text-primary bg-surface'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider mb-2 block">
                Duration (minutes)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={15}
                  max={120}
                  step={5}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="flex-1 h-2 rounded-full appearance-none bg-neutral-200 dark:bg-neutral-700 accent-black dark:accent-white cursor-pointer"
                />
                <span className="text-[14px] font-bold text-text-primary w-12 text-right">
                  {duration}m
                </span>
              </div>
              <p className="text-[11px] text-text-secondary mt-1.5">
                Between 15 and 120 minutes
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Company Name + JD */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-[18px] font-bold text-text-primary tracking-[-0.2px] mb-1">Additional details</h2>
            <p className="text-[13px] text-text-secondary mb-6">
              Add optional context to tailor your interview experience.
            </p>

            {/* Company Name */}
            <div className="mb-6">
              <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider mb-2 block">
                Company Name (optional)
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Google, Stripe, Airbnb"
                className="w-full rounded-[12px] border border-border bg-surface px-4 py-3 text-[13.5px] text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-black dark:focus:border-white leading-relaxed transition-colors"
              />
            </div>

            {/* Job Description */}
            <div>
              <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider mb-2 block">
                Job Description (optional)
              </label>

              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { 
                  e.preventDefault()
                  setIsDragging(false)
                  const file = e.dataTransfer.files?.[0]
                  if (file) handleFileUpload(file)
                }}
                className={`rounded-[12px] border-2 border-dashed p-6 text-center transition-all duration-200 mb-4 ${
                  isDragging
                    ? 'border-black dark:border-white bg-neutral-50 dark:bg-neutral-900/30'
                    : 'border-border hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="text-[13px] text-text-secondary mb-3">
                  Drag and drop a job description (.txt file), or click to browse.
                </div>
                <input
                  type="file"
                  accept=".txt"
                  className="hidden"
                  id="jd-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file)
                  }}
                />
                <button
                  onClick={() => document.getElementById('jd-upload')?.click()}
                  className="inline-flex items-center px-4 py-2 rounded-lg border border-border text-[13px] font-semibold text-text-primary hover:bg-[#F9FAFB] dark:hover:bg-[#27272A] transition-colors cursor-pointer"
                >
                  Upload File
                </button>
              </div>

              <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider mb-2 block">
                Or paste it here
              </label>
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the job description..."
                rows={5}
                className="w-full rounded-[12px] border border-border bg-surface px-4 py-3 text-[13.5px] text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-black dark:focus:border-white resize-none leading-relaxed transition-colors"
              />
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div>
            <h2 className="text-[18px] font-bold text-text-primary tracking-[-0.2px] mb-1">Review details</h2>
            <p className="text-[13px] text-text-secondary mb-6">Confirm your selections before starting the interview.</p>

            {/* Server error display */}
            {serverError && (
              <div className="mb-4 p-3 rounded-[12px] border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-[13px] font-semibold">
                {serverError}
              </div>
            )}

            <div className="space-y-3">
              <ReviewRow label="Role" value={getRoleTitle()} onEdit={() => setCurrentStep(0)} />
              <ReviewRow label="Experience" value={getLevelTitle()} onEdit={() => setCurrentStep(1)} />
              <ReviewRow label="Interview Type" value={getTypeTitle()} onEdit={() => setCurrentStep(2)} />
              <ReviewRow label="Difficulty" value={getDifficultyTitle()} onEdit={() => setCurrentStep(2)} />
              <ReviewRow label="Language" value={selectedLanguage} onEdit={() => setCurrentStep(2)} />
              <ReviewRow label="Duration" value={`${duration} minutes`} onEdit={() => setCurrentStep(2)} />

              <div className="p-4 rounded-[12px] border border-border bg-neutral-50 dark:bg-neutral-900/40 flex items-center justify-between transition-colors">
                <div className="flex-1 mr-4">
                  <div className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Company</div>
                  <div className="text-[14px] font-bold text-text-primary mt-0.5">
                    {companyName.trim() || 'Not specified'}
                  </div>
                </div>
                <button onClick={() => setCurrentStep(3)} className="text-[12px] font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
                  Edit
                </button>
              </div>

              <div className="p-4 rounded-[12px] border border-border bg-neutral-50 dark:bg-neutral-900/40 flex items-center justify-between transition-colors">
                <div className="flex-1 mr-4">
                  <div className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Job Description</div>
                  <div className="text-[13px] text-text-primary mt-1 line-clamp-2 italic">
                    {jd.trim() ? jd : 'No job description provided'}
                  </div>
                </div>
                <button onClick={() => setCurrentStep(3)} className="text-[12px] font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
                  Edit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Bar */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className={`text-[13px] font-bold py-2 transition-colors cursor-pointer ${
              currentStep === 0
                ? 'text-neutral-300 dark:text-neutral-700 cursor-not-allowed'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Back
          </button>

          {currentStep < 4 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-[13px] font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              Continue
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          ) : (
            <button
              onClick={handleStartInterview}
              disabled={createInterview.isPending || isGenerating}
              className={`inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-[13px] font-bold transition-colors cursor-pointer ${
                createInterview.isPending || isGenerating
                  ? 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 cursor-not-allowed'
                  : 'bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200'
              }`}
            >
              {createInterview.isPending || isGenerating ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isGenerating ? 'Generating AI...' : 'Creating...'}
                </>
              ) : (
                <>
                  Start Interview
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ReviewRow({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="p-4 rounded-[12px] border border-border bg-neutral-50 dark:bg-neutral-900/40 flex items-center justify-between transition-colors">
      <div>
        <div className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">{label}</div>
        <div className="text-[14px] font-bold text-text-primary mt-0.5">{value}</div>
      </div>
      <button onClick={onEdit} className="text-[12px] font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
        Edit
      </button>
    </div>
  )
}
