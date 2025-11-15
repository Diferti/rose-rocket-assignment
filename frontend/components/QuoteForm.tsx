'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { QuoteRequest, Location } from '@/lib/api';
import { popularCities, PopularCity, formatCityName } from '@/data/popularCities';

interface QuoteFormProps {
  onSubmit: (quote: QuoteRequest) => Promise<void>;
  isLoading?: boolean;
}

export default function QuoteForm({ onSubmit, isLoading = false }: QuoteFormProps) {
  const [formData, setFormData] = useState<QuoteRequest>({
    origin: {
      city: '',
      country: 'CA',
    },
    destination: {
      city: '',
      country: 'CA',
    },
    equipment_type: 'dry van',
    total_weight: undefined,
    pickup_date: undefined,
  });

  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [originSearch, setOriginSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');
  
  const originRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(event.target as Node)) {
        setShowOriginDropdown(false);
      }
      if (destRef.current && !destRef.current.contains(event.target as Node)) {
        setShowDestDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOriginCities = popularCities.filter(
    (city) =>
      city.country === formData.origin.country &&
      (city.city.toLowerCase().includes(originSearch.toLowerCase()) ||
        city.state_province.toLowerCase().includes(originSearch.toLowerCase()))
  );

  const filteredDestCities = popularCities.filter(
    (city) =>
      city.country === formData.destination.country &&
      (city.city.toLowerCase().includes(destSearch.toLowerCase()) ||
        city.state_province.toLowerCase().includes(destSearch.toLowerCase()))
  );

  const handleLocationChange = (
    field: 'origin' | 'destination',
    key: keyof Location,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [key]: value,
      },
    }));
    setErrors((prev) => ({ ...prev, [`${field}.${key}`]: '' }));
  };

  const handleCitySelect = (
    field: 'origin' | 'destination',
    city: PopularCity
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        city: city.city,
        state_province: city.state_province,
        country: city.country,
        postal_code: city.postal_code,
      },
    }));
    if (field === 'origin') {
      setShowOriginDropdown(false);
      setOriginSearch('');
    } else {
      setShowDestDropdown(false);
      setDestSearch('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!formData.origin.city.trim()) {
      newErrors['origin.city'] = 'Origin city is required';
    }
    if (!formData.destination.city.trim()) {
      newErrors['destination.city'] = 'Destination city is required';
    }
    if (formData.origin.city === formData.destination.city) {
      newErrors['destination.city'] = 'Destination must be different from origin';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Convert weight if needed
    let finalWeight = formData.total_weight;
    if (finalWeight && weightUnit === 'kg') {
      finalWeight = finalWeight * 2.20462; // Convert kg to lbs
    }

    const submitData: QuoteRequest = {
      ...formData,
      total_weight: finalWeight,
      pickup_date: formData.pickup_date
        ? new Date(formData.pickup_date).toISOString().split('T')[0]
        : undefined,
    };

    await onSubmit(submitData);
  };

  const equipmentTypes = [
    {
      id: 'dry van',
      name: 'Dry Van',
      icon: '🚚',
      description: 'Standard enclosed trailer',
    },
    {
      id: 'reefer',
      name: 'Reefer',
      icon: '❄️',
      description: 'Refrigerated trailer',
    },
    {
      id: 'flatbed',
      name: 'Flatbed',
      icon: '📦',
      description: 'Open flatbed trailer',
    },
    {
      id: 'step deck',
      name: 'Step Deck',
      icon: '📐',
      description: 'Flatbed with lower deck',
    },
    {
      id: 'hotshot',
      name: 'Hotshot',
      icon: '⚡',
      description: 'Expedited small loads',
    },
    {
      id: 'straight truck',
      name: 'Straight Truck',
      icon: '🚛',
      description: 'Single unit truck',
    },
  ];

  const countries = [
    { code: 'CA', flag: '🇨🇦', name: 'Canada' },
    { code: 'US', flag: '🇺🇸', name: 'United States' },
    { code: 'MX', flag: '🇲🇽', name: 'Mexico' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* From / To Section */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* From */}
        <div className="flex-1 bg-[#F7F3EF] p-4 rounded-lg border border-[#C8A27A]">
          <div className="relative" ref={originRef}>
            <div className="flex items-center gap-3 mb-3">
              <label className="text-md font-bold text-[#4E3B31]">
                From
              </label>
              {/* Country Selection - Flags */}
              <div className="flex gap-2">
              {countries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleLocationChange('origin', 'country', country.code)}
                  className={`relative px-2 py-1.5 rounded-md border-2 flex items-center justify-center text-sm transition-all ${
                    formData.origin.country === country.code
                      ? 'border-[#A67C52] bg-[#EBD9C3]'
                      : 'border-[#C8A27A] bg-white hover:border-[#A67C52]'
                  }`}
                  title={country.name}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#4E3B31]">{country.code}</span>
                    <Image
                      src={`/flags/${country.code.toLowerCase()}.png`}
                      alt={country.name}
                      width={16}
                      height={16}
                      className="object-contain m-0"
                      style={{ height: '1em', width: 'auto' }}
                      unoptimized
                    />
                  </div>
                  {formData.origin.country === country.code && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#4E3B31] rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
              </div>
            </div>

            {/* City and Postal Code on Same Line */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={formData.origin.city}
                  onChange={(e) => {
                    handleLocationChange('origin', 'city', e.target.value);
                    setOriginSearch(e.target.value);
                    setShowOriginDropdown(true);
                  }}
                  onFocus={() => setShowOriginDropdown(true)}
                  placeholder="City name"
                  className={`w-full px-3 py-2.5 rounded-md border bg-white text-[#4E3B31] placeholder-[#C8A27A] text-sm focus:outline-none focus:ring-1 focus:ring-[#A67C52] focus:border-[#A67C52] ${
                    errors['origin.city'] ? 'border-red-300' : 'border-[#C8A27A]'
                  }`}
                />
                {showOriginDropdown && filteredOriginCities.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-[#C8A27A] rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredOriginCities.map((city, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleCitySelect('origin', city)}
                        className="w-full px-3 py-2 text-left hover:bg-[#F7F3EF] focus:bg-[#F7F3EF] focus:outline-none border-b border-[#EBD9C3] last:border-b-0 text-sm"
                      >
                        <div className="font-medium text-[#4E3B31]">{formatCityName(city)}</div>
                        {city.postal_code && (
                          <div className="text-xs text-[#A67C52]">{city.postal_code}</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="text"
                value={formData.origin.postal_code || ''}
                onChange={(e) =>
                  handleLocationChange('origin', 'postal_code', e.target.value)
                }
                placeholder="Postal code"
                className="w-32 px-3 py-2.5 rounded-md border border-[#C8A27A] bg-white text-[#4E3B31] placeholder-[#C8A27A] text-sm focus:outline-none focus:ring-1 focus:ring-[#A67C52] focus:border-[#A67C52]"
              />
            </div>
            {errors['origin.city'] && (
              <p className="mt-1 text-xs text-red-600">{errors['origin.city']}</p>
            )}
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center py-4 md:py-0 md:px-2">
          <div className="w-10 h-10 rounded-full bg-[#4E3B31] flex items-center justify-center">
            <svg 
              className="w-5 h-5 text-white" 
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
        </div>

        {/* To */}
        <div className="flex-1 bg-[#F7F3EF] p-4 rounded-lg border border-[#C8A27A]">
          <div className="relative" ref={destRef}>
            <div className="flex items-center gap-3 mb-3">
              <label className="text-md font-bold text-[#4E3B31]">
                To
              </label>
              {/* Country Selection - Flags */}
              <div className="flex gap-2">
              {countries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleLocationChange('destination', 'country', country.code)}
                  className={`relative px-2 py-1.5 rounded-md border-2 flex items-center justify-center text-sm transition-all ${
                    formData.destination.country === country.code
                      ? 'border-[#A67C52] bg-[#EBD9C3]'
                      : 'border-[#C8A27A] bg-white hover:border-[#A67C52]'
                  }`}
                  title={country.name}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#4E3B31]">{country.code}</span>
                    <Image
                      src={`/flags/${country.code.toLowerCase()}.png`}
                      alt={country.name}
                      width={16}
                      height={16}
                      className="object-contain m-0"
                      style={{ height: '1em', width: 'auto' }}
                      unoptimized
                    />
                  </div>
                  {formData.destination.country === country.code && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#4E3B31] rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
              </div>
            </div>

            {/* City and Postal Code on Same Line */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={formData.destination.city}
                  onChange={(e) => {
                    handleLocationChange('destination', 'city', e.target.value);
                    setDestSearch(e.target.value);
                    setShowDestDropdown(true);
                  }}
                  onFocus={() => setShowDestDropdown(true)}
                  placeholder="City name"
                  className={`w-full px-3 py-2.5 rounded-md border bg-white text-[#4E3B31] placeholder-[#C8A27A] text-sm focus:outline-none focus:ring-1 focus:ring-[#A67C52] focus:border-[#A67C52] ${
                    errors['destination.city'] ? 'border-red-300' : 'border-[#C8A27A]'
                  }`}
                />
                {showDestDropdown && filteredDestCities.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-[#C8A27A] rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredDestCities.map((city, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleCitySelect('destination', city)}
                        className="w-full px-3 py-2 text-left hover:bg-[#F7F3EF] focus:bg-[#F7F3EF] focus:outline-none border-b border-[#EBD9C3] last:border-b-0 text-sm"
                      >
                        <div className="font-medium text-[#4E3B31]">{formatCityName(city)}</div>
                        {city.postal_code && (
                          <div className="text-xs text-[#A67C52]">{city.postal_code}</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="text"
                value={formData.destination.postal_code || ''}
                onChange={(e) =>
                  handleLocationChange('destination', 'postal_code', e.target.value)
                }
                placeholder="Postal code"
                className="w-32 px-3 py-2.5 rounded-md border border-[#C8A27A] bg-white text-[#4E3B31] placeholder-[#C8A27A] text-sm focus:outline-none focus:ring-1 focus:ring-[#A67C52] focus:border-[#A67C52]"
              />
            </div>
            {errors['destination.city'] && (
              <p className="mt-1 text-xs text-red-600">{errors['destination.city']}</p>
            )}
          </div>
        </div>
      </div>

      {/* Equipment Type Selection */}
      <div>
        <label className="block text-sm font-medium text-[#4E3B31] mb-3">
          Equipment Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {equipmentTypes.map((equipment) => (
            <button
              key={equipment.id}
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  equipment_type: equipment.id as 'dry van' | 'reefer' | 'flatbed' | 'step deck' | 'hotshot' | 'straight truck',
                }))
              }
              className={`relative p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                formData.equipment_type === equipment.id
                  ? 'border-[#A67C52] bg-[#EBD9C3]'
                  : 'border-[#C8A27A] bg-white hover:border-[#A67C52]'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <span className="text-3xl mb-2">{equipment.icon}</span>
                <div className="font-medium text-[#4E3B31]">{equipment.name}</div>
                <div className="text-xs text-[#4E3B31] opacity-80 mt-1">{equipment.description}</div>
              </div>
              {formData.equipment_type === equipment.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-[#4E3B31] rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Weight and Date on Same Line */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weight Input with Unit Selector */}
        <div>
          <label className="block text-sm font-medium text-[#4E3B31] mb-1.5">
            Total Weight
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.total_weight || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  total_weight: e.target.value ? parseFloat(e.target.value) : undefined,
                }))
              }
              placeholder="0.00"
              className="flex-1 px-3 py-2.5 rounded-md border border-[#C8A27A] bg-white text-[#4E3B31] placeholder-[#C8A27A] text-sm focus:outline-none focus:ring-1 focus:ring-[#A67C52] focus:border-[#A67C52]"
            />
            <div className="flex rounded-md border border-[#C8A27A] overflow-hidden">
              <button
                type="button"
                onClick={() => setWeightUnit('kg')}
                className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                  weightUnit === 'kg'
                    ? 'bg-[#A67C52] text-white'
                    : 'bg-white text-[#4E3B31] hover:bg-[#F7F3EF]'
                }`}
              >
                kg
              </button>
              <button
                type="button"
                onClick={() => setWeightUnit('lbs')}
                className={`px-4 py-2.5 text-sm font-medium transition-colors border-l border-[#C8A27A] ${
                  weightUnit === 'lbs'
                    ? 'bg-[#A67C52] text-white'
                    : 'bg-white text-[#4E3B31] hover:bg-[#F7F3EF]'
                }`}
              >
                lbs
              </button>
            </div>
          </div>
        </div>

        {/* Pickup Date Calendar */}
        <div>
          <label className="block text-sm font-medium text-[#4E3B31] mb-1.5">
            Pickup Date
          </label>
          <DatePicker
            selected={formData.pickup_date ? new Date(formData.pickup_date) : null}
            onChange={(date: Date | null) =>
              setFormData((prev) => ({
                ...prev,
                pickup_date: date ? date.toISOString().split('T')[0] : undefined,
              }))
            }
            minDate={new Date()}
            dateFormat="MMMM dd, yyyy"
            placeholderText="Select pickup date"
            className="w-full px-3 py-2.5 rounded-md border border-[#C8A27A] bg-white text-[#4E3B31] placeholder-[#C8A27A] text-sm focus:outline-none focus:ring-1 focus:ring-[#A67C52] focus:border-[#A67C52]"
            calendarClassName="rounded-md shadow-lg border border-[#C8A27A]"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#A67C52] text-white py-3 px-4 rounded-lg font-medium text-sm hover:bg-[#8C6B47] focus:outline-none focus:ring-2 focus:ring-[#A67C52] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Calculating Quote...
          </span>
        ) : (
          'Calculate Quote'
        )}
      </button>
    </form>
  );
}
