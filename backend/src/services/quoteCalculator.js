import { query } from '../config/database.js';
import axios from 'axios';

/**
 * Calculate driving distance using OpenRouteService API (free tier)
 * Falls back to PostGIS great-circle distance if API fails
 * @param {number} originLat 
 * @param {number} originLon 
 * @param {number} destLat 
 * @param {number} destLon 
 * @returns {Promise<Object>} - { distance_km, distance_miles }
 */
const calculateDrivingDistance = async (originLat, originLon, destLat, destLon) => {
  // Using public OSRM instance (completely free, no rate limits)
  // OSRM expects coordinates as path parameter: lon,lat;lon,lat
  const coordinates = `${originLon},${originLat};${destLon},${destLat}`;
  const OSRM_BASE_URL = `https://router.project-osrm.org/route/v1/driving/${coordinates}`;
  
  try {
    const response = await axios.get(OSRM_BASE_URL, {
      params: {
        overview: 'false', // We only need distance, not full route
        geometries: 'geojson'
      },
      timeout: 5000, // 5 second timeout
    });

    if (response.data && response.data.routes && response.data.routes.length > 0) {
      // Distance is returned in meters
      const distanceMeters = response.data.routes[0].distance;
      const distanceKm = distanceMeters / 1000.0;
      const distanceMiles = distanceKm * 0.621371;

      return {
        distance_km: parseFloat(distanceKm.toFixed(2)),
        distance_miles: parseFloat(distanceMiles.toFixed(2)),
      };
    } else {
      throw new Error('No route found in API response');
    }
  } catch (error) {
    if (error.response) {
      console.warn(`OSRM API error: ${error.response.status} - ${error.response.statusText}`);
    } else if (error.code === 'ECONNABORTED') {
      console.warn('OSRM API timeout, falling back to great-circle distance');
    } else {
      console.warn(`OSRM API error: ${error.message}`);
    }
    throw error; // Re-throw to trigger fallback
  }
};

/**
 * Calculate great-circle distance using PostGIS (fallback method)
 * @param {number} originLat 
 * @param {number} originLon 
 * @param {number} destLat 
 * @param {number} destLon 
 * @returns {Promise<Object>} - { distance_km, distance_miles }
 */
const calculateGreatCircleDistance = async (originLat, originLon, destLat, destLon) => {
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
    console.error('PostGIS distance calculation error:', error);
    throw new Error(`Failed to calculate distance: ${error.message}`);
  }
};

/**
 * Calculate distance between two coordinates
 * Tries driving distance first, falls back to great-circle distance
 * @param {number} originLat 
 * @param {number} originLon 
 * @param {number} destLat 
 * @param {number} destLon 
 * @returns {Promise<Object>} - { distance_km, distance_miles }
 */
export const calculateDistance = async (originLat, originLon, destLat, destLon) => {
  // Try driving distance first (more accurate for shipping quotes)
  try {
    const drivingDistance = await calculateDrivingDistance(originLat, originLon, destLat, destLon);
    console.log(`Using driving distance: ${drivingDistance.distance_km} km`);
    return drivingDistance;
  } catch (error) {
    // Fall back to great-circle distance if driving distance API fails
    console.warn('Falling back to great-circle distance calculation');
    const greatCircleDistance = await calculateGreatCircleDistance(originLat, originLon, destLat, destLon);
    console.log(`Using great-circle distance: ${greatCircleDistance.distance_km} km`);
    return greatCircleDistance;
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

