'use client';

import React from 'react';
import { Route } from 'lucide-react';

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
    <section id="itinerary" className="scroll-mt-[170px]">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50 p-5 md:p-7">
          <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-[#1a6b7a]">
            <Route className="h-3.5 w-3.5" />
            Day-by-Day Itinerary
          </span>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-[#0f3d56] md:text-4xl">
            Tour Schedule
          </h2>
          <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-600">
            Day-wise journey flow with practical timings. Final timing can change slightly based on water level, traffic, and operator instructions.
          </p>
        </div>

        {days && days.length > 0 ? (
        <div className="space-y-5 p-5 md:p-7">
          {days.map((day) => {
            const steps = parseItineraryLines(day.description);
            const fallbackLines = day.description
              ? day.description
                  .split(/\n|(?<=\.)\s+(?=\d|[A-Z])/)
                  .map((line) => line.trim())
                  .filter(Boolean)
              : [];

            return (
              <div key={day.id} className="overflow-hidden rounded-lg border border-slate-200">
                <h3 className="border-b border-slate-200 bg-[#0f3d56] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white">
                  Day {day.day_number} {day.title && `- ${day.title}`}
                </h3>

                {steps.length > 0 ? (
                  <div className="divide-y divide-slate-100 bg-white">
                    {steps.map((step, idx) => (
                      <div key={idx} className="grid gap-1 px-4 py-3 text-sm transition hover:bg-[#f7fbfb] sm:grid-cols-[110px_1fr] sm:gap-4">
                        {step.isTimeStep ? (
                          <>
                            <span className="whitespace-nowrap font-black text-[#0f3d56]">{step.time}</span>
                            <span className="font-medium leading-relaxed text-slate-700">{step.text}</span>
                          </>
                        ) : (
                          <span className="font-medium leading-relaxed text-slate-700 sm:col-span-2">{step.text}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : fallbackLines.length ? (
                  <div className="divide-y divide-slate-100 bg-white">
                    {fallbackLines.map((line, idx) => (
                      <div key={idx} className="grid gap-1 px-4 py-3 text-sm transition hover:bg-[#f7fbfb] sm:grid-cols-[110px_1fr] sm:gap-4">
                        <span className="font-black text-slate-400">Step {idx + 1}</span>
                        <span className="font-medium leading-relaxed text-slate-700">{line}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="px-4 py-4 text-sm font-medium leading-relaxed text-amber-800">
                    Schedule details are not published for this day yet.
                  </p>
                )}
              </div>
            );
          })}
        </div>
        ) : (
          <div className="space-y-5 p-5 md:p-7">
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold leading-6 text-blue-900">
              Operator-standard schedule shown below. Exact reporting point and final timings are confirmed before travel.
            </div>
            {standardSchedule.map((day) => (
              <div key={day.day} className="overflow-hidden rounded-lg border border-slate-200">
                <h3 className="border-b border-slate-200 bg-[#0f3d56] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white">
                  {day.day} - {day.title}
                </h3>
                <div className="divide-y divide-slate-100 bg-white">
                  {day.steps.map(([time, activity]) => (
                    <div key={`${day.day}-${time}-${activity}`} className="grid gap-1 px-4 py-3 text-sm transition hover:bg-[#f7fbfb] sm:grid-cols-[110px_1fr] sm:gap-4">
                      <span className="whitespace-nowrap font-black text-[#0f3d56]">{time}</span>
                      <span className="font-medium leading-relaxed text-slate-700">{activity}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
