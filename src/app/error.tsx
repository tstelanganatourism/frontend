'use client';

import { useEffect } from 'react';
import ErrorRecoveryScreen from '@/components/ui/ErrorRecoveryScreen';

export default function Error({
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

  return <ErrorRecoveryScreen reset={reset} />;
}
