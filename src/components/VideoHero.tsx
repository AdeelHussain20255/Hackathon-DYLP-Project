import React from "react";

export default function VideoHero() {
  return (
    <>
      <div
        className="fixed inset-0 -z-20 pointer-events-none will-change-transform transform-gpu"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          backgroundSize: "400% 400%",
          animation: "gradientShift 15s ease infinite",
        }}
        id="hero-bg-gradient"
      />

      <div className="fixed inset-0 bg-white/40 backdrop-blur-md -z-10 pointer-events-none will-change-transform transform-gpu" id="hero-bg-overlay" />

      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </>
  );
}
