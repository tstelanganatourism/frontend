'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  ArrowLeft,
  Info,
  Globe,
  Plus,
  Trash2,
  ListPlus,
  ArrowUp,
  ArrowDown,
  Layout,
  HelpCircle,
  ShieldCheck,
  Percent,
  BedDouble,
  ChevronDown,
  Image as ImageIcon
} from 'lucide-react';
import dynamic from 'next/dynamic';
import ImageUpload from '@/components/ui/ImageUpload';
const RichTextEditor = dynamic(() => import('@/components/ui/RichTextEditor'), { ssr: false });
import { toast } from 'sonner';

interface CustomSelectProps {
  label: string;
  labelClassName?: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (val: string) => void;
  bgClass?: string;
  paddingClass?: string;
}

export function CustomSelect({
  label,
  labelClassName = "block text-[10px] font-bold text-slate-400 uppercase mb-1",
  value,
  options,
  onChange,
  bgClass = "bg-white",
  paddingClass = "px-3.5 py-2.5"
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className="relative">
      <label className={labelClassName}>{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between rounded-xl border border-slate-200 ${bgClass} ${paddingClass} text-xs font-bold text-slate-700 cursor-pointer shadow-sm hover:border-slate-350 transition-all outline-none`}
      >
        <span>{selectedOption?.label || value}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-45 cursor-default" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 mt-1.5 z-50 rounded-xl border border-slate-150 bg-white p-1.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-black cursor-pointer transition-all ${opt.value === value
                    ? 'bg-[#5ac4d7]/10 text-[#0f3d56]'
                    : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface RoomFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

const PRESET_FACILITIES = [
  'Free WiFi',
  'Television',
  'Air Conditioning',
  'Geyser/Hot Water',
  'Room Service',
  'Parking Area',
  'Attached Bathroom',
];

const POLICY_CATEGORIES = [
  { value: 'CANCELLATION', label: 'Cancellation & Refund' },
  { value: 'REFUND', label: 'Security Deposit & Refund' },
  { value: 'CHILD_POLICY', label: 'Child & Extra Bed Policy' },
  { value: 'CHECK_IN_OUT', label: 'Check-in/Check-out Timing & Rules' },
  { value: 'PETS', label: 'Pets Policy' },
  { value: 'SMOKING', label: 'Smoking / Alcohol Policy' },
  { value: 'STAY_RULES', label: 'Stay Rules' },
  { value: 'OTHER', label: 'General / House Rules' }
];

const timeToInputFormat = (timeStr: string) => {
  if (!timeStr) return '';
  return timeStr.slice(0, 5); // Take "HH:MM" from "HH:MM:SS"
};

const handleTimeInputChange = (val: string, setter: (v: string) => void) => {
  if (!val) {
    setter('00:00:00');
    return;
  }
  setter(val + ':00'); // Add seconds for backend compatibility
};

export default function RoomForm({ initialData, onSubmit, isLoading }: RoomFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('basic');

  // Basic Fields
  const [lodgeName, setLodgeName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [facilities, setFacilities] = useState<string[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [totalRooms, setTotalRooms] = useState(1);
  const [slotStart, setSlotStart] = useState('12:00:00');
  const [slotEnd, setSlotEnd] = useState('11:00:00');
  const [bookingSlots, setBookingSlots] = useState<any[]>([]);
  const [orderPriority, setOrderPriority] = useState(0);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [status, setStatus] = useState('DRAFT');

  // SEO Fields
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [ogImageUrl, setOgImageUrl] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');

  // Collections States (Nested child relations)
  const [variants, setVariants] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);

  useEffect(() => {
    if (initialData) {
      setLodgeName(initialData.lodge_name || '');
      setSlug(initialData.slug || '');
      setDescription(initialData.description || '');
      setAddress(initialData.address || '');
      setMapUrl(initialData.map_url || '');
      setFacilities(initialData.facilities || []);
      setCoverImageUrl(initialData.cover_image_url || '');
      setTotalRooms(initialData.total_rooms || 1);
      setSlotStart(initialData.slot_start || '12:00:00');
      setSlotEnd(initialData.slot_end || '11:00:00');
      setBookingSlots(initialData.booking_slots || []);
      setOrderPriority(initialData.order_priority || 0);
      setIsFeatured(initialData.is_featured || false);
      setIsActive(initialData.is_active !== false);
      setStatus(initialData.status || 'DRAFT');

      setMetaTitle(initialData.meta_title || '');
      setMetaDescription(initialData.meta_description || '');
      setOgImageUrl(initialData.og_image_url || '');
      setCanonicalUrl(initialData.canonical_url || '');

      setVariants(initialData.variants || []);
      setGallery(initialData.gallery || []);
      setHighlights(initialData.highlights || []);
      setFaqs(initialData.faqs || []);
      setPolicies(initialData.policies || []);
    }
  }, [initialData]);

  // Dynamic SEO Auto-Generation when creating a new stay
  const lastGeneratedMetaTitleRef = useRef('');
  const lastGeneratedMetaDescRef = useRef('');
  const lastGeneratedCanonicalRef = useRef('');
  const lastGeneratedOgImgRef = useRef('');

  useEffect(() => {
    if (!initialData) {
      // 1. Auto-generate Meta Title
      const expectedTitle = lodgeName.trim() ? `${lodgeName.trim()} | Premium Stay Booking` : '';
      if (!metaTitle || metaTitle === lastGeneratedMetaTitleRef.current) {
        setMetaTitle(expectedTitle);
        lastGeneratedMetaTitleRef.current = expectedTitle;
      }

      // 2. Auto-generate Meta Description
      const cleanAddress = address.trim() ? ` at ${address.trim()}` : '';
      const expectedDesc = lodgeName.trim()
        ? `Book premium rooms and luxury cottages at ${lodgeName.trim()}${cleanAddress}. Enjoy premium facilities, modern amenities, and local dining at best rates.`
        : '';
      if (!metaDescription || metaDescription === lastGeneratedMetaDescRef.current) {
        setMetaDescription(expectedDesc);
        lastGeneratedMetaDescRef.current = expectedDesc;
      }

      // 3. Auto-generate Canonical URL
      const computedSlug = slug.trim() || lodgeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const expectedCanonical = computedSlug
        ? `https://www.tsboattourism.org/stays/${computedSlug}`
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
  }, [lodgeName, slug, address, coverImageUrl, initialData, metaTitle, metaDescription, canonicalUrl, ogImageUrl]);

  const toggleFacility = (facility: string) => {
    setFacilities(prev =>
      prev.includes(facility)
        ? prev.filter(f => f !== facility)
        : [...prev, facility]
    );
  };

  // Reordering helpers (for sorting in place)
  const moveItem = (list: any[], setList: (l: any[]) => void, index: number, direction: 'up' | 'down') => {
    const newList = [...list];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newList.length) return;

    // Swap items
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;

    // Rescale sort_order fields
    const rescaledList = newList.map((item, idx) => ({
      ...item,
      sort_order: idx + 1
    }));

    setList(rescaledList);
  };

  // Variants management
  const addVariant = () => {
    setVariants(prev => [
      ...prev,
      { variant_name: '', weekday_price: 1500, weekend_price: 2000, capacity_per_room: 2, total_rooms: 5, is_active: true }
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

  // Gallery management
  const addGalleryImage = () => {
    setGallery(prev => [
      ...prev,
      { image_url: '', alt_text: '', is_cover: false, sort_order: prev.length + 1 }
    ]);
  };
  const updateGalleryImage = (index: number, key: string, value: any) => {
    setGallery(prev => {
      const updated = [...prev];
      if (key === 'is_cover' && value === true) {
        // Enforce single cover image
        return updated.map((item, idx) => ({
          ...item,
          is_cover: idx === index
        }));
      }
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };
  const removeGalleryImage = (index: number) => {
    setGallery(prev => prev.filter((_, idx) => idx !== index).map((item, idx) => ({ ...item, sort_order: idx + 1 })));
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

  // FAQs management
  const addFAQ = () => {
    setFaqs(prev => [
      ...prev,
      { question: '', answer: '', sort_order: prev.length + 1 }
    ]);
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
    setPolicies(prev => [
      ...prev,
      { type: 'CANCELLATION', title: '', description: '', sort_order: prev.length + 1 }
    ]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lodgeName.trim()) {
      toast.error('Lodge name is required');
      return;
    }

    const payload = {
      lodge_name: lodgeName,
      slug: slug.trim() || undefined,
      description,
      address: address || null,
      map_url: mapUrl || null,
      facilities,
      cover_image_url: coverImageUrl || null,
      total_rooms: Number(totalRooms),
      slot_start: slotStart,
      slot_end: slotEnd,
      booking_slots: bookingSlots,
      order_priority: Number(orderPriority),
      is_featured: isFeatured,
      is_active: isActive,
      status,
      meta_title: metaTitle || null,
      meta_description: metaDescription || null,
      og_image_url: ogImageUrl || null,
      canonical_url: canonicalUrl || null,

      // Relations
      variants: variants.map(v => ({
        ...v,
        weekday_price: Number(v.weekday_price),
        weekend_price: Number(v.weekend_price),
        capacity_per_room: Number(v.capacity_per_room),
          total_rooms: Number(v.total_rooms) || 0
      })),
      gallery,
      highlights,
      faqs,
      policies
    };

    try {
      await onSubmit(payload);
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Info },
    { id: 'variants', label: 'Room Variants', icon: BedDouble },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'highlights', label: 'Highlights', icon: Layout },
    { id: 'faqs', label: 'FAQs & Policies', icon: ShieldCheck },
    { id: 'seo', label: 'Google & Share Settings', icon: Globe },
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    // Allow enter on textareas
    if ((e.target as HTMLElement).tagName.toLowerCase() === 'textarea') {
      return;
    }
    // Prevent form submission on enter
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-8">

      {/* Action Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/rooms')}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-55 text-slate-600 cursor-pointer transition-all shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 leading-tight">
              {initialData ? `${lodgeName}` : 'Create Stays & Rooms'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">Configure property features, room capacities, variants, and booking rules.</p>
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg cursor-pointer transition-all hover:-translate-y-1 hover:bg-slate-800 disabled:opacity-50"
        >
          {isLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Stay / Room
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-6 py-4 text-xs font-black uppercase tracking-wider cursor-pointer transition-all -mb-[2px] whitespace-nowrap ${activeTab === tab.id
                  ? 'border-[#5ac4d7] text-[#5ac4d7]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active Tab Panel */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

        {/* Tab 1: Basic Info */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lodge Name *</label>
                <input
                  type="text"
                  value={lodgeName}
                  onChange={(e) => setLodgeName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#5ac4d7] transition-all"
                  placeholder="e.g. River Edge Holiday Resort"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Link Name / Page Address (Auto-created if left blank)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#5ac4d7] transition-all"
                  placeholder="e.g. river-edge-lodge"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Rooms Capacity</label>
                <input
                  type="number"
                  value={totalRooms}
                  onChange={(e) => setTotalRooms(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#5ac4d7] transition-all"
                  min={1}
                />
              </div>
              <div>
                <CustomSelect
                  label="Publish Status"
                  labelClassName="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
                  value={status}
                  options={[
                    { value: 'DRAFT', label: 'Draft' },
                    { value: 'PUBLISHED', label: 'Published' },
                    { value: 'ARCHIVED', label: 'Archived' }
                  ]}
                  onChange={setStatus}
                  bgClass="bg-slate-50"
                  paddingClass="px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Check-in Slot Start</label>
                <input
                  type="time"
                  value={timeToInputFormat(slotStart)}
                  onChange={(e) => handleTimeInputChange(e.target.value, setSlotStart)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#5ac4d7] transition-all font-semibold text-slate-700"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Check-out Slot End</label>
                <input
                  type="time"
                  value={timeToInputFormat(slotEnd)}
                  onChange={(e) => handleTimeInputChange(e.target.value, setSlotEnd)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#5ac4d7] transition-all font-semibold text-slate-700"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Physical Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#5ac4d7] transition-all text-slate-700 font-semibold"
                  placeholder="Enter full physical address..."
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Google Maps Embed Link / Share URL</label>
                <input
                  type="text"
                  value={mapUrl}
                  onChange={(e) => setMapUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#5ac4d7] transition-all text-slate-700 font-semibold"
                  placeholder="Paste Google Maps embed code iframe, share link, or coordinates URL..."
                />
                <p className="text-[10px] text-slate-400 font-semibold mt-1">You can copy embed iframe code directly from Google Maps Share menu or paste a normal maps link. We automatically parse it!</p>
              </div>
            </div>

            {/* Custom Dynamic Booking Slots (Many Slots) */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Many Time Slots for Reservation</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Add multiple checkout sessions (e.g. Day Session, 24 Hours Stay) available for room reservations.</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setBookingSlots([...bookingSlots, { title: '', slot_start: '12:00:00', slot_end: '11:00:00' }]);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-black text-white cursor-pointer shadow-sm uppercase tracking-wider transition-all"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Reservation Slot
                </button>
              </div>

              {bookingSlots.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <p className="text-xs font-semibold text-slate-400">No custom reservation slots configured. Room defaults to the primary check-in slot above.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {bookingSlots.map((slot, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                      <div className="grid gap-4 sm:grid-cols-3 flex-1">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Slot Name / Title *</label>
                          <input
                            type="text"
                            value={slot.title}
                            onChange={(e) => {
                              const copy = [...bookingSlots];
                              copy[index].title = e.target.value;
                              setBookingSlots(copy);
                            }}
                            placeholder="e.g. Night Stay (6 PM - 8 AM)"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold outline-none focus:border-[#5ac4d7] text-slate-700"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Start Time *</label>
                          <input
                            type="time"
                            value={timeToInputFormat(slot.slot_start)}
                            onChange={(e) => {
                              const copy = [...bookingSlots];
                              copy[index].slot_start = e.target.value ? (e.target.value + ':00') : '12:00:00';
                              setBookingSlots(copy);
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-[#5ac4d7] text-slate-700"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">End Time *</label>
                          <input
                            type="time"
                            value={timeToInputFormat(slot.slot_end)}
                            onChange={(e) => {
                              const copy = [...bookingSlots];
                              copy[index].slot_end = e.target.value ? (e.target.value + ':00') : '11:00:00';
                              setBookingSlots(copy);
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-[#5ac4d7] text-slate-700"
                            required
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setBookingSlots(bookingSlots.filter((_, idx) => idx !== index));
                        }}
                        className="p-2.5 border border-slate-200 hover:border-red-200 bg-white rounded-xl text-slate-400 hover:text-red-500 shrink-0 mt-5 shadow-sm transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Presets Facilities */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Lodge Facilities</label>
              <div className="flex flex-wrap gap-3">
                {PRESET_FACILITIES.map((facility) => {
                  const selected = facilities.includes(facility);
                  return (
                    <button
                      key={facility}
                      type="button"
                      onClick={() => toggleFacility(facility)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${selected
                          ? 'bg-[#5ac4d7]/10 text-slate-900 border-[#5ac4d7]'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      {facility}
                    </button>
                  );
                })}
              </div>
            </div>

            <ImageUpload
              label="Cover Image"
              value={coverImageUrl}
              onChange={setCoverImageUrl}
            />

            <RichTextEditor
              label="Lodge Description"
              value={description}
              onChange={setDescription}
            />

            {/* Switches */}
            <div className="flex flex-wrap gap-8 pt-4 border-t border-slate-100">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-slate-300 text-[#5ac4d7] focus:ring-[#5ac4d7]"
                />
                <span className="text-sm font-semibold text-slate-700">Feature this property on homepage</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-slate-300 text-[#5ac4d7] focus:ring-[#5ac4d7]"
                />
                <span className="text-sm font-semibold text-slate-700">Available for public bookings</span>
              </label>
            </div>
          </div>
        )}

        {/* Tab 2: Room Variants */}
        {activeTab === 'variants' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Room Variants</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Define room typologies, such as A/C Deluxe Rooms, Luxury Suites, or Non-A/C Cottages.</p>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 cursor-pointer transition-all"
              >
                <Plus className="h-4 w-4" /> Add Room Variant
              </button>
            </div>

            <div className="grid gap-6">
              {variants.length === 0 ? (
                <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">
                  <p className="text-xs font-bold">No variants configured. A/C & Non-A/C rates must be specified for user booking.</p>
                </div>
              ) : (
                variants.map((variant, index) => (
                  <div key={index} className="p-6 bg-slate-55 border border-slate-250/60 rounded-3xl space-y-4 relative group">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="text-xs font-black uppercase text-[#0f3d56] tracking-wider">Room Category #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="p-2 border border-slate-200 hover:border-red-200 bg-white text-slate-400 hover:text-red-500 rounded-xl transition-all shadow-sm flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete Variant
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-4">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Variant Name *</label>
                        <input
                          type="text"
                          value={variant.variant_name}
                          onChange={(e) => updateVariant(index, 'variant_name', e.target.value)}
                          placeholder="e.g. Luxury AC Suite"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs outline-none focus:border-[#5ac4d7] font-semibold text-slate-700"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Rooms of this type</label>
                        <input
                          type="number"
                          value={variant.total_rooms ?? 0}
                          onChange={(e) => updateVariant(index, 'total_rooms', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs outline-none focus:border-[#5ac4d7] font-semibold text-slate-700"
                          min={0}
                          placeholder="e.g. 5"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Capacity Per Room</label>
                        <input
                          type="number"
                          value={variant.capacity_per_room}
                          onChange={(e) => updateVariant(index, 'capacity_per_room', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs outline-none focus:border-[#5ac4d7] font-semibold text-slate-700"
                          min={1}
                        />
                      </div>
                      <div>
                        <CustomSelect
                          label="Active Status"
                          value={variant.is_active ? 'true' : 'false'}
                          options={[
                            { value: 'true', label: 'Active' },
                            { value: 'false', label: 'Inactive' }
                          ]}
                          onChange={(val) => updateVariant(index, 'is_active', val === 'true')}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Weekday Fare Rate (₹)</label>
                        <input
                          type="number"
                          value={variant.weekday_price}
                          onChange={(e) => updateVariant(index, 'weekday_price', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs outline-none focus:border-[#5ac4d7] font-semibold text-slate-700"
                          min={0}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Weekend Fare Rate (₹)</label>
                        <input
                          type="number"
                          value={variant.weekend_price}
                          onChange={(e) => updateVariant(index, 'weekend_price', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs outline-none focus:border-[#5ac4d7] font-semibold text-slate-700"
                          min={0}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Gallery */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Stay Gallery Images</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Upload high-res stay gallery photos for carousels and room selection sliders.</p>
              </div>
              <button
                type="button"
                onClick={addGalleryImage}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-all"
              >
                <Plus className="h-4 w-4" /> Add Gallery Photo
              </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {gallery.length === 0 ? (
                <div className="sm:col-span-2 text-center py-10 text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">
                  <p className="text-xs font-bold">No gallery photos uploaded yet.</p>
                </div>
              ) : (
                gallery.map((img, index) => (
                  <div key={index} className="p-6 bg-slate-55 border border-slate-250/60 rounded-3xl space-y-4 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Photo #{index + 1}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveItem(gallery, setGallery, index, 'up')}
                          className="p-1.5 text-slate-400 hover:text-slate-900 disabled:opacity-30 rounded hover:bg-slate-200"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={index === gallery.length - 1}
                          onClick={() => moveItem(gallery, setGallery, index, 'down')}
                          className="p-1.5 text-slate-400 hover:text-slate-900 disabled:opacity-30 rounded hover:bg-slate-200"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          className="p-1.5 text-red-400 hover:text-red-600 rounded hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <ImageUpload
                      label="Upload Image File"
                      value={img.image_url}
                      onChange={(val) => updateGalleryImage(index, 'image_url', val)}
                    />

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Image Alt Text (SEO)</label>
                      <input
                        type="text"
                        value={img.alt_text || ''}
                        onChange={(e) => updateGalleryImage(index, 'alt_text', e.target.value)}
                        placeholder="e.g. Deluxe Room bed and view"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs outline-none focus:border-[#5ac4d7] font-semibold text-slate-700"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={img.is_cover}
                        onChange={(e) => updateGalleryImage(index, 'is_cover', e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-[#5ac4d7] focus:ring-[#5ac4d7]"
                      />
                      <span className="text-xs font-bold text-slate-600">Mark as gallery primary cover</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Highlights */}
        {activeTab === 'highlights' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Stay Highlights</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">List premium amenities, such as swimming pool access, boat cruise pickup, or riverside dining.</p>
              </div>
              <button
                type="button"
                onClick={addHighlight}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-all"
              >
                <Plus className="h-4 w-4" /> Add Highlight
              </button>
            </div>

            <div className="grid gap-4">
              {highlights.length === 0 ? (
                <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">
                  <p className="text-xs font-bold">No stay highlights created.</p>
                </div>
              ) : (
                highlights.map((hl, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-slate-55 border border-slate-200 rounded-2xl">
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveItem(highlights, setHighlights, index, 'up')}
                        className="p-0.5 text-slate-400 hover:text-slate-900 disabled:opacity-30"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === highlights.length - 1}
                        onClick={() => moveItem(highlights, setHighlights, index, 'down')}
                        className="p-0.5 text-slate-400 hover:text-slate-900 disabled:opacity-30"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex-1 grid gap-3 sm:grid-cols-2">
                      <input
                        type="text"
                        value={hl.title}
                        onChange={(e) => updateHighlight(index, 'title', e.target.value)}
                        placeholder="e.g. Free Riverside Breakfast"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs outline-none focus:border-[#5ac4d7] font-semibold text-slate-700"
                        required
                      />
                      <input
                        type="text"
                        value={hl.icon}
                        onChange={(e) => updateHighlight(index, 'icon', e.target.value)}
                        placeholder="Lucide Icon (e.g. Coffee)"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs outline-none focus:border-[#5ac4d7] font-semibold text-slate-700"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeHighlight(index)}
                      className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 5: FAQs & Policies */}
        {activeTab === 'faqs' && (
          <div className="space-y-8">

            {/* FAQs Block */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Stay & Booking FAQs</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Answer common queries like Check-in rules, Extra beds, or power backup facilities.</p>
                </div>
                <button
                  type="button"
                  onClick={addFAQ}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-all"
                >
                  <Plus className="h-4 w-4" /> Add FAQ
                </button>
              </div>

              <div className="grid gap-6">
                {faqs.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">
                    <p className="text-xs font-bold">No stay FAQs created yet.</p>
                  </div>
                ) : (
                  faqs.map((faq, index) => (
                    <div key={index} className="p-6 bg-slate-55 border border-slate-200 rounded-3xl relative group space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-wider">FAQ #{index + 1}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveItem(faqs, setFaqs, index, 'up')}
                            className="p-1 text-slate-400 hover:text-slate-900 disabled:opacity-30"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            disabled={index === faqs.length - 1}
                            onClick={() => moveItem(faqs, setFaqs, index, 'down')}
                            className="p-1 text-slate-400 hover:text-slate-900 disabled:opacity-30"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFAQ(index)}
                            className="p-1 text-red-400 hover:text-red-650"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                          placeholder="Question Title (e.g. Is hot water available in rooms 24/7?)"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs outline-none focus:border-[#5ac4d7] font-bold text-slate-800"
                          required
                        />
                        <textarea
                          value={faq.answer}
                          onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                          placeholder="Provide a detailed, helpful answer..."
                          rows={3}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs outline-none focus:border-[#5ac4d7] font-semibold text-slate-600"
                          required
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Policies Block */}
            <div className="space-y-6 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Stay Policies</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Enforce legal constraints, cancellations, child fare details or general stay rules.</p>
                </div>
                <button
                  type="button"
                  onClick={addPolicy}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-all"
                >
                  <Plus className="h-4 w-4" /> Add Policy
                </button>
              </div>

              <div className="grid gap-6">
                {policies.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">
                    <p className="text-xs font-bold">No stay policies configured.</p>
                  </div>
                ) : (
                  policies.map((policy, index) => (
                    <div key={index} className="p-6 bg-slate-55 border border-slate-200 rounded-3xl relative group space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Policy #{index + 1}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveItem(policies, setPolicies, index, 'up')}
                            className="p-1 text-slate-400 hover:text-slate-900 disabled:opacity-30"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            disabled={index === policies.length - 1}
                            onClick={() => moveItem(policies, setPolicies, index, 'down')}
                            className="p-1 text-slate-400 hover:text-slate-900 disabled:opacity-30"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removePolicy(index)}
                            className="p-1 text-red-400 hover:text-red-650"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <CustomSelect
                            label="Policy Category"
                            value={policy.type}
                            options={POLICY_CATEGORIES}
                            onChange={(val) => updatePolicy(index, 'type', val)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Policy Header Title *</label>
                          <input
                            type="text"
                            value={policy.title}
                            onChange={(e) => updatePolicy(index, 'title', e.target.value)}
                            placeholder="e.g. Standard Cancellation Policy"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs outline-none focus:border-[#5ac4d7] font-bold text-slate-800"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Detailed Policy Terms *</label>
                        <textarea
                          value={policy.description}
                          onChange={(e) => updatePolicy(index, 'description', e.target.value)}
                          placeholder="Provide full legal/operational details..."
                          rows={4}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs outline-none focus:border-[#5ac4d7] font-semibold text-slate-600"
                          required
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* Tab 6: Google & Share Settings */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Google Search Title (What shows on Google Search)</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#5ac4d7] transition-all"
                placeholder="e.g. Best Luxury River Edge Lodge | Bhadrachalam Tours"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Google Search Description (A short summary visible on Google search results)</label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#5ac4d7] transition-all"
                placeholder="e.g. Book luxury ac rooms at River Edge Holiday Resort. Enjoy standard facilities, free wifi, geyser, and delicious local food at best prices."
              />
            </div>
            <ImageUpload
              label="WhatsApp & Social Media Share Image (Image that shows when you share the link)"
              value={ogImageUrl}
              onChange={setOgImageUrl}
            />
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Preferred Website Page Link (Leave blank for default page link)</label>
              <input
                type="url"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#5ac4d7] transition-all"
                placeholder="https://tstours.com/rooms/river-edge-lodge"
              />
            </div>
          </div>
        )}

      </div>
    </form>
  );
}
