'use client';

import { useState, useEffect } from 'react';
import { Quote, quoteAPI } from '@/lib/api';
import { format } from 'date-fns';

interface QuoteHistoryProps {
  onQuoteClick?: (quoteId: number) => void;
}

export default function QuoteHistory({ onQuoteClick }: QuoteHistoryProps) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Helper function to safely format quote amount
  const formatQuoteAmount = (amount: number | string | undefined): string => {
    if (amount === undefined || amount === null) return '0.00';
    const num = typeof amount === 'number' ? amount : parseFloat(String(amount));
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  // Helper function to safely format distance
  const formatDistance = (distance: number | string | undefined): string => {
    if (distance === undefined || distance === null) return 'N/A';
    const num = typeof distance === 'number' ? distance : parseFloat(String(distance));
    return isNaN(num) ? 'N/A' : num.toFixed(2);
  };

  const loadQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await quoteAPI.getAll(page, 10);
      setQuotes(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to load quotes';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const equipmentIcons: Record<string, string> = {
    'dry van': '🚚',
    'reefer': '❄️',
    'flatbed': '📦',
    'step deck': '📐',
    'hotshot': '⚡',
    'straight truck': '🚛',
  };

  if (loading && quotes.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="flex items-center justify-center mx-auto mb-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4E3B31]"></div>
        </div>
        <p className="text-[#4E3B31] text-sm">Loading quote history...</p>
      </div>
    );
  }

  if (error && quotes.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-red-50 rounded-md p-6 border border-red-200 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-900 mb-1">Error Loading History</h3>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <button
          onClick={loadQuotes}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="flex items-center justify-center mx-auto mb-3">
          <svg className="w-12 h-12 text-[#4E3B31]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-[#4E3B31] mb-1">No History Yet</h3>
        <p className="text-[#4E3B31] text-sm">
          Your quote history will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-6 px-2">
        <h3 className="text-lg font-bold text-gray-900">Recent Quotes</h3>
        <button
          onClick={loadQuotes}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          title="Refresh"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        <div className="space-y-4">
        {quotes.map((quote) => (
          <div
            key={quote.id}
            onClick={() => onQuoteClick?.(quote.id)}
            className="bg-white rounded-xl p-4 border-2 border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{equipmentIcons[quote.equipment_type] || '🚚'}</span>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{quote.lane}</div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(quote.created_at), 'MMM dd, yyyy HH:mm')}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-blue-600">
                  ${formatQuoteAmount(quote.quote_amount)}
                </div>
              </div>
            </div>
            
            {/* Breakdown */}
            <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
              <div className="text-gray-600">
                <span className="font-medium">Distance:</span>{' '}
                {formatDistance(quote.distance_miles) !== 'N/A' 
                  ? `${formatDistance(quote.distance_miles)} mi` 
                  : 'N/A'}
              </div>
              <div className="text-gray-600 capitalize">
                <span className="font-medium">Type:</span> {quote.equipment_type}
              </div>
              {quote.total_weight && (
                <div className="text-gray-600">
                  <span className="font-medium">Weight:</span>{' '}
                  {quote.total_weight.toLocaleString()} lbs
                </div>
              )}
              {quote.pickup_date && (
                <div className="text-gray-600">
                  <span className="font-medium">Pickup:</span>{' '}
                  {format(new Date(quote.pickup_date), 'MMM dd')}
                </div>
              )}
            </div>
          </div>
        ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-gray-200 px-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-700 font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  </div>
  );
}
