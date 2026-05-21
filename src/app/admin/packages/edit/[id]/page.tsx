'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/stores/adminStore';
import PackageForm from '@/components/packages/PackageForm';
import { toast } from 'sonner';

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminPackageEditPage({ params }: EditPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { currentPackage, isLoading, fetchPackageById, updatePackage, publishPackage } = useAdminStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    fetchPackageById(resolvedParams.id);
  }, [fetchPackageById, resolvedParams.id]);

  const handleSubmit = async (formData: any) => {
    setIsUpdating(true);
    setValidationErrors([]);
    try {
      // Save fields first
      await updatePackage(resolvedParams.id, formData);
      
      // If user requested publishing, trigger hard backend publish validation
      if (formData.status === 'PUBLISHED') {
        await publishPackage(resolvedParams.id);
        toast.success('Tour Package published successfully!');
      } else {
        toast.success('Tour Package updated successfully');
      }
      
      router.push('/admin/packages');
    } catch (err: any) {
      const serverErrors = err.response?.data?.detail?.validation_errors;
      if (serverErrors && Array.isArray(serverErrors)) {
        setValidationErrors(serverErrors);
        toast.error('Publishing failed. Please fix the validation errors.');
      } else {
        const errMsg = err.response?.data?.detail || err.message || 'Failed to update experience';
        toast.error(errMsg);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading && !currentPackage) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#5ac4d7] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto py-8 px-6">
      <PackageForm 
        initialData={currentPackage} 
        onSubmit={handleSubmit}
        onAutosave={async (data) => {
          await updatePackage(resolvedParams.id, data);
        }}
        isLoading={isUpdating} 
        validationErrors={validationErrors}
        onClearValidationErrors={() => setValidationErrors([])}
      />
    </div>
  );
}
