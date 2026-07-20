import React, { useState, useRef } from "react";
import {
  Bot,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Play,
  FileText,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { motion } from "motion/react";
import { api, PipelineRunDTO } from "../api";

interface PipelineRunnerProps {
  jobDescription: string;
  candidateIds: string[];
  pastRuns: PipelineRunDTO[];
  onRunPipeline: (data: { job_title: string; job_description: string; candidate_ids: string[] }) => Promise<any>;
  onSelectRun: (runId: string) => void;
  showToast: (msg: string) => void;
}

const AGENT_STEPS = [
  { key: "Parser Agent", label: "Parser Agent", desc: "Extracting structured data from raw candidate profiles" },
  { key: "Screener Agent", label: "Screener Agent", desc: "Scoring candidates against job requirements" },
  { key: "Deep Ranker Agent", label: "Deep Ranker Agent", desc: "Comparative ranking with deep analysis" },
  { key: "Finalizer Agent", label: "Finalizer Agent", desc: "Producing final verdicts and best match" },
];

export default function PipelineRunner({
  jobDescription,
  candidateIds,
  pastRuns,
  onRunPipeline,
  onSelectRun,
  showToast,
}: PipelineRunnerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentAgent, setCurrentAgent] = useState<string | null>(null);
  const [latestRunId, setLatestRunId] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const handleRun = async () => {
    if (!jobDescription.trim()) {
      showToast("Please enter a job description first");
      return;
    }
    if (candidateIds.length === 0) {
      showToast("No candidates available. Fetch or upload candidates first.");
      return;
    }
    setIsRunning(true);
    setProgress(5);
    setCurrentAgent("Parser Agent");

    try {
      const result = await onRunPipeline({
        job_title: jobDescription.split("\n")[0].slice(0, 60),
        job_description: jobDescription,
        candidate_ids: candidateIds,
      });

      const runId = result.run?.id || result.run_id;
      if (!runId) {
        showToast("Pipeline started but no run ID returned");
        setIsRunning(false);
        return;
      }

      setLatestRunId(runId);
      showToast("Pipeline started in background — polling for completion...");

      let attempts = 0;
      const maxAttempts = 120;
      pollingRef.current = setInterval(async () => {
        attempts++;
        try {
          const status = await api.pipeline.getRun(runId);
          const run = status.run;

          setProgress(run.progress || 0);
          setCurrentAgent(run.current_agent);

          if (run.status === "completed") {
            stopPolling();
            setProgress(100);
            setCurrentAgent(null);
            setIsRunning(false);
            showToast(`Pipeline complete! ${run.total_candidates} candidates processed.`);
            setTimeout(() => onSelectRun(runId), 500);
          } else if (run.status === "failed") {
            stopPolling();
            setIsRunning(false);
            showToast(`Pipeline failed: ${run.error_message || "Unknown error"}`);
          } else if (attempts >= maxAttempts) {
            stopPolling();
            setIsRunning(false);
            showToast("Pipeline timed out — check status manually");
          }
        } catch (e: any) {
          stopPolling();
          setIsRunning(false);
          showToast(`Pipeline polling error: ${e.message || e}`);
        }
      }, 3000);
    } catch (e: any) {
      stopPolling();
      setIsRunning(false);
      showToast(`Pipeline failed: ${e.message || e}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">4-Agent AI Pipeline</h3>
          </div>
          {candidateIds.length > 0 && (
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              {candidateIds.length} candidates ready
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mb-5">
          Process all candidates through 4 autonomous AI agents: Parse → Screen → Deep Rank → Finalize
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {AGENT_STEPS.map((agent, i) => {
            const isActive = currentAgent === agent.key;
            const isDone = currentAgent !== null && AGENT_STEPS.findIndex(a => a.key === currentAgent) > i;
            return (
              <div
                key={agent.key}
                className={`p-3 rounded-xl border text-xs transition ${
                  isActive
                    ? "bg-indigo-50 border-indigo-200 shadow-sm"
                    : isDone
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold ${
                    isActive ? "bg-indigo-600 text-white" : isDone ? "bg-emerald-500 text-white" : "bg-slate-300 text-white"
                  }`}>
                    {isDone ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
                  </div>
                  <span className={`font-semibold ${isActive ? "text-indigo-700" : isDone ? "text-emerald-700" : "text-slate-600"}`}>
                    {agent.label}
                  </span>
                  {isActive && <RefreshCw className="h-3 w-3 text-indigo-500 animate-spin ml-auto" />}
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">{agent.desc}</p>
              </div>
            );
          })}
        </div>

        {isRunning && (
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-indigo-600 font-semibold animate-pulse flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                {currentAgent ? `Running ${currentAgent}...` : "Starting pipeline..."}
              </span>
              <span className="font-mono font-bold text-slate-700">{progress}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div className="h-full bg-gradient-to-r from-indigo-600 to-blue-600 transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <button
          onClick={handleRun}
          disabled={isRunning || !jobDescription.trim() || candidateIds.length === 0}
          className={`w-full py-3 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
            isRunning
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-500 hover:to-blue-500 hover:shadow-lg active:scale-[0.99]"
          }`}
        >
          {isRunning ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Processing ({progress}%)...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Run Full Pipeline ({candidateIds.length} candidates)
            </>
          )}
        </button>
      </div>

      {pastRuns.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              Past Pipeline Runs
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">{pastRuns.length} runs</span>
          </div>
          <div className="divide-y divide-slate-100">
            {pastRuns.slice(0, 10).map((run) => (
              <button
                key={run.id}
                onClick={() => { onSelectRun(run.id); setLatestRunId(run.id); }}
                className={`w-full flex items-center justify-between px-5 py-3 text-xs hover:bg-slate-50 transition text-left cursor-pointer ${
                  latestRunId === run.id ? "bg-indigo-50/50" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full ${
                    run.status === "completed" ? "bg-emerald-50 text-emerald-600" :
                    run.status === "failed" ? "bg-rose-50 text-rose-600" :
                    "bg-amber-50 text-amber-600"
                  }`}>
                    {run.status === "completed" ? <CheckCircle2 className="h-3.5 w-3.5" /> :
                     run.status === "failed" ? <AlertCircle className="h-3.5 w-3.5" /> :
                     <RefreshCw className="h-3.5 w-3.5" />}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">{run.job_title || "Pipeline Run"}</div>
                    <div className="text-[10px] text-slate-400">
                      {run.total_candidates} candidates · {run.status}
                      {run.completed_at ? ` · ${new Date(run.completed_at).toLocaleDateString()}` : ""}
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
