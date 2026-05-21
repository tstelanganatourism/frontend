'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/stores/adminStore';
import PackageForm from '@/components/packages/PackageForm';
import { toast } from 'sonner';

export default function AdminPackageCreatePage() {
  const router = useRouter();
  const { createPackage } = useAdminStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: any) => {
    setIsLoading(true);
    try {
      const created = await createPackage(formData);
      toast.success('Tour Package created successfully');
      router.push(`/admin/packages/edit/${created.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create experience');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto py-8 px-6">
      <PackageForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
