import { query } from '../config/database.js';

/**
 * Calculate distance between two coordinates using PostGIS
 * @param {number} originLat 
 * @param {number} originLon 
 * @param {number} destLat 
 * @param {number} destLon 
 * @returns {Promise<Object>} - { distance_km, distance_miles }
 */
export const calculateDistance = async (originLat, originLon, destLat, destLon) => {
  try {
    const result = await query(
      `SELECT 
        ST_Distance(
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography
        ) / 1000.0 AS distance_km,
        (ST_Distance(
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography
        ) / 1000.0) * 0.621371 AS distance_miles`,
      [originLon, originLat, destLon, destLat]
    );

    if (result.rows.length === 0) {
      throw new Error('Distance calculation failed');
    }

    return {
      distance_km: parseFloat(result.rows[0].distance_km),
      distance_miles: parseFloat(result.rows[0].distance_miles),
    };
  } catch (error) {
    console.error('Distance calculation error:', error);
    throw new Error(`Failed to calculate distance: ${error.message}`);
  }
};

/**
 * Calculate quote amount based on distance, equipment type, and weight
 * @param {number} distanceMiles 
 * @param {string} equipmentType 
 * @param {number} totalWeight 
 * @returns {number} Quote amount in USD
 */
export const calculateQuoteAmount = (distanceMiles, equipmentType, totalWeight = 0) => {
  // Base rate per mile (from environment or default)
  const baseRatePerMile = parseFloat(process.env.BASE_RATE_PER_MILE) || 2.00;
  
  // Equipment type multipliers
  const equipmentMultipliers = {
    'dry_van': 1.0,
    'reefer': 1.2,      // 20% more expensive
    'flatbed': 1.15,    // 15% more expensive
    'step_deck': 1.20,  // 20% more expensive
    'hotshot': 0.85,    // 15% less expensive
    'straight_truck': 0.95  // 5% less expensive
  };
  
  // Weight factor: $0.10 per 100lbs over 10,000lbs
  const WEIGHT_THRESHOLD = 10000; // 10,000 lbs
  const WEIGHT_FACTOR_RATE = 0.10; // $0.10 per 100lbs over threshold
  
  // Minimum quote amount
  const minimumQuote = parseFloat(process.env.MINIMUM_QUOTE) || 100.00;
  
  // Calculate base quote from distance
  let quoteAmount = distanceMiles * baseRatePerMile;
  
  // Apply equipment type multiplier
  const multiplier = equipmentMultipliers[equipmentType] || 1.0;
  quoteAmount *= multiplier;
  
  // Add weight-based pricing (if weight is provided and over threshold)
  if (totalWeight > WEIGHT_THRESHOLD) {
    const weightOverThreshold = totalWeight - WEIGHT_THRESHOLD;
    const weightFactor = Math.ceil(weightOverThreshold / 100) * WEIGHT_FACTOR_RATE;
    quoteAmount += weightFactor;
  }
  
  // Apply minimum quote
  quoteAmount = Math.max(quoteAmount, minimumQuote);
  
  // Round to 2 decimal places
  return Math.round(quoteAmount * 100) / 100;
};

