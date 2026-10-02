'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import PrintAction from '@/components/ui/PrintAction';

interface BookingReportItem {
  pnr: string;
  package_name: string;
  category: string;
  package_type: string | null;
  transport: string;
  booker_name: string;
  passenger_count: number;
  passenger_label: string;
  travel_date: string;
  mobile: string;
  status: string;
  source: string;
  total_amount: number;
  paid_amount: number;
  remaining_balance: number;
  created_at: string | null;
}

interface PrintReportData {
  report_label: string;
  date: string | null;
  start_date: string | null;
  end_date: string | null;
  total: number;
  items: BookingReportItem[];
}

function formatDisplayDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    FULLY_PAID: 'Confirmed',
    PARTIAL_PAID: 'Advance Paid',
    PENDING: 'Pending',
    CANCELLED: 'Cancelled',
    REFUNDED: 'Refunded',
  };
  return map[status] ?? status.replace(/_/g, ' ');
}

function statusColor(status: string) {
  if (status === 'FULLY_PAID') return '#15803d';
  if (status === 'PARTIAL_PAID') return '#1d4ed8';
  if (status === 'CANCELLED') return '#dc2626';
  if (status === 'REFUNDED') return '#64748b';
  return '#b45309';
}

function pkgTypeLabel(type: string | null) {
  if (type === 'TOUR') return 'Boat Ride';
  if (type === 'TRIP') return 'Sightseeing';
  return type ?? 'Package';
}

function pkgTypeBg(type: string | null) {
  if (type === 'TOUR') return { bg: '#eff6ff', color: '#1d4ed8' };
  if (type === 'TRIP') return { bg: '#fdf4ff', color: '#7e22ce' };
  return { bg: '#f0fdf4', color: '#15803d' };
}

function ReportContent() {
  const searchParams = useSearchParams();

  const date = searchParams?.get('date') || '';
  const startDate = searchParams?.get('start_date') || '';
  const endDate = searchParams?.get('end_date') || '';
  const status = searchParams?.get('status') || '';

  const [data, setData] = useState<PrintReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<'auth' | 'notfound' | 'invalid' | null>(null);

  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (date) params.date = date;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (status) params.status_filter = status;

      const res = await apiClient.get('/api/v1/admin/bookings/print-report', { params });
      setData(res.data);
    } catch (err: any) {
      const statusCode = err?.response?.status;
      if (statusCode === 401 || statusCode === 403) {
        setError('auth');
      } else if (statusCode === 404) {
        setError('notfound');
      } else if (statusCode === 422) {
        setError('invalid');
      } else {
        setError('notfound');
      }
    } finally {
      setIsLoading(false);
    }
  }, [date, startDate, endDate, status]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const generatedAt = new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).toUpperCase();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px', color: '#475569' }}>
        <div style={{
          width: '44px', height: '44px', border: '4px solid #e2e8f0', borderTop: '4px solid #0a2351',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite'
        }} />
        <span style={{ fontSize: '14px', fontWeight: 700 }}>Loading booking report…</span>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }` }} />
      </div>
    );
  }

  if (error === 'auth') {
    return (
      <div style={{ padding: '60px', fontFamily: 'system-ui', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔒</div>
        <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#dc2626', marginBottom: '10px' }}>Admin Access Required</h1>
        <p style={{ color: '#475569', marginBottom: '20px' }}>Please log in to the admin panel to view this report.</p>
        <a
          href="/admin/login"
          style={{ display: 'inline-block', background: '#0a2351', color: '#fff', padding: '12px 28px', borderRadius: '10px', fontWeight: 800, textDecoration: 'none', fontSize: '14px' }}
        >
          Go to Admin Login
        </a>
      </div>
    );
  }

  if (error === 'invalid') {
    return (
      <div style={{ padding: '60px', fontFamily: 'system-ui', textAlign: 'center', color: '#b45309' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
        <h1 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '10px' }}>Invalid Date Parameters</h1>
        <p style={{ color: '#475569', marginBottom: '20px' }}>Please provide a valid date or date range.</p>
        <button
          onClick={() => window.close()}
          style={{ background: '#0a2351', color: '#fff', padding: '12px 28px', borderRadius: '10px', fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: '14px' }}
        >
          Close Window
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Outfit:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Telugu:wght@500;700;800&display=swap');

        * { box-sizing: border-box; }

        body {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          background: #f1f5f9;
          color: #1e293b;
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .print-report-wrapper {
          width: 100%;
          max-width: 1040px;
          margin: 20px auto;
          background: #ffffff;
          box-shadow: 0 10px 40px rgba(10, 35, 81, 0.10);
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #cbd5e1;
        }

        /* ── HEADER ── */
        .report-header {
          display: grid;
          grid-template-columns: 110px 1fr 90px;
          align-items: center;
          gap: 14px;
          padding: 16px 28px 14px;
          border-bottom: 3px solid #0a2351;
          background: #ffffff;
        }

        .header-logo-left img {
          height: 72px;
          width: auto;
          object-fit: contain;
        }

        .header-center {
          text-align: center;
          padding: 0 8px;
        }

        .header-org-name {
          font-family: 'Outfit', sans-serif;
          font-weight: 900;
          font-size: 15px;
          color: #0a2351;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          line-height: 1.2;
          margin-bottom: 4px;
        }

        .header-org-address {
          font-size: 9.5px;
          font-weight: 600;
          color: #334155;
          line-height: 1.5;
          margin-bottom: 3px;
        }

        .header-org-website {
          font-size: 9.5px;
          font-weight: 700;
          color: #c8181e;
          text-decoration: none;
        }

        .header-logo-right img {
          height: 72px;
          width: auto;
          object-fit: contain;
        }

        /* ── REPORT TITLE RIBBON ── */
        .report-title-ribbon {
          background: linear-gradient(135deg, #0a2351 0%, #1a3a6b 100%);
          color: #ffffff;
          padding: 12px 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .ribbon-left {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .ribbon-doc-type {
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #c8a45a;
        }

        .ribbon-title {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: 22px;
          font-weight: 900;
          color: #ffffff;
          margin: 0;
          line-height: 1.2;
        }

        .ribbon-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .ribbon-date-range {
          font-size: 13px;
          font-weight: 800;
          color: #ffffff;
          white-space: nowrap;
          text-align: right;
        }

        .ribbon-date-label {
          font-size: 9px;
          color: #c8a45a;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .ribbon-count {
          background: #c8a45a;
          color: #0a2351;
          font-size: 10.5px;
          font-weight: 900;
          padding: 2px 12px;
          border-radius: 20px;
          letter-spacing: 0.5px;
        }

        /* ── TELUGU TAGLINE ── */
        .telugu-bar {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          padding: 5px 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .telugu-text {
          font-family: 'Noto Sans Telugu', sans-serif;
          font-size: 10.5px;
          color: #475569;
          font-weight: 600;
        }

        .generated-at {
          font-size: 9px;
          color: #94a3b8;
          font-weight: 600;
          white-space: nowrap;
        }

        /* ── BODY / TABLE AREA ── */
        .report-body {
          padding: 20px 28px 28px;
        }

        /* ── TABLE ── */
        .booking-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
          margin-bottom: 0;
          border-radius: 10px;
          overflow: hidden;
        }

        .booking-table thead tr {
          background: linear-gradient(135deg, #0a2351 0%, #1a3a6b 100%);
        }

        .booking-table thead th {
          padding: 10px 11px;
          text-align: left;
          font-size: 8.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #c8a45a;
          white-space: nowrap;
          border: none;
        }

        .booking-table tbody tr {
          border-bottom: 1px solid #e2e8f0;
        }

        .booking-table tbody tr:last-child {
          border-bottom: none;
        }

        .booking-table tbody tr:nth-child(even) {
          background: #f8fafc;
        }
        .booking-table tbody tr:nth-child(odd) {
          background: #ffffff;
        }

        .booking-table tbody td {
          padding: 9px 11px;
          color: #1e293b;
          vertical-align: middle;
        }

        /* ── COLUMN STYLES ── */
        .col-serial {
          width: 36px;
          text-align: center;
          color: #94a3b8;
          font-weight: 700;
          font-size: 9.5px;
          white-space: nowrap;
        }

        .pnr-code {
          font-family: 'Outfit', monospace;
          font-weight: 900;
          font-size: 11.5px;
          color: #0a2351;
          letter-spacing: 0.8px;
          white-space: nowrap;
        }

        .booked-on {
          font-size: 8.5px;
          color: #94a3b8;
          margin-top: 2px;
          font-weight: 600;
        }

        .pkg-name {
          font-weight: 700;
          font-size: 11px;
          color: #1e293b;
          line-height: 1.3;
        }

        .pkg-category {
          font-size: 9px;
          color: #64748b;
          font-weight: 600;
          margin-top: 2px;
        }

        .type-pill {
          display: inline-block;
          padding: 1.5px 7px;
          border-radius: 4px;
          font-size: 8px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 3px;
        }

        .transport-text {
          font-size: 10px;
          color: #334155;
          font-weight: 600;
          max-width: 130px;
        }

        .no-transport {
          color: #cbd5e1;
          font-size: 9px;
          font-weight: 600;
        }

        .booker-name {
          font-weight: 700;
          font-size: 11.5px;
          color: #1e293b;
        }

        .mobile-num {
          font-family: monospace;
          font-size: 10px;
          color: #0a2351;
          font-weight: 700;
          margin-top: 2px;
        }

        .pax-count {
          font-weight: 900;
          font-size: 15px;
          color: #0a2351;
          text-align: center;
          line-height: 1;
        }

        .pax-label {
          font-size: 8.5px;
          color: #64748b;
          font-weight: 600;
          text-align: center;
          margin-top: 2px;
          white-space: nowrap;
        }

        .travel-date-val {
          font-weight: 800;
          font-size: 11px;
          color: #0a2351;
          white-space: nowrap;
        }

        .status-badge {
          display: inline-block;
          padding: 3px 9px;
          border-radius: 20px;
          font-size: 8.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        /* ── SUMMARY FOOTER ── */
        .report-summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-top: 20px;
          padding-top: 18px;
          border-top: 2px solid #e2e8f0;
        }

        .summary-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px 16px;
          text-align: center;
        }

        .summary-num {
          font-family: 'Outfit', sans-serif;
          font-size: 26px;
          font-weight: 900;
          color: #0a2351;
          line-height: 1;
        }

        .summary-label {
          font-size: 9px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-top: 5px;
        }

        /* ── REPORT FOOTER ── */
        .report-footer {
          background: #0a2351;
          color: #94a3b8;
          padding: 11px 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 9px;
          font-weight: 600;
          gap: 10px;
          margin-top: 24px;
          border-top: 2px solid #c8a45a;
        }

        .report-footer a {
          color: #c8a45a;
          text-decoration: none;
        }

        .footer-brand {
          font-family: 'Outfit', sans-serif;
          font-weight: 900;
          font-size: 11px;
          color: #ffffff;
          margin-bottom: 2px;
        }

        .footer-disclaimer {
          font-size: 8px;
          color: #64748b;
          margin-top: 2px;
        }

        /* ── PRINT MEDIA ── */
        @media print {
          body {
            background: #ffffff;
          }
          .print-report-wrapper {
            margin: 0;
            box-shadow: none;
            border: none;
            width: 100%;
            max-width: 100%;
            border-radius: 0;
          }
          .no-print {
            display: none !important;
          }
          .report-header {
            padding: 10px 14px 8px;
          }
          .header-logo-left img,
          .header-logo-right img {
            height: 56px !important;
          }
          .report-title-ribbon {
            padding: 8px 14px;
          }
          .ribbon-title {
            font-size: 17px !important;
          }
          .telugu-bar {
            padding: 3px 14px;
          }
          .report-body {
            padding: 12px 14px 16px;
          }
          .booking-table {
            font-size: 9px;
          }
          .booking-table thead th {
            font-size: 7px;
            padding: 5px 7px;
          }
          .booking-table tbody td {
            padding: 5px 7px;
          }
          .pnr-code { font-size: 9.5px; }
          .pkg-name { font-size: 9px; }
          .booker-name { font-size: 9px; }
          .pax-count { font-size: 12px; }
          .travel-date-val { font-size: 9px; }
          .report-summary {
            margin-top: 10px;
            padding-top: 10px;
            gap: 8px;
          }
          .summary-num { font-size: 20px; }
          .summary-card { padding: 8px 10px; }
          .report-footer { padding: 7px 14px; margin-top: 14px; }

          @page {
            size: A4 landscape;
            margin: 6mm 8mm;
          }
        }
        `
      }} />

      <div className="print-report-wrapper">
        {/* ── HEADER ── */}
        <div className="report-header">
          <div className="header-logo-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/aptdc-logo.png" alt="TS Boat Tourism" />
          </div>
          <div className="header-center">
            <div className="header-org-name">TS Boat Tourism</div>
            <div className="header-org-address">
              Door No. 10-1-2/1, Ground Floor, Om Shanthi Building Sataram,<br />
              Bhadrachalam, Bhadradri Kothagudem Dist, Telangana – 507 111
            </div>
            <a href="https://www.tstelanganatourism.com" className="header-org-website">
              www.tstelanganatourism.com
            </a>
          </div>
          <div className="header-logo-right">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ts-boat-seal.png" alt="TS Boat Tourism Seal" />
          </div>
        </div>

        {/* ── REPORT TITLE RIBBON ── */}
        <div className="report-title-ribbon">
          <div className="ribbon-left">
            <span className="ribbon-doc-type">Admin Report · Packages Only</span>
            <h1 className="ribbon-title">Booking Report</h1>
          </div>
          <div className="ribbon-right">
            <span className="ribbon-date-label">Date / Period</span>
            <span className="ribbon-date-range">{data.report_label}</span>
            <span className="ribbon-count">{data.total} Booking{data.total !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* ── TELUGU TAGLINE + GENERATED AT ── */}
        <div className="telugu-bar">
          <span className="telugu-text">తెలంగాణ పర్యాటక రంగం · TS Boat Tourism Booking Report</span>
          <span className="generated-at">Generated: {generatedAt}</span>
        </div>

        {/* ── BODY ── */}
        <div className="report-body">
          {data.items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
              <div style={{ fontSize: '52px', marginBottom: '14px' }}>🎫</div>
              <div style={{ fontSize: '17px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                No Package Bookings Found
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                There are no package bookings for the selected period:{' '}
                <strong style={{ color: '#0a2351' }}>{data.report_label}</strong>
              </div>
            </div>
          ) : (
            <>
              <table className="booking-table">
                <thead>
                  <tr>
                    <th className="col-serial" style={{ textAlign: 'center' }}>#</th>
                    <th>PNR / Ticket No.</th>
                    <th>Package Name & Category</th>
                    <th>Transport Option</th>
                    <th>Booker Name & Mobile</th>
                    <th style={{ textAlign: 'center' }}>Passengers</th>
                    <th>Date of Travel</th>
                    <th style={{ textAlign: 'center' }}>Amount (₹)</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item, idx) => {
                    const typeStyle = pkgTypeBg(item.package_type);
                    return (
                      <tr key={item.pnr}>
                        {/* Serial */}
                        <td className="col-serial">{idx + 1}</td>

                        {/* PNR */}
                        <td style={{ minWidth: '120px' }}>
                          <div className="pnr-code">{item.pnr}</div>
                          {item.created_at && (
                            <div className="booked-on">Booked: {formatDisplayDate(item.created_at)}</div>
                          )}
                        </td>

                        {/* Package */}
                        <td style={{ maxWidth: '200px' }}>
                          <span
                            className="type-pill"
                            style={{ background: typeStyle.bg, color: typeStyle.color }}
                          >
                            {pkgTypeLabel(item.package_type)}
                          </span>
                          <div className="pkg-name">{item.package_name}</div>
                          {item.category && item.category !== item.package_name && (
                            <div className="pkg-category">{item.category}</div>
                          )}
                        </td>

                        {/* Transport */}
                        <td style={{ maxWidth: '140px' }}>
                          {item.transport && item.transport !== '—' ? (
                            <span className="transport-text">{item.transport}</span>
                          ) : (
                            <span className="no-transport">No transport</span>
                          )}
                        </td>

                        {/* Booker & Mobile */}
                        <td style={{ maxWidth: '150px' }}>
                          <div className="booker-name">{item.booker_name}</div>
                          <div className="mobile-num">
                            {item.mobile && item.mobile !== '—' ? (
                              <>📞 {item.mobile}</>
                            ) : (
                              <span style={{ color: '#cbd5e1', fontFamily: 'inherit' }}>No mobile</span>
                            )}
                          </div>
                        </td>

                        {/* Passengers */}
                        <td style={{ textAlign: 'center', minWidth: '80px' }}>
                          <div className="pax-count">{item.passenger_count}</div>
                          <div className="pax-label">{item.passenger_label}</div>
                        </td>

                        {/* Travel Date */}
                        <td style={{ minWidth: '100px' }}>
                          <div className="travel-date-val">
                            {formatDisplayDate(item.travel_date)}
                          </div>
                        </td>

                        {/* Amount Paid / Total */}
                        <td style={{ textAlign: 'center', minWidth: '110px' }}>
                          {item.status === 'FULLY_PAID' ? (
                            <div>
                              <div style={{ fontFamily: "'Outfit', monospace", fontWeight: 900, fontSize: '12px', color: '#15803d' }}>
                                ₹{item.total_amount.toLocaleString('en-IN')} of ₹{item.total_amount.toLocaleString('en-IN')}
                              </div>
                              <div style={{ fontSize: '8px', color: '#15803d', fontWeight: 800, marginTop: '2px', letterSpacing: '0.4px' }}>
                                ✓ FULL PAID (100%)
                              </div>
                            </div>
                          ) : item.status === 'PARTIAL_PAID' ? (
                            <div>
                              <div style={{ fontFamily: "'Outfit', monospace", fontWeight: 900, fontSize: '12px', color: '#1d4ed8' }}>
                                ₹{item.paid_amount.toLocaleString('en-IN')}{' '}
                                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>
                                  of ₹{item.total_amount.toLocaleString('en-IN')}
                                </span>
                              </div>
                              <div style={{ fontSize: '8.5px', color: '#b45309', fontWeight: 800, marginTop: '2px' }}>
                                DUE: ₹{item.remaining_balance.toLocaleString('en-IN')}
                              </div>
                            </div>
                          ) : (
                            <div style={{ fontFamily: "'Outfit', monospace", fontWeight: 700, fontSize: '11px', color: '#94a3b8' }}>
                              ₹{item.total_amount.toLocaleString('en-IN')}
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td style={{ textAlign: 'center', minWidth: '90px' }}>
                          <span
                            className="status-badge"
                            style={{
                              background: `${statusColor(item.status)}18`,
                              color: statusColor(item.status),
                              border: `1px solid ${statusColor(item.status)}35`,
                            }}
                          >
                            {statusLabel(item.status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* ── SUMMARY CARDS ── */}
              <div className="report-summary" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                <div className="summary-card">
                  <div className="summary-num">{data.total}</div>
                  <div className="summary-label">Total Bookings</div>
                </div>
                <div className="summary-card">
                  <div className="summary-num" style={{ color: '#15803d' }}>
                    {data.items.filter(i => i.status === 'FULLY_PAID').length}
                  </div>
                  <div className="summary-label">Confirmed</div>
                </div>
                <div className="summary-card">
                  <div className="summary-num" style={{ color: '#1d4ed8' }}>
                    {data.items.filter(i => i.status === 'PARTIAL_PAID').length}
                  </div>
                  <div className="summary-label">Advance Paid</div>
                </div>
                <div className="summary-card">
                  <div className="summary-num" style={{ color: '#0a2351' }}>
                    {data.items.reduce((sum, i) => sum + i.passenger_count, 0)}
                  </div>
                  <div className="summary-label">Total Passengers</div>
                </div>
                <div className="summary-card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                  <div className="summary-num" style={{ color: '#15803d', fontSize: '18px' }}>
                    ₹{data.items.reduce((sum, i) => sum + i.paid_amount, 0).toLocaleString('en-IN')}
                  </div>
                  <div className="summary-label">Total Collected</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div className="report-footer">
          <div>
            <div className="footer-brand">TS Boat Tourism</div>
            <div>Door No. 10-1-2/1, Om Shanthi Building, Bhadrachalam – 507 111</div>
            <div>Tel: +91 99513 69573 &nbsp;|&nbsp; +91 77801 19268</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <a href="https://www.tstelanganatourism.com">www.tstelanganatourism.com</a>
            <div className="footer-disclaimer">
              Auto-generated admin report · For office use only · Not for public distribution
            </div>
          </div>
        </div>
      </div>

      {/* ── FLOATING PRINT/DOWNLOAD TOOLBAR ── */}
      <PrintAction
        targetSelector=".print-report-wrapper"
        filename={`booking-report-${(data.report_label || 'report').replace(/[^a-zA-Z0-9]/g, '-')}`}
      />
    </>
  );
}

export default function PrintBookingsReportPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px', color: '#475569' }}>
        <div style={{
          width: '44px', height: '44px', border: '4px solid #e2e8f0', borderTop: '4px solid #0a2351',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite'
        }} />
        <span style={{ fontSize: '14px', fontWeight: 700 }}>Loading…</span>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }` }} />
      </div>
    }>
      <ReportContent />
    </Suspense>
  );
}
