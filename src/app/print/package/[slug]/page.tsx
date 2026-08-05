import { notFound } from 'next/navigation';
import { PrintButton } from './PrintButton';

export const dynamic = 'force-dynamic';

const CO = {
  bannerUrl: '/ts-boat-tourism-banner.jpg',
  addr1: 'Om Shanti Satram, Kalyana Mandapam Road,',
  addr2: 'Near SBI ATM, Bhadrachalam,',
  addr3: 'Telangana 507111',
  phones: ['9951369573', '7780119268'],
  email: 'tstelanganatourism@gmail.com',
  website: 'www.tstelanganatourism.com',
};

function cleanImageUrl(url?: string | null): string {
  if (!url || !url.trim()) return '';
  return url.replace('/upload/f_auto,q_auto/', '/upload/').replace('http://', 'https://');
}

type Itinerary = { day_number: number; title: string; description?: string | null; timing?: string | null; duration_at_stop?: string | null; meal_included: boolean; sort_order: number };
type Inclusion = { label: string };
type Exclusion = { label: string };
type Policy = { type: string; title: string; description: string };
type BoardingPt = { title: string; address?: string | null; landmark?: string | null; departure_time?: string | null; contact_number?: string | null; pickup_instructions?: string | null };
type Gallery = { image_url: string; alt_text?: string | null };
type Variant = { title: string; adult_price: number; child_price: number; weekend_adult_price?: number | null; weekend_child_price?: number | null; student_price?: number | null; weekend_student_price?: number | null };
type TransportOption = { id: number; type: string; title: string; capacity?: number | null; adult_price?: number | null; child_price?: number | null; weekend_adult_price?: number | null; weekend_child_price?: number | null; fixed_price?: number | null; weekend_fixed_price?: number | null };
type MealItem = { id: number; meal_type: string; name: string; serving_time?: string | null; description?: string | null; cost_per_person: number; is_vegetarian: boolean; day_number?: number | null };
type ExtraItem = { id: number; title: string; description?: string | null; adult_price?: number | null; child_price?: number | null; student_price?: number | null; min_passengers: number };

interface Pkg {
  title: string;
  type: string;
  duration?: string | null;
  region?: string | null;
  place?: string | null;
  description?: string | null;
  cover_image_url?: string | null;
  min_passengers?: number;
  is_student_package?: boolean;
  has_transport?: boolean;
  transport_options?: TransportOption[];
  has_refreshments?: boolean;
  refreshment_adult_price?: number | null;
  refreshment_child_price?: number | null;
  refreshment_student_price?: number | null;
  refreshments_min_passengers?: number;
  has_food_option?: boolean;
  food_adult_price?: number | null;
  food_child_price?: number | null;
  food_student_price?: number | null;
  itinerary: Itinerary[];
  inclusions: Inclusion[];
  exclusions: Exclusion[];
  policies: Policy[];
  boarding_points: BoardingPt[];
  gallery: Gallery[];
  variants: Variant[];
  meals?: MealItem[];
  extras?: ExtraItem[];
}

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

function deriveDuration(itinerary: Itinerary[]): string {
  const maxDay = itinerary.length ? Math.max(...itinerary.map(i => i.day_number)) : 0;
  if (maxDay === 0) return 'Custom Tour';
  if (maxDay === 1) return '1 Day Tour';
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

function formatCurrency(val?: number | null) {
  if (val === undefined || val === null || isNaN(val)) return '—';
  return `₹${Number(val).toLocaleString('en-IN')}`;
}

export default async function BrochurePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pkg = await getPackage(slug);
  if (!pkg) notFound();

  const byDay = groupByDay(pkg.itinerary || []);
  const durationText = pkg.duration?.trim() || deriveDuration(pkg.itinerary || []);
  
  const rawGallery = (pkg.gallery || []).map((g) => g.image_url).filter(Boolean);
  if (pkg.cover_image_url && !rawGallery.includes(pkg.cover_image_url)) {
    rawGallery.unshift(pkg.cover_image_url);
  }
  let galleryImgs = rawGallery.map(cleanImageUrl).filter(Boolean).slice(0, 8);
  if (galleryImgs.length === 0) {
    galleryImgs = [
      '/home/godavari-hero-banner.jpg',
      '/home/hero-boat.jpg',
      '/placeholder-tourism.jpg',
    ];
  }

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Outfit:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    @page { size: A4 portrait; margin: 0; }
    html, body {
      background: #0f172a;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      font-size: 8.5pt; color: #1e293b;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .brochure-container {
      width: 210mm;
      margin: 0 auto;
      background: #f8fafc;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    }
    @media print {
      html, body { background: #fff; }
      .brochure-container { box-shadow: none; width: 210mm; }
      .no-print { display: none !important; }
    }
    .no-print {
      width: 210mm;
      margin: 0 auto;
      background: #0f172a;
    }
    .banner-img { width: 100%; height: auto; display: block; }
    
    .hero-header {
      background: linear-gradient(135deg, #0f3d56 0%, #1e5878 100%);
      color: #fff;
      padding: 16px 24px;
      margin: 0;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 4px solid #5ac4d7;
    }
    .hero-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-style: italic;
      font-size: 19pt;
      font-weight: 800;
      color: #ffffff;
      text-transform: none;
      letter-spacing: -0.01em;
      line-height: 1.2;
    }
    .hero-badges {
      display: flex;
      gap: 8px;
      margin-top: 8px;
      flex-wrap: wrap;
    }
    .badge {
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.25);
      color: #e0f2fe;
      font-size: 7.5pt;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
    }
    .badge-accent {
      background: #5ac4d7;
      color: #0f3d56;
      border: none;
    }
    
    .section-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-style: italic;
      font-size: 10pt;
      font-weight: 800;
      color: #0f3d56;
      text-transform: none;
      letter-spacing: 0.02em;
      padding: 6px 12px;
      background: #e2e8f0;
      border-left: 4px solid #5ac4d7;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .content-padding { padding: 14px 20px; }

    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }

    .card {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 10px;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8pt;
    }
    .data-table th {
      background: #0f3d56;
      color: #ffffff;
      font-weight: 700;
      text-align: left;
      padding: 5px 8px;
      font-size: 7.5pt;
      text-transform: uppercase;
    }
    .data-table td {
      padding: 5px 8px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }
    .data-table tr:nth-child(even) td { background: #f8fafc; }

    .price-tag { font-weight: 700; color: #059669; }
    .price-weekend { font-weight: 700; color: #d97706; }

    .itinerary-item {
      padding: 6px 0;
      border-bottom: 1px dashed #cbd5e1;
    }
    .itinerary-item:last-child { border-bottom: none; }
    .itinerary-day { font-weight: 800; color: #0f3d56; font-size: 8.5pt; }
    .itinerary-time { font-size: 7.5pt; color: #64748b; font-weight: 600; }
    .itinerary-desc { font-size: 7.5pt; color: #475569; margin-top: 2px; line-height: 1.35; }

    .list-item { display: flex; gap: 6px; font-size: 7.5pt; margin-bottom: 4px; color: #334155; }
    .check-icon { color: #059669; font-weight: bold; }
    .cross-icon { color: #dc2626; font-weight: bold; }

    .footer {
      background: #0f3d56;
      color: #ffffff;
      padding: 12px 20px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      border-top: 3px solid #5ac4d7;
      font-size: 7.5pt;
    }
    .footer-heading {
      font-family: 'Playfair Display', Georgia, serif;
      font-style: italic;
      font-size: 8.5pt;
      font-weight: 800;
      color: #5ac4d7;
      margin-bottom: 4px;
      text-transform: none;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="brochure-container">
        {/* Company Header Banner */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CO.bannerUrl} alt="TS Boat Tourism Banner" className="banner-img" loading="eager" fetchPriority="high" />

        {/* Hero Package Title */}
        <div className="hero-header">
          <div>
            <h1 className="hero-title">{pkg.title}</h1>
            <div className="hero-badges">
              <span className="badge badge-accent">🚢 {pkg.type === 'TRIP' ? 'Day Trip' : 'Tour Package'}</span>
              <span className="badge">⏱ {durationText}</span>
              {pkg.place && <span className="badge">📍 {pkg.place}</span>}
              {pkg.min_passengers && pkg.min_passengers > 1 && (
                <span className="badge" style={{ background: '#f59e0b', color: '#000' }}>👥 Min {pkg.min_passengers} Passengers</span>
              )}
            </div>
          </div>
        </div>

        <div className="content-padding">

          {/* Description */}
          {pkg.description && (
            <div className="card" style={{ marginBottom: '12px', background: '#eff6ff', borderColor: '#bfdbfe' }}>
              <div style={{ fontSize: '8pt', color: '#1e3a8a', lineHeight: '1.4' }}>
                {pkg.description}
              </div>
            </div>
          )}

          {/* Section 1: Ticket Variants & Transport Pricing */}
          <div className="section-title">🎫 Package Ticket Fare &amp; Pricing Options</div>
          <table className="data-table card" style={{ marginBottom: '14px', padding: 0 }}>
            <thead>
              <tr>
                <th>Ticket Category / Variant Name</th>
                <th>Weekday Adult</th>
                <th>Weekday Child</th>
                <th>Weekend Adult</th>
                <th>Weekend Child</th>
              </tr>
            </thead>
            <tbody>
              {(pkg.variants || []).map((v, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 700, color: '#0f3d56' }}>{v.title}</td>
                  <td className="price-tag">{formatCurrency(v.adult_price)}</td>
                  <td className="price-tag">{formatCurrency(v.child_price)}</td>
                  <td className="price-weekend">{formatCurrency(v.weekend_adult_price || v.adult_price)}</td>
                  <td className="price-weekend">{formatCurrency(v.weekend_child_price || v.child_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Section 2: Transport & Vehicle Options */}
          {pkg.has_transport && pkg.transport_options && pkg.transport_options.length > 0 && (
            <>
              <div className="section-title">🚐 Pickup &amp; Transport Vehicle Choices</div>
              <table className="data-table card" style={{ marginBottom: '14px', padding: 0 }}>
                <thead>
                  <tr>
                    <th>Vehicle Type / Pickup Service</th>
                    <th>Type</th>
                    <th>Capacity</th>
                    <th>Fare Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {pkg.transport_options.map((t, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700, color: '#0f3d56' }}>{t.title}</td>
                      <td>{t.type === 'SHARED' ? 'Shared Bus/Cab' : 'Separate Private Cab'}</td>
                      <td>{t.capacity ? `${t.capacity} Persons` : 'Shared'}</td>
                      <td className="price-tag">
                        {t.type === 'SHARED' 
                          ? `Adult: ${formatCurrency(t.adult_price)} | Child: ${formatCurrency(t.child_price)}`
                          : `Fixed Cab Rate: ${formatCurrency(t.fixed_price)}`
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* Section 3: Meals, Fresh-Up & Add-ons Grid */}
          <div className="grid-2" style={{ marginBottom: '14px' }}>
            {/* Meals & Food Experience */}
            <div>
              <div className="section-title">🍽 Included Food &amp; Catering Menu</div>
              <div className="card">
                {pkg.meals && pkg.meals.length > 0 ? (
                  pkg.meals.map((m, i) => (
                    <div key={i} style={{ marginBottom: '6px', paddingBottom: '6px', borderBottom: i < pkg.meals!.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, color: '#0f3d56', fontSize: '8pt' }}>
                          {m.is_vegetarian ? '🟢' : '🔴'} {m.name}
                        </span>
                        <span style={{ fontSize: '7pt', background: '#f1f5f9', padding: '1px 5px', borderRadius: '3px', color: '#475569' }}>
                          {m.serving_time || m.meal_type}
                        </span>
                      </div>
                      {m.description && <div style={{ fontSize: '7pt', color: '#64748b', marginTop: '2px' }}>{m.description}</div>}
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '7.5pt', color: '#64748b', fontStyle: 'italic' }}>
                    Standard Veg/Non-Veg meals provided during Godavari boat cruise.
                  </div>
                )}
                {pkg.has_food_option && (
                  <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed #cbd5e1', fontSize: '7.5pt', color: '#047857', fontWeight: 600 }}>
                    Optional Food Package: Adult {formatCurrency(pkg.food_adult_price)} | Child {formatCurrency(pkg.food_child_price)}
                  </div>
                )}
              </div>
            </div>

            {/* Fresh Up & Custom Add-on Extras */}
            <div>
              <div className="section-title">🏨 Fresh-Up Rooms &amp; Add-on Extras</div>
              <div className="card">
                {pkg.has_refreshments && (
                  <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontWeight: 700, color: '#0f3d56', fontSize: '8pt' }}>Fresh-Up Room Stay (Bath &amp; Change)</div>
                    <div style={{ fontSize: '7.5pt', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
                      Adult: {formatCurrency(pkg.refreshment_adult_price)} | Child: {formatCurrency(pkg.refreshment_child_price)}
                    </div>
                  </div>
                )}

                {pkg.extras && pkg.extras.length > 0 ? (
                  pkg.extras.map((e, i) => (
                    <div key={i} style={{ marginBottom: '6px' }}>
                      <div style={{ fontWeight: 700, color: '#0f3d56', fontSize: '8pt' }}>✨ {e.title}</div>
                      {e.description && <div style={{ fontSize: '7pt', color: '#64748b' }}>{e.description}</div>}
                      <div style={{ fontSize: '7.5pt', color: '#d97706', fontWeight: 600 }}>
                        Adult: {formatCurrency(e.adult_price)} | Child: {formatCurrency(e.child_price)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '7.5pt', color: '#64748b', fontStyle: 'italic' }}>
                    No custom add-on extras configured.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Day-by-Day Itinerary */}
          <div className="section-title">🗺 Tour Itinerary &amp; Daily Schedule</div>
          <div className="card" style={{ marginBottom: '14px' }}>
            {Array.from(byDay.entries()).map(([dayNum, items]) => (
              <div key={dayNum} style={{ marginBottom: '8px' }}>
                <div style={{ background: '#0f3d56', color: '#fff', fontSize: '8pt', fontWeight: 800, padding: '2px 8px', borderRadius: '3px', display: 'inline-block', marginBottom: '4px' }}>
                  DAY {dayNum}
                </div>
                {items.map((item, idx) => (
                  <div key={idx} className="itinerary-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="itinerary-day">{item.title}</span>
                      {item.timing && <span className="itinerary-time">⏰ {item.timing}</span>}
                    </div>
                    {item.description && <div className="itinerary-desc">{item.description}</div>}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Section 5: Boarding Points */}
          {(pkg.boarding_points || []).length > 0 && (
            <>
              <div className="section-title">📍 Boarding &amp; Pickup Locations</div>
              <div className="grid-2" style={{ marginBottom: '14px' }}>
                {pkg.boarding_points.map((bp, i) => (
                  <div key={i} className="card">
                    <div style={{ fontWeight: 800, color: '#0f3d56', fontSize: '8.5pt' }}>{bp.title}</div>
                    {bp.address && <div style={{ fontSize: '7.5pt', color: '#475569', marginTop: '2px' }}>{bp.address}</div>}
                    {bp.departure_time && <div style={{ fontSize: '7.5pt', color: '#d97706', fontWeight: 700, marginTop: '4px' }}>⏰ Reporting Time: {bp.departure_time}</div>}
                    {bp.contact_number && <div style={{ fontSize: '7.5pt', color: '#059669', fontWeight: 700 }}>📞 Contact: {bp.contact_number}</div>}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Section 6: Inclusions, Exclusions & Policies */}
          <div className="grid-3" style={{ marginBottom: '14px' }}>
            <div>
              <div className="section-title" style={{ background: '#dcfce7', color: '#166534', borderLeftColor: '#22c55e' }}>✓ Inclusions</div>
              <div className="card">
                {(pkg.inclusions || []).map((inc, i) => (
                  <div key={i} className="list-item"><span className="check-icon">✓</span><span>{inc.label}</span></div>
                ))}
              </div>
            </div>

            <div>
              <div className="section-title" style={{ background: '#fee2e2', color: '#991b1b', borderLeftColor: '#ef4444' }}>✕ Exclusions</div>
              <div className="card">
                {(pkg.exclusions || []).map((exc, i) => (
                  <div key={i} className="list-item"><span className="cross-icon">✕</span><span>{exc.label}</span></div>
                ))}
              </div>
            </div>

            <div>
              <div className="section-title">📋 Important Guidelines</div>
              <div className="card">
                {(pkg.policies || []).slice(0, 4).map((p, i) => (
                  <div key={i} style={{ marginBottom: '4px', fontSize: '7pt' }}>
                    <span style={{ fontWeight: 700, color: '#0f3d56' }}>{p.title}: </span>
                    <span style={{ color: '#475569' }}>{p.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Gallery Showcase */}
          {galleryImgs.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <div className="section-title">🖼 Destination Gallery</div>
              <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {galleryImgs.map((img, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={img} alt="Destination Gallery" loading="eager" referrerPolicy="no-referrer" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="footer">
          <div>
            <div className="footer-heading">🏢 Office Address</div>
            <div>{CO.addr1}<br />{CO.addr2}<br />{CO.addr3}</div>
          </div>
          <div>
            <div className="footer-heading">📞 Hotline Numbers</div>
            <div>{CO.phones.map((p, i) => <div key={i}>{p}</div>)}</div>
          </div>
          <div>
            <div className="footer-heading">✉ Official Email</div>
            <div>{CO.email}</div>
          </div>
          <div>
            <div className="footer-heading">🌐 Online Booking</div>
            <div>{CO.website}</div>
          </div>
        </div>

      </div>

      <PrintButton />
    </>
  );
}
