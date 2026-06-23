const jobs = [
  {
    company: 'Stripe',
    role: 'Senior Frontend Engineer',
    location: 'San Francisco · Remote',
    match: 94,
    salary: '$180K – $250K',
  },
  {
    company: 'Linear',
    role: 'Product Engineer',
    location: 'San Francisco · Hybrid',
    match: 88,
    salary: '$160K – $220K',
  },
  {
    company: 'Vercel',
    role: 'Developer Experience Engineer',
    location: 'Remote · US',
    match: 85,
    salary: '$155K – $210K',
  },
  {
    company: 'Notion',
    role: 'Full Stack Engineer',
    location: 'New York · In-office',
    match: 82,
    salary: '$170K – $230K',
  },
  {
    company: 'Figma',
    role: 'Design Systems Engineer',
    location: 'San Francisco · Hybrid',
    match: 79,
    salary: '$150K – $200K',
  },
  {
    company: 'Arc Browser',
    role: 'Core Platform Engineer',
    location: 'New York · Remote',
    match: 76,
    salary: '$165K – $225K',
  },
]

export default function JobRecommendations() {
  return (
    <div className="max-w-[800px] mx-auto">
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold tracking-[-0.6px] text-text-primary mb-1">
          Recommended for You
        </h1>
        <p className="text-[15px] text-text-secondary">Based on your interview performance and skill profile.</p>
      </div>

      <div className="space-y-3">
        {jobs.map((job, i) => (
          <div
            key={i}
            className="flex items-center rounded-[12px] border border-border bg-surface p-5 hover:border-[#D1D5DB] transition-colors"
          >
            <div className="w-10 h-10 rounded-[10px] bg-[#F3F4F6] flex items-center justify-center text-[14px] font-semibold text-text-secondary flex-shrink-0">
              {job.company[0]}
            </div>

            <div className="ml-4 flex-1 min-w-0">
              <div className="text-[15px] font-semibold text-text-primary">{job.role}</div>
              <div className="text-[13px] text-text-secondary mt-0.5">
                {job.company} · {job.location}
              </div>
              <div className="text-[13px] text-text-secondary mt-0.5">{job.salary}</div>
            </div>

            <div className="flex items-center gap-4 ml-4">
              <div className="text-right">
                <div className="text-[15px] font-semibold text-success">{job.match}%</div>
                <div className="text-[12px] text-text-secondary">match</div>
              </div>
              <button className="px-4 py-2 rounded-[10px] border border-border text-[14px] font-medium text-text-primary hover:bg-[#F9FAFB] transition-colors">
                Apply
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
