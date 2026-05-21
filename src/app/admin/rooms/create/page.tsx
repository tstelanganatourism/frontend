'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/stores/adminStore';
import RoomForm from '@/components/rooms/RoomForm';
import { toast } from 'sonner';

export default function AdminRoomCreatePage() {
  const router = useRouter();
  const { createRoom } = useAdminStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: any) => {
    setIsLoading(true);
    try {
      const created = await createRoom(formData);
      toast.success('Lodge created successfully');
      router.push(`/admin/rooms/edit/${created.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create lodge');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto py-8 px-6">
      <RoomForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
