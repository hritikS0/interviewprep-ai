export interface JobOpportunity {
  company: string;
  role: string;
  location: string;
  match: number;
  salary: string;
  url: string;
  tags?: string[];
}

const FALLBACK_JOBS: JobOpportunity[] = [
  {
    company: 'Stripe',
    role: 'Senior Frontend Engineer',
    location: 'Remote',
    match: 94,
    salary: '$180K – $250K',
    url: 'https://stripe.com/jobs',
    tags: ['React', 'TypeScript', 'Frontend']
  },
  {
    company: 'Razorpay',
    role: 'Software Engineer II',
    location: 'Bangalore · Remote (India)',
    match: 92,
    salary: '₹18L – ₹28L',
    url: 'https://razorpay.com/jobs',
    tags: ['React', 'Node.js', 'Backend']
  },
  {
    company: 'Linear',
    role: 'Product Engineer',
    location: 'Remote',
    match: 88,
    salary: '$160K – $220K',
    url: 'https://linear.app/careers',
    tags: ['React', 'TypeScript', 'Fullstack']
  },
  {
    company: 'Groww',
    role: 'Senior Frontend Engineer',
    location: 'Bangalore · Remote (India)',
    match: 89,
    salary: '₹24L – ₹35L',
    url: 'https://groww.in/careers',
    tags: ['React', 'Next.js', 'Frontend']
  },
  {
    company: 'Vercel',
    role: 'Developer Experience Engineer',
    location: 'Remote',
    match: 85,
    salary: '$155K – $210K',
    url: 'https://vercel.com/careers',
    tags: ['Next.js', 'React', 'TypeScript']
  },
  {
    company: 'Zepto',
    role: 'Full Stack Developer',
    location: 'Mumbai · Hybrid / India',
    match: 84,
    salary: '₹15L – ₹25L',
    url: 'https://www.zeptonow.com/careers',
    tags: ['React Native', 'Node.js', 'PostgreSQL']
  },
  {
    company: 'Notion',
    role: 'Full Stack Engineer',
    location: 'Remote',
    match: 82,
    salary: '$170K – $230K',
    url: 'https://notion.so/careers',
    tags: ['React', 'Node.js', 'PostgreSQL']
  },
  {
    company: 'Paytm',
    role: 'Backend Engineer',
    location: 'Noida · Hybrid / India',
    match: 80,
    salary: '₹12L – ₹20L',
    url: 'https://paytm.com/careers',
    tags: ['Java', 'Spring Boot', 'Microservices']
  },
  {
    company: 'Figma',
    role: 'Design Systems Engineer',
    location: 'Remote',
    match: 79,
    salary: '$150K – $200K',
    url: 'https://figma.com/careers',
    tags: ['React', 'C++', 'WASM']
  },
  {
    company: 'Arc Browser',
    role: 'Core Platform Engineer',
    location: 'Remote',
    match: 76,
    salary: '$165K – $225K',
    url: 'https://thebrowser.company/careers',
    tags: ['Swift', 'C++', 'Chromium']
  },
];

export class JobsService {
  async getRecommendedJobs(query?: string): Promise<JobOpportunity[]> {
    let rawJobs: any[] = [];

    try {
      // Fetching from Arbeitnow public, keyless job board API
      const response = await fetch('https://www.arbeitnow.com/api/job-board-api', {
        method: 'GET',
        headers: {
          'User-Agent': 'InterviewPrepAI/1.0 (Contact: team@interviewprep.ai)',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const json = (await response.json()) as any;
        if (json && Array.isArray(json.data)) {
          rawJobs = json.data;
        }
      } else {
        console.warn(`Arbeitnow API returned status ${response.status}. Using fallback jobs.`);
      }
    } catch (error) {
      console.error('Failed to fetch jobs from Arbeitnow:', error);
    }

    let mappedJobs: JobOpportunity[] = [];

    if (rawJobs.length > 0) {
      mappedJobs = rawJobs.map((job: any) => {
        // Generate a deterministic match score between 75 and 97
        const seed = job.slug || job.title || 'seed';
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
          hash = seed.charCodeAt(i) + ((hash << 5) - hash);
        }
        const matchScore = 75 + (Math.abs(hash) % 23);

        // Generate realistic salary estimation based on keywords in title and location
        const title = (job.title || '').toLowerCase();
        const locationStr = (job.location || '').toLowerCase();
        const isIndia = locationStr.includes('india') || locationStr.includes('bangalore') || locationStr.includes('mumbai') || locationStr.includes('noida') || locationStr.includes('delhi') || locationStr.includes('pune') || locationStr.includes('hyderabad') || locationStr.includes('chennai');

        let salaryRange = '';
        if (isIndia) {
          salaryRange = '₹12L – ₹18L';
          if (title.includes('senior') || title.includes('lead') || title.includes('sr.')) {
            salaryRange = '₹22L – ₹35L';
          } else if (title.includes('staff') || title.includes('principal') || title.includes('architect')) {
            salaryRange = '₹35L – ₹55L';
          } else if (title.includes('junior') || title.includes('associate') || title.includes('jr.')) {
            salaryRange = '₹6L – ₹10L';
          }
        } else {
          salaryRange = '$110K – $160K';
          if (title.includes('senior') || title.includes('lead') || title.includes('sr.')) {
            salaryRange = '$150K – $220K';
          } else if (title.includes('staff') || title.includes('principal') || title.includes('architect')) {
            salaryRange = '$200K – $280K';
          } else if (title.includes('junior') || title.includes('associate') || title.includes('jr.')) {
            salaryRange = '$80K – $110K';
          }
        }

        return {
          company: job.company_name || 'Tech Company',
          role: job.title || 'Software Engineer',
          location: job.remote ? 'Remote' : (job.location || 'Hybrid / Remote'),
          match: matchScore,
          salary: salaryRange,
          url: job.url || 'https://www.arbeitnow.com',
          tags: job.tags || []
        };
      });

      // Always inject Indian tech jobs so they are present even when live data loads
      const indiaJobs = FALLBACK_JOBS.filter(job => job.location.toLowerCase().includes('india'));
      mappedJobs = [...mappedJobs, ...indiaJobs];
    } else {
      mappedJobs = [...FALLBACK_JOBS];
    }

    // Apply query filtering if provided
    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      mappedJobs = mappedJobs.filter(job => {
        const matchesRole = job.role.toLowerCase().includes(q);
        const matchesCompany = job.company.toLowerCase().includes(q);
        const matchesLocation = job.location.toLowerCase().includes(q);
        const matchesTags = job.tags ? job.tags.some(tag => tag.toLowerCase().includes(q)) : false;
        return matchesRole || matchesCompany || matchesLocation || matchesTags;
      });
      
      // If we filtered down to zero, and we were using live data, try returning fallback items that match
      if (mappedJobs.length === 0 && rawJobs.length > 0) {
        mappedJobs = FALLBACK_JOBS.filter(job => {
          const matchesRole = job.role.toLowerCase().includes(q);
          const matchesCompany = job.company.toLowerCase().includes(q);
          const matchesTags = job.tags ? job.tags.some(tag => tag.toLowerCase().includes(q)) : false;
          return matchesRole || matchesCompany || matchesTags;
        });
      }
    }

    return mappedJobs;
  }
}
