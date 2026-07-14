---
name: hr-recruitment-domain
description: Domain knowledge for the Agentix AI Enterprise HR Tech recruitment platform. Use when discussing recruitment workflows, AI agent roles, candidate pipeline stages, or HR domain logic.
license: MIT
compatibility: opencode
metadata:
  domain: hr-tech
---

## Platform Overview

Agentix AI is an Enterprise HR Tech SaaS platform simulating AI-powered workforce management, automated candidate screening, resume parsing, and recruiting pipeline analytics.

## AI Agents

| Agent | Role | Default Status |
|-------|------|----------------|
| **ScreenerX** | Recruitment Agent - auto-parses resumes, scores tech-stack compliance, conducts background qualification scans | Active |
| **OnboardFlow** | Employee Experience Agent - configures checklist pipelines, coordinates legal documents, walks new hires through policies | Active |
| **SchedulerPro** | Operations Agent - synchronizes calendars, dispatches interview confirmations | Idle |
| **ReviewSync** | Sentiment & Performance Agent - extracts sentiment from team feedback, charts growth trajectories | Paused |

Each agent has: `confidenceThreshold` (75-90%), intake `channel`, and `autoScreen` toggle.

## Bot Orchestrators

| Bot | Role | Default State |
|-----|------|---------------|
| **Fetcher Bot** | Pulls CVs from external sources (ATS webhooks, email, Shared Folders) | Running |
| **Parser Bot** | Extracts JSON data from PDF/DOCX into structured AST schemas | Running |
| **Ranker Bot** | Scores resumes via Gemini embeddings against vectorized job descriptions | Running |
| **Scheduler Bot** | Fires automated interview invites and calendar updates | Paused |

## Candidate Pipeline Stages

`Applied` → `Screening` → `Interviewing` → `Offered` | `Rejected`

Candidates have: `name`, `role`, `department`, `status`, `score` (0-100), `appliedDate`, `email`, `summary`, `screeningStatus`.

## Dashboard Configuration

Centralized in `src/data/dashboardConfig.ts`. Controls:
- Trend labels for KPI cards
- High match threshold (default: 90)
- Skill match distribution data (bar chart)
- Pipeline status data (donut chart)

## When to Use

Activate when discussing recruitment domain logic, adding HR-related features, modifying agent/bot configurations, or extending the candidate pipeline.
