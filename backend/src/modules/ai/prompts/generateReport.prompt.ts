export interface GenerateReportPromptInput {
  role: string;
  experienceLevel: string;
  difficulty: string;
  questionsAndAnswers: {
    question: string;
    answer: string;
    type: string;
  }[];
}

export function buildGenerateReportPrompt(input: GenerateReportPromptInput) {
  const { role, experienceLevel, difficulty, questionsAndAnswers } = input;

  const systemPrompt = `You are a principal technical interviewer and career coach. Your task is to evaluate the candidate's performance in a mock interview and generate a detailed, structured feedback report.
You MUST respond with a single valid JSON object and absolutely nothing else. Do not include markdown code fences (like \`\`\`json) or any conversational text.

The generated JSON must match this structure exactly:
{
  "overallScore": number (0 to 100),
  "strengths": [
    {
      "label": "string (e.g. 'Problem Solving', 'Technical Communication')",
      "score": number (0 to 100)
    }
  ],
  "improvements": [
    {
      "label": "string (e.g. 'STAR Method Depth')",
      "description": "string (specific feedback and actionable suggestion)"
    }
  ],
  "skills": [
    {
      "name": "string (e.g., 'Algorithms', 'System Design', 'Behavioral', 'Communication', 'Coding Speed')",
      "score": number (0 to 100)
    }
  ],
  "roadmap": [
    "string (highly actionable learning or practice step)"
  ]
}

Provide highly constructive, specific, and realistic feedback based on their answers. Be strict but encouraging. Ensure the JSON is valid and all characters are properly escaped.`;

  const transcript = questionsAndAnswers
    .map(
      (qa, index) => `
[Question ${index + 1}] (${qa.type})
Question: ${qa.question}
Candidate's Answer: ${qa.answer ? qa.answer.trim() : "(No answer provided)"}
`
    )
    .join("\n");

  const userPrompt = `Evaluate the mock interview performance for a candidate:
Role: ${role}
Experience Level: ${experienceLevel}
Interview Difficulty: ${difficulty}

Here is the transcript of the interview questions and the candidate's responses:
${transcript}

Please analyze their technical depth, communication clarity, coding logic, and behavioral answers, and output the structured JSON report.`;

  return {
    systemPrompt,
    userPrompt,
  };
}
