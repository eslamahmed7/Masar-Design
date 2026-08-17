import nextConfig from 'eslint-config-next/core-web-vitals'

const config = [
  ...nextConfig,
  {
    rules: {
      // Project conventions
      '@next/next/no-img-element': 'off',
      'import/no-anonymous-default-export': 'off',

      // React Compiler rules are too strict for existing codebase patterns.
      // These are new in eslint-plugin-react-hooks v7+ and flag common patterns
      // like setState in useEffect for SSR hydration, ref tracking, etc.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/error-boundaries': 'off',
      'react-hooks/incompatible-library': 'off',
      'react-hooks/exhaustive-deps': 'warn',

      // Internal navigation uses <a> for Arabic text with custom styling/animation.
      // These are not external links; switching to <Link> would change behavior.
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
]

export default config
