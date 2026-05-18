'use client';

import React, { useEffect, useState } from 'react';
import NextTopLoader from 'nextjs-toploader';

export default function TopLoader() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <NextTopLoader 
      color="#5ac4d7" 
      showSpinner={false} 
      height={3} 
      crawl={true}
    />
  );
}
