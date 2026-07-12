import React from "react";
import { Award, CheckCircle2, AlertCircle, ArrowUpRight, HelpCircle, Flame } from "lucide-react";
import { motion } from "motion/react";

export interface LeaderboardCandidate {
  rank: number;
  name: string;
  avatarInitials: string;
  email: string;
  score: number;
  skills: string[];
  status: "Invite Sent" | "Pending" | "Rejected";
}

interface LeaderboardProps {
  candidates?: LeaderboardCandidate[];
  onTriggerAction?: (name: string, action: string) => void;
}

export default function Leaderboard({ candidates, onTriggerAction }: LeaderboardProps) {
  // Default dummy data if none provided via props
  const defaultCandidates: LeaderboardCandidate[] = [
    {
      rank: 1,
      name: "Clara Fontaine",
      avatarInitials: "CF",
      email: "clara.fontaine@creativeops.co",
      score: 94,
      skills: ["React 19", "TypeScript", "Tailwind CSS", "API Orchestration"],
      status: "Invite Sent",
    },
    {
      rank: 2,
      name: "Liam Novak",
      avatarInitials: "LN",
      email: "liam.novak@pixelpulse.dev",
      score: 88,
      skills: ["Tailwind CSS", "Next.js", "State Managers", "Framer Motion"],
      status: "Invite Sent",
    },
    {
      rank: 3,
      name: "Rajesh Kumar",
      avatarInitials: "RK",
      email: "rajesh.kumar@cloudops.net",
      score: 76,
      skills: ["AWS", "Node.js", "Docker", "Microservices"],
      status: "Pending",
    },
    {
      rank: 4,
      name: "Marcus Vance",
      avatarInitials: "MV",
      email: "marcus.vance@cloudsolutions.net",
      score: 64,
      skills: ["Python", "Kubernetes", "Linux Shell"],
      status: "Rejected",
    },
  ];

  const displayCandidates = candidates || defaultCandidates;

  // Helper to color code the Match Score
  const getScoreBadgeClass = (score: number) => {
    if (score >= 85) {
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    } else if (score >= 70) {
      return "bg-amber-50 text-amber-700 border-amber-100";
    } else {
      return "bg-rose-50 text-rose-700 border-rose-100";
    }
  };

  const getScoreDotClass = (score: number) => {
    if (score >= 85) return "bg-emerald-500";
    if (score >= 70) return "bg-amber-500";
    return "bg-rose-500";
  };

  // Helper for Agent Action Status badges
  const getStatusBadge = (status: "Invite Sent" | "Pending" | "Rejected") => {
    switch (status) {
      case "Invite Sent":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Invite Sent
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Pending
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 border border-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="agentix-leaderboard-widget">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">AI Match Suitability Leaderboard</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Real-time candidate indexing ranked dynamically by autonomous ScreenerX models.</p>
        </div>
        
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          <span>High-Match (&gt;85%) Autoinvite enabled</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-left">
          <thead className="bg-slate-50/30 font-sans text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 text-center w-16">Rank</th>
              <th className="px-6 py-4">Candidate Name</th>
              <th className="px-6 py-4 text-center w-36">Match Score</th>
              <th className="px-6 py-4">Top Skills</th>
              <th className="px-6 py-4 w-44">Agent Action Status</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-100 bg-white text-xs">
            {displayCandidates.map((cand, idx) => {
              const isFirst = cand.rank === 1;
              return (
                <motion.tr
                  key={cand.name}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-slate-50/50 transition duration-150 group"
                >
                  {/* Rank Column */}
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center">
                      {isFirst ? (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-xs shadow-sm">
                          <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        </div>
                      ) : (
                        <span className="font-mono font-bold text-slate-500">#{cand.rank}</span>
                      )}
                    </div>
                  </td>

                  {/* Candidate details */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-[11px] border shadow-sm ${
                        isFirst 
                          ? "bg-slate-900 border-slate-950 text-white" 
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}>
                        {cand.avatarInitials}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition flex items-center gap-1.5">
                          <span>{cand.name}</span>
                          {isFirst && (
                            <span className="inline-flex rounded bg-indigo-50 px-1 py-0.5 text-[9px] font-bold text-indigo-700">
                              Top Match
                            </span>
                          )}
                        </div>
                        <div className="text-slate-400 text-[11px] mt-0.5">{cand.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Match score */}
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center">
                      <div className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-mono font-bold ${getScoreBadgeClass(cand.score)}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${getScoreDotClass(cand.score)}`} />
                        <span>{cand.score}%</span>
                      </div>
                    </div>
                  </td>

                  {/* Top Skills tags */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5 max-w-sm sm:max-w-md">
                      {cand.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center rounded-md bg-slate-50 border border-slate-200/60 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Agent Action Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-between">
                      {getStatusBadge(cand.status)}
                      
                      <button
                        onClick={() => onTriggerAction?.(cand.name, cand.status)}
                        className="opacity-0 group-hover:opacity-100 transition duration-150 p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded focus:outline-none"
                        title="View Score Details"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer statistics indicator */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500" />
          <span>Automatic interview requests dispatched within 12 seconds of &gt;85% score thresholds.</span>
        </div>
        
        <button 
          onClick={() => alert("Leaderboard metrics are dynamically computed by matching resume embeddings against vectorized Job Descriptions.")}
          className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer self-start sm:self-center"
        >
          <HelpCircle className="h-3 w-3" />
          <span>How matches are computed</span>
        </button>
      </div>
    </div>
  );
}
