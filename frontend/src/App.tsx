import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import InterviewSetup from './pages/InterviewSetup'
import LiveInterview from './pages/LiveInterview'
import CodingRound from './pages/CodingRound'
import Report from './pages/Report'
import JobRecommendations from './pages/JobRecommendations'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProtectedRoute from './components/ProtectedRoute'
import { authService } from './services/auth'

export default function App() {
  const navigate = useNavigate()
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationError, setVerificationError] = useState('')

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const hash = window.location.hash
      if (hash && hash.includes('access_token=')) {
        setIsVerifying(true)
        setVerificationError('')
        try {
          const params = new URLSearchParams(hash.substring(1)) // Remove the '#'
          const accessToken = params.get('access_token')
          const refreshToken = params.get('refresh_token')

          if (!accessToken || !refreshToken) {
            throw new Error('Verification tokens missing from URL')
          }

          // Fetch user profile from backend using the temporary access token
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'
          const response = await fetch(`${API_URL}/auth/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          })

          const data = await response.json()
          if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to verify email confirmation with server')
          }

          const user = data.data

          // Save the session
          authService.saveSession({
            user,
            accessToken,
            refreshToken,
          })

          // Clear the pending state
          localStorage.removeItem('pendingEmailConfirmation')
          localStorage.removeItem('pendingEmail')

          // Clear URL hash fragment cleanly
          window.history.replaceState(null, '', window.location.pathname)

          // Redirect to dashboard
          navigate('/dashboard', { replace: true })
        } catch (err: any) {
          console.error('❌ Email confirmation error:', err)
          setVerificationError(err.message || 'Verification failed. Please try signing in.')
          // Clear URL hash fragment cleanly
          window.history.replaceState(null, '', window.location.pathname)
        } finally {
          setIsVerifying(false)
        }
      }
    }

    handleEmailConfirmation()
  }, [navigate])

  if (isVerifying) {
    return (
      <div className="min-h-screen flex bg-background text-text-primary transition-colors duration-200 select-none items-center justify-center p-6">
        <div className="w-full max-w-[400px] space-y-6 text-center border border-border bg-surface p-8 rounded-[16px] shadow-xs">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/20 text-blue-500 flex items-center justify-center mx-auto">
            <svg className="animate-spin h-6 w-6 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-[20px] font-extrabold tracking-tight">Verifying your email</h1>
            <p className="text-[13px] text-text-secondary leading-relaxed">
              We are verifying your account activation status. Please hold on for a moment.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (verificationError) {
    return (
      <div className="min-h-screen flex bg-background text-text-primary transition-colors duration-200 select-none items-center justify-center p-6">
        <div className="w-full max-w-[400px] space-y-6 text-center border border-border bg-surface p-8 rounded-[16px] shadow-xs">
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center mx-auto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-[20px] font-extrabold tracking-tight">Verification Failed</h1>
            <p className="text-[13px] text-error leading-relaxed font-semibold">
              {verificationError}
            </p>
          </div>
          <button
            onClick={() => {
              setVerificationError('')
              navigate('/login')
            }}
            className="block w-full text-center py-2.5 rounded-[12px] bg-black dark:bg-white text-white dark:text-black text-[13.5px] font-bold hover:bg-neutral-850 dark:hover:bg-neutral-100 transition-colors cursor-pointer shadow-2xs"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/setup" element={<InterviewSetup />} />
          <Route path="/report" element={<Report />} />
          <Route path="/jobs" element={<JobRecommendations />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="/interview" element={<LiveInterview />} />
        <Route path="/interview/:interviewId" element={<LiveInterview />} />
        <Route path="/coding" element={<CodingRound />} />
      </Route>
    </Routes>
  )
}
