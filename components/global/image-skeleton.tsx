'use client'

import { LuxuryImage } from './luxury-image'
import type { ImageProps } from 'next/image'

interface ImageSkeletonProps extends Omit<ImageProps, 'onLoad'> {
  className?: string
}

/**
 * Re-exports LuxuryImage under the ImageSkeleton name for backwards-compatibility.
 * Existing consumers can import either component — both render the same blur-up skeleton.
 */
export function ImageSkeleton(props: ImageSkeletonProps) {
  return <LuxuryImage {...props} />
}
