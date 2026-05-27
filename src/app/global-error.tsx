'use client';

import { useEffect } from 'react';
import ErrorRecoveryScreen from '@/components/ui/ErrorRecoveryScreen';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error({
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      digest: error?.digest,
    });
  }, [error]);

  return (
    <html lang="en">
      <body>
        <ErrorRecoveryScreen reset={reset} />
      </body>
    </html>
  );
}
