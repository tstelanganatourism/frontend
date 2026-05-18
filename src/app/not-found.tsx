import Link from 'next/link';
import { MapPinOff } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="bg-slate-50 p-6 rounded-full mb-6">
        <MapPinOff className="h-16 w-16 text-[var(--color-brand-teal)]" />
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-brand-river)] mb-4">
        Destination Not Found
      </h2>
      <p className="text-muted-foreground text-lg mb-8 max-w-md">
        It looks like you&apos;ve wandered off the map. The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link 
        href="/"
        className="bg-[var(--color-brand-teal)] hover:bg-[var(--color-brand-river)] text-white px-8 py-3 rounded-full font-semibold transition-colors"
      >
        Return to Homepage
      </Link>
    </div>
  );
}
