'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/stores/adminStore';
import PackageForm from '@/components/packages/PackageForm';
import { toast } from 'sonner';
import { parseValidationError } from '@/lib/utils';

export default function AdminPackageCreatePage() {
  const router = useRouter();
  const { createPackage } = useAdminStore();
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleSubmit = async (formData: any) => {
    setIsLoading(true);
    setValidationErrors([]);
    try {
      const created = await createPackage(formData);
      toast.success('Tour Package created successfully');
      router.push(`/admin/packages/edit/${created.id}`);
    } catch (err: any) {
      const parsedErrors = parseValidationError(err);
      setValidationErrors(parsedErrors);
      
      if (parsedErrors.length > 0) {
        const errorText = parsedErrors.map(e => `• ${e}`).join('\n');
        toast.error(`Creation failed. Please address the following:\n${errorText}`, {
          duration: 7000
        });
      } else {
        toast.error('Failed to create experience');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto py-8 px-6">
      <PackageForm 
        onSubmit={handleSubmit} 
        isLoading={isLoading} 
        validationErrors={validationErrors}
        onClearValidationErrors={() => setValidationErrors([])}
      />
    </div>
  );
}
