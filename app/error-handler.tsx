'use client'

// Suppress "Router action dispatched before initialization" errors that occur during HMR
// These are benign development-only errors that don't affect the app
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error
  console.error = function (...args: any[]) {
    const errorMsg = args[0]?.toString?.() || ''
    // Suppress the specific router initialization HMR error
    if (
      errorMsg.includes('Router action dispatched before initialization') &&
      errorMsg.includes('hmrRefresh')
    ) {
      return // Silently ignore this error
    }
    // Call original error for all other errors
    originalError.apply(console, args)
  }
}
