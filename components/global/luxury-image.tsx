'use client'

import { useState, useCallback } from 'react'
import Image, { type ImageProps } from 'next/image'

interface LuxuryImageProps extends Omit<ImageProps, 'onLoad'> {
  /** Show the shimmer skeleton while loading. Defaults to true. */
  skeleton?: boolean
}

/**
 * Drop-in replacement for next/image with a premium skeleton placeholder.
 *
 * Loading sequence:
 *  1. Dark luxury surface with a subtle gold shimmer sweeping across.
 *  2. When the image loads: blur fades out, image fades + scales in.
 *
 * No layout shift — the container maintains its dimensions via the parent.
 */
export function LuxuryImage({ skeleton = true, className = '', ...props }: LuxuryImageProps) {
  const [loaded, setLoaded] = useState(false)

  const handleLoad = useCallback(() => {
    setLoaded(true)
  }, [])

  return (
    <span className="relative block w-full h-full overflow-hidden">
      {/* Skeleton shimmer — visible until image loads */}
      {skeleton && !loaded && (
        <span
          aria-hidden
          className="absolute inset-0 z-10 overflow-hidden"
          style={{
            background: 'oklch(0.16 0.006 60)',
          }}
        >
          {/* Blueprint grid texture */}
          <span
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(201,168,106,1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(201,168,106,1) 1px, transparent 1px)
              `,
              backgroundSize: '28px 28px',
            }}
          />
          {/* Gold shimmer sweep — CSS animation for true infinite without JS */}
          <span
            className="absolute inset-y-0 w-1/2 -skew-x-12"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(201,168,106,0.08), transparent)',
              animation: 'luxury-shimmer 1.8s ease-in-out infinite',
              left: '-50%',
            }}
          />
        </span>
      )}

      {/* Actual image — fades in on load */}
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image
        {...props}
        className={`
          ${className}
          transition-all duration-700 ease-out
          ${loaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-[1.02] blur-sm'}
        `}
        onLoad={handleLoad}
      />
    </span>
  )
}
