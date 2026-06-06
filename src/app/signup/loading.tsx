import React from 'react';

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9F9F7] px-4 py-12">
      <div className="w-full max-w-md rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-xl space-y-6">
        <div className="space-y-2 text-center">
          <div className="mx-auto h-8 w-32 rounded bg-slate-200 animate-pulse" />
          <div className="mx-auto h-4 w-48 rounded bg-slate-100 animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="h-12 w-full rounded-2xl bg-slate-50 animate-pulse" />
          <div className="h-12 w-full rounded-2xl bg-slate-50 animate-pulse" />
          <div className="h-12 w-full rounded-full bg-slate-200 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
