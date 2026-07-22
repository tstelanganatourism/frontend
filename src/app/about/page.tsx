import React from 'react';
import type { Metadata } from 'next';
import { ShieldCheck, Ship, MapPin, Phone, History, Award, Users, Navigation } from 'lucide-react';
import PublicPageHeader from '@/components/layout/PublicPageHeader';

export const metadata: Metadata = {
  title: 'About TS Boat Tourism | Papikondalu Tours Bhadrachalam',
  description:
    'Meet TS Boat Tourism, a trusted Papikondalu and Bhadrachalam travel office offering Godavari river cruises, tours, trips and accommodation support since 2004.',
  alternates: { canonical: '/about' },
  keywords: [
    'TS Boat Tourism',
    'TS Boat Tourism office',
    'Bhadrachalam travel agency',
    'Papikondalu boat tours',
    'best tours in Bhadrachalam',
  ],
};

const MAPS_LOCATION_URL = 'https://maps.app.goo.gl/ZZynQYDrgaDAipDz6?g_st=awb';

const OFFICE_ADDRESS =
  'Om Shanti satram, Kalyana mandapam road, near SBI ATM, Bhadrachalam, Telangana 507111';

const TOURISM_METRICS = [
  { number: '20+', title: 'Years in tourism', text: 'Local Godavari expertise since 2004.' },
  { number: '100k+', title: 'Happy travellers', text: 'Families, groups and pilgrims served.' },
  { number: '3', title: 'Boat capacities', text: 'Options for private and group journeys.' },
  { number: '24/7', title: 'Booking support', text: 'Quick call and WhatsApp assistance.' },
];

export default function AboutPage() {
  return (
    <div className="bg-[#eaf7f6] selection:bg-teal-100 selection:text-teal-900">
      <PublicPageHeader
        eyebrow="Since 2004"
        title="About TS Boat Tourism"
        description="A trusted Bhadrachalam booking office for Papikondalu river cruises, Kolluru stays, temple trips, and Godavari travel support."
        icon={ShieldCheck}
      />

      {/* Our Legacy Section */}
      <section className="py-10 bg-[#f7fbfb] relative md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-block">
                <span className="text-[#1598a1] font-black tracking-[0.2em] uppercase text-xs mb-2 block">Our Legacy</span>
                <h2 className="text-4xl font-black text-[#0f3d56] tracking-tight">Two Decades of Excellence</h2>
                <div className="h-1.5 w-20 bg-[#1598a1] mt-4 rounded-full" />
              </div>
              <p className="text-slate-600 text-lg leading-relaxed">
                Started in the year <span className="font-extrabold text-[#0f6f78]">2004</span>, TS Boat Tourism has been a pioneer in providing premium tourism services to the most popular destinations in and around Bhadrachalam.
              </p>
              <p className="text-slate-600 text-lg leading-relaxed">
                We specialize in curated River Cruises to <span className="font-extrabold text-[#0f6f78]">Papikondalu</span> and the legendary <span className="font-extrabold text-[#0f6f78]">Kolluru Bamboo Huts</span>. Our commitment to comfort, safety, and authentic local experiences has made us the trusted choice for domestic and foreign tourists alike.
              </p>
              <div className="flex gap-8 pt-4 border-t border-slate-100">
                <div>
                  <div className="text-3xl font-black text-[#1598a1]">20+</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Years Experience</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-[#1598a1]">100k+</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Happy Tourists</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-[#1598a1]">3</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Luxury Vessels</div>
                </div>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-4 bg-[#1598a1]/10 rounded-md -rotate-2 scale-95 group-hover:rotate-0 group-hover:scale-100 transition-transform duration-700 pointer-events-none" />
              <div className="relative overflow-hidden rounded-md shadow-2xl">
                <img
                  src="https://res.cloudinary.com/dpdab3e97/image/upload/v1779431943/papikondalu-tour-packages-ap-1_hje1jh.jpg"
                  alt="TS Boat in Godavari River"
                  className="w-full h-auto object-cover transform transition-transform duration-1000 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Fleet Section */}
      <section className="py-10 bg-[#eaf7f6] border-y border-[#b9e4e5] md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-[#1598a1] font-black tracking-[0.2em] uppercase text-xs mb-3 block">Premium Fleet</span>
            <h2 className="text-4xl font-black text-[#0f3d56] mb-4 tracking-tight">Luxury on the Godavari</h2>
            <p className="text-slate-500 max-w-2xl mx-auto font-medium">
              Our fleet is meticulously maintained to provide the highest standards of comfort and safety for our guests.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { cap: "50", title: "Intimate Explorer", desc: "Perfect for private groups and family gatherings." },
              { cap: "100", title: "Executive Cruiser", desc: "Our most popular vessel for package tours." },
              { cap: "150", title: "Grand Majestic", desc: "Spacious deck and high-capacity luxury for large events." }
            ].map((boat, idx) => (
              <div key={idx} className="bg-white p-7 rounded-md shadow-[0_4px_25px_rgba(15,61,86,0.02)] hover:shadow-[0_12px_45px_rgba(15,61,86,0.06)] transition-all duration-500 border border-slate-100 group">
                <div className="w-16 h-16 bg-[#f0f7f8] text-[#1598a1] rounded-md flex items-center justify-center mb-6 group-hover:bg-[#0f3d56] group-hover:text-white transition-colors duration-500 shadow-inner">
                  <Ship className="h-8 w-8" />
                </div>
                <div className="text-xs font-black text-[#1598a1] mb-1.5 uppercase tracking-widest">Capacity: {boat.cap} Seater</div>
                <h3 className="text-xl font-bold text-[#0f3d56] mb-3 tracking-tight">{boat.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
                  Fully furnished with premium seating, high-performance A/C systems, and all safety amenities required for a smooth journey.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-slate-50 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-wide">A/C Deck</span>
                  <span className="px-3 py-1 bg-slate-50 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-wide">Safety Gear</span>
                  <span className="px-3 py-1 bg-slate-50 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-wide">Catering</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Incorporation */}
      <section className="py-10 bg-[#f7fbfb] overflow-hidden relative border-y border-[#b9e4e5] md:py-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(21,152,161,0.08),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-12">
                  <div className="bg-[#f0f7f8] p-6 rounded-md border border-slate-100 text-center">
                    <ShieldCheck className="h-10 w-10 text-[#1598a1] mx-auto mb-4" />
                    <div className="text-[#0f3d56] font-extrabold text-sm">Govt. Registered</div>
                  </div>
                  <div className="bg-white p-6 rounded-md border border-slate-100 text-center shadow-sm">
                    <Award className="h-10 w-10 text-[#1598a1] mx-auto mb-4" />
                    <div className="text-[#0f3d56] font-extrabold text-sm">Safety Certified</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-md border border-slate-100 text-center shadow-sm">
                    <Users className="h-10 w-10 text-[#1598a1] mx-auto mb-4" />
                    <div className="text-[#0f3d56] font-extrabold text-sm">Local Experts</div>
                  </div>
                  <div className="bg-[#f0f7f8] p-6 rounded-md border border-slate-100 text-center">
                    <History className="h-10 w-10 text-[#1598a1] mx-auto mb-4" />
                    <div className="text-[#0f3d56] font-extrabold text-sm">20 Years Legacy</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-8 order-1 lg:order-2">
              <span className="text-[#1598a1] font-black tracking-[0.2em] uppercase text-xs mb-2 block">Trust & Safety</span>
              <h2 className="text-4xl font-black text-[#0f3d56] tracking-tight">Regulated. Reliable. Reputed.</h2>
              <p className="text-slate-600 text-lg leading-relaxed font-medium">
                TS Boat Tourism is proud to be incorporated by the <span className="text-[#1598a1] font-black">Government of India Ministry of Corporate Affairs</span>. We operate with strict adherence to safety protocols and regulatory standards.
              </p>
              <p className="text-slate-600 text-lg leading-relaxed font-medium">
                The very fact that we successfully conduct package tours for both domestic and foreign tourists is a reflection of our efficiency and prompt service.
              </p>
              <div className="pt-4">
                <div className="p-6 bg-[#f0f7f8] rounded-md border border-slate-100 flex items-center gap-6">
                  <div className="w-12 h-12 bg-[#1598a1] rounded-xl flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-[#0f3d56] font-black text-base">Authorized Booking Office</div>
                    <div className="text-slate-500 text-sm font-medium">Central Booking Office, Bhadrachalam</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Official Government Certifications */}
      <section className="py-10 bg-[#eaf7f6] md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-[#1598a1] font-black tracking-[0.2em] uppercase text-xs mb-3 block">Agency Credentials</span>
            <h2 className="text-4xl font-black text-[#0f3d56] mb-4 tracking-tight">Government Registered & Licensed</h2>
            <p className="text-slate-500 max-w-2xl mx-auto font-medium">
              TS Boat Tourism is officially registered under the Telangana Shops &amp; Establishments Act, 1988 with a valid Boat Tourism Licence issued by the Government of Telangana Labour Department.
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            {/* Certificate Card */}
            <div className="group relative rounded-md overflow-hidden shadow-2xl border border-slate-200 hover:shadow-[0_30px_80px_rgba(15,61,86,0.15)] transition-all duration-700">
              <div className="absolute inset-0 bg-gradient-to-t from-[#1e468a]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />
              <img
                src="/ts_boat_certificate.webp"
                alt="Government of Telangana - Labour Department Certificate of Registration for TS Boat Tourism"
                className="w-full h-auto object-contain bg-white"
              />
              <div className="absolute inset-x-0 bottom-0 z-20 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-white text-xs font-bold text-center uppercase tracking-wider">Govt. of Telangana — Labour Department Registration Certificate</p>
              </div>
            </div>

            {/* Registration Details */}
            <div className="space-y-6">
              <div className="overflow-hidden rounded-md border border-slate-150 bg-white shadow-[0_24px_70px_rgba(15,61,86,0.04)]">
                <div className="border-b border-slate-100 bg-gradient-to-r from-[#f0f7f8]/50 to-white p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[#1598a1]/10 ring-1 ring-[#1598a1]/15">
                      <ShieldCheck className="h-5 w-5 text-[#1598a1]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Government Registration</p>
                      <h3 className="text-lg font-black text-[#0f3d56] tracking-tight">Boat Tourism Licence</h3>
                    </div>
                  </div>
                </div>
                <dl className="divide-y divide-slate-100 p-6 sm:p-8">
                  {[
                    { label: 'Registration No.', value: 'SEA/KMM/ALO/BC/09998/2016' },
                    { label: 'Registered Under', value: 'Telangana Shops & Establishments Act, 1988' },
                    { label: 'Name of Employer', value: 'NALLA SAI BABU' },
                    { label: 'Establishment Name', value: 'TELANGANA BOAT TOURISM' },
                    { label: 'Nature of Business', value: 'BOAT TOURISM' },
                    { label: 'Date of Registration', value: '01/09/2016' },
                    { label: 'Date of Commencement', value: '19/03/2016' },
                    { label: 'Shop Address', value: '3-1-20/A, Ramalayam Veedi, Bhadrachalam, Khammam, Telangana' },
                  ].map((item) => (
                    <div key={item.label} className="grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[170px_minmax(0,1fr)] sm:gap-5">
                      <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{item.label}</dt>
                      <dd className="min-w-0 text-sm font-extrabold leading-6 text-slate-700 sm:text-[15px]">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="rounded-md bg-[#0f3d56] p-6 text-white shadow-xl">
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white/10 ring-1 ring-white/15">
                    <Award className="h-6 w-6 text-[#8eecee]" />
                  </span>
                  <div>
                    <h4 className="mb-1 text-base font-black">Official Registration Records</h4>
                    <p className="text-xs leading-relaxed text-slate-200">
                      This certificate is digitally signed and can be verified at{' '}
                      <a
                        href="http://labour.telangana.gov.in/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#8eecee] font-bold underline hover:no-underline"
                      >
                        labour.telangana.gov.in
                      </a>
                      {' '}by using registration reference number SEA/KMM/ALO/BC/09998/2016.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Location */}
      <section className="bg-[#eaf7f6] py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
            <div className="relative overflow-hidden rounded-md bg-[#0f3d56] p-6 text-white shadow-2xl sm:p-10">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(229,218,197,0.14),transparent_42%),radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.14),transparent_30%)]" />
              <div className="relative space-y-6">
                <span className="inline-flex max-w-full items-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-[#8eecee]">
                  <MapPin className="h-4.5 w-4.5" />
                  Central Booking Office
                </span>
                <h2 className="text-3xl font-black leading-tight sm:text-4xl">
                  Visit us in Bhadrachalam before your journey.
                </h2>
                <p className="text-sm leading-7 text-slate-200 font-medium">
                  Walk in for route guidance, package selection, on-the-spot bookings, and accommodation support from our central booking office.
                </p>

                <div className="pt-4 border-t border-white/10">
                  <div className="rounded-md bg-white/5 p-5 backdrop-blur-md">
                    <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#8eecee] mb-1">Our travel brands</div>
                    <div className="text-lg font-black text-white">TS Boat Tourism</div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-300 font-medium">
                      Providing domestic and foreign tourists with direct, reliable access to Godavari river cruises, stays, and custom tour bookings.
                    </p>
                  </div>
                </div>

                <p className="rounded-md border border-white/10 bg-white/10 p-5 text-xs font-semibold leading-relaxed text-slate-200">
                  Note: Please carry Aadhaar Xerox for all passengers and submit it at the boat point.
                </p>
              </div>
            </div>

            <div className="grid gap-6">
              {/* Office Details Card */}
              <div className="rounded-md bg-white p-6 shadow-[0_4px_25px_rgba(15,61,86,0.02)] sm:p-8 border border-slate-100">
                <h3 className="text-lg font-black text-[#0f3d56] mb-5 pb-3 border-b border-slate-100 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#1598a1]" />
                  Office Details
                </h3>
                <dl className="space-y-5">
                  <div className="grid gap-1">
                    <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Office address
                    </dt>
                    <dd className="text-sm font-extrabold leading-relaxed text-slate-700">{OFFICE_ADDRESS}</dd>
                  </div>

                  <div className="grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
                    <div className="min-w-0">
                      <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Contact lines
                      </dt>
                      <dd className="mt-1 text-sm font-black text-[#1598a1]">+91 95420 69573</dd>
                      <dd className="text-sm font-black text-[#1598a1]">+91 98498 48982</dd>
                    </div>

                    <div className="min-w-0">
                      <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Reporting time
                      </dt>
                      <dd className="mt-1 text-sm font-bold text-slate-600">7:00 AM to 7:30 AM</dd>
                    </div>
                  </div>

                  <div className="grid gap-1 border-t border-slate-100 pt-4">
                    <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Email support
                    </dt>
                    <dd className="text-sm font-extrabold text-[#0f3d56]">bookings@tstelanganatourism.com</dd>
                  </div>
                </dl>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <a href="tel:+919542069573" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1598a1] px-5 py-3.5 text-sm font-black text-white transition-all hover:bg-[#0f7279] shadow-md shadow-teal-500/10">
                    <Phone className="h-4 w-4" />
                    Call Now
                  </a>
                  <a href={MAPS_LOCATION_URL} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-100">
                    <Navigation className="h-4 w-4" />
                    Get Directions
                  </a>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {TOURISM_METRICS.map((metric) => (
                  <div key={metric.title} className="rounded-md border border-slate-150 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(15,61,86,0.04)] hover:-translate-y-0.5">
                    <div className="text-3xl font-black leading-none text-[#1598a1]">{metric.number}</div>
                    <h4 className="mt-3.5 text-sm font-black text-[#0f3d56] tracking-tight">{metric.title}</h4>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400 font-medium">{metric.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
