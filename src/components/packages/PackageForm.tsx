'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  ArrowLeft,
  Info,
  Globe,
  Layers,
  Compass,
  HelpCircle,
  Plus,
  Trash2,
  ListPlus,
  ArrowUp,
  ArrowDown,
  Layout,
  ShieldCheck,
  Percent,
  BedDouble,
  ChevronDown,
  Image as ImageIcon,
  FileText,
  X,
  Download,
  Loader2,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Check,
  CheckCircle,
  XCircle
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import ImageUpload from '@/components/ui/ImageUpload';
import FileUpload from '@/components/ui/FileUpload';
import MultiImageUpload from '@/components/ui/MultiImageUpload';
import PremiumSelect from '@/components/ui/PremiumSelect';
import { apiClient } from '@/lib/api';

const RichTextEditor = dynamic(() => import('@/components/ui/RichTextEditor'), { ssr: false });

const REGION_OPTIONS = [
  { value: 'AP', label: 'Andhra Pradesh (AP)' },
  { value: 'TS', label: 'Telangana (TS)' }
];

const PACKAGE_TYPE_OPTIONS = [
  { value: 'TOUR', label: 'Boat Rides' },
  { value: 'TRIP', label: 'Sightseeing' }
];

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'ARCHIVED', label: 'Archived' }
];

const POLICY_CATEGORIES = [
  { value: 'CANCELLATION', label: 'Cancellation & Refund' },
  { value: 'CHECK_IN_OUT', label: 'Check-in/Check-out Rules' },
  { value: 'TRAVEL_RULES', label: 'Travel Guidelines' },
  { value: 'GENERAL', label: 'General Information' },
  { value: 'SAFETY', label: 'Safety Measures' },
  { value: 'LUGGAGE', label: 'Luggage Policy' },
  { value: 'FOOD', label: 'Food & Beverages' },
  { value: 'WEATHER', label: 'Weather Conditions' },
  { value: 'BOARDING', label: 'Boarding Instructions' },
  { value: 'STAY_RULES', label: 'Stay Rules' }
];

interface PackageFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onAutosave?: (data: any) => Promise<void>;
  isLoading: boolean;
  validationErrors?: string[];
  onClearValidationErrors?: () => void;
}

export default function PackageForm({
  initialData,
  onSubmit,
  onAutosave,
  isLoading,
  validationErrors = [],
  onClearValidationErrors
}: PackageFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('basic');

  // Basic Fields
  const [title, setTitle] = useState('');
  const [type, setType] = useState('TOUR');
  const [duration, setDuration] = useState('');
  const [place, setPlace] = useState('');
  const [slug, setSlug] = useState('');
  const [region, setRegion] = useState('AP');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [orderPriority, setOrderPriority] = useState(0);
  const [hasTransport, setHasTransport] = useState(false);
  const [hasRefreshments, setHasRefreshments] = useState(false);
  const [refreshmentAdultPrice, setRefreshmentAdultPrice] = useState<number | ''>('');
  const [refreshmentChildPrice, setRefreshmentChildPrice] = useState<number | ''>('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [status, setStatus] = useState('DRAFT');
  const [minPassengers, setMinPassengers] = useState<number>(1);
  const [isStudentPackage, setIsStudentPackage] = useState(false);
  const [refreshmentStudentPrice, setRefreshmentStudentPrice] = useState<number | ''>('');

  // Brochure (R2 integration & backend PDF generation)
  const [brochurePdfUrl, setBrochurePdfUrl] = useState('');
  const [brochureValidation, setBrochureValidation] = useState<any>(null);
  const [isValidatingBrochure, setIsValidatingBrochure] = useState(false);
  const [isGeneratingBrochure, setIsGeneratingBrochure] = useState(false);
  const [shouldRegenerateOnSave, setShouldRegenerateOnSave] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);
  const lastRevalidatedBrochureRef = useRef<string | null>(null);
  const prevStatusRef = useRef<string | null>(null);
  const activeBrochureUrl = brochurePdfUrl || brochureValidation?.active_brochure_url || initialData?.generated_brochure_url || '';

  // SEO Fields
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [ogImageUrl, setOgImageUrl] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');

  // Collections States
  const [variants, setVariants] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [itinerary, setItinerary] = useState<any[]>([]);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [inclusions, setInclusions] = useState<any[]>([]);
  const [exclusions, setExclusions] = useState<any[]>([]);
  const [boardingPoints, setBoardingPoints] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [transportOptions, setTransportOptions] = useState<any[]>([]);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setType(initialData.type || 'TOUR');
      setDuration(initialData.duration || '');
      setPlace(initialData.place || '');
      setSlug(initialData.slug || '');
      setRegion(initialData.region || 'AP');
      setDescription(initialData.description || '');
      setCoverImageUrl(initialData.cover_image_url || '');
      setOrderPriority(initialData.order_priority || 0);
      setHasTransport(initialData.has_transport || false);
      setHasRefreshments(initialData.has_refreshments || false);
      setRefreshmentAdultPrice(initialData.refreshment_adult_price ?? '');
      setRefreshmentChildPrice(initialData.refreshment_child_price ?? '');
      setIsFeatured(initialData.is_featured || false);
      setIsActive(initialData.is_active !== false);
      setStatus(initialData.status || 'DRAFT');
      setMinPassengers(initialData.min_passengers ?? 1);
      setIsStudentPackage(initialData.is_student_package || false);
      setRefreshmentStudentPrice(initialData.refreshment_student_price ?? '');

      setMetaTitle(initialData.meta_title || '');
      setMetaDescription(initialData.meta_description || '');
      setOgImageUrl(initialData.og_image_url || '');
      setCanonicalUrl(initialData.canonical_url || '');

      setVariants(initialData.variants || []);
      setGallery(initialData.gallery || []);
      setBrochurePdfUrl(initialData.brochure_pdf_url || '');
      setItinerary(initialData.itinerary || []);
      setHighlights(initialData.highlights || []);
      setInclusions(initialData.inclusions || []);
      setExclusions(initialData.exclusions || []);
      setBoardingPoints(initialData.boarding_points || []);
      setFaqs(initialData.faqs || []);
      setPolicies(initialData.policies || []);
      setTransportOptions(initialData.transport_options || []);
    }
  }, [initialData]);

  // Dynamic SEO Auto-Generation when creating a new package
  const lastGeneratedMetaTitleRef = useRef('');
  const lastGeneratedMetaDescRef = useRef('');
  const lastGeneratedCanonicalRef = useRef('');
  const lastGeneratedOgImgRef = useRef('');

  useEffect(() => {
    if (!initialData) {
      const cleanTitle = title.trim();
      const cleanPlace = place.trim();
      const cleanDur = duration.trim();
      const locationLabel = cleanPlace || 'Bhadrachalam and Papikondalu';

      // 1. Auto-generate Meta Title
      const expectedTitle = cleanTitle ? `${cleanTitle} - Tour Package Booking Partner` : '';
      if (!metaTitle || metaTitle === lastGeneratedMetaTitleRef.current) {
        setMetaTitle(expectedTitle);
        lastGeneratedMetaTitleRef.current = expectedTitle;
      }

      // 2. Auto-generate Meta Description
      const durationText = cleanDur ? ` ${cleanDur}` : '';
      const expectedDesc = cleanTitle
        ? `Book ${cleanTitle}${durationText} with Telangana Boat Tourism. Papikondalu boat tour package booking agent from ${locationLabel}, with itinerary, pricing, boarding details, and support.`
        : '';
      if (!metaDescription || metaDescription === lastGeneratedMetaDescRef.current) {
        setMetaDescription(expectedDesc);
        lastGeneratedMetaDescRef.current = expectedDesc;
      }

      // 3. Auto-generate Canonical URL
      const computedSlug = slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const expectedCanonical = computedSlug 
        ? `https://www.tsboattourism.org/packages/${computedSlug}`
        : '';
      if (!canonicalUrl || canonicalUrl === lastGeneratedCanonicalRef.current) {
        setCanonicalUrl(expectedCanonical);
        lastGeneratedCanonicalRef.current = expectedCanonical;
      }

      // 4. Auto-generate OG Image from Cover Image
      if (!ogImageUrl || ogImageUrl === lastGeneratedOgImgRef.current) {
        setOgImageUrl(coverImageUrl);
        lastGeneratedOgImgRef.current = coverImageUrl;
      }
    }
  }, [title, place, duration, slug, coverImageUrl, initialData, metaTitle, metaDescription, canonicalUrl, ogImageUrl]);



  const galleryUrls = gallery.map(g => g.image_url).filter(Boolean);
  const handleGalleryChange = (urls: string[]) => {
    setGallery(urls.map((url, idx) => ({
      image_url: url,
      is_cover: idx === 0,
      sort_order: idx + 1
    })));
    if (urls.length > 0) {
      setCoverImageUrl(urls[0]);
    } else {
      setCoverImageUrl('');
    }
  };

  // Brochure Validation & Polling
  const checkBrochureValidation = async () => {
    if (!initialData?.id) return;
    setIsValidatingBrochure(true);
    try {
      const response = await apiClient.get(`/api/v1/admin/packages/${initialData.id}/brochure-validation`);
      const validation = response.data;
      setBrochureValidation(validation);

      const latestGeneratedUrl = validation?.generated_brochure_url;
      if (
        validation?.status === 'AVAILABLE' &&
        latestGeneratedUrl &&
        latestGeneratedUrl !== lastRevalidatedBrochureRef.current &&
        initialData?.slug
      ) {
        lastRevalidatedBrochureRef.current = latestGeneratedUrl;
        fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paths: ['/', '/boat-rides', '/sightseeing', '/packages', `/packages/${initialData.slug}`],
            secret: 'ts-tourism-revalidate-2024',
          }),
        }).catch(() => {
          // Non-critical; public ISR also refreshes on its normal interval.
        });
      }
    } catch (err) {
      console.error("Failed to check brochure validation", err);
    } finally {
      setIsValidatingBrochure(false);
    }
  };

  useEffect(() => {
    if (initialData?.id && activeTab === 'basic') {
      checkBrochureValidation();
    }
  }, [initialData?.id, activeTab]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (['GENERATING', 'QUEUED'].includes(brochureValidation?.status) || isGeneratingBrochure) {
      intervalId = setInterval(checkBrochureValidation, 4000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [brochureValidation?.status, isGeneratingBrochure]);

  // Show toast when brochure generation succeeds
  useEffect(() => {
    const currentStatus = brochureValidation?.status;
    if (
      prevStatusRef.current &&
      ['QUEUED', 'GENERATING'].includes(prevStatusRef.current) &&
      currentStatus === 'AVAILABLE'
    ) {
      toast.success('New brochure generated successfully!');
    }
    prevStatusRef.current = currentStatus || null;
  }, [brochureValidation?.status]);

  const handleGenerateBrochure = async () => {
    if (!initialData?.id) return;

    // Inline confirmation check to bypass browser popup blockers
    if (activeBrochureUrl && !showRegenConfirm && !shouldRegenerateOnSave) {
      setShowRegenConfirm(true);
      // Auto-reset the confirmation state after 3.5 seconds
      setTimeout(() => setShowRegenConfirm(false), 3500);
      return;
    }

    setShowRegenConfirm(false);
    setShouldRegenerateOnSave(true);
    toast.success('Brochure queued for generation. It will be generated when you click Save Changes.');
  };

  const openBrochurePdf = async (urlTarget: string) => {
    if (!urlTarget.startsWith('private/')) {
      window.open(urlTarget, '_blank');
      return;
    }

    const response = await apiClient.post('/api/v1/documents/signed-url', {
      object_key: urlTarget
    });
    window.open(response.data.url, '_blank');
  };

  const handleDownloadPDF = async () => {
    const urlTarget = activeBrochureUrl;

    if (!urlTarget) {
      toast.error("No brochure available to download");
      return;
    }
    setIsDownloadingPdf(true);
    try {
      await openBrochurePdf(urlTarget);
      toast.success('PDF opened securely');
    } catch (err) {
      toast.error('Failed to generate secure link for the PDF');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const moveItem = (list: any[], setList: (l: any[]) => void, index: number, direction: 'up' | 'down') => {
    const newList = [...list];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newList.length) return;

    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;

    const rescaledList = newList.map((item, idx) => ({ ...item, sort_order: idx + 1 }));
    setList(rescaledList);
  };

  // Variants management
  const addVariant = () => {
    setVariants(prev => [
      ...prev,
      isStudentPackage
        ? { title: '', adult_price: 0, child_price: 0, student_price: 500, weekend_student_price: 600, is_active: true }
        : { title: '', adult_price: 1500, child_price: 1000, weekend_adult_price: 1700, weekend_child_price: 1200, is_active: true }
    ]);
  };
  const updateVariant = (index: number, key: string, value: any) => {
    setVariants(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };
  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, idx) => idx !== index));
  };

  // Transport Options management
  const addTransportOption = (type: 'SHARED' | 'SEPARATE_VEHICLE') => {
    setTransportOptions(prev => [
      ...prev,
      { 
        title: '', 
        type, 
        capacity: type === 'SEPARATE_VEHICLE' ? 4 : 1, 
        adult_price: type === 'SHARED' ? 500 : null,
        child_price: type === 'SHARED' ? 300 : null,
        weekend_adult_price: type === 'SHARED' ? 600 : null,
        weekend_child_price: type === 'SHARED' ? 400 : null,
        fixed_price: type === 'SEPARATE_VEHICLE' ? 2000 : null,
        weekend_fixed_price: type === 'SEPARATE_VEHICLE' ? 2500 : null
      }
    ]);
  };
  const updateTransportOption = (index: number, key: string, value: any) => {
    setTransportOptions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };
  const removeTransportOption = (index: number) => {
    setTransportOptions(prev => prev.filter((_, idx) => idx !== index));
  };

  // Itinerary management
  const addItineraryDay = () => {
    setItinerary(prev => [
      ...prev,
      { day_number: prev.length + 1, title: '', description: '', timing: '', duration_at_stop: '', image_url: '', meal_included: false, sort_order: prev.length + 1 }
    ]);
  };
  const updateItineraryDay = (index: number, key: string, value: any) => {
    setItinerary(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };
  const removeItineraryDay = (index: number) => {
    setItinerary(prev => prev.filter((_, idx) => idx !== index).map((item, idx) => ({ ...item, sort_order: idx + 1 })));
  };

  // Highlights management
  const addHighlight = () => {
    setHighlights(prev => [
      ...prev,
      { title: '', icon: 'Check', sort_order: prev.length + 1 }
    ]);
  };
  const updateHighlight = (index: number, key: string, value: any) => {
    setHighlights(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };
  const removeHighlight = (index: number) => {
    setHighlights(prev => prev.filter((_, idx) => idx !== index).map((item, idx) => ({ ...item, sort_order: idx + 1 })));
  };

  // Inclusions & Exclusions management
  const addInclusion = () => {
    setInclusions(prev => [...prev, { label: '', icon: 'Check', sort_order: prev.length + 1 }]);
  };
  const updateInclusion = (index: number, key: string, value: any) => {
    setInclusions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };
  const removeInclusion = (index: number) => {
    setInclusions(prev => prev.filter((_, idx) => idx !== index).map((item, idx) => ({ ...item, sort_order: idx + 1 })));
  };

  const addExclusion = () => {
    setExclusions(prev => [...prev, { label: '', icon: 'AlertTriangle', sort_order: prev.length + 1 }]);
  };
  const updateExclusion = (index: number, key: string, value: any) => {
    setExclusions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };
  const removeExclusion = (index: number) => {
    setExclusions(prev => prev.filter((_, idx) => idx !== index).map((item, idx) => ({ ...item, sort_order: idx + 1 })));
  };

  // Boarding Points management
  const addBoardingPoint = () => {
    setBoardingPoints(prev => [...prev, { title: '', address: '', map_url: '', departure_time: '', landmark: '', contact_number: '', pickup_instructions: '', return_drop_info: '', sort_order: prev.length + 1 }]);
  };
  const updateBoardingPoint = (index: number, key: string, value: any) => {
    setBoardingPoints(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };
  const removeBoardingPoint = (index: number) => {
    setBoardingPoints(prev => prev.filter((_, idx) => idx !== index).map((item, idx) => ({ ...item, sort_order: idx + 1 })));
  };

  // FAQs management
  const addFAQ = () => {
    setFaqs(prev => [...prev, { question: '', answer: '', sort_order: prev.length + 1 }]);
  };
  const updateFAQ = (index: number, key: string, value: any) => {
    setFaqs(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };
  const removeFAQ = (index: number) => {
    setFaqs(prev => prev.filter((_, idx) => idx !== index).map((item, idx) => ({ ...item, sort_order: idx + 1 })));
  };

  // Policies management
  const addPolicy = () => {
    setPolicies(prev => [...prev, { type: 'CANCELLATION', title: '', description: '', sort_order: prev.length + 1 }]);
  };
  const updatePolicy = (index: number, key: string, value: any) => {
    setPolicies(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };
  const removePolicy = (index: number) => {
    setPolicies(prev => prev.filter((_, idx) => idx !== index).map((item, idx) => ({ ...item, sort_order: idx + 1 })));
  };

  const getPayload = () => {
    return {
      title,
      type,
      duration: duration.trim() || null,
      place: place.trim() || null,
      slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      region,
      description,
      cover_image_url: coverImageUrl || null,
      brochure_pdf_url: brochurePdfUrl || null,
      order_priority: Number(orderPriority),
      has_transport: hasTransport,
      has_refreshments: hasRefreshments,
    is_student_package: isStudentPackage,
      refreshment_adult_price: !isStudentPackage && hasRefreshments && refreshmentAdultPrice !== '' ? Number(refreshmentAdultPrice) : null,
      refreshment_child_price: !isStudentPackage && hasRefreshments && refreshmentChildPrice !== '' ? Number(refreshmentChildPrice) : null,
      refreshment_student_price: isStudentPackage && hasRefreshments && refreshmentStudentPrice !== '' ? Number(refreshmentStudentPrice) : null,
      is_featured: isFeatured,
      is_active: isActive,
      status,
      min_passengers: Number(minPassengers) || 1,
      meta_title: metaTitle || null,
      meta_description: metaDescription || null,
      og_image_url: ogImageUrl || null,
      canonical_url: canonicalUrl || null,
      variants: variants.map((v, idx) => ({
        ...v,
        adult_price: Number(v.adult_price || 0),
        child_price: Number(v.child_price || 0),
        weekend_adult_price: v.weekend_adult_price ? Number(v.weekend_adult_price) : null,
        weekend_child_price: v.weekend_child_price ? Number(v.weekend_child_price) : null,
        student_price: v.student_price ? Number(v.student_price) : null,
        weekend_student_price: v.weekend_student_price ? Number(v.weekend_student_price) : null,
        sort_order: idx + 1
      })),
      transport_options: hasTransport ? transportOptions.map((t) => ({
        ...t,
        capacity: Number(t.capacity),
        adult_price: t.adult_price ? Number(t.adult_price) : null,
        child_price: t.child_price ? Number(t.child_price) : null,
        weekend_adult_price: t.weekend_adult_price ? Number(t.weekend_adult_price) : null,
        weekend_child_price: t.weekend_child_price ? Number(t.weekend_child_price) : null,
        student_price: t.student_price ? Number(t.student_price) : null,
        weekend_student_price: t.weekend_student_price ? Number(t.weekend_student_price) : null,
        fixed_price: t.fixed_price ? Number(t.fixed_price) : null,
        weekend_fixed_price: t.weekend_fixed_price ? Number(t.weekend_fixed_price) : null
      })) : [],
      gallery: gallery.map((g, idx) => ({ ...g, sort_order: idx + 1 })),
      itinerary: itinerary.map((i, idx) => ({ ...i, day_number: Number(i.day_number), sort_order: idx + 1 })),
      highlights: highlights.map((h, idx) => ({ ...h, sort_order: idx + 1 })),
      inclusions: inclusions.map((i, idx) => ({ ...i, sort_order: idx + 1 })),
      exclusions: exclusions.map((e, idx) => ({ ...e, sort_order: idx + 1 })),
      boarding_points: boardingPoints.map((b, idx) => ({ ...b, sort_order: idx + 1 })),
      faqs: faqs.map((f, idx) => ({ ...f, sort_order: idx + 1 })),
      policies: policies.map((p, idx) => ({ ...p, sort_order: idx + 1 }))
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Package title is required');
      return;
    }
    if (hasTransport && transportOptions.length === 0) {
      toast.error('Please add at least one transport option under the Transport Options tab, or disable Has Transport Options in the Basic Info tab.');
      return;
    }
    try {
      await onSubmit(getPayload());
      
      if (shouldRegenerateOnSave && initialData?.id) {
        setIsGeneratingBrochure(true);
        try {
          await apiClient.post(`/api/v1/admin/packages/${initialData.id}/regenerate-brochure`);
          toast.success('Brochure generation started in the background!');
          setShouldRegenerateOnSave(false);
          checkBrochureValidation();
        } catch (err: any) {
          toast.error(err.response?.data?.detail?.message || 'Failed to trigger brochure generation');
        } finally {
          setIsGeneratingBrochure(false);
        }
      }
    } catch (err: any) {
      // Error handled by parent
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Info },
    { id: 'variants', label: 'Package Categories', icon: BedDouble },
    ...(hasTransport ? [{ id: 'transport_options', label: 'Transport Options', icon: Compass }] : []),
    { id: 'itinerary', label: 'Itinerary', icon: Compass },
    { id: 'highlights', label: 'Highlights', icon: Sparkles },
    { id: 'inclusions', label: 'Inclusions & Boarding', icon: ListPlus },
    { id: 'faqs', label: 'FAQs & Policies', icon: ShieldCheck },
    { id: 'seo', label: 'SEO Metadata', icon: Globe },
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if ((e.target as HTMLElement).tagName.toLowerCase() === 'textarea') return;
    if (e.key === 'Enter') e.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-5 sm:space-y-8">

      {/* Validation Errors Global Alert */}
      <AnimatePresence>
        {validationErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-6 bg-red-50 border-2 border-red-200 rounded-3xl shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <h3 className="text-red-900 font-bold text-lg">Action Required to Save/Publish</h3>
              </div>
              {onClearValidationErrors && (
                <button
                  type="button"
                  onClick={onClearValidationErrors}
                  className="p-1 rounded-lg hover:bg-red-100 text-red-500 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            <ul className="list-disc pl-6 space-y-1">
              {validationErrors.map((err, i) => (
                <li key={i} className="text-red-700 font-medium text-sm">{err}</li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 sm:pb-6 bg-[#f8fafc]/95 backdrop-blur-sm relative z-10 sm:sticky sm:top-20 sm:z-20 pt-4 px-4 -mx-4 sm:px-2 sm:-mx-2">
        <div className="flex min-w-0 items-start gap-3 sm:items-center">
          <button
            type="button"
            onClick={() => router.push('/admin/packages')}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all shadow-sm group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight break-words">
              {initialData ? `${title}` : 'Create New Package'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">Configure itinerary, pricing, pickup points and more.</p>
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f3d56] px-6 py-3 text-sm font-bold text-white shadow-xl shadow-[#0f3d56]/20 transition-all hover:-translate-y-1 hover:bg-[#1a4f6d] disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {initialData ? 'Save Changes' : 'Create Package'}
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none gap-2 pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActiveTab = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-5 py-4 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${isActiveTab
                ? 'border-[#5ac4d7] text-[#0f3d56] bg-slate-50/80 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50/50 rounded-t-xl'
                }`}
            >
              <Icon className={`h-4 w-4 ${isActiveTab ? 'text-[#5ac4d7]' : ''}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active Tab Panel */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-4 sm:p-8 shadow-sm">

        {/* Tab 1: Basic Info */}
        {activeTab === 'basic' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#5ac4d7]" />
                    Package Brochure PDF
                  </h3>
                  <p className="text-sm font-medium text-slate-500 mt-2 max-w-lg">
                    Generate a beautiful, printable PDF brochure dynamically from the package data. Admin users can upload a custom PDF manually or regenerate a new brochure after saving package changes.
                  </p>

                  <div className="pt-6 border-t border-slate-100/60 mt-6">
                    <FileUpload
                      label="Manual Brochure Upload (Override)"
                      value={brochurePdfUrl}
                      onChange={async (url) => {
                        setBrochurePdfUrl(url || '');
                        try {
                          if (onAutosave) {
                            const payload = { ...getPayload(), brochure_pdf_url: url || null };
                            await onAutosave(payload);
                            if (url) {
                              toast.success('Custom brochure PDF uploaded and saved successfully!');
                            } else {
                              toast.success('Custom brochure PDF cleared successfully!');
                            }
                            checkBrochureValidation();
                          } else {
                            if (url) {
                              toast.info('PDF uploaded. Save the package to publish this brochure.');
                            }
                          }
                        } catch (err) {
                          toast.error('Failed to save brochure PDF changes.');
                        }
                      }}
                      accept="application/pdf"
                      fileTypeLabel="Custom PDF Brochure"
                    />
                    <p className="mt-3 text-xs font-semibold text-slate-500">
                      Uploading a manual PDF and saving the package makes it the active public brochure. Generating again later will replace it with a fresh generated PDF.
                    </p>
                  </div>
                </div>

                <div className="w-full bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm md:w-80 shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pre-flight Checklist</span>
                    {isValidatingBrochure && <Loader2 className="h-3 w-3 animate-spin text-slate-400" />}
                  </div>
                  {initialData?.id ? (
                    brochureValidation ? (
                      <div className="space-y-3">
                        {brochureValidation.is_valid ? (
                          <div className="flex items-start gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                            <p className="text-xs font-bold leading-relaxed">Package has all required details! Ready for brochure generation.</p>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2 text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100">
                            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="text-xs font-bold">Missing requirements:</p>
                              <ul className="text-[10px] font-semibold list-disc pl-4 space-y-0.5 opacity-90">
                                {brochureValidation.errors.map((e: string, i: number) => <li key={i}>{e}</li>)}
                              </ul>
                            </div>
                          </div>
                        )}
                        {brochureValidation.warnings?.length > 0 && (
                          <div className="flex items-start gap-2 text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
                            <Info className="h-4 w-4 shrink-0 mt-0.5" />
                            <ul className="text-[10px] font-semibold list-disc pl-4 space-y-0.5 opacity-90">
                              {brochureValidation.warnings.map((w: string, i: number) => <li key={i}>{w}</li>)}
                            </ul>
                          </div>
                        )}

                        {/* Dynamic PDF Actions in the right box */}
                        {brochureValidation?.is_valid && (
                          <div className="pt-4 border-t border-slate-100 mt-4 space-y-3">
                            {/* Alert box for failed generation */}
                            {brochureValidation?.status === 'FAILED' && (
                              <div className="bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-xl text-xs font-semibold flex items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                                <div>
                                  <p className="font-bold">Generation Failed</p>
                                  <p className="text-[10px] font-medium text-red-600 mt-0.5">Please try again or upload a custom PDF manually.</p>
                                </div>
                              </div>
                            )}

                            {/* Generation Button */}
                            <button
                              type="button"
                              onClick={handleGenerateBrochure}
                              disabled={isGeneratingBrochure || ['GENERATING', 'QUEUED'].includes(brochureValidation?.status)}
                              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer ${isGeneratingBrochure || ['GENERATING', 'QUEUED'].includes(brochureValidation?.status)
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  : showRegenConfirm
                                    ? 'bg-rose-50 border-2 border-rose-400 text-rose-700 hover:bg-rose-100 scale-[0.98]'
                                    : 'bg-white border-2 border-[#5ac4d7] text-[#0f3d56] hover:bg-[#5ac4d7]/10'
                                }`}
                            >
                              {isGeneratingBrochure || ['GENERATING', 'QUEUED'].includes(brochureValidation?.status) ? (
                                <><Loader2 className="h-3.5 w-3.5 animate-spin text-[#5ac4d7]" /> {brochureValidation?.status === 'QUEUED' ? 'Queued...' : 'Generating...'}</>
                              ) : showRegenConfirm ? (
                                <><AlertTriangle className="h-3.5 w-3.5" /> Click again to confirm</>
                              ) : shouldRegenerateOnSave ? (
                                <><RefreshCw className="h-3.5 w-3.5 text-amber-500" /> Will Generate on Save</>
                              ) : brochureValidation?.status === 'FAILED' ? (
                                <><RefreshCw className="h-3.5 w-3.5" /> Retry Generation</>
                              ) : activeBrochureUrl ? (
                                <><RefreshCw className="h-3.5 w-3.5" /> Regenerate Brochure</>
                              ) : (
                                <><RefreshCw className="h-3.5 w-3.5" /> Generate Brochure</>
                              )}
                            </button>

                            {/* View/Download Button */}
                            {activeBrochureUrl && (
                              <button
                                type="button"
                                onClick={handleDownloadPDF}
                                disabled={isDownloadingPdf}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shadow-sm hover:bg-emerald-100 transition-all cursor-pointer"
                              >
                                {isDownloadingPdf ? (
                                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Preparing Link...</>
                                ) : (
                                  <><Download className="h-3.5 w-3.5" /> View / Download PDF</>
                                )}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs font-semibold text-slate-400 italic">Validating package data...</div>
                    )
                  ) : (
                    <div className="text-xs font-semibold text-slate-400 italic">Save the package first to validate and generate the brochure.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Package Name / Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#5ac4d7] focus:ring-2 focus:ring-[#5ac4d7]/20 transition-all font-semibold text-slate-800 shadow-sm"
                  placeholder="e.g. Papikondalu 2 Days Premium Tour"
                  required
                />
              </div>

              <div>
                <PremiumSelect
                  label="Package Type *"
                  value={type}
                  options={PACKAGE_TYPE_OPTIONS}
                  onChange={setType}
                />
              </div>

              <div>
                <PremiumSelect
                  label="Operating Region *"
                  value={region}
                  options={REGION_OPTIONS}
                  onChange={setRegion}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Package Place / Destination (e.g. Rajahmundry, Bhadrachalam)</label>
                <input
                  type="text"
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#5ac4d7] focus:ring-2 focus:ring-[#5ac4d7]/20 transition-all font-semibold text-slate-800 shadow-sm"
                  placeholder="e.g. Rajahmundry"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Package Duration / Label (e.g. 2 Days / 1 Night, Morning Ride)</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#5ac4d7] focus:ring-2 focus:ring-[#5ac4d7]/20 transition-all font-semibold text-slate-800 shadow-sm"
                  placeholder="e.g. 2 Days / 1 Night"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">URL Slug / Link Name (Optional)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#5ac4d7] focus:ring-2 focus:ring-[#5ac4d7]/20 transition-all font-semibold text-slate-800 shadow-sm"
                  placeholder="e.g. papikondalu-premium-tour"
                />
              </div>

              <div>
                <PremiumSelect
                  label="Publish Status *"
                  value={status}
                  options={STATUS_OPTIONS}
                  onChange={setStatus}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sorting Priority (Higher appears first)</label>
                <input
                  type="number"
                  value={orderPriority}
                  onChange={(e) => setOrderPriority(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#5ac4d7] focus:ring-2 focus:ring-[#5ac4d7]/20 transition-all font-semibold text-slate-800 shadow-sm"
                  min={0}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 grid gap-6 sm:grid-cols-2">
              <label className="flex items-center gap-3 cursor-pointer group bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200/60 hover:border-amber-400/50 transition-all">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-5 w-5 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                />
                <div>
                  <span className="block text-sm font-bold text-slate-800">Add to Home Carousel</span>
                  <span className="block text-xs font-medium text-slate-500 mt-0.5">Shows as a slide in the homepage hero with cover image &amp; Book Now button</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-[#5ac4d7]/30 transition-all">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-5 w-5 rounded border-slate-300 text-[#5ac4d7] focus:ring-[#5ac4d7]"
                />
                <div>
                  <span className="block text-sm font-bold text-slate-800">Accept Bookings</span>
                  <span className="block text-xs font-medium text-slate-500 mt-0.5">Package is active and allows reservations</span>
                </div>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100 grid gap-4 sm:grid-cols-3">
              {/* Transport Toggle */}
              <label className="flex items-center gap-3 cursor-pointer group bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-200/60 hover:border-indigo-400/50 transition-all">
                <input
                  type="checkbox"
                  checked={hasTransport}
                  onChange={(e) => setHasTransport(e.target.checked)}
                  className="h-5 w-5 rounded border-slate-300 text-indigo-500 focus:ring-indigo-400"
                />
                <div>
                  <span className="block text-sm font-bold text-slate-800">Has Transport Options</span>
                  <span className="block text-xs font-medium text-slate-500 mt-0.5">Enable if this package provides transport choices (Shared/Separate)</span>
                </div>
              </label>

              {/* Student Package Toggle */}
              <div className="flex flex-col gap-3 group bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200/60 hover:border-amber-400/50 transition-all">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isStudentPackage}
                    onChange={(e) => setIsStudentPackage(e.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                  />
                  <div>
                    <span className="block text-sm font-bold text-slate-800">🎓 Student Package</span>
                    <span className="block text-xs font-medium text-slate-500 mt-0.5">Enable for school/college group bookings. Uses a single student rate.</span>
                  </div>
                </label>
                {isStudentPackage && (
                  <div className="ml-8 px-3 py-2 bg-amber-100/70 rounded-lg border border-amber-200 text-xs font-semibold text-amber-800">
                    ✓ Set student prices in the <strong>Package Categories</strong> tab.
                  </div>
                )}
              </div>

              {/* Refreshments Toggle */}
              <div className="flex flex-col gap-3 group bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200/60 hover:border-emerald-400/50 transition-all">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasRefreshments}
                    onChange={(e) => setHasRefreshments(e.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-400"
                  />
                  <div>
                    <span className="block text-sm font-bold text-slate-800">Has Refreshments</span>
                    <span className="block text-xs font-medium text-slate-500 mt-0.5">Enable if optional refreshments are offered</span>
                  </div>
                </label>
                {hasRefreshments && (
                  <div className="grid grid-cols-2 gap-3 mt-2 pl-8">
                    {isStudentPackage ? (
                      <div className="col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Student Refreshment Price (₹ per student)</label>
                        <input
                          type="number"
                          value={refreshmentStudentPrice}
                          onChange={(e) => setRefreshmentStudentPrice(e.target.value ? Number(e.target.value) : '')}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 font-bold text-emerald-700"
                          min={0}
                        />
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Adult Price (₹)</label>
                          <input
                            type="number"
                            value={refreshmentAdultPrice}
                            onChange={(e) => setRefreshmentAdultPrice(e.target.value ? Number(e.target.value) : '')}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 font-bold text-emerald-700"
                            min={0}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Child Price (₹)</label>
                          <input
                            type="number"
                            value={refreshmentChildPrice}
                            onChange={(e) => setRefreshmentChildPrice(e.target.value ? Number(e.target.value) : '')}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 font-bold text-emerald-700"
                            min={0}
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-4 sm:p-5 rounded-xl border border-rose-200/60 hover:border-rose-400/50 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-black text-slate-800">Minimum Passengers per Booking</label>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                      Set the minimum total passengers (adults + children) required. Bookings below this count will be blocked for tourists. Admins and agents can still book freely.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setMinPassengers(prev => Math.max(1, prev - 1))}
                      className="h-9 w-9 rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-100 transition-all font-black text-lg flex items-center justify-center shadow-sm"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={minPassengers}
                      onChange={(e) => setMinPassengers(Math.max(1, Number(e.target.value) || 1))}
                      className="w-16 text-center rounded-xl border border-rose-200 bg-white px-2 py-2 text-base font-black text-rose-700 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-400/20 shadow-sm"
                      min={1}
                    />
                    <button
                      type="button"
                      onClick={() => setMinPassengers(prev => prev + 1)}
                      className="h-9 w-9 rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-100 transition-all font-black text-lg flex items-center justify-center shadow-sm"
                    >
                      +
                    </button>
                    <span className="text-xs font-bold text-slate-500 ml-1">passengers</span>
                  </div>
                </div>
                {minPassengers > 1 && (
                  <div className="mt-3 flex items-center gap-2 bg-rose-100/60 rounded-lg px-3 py-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                    <span className="text-xs font-bold text-rose-700">
                      Bookings with fewer than {minPassengers} passengers will be blocked on the public booking page.
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <MultiImageUpload
                label="Package Gallery & Cover Photos *"
                helperText="Upload multiple stunning photos. The first image will automatically be used as the primary cover image."
                value={galleryUrls}
                onChange={handleGalleryChange}
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <RichTextEditor
                label="Package Description"
                value={description}
                onChange={setDescription}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Variants */}
        {activeTab === 'variants' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Package Categories</h3>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5 max-w-lg">Create base package pricing categories (e.g. AC Boat vs Non-AC Boat, Luxury vs Standard room).</p>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#0f3d56] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#1a4f6d] transition-all whitespace-nowrap"
              >
                <Plus className="h-4 w-4" /> Add Category
              </button>
            </div>

            <div className="grid gap-6">
              {variants.length === 0 ? (
                <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                  <BedDouble className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-bold">No categories configured.</p>
                  <p className="text-xs font-medium mt-1">At least one variant is required to generate the PDF and allow bookings.</p>
                </div>
              ) : (
                variants.map((variant, index) => (
                  <div key={index} className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-5 relative group shadow-sm hover:border-[#5ac4d7]/40 transition-colors">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <span className="text-xs font-black uppercase text-[#0f3d56] tracking-wider flex items-center gap-2">
                        <Layers className="h-4 w-4 text-[#5ac4d7]" />
                        Base Option #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="p-2 border border-slate-200 hover:border-red-200 bg-white text-slate-400 hover:text-red-500 rounded-xl transition-all shadow-sm flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="lg:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Category Name *</label>
                        <input
                          type="text"
                          value={variant.title}
                          onChange={(e) => updateVariant(index, 'title', e.target.value)}
                          placeholder="e.g. Non AC Boat with AC Room"
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#5ac4d7] font-semibold text-slate-800 shadow-sm"
                          required
                        />
                      </div>
                      {isStudentPackage ? (
                        <>
                          <div>
                            <label className="block text-[10px] font-bold text-amber-600 uppercase mb-1.5">🎓 Student Price (₹) *</label>
                            <input
                              type="number"
                              value={variant.student_price || ''}
                              onChange={(e) => updateVariant(index, 'student_price', e.target.value)}
                              className="w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm outline-none focus:border-amber-400 font-bold text-amber-700 shadow-sm"
                              min={0}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-amber-600 uppercase mb-1.5">Weekend Student Price (₹)</label>
                            <input
                              type="number"
                              value={variant.weekend_student_price || ''}
                              onChange={(e) => updateVariant(index, 'weekend_student_price', e.target.value)}
                              className="w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm outline-none focus:border-amber-400 font-bold text-amber-700 shadow-sm"
                              min={0}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Adult Price (₹) *</label>
                            <input
                              type="number"
                              value={variant.adult_price}
                              onChange={(e) => updateVariant(index, 'adult_price', e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#5ac4d7] font-bold text-emerald-700 shadow-sm"
                              min={0}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Child Price (₹) *</label>
                            <input
                              type="number"
                              value={variant.child_price}
                              onChange={(e) => updateVariant(index, 'child_price', e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#5ac4d7] font-bold text-emerald-700 shadow-sm"
                              min={0}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Weekend Adult Price (₹) (Optional)</label>
                            <input
                              type="number"
                              value={variant.weekend_adult_price || ''}
                              onChange={(e) => updateVariant(index, 'weekend_adult_price', e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#5ac4d7] font-bold text-emerald-700 shadow-sm"
                              min={0}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Weekend Child Price (₹) (Optional)</label>
                            <input
                              type="number"
                              value={variant.weekend_child_price || ''}
                              onChange={(e) => updateVariant(index, 'weekend_child_price', e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#5ac4d7] font-bold text-emerald-700 shadow-sm"
                              min={0}
                            />
                          </div>
                        </>
                      )}
                      <div className="lg:col-span-2 pt-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={variant.is_active}
                            onChange={(e) => updateVariant(index, 'is_active', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-[#5ac4d7] focus:ring-[#5ac4d7]"
                          />
                          <span className="text-sm font-bold text-slate-800">Option is Active and Bookable</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab Transport Options */}
        {activeTab === 'transport_options' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Transport Options</h3>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5 max-w-lg">Define the available transport choices and pricing for this package.</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => addTransportOption('SHARED')}
                  className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition-all whitespace-nowrap"
                >
                  <Plus className="h-4 w-4" /> Add Shared Transport
                </button>
                <button
                  type="button"
                  onClick={() => addTransportOption('SEPARATE_VEHICLE')}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#0f3d56] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#1a4f6d] transition-all whitespace-nowrap"
                >
                  <Plus className="h-4 w-4" /> Add Separate Vehicle
                </button>
              </div>
            </div>

            <div className="grid gap-6">
              {transportOptions.length === 0 ? (
                <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                  <Compass className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-bold">No transport options configured.</p>
                </div>
              ) : (
                transportOptions.map((opt, index) => (
                  <div key={index} className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-5 relative group shadow-sm hover:border-indigo-400/40 transition-colors">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <span className={`text-xs font-black uppercase tracking-wider flex items-center gap-2 ${opt.type === 'SHARED' ? 'text-indigo-600' : 'text-[#0f3d56]'}`}>
                        <Compass className={`h-4 w-4 ${opt.type === 'SHARED' ? 'text-indigo-400' : 'text-[#5ac4d7]'}`} />
                        {opt.type === 'SHARED' ? 'Shared Transport' : 'Separate Vehicle'}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeTransportOption(index)}
                        className="p-2 border border-slate-200 hover:border-red-200 bg-white text-slate-400 hover:text-red-500 rounded-xl transition-all shadow-sm flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="lg:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Title / Vehicle Type *</label>
                        <input
                          type="text"
                          value={opt.title}
                          onChange={(e) => updateTransportOption(index, 'title', e.target.value)}
                          placeholder={opt.type === 'SHARED' ? 'e.g. Non-AC Bus' : 'e.g. Swift Dzire (4-seater)'}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 font-semibold text-slate-800 shadow-sm"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Max Capacity *</label>
                        <input
                          type="number"
                          value={opt.capacity}
                          onChange={(e) => updateTransportOption(index, 'capacity', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 font-bold text-slate-800 shadow-sm"
                          min={1}
                          required
                        />
                      </div>

                      {opt.type === 'SHARED' ? (
                        <>
                          {isStudentPackage ? (
                            <>
                              <div>
                                <label className="block text-[10px] font-bold text-amber-600 uppercase mb-1.5">🎓 Student Price (₹) *</label>
                                <input
                                  type="number"
                                  value={opt.student_price || ''}
                                  onChange={(e) => updateTransportOption(index, 'student_price', e.target.value)}
                                  className="w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm outline-none focus:border-amber-400 font-bold text-amber-700 shadow-sm"
                                  min={0}
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-amber-600 uppercase mb-1.5">Weekend Student Price (₹)</label>
                                <input
                                  type="number"
                                  value={opt.weekend_student_price || ''}
                                  onChange={(e) => updateTransportOption(index, 'weekend_student_price', e.target.value)}
                                  className="w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm outline-none focus:border-amber-400 font-bold text-amber-700 shadow-sm"
                                  min={0}
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Adult Price (₹) *</label>
                                <input
                                  type="number"
                                  value={opt.adult_price || ''}
                                  onChange={(e) => updateTransportOption(index, 'adult_price', e.target.value)}
                                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 font-bold text-emerald-700 shadow-sm"
                                  min={0}
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Child Price (₹) *</label>
                                <input
                                  type="number"
                                  value={opt.child_price || ''}
                                  onChange={(e) => updateTransportOption(index, 'child_price', e.target.value)}
                                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 font-bold text-emerald-700 shadow-sm"
                                  min={0}
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Weekend Adult Price (₹)</label>
                                <input
                                  type="number"
                                  value={opt.weekend_adult_price || ''}
                                  onChange={(e) => updateTransportOption(index, 'weekend_adult_price', e.target.value)}
                                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 font-bold text-emerald-700 shadow-sm"
                                  min={0}
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Weekend Child Price (₹)</label>
                                <input
                                  type="number"
                                  value={opt.weekend_child_price || ''}
                                  onChange={(e) => updateTransportOption(index, 'weekend_child_price', e.target.value)}
                                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 font-bold text-emerald-700 shadow-sm"
                                  min={0}
                                />
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Fixed Price (₹) *</label>
                            <input
                              type="number"
                              value={opt.fixed_price || ''}
                              onChange={(e) => updateTransportOption(index, 'fixed_price', e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 font-bold text-emerald-700 shadow-sm"
                              min={0}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Weekend Fixed Price (₹)</label>
                            <input
                              type="number"
                              value={opt.weekend_fixed_price || ''}
                              onChange={(e) => updateTransportOption(index, 'weekend_fixed_price', e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 font-bold text-emerald-700 shadow-sm"
                              min={0}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Itinerary */}
        {activeTab === 'itinerary' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Day-Wise Itinerary</h3>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Build the travel schedule. Ensure to enter timings for accurate PDF generation.</p>
              </div>
              <button
                type="button"
                onClick={addItineraryDay}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#0f3d56] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#1a4f6d] transition-all whitespace-nowrap"
              >
                <Plus className="h-4 w-4" /> Add Stop / Day Activity
              </button>
            </div>

            <div className="grid gap-6">
              {itinerary.length === 0 ? (
                <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                  <Compass className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-bold">No itinerary points added.</p>
                </div>
              ) : (
                itinerary.map((item, index) => (
                  <div key={index} className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-5 shadow-sm relative hover:border-[#5ac4d7]/40 transition-colors">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-1 pr-3 border-r border-slate-200">
                          <button type="button" onClick={() => moveItem(itinerary, setItinerary, index, 'up')} className="p-1 hover:bg-slate-200 rounded-md text-slate-400 hover:text-slate-700 transition-colors"><ArrowUp className="h-3.5 w-3.5" /></button>
                          <button type="button" onClick={() => moveItem(itinerary, setItinerary, index, 'down')} className="p-1 hover:bg-slate-200 rounded-md text-slate-400 hover:text-slate-700 transition-colors"><ArrowDown className="h-3.5 w-3.5" /></button>
                        </div>
                        <span className="text-xs font-black uppercase text-[#0f3d56] tracking-wider">Itinerary Stop #{index + 1}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItineraryDay(index)}
                        className="p-2 border border-slate-200 hover:border-red-200 bg-white text-slate-400 hover:text-red-500 rounded-xl transition-all shadow-sm flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Day Number *</label>
                        <input
                          type="number"
                          value={item.day_number}
                          onChange={(e) => updateItineraryDay(index, 'day_number', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#5ac4d7] font-bold text-slate-800 shadow-sm"
                          min={1}
                          required
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Stop Title / Activity *</label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateItineraryDay(index, 'title', e.target.value)}
                          placeholder="e.g. Arrival at Gandi Pochamma Temple"
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#5ac4d7] font-semibold text-slate-800 shadow-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Timing (HH:MM AM/PM)</label>
                        <input
                          type="text"
                          value={item.timing || ''}
                          onChange={(e) => updateItineraryDay(index, 'timing', e.target.value)}
                          placeholder="e.g. 10:30 AM"
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#5ac4d7] font-semibold text-slate-800 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Duration</label>
                        <input
                          type="text"
                          value={item.duration_at_stop || ''}
                          onChange={(e) => updateItineraryDay(index, 'duration_at_stop', e.target.value)}
                          placeholder="e.g. 45 Mins"
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#5ac4d7] font-semibold text-slate-800 shadow-sm"
                        />
                      </div>
                      <div className="flex items-center pt-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.meal_included}
                            onChange={(e) => updateItineraryDay(index, 'meal_included', e.target.checked)}
                            className="h-5 w-5 rounded border-slate-300 text-[#5ac4d7] focus:ring-[#5ac4d7]"
                          />
                          <span className="text-sm font-bold text-slate-800">Meal Included here?</span>
                        </label>
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Description Details</label>
                        <textarea
                          value={item.description || ''}
                          onChange={(e) => updateItineraryDay(index, 'description', e.target.value)}
                          placeholder="Describe the activity..."
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#5ac4d7] font-medium text-slate-700 shadow-sm min-h-[80px]"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <ImageUpload
                          label="Location Image (Optional)"
                          value={item.image_url || ''}
                          onChange={(val) => updateItineraryDay(index, 'image_url', val)}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Highlights */}
        {activeTab === 'highlights' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Package Highlights</h3>
              </div>
              <button
                type="button"
                onClick={addHighlight}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#0f3d56] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#1a4f6d] transition-all whitespace-nowrap"
              >
                <Plus className="h-4 w-4" /> Add Highlight
              </button>
            </div>

            <div className="grid gap-3">
              {highlights.length === 0 ? (
                <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                  <Sparkles className="h-8 w-8 mx-auto mb-3 opacity-50 text-[#5ac4d7]" />
                  <p className="text-sm font-bold">No highlights added.</p>
                </div>
              ) : (
                highlights.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm hover:border-[#5ac4d7]/40 transition-colors">
                    <div className="flex flex-col gap-1 border-r border-slate-200 pr-3">
                      <button type="button" onClick={() => moveItem(highlights, setHighlights, index, 'up')} className="p-0.5 hover:bg-slate-200 rounded"><ArrowUp className="h-3 w-3 text-slate-400" /></button>
                      <button type="button" onClick={() => moveItem(highlights, setHighlights, index, 'down')} className="p-0.5 hover:bg-slate-200 rounded"><ArrowDown className="h-3 w-3 text-slate-400" /></button>
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateHighlight(index, 'title', e.target.value)}
                        placeholder="e.g. Scenic Boat Ride on River Godavari"
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-[#5ac4d7]"
                        required
                      />
                    </div>
                    <button type="button" onClick={() => removeHighlight(index)} className="p-2.5 text-slate-400 hover:text-red-500 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-red-200 transition-all"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Inclusions & Boarding */}
        {activeTab === 'inclusions' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Boarding Points */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Boarding / Reporting Points</h3>
                <button type="button" onClick={addBoardingPoint} className="flex items-center gap-1.5 rounded-lg bg-[#0f3d56] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#1a4f6d] transition-colors"><Plus className="h-3.5 w-3.5" /> Add Point</button>
              </div>
              <div className="grid gap-6">
                {boardingPoints.map((item, index) => (
                  <div key={index} className="p-5 bg-slate-50 border border-slate-200 rounded-3xl shadow-sm relative hover:border-[#5ac4d7]/40 transition-colors">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                      <span className="text-xs font-black uppercase text-[#0f3d56] tracking-wider">Boarding Point #{index + 1}</span>
                      <button type="button" onClick={() => removeBoardingPoint(index)} className="p-1.5 text-slate-400 hover:text-red-500 bg-white border border-slate-200 rounded-lg shadow-sm"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Location Title *</label>
                        <input type="text" value={item.title} onChange={(e) => updateBoardingPoint(index, 'title', e.target.value)} placeholder="e.g. Rajahmundry Boat Point" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#5ac4d7] font-semibold text-slate-800" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Reporting Time</label>
                        <input type="text" value={item.departure_time || ''} onChange={(e) => updateBoardingPoint(index, 'departure_time', e.target.value)} placeholder="e.g. 07:30 AM" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#5ac4d7] font-semibold text-slate-800" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Full Address</label>
                        <input type="text" value={item.address || ''} onChange={(e) => updateBoardingPoint(index, 'address', e.target.value)} placeholder="Physical address..." className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#5ac4d7] font-semibold text-slate-800" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Google Maps Embed URL</label>
                        <input type="text" value={item.map_url || ''} onChange={(e) => updateBoardingPoint(index, 'map_url', e.target.value)} placeholder="Paste Google Maps iframe src or share link..." className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#5ac4d7] font-semibold text-slate-800" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Landmark</label>
                        <input type="text" value={item.landmark || ''} onChange={(e) => updateBoardingPoint(index, 'landmark', e.target.value)} placeholder="e.g. Opp. SBI ATM" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#5ac4d7] font-semibold text-slate-800" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Contact Number</label>
                        <input type="text" value={item.contact_number || ''} onChange={(e) => updateBoardingPoint(index, 'contact_number', e.target.value)} placeholder="Guide/Driver contact..." className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#5ac4d7] font-semibold text-slate-800" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              {/* Inclusions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-black text-emerald-700 uppercase tracking-wider flex items-center gap-2"><Check className="h-4 w-4" /> Inclusions</h3>
                  <button type="button" onClick={addInclusion} className="p-1 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200"><Plus className="h-4 w-4" /></button>
                </div>
                {inclusions.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input type="text" value={item.label} onChange={(e) => updateInclusion(index, 'label', e.target.value)} className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium outline-none focus:border-emerald-400" required />
                    <button type="button" onClick={() => removeInclusion(index)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
              {/* Exclusions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-black text-rose-700 uppercase tracking-wider flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Exclusions</h3>
                  <button type="button" onClick={addExclusion} className="p-1 rounded bg-rose-100 text-rose-700 hover:bg-rose-200"><Plus className="h-4 w-4" /></button>
                </div>
                {exclusions.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input type="text" value={item.label} onChange={(e) => updateExclusion(index, 'label', e.target.value)} className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium outline-none focus:border-rose-400" required />
                    <button type="button" onClick={() => removeExclusion(index)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: FAQs & Policies */}
        {activeTab === 'faqs' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Policies */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Terms & Policies</h3>
                <button type="button" onClick={addPolicy} className="flex items-center gap-1.5 rounded-lg bg-[#0f3d56] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#1a4f6d] transition-colors"><Plus className="h-3.5 w-3.5" /> Add Policy</button>
              </div>
              <div className="grid gap-6">
                {policies.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                    <ShieldCheck className="h-8 w-8 mx-auto mb-3 opacity-50 text-[#5ac4d7]" />
                    <p className="text-sm font-bold">No policies configured.</p>
                  </div>
                ) : (
                  policies.map((item, index) => (
                    <div key={index} className="p-5 bg-slate-50 border border-slate-200 rounded-3xl shadow-sm relative hover:border-[#5ac4d7]/40 transition-colors">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                        <span className="text-xs font-black uppercase text-[#0f3d56] tracking-wider">Policy #{index + 1}</span>
                        <button type="button" onClick={() => removePolicy(index)} className="p-1.5 text-slate-400 hover:text-red-500 bg-white border border-slate-200 rounded-lg shadow-sm"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                      <div className="grid gap-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <PremiumSelect label="Policy Category *" value={item.type} options={POLICY_CATEGORIES} onChange={(val) => updatePolicy(index, 'type', val)} />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Policy Title *</label>
                            <input type="text" value={item.title} onChange={(e) => updatePolicy(index, 'title', e.target.value)} placeholder="e.g. 100% Refund before 48hrs" className="w-full rounded-xl border border-slate-200 px-3.5 py-3.5 text-sm outline-none focus:border-[#5ac4d7] font-semibold text-slate-800" required />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Description Details *</label>
                          <textarea value={item.description} onChange={(e) => updatePolicy(index, 'description', e.target.value)} placeholder="Detailed terms..." className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#5ac4d7] font-medium text-slate-700 min-h-[80px]" required />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* FAQs */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Frequently Asked Questions</h3>
                <button type="button" onClick={addFAQ} className="flex items-center gap-1.5 rounded-lg bg-[#0f3d56] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#1a4f6d] transition-colors"><Plus className="h-3.5 w-3.5" /> Add FAQ</button>
              </div>
              <div className="grid gap-4">
                {faqs.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                    <HelpCircle className="h-8 w-8 mx-auto mb-3 opacity-50 text-[#5ac4d7]" />
                    <p className="text-sm font-bold">No FAQs configured.</p>
                  </div>
                ) : (
                  faqs.map((item, index) => (
                    <div key={index} className="flex flex-col gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-[#5ac4d7]/40 transition-colors">
                      <div className="flex items-start gap-3">
                        <input type="text" value={item.question} onChange={(e) => updateFAQ(index, 'question', e.target.value)} placeholder="Question?" className="flex-1 rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-[#5ac4d7]" required />
                        <button type="button" onClick={() => removeFAQ(index)} className="p-2.5 text-slate-400 hover:text-red-500 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-red-200 transition-all mt-0.5"><Trash2 className="h-4 w-4" /></button>
                      </div>
                      <textarea value={item.answer} onChange={(e) => updateFAQ(index, 'answer', e.target.value)} placeholder="Answer..." className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-[#5ac4d7] min-h-[60px]" required />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: SEO */}
        {activeTab === 'seo' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-4">Search Engine Optimization</h3>
            <div className="grid gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Meta Title</label>
                <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#5ac4d7] font-semibold text-slate-800 shadow-sm" placeholder="e.g. Best Papikondalu Premium Tour - Book Now" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Meta Description</label>
                <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#5ac4d7] font-medium text-slate-700 shadow-sm min-h-[100px]" placeholder="Brief description for search results..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Canonical URL</label>
                <input type="text" value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#5ac4d7] font-semibold text-slate-800 shadow-sm" placeholder="e.g. https://www.tsboattourism.org/packages/papikondalu-tour" />
              </div>
              <div className="pt-2">
                <ImageUpload label="Open Graph (Social Share) Image" value={ogImageUrl} onChange={setOgImageUrl} />
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
