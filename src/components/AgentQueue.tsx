import React, { useState } from "react";
import { 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Layers, 
  Send, 
  ChevronDown, 
  Sparkles,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { QueueItem } from "../store/useAppStore";

export type QueueStage = "Awaiting Parsing" | "Awaiting Ranking" | "Ready for Outreach" | "Invite Sent";

interface AgentQueueProps {
  items: QueueItem[];
  onTriggerToast?: (message: string) => void;
  onAdvanceStage?: (candidateName: string) => void;
  refreshQueue?: () => void;
}

const plural = (count: number, singular: string, pluralForm?: string): string => {
  const word = count === 1 ? singular : (pluralForm ?? `${singular}s`);
  return `${count} ${word}`;
};

export default function AgentQueue({ items, onTriggerToast, onAdvanceStage, refreshQueue }: AgentQueueProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDropdown, setShowBulkDropdown] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map(item => item.id));
    }
  };

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case "Awaiting Parsing":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            <Clock className="h-3 w-3" />
            Awaiting Parsing
          </span>
        );
      case "Awaiting Ranking":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-semibold text-blue-700">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <Cpu className="h-3 w-3" />
            Awaiting Ranking
          </span>
        );
      case "Ready for Outreach":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 border border-purple-200 px-2.5 py-1 text-xs font-semibold text-purple-700">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            <Sparkles className="h-3 w-3" />
            Ready for Outreach
          </span>
        );
      case "Invite Sent":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <Send className="h-3 w-3" />
            Invite Sent
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {stage}
          </span>
        );
    }
  };

  const getFileTypeBadge = (type: string) => {
    switch (type.toUpperCase()) {
      case "PDF":
        return "text-red-500 bg-red-50 border-red-100";
      case "DOCX":
        return "text-blue-500 bg-blue-50 border-blue-100";
      case "CSV":
        return "text-emerald-500 bg-emerald-50 border-emerald-100";
      default:
        return "text-slate-500 bg-slate-50 border-slate-100";
    }
  };

  const getScoreBadge = (score: number | null) => {
    if (score === null) {
      return (
        <span className="text-slate-400 text-xs font-mono italic">
          Pending Rank
        </span>
      );
    }
    const colorClass = score >= 85 ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-blue-50 text-indigo-700 border-indigo-100";
    return (
      <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-mono font-bold ${colorClass}`}>
        {score}%
      </span>
    );
  };

  const handlePushToNextStage = () => {
    if (selectedIds.length === 0) {
      if (onTriggerToast) onTriggerToast("Please select at least one item from the queue");
      return;
    }

    selectedIds.forEach((id) => {
      const item = items.find((i) => i.id === id);
      if (item && onAdvanceStage) onAdvanceStage(item.candidateName);
    });

    if (refreshQueue) setTimeout(refreshQueue, 500);

    if (onTriggerToast) {
      onTriggerToast(`Manually dispatched ${plural(selectedIds.length, "candidate")} to the next pipeline agent node`);
    }
    setSelectedIds([]);
    setShowBulkDropdown(false);
  };

  const handleStepUpgradeSingle = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item && onAdvanceStage) onAdvanceStage(item.candidateName);
    if (refreshQueue) setTimeout(refreshQueue, 500);
    if (onTriggerToast) {
      onTriggerToast("Manually transitioned candidate to next pipeline process");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="agentix-asynchronous-queue-widget">
      
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-600 animate-pulse" />
            <h3 className="text-base font-bold text-slate-900">Asynchronous Processing Queue</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor and manage CV documents navigating multi-agent staging filters when automated bots are halted.
          </p>
        </div>

        <div className="relative flex items-center gap-2">
          {refreshQueue && (
            <button
              onClick={refreshQueue}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition shadow-sm cursor-pointer bg-white"
            >
              Refresh
            </button>
          )}
          <div className="relative">
            <button
              onClick={() => setShowBulkDropdown(!showBulkDropdown)}
              disabled={selectedIds.length === 0}
              className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition shadow-sm cursor-pointer ${
                selectedIds.length > 0 
                  ? "bg-slate-900 text-white border-slate-950 hover:bg-slate-800" 
                  : "bg-slate-100 text-slate-400 border-slate-200/80 cursor-not-allowed"
              }`}
            >
              <span>Bulk Actions ({selectedIds.length} Selected)</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            <AnimatePresence>
              {showBulkDropdown && selectedIds.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-30 font-sans"
                >
                  <button
                    onClick={handlePushToNextStage}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2"
                  >
                    <ArrowRight className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Push to Next Agent</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedIds([]);
                      setShowBulkDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <span>Clear Selection</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-left">
          <thead className="bg-slate-50/30 font-sans text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 text-center w-12">
                <input
                  type="checkbox"
                  checked={selectedIds.length === items.length && items.length > 0}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </th>
              <th className="px-6 py-4">File Name / Candidate</th>
              <th className="px-6 py-4 text-center w-28">File Type</th>
              <th className="px-6 py-4 w-48">Current Stage</th>
              <th className="px-6 py-4 text-center w-32">Match Score</th>
              <th className="px-6 py-4 text-center w-24">Actions</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-100 bg-white text-xs">
            {items.length > 0 ? items.map((item, idx) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`transition duration-150 group ${isSelected ? "bg-indigo-50/20" : "hover:bg-slate-50/50"}`}
                >
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(item.id)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 border border-slate-200 text-slate-600 shadow-sm">
                        <FileText className="h-4 w-4 text-slate-500" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition">
                          {item.fileName}
                        </div>
                        <div className="text-slate-400 text-[10px] mt-0.5">{item.candidateName} • {item.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold ${getFileTypeBadge(item.fileType)}`}>
                      {item.fileType}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStageBadge(item.stage)}
                  </td>

                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    {getScoreBadge(item.score)}
                  </td>

                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      {item.stage !== "Invite Sent" ? (
                        <button
                          onClick={() => handleStepUpgradeSingle(item.id)}
                          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 hover:border-indigo-200 px-2.5 py-1 rounded-lg transition"
                        >
                          Push Stage
                        </button>
                      ) : (
                        <span className="text-emerald-600 font-bold flex items-center gap-1 justify-center">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Done
                        </span>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            }) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  <p className="text-sm font-semibold text-slate-700">Queue is empty</p>
                  <p className="text-xs text-slate-400 mt-1">No candidates currently in the processing pipeline.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-indigo-500" />
          <span>{items.length} candidate(s) in queue. Data sourced from live pipeline.</span>
        </div>
        
        <button 
          onClick={() => alert("Processing queue shows candidates currently moving through the AI agent pipeline stages. Use 'Push Stage' to manually advance them.")}
          className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer self-start sm:self-center"
        >
          <HelpCircle className="h-3 w-3" />
          <span>Pipeline logic help</span>
        </button>
      </div>
    </div>
  );
}
