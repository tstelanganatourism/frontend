import React from 'react';
import { PackageHeroV2 } from '@/components/packages/detail/PackageHeroV2';
import { SectionNav } from '@/components/packages/detail/SectionNav';
import { ExperienceOverview } from '@/components/packages/detail/ExperienceOverview';
import { VisitingPlaces } from '@/components/packages/detail/VisitingPlaces';
import { ItineraryTimeline } from '@/components/packages/detail/ItineraryTimeline';
import { FacilitiesInclusions } from '@/components/packages/detail/FacilitiesInclusions';
import { ReportingInfo } from '@/components/packages/detail/ReportingInfo';
import { PackageFaqs } from '@/components/packages/detail/PackageFaqs';
import { PackagePolicies } from '@/components/packages/detail/PackagePolicies';
import { BookingSidebarV2 } from '@/components/packages/detail/BookingSidebarV2';
import { MobileBookingSheet } from '@/components/packages/detail/MobileBookingSheet';
import { X as CloseIcon, Monitor, Smartphone } from 'lucide-react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: any; // The current form state mapped to PackageDetail shape
}

export default function PreviewModal({ isOpen, onClose, pkg }: PreviewModalProps) {
  const [viewMode, setViewMode] = React.useState<'desktop' | 'mobile'>('desktop');

  if (!isOpen) return null;

  const durationLabel = pkg.itinerary?.length > 1 ? `${pkg.itinerary.length} days` : '1 day';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className={`bg-[#F9F9F7] rounded-3xl overflow-hidden flex flex-col shadow-2xl transition-all duration-300 ${viewMode === 'desktop' ? 'w-[1200px] max-w-full h-[90vh]' : 'w-[400px] h-[850px] max-h-[90vh]'}`}>
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-900">Live Preview</h2>
            <p className="text-xs font-semibold text-slate-500">Previewing unsaved changes</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('desktop')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'desktop' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'mobile' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-full transition-colors"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body (Scrollable iframe-like container) */}
        <div className="flex-1 overflow-y-auto relative antialiased text-slate-800">
          <PackageHeroV2
            title={pkg.title || 'Untitled Package'}
            coverImage={pkg.cover_image_url}
            region={pkg.region || 'Unknown'}
            type={pkg.type || 'TOUR'}
            tags={pkg.tags || []}
            durationLabel={durationLabel}
            boardingPoint={pkg.boarding_points?.[0]?.title}
            gallery={pkg.gallery || []}
          />

          <SectionNav />

          <div className={`mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:py-12 ${viewMode === 'desktop' ? 'lg:grid-cols-[minmax(0,1fr)_500px]' : 'grid-cols-1'}`}>
            <div className="space-y-12">
              <ExperienceOverview pkg={pkg} durationLabel={durationLabel} />
              {pkg.highlights?.length > 0 && <VisitingPlaces highlights={pkg.highlights} />}
              {pkg.itinerary?.length > 0 && (
                <ItineraryTimeline
                  days={pkg.itinerary}
                  packageTitle={pkg.title}
                  packageType={pkg.type}
                  durationLabel={durationLabel}
                  boardingPoint={pkg.boarding_points?.[0]?.title}
                  transportInfo={pkg.variants?.[0]?.transport_info}
                  departureTime={pkg.boarding_points?.[0]?.departure_time}
                />
              )}
              {(pkg.inclusions?.length > 0 || pkg.exclusions?.length > 0) && (
                <FacilitiesInclusions inclusions={pkg.inclusions || []} exclusions={pkg.exclusions || []} />
              )}
              {pkg.boarding_points?.length > 0 && <ReportingInfo boardingPoints={pkg.boarding_points} />}
              {pkg.faqs?.length > 0 && <PackageFaqs faqs={pkg.faqs} />}
              {pkg.policies?.length > 0 && <PackagePolicies policies={pkg.policies} primaryBoarding={pkg.boarding_points?.[0]} />}
            </div>

            {viewMode === 'desktop' && (
              <aside className="relative">
                <BookingSidebarV2 
                  startingPrice={pkg.starting_price || pkg.variants?.[0]?.adult_price || 0} 
                  variants={pkg.variants || []} 
                  packageId={pkg.id || 0}
                  packageSlug={pkg.slug || 'preview'} 
                />
              </aside>
            )}
          </div>

          {viewMode === 'mobile' && (
             <MobileBookingSheet 
              startingPrice={pkg.starting_price || pkg.variants?.[0]?.adult_price || 0} 
              variants={pkg.variants || []} 
              packageId={pkg.id || 0}
              packageSlug={pkg.slug || 'preview'} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
