import api from "./api";

export interface CreateInterviewPayload {
  role: string;
  experienceLevel: string;
  interviewType: string;
  difficulty: string;
  preferredLanguage: string;
  duration: number;
  companyName?: string;
  jobDescription?: string;
}

export interface CreateInterviewResponse {
  interviewId: string;
  status: string;
}

export interface Interview {
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
  createdAt: string;
  updatedAt: string;
  interviewPlan?: any;
  report?: any;
}

export const interviewService = {
  async createInterview(
    payload: CreateInterviewPayload
  ): Promise<CreateInterviewResponse> {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: CreateInterviewResponse;
    }>("/api/interviews", payload);
    return response.data.data;
  },

  async getInterviews(): Promise<Interview[]> {
    const response = await api.get<{
      success: boolean;
      data: Interview[];
    }>("/api/interviews");
    return response.data.data;
  },

  async getInterviewById(id: string): Promise<Interview> {
    const response = await api.get<{
      success: boolean;
      data: Interview;
    }>(`/api/interviews/${id}`);
    return response.data.data;
  },

  async deleteInterview(id: string): Promise<void> {
    await api.delete(`/api/interviews/${id}`);
  },

  async generateInterviewPlan(id: string): Promise<any> {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: any;
    }>(`/api/interviews/${id}/generate`);
    return response.data.data;
  },

  async saveAnswer(id: string, questionText: string, answerText: string): Promise<any> {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: any;
    }>(`/api/interviews/${id}/answers`, { questionText, answerText });
    return response.data.data;
  },

  async submitInterview(id: string): Promise<any> {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: any;
    }>(`/api/interviews/${id}/submit`);
    return response.data.data;
  },

  async getRecommendedJobs(query?: string): Promise<any[]> {
    const response = await api.get<{
      success: boolean;
      data: any[];
    }>("/api/jobs", { params: { query } });
    return response.data.data;
  },
};
