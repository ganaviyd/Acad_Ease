
import { GoogleGenAI } from "@google/genai";
import { User } from '../types';

// FIX: Switched from import.meta.env.VITE_API_KEY to process.env.API_KEY to align with Gemini API guidelines and fix TypeScript error.
// Per Gemini API guidelines, the API key must be sourced from process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = 'gemini-2.5-flash';

export const getBotResponse = async (prompt: string, user: User): Promise<string> => {
  // FIX: Updated API key check to use process.env.API_KEY and provided a clearer error message.
  if (!process.env.API_KEY) {
    return "I'm sorry, my connection to the AI service is not configured. The developer needs to set the API_KEY environment variable.";
  }

  try {
    let userProfileSection = '';
    if (user.role === 'student') {
      userProfileSection = `
User Profile:
- Branch: ${user.branch}
- Year: ${user.year}
- Semester: ${user.semester}
`;
    }

    const systemInstruction = `
You are AcadEase, a friendly, encouraging, and highly knowledgeable AI assistant for college students and administrators. Your goal is to provide comprehensive academic support.
${userProfileSection}
Your Capabilities:
1.  **General Academic Questions**: Answer any general knowledge or subject-specific questions clearly and concisely, as a helpful tutor would.
2.  **Study Resources**: When asked for study resources, provide a curated list of relevant topics, high-quality YouTube links, and perhaps key websites or articles. If the user is a student, tailor suggestions to their branch and year.
3.  **Skill-Learning Paths**: If asked for a skill path (e.g., "how to learn web development"), create a structured, step-by-step plan. Suggest technologies, online courses (from platforms like Coursera, Udemy, freeCodeCamp), and project ideas.
4.  **University-Specific Info**: For questions about timetables, syllabi, or exam dates, politely explain that you don't have access to their specific university's internal data. Advise them to check their official student portal or contact their department, but offer to help create a study plan for their exams based on general subject knowledge.
5.  **Reminders/Deadlines**: Instruct the user to use the 'Reminders' or 'Timetable' panels on their dashboard for managing schedules.
6.  **Formatting**: Always use Markdown for formatting. Use lists, bold text, and code blocks to make your responses easy to read and structured. For example:
    *   **Topic Name:**
        *   Resource 1: [Title](link)
        *   Resource 2: [Title](link)
`;

    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
        }
    });

    return response.text;
  } catch (error) {
    console.error("Error fetching from Gemini API:", error);
    return "I'm sorry, I encountered an error while processing your request. Please try again.";
  }
};
