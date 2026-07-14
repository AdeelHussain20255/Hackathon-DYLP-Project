---
name: gemini-scoring
description: Work with the Google Gemini AI integration for candidate resume scoring in Agentix AI. Use when modifying the AI scoring pipeline, prompt templates, or Gemini API calls.
license: MIT
compatibility: opencode
metadata:
  api: google-genai
---

## Architecture

The project uses `@google/genai` SDK to call `gemini-2.0-flash` for candidate scoring. The API key is exposed via Vite's `import.meta.env.GEMINI_API_KEY` (defined in `vite.config.ts`). Falls back to `import.meta.env.VITE_GEMINI_API_KEY`.

## Scoring Flow (in `src/App.tsx`)

1. User pastes a job description and uploads CV files
2. `handleSubmit()` iterates over each staged CV
3. For each CV, constructs a prompt asking Gemini for JSON output
4. Parses the JSON response for: `name`, `role`, `score` (0-100), `summary`, `email`
5. On API failure, falls back to random heuristic scoring (72-98 range)

## Prompt Template

```typescript
const prompt = `You are a senior HR recruiter AI. Given the following job description and a candidate's CV filename, produce a JSON object with these fields:
- name: string (infer a realistic full name from the filename)
- role: string (a fitting job title for this candidate based on the JD)
- score: number (0-100 integer, how well this candidate matches the JD)
- summary: string (2-sentence assessment of the candidate's fit)
- email: string (a plausible professional email for the candidate)

Job Description:
${jobDescription}

CV Filename: ${cv.name}

Respond with ONLY valid JSON, no markdown, no explanation.`;
```

## API Call Pattern

```typescript
const response = await ai.models.generateContent({
  model: "gemini-2.0-flash",
  contents: prompt,
});

const text = response.text?.trim() ?? "";
const jsonMatch = text.match(/\{[\s\S]*\}/);
if (jsonMatch) {
  const parsed = JSON.parse(jsonMatch[0]);
  // use parsed fields
}
```

## Key Files

- `src/App.tsx` — scoring logic in `handleSubmit()` (~lines 345-448)
- `vite.config.ts` — API key injection
- `.env` / `.env.local` — API key storage

## When to Use

Activate when modifying the AI scoring prompt, adding new Gemini API features, changing the model, or debugging the scoring pipeline.
