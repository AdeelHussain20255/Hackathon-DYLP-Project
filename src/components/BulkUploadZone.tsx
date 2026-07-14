import React, { useState } from "react";
import { 
  UploadCloud, 
  FileText, 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  Play, 
  AlertCircle, 
  Layers,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface StagedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  progress: number;
  status: "uploading" | "completed" | "failed";
}

interface BulkUploadZoneProps {
  onFilesProcessed?: (count: number) => void;
  showToast?: (message: string) => void;
}

const plural = (count: number, singular: string, pluralForm?: string): string => {
  const word = count === 1 ? singular : (pluralForm ?? `${singular}s`);
  return `${count} ${word}`;
};

export default function BulkUploadZone({ onFilesProcessed, showToast }: BulkUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isForceFetching, setIsForceFetching] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<StagedFile[]>([]);
  const [uploadProgressPercent, setUploadProgressPercent] = useState(0);
  const [uploadingMessage, setUploadingMessage] = useState("");

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
      handleIncomingFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleIncomingFiles(Array.from(e.target.files));
    }
  };

  const handleIncomingFiles = (filesList: File[]) => {
    const validExtensions = [".pdf", ".doc", ".docx", ".csv"];
    const filteredFiles = filesList.filter(file => {
      const name = file.name.toLowerCase();
      return validExtensions.some(ext => name.endsWith(ext));
    });

    if (filteredFiles.length === 0) {
      if (showToast) {
        showToast("No compatible files found. Please upload .pdf, .doc, .docx, or .csv documents.");
      } else {
        alert("No compatible files found. Please upload .pdf, .doc, .docx, or .csv documents.");
      }
      return;
    }

    // Initialize mock uploads
    const newStagedFiles: StagedFile[] = filteredFiles.map((file, idx) => ({
      id: `bulk-${Date.now()}-${idx}`,
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      type: file.name.split(".").pop()?.toUpperCase() || "PDF",
      progress: 0,
      status: "uploading" as const
    }));

    setUploadingFiles(newStagedFiles);
    simulateFileUploads(newStagedFiles);
  };

  const simulateFileUploads = (filesToUpload: StagedFile[]) => {
    let currentCompleted = 0;
    const total = filesToUpload.length;
    setUploadingMessage(`Uploading 0 of ${plural(total, "file")}...`);

    const interval = setInterval(() => {
      setUploadingFiles(prev => {
        let allCompleted = true;
        const updated = prev.map(f => {
          if (f.progress < 100) {
            allCompleted = false;
            const nextProgress = Math.min(100, f.progress + Math.floor(Math.random() * 25) + 15);
            return { 
              ...f, 
              progress: nextProgress, 
              status: nextProgress === 100 ? ("completed" as const) : ("uploading" as const) 
            };
          }
          return f;
        });

        const completedCount = updated.filter(f => f.status === "completed").length;
        setUploadingMessage(`Uploading ${completedCount} of ${plural(total, "file")}...`);
        setUploadProgressPercent(Math.round((completedCount / total) * 100));

        if (allCompleted) {
          clearInterval(interval);
          setTimeout(() => {
            if (showToast) {
              showToast(`Successfully uploaded & indexed ${plural(total, "resume")} into candidate pool!`);
            }
            if (onFilesProcessed) {
              onFilesProcessed(total);
            }
            setUploadingFiles([]);
            setUploadProgressPercent(0);
            setUploadingMessage("");
          }, 800);
        }

        return updated;
      });
    }, 300);
  };

  const triggerForceFetch = () => {
    setIsForceFetching(true);
    if (showToast) {
      showToast("Triggering Fetcher Bot: Syncing external ATS, email inboxes & Shared Folders...");
    }

    setTimeout(() => {
      setIsForceFetching(false);
      const randomFetchCount = Math.floor(Math.random() * 3) + 2; // 2 to 4 files
      if (showToast) {
        showToast(`Fetcher Bot Completed! Synced and downloaded ${plural(randomFetchCount, "new resume")}.`);
      }

      // Automatically stage the fetched resumes for processing
      const dummyFetched: StagedFile[] = Array.from({ length: randomFetchCount }).map((_, idx) => ({
        id: `fetched-${Date.now()}-${idx}`,
        name: `fetched_resume_candidate_0${idx + 1}.pdf`,
        size: "185 KB",
        type: "PDF",
        progress: 0,
        status: "uploading" as const
      }));

      setUploadingFiles(dummyFetched);
      simulateFileUploads(dummyFetched);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="agentix-bulk-upload-widget">
      {/* Title block */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="h-4.5 w-4.5 text-indigo-600" />
            Resume Ingestion Hub
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Ingest thousands of CV documents concurrently through automated folder listeners or manual batches.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-400 font-mono">STATION-UPLINK ACTIVE</span>
        </div>
      </div>

      {/* Main split-view container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
        
        {/* Left Side: Manual Bulk Upload Area */}
        <div className="p-6 space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Manual Bulk Upload</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Stage massive batches of candidate resumes directly. Documents are parsed instantly and streamed to the screening queues.
            </p>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById("bulk-file-uploader-input")?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
              isDragging 
                ? "border-indigo-500 bg-indigo-50/20" 
                : "border-slate-200 hover:border-slate-300 bg-slate-50/30 hover:bg-slate-50/70"
            }`}
          >
            <input
              id="bulk-file-uploader-input"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-3 border border-indigo-100">
              <UploadCloud className="h-5.5 w-5.5" />
            </div>

            <p className="text-xs font-bold text-slate-800">Drag &amp; drop resume batches here, or browse files</p>
            <p className="text-[10px] text-slate-400 mt-1 max-w-xs">Supports concurrent uploads for PDF, DOC, DOCX, and CSV formats up to 15MB each.</p>

            {/* File Type Badges explicitly stated with Lucide Icons */}
            <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
              <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600 border border-slate-200/60">
                <FileText className="h-2.5 w-2.5 text-red-500" />
                PDF
              </span>
              <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600 border border-slate-200/60">
                <FileText className="h-2.5 w-2.5 text-blue-500" />
                DOCX
              </span>
              <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600 border border-slate-200/60">
                <FileText className="h-2.5 w-2.5 text-cyan-600" />
                DOC
              </span>
              <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600 border border-slate-200/60">
                <Database className="h-2.5 w-2.5 text-emerald-600" />
                CSV
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Auto-Fetch Mode Card */}
        <div className="p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Automated Fetching Mode</h4>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                Live Listeners Enabled
              </span>
            </div>
            
            <p className="text-[11px] text-slate-500 leading-relaxed">
              The autonomous <strong>Fetcher Bot</strong> runs continuous polls in the background, listening to synchronized applicant tracking pipelines (ATS), corporate recruiter inbox folders, and secure cloud storage buckets.
            </p>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">ATS Webhook Status:</span>
                <span className="font-bold text-emerald-600">CONNECTED</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Synced Recruiter Folders:</span>
                <span className="font-bold text-slate-800">4 Directories</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Continuous Poll Cycle:</span>
                <span className="font-mono text-slate-500">Every 60 seconds</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={triggerForceFetch}
              disabled={isForceFetching || uploadingFiles.length > 0}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold tracking-wide transition shadow flex items-center justify-center gap-2 cursor-pointer ${
                isForceFetching || uploadingFiles.length > 0
                  ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              {isForceFetching ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Polling external repositories...</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Force Fetch Resumes Now</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Upload Progress Bar (Simulated Uploading X of Y files...) */}
      <AnimatePresence>
        {uploadingFiles.length > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 bg-slate-50/60 p-5 space-y-3"
          >
            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2 text-indigo-600">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>{uploadingMessage}</span>
              </div>
              <span className="font-mono font-bold text-slate-700">{uploadProgressPercent}%</span>
            </div>

            {/* Simulated Progress bar container */}
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-300/40">
              <motion.div 
                className="h-full bg-indigo-600 rounded-full" 
                animate={{ width: `${uploadProgressPercent}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            {/* List of files being processed concurrently */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {uploadingFiles.slice(0, 6).map((file) => (
                <div key={file.id} className="flex items-center justify-between p-2 rounded-lg border border-slate-200/50 bg-white text-[10px]">
                  <div className="flex items-center gap-2 truncate max-w-[80%]">
                    <FileText className="h-3 w-3 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-700 truncate">{file.name}</span>
                  </div>
                  {file.status === "completed" ? (
                    <span className="text-emerald-600 font-bold">100%</span>
                  ) : (
                    <span className="text-slate-400 font-mono">{file.progress}%</span>
                  )}
                </div>
              ))}
              {uploadingFiles.length > 6 && (
                <div className="p-2 rounded-lg border border-dashed border-slate-200/80 bg-slate-100/30 text-[10px] text-slate-400 flex items-center justify-center font-medium">
                  + {uploadingFiles.length - 6} more {uploadingFiles.length - 6 === 1 ? "document" : "documents"} processing
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
