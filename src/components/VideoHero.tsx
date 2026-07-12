import React from "react";

export default function VideoHero() {
  return (
    <>
      {/* HTML5 Video Background — GPU-composited to prevent scroll jank */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover -z-20 pointer-events-none will-change-transform transform-gpu"
        src="/Glowing_digital_grid_data_particles_202607110301.mp4"
        id="hero-bg-video"
      />

      {/* Glassmorphism overlay — isolated on its own layer to avoid backdrop-blur repaints during scroll */}
      <div className="fixed inset-0 bg-white/40 backdrop-blur-md -z-10 pointer-events-none will-change-transform transform-gpu" id="hero-bg-overlay" />
    </>
  );
}
