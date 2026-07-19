import React, { useState } from "react";
import { 
  UploadCloud, 
  FileText, 
  Database, 
  RefreshCw, 
  Layers
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
  onFilesSelected?: (files: { id: string; name: string; size: string; file: File }[]) => void;
  showToast?: (message: string) => void;
}

const plural = (count: number, singular: string, pluralForm?: string): string => {
  const word = count === 1 ? singular : (pluralForm ?? `${singular}s`);
  return `${count} ${word}`;
};

export default function BulkUploadZone({ onFilesProcessed, onFilesSelected, showToast }: BulkUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
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

    const newStagedFiles: StagedFile[] = filteredFiles.map((file, idx) => ({
      id: `bulk-${Date.now()}-${idx}`,
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      type: file.name.split(".").pop()?.toUpperCase() || "PDF",
      progress: 0,
      status: "uploading" as const
    }));

    if (onFilesSelected) {
      onFilesSelected(newStagedFiles.map((s, i) => ({
        id: s.id,
        name: s.name,
        size: s.size,
        file: filteredFiles[i],
      })));
    }

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

      {/* Full-width Manual Bulk Upload Area */}
      <div className="p-6">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Upload Candidate CVs</h4>

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

          <p className="text-xs font-bold text-slate-800">Drag &amp; drop resume files here, or browse</p>
          <p className="text-[10px] text-slate-400 mt-1 max-w-xs">Supports PDF, DOC, DOCX, and CSV formats up to 15MB each.</p>

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
              <Database className="h-2.5 w-2.5 text-emerald-600" />
              CSV
            </span>
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
