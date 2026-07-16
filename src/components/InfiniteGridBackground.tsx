import React, { useState, useRef } from "react";
import {
  motion,
  useMotionValue,
  useAnimationFrame,
  useMotionTemplate,
} from "framer-motion";

function GridPattern() {
  return (
    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern
          id="infinite-grid-pattern"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#infinite-grid-pattern)" />
    </svg>
  );
}

interface InfiniteGridWrapperProps {
  children: React.ReactNode;
}

export function InfiniteGridWrapper({ children }: InfiniteGridWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const gridOffsetX = useMotionValue(0);
  const gridOffsetY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
    mouseX.set(x);
    mouseY.set(y);
  };

  useAnimationFrame(() => {
    gridOffsetX.set((gridOffsetX.get() + 0.5) % 40);
    gridOffsetY.set((gridOffsetY.get() + 0.5) % 40);
  });

  const spotlightMask = useMotionTemplate`
    radial-gradient(
      300px 300px at ${mouseX}px ${mouseY}px,
      rgba(0,0,0,1) 0%,
      rgba(0,0,0,0.3) 50%,
      transparent 100%
    )
  `;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full overflow-hidden bg-white"
    >
      {/* Grid layers with top fade-in */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 15%)",
          maskImage: "linear-gradient(to bottom, transparent 0%, black 15%)",
        }}
      >
        {/* Static faint grid */}
        <div className="absolute inset-0 opacity-[0.03] text-neutral-900">
          <GridPattern />
        </div>

        {/* Interactive spotlight grid */}
        <motion.div
          className="absolute inset-0 opacity-40 text-neutral-900"
          style={{
            maskImage: spotlightMask,
            WebkitMaskImage: spotlightMask,
          }}
        >
          <GridPattern />
        </motion.div>
      </div>

      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-orange-500/20 blur-[120px]"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
          }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-blue-500/20 blur-[120px]"
          style={{
            transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px)`,
          }}
        />
      </div>

      {/* Children */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
