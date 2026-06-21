'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/stores/adminStore';
import RoomForm from '@/components/rooms/RoomForm';
import { toast } from 'sonner';
import { parseValidationError } from '@/lib/utils';

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminRoomEditPage({ params }: EditPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { currentRoom, isLoading, error, fetchRoomById, updateRoom } = useAdminStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    fetchRoomById(resolvedParams.id).then(() => setHasFetched(true));
  }, [fetchRoomById, resolvedParams.id]);

  const handleSubmit = async (formData: any) => {
    setIsUpdating(true);
    setValidationErrors([]);
    try {
      await updateRoom(resolvedParams.id, formData);
      toast.success('Lodge updated successfully');
      router.push('/admin/rooms');
    } catch (err: any) {
      const parsedErrors = parseValidationError(err);
      setValidationErrors(parsedErrors);
      
      if (parsedErrors.length > 0) {
        const errorText = parsedErrors.map(e => `• ${e}`).join('\n');
        toast.error(`Saving failed. Requirements not met:\n${errorText}`, {
          duration: 7000
        });
      } else {
        toast.error(err.message || 'Failed to update property');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading || !hasFetched) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#5ac4d7] border-t-transparent" />
      </div>
    );
  }

  if (error || !currentRoom) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <div className="text-rose-600 font-bold text-lg">
          {error || 'Lodge not found'}
        </div>
        <button
          onClick={() => {
            setHasFetched(false);
            fetchRoomById(resolvedParams.id).then(() => setHasFetched(true));
          }}
          className="rounded-xl bg-[#0f3d56] px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#1a4f6d] transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto py-8 px-6">
      <RoomForm 
        initialData={currentRoom} 
        onSubmit={handleSubmit} 
        isLoading={isUpdating} 
        validationErrors={validationErrors}
        onClearValidationErrors={() => setValidationErrors([])}
      />
    </div>
  );
}
