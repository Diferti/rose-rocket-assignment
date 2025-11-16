'use client';

import { Quote } from '@/lib/api';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const RouteMap = dynamic(() => import('./RouteMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[250px] border border-[#C8A27A] rounded-lg bg-[#F7F3EF]">
      <div className="text-sm text-[#A67C52]">Loading map...</div>
    </div>
  ),
});

interface QuoteResultProps {
  quote: Quote;
  geocodingAccuracy?: {
    origin: string;
    destination: string;
  };
}

export default function QuoteResult({ quote, geocodingAccuracy }: QuoteResultProps) {
  const accuracyLabels: Record<string, string> = {
    postal_code: 'Precise',
    city_state: 'Approximate',
    city_only: 'Approximate',
  };

  // Helper function to safely convert to number and format
  const formatNumber = (value: number | string | undefined, decimals: number = 2): string => {
    if (value === undefined || value === null) return 'N/A';
    const num = typeof value === 'number' ? value : parseFloat(String(value));
    return isNaN(num) ? 'N/A' : num.toFixed(decimals);
  };

  const quoteAmount = typeof quote.quote_amount === 'number' 
    ? quote.quote_amount 
    : parseFloat(String(quote.quote_amount || '0'));

  return (
    <div className="bg-white rounded-lg border border-[#C8A27A] p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#EBD9C3]">
        <div>
          <h2 className="text-lg font-bold text-[#4E3B31]">Quote Result</h2>
          <p className="text-xs text-[#A67C52] mt-0.5">Quote #{quote.id}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#4E3B31] flex items-center justify-center text-white text-sm font-medium">
          ✓
        </div>
      </div>

      {/* Quote Amount - Large Display */}
      <div className="bg-[#4E3B31] rounded-lg p-4 text-white">
        <div className="text-xs font-medium opacity-90 mb-1">Total Quote</div>
        <div className="text-2xl font-bold">${formatNumber(quoteAmount, 2)}</div>
      </div>

      {/* Route */}
      <div className="bg-[#F7F3EF] rounded-lg p-3 border border-[#C8A27A]">
        <div className="flex items-center gap-3">
          <div className="text-xs font-medium text-[#A67C52] uppercase whitespace-nowrap">Route</div>
          <div className="text-[#C8A27A]">|</div>
          <div className="flex items-center flex-1 gap-2">
            <div className="text-sm font-semibold text-[#4E3B31]">
              {quote.origin_city}{quote.origin_state_province ? `, ${quote.origin_state_province}` : ''}
            </div>
            <div className="shrink-0">
              <svg 
                className="w-4 h-4 text-[#4E3B31]" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 5l7 7m0 0l-7 7m7-7H3" 
                />
              </svg>
            </div>
            <div className="text-sm font-semibold text-[#4E3B31]">
              {quote.destination_city}{quote.destination_state_province ? `, ${quote.destination_state_province}` : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* Top Row: Distance and Weight */}
        <div className="bg-[#F7F3EF] rounded-lg p-3 border border-[#C8A27A]">
          <div className="text-xs font-medium text-[#A67C52] uppercase mb-2">Distance</div>
          <div className="text-lg font-bold text-[#4E3B31]">
            {formatNumber(quote.distance_kilometers || 0, 2)} <span className="text-xs text-[#C8A27A]">km</span>
          </div>
          <div className="border-t border-[#C8A27A] my-2"></div>
          <div className="text-lg font-bold text-[#4E3B31]">
            {formatNumber(quote.distance_miles, 2)} <span className="text-xs text-[#C8A27A]">miles</span>
          </div>
        </div>

        {quote.total_weight ? (
          <div className="bg-[#F7F3EF] rounded-lg p-3 border border-[#C8A27A]">
            <div className="text-xs font-medium text-[#A67C52] uppercase mb-2">Weight</div>
            <div className="text-lg font-bold text-[#4E3B31]">
              {formatNumber(quote.total_weight / 2.20462, 2)} <span className="text-xs text-[#C8A27A]">kg</span>
            </div>
            <div className="border-t border-[#C8A27A] my-2"></div>
            <div className="text-lg font-bold text-[#4E3B31]">
              {quote.total_weight.toLocaleString()} <span className="text-xs text-[#C8A27A]">lbs</span>
            </div>
          </div>
        ) : (
          <div></div>
        )}

        {/* Bottom Row: Equipment and Pickup */}
        <div className="bg-[#F7F3EF] rounded-lg p-2 border border-[#C8A27A]">
          <div className="text-xs font-medium text-[#A67C52] uppercase mb-1">Equipment</div>
          <div className="flex items-center gap-1.5">
            {/* Equipment icon image */}
            <Image
              src={`/icons/${quote.equipment_type}.png`}
              alt={quote.equipment_type.replace(/_/g, ' ')}
              width={20}
              height={20}
              className="object-contain"
            />
            <span className="text-sm font-semibold text-[#4E3B31] capitalize">
              {quote.equipment_type.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {quote.pickup_date ? (
          <div className="bg-[#F7F3EF] rounded-lg p-2 border border-[#C8A27A]">
            <div className="text-xs font-medium text-[#A67C52] uppercase mb-1">Pickup</div>
            <div className="text-sm font-semibold text-[#4E3B31]">
              {format(new Date(quote.pickup_date), 'MMM dd, yyyy')}
            </div>
          </div>
        ) : (
          <div></div>
        )}
      </div>

      {/* Route Map */}
      {quote.origin_coordinates &&
        quote.destination_coordinates &&
        !isNaN(Number(quote.origin_coordinates.latitude)) &&
        !isNaN(Number(quote.origin_coordinates.longitude)) &&
        !isNaN(Number(quote.destination_coordinates.latitude)) &&
        !isNaN(Number(quote.destination_coordinates.longitude)) && (
          <div className="bg-[#F7F3EF] rounded-lg p-3 border border-[#C8A27A]">
            <div className="text-xs font-medium text-[#A67C52] uppercase mb-2">Route Map</div>
            <RouteMap
              origin={{
                latitude: Number(quote.origin_coordinates.latitude),
                longitude: Number(quote.origin_coordinates.longitude),
                city: quote.origin_city,
                state_province: quote.origin_state_province || undefined,
              }}
              destination={{
                latitude: Number(quote.destination_coordinates.latitude),
                longitude: Number(quote.destination_coordinates.longitude),
                city: quote.destination_city,
                state_province: quote.destination_state_province || undefined,
              }}
              height="250px"
            />
          </div>
        )}

      {/* Accuracy Indicator */}
      {geocodingAccuracy && (
        <div className="bg-[#EBD9C3] border border-[#C8A27A] rounded-lg p-3">
          <div className="text-xs font-medium text-[#4E3B31] uppercase mb-1.5">
            Quote Accuracy
          </div>
          <div className="flex gap-3 text-xs">
            <div>
              <span className="text-[#A67C52]">Origin: </span>
              <span className="font-semibold text-[#4E3B31]">
                {accuracyLabels[geocodingAccuracy.origin] || 'Unknown'}
              </span>
            </div>
            <div>
              <span className="text-[#A67C52]">Destination: </span>
              <span className="font-semibold text-[#4E3B31]">
                {accuracyLabels[geocodingAccuracy.destination] || 'Unknown'}
              </span>
            </div>
          </div>
          {(geocodingAccuracy.origin === 'city_only' || geocodingAccuracy.destination === 'city_only') && (
            <p className="text-xs text-[#A67C52] mt-2">
              💡 Tip: Include postal codes for more accurate quotes
            </p>
          )}
        </div>
      )}

      {/* Timestamp */}
      <div className="pt-3 border-t border-[#EBD9C3]">
        <p className="text-xs text-[#A67C52]">
          Created: {format(new Date(quote.created_at), 'MMM dd, yyyy HH:mm')}
        </p>
      </div>
    </div>
  );
}
