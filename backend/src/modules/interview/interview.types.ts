export interface CreateInterviewInput {
  role: string;
  experienceLevel: string;
  interviewType: string;
  difficulty: string;
  preferredLanguage: string;
  duration: number;
  companyName?: string;
  jobDescription?: string;
}

export interface InterviewResponse {
  id: string;
  userId: string;
  role: string;
  experienceLevel: string;
  interviewType: string;
  difficulty: string;
  preferredLanguage: string;
  duration: number;
  companyName: string | null;
  jobDescription: string | null;
  status: string;
  currentRound: number;
  createdAt: Date;
  updatedAt: Date;
}
