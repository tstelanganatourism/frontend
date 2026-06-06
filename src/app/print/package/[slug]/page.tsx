import { notFound } from 'next/navigation';
import { PrintButton } from './PrintButton';

export const dynamic = 'force-dynamic';

// ─── Company constants (fixed for every brochure) ──────────────────────────
const CO = {
  bannerUrl: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1779480316/27d6478a-0032-4cc3-a0e0-20eec56de773.png',
  addr1: 'D.no: 4-1-78/1 (Near SBI ATM),',
  addr2: 'Kalyana Mandapam Road, Opp SBI ATM,',
  addr3: 'Bhadrachalam, BHADRADRI KOTHAGUDEM Dist.,',
  addr4: 'Telangana State - 507 111',
  phones: ['+91 95420 69573', '+91 984 984 89 82', '+91 984 984 89 83', '+91 984 984 89 38'],
  website: 'www.tsboattourism.org',
};

// ─── Types ─────────────────────────────────────────────────────────────────
type Itinerary = { day_number: number; title: string; description?: string | null; timing?: string | null; duration_at_stop?: string | null; meal_included: boolean; sort_order: number };
type Inclusion = { label: string };
type Exclusion = { label: string };
type Policy = { type: string; title: string; description: string };
type BoardingPt = { title: string; address?: string | null; landmark?: string | null; departure_time?: string | null; contact_number?: string | null; pickup_instructions?: string | null };
type Gallery = { image_url: string; alt_text?: string | null };
type Variant = { title: string; adult_price: number; child_price: number; transport_info?: string | null };
type TransportOption = { id: number; type: string; title: string; capacity?: number | null; adult_price?: number | null; child_price?: number | null; weekend_adult_price?: number | null; weekend_child_price?: number | null; fixed_price?: number | null; weekend_fixed_price?: number | null; };

interface Pkg {
  title: string;
  type: string;
  duration?: string | null;
  region?: string | null;
  cover_image_url?: string | null;
  itinerary: Itinerary[];
  inclusions: Inclusion[];
  exclusions: Exclusion[];
  policies: Policy[];
  boarding_points: BoardingPt[];
  gallery: Gallery[];
  variants: Variant[];
  has_transport?: boolean;
  transport_options?: TransportOption[];
  has_refreshments?: boolean;
  refreshment_adult_price?: number | null;
  refreshment_child_price?: number | null;
}

// ─── Data fetch ────────────────────────────────────────────────────────────
async function getPackage(slug: string): Promise<Pkg | null> {
  try {
    const backendUrl = process.env.BACKEND_URL ?? 'http://127.0.0.1:8000';
    const res = await fetch(`${backendUrl}/api/v1/packages/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function deriveDuration(itinerary: Itinerary[]): string {
  const maxDay = itinerary.length ? Math.max(...itinerary.map(i => i.day_number)) : 0;
  if (maxDay === 0) return '—';
  if (maxDay === 1) return '1 Day';
  return `${maxDay} Days / ${maxDay - 1} Night${maxDay - 1 > 1 ? 's' : ''}`;
}

function groupByDay(itinerary: Itinerary[]): Map<number, Itinerary[]> {
  const map = new Map<number, Itinerary[]>();
  const sorted = [...itinerary].sort((a, b) => a.day_number - b.day_number || a.sort_order - b.sort_order);
  for (const item of sorted) {
    if (!map.has(item.day_number)) map.set(item.day_number, []);
    map.get(item.day_number)!.push(item);
  }
  return map;
}

function typeLabel(type: string) {
  const map: Record<string, string> = { TOUR: 'Tour Package', TRIP: 'Day Trip', CRUISE: 'River Cruise', SIGHTSEEING: 'Sightseeing' };
  return map[type] ?? type;
}

function hasVal(v?: string | null) { return v && v.trim().length > 0; }

// ─── Main page ─────────────────────────────────────────────────────────────
export default async function BrochurePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pkg = await getPackage(slug);
  if (!pkg) notFound();

  const byDay = groupByDay(pkg.itinerary);
  const duration = hasVal(pkg.duration) ? pkg.duration! : deriveDuration(pkg.itinerary);
  const primary = pkg.boarding_points[0];
  const variantsList = pkg.variants || [];
  const transportOptions: string[] = [];
  variantsList.forEach(v => {
    const titleLower = v.title.toLowerCase();
    if (titleLower.includes('non-a/c') || titleLower.includes('non-ac') || titleLower.includes('shared non-a/c')) {
      if (!transportOptions.includes('Shared Non-A/C')) transportOptions.push('Shared Non-A/C');
    } else if (titleLower.includes('a/c') || titleLower.includes(' ac ') || titleLower.includes('shared a/c') || titleLower.includes('shared ac')) {
      if (!transportOptions.includes('Shared A/C')) transportOptions.push('Shared A/C');
    } else if (titleLower.includes('car') || titleLower.includes('cab') || titleLower.includes('private') || titleLower.includes('separate')) {
      if (!transportOptions.includes('Separate Vehicle')) transportOptions.push('Separate Vehicle');
    }
  });

  let transport = '';
  if (transportOptions.length > 0) {
    transport = transportOptions.join(' / ');
  } else {
    const firstActive = variantsList[0];
    if (firstActive) {
      const infoLower = (firstActive.transport_info || '').toLowerCase();
      if (infoLower.includes('no transport') || firstActive.title.toLowerCase().includes('no transport')) {
        transport = 'No transport included';
      } else {
        transport = firstActive.title;
      }
    } else {
      transport = 'No transport specified';
    }
  }
  const galleryImgs = pkg.gallery.slice(0, 3);

  // Has any itinerary item a timing value?
  const hasAnyTiming = pkg.itinerary.some(i => hasVal(i.timing));
  const hasAnyDuration = pkg.itinerary.some(i => hasVal(i.duration_at_stop));

  const CSS = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    @page { size: A4 portrait; margin: 0; }
    html, body {
      background: #e8e8e8;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 9pt; color: #1a1a1a;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    /* Screen: center the A4 column */
    .page {
      width: 210mm;
      min-height: 297mm;
      max-width: 210mm;
      margin: 0 auto;
      background: #fff;
      padding: 0 0 6mm 0;
      overflow: hidden;
      box-shadow: 0 2px 16px rgba(0,0,0,0.18);
    }
    /* Print: full bleed */
    @media print {
      html, body { background: #fff; }
      .page { box-shadow: none; margin: 0; width: 210mm; }
      .no-print { display: none !important; }
    }
    /* Screen-only print button */
    .no-print {
      display: flex; justify-content: flex-end;
      padding: 4mm 7mm 2mm;
      background: #e8e8e8;
      width: 210mm; max-width: 210mm; margin: 0 auto;
    }
    .print-btn {
      background: #0d2f5e; color: #fff; border: none; cursor: pointer;
      padding: 2.5mm 6mm; border-radius: 4px; font-size: 8.5pt; font-weight: 700;
      display: flex; align-items: center; gap: 2mm;
    }
    .print-btn:hover { background: #1a4a80; }

    /* ── BANNER HEADER ── */
    .banner { width: 100%; display: block; }

    /* ── TITLE STRIP below banner ── */
    .title-strip {
      background: #fff;
      border: 1.5px solid #0d2f5e;
      border-top: none;
      padding: 4mm 6mm;
      margin-bottom: 3mm;
    }
    .title-strip h1 {
      font-size: 18pt; font-weight: 700;
      color: #0d2f5e; text-transform: uppercase;
      line-height: 1.1;
    }
    .title-meta {
      margin-top: 1.5mm;
      font-size: 8pt; color: #555;
      display: flex; gap: 5mm; flex-wrap: wrap;
    }
    .title-meta span { display: flex; align-items: center; gap: 1.5mm; }

    /* ── SECTION HEADER ── */
    .sh { background: #0d2f5e; color: #fff; font-weight: 700; font-size: 8.5pt; letter-spacing: .04em; padding: 2mm 4mm; text-align: center; text-transform: uppercase; }

    /* ── OVERVIEW ── */
    .ov { border: 1px solid #b8c8d8; margin: 0 7mm 3mm; }
    .ov-grid { display: grid; grid-template-columns: repeat(3,1fr); }
    .ov-cell { padding: 2.5mm 3mm; border-right: 1px solid #b8c8d8; border-top: 1px solid #b8c8d8; }
    .ov-cell:nth-child(3n) { border-right: none; }
    .ov-label { font-size: 7pt; color: #555; }
    .ov-val { font-size: 8.5pt; font-weight: 700; color: #0d2f5e; margin-top: .5mm; }

    /* ── MID GRID ── */
    .mid { display: grid; grid-template-columns: 1.55fr 1fr; gap: 3mm; margin: 0 7mm 3mm; }
    .tw { border: 1px solid #b8c8d8; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #e8eef4; font-size: 7.5pt; font-weight: 700; color: #0d2f5e; padding: 2mm 2.5mm; border-bottom: 1px solid #b8c8d8; text-align: left; }
    td { font-size: 7.5pt; padding: 1.8mm 2.5mm; border-bottom: 1px solid #e4ecf2; vertical-align: top; }
    .day-lbl { font-weight: 700; color: #0d2f5e; }
    .mb { display: inline-block; background: #e8f5e9; color: #2e7d32; font-size: 6.5pt; font-weight: 700; padding: .3mm 1.5mm; border-radius: 2px; margin-top: .5mm; }
    .mp { border: 1px solid #b8c8d8; }
    .mr { padding: 3mm 3.5mm; border-bottom: 1px solid #e4ecf2; display: flex; align-items: flex-start; gap: 2.5mm; }
    .mi { font-size: 11pt; min-width: 5mm; }
    .mn { font-weight: 700; font-size: 8pt; color: #0d2f5e; }
    .md { font-size: 7.5pt; color: #444; margin-top: .5mm; }

    /* ── THREE COL ── */
    .tc { display: grid; grid-template-columns: repeat(3,1fr); gap: 3mm; margin: 0 7mm 3mm; }
    .cp { border: 1px solid #b8c8d8; }
    .li { display: flex; align-items: flex-start; gap: 2mm; padding: 1.5mm 3mm; border-bottom: 1px solid #f0f4f7; font-size: 7.5pt; }
    .ii { color: #2e7d32; font-size: 9pt; min-width: 4mm; font-weight: 700; }
    .xi { color: #c62828; font-size: 9pt; min-width: 4mm; font-weight: 700; }
    .ri { color: #f47920; font-size: 9pt; min-width: 4mm; }

    /* ── INFO ── */
    .ip { border: 1px solid #b8c8d8; margin: 0 7mm 3mm; }
    .il { display: flex; align-items: flex-start; gap: 2mm; padding: 1.5mm 3.5mm; border-bottom: 1px solid #f0f4f7; font-size: 7.5pt; }

    /* ── GALLERY + RP ── */
    .bg { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; margin: 0 7mm 3mm; }
    .gg { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.5mm; padding: 2mm; }
    .gg img { width: 100%; height: 25mm; object-fit: cover; display: block; }
    .gph { width: 100%; height: 25mm; background: #dde8f0; display: flex; align-items: center; justify-content: center; font-size: 7pt; color: #8aa; }
    .rp { border: 1px solid #b8c8d8; }
    .rr { padding: 2mm 3.5mm; border-bottom: 1px solid #e4ecf2; font-size: 7.5pt; display: flex; gap: 2mm; }
    .rl { font-weight: 700; color: #0d2f5e; min-width: 24mm; }

    /* ── FOOTER ── */
    .fw { height: 3mm; background: linear-gradient(90deg,#f47920 0%,#0d2f5e 40%,#009688 100%); margin: 0 7mm; }
    .ft { background: #0d2f5e; color: #fff; display: grid; grid-template-columns: repeat(4,1fr); margin: 0 7mm; }
    .fc { padding: 3mm 3.5mm; border-right: 1px solid #1e4a7a; }
    .fc:last-child { border-right: none; }
    .ft-t { font-size: 7.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 1.5mm; opacity: .8; }
    .ft-v { font-size: 7.5pt; line-height: 1.6; }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <PrintButton />

      <div className="page">

        {/* ── COMPANY BANNER (full width) ─────────────────────────── */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CO.bannerUrl} alt="TSTG Boat Tourism" className="banner" />

        {/* ── PACKAGE TITLE STRIP ─────────────────────────────────── */}
        <div className="title-strip" style={{ margin: '0 7mm 3mm' }}>
          <h1>{pkg.title}</h1>
          <div className="title-meta">
            <span>🚢 {typeLabel(pkg.type)}</span>
            <span>⏱ {duration}</span>
            {hasVal(primary?.departure_time) && <span>⏰ Reporting: {primary!.departure_time}</span>}
            {hasVal(primary?.title) && <span>📍 {primary!.title}</span>}
          </div>
        </div>

        {/* ── PACKAGE OVERVIEW ─────────────────────────────────────── */}
        <div className="ov">
          <div className="sh">Package Overview</div>
          <div className="ov-grid">
            <div className="ov-cell"><div className="ov-label">🚢 Package Type</div><div className="ov-val">{typeLabel(pkg.type)}</div></div>
            <div className="ov-cell"><div className="ov-label">⏱ Duration</div><div className="ov-val">{duration}</div></div>
            <div className="ov-cell"><div className="ov-label">⭐ Best For</div><div className="ov-val">Families &amp; Groups</div></div>
            <div className="ov-cell"><div className="ov-label">📍 Reporting Point</div><div className="ov-val">{primary?.title ?? '—'}</div></div>
            <div className="ov-cell"><div className="ov-label">🚌 Transport Type</div><div className="ov-val">{transport}</div></div>
            <div className="ov-cell"><div className="ov-label">⏰ Reporting Time</div><div className="ov-val">{primary?.departure_time ?? '—'}</div></div>
          </div>
        </div>

        {/* ── FARE & VARIANT PRICING ───────────────────────────────── */}
        {pkg.variants && pkg.variants.length > 0 && (
          <div className="ov" style={{ marginTop: '0mm', marginBottom: '3mm' }}>
            <div className="sh">Fare &amp; Variant Options</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#e8eef4' }}>
                  <th style={{ padding: '2mm 3.5mm', fontSize: '7.5pt', fontWeight: 700, color: '#0d2f5e', borderBottom: '1px solid #b8c8d8' }}>Fare Option / Transport Variant</th>
                  <th style={{ padding: '2mm 3.5mm', fontSize: '7.5pt', fontWeight: 700, color: '#0d2f5e', borderBottom: '1px solid #b8c8d8', width: '35mm', textAlign: 'right' }}>Adult Price</th>
                  <th style={{ padding: '2mm 3.5mm', fontSize: '7.5pt', fontWeight: 700, color: '#0d2f5e', borderBottom: '1px solid #b8c8d8', width: '35mm', textAlign: 'right' }}>Child Price</th>
                </tr>
              </thead>
              <tbody>
                {pkg.variants.map((v, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e4ecf2' }}>
                    <td style={{ padding: '2mm 3.5mm', fontSize: '7.5pt' }}>
                      <div style={{ fontWeight: 700, color: '#0d2f5e' }}>{v.title}</div>
                      {v.transport_info && <div style={{ fontSize: '7pt', color: '#666', marginTop: '0.5mm' }}>{v.transport_info}</div>}
                    </td>
                    <td style={{ padding: '2mm 3.5mm', fontSize: '7.5pt', fontWeight: 700, textAlign: 'right', color: '#2e7d32' }}>
                      ₹{Number(v.adult_price).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '2mm 3.5mm', fontSize: '7.5pt', fontWeight: 700, textAlign: 'right', color: '#1a6b7a' }}>
                      ₹{Number(v.child_price).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── ITINERARY + MEALS ─────────────────────────────────────── */}
        <div className="mid">
          <div>
            <div className="sh">Itinerary (Day Wise)</div>
            <div className="tw">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '10mm' }}>Day</th>
                    {hasAnyTiming && <th style={{ width: '18mm' }}>Time</th>}
                    <th>Activity / Plan Details</th>
                    {hasAnyDuration && <th style={{ width: '20mm' }}>Duration</th>}
                  </tr>
                </thead>
                <tbody>
                  {byDay.size === 0
                    ? <tr><td colSpan={4} style={{ color: '#888', fontStyle: 'italic' }}>No itinerary added yet</td></tr>
                    : Array.from(byDay.entries()).map(([day, stops]) =>
                      stops.map((stop, idx) => (
                        <tr key={`${day}-${idx}`}>
                          {idx === 0 && (
                            <td rowSpan={stops.length} className="day-lbl" style={{ verticalAlign: 'middle', borderRight: '1px solid #dde', textAlign: 'center' }}>
                              Day {day}
                            </td>
                          )}
                          {hasAnyTiming && <td>{hasVal(stop.timing) ? stop.timing : '—'}</td>}
                          <td style={{ padding: '2.5mm 3.5mm' }}>
                            <div style={{ fontWeight: 700, color: '#0d2f5e', fontSize: '8pt', marginBottom: '0.5mm' }}>{stop.title}</div>
                            {hasVal(stop.description) && (
                              <div style={{ fontSize: '7.5pt', color: '#444', whiteSpace: 'pre-line', lineHeight: '1.4', paddingLeft: '2mm', borderLeft: '2.5px solid #5ac4d7', marginTop: '1.5mm', marginBottom: '1.5mm' }}>
                                {stop.description}
                              </div>
                            )}
                            {stop.meal_included && <div className="mb">✓ Meal Included</div>}
                          </td>
                          {hasAnyDuration && <td>{hasVal(stop.duration_at_stop) ? stop.duration_at_stop : '—'}</td>}
                        </tr>
                      ))
                    )
                  }
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="sh">Food / Meal Timings</div>
            <div className="mp">
              {pkg.itinerary.filter(i => i.meal_included).length === 0 ? (
                <div className="mr">
                  <span className="mi">🍽</span>
                  <div><div className="mn">Meals</div><div className="md">No meals included in this package</div></div>
                </div>
              ) : (
                pkg.itinerary.filter(i => i.meal_included).map((i, idx) => (
                  <div className="mr" key={idx}>
                    <span className="mi">🍽</span>
                    <div>
                      <div className="mn">Day {i.day_number} — {i.title}</div>
                      <div className="md">✓ Meal included{hasVal(i.timing) ? ` · ${i.timing}` : ''}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {pkg.has_refreshments && (
              <>
                <div className="sh" style={{ marginTop: '3mm' }}>Fresh-Up / Resting Stop</div>
                <div className="mp">
                  <div className="mr" style={{ borderBottom: 'none' }}>
                    <span className="mi">🏨</span>
                    <div style={{ width: '100%' }}>
                      <div className="mn">Hotel Stop for Bath &amp; Rest</div>
                      <div className="md" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1mm' }}>
                        <span>Adult: ₹{pkg.refreshment_adult_price?.toLocaleString('en-IN') ?? 0}</span>
                        <span>Child: ₹{pkg.refreshment_child_price?.toLocaleString('en-IN') ?? 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {pkg.has_transport && pkg.transport_options && pkg.transport_options.length > 0 && (
              <>
                <div className="sh" style={{ marginTop: '3mm' }}>Transport Options</div>
                <div className="mp">
                  {pkg.transport_options.map((opt, idx) => (
                    <div className="mr" key={idx} style={{ borderBottom: idx === pkg.transport_options!.length - 1 ? 'none' : '1px solid #e4ecf2' }}>
                      <span className="mi">{opt.type === 'SHARED' ? '🚐' : '🚗'}</span>
                      <div style={{ width: '100%' }}>
                        <div className="mn">{opt.title}</div>
                        <div className="md" style={{ marginTop: '1mm', lineHeight: '1.4' }}>
                          <span style={{ fontWeight: 600, color: '#1a6b7a' }}>{opt.type === 'SHARED' ? 'Shared Vehicle' : 'Separate Vehicle'}</span>
                          {opt.type === 'SHARED' ? (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5mm' }}>
                              <span>Adult: ₹{opt.adult_price?.toLocaleString('en-IN') ?? 0}</span>
                              <span>Child: ₹{opt.child_price?.toLocaleString('en-IN') ?? 0}</span>
                            </div>
                          ) : (
                            <div style={{ marginTop: '0.5mm' }}>
                              Fixed Price: ₹{opt.fixed_price?.toLocaleString('en-IN') ?? 0} <span style={{ color: '#888' }}>(Capacity: {opt.capacity})</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── INCLUSIONS / EXCLUSIONS / POLICIES ────────────────────── */}
        <div className="tc">
          <div className="cp">
            <div className="sh">Inclusions</div>
            {pkg.inclusions.length === 0
              ? <div className="li" style={{ color: '#888', fontStyle: 'italic' }}>No inclusions added</div>
              : pkg.inclusions.map((inc, i) => (
                <div className="li" key={i}><span className="ii">✔</span><span>{inc.label}</span></div>
              ))}
          </div>
          <div className="cp">
            <div className="sh">Exclusions</div>
            {pkg.exclusions.length === 0
              ? <div className="li" style={{ color: '#888', fontStyle: 'italic' }}>No exclusions added</div>
              : pkg.exclusions.map((exc, i) => (
                <div className="li" key={i}><span className="xi">✖</span><span>{exc.label}</span></div>
              ))}
          </div>
          <div className="cp">
            <div className="sh">Travel Policies</div>
            {pkg.policies.length === 0
              ? <div className="li" style={{ color: '#888', fontStyle: 'italic' }}>No policy guidelines added</div>
              : pkg.policies.map((p, i) => (
                <div className="li" key={i} style={{ flexDirection: 'column', gap: '0.5mm', padding: '2mm 3mm', borderBottom: '1px solid #f0f4f7' }}>
                  <div style={{ fontWeight: 700, color: '#f47920', fontSize: '7.5pt' }}>{p.title || p.type}</div>
                  <div style={{ fontSize: '7pt', color: '#444', whiteSpace: 'pre-line', lineHeight: '1.3' }}>{p.description}</div>
                </div>
              ))}
          </div>
        </div>

        {/* ── GALLERY + REPORTING POINT ────────────────────────────── */}
        <div className="bg">
          <div>
            <div className="sh">Gallery</div>
            <div className="gg">
              {galleryImgs.length === 0
                ? [0, 1, 2].map(i => <div key={i} className="gph">No image</div>)
                : galleryImgs.map((img, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={img.image_url} alt={img.alt_text ?? `Gallery ${i + 1}`} />
                ))
              }
            </div>
          </div>
          <div>
            <div className="sh">Reporting Point</div>
            <div className="rp">
              {/* Only render rows that have actual values */}
              {hasVal(primary?.address) && (
                <div className="rr"><span className="rl">Address</span><span>{primary!.address}</span></div>
              )}
              {hasVal(primary?.landmark) && (
                <div className="rr"><span className="rl">Landmark</span><span>{primary!.landmark}</span></div>
              )}
              {hasVal(primary?.contact_number) && (
                <div className="rr"><span className="rl">Contact Person</span><span>{primary!.contact_number}</span></div>
              )}
              {hasVal(primary?.departure_time) && (
                <div className="rr"><span className="rl">Reporting Time</span><span>{primary!.departure_time}</span></div>
              )}
              {hasVal(primary?.pickup_instructions) && (
                <div className="rr"><span className="rl">Instructions</span><span>{primary!.pickup_instructions}</span></div>
              )}
              {!primary && (
                <div className="rr" style={{ color: '#888', fontStyle: 'italic' }}>No reporting point added</div>
              )}
            </div>
          </div>
        </div>

        {/* ── FOOTER ───────────────────────────────────────────────── */}
        <div className="fw" />
        <div className="ft">
          <div className="fc">
            <div className="ft-t">📍 Contact Us</div>
            <div className="ft-v">{CO.addr1}<br />{CO.addr2}<br />{CO.addr3}<br />{CO.addr4}</div>
          </div>
          <div className="fc">
            <div className="ft-t">📞 Call Us</div>
            <div className="ft-v">{CO.phones.map((p, i) => <div key={i}>{p}</div>)}</div>
          </div>
          <div className="fc">
            <div className="ft-t">✉ Email Us</div>
            <div className="ft-v">bookings@tsboattourism.org</div>
          </div>
          <div className="fc">
            <div className="ft-t">🌐 Visit Us</div>
            <div className="ft-v">{CO.website}</div>
          </div>
        </div>

      </div>
    </>
  );
}
