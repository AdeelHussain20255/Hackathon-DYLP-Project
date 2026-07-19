import json
import os
import re
import time

import requests

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions"


def _call_mistral(prompt: str, response_format: dict | None = None) -> str:
    payload = {
        "model": "mistral-small-latest",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 2000,
    }
    if response_format:
        payload["response_format"] = response_format
    try:
        resp = requests.post(
            MISTRAL_URL,
            headers={
                "Authorization": f"Bearer {MISTRAL_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=60,
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"].strip()
    except Exception as e:
        print(f"[Mistral] Error: {e}")
        return ""


def _parse_json(text: str) -> dict:
    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            return {}
    return {}


def agent_parse(candidate: dict, job_description: str) -> dict:
    cv_text = candidate.get("cv_text", "") or json.dumps(candidate)
    prompt = f"""You are Agentix Parser AI — an expert HR parsing agent.
Extract structured data from the raw candidate data below.

Job Context: {job_description[:1000]}

Raw Candidate Data:
{cv_text[:4000]}

Respond with ONLY valid JSON:
{{
  "name": "full name",
  "email": "email",
  "role": "best-fit job title",
  "skills": ["skill1", "skill2"],
  "experience_years": <number or null>,
  "location": "city",
  "gender": "Male/Female/null",
  "shift_preference": "Morning/Night/Any",
  "is_remote": true/false/null,
  "age": <number or null>,
  "summary": "1-2 sentence summary"
}}"""

    raw = _call_mistral(prompt, {"type": "json_object"})
    data = _parse_json(raw)
    return {
        "name": data.get("name", candidate.get("name", "Unknown")),
        "email": data.get("email", candidate.get("email", "")),
        "role": data.get("role", candidate.get("role", "Professional")),
        "skills": data.get("skills", candidate.get("skills", "").split(", ") if candidate.get("skills") else []),
        "experience_years": data.get("experience_years", candidate.get("experience_years")),
        "location": data.get("location", candidate.get("location", "")),
        "gender": data.get("gender", candidate.get("gender")),
        "shift_preference": data.get("shift_preference", candidate.get("shift_preference", "Any")),
        "is_remote": data.get("is_remote", candidate.get("is_remote")),
        "age": data.get("age", candidate.get("age")),
        "summary": data.get("summary", ""),
    }


def agent_screen(candidate: dict, parsed: dict, job_description: str) -> dict:
    skills_str = ", ".join(parsed.get("skills", [])) if isinstance(parsed.get("skills"), list) else str(parsed.get("skills", ""))
    prompt = f"""You are Agentix Screener AI — an expert HR screening agent.
Score this candidate against the job description on a scale of 0-100.

Job Description:
{job_description[:2000]}

Candidate Profile:
- Name: {parsed.get("name", candidate.get("name", "Unknown"))}
- Role: {parsed.get("role", candidate.get("role", ""))}
- Skills: {skills_str}
- Experience: {parsed.get("experience_years")} years
- Location: {parsed.get("location", "")}

Respond with ONLY valid JSON:
{{
  "score": <integer 0-100>,
  "summary": "2-3 sentence screening assessment",
  "strengths": ["strength1", "strength2"],
  "gaps": ["gap1", "gap2"],
  "verdict": "Strong Match / Moderate Match / Weak Match"
}}"""

    raw = _call_mistral(prompt, {"type": "json_object"})
    data = _parse_json(raw)
    return {
        "screened_score": data.get("score", 50),
        "screened_summary": data.get("summary", ""),
        "strengths": data.get("strengths", []),
        "gaps": data.get("gaps", []),
        "verdict": data.get("verdict", "Moderate Match"),
    }


def agent_deep_rank(candidates_with_scores: list[dict], job_description: str) -> list[dict]:
    profiles_text = ""
    for i, c in enumerate(candidates_with_scores):
        p = c.get("parsed", {})
        s = c.get("screened", {})
        skills_str = ", ".join(p.get("skills", [])) if isinstance(p.get("skills"), list) else str(p.get("skills", ""))
        profiles_text += f"\nCandidate {i+1}: {p.get('name', 'Unknown')}\n  Role: {p.get('role', '')}\n  Skills: {skills_str}\n  Experience: {p.get('experience_years')}y\n  Screened Score: {s.get('screened_score', 50)}\n  Verdict: {s.get('verdict', '')}\n"

    prompt = f"""You are Agentix Deep Ranker AI — an expert comparative ranking agent.
Rank the following candidates by fit for the job description. Provide a ranked score (0-100) and analysis for each.

Job Description:
{job_description[:2000]}

Candidates:
{profiles_text}

Respond with ONLY valid JSON as an array:
[
  {{
    "candidate_index": 0,
    "ranked_score": <integer 0-100>,
    "rank_position": 1,
    "analysis": "detailed comparative analysis"
  }},
  ...
]
Order by best fit first."""

    raw = _call_mistral(prompt)
    array_match = re.search(r"\[[\s\S]*\]", raw)
    if array_match:
        try:
            rankings = json.loads(array_match.group(0))
            for r in rankings:
                idx = r.get("candidate_index", 0)
                if idx < len(candidates_with_scores):
                    candidates_with_scores[idx]["ranked"] = {
                        "ranked_score": r.get("ranked_score", 50),
                        "rank_position": r.get("rank_position", 999),
                        "ranked_analysis": r.get("analysis", ""),
                    }
        except json.JSONDecodeError:
            pass

    for i, c in enumerate(candidates_with_scores):
        if "ranked" not in c:
            c["ranked"] = {
                "ranked_score": c.get("screened", {}).get("screened_score", 50),
                "rank_position": i + 1,
                "ranked_analysis": "Automated ranking completed.",
            }

    candidates_with_scores.sort(key=lambda x: x.get("ranked", {}).get("rank_position", 999))
    return candidates_with_scores


def agent_finalize(candidates_ranked: list[dict], job_description: str) -> tuple[list[dict], dict | None]:
    best = candidates_ranked[0] if candidates_ranked else None
    if best:
        p = best.get("parsed", {})
        r = best.get("ranked", {})
        s = best.get("screened", {})
        prompt = f"""You are Agentix Finalizer AI — the concluding HR decision agent.
Given the best-matching candidate, produce a final hiring recommendation.

Best Candidate:
- Name: {p.get('name', 'Unknown')}
- Role: {p.get('role', '')}
- Skills: {p.get('skills', [])}
- Experience: {p.get('experience_years')}y
- Screened Score: {s.get('screened_score', 50)}
- Ranked Score: {r.get('ranked_score', 50)}
- Rank Position: {r.get('rank_position', 1)}

Job Description:
{job_description[:1500]}

Respond with ONLY valid JSON:
{{
  "verdict": "Strongly Recommend / Recommend / Consider / Do Not Recommend",
  "final_notes": "detailed final recommendation",
  "next_steps": "suggested next steps"
}}"""
        raw = _call_mistral(prompt, {"type": "json_object"})
        data = _parse_json(raw)
        best["final"] = {
            "final_verdict": data.get("verdict", "Recommend"),
            "final_notes": data.get("final_notes", ""),
            "next_steps": data.get("next_steps", ""),
        }

    for c in candidates_ranked:
        if "final" not in c:
            c["final"] = {
                "final_verdict": "Consider" if c.get("ranked", {}).get("ranked_score", 0) >= 60 else "Do Not Recommend",
                "final_notes": "",
            }

    return candidates_ranked, (best if best else None)
