import React from 'react';
import type { Metadata } from 'next';
import { ShieldCheck, Ship, MapPin, Phone, History, Award, Users, Anchor, Navigation } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Telangana Boat Tourism | Papikondalu Tours Bhadrachalam',
  description:
    'Meet TSTG Boat Tourism, a trusted Papikondalu and Bhadrachalam travel office offering Godavari river cruises, tours, trips and accommodation support since 2004.',
  alternates: { canonical: '/about' },
  keywords: [
    'Telangana Boat Tourism',
    'Telangana Boat Tourism office',
    'Bhadrachalam travel agency',
    'Papikondalu boat tours',
    'best tours in Bhadrachalam',
  ],
};

const MAPS_LOCATION_URL = 'https://maps.app.goo.gl/6YDfViEq3RLuvNN36?g_st=awb';

const OFFICE_ADDRESS =
  'Telangana Boat Tourism, near SBI ATM, SREE SEETHA RAMA TEMPLE PARKING, DR-NO-4-1-78/1, kalyana mandapam road, opp. sbi atm, Bhadrachalam, Telangana 507111';

const TOURISM_METRICS = [
  { number: '20+', title: 'Years in tourism', text: 'Local Godavari expertise since 2004.' },
  { number: '100k+', title: 'Happy travellers', text: 'Families, groups and pilgrims served.' },
  { number: '3', title: 'Boat capacities', text: 'Options for private and group journeys.' },
  { number: '24/7', title: 'Booking support', text: 'Quick call and WhatsApp assistance.' },
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Cinematic Hero Section */}
      <div className="relative h-[35vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <img
          src="https://res.cloudinary.com/dpdab3e97/image/upload/v1779431956/papikondalu-tour-packages-ap-7_cfwphr.jpg"
          alt="Papikondalu Landscape"
          className="absolute inset-0 w-full h-full object-cover scale-105"
          fetchPriority="high"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-brand-river)]/70 via-[var(--color-brand-river)]/50 to-[var(--color-brand-river)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[10px] font-bold tracking-[0.3em] uppercase mb-8 animate-in slide-in-from-bottom duration-700">
            <Anchor className="h-4 w-4 text-[var(--color-brand-teal)]" />
            Since 2004
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight animate-in slide-in-from-bottom duration-1000 delay-100">
            Pioneers of <span className="text-[var(--color-brand-sand)]">Godavari</span> Tourism
          </h1>
          <p className="text-white/80 text-xl max-w-3xl mx-auto leading-relaxed animate-in slide-in-from-bottom duration-1000 delay-200">
            TSTG Boat Tourism is the premier Gateway to Papikondalu. For over two decades, we have been crafting unforgettable memories on the majestic Godavari waters.
          </p>
        </div>
      </div>

      {/* Our Legacy Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-in slide-in-from-left duration-1000">
              <div className="inline-block">
                <span className="text-[var(--color-brand-teal)] font-bold tracking-[0.2em] uppercase text-xs mb-2 block">Our Story</span>
                <h2 className="text-4xl font-bold text-[var(--color-brand-river)] tracking-tight">Two Decades of Excellence</h2>
                <div className="h-1.5 w-20 bg-[var(--color-brand-sand)] mt-4 rounded-full" />
              </div>
              <p className="text-slate-600 text-lg leading-relaxed">
                Started in the year <span className="font-bold text-[var(--color-brand-river)]">2004</span>, TSTG Boat Tourism has been a pioneer in providing premium tourism services to the most popular destinations in and around Bhadrachalam.
              </p>
              <p className="text-slate-600 text-lg leading-relaxed">
                We specialize in curated River Cruises to <span className="font-bold text-[var(--color-brand-river)]">Papikondalu</span> and the legendary <span className="font-bold text-[var(--color-brand-river)]">Kolluru Bamboo Huts</span>. Our commitment to comfort, safety, and authentic local experiences has made us the trusted choice for domestic and foreign tourists alike.
              </p>
              <div className="flex gap-8 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[var(--color-brand-teal)]">20+</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[var(--color-brand-teal)]">100k+</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Happy Tourists</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[var(--color-brand-teal)]">3</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Luxury Vessels</div>
                </div>
              </div>
            </div>
            <div className="relative group animate-in slide-in-from-right duration-1000">
              <div className="absolute -inset-4 bg-[var(--color-brand-sand)]/20 rounded-[3rem] -rotate-3 scale-95 group-hover:rotate-0 group-hover:scale-100 transition-transform duration-700" />
              <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl">
                <img
                  src="https://res.cloudinary.com/dpdab3e97/image/upload/v1779431943/papikondalu-tour-packages-ap-1_hje1jh.jpg"
                  alt="Our Boat in Godavari"
                  className="w-full h-auto object-cover transform transition-transform duration-1000 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Fleet Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-[var(--color-brand-teal)] font-bold tracking-[0.2em] uppercase text-xs mb-3 block">Premium Fleet</span>
            <h2 className="text-4xl font-bold text-[var(--color-brand-river)] mb-4">Luxury on the Godavari</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Our fleet is meticulously maintained to provide the highest standards of comfort and safety for our guests.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { cap: "50", title: "Intimate Explorer", desc: "Perfect for private groups and family gatherings." },
              { cap: "100", title: "Executive Cruiser", desc: "Our most popular vessel for package tours." },
              { cap: "150", title: "Grand Majestic", desc: "Spacious deck and high-capacity luxury for large events." }
            ].map((boat, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 group">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[var(--color-brand-teal)] group-hover:text-white transition-colors duration-500">
                  <Ship className="h-8 w-8" />
                </div>
                <div className="text-sm font-bold text-[var(--color-brand-teal)] mb-1 uppercase tracking-widest">Capacity: {boat.cap} Seater</div>
                <h3 className="text-xl font-bold text-[var(--color-brand-river)] mb-3">{boat.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  Fully furnished with premium seating, high-performance A/C systems, and all safety amenities required for a smooth journey.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-slate-50 rounded-full text-[10px] font-bold text-slate-400 uppercase">A/C Deck</span>
                  <span className="px-3 py-1 bg-slate-50 rounded-full text-[10px] font-bold text-slate-400 uppercase">Safety Gear</span>
                  <span className="px-3 py-1 bg-slate-50 rounded-full text-[10px] font-bold text-slate-400 uppercase">Catering</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Incorporation */}
      <section className="py-24 bg-[var(--color-brand-river)] overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 translate-x-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-12">
                  <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center">
                    <ShieldCheck className="h-10 w-10 text-[var(--color-brand-teal)] mx-auto mb-4" />
                    <div className="text-white font-bold text-sm">Govt. Verified</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center">
                    <Award className="h-10 w-10 text-[var(--color-brand-sand)] mx-auto mb-4" />
                    <div className="text-white font-bold text-sm">Safety Certified</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center">
                    <Users className="h-10 w-10 text-[var(--color-brand-teal)] mx-auto mb-4" />
                    <div className="text-white font-bold text-sm">Local Experts</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center">
                    <History className="h-10 w-10 text-[var(--color-brand-sand)] mx-auto mb-4" />
                    <div className="text-white font-bold text-sm">20 Years Legacy</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-8 order-1 lg:order-2">
              <span className="text-[var(--color-brand-teal)] font-bold tracking-[0.2em] uppercase text-xs mb-2 block">Trust & Safety</span>
              <h2 className="text-4xl font-bold text-white tracking-tight">Regulated. Reliable. Reputed.</h2>
              <p className="text-white/70 text-lg leading-relaxed">
                TSTG is proud to be incorporated by the <span className="text-[var(--color-brand-sand)] font-bold italic">Government of India Ministry of Corporate Affairs</span>. We operate with strict adherence to safety protocols and regulatory standards.
              </p>
              <p className="text-white/70 text-lg leading-relaxed">
                The very fact that we successfully conduct package tours for both domestic and foreign tourists is a reflection of our efficiency and prompt service.
              </p>
              <div className="pt-6">
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-6">
                  <div className="w-12 h-12 bg-[var(--color-brand-teal)] rounded-full flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-bold">Official Booking Office</div>
                    <div className="text-white/50 text-sm">Central Booking Office, Bhadrachalam</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Official Government Certifications */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[var(--color-brand-teal)] font-bold tracking-[0.2em] uppercase text-xs mb-3 block">Official Credentials</span>
            <h2 className="text-4xl font-bold text-[var(--color-brand-river)] mb-4">Government Registered & Licensed</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Telangana Boat Tourism is officially registered under the Telangana Shops &amp; Establishments Act, 1988 with a valid Boat Tourism Licence issued by the Government of Telangana Labour Department.
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            {/* Certificate Card */}
            <div className="group relative rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200 hover:shadow-[0_30px_80px_rgba(15,61,86,0.18)] transition-all duration-700">
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-brand-river)]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
              <img
                src="/ts_boat_certificate.webp"
                alt="Government of Telangana - Labour Department Certificate of Registration for Telangana Boat Tourism - Reg No. SEA/KMM/ALO/BC/09998/2016"
                className="w-full h-auto object-contain bg-white"
              />
              <div className="absolute inset-x-0 bottom-0 z-20 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-white text-xs font-bold text-center">Govt. of Telangana — Labour Department Certificate of Registration</p>
              </div>
            </div>

            {/* Registration Details */}
            <div className="space-y-6">
              <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,61,86,0.10)]">
                <div className="border-b border-slate-100 bg-gradient-to-r from-[#f7fbfc] to-white p-6">
                  <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-brand-teal)]/10 ring-1 ring-[var(--color-brand-teal)]/15">
                    <ShieldCheck className="h-5 w-5 text-[var(--color-brand-teal)]" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Official Registration</p>
                    <h3 className="text-xl font-black text-[var(--color-brand-river)]">Boat Tourism Licence</h3>
                  </div>
                  </div>
                </div>
                <dl className="divide-y divide-slate-100 p-6">
                  {[
                    { label: 'Registration No.', value: 'SEA/KMM/ALO/BC/09998/2016' },
                    { label: 'Issuing Authority', value: 'Government of Telangana — Labour Department (Form-II, See Rule 3)' },
                    { label: 'Registered Under', value: 'Telangana Shops & Establishments Act, 1988' },
                    { label: 'Registered Name', value: 'Telangana Boat Tourism' },
                    { label: 'Nature of Business', value: 'Boat Tourism' },
                    { label: 'Date of Registration', value: '01/09/2016' },
                    { label: 'Date of Commencement', value: '19/03/2016' },
                    { label: 'Location', value: '3-1-20/A Ramalayam Veedi, Bhadrachalam, Bhadradri Kothagudem, Telangana' },
                  ].map((item) => (
                    <div key={item.label} className="grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[170px_minmax(0,1fr)] sm:gap-5">
                      <dt className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{item.label}</dt>
                      <dd className="min-w-0 text-sm font-bold leading-6 text-slate-700 sm:text-[15px]">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="rounded-[1.75rem] bg-[var(--color-brand-river)] p-6 text-white shadow-[0_24px_60px_rgba(15,61,86,0.22)]">
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                    <Award className="h-6 w-6 text-[var(--color-brand-sand)]" />
                  </span>
                  <div>
                    <h4 className="mb-1 text-base font-black">Digitally Verified by Telangana Government</h4>
                    <p className="text-sm leading-6 text-white/75">
                      This certificate is digitally signed and can be verified at{' '}
                      <a
                        href="http://labour.telangana.gov.in/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--color-brand-sand)] underline hover:no-underline"
                      >
                        labour.telangana.gov.in
                      </a>
                      {' '}by providing the registration number SEA/KMM/ALO/BC/09998/2016.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Location */}
      <section className="bg-[#f7faf9] py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start">
            <div className="relative overflow-hidden rounded-2xl bg-[var(--color-brand-river)] p-5 text-white shadow-2xl sm:p-7 md:p-8">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(229,218,197,0.14),transparent_42%),radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.14),transparent_30%)]" />
              <div className="relative space-y-6">
                <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-sand)] sm:px-4 sm:text-xs">
                  <MapPin className="h-4 w-4" />
                  Central Booking Office
                </span>
                <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
                  Visit us in Bhadrachalam before your Papikondalu journey.
                </h2>
                <p className="text-sm leading-7 text-white/75 sm:text-base">
                  Walk in for route guidance, package selection, on-the-spot bookings and accommodation support from our central booking office.
                </p>

                <div className="pt-4 border-t border-white/10">
                  <div className="rounded-xl bg-white/5 p-4 backdrop-blur-md">
                    <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--color-brand-sand)] mb-1">Our travel brands</div>
                    <div className="text-lg font-bold text-white">Telangana Boat Tourism & Papikondalu Boating</div>
                    <p className="mt-2 text-xs leading-5 text-white/70">
                      Built for travellers searching reliable Papikondalu tours, best Bhadrachalam packages and smooth Godavari river cruise planning.
                    </p>
                  </div>
                </div>

                <p className="rounded-xl border border-white/10 bg-white/10 p-4 text-xs font-semibold leading-5 text-white/80">
                  Note: Please carry Aadhaar Xerox for all passengers and submit it at the boat point.
                </p>
              </div>
            </div>

            <div className="grid gap-6">
              {/* Office Details Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h3 className="text-lg font-bold text-[var(--color-brand-river)] mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[var(--color-brand-teal)]" />
                  Office Details & Location
                </h3>
                <dl className="space-y-4">
                  <div className="grid gap-1">
                    <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Office address
                    </dt>
                    <dd className="text-sm font-semibold leading-relaxed text-slate-700">{OFFICE_ADDRESS}</dd>
                  </div>

                  <div className="grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
                    <div className="min-w-0">
                      <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Contact us
                      </dt>
                      <dd className="mt-1 text-sm font-bold text-[var(--color-brand-teal)]">+91 95420 69573</dd>
                      <dd className="text-sm font-bold text-[var(--color-brand-teal)]">+91 984 984 89 82</dd>
                      <dd className="text-sm font-bold text-[var(--color-brand-teal)]">+91 984 984 89 83</dd>
                      <dd className="text-sm font-bold text-[var(--color-brand-teal)]">+91 984 984 89 38</dd>
                    </div>

                    <div className="min-w-0">
                      <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Reporting time
                      </dt>
                      <dd className="mt-1 text-sm font-semibold text-slate-600">7:00 AM to 7:30 AM</dd>
                    </div>
                  </div>

                  <div className="grid gap-1 border-t border-slate-100 pt-4">
                    <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Email support
                    </dt>
                    <dd className="text-sm font-semibold text-slate-600">bookings@tsboattourism.org</dd>
                  </div>
                </dl>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <a href="tel:+919542069573" className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-brand-teal)] px-5 py-3 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#125866] shadow-sm">
                    <Phone className="h-4 w-4" />
                    Call Now
                  </a>
                  <a href={MAPS_LOCATION_URL} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100 shadow-sm">
                    <Navigation className="h-4 w-4" />
                    Get Directions
                  </a>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {TOURISM_METRICS.map((metric) => (
                  <div key={metric.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <div className="text-3xl font-black leading-none text-[var(--color-brand-teal)]">{metric.number}</div>
                    <h4 className="mt-3 text-sm font-bold text-[var(--color-brand-river)]">{metric.title}</h4>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{metric.text}</p>
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
