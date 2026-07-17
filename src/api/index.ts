const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "" : "https://agentix-hr-api-d135a76b-1bf2-4e6b-bcbe-91ad25e274a5.fly.dev");

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json();
}

export interface CandidateDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  applied_date: string;
  match_score: number | null;
  status: string;
  current_stage: string;
  summary?: string | null;
  cv_file_url?: string | null;
}

export interface AgentDTO {
  id: string;
  name: string;
  role: string;
  description: string;
  is_running: boolean;
}

export const api = {
  candidates: {
    list: () => request<CandidateDTO[]>("/api/candidates"),
    create: (data: {
      name: string;
      email: string;
      role: string;
      department: string;
      applied_date: string;
    }) =>
      request<CandidateDTO>("/api/candidates", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ ok: boolean }>(`/api/candidates/${id}`, { method: "DELETE" }),
    updateStage: (id: string, current_stage: string) =>
      request<CandidateDTO>(`/api/candidates/${id}/stage`, {
        method: "PATCH",
        body: JSON.stringify({ current_stage }),
      }),
    updateStatus: (id: string, status: string) =>
      request<CandidateDTO>(`/api/candidates/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    upload: async (file: File, jobDescription: string) => {
      const form = new FormData();
      form.append("file", file);
      form.append("job_description", jobDescription);
      const res = await fetch(`${API_BASE}/api/candidates/upload`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Upload API ${res.status}: ${text}`);
      }
      return res.json() as Promise<CandidateDTO>;
    },
  },

  agents: {
    list: () => request<AgentDTO[]>("/api/agents"),
    toggle: (id: string, is_running: boolean) =>
      request<AgentDTO>(`/api/agents/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_running }),
      }),
  },

  dashboard: {
    config: () =>
      request<{
        totalCandidates: number;
        highMatchCount: number;
        highMatchThreshold: number;
        pipelineStatusData: Record<string, number>;
      }>("/api/dashboard/config"),
  },
};
