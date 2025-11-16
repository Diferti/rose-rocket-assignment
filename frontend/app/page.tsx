'use client';

import { useState, useEffect, useRef } from 'react';
import { QuoteRequest, QuoteResponse, quoteAPI } from '@/lib/api';
import QuoteForm from '@/components/QuoteForm';
import QuoteResult from '@/components/QuoteResult';
import QuoteHistory from '@/components/QuoteHistory';
import { Truck, Globe, ArrowLeft } from 'lucide-react';

export default function Home() {
  const [currentQuote, setCurrentQuote] = useState<QuoteResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'quote' | 'history'>('quote');
  const [isFromHistory, setIsFromHistory] = useState(false);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const sidebarContainerRef = useRef<HTMLDivElement>(null);

  // Match sidebar height to form height
  useEffect(() => {
    const matchHeights = () => {
      if (formContainerRef.current && sidebarContainerRef.current) {
        const formHeight = formContainerRef.current.offsetHeight;
        sidebarContainerRef.current.style.height = `${formHeight}px`;
      }
    };

    matchHeights();
    window.addEventListener('resize', matchHeights);
    
    // Use MutationObserver to watch for form height changes
    const observer = new MutationObserver(matchHeights);
    if (formContainerRef.current) {
      observer.observe(formContainerRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class'],
      });
    }

    return () => {
      window.removeEventListener('resize', matchHeights);
      observer.disconnect();
    };
  }, [error, isLoading]);

  const handleSubmit = async (quoteData: QuoteRequest) => {
    setIsLoading(true);
    setError(null);
    setCurrentQuote(null);

    try {
      const response = await quoteAPI.create(quoteData);
      setCurrentQuote(response.data);
      setIsFromHistory(false); // New quote, not from history
      setActiveTab('quote'); // Show result
    } catch (err: unknown) {
      let errorMessage = 'Failed to calculate quote. Please try again.';
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string; errors?: Array<{ msg: string; param: string }> } } };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
        // Show validation errors if available
        if (axiosError.response?.data?.errors && Array.isArray(axiosError.response.data.errors)) {
          const validationErrors = axiosError.response.data.errors
            .map((e: { msg: string; param: string }) => `${e.param}: ${e.msg}`)
            .join(', ');
          errorMessage = `Validation error: ${validationErrors}`;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuoteClick = async (quoteId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await quoteAPI.getById(quoteId);
      // Convert the Quote to QuoteResponse format
      setCurrentQuote({
        ...response.data,
        geocoding_accuracy: undefined, // History quotes might not have this
      } as QuoteResponse['data']);
      setIsFromHistory(true); // This quote came from history
      setActiveTab('quote'); // Switch to quote tab to show details
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : (err as { response?: { data?: { message?: string } } })?.response?.data?.message 
        || 'Failed to load quote details. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F3EF]">
      {/* Header */}
      <header className="bg-[#4E3B31] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Truck className="h-8 w-8 text-[#C8A27A]" />
            <h1 className="ml-2 text-2xl font-bold text-white">FreightQuote</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm text-white bg-[#A67C52] px-4 py-2 rounded-full">
              <Globe className="h-4 w-4" />
              <span>North America Only</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div ref={formContainerRef} className="bg-white border border-[#4E3B31] rounded-lg overflow-hidden shadow-sm">
              <div className="bg-[#4E3B31] px-6 py-4">
                <h2 className="text-xl font-semibold text-white text-center">
                  Calculate New Quote
                </h2>
              </div>
              <div className="p-6">
                <QuoteForm onSubmit={handleSubmit} isLoading={isLoading} />
                
                {error && (
                  <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{error}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Result & History */}
          <div className="lg:col-span-1">
            {/* Tabs */}
            <div ref={sidebarContainerRef} className="bg-white border border-[#4E3B31] rounded-lg overflow-hidden shadow-sm flex flex-col">
              <div className="flex border-b border-[#4E3B31] flex-shrink-0">
                <button
                  onClick={() => setActiveTab('quote')}
                  className={`flex-1 py-3 px-4 text-center font-bold text-md transition-colors ${
                    activeTab === 'quote'
                      ? 'border-b-2 border-[#4E3B31] text-white bg-[#4E3B31]'
                      : 'text-[#4E3B31] hover:bg-[#F7F3EF] bg-[#F7F3EF]'
                  }`}
                >
                  Quote
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 py-3 px-4 text-center font-bold text-md transition-colors ${
                    activeTab === 'history'
                      ? 'border-b-2 border-[#4E3B31] text-white bg-[#4E3B31]'
                      : 'text-[#4E3B31] hover:bg-[#F7F3EF] bg-[#F7F3EF]'
                  }`}
                >
                  History
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex flex-col overflow-hidden bg-white border-t-0 flex-1 min-h-0">
                <div className="flex-1 flex flex-col overflow-y-auto p-6 min-h-0">
                  {activeTab === 'quote' ? (
                    <div className="flex-1">
                      {isLoading && !currentQuote ? (
                        <div className="h-full flex flex-col items-center justify-center">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#4E3B31]"></div>
                          <p className="mt-4 text-[#4E3B31] text-sm">Loading quote details...</p>
                        </div>
                      ) : currentQuote ? (
                        <div className="space-y-4">
                          {isFromHistory && (
                            <button
                              onClick={() => {
                                setCurrentQuote(null);
                                setActiveTab('history');
                                setIsFromHistory(false);
                              }}
                              className="flex items-center text-sm text-[#A67C52] hover:text-[#8C6B47] transition-colors mb-4"
                            >
                              <ArrowLeft className="h-4 w-4 mr-1" />
                              Back to History
                            </button>
                          )}
                          <QuoteResult
                            quote={currentQuote}
                            geocodingAccuracy={currentQuote.geocoding_accuracy}
                          />
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                          <div className="flex items-center justify-center mx-auto mb-3">
                            <svg className="w-12 h-12 text-[#4E3B31]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-[#4E3B31] mb-1">No Quote Yet</h3>
                          <p className="text-[#4E3B31] text-sm">
                            Calculate a quote to see the details
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 min-h-0">
                      <QuoteHistory onQuoteClick={handleQuoteClick} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
