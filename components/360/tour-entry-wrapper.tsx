'use client'

import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { TourModeSelection } from '@/components/360/tour-mode-selection'
import { TourViewerClient } from '@/components/360/tour-viewer-client'
import type { Project } from '@/lib/projects'

type TourMode = 'guided' | 'free'

interface Props {
  project: Project
  initialRoomId?: string
}

export function TourEntryWrapper({ project, initialRoomId }: Props) {
  const [mode, setMode] = useState<TourMode | null>(null)

  return (
    <>
      <AnimatePresence>
        {!mode && (
          <TourModeSelection project={project} onSelect={(m) => setMode(m)} />
        )}
      </AnimatePresence>

      {/* Viewer is mounted immediately but hidden behind the selection screen */}
      {mode && (
        <TourViewerClient
          project={project}
          initialRoomId={initialRoomId}
          initialMode={mode}
        />
      )}
    </>
  )
}
