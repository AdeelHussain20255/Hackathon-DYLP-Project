import { create } from "zustand";
import { api, CandidateDTO, AgentDTO } from "../api";

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

export interface DashboardConfig {
  candidatesTrend: string;
  highMatchThreshold: number;
  cvProcessedTrend: string;
  processingTimeMs: number;
  skillMatchData: { name: string; weight: number; color: string }[];
  pipelineStatusData: { name: string; color: string }[];
}

interface AppState {
  candidates: Candidate[];
  agents: Agent[];
  config: DashboardConfig;
  loading: boolean;

  fetchCandidates: () => Promise<void>;
  fetchAgents: () => Promise<void>;
  addCandidate: (candidate: Candidate) => Promise<void>;
  removeCandidate: (id: string) => Promise<void>;
  prependCandidates: (candidates: Candidate[]) => void;
  updateCandidateScore: (id: string, matchScore: number, summary: string) => Promise<void>;
  setCandidateStage: (id: string, stage: QueueStage) => Promise<void>;
  advanceCandidateStage: (id: string) => Promise<void>;
  toggleAgent: (id: string) => Promise<void>;
}

function toCandidate(dto: CandidateDTO): Candidate {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    role: dto.role,
    department: dto.department,
    appliedDate: dto.applied_date,
    matchScore: dto.match_score,
    status: dto.status as CandidateStatus,
    currentStage: dto.current_stage as QueueStage,
    summary: dto.summary || undefined,
  };
}

function toAgent(dto: AgentDTO): Agent {
  return {
    id: dto.id,
    name: dto.name,
    role: dto.role,
    description: dto.description,
    isRunning: dto.is_running,
  };
}

const initialConfig: DashboardConfig = {
  candidatesTrend: "+12% vs last month",
  highMatchThreshold: 90,
  cvProcessedTrend: "+12.4%",
  processingTimeMs: 380,
  skillMatchData: [
    { name: "React 19", weight: 0.061, color: "#4f46e5" },
    { name: "TypeScript", weight: 0.057, color: "#6366f1" },
    { name: "Tailwind CSS", weight: 0.064, color: "#3b82f6" },
    { name: "Node.js", weight: 0.048, color: "#06b6d4" },
    { name: "DevOps/AWS", weight: 0.032, color: "#10b981" },
    { name: "Product Design", weight: 0.027, color: "#f59e0b" },
  ],
  pipelineStatusData: [
    { name: "Applied", color: "#6366f1" },
    { name: "Screening", color: "#3b82f6" },
    { name: "Interviewing", color: "#10b981" },
    { name: "Offered/Rejected", color: "#94a3b8" },
  ],
};

export const useAppStore = create<AppState>((set, get) => ({
  candidates: [],
  agents: [],
  config: initialConfig,
  loading: false,

  fetchCandidates: async () => {
    try {
      const dtos = await api.candidates.list();
      set({ candidates: dtos.map(toCandidate) });
    } catch (e) {
      console.error("fetchCandidates failed", e);
    }
  },

  fetchAgents: async () => {
    try {
      const dtos = await api.agents.list();
      set({ agents: dtos.map(toAgent) });
    } catch (e) {
      console.error("fetchAgents failed", e);
    }
  },

  addCandidate: async (candidate) => {
    try {
      const dto = await api.candidates.create({
        name: candidate.name,
        email: candidate.email,
        role: candidate.role,
        department: candidate.department,
        applied_date: candidate.appliedDate,
      });
      set((state) => ({ candidates: [toCandidate(dto), ...state.candidates] }));
    } catch (e) {
      console.error("addCandidate failed", e);
    }
  },

  removeCandidate: async (id) => {
    try {
      await api.candidates.delete(id);
      set((state) => ({ candidates: state.candidates.filter((c) => c.id !== id) }));
    } catch (e) {
      console.error("removeCandidate failed", e);
    }
  },

  prependCandidates: (newCandidates) =>
    set((state) => ({ candidates: [...newCandidates, ...state.candidates] })),

  updateCandidateScore: async (id, matchScore, summary) => {
    try {
      await api.candidates.updateStage(id, "Done");
      await api.candidates.updateStatus(id, "Screening");
      set((state) => ({
        candidates: state.candidates.map((c) =>
          c.id === id ? { ...c, matchScore, summary, status: "Screening", currentStage: "Done" as QueueStage } : c,
        ),
      }));
    } catch (e) {
      console.error("updateCandidateScore failed", e);
    }
  },

  setCandidateStage: async (id, stage) => {
    try {
      await api.candidates.updateStage(id, stage);
      set((state) => ({
        candidates: state.candidates.map((c) =>
          c.id === id ? { ...c, currentStage: stage } : c,
        ),
      }));
    } catch (e) {
      console.error("setCandidateStage failed", e);
    }
  },

  advanceCandidateStage: async (id) => {
    const c = get().candidates.find((c) => c.id === id);
    if (!c) return;
    const next: Record<string, QueueStage> = {
      "Awaiting Parsing": "Awaiting Ranking",
      "Awaiting Ranking": "Ready for Outreach",
      "Ready for Outreach": "Invite Sent",
    };
    const nextStage = next[c.currentStage] ?? c.currentStage;
    try {
      await api.candidates.updateStage(id, nextStage);
      const newScore = nextStage === "Ready for Outreach" && c.matchScore === null
        ? Math.floor(Math.random() * (96 - 78 + 1)) + 78
        : c.matchScore;
      set((state) => ({
        candidates: state.candidates.map((x) =>
          x.id === id ? { ...x, currentStage: nextStage, matchScore: newScore } : x,
        ),
      }));
    } catch (e) {
      console.error("advanceCandidateStage failed", e);
    }
  },

  toggleAgent: async (id) => {
    const agent = get().agents.find((a) => a.id === id);
    if (!agent) return;
    try {
      const dto = await api.agents.toggle(id, !agent.isRunning);
      set((state) => ({
        agents: state.agents.map((a) =>
          a.id === id ? { ...a, isRunning: dto.is_running } : a,
        ),
      }));
    } catch (e) {
      console.error("toggleAgent failed", e);
    }
  },
}));
