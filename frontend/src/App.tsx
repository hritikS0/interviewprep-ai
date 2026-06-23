import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import InterviewSetup from './pages/InterviewSetup'
import LiveInterview from './pages/LiveInterview'
import CodingRound from './pages/CodingRound'
import Report from './pages/Report'
import JobRecommendations from './pages/JobRecommendations'
import Settings from './pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/setup" element={<InterviewSetup />} />
        <Route path="/report" element={<Report />} />
        <Route path="/jobs" element={<JobRecommendations />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="/interview" element={<LiveInterview />} />
      <Route path="/coding" element={<CodingRound />} />
    </Routes>
  )
}
