import { useMutation } from "@tanstack/react-query";
import {
  interviewService,
  type CreateInterviewPayload,
  type CreateInterviewResponse,
} from "../services/interview";

export function useCreateInterview() {
  return useMutation<CreateInterviewResponse, Error, CreateInterviewPayload>({
    mutationFn: (payload) => interviewService.createInterview(payload),
  });
}
