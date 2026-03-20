const GEMINI_API_KEY = process.env.GEMINI_API_KEY!
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`

export async function generateWithGemini(prompt: string): Promise<string> {
    const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
        })
    })
    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

export async function generateStudyPlan(
    subjects: string[],
    hoursPerDay: number,
    examDates?: Record<string, string>
): Promise<any> {
    const examInfo = examDates
        ? Object.entries(examDates).map(([s, d]) => `${s}: ${d}`).join(', ')
        : 'No specific exam dates'

    const prompt = `You are StudyPilot AI, an expert academic study planner.

Create a detailed 7-day study plan for a student with the following details:
- Subjects: ${subjects.join(', ')}
- Available study hours per day: ${hoursPerDay} hours
- Exam dates: ${examInfo}

Return ONLY a valid JSON object with this exact structure:
{
  "plan": [
    {
      "day": "Monday",
      "date": "Day 1",
      "totalHours": 3,
      "sessions": [
        {
          "subject": "Mathematics",
          "time": "8:00 AM - 10:00 AM",
          "duration": 120,
          "topic": "Calculus - Integration",
          "color": "#7c3aed"
        }
      ]
    }
  ],
  "tips": ["Study tip 1", "Study tip 2", "Study tip 3"],
  "summary": "Brief overview of the plan"
}

Rules:
- Distribute subjects based on exam proximity
- Include short breaks between sessions
- Keep sessions between 60-120 minutes
- Colors: Mathematics=#7c3aed, Physics=#db2777, Chemistry=#6d28d9, English=#d97706, Biology=#059669, default=#7c3aed
- Return ONLY the JSON, no markdown, no explanation`

    const response = await generateWithGemini(prompt)
    const clean = response.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
}

export async function generateAIResponse(
    message: string,
    subject?: string
): Promise<string> {
    const prompt = `You are StudyPilot AI, a friendly and knowledgeable study assistant for students.
${subject ? `The student is currently studying: ${subject}` : ''}

Student message: "${message}"

Respond helpfully, concisely, and in an encouraging tone. If they ask for a quiz, create one. If they ask for an explanation, give a clear one. Keep responses under 300 words.`

    return await generateWithGemini(prompt)
}

export async function generateWeeklyReport(stats: {
    totalHours: number
    tasksCompleted: number
    streak: number
    subjects: string[]
}): Promise<string> {
    const prompt = `You are StudyPilot AI. Write a brief encouraging weekly study report.

Stats:
- Total hours studied: ${stats.totalHours}h
- Tasks completed: ${stats.tasksCompleted}
- Study streak: ${stats.streak} days
- Subjects studied: ${stats.subjects.join(', ')}

Write 3-4 sentences: acknowledge their effort, highlight what went well, give one specific tip for next week. Be warm and motivating. Keep it under 100 words.`

    return await generateWithGemini(prompt)
}