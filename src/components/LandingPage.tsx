import React from "react";
import { motion } from "motion/react";
import { 
  ArrowRight, 
  Cpu, 
  CheckCircle2, 
  Zap, 
  Terminal,
  Layers,
  DownloadCloud,
  FileText,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import VideoHero from "./VideoHero";

interface LandingPageProps {
  onLaunchDashboard: () => void;
}

export default function LandingPage({ onLaunchDashboard }: LandingPageProps) {
  // Bento Box animation variants
  const bentoCardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 80,
        damping: 15
      }
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-800 overflow-x-hidden relative font-sans">
      
      {/* HTML5 Video Background and Glassmorphism Overlay */}
      <VideoHero />

      {/* Grid Overlay for extra design depth */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f015_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f015_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_60%,transparent_100%)] pointer-events-none -z-10" />

      <div className="relative z-10">

        {/* Hero Section */}
        <main className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 pt-16 pb-16 md:pt-24 md:pb-24 text-center space-y-6 md:space-y-8">
          
          {/* Subtle Tagline - Colored Sky to complement the video's glowing circuit particles */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-50/80 border border-sky-100/80 px-3.5 py-1.5 text-xs font-semibold text-sky-700 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-sky-500 animate-pulse" />
            <span>Autonomous Candidate Orchestration</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6.5xl font-black tracking-tight leading-[1.12] text-slate-900">
            Hire Smarter, Not Harder <br />
            with <span className="text-sky-600 bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">Autonomous AI</span>.
          </h1>

          {/* Clean Description */}
          <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Orchestrate secure, high-precision candidate processing workflows. Coordinate document ingestion, multi-stage assessment metrics, and outbound scheduler agents seamlessly within a single ecosystem.
          </p>

          {/* CTA Buttons - Using sky colorway to perfectly complement the glowing circuit streams */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onLaunchDashboard}
              className="rounded-xl bg-sky-600 hover:bg-sky-500 px-8 py-4 text-sm font-bold text-white shadow-md shadow-sky-100 active:scale-95 transition cursor-pointer text-center flex items-center justify-center gap-2"
              id="hero-launch-dashboard-btn"
            >
              <span>Launch System Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => alert("Enterprise sandbox configured. No external credentials required to evaluate core functions.")}
              className="rounded-xl bg-white/80 border border-slate-200 hover:bg-white px-8 py-4 text-sm font-bold text-slate-700 transition flex items-center justify-center gap-2 cursor-pointer shadow-sm backdrop-blur-sm hover:border-slate-300"
              id="hero-explore-architecture-btn"
            >
              <span>Explore Architecture</span>
            </button>
          </div>

        </main>

        {/* Bento Box Features Section */}
        <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 py-12 md:py-20 mb-8 md:mb-12">
          
          {/* Section Heading */}
          <div className="max-w-3xl mb-8 md:mb-12 space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50/80 border border-sky-100 px-3 py-1 text-xs font-semibold text-sky-700 backdrop-blur-sm">
              <Layers className="h-3.5 w-3.5 text-sky-500" />
              Platform Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
              The Agentix Orchestration Engine
            </h2>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              Four unified recruitment agent controllers operating on secure processing loops. Streamline parsing, customize experience thresholds, and trigger candidate communications automatically.
            </p>
          </div>

          {/* Bento Box Grid with glassmorphic cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="bento-box-orchestration-engine">
            
            {/* Card 1: Omnichannel Fetcher (Col Span 2) */}
            <motion.div
              variants={bentoCardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              whileHover={{ y: -5 }}
              className="md:col-span-2 group relative rounded-2xl bg-white/70 border border-slate-200/80 p-6 md:p-8 flex flex-col justify-between overflow-hidden shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-md hover:bg-white"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-sky-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 0.3 }}
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 border border-sky-100 text-sky-600 cursor-pointer"
                    >
                      <DownloadCloud className="h-6 w-6" />
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Omnichannel Fetcher</h3>
                      <p className="text-[10px] font-mono text-sky-600 font-semibold tracking-wider uppercase">FetcherBot Node</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded">
                    CHANNEL SYNC
                  </span>
                </div>

                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-xl">
                  Monitors data feeds and file uploads continuously. Syncs incoming candidate resumes from Local Directory Sync, Bulk File Uploads, and API endpoints straight into candidate screening buffers.
                </p>
              </div>

              {/* Interactive representation of sources */}
              <div className="mt-6 pt-6 border-t border-slate-150 grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10 text-xs">
                <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-2.5 text-center">
                  <div className="font-mono font-bold text-slate-800">LOCAL DIRECTORY SYNC</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Connected</div>
                </div>
                <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-2.5 text-center">
                  <div className="font-mono font-bold text-slate-800">BULK FILE UPLOAD</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Index Active</div>
                </div>
                <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-2.5 text-center">
                  <div className="font-mono font-bold text-slate-800">API ENDPOINTS</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Polling Active</div>
                </div>
              </div>
            </motion.div>

            {/* Card 2: JSON Parser (Col Span 1) */}
            <motion.div
              variants={bentoCardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              whileHover={{ y: -5 }}
              className="md:col-span-1 group relative rounded-2xl bg-white/70 border border-slate-200/80 p-6 md:p-8 flex flex-col justify-between overflow-hidden shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-md hover:bg-white"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-sky-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 180 }}
                    transition={{ duration: 0.4 }}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 border border-sky-100 text-sky-600 cursor-pointer"
                  >
                    <Terminal className="h-6 w-6" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">JSON Parser</h3>
                    <p className="text-[10px] font-mono text-sky-600 font-semibold tracking-wider uppercase">ParserBot Node</p>
                  </div>
                </div>

                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  Text extraction controller converting raw documents into deeply structured JSON compliance records with lexical precision.
                </p>
              </div>

              {/* Mock Output Schema Visualizer */}
              <div className="mt-6 bg-slate-50/80 border border-slate-200 rounded-xl p-3 font-mono text-[9px] text-sky-700 relative z-10 overflow-hidden">
                <p className="text-slate-400">{"{"}</p>
                <p className="pl-3"><span className="text-slate-800">"skills"</span>: ["React", "Typescript"],</p>
                <p className="pl-3"><span className="text-slate-800">"parsedStatus"</span>: "Complete"</p>
                <p className="text-slate-400">{"}"}</p>
              </div>
            </motion.div>

            {/* Card 3: Scoring Engine (Col Span 1) */}
            <motion.div
              variants={bentoCardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              whileHover={{ y: -5 }}
              className="md:col-span-1 group relative rounded-2xl bg-white/70 border border-slate-200/80 p-6 md:p-8 flex flex-col justify-between overflow-hidden shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-md hover:bg-white"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-sky-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                  <motion.div 
                    whileHover={{ scale: 1.1, y: -3 }}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 border border-sky-100 text-sky-600 cursor-pointer"
                  >
                    <Cpu className="h-6 w-6" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Scoring Engine</h3>
                    <p className="text-[10px] font-mono text-sky-600 font-semibold tracking-wider uppercase">RankerBot Node</p>
                  </div>
                </div>

                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  Applies standard multidimensional evaluation metrics. Matches candidate profiles to JD requirements computing clean experience compliance scores.
                </p>
              </div>

              {/* Score Match bar indicator representation */}
              <div className="mt-6 bg-slate-50/80 border border-slate-200/60 rounded-xl p-4 relative z-10 space-y-3 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-500 uppercase">Match Score Target</span>
                  <span className="text-sky-600 font-mono">85% Minimum</span>
                </div>
                <div className="h-2 w-full bg-slate-200/60 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-600 rounded-full w-[88%]" />
                </div>
              </div>
            </motion.div>

            {/* Card 4: Auto-Scheduler (Col Span 2) */}
            <motion.div
              variants={bentoCardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              whileHover={{ y: -5 }}
              className="md:col-span-2 group relative rounded-2xl bg-white/70 border border-slate-200/80 p-6 md:p-8 flex flex-col justify-between overflow-hidden shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-md hover:bg-white"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-sky-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 border border-sky-100 text-sky-600 cursor-pointer"
                    >
                      <Zap className="h-6 w-6" />
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Auto-Scheduler</h3>
                      <p className="text-[10px] font-mono text-sky-600 font-semibold tracking-wider uppercase">SchedulerBot Node</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded">
                    SMTP GATEWAY
                  </span>
                </div>

                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-xl">
                  Automatically triggers personalized scheduling outreach loops when candidate threshold metrics are satisfied, aligning direct calendar availability.
                </p>
              </div>

              {/* Clean scheduler indicator */}
              <div className="mt-6 pt-4 border-t border-slate-150 flex flex-wrap items-center gap-3 relative z-10 text-xs text-slate-500">
                <span className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-lg font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Outbox Synced
                </span>
                <span>Coordinates schedule invites only after threshold satisfaction metrics clear.</span>
              </div>
            </motion.div>

          </div>

        </section>

        {/* Call to Action Section */}
        <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 py-10 md:py-16">
          <div className="max-w-5xl mx-auto overflow-hidden rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-md p-8 md:p-12 text-center shadow-sm relative">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-50/20 to-transparent pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-200 px-3.5 py-1 text-xs font-semibold text-sky-700">
                <Sparkles className="h-3.5 w-3.5 text-sky-500" />
                SaaS Operational Framework
              </span>
              <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                Ready to Automate Your Screening?
              </h3>
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                Launch the core pipeline dashboard in seconds. Test custom resume parsing speeds, configure score ranking matrices, and experience autonomous developer recruitment flow.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.button
                  onClick={onLaunchDashboard}
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="group relative overflow-hidden rounded-xl bg-sky-600 px-8 py-4 text-sm font-bold text-white shadow-md shadow-sky-100 hover:bg-sky-500 transition active:scale-95 cursor-pointer text-center flex items-center justify-center gap-2"
                  id="cta-start-screening-btn"
                >
                  <span>Access the Hub</span>
                  <ArrowRight className="h-4 w-4" />
                </motion.button>

                <button
                  onClick={() => alert("Enterprise sandbox operates locally. No credentials or external secrets needed.")}
                  className="rounded-xl bg-white border border-slate-200 hover:bg-slate-50 px-6 py-3.5 text-sm font-bold text-slate-700 transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  id="cta-explore-integrations-btn"
                >
                  <span>Explore Integrations</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Compact Footer */}
        <footer className="relative z-10 w-full bg-white/80 border-t border-slate-200 backdrop-blur-md font-sans mt-8 md:mt-12">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6 md:py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/80">
              
              <div className="flex items-center gap-3">
                <span className="text-sm font-black tracking-tight text-slate-900 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                  Agentix AI
                </span>
                <span className="text-[11px] text-slate-400 max-w-xs leading-relaxed hidden sm:block">
                  Deploying secure, high-precision autonomous agent networks for recruitment workflows.
                </span>
              </div>

              <div className="flex items-center gap-6">
                <a href="#" onClick={(e) => { e.preventDefault(); alert("Opening local technical documentation for recruitment loop triggers."); }} className="text-[11px] font-semibold text-slate-500 hover:text-sky-600 transition-colors flex items-center gap-1">
                  Documentation <ArrowUpRight className="h-3 w-3" />
                </a>
                <a href="#" onClick={(e) => { e.preventDefault(); onLaunchDashboard(); }} className="text-[11px] font-semibold text-slate-500 hover:text-sky-600 transition-colors">
                  Launch Dashboard
                </a>
                <a href="#" onClick={(e) => { e.preventDefault(); alert("Agentix Core Engineers & Autonomous Workflow loops."); }} className="text-[11px] font-semibold text-slate-500 hover:text-sky-600 transition-colors flex items-center gap-1">
                  Team <ArrowUpRight className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <span>&copy; 2026 Agentix AI Inc. All rights reserved.</span>
                <span className="h-3 w-[1px] bg-slate-200" />
                <span className="text-emerald-600 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Operational Secure
                </span>
              </div>

              <div className="flex items-center gap-4">
                <a href="#" onClick={(e) => { e.preventDefault(); alert("Agentix Terms of Use."); }} className="hover:text-slate-500 transition">Terms</a>
                <a href="#" onClick={(e) => { e.preventDefault(); alert("Agentix Privacy policy."); }} className="hover:text-slate-500 transition">Privacy</a>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
