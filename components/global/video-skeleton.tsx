'use client'

import { useState } from 'react'
import { motion } from 'motion/react'

interface VideoSkeletonProps {
  src: string
  poster?: string
  className?: string
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
}

export function VideoSkeleton({
  src,
  poster,
  className = '',
  autoPlay = true,
  loop = true,
  muted = true,
}: VideoSkeletonProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(autoPlay)

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Skeleton placeholder */}
      {isLoading && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-card via-card/50 to-card"
          animate={{
            backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            backgroundSize: '200% 100%',
          }}
        >
          {/* Blueprint texture overlay */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  rgba(212, 175, 110, 0.1) 2px,
                  rgba(212, 175, 110, 0.1) 4px
                ),
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 2px,
                  rgba(212, 175, 110, 0.1) 2px,
                  rgba(212, 175, 110, 0.1) 4px
                )
              `,
            }}
          />

          {/* Loading indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-3 h-3 rounded-full bg-gold"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />
          </div>
        </motion.div>
      )}

      {/* Video */}
      <motion.video
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        playsInline
        onCanPlay={() => setIsLoading(false)}
        className="w-full h-full object-cover"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.6 }}
      />
    </div>
  )
}
