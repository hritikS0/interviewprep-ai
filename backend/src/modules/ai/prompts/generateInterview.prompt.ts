export interface GenerateInterviewPromptInput {
  role: string;
  experienceLevel: string;
  skills: string[];
  targetCompany?: string | null;
  jobDescription?: string | null;
}

export function buildGenerateInterviewPrompt(input: GenerateInterviewPromptInput) {
  const { role, experienceLevel, skills, targetCompany, jobDescription } = input;

  const skillsList = skills.join(", ");
  const companyInfo = targetCompany ? `Target Company: ${targetCompany}` : "Target Company: Any standard tech company";
  const jdInfo = jobDescription ? `Job Description:\n${jobDescription}` : "Job Description: Standard expectations for this role and experience level";

  const systemPrompt = `You are an expert technical interviewer and recruiter. Your job is to generate a comprehensive, structured mock interview plan for a candidate.
You MUST respond with a single valid JSON object and absolutely nothing else. Do not include markdown code fences (like \`\`\`json) or any conversational text.

The generated JSON must match this structure exactly:
{
  "difficulty": "Easy" | "Medium" | "Hard",
  "estimatedDuration": "45 mins" | "60 mins" | "90 mins",
  "rounds": [
    {
      "name": "Introduction",
      "questions": [
        {
          "topic": "string",
          "difficulty": "string",
          "question": "string"
        }
      ]
    },
    {
      "name": "Technical",
      "questions": [
        {
          "topic": "string",
          "difficulty": "string",
          "question": "string"
        }
      ]
    },
    {
      "name": "Coding",
      "questions": [
        {
          "topic": "string",
          "difficulty": "string",
          "question": "string",
          "metadata": {
            "title": "string",
            "description": "string",
            "constraints": "string",
            "examples": [
              {
                "input": "string",
                "output": "string",
                "explanation": "string (optional)"
              }
            ],
            "hiddenTestCases": [
              {
                "input": "string",
                "output": "string"
              }
            ],
            "expectedComplexity": "string"
          }
        }
      ]
    },
    {
      "name": "Behavioral",
      "questions": [
        {
          "topic": "string",
          "difficulty": "string",
          "question": "string"
        }
      ]
    }
  ]
}

Round Requirements:
1. "Introduction" round should contain 1-2 soft/introductory questions.
2. "Technical" round should contain 3-5 specific conceptual questions covering the candidate's skills and the role requirements.
3. "Coding" round should contain exactly 1 challenge in the "questions" array. The "metadata" field is REQUIRED for this round and must specify coding problem details (title, description, constraints, examples, hiddenTestCases, and expectedComplexity).
4. "Behavioral" round should contain 2-3 behavioral questions assessing teamwork, conflict resolution, or challenge-handling.

Make the generated questions highly relevant to the candidate's profile and targeted role.`;

  const userPrompt = `Generate a mock interview plan for:
Role: ${role}
Experience Level: ${experienceLevel}
Skills: ${skillsList}
${companyInfo}
${jdInfo}

Ensure the questions are realistic and tailored specifically to these inputs. Validate that the JSON object is completely valid and properly escaped.`;

  return {
    systemPrompt,
    userPrompt,
  };
}
