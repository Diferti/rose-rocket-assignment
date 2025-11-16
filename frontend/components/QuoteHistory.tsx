'use client';

import { useState, useEffect } from 'react';
import { Quote, quoteAPI } from '@/lib/api';
import { format } from 'date-fns';
import Image from 'next/image';

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
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F7F3EF] rounded-lg p-6 border border-[#C8A27A] text-center">
        <div className="w-16 h-16 bg-[#EBD9C3] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#A67C52]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-[#4E3B31] mb-1">Error Loading History</h3>
        <p className="text-[#A67C52] text-sm mb-4">{error}</p>
        <button
          onClick={loadQuotes}
          className="px-4 py-2 bg-[#A67C52] text-white rounded-lg hover:bg-[#8C6B47] transition-colors text-sm font-medium"
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
        <h3 className="text-lg font-bold text-[#4E3B31]">Recent Quotes</h3>
        <button
          onClick={loadQuotes}
          className="p-2 text-[#A67C52] hover:bg-[#F7F3EF] rounded-md transition-colors"
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
            className="bg-white rounded-lg p-4 border-2 border-[#C8A27A] hover:border-[#A67C52] hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Image
                  src={`/icons/${quote.equipment_type}.png`}
                  alt={quote.equipment_type.replace(/_/g, ' ')}
                  width={24}
                  height={24}
                  className="object-contain"
                />
                <div>
                  <div className="font-semibold text-[#4E3B31] text-sm">{quote.lane}</div>
                  <div className="text-xs text-[#A67C52]">
                    {format(new Date(quote.created_at), 'MMM dd, yyyy HH:mm')}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-[#4E3B31]">
                  ${formatQuoteAmount(quote.quote_amount)}
                </div>
              </div>
            </div>
            
            {/* Breakdown */}
            <div className="mt-3 pt-3 border-t border-[#EBD9C3] grid grid-cols-2 gap-2 text-xs">
              <div className="text-[#A67C52]">
                <span className="font-medium">Distance:</span>{' '}
                {formatDistance(quote.distance_miles) !== 'N/A' 
                  ? `${formatDistance(quote.distance_miles)} mi` 
                  : 'N/A'}
              </div>
              <div className="text-[#A67C52] capitalize">
                <span className="font-medium">Type:</span> {quote.equipment_type.replace(/_/g, ' ')}
              </div>
              {quote.total_weight && (
                <div className="text-[#A67C52]">
                  <span className="font-medium">Weight:</span>{' '}
                  {quote.total_weight.toLocaleString()} lbs
                </div>
              )}
              {quote.pickup_date && (
                <div className="text-[#A67C52]">
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
        <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-[#EBD9C3] px-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-[#F7F3EF] text-[#4E3B31] rounded-lg hover:bg-[#EBD9C3] disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors border border-[#C8A27A]"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-[#4E3B31] font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-[#F7F3EF] text-[#4E3B31] rounded-lg hover:bg-[#EBD9C3] disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors border border-[#C8A27A]"
          >
            Next
          </button>
        </div>
      )}
    </div>
  </div>
  );
}
