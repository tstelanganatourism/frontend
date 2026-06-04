import React from 'react';

interface BookingDateDisplayProps {
  targetType: string;
  travelDate: string;
  roomCheckin?: string | null;
  roomCheckout?: string | null;
  roomCheckoutDate?: string | null;
  packageDepartureTime?: string | null;
  className?: string;
  compact?: boolean;
}

export function BookingDateDisplay({
  targetType,
  travelDate,
  roomCheckin,
  roomCheckout,
  roomCheckoutDate,
  packageDepartureTime,
  className = "",
  compact = false
}: BookingDateDisplayProps) {
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        weekday: 'long'
      });
    } catch (e) {
      return dateString;
    }
  };

  const formattedTravelDate = formatDate(travelDate);
  const formattedCheckoutDate = formatDate(roomCheckoutDate || "");

  if (targetType === "ROOM") {
    if (compact) {
      return (
        <div className={`flex flex-col text-xs text-slate-500 font-semibold mt-0.5 ${className}`}>
          <div><span className="text-slate-400 font-medium">In:</span> {formattedTravelDate} {roomCheckin ? `(${roomCheckin})` : ''}</div>
          <div><span className="text-slate-400 font-medium">Out:</span> {formattedCheckoutDate || formattedTravelDate} {roomCheckout ? `(${roomCheckout})` : ''}</div>
        </div>
      );
    }
    return (
      <div className={`flex flex-wrap items-center gap-1.5 text-sm text-slate-500 font-semibold mt-0.5 ${className}`}>
        <span className="flex items-center gap-1">
          <span className="text-slate-400 font-medium whitespace-nowrap">Check-in:</span> 
          <span className="text-slate-700">{formattedTravelDate} {roomCheckin ? <span className="text-slate-500 text-xs font-bold">({roomCheckin})</span> : ''}</span>
        </span>
        <span className="text-slate-300">-</span>
        <span className="flex items-center gap-1">
          <span className="text-slate-400 font-medium whitespace-nowrap">Check-out:</span> 
          <span className="text-slate-700">{formattedCheckoutDate || formattedTravelDate} {roomCheckout ? <span className="text-slate-500 text-xs font-bold">({roomCheckout})</span> : ''}</span>
        </span>
      </div>
    );
  }

  // Package
  return (
    <div className={`text-sm text-slate-500 font-semibold mt-0.5 ${className}`}>
      <span className="text-slate-400 font-medium">Travel Date:</span>{" "}
      <span className="text-slate-700">{formattedTravelDate}</span>
      {packageDepartureTime && (
        <span className="ml-1 text-xs font-bold text-slate-500">({packageDepartureTime})</span>
      )}
    </div>
  );
}
