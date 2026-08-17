export interface TransportSelection {
  title?: string;
  type?: 'SHARED' | 'SEPARATE_VEHICLE' | string;
  quantity?: number | string | null;
  capacity?: number | string | null;
  item_total?: number | string | null;
  fixed_price?: number | string | null;
}

export interface PaymentLedgerEntry {
  id: number;
  amount: number;
  payment_method: string;
  status: string;
  collected_by_type?: string;
  collected_by_label?: string;
  payment_reference_id?: string;
  created_at: string | null;
}

export function money(amount: number | string | null | undefined, digits = 2) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(Number(amount || 0));
}

export function getTransportSelections(pricingSnapshot?: { transport_selections?: TransportSelection[] } | null) {
  return Array.isArray(pricingSnapshot?.transport_selections)
    ? pricingSnapshot.transport_selections
    : [];
}

export function hasRefreshment(booking: { has_refreshment_addon?: boolean; pricing_snapshot?: { has_refreshment_addon?: boolean, refreshment_subtotal?: number | string | null } | null }) {
  // Only true if the user explicitly opted for the refreshment addon AND it has a cost > 0.
  // The user explicitly requested not to show "0rs" refreshments on the invoice/dashboard.
  const amount = Number(booking.pricing_snapshot?.refreshment_subtotal || 0);
  return !!booking.has_refreshment_addon && amount > 0;
}

export function getRefreshmentAmount(pricingSnapshot?: { refreshment_subtotal?: number | string | null } | null) {
  return Number(pricingSnapshot?.refreshment_subtotal || 0);
}

export function hasFoodAddon(pricingSnapshot?: any) {
  const amount = Number(pricingSnapshot?.food_amount || pricingSnapshot?.catering_amount || pricingSnapshot?.food_subtotal || 0);
  return amount > 0 || !!pricingSnapshot?.has_food_addon;
}

export function getFoodAmount(pricingSnapshot?: any) {
  return Number(pricingSnapshot?.food_amount || pricingSnapshot?.catering_amount || pricingSnapshot?.food_subtotal || 0);
}

export function hasExtras(pricingSnapshot?: any) {
  const amount = Number(pricingSnapshot?.extras_amount || pricingSnapshot?.extras_subtotal || 0);
  const list = Array.isArray(pricingSnapshot?.selected_extras) ? pricingSnapshot.selected_extras : [];
  return amount > 0 || list.length > 0;
}

export function getExtrasAmount(pricingSnapshot?: any) {
  return Number(pricingSnapshot?.extras_amount || pricingSnapshot?.extras_subtotal || 0);
}

export function getSelectedExtrasList(pricingSnapshot?: any) {
  if (Array.isArray(pricingSnapshot?.selected_extras) && pricingSnapshot.selected_extras.length > 0) {
    return pricingSnapshot.selected_extras;
  }
  return [];
}

export function getTransportAmount(selections: TransportSelection[]) {
  return selections.reduce((sum, item) => sum + Number(item.item_total || 0), 0);
}

export function getBaseFareExcludingAddons(
  subtotal: number,
  pricingSnapshot: any,
) {
  const selections = getTransportSelections(pricingSnapshot);
  const transportAmt = getTransportAmount(selections);
  const refreshAmt = getRefreshmentAmount(pricingSnapshot);
  const foodAmt = getFoodAmount(pricingSnapshot);
  const extrasAmt = getExtrasAmount(pricingSnapshot);
  return Math.max(0, Number(subtotal || 0) - transportAmt - refreshAmt - foodAmt - extrasAmt);
}

export function describeTransport(item: TransportSelection, adultCount?: number, childCount?: number, studentCount?: number) {
  const quantity = Number(item.quantity || 1);
  const capacity = item.capacity ? ` (${item.capacity} Seats)` : '';
  
  let paxLabel = '';
  if (studentCount !== undefined && studentCount > 0) {
    paxLabel = `${studentCount} Student${studentCount !== 1 ? 's' : ''}`;
  } else if (adultCount !== undefined && childCount !== undefined) {
    paxLabel = `${adultCount} Adult${adultCount !== 1 ? 's' : ''} + ${childCount} Child${childCount !== 1 ? 'ren' : ''}`;
  } else if (adultCount !== undefined) {
    paxLabel = `${adultCount} pax`;
  }

  if (item.type === 'SHARED') {
    return (paxLabel ? `Shared transport for ${paxLabel}` : 'Shared transport') + capacity;
  }
  return `${quantity} separate vehicle${quantity > 1 ? 's' : ''}${capacity}`;
}


export function getPaymentMethodLabel(method?: string | null) {
  const key = (method || '').toUpperCase();
  if (key === 'PHONEPE') return 'Online (PhonePe)';
  if (key === 'CASHFREE') return 'Online (Cashfree)';
  if (key === 'RAZORPAY') return 'Online (PhonePe)';  // Legacy data — was always PhonePe
  if (key === 'BANK_TRANSFER') return 'Bank Transfer';
  if (key === 'CASH') return 'Cash';
  if (key === 'ADMIN_MANUAL') return 'Manual (Admin)';
  if (key === 'AGENT_COMMISSION') return 'Paid via Agent';
  return method || 'Office';
}

export function getCapturedPayments(ledger?: PaymentLedgerEntry[] | null) {
  return (ledger || []).filter(payment => payment.status === 'CAPTURED');
}
