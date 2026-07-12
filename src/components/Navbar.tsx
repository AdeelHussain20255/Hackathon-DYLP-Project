import React, { useState } from "react";
import { Terminal, User, ChevronDown, LogOut, Settings, Bell, Briefcase, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Custom Next.js-compatible Link wrapper component for standard SPA navigation routing and local preview execution
const Link = ({ href, onClick, children, className, id, title }: { 
  href: string; 
  onClick?: (e: React.MouseEvent) => void; 
  children: React.ReactNode; 
  className?: string;
  id?: string;
  title?: string;
}) => {
  return (
    <a 
      href={href} 
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick(e);
        }
      }}
      className={className}
      id={id}
      title={title}
    >
      {children}
    </a>
  );
};

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: {
    name: string;
    email: string;
    role: string;
    avatarUrl: string;
  } | null;
  onSignIn: () => void;
  onSignOut: () => void;
}

export default function Navbar({
  currentTab,
  setCurrentTab,
  user,
  onSignIn,
  onSignOut,
}: NavbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "agents", label: "AI Agents" },
    { id: "candidates", label: "Candidates" },
    { id: "analytics", label: "Analytics" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white">
      <div className="flex h-16 w-full items-center justify-between px-6">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-8">
          <Link 
            href="/"
            onClick={() => setCurrentTab("landing")} 
            className="flex items-center gap-2.5 transition hover:opacity-80 focus:outline-none"
            id="navbar-brand-logo"
            title="Go to SaaS Product Landing Page"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900">
              <Terminal className="h-4 w-4 text-white" strokeWidth={2} />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="font-sans text-[15px] font-bold tracking-tight text-slate-900">
                Agentix <span className="text-slate-400 font-medium">AI</span>
              </span>
              <span className="font-mono text-[9px] tracking-wider text-slate-400 uppercase font-semibold">
                HR Core
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors focus:outline-none ${
                    isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-800"
                  }`}
                  id={`nav-item-${item.id}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 rounded-lg bg-slate-100 -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Actions & Clerk Placeholder */}
        <div className="flex items-center gap-4">
          
          {/* Notifications Placeholder */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 focus:outline-none"
                id="navbar-notification-btn"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-indigo-600" />
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsNotificationsOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-lg ring-1 ring-black/5 z-50"
                    >
                      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 mb-1">
                        Notifications
                      </div>
                      <div className="space-y-1">
                        <div className="rounded-lg p-2.5 hover:bg-slate-50 text-left transition text-xs">
                          <p className="font-semibold text-slate-800">Agent Onboarding Complete</p>
                          <p className="text-slate-500 mt-0.5">ScreenerX auto-reviewed 14 new candidates today.</p>
                          <span className="text-[10px] text-indigo-600 font-medium mt-1 inline-block">10m ago</span>
                        </div>
                        <div className="rounded-lg p-2.5 hover:bg-slate-50 text-left transition text-xs">
                          <p className="font-semibold text-slate-800">Interview Scheduled</p>
                          <p className="text-slate-500 mt-0.5">SchedulerPro locked in candidate Alex Rivera for Tuesday.</p>
                          <span className="text-[10px] text-indigo-600 font-medium mt-1 inline-block">1h ago</span>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Quick Stats Trigger (Mock feature) */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>AI Savings: <strong>14.5 hrs</strong> this week</span>
          </div>

          {/* Clerk Auth Integration Widget */}
          <div className="relative">
            {user ? (
              // Clerk Logged In State
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 pr-3 hover:bg-slate-50 transition-all text-left focus:outline-none"
                  id="clerk-user-profile-btn"
                >
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-7 w-7 rounded-full object-cover ring-1 ring-slate-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="hidden sm:flex flex-col">
                    <span className="text-xs font-semibold text-slate-800 leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-slate-500 leading-tight font-medium">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsProfileOpen(false)} 
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg ring-1 ring-black/5 z-50 focus:outline-none"
                      >
                        <div className="px-3 py-2 border-b border-slate-100 mb-1">
                          <p className="text-xs font-medium text-slate-400">Signed in as</p>
                          <p className="text-sm font-semibold text-slate-800 truncate">{user.email}</p>
                        </div>
                        
                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            alert("Clerk Settings: Profile editing is fully simulated in this development environment!");
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                          id="clerk-profile-settings"
                        >
                          <User className="h-4 w-4 text-slate-400" />
                          Manage Profile
                        </button>
                        
                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            alert("Organization Hub: You can configure custom roles and permission maps.");
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                          id="clerk-org-settings"
                        >
                          <Briefcase className="h-4 w-4 text-slate-400" />
                          Switch Workspace
                        </button>

                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            alert("Enterprise Settings: SAML/SSO & API keys configuration.");
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                          id="clerk-app-settings"
                        >
                          <Settings className="h-4 w-4 text-slate-400" />
                          Platform Settings
                        </button>

                        <div className="border-t border-slate-100 my-1"></div>

                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            onSignOut();
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
                          id="clerk-signout-btn"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // Clerk Signed Out State
              <button
                onClick={onSignIn}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
                id="clerk-signin-placeholder-btn"
              >
                <User className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
