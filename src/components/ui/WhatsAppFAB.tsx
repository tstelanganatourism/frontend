import React from 'react';

export default function WhatsAppFAB({ hiddenOnMobile = false }: { hiddenOnMobile?: boolean }) {
  const whatsappNumber = '919542069573';
  const message = 'Hello! I am interested in booking a Papikondalu tour with Telangana Boat Tourism Central Booking Office.';
  
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a 
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-32 right-4 z-40 h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_16px_40px_rgba(37,211,102,0.38)] ring-4 ring-white/90 transition-all duration-300 hover:-translate-y-1 hover:scale-105 md:bottom-8 md:right-8 md:h-16 md:w-16 group ${hiddenOnMobile ? 'hidden sm:grid' : 'grid'}`}
    >
      <div className="absolute right-full mr-3 bg-white text-slate-800 text-sm font-bold px-4 py-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Chat with us!
      </div>
      <svg viewBox="0 0 24 24" className="h-7 w-7 md:h-9 md:w-9" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 2a9.9 9.9 0 0 0-8.5 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18.1c-1.6 0-3.1-.5-4.3-1.3l-.3-.2-3 .8.8-2.9-.2-.3A8.1 8.1 0 1 1 12 20.1Zm4.5-6.1c-.2-.1-1.5-.7-1.8-.8-.2-.1-.4-.1-.6.1-.2.3-.7.8-.8 1-.2.2-.3.2-.6.1-.2-.1-1-.4-2-1.2-.7-.7-1.2-1.5-1.4-1.7-.1-.3 0-.4.1-.6l.4-.4c.1-.2.2-.3.3-.5.1-.2 0-.3 0-.5s-.6-1.5-.9-2c-.2-.5-.4-.4-.6-.4H8c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.3s1 2.7 1.1 2.9c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.2-1.2-.2-.1-.4-.2-.7-.3Z"
        />
      </svg>
    </a>
  );
}
