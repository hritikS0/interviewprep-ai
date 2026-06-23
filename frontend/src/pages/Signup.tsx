import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/auth'

export default function Signup() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState(() => {
    return localStorage.getItem('pendingEmailConfirmation') === 'true'
      ? localStorage.getItem('pendingEmail') || ''
      : ''
  })
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState(() => {
    return localStorage.getItem('pendingEmailConfirmation') === 'true'
      ? 'Please check your email to confirm your account.'
      : ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light'
  })

  // Auto redirect if already authenticated
  useEffect(() => {
    if (localStorage.getItem('isAuthenticated') === 'true') {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name) {
      setError('Name is required')
      return
    }
    if (!email) {
      setError('Email is required')
      return
    }
    if (!password) {
      setError('Password is required')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)
    try {
      const res = await authService.register(name, email, password)
      setIsLoading(false)
      
      // If the backend returns success but no accessToken is present,
      // it indicates that Supabase email confirmation is enabled and pending.
      if (!res.accessToken) {
        localStorage.setItem('pendingEmailConfirmation', 'true')
        localStorage.setItem('pendingEmail', email)
        setSuccessMessage('Please check your email to confirm your account.')
      } else {
        navigate('/dashboard')
      }
    } catch (err: any) {
      setIsLoading(false)
      setError(err.message || 'Registration failed. Please try again.')
    }
  }

  // Check-Email Verification View
  if (successMessage) {
    return (
      <div className="min-h-screen flex bg-background text-text-primary transition-colors duration-200 select-none items-center justify-center p-6">
        {/* Floating Theme Switcher */}
        <div className="absolute top-5 right-5 z-50">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full bg-surface border border-border shadow-xs hover:bg-[#F3F4F6] dark:hover:bg-[#27272A] text-neutral-400 hover:text-text-primary dark:text-neutral-500 dark:hover:text-white transition-colors cursor-pointer"
            title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
          >
            {theme === 'light' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </button>
        </div>

        <div className="w-full max-w-[400px] space-y-6 text-center border border-border bg-surface p-8 rounded-[16px] shadow-xs">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/20 text-blue-500 flex items-center justify-center mx-auto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-[22px] font-extrabold tracking-tight">Check your email</h1>
            <p className="text-[13px] text-text-secondary leading-relaxed">
              We've sent a verification link to <strong className="text-text-primary">{email}</strong>.
              Please click the link in your inbox to confirm your account before signing in.
            </p>
          </div>

          <Link
            to="/login"
            className="block w-full text-center py-2.5 rounded-[12px] bg-black dark:bg-white text-white dark:text-black text-[13.5px] font-bold hover:bg-neutral-850 dark:hover:bg-neutral-100 transition-colors cursor-pointer shadow-2xs"
          >
            Back to Sign In
          </Link>

          <button
            onClick={() => {
              localStorage.removeItem('pendingEmailConfirmation')
              localStorage.removeItem('pendingEmail')
              setSuccessMessage('')
              setEmail('')
              setPassword('')
            }}
            className="block w-full text-center py-2.5 rounded-[12px] border border-border text-[13.5px] font-bold hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
          >
            Use a different email / Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-background text-text-primary transition-colors duration-200 select-none">
      {/* Floating Theme Switcher */}
      <div className="absolute top-5 right-5 z-50">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-full bg-surface border border-border shadow-xs hover:bg-[#F3F4F6] dark:hover:bg-[#27272A] text-neutral-400 hover:text-text-primary dark:text-neutral-500 dark:hover:text-white transition-colors cursor-pointer"
          title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
        >
          {theme === 'light' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
        </button>
      </div>

      {/* Left Panel: Brand & Testimonial (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 text-white relative flex-col justify-between p-12 overflow-hidden">
        {/* Subtle tech grid accent */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        {/* Glowing blobs */}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Logo */}
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="w-5 h-5 rounded-full bg-white flex-shrink-0" />
          <span className="text-[17px] font-extrabold tracking-tight">InterviewAI</span>
        </div>

        {/* Feature/Testimonial Center */}
        <div className="max-w-[440px] space-y-8 relative z-10">
          <h2 className="text-[36px] font-extrabold tracking-tight leading-tight">
            Start practicing mock loops in seconds.
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[11px] font-bold mt-1">✓</div>
              <p className="text-[14.5px] text-zinc-300">Realistic role-specific audio and code simulations</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[11px] font-bold mt-1">✓</div>
              <p className="text-[14.5px] text-zinc-300">Detailed performance reports detailing STAR metrics</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[11px] font-bold mt-1">✓</div>
              <p className="text-[14.5px] text-zinc-300">Targeted skill maps to help land top tier offers</p>
            </div>
          </div>
        </div>

        {/* Testimonial Quote Footer */}
        <div className="border-t border-zinc-800 pt-6 relative z-10">
          <blockquote className="text-[14px] italic text-zinc-400 leading-relaxed">
            "The mock interviews felt exactly like the real loop at Stripe. The feedback reports pointed out specific architectural trade-offs I was ignoring."
          </blockquote>
          <div className="mt-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[11px] font-bold text-white border border-zinc-700">JD</div>
            <div>
              <div className="text-[13px] font-bold text-white">John Doe</div>
              <div className="text-[11px] text-zinc-500">Software Engineer, Stripe</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 md:px-12">
        <div className="w-full max-w-[400px] space-y-7">
          {/* Mobile Header Logo */}
          <div className="flex items-center gap-2.5 lg:hidden justify-center mb-6">
            <div className="w-5 h-5 rounded-full bg-black dark:bg-white flex-shrink-0" />
            <span className="text-[17px] font-extrabold tracking-tight">InterviewAI</span>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-[26px] font-extrabold tracking-tight">Create an account</h1>
            <p className="text-[14px] text-text-secondary">
              Enter your details to create your mock preparation account.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-[12px] bg-error-light text-error border border-error/10 p-3.5 text-[12.5px] font-semibold">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-[12px] border border-border bg-surface pl-10 pr-4 py-2.5 text-[14px] text-text-primary placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="absolute left-3.5 top-3.5 text-neutral-400 dark:text-neutral-500">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-[12px] border border-border bg-surface pl-10 pr-4 py-2.5 text-[14px] text-text-primary placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="absolute left-3.5 top-3.5 text-neutral-400 dark:text-neutral-500">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-[12px] border border-border bg-surface pl-10 pr-10 py-2.5 text-[14px] text-text-primary placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="absolute left-3.5 top-3.5 text-neutral-400 dark:text-neutral-500">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-neutral-400 dark:text-neutral-500 hover:text-text-primary transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-2.5 rounded-[12px] bg-black dark:bg-white text-white dark:text-black text-[14px] font-bold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all cursor-pointer shadow-sm relative overflow-hidden h-[42px] disabled:opacity-85"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="text-center text-[13.5px] text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-accent hover:text-accent-hover transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
