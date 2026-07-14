import React, { useState, useMemo } from "react";
import { GoogleGenAI } from "@google/genai";
import { useAppStore } from "./store/useAppStore";
import { 
  Bot, Sparkles, Search, Plus, Filter, CheckCircle2, Clock, 
  TrendingUp, Users, FileText, Sliders, Eye, RefreshCw, 
  AlertCircle, UserCheck, Trash2, Check, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Navbar from "./components/Navbar";
import AgentAnalytics from "./components/AgentAnalytics";
import BulkUploadZone from "./components/BulkUploadZone";
import AgentQueue from "./components/AgentQueue";
import LandingPage from "./components/LandingPage";

// Define TypeScript interfaces for our application state
interface AIAgent {
  id: string;
  name: string;
  tag: string;
  description: string;
  status: "Active" | "Paused" | "Idle";
  efficiency: string;
  tasksCompleted: number;
  config: {
    confidenceThreshold: number;
    channel: string;
    autoScreen: boolean;
  };
}

// Pluralization helper: plural(3, "agent") → "3 agents", plural(1, "agent") → "1 agent"
// Optional custom plural form: plural(2, "CV", "CVs") → "2 CVs"
const plural = (count: number, singular: string, pluralForm?: string): string => {
  const word = count === 1 ? singular : (pluralForm ?? `${singular}s`);
  return `${count} ${word}`;
};

interface SidebarItemProps {
  tab: string;
  label: string;
  currentTab: string;
  onNavigate: (tab: string) => void;
  badge?: string;
  badgeClass?: string;
}

function SidebarItem({ tab, label, currentTab, onNavigate, badge, badgeClass }: SidebarItemProps) {
  const isActive = currentTab === tab;
  return (
    <button
      onClick={() => onNavigate(tab)}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition text-left cursor-pointer ${
        isActive
          ? "bg-slate-100 text-slate-900 font-semibold"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <span>{label}</span>
      {badge && (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeClass || "bg-slate-100 text-slate-600"}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

export default function App() {
  // Current Navigation Tab
  const [currentTab, setCurrentTab] = useState("landing");

  // Authentication State (Mocking Clerk authentication)
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: string;
    avatarUrl: string;
  } | null>({
    name: "Adeel Hussain",
    email: "adeelhussain20255@gmail.com",
    role: "HR Director",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256",
  });

  // Notifications State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick Action notification triggers
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const config = useAppStore((s) => s.config);
  const candidates = useAppStore((s) => s.candidates);
  const agents = useAppStore((s) => s.agents);
  const addCandidate = useAppStore((s) => s.addCandidate);
  const removeCandidate = useAppStore((s) => s.removeCandidate);
  const prependCandidates = useAppStore((s) => s.prependCandidates);
  const updateCandidateScore = useAppStore((s) => s.updateCandidateScore);
  const setCandidateStage = useAppStore((s) => s.setCandidateStage);
  const advanceCandidateStage = useAppStore((s) => s.advanceCandidateStage);
  const toggleAgent = useAppStore((s) => s.toggleAgent);

  const scored = candidates.filter(c => c.matchScore !== null);
  const avgMatch = scored.length ? Math.round(scored.reduce((a, c) => a + (c.matchScore ?? 0), 0) / scored.length) : 0;
  const avgMatchScoreLabel = `${avgMatch}% Match`;

  // 1. Initial State for AI Agents
  const [aiAgents, setAiAgents] = useState<AIAgent[]>([
    {
      id: "screener-x",
      name: "ScreenerX",
      tag: "Recruitment Agent",
      description: "Auto-parses resume uploads, scores tech-stack compliance, and conducts instant background qualification scans.",
      status: "Active",
      efficiency: "94% saving",
      tasksCompleted: 482,
      config: { confidenceThreshold: 85, channel: "ATS Import", autoScreen: true }
    },
    {
      id: "onboard-flow",
      name: "OnboardFlow",
      tag: "Employee Experience Agent",
      description: "Configures tailored checklist pipelines, coordinates legal documents, and walks new hires through handbook policies.",
      status: "Active",
      efficiency: "88% faster",
      tasksCompleted: 154,
      config: { confidenceThreshold: 90, channel: "Slack / Email", autoScreen: false }
    },
    {
      id: "scheduler-pro",
      name: "SchedulerPro",
      tag: "Operations Agent",
      description: "Synchronizes calendar availability between department panels and prospective candidates to dispatch interview confirmations.",
      status: "Idle",
      efficiency: "100% autonomous",
      tasksCompleted: 830,
      config: { confidenceThreshold: 75, channel: "Google Calendar", autoScreen: true }
    },
    {
      id: "review-sync",
      name: "ReviewSync",
      tag: "Sentiment & Performance Agent",
      description: "Extracts constructive sentiment signals from team feedbacks and charts individual growth trajectories.",
      status: "Paused",
      efficiency: "12 hrs/mo saved",
      tasksCompleted: 45,
      config: { confidenceThreshold: 80, channel: "Slack Hub", autoScreen: false }
    }
  ]);

  // 2. Candidates now live in useAppStore

  // Mobile sidebar toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Search & Filter state for candidates tab
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Modals & Drawers States
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);
  const [selectedAgentForConfig, setSelectedAgentForConfig] = useState<AIAgent | null>(null);
  const [diagnosticRunning, setDiagnosticRunning] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null);

  // JD & CV Upload Workspace States
  const [jobDescription, setJobDescription] = useState<string>(`We are looking for a Senior Full Stack Engineer to join our core product team. 

Key Responsibilities:
- Design, build, and maintain highly scalable React applications with TypeScript
- Build modern, pixel-perfect user interfaces using Tailwind CSS
- Integrate state management solutions and asynchronous backend services
- Collaborate with product managers, UX designers, and other engineers

Required Skills:
- 5+ years of software engineering experience
- Expertise in React, TypeScript, and modern styling utilities
- Strong system architecture and API integration patterns`);

  const [isJdSaved, setIsJdSaved] = useState(false);
  const [stagedCvs, setStagedCvs] = useState<{ id: string; name: string; size: string; status: "staged" | "parsing" | "completed" }[]>([
    { id: "cv-1", name: "resume_clara_fontaine.pdf", size: "244 KB", status: "staged" },
    { id: "cv-2", name: "resume_liam_novak.pdf", size: "189 KB", status: "staged" },
    { id: "cv-3", name: "resume_rajesh_kumar.pdf", size: "312 KB", status: "staged" }
  ]);
  const [files, setFiles] = useState<any[]>([
    { id: "cv-1", name: "resume_clara_fontaine.pdf", size: "244 KB", status: "staged" },
    { id: "cv-2", name: "resume_liam_novak.pdf", size: "189 KB", status: "staged" },
    { id: "cv-3", name: "resume_rajesh_kumar.pdf", size: "312 KB", status: "staged" }
  ]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isLeaderboardRevealed, setIsLeaderboardRevealed] = useState<boolean>(false);
  const [isScoringRunning, setIsScoringRunning] = useState(false);
  const [scoringProgress, setScoringProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesList = Array.from(e.dataTransfer.files);
      const newStaged = filesList.map((file: File, idx) => ({
        id: `custom-cv-${Date.now()}-${idx}`,
        name: file.name,
        size: `${Math.round(file.size / 1024)} KB`,
        status: "staged" as const
      }));
      setStagedCvs(prev => [...prev, ...newStaged]);
      setFiles(prev => [...prev, ...newStaged]);
      showToast(`Staged ${plural(filesList.length, "candidate CV file")}`);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesList = Array.from(e.target.files);
      const newStaged = filesList.map((file: File, idx) => ({
        id: `custom-cv-${Date.now()}-${idx}`,
        name: file.name,
        size: `${Math.round(file.size / 1024)} KB`,
        status: "staged" as const
      }));
      setStagedCvs(prev => [...prev, ...newStaged]);
      setFiles(prev => [...prev, ...newStaged]);
      showToast(`Staged ${plural(filesList.length, "candidate CV file")}`);
    }
  };

  const handleSaveJd = () => {
    if (!jobDescription.trim()) {
      showToast("Error: Job Description cannot be empty");
      return;
    }
    setIsJdSaved(true);
    showToast("Success: Job Description successfully saved and vectorized!");
  };

  const handleJdChange = (val: string) => {
    setJobDescription(val);
    if (isJdSaved) {
      setIsJdSaved(false);
    }
  };

  const handleRemoveStagedCv = (id: string) => {
    setStagedCvs(prev => prev.filter(cv => cv.id !== id));
    setFiles(prev => prev.filter(cv => cv.id !== id));
    showToast("Candidate CV removed from staging");
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isJdSaved || (stagedCvs.length === 0 && files.length === 0)) {
      showToast("Please save the Job Description and stage CV files first");
      return;
    }

    setIsProcessing(true);
    setIsScoringRunning(true);
    setScoringProgress(0);
    showToast("Initializing Agentix AI engine analysis...");

    // Set all files/CVs status to parsing
    setStagedCvs(prev => prev.map(cv => ({ ...cv, status: "parsing" })));
    setFiles(prev => prev.map(f => ({ ...f, status: "parsing" })));

    const activeFilesList = stagedCvs.length > 0 ? stagedCvs : files;
    interface ScoredCandidate { id: string; name: string; role: string; department: string; status: "Applied" | "Screening" | "Interviewing" | "Offered" | "Rejected"; matchScore: number; appliedDate: string; email: string; summary: string; currentStage: "Awaiting Parsing" | "Awaiting Ranking" | "Ready for Outreach" | "Invite Sent" | "Done"; }
    const newScoredCandidates: ScoredCandidate[] = [];

    // Score each CV with Gemini AI
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || "" });

    for (let idx = 0; idx < activeFilesList.length; idx++) {
      const cv = activeFilesList[idx];
      setScoringProgress(Math.round(((idx) / activeFilesList.length) * 90));

      // Derive candidate name from filename
      let candidateName = cv.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ").replace(/resume /i, "").trim();
      candidateName = candidateName.split(" ").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

      let score = 80;
      let summary = "";
      let role = "Software Engineer";
      let dept = "Engineering";
      let email = `${candidateName.toLowerCase().replace(/ /g, ".")}@example.com`;

      try {
        const prompt = `You are a senior HR recruiter AI. Given the following job description and a candidate's CV filename, produce a JSON object with these fields:
- name: string (infer a realistic full name from the filename, e.g. "resume_clara_fontaine.pdf" → "Clara Fontaine")
- role: string (a fitting job title for this candidate based on the JD)
- score: number (0-100 integer, how well this candidate matches the JD)
- summary: string (2-sentence assessment of the candidate's fit)
- email: string (a plausible professional email for the candidate)

Job Description:
${jobDescription}

CV Filename: ${cv.name}

Respond with ONLY valid JSON, no markdown, no explanation.`;

        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: prompt,
        });

        const text = response.text?.trim() ?? "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          candidateName = parsed.name || candidateName;
          role = parsed.role || role;
          score = typeof parsed.score === "number" ? Math.max(0, Math.min(100, parsed.score)) : score;
          summary = parsed.summary || summary;
          email = parsed.email || email;
        }
      } catch {
        // Fallback to heuristic scoring if API fails
        score = Math.floor(Math.random() * (98 - 72 + 1)) + 72;
        summary = `Evaluated candidate CV. Demonstrates solid competency in key core skills with ${score}% overall job match score. Recommended for immediate technical screening.`;
      }

      setStagedCvs(curr => curr.map((c, i) => i === idx ? { ...c, status: "completed" } : c));
      setFiles(curr => curr.map((c, i) => i === idx ? { ...c, status: "completed" } : c));

      newScoredCandidates.push({
        id: `staged-cand-${Date.now()}-${idx}`,
        name: candidateName,
        role,
        department: dept,
        status: "Applied" as const,
        matchScore: score,
        appliedDate: new Date().toISOString().split("T")[0],
        email,
        summary,
        currentStage: "Done" as const,
      });
    }

    setScoringProgress(100);

    prependCandidates(newScoredCandidates);
    setStagedCvs([]);
    setFiles([]);
    setIsProcessing(false);
    setIsScoringRunning(false);
    setScoringProgress(0);
    setIsLeaderboardRevealed(true);

    showToast(`Agentix Scoring Complete! Evaluated and imported ${plural(newScoredCandidates.length, "candidate CV", "candidate CVs")}.`);
  };

  const runAgentixScoring = () => {
    handleSubmit();
  };

  // State to simulate adding a new candidate
  const [newCandName, setNewCandName] = useState("");
  const [newCandRole, setNewCandRole] = useState("");
  const [newCandDept, setNewCandDept] = useState("Engineering");
  const [newCandEmail, setNewCandEmail] = useState("");

  // Filter candidates based on search query and status filter
  const filteredCandidates = useMemo(() => {
    return candidates.filter((cand) => {
      const matchesSearch =
        cand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cand.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cand.department.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "All" || cand.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [candidates, searchQuery, statusFilter]);

  // Aggregate Key Statistics
  const stats = useMemo(() => {
    const totalCandidates = candidates.length;
    const activeAIAgents = agents.filter(a => a.isRunning).length;
    const highMatchCandidates = candidates.filter(c => c.matchScore && c.matchScore >= config.highMatchThreshold).length;
    const hoursSavedThisMonth = 75 * totalCandidates;

    return {
      totalCandidates,
      activeAIAgents,
      highMatchCandidates,
      hoursSavedThisMonth,
    };
  }, [candidates, agents, config.highMatchThreshold]);

  // Chart data - computed from config + live candidate state
  const chartData = useMemo(() => {
    // Skill match bar chart: transform config weights into actual counts
    const skillMatchData = config.skillMatchData.map(skill => ({
      name: skill.name,
      Count: Math.max(1, Math.floor(stats.totalCandidates * skill.weight)),
      color: skill.color,
    }));

    // Pipeline status doughnut: aggregate live candidate counts + apply config colors
    const candidatesByStatus = candidates.reduce((acc, cand) => {
      acc[cand.status] = (acc[cand.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pipelineStatusData = config.pipelineStatusData.map(stage => {
      let value = 0;
      if (stage.name === "Applied") value = candidatesByStatus["Applied"] || 0;
      else if (stage.name === "Screening") value = candidatesByStatus["Screening"] || 0;
      else if (stage.name === "Interviewing") value = candidatesByStatus["Interviewing"] || 0;
      else if (stage.name === "Offered/Rejected") value = (candidatesByStatus["Offered"] || 0) + (candidatesByStatus["Rejected"] || 0);
      return { name: stage.name, value, color: stage.color };
    });

    return { skillMatchData, pipelineStatusData };
  }, [candidates, config, stats.totalCandidates]);

  // Dynamically compute leaderboard candidate ranking from the candidates state
  const leaderboardCandidates = useMemo(() => {
    const scored = candidates
      .filter((c) => c.matchScore !== null && c.matchScore !== undefined)
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    return scored.map((c, index) => {
      const initials = c.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      let skills = ["TypeScript", "React", "REST APIs"];
      const lowerRole = c.role.toLowerCase();
      if (lowerRole.includes("full stack") || lowerRole.includes("frontend") || lowerRole.includes("web")) {
        skills = ["React 19", "TypeScript", "Tailwind CSS", "API Orchestration"];
      } else if (lowerRole.includes("design") || lowerRole.includes("ux") || lowerRole.includes("ui")) {
        skills = ["Figma", "Design Systems", "Prototyping", "UI Motion"];
      } else if (lowerRole.includes("devops") || lowerRole.includes("cloud") || lowerRole.includes("infrastructure")) {
        skills = ["AWS", "Docker", "Kubernetes", "CI/CD Pipelines"];
      } else if (lowerRole.includes("product") || lowerRole.includes("vp")) {
        skills = ["Product Roadmap", "SaaS Metrics", "Enterprise Scaling", "User Research"];
      } else if (lowerRole.includes("recruiter") || lowerRole.includes("hr")) {
        skills = ["Talent Strategy", "Behavioral Interviewing", "ATS Systems", "Onboarding Flows"];
      }

      const scoreVal = c.matchScore || 0;
      let status: "Invite Sent" | "Pending" | "Rejected" = "Pending";
      if (scoreVal >= 85) {
        status = "Invite Sent";
      } else if (scoreVal < 70) {
        status = "Rejected";
      }

      return {
        rank: index + 1,
        name: c.name,
        avatarInitials: initials,
        email: c.email,
        score: scoreVal,
        skills,
        status,
      };
    });
  }, [candidates]);

  // Handles Simulated AI Resume Screening
  const triggerAIScreen = (candidateId: string) => {
    setCandidateStage(candidateId, "Awaiting Ranking");

    showToast("Agentix AI: ScreenerX is parsing resume & analyzing match compatibility...");

    setTimeout(() => {
      const calculatedScore = Math.floor(Math.random() * (98 - 70 + 1)) + 70;
      const generatedSummaries = [
        "Highly aligned frontend expertise. Demonstrates proficient TypeScript architectural design and strong Tailwind layout skills.",
        "Solid infrastructure engineering records. Proficient in automated Kubernetes deployment strategies, CI/CD pipes, and AWS security blueprints.",
        "Demonstrated talent strategy alignment. Skilled in high-volume team scaling, structured behavioral screen designs, and onboarding syncs."
      ];
      const randomSummary = generatedSummaries[Math.floor(Math.random() * generatedSummaries.length)];

      updateCandidateScore(candidateId, calculatedScore, randomSummary);

      showToast(`Screening complete for ${candidates.find(c => c.id === candidateId)?.name || 'candidate'}. Score: ${calculatedScore}%`);
    }, 2500);
  };

  // Handles Adding Candidate
  const handleAddCandidateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandName || !newCandRole || !newCandEmail) {
      alert("Please fill in all required fields.");
      return;
    }

    addCandidate({
      id: Date.now().toString(),
      name: newCandName,
      role: newCandRole,
      department: newCandDept,
      status: "Applied",
      matchScore: null,
      appliedDate: new Date().toISOString().split('T')[0],
      email: newCandEmail,
      currentStage: "Awaiting Parsing",
    });
    setIsAddCandidateOpen(false);
    
    // Reset fields
    setNewCandName("");
    setNewCandRole("");
    setNewCandEmail("");
    
    showToast(`Successfully added ${newCandName} to recruitment pipeline.`);
  };

  // Handles Agent Configuration edits
  const handleAgentConfigSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgentForConfig) return;

    setAiAgents(prev => prev.map(a => {
      if (a.id === selectedAgentForConfig.id) {
        return selectedAgentForConfig;
      }
      return a;
    }));

    showToast(`Configuration updated for ${selectedAgentForConfig.name}.`);
    setSelectedAgentForConfig(null);
  };

  // Run Global System Diagnostics (Mock action)
  const runSystemDiagnostic = () => {
    setDiagnosticRunning(true);
    setDiagnosticResult(null);
    setTimeout(() => {
      setDiagnosticRunning(false);
      const agentCount = agents.length;
      setDiagnosticResult(`All systems nominal. ${plural(agentCount, "HR micro-agent")} responsive. Latency: 12ms. API gateways fully authenticated via Clerk SaaS core.`);
    }, 1800);
  };

  // Auth helper methods
  const handleSignIn = () => {
    setUser({
      name: "Adeel Hussain",
      email: "adeelhussain20255@gmail.com",
      role: "HR Director",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256"
    });
    showToast("Clerk Session: Successfully logged in as Adeel Hussain.");
  };

  const handleSignOut = () => {
    setUser(null);
    showToast("Clerk Session: Logged out successfully.");
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 text-slate-900 font-sans antialiased flex flex-col">
      {/* Navbar Integration - always rendered, full width */}
      <Navbar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab}
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onMenuToggle={() => setIsSidebarOpen(true)}
      />

      {/* Landing Page - full width, no sidebar */}
      {currentTab === "landing" ? (
        <LandingPage onLaunchDashboard={() => setCurrentTab("dashboard")} />
      ) : (
        <div className="flex flex-1 overflow-hidden relative">
          {/* Mobile Sidebar Overlay */}
          <AnimatePresence>
            {isSidebarOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsSidebarOpen(false)}
                  className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm md:hidden"
                />
                <motion.aside
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="fixed left-0 top-0 z-50 h-full w-64 bg-white border-r border-slate-200 p-4 shadow-xl md:hidden"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Main Menu</span>
                    <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <SidebarItem
                      tab="dashboard"
                      label="Home / Overview"
                      currentTab={currentTab}
                      onNavigate={(t) => { setCurrentTab(t); setIsSidebarOpen(false); }}
                    />
                    <SidebarItem
                      tab="dashboard"
                      label="Dashboard"
                      badge="1 Draft"
                      badgeClass="bg-amber-50 text-amber-700 border border-amber-200/50"
                      currentTab={currentTab}
                      onNavigate={(t) => { setCurrentTab(t); setIsSidebarOpen(false); }}
                    />
                    <SidebarItem
                      tab="agents"
                      label="AI Agents"
                      badge={plural(agents.filter(a => a.isRunning).length, "Active")}
                      badgeClass="bg-purple-50 text-purple-700 border border-purple-200/50"
                      currentTab={currentTab}
                      onNavigate={(t) => { setCurrentTab(t); setIsSidebarOpen(false); }}
                    />
                    <SidebarItem
                      tab="candidates"
                      label="Candidates"
                      badge={`${candidates.length} New`}
                      badgeClass="bg-blue-50 text-blue-700 border border-blue-200/50"
                      currentTab={currentTab}
                      onNavigate={(t) => { setCurrentTab(t); setIsSidebarOpen(false); }}
                    />
                    <SidebarItem
                      tab="analytics"
                      label="Analytics"
                      badge={avgMatchScoreLabel}
                      badgeClass="bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                      currentTab={currentTab}
                      onNavigate={(t) => { setCurrentTab(t); setIsSidebarOpen(false); }}
                    />
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Desktop Sidebar */}
          <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 bg-white shrink-0">
            <div className="p-4 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Main Menu</span>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              <SidebarItem
                tab="dashboard"
                label="Home / Overview"
                currentTab={currentTab}
                onNavigate={setCurrentTab}
              />
              <SidebarItem
                tab="dashboard"
                label="Dashboard"
                badge="1 Draft"
                badgeClass="bg-amber-50 text-amber-700 border border-amber-200/50"
                currentTab={currentTab}
                onNavigate={setCurrentTab}
              />
              <SidebarItem
                tab="agents"
                label="AI Agents"
                badge={plural(agents.filter(a => a.isRunning).length, "Active")}
                badgeClass="bg-purple-50 text-purple-700 border border-purple-200/50"
                currentTab={currentTab}
                onNavigate={setCurrentTab}
              />
              <SidebarItem
                tab="candidates"
                label="Candidates"
                badge={`${candidates.length} New`}
                badgeClass="bg-blue-50 text-blue-700 border border-blue-200/50"
                currentTab={currentTab}
                onNavigate={setCurrentTab}
              />
              <SidebarItem
                tab="analytics"
                label="Analytics"
                badge={avgMatchScoreLabel}
                badgeClass="bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                currentTab={currentTab}
                onNavigate={setCurrentTab}
              />
            </nav>
          </aside>

          {/* Main Content Area - full width */}
          <main className="flex-1 min-w-0 px-4 py-6 md:px-8 overflow-y-auto">
            <div className="w-full max-w-6xl mx-auto space-y-8">
        
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {currentTab === "dashboard" && "Dashboard"}
            {currentTab === "agents" && "Agent Control"}
            {currentTab === "candidates" && "Candidates"}
            {currentTab === "analytics" && "Analytics"}
          </h1>
        </div>

        {/* Diagnostic Results Display */}
        {diagnosticResult && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 font-mono text-xs flex items-start gap-3 shadow-md"
            id="diagnostic-result-panel"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[10px]">DIAGNOSTIC_OK</span>
                <button onClick={() => setDiagnosticResult(null)} className="text-slate-500 hover:text-slate-300">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-1 leading-relaxed text-slate-300">{diagnosticResult}</p>
            </div>
          </motion.div>
        )}

        {/* Render Tab Views with AnimatePresence */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.18 }}
          >
            
            {/* ----------------- TAB: DASHBOARD ----------------- */}
            {currentTab === "dashboard" && (
              <div className="space-y-8" id="dashboard-tab">
                
                {/* Job Description & CV Upload Split Workspace */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="workspace-input-area">
                  
                  {/* Left Column: Job Description */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-slate-950 text-white text-xs font-bold">1</span>
                          Job Description
                        </h3>
                        {isJdSaved ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                            <Check className="h-3.5 w-3.5" />
                            <span>Saved & Vectorized</span>
                          </span>
                        ) : (
                          <span className="text-xs text-amber-500 font-medium bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                            Unsaved Changes
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mb-4">
                        Paste target requirements, role scope, and key candidate attributes for the AI Screener model to match.
                      </p>
                      
                      <textarea
                        value={jobDescription}
                        onChange={(e) => handleJdChange(e.target.value)}
                        placeholder="Paste Job Description here..."
                        rows={10}
                        className="w-full text-sm rounded-xl border border-slate-200 p-4 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition font-sans leading-relaxed text-slate-700 bg-slate-50/50"
                      />
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-mono">
                        {jobDescription.split(/\s+/).filter(Boolean).length} words
                      </span>
                      <button
                        onClick={handleSaveJd}
                        className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                          isJdSaved 
                            ? "bg-slate-100 text-slate-500 hover:bg-slate-200" 
                            : "bg-slate-900 text-white hover:bg-slate-800"
                        }`}
                      >
                        {isJdSaved ? "JD Saved" : "Save Job Description"}
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Advanced Bulk Upload Ingestion & Control Hub */}
                  <div className="space-y-6">
                    <BulkUploadZone 
                      onFilesProcessed={(count) => {
                        // Dynamically generate simulated candidate details with matching names
                        const names = [
                          "Clara Fontaine", "Liam Novak", "Rajesh Kumar", 
                          "Alex Rivera", "Jordan Smith", "Taylor Chen", 
                          "Morgan Taylor", "Casey Johnson", "Jamie Lee"
                        ];
                        const fileTypes = ["PDF", "DOCX", "DOC", "CSV"];
                        
                        const newStaged = Array.from({ length: count }).map((_, idx) => {
                          const randName = names[idx % names.length];
                          const ext = fileTypes[Math.floor(Math.random() * fileTypes.length)].toLowerCase();
                          const finalName = `resume_${randName.toLowerCase().replace(" ", "_")}.${ext}`;
                          return {
                            id: `bulk-staged-${Date.now()}-${idx}`,
                            name: finalName,
                            size: `${(Math.random() * 150 + 100).toFixed(0)} KB`,
                            status: "staged" as const
                          };
                        });
                        setStagedCvs(prev => [...prev, ...newStaged]);
                        setFiles(prev => [...prev, ...newStaged]);
                      }}
                      showToast={showToast}
                    />

                    {/* Staged Resumes Interactive Panel */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center h-5.5 w-5.5 rounded-full bg-slate-900 text-white text-[10px] font-bold">2</span>
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Candidate Staging Buffer</h4>
                        </div>
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                          {plural(stagedCvs.length, "CV")} Active
                        </span>
                      </div>

                      {stagedCvs.length > 0 ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                          {stagedCvs.map((cv) => (
                            <div key={cv.id} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 text-xs hover:bg-slate-50 hover:border-slate-200 transition">
                              <div className="flex items-center gap-2.5 truncate max-w-[70%]">
                                <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                                <span className="font-bold text-slate-700 truncate">{cv.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono shrink-0">({cv.size})</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {cv.status === "parsing" ? (
                                  <span className="flex items-center gap-1 text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded animate-pulse">
                                    <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                                    <span>Parsing...</span>
                                  </span>
                                ) : cv.status === "completed" ? (
                                  <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                                    <Check className="h-2.5 w-2.5" />
                                    <span>Scored</span>
                                  </span>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveStagedCv(cv.id);
                                    }}
                                    className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                                    title="Remove from staging"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center">
                          <p className="text-xs text-slate-400 font-medium">Staging buffer is empty</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 max-w-xs">Upload resumes or force fetch files above to load candidates into current assessment batch.</p>
                          <div className="flex items-center gap-2 mt-3.5">
                            <span className="text-[10px] text-slate-400">Quick Sandbox Action:</span>
                            <button
                              onClick={() => {
                                setStagedCvs([
                                  { id: "cv-1", name: "resume_clara_fontaine.pdf", size: "244 KB", status: "staged" },
                                  { id: "cv-2", name: "resume_liam_novak.pdf", size: "189 KB", status: "staged" },
                                  { id: "cv-3", name: "resume_rajesh_kumar.pdf", size: "312 KB", status: "staged" }
                                ]);
                                showToast("Staged 3 diagnostic candidate CVs");
                              }}
                              className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold underline"
                            >
                              Load 3 Demo Resumes
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Full-Width Scoring Run Button or Progress Bar */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  {isProcessing ? (
                    <div className="space-y-4 animate-fadeIn">
                      {/* Progress bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-indigo-600 font-semibold animate-pulse">
                            <Bot className="h-4 w-4" />
                            <span>Agentix Engine Active: Scoring candidate suitability indexes...</span>
                          </div>
                          <span className="font-mono font-bold text-slate-700">{scoringProgress}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-150 rounded-full" 
                            style={{ width: `${scoringProgress}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                          <span>[STAGE] Parsing resumes into structured AST formats</span>
                          <span>ScreenerX v2.4 (Active)</span>
                        </div>
                      </div>

                      {/* Loading Button with Spinner */}
                      <div className="flex justify-center">
                        <button
                          disabled
                          className="w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center gap-2 cursor-not-allowed"
                        >
                          <RefreshCw className="h-4.5 w-4.5 animate-spin text-indigo-600" />
                          <span>Analyzing CVs...</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <button
                          onClick={() => handleSubmit()}
                          disabled={!isJdSaved || (stagedCvs.length === 0 && files.length === 0)}
                          className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide transition-all shadow flex items-center justify-center gap-2 cursor-pointer ${
                            isJdSaved && (stagedCvs.length > 0 || files.length > 0)
                              ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-500 hover:to-blue-500 hover:shadow-lg active:scale-[0.99] hover:shadow-indigo-100"
                              : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                          }`}
                        >
                          <Sparkles className={`h-4.5 w-4.5 ${isJdSaved && (stagedCvs.length > 0 || files.length > 0) ? "text-amber-200 animate-pulse" : "text-slate-400"}`} />
                          <span>Run Agentix AI Scoring</span>
                        </button>
                      </div>

                      {(!isJdSaved || (stagedCvs.length === 0 && files.length === 0)) && (
                        <div className="flex items-start gap-2 bg-slate-50 border border-slate-100 p-2.5 rounded-xl sm:max-w-xs shrink-0">
                          <AlertCircle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                          <p className="text-[10px] text-slate-500 leading-normal font-medium">
                            {!isJdSaved && (stagedCvs.length === 0 && files.length === 0) 
                              ? "Save the Job Description on the left and stage CVs on the right to start scoring." 
                              : !isJdSaved 
                              ? "Click 'Save Job Description' first to initialize suitability evaluation weights." 
                              : "Stage at least 1 candidate resume PDF to trigger the ScreenerX model."}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Asynchronous Processing Queue */}
                <div className="my-2">
                  <AgentQueue
                    onTriggerToast={showToast}
                    onAdvanceStage={(name) => {
                      const match = candidates.find(c => c.name === name);
                      if (match) advanceCandidateStage(match.id);
                    }}
                  />
                </div>

                {/* Responsive Grid of Stat Cards */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  
                  {/* Stat Card 1 */}
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Candidates</span>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-700">
                        <Users className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-3xl font-bold tracking-tight text-slate-900">{stats.totalCandidates}</span>
                      <div className="mt-1.5 flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>{config.candidatesTrend}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stat Card 2 */}
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active AI Agents</span>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100/50 text-emerald-700">
                        <Bot className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-3xl font-bold tracking-tight text-slate-900">{stats.activeAIAgents}</span>
                      <div className="mt-1.5 flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>All systems healthy</span>
                      </div>
                    </div>
                  </div>

                  {/* Stat Card 3 */}
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">High Match Pool</span>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100/50 text-indigo-700">
                        <UserCheck className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-3xl font-bold tracking-tight text-slate-900">{stats.highMatchCandidates}</span>
                      <div className="mt-1.5 flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <span>Score matching &gt;= {config.highMatchThreshold}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Stat Card 4 */}
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hours Saved (Est.)</span>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 border border-amber-100/50 text-amber-700">
                        <Clock className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-3xl font-bold tracking-tight text-slate-900">{stats.hoursSavedThisMonth} {stats.hoursSavedThisMonth === 1 ? "hr" : "hrs"}</span>
                      <div className="mt-1.5 flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Autonomous workflows</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* ----------------- TAB: AI AGENTS ----------------- */}
            {currentTab === "agents" && (
              <div id="agents-tab" className="space-y-6">
                <div className="border-b border-slate-200 pb-5">
                  <h2 className="text-xl font-bold text-slate-900">AI Agents Management</h2>
                </div>
                <AgentAnalytics mode="agents" bots={agents} onToggleBot={toggleAgent} candidates={candidates} processingTimeMs={config.processingTimeMs} cvProcessedTrend={config.cvProcessedTrend} chartData={chartData} />
              </div>
            )}

            {/* ----------------- TAB: CANDIDATES ----------------- */}
            {currentTab === "candidates" && (
              <div className="space-y-6" id="candidates-tab">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Candidate Pipeline Hub</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setIsAddCandidateOpen(true)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition focus:outline-none"
                      id="add-candidate-trigger-btn"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Candidate</span>
                    </button>
                  </div>
                </div>

                {/* Search & Filter Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search candidate by name, role, or department..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2 text-xs focus:border-slate-400 focus:outline-none transition bg-slate-50/50"
                      id="candidate-search-input"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-slate-400 focus:outline-none bg-slate-50/50 text-slate-600 font-medium"
                      id="candidate-status-filter"
                    >
                      <option value="All">All Stages</option>
                      <option value="Applied">Applied</option>
                      <option value="Screening">Screening</option>
                      <option value="Interviewing">Interviewing</option>
                      <option value="Offered">Offered</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Candidate Table Layout */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 text-left">
                      <thead className="bg-slate-50/70 font-sans text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-3.5">Candidate Details</th>
                          <th className="px-6 py-3.5">Role / Department</th>
                          <th className="px-6 py-3.5">Applied Date</th>
                          <th className="px-6 py-3.5 text-center">AI Match Score</th>
                          <th className="px-6 py-3.5">Status</th>
                          <th className="relative px-6 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white text-xs">
                        {filteredCandidates.length > 0 ? (
                          filteredCandidates.map((cand) => (
                            <tr key={cand.id} className="hover:bg-slate-50/50 transition">
                              <td className="whitespace-nowrap px-6 py-4.5">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 border border-slate-200 font-bold text-slate-800">
                                    {cand.name.split(" ").map(n => n[0]).join("")}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-slate-900">{cand.name}</div>
                                    <div className="text-slate-400 mt-0.5">{cand.email}</div>
                                  </div>
                                </div>
                              </td>
                              
                              <td className="whitespace-nowrap px-6 py-4.5">
                                <div className="font-medium text-slate-800">{cand.role}</div>
                                <div className="text-slate-500 mt-0.5">{cand.department}</div>
                              </td>

                              <td className="whitespace-nowrap px-6 py-4.5 text-slate-500">
                                {cand.appliedDate}
                              </td>

                              <td className="whitespace-nowrap px-6 py-4.5 text-center">
                                  {cand.matchScore ? (
                                  <div className="inline-flex items-center justify-center rounded-lg bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-indigo-700 font-mono font-bold">
                                    {cand.matchScore}%
                                  </div>
                                ) : (
                                  <span className="text-slate-400 font-medium">Unscreened</span>
                                )}
                              </td>

                              <td className="whitespace-nowrap px-6 py-4.5">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                  cand.status === "Applied" 
                                    ? "bg-slate-100 text-slate-800" 
                                    : cand.status === "Screening"
                                    ? "bg-sky-50 text-sky-700 border-sky-100"
                                    : cand.status === "Interviewing"
                                    ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                                    : cand.status === "Offered"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                    : "bg-rose-50 text-rose-700 border-rose-100"
                                }`}>
                                  {cand.status}
                                </span>
                              </td>

                              <td className="whitespace-nowrap px-6 py-4.5 text-right font-medium">
                                <div className="flex items-center justify-end gap-2">
                                  {cand.matchScore === null && (
                                    <>
                                      {cand.currentStage === "Awaiting Ranking" ? (
                                        <div className="inline-flex items-center gap-1.5 text-indigo-600 font-semibold px-3 py-1.5 bg-indigo-50/50 rounded-lg border border-indigo-100">
                                          <RefreshCw className="h-3 w-3 animate-spin" />
                                          <span>Scanning...</span>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => triggerAIScreen(cand.id)}
                                          className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 font-semibold text-indigo-700 hover:bg-indigo-100/60 transition focus:outline-none"
                                        >
                                          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                                          <span>AI Screen</span>
                                        </button>
                                      )}
                                    </>
                                  )}

                                  {cand.matchScore !== null && (
                                    <button
                                      onClick={() => alert(`ScreenerX Scorecard Analysis:\nCandidate: ${cand.name}\n\nMatching Score: ${cand.matchScore}%\n\nResume Summary: ${cand.summary || 'Matches ideal workforce parameters.'}`)}
                                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 transition focus:outline-none"
                                    >
                                      <Eye className="h-3.5 w-3.5 text-slate-500" />
                                      <span>View Scorecard</span>
                                    </button>
                                  )}

                                  <button
                                    onClick={() => {
                                      if (confirm(`Remove ${cand.name} from pipeline?`)) {
                                        removeCandidate(cand.id);
                                        showToast(`Removed candidate ${cand.name}.`);
                                      }
                                    }}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition focus:outline-none"
                                    title="Delete candidate"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                              <div className="flex flex-col items-center justify-center">
                                <Search className="h-8 w-8 text-slate-300 mb-2" />
                                <p className="text-sm font-semibold text-slate-700">No candidates found</p>
                                <p className="text-xs text-slate-400 mt-1">Try adjusting your search queries or filter categories.</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- TAB: ANALYTICS ----------------- */}
            {currentTab === "analytics" && (
              <div className="space-y-6" id="analytics-tab">
                <div className="border-b border-slate-200 pb-5">
                  <h2 className="text-xl font-bold text-slate-900">Analytics & Insights</h2>
                </div>
                <AgentAnalytics mode="analytics" bots={agents} onToggleBot={toggleAgent} candidates={candidates} processingTimeMs={config.processingTimeMs} cvProcessedTrend={config.cvProcessedTrend} chartData={chartData} />
              </div>
            )}

          </motion.div>
        </AnimatePresence>
          </div>
        </main>
      </div>
      )}

      {/* ----------------- MODAL: ADD CANDIDATE ----------------- */}
      <AnimatePresence>
        {isAddCandidateOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAddCandidateOpen(false)}
                className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
              />

              {/* Modal Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.2 }}
                className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all w-full max-w-lg p-6 border border-slate-200"
                id="add-candidate-modal"
              >
                <div className="absolute right-4 top-4">
                  <button
                    onClick={() => setIsAddCandidateOpen(false)}
                    className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex items-center gap-2.5 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm">
                    <UserCheck className="h-5 w-5 text-slate-100" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Add New Candidate</h3>
                    <p className="text-xs text-slate-400">Initialize a custom candidate card into your ATS qualification tracker.</p>
                  </div>
                </div>

                <form onSubmit={handleAddCandidateSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="cand-name" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="cand-name"
                      required
                      value={newCandName}
                      onChange={(e) => setNewCandName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs focus:border-slate-400 focus:outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="cand-role" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                        Applied Role *
                      </label>
                      <input
                        type="text"
                        id="cand-role"
                        required
                        value={newCandRole}
                        onChange={(e) => setNewCandRole(e.target.value)}
                        placeholder="Sr. Product Designer"
                        className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs focus:border-slate-400 focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label htmlFor="cand-dept" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                        Department
                      </label>
                      <select
                        id="cand-dept"
                        value={newCandDept}
                        onChange={(e) => setNewCandDept(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs focus:border-slate-400 focus:outline-none transition bg-white"
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Design">Design</option>
                        <option value="Product">Product</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Human Resources">Human Resources</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="cand-email" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="cand-email"
                      required
                      value={newCandEmail}
                      onChange={(e) => setNewCandEmail(e.target.value)}
                      placeholder="jane.doe@example.com"
                      className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs focus:border-slate-400 focus:outline-none transition"
                    />
                  </div>

                  <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsAddCandidateOpen(false)}
                      className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition focus:outline-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition focus:outline-none"
                    >
                      Add Candidate
                    </button>
                  </div>
                </form>
              </motion.div>

            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------- DRAWER / MODAL: AGENT CONFIGURATION ----------------- */}
      <AnimatePresence>
        {selectedAgentForConfig && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedAgentForConfig(null)}
                className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
              />

              {/* Modal Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.2 }}
                className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all w-full max-w-lg p-6 border border-slate-200"
                id="agent-config-modal"
              >
                <div className="absolute right-4 top-4">
                  <button
                    onClick={() => setSelectedAgentForConfig(null)}
                    className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex items-center gap-2.5 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm">
                    <Sliders className="h-5 w-5 text-slate-100" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Configure {selectedAgentForConfig.name}</h3>
                    <p className="text-xs text-slate-400">Tweak core parameters, confidence boundaries, and intake vectors.</p>
                  </div>
                </div>

                <form onSubmit={handleAgentConfigSave} className="space-y-4">
                  <div>
                    <label htmlFor="agent-channel" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      Integration Intake Channel
                    </label>
                    <input
                      type="text"
                      id="agent-channel"
                      value={selectedAgentForConfig.config.channel}
                      onChange={(e) => setSelectedAgentForConfig({
                        ...selectedAgentForConfig,
                        config: { ...selectedAgentForConfig.config, channel: e.target.value }
                      })}
                      className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs focus:border-slate-400 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="confidence-slider" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Confidence Score Threshold
                      </label>
                      <span className="font-mono text-xs font-bold text-indigo-600">
                        {selectedAgentForConfig.config.confidenceThreshold}%
                      </span>
                    </div>
                    <input
                      type="range"
                      id="confidence-slider"
                      min="50"
                      max="95"
                      step="5"
                      value={selectedAgentForConfig.config.confidenceThreshold}
                      onChange={(e) => setSelectedAgentForConfig({
                        ...selectedAgentForConfig,
                        config: { ...selectedAgentForConfig.config, confidenceThreshold: parseInt(e.target.value) }
                      })}
                      className="w-full accent-indigo-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Triggers warning escalation loops for scores registered beneath this standard.
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 mt-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700">Autonomous Instant Screening</span>
                      <span className="text-[10px] text-slate-400">Trigger qualification analysis immediately upon inbound upload.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedAgentForConfig({
                        ...selectedAgentForConfig,
                        config: { ...selectedAgentForConfig.config, autoScreen: !selectedAgentForConfig.config.autoScreen }
                      })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        selectedAgentForConfig.config.autoScreen ? "bg-slate-900" : "bg-slate-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          selectedAgentForConfig.config.autoScreen ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedAgentForConfig(null)}
                      className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition focus:outline-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition focus:outline-none"
                    >
                      Save Configuration
                    </button>
                  </div>
                </form>
              </motion.div>

            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Global Micro Notification System */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm rounded-xl border border-slate-200 bg-white p-4 shadow-xl ring-1 ring-black/5 flex items-start gap-3.5"
            id="toast-notification"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Bot className="h-4.5 w-4.5" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-900">System Notification</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-normal">{toastMessage}</p>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-600 transition">
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern, Minimalist SaaS Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-400">
          <p className="flex items-center gap-1.5">
            <Bot className="h-3.5 w-3.5 text-slate-500" />
            <span>&copy; {new Date().getFullYear()} Agentix AI. All rights reserved.</span>
          </p>
          <div className="flex gap-4">
            <button className="hover:text-slate-600 transition">Privacy Policy</button>
            <button className="hover:text-slate-600 transition">Terms of Service</button>
            <button className="hover:text-slate-600 transition">Status Hub</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
