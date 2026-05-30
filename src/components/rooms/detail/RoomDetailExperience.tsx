'use client';

import Image from 'next/image';
import Link from 'next/link';
import { getHdImageUrl } from '@/lib/utils';
import { useLightbox } from '@/hooks/useLightbox';
import type { ReactNode } from 'react';
import { useMemo, useState, useEffect, useRef } from 'react';
import PremiumSelect from '@/components/ui/PremiumSelect';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { apiClient } from '@/lib/api';
import { useRazorpay } from "react-razorpay";
import CheckoutPassengerModal from '@/components/checkout/CheckoutPassengerModal';
import { ReconnectingEventSource } from '@/lib/ReconnectingEventSource';

import { toast } from 'sonner';
import {
  Sheet, SheetContent, SheetDescription,
  SheetHeader, SheetTitle, SheetTrigger
} from '@/components/ui/sheet';
import {
  ArrowLeft,
  BadgeCheck,
  BedDouble,
  CalendarDays,
  Camera,
  ChevronRight,
  Clock,
  HelpCircle,
  IndianRupee,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wifi,
  X,
  ChevronLeft,
  Info,
  Calendar,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Loader2
} from 'lucide-react';

type RoomVariant = {
  id: number;
  variant_name: string;
  weekday_price: number;
  weekend_price: number;
  capacity_per_room?: number;
};

type GalleryImage = { id: number; image_url: string; alt_text?: string | null; is_cover: boolean };
type RoomPolicy = { id: number; type: string; title: string; description: string; sort_order: number };
type RoomFAQ = { id: number; question: string; answer: string; sort_order: number };
type RoomBookingSlot = { title: string; slot_start: string; slot_end: string };

export type RoomDetailViewModel = {
  id: number;
  slug: string;
  lodge_name: string;
  description?: string | null;
  address?: string | null;
  cover_image_url?: string | null;
  map_url?: string | null;
  is_featured: boolean;
  starting_price?: number | null;
  total_rooms?: number | null;
  slot_start?: string | null;
  slot_end?: string | null;
  booking_slots?: RoomBookingSlot[];
  facilities: string[];
  variants: RoomVariant[];
  gallery: GalleryImage[];
  highlights: Array<{ id: number; title: string; icon?: string | null; sort_order: number }>;
  faqs: RoomFAQ[];
  policies: RoomPolicy[];
};

interface RoomDetailExperienceProps {
  room: RoomDetailViewModel;
}

const fallbackImage =
  'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778912237/slider7_fainya.jpg';

const getLocalToday = () => {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const money = (value?: number | null) => {
  if (value === null || value === undefined) return 'Contact';
  const numeric = Number(value);
  return `₹${numeric.toLocaleString('en-IN')}`;
};

const cleanTime = (value?: string | null) => {
  if (!value) return 'Confirm';
  const [hour = '0', minute = '0'] = value.split(':');
  const date = new Date();
  date.setHours(Number(hour), Number(minute), 0, 0);
  return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
};

const toLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getStayPriceDetails = (
  arrivalStr: string,
  departureStr: string,
  weekdayPrice: number,
  weekendPrice: number
) => {
  if (!arrivalStr || !departureStr) {
    return { totalPrice: 0, nightsCount: 0, breakdown: [] };
  }

  const arrival = new Date(`${arrivalStr}T00:00:00`);
  let departure = new Date(`${departureStr}T00:00:00`);

  if (departure < arrival) {
    return { totalPrice: 0, nightsCount: 0, breakdown: [] };
  }

  // If arrival and departure are the same date, treat it as 1 day/night
  if (departure.getTime() === arrival.getTime()) {
    departure.setDate(departure.getDate() + 1);
  }

  let total = 0;
  let nightsCount = 0;
  const breakdown = [];

  const current = new Date(arrival);
  while (current < departure) {
    const dayOfWeek = current.getDay();
    // Saturday (6) and Sunday (0) are considered weekend nights
    const isWeekend = dayOfWeek === 6 || dayOfWeek === 0;
    const nightPrice = isWeekend ? weekendPrice : weekdayPrice;

    total += nightPrice;
    nightsCount++;

    breakdown.push({
      dateStr: toLocalDateString(current),
      isWeekend,
      price: nightPrice
    });

    current.setDate(current.getDate() + 1);
  }

  return { totalPrice: total, nightsCount: Math.max(nightsCount, 1), breakdown };
};

const formatPolicyType = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const getMapEmbedUrl = (rawUrl?: string | null, address?: string | null, lodgeName?: string) => {
  if (rawUrl) {
    if (rawUrl.includes('<iframe')) {
      const match = rawUrl.match(/src="([^"]+)"/);
      if (match?.[1]) return match[1];
    }
    if (rawUrl.includes('google.com/maps/embed') || rawUrl.includes('maps.google.com/maps?')) return rawUrl;
    const coordMatch = rawUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch?.[1] && coordMatch?.[2]) {
      return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&z=15&output=embed`;
    }
  }

  const querySource = address || lodgeName;
  return querySource ? `https://maps.google.com/maps?q=${encodeURIComponent(querySource)}&z=15&output=embed` : '';
};

export const RoomDetailExperience = ({ room }: RoomDetailExperienceProps) => {
  const validVariants = useMemo(
    () => room.variants.filter((variant) => variant.variant_name?.trim() && Number(variant.weekday_price) > 0),
    [room.variants]
  );
  const today = getLocalToday();

  const slides = useMemo(() => {
    const gallery = [...room.gallery].sort((a, b) => Number(b.is_cover) - Number(a.is_cover));
    if (room.cover_image_url && !gallery.some((image) => image.image_url === room.cover_image_url)) {
      gallery.unshift({ id: -room.id, image_url: room.cover_image_url, alt_text: room.lodge_name, is_cover: true });
    }
    return gallery.length ? gallery : [{ id: -1, image_url: fallbackImage, alt_text: room.lodge_name, is_cover: true }];
  }, [room.cover_image_url, room.gallery, room.id, room.lodge_name]);

  const [activeSlide, setActiveSlide] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(() => validVariants[0]?.id ?? null);
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [guests, setGuests] = useState(2);
  const slots = useMemo(() => {
    const combined = [];
    if (room.slot_start && room.slot_end) {
      combined.push({ title: 'Standard stay', slot_start: room.slot_start, slot_end: room.slot_end });
    }
    if (room.booking_slots && Array.isArray(room.booking_slots)) {
      for (const bs of room.booking_slots) {
        if (!combined.find(s => s.slot_start === bs.slot_start && s.slot_end === bs.slot_end)) {
          combined.push(bs);
        }
      }
    }
    if (combined.length === 0) {
      combined.push({ title: 'Standard stay', slot_start: '12:00', slot_end: '11:00' });
    }
    return combined;
  }, [room.slot_start, room.slot_end, room.booking_slots]);

  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);

  // Realtime check to bypass Next.js static page cache if lodge was turned inactive
  const [isLodgeInactive, setIsLodgeInactive] = useState(false);
  const [isCheckingActive, setIsCheckingActive] = useState(true);

  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const isAgent = user?.role === 'AGENT';
  const { Razorpay } = useRazorpay();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [customPayAmount, setCustomPayAmount] = useState<string>(''); // '' = full, else rupee amount

  // Proactively fetch latest agent profile/commission to prevent stale session calculations
  useEffect(() => {
    if (isAuthenticated && isAgent) {
      apiClient.get('/api/v1/auth/me')
        .then((res) => {
          useAuthStore.getState().updateUser(res.data);
        })
        .catch(() => {});
    }
  }, [isAuthenticated, isAgent]);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount_amount: number;
    discounted_subtotal: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  // Room availability state — controls which calendar dates are selectable
  const [roomAvailability, setRoomAvailability] = useState<Record<string, Set<string>>>({}); // month -> set of open dates
  const [detailedAvailability, setDetailedAvailability] = useState<Record<string, Record<number, Record<string, number>>>>({}); // date -> variant_id -> slotKey -> available_rooms
  const [roomAvailLoading, setRoomAvailLoading] = useState(false);

  const fetchRoomAvailability = async (monthStr: string) => {
    // Skip if already fetched for this month
    if (roomAvailability[monthStr] !== undefined) return;
    setRoomAvailLoading(true);
    try {
      const res = await apiClient.get(`/api/v1/rooms/${room.slug}/availability`, { params: { month: monthStr } });
      const dates: Array<{ date: string; status: string; variant_id: number; available_rooms: number; slot_start: string; slot_end: string; is_closed?: boolean }> = res.data?.dates || [];

      const openDates = new Set<string>();
      const newDetailed: Record<string, Record<number, Record<string, number>>> = {};

      for (const d of dates) {
        if (d.status === 'OPEN') openDates.add(d.date);
        if (!newDetailed[d.date]) newDetailed[d.date] = {};
        if (!newDetailed[d.date][d.variant_id]) newDetailed[d.date][d.variant_id] = {};
        
        const sStart = d.slot_start?.slice(0, 5) || "12:00";
        const sEnd = d.slot_end?.slice(0, 5) || "11:00";
        const slotKey = `${sStart}-${sEnd}`;
        
        newDetailed[d.date][d.variant_id][slotKey] = d.is_closed ? 0 : d.available_rooms;
      }

      setRoomAvailability(prev => ({ ...prev, [monthStr]: openDates }));
      setDetailedAvailability(prev => {
        const next = { ...prev };
        for (const dateStr in newDetailed) {
          next[dateStr] = { ...(next[dateStr] || {}), ...newDetailed[dateStr] };
        }
        return next;
      });
    } catch {
      // On error, set empty so calendar disables all dates
      setRoomAvailability(prev => ({ ...prev, [monthStr]: new Set<string>() }));
    } finally {
      setRoomAvailLoading(false);
    }
  };

  // Fetch availability for current month on mount
  useEffect(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    fetchRoomAvailability(currentMonth);
    // Also fetch next month
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonth = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
    fetchRoomAvailability(nextMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.slug]);

  // Combine all available dates across fetched months into one Set for the pickers
  const allAvailableDates = useMemo(() => {
    const combined = new Set<string>();
    for (const dates of Object.values(roomAvailability)) {
      for (const d of dates) combined.add(d);
    }
    return combined;
  }, [roomAvailability]);

  // SSE connection for real-time inventory updates
  const sseVersionRef = useRef<number>(0);
  // Stable ref to fetchRoomAvailability to avoid stale closures inside the SSE effect
  const fetchRoomAvailabilityRef = useRef(fetchRoomAvailability);
  useEffect(() => { fetchRoomAvailabilityRef.current = fetchRoomAvailability; });

  useEffect(() => {
    // Use relative URL — routed through Next.js rewrite proxy to backend
    // This respects CSP connect-src 'self' and works in any environment
    const es = new ReconnectingEventSource(`/api/v1/stream/rooms/${room.id}`);

    es.addEventListener('INVENTORY_UPDATE', (e: any) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.version && payload.version < sseVersionRef.current) {
          console.warn(`[SSE] Ignored stale room event v${payload.version} < v${sseVersionRef.current}`);
          return;
        }
        if (payload.version) sseVersionRef.current = payload.version;

        const { travel_date, available, is_closed, variant_id, slot_start, slot_end } = payload;

        // Update detailed availability
        setDetailedAvailability(prev => {
          const next = { ...prev };
          if (!next[travel_date]) next[travel_date] = {};
          if (!next[travel_date][variant_id]) next[travel_date][variant_id] = {};
          const sStart = slot_start?.slice(0, 5) || '12:00';
          const sEnd = slot_end?.slice(0, 5) || '11:00';
          next[travel_date][variant_id][`${sStart}-${sEnd}`] = is_closed ? 0 : available;
          return next;
        });

        // Update room availability calendar
        const monthStr = travel_date.slice(0, 7);
        if (is_closed || available <= 0) {
          // Use stable ref to avoid stale closure
          fetchRoomAvailabilityRef.current(monthStr);
          // Remove from open set immediately so calendar reflects it
          setRoomAvailability(prev => {
            const next = { ...prev };
            if (next[monthStr]) {
              const s = new Set(next[monthStr]);
              s.delete(travel_date);
              next[monthStr] = s;
            }
            return next;
          });
        } else {
          setRoomAvailability(prev => {
            const next = { ...prev };
            const s = next[monthStr] ? new Set(next[monthStr]) : new Set<string>();
            s.add(travel_date);
            next[monthStr] = s;
            return next;
          });
        }
      } catch (err) {
        console.error('[SSE] Failed to parse room INVENTORY_UPDATE payload', err);
      }
    });

    es.addEventListener('ENTITY_STATUS_UPDATE', (e: any) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.status === 'DELETED') {
          // Force-close any open checkout modal before redirecting
          setShowPassengerModal(false);
          setArrivalDate('');
          setDepartureDate('');
          toast.error('This room has been removed by the administrator.', { duration: 10000 });
          router.push('/');
        } else if (payload.status === 'INACTIVE') {
          // Force-close checkout modal, clear dates, suspend UI
          setShowPassengerModal(false);
          setArrivalDate('');
          setDepartureDate('');
          setIsLodgeInactive(true);
          toast.error('This room is now inactive. Bookings have been suspended.', { duration: 10000 });
          const now = new Date();
          const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          fetchRoomAvailabilityRef.current(currentMonth);
        }
      } catch (err) {
        console.error('[SSE] Failed to parse room ENTITY_STATUS_UPDATE payload', err);
      }
    });

    return () => {
      es.close();
    };
  }, [room.id]);

  // Calculate real-time available rooms for the selected dates and variant
  const maxAvailableRooms = useMemo(() => {
    if (isAdmin) return 999;

    // Before dates are selected: no constraint yet (use a large number so UI doesn't block)
    if (!selectedVariantId || !arrivalDate) return 999;

    // If availability data is still loading, don't allow booking yet
    const startMonth = arrivalDate.slice(0, 7);
    if (roomAvailability[startMonth] === undefined) return 999; // Data not yet fetched — wait

    let minAvail = Infinity;
    let foundAny = false;

    const start = new Date(`${arrivalDate}T00:00:00`);
    let end = departureDate ? new Date(`${departureDate}T00:00:00`) : new Date(start);
    
    // If departureDate is not set, or if it is exactly equal to arrivalDate (day use / 1-night implicit)
    if (!departureDate || start.getTime() === end.getTime()) {
      end.setDate(end.getDate() + 1);
    }

    let current = new Date(start);
    
    // Determine the slot key for the currently selected slot
    const selectedSlot = slots[selectedSlotIndex] || slots[0];
    const sStart = selectedSlot?.slot_start?.slice(0, 5) || "";
    const sEnd = selectedSlot?.slot_end?.slice(0, 5) || "";
    const targetSlotKey = sStart && sEnd ? `${sStart}-${sEnd}` : null;

    while (current < end) {
      const dStr = toLocalDateString(current);
      const monthStr = dStr.slice(0, 7);

      // If this month's data has been fetched, we can make a definitive judgment
      if (roomAvailability[monthStr] !== undefined) {
        const availObj = detailedAvailability[dStr]?.[selectedVariantId];
        if (!availObj) {
          // Month was fetched but this date+variant has zero inventory rows → not available
          return 0;
        }
        // Try to match the exact selected slot key
        let avail: number | undefined;
        if (targetSlotKey && availObj[targetSlotKey] !== undefined) {
          avail = availObj[targetSlotKey];
        } else {
          // Fallback: use the best available slot count for this variant/date
          const values = Object.values(availObj);
          if (values.length > 0) {
            avail = Math.max(...values);
          }
        }
        if (avail === undefined || avail <= 0) return 0;
        minAvail = Math.min(minAvail, avail);
        foundAny = true;
      }
      // If month data not yet fetched for this date, skip (optimistic until loaded)
      current.setDate(current.getDate() + 1);
    }

    // If dates are selected but NO inventory row exists for this variant → 0 available (not bookable)
    // If inventory rows found → use the minimum available across all stay nights
    return foundAny ? minAvail : 0;
  }, [arrivalDate, departureDate, selectedVariantId, selectedSlotIndex, detailedAvailability, roomAvailability, room.booking_slots, room.slot_start, room.slot_end]);

  // Compute which departure dates are valid — all nights from arrivalDate must be open
  const validDepartureDates = useMemo(() => {
    if (!arrivalDate) return allAvailableDates;
    const startMonth = arrivalDate.slice(0, 7);
    if (roomAvailability[startMonth] === undefined) return allAvailableDates; // Not fetched yet

    const result = new Set<string>();
    const start = new Date(`${arrivalDate}T00:00:00`);

    // Check up to 90 days forward
    for (let offset = 1; offset <= 90; offset++) {
      const dep = new Date(start);
      dep.setDate(dep.getDate() + offset);
      const depStr = toLocalDateString(dep);

      // All nights from start to dep must be available
      let allOpen = true;
      const check = new Date(start);
      while (check < dep) {
        const checkStr = toLocalDateString(check);
        if (!allAvailableDates.has(checkStr)) {
          allOpen = false;
          break;
        }
        check.setDate(check.getDate() + 1);
      }
      if (allOpen) {
        result.add(depStr);
      } else {
        break; // Stop at first gap — no point checking further
      }
    }
    return result;
  }, [arrivalDate, allAvailableDates, roomAvailability]);

  // Cap guests if dates change and real-time capacity is lower than current guests
  useEffect(() => {
    const selectedVariant = validVariants.find((v) => v.id === selectedVariantId);
    const capacity = selectedVariant?.capacity_per_room || 4;
    const maxAllowed = maxAvailableRooms * capacity;
    if (maxAllowed > 0 && guests > maxAllowed) {
      setGuests(maxAllowed);
    }
  }, [maxAvailableRooms, selectedVariantId, validVariants, guests]);

  // Strict Real-Time Locking: Force-close CheckoutPassengerModal when SSE makes
  // selected slot unavailable (maxAvailableRooms drops to 0 or lodge marked inactive)
  useEffect(() => {
    if (isAdmin) return; // Admins bypass auto-clearing and modal closure on availability drops
    const isNowUnavailable = arrivalDate && (maxAvailableRooms <= 0 || isLodgeInactive);
    if (isNowUnavailable && showPassengerModal) {
      setShowPassengerModal(false);
      setArrivalDate('');
      setDepartureDate('');
      toast.error(
        isLodgeInactive
          ? 'This room is no longer available for bookings.'
          : 'This room is now fully booked or closed for your selected dates.',
        { duration: 6000 }
      );
    }
  }, [maxAvailableRooms, isLodgeInactive, showPassengerModal, arrivalDate, isAdmin]);

  const validateCoupon = async (code: string) => {
    setValidatingCoupon(true);
    setCouponError(null);
    setCouponSuccess(null);
    try {
      const baseFare = stayDetails.totalPrice * roomsCount;
      const rawSubtotal = baseFare > 0 ? baseFare : price * roomsCount;
      const res = await apiClient.post('/api/v1/coupons/validate', {
        code: code,
        booking_amount: rawSubtotal,
        target_type: 'ROOM',
        target_id: room.id,
        ticket_count: guests
      });
      
      if (res.data.valid) {
        setAppliedCoupon({
          code: code,
          discount_amount: res.data.discount_amount,
          discounted_subtotal: res.data.discounted_subtotal
        });
        setCouponSuccess(`Coupon applied! You saved ₹${res.data.discount_amount}`);
      } else {
        setAppliedCoupon(null);
        setCouponError(res.data.reason || "Invalid coupon");
      }
    } catch (err: any) {
      setAppliedCoupon(null);
      setCouponError(err.response?.data?.detail || "Invalid coupon");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    validateCoupon(couponCode.trim());
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setCouponError(null);
    setCouponSuccess(null);
  };



  const handleBookingClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLodgeInactive) return;
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    if (!arrivalDate || !departureDate) {
      toast.error("Please select arrival and departure dates.");
      return;
    }
    setShowPassengerModal(true);
  };

  const handleCheckoutSubmit = async (passengers: any[]) => {
    setIsProcessingCheckout(true);
    try {
      if (isAdmin) {
        const adminPayload = {
          target_type: 'room',
          travel_date: arrivalDate,
          departure_date: departureDate,
          quantity: guests,
          room_variant_id: selectedVariantId,
          adult_count: guests,
          child_count: 0,
          slot_start: selectedSlot?.slot_start,
          slot_end: selectedSlot?.slot_end,
          passengers: passengers.map(p => ({
            ...p,
            aadhaar: p.aadhaar || undefined,
            phone: p.phone || undefined,
          }))
        };
        const res = await apiClient.post('/api/v1/admin/bookings/create', adminPayload);
        toast.success(`Booking ${res.data.public_id} created successfully!`);
        router.push(`/admin/bookings`);
        return;
      }

      const finalTotal = isAgent ? prices.agentPayable : prices.grandTotal;
      const minPayable = Math.ceil(finalTotal * 0.50);
      const parsedCustom = parseInt(customPayAmount, 10);
      const paymentPercentage = (() => {
        if (!customPayAmount) return 100;
        if (isNaN(parsedCustom) || parsedCustom >= finalTotal) return 100;
        const clamped = Math.max(minPayable, parsedCustom);
        return parseFloat(((clamped / finalTotal) * 100).toFixed(4));
      })();

      const payload = {
        target_type: 'room',
        travel_date: arrivalDate,
        departure_date: departureDate,
        quantity: guests,
        room_variant_id: selectedVariantId,
        adult_count: guests,
        child_count: 0,
        slot_start: selectedSlot?.slot_start,
        slot_end: selectedSlot?.slot_end,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        passengers: passengers.map((p: any) => ({
          ...p,
          aadhaar: p.aadhaar || undefined,
          phone: p.phone || undefined,
        })),
        payment_percentage: paymentPercentage,
        expected_amount: finalTotal
      };

      const res = await apiClient.post('/api/v1/bookings/checkout', payload);

      const { checkout_data } = res.data;

      if (!checkout_data || !checkout_data.key_id) {
        toast.error("Failed to initialize payment gateway. Please try again.");
        setIsProcessingCheckout(false);
        return;
      }

      if (!Razorpay) {
        toast.error("Payment gateway is still loading or blocked by your browser. Please disable adblockers and try again.");
        setIsProcessingCheckout(false);
        return;
      }

      const options = {
        key: checkout_data.key_id,
        amount: checkout_data.amount,
        currency: checkout_data.currency,
        name: "TS Tours",
        description: `Booking Draft: ${checkout_data.draft_id}`,
        order_id: checkout_data.razorpay_order_id,
        handler: async (response: any) => {
          try {
            const verifyRes = await apiClient.post('/api/v1/payments/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            if (verifyRes.data.status === 'success') {
              router.push(`/dashboard/bookings/${verifyRes.data.booking_id}`);
            }
          } catch (err) {
            console.error("Payment verification failed", err);
            toast.error("Payment verification failed. If money was deducted, it will be refunded automatically or confirmed soon.");
            setIsProcessingCheckout(false);
          }
        },
        prefill: {
          name: passengers[0]?.full_name || '',
          contact: passengers[0]?.phone || ''
        },
        theme: { color: "#0f8d7d" },
        modal: {
          ondismiss: () => setIsProcessingCheckout(false)
        }
      };

      const rzp = new Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error(`Payment Failed: ${response.error.description}`);
        setIsProcessingCheckout(false);
      });
      rzp.open();

      // Enforce pointer-events: auto on body/html to override Radix UI Dialog scroll lock blocking on mobile
      if (typeof document !== 'undefined') {
        document.body.style.setProperty('pointer-events', 'auto', 'important');
        document.documentElement.style.setProperty('pointer-events', 'auto', 'important');
        let count = 0;
        const interval = setInterval(() => {
          document.body.style.setProperty('pointer-events', 'auto', 'important');
          document.documentElement.style.setProperty('pointer-events', 'auto', 'important');
          count++;
          if (count > 30) clearInterval(interval);
        }, 100);
      }
    } catch (err: any) {
      console.error(err);
      let errMsg = "Checkout failed. Please try again.";
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errMsg = err.response.data.detail.map((d: any) => `${d.loc?.join('.')} - ${d.msg}`).join(', ');
        } else {
          errMsg = err.response.data.detail;
        }
      } else if (err.message) {
        if (err.message.includes("Razorpay is not a constructor")) {
          errMsg = "Payment gateway blocked. Please disable adblockers.";
        } else {
          errMsg = err.message;
        }
      }
      toast.error(errMsg);
      setIsProcessingCheckout(false);
    }
  };

  useEffect(() => {
    // Single initial status check — SSE handles real-time status updates after this.
    // DO NOT use setInterval here: polling every 3s fires an API request for EVERY active user = server overload in production.
    fetch(`/api/v1/rooms/${room.slug}`)
      .then((res) => {
        setIsLodgeInactive(res.status === 404);
      })
      .catch(() => {})
      .finally(() => {
        setIsCheckingActive(false);
      });
  }, [room.slug]);

  const selectedVariant = useMemo(() => {
    if (!validVariants.length) return undefined;
    return validVariants.find((variant) => variant.id === selectedVariantId) || validVariants[0];
  }, [selectedVariantId, validVariants]);

  const capacity = selectedVariant?.capacity_per_room || 2;
  const roomsCount = Math.max(1, Math.ceil(guests / capacity));

  const stayDetails = useMemo(() => {
    const weekday = Number(selectedVariant?.weekday_price || room.starting_price || 0);
    const weekend = Number(selectedVariant?.weekend_price || selectedVariant?.weekday_price || room.starting_price || 0);
    return getStayPriceDetails(arrivalDate, departureDate, weekday, weekend);
  }, [arrivalDate, departureDate, selectedVariant, room.starting_price]);

  const price = useMemo(() => {
    let isWeekend = false;
    if (arrivalDate) {
      const date = new Date(`${arrivalDate}T00:00:00`);
      const day = date.getDay();
      isWeekend = day === 6 || day === 0;
    }
    const weekday = Number(selectedVariant?.weekday_price || room.starting_price || 0);
    const weekend = Number(selectedVariant?.weekend_price || selectedVariant?.weekday_price || room.starting_price || 0);
    return isWeekend ? weekend : weekday;
  }, [arrivalDate, selectedVariant, room.starting_price]);

  const prices = useMemo(() => {
    const baseFare = stayDetails.totalPrice * roomsCount;
    const rawSubtotal = baseFare > 0 ? baseFare : price * roomsCount;
    let discount = 0;
    if (appliedCoupon) {
      discount = appliedCoupon.discount_amount;
    }
    const subtotal = Math.max(0, rawSubtotal - discount);

    const gst = Math.round(subtotal * 0.05);
    const gatewayFee = Math.round((subtotal + gst) * 0.01);
    const grandTotal = subtotal + gst + gatewayFee;

    // Agent Commission Calculations
    const commissionPercentage = user?.commission_percentage ? Number(user.commission_percentage) : 0;
    const commissionType = user?.commission_type || 'PERCENTAGE';
    const commissionFixedAmount = user?.commission_fixed_amount ? Number(user.commission_fixed_amount) : 0;

    let agentDiscount = 0;
    if (isAgent) {
      if (commissionType === 'FIXED_AMOUNT') {
        agentDiscount = Math.min(commissionFixedAmount, grandTotal);
      } else {
        agentDiscount = Math.min(grandTotal, Math.round((subtotal * commissionPercentage) / 100));
      }
    }
    const agentPayable = Math.max(0, grandTotal - agentDiscount);

    return { rawSubtotal, discount, subtotal, gst, gatewayFee, grandTotal, agentDiscount, agentPayable };
  }, [stayDetails.totalPrice, roomsCount, price, appliedCoupon, user, isAgent]);

  // Adjust custom pay amount when total price changes
  useEffect(() => {
    setCustomPayAmount(prev => {
      if (prev === '') return prev;
      const parsed = parseInt(prev, 10);
      const finalTotal = isAgent ? prices.agentPayable : prices.grandTotal;
      const minPayable = Math.ceil(finalTotal * 0.50);
      if (!isNaN(parsed)) {
        if (parsed >= finalTotal) return '';
        if (parsed < minPayable) return String(minPayable);
      }
      return prev;
    });
  }, [prices.grandTotal, prices.agentPayable, isAgent]);

  useEffect(() => {
    if (appliedCoupon) {
      validateCoupon(appliedCoupon.code);
    }
  }, [price, roomsCount, stayDetails.totalPrice, room.id]);

  const totalPrice = prices.rawSubtotal;
  const nights = stayDetails.nightsCount;
  const activeImage = slides[activeSlide] || slides[0];
  const facilities = room.facilities.filter(Boolean);
  const selectedSlot = slots[selectedSlotIndex] || slots[0];
  const embedUrl = getMapEmbedUrl(room.map_url, room.address, room.lodge_name);
  const bookingText = encodeURIComponent(
    `Hi, I want to reserve ${room.lodge_name}${selectedVariant ? ` - ${selectedVariant.variant_name}` : ''}. Rooms: ${roomsCount}, Guests: ${guests}. Dates: ${arrivalDate || 'not selected'} to ${departureDate || 'not selected'}. Timing Slot: ${selectedSlot ? `${selectedSlot.title} (${cleanTime(selectedSlot.slot_start)} to ${cleanTime(selectedSlot.slot_end)})` : 'Standard'}.`
  );

  const moveSlide = (direction: 'left' | 'right') => {
    setActiveSlide((current) => {
      if (direction === 'left') return (current - 1 + slides.length) % slides.length;
      return (current + 1) % slides.length;
    });
  };

  const { handlers: lightboxHandlers } = useLightbox({
    isOpen: lightboxOpen,
    onClose: () => setLightboxOpen(false),
    onNext: () => moveSlide('right'),
    onPrev: () => moveSlide('left'),
  });

  return (
    <main className="min-h-screen bg-[#f5faf9] pb-36 text-[#102231] lg:pb-0">
      <section className="relative overflow-hidden bg-[#062d3c]">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#062d3c_0%,#0c7b78_58%,#f4b44e_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_16%,rgba(255,255,255,0.22),transparent_26%),linear-gradient(180deg,rgba(3,24,35,0.08),rgba(3,24,35,0.7))]" />

        <div className="relative mx-auto max-w-[1600px] px-4 pb-10 pt-5 sm:px-6 lg:px-12">
          <div className="mb-5 flex min-w-0 items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/70">
            <Link href="/" className="transition hover:text-white">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/stays" className="transition hover:text-white">Stays</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="truncate text-white">{room.lodge_name}</span>
          </div>

          <div className="grid items-end gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            <div className="text-white">
              <Link href="/stays" className="mb-5 inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 text-sm font-black text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/18">
                <ArrowLeft className="h-4 w-4" />
                Stays
              </Link>

              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-black backdrop-blur">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-200" />
                  Verified stay
                </span>
                {room.is_featured ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-black backdrop-blur">
                    <Sparkles className="h-3.5 w-3.5 text-amber-200" />
                    Featured property
                  </span>
                ) : null}
              </div>

              <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-normal text-white sm:text-4xl lg:text-5xl">
                {room.lodge_name}
              </h1>
              {room.description ? (
                <div
                  className="mt-4 max-w-2xl text-sm font-medium leading-7 text-white/85 sm:text-base prose prose-invert prose-sm"
                  dangerouslySetInnerHTML={{ __html: room.description }}
                />
              ) : (
                <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-white/85 sm:text-base">
                  A verified Bhadrachalam stay with room categories, facilities, location, and reservation details shown clearly before booking.
                </p>
              )}

              <div className="mt-6 grid grid-cols-2 gap-3 min-[460px]:grid-cols-4">
                <HeroFact icon={IndianRupee} label="Starts from" value={price ? money(price) : money(room.starting_price)} />
                <HeroFact icon={BedDouble} label="Categories" value={`${validVariants.length || 1} option${validVariants.length === 1 ? '' : 's'}`} />
                <HeroFact icon={Clock} label="Check-in" value={cleanTime(room.slot_start)} />
                <HeroFact icon={MapPin} label="Location" value={room.address || 'Bhadrachalam'} />
              </div>
            </div>

            <div className="rounded-xl border border-white/18 bg-white p-2 shadow-2xl shadow-slate-950/18">
              <div className="relative overflow-hidden rounded-lg bg-slate-950">
                <div className="relative aspect-[4/3] min-h-[300px] sm:aspect-[16/10] lg:min-h-[470px]">
                  <Image src={activeImage.image_url} alt={activeImage.alt_text || room.lodge_name} fill priority className="scale-110 object-cover opacity-35 blur-2xl" sizes="(max-width: 1024px) 100vw, 720px" />
                  <Image src={getHdImageUrl(activeImage.image_url)} alt={activeImage.alt_text || room.lodge_name} fill priority className="object-cover transition-transform duration-500 hover:scale-[1.015]" sizes="(max-width: 1024px) 100vw, 1200px" unoptimized quality={100} />
                  <button type="button" onClick={() => setLightboxOpen(true)} className="absolute inset-0 z-10" aria-label="Open stay photos" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent p-3 sm:p-4">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/92 px-3 py-1.5 text-xs font-black text-slate-900 shadow-sm">
                      <Camera className="h-3.5 w-3.5" />
                      {slides.length} Photo{slides.length === 1 ? '' : 's'}
                    </span>
                    <span className="hidden rounded-full bg-slate-950/65 px-3 py-1.5 text-xs font-bold text-white ring-1 ring-white/10 sm:inline-flex">
                      {room.total_rooms ? `${room.total_rooms} rooms` : 'Managed stay'}
                    </span>
                  </div>
                  {slides.length > 1 ? (
                    <>
                      <button type="button" onClick={() => moveSlide('left')} className="absolute left-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-slate-900 shadow-lg transition hover:scale-105" aria-label="Previous photo">
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button type="button" onClick={() => moveSlide('right')} className="absolute right-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-slate-900 shadow-lg transition hover:scale-105" aria-label="Next photo">
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  ) : null}
                </div>
              </div>

              {slides.length > 1 ? (
                <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-5">
                  {slides.slice(0, 5).map((slide, index) => (
                    <button key={slide.id || index} type="button" onClick={() => setActiveSlide(index)} className={`relative aspect-[4/3] overflow-hidden rounded-md border transition ${index === activeSlide ? 'border-[#1a6b7a] ring-2 ring-[#1a6b7a]/20' : 'border-slate-200 opacity-75 hover:opacity-100'}`} aria-label={`Show photo ${index + 1}`}>
                      <Image src={slide.image_url} alt={slide.alt_text || `Stay photo ${index + 1}`} fill sizes="120px" className="object-cover" />
                      {index === 4 && slides.length > 5 ? <span className="absolute inset-0 flex items-center justify-center bg-slate-950/65 text-xs font-black text-white">+{slides.length - 5}</span> : null}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-[#f4faf9] px-3 py-2 text-xs font-bold text-[#0f3d56]">
                  <BadgeCheck className="h-4 w-4 text-[#1a6b7a]" />
                  More photos may be shared by the reservations team.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <RoomSectionNav />

      <section className="mx-auto grid max-w-[1600px] gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-12 lg:py-14">
        <div className="space-y-8">
          <Section id="overview" title="Stay Overview" eyebrow="Room details">
            <div className="grid gap-4 md:grid-cols-3">
              <InfoTile icon={MapPin} label="Address" value={room.address || 'Bhadrachalam stay location'} />
              <InfoTile icon={Clock} label="Check-in/out" value={`${cleanTime(selectedSlot?.slot_start)} - ${cleanTime(selectedSlot?.slot_end)}`} />
              <InfoTile icon={Users} label="Rooms" value={room.total_rooms ? `${room.total_rooms} total rooms` : 'Confirmed by team'} />
            </div>
          </Section>

          {facilities.length ? (
            <Section title="Facilities" eyebrow="From admin">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {facilities.map((facility) => (
                  <div key={facility} className="flex min-h-16 items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                    <Wifi className="h-4 w-4 shrink-0 text-[#0f8d7d]" />
                    <span className="text-sm font-black text-slate-800">{facility}</span>
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {validVariants.length ? (
            <Section id="categories" title="Stay Categories" eyebrow="Room tariffs">
              <div className="grid gap-4">
                {validVariants.map((variant) => {
                  const active = selectedVariant?.id === variant.id;
                  return (
                    <button key={variant.id} type="button" onClick={() => setSelectedVariantId(variant.id)} className={`grid gap-5 rounded-lg border p-5 text-left shadow-sm transition duration-300 md:grid-cols-[1fr_auto] md:items-center ${active ? 'border-[#0f8d7d] bg-white shadow-[0_22px_70px_rgba(15,141,125,0.12)]' : 'border-slate-200 bg-white/80 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg'}`}>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-black text-[#102231]">{variant.variant_name}</h3>
                          {variant.capacity_per_room ? <span className="rounded-full bg-[#edf8f6] px-3 py-1 text-xs font-black text-[#0f766e]">{variant.capacity_per_room} guests/room</span> : null}
                        </div>
                        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">Select this category to update your reservation estimate.</p>
                      </div>
                      <div className="flex gap-8 md:text-right">
                        <PriceBlock label="Weekday" value={variant.weekday_price} highlight />
                        <PriceBlock label="Weekend" value={variant.weekend_price} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </Section>
          ) : null}

          {room.highlights.length || embedUrl ? (
            <Section id="highlights" title="Highlights & Location" eyebrow="Good to know">
              <div className="grid gap-6 md:grid-cols-2">
                {room.highlights.length ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {room.highlights.map((highlight) => (
                      <div key={highlight.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                        <Star className="h-5 w-5 text-[#f2a93b]" />
                        <p className="mt-4 text-base font-black leading-7 text-[#102231]">{highlight.title}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-6">
                    <p className="text-sm text-slate-400 font-semibold">Premium stay verified features</p>
                  </div>
                )}

                {embedUrl ? (
                  <div className="relative h-[380px] overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                    <iframe title={`${room.lodge_name} map`} src={embedUrl} className="h-full w-full rounded-lg border-0 grayscale transition duration-700 hover:grayscale-0" allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                  </div>
                ) : null}
              </div>
            </Section>
          ) : null}

          {slots.length ? (
            <Section id="timings" title="Stay Timings" eyebrow="Booking slots">
              <div className="grid gap-4 sm:grid-cols-2">
                {slots.map((slot, index) => (
                  <div key={`${slot.title}-${index}`} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <Clock className="h-5 w-5 text-[#0f8d7d]" />
                    <h3 className="mt-4 text-base font-black text-[#102231]">{slot.title || 'Stay slot'}</h3>
                    <p className="mt-2 text-sm font-bold text-slate-500">{cleanTime(slot.slot_start)} to {cleanTime(slot.slot_end)}</p>
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {room.faqs.length ? (
            <Section id="faqs" title="Stay FAQs" eyebrow="Before booking">
              <div className="grid gap-3">
                {room.faqs.map((faq) => (
                  <details key={faq.id} className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-black text-[#102231]">
                      <span>{faq.question}</span>
                      <HelpCircle className="h-5 w-5 shrink-0 text-[#0f8d7d]" />
                    </summary>
                    <p className="mt-4 text-sm font-semibold leading-7 text-slate-600">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </Section>
          ) : null}

          {room.policies.length ? (
            <Section id="policies" title="Policies" eyebrow="Terms">
              <div className="grid gap-4 md:grid-cols-2">
                {room.policies.map((policy) => (
                  <div key={policy.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0f8d7d]">{formatPolicyType(policy.type)}</p>
                    <h3 className="mt-3 text-base font-black text-[#102231]">{policy.title}</h3>
                    <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">{policy.description}</p>
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {slides.length > 0 ? (
            <Section id="gallery" title="Stay Gallery" eyebrow="Property photos">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {slides.map((slide, index) => (
                  <button
                    key={slide.id || index}
                    type="button"
                    onClick={() => {
                      setActiveSlide(index);
                      setLightboxOpen(true);
                    }}
                    className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition hover:scale-[1.03] hover:shadow-lg hover:border-[#0f8d7d]/30"
                    aria-label={`View photo ${index + 1}`}
                  >
                    <Image src={getHdImageUrl(slide.image_url)} alt={slide.alt_text || `Gallery photo ${index + 1}`} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover" unoptimized quality={100} />
                  </button>
                ))}
              </div>
            </Section>
          ) : null}
        </div>
        <aside className="hidden lg:block lg:pt-1">
          <div className="sticky top-[140px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_45px_120px_rgba(16,34,49,0.13)] max-h-[calc(100vh-160px)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">

            {/* Dark header */}
            <div className="bg-[#0f3d56] px-5 py-4 text-white rounded-t-2xl">
              <h2 className="text-base font-black tracking-wide">Reserve your stay</h2>
              <div className="mt-1 text-2xl font-black tracking-tight">
                {stayDetails.nightsCount > 0 
                  ? money(Math.round(stayDetails.totalPrice / stayDetails.nightsCount)) 
                  : money(price)} <span className="text-xs font-semibold text-white/70">/ night{stayDetails.nightsCount > 0 && stayDetails.totalPrice !== price * stayDetails.nightsCount ? ' avg' : ''}</span>
              </div>
            </div>

            <div className="p-5 space-y-3">
              {isLodgeInactive && (
                <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-3 text-xs text-rose-600 font-bold flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-black">Online Bookings Suspended</p>
                    <p className="text-slate-500 font-bold text-[11px] mt-0.5 leading-relaxed">
                      This stay / lodge is currently closed or inactive.
                    </p>
                  </div>
                </div>
              )}

              {/* Select Dates */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Select Dates</p>
                <div className="grid grid-cols-2 gap-2">
                  <CustomDatePicker
                    label="Arrival"
                    align="left"
                    value={arrivalDate}
                    min={today}
                    disabled={isLodgeInactive}
                    availableDates={allAvailableDates}
                    onMonthChange={fetchRoomAvailability}
                    isAdmin={isAdmin}
                    onChange={(val) => {
                      setArrivalDate(val);
                      const sStart = selectedSlot?.slot_start || "";
                      const sEnd = selectedSlot?.slot_end || "";
                      const isOvernight = (sStart && sEnd) ? sStart > sEnd : true;
                      
                      if (!departureDate || (isOvernight && departureDate <= val) || (!isOvernight && departureDate < val)) {
                        if (isOvernight) {
                          const nextDay = new Date(val);
                          nextDay.setDate(nextDay.getDate() + 1);
                          setDepartureDate(toLocalDateString(nextDay));
                        } else {
                          setDepartureDate(val);
                        }
                      }
                    }}
                  />
                  <CustomDatePicker
                    label="Departure"
                    align="right"
                    value={departureDate}
                    min={arrivalDate || today}
                    disabled={isLodgeInactive}
                    availableDates={validDepartureDates}
                    onMonthChange={fetchRoomAvailability}
                    isAdmin={isAdmin}
                    onChange={setDepartureDate}
                  />
                </div>
              </div>

              {validVariants.length ? (
                <PremiumSelect
                  label="Stay Category"
                  value={selectedVariantId}
                  disabled={isLodgeInactive}
                  onChange={(value) => setSelectedVariantId(Number(value))}
                  options={validVariants.map((variant) => ({ value: variant.id, label: variant.variant_name }))}
                  placeholder="Select stay category"
                />
              ) : null}

              {slots.length > 0 ? (
                <PremiumSelect
                  label="Check-in/out Timing"
                  value={selectedSlotIndex}
                  disabled={isLodgeInactive}
                  onChange={(value) => {
                    const newIndex = Number(value);
                    setSelectedSlotIndex(newIndex);
                    if (arrivalDate && departureDate) {
                      const newSlot = slots[newIndex] || slots[0];
                      const sStart = newSlot?.slot_start || "";
                      const sEnd = newSlot?.slot_end || "";
                      const isOvernight = (sStart && sEnd) ? sStart > sEnd : true;
                      if (isOvernight && departureDate <= arrivalDate) {
                        const nextDay = new Date(arrivalDate);
                        nextDay.setDate(nextDay.getDate() + 1);
                        setDepartureDate(toLocalDateString(nextDay));
                      } else if (!isOvernight && departureDate > arrivalDate) {
                        setDepartureDate(arrivalDate);
                      }
                    }
                  }}
                  options={slots.map((slot, index) => ({ value: index, label: `${slot.title} (${cleanTime(slot.slot_start)} - ${cleanTime(slot.slot_end)})` }))}
                  placeholder="Select timing slot"
                />
              ) : null}

              {/* Guests */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Guests</p>
                <div className={`flex items-center justify-between rounded-lg border px-3 py-1 ${isLodgeInactive ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-white border-slate-200'}`}>
                  <button type="button" disabled={isLodgeInactive} onClick={() => setGuests((value) => Math.max(1, value - 1))} className={`flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition ${isLodgeInactive ? 'cursor-not-allowed text-slate-300' : 'hover:text-[#0f8d7d]'}`} aria-label="Decrease guests">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-black">{guests} {guests === 1 ? 'Adult' : 'Adults'}</span>
                  <button type="button" disabled={isLodgeInactive || guests >= (maxAvailableRooms * capacity)} onClick={() => setGuests((value) => Math.min(maxAvailableRooms * capacity, value + 1))} className={`flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition ${isLodgeInactive || guests >= (maxAvailableRooms * capacity) ? 'cursor-not-allowed text-slate-300' : 'hover:text-[#0f8d7d]'}`} aria-label="Increase guests">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex justify-between items-center mt-1">
                  {selectedVariant?.capacity_per_room ? <p className="text-[10px] font-bold text-slate-400">{selectedVariant.capacity_per_room} guests/room capacity</p> : <div />}
                  <p className={`text-[10px] font-bold ${arrivalDate && maxAvailableRooms === 0 ? 'text-red-500' : arrivalDate && roomsCount > maxAvailableRooms ? 'text-red-500' : 'text-[#0f8d7d]'}`}>
                    {arrivalDate && maxAvailableRooms === 0
                      ? 'No rooms available — select different dates'
                      : `Requires ${roomsCount} room${roomsCount !== 1 ? 's' : ''}${arrivalDate ? ` (${maxAvailableRooms} available)` : ''}`
                    }
                  </p>
                </div>
              </div>

              {/* Coupon Section */}
              <div className="pt-4 border-t border-slate-100">
                <form onSubmit={handleApplyCoupon} className="flex flex-col gap-2 relative">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Have a promo code?"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={validatingCoupon || !!appliedCoupon}
                      className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 outline-none transition focus:border-[#1a6b7a] focus:bg-white disabled:opacity-60"
                    />
                    {appliedCoupon ? (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="flex items-center justify-center rounded-lg bg-red-50 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-100"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={!couponCode || validatingCoupon}
                        className="flex w-16 items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white transition hover:bg-slate-800 disabled:opacity-50"
                      >
                        {validatingCoupon ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Apply'}
                      </button>
                    )}
                  </div>
                  {couponError && <p className="text-[10px] font-bold text-red-500">{couponError}</p>}
                  {couponSuccess && <p className="text-[10px] font-bold text-[#16a34a]">{couponSuccess}</p>}
                </form>
              </div>

              {/* Pricing summary */}
              <div className="pt-2.5 border-t border-slate-100 space-y-1.5 text-[12px] text-slate-500">
                <div className="flex items-center justify-between">
                  <span>Room Fare <span className="text-[10px] text-slate-400">({nights || 1}N, {roomsCount}R)</span></span>
                  <span className="font-bold text-slate-800">{prices.rawSubtotal ? money(prices.rawSubtotal) : money(price * roomsCount)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex items-center justify-between text-[#16a34a]">
                    <span>Coupon Discount</span>
                    <span className="font-bold">- {money(appliedCoupon.discount_amount)}</span>
                  </div>
                )}
                {nights > 0 && selectedVariant && arrivalDate && departureDate && stayDetails.breakdown.some(d => d.isWeekend) ? (
                  <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                    Includes {stayDetails.breakdown.filter(d => d.isWeekend).length} weekend night(s)
                  </div>
                ) : null}
                <div className="flex items-center justify-between">
                  <span>GST <span className="text-[10px] text-slate-400">(5%)</span></span>
                  <span className="font-bold text-slate-800">{money(prices.gst)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Gateway Fee <span className="text-[10px] text-slate-400">(1%)</span></span>
                  <span className="font-bold text-slate-800">{money(prices.gatewayFee)}</span>
                </div>
                {isAgent ? (
                  <>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-1.5 text-sm font-bold text-slate-700">
                      <span>Tourist Total Bill</span>
                      <span>{money(prices.grandTotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-rose-600 font-bold">
                      <span>Agent Commission ({user?.commission_type === 'FIXED_AMOUNT' ? 'Fixed' : `${user?.commission_percentage}%`})</span>
                      <span>- {money(prices.agentDiscount)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200 pt-2 mt-1.5 text-base font-black text-slate-900">
                      <span>Net Payable to Portal</span>
                      <span className="text-[#1a6b7a] text-xl">{money(prices.agentPayable)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-1.5 text-base font-black text-slate-900">
                    <span>Total</span>
                    <span className="text-[#1a6b7a] text-xl">{money(prices.grandTotal || price * roomsCount)}</span>
                  </div>
                )}
              </div>

              {/* Payment + CTA */}
              {isLodgeInactive ? (
                <button disabled className="w-full rounded-lg py-3 px-5 font-black text-white text-sm uppercase tracking-wider bg-slate-400 cursor-not-allowed h-11 flex items-center justify-center">
                  Reservations Closed
                </button>
              ) : (
                <>
                  {arrivalDate && departureDate && !isAdmin && (() => {
                    const finalTotal = (isAgent ? prices.agentPayable : prices.grandTotal) || price * roomsCount;
                    const minPayable = Math.ceil(finalTotal * 0.50);
                    const parsedCustom = parseInt(customPayAmount, 10);
                    const effectivePay = isNaN(parsedCustom) || customPayAmount === ''
                      ? finalTotal
                      : Math.min(finalTotal, Math.max(minPayable, parsedCustom));
                    const isPartial = effectivePay < finalTotal;
                    return (
                      <div className="pt-2.5 border-t border-slate-100">
                        {/* No cancellation notice */}
                        <div className="mb-2 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-2">
                          <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0 mt-0.5" />
                          <p className="text-[10px] font-bold text-amber-700 leading-4">No cancellation — 50% advance secures your room. Balance payable before check-in.</p>
                        </div>

                        {/* Toggle + amount row */}
                        <div className="flex items-center gap-2">
                          <div className="flex bg-slate-100 rounded-lg p-0.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => setCustomPayAmount('')}
                              className={`px-3 py-1.5 rounded-md text-[11px] font-black transition-all ${customPayAmount === '' ? 'bg-[#0f8d7d] text-white shadow-sm' : 'text-slate-500'}`}
                            >
                              Full
                            </button>
                            <button
                              type="button"
                              onClick={() => { if (customPayAmount === '') setCustomPayAmount(String(minPayable)); }}
                              className={`px-3 py-1.5 rounded-md text-[11px] font-black transition-all ${customPayAmount !== '' ? 'bg-[#0f8d7d] text-white shadow-sm' : 'text-slate-500'}`}
                            >
                              50% Adv
                            </button>
                          </div>

                          {customPayAmount !== '' ? (
                            <div className="flex-1 flex items-center gap-1.5 bg-white border border-[#0f8d7d]/50 rounded-lg px-3 py-1.5">
                              <span className="text-sm font-black text-slate-400">₹</span>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={customPayAmount}
                                onChange={(e) => setCustomPayAmount(e.target.value.replace(/[^0-9]/g, ''))}
                                onBlur={() => {
                                  const v = parseInt(customPayAmount, 10);
                                  if (isNaN(v) || v < minPayable) setCustomPayAmount(String(minPayable));
                                  else if (v >= finalTotal) setCustomPayAmount('');
                                  else setCustomPayAmount(String(v));
                                }}
                                className="flex-1 bg-transparent text-sm font-black text-slate-800 outline-none w-0 min-w-0"
                                placeholder={String(minPayable)}
                              />
                              <span className="text-[10px] font-bold text-slate-400 shrink-0">now</span>
                            </div>
                          ) : (
                            <div className="flex-1 text-right">
                              <span className="text-sm font-black text-[#0f8d7d]">₹{finalTotal.toLocaleString('en-IN')}</span>
                              <span className="text-[11px] text-slate-400 font-semibold ml-1">full</span>
                            </div>
                          )}
                        </div>

                        {isPartial && (
                          <div className="mt-1.5 flex justify-between items-center text-[11px] text-slate-500 font-semibold">
                            <span>Balance before check-in</span>
                            <span className="font-extrabold text-slate-700">₹{(finalTotal - effectivePay).toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        {customPayAmount !== '' && parseInt(customPayAmount, 10) < minPayable && (
                          <p className="mt-1 text-[10px] text-red-500 font-bold">Min advance is ₹{minPayable.toLocaleString('en-IN')} (50%)</p>
                        )}
                      </div>
                    );
                  })()}

                  {arrivalDate && departureDate && maxAvailableRooms === 0 ? (
                    <div className="w-full rounded-lg py-3 px-5 font-black text-white text-sm uppercase tracking-wider bg-red-500 h-11 flex items-center justify-center cursor-not-allowed opacity-80">
                      Not Available
                    </div>
                  ) : arrivalDate && departureDate && roomsCount > maxAvailableRooms ? (
                    <div className="w-full rounded-lg py-3 px-5 font-black text-white text-sm uppercase tracking-wider bg-red-500 h-11 flex items-center justify-center cursor-not-allowed opacity-80">
                      Not Enough Rooms
                    </div>
                  ) : (
                    <button onClick={handleBookingClick} disabled={isProcessingCheckout} className="w-full rounded-lg py-3 px-5 font-black text-white text-sm uppercase tracking-wider bg-[#0f8d7d] shadow-md transition hover:-translate-y-0.5 hover:bg-[#0b7469] h-11 flex items-center justify-center disabled:opacity-60">
                      {isProcessingCheckout ? <Loader2 className="h-5 w-5 animate-spin" /> : isAdmin ? 'Reserve Now (Admin)' : 'Reserve Now'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </aside>
      </section>

      <div className="fixed inset-x-0 bottom-16 z-50 border-t border-white/50 bg-white/95 p-3 shadow-[0_-18px_50px_rgba(23,34,50,0.14)] backdrop-blur-xl sm:bottom-0 lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
              Total ({roomsCount} {roomsCount === 1 ? 'room' : 'rooms'}){isAgent && prices.agentPayable < prices.grandTotal ? ' · Agent Rate' : ''}
            </p>
            <p className="text-xl font-black text-[#102231] min-[380px]:text-2xl">{(isAgent ? prices.agentPayable : prices.grandTotal) ? money(isAgent ? prices.agentPayable : prices.grandTotal) : money(price * roomsCount)}</p>
          </div>
          {isLodgeInactive ? (
            <button disabled className="flex h-12 shrink-0 items-center justify-center rounded-full bg-slate-400 px-6 text-sm font-black uppercase tracking-[0.14em] text-white cursor-not-allowed animate-none">
              Closed
            </button>
          ) : (
            <Sheet>
              <SheetTrigger asChild>
                <button type="button" className="flex h-12 shrink-0 items-center justify-center rounded-full bg-[#0f8d7d] px-6 text-xs font-black uppercase tracking-[0.14em] text-white shadow-md cursor-pointer active:scale-95">
                  Reserve Now
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[92dvh] overflow-y-auto rounded-t-[24px] border-t border-slate-200 bg-white px-4 pb-6 pt-8 scrollbar-none" showCloseButton>
                <SheetHeader className="mb-4 text-left">
                  <SheetTitle className="text-xl font-black text-[#102231] flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#0f8d7d]" />
                    Configure Stay
                  </SheetTitle>
                  <SheetDescription className="text-xs font-bold text-slate-400">
                    Reserve room categories, timings, and verify pricing details.
                  </SheetDescription>
                </SheetHeader>
                <div className="pb-4 space-y-4">
                  {/* Select Dates */}
                  <div>
                    <p className="text-sm font-black text-[#263241]">Select Dates</p>
                    <div className="mt-3 grid gap-3">
                      <CustomDatePicker
                        label="Arrival"
                        value={arrivalDate}
                        min={today}
                        disabled={isLodgeInactive}
                        availableDates={allAvailableDates}
                        onMonthChange={fetchRoomAvailability}
                        isAdmin={isAdmin}
                        onChange={(val) => {
                          setArrivalDate(val);
                          const sStart = selectedSlot?.slot_start || "";
                          const sEnd = selectedSlot?.slot_end || "";
                          const isOvernight = (sStart && sEnd) ? sStart > sEnd : true;
                          
                          if (!departureDate || (isOvernight && departureDate <= val) || (!isOvernight && departureDate < val)) {
                            if (isOvernight) {
                              const nextDay = new Date(val);
                              nextDay.setDate(nextDay.getDate() + 1);
                              setDepartureDate(toLocalDateString(nextDay));
                            } else {
                              setDepartureDate(val);
                            }
                          }
                        }}
                      />
                      <CustomDatePicker
                        label="Departure"
                        value={departureDate}
                        min={arrivalDate || today}
                        disabled={isLodgeInactive}
                        availableDates={validDepartureDates}
                        onMonthChange={fetchRoomAvailability}
                        isAdmin={isAdmin}
                        onChange={setDepartureDate}
                      />
                    </div>
                  </div>

                  {validVariants.length ? (
                    <PremiumSelect
                      label="Stay Category"
                      value={selectedVariantId}
                      disabled={isLodgeInactive}
                      onChange={(value) => setSelectedVariantId(Number(value))}
                      options={validVariants.map((variant) => ({ value: variant.id, label: variant.variant_name }))}
                      placeholder="Select stay category"
                    />
                  ) : null}

                  {slots.length > 0 ? (
                    <PremiumSelect
                      label="Check-in/out Timing"
                      value={selectedSlotIndex}
                      disabled={isLodgeInactive}
                      onChange={(value) => {
                        const newIndex = Number(value);
                        setSelectedSlotIndex(newIndex);
                        if (arrivalDate && departureDate) {
                          const newSlot = slots[newIndex] || slots[0];
                          const sStart = newSlot?.slot_start || "";
                          const sEnd = newSlot?.slot_end || "";
                          const isOvernight = (sStart && sEnd) ? sStart > sEnd : true;
                          if (isOvernight && departureDate <= arrivalDate) {
                            const nextDay = new Date(arrivalDate);
                            nextDay.setDate(nextDay.getDate() + 1);
                            setDepartureDate(toLocalDateString(nextDay));
                          } else if (!isOvernight && departureDate > arrivalDate) {
                            setDepartureDate(arrivalDate);
                          }
                        }
                      }}
                      options={slots.map((slot, index) => ({ value: index, label: `${slot.title} (${cleanTime(slot.slot_start)} - ${cleanTime(slot.slot_end)})` }))}
                      placeholder="Select timing slot"
                    />
                  ) : null}

                  <div>
                    <p className="text-sm font-black text-[#263241]">Guests</p>
                    <div className={`mt-3 flex min-h-14 items-center justify-between rounded-lg border px-4 ${isLodgeInactive ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-white border-slate-200'}`}>
                      <button type="button" disabled={isLodgeInactive} onClick={() => setGuests((value) => Math.max(1, value - 1))} className={`flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition ${isLodgeInactive ? 'cursor-not-allowed text-slate-300' : 'hover:border-[#0f8d7d] hover:text-[#0f8d7d]'}`} aria-label="Decrease guests">
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-sm font-black">{guests} {guests === 1 ? 'Guest' : 'Guests'}</span>
                      <button type="button" disabled={isLodgeInactive || guests >= (maxAvailableRooms * capacity)} onClick={() => setGuests((value) => Math.min(maxAvailableRooms * capacity, value + 1))} className={`flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition ${isLodgeInactive || guests >= (maxAvailableRooms * capacity) ? 'cursor-not-allowed text-slate-300' : 'hover:border-[#0f8d7d] hover:text-[#0f8d7d]'}`} aria-label="Increase guests">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      {selectedVariant?.capacity_per_room ? <p className="text-xs font-bold text-slate-400">Selected category capacity: {selectedVariant.capacity_per_room} guests per room.</p> : null}
                      <p className={`text-xs font-black ${arrivalDate && maxAvailableRooms === 0 ? 'text-red-500' : arrivalDate && roomsCount > maxAvailableRooms ? 'text-red-500' : 'text-[#0f8d7d]'}`}>
                        {arrivalDate && maxAvailableRooms === 0
                          ? 'No rooms available — select different dates'
                          : `Requires ${roomsCount} room${roomsCount !== 1 ? 's' : ''}${arrivalDate ? ` (${maxAvailableRooms} available)` : ''}`
                        }
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-5 space-y-4">
                    {/* Mobile Coupon Section */}
                    <form onSubmit={handleApplyCoupon} className="flex flex-col gap-2 relative">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Have a promo code?"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          disabled={validatingCoupon || !!appliedCoupon}
                          className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold uppercase tracking-wider text-slate-700 outline-none transition focus:border-[#1a6b7a] focus:bg-white disabled:opacity-60"
                        />
                        {appliedCoupon ? (
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="flex items-center justify-center rounded-lg bg-red-50 px-4 py-2 text-sm font-black text-red-600 transition hover:bg-red-100"
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            type="submit"
                            disabled={!couponCode || validatingCoupon}
                            className="flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-black text-white transition hover:bg-slate-800 disabled:opacity-50"
                          >
                            {validatingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                          </button>
                        )}
                      </div>
                      {couponError && <p className="text-[10px] font-bold text-red-500">{couponError}</p>}
                      {couponSuccess && <p className="text-[10px] font-bold text-[#16a34a]">{couponSuccess}</p>}
                    </form>

                    <div className="space-y-1.5 text-[12px] text-slate-500 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span>Room Fare <span className="text-[10px] text-slate-400">({nights || 1}N, {roomsCount}R)</span></span>
                        <span className="font-bold text-slate-800">{prices.rawSubtotal ? money(prices.rawSubtotal) : money(price * roomsCount)}</span>
                      </div>
                      {appliedCoupon && (
                        <div className="flex items-center justify-between text-[#16a34a]">
                          <span>Coupon Discount</span>
                          <span className="font-bold">- {money(appliedCoupon.discount_amount)}</span>
                        </div>
                      )}
                      {nights > 0 && selectedVariant && arrivalDate && departureDate && stayDetails.breakdown.some(d => d.isWeekend) ? (
                        <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                          Includes {stayDetails.breakdown.filter(d => d.isWeekend).length} weekend night(s)
                        </div>
                      ) : null}
                      <div className="flex items-center justify-between">
                        <span>GST <span className="text-[10px] text-slate-400">(5%)</span></span>
                        <span className="font-bold text-slate-800">{money(prices.gst)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Gateway Fee <span className="text-[10px] text-slate-400">(1%)</span></span>
                        <span className="font-bold text-slate-800">{money(prices.gatewayFee)}</span>
                      </div>
                      {isAgent ? (
                        <>
                          <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-1.5 text-sm font-bold text-slate-700">
                            <span>Tourist Total Bill</span>
                            <span>{money(prices.grandTotal)}</span>
                          </div>
                          <div className="flex items-center justify-between text-rose-600 font-bold">
                            <span>Agent Commission ({user?.commission_type === 'FIXED_AMOUNT' ? 'Fixed' : `${user?.commission_percentage}%`})</span>
                            <span>- {money(prices.agentDiscount)}</span>
                          </div>
                          <div className="flex items-center justify-between border-t border-slate-200 pt-2 mt-1.5 text-base font-black text-slate-900">
                            <span>Net Payable to Portal</span>
                            <span className="text-[#1a6b7a] text-xl">{money(prices.agentPayable)}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-1.5 text-base font-black text-slate-900">
                          <span>Total</span>
                          <span className="text-[#1a6b7a] text-xl">{money(prices.grandTotal || price * roomsCount)}</span>
                        </div>
                      )}
                    </div>

                    {arrivalDate && departureDate && !isAdmin && (() => {
                      const finalTotal = (isAgent ? prices.agentPayable : prices.grandTotal) || price * roomsCount;
                      const minPayable = Math.ceil(finalTotal * 0.50);
                      const parsedCustom = parseInt(customPayAmount, 10);
                      const effectivePay = isNaN(parsedCustom) || customPayAmount === ''
                        ? finalTotal
                        : Math.min(finalTotal, Math.max(minPayable, parsedCustom));
                      const isPartial = effectivePay < finalTotal;
                      return (
                        <div className="pt-2.5 border-t border-slate-100 mb-4">
                          {/* No cancellation notice */}
                          <div className="mb-2 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-2">
                            <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-[10px] font-bold text-amber-700 leading-4">No cancellation — 50% advance secures your room. Balance payable before check-in.</p>
                          </div>

                          {/* Toggle + amount row */}
                          <div className="flex items-center gap-2">
                            <div className="flex bg-slate-100 rounded-lg p-0.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => setCustomPayAmount('')}
                                className={`px-3 py-1.5 rounded-md text-[11px] font-black transition-all ${customPayAmount === '' ? 'bg-[#0f8d7d] text-white shadow-sm' : 'text-slate-500'}`}
                              >
                                Full
                              </button>
                              <button
                                type="button"
                                onClick={() => { if (customPayAmount === '') setCustomPayAmount(String(minPayable)); }}
                                className={`px-3 py-1.5 rounded-md text-[11px] font-black transition-all ${customPayAmount !== '' ? 'bg-[#0f8d7d] text-white shadow-sm' : 'text-slate-500'}`}
                              >
                                50% Adv
                              </button>
                            </div>

                            {customPayAmount !== '' ? (
                              <div className="flex-1 flex items-center gap-1.5 bg-white border border-[#0f8d7d]/50 rounded-lg px-3 py-1.5">
                                <span className="text-sm font-black text-slate-400">₹</span>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={customPayAmount}
                                  onChange={(e) => setCustomPayAmount(e.target.value.replace(/[^0-9]/g, ''))}
                                  onBlur={() => {
                                    const v = parseInt(customPayAmount, 10);
                                    if (isNaN(v) || v < minPayable) setCustomPayAmount(String(minPayable));
                                    else if (v >= finalTotal) setCustomPayAmount('');
                                    else setCustomPayAmount(String(v));
                                  }}
                                  className="flex-1 bg-transparent text-sm font-black text-slate-800 outline-none w-0 min-w-0"
                                  placeholder={String(minPayable)}
                                />
                                <span className="text-[10px] font-bold text-slate-400 shrink-0">now</span>
                              </div>
                            ) : (
                              <div className="flex-1 text-right">
                                <span className="text-sm font-black text-[#0f8d7d]">₹{finalTotal.toLocaleString('en-IN')}</span>
                                <span className="text-[11px] text-slate-400 font-semibold ml-1">full</span>
                              </div>
                            )}
                          </div>

                          {isPartial && (
                            <div className="mt-1.5 flex justify-between items-center text-[11px] text-slate-500 font-semibold">
                              <span>Balance before check-in</span>
                              <span className="font-extrabold text-slate-700">₹{(finalTotal - effectivePay).toLocaleString('en-IN')}</span>
                            </div>
                          )}
                          {customPayAmount !== '' && parseInt(customPayAmount, 10) < minPayable && (
                            <p className="mt-1 text-[10px] text-red-500 font-bold">Min advance is ₹{minPayable.toLocaleString('en-IN')} (50%)</p>
                          )}
                        </div>
                      );
                    })()}

                    {/* Mobile CTA — same Razorpay flow as desktop */}
                    {arrivalDate && departureDate && maxAvailableRooms === 0 ? (
                      <div className="w-full rounded-lg py-3.5 px-5 font-black text-white text-sm uppercase tracking-wider bg-red-500 flex items-center justify-center cursor-not-allowed opacity-80">
                        Not Available on Selected Dates
                      </div>
                    ) : arrivalDate && departureDate && roomsCount > maxAvailableRooms ? (
                      <div className="w-full rounded-lg py-3.5 px-5 font-black text-white text-sm uppercase tracking-wider bg-red-500 flex items-center justify-center cursor-not-allowed opacity-80">
                        Not Enough Rooms — Reduce Guests
                      </div>
                    ) : !arrivalDate || !departureDate ? (
                      <div className="w-full rounded-lg py-3.5 px-5 font-black text-slate-400 text-sm uppercase tracking-wider bg-slate-100 flex items-center justify-center cursor-not-allowed">
                        Select Arrival &amp; Departure Dates
                      </div>
                    ) : (
                      <button
                        onClick={handleBookingClick}
                        disabled={isProcessingCheckout || isLodgeInactive}
                        className="w-full rounded-lg py-3.5 px-5 font-black text-white text-sm uppercase tracking-wider bg-[#0f8d7d] shadow-md transition hover:-translate-y-0.5 hover:bg-[#0b7469] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isProcessingCheckout ? <Loader2 className="h-5 w-5 animate-spin" /> : isAdmin ? 'Reserve Now (Admin)' : 'Reserve & Pay Now'}
                      </button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>

      {lightboxOpen ? (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm" {...lightboxHandlers}>
          <div className="flex items-center justify-between p-4">
            <span className="text-sm font-medium text-white/70">{activeSlide + 1} of {slides.length}</span>
            <button onClick={() => setLightboxOpen(false)} className="rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white" aria-label="Close gallery">
              <X className="h-7 w-7" />
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center p-2 md:p-8">
            {slides.length > 1 ? (
              <button onClick={() => moveSlide('left')} className="absolute left-2 z-10 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 md:left-8" aria-label="Previous photo">
                <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
              </button>
            ) : null}
            <div className="relative h-full w-full max-w-6xl">
              <Image src={getHdImageUrl(activeImage.image_url)} alt={activeImage.alt_text || room.lodge_name} fill sizes="100vw" className="object-contain" unoptimized quality={100} />
            </div>
            {slides.length > 1 ? (
              <button onClick={() => moveSlide('right')} className="absolute right-2 z-10 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 md:right-8" aria-label="Next photo">
                <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
      <ConfirmModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        onConfirm={() => router.push(`/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '')}`)}
        title="Verification Required"
        message="Please log in to continue booking your reservation."
        confirmText="Proceed to Login"
        cancelText="Cancel"
      />

      <CheckoutPassengerModal
        isOpen={showPassengerModal}
        onClose={() => setShowPassengerModal(false)}
        onSubmit={handleCheckoutSubmit}
        adults={guests}
        children={0}
        isProcessing={isProcessingCheckout}
        targetType="room"
      />
    </main>
  );
};

const HeroFact = ({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) => (
  <div className="min-h-[118px] rounded-lg border border-white/15 bg-[#174b55] p-4 shadow-lg shadow-slate-950/10">
    <Icon className="mb-3 h-4 w-4 text-amber-200" />
    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/65">{label}</p>
    <p className="mt-2 break-words text-[13px] font-black leading-5 text-white min-[460px]:line-clamp-2 sm:text-sm">{value}</p>
  </div>
);

const Section = ({ id, eyebrow, title, children }: { id?: string; eyebrow: string; title: string; children: ReactNode }) => (
  <section id={id} className="scroll-mt-[160px]">
    <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0f8d7d]">{eyebrow}</p>
    <h2 className="mt-2 text-2xl font-black text-[#102231] sm:text-3xl">{title}</h2>
    <div className="mt-5">{children}</div>
  </section>
);

const ROOM_NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: Info },
  { id: 'categories', label: 'Categories', icon: BedDouble },
  { id: 'highlights', label: 'Highlights', icon: Star },
  { id: 'timings', label: 'Timings', icon: Clock },
  { id: 'faqs', label: 'FAQs', icon: HelpCircle },
  { id: 'policies', label: 'Policies', icon: FileText },
  { id: 'gallery', label: 'Gallery', icon: Camera },
];

const RoomSectionNav = () => {
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      for (const item of ROOM_NAV_ITEMS) {
        const section = document.getElementById(item.id);
        if (section) {
          const { top } = section.getBoundingClientRect();
          const sectionTop = top + window.scrollY;
          const sectionBottom = sectionTop + section.offsetHeight;
          if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // stable: ROOM_NAV_ITEMS is a module-level constant

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      const offsetPosition = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky top-16 z-30 border-b border-slate-200/70 bg-white/92 shadow-sm backdrop-blur-xl">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12">
        <div className="flex flex-nowrap gap-2 overflow-x-auto py-3 scrollbar-none">
          {ROOM_NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                type="button"
                className={`flex min-h-10 items-center gap-2 rounded-full px-4 py-2 text-sm font-black transition-all whitespace-nowrap
                  ${isActive ? 'bg-[#0f3d56] text-white shadow-md shadow-[#0f3d56]/15' : 'bg-slate-100 text-slate-600 hover:bg-[#e9f6f4] hover:text-[#0f3d56]'}`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const InfoTile = ({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) => (
  <div className="min-h-32 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <Icon className="h-5 w-5 text-[#0f8d7d]" />
    <p className="mt-4 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
    <p className="mt-2 text-sm font-black leading-6 text-[#102231]">{value}</p>
  </div>
);

const PriceBlock = ({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) => (
  <div>
    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
    <p className={`mt-1 text-2xl font-black ${highlight ? 'text-[#0f8d7d]' : 'text-[#102231]'}`}>{money(value)}</p>
  </div>
);

const CustomDatePicker = ({
  label,
  value,
  min,
  onChange,
  placeholder = 'Select Date',
  disabled = false,
  align = 'left',
  availableDates,
  onMonthChange,
  isAdmin = false,
}: {
  label: string;
  value: string;
  min?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  align?: 'left' | 'right';
  availableDates?: Set<string>;
  onMonthChange?: (month: string) => void;
  isAdmin?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current date or fallback to min or today
  const baseDate = useMemo(() => {
    if (value) return new Date(value);
    if (min) return new Date(min);
    return new Date();
  }, [value, min]);

  const [calYear, setCalYear] = useState(baseDate.getFullYear());
  const [calMonth, setCalMonth] = useState(baseDate.getMonth());

  // Update calendar month/year if value or min changes
  useEffect(() => {
    setCalYear(baseDate.getFullYear());
    setCalMonth(baseDate.getMonth());
  }, [baseDate]);

  // Click outside listener to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const toYYYYMMDD = (year: number, month: number, day: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const handleDaySelect = (day: number) => {
    const selected = toYYYYMMDD(calYear, calMonth, day);
    onChange(selected);
    setIsOpen(false);
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    let newMonth = calMonth;
    let newYear = calYear;
    if (calMonth === 11) {
      newMonth = 0;
      newYear = calYear + 1;
    } else {
      newMonth = calMonth + 1;
    }
    setCalMonth(newMonth);
    setCalYear(newYear);
    if (onMonthChange) {
      const mm = String(newMonth + 1).padStart(2, '0');
      onMonthChange(`${newYear}-${mm}`);
    }
  };

  const prevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Do not go before the min date's month
    const minD = min ? new Date(min) : new Date();
    if (calYear < minD.getFullYear() || (calYear === minD.getFullYear() && calMonth <= minD.getMonth())) {
      return;
    }

    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(calYear - 1);
    } else {
      setCalMonth(calMonth - 1);
    }
  };

  const renderDays = () => {
    const daysInMonth = getDaysInMonth(calYear, calMonth);
    const firstDay = getFirstDayOfMonth(calYear, calMonth);
    const days = [];

    // Empty spacers
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
    }

    const minDateStr = min || getLocalToday();

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = toYYYYMMDD(calYear, calMonth, i);
      const isPast = dateStr < minDateStr;
      const isSelected = dateStr === value;

      // If availableDates is provided, only enable dates that are in the set
      const hasInventory = isAdmin ? true : (availableDates ? availableDates.has(dateStr) : true);
      const isDisabled = isAdmin ? false : (isPast || !hasInventory);

      days.push(
        <button
          key={i}
          type="button"
          disabled={isDisabled}
          onClick={() => handleDaySelect(i)}
          className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black transition-all
            ${isDisabled
              ? 'text-slate-200 cursor-not-allowed line-through bg-slate-50/30'
              : isSelected
                ? 'bg-[#0f8d7d] text-white shadow-md'
                : 'text-[#102231] hover:bg-[#f4faf9] hover:text-[#0f8d7d] cursor-pointer'
            }
          `}
        >
          {i}
        </button>
      );
    }
    return days;
  };

  const formattedDate = value
    ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : placeholder;

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left rounded-lg border px-3.5 py-2.5 shadow-inner transition-all ${disabled
            ? 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-85 text-slate-400'
            : 'bg-white border-slate-200 cursor-pointer hover:border-slate-350 focus:border-[#0f8d7d] focus:outline-none'
          }`}
      >
        <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
          <CalendarDays className="h-4 w-4 text-[#0f8d7d]" />
          {label}
        </span>
        <div className="mt-1 text-sm font-black">
          {formattedDate}
        </div>
      </button>

      {isOpen && (
        <div className={`absolute ${align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'} top-[calc(100%+6px)] z-50 rounded-xl border border-slate-150 bg-white p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 w-[330px]`}>
          <div className="flex justify-between items-center mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 hover:bg-[#f4faf9] rounded-lg text-slate-400 hover:text-[#0f8d7d] transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
              disabled={(() => {
                const minD = min ? new Date(min) : new Date();
                return calYear < minD.getFullYear() || (calYear === minD.getFullYear() && calMonth <= minD.getMonth());
              })()}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-xs font-black text-[#102231] uppercase tracking-wider">
              {monthNames[calMonth]} {calYear}
            </div>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 hover:bg-[#f4faf9] rounded-lg text-slate-400 hover:text-[#0f8d7d] transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d} className="text-[10px] font-black text-slate-400 uppercase tracking-wider w-8 py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 justify-items-center">
            {renderDays()}
          </div>
        </div>
      )}
    </div>
  );
};
