export default function TourLayout({ children }: { children: React.ReactNode }) {
  // The tour viewer is full-screen; the global header/footer from the root layout
  // will still render but the viewer covers the entire viewport via position:fixed.
  return <>{children}</>
}
