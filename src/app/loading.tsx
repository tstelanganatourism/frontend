export default function Loading() {
  // TopLoader in layout.tsx provides smooth, non-intrusive navigation progress
  // Returning null here prevents unmounting pages and flashing floating loader pills on every navigation
  return null;
}
