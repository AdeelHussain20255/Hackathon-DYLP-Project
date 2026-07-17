import React, { useState } from "react";
import { motion } from "motion/react";
import { X, Mail, Lock, User, Briefcase, LogIn, UserPlus } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { api } from "../api";

interface AuthModalProps {
  onClose: () => void;
  onAuth: (user: { name: string; email: string; role: string; avatarUrl: string }) => void;
}

export default function AuthModal({ onClose, onAuth }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("HR Recruiter");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = mode === "login"
        ? await api.auth.login({ email, password })
        : await api.auth.register({ email, password, name, role });
      api.auth.setToken(result.token);
      onAuth({
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        avatarUrl: result.user.avatar_url || "",
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200"
      >
        <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition">
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

        <div className="mb-4">
          <GoogleLogin
            onSuccess={async (response) => {
              if (!response.credential) return;
              setError("");
              setLoading(true);
              try {
                const result = await api.auth.google(response.credential);
                api.auth.setToken(result.token);
                onAuth({
                  name: result.user.name,
                  email: result.user.email,
                  role: result.user.role,
                  avatarUrl: result.user.avatar_url || "",
                });
                onClose();
              } catch (err: any) {
                setError(err.message || "Google sign-in failed");
              } finally {
                setLoading(false);
              }
            }}
            onError={() => setError("Google Sign-In failed")}
            theme="outline"
            size="large"
            text="signin_with"
            shape="rectangular"
            width="100%"
          />
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
