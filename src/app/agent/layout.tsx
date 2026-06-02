import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Agent Portal | Telangana Boat Tourism',
  robots: { index: false, follow: false },
};

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
