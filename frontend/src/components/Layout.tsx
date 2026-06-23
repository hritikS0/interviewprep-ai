import { useState, useRef, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { authService } from '../services/auth'

interface SessionUser {
  name: string
  email: string
}

function getSessionUser(): SessionUser {
  try {
    const userJson = localStorage.getItem('user')
    if (userJson) {
      return JSON.parse(userJson)
    }
  } catch (e) {
    console.error('Failed to parse user session:', e)
  }
  return { name: 'John Doe', email: 'john.doe@example.com' }
}

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-background text-text-primary transition-colors duration-200">
      <Sidebar />
      <main className="flex-1 ml-60 flex flex-col min-w-0">
        {/* Top Header toolbar with profile dropdown */}
        <header className="h-[56px] border-b border-border bg-surface flex items-center justify-end px-10 flex-shrink-0 transition-colors duration-200 select-none">
          <ProfileDropdown />
        </header>

        {/* Page View Wrapper */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-[1280px] mx-auto px-10 py-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}

function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const user = getSessionUser()
  const initial = user.name ? user.name.charAt(0).toUpperCase() : 'H'

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 p-1 rounded-full hover:bg-[#F3F4F6] dark:hover:bg-[#27272A] transition-colors cursor-pointer focus:outline-none"
      >
        <div className="w-[28px] h-[28px] rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-[12px] font-bold flex-shrink-0">
          {initial}
        </div>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-neutral-400 dark:text-neutral-500 mr-0.5">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 rounded-xl border border-border bg-surface shadow-lg py-1.5 z-50 origin-top-right animate-dropdown">
          {/* Header */}
          <div className="px-4 py-2 border-b border-border">
            <div className="text-[13px] font-bold text-text-primary truncate">{user.name}</div>
            <div className="text-[11px] text-text-secondary truncate mt-0.5 font-medium">{user.email}</div>
          </div>

          {/* Links */}
          <div className="py-1">
            <button
              onClick={() => { setIsOpen(false); navigate('/dashboard') }}
              className="w-full text-left px-4 py-1.5 text-[12.5px] font-semibold text-text-primary hover:bg-[#F3F4F6] dark:hover:bg-[#27272A] transition-colors cursor-pointer"
            >
              Dashboard
            </button>
            <button
              onClick={() => { setIsOpen(false); navigate('/settings') }}
              className="w-full text-left px-4 py-1.5 text-[12.5px] font-semibold text-text-primary hover:bg-[#F3F4F6] dark:hover:bg-[#27272A] transition-colors cursor-pointer"
            >
              Settings
            </button>
          </div>

          <div className="border-t border-border my-1" />

          {/* Sign Out */}
          <div className="py-1">
            <button
              onClick={async () => {
                setIsOpen(false)
                await authService.logout()
                navigate('/login')
              }}
              className="w-full text-left px-4 py-1.5 text-[12.5px] font-bold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function Sidebar() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light'
  })

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

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-medium transition-colors ${
      isActive
        ? 'bg-[#F3F4F6] dark:bg-[#27272A] text-text-primary font-semibold'
        : 'text-text-secondary hover:text-text-primary hover:bg-[#F3F4F6]/50 dark:hover:bg-[#27272A]/50'
    }`

  const user = getSessionUser()
  const initial = user.name ? user.name.charAt(0).toUpperCase() : 'H'

  return (
    <aside className="fixed top-0 left-0 h-full w-60 flex flex-col border-r border-border bg-surface select-none transition-colors duration-200">
      {/* Brand logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="w-[18px] h-[18px] rounded-full bg-black dark:bg-white flex-shrink-0 transition-colors" />
        <span className="text-[16px] font-bold text-text-primary tracking-[-0.3px]">
          InterviewAI
        </span>
      </div>

      {/* Search Input */}
      <div className="px-3 mb-4">
        <div className="relative flex items-center bg-[#FAFAF9] dark:bg-[#121212] border border-border rounded-lg px-2.5 py-1.5 focus-within:border-neutral-300 dark:focus-within:border-neutral-700 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="mr-2 text-neutral-400 dark:text-neutral-500">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent text-[13px] text-text-primary placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none w-full pr-8"
            readOnly
          />
          <kbd className="absolute right-2 px-1.5 py-0.5 text-[9px] font-semibold text-neutral-400 dark:text-neutral-500 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#18181B] rounded shadow-xs pointer-events-none transition-colors">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 space-y-0.5">
        <NavLink to="/dashboard" className={linkClass}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
          Dashboard
        </NavLink>

        <NavLink to="/setup" className={linkClass}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Interview
        </NavLink>

        <NavLink to="/interview" className={linkClass}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
            <line x1="12" y1="19" x2="12" y2="22" />
          </svg>
          Live Interview
        </NavLink>

        <NavLink to="/coding" className={linkClass}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          Coding Round
        </NavLink>

        <NavLink to="/report" className={linkClass}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          Reports
        </NavLink>

        <NavLink to="/jobs" className={linkClass}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
          Jobs
        </NavLink>

        <NavLink to="/settings" className={linkClass}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          Settings
        </NavLink>
      </nav>

      {/* User profile at bottom */}
      <div className="px-4 py-4 border-t border-border flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-[28px] h-[28px] rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-[12px] font-bold flex-shrink-0 transition-colors">
            {initial}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-semibold text-text-primary leading-none truncate">{user.name}</span>
            <span className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5 leading-none truncate">{user.email}</span>
          </div>
        </div>
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md hover:bg-[#F3F4F6] dark:hover:bg-[#27272A] text-neutral-400 hover:text-text-primary dark:text-neutral-500 dark:hover:text-white transition-colors cursor-pointer flex-shrink-0"
          title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
        >
          {theme === 'light' ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
    </aside>
  )
}
