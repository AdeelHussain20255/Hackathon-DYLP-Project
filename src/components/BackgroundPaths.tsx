'use client';

import { motion } from 'framer-motion';

interface FloatingPathsProps {
  position: number;
}

function FloatingPaths({ position }: FloatingPathsProps) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    color: `rgba(15,23,42,${0.1 + i * 0.03})`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className='absolute inset-0 pointer-events-none'>
      <svg
        className='w-full h-full text-neutral-200 dark:text-neutral-800'
        viewBox='0 0 696 316'
        fill='none'
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke='currentColor'
            strokeWidth={path.width}
            strokeOpacity={0.08 + path.id * 0.015}
            initial={{ pathLength: 0.3, opacity: 0.4 }}
            animate={{
              pathLength: 1,
              opacity: [0.2, 0.4, 0.2],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export function BackgroundPathsWrapper() {
  return (
    <div
      className='absolute inset-0 z-0 overflow-hidden pointer-events-none'
      style={{
        WebkitMaskImage: 'linear-gradient(to bottom, black 65%, transparent 100%)',
        maskImage: 'linear-gradient(to bottom, black 65%, transparent 100%)',
      }}
    >
      <FloatingPaths position={1} />
      <FloatingPaths position={-1} />
    </div>
  );
}
