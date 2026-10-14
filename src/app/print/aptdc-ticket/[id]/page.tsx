import React from 'react';
import { notFound } from 'next/navigation';
import PrintAction from '@/components/ui/PrintAction';
import { apiFetch } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface Passenger { full_name: string; age: number; gender: string | null; }
interface TicketPassenger { full_name: string; gender: string; age: number; fare: string | number; net_fare: string | number; seat_no?: string; }
interface TicketSnapshot {
  receipt_style?: string; booking_mode?: string; service_name?: string; package_type?: string;
  coach_id_vehicle_no?: string; coach_type_vehicle_type?: string; journey_date_time?: string;
  return_date_time?: string; issue_date_time?: string; boarding_city?: string; alighting_city?: string;
  boarding_point?: string; alighting_point?: string; state_code?: string; gstin?: string;
  issued_by?: string; issued_at?: string; issued_phone?: string; passenger_details?: TicketPassenger[];
  actual_fare?: string | number; net_fare_before_extra_charges?: string | number; extra_charges?: string | number;
}
interface BookingDetails {
  public_id: string; travel_date: string; subtotal_amount: number; total_amount: number; created_at: string | null;
  package_title: string; variant_title: string; passengers: Passenger[]; pricing_snapshot?: TicketSnapshot | null;
}

const barcodeBars = [1, 1, 2, 1, 3, 1, 1, 2, 2, 1, 4, 1, 1, 3, 1, 2, 1, 1, 3, 2, 1, 4, 1, 1, 2, 1, 3, 1, 2, 2, 1, 1, 4, 1, 2, 1, 3, 1, 1, 2, 4, 1, 1, 3, 1, 2, 1, 1, 3, 2, 1, 4];
const aptdcGstin = '37AADCA9817H1ZH';
const aptdcStateCode = '37';
const tourRules = `1. The ticket is not transferable.  2. Child is reckoned as 5 to 12 years.  3. The tour will be operated subject to operational conditions and availability of minimum number of tourists in the bus for the date of journey. In case of departmental cancellation due to less number of tourists or break down in service, full amount will be refunded to the card account through which booking is made.  4. Buses will be operated as per the occupancy and booking of tickets (18 seater or 36 seater as the case may be) 5. Tariffs are subject to change and any difference in the change of tariff will be collected at the time of boarding the bus.  6. Any Additional taxes other than the taxes collected at the time of booking as imparted by the government from time to time, will be collected at the time of boarding the bus.  7. If single ticket is purchased for package tour, accommodation will be provided on twin sharing basis. In some cases tourist is required to pay additional amount towards accommodation, if required for single ticket. For certain packages, especially Shirdi Package, the tourist is required to pay additional amount towards accommodation for single ticket.  8. Three adults in a family or in one ticket will be accommodated in on double (Two bed) room, even though the third person is in possession of a double room ticket for the package tour.  9. Tourist is required to carry this ticket at the time of journey along with a valid Original Photo ID proof.  10. If the package tour cost is including entry tickets, foreigners have to pay extra amount where ever necessary apart from the regular ticket cost. The existing tour cost is designed only for Indian nationals.  11. For any assistance in online booking please mail to helpdesk[at]aptdc[dot]in.  12. Please read detailed terms and conditions applicable from time to time updated on the website.`;
const cancellationRules = `1. For online bookings cancellations has to be done online only and the refund will be credited to the card used for booking in 7-10 working days.  2. No refunds shall be made if the ticket is surrendered for cancellation within 1 day (24 hours) before the scheduled departure of the bus. Cancellation/Modification request is not accepted even if ticket is booked within 24 hours of journey time.  3. If a ticket is presented for cancellation more than two days (48 hours) in advance of the scheduled departure of bus, cancellation charge will be deducted at the flat rate of Rs.100 per head 4. If the ticket is presented for cancellation within two days (48 hours) in advance and up to one day (24 hours) before the scheduled departure of the bus, cancellation charges will be 50% of the fare, per head and no cancellation/postponement is allowed within 24 hours of scheduled departure time.  5. Partial cancellations is allowed only for one time subject to cancellation rules as mentioned at S.No.2,3,4 above.  6. Full Preponement / Postponement is allowed only for one time subject to availability provided the ticket is presented more than one day (24 hours) in advance of the journey date/time. Partial Preponement / Postponement is not allowed.  7. A ticket once modified (preponed / postponed / partially cancelled) cannot be further modified or allowed for further cancellation / Reschedule.  8. No refund will be given if ticket is cancelled against Terms and Conditions of APTDC.  9. No refund will be given if ticket is cancelled against Terms and Conditions of APTDC, by the tourist in any unforeseen conditions or natural calamities or strikes or any other reasons.  10. Modification (Reschedule) / reservation / ticket from higher tariff to lower tariff will not be done. If ticket is modified from higher tariff to lower tariff under unavoidable circumstances, the difference amount will not be refunded. However if ticket is modified from lower tariff to higher tariff, the difference amount will be collected from the tourist.`;

function amount(value: string | number | null | undefined) { return Number(value || 0).toFixed(2); }
function dateOnly(value?: string | null) { const m = value?.match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `${m[3]}-${m[2]}-${m[1]}` : value || '—'; }
function dateTime(value?: string | null) { const m = value?.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?/); return m ? `${m[3]}-${m[2]}-${m[1]} ${m[4]}:${m[5]}:${m[6] || '00'} Hrs` : value || '—'; }
function gender(value?: string | null) { return value?.toUpperCase() === 'FEMALE' ? 'F' : value?.toUpperCase() === 'MALE' ? 'M' : value ? 'O' : '—'; }

function Barcode({ value }: { value: string }) {
  return <div className="barcode-wrap"><div className="barcode">{barcodeBars.map((width, index) => <i key={index} style={{ width: `${width}px` }} />)}</div><span>{value}</span></div>;
}

export default async function AptdcTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let booking: BookingDetails | null = null;
  try { const response = await apiFetch(`/api/v1/bookings/${id}`, { cache: 'no-store' }); if (response.ok) booking = await response.json() as BookingDetails; } catch (error) { console.error('Failed to load APTDC receipt:', error); }
  if (!booking) notFound();

  const ticket = booking.pricing_snapshot || {};
  const enteredPassengers = Array.isArray(ticket.passenger_details) ? ticket.passenger_details : [];
  const passengers: TicketPassenger[] = enteredPassengers.length ? enteredPassengers : booking.passengers.map(p => ({ full_name: p.full_name, gender: p.gender || '', age: p.age, fare: 0, net_fare: 0 }));
  const rows = [...passengers, ...Array.from({ length: Math.max(0, 10 - passengers.length) }, () => null)];
  const actualFare = ticket.actual_fare ?? booking.subtotal_amount;
  const extraCharges = ticket.extra_charges ?? 0;
  const netFare = Number(ticket.net_fare_before_extra_charges ?? booking.total_amount) + Number(extraCharges || 0);

  return <main className="aptdc-print-page">
    <style dangerouslySetInnerHTML={{ __html: `
      @page { size: A4 portrait; margin: 6mm; } * { box-sizing: border-box; } html,body { margin:0; padding:0; } body { background:#eefaff; color:#3c3c3c; font-family:Arial,Helvetica,sans-serif; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
      .aptdc-print-page { width:100%; padding:5mm 0 12mm; } .aptdc-shell { width:166mm; min-height:282mm; margin:0 auto; padding:6.5mm 6.5mm 7mm; background:#afe477; box-shadow:0 2px 10px rgba(73,104,50,.22); }
      .success-panel { height:42mm; border:.4mm solid rgba(255,255,255,.84); padding-top:5mm; text-align:center; } .success-title { display:inline-flex; align-items:center; gap:3.2mm; transform:translateX(10.5mm); } .success-icon { display:inline-flex; width:11mm; height:11mm; align-items:center; justify-content:center; border:1.3mm solid #4cae2d; border-radius:50%; color:#4cae2d; font-size:8.5mm; font-weight:900; line-height:1; } .success-title h1 { margin:0; color:#292c2b; font-size:7.35mm; line-height:1; font-weight:600; letter-spacing:-.24mm; } .success-panel p { margin:2.1mm 0 0 10.5mm; color:#303332; font-size:3.2mm; font-weight:500; }
      .printer-icon { position:relative; z-index:2; width:15.6mm; height:15.6mm; margin:-16.5mm auto .6mm; display:flex; align-items:center; justify-content:center; border:.62mm solid #286f86; border-radius:50%; background:#35add6; box-shadow:inset 0 0 0 .56mm rgba(158,230,249,.68); } .printer-icon svg { width:10.6mm; height:10.6mm; }
      .ticket-paper { border:.25mm solid #d9d9d9; background:#fff; padding:1.2mm 1.45mm 1.5mm; } .brand-line { height:16.5mm; display:grid; grid-template-columns:1fr 14mm; align-items:center; padding:.25mm 25mm .55mm; border-bottom:.25mm solid #cfcfcf; } .brand-lockup { display:flex; align-items:center; justify-content:center; gap:1.8mm; white-space:nowrap; } .aptdc-mark { width:21mm; height:12.2mm; object-fit:contain; } .brand-copy { color:#414141; font-family:Arial,Helvetica,sans-serif; font-size:1.5mm; font-weight:400; line-height:1.08; text-align:center; } .brand-copy b { display:block; color:#1d3148; font-family:Arial,Helvetica,sans-serif; font-size:1.62mm; font-weight:700; letter-spacing:-.03mm; } .brand-copy .red { color:#ad4038; font-size:1.33mm; font-weight:700; } .gov-seal { width:13mm; height:13mm; object-fit:contain; justify-self:end; transform:translateX(-8.5mm); }
      .barcode-wrap { height:13.2mm; padding-top:1mm; border-bottom:.25mm solid #cfcfcf; text-align:center; } .barcode { height:8.5mm; display:inline-flex; align-items:stretch; gap:.35px; } .barcode i { display:block; height:8.5mm; background:#111; } .barcode-wrap span { display:block; margin-top:.25mm; font-family:monospace; font-size:1.25mm; letter-spacing:.15mm; line-height:1; } .gst-line { height:5mm; padding:1mm 0; border-bottom:.25mm solid #cfcfcf; color:#292929; text-align:center; font-size:2.45mm; font-weight:700; }
      .section-bar { height:5.5mm; display:flex; align-items:center; justify-content:center; background:#42ad4c; color:white; font-size:2.5mm; font-weight:700; } table { width:100%; border-collapse:collapse; table-layout:fixed; } .ticket-grid { font-size:2.3mm; } .ticket-grid td { height:6.35mm; border:.25mm solid #d3d3d3; padding:.75mm 1.5mm; vertical-align:middle; overflow-wrap:break-word; } .ticket-grid .label { width:18.5%; background:#f4f4f4; color:#343434; font-weight:700; } .ticket-grid .value { width:31.5%; color:#454545; font-weight:400; }
      .tourist-bar { margin-top:1.3mm; } .tourist-grid { font-size:2.25mm; } .tourist-grid th,.tourist-grid td { height:5.5mm; border:.25mm solid #d3d3d3; padding:.55mm 1mm; vertical-align:middle; text-align:center; } .tourist-grid th { height:5.3mm; background:#eee; color:#444; font-weight:700; } .tourist-grid .name { text-align:left; padding-left:2mm; } .tourist-grid .empty { color:transparent; }
      .fare-grid { width:39%; margin:4.8mm 0 0 auto; font-size:2.2mm; } .fare-grid td { height:5.25mm; border:.25mm solid #d3d3d3; padding:.8mm 1.8mm; text-align:right; } .fare-grid td:first-child { width:63%; font-weight:700; } .fare-grid tr:last-child td { font-weight:700; } .note { min-height:7mm; padding:1.15mm 0 .8mm; border-bottom:.25mm solid #d5d5d5; font-size:2.05mm; line-height:1.35; } .note b { color:#d23b33; } .issued-block { min-height:11.8mm; border:.25mm solid #d3d3d3; padding:1.15mm 1.7mm; color:#494949; font-size:2.1mm; line-height:1.35; } .issued-block strong { color:#202020; font-weight:700; }
      .terms-bar { height:4.5mm; margin-top:1.2mm; display:flex; align-items:center; justify-content:center; background:#42ad4c; color:#fff; font-size:2.2mm; font-weight:700; } .terms { padding:1mm 1.4mm 0; color:#424242; font-size:2.1mm; line-height:1.3; text-align:justify; } .terms h2 { margin:0 0 .45mm; color:#333; font-size:2.12mm; line-height:1.14; font-weight:700; text-decoration:underline; } .terms p { margin:0 0 1.25mm; }
      @media(max-width:700px) { .aptdc-print-page { padding:0; overflow-x:auto; } .aptdc-shell { width:166mm; margin:0; } } @media print { body { background:#fff; } .aptdc-print-page { padding:0; } .aptdc-shell { min-height:0; box-shadow:none; } .no-print { display:none!important; } }
    ` }} />
    <section className="aptdc-shell">
      <header className="success-panel"><div className="success-title"><span className="success-icon">✓</span><h1>Tour Package Confirmation</h1></div><p>Your Tour Online Tour Package Process Successfully Completed.</p></header>
      <div className="printer-icon" aria-hidden="true"><svg viewBox="0 0 64 64" role="presentation"><rect x="21" y="8" width="22" height="14" rx="1.5" fill="#fff" stroke="#414b4e" strokeWidth="4" /><rect x="10" y="21" width="44" height="25" rx="4" fill="#596367" stroke="#414b4e" strokeWidth="4" /><circle cx="47" cy="29" r="2.3" fill="#f3f3f3" /><rect x="19" y="37" width="26" height="19" rx="1" fill="#fff" stroke="#414b4e" strokeWidth="4" /><path d="M25 44h14M25 50h14" stroke="#414b4e" strokeWidth="3" strokeLinecap="square" /></svg></div>
      <article className="ticket-paper">
        <div className="brand-line"><div className="brand-lockup"><img className="aptdc-mark" src="/aptdc-logo.svg?v=aptdc-replica-2" alt="APTDC" /><div className="brand-copy"><b>ANDHRA PRADESH TOURISM DEVELOPMENT CORPORATION</b><span>D No:55-17-2 to 4, 5th Floor, Near C.G.O Complex, 2nd Road,</span><br /><span>Industrial Estate, Auto Nagar, Vijayawada-520007(A.P.)</span><br /><span className="red">www.tourism.ap.gov.in</span></div></div><img className="gov-seal" src="/government-of-andhra-pradesh-seal.png?v=aptdc-replica-2" alt="Government of Andhra Pradesh" /></div>
        <Barcode value={booking.public_id} /><div className="gst-line">GSTIN: {aptdcGstin}</div>
        <div className="section-bar">Duplicate - Tour Package Confirmation</div>
        <table className="ticket-grid"><tbody>
          <tr><td className="label">PNR/ Ticket No</td><td className="value">{booking.public_id}</td><td className="label">Issue Date &amp; Time</td><td className="value">{dateOnly(ticket.issue_date_time || booking.created_at)}</td></tr>
          <tr><td className="label">Service Name</td><td className="value">{ticket.service_name || booking.package_title}</td><td className="label">Package Type</td><td className="value">{ticket.package_type || booking.variant_title}</td></tr>
          <tr><td className="label">Coach Id / Vehicle<br />No</td><td className="value">{ticket.coach_id_vehicle_no || '—'}</td><td className="label">Coach Type / Vehicle<br />Type</td><td className="value">{ticket.coach_type_vehicle_type || '—'}</td></tr>
          <tr><td className="label">JourneyDate &amp;<br />Time</td><td className="value">{dateTime(ticket.journey_date_time || booking.travel_date)}</td><td className="label">Return Date &amp; Time</td><td className="value">{dateTime(ticket.return_date_time)}</td></tr>
          <tr><td className="label">Boarding City:</td><td className="value">{ticket.boarding_city || '—'}</td><td className="label">Alighting City:</td><td className="value">{ticket.alighting_city || '—'}</td></tr>
          <tr><td className="label">Boarding Point:</td><td className="value">{ticket.boarding_point || '—'}</td><td className="label">Alighting Point:</td><td className="value">{ticket.alighting_point || '—'}</td></tr>
          <tr><td className="label">State Code:</td><td className="value">{aptdcStateCode}</td><td className="label">GSTIN:</td><td className="value">&nbsp;</td></tr>
        </tbody></table>
        <div className="section-bar tourist-bar">Tourist Booking Details:</div>
        <table className="tourist-grid"><thead><tr><th style={{width:'7.5%'}}>S.No</th><th style={{width:'18.5%'}}>Name</th><th style={{width:'12%'}}>Gender</th><th style={{width:'13.5%'}}>Age(Yrs)</th><th style={{width:'17.5%'}}>Fare(Rs.)</th><th style={{width:'20.5%'}}>NetFare(Rs.)</th><th style={{width:'10.5%'}}>Seat No</th></tr></thead><tbody>
          {rows.map((passenger,index) => passenger ? <tr key={`${passenger.full_name}-${index}`}><td>{index+1}</td><td className="name">{passenger.full_name}</td><td>{gender(passenger.gender)}</td><td>{passenger.age}</td><td>{amount(passenger.fare)}</td><td>{amount(passenger.net_fare)}</td><td>{passenger.seat_no || ''}</td></tr> : <tr key={`blank-${index}`}><td className="empty">{index+1}</td><td /><td /><td /><td /><td /><td /></tr>)}
        </tbody></table>
        <table className="fare-grid"><tbody><tr><td>Actual Fare:</td><td>Rs. {amount(actualFare)}</td></tr><tr><td>Extra Charges:</td><td>Rs. {amount(extraCharges)}</td></tr><tr><td>Net Fare:</td><td>Rs. {amount(netFare)}</td></tr></tbody></table>
        <div className="note"><b>*Note:</b> Thank You for choosing APTDC. Please produce this receipt at the time of boarding. You are requested to produce any photo ID at the time of boarding.</div>
        <div className="issued-block">Issued by : <strong>{ticket.issued_by || 'APTPT00187(aptdc_bbt)'}</strong><br />Issued at : <strong>{ticket.issued_at || 'Bhadadri Boat Tourism'}</strong><br />Issued Phone No : <strong>{ticket.issued_phone || '03340075510'}</strong></div>
        <div className="terms-bar">Terms &amp; Conditions</div><div className="terms"><h2>Rules For Tours:</h2><p>{tourRules}</p><h2>CANCELLATION / POSTPONEMENT / PREPONEMENT RULES</h2><p>{cancellationRules}</p></div>
      </article>
    </section>
    <PrintAction showClose />
  </main>;
}
