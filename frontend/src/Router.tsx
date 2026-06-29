import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const InterviewSetup = lazy(() => import('./pages/InterviewSetup'))
const LiveInterview = lazy(() => import('./pages/LiveInterview'))
const CodingRound = lazy(() => import('./pages/CodingRound'))
const Report = lazy(() => import('./pages/Report'))
const JobRecommendations = lazy(() => import('./pages/JobRecommendations'))
const Settings = lazy(() => import('./pages/Settings'))

function PageSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-neutral-200 border-t-accent animate-spin" />
        <span className="text-[13px] font-medium text-text-secondary">Loading</span>
      </div>
    </div>
  )
}

function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  return (
    <div key={location.pathname} className="animate-page-in">
      {children}
    </div>
  )
}

export default function Router() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PageTransition>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

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
      </PageTransition>
    </Suspense>
  )
}
