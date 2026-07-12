import React, { useState } from "react";
import { 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Layers, 
  Settings2, 
  Send, 
  ChevronDown, 
  Sparkles,
  HelpCircle,
  MoreHorizontal
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export type QueueStage = "Awaiting Parsing" | "Awaiting Ranking" | "Ready for Outreach" | "Invite Sent";

export interface QueueItem {
  id: string;
  candidateName: string;
  email: string;
  fileName: string;
  fileType: "PDF" | "DOCX" | "CSV";
  stage: QueueStage;
  score: number | null; // null if not yet ranked
}

interface AgentQueueProps {
  onTriggerToast?: (message: string) => void;
}

export default function AgentQueue({ onTriggerToast }: AgentQueueProps) {
  // 5 initial rows showing files at different stages of the pipeline
  const [items, setItems] = useState<QueueItem[]>([
    {
      id: "q-1",
      candidateName: "Clara Fontaine",
      email: "clara.fontaine@creativeops.co",
      fileName: "resume_clara_fontaine.pdf",
      fileType: "PDF",
      stage: "Invite Sent",
      score: 94,
    },
    {
      id: "q-2",
      candidateName: "Liam Novak",
      email: "liam.novak@pixelpulse.dev",
      fileName: "resume_liam_novak.docx",
      fileType: "DOCX",
      stage: "Ready for Outreach",
      score: 88,
    },
    {
      id: "q-3",
      candidateName: "Rajesh Kumar",
      email: "rajesh.kumar@cloudops.net",
      fileName: "resume_rajesh_kumar.pdf",
      fileType: "PDF",
      stage: "Awaiting Ranking",
      score: null, // stuck because Ranker Bot or Parser Bot might be active/inactive
    },
    {
      id: "q-4",
      candidateName: "Marcus Vance",
      email: "marcus.vance@cloudsolutions.net",
      fileName: "cv_marcus_vance.csv",
      fileType: "CSV",
      stage: "Awaiting Parsing",
      score: null,
    },
    {
      id: "q-5",
      candidateName: "Elena Rostova",
      email: "elena.rostova@techcorp.io",
      fileName: "resume_elena_rostova.pdf",
      fileType: "PDF",
      stage: "Awaiting Ranking",
      score: null,
    },
  ]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDropdown, setShowBulkDropdown] = useState(false);

  // Toggle selection for a row
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Toggle all rows
  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map(item => item.id));
    }
  };

  // Helper to get visual badges representing the agent workflow
  const getStageBadge = (stage: QueueStage) => {
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
        return null;
    }
  };

  // File Type Color Code Indicator
  const getFileTypeBadge = (type: "PDF" | "DOCX" | "CSV") => {
    switch (type) {
      case "PDF":
        return "text-red-500 bg-red-50 border-red-100";
      case "DOCX":
        return "text-blue-500 bg-blue-50 border-blue-100";
      case "CSV":
        return "text-emerald-500 bg-emerald-50 border-emerald-100";
    }
  };

  // Score Badge Styling Helper
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

  // Manually push selected rows to the next stage
  const handlePushToNextStage = () => {
    if (selectedIds.length === 0) {
      if (onTriggerToast) onTriggerToast("Please select at least one item from the queue");
      return;
    }

    setItems(prev =>
      prev.map(item => {
        if (selectedIds.includes(item.id)) {
          let nextStage = item.stage;
          let nextScore = item.score;
          if (item.stage === "Awaiting Parsing") {
            nextStage = "Awaiting Ranking";
          } else if (item.stage === "Awaiting Ranking") {
            nextStage = "Ready for Outreach";
            nextScore = Math.floor(Math.random() * (95 - 75 + 1)) + 75; // Generate score
          } else if (item.stage === "Ready for Outreach") {
            nextStage = "Invite Sent";
          }
          return { ...item, stage: nextStage, score: nextScore };
        }
        return item;
      })
    );

    if (onTriggerToast) {
      onTriggerToast(`Manually dispatched ${selectedIds.length} candidate(s) to the next pipeline agent node`);
    }
    setSelectedIds([]);
    setShowBulkDropdown(false);
  };

  // Manual step upgrade single candidate
  const handleStepUpgradeSingle = (id: string) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          let nextStage = item.stage;
          let nextScore = item.score;
          if (item.stage === "Awaiting Parsing") {
            nextStage = "Awaiting Ranking";
          } else if (item.stage === "Awaiting Ranking") {
            nextStage = "Ready for Outreach";
            nextScore = Math.floor(Math.random() * (96 - 78 + 1)) + 78;
          } else if (item.stage === "Ready for Outreach") {
            nextStage = "Invite Sent";
          }
          return { ...item, stage: nextStage, score: nextScore };
        }
        return item;
      })
    );
    if (onTriggerToast) {
      onTriggerToast("Manually transitioned candidate to next pipeline process");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="agentix-asynchronous-queue-widget">
      
      {/* Header and Bulk Action Tool Block */}
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

        {/* Bulk Action Dropdown with interactive push control */}
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

      {/* Table Section */}
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
            {items.map((item, idx) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`transition duration-150 group ${isSelected ? "bg-indigo-50/20" : "hover:bg-slate-50/50"}`}
                >
                  {/* Select Row Checkbox */}
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(item.id)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </td>

                  {/* Candidate Name / File Name Details */}
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

                  {/* File Type Column */}
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold ${getFileTypeBadge(item.fileType)}`}>
                      {item.fileType}
                    </span>
                  </td>

                  {/* Current Stage Badge Column */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStageBadge(item.stage)}
                  </td>

                  {/* Match Score Column */}
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    {getScoreBadge(item.score)}
                  </td>

                  {/* Actions Column (Push individual) */}
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      {item.stage !== "Invite Sent" ? (
                        <button
                          onClick={() => handleStepUpgradeSingle(item.id)}
                          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 hover:border-indigo-200 px-2.5 py-1 rounded-lg transition"
                          title="Trigger manual agent pipeline forward"
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
            })}
          </tbody>
        </table>
      </div>

      {/* Footer queue information message */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-indigo-500 animate-spin" />
          <span>Queue state auto-refreshed upon manual action override overrides. All logs piped safely.</span>
        </div>
        
        <button 
          onClick={() => alert("Asynchronous queue locks threads when specific agent controllers (Fetcher, Parser, Ranker, Scheduler) are paused, ensuring lossless candidate routing.")}
          className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer self-start sm:self-center"
        >
          <HelpCircle className="h-3 w-3" />
          <span>Pipeline logic help</span>
        </button>
      </div>
    </div>
  );
}
