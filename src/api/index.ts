const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "" : "https://agentix-hr-api-d135a76b-1bf2-4e6b-bcbe-91ad25e274a5.fly.dev");

function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

function setToken(token: string | null) {
  if (token) localStorage.setItem("auth_token", token);
  else localStorage.removeItem("auth_token");
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { headers, ...options });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 401) setToken(null);
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

interface UserDTO {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar_url: string | null;
}

export const api = {
  auth: {
    register: (data: { email: string; password: string; name: string; role?: string }) =>
      request<{ token: string; user: UserDTO }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      request<{ token: string; user: UserDTO }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    me: () => request<UserDTO>("/api/auth/me"),
    logout: () => {
      setToken(null);
      return Promise.resolve({ ok: true });
    },
    getToken,
    setToken,
  },

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
      const token = getToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/api/candidates/upload`, {
        method: "POST",
        body: form,
        headers,
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
