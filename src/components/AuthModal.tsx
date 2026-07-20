import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { X, Mail, Lock, User, Briefcase, LogIn, UserPlus } from "lucide-react";
import { insforge } from "../lib/insforge";
import { setAccessToken } from "../api";
import { useAuthStore } from "../store/useAuthStore";

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("HR Recruiter");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationMode, setVerificationMode] = useState(false);
  const [verificationOtp, setVerificationOtp] = useState("");

  const setUser = useAuthStore((s) => s.setUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        const { data, error } = await insforge.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw new Error(error.message);
        if (!data?.accessToken) throw new Error("No access token received");
        setAccessToken(data.accessToken);
        const u = data.user;
        const profile = (u as any).profile || {};
        setUser({
          id: u.id,
          email: u.email ?? "",
          name: profile.name || u.email?.split("@")[0] || "User",
          role: profile.role || "HR Recruiter",
          avatarUrl: profile.avatar_url || "",
        }, data.accessToken);
        onClose();
      } else {
        const { data, error } = await insforge.auth.signUp({
          email,
          password,
          name,
          redirectTo: window.location.origin,
        });
        if (error) throw new Error(error.message);
        if (data?.requireEmailVerification) {
          setVerificationMode(true);
        } else if (data?.accessToken) {
          setAccessToken(data.accessToken);
          const u = data.user;
          const profile = (u as any).profile || {};
          setUser({
            id: u.id,
            email: u.email ?? "",
            name: profile.name || u.email?.split("@")[0] || "User",
            role: profile.role || "HR Recruiter",
            avatarUrl: profile.avatar_url || "",
          }, data.accessToken);
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data, error } = await insforge.auth.verifyEmail({
        email,
        otp: verificationOtp,
      });
      if (error) throw new Error(error.message);
      if (data?.accessToken) {
        setAccessToken(data.accessToken);
        const u = data.user;
        const profile = (u as any).profile || {};
        setUser({
          id: u.id,
          email: u.email ?? "",
          name: profile.name || u.email?.split("@")[0] || "User",
          role: profile.role || "HR Recruiter",
          avatarUrl: profile.avatar_url || "",
        }, data.accessToken);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await insforge.auth.signInWithOAuth("google", {
        redirectTo: window.location.origin,
      });
    } catch (err: any) {
      setError(err.message || "Google sign-in failed");
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("insforge_code") || params.has("insforge_status")) {
      useAuthStore.getState().hydrate().then(() => {
        const u = useAuthStore.getState().user;
        if (u) onClose();
      });
    }
  }, []);

  if (verificationMode) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-xl border border-slate-200 my-4"
        >
          <button onClick={onClose} className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition">
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Verify Your Email</h3>
              <p className="text-xs text-slate-400">Enter the 6-digit code sent to {email}</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-rose-50 border border-rose-100 p-3 text-xs font-medium text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleVerifyEmail} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Verification Code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={verificationOtp}
                onChange={(e) => setVerificationOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs text-center tracking-[0.5em] font-mono focus:border-slate-400 focus:outline-none transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading || verificationOtp.length !== 6}
              className="w-full rounded-lg bg-slate-900 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-slate-500">
            <button
              onClick={async () => {
                try {
                  await insforge.auth.resendVerificationEmail({ email, redirectTo: window.location.origin });
                  setError("");
                } catch (err: any) {
                  setError(err.message || "Failed to resend");
                }
              }}
              className="font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Resend verification code
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-xl border border-slate-200 my-4"
      >
        <button onClick={onClose} className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition">
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
            {mode === "login" ? <LogIn className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {mode === "login" ? "Sign In" : "Create Account"}
            </h3>
            <p className="text-xs text-slate-400">
              {mode === "login" ? "Welcome back to Agentix HR" : "Start your HR journey"}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-100 p-3 text-xs font-medium text-rose-700">
            {error}
          </div>
        )}

        <div className="mb-4 w-full overflow-hidden">
          <div className="flex justify-center w-full" style={{ minHeight: "40px" }}>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </div>
        </div>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-slate-400">or continue with email</span></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Adeel Hussain"
                    className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2.5 text-xs focus:border-slate-400 focus:outline-none transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Role</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2.5 text-xs focus:border-slate-400 focus:outline-none transition bg-white"
                  >
                    <option>HR Recruiter</option>
                    <option>HR Director</option>
                    <option>Talent Manager</option>
                    <option>Hiring Manager</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2.5 text-xs focus:border-slate-400 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2.5 text-xs focus:border-slate-400 focus:outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition disabled:opacity-50"
          >
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-slate-500">
          {mode === "login" ? (
            <>Don't have an account?{" "}<button onClick={() => { setMode("register"); setError(""); }} className="font-semibold text-indigo-600 hover:text-indigo-800">Sign up</button></>
          ) : (
            <>Already have an account?{" "}<button onClick={() => { setMode("login"); setError(""); }} className="font-semibold text-indigo-600 hover:text-indigo-800">Sign in</button></>
          )}
        </div>
      </motion.div>
    </div>
  );
}
