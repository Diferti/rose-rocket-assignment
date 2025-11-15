'use client';

import { Quote } from '@/lib/api';
import { format } from 'date-fns';

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

  const equipmentIcons: Record<string, string> = {
    'dry_van': '🚚',
    'reefer': '❄️',
    'flatbed': '📦',
    'step_deck': '📐',
    'hotshot': '⚡',
    'straight_truck': '🚛',
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
    <div className="bg-white rounded-md border border-gray-200 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Quote Result</h2>
          <p className="text-xs text-gray-500 mt-0.5">Quote #{quote.id}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-medium">
          ✓
        </div>
      </div>

      {/* Quote Amount - Large Display */}
      <div className="bg-gray-900 rounded-md p-4 text-white">
        <div className="text-xs font-medium opacity-90 mb-1">Total Quote</div>
        <div className="text-2xl font-bold">${formatNumber(quoteAmount, 2)}</div>
      </div>

      {/* Route */}
      <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
        <div className="text-xs font-medium text-gray-500 uppercase mb-1">Route</div>
        <div className="text-sm font-semibold text-gray-900">{quote.lane}</div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
          <div className="text-xs font-medium text-gray-500 uppercase mb-1">Distance</div>
          <div className="text-lg font-bold text-gray-900">
            {formatNumber(quote.distance_miles, 2)}
          </div>
          <div className="text-xs text-gray-600">miles</div>
          {quote.distance_kilometers && (
            <div className="text-xs text-gray-500 mt-0.5">
              ({formatNumber(quote.distance_kilometers, 2)} km)
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
          <div className="text-xs font-medium text-gray-500 uppercase mb-1">Equipment</div>
          <div className="text-xl mb-0.5">{equipmentIcons[quote.equipment_type] || '🚚'}</div>
          <div className="text-xs font-semibold text-gray-900 capitalize">
            {quote.equipment_type}
          </div>
        </div>

        {quote.total_weight && (
          <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
            <div className="text-xs font-medium text-gray-500 uppercase mb-1">Weight</div>
            <div className="text-lg font-bold text-gray-900">
              {quote.total_weight.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">lbs</div>
          </div>
        )}

        {quote.pickup_date && (
          <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
            <div className="text-xs font-medium text-gray-500 uppercase mb-1">Pickup</div>
            <div className="text-xs font-semibold text-gray-900">
              {format(new Date(quote.pickup_date), 'MMM dd, yyyy')}
            </div>
          </div>
        )}
      </div>

      {/* Accuracy Indicator */}
      {geocodingAccuracy && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <div className="text-xs font-medium text-yellow-800 uppercase mb-1.5">
            Quote Accuracy
          </div>
          <div className="flex gap-3 text-xs">
            <div>
              <span className="text-yellow-700">Origin: </span>
              <span className="font-semibold text-yellow-900">
                {accuracyLabels[geocodingAccuracy.origin] || 'Unknown'}
              </span>
            </div>
            <div>
              <span className="text-yellow-700">Destination: </span>
              <span className="font-semibold text-yellow-900">
                {accuracyLabels[geocodingAccuracy.destination] || 'Unknown'}
              </span>
            </div>
          </div>
          {(geocodingAccuracy.origin === 'city_only' || geocodingAccuracy.destination === 'city_only') && (
            <p className="text-xs text-yellow-700 mt-2">
              💡 Tip: Include postal codes for more accurate quotes
            </p>
          )}
        </div>
      )}

      {/* Timestamp */}
      <div className="pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Created: {format(new Date(quote.created_at), 'MMM dd, yyyy HH:mm')}
        </p>
      </div>
    </div>
  );
}
