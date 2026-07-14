import { create } from "zustand";

export type CandidateStatus = "Applied" | "Screening" | "Interviewing" | "Offered" | "Rejected";
export type QueueStage = "Awaiting Parsing" | "Awaiting Ranking" | "Ready for Outreach" | "Invite Sent" | "Done";

export interface Candidate {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  appliedDate: string;
  matchScore: number | null;
  status: CandidateStatus;
  currentStage: QueueStage;
  summary?: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  isRunning: boolean;
}

interface AppState {
  candidates: Candidate[];
  agents: Agent[];

  addCandidate: (candidate: Candidate) => void;
  removeCandidate: (id: string) => void;
  prependCandidates: (candidates: Candidate[]) => void;
  updateCandidateScore: (id: string, matchScore: number, summary: string) => void;
  setCandidateStage: (id: string, stage: QueueStage) => void;
  advanceCandidateStage: (id: string) => void;
  toggleAgent: (id: string) => void;
}

const initialCandidates: Candidate[] = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah.chen@techcorp.io",
    role: "Senior Full Stack Engineer",
    department: "Engineering",
    appliedDate: "2026-07-08",
    matchScore: 96,
    status: "Interviewing",
    currentStage: "Done",
    summary: "Exceptional mastery of React 19, TypeScript, and microservice architectures. Ex-Stripe with strong systems experience.",
  },
  {
    id: "2",
    name: "Alex Rivera",
    email: "alex.rivera@designlab.co",
    role: "Lead UX Designer",
    department: "Design",
    appliedDate: "2026-07-09",
    matchScore: 91,
    status: "Applied",
    currentStage: "Done",
    summary: "Pristine visual portfolio focusing on enterprise SaaS layouts, responsive designs, and interactive dynamic flows.",
  },
  {
    id: "3",
    name: "Marcus Vance",
    email: "marcus.vance@cloudsolutions.net",
    role: "Staff DevOps Architect",
    department: "Engineering",
    appliedDate: "2026-07-10",
    matchScore: null,
    status: "Screening",
    currentStage: "Awaiting Parsing",
  },
  {
    id: "4",
    name: "Elena Rostova",
    email: "elena.rostova@productmind.org",
    role: "VP of Product",
    department: "Product",
    appliedDate: "2026-07-05",
    matchScore: 98,
    status: "Offered",
    currentStage: "Done",
    summary: "Stellar enterprise scaling metrics. Scaled product from $5M to $45M ARR. High-agency product builder.",
  },
  {
    id: "5",
    name: "Derrick Kim",
    email: "derrick.kim@recruithub.com",
    role: "Technical Recruiter",
    department: "Human Resources",
    appliedDate: "2026-07-10",
    matchScore: null,
    status: "Applied",
    currentStage: "Awaiting Ranking",
  },
];

const initialAgents: Agent[] = [
  { id: "fetcher", name: "Fetcher Bot", role: "Pulls CVs from external sources", description: "Monitors integrated ATS webhooks, email inboxes, and Shared Folders to auto-ingest candidate CV documents.", isRunning: true },
  { id: "parser", name: "Parser Bot", role: "Extracts JSON data", description: "Parses PDF, DOCX, and unstructured documents into structured JSON AST abstract schemas.", isRunning: true },
  { id: "ranker", name: "Ranker Bot", role: "Scores via Gemini", description: "Generates high-dimensional semantic embeddings to match resumes against vectorized job descriptions.", isRunning: true },
  { id: "scheduler", name: "Scheduler Bot", role: "Fires emails", description: "Dispatches automated interview invites and updates calendars autonomously for matching candidates.", isRunning: false },
];

export const useAppStore = create<AppState>((set) => ({
  candidates: initialCandidates,
  agents: initialAgents,

  addCandidate: (candidate) =>
    set((state) => ({ candidates: [candidate, ...state.candidates] })),

  removeCandidate: (id) =>
    set((state) => ({ candidates: state.candidates.filter((c) => c.id !== id) })),

  prependCandidates: (newCandidates) =>
    set((state) => ({ candidates: [...newCandidates, ...state.candidates] })),

  updateCandidateScore: (id, matchScore, summary) =>
    set((state) => ({
      candidates: state.candidates.map((c) =>
        c.id === id ? { ...c, matchScore, summary, status: "Screening", currentStage: "Done" as QueueStage } : c,
      ),
    })),

  setCandidateStage: (id, stage) =>
    set((state) => ({
      candidates: state.candidates.map((c) =>
        c.id === id ? { ...c, currentStage: stage } : c,
      ),
    })),

  advanceCandidateStage: (id) =>
    set((state) => ({
      candidates: state.candidates.map((c) => {
        if (c.id !== id) return c;
        const next: Record<string, QueueStage> = {
          "Awaiting Parsing": "Awaiting Ranking",
          "Awaiting Ranking": "Ready for Outreach",
          "Ready for Outreach": "Invite Sent",
        };
        const nextStage = next[c.currentStage] ?? c.currentStage;
        const newScore = nextStage === "Ready for Outreach" && c.matchScore === null
          ? Math.floor(Math.random() * (96 - 78 + 1)) + 78
          : c.matchScore;
        return { ...c, currentStage: nextStage, matchScore: newScore };
      }),
    })),

  toggleAgent: (id) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === id ? { ...a, isRunning: !a.isRunning } : a,
      ),
    })),
}));
