'use client';

import { Quote } from '@/lib/api';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useState, useRef, useEffect, useMemo } from 'react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

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

export default function QuoteResult({ quote }: QuoteResultProps) {
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showCalculationDetails, setShowCalculationDetails] = useState(false);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  // Helper function to safely convert to number and format
  const formatNumber = (value: number | string | undefined, decimals: number = 2): string => {
    if (value === undefined || value === null) return 'N/A';
    const num = typeof value === 'number' ? value : parseFloat(String(value));
    return isNaN(num) ? 'N/A' : num.toFixed(decimals);
  };

  const quoteAmount = typeof quote.quote_amount === 'number' 
    ? quote.quote_amount 
    : parseFloat(String(quote.quote_amount || '0'));

  // Calculate price per mile/km
  const distanceMiles = quote.distance_miles ? parseFloat(String(quote.distance_miles)) : 0;
  const distanceKm = quote.distance_kilometers ? parseFloat(String(quote.distance_kilometers)) : 0;
  const pricePerMile = distanceMiles > 0 ? quoteAmount / distanceMiles : 0;
  const pricePerKm = distanceKm > 0 ? quoteAmount / distanceKm : 0;

  // Calculate breakdown for display
  const BASE_RATE_PER_MILE = 2.00;
  const WEIGHT_THRESHOLD = 10000;
  const WEIGHT_FACTOR_RATE = 0.10;
  const MINIMUM_QUOTE = 100.00;

  const equipmentMultipliers: Record<string, number> = {
    'dry_van': 1.0,
    'reefer': 1.2,
    'flatbed': 1.15,
    'step_deck': 1.20,
    'hotshot': 0.85,
    'straight_truck': 0.95,
  };

  const baseQuote = distanceMiles * BASE_RATE_PER_MILE;
  const equipmentMultiplier = equipmentMultipliers[quote.equipment_type] || 1.0;
  const quoteAfterEquipment = baseQuote * equipmentMultiplier;
  const weightOverThreshold = quote.total_weight && quote.total_weight > WEIGHT_THRESHOLD 
    ? quote.total_weight - WEIGHT_THRESHOLD 
    : 0;
  const weightFactor = weightOverThreshold > 0 
    ? Math.ceil(weightOverThreshold / 100) * WEIGHT_FACTOR_RATE 
    : 0;
  const quoteBeforeMinimum = quoteAfterEquipment + weightFactor;
  const minimumApplied = quoteBeforeMinimum < MINIMUM_QUOTE;

  // Memoize RouteMap props to prevent unnecessary re-renders
  const routeMapOrigin = useMemo(() => ({
    latitude: Number(quote.origin_coordinates?.latitude),
    longitude: Number(quote.origin_coordinates?.longitude),
    city: quote.origin_city,
    state_province: quote.origin_state_province || undefined,
  }), [quote.origin_coordinates?.latitude, quote.origin_coordinates?.longitude, quote.origin_city, quote.origin_state_province]);

  const routeMapDestination = useMemo(() => ({
    latitude: Number(quote.destination_coordinates?.latitude),
    longitude: Number(quote.destination_coordinates?.longitude),
    city: quote.destination_city,
    state_province: quote.destination_state_province || undefined,
  }), [quote.destination_coordinates?.latitude, quote.destination_coordinates?.longitude, quote.destination_city, quote.destination_state_province]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
        setShowDownloadMenu(false);
      }
    };

    if (showDownloadMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDownloadMenu]);

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    // Title
    doc.setFontSize(18);
    doc.setTextColor(78, 59, 49); // #4E3B31
    doc.text('Shipment Quote', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Quote ID
    doc.setFontSize(10);
    doc.setTextColor(166, 124, 82); // #A67C52
    doc.text(`Quote #${quote.id}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Total Quote
    doc.setFontSize(16);
    doc.setTextColor(78, 59, 49);
    doc.text('Total Quote:', margin, yPos);
    doc.setFontSize(20);
    doc.text(`$${formatNumber(quoteAmount, 2)}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 15;

    // Route
    doc.setFontSize(12);
    doc.setTextColor(78, 59, 49);
    const origin = `${quote.origin_city}${quote.origin_state_province ? `, ${quote.origin_state_province}` : ''}`;
    const destination = `${quote.destination_city}${quote.destination_state_province ? `, ${quote.destination_state_province}` : ''}`;
    doc.text('Route:', margin, yPos);
    doc.setFontSize(10);
    const routeText = `${origin} — ${destination}`;
    const routeLabelWidth = doc.getTextWidth('Route:');
    doc.text(routeText, margin + routeLabelWidth + 5, yPos);
    yPos += 12;

    // Details
    doc.setFontSize(10);
    doc.setTextColor(166, 124, 82);
    doc.text('Distance:', margin, yPos);
    doc.setTextColor(78, 59, 49);
    doc.text(`${formatNumber(distanceKm, 2)} km / ${formatNumber(distanceMiles, 2)} miles`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 7;

    doc.setTextColor(166, 124, 82);
    doc.text('Equipment:', margin, yPos);
    doc.setTextColor(78, 59, 49);
    doc.text(quote.equipment_type.replace(/_/g, ' '), pageWidth - margin, yPos, { align: 'right' });
    yPos += 7;

    if (quote.total_weight) {
      doc.setTextColor(166, 124, 82);
      doc.text('Weight:', margin, yPos);
      doc.setTextColor(78, 59, 49);
      doc.text(`${quote.total_weight.toLocaleString()} lbs`, pageWidth - margin, yPos, { align: 'right' });
      yPos += 7;
    }

    if (quote.pickup_date) {
      doc.setTextColor(166, 124, 82);
      doc.text('Pickup Date:', margin, yPos);
      doc.setTextColor(78, 59, 49);
      doc.text(format(new Date(quote.pickup_date), 'MMM dd, yyyy'), pageWidth - margin, yPos, { align: 'right' });
      yPos += 7;
    }

    // Price per distance
    yPos += 5;
    doc.setFontSize(10);
    doc.setTextColor(166, 124, 82);
    doc.text('Price per:', margin, yPos);
    doc.setTextColor(78, 59, 49);
    if (distanceKm > 0 && distanceMiles > 0) {
      doc.text(`$${formatNumber(pricePerKm, 2)}/km | $${formatNumber(pricePerMile, 2)}/mile`, pageWidth - margin, yPos, { align: 'right' });
    } else if (distanceKm > 0) {
      doc.text(`$${formatNumber(pricePerKm, 2)}/km`, pageWidth - margin, yPos, { align: 'right' });
    } else if (distanceMiles > 0) {
      doc.text(`$${formatNumber(pricePerMile, 2)}/mile`, pageWidth - margin, yPos, { align: 'right' });
    }
    yPos += 15;

    // Calculation Breakdown
    yPos += 5;
    doc.setFontSize(12);
    doc.setTextColor(78, 59, 49);
    doc.text('Calculation Breakdown', margin, yPos);
    yPos += 8;

    doc.setFontSize(10);
    // Base Rate
    doc.setTextColor(166, 124, 82);
    doc.text('Base Rate', margin, yPos);
    doc.setTextColor(78, 59, 49);
    const baseRateText = `${formatNumber(distanceMiles, 2)} miles - $${BASE_RATE_PER_MILE.toFixed(2)}/mile`;
    doc.text(baseRateText, margin + 50, yPos);
    doc.text(`$${formatNumber(baseQuote, 2)}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 7;

    // Equipment Multiplier
    doc.setTextColor(166, 124, 82);
    doc.text('Equipment Multiplier', margin, yPos);
    doc.setTextColor(78, 59, 49);
    const equipmentText = `${quote.equipment_type.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())} - ${equipmentMultiplier.toFixed(2)}x`;
    doc.text(equipmentText, margin + 50, yPos);
    doc.text(`$${formatNumber(quoteAfterEquipment, 2)}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 7;

    // Weight Factor
    if (weightFactor > 0) {
      doc.setTextColor(166, 124, 82);
      doc.text('Weight Factor (over 10,000 lbs)', margin, yPos);
      doc.setTextColor(78, 59, 49);
      const weightText = `${formatNumber(weightOverThreshold, 0)} lbs - $${WEIGHT_FACTOR_RATE.toFixed(2)} per 100 lbs`;
      doc.text(weightText, margin + 50, yPos);
      doc.text(`$${formatNumber(weightFactor, 2)}`, pageWidth - margin, yPos, { align: 'right' });
      yPos += 7;
    }

    // Minimum Quote
    if (minimumApplied) {
      doc.setTextColor(166, 124, 82);
      doc.text('Minimum Quote', margin, yPos);
      doc.setTextColor(78, 59, 49);
      doc.text('Applied minimum quote', margin + 50, yPos);
      doc.text(`$${formatNumber(MINIMUM_QUOTE, 2)}`, pageWidth - margin, yPos, { align: 'right' });
      yPos += 7;
    }

    // Total
    yPos += 3;
    doc.setFontSize(11);
    doc.setTextColor(78, 59, 49);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Total:', margin, yPos);
    doc.text(`$${formatNumber(quoteAmount, 2)}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 10;

    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(166, 124, 82);
    doc.text(`Created: ${format(new Date(quote.created_at), 'MMM dd, yyyy HH:mm')}`, margin, yPos);

    doc.save(`quote-${quote.id}.pdf`);
    setShowDownloadMenu(false);
  };

  // Export to Excel
  const exportToExcel = () => {
    const data = [
      ['Shipment Quote'],
      ['Quote ID', quote.id],
      [''],
      ['Total Quote', `$${formatNumber(quoteAmount, 2)}`],
      [''],
      ['Route Information'],
      ['Origin', `${quote.origin_city}${quote.origin_state_province ? `, ${quote.origin_state_province}` : ''}`],
      ['Destination', `${quote.destination_city}${quote.destination_state_province ? `, ${quote.destination_state_province}` : ''}`],
      [''],
      ['Details'],
      ['Distance (km)', formatNumber(distanceKm, 2)],
      ['Distance (miles)', formatNumber(distanceMiles, 2)],
      ['Equipment Type', quote.equipment_type.replace(/_/g, ' ')],
    ];

    if (quote.total_weight) {
      data.push(['Weight (lbs)', quote.total_weight.toLocaleString()]);
    }

    if (quote.pickup_date) {
      data.push(['Pickup Date', format(new Date(quote.pickup_date), 'MMM dd, yyyy')]);
    }

    data.push(['']);
    data.push(['Price per Distance']);
    if (distanceKm > 0) {
      data.push(['Price per km', `$${formatNumber(pricePerKm, 2)}`]);
    }
    if (distanceMiles > 0) {
      data.push(['Price per mile', `$${formatNumber(pricePerMile, 2)}`]);
    }
    data.push(['']);
    data.push(['Calculation Breakdown']);
    data.push(['Base Rate', `${formatNumber(distanceMiles, 2)} miles - $${BASE_RATE_PER_MILE.toFixed(2)}/mile`]);
    data.push(['', `$${formatNumber(baseQuote, 2)}`]);
    data.push(['Equipment Multiplier', `${quote.equipment_type.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())} - ${equipmentMultiplier.toFixed(2)}x`]);
    data.push(['', `$${formatNumber(quoteAfterEquipment, 2)}`]);
    if (weightFactor > 0) {
      data.push(['Weight Factor (over 10,000 lbs)', `${formatNumber(weightOverThreshold, 0)} lbs - $${WEIGHT_FACTOR_RATE.toFixed(2)} per 100 lbs`]);
      data.push(['', `$${formatNumber(weightFactor, 2)}`]);
    }
    if (minimumApplied) {
      data.push(['Minimum Quote', 'Applied minimum quote']);
      data.push(['', `$${formatNumber(MINIMUM_QUOTE, 2)}`]);
    }
    data.push(['Total', `$${formatNumber(quoteAmount, 2)}`]);
    data.push(['']);
    data.push(['Created', format(new Date(quote.created_at), 'MMM dd, yyyy HH:mm')]);

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Quote');

    // Set column widths
    ws['!cols'] = [{ wch: 20 }, { wch: 30 }];

    XLSX.writeFile(wb, `quote-${quote.id}.xlsx`);
    setShowDownloadMenu(false);
  };

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

      {/* Quote Amount and Price Per - Combined Display */}
      <div className="bg-[#4E3B31] rounded-lg px-4 py-2 text-white">
        <div className="flex items-center gap-4">
          {/* Total Quote */}
          <div className="flex-1">
            <div className="text-xs font-medium opacity-90 mb-1">Total Quote</div>
            <div className="text-2xl font-bold">${formatNumber(quoteAmount, 2)}</div>
          </div>
          
          {/* Divider */}
          <div className="w-px h-16 bg-white opacity-30"></div>
          
          {/* Price Per Distance */}
          <div className="flex-1">
            <div className="space-y-0.2">
              {distanceKm > 0 && (
                <div className="text-lg font-bold">
                  ${formatNumber(pricePerKm, 2)} <span className="text-xs font-normal opacity-80">/km</span>
                </div>
              )}
              {distanceMiles > 0 && (
                <div className="text-lg font-bold">
                  ${formatNumber(pricePerMile, 2)} <span className="text-xs font-normal opacity-80">/mile</span>
                </div>
              )}
              {distanceMiles === 0 && distanceKm === 0 && (
                <div className="text-lg font-bold opacity-70">N/A</div>
              )}
            </div>
          </div>
        </div>

        {/* Details Button */}
        <div className="mt-3 pt-3 border-t border-white border-opacity-30">
          <button
            onClick={() => setShowCalculationDetails(!showCalculationDetails)}
            className="w-full text-xs hover:opacity-70 transition-opacity flex items-center justify-center gap-1.5"
            title={showCalculationDetails ? 'Hide calculation' : 'Show calculation'}
          >
            <span>{showCalculationDetails ? 'Hide' : 'Show'} Details</span>
            <svg 
              className={`w-3 h-3 transition-transform ${showCalculationDetails ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Calculation Details */}
        {showCalculationDetails && (
          <div className="mt-3 pt-3 border-t border-white border-opacity-20 space-y-3 text-xs">
            {/* Base Rate */}
            <div>
              <div className="font-medium mb-1">Base Rate</div>
              <div className="flex justify-between opacity-80">
                <span>{formatNumber(distanceMiles, 2)} miles - ${BASE_RATE_PER_MILE.toFixed(2)}/mile</span>
                <span className="font-medium">${formatNumber(baseQuote, 2)}</span>
              </div>
            </div>

            {/* Equipment Multiplier */}
            <div>
              <div className="font-medium mb-1">Equipment Multiplier</div>
              <div className="flex justify-between opacity-80">
                <span>{quote.equipment_type.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())} - {equipmentMultiplier.toFixed(2)}x</span>
                <span className="font-medium">${formatNumber(quoteAfterEquipment, 2)}</span>
              </div>
            </div>

            {/* Weight Factor */}
            {weightFactor > 0 && (
              <div>
                <div className="font-medium mb-1">Weight Factor (over {WEIGHT_THRESHOLD.toLocaleString()} lbs)</div>
                <div className="flex justify-between opacity-80">
                  <span>
                    {formatNumber(weightOverThreshold, 0)} lbs - ${WEIGHT_FACTOR_RATE.toFixed(2)} per 100 lbs
                  </span>
                  <span className="font-medium">${formatNumber(weightFactor, 2)}</span>
                </div>
              </div>
            )}

            {/* Minimum Quote */}
            {minimumApplied && (
              <div>
                <div className="font-medium opacity-90 mb-1">Minimum Quote</div>
                <div className="flex justify-between">
                  <span>Applied minimum quote</span>
                  <span className="font-medium">${formatNumber(MINIMUM_QUOTE, 2)}</span>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="pt-2 border-t border-white border-opacity-10">
              <div className="flex justify-between font-semibold opacity-100">
                <span>Total:</span>
                <span>${formatNumber(quoteAmount, 2)}</span>
              </div>
            </div>
          </div>
        )}
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
              unoptimized
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
              origin={routeMapOrigin}
              destination={routeMapDestination}
              height="250px"
            />
          </div>
        )}

      {/* Timestamp and Download */}
      <div className="pt-3 border-t border-[#EBD9C3] flex items-center justify-between">
        <p className="text-xs text-[#A67C52]">
          Created: {format(new Date(quote.created_at), 'MMM dd, yyyy HH:mm')}
        </p>
        <div className="relative" ref={downloadMenuRef}>
          <button
            onClick={() => setShowDownloadMenu(!showDownloadMenu)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#A67C52] text-white rounded-md hover:bg-[#8C6B47] transition-colors text-xs font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
          {showDownloadMenu && (
            <div className="absolute right-0 bottom-full mb-2 bg-white border border-[#C8A27A] rounded-md shadow-lg z-[9999] min-w-[140px]">
              <button
                onClick={exportToPDF}
                className="w-full px-4 py-2 text-left text-sm text-[#4E3B31] hover:bg-[#F7F3EF] flex items-center gap-2 rounded-t-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                PDF file
              </button>
              <button
                onClick={exportToExcel}
                className="w-full px-4 py-2 text-left text-sm text-[#4E3B31] hover:bg-[#F7F3EF] flex items-center gap-2 rounded-b-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Excel file
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
