'use client';

import React from 'react';
import { CalendarDays, CheckCircle2, Clock, MapPin, Route } from 'lucide-react';

interface ItineraryDay {
  id: number;
  day_number: number;
  title: string;
  description?: string | null;
  icon?: string | null;
}

interface ItineraryTimelineProps {
  days: ItineraryDay[];
  packageTitle?: string;
  packageType?: string;
  durationLabel?: string;
  boardingPoint?: string | null;
  transportInfo?: string | null;
  departureTime?: string | null;
}

const parseItineraryLines = (desc?: string | null) => {
  if (!desc) return [];
  const lines = desc.split('\n').map(line => line.trim()).filter(Boolean);
  
  const parsed = lines.map((line) => {
    // Matches "8:00 AM - Details" or "10:30 AM -> Details" or "01:00 PM: Lunch" or "8.00 A.M : "
    const timeRegex = /^(\d{1,2}[:.]\d{2}\s*(?:AM|PM|A\.M|P\.M|am|pm|a\.m|p\.m))\s*(?:-|->|=>|:)\s*(.*)$/;
    const match = line.match(timeRegex);
    if (match) {
      return { isTimeStep: true, time: match[1].replace(/\./g, ':').toUpperCase(), text: match[2] };
    }
    return { isTimeStep: false, time: null, text: line };
  });

  return parsed;
};

const getStandardSchedule = ({
  packageTitle = '',
  packageType,
  durationLabel = '',
  boardingPoint,
  transportInfo,
  departureTime,
}: Omit<ItineraryTimelineProps, 'days'>) => {
  const text = `${packageTitle} ${durationLabel}`.toLowerCase();
  const isHyderabad = text.includes('hyderabad') || text.includes('hyd');
  const isMultiDay = text.includes('2 day') || text.includes('2 days') || text.includes('3 night') || text.includes('night');
  const isBoatRide = packageType === 'TOUR' || text.includes('papikondalu') || text.includes('boat');
  const reportAt = boardingPoint || (isHyderabad ? 'Hyderabad pickup point' : 'operator reporting point');
  const reportTime = departureTime || 'TBA';

  if (isHyderabad && isMultiDay) {
    return [
      {
        day: 'Day 1',
        title: 'Hyderabad to Bhadrachalam',
        steps: [
          ['09:00 PM', 'Report at Hyderabad pickup point. Exact pickup location is confirmed by the operator before travel.'],
          ['10:00 PM', `Depart by ${transportInfo || 'shared tourism transport'} towards Bhadrachalam.`],
        ],
      },
      {
        day: 'Day 2',
        title: 'Bhadrachalam, boat journey and bamboo huts',
        steps: [
          ['06:00 AM', 'Reach Bhadrachalam, fresh-up break and breakfast coordination.'],
          [reportTime, `Report at ${reportAt} for ticket verification and boarding instructions.`],
          ['09:00 AM', 'Boat journey starts on the Godavari route towards Papikondalu.'],
          ['01:00 PM', 'Lunch served as per package arrangement.'],
          ['05:30 PM', 'Reach Kolluru / bamboo huts area for night stay allocation.'],
          ['08:00 PM', 'Dinner and overnight stay as per selected package variant.'],
        ],
      },
      {
        day: 'Day 3',
        title: 'Return journey',
        steps: [
          ['08:00 AM', 'Breakfast and local nature walk / sightseeing time.'],
          ['02:00 PM', 'Return boat pickup and downstream journey begins.'],
          ['06:30 PM', 'Reach road transfer point / Bhadrachalam return point.'],
          ['09:00 PM', 'Hyderabad return pickup where applicable.'],
        ],
      },
    ];
  }

  if (isMultiDay) {
    return [
      {
        day: 'Day 1',
        title: 'Reporting and river journey',
        steps: [
          [reportTime, `Report at ${reportAt} with valid ID proof.`],
          ['09:00 AM', 'Boat departure after boarding verification.'],
          ['11:30 AM', 'Papikondalu scenic stretch and sightseeing from boat.'],
          ['01:00 PM', 'Lunch served as per package arrangement.'],
          ['05:30 PM', 'Reach night-stay camp / bamboo huts and complete room allocation.'],
        ],
      },
      {
        day: 'Day 2',
        title: 'Local sightseeing and return',
        steps: [
          ['08:00 AM', 'Breakfast and local sightseeing / nature walk.'],
          ['02:00 PM', 'Return boat pickup.'],
          ['06:30 PM', 'Arrival at return point and onward drop coordination.'],
        ],
      },
    ];
  }

  if (isBoatRide) {
    return [
      {
        day: 'Day 1',
        title: 'Godavari boat ride',
        steps: [
          [reportTime, `Report at ${reportAt} for ticket verification.`],
          ['08:30 AM', 'Boarding starts after operator and safety checks.'],
          ['09:00 AM', 'Boat departure on the Godavari river route.'],
          ['11:30 AM', 'Papikondalu scenic view point / river gorge stretch.'],
          ['01:00 PM', 'Lunch or refreshment break as per package inclusions.'],
          ['06:00 PM', 'Return arrival at boarding / road transfer point.'],
        ],
      },
    ];
  }

  return [
    {
      day: 'Day 1',
      title: 'Sightseeing tour',
      steps: [
        [reportTime, `Report at ${reportAt}.`],
        ['08:00 AM', `Depart by ${transportInfo || 'tourism transport'}.`],
        ['10:00 AM', 'Visit first sightseeing location.'],
        ['01:00 PM', 'Lunch / refreshment break as per package inclusions.'],
        ['04:30 PM', 'Return journey starts.'],
        ['06:00 PM', 'Arrival at reporting / drop point.'],
      ],
    },
  ];
};

export const ItineraryTimeline = (props: ItineraryTimelineProps) => {
  const { days } = props;
  const standardSchedule = getStandardSchedule(props);

  return (
    <section id="itinerary" className="scroll-mt-[135px] sm:scroll-mt-[160px]">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-white p-5 md:p-7">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef8f7] px-3 py-1 text-xs font-black uppercase tracking-wider text-[#0d6e75]">
            <Route className="h-3.5 w-3.5" />
            Day-by-Day Journey Flow
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
            Tour Schedule & Plan
          </h2>
          <p className="mt-2 max-w-3xl text-sm font-medium leading-relaxed text-slate-600">
            A simple day-wise plan with boarding, travel and return milestones. Exact timings may vary slightly with water level and operator coordination.
          </p>
        </div>

        {days && days.length > 0 ? (
        <div className="space-y-4 bg-slate-50/60 p-4 md:p-6">
          {days.map((day) => {
            const steps = parseItineraryLines(day.description);
            const fallbackLines = day.description
              ? day.description
                  .split(/\n|(?<=\.)\s+(?=\d|[A-Z])/)
                  .map((line) => line.trim())
                  .filter(Boolean)
              : [];

            return (
              <article key={day.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="flex flex-col gap-3 border-b border-slate-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#0d6e75] text-white">
                      <span className="text-[10px] font-black uppercase leading-none">Day</span>
                      <span className="-mt-1 text-lg font-black leading-none">{day.day_number}</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Journey milestone</p>
                      <h3 className="mt-0.5 text-base font-black leading-snug text-slate-950">
                        {day.title || `Day ${day.day_number} plan`}
                      </h3>
                    </div>
                  </div>
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Planned route
                  </span>
                </div>

                {steps.length > 0 ? (
                  <div className="relative space-y-2.5 p-4 before:absolute before:left-[27px] before:top-5 before:bottom-5 before:w-px before:bg-slate-200 sm:p-5">
                    {steps.map((step, idx) => (
                      <div key={idx} className="relative grid gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-3 pl-12 sm:grid-cols-[112px_1fr] sm:items-start sm:gap-4 sm:pl-14">
                        <span className="absolute left-3.5 top-3.5 grid h-6 w-6 place-items-center rounded-full border border-[#b8e5df] bg-white text-[#0d6e75]">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </span>
                        {step.isTimeStep ? (
                          <>
                            <span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-[11px] font-black text-[#0d6e75] ring-1 ring-slate-200">
                              <Clock className="h-3.5 w-3.5" />
                              {step.time}
                            </span>
                            <span className="text-sm font-medium leading-6 text-slate-700">{step.text}</span>
                          </>
                        ) : (
                          <span className="text-sm font-medium leading-6 text-slate-700 sm:col-span-2">{step.text}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : fallbackLines.length ? (
                  <div className="relative space-y-2.5 p-4 before:absolute before:left-[27px] before:top-5 before:bottom-5 before:w-px before:bg-slate-200 sm:p-5">
                    {fallbackLines.map((line, idx) => (
                      <div key={idx} className="relative grid gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-3 pl-12 sm:grid-cols-[112px_1fr] sm:items-start sm:gap-4 sm:pl-14">
                        <span className="absolute left-3.5 top-3.5 grid h-6 w-6 place-items-center rounded-full border border-[#b8e5df] bg-white text-[#0d6e75]">
                          <MapPin className="h-3.5 w-3.5" />
                        </span>
                        <span className="inline-flex w-fit items-center rounded-md bg-white px-2.5 py-1 text-[11px] font-black text-slate-500 ring-1 ring-slate-200">Step {idx + 1}</span>
                        <span className="text-sm font-medium leading-6 text-slate-700">{line}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="m-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold leading-relaxed text-amber-800">
                    Schedule details are not published for this day yet.
                  </p>
                )}
              </article>
            );
          })}
        </div>
        ) : (
          <div className="space-y-4 bg-slate-50/60 p-4 md:p-6">
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-relaxed text-slate-700">
              Standard operator route details shown below. Check-in reporting point and final timings are confirmed post-reservation.
            </div>
            {standardSchedule.map((day) => (
              <article key={day.day} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center gap-3 border-b border-slate-100 bg-white p-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#0d6e75] text-white">
                    <Route className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#0d6e75]">{day.day}</p>
                    <h3 className="mt-0.5 text-base font-black leading-snug text-slate-950">{day.title}</h3>
                  </div>
                </div>
                <div className="relative space-y-2.5 p-4 before:absolute before:left-[27px] before:top-5 before:bottom-5 before:w-px before:bg-slate-200 sm:p-5">
                  {day.steps.map(([time, activity]) => (
                    <div key={`${day.day}-${time}-${activity}`} className="relative grid gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-3 pl-12 sm:grid-cols-[112px_1fr] sm:items-start sm:gap-4 sm:pl-14">
                      <span className="absolute left-3.5 top-3.5 grid h-6 w-6 place-items-center rounded-full border border-[#b8e5df] bg-white text-[#0d6e75]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </span>
                      <span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-[11px] font-black text-[#0d6e75] ring-1 ring-slate-200">
                        <Clock className="h-3.5 w-3.5" />
                        {time}
                      </span>
                      <span className="text-sm font-medium leading-6 text-slate-700">{activity}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
