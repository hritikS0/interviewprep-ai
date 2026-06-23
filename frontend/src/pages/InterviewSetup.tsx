import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const steps = ['Role', 'Experience', 'Job Description', 'Review']

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
  }
]

const levels = [
  { id: 'junior', title: 'Junior Engineer', description: '0-2 years of experience' },
  { id: 'mid', title: 'Mid-Level Engineer', description: '2-5 years of experience' },
  { id: 'senior', title: 'Senior Engineer', description: '5-8 years of experience' },
  { id: 'lead', title: 'Lead / Staff Engineer', description: '8+ years of experience' }
]

export default function InterviewSetup() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedRole, setSelectedRole] = useState('frontend')
  const [selectedLevel, setSelectedLevel] = useState('senior')
  const [jd, setJd] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  
  const navigate = useNavigate()

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
        {steps.map((step, i) => (
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
            {i < steps.length - 1 && (
              <div className="flex-1 mx-4 h-[1px] bg-border" />
            )}
          </div>
        ))}
      </div>

      {/* Main Container Card */}
      <div className="rounded-[16px] border border-border bg-surface px-8 py-8 shadow-xs transition-colors">
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
          </div>
        )}

        {currentStep === 1 && (
          <div>
            <h2 className="text-[18px] font-bold text-text-primary tracking-[-0.2px] mb-1">Experience level</h2>
            <p className="text-[13px] text-text-secondary mb-6">Select the target seniority for this interview.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {levels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setSelectedLevel(level.id)}
                  className={`text-left p-5 rounded-[12px] border transition-all duration-200 cursor-pointer ${
                    selectedLevel === level.id
                      ? 'border-black dark:border-white bg-surface shadow-xs'
                      : 'border-border hover:border-neutral-300 dark:hover:border-neutral-700 bg-surface'
                  }`}
                >
                  <div className="text-[14px] font-bold text-text-primary leading-tight">{level.title}</div>
                  <div className="text-[12px] text-text-secondary mt-1 leading-normal">{level.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h2 className="text-[18px] font-bold text-text-primary tracking-[-0.2px] mb-1">Job Description</h2>
            <p className="text-[13px] text-text-secondary mb-6">
              Upload or paste a job description to tailor the interview questions.
            </p>

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false) }}
              className={`rounded-[12px] border-2 border-dashed p-8 text-center transition-all duration-200 ${
                isDragging
                  ? 'border-black dark:border-white bg-neutral-50 dark:bg-neutral-900/30'
                  : 'border-border hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <div className="text-[13px] text-text-secondary mb-3.5">
                Drag and drop a job description (PDF, DOCX, TXT), or click to browse.
              </div>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                id="jd-upload"
              />
              <button
                onClick={() => document.getElementById('jd-upload')?.click()}
                className="inline-flex items-center px-4 py-2 rounded-lg border border-border text-[13px] font-semibold text-text-primary hover:bg-[#F9FAFB] dark:hover:bg-[#27272A] transition-colors cursor-pointer"
              >
                Upload File
              </button>
            </div>

            <div className="mt-5">
              <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">Or paste it here</label>
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the job description..."
                rows={5}
                className="w-full mt-2 rounded-[12px] border border-border bg-surface px-4 py-3 text-[13.5px] text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-black dark:focus:border-white resize-none leading-relaxed transition-colors"
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h2 className="text-[18px] font-bold text-text-primary tracking-[-0.2px] mb-1">Review details</h2>
            <p className="text-[13px] text-text-secondary mb-6">Confirm your selections before starting the interview.</p>

            <div className="space-y-4">
              <div className="p-4 rounded-[12px] border border-border bg-neutral-50 dark:bg-neutral-900/40 flex items-center justify-between transition-colors">
                <div>
                  <div className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Role</div>
                  <div className="text-[14px] font-bold text-text-primary mt-0.5">
                    {roles.find(r => r.id === selectedRole)?.title || selectedRole}
                  </div>
                </div>
                <button onClick={() => setCurrentStep(0)} className="text-[12px] font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
                  Edit
                </button>
              </div>

              <div className="p-4 rounded-[12px] border border-border bg-neutral-50 dark:bg-neutral-900/40 flex items-center justify-between transition-colors">
                <div>
                  <div className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Seniority Level</div>
                  <div className="text-[14px] font-bold text-text-primary mt-0.5">
                    {levels.find(l => l.id === selectedLevel)?.title || selectedLevel}
                  </div>
                </div>
                <button onClick={() => setCurrentStep(1)} className="text-[12px] font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
                  Edit
                </button>
              </div>

              <div className="p-4 rounded-[12px] border border-border bg-neutral-50 dark:bg-neutral-900/40 flex items-center justify-between transition-colors">
                <div className="flex-1 mr-4">
                  <div className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Job Description</div>
                  <div className="text-[13px] text-text-primary mt-1 line-clamp-2 italic">
                    {jd.trim() ? jd : "No job description provided (standard general interview will run)."}
                  </div>
                </div>
                <button onClick={() => setCurrentStep(2)} className="text-[12px] font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
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
          
          {currentStep < 3 ? (
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
              onClick={() => navigate('/interview')}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-[13px] font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              Start Interview
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
