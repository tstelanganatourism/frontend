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
import CheckoutPassengerModal from '@/components/checkout/CheckoutPassengerModal';
import { reportBookNowConversion } from '@/components/providers/AnalyticsProvider';
import { CouponWidget } from '@/components/ui/CouponWidget';
import { ReconnectingEventSource } from '@/lib/ReconnectingEventSource';

import { toast } from 'sonner';
import { RoomHero } from './RoomHero';
import {
  Sheet, SheetClose, SheetContent, SheetDescription,
  SheetHeader, SheetTitle, SheetTrigger
} from '@/components/ui/sheet';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BedDouble,
  Building2,
  CalendarDays,
  Camera,
  Car,
  ChevronRight,
  Clock,
  ExternalLink,
  HelpCircle,
  IndianRupee,
  MapPin,
  Minus,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  ThermometerSun,
  Tv,
  Users,
  Utensils,
  Wifi,
  Wind,
  X,
  Zap,
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
  advance_payment_type?: string | null;
  advance_payment_value?: number | null;
};

interface RoomDetailExperienceProps {
  room: RoomDetailViewModel;
}

const fallbackImage = 'https://res.cloudinary.com/r929tquv/image/upload/v1784613514/ts_boat_tourism/packages/zkxrdmxykszetgupmi8d.jpg';
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

const stripHtml = (html: string | null | undefined): string => {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
};

const getStayPriceDetails = (
  arrivalStr: string,
  departureStr: string,
  weekdayPrice: number,
  weekendPrice: number
) => {
  if (!arrivalStr || !departureStr) {
    return { totalPrice: 0, pureBaseTotal: 0, weekendSurchargeTotal: 0, nightsCount: 0, weekendNightsCount: 0, breakdown: [] };
  }

  const arrival = new Date(`${arrivalStr}T00:00:00`);
  let departure = new Date(`${departureStr}T00:00:00`);

  if (departure < arrival) {
    return { totalPrice: 0, pureBaseTotal: 0, weekendSurchargeTotal: 0, nightsCount: 0, weekendNightsCount: 0, breakdown: [] };
  }

  // If arrival and departure are the same date, treat it as 1 day/night
  if (departure.getTime() === arrival.getTime()) {
    departure.setDate(departure.getDate() + 1);
  }

  let total = 0;
  let pureBaseTotal = 0;
  let weekendSurchargeTotal = 0;
  let nightsCount = 0;
  let weekendNightsCount = 0;
  const breakdown = [];

  const current = new Date(arrival);
  while (current < departure) {
    const dayOfWeek = current.getDay();
    // Saturday (6) and Sunday (0) are considered weekend nights
    const isWeekend = dayOfWeek === 6 || dayOfWeek === 0;
    const nightPrice = isWeekend ? weekendPrice : weekdayPrice;

    total += nightPrice;
    pureBaseTotal += weekdayPrice;
    if (isWeekend) {
      weekendSurchargeTotal += (weekendPrice - weekdayPrice);
      weekendNightsCount++;
    }
    
    nightsCount++;

    breakdown.push({
      dateStr: toLocalDateString(current),
      isWeekend,
      price: nightPrice
    });

    current.setDate(current.getDate() + 1);
  }

  return { 
    totalPrice: total, 
    pureBaseTotal,
    weekendSurchargeTotal,
    nightsCount: Math.max(nightsCount, 1), 
    weekendNightsCount,
    breakdown 
  };
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
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const isSpecialUser = useMemo(() => {
    if (!user) return false;
    const email = user.email || '';
    const phone = user.phone_number || '';
    const name = room.lodge_name || '';
    return (
      (email === '2024eb01987@online.bits-pilani.ac.in' || phone === '8886154275') &&
      name.toLowerCase().includes('vashista') &&
      name.toLowerCase().includes('bhadrachalam')
    );
  }, [user, room.lodge_name]);

  const validVariants = useMemo(
    () =>
      room.variants
        .filter((variant) => variant.variant_name?.trim() && Number(variant.weekday_price) > 0)
        .map((variant) => {
          if (isSpecialUser) {
            return {
              ...variant,
              weekday_price: 1,
              weekend_price: 1,
            };
          }
          return variant;
        }),
    [room.variants, isSpecialUser]
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
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const guests = adults + children;
  const [rooms, setRooms] = useState(1);
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

  const isAdmin = user?.role === 'ADMIN';
  const isAgent = user?.role === 'AGENT';
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [showFloatingWidget, setShowFloatingWidget] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowFloatingWidget(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [customPayAmount, setCustomPayAmount] = useState<string>(''); // '' = full, else rupee amount
  const [selectedGateway, setSelectedGateway] = useState<'PHONEPE' | 'CASHFREE'>('PHONEPE');

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

  // Reset custom payment when core booking parameters change so the user doesn't get stuck with an old advance amount
  useEffect(() => {
    setCustomPayAmount('');
  }, [selectedVariantId, arrivalDate, departureDate, guests]);

  useEffect(() => {
    const handlePageShow = () => {
      setIsProcessingCheckout(false);
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('restore_checkout=true')) {
      const savedCustomPay = sessionStorage.getItem('last_checkout_custom_pay');
      const savedGateway = sessionStorage.getItem('last_checkout_gateway');
      const savedVariantId = sessionStorage.getItem('last_checkout_selected_variant_id');
      const savedArrivalDate = sessionStorage.getItem('last_checkout_arrival_date');
      const savedDepartureDate = sessionStorage.getItem('last_checkout_departure_date');
      const savedGuests = sessionStorage.getItem('last_checkout_guests');
      const savedSlotIndex = sessionStorage.getItem('last_checkout_selected_slot_index');
      
      if (savedCustomPay !== null) setCustomPayAmount(savedCustomPay);
      if (savedGateway === 'PHONEPE' || savedGateway === 'CASHFREE') {
        setSelectedGateway(savedGateway as 'PHONEPE' | 'CASHFREE');
      }
      if (savedVariantId) {
        setSelectedVariantId(Number(savedVariantId));
      }
      if (savedArrivalDate) {
        setArrivalDate(savedArrivalDate);
      }
      if (savedDepartureDate) {
        setDepartureDate(savedDepartureDate);
      }
      if (savedGuests) {
        setAdults(Number(savedGuests));
      }
      if (savedSlotIndex !== null) {
        setSelectedSlotIndex(Number(savedSlotIndex));
      }
      
      // Auto-open passenger details modal
      setShowPassengerModal(true);
      
      // Clean up search parameters so refresh doesn't pop it open again
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('restore_checkout');
        window.history.replaceState({}, '', url.pathname + url.search);
      } catch (e) {
        console.error("Failed to clean restore_checkout search parameter", e);
      }
    }
  }, []);


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

  const loadedMonthsRef = useRef<Set<string>>(new Set());

  const fetchRoomAvailability = async (monthStr: string, force = false) => {
    loadedMonthsRef.current.add(monthStr);
    // Skip if already fetched for this month and we are not forcing a refetch
    if (!force && roomAvailability[monthStr] !== undefined) return;
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

    const handleBulkRefresh = (e: any) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.room_id === room.id) {
          Array.from(loadedMonthsRef.current).forEach(mStr => {
            fetchRoomAvailabilityRef.current(mStr, true);
          });
        }
      } catch (err) {
        console.error('[SSE] Failed to parse room bulk refresh payload', err);
      }
    };

    es.addEventListener('BULK_REFRESH', handleBulkRefresh);

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
          // Force a full refetch of the month to correctly evaluate if the entire date is closed
          // (since another variant or slot might still be open on this date)
          fetchRoomAvailabilityRef.current(monthStr, true);
        } else {
          setRoomAvailability(prev => {
            const next = { ...prev };
            const s = next[monthStr] ? new Set(next[monthStr]) : new Set<string>();
            
            // Re-evaluate 6 AM cutoff locally before adding to open dates
            const isToday = travel_date === getLocalToday();
            const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
            const isAfter6am = d.getHours() >= 6;
            
            if (!(isToday && isAfter6am)) {
              s.add(travel_date);
            }
            
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
      es.removeEventListener('BULK_REFRESH', handleBulkRefresh);
      es.close();
    };
  }, [room.id]);

  // Calculate real-time available rooms for the selected dates and variant
  const maxAvailableRooms = useMemo(() => {
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
    if (maxAllowed > 0 && (adults + children) > maxAllowed) {
      const nextAdults = Math.min(adults, maxAllowed);
      setAdults(nextAdults);
      setChildren(Math.min(children, Math.max(0, maxAllowed - nextAdults)));
    }
  }, [maxAvailableRooms, selectedVariantId, validVariants, adults, children]);

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
        ticket_count: guests,
        travel_date: arrivalDate
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

    // Trigger Google Ads conversion event
    reportBookNowConversion();

    setShowPassengerModal(true);
  };

  const handleCheckoutSubmit = async (passengers: any[], quickBooking: boolean = false, customerEmail?: string) => {
    setIsProcessingCheckout(true);
    try {
      if (isAdmin) {
        const adminPayload = {
          target_type: 'room',
          travel_date: arrivalDate,
          departure_date: departureDate,
          quantity: guests,
          room_variant_id: selectedVariantId,
          adult_count: adults,
          child_count: children,
          slot_start: selectedSlot?.slot_start,
          slot_end: selectedSlot?.slot_end,
          passengers: passengers.map(p => ({
            ...p,
            aadhaar: p.aadhaar || undefined,
            phone: p.phone || undefined,
          })),
          amount_paid: customPayAmount !== '' ? Number(customPayAmount) : undefined,
          quick_booking: quickBooking,
          customer_email: customerEmail,
        };
        const res = await apiClient.post('/api/v1/admin/bookings/create', adminPayload);
        toast.success(`Booking ${res.data.public_id} created successfully!`);
        router.push(`/admin/bookings?new_booking=${res.data.public_id}`);
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
        adult_count: adults,
        child_count: children,
        slot_start: selectedSlot?.slot_start,
        slot_end: selectedSlot?.slot_end,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        passengers: passengers.map((p: any) => ({
          ...p,
          aadhaar: p.aadhaar || undefined,
          phone: p.phone || undefined,
        })),
        payment_percentage: paymentPercentage,
        expected_amount: finalTotal,
        quick_booking: quickBooking,
        customer_email: customerEmail,
        gateway: selectedGateway,
      };

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('last_checkout_source', window.location.pathname + window.location.search);
        sessionStorage.setItem('last_checkout_passengers', JSON.stringify(passengers));
        sessionStorage.setItem('last_checkout_email', customerEmail || '');
        sessionStorage.setItem('last_checkout_custom_pay', customPayAmount || '');
        sessionStorage.setItem('last_checkout_gateway', selectedGateway);
        sessionStorage.setItem('last_checkout_quick_booking', String(quickBooking));
        sessionStorage.setItem('last_checkout_selected_variant_id', String(selectedVariantId || ''));
        sessionStorage.setItem('last_checkout_arrival_date', arrivalDate || '');
        sessionStorage.setItem('last_checkout_departure_date', departureDate || '');
        sessionStorage.setItem('last_checkout_guests', String(guests || ''));
        sessionStorage.setItem('last_checkout_selected_slot_index', String(selectedSlotIndex));
      }

      const res = await apiClient.post('/api/v1/bookings/checkout', payload);

      const { checkout_data } = res.data;

      if (!checkout_data) {
        toast.error("Failed to initialize payment gateway. Please try again.");
        setIsProcessingCheckout(false);
        return;
      }

      if (checkout_data.gateway === 'CASHFREE') {
        // Cashfree Popup Flow
        if (!checkout_data.payment_session_id) {
          toast.error("Cashfree session creation failed. Please try again.");
          setIsProcessingCheckout(false);
          return;
        }
        toast.success("Opening Cashfree secure checkout...");
        // Dynamically load Cashfree JS SDK
        const loadCashfreeSDK = () => new Promise<void>((resolve, reject) => {
          if ((window as any).Cashfree) { resolve(); return; }
          const script = document.createElement('script');
          script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Cashfree SDK'));
          document.head.appendChild(script);
        });
        await loadCashfreeSDK();
        const cfMode = (checkout_data.mode === 'production' || checkout_data.mode === 'sandbox')
          ? checkout_data.mode
          : (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'sandbox' : 'production');
        console.log("[Cashfree Room Checkout] Initialized with cfMode:", cfMode, "checkout_data:", checkout_data);
        const cashfree = (window as any).Cashfree({ mode: cfMode });
        cashfree.checkout({
          paymentSessionId: checkout_data.payment_session_id,
          redirectTarget: "_self"
        }).then((result: any) => {
          if (result && result.error) {
            console.warn("Cashfree checkout closed/failed:", result.error);
            toast.error(result.error.message || "Payment closed or failed.");
            setIsProcessingCheckout(false);
          }
        }).catch((err: any) => {
          console.error("Cashfree checkout error:", err);
          setIsProcessingCheckout(false);
        });
      } else {
        // PhonePe Redirect Flow
        if (!checkout_data.redirect_url) {
          toast.error("Failed to initialize PhonePe gateway. Please try again.");
          setIsProcessingCheckout(false);
          return;
        }
        toast.success("Redirecting to secure PhonePe checkout...");
        setTimeout(() => {
          window.location.href = checkout_data.redirect_url;
        }, 1000);
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
        errMsg = err.message;
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
  const derivedRooms = Math.ceil(guests / capacity);
  const roomsCount = Math.max(rooms, derivedRooms);

  const stayDetails = useMemo(() => {
    const weekday = Number(selectedVariant?.weekday_price || room.starting_price || 0);
    const weekend = Number(selectedVariant?.weekend_price || selectedVariant?.weekday_price || room.starting_price || 0);
    return getStayPriceDetails(arrivalDate, departureDate, weekday, weekend);
  }, [arrivalDate, departureDate, selectedVariant, room.starting_price]);

  const isWeekend = useMemo(() => {
    if (!arrivalDate) return false;
    const date = new Date(`${arrivalDate}T00:00:00`);
    const day = date.getDay();
    return day === 6 || day === 0;
  }, [arrivalDate]);

  const price = useMemo(() => {
    const weekday = Number(selectedVariant?.weekday_price || room.starting_price || 0);
    const weekend = Number(selectedVariant?.weekend_price || selectedVariant?.weekday_price || room.starting_price || 0);
    return isWeekend ? weekend : weekday;
  }, [isWeekend, selectedVariant, room.starting_price]);

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
        agentDiscount = Math.min(grandTotal, Number(((subtotal * commissionPercentage) / 100).toFixed(2)));
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
    const handleAutoApplyEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      const code = customEvent.detail?.code;
      if (code) {
        const trimmedCode = code.trim().toUpperCase();
        setCouponCode(trimmedCode);
        if (prices.rawSubtotal > 0) {
          validateCoupon(trimmedCode);
        } else {
          setCouponSuccess("Coupon code filled! Select dates & rooms to apply.");
          setCouponError(null);
        }
      }
    };

    window.addEventListener('apply-coupon', handleAutoApplyEvent);
    
    const storedCoupon = localStorage.getItem('pending_coupon');
    if (storedCoupon) {
      const trimmedCode = storedCoupon.trim().toUpperCase();
      setCouponCode(trimmedCode);
      setCouponSuccess("Coupon code filled! Select dates & rooms to apply.");
      localStorage.removeItem('pending_coupon');
    }

    return () => {
      window.removeEventListener('apply-coupon', handleAutoApplyEvent);
    };
  }, [prices.rawSubtotal]);

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
    <main className="bg-[#fafaf7] pb-20 text-slate-900 lg:pb-0 overflow-x-hidden w-full max-w-full">
      <RoomHero
        lodgeName={room.lodge_name}
        coverImage={room.cover_image_url}
        address={room.address}
        isFeatured={room.is_featured}
        startingPrice={price ? price : room.starting_price}
        totalRooms={room.total_rooms ?? undefined}
        gallery={room.gallery}
      />

      <section className="mx-auto grid w-full max-w-[1600px] gap-6 sm:gap-10 px-3 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-12 lg:py-14 overflow-hidden">
        <div className="space-y-8 min-w-0 w-full max-w-full">
          {/* Stay Overview Section */}
          <section id="overview" className="scroll-mt-[140px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300">
            <div className="border-b border-slate-100 bg-slate-50/80 p-4 sm:p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-3 min-w-0">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0d6e75]/10 border border-[#0d6e75]/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#0d6e75]">
                  <Sparkles className="h-3 w-3 text-[#0d6e75]" />
                  <span>PROPERTY SUMMARY</span>
                </span>
                <h2 className="mt-2 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                  Stay Overview
                </h2>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Essential accommodation details and location summary for your reservation
                </p>
              </div>
            </div>
            <div className="p-5 md:p-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-[#fafaf7] p-4 flex items-start gap-3.5">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0d6e75] text-white shadow-sm">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Location / Address</p>
                    <p className="mt-0.5 text-xs font-black text-slate-900 break-words leading-snug">{room.address || 'Bhadrachalam, Telangana'}</p>
                    <p className="mt-1 text-[10px] font-semibold text-slate-500">Tourist destination route</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-[#fafaf7] p-4 flex items-start gap-3.5">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0d6e75] text-white shadow-sm">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Check-in / Out</p>
                    <p className="mt-0.5 text-xs font-black text-slate-900">{cleanTime(selectedSlot?.slot_start)} - {cleanTime(selectedSlot?.slot_end)}</p>
                    <p className="mt-1 text-[10px] font-semibold text-slate-500">Standard stay timing</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-[#fafaf7] p-4 flex items-start gap-3.5">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0d6e75] text-white shadow-sm">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Rooms</p>
                    <p className="mt-0.5 text-xs font-black text-slate-900">{room.total_rooms ? `${room.total_rooms} Rooms Available` : '12 Verified Rooms'}</p>
                    <p className="mt-1 text-[10px] font-semibold text-slate-500">Live online availability</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-[#fafaf7] p-4 flex items-start gap-3.5">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0d6e75] text-white shadow-sm">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Room Occupancy</p>
                    <p className="mt-0.5 text-xs font-black text-slate-900">Up to {capacity} Guests / Room</p>
                    <p className="mt-1 text-[10px] font-semibold text-slate-500">Family & group friendly</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Facilities & Services Section */}
          {facilities.length > 0 && (
            <section id="facilities" className="scroll-mt-[140px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300">
              <div className="border-b border-slate-100 bg-slate-50/80 p-5 md:p-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0d6e75]/10 border border-[#0d6e75]/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#0d6e75]">
                  <Wifi className="h-3 w-3 text-[#0d6e75]" />
                  <span>RESORT AMENITIES</span>
                </span>
                <h2 className="mt-2 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                  Facilities & Services
                </h2>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Complimentary amenities provided on-site for guest convenience
                </p>
              </div>
              <div className="p-5 md:p-6">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {facilities.map((facility) => {
                    const lower = facility.toLowerCase();
                    let IconComp = CheckCircle2;
                    let subtext = "Verified property facility";
                    
                    if (lower.includes('park') || lower.includes('car')) {
                      IconComp = Car;
                      subtext = "Complimentary vehicle parking";
                    } else if (lower.includes('water') || lower.includes('hot')) {
                      IconComp = ThermometerSun;
                      subtext = "24/7 hot water supply";
                    } else if (lower.includes('power') || lower.includes('invert') || lower.includes('backup')) {
                      IconComp = Zap;
                      subtext = "Continuous power backup";
                    } else if (lower.includes('room service') || lower.includes('service')) {
                      IconComp = Utensils;
                      subtext = "Prompt room assistance";
                    } else if (lower.includes('ac') || lower.includes('air')) {
                      IconComp = Wind;
                      subtext = "Climate controlled room";
                    } else if (lower.includes('tv') || lower.includes('television')) {
                      IconComp = Tv;
                      subtext = "Satellite channels available";
                    } else if (lower.includes('wifi') || lower.includes('internet')) {
                      IconComp = Wifi;
                      subtext = "High speed internet access";
                    }

                    return (
                      <div
                        key={facility}
                        className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs transition hover:border-[#0d6e75]/40 hover:bg-[#0d6e75]/5"
                      >
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0d6e75]/10 text-[#0d6e75]">
                          <IconComp className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-slate-900 truncate">{facility}</p>
                          <p className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">{subtext}</p>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[8px] font-black text-emerald-700 uppercase tracking-widest shrink-0">
                          ✓ Available
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Stay Categories & Tariffs Section */}
          {validVariants.length > 0 && (
            <section id="categories" className="scroll-mt-[140px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300">
              <div className="border-b border-slate-100 bg-slate-50/80 p-5 md:p-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0d6e75]/10 border border-[#0d6e75]/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#0d6e75]">
                  <BedDouble className="h-3 w-3 text-[#0d6e75]" />
                  <span>ROOM TARIFFS</span>
                </span>
                <h2 className="mt-2 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                  Stay Categories
                </h2>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Choose a room category to configure your live reservation price
                </p>
              </div>
              <div className="p-5 md:p-6">
                <div className="grid gap-4">
                  {validVariants.map((variant) => {
                    const active = selectedVariant?.id === variant.id;
                    return (
                      <div
                        key={variant.id}
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`cursor-pointer rounded-2xl border p-5 transition-all duration-200 ${
                          active
                            ? 'border-[#0d6e75] bg-white ring-2 ring-[#0d6e75]/15 shadow-md'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base font-black text-slate-900">{variant.variant_name}</h3>
                              {variant.capacity_per_room && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#0d6e75]/10 px-2.5 py-0.5 text-[10px] font-black text-[#0d6e75]">
                                  <Users className="h-3 w-3" />
                                  {variant.capacity_per_room} Guests / Room
                                </span>
                              )}
                              {active && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#0d6e75] px-2.5 py-0.5 text-[9px] font-black text-white uppercase tracking-widest">
                                  ✓ Selected
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-slate-500">
                              Air-cooled luxury cottage accommodation with attached private washroom &amp; verified room service.
                            </p>
                            <div className="flex flex-wrap gap-2 pt-1">
                              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-bold text-slate-600">
                                Attached Bath
                              </span>
                              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-bold text-slate-600">
                                Hot Water
                              </span>
                              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-bold text-slate-600">
                                Power Backup
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 bg-[#fafaf7] p-3.5 rounded-xl border border-slate-200/80 w-full sm:w-auto">
                            <div className="text-left">
                              <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Weekday Fare</p>
                              <p className="text-sm font-black text-[#0d6e75]">{money(variant.weekday_price)}</p>
                              <p className="text-[9px] text-slate-400 font-semibold">Mon–Fri / night</p>
                            </div>
                            <div className="h-8 w-px bg-slate-200" />
                            <div className="text-left">
                              <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Weekend Fare</p>
                              <p className="text-sm font-black text-amber-600">{money(variant.weekend_price)}</p>
                              <p className="text-[9px] text-slate-400 font-semibold">Sat–Sun / night</p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedVariantId(variant.id);
                                setIsBookingModalOpen(true);
                              }}
                              className={`ml-2 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors shrink-0 ${
                                active
                                  ? 'bg-[#0d6e75] text-white hover:bg-[#0b5c62] shadow-sm'
                                  : 'bg-white border border-[#0d6e75] text-[#0d6e75] hover:bg-[#0d6e75] hover:text-white'
                              }`}
                            >
                              {active ? 'Book Now' : 'Select'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Highlights & Location Section */}
          <section id="highlights" className="scroll-mt-[140px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300">
            <div className="border-b border-slate-100 bg-slate-50/80 p-5 md:p-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0d6e75]/10 border border-[#0d6e75]/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#0d6e75]">
                <Star className="h-3 w-3 text-[#0d6e75]" />
                <span>LOCATION &amp; ADVANTAGES</span>
              </span>
              <h2 className="mt-2 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                Highlights &amp; Location
              </h2>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                Key property features, mandatory reporting hub, and interactive map directions
              </p>
            </div>
            <div className="p-5 md:p-6 space-y-6">
              {/* Mandatory Guest Reporting Office Banner */}
              <div className="rounded-2xl border border-amber-300 bg-amber-500/10 p-3.5 sm:p-5 shadow-2xs">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0d6e75] text-white shadow-sm">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-full bg-amber-600 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                        MANDATORY FIRST GUEST STOP
                      </span>
                      <span className="text-xs font-extrabold text-amber-950">
                        TS Boat Tourism Main Office (Bhadrachalam)
                      </span>
                    </div>
                    <h4 className="mt-1.5 text-sm font-black text-slate-900">
                      Must Report Here First Before Reaching Room / Resort
                    </h4>
                    <p className="mt-1 text-xs font-bold text-slate-700 leading-relaxed">
                      All stay guests <strong>MUST first report to our TS Boat Tourism Central Office in Bhadrachalam</strong> prior to check-in. Our team will verify your booking, register Government IDs, issue your official physical room vouchers, and coordinate your resort directions.
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-extrabold text-slate-800">
                      <div className="flex items-center gap-1.5 text-[#0d6e75] min-w-0">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="break-words min-w-0">Om Shanthi Building Sataram, Kalyana Mandapam Road, Bhadrachalam</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-200 text-slate-900">
                        <Phone className="h-3.5 w-3.5 text-[#0d6e75]" />
                        <span>+91 99513 69573 / +91 77801 19268</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Left: Highlights list */}
                <div className="space-y-3">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Key Stay Highlights</p>
                  {room.highlights.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                      {room.highlights.map((highlight) => (
                        <div key={highlight.id} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-500/10 text-amber-600">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900">{highlight.title}</p>
                            <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Verified tourism facility highlight</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#0d6e75]/10 text-[#0d6e75]">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900">Prime Eco-Tourism Location</p>
                          <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Situated along scenic Bhadrachalam &amp; Papikondalu routes.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#0d6e75]/10 text-[#0d6e75]">
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900">TS Tourism Verified Standards</p>
                          <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Certified cleanliness, safety protocols &amp; genuine tariffs.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#0d6e75]/10 text-[#0d6e75]">
                          <Zap className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900">Power Backup &amp; Hot Water</p>
                          <p className="text-[10px] font-semibold text-slate-500 mt-0.5">24/7 hot water supply and inverter power backup guaranteed.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#0d6e75]/10 text-[#0d6e75]">
                          <Car className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900">On-Site Parking Available</p>
                          <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Direct road access with safe parking for tourist vehicles.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Map */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">Interactive Location Map</p>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(room.address || room.lodge_name || 'Bhadrachalam')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-black text-[#0d6e75] hover:underline"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  <div className="relative h-[260px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner">
                    <iframe
                      title={`${room.lodge_name} map`}
                      src={embedUrl || `https://maps.google.com/maps?q=${encodeURIComponent(room.address || room.lodge_name || 'Bhadrachalam')}&z=14&output=embed`}
                      className="h-full w-full border-0"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stay Timings Section */}
          {slots.length > 0 && (
            <section id="timings" className="scroll-mt-[140px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300">
              <div className="border-b border-slate-100 bg-slate-50/80 p-5 md:p-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0d6e75]/10 border border-[#0d6e75]/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#0d6e75]">
                  <Clock className="h-3 w-3 text-[#0d6e75]" />
                  <span>BOOKING SLOTS</span>
                </span>
                <h2 className="mt-2 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                  Stay Timings &amp; Schedule
                </h2>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Standard check-in and check-out schedule for your reservation
                </p>
              </div>
              <div className="p-5 md:p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {slots.map((slot, index) => (
                    <div key={`${slot.title}-${index}`} className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0d6e75]/10 text-[#0d6e75]">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-900">{slot.title || 'Standard Stay Slot'}</h3>
                        <p className="mt-1 text-sm font-black text-[#0d6e75]">
                          {cleanTime(slot.slot_start)} — {cleanTime(slot.slot_end)}
                        </p>
                        <p className="mt-1 text-[10px] font-semibold text-slate-400">Overnight stay schedule</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Stay FAQs Section */}
          {room.faqs.length > 0 && (
            <section id="faqs" className="scroll-mt-[140px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300">
              <div className="border-b border-slate-100 bg-slate-50/80 p-5 md:p-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0d6e75]/10 border border-[#0d6e75]/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#0d6e75]">
                  <HelpCircle className="h-3 w-3 text-[#0d6e75]" />
                  <span>FREQUENTLY ASKED</span>
                </span>
                <h2 className="mt-2 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                  Stay FAQs
                </h2>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Common questions regarding room bookings and property guidelines
                </p>
              </div>
              <div className="p-5 md:p-6">
                <div className="grid gap-3">
                  {room.faqs.map((faq) => (
                    <details key={faq.id} className="group rounded-xl border border-slate-200 bg-white p-4 transition duration-200 hover:border-slate-300">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-xs font-black text-slate-900 focus:outline-none">
                        <span>{faq.question}</span>
                        <HelpCircle className="h-4 w-4 shrink-0 text-[#0d6e75]" />
                      </summary>
                      <p className="mt-3 text-xs font-semibold leading-relaxed text-slate-600 border-t border-slate-100 pt-3">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Stay Policies Section */}
          {room.policies.length > 0 && (
            <section id="policies" className="scroll-mt-[140px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300">
              <div className="border-b border-slate-100 bg-slate-50/80 p-5 md:p-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0d6e75]/10 border border-[#0d6e75]/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#0d6e75]">
                  <FileText className="h-3 w-3 text-[#0d6e75]" />
                  <span>TERMS &amp; CONDITIONS</span>
                </span>
                <h2 className="mt-2 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                  Stay Policies
                </h2>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Cancellation rules, payment guidelines, and guest ID requirements
                </p>
              </div>
              <div className="p-5 md:p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {room.policies.map((policy) => (
                    <div key={policy.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#0d6e75]">
                        {formatPolicyType(policy.type)}
                      </span>
                      <h3 className="mt-2 text-xs font-black text-slate-900">{policy.title}</h3>
                      <p className="mt-1.5 text-xs font-semibold leading-relaxed text-slate-500">{policy.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Stay Gallery Section */}
          {slides.length > 0 && (
            <section id="gallery" className="scroll-mt-[140px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300">
              <div className="border-b border-slate-100 bg-slate-50/80 p-5 md:p-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0d6e75]/10 border border-[#0d6e75]/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#0d6e75]">
                  <Camera className="h-3 w-3 text-[#0d6e75]" />
                  <span>PROPERTY PHOTOS</span>
                </span>
                <h2 className="mt-2 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                  Stay Gallery
                </h2>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Browse room photos and resort surroundings
                </p>
              </div>
              <div className="p-5 md:p-6">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {slides.map((slide, index) => (
                    <button
                      key={slide.id || index}
                      type="button"
                      onClick={() => {
                        setActiveSlide(index);
                        setLightboxOpen(true);
                      }}
                      className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition hover:scale-[1.02] hover:shadow-md hover:border-[#0d6e75]"
                      aria-label={`View photo ${index + 1}`}
                    >
                      <Image src={getHdImageUrl(slide.image_url || fallbackImage)} alt={slide.alt_text || `Gallery photo ${index + 1}`} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover" quality={85} />
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
        <aside className="hidden lg:block lg:pt-1 self-start sticky top-[92px]">
          <div className="w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg transition duration-300 hover:shadow-xl">

            {/* Header Banner - Matching Packages Image 2 */}
            <div className="flex items-center justify-between bg-[#0d6e75] px-5 py-3.5 text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span className="text-xs font-black uppercase tracking-widest text-white">Fast Online Booking</span>
              </div>
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white backdrop-blur-sm">
                Live Fare
              </span>
            </div>

            {/* Top Price Bar with Book Now Button - Matching Packages Image 2 */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-gradient-to-b from-[#0d6e75]/5 to-transparent">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Starting Price</p>
                <p className="mt-0.5 text-2xl font-black text-slate-900">
                  {money(price || room.starting_price)}{' '}
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">/ night</span>
                </p>
              </div>

              <button
                type="button"
                disabled={isLodgeInactive}
                onClick={() => setIsBookingModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-[#0d6e75] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md transition hover:bg-[#0b5c62] hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <span>Reserve Now</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Stay Categories & Tariffs List - Matching Packages Image 2 */}
            {validVariants.length > 0 && (
              <div className="p-5 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Stay Categories &amp; Tariffs</p>
                <div className="grid gap-3">
                  {validVariants.map((variant) => {
                    const isSel = selectedVariantId === variant.id;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => {
                          setSelectedVariantId(variant.id);
                        }}
                        className={`w-full rounded-2xl border p-4 text-left transition-all ${
                          isSel
                            ? 'border-[#0d6e75] bg-[#0d6e75]/5 ring-2 ring-[#0d6e75]/10 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">{variant.variant_name}</h4>
                              {isSel && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#0d6e75] px-2 py-0.5 text-[8px] font-black text-white uppercase tracking-widest shrink-0 whitespace-nowrap">
                                  ✓ Selected
                                </span>
                              )}
                            </div>
                            {variant.capacity_per_room && (
                              <p className="text-[10px] font-semibold text-slate-400 mt-1">{variant.capacity_per_room} guests per room</p>
                            )}
                          </div>
                        </div>

                        {/* Weekday & Weekend Fares Table - Matching Packages Image 2 */}
                        <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-white border border-slate-150 p-2.5 text-center">
                          <div>
                            <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">Weekday Fares</p>
                            <p className="text-xs font-black text-[#0d6e75] mt-0.5">{money(variant.weekday_price)}</p>
                          </div>
                          <div className="border-l border-slate-150 pl-2">
                            <p className="text-[8px] font-black uppercase tracking-wider text-amber-600">Weekend / Peak</p>
                            <p className="text-xs font-black text-amber-700 mt-0.5">{money(variant.weekend_price)}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Included Stay Amenities - Matching Packages Image 2 */}
            <div className="px-5 pb-5 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Included Stay Amenities</p>
              <div className="space-y-2 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-2.5 rounded-xl border border-slate-150 bg-slate-50/50 p-3">
                  <ShieldCheck className="h-4 w-4 text-[#0d6e75] shrink-0" />
                  <span>Verified Tourism Lodging &amp; Support</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl border border-slate-150 bg-slate-50/50 p-3">
                  <Clock className="h-4 w-4 text-[#0d6e75] shrink-0" />
                  <span>Standard Timing: {cleanTime(selectedSlot?.slot_start)} - {cleanTime(selectedSlot?.slot_end)}</span>
                </div>
              </div>

              {/* Reserve Button */}
              <button
                type="button"
                disabled={isLodgeInactive}
                onClick={() => setIsBookingModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0d6e75] py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md transition hover:bg-[#0b5c62] hover:shadow-lg active:scale-98 disabled:opacity-50"
              >
                <span>Reserve Stay Now</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>
      </section>

      {/* Floating Action Bar (Desktop bottom right widget stacked above WhatsApp) - Matching Packages */}
      {showFloatingWidget && (
        <div className="fixed bottom-6 right-6 z-40 hidden lg:flex items-center gap-3 rounded-full bg-[#0d6e75] p-2 pr-5 text-white shadow-2xl transition-all hover:scale-105">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <Sparkles className="h-5 w-5 text-amber-300" />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-[#e5dac5]">From {money(price || room.starting_price)} · Live Fare</p>
            <p className="text-xs font-black">{room.lodge_name}</p>
          </div>
          <button
            type="button"
            onClick={() => setIsBookingModalOpen(true)}
            className="ml-2 flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-black text-[#0d6e75] uppercase tracking-wider transition hover:bg-slate-100"
          >
            <span>Book Now</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Mobile Floating Bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/90 bg-white/95 p-3 shadow-[0_-10px_28px_rgba(15,61,86,0.14)] backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
              Total ({roomsCount} {roomsCount === 1 ? 'room' : 'rooms'}){isAgent && prices.agentPayable < prices.grandTotal ? ' · Agent Rate' : ''}
            </p>
            <p className="text-xl font-black text-[#102231] min-[380px]:text-2xl font-black">
              {(isAgent ? prices.agentPayable : prices.grandTotal) ? money(isAgent ? prices.agentPayable : prices.grandTotal) : money(price * roomsCount)}
            </p>
          </div>
          {isLodgeInactive ? (
            <button disabled className="flex h-12 shrink-0 items-center justify-center rounded-full bg-slate-400 px-6 text-sm font-black uppercase tracking-[0.14em] text-white cursor-not-allowed">
              Closed
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsBookingModalOpen(true)}
              className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#0d6e75] px-6 text-xs font-black uppercase tracking-[0.14em] text-white shadow-md cursor-pointer active:scale-95"
            >
              <span>Reserve Now</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Booking Modal Dialog Overlay (Desktop & Mobile) - Matching BookingDialogV3 on Packages (Image 5) */}
      {isBookingModalOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsBookingModalOpen(false); }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsBookingModalOpen(false)} />

          {/* Dialog Panel — slides up from bottom on mobile (Image 5 style), centered on desktop */}
          <div className="relative z-10 w-full max-w-full sm:max-w-[660px] flex flex-col h-[92dvh] sm:h-auto sm:max-h-[86vh] bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-250">

            {/* Modal Header — Image 5 Teal Header */}
            <div className="bg-gradient-to-r from-[#0d6e75] to-[#0b5c62] px-5 sm:px-6 py-3.5 text-white flex items-center justify-between shrink-0 shadow-md">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#c8e6e8] flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 fill-amber-400 text-amber-400" />
                  Verified Reservation Portal
                </span>
                <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                  Configure Stay Reservation
                </h2>
                <p className="text-[10px] font-bold text-white/70 truncate max-w-[280px]">{room.lodge_name}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                className="ml-4 shrink-0 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 min-h-0">
              <div className="p-4 sm:p-6 space-y-5">
              {isLodgeInactive ? (
                <div className="rounded-xl border border-rose-100 bg-rose-500/5 p-4 text-xs text-rose-600 font-bold flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-black text-sm">Online Bookings Suspended</p>
                    <p className="text-slate-500 font-semibold text-xs mt-1">
                      This stay / lodge is currently closed or inactive.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Step 1: Select Dates */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#0d6e75] mb-2 flex items-center gap-1.5">
                      <span className="grid h-4.5 w-4.5 place-items-center rounded-full bg-[#0d6e75] text-[9px] text-white">1</span>
                      Select Dates
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <CustomDatePicker
                        label="Arrival"
                        align="left"
                        value={arrivalDate}
                        min={today}
                        disabled={isLodgeInactive}
                        availableDates={allAvailableDates}
                        onMonthChange={fetchRoomAvailability}
                        isAdmin={isAdmin}
                        weekdayPrice={Number(selectedVariant?.weekday_price || room.starting_price || 0)}
                        weekendPrice={Number(selectedVariant?.weekend_price || selectedVariant?.weekday_price || room.starting_price || 0)}
                        detailedAvailability={detailedAvailability}
                        selectedVariantId={selectedVariantId || validVariants[0]?.id}
                        selectedSlotKey={`${selectedSlot?.slot_start?.slice(0, 5) || "12:00"}-${selectedSlot?.slot_end?.slice(0, 5) || "11:00"}`}
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
                        weekdayPrice={Number(selectedVariant?.weekday_price || room.starting_price || 0)}
                        weekendPrice={Number(selectedVariant?.weekend_price || selectedVariant?.weekday_price || room.starting_price || 0)}
                        detailedAvailability={detailedAvailability}
                        selectedVariantId={selectedVariantId || validVariants[0]?.id}
                        selectedSlotKey={`${selectedSlot?.slot_start?.slice(0, 5) || "12:00"}-${selectedSlot?.slot_end?.slice(0, 5) || "11:00"}`}
                        onChange={setDepartureDate}
                      />
                    </div>
                  </div>

                  {/* Step 2: Stay Category */}
                  {validVariants.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#0d6e75] mb-2 flex items-center gap-1.5">
                        <span className="grid h-4.5 w-4.5 place-items-center rounded-full bg-[#0d6e75] text-[9px] text-white">2</span>
                        Stay Category
                      </p>
                      <div className="grid gap-2">
                        {validVariants.map((variant) => {
                          const isSel = selectedVariantId === variant.id;
                          return (
                            <button
                              key={variant.id}
                              type="button"
                              disabled={isLodgeInactive}
                              onClick={() => setSelectedVariantId(variant.id)}
                              className={`flex items-start justify-between gap-3 rounded-xl border p-3.5 text-left transition-all ${
                                isSel
                                  ? 'border-[#0d6e75] bg-[#0d6e75]/5 text-slate-900 ring-2 ring-[#0d6e75]/10'
                                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <p className="text-xs font-black text-slate-800">{variant.variant_name}</p>
                                  {isSel && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#0d6e75] px-2 py-0.5 text-[8px] font-black text-white uppercase tracking-widest shrink-0 whitespace-nowrap">
                                      ✓ Selected
                                    </span>
                                  )}
                                </div>
                                {variant.capacity_per_room && (
                                  <p className="text-[9px] font-bold text-slate-400 mt-0.5">{variant.capacity_per_room} guests/room</p>
                                )}
                              </div>
                              <p className="text-xs font-black text-[#0d6e75] shrink-0">
                                {money(isWeekend ? variant.weekend_price : variant.weekday_price)}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Check-in Timing */}
                  {slots.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#0d6e75] mb-2 flex items-center gap-1.5">
                        <span className="grid h-4.5 w-4.5 place-items-center rounded-full bg-[#0d6e75] text-[9px] text-white">3</span>
                        Check-in/out Timing
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {slots.map((slot, index) => {
                          const isSel = selectedSlotIndex === index;
                          return (
                            <button
                              key={index}
                              type="button"
                              disabled={isLodgeInactive}
                              onClick={() => {
                                setSelectedSlotIndex(index);
                                if (arrivalDate && departureDate) {
                                  const sStart = slot?.slot_start || "";
                                  const sEnd = slot?.slot_end || "";
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
                              className={`rounded-lg border px-3 py-2 text-left transition-all ${
                                isSel
                                  ? 'border-[#0d6e75] bg-[#0d6e75]/5 text-[#0d6e75] ring-2 ring-[#0d6e75]/10'
                                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <p className="text-[10px] font-black">{slot.title}</p>
                              <p className="text-[9px] font-bold text-slate-450 mt-0.5">{cleanTime(slot.slot_start)} - {cleanTime(slot.slot_end)}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Step 4: Rooms & Guests (Adults & Children) */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#0d6e75] mb-2 flex items-center gap-1.5">
                      <span className="grid h-4.5 w-4.5 place-items-center rounded-full bg-[#0d6e75] text-[9px] text-white">4</span>
                      Rooms &amp; Guests
                    </p>
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
                      {/* Rooms Counter */}
                      <div className={`rounded-xl border p-1.5 sm:p-2.5 flex flex-col justify-between ${isLodgeInactive ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-white border-slate-200'}`}>
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1 truncate">Rooms</span>
                        <div className="flex items-center justify-between gap-1">
                          <button
                            type="button"
                            disabled={isLodgeInactive || roomsCount <= 1}
                            onClick={() => setRooms((r) => Math.max(1, Math.min(r, roomsCount) - 1))}
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-500 transition ${isLodgeInactive || roomsCount <= 1 ? 'cursor-not-allowed opacity-30' : 'hover:bg-slate-100 hover:text-[#0d6e75]'}`}
                            aria-label="Decrease rooms"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-black text-slate-800 truncate text-center">{roomsCount}</span>
                          <button
                            type="button"
                            disabled={isLodgeInactive || roomsCount >= maxAvailableRooms}
                            onClick={() => setRooms((r) => Math.min(maxAvailableRooms, Math.max(r, roomsCount) + 1))}
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-500 transition ${isLodgeInactive || roomsCount >= maxAvailableRooms ? 'cursor-not-allowed opacity-30' : 'hover:bg-slate-100 hover:text-[#0d6e75]'}`}
                            aria-label="Increase rooms"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Adults Counter */}
                      <div className={`rounded-xl border p-1.5 sm:p-2.5 flex flex-col justify-between ${isLodgeInactive ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-white border-slate-200'}`}>
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1 truncate">Adults</span>
                        <div className="flex items-center justify-between gap-1">
                          <button
                            type="button"
                            disabled={isLodgeInactive || adults <= 1}
                            onClick={() => setAdults((val) => Math.max(1, val - 1))}
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-500 transition ${isLodgeInactive || adults <= 1 ? 'cursor-not-allowed opacity-30' : 'hover:bg-slate-100 hover:text-[#0d6e75]'}`}
                            aria-label="Decrease adults"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-black text-slate-800 truncate text-center">{adults}</span>
                          <button
                            type="button"
                            disabled={isLodgeInactive || (adults + children) >= (maxAvailableRooms * capacity)}
                            onClick={() => {
                              const nextAdults = Math.min(maxAvailableRooms * capacity - children, adults + 1);
                              setAdults(nextAdults);
                              const neededR = Math.ceil((nextAdults + children) / capacity);
                              if (neededR > rooms) setRooms(neededR);
                            }}
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-500 transition ${isLodgeInactive || (adults + children) >= (maxAvailableRooms * capacity) ? 'cursor-not-allowed opacity-30' : 'hover:bg-slate-100 hover:text-[#0d6e75]'}`}
                            aria-label="Increase adults"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Children Counter */}
                      <div className={`rounded-xl border p-1.5 sm:p-2.5 flex flex-col justify-between ${isLodgeInactive ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-white border-slate-200'}`}>
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1 truncate">Children</span>
                        <div className="flex items-center justify-between gap-1">
                          <button
                            type="button"
                            disabled={isLodgeInactive || children <= 0}
                            onClick={() => setChildren((val) => Math.max(0, val - 1))}
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-500 transition ${isLodgeInactive || children <= 0 ? 'cursor-not-allowed opacity-30' : 'hover:bg-slate-100 hover:text-[#0d6e75]'}`}
                            aria-label="Decrease children"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-black text-slate-800 truncate text-center">{children}</span>
                          <button
                            type="button"
                            disabled={isLodgeInactive || (adults + children) >= (maxAvailableRooms * capacity)}
                            onClick={() => {
                              const nextChild = Math.min(maxAvailableRooms * capacity - adults, children + 1);
                              setChildren(nextChild);
                              const neededR = Math.ceil((adults + nextChild) / capacity);
                              if (neededR > rooms) setRooms(neededR);
                            }}
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-500 transition ${isLodgeInactive || (adults + children) >= (maxAvailableRooms * capacity) ? 'cursor-not-allowed opacity-30' : 'hover:bg-slate-100 hover:text-[#0d6e75]'}`}
                            aria-label="Increase children"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-1.5 px-0.5">
                      {selectedVariant?.capacity_per_room ? <p className="text-[10px] font-semibold text-slate-400">{selectedVariant.capacity_per_room} guests/room capacity</p> : <div />}
                      <p className={`text-[10px] font-bold ${arrivalDate && maxAvailableRooms === 0 ? 'text-red-500' : arrivalDate && roomsCount > maxAvailableRooms ? 'text-red-500' : 'text-[#0d6e75]'}`}>
                        {arrivalDate && maxAvailableRooms === 0
                          ? 'No rooms available — select different dates'
                          : `${roomsCount} room${roomsCount !== 1 ? 's' : ''} (${adults} Adult${adults !== 1 ? 's' : ''}${children > 0 ? `, ${children} Child${children !== 1 ? 'ren' : ''}` : ''})`
                        }
                      </p>
                    </div>
                  </div>

                  {/* Coupon Code Section — powered by CouponWidget */}
                  <CouponWidget
                    couponCode={couponCode}
                    setCouponCode={setCouponCode}
                    validatingCoupon={validatingCoupon}
                    appliedCoupon={appliedCoupon}
                    couponError={couponError}
                    couponSuccess={couponSuccess}
                    onApply={() => validateCoupon(couponCode.trim())}
                    onRemove={handleRemoveCoupon}
                    onAutoApply={(code) => validateCoupon(code)}
                    subtotal={stayDetails.totalPrice * roomsCount}
                  />

                  {/* Pricing Details Breakdown */}
                  <div className="rounded-2xl border border-slate-200 bg-[#fafaf7] p-4 space-y-3">
                    <div className="space-y-2 text-xs text-slate-500 font-semibold">
                      <div className="flex items-center justify-between">
                        <span>Base Room Fare <span className="text-[10px] text-slate-450 font-medium">({nights || 1}N, {roomsCount}R)</span></span>
                        <span className="font-extrabold text-slate-900">{money((stayDetails.pureBaseTotal > 0 ? stayDetails.pureBaseTotal : price) * roomsCount)}</span>
                      </div>
                      {stayDetails.weekendSurchargeTotal > 0 && (
                        <div className="flex items-center justify-between text-amber-600">
                          <span>Weekend Surcharge</span>
                          <span className="font-extrabold text-amber-600">+ {money(stayDetails.weekendSurchargeTotal * roomsCount)}</span>
                        </div>
                      )}
                      {appliedCoupon && (
                        <div className="flex items-center justify-between text-[#16a34a] font-bold">
                          <span>Coupon Discount</span>
                          <span className="font-extrabold">- {money(appliedCoupon.discount_amount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span>GST <span className="text-[10px] text-slate-450 font-medium">(5%)</span></span>
                        <span className="font-extrabold text-slate-900">{money(prices.gst)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Gateway Fee <span className="text-[10px] text-slate-455 font-medium">(1%)</span></span>
                        <span className="font-extrabold text-slate-900">{money(prices.gatewayFee)}</span>
                      </div>
                      {isAgent ? (
                        <>
                          <div className="flex justify-between items-center border-t border-slate-200 pt-2 mt-1.5 text-xs font-bold text-slate-650">
                            <span>Tourist Total Bill</span>
                            <span>{money(prices.grandTotal)}</span>
                          </div>
                          <div className="flex justify-between items-center text-rose-600 font-bold">
                            <span>Agent Commission ({user?.commission_type === 'FIXED_AMOUNT' ? 'Fixed' : `${user?.commission_percentage}%`})</span>
                            <span>- {money(prices.agentDiscount)}</span>
                          </div>
                          <div className="flex justify-between items-center border-t border-slate-300 pt-2 mt-1.5 text-sm font-black text-slate-900">
                            <span>Net Payable to Portal</span>
                            <span className="text-[#0d6e75] text-lg">{money(prices.agentPayable)}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between items-center border-t border-slate-200 pt-2 mt-1.5 text-sm font-black text-slate-950">
                          <span>Total Price</span>
                          <span className="text-[#0d6e75] text-lg font-black">{money(prices.grandTotal || price * roomsCount)}</span>
                        </div>
                      )}
                    </div>

                    {arrivalDate && departureDate && (() => {
                      const finalTotal = (isAgent ? prices.agentPayable : prices.grandTotal) || price * roomsCount;
                      const advType = room.advance_payment_type || 'FULL_PAYMENT';
                      const advVal = room.advance_payment_value || 0;

                      let minPayable = finalTotal;
                      let optionLabel = '';
                      let noticeText = '';

                      if (advType === 'PERCENTAGE') {
                        const pct = advVal || 50;
                        minPayable = Math.ceil(finalTotal * (pct / 100));
                        optionLabel = `${pct}% Adv`;
                        noticeText = `No cancellation — ${pct}% advance secures your room. Balance payable before check-in.`;
                      } else if (advType === 'FIXED_AMOUNT') {
                        const fixedAmt = advVal || 500;
                        minPayable = Math.min(finalTotal, fixedAmt * roomsCount);
                        optionLabel = `₹${fixedAmt.toLocaleString('en-IN')} Adv`;
                        noticeText = `No cancellation — ₹${fixedAmt.toLocaleString('en-IN')} per room advance secures your room. Balance payable before check-in.`;
                      }

                      const parsedCustom = parseInt(customPayAmount, 10);
                      const effectivePay = isNaN(parsedCustom) || customPayAmount === ''
                        ? finalTotal
                        : Math.min(finalTotal, Math.max(minPayable, parsedCustom));
                      const isPartial = effectivePay < finalTotal;
                      return (
                        <div className="pt-3 border-t border-slate-200/60 space-y-2.5">
                          {advType !== 'FULL_PAYMENT' ? (
                            <>
                              <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-2">
                                <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-[10px] font-bold text-amber-700 leading-4">{noticeText}</p>
                              </div>

                              <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                                <div className="flex bg-slate-200/60 rounded-lg p-0.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => setCustomPayAmount('')}
                                    className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all ${customPayAmount === '' ? 'bg-[#0d6e75] text-white shadow-sm' : 'text-slate-500'}`}
                                  >
                                    Full
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => { if (customPayAmount === '') setCustomPayAmount(String(minPayable)); }}
                                    className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all ${customPayAmount !== '' ? 'bg-[#0d6e75] text-white shadow-sm' : 'text-slate-500'}`}
                                  >
                                    {optionLabel}
                                  </button>
                                </div>

                                {customPayAmount !== '' ? (
                                  <div className="flex-1 min-w-[110px] flex items-center gap-1 bg-white border border-[#0d6e75]/40 rounded-lg px-2 py-1 shadow-sm">
                                    <span className="text-xs font-black text-slate-400">₹</span>
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
                                      className="flex-1 bg-transparent text-xs font-black text-slate-800 outline-none w-0 min-w-0"
                                      placeholder={String(minPayable)}
                                    />
                                    <span className="text-[9px] font-bold text-slate-400 shrink-0 uppercase tracking-wider">now</span>
                                  </div>
                                ) : (
                                  <div className="flex-1 text-right shrink-0">
                                    <span className="text-xs font-black text-[#0d6e75]">₹{finalTotal.toLocaleString('en-IN')}</span>
                                    <span className="text-[10px] text-slate-400 font-bold ml-1 uppercase tracking-wider">full</span>
                                  </div>
                                )}
                              </div>

                              {isPartial && (
                                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider px-0.5">
                                  <span>Balance due later</span>
                                  <span className="font-black text-slate-600">₹{(finalTotal - effectivePay).toLocaleString('en-IN')}</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="flex items-start gap-2 rounded-lg bg-emerald-50/50 border border-emerald-100 px-2.5 py-2">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <p className="text-[10px] font-bold text-slate-600 leading-4">Full payment is required to confirm this stay booking.</p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </>
              )}
            </div>
          </div>

            {/* ── Fixed Footer Action Bar Inside Modal (Image 5 Style) ── */}
            {!isLodgeInactive && (
              <div className="border-t border-slate-200/80 bg-white p-4 shrink-0 flex items-center justify-between gap-3 shadow-lg">
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Price</span>
                  <span className="text-xl font-black text-[#0d6e75] tracking-tight">
                    {(isAgent ? prices.agentPayable : prices.grandTotal) ? money(isAgent ? prices.agentPayable : prices.grandTotal) : money(price * roomsCount)}
                  </span>
                </div>

                {arrivalDate && departureDate && maxAvailableRooms === 0 && !isAdmin ? (
                  <button disabled className="rounded-xl py-3.5 px-5 font-black text-white text-xs uppercase tracking-wider bg-red-500 cursor-not-allowed opacity-80">
                    Not Available
                  </button>
                ) : arrivalDate && departureDate && roomsCount > maxAvailableRooms && !isAdmin ? (
                  <button disabled className="rounded-xl py-3.5 px-5 font-black text-white text-xs uppercase tracking-wider bg-red-500 cursor-not-allowed opacity-80">
                    Not Enough Rooms
                  </button>
                ) : (
                  <button
                    onClick={handleBookingClick}
                    disabled={isProcessingCheckout}
                    className="flex-1 max-w-[280px] rounded-xl py-3.5 px-5 font-black text-white text-xs uppercase tracking-wider bg-[#0d6e75] shadow-md transition hover:bg-[#0b5c62] hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 active:scale-95"
                  >
                    <span>{isProcessingCheckout ? 'Processing...' : !isAuthenticated ? 'Login to Book' : isAdmin ? 'Reserve Now (Admin)' : 'Reserve & Pay Now'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

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
              <Image src={getHdImageUrl(activeImage?.image_url || fallbackImage)} alt={activeImage?.alt_text || room.lodge_name} fill sizes="100vw" className="object-contain" quality={85} />
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

const HeroFact = ({ icon: Icon, label, value, className = '' }: { icon: typeof Clock; label: string; value: string; className?: string }) => (
  <div className={`min-h-[118px] overflow-hidden rounded-lg border border-white/15 bg-[#174b55] p-4 shadow-lg shadow-slate-950/10 ${className}`}>
    <Icon className="mb-3 h-4 w-4 text-amber-200" />
    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/65">{label}</p>
    <p className="mt-2 break-words text-[13px] font-black leading-5 text-white min-[460px]:line-clamp-2 sm:text-sm">{value}</p>
  </div>
);

const Section = ({ id, eyebrow, title, children }: { id?: string; eyebrow: string; title: string; children: ReactNode }) => (
  <section id={id} className="scroll-mt-[160px]">
    <p className="text-xs font-black uppercase tracking-wider text-[#0d6e75]">{eyebrow}</p>
    <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">{title}</h2>
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
    const observerOptions = {
      root: null,
      rootMargin: '-130px 0px -70% 0px',
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const elements = ROOM_NAV_ITEMS.map((item) => document.getElementById(item.id)).filter(Boolean);
    elements.forEach((el) => observer.observe(el!));

    return () => {
      elements.forEach((el) => observer.unobserve(el!));
      observer.disconnect();
    };
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
    <div className="sticky top-[65px] sm:top-[79px] z-30 w-full max-w-full border-b border-slate-200/70 bg-white/92 shadow-sm backdrop-blur-xl">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-12">
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
                  ${isActive ? 'bg-[#0d6e75] text-[#e5dac5] shadow-sm' : 'bg-slate-100 text-slate-650 hover:bg-[#e9f6f4] hover:text-[#0d6e75]'}`}
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
  <div className="min-h-28 rounded-xl border border-slate-200 bg-white p-5 shadow-3xs">
    <Icon className="h-4.5 w-4.5 text-[#0d6e75]" />
    <p className="mt-3.5 text-[9px] font-black uppercase tracking-wider text-slate-400">{label}</p>
    <p className="mt-1.5 text-xs font-black leading-relaxed text-slate-905">{value}</p>
  </div>
);
const PriceBlock = ({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) => (
  <div>
    <p className="text-[9px] font-black uppercase tracking-wider text-slate-450">{label}</p>
    <p className={`mt-0.5 text-xl font-black ${highlight ? 'text-[#0d6e75]' : 'text-slate-950'}`}>{money(value)}</p>
  </div>
);

const CustomDatePicker = ({
  label,
  value,
  min,
  onChange,
  placeholder = 'Select Date',
  disabled = false,
  availableDates,
  onMonthChange,
  isAdmin,
  weekdayPrice,
  weekendPrice,
  detailedAvailability,
  selectedVariantId,
  selectedSlotKey,
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
  weekdayPrice?: number;
  weekendPrice?: number;
  detailedAvailability?: Record<string, Record<number, Record<string, number>>>;
  selectedVariantId?: number | null;
  selectedSlotKey?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

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
      days.push(<div key={`empty-${i}`} />);
    }

    const minDateStr = min || getLocalToday();

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = toYYYYMMDD(calYear, calMonth, i);
      const isPast = dateStr < minDateStr;
      const isSelected = dateStr === value;
      const dObj = new Date(calYear, calMonth, i);
      const dow = dObj.getDay();
      const isWeekendDay = dow === 0 || dow === 6;

      const hasInventory = availableDates ? availableDates.has(dateStr) : false;
      const isDisabled = isPast || (!hasInventory && !isAdmin);

      const dayFare = isWeekendDay ? (weekendPrice || weekdayPrice || 0) : (weekdayPrice || 0);
      const fmtFare = (n: number) => n >= 1000 ? `₹${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : `₹${n}`;

      // Rooms available count for this cell
      let availRooms: number | null = null;
      if (detailedAvailability && selectedVariantId && selectedSlotKey && detailedAvailability[dateStr]?.[selectedVariantId]) {
        const slotData = detailedAvailability[dateStr][selectedVariantId];
        availRooms = slotData[selectedSlotKey] ?? Object.values(slotData)[0] ?? null;
      }

      days.push(
        <button
          key={i}
          type="button"
          disabled={isDisabled}
          title={!isDisabled ? `Stay on ${dateStr} — ₹${dayFare}${availRooms !== null ? ` (${availRooms} rooms available)` : ''}` : 'Past / Unavailable date'}
          onClick={() => handleDaySelect(i)}
          className={[
            'relative flex flex-col items-center justify-center rounded-xl p-1 transition-all duration-150 select-none',
            'min-h-[50px] sm:min-h-[56px] w-full',
            isSelected
              ? 'bg-gradient-to-b from-[#0d6e75] to-[#0a5a61] text-white shadow-lg shadow-[#0d6e75]/30 scale-[1.03] z-10 font-black'
              : isDisabled
              ? 'text-slate-300 bg-slate-50 cursor-not-allowed opacity-50'
              : isWeekendDay
              ? 'bg-amber-50/90 text-amber-900 font-extrabold border border-amber-200/90 hover:bg-amber-100 hover:scale-105 cursor-pointer shadow-2xs'
              : 'bg-emerald-50/90 text-emerald-900 font-extrabold border border-emerald-200/90 hover:bg-emerald-100 hover:scale-105 cursor-pointer shadow-2xs'
          ].join(' ')}
        >
          {/* Date number */}
          <span className={[
            'text-[12px] sm:text-[13px] leading-none font-bold',
            isSelected ? 'text-white font-black' : isWeekendDay ? 'text-amber-800 font-black' : 'text-slate-800 font-black'
          ].join(' ')}>
            {i}
          </span>

          {/* Nightly Price */}
          {!isDisabled && dayFare > 0 && (
            <span className={[
              'text-[9px] sm:text-[10px] font-semibold leading-none mt-[2px]',
              isSelected ? 'text-cyan-200 font-bold' : isWeekendDay ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'
            ].join(' ')}>
              {fmtFare(dayFare)}
            </span>
          )}

          {/* Rooms Available Pill Tag */}
          {!isDisabled && availRooms !== null && availRooms > 0 && (
            <span className={[
              'text-[8px] leading-none px-1 py-[1px] rounded-full font-bold mt-[2px] tracking-tight whitespace-nowrap',
              isSelected
                ? 'bg-white/20 text-white'
                : availRooms <= 3
                ? 'bg-rose-100 text-rose-700 font-extrabold'
                : availRooms <= 8
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100/80 text-emerald-800'
            ].join(' ')}>
              {availRooms <= 3 ? `${availRooms} left` : `${availRooms} rm`}
            </span>
          )}
        </button>
      );
    }
    return days;
  };

  const formattedDate = value
    ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : placeholder;

  return (
    <div className="w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        className={`w-full text-left rounded-xl border px-3.5 py-2.5 shadow-xs transition-all ${disabled
            ? 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-85 text-slate-400'
            : 'bg-white border-slate-200 cursor-pointer hover:border-[#0d6e75] focus:border-[#0d6e75] focus:outline-none'
          }`}
      >
        <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
          <CalendarDays className="h-4 w-4 text-[#0d6e75]" />
          {label}
        </span>
        <div className="mt-1 text-sm font-black text-slate-850">
          {formattedDate}
        </div>
      </button>

      {/* Centered Backdrop Overlay Modal — Matches Packages Calendar UI */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          {/* Modal Panel - Perfectly Centered */}
          <div className="relative z-10 w-[min(440px,calc(100vw-24px))] bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 p-3 sm:p-4">
            
            {/* Header: Teal Brand Bar */}
            <div className="bg-gradient-to-r from-[#0d6e75] to-[#0a5a61] rounded-xl px-3.5 py-3 mb-3 flex items-center justify-between gap-2 shadow-sm">
              <button
                type="button"
                onClick={prevMonth}
                disabled={(() => {
                  const minD = min ? new Date(min) : new Date();
                  return calYear < minD.getFullYear() || (calYear === minD.getFullYear() && calMonth <= minD.getMonth());
                })()}
                className="h-7 w-7 shrink-0 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors flex items-center justify-center disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="text-center flex-1 min-w-0">
                <div className="text-white font-black text-sm tracking-wide uppercase">
                  {monthNames[calMonth]} {calYear}
                </div>
                <div className="text-cyan-200/80 text-[10px] font-semibold mt-0.5">
                  Select {label} Date
                </div>
              </div>
              <button
                type="button"
                onClick={nextMonth}
                className="h-7 w-7 shrink-0 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors flex items-center justify-center"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 shrink-0 rounded-lg bg-white/20 hover:bg-white/35 text-white transition-colors flex items-center justify-center ml-1"
                aria-label="Close calendar"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Day of week headers */}
            <div className="grid grid-cols-7 mb-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
                <div
                  key={`${d}-${idx}`}
                  className={`text-center text-[10px] font-black uppercase py-1 ${idx === 0 || idx === 6 ? 'text-amber-500 font-extrabold' : 'text-slate-400'}`}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {renderDays()}
            </div>

            {/* Legend Footer */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between px-1">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="h-2.5 w-2.5 rounded-sm bg-emerald-100 border border-emerald-300" />
                  <span className="text-[10px] font-semibold text-slate-400">Weekday</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2.5 w-2.5 rounded-sm bg-amber-100 border border-amber-300" />
                  <span className="text-[10px] font-semibold text-slate-400">Weekend</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2.5 w-2.5 rounded-sm bg-[#0d6e75]" />
                <span className="text-[10px] font-semibold text-slate-400">Selected</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
