import { useState, useEffect } from 'react'
import { interviewService } from '../services/interview'
import { toast } from 'sonner'

interface JobOpportunity {
  company: string;
  role: string;
  location: string;
  match: number;
  salary: string;
  url: string;
  tags?: string[];
}

export default function JobRecommendations() {
  const [jobs, setJobs] = useState<JobOpportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [appliedRole, setAppliedRole] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  
  // Location filtering states
  const [locationFilter, setLocationFilter] = useState('')
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [detectedCountry, setDetectedCountry] = useState('')

  // Load candidate's last interview to pre-populate the search query
  useEffect(() => {
    const initJobsAndSearch = async () => {
      try {
        setLoading(true)
        const interviews = await interviewService.getInterviews()
        let initialQuery = ''
        
        if (interviews && interviews.length > 0) {
          // Sort by date to get the most recent
          const sorted = [...interviews].sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          const latestRole = sorted[0].role
          if (latestRole) {
            initialQuery = latestRole
            setAppliedRole(latestRole)
            setSearchQuery(latestRole)
          }
        }
        
        const fetchedJobs = await interviewService.getRecommendedJobs(initialQuery)
        setJobs(fetchedJobs)
      } catch (err: any) {
        console.error('Failed to load job recommendations:', err)
        toast.error('Failed to load recommended jobs')
      } finally {
        setLoading(false)
      }
    }

    initJobsAndSearch()
  }, [])

  // Trigger search manually or on submit
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    try {
      setIsSearching(true)
      const fetchedJobs = await interviewService.getRecommendedJobs(searchQuery)
      setJobs(fetchedJobs)
    } catch (err: any) {
      console.error('Search failed:', err)
      toast.error('Search failed')
    } finally {
      setIsSearching(false)
    }
  }

  // Clear search and reload all recommendations
  const handleClearSearch = async () => {
    setSearchQuery('')
    setLocationFilter('')
    setDetectedCountry('')
    try {
      setIsSearching(true)
      const fetchedJobs = await interviewService.getRecommendedJobs('')
      setJobs(fetchedJobs)
    } catch (err) {
      console.error('Failed to clear search:', err)
    } finally {
      setIsSearching(false)
    }
  }

  // Get user's location via geolocation API and reverse-geocode it for free
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser")
      return
    }

    setDetectingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          // Free keyless open reverse geocoding API
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=3`, {
            headers: {
              'Accept-Language': 'en'
            }
          })
          if (res.ok) {
            const data = await res.json()
            const country = data.address?.country
            if (country) {
              toast.success(`Detected location: ${country}`)
              setDetectedCountry(country)
              setLocationFilter(country)
            } else {
              toast.error("Could not parse country from coordinates")
            }
          } else {
            toast.error("Location service failed to respond")
          }
        } catch (err) {
          console.error("Reverse geocoding failed:", err)
          toast.error("Failed to translate coordinates to country")
        } finally {
          setDetectingLocation(false)
        }
      },
      (error) => {
        console.error("Geolocation error:", error)
        toast.error("Permission denied or location lookup failed")
        setDetectingLocation(false)
      },
      { timeout: 10000 }
    )
  }

  // Client-side filtering of backend jobs array based on location selection
  const filteredJobs = jobs.filter((job) => {
    if (!locationFilter) return true
    
    const filterLower = locationFilter.toLowerCase()
    const locLower = job.location.toLowerCase()
    const companyLower = job.company.toLowerCase()
    const roleLower = job.role.toLowerCase()
    
    if (filterLower === 'remote') {
      return locLower.includes('remote')
    }
    
    if (filterLower === 'usa' || filterLower === 'us' || filterLower === 'united states') {
      return locLower.includes('us') || locLower.includes('usa') || locLower.includes('united states') || locLower.includes('san francisco') || locLower.includes('new york')
    }

    if (filterLower === 'europe' || filterLower === 'eu') {
      return locLower.includes('europe') || locLower.includes('eu') || locLower.includes('germany') || locLower.includes('uk') || locLower.includes('london') || locLower.includes('berlin') || locLower.includes('paris')
    }

    return locLower.includes(filterLower) || companyLower.includes(filterLower) || roleLower.includes(filterLower)
  })

  // Fallback to Remote jobs if specific country/location filter yielded 0 results
  const showFallbackRemote = locationFilter !== '' && locationFilter !== 'remote' && filteredJobs.length === 0
  const displayJobs = showFallbackRemote 
    ? jobs.filter(job => job.location.toLowerCase().includes('remote'))
    : filteredJobs

  return (
    <div className="max-w-[850px] mx-auto py-4 px-2">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-[-0.6px] text-text-primary mb-1">
            Job Recommendations
          </h1>
          <p className="text-[14.5px] text-text-secondary font-medium">
            Discover matching job opportunities based on your mock interview performance.
          </p>
        </div>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="mb-4">
        <div className="relative flex items-center">
          <div className="absolute left-4 text-text-secondary pointer-events-none">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search jobs by role, company, or skills (e.g. React, Python)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-24 py-3 rounded-[14px] border border-border bg-surface text-[14.5px] text-text-primary placeholder:text-text-secondary/50 focus:border-black dark:focus:border-white focus:outline-none transition-colors"
          />
          <div className="absolute right-2.5 flex items-center gap-1.5">
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="p-1.5 text-text-secondary hover:text-text-primary transition-colors rounded-full"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-1.5 rounded-[10px] bg-black dark:bg-white text-white dark:text-black text-[13px] font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </form>

      {/* Location Filter Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[12.5px] font-bold text-text-secondary mr-1">Filter Location:</span>
          
          <button
            onClick={() => setLocationFilter('')}
            className={`px-3 py-1.5 rounded-full text-[12.5px] font-bold border transition-colors cursor-pointer ${
            locationFilter === ''
                ? 'bg-black text-white dark:bg-white dark:text-black border-transparent'
                : 'bg-surface hover:bg-neutral-50 dark:hover:bg-zinc-800 text-text-primary border-border'
            }`}
          >
            All
          </button>
          
          <button
            onClick={() => setLocationFilter('remote')}
            className={`px-3 py-1.5 rounded-full text-[12.5px] font-bold border transition-colors cursor-pointer ${
              locationFilter === 'remote'
                ? 'bg-black text-white dark:bg-white dark:text-black border-transparent'
                : 'bg-surface hover:bg-neutral-50 dark:hover:bg-zinc-800 text-text-primary border-border'
            }`}
          >
            Remote
          </button>
          
          <button
            onClick={() => setLocationFilter('usa')}
            className={`px-3 py-1.5 rounded-full text-[12.5px] font-bold border transition-colors cursor-pointer ${
              locationFilter === 'usa'
                ? 'bg-black text-white dark:bg-white dark:text-black border-transparent'
                : 'bg-surface hover:bg-neutral-50 dark:hover:bg-zinc-800 text-text-primary border-border'
            }`}
          >
            US/USA
          </button>
          
          <button
            onClick={() => setLocationFilter('europe')}
            className={`px-3 py-1.5 rounded-full text-[12.5px] font-bold border transition-colors cursor-pointer ${
              locationFilter === 'europe'
                ? 'bg-black text-white dark:bg-white dark:text-black border-transparent'
                : 'bg-surface hover:bg-neutral-50 dark:hover:bg-zinc-800 text-text-primary border-border'
            }`}
          >
            Europe
          </button>

          <button
            onClick={() => setLocationFilter('germany')}
            className={`px-3 py-1.5 rounded-full text-[12.5px] font-bold border transition-colors cursor-pointer ${
              locationFilter === 'germany'
                ? 'bg-black text-white dark:bg-white dark:text-black border-transparent'
                : 'bg-surface hover:bg-neutral-50 dark:hover:bg-zinc-800 text-text-primary border-border'
            }`}
          >
            Germany
          </button>

          {detectedCountry && (
            <button
              onClick={() => setLocationFilter(detectedCountry)}
              className={`px-3 py-1.5 rounded-full text-[12.5px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                locationFilter === detectedCountry
                  ? 'bg-black text-white dark:bg-white dark:text-black border-transparent'
                  : 'bg-surface hover:bg-neutral-50 dark:hover:bg-zinc-800 text-text-primary border-border'
              }`}
            >
              {detectedCountry}
            </button>
          )}
        </div>

        <button
          type="button"
          disabled={detectingLocation}
          onClick={handleUseMyLocation}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] border border-border bg-surface text-[12.5px] font-bold text-text-primary hover:bg-[#F9FAFB] dark:hover:bg-[#1f1f23] transition-colors cursor-pointer disabled:opacity-50"
        >
          <svg className={detectingLocation ? 'animate-spin' : ''} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {detectingLocation ? 'Detecting...' : 'Detect Country'}
        </button>
      </div>

      {/* Auto-searched Context Banner */}
      {appliedRole && searchQuery === appliedRole && (
        <div className="mb-6 flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-neutral-100/70 dark:bg-[#18181b] border border-border text-[13px] text-text-secondary font-semibold">
          <svg className="text-amber-500 flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>
            Displaying recommendations matching <strong className="text-text-primary">"{appliedRole}"</strong> from your recent interview.
          </span>
        </div>
      )}

      {/* Main List Area */}
      {showFallbackRemote && (
        <div className="mb-5 flex items-center gap-2.5 px-4 py-3 rounded-[12px] bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 text-[13px] text-blue-700 dark:text-blue-400 font-semibold">
          <svg className="flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>
            No jobs found matching <strong className="text-text-primary">"{locationFilter}"</strong>. Displaying <strong className="text-text-primary">Remote</strong> positions instead.
          </span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="border border-border bg-surface p-5 rounded-[16px] animate-pulse flex items-center gap-4">
              <div className="w-10 h-10 rounded-[12px] bg-neutral-200 dark:bg-neutral-800" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3" />
                <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
              </div>
              <div className="w-16 h-8 bg-neutral-200 dark:bg-neutral-800 rounded-[10px]" />
            </div>
          ))}
        </div>
      ) : displayJobs.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-[20px] bg-surface/50">
          <svg className="mx-auto mb-4 text-text-secondary" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <h3 className="text-[17px] font-bold text-text-primary mb-1">No matching jobs found</h3>
          <p className="text-[14px] text-text-secondary mb-5 max-w-sm mx-auto font-medium">
            We couldn't find any listings matching your filters. Try selecting "All Locations" or typing a different keyword.
          </p>
          {(searchQuery || locationFilter) && (
            <button
              onClick={handleClearSearch}
              className="px-5 py-2 rounded-full border border-border text-[13px] font-bold text-text-primary hover:bg-[#F9FAFB] dark:hover:bg-[#1f1f23] transition-colors"
            >
              Clear Filters & Show All
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {displayJobs.map((job, idx) => (
            <div
              key={idx}
              className="flex items-center rounded-[16px] border border-border bg-surface p-5 hover:border-[#CCCCCC] dark:hover:border-zinc-700 transition-colors shadow-xs"
            >
              <div className="w-11 h-11 rounded-[12px] bg-black/5 dark:bg-white/5 border border-border flex items-center justify-center text-[15px] font-black text-text-primary flex-shrink-0">
                {job.company[0]}
              </div>

              <div className="ml-4 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[15.5px] font-bold text-text-primary truncate">{job.role}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F5E9] dark:bg-green-950/20 text-[#2E7D32] dark:text-green-400">
                    {job.location}
                  </span>
                </div>
                <div className="text-[13px] text-text-secondary mt-1 font-semibold">
                  {job.company}
                </div>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-[12px] font-bold text-text-secondary bg-[#F3F4F6] dark:bg-[#27272A] px-2 py-0.5 rounded-md">
                    {job.salary}
                  </span>
                  {job.tags && job.tags.slice(0, 3).map((tag, tIdx) => (
                    <span key={tIdx} className="text-[11px] font-semibold text-text-secondary/80 border border-border/80 px-2 py-0.5 rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-5 ml-4">
                <div className="text-right">
                  <div className={`text-[16px] font-black ${
                    job.match >= 90 ? 'text-[#2E7D32] dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {job.match}%
                  </div>
                  <div className="text-[11px] text-text-secondary font-bold">match</div>
                </div>
                <button
                  onClick={() => window.open(job.url, '_blank')}
                  className="px-4.5 py-2.5 rounded-[12px] border border-border text-[13px] font-bold text-text-primary hover:bg-[#F9FAFB] dark:hover:bg-[#1f1f23] transition-colors cursor-pointer flex-shrink-0"
                >
                  Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
