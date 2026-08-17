'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { DBFaq, DBFaqCategory } from '@/lib/admin/types'

const EASE = [0.22, 1, 0.36, 1] as const

interface FaqCardProps {
  faq: DBFaq
  isOpen: boolean
  onToggle: () => void
  index: number
}

export function FaqCard({ faq, isOpen, onToggle, index }: FaqCardProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: EASE }}
      className={`
        group relative rounded-2xl border transition-all duration-500
        ${isOpen
          ? 'border-gold/30 bg-surface/60 shadow-[0_0_40px_rgba(200,169,106,0.07)]'
          : 'border-divider bg-surface/50 hover:border-gold/20 hover:bg-surface/55 hover:shadow-[0_0_20px_rgba(200,169,106,0.04)]'
        }
      `}
    >
      {/* Glow on open */}
      {isOpen && (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{ background: 'radial-gradient(60% 40% at 50% 0%, rgba(200,169,106,0.06) 0%, transparent 70%)' }}
        />
      )}

      {/* Question header */}
      <button
        onClick={onToggle}
        className="flex w-full items-start gap-4 p-6 text-right"
        aria-expanded={isOpen}
      >
        {/* Index number */}
        <span className={`
          mt-0.5 flex-shrink-0 font-mono text-xs transition-colors duration-300
          ${isOpen ? 'text-gold/70' : 'text-foreground/25 group-hover:text-gold/40'}
        `}>
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Question text */}
        <span className={`
          flex-1 font-heading text-base font-medium leading-relaxed text-right transition-colors duration-300
          ${isOpen ? 'text-gold' : 'text-foreground/80 group-hover:text-foreground'}
        `}>
          {faq.question_ar}
        </span>

        {/* Arrow */}
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className={`mt-0.5 flex-shrink-0 transition-colors duration-300 ${isOpen ? 'text-gold' : 'text-foreground/30 group-hover:text-gold/50'}`}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </motion.span>
      </button>

      {/* Answer */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="overflow-hidden"
          >
            {/* Gold divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="mx-6 h-px bg-gradient-to-r from-gold/30 via-gold/15 to-transparent"
            />
            <div ref={contentRef} className="p-6 pt-5">
              <p className="text-sm leading-relaxed text-foreground/60">{faq.answer_ar}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
