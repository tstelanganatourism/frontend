import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <ShieldAlert className="h-8 w-8 text-red-600" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Access Denied</h1>
          <p className="text-gray-500">
            You do not have the necessary permissions to access this page.
          </p>
        </div>

        <div className="pt-6">
          <Link 
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-brand-river)] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-brand-teal)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
