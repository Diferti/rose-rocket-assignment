import axios from 'axios';

/**
 * Geocoding service using OpenStreetMap Nominatim (free, no API key needed)
 * Falls back to city center if postal code geocoding fails
 */

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * Build geocoding query string
 */
const buildGeocodingQuery = (city, stateProvince, postalCode, country) => {
  const parts = [];
  
  // Priority 1: Use postal code if provided (most accurate)
  if (postalCode) {
    parts.push(postalCode);
  }
  
  // Add city
  if (city) {
    parts.push(city);
  }
  
  // Add state/province
  if (stateProvince) {
    parts.push(stateProvince);
  }
  
  // Add country
  if (country) {
    const countryNames = {
      'US': 'United States',
      'CA': 'Canada',
      'MX': 'Mexico'
    };
    parts.push(countryNames[country] || country);
  }
  
  return parts.join(', ');
};

/**
 * Validate coordinates are within North America bounds
 */
const validateNorthAmericaBounds = (lat, lon) => {
  // North America approximate bounds
  const minLat = 7.0;   // Southern Mexico
  const maxLat = 83.0;  // Northern Canada/Alaska
  const minLon = -180.0; // Western Alaska
  const maxLon = -50.0;  // Eastern Canada
  
  return lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon;
};

/**
 * Geocode a location to get coordinates
 * @param {Object} location - Location object with city, postal_code, state_province, country
 * @returns {Promise<Object>} - { latitude, longitude, accuracy }
 */
export const geocodeLocation = async (location) => {
  const { city, postal_code, state_province, country } = location;
  
  if (!city || !country) {
    throw new Error('City and country are required for geocoding');
  }

  // Build query string
  const query = buildGeocodingQuery(city, state_province, postal_code, country);
  
  try {
    // Try geocoding with postal code first (if provided)
    let response;
    if (postal_code) {
      try {
        response = await axios.get(NOMINATIM_BASE_URL, {
          params: {
            q: query,
            format: 'json',
            limit: 1,
            addressdetails: 1,
          },
          headers: {
            'User-Agent': 'ShipmentQuoteCalculator/1.0', // Required by Nominatim
          },
        });
      } catch (error) {
        console.warn('Geocoding with postal code failed, trying without:', error.message);
        // Fallback to city + state if postal code fails
        const fallbackQuery = buildGeocodingQuery(city, state_province, null, country);
        response = await axios.get(NOMINATIM_BASE_URL, {
          params: {
            q: fallbackQuery,
            format: 'json',
            limit: 1,
            addressdetails: 1,
          },
          headers: {
            'User-Agent': 'ShipmentQuoteCalculator/1.0',
          },
        });
      }
    } else {
      // No postal code, use city + state
      response = await axios.get(NOMINATIM_BASE_URL, {
        params: {
          q: query,
          format: 'json',
          limit: 1,
          addressdetails: 1,
        },
        headers: {
          'User-Agent': 'ShipmentQuoteCalculator/1.0',
        },
      });
    }

    if (!response.data || response.data.length === 0) {
      throw new Error(`Could not geocode location: ${query}`);
    }

    const result = response.data[0];
    const latitude = parseFloat(result.lat);
    const longitude = parseFloat(result.lon);

    // Validate coordinates are in North America
    if (!validateNorthAmericaBounds(latitude, longitude)) {
      throw new Error(
        `Location is outside North America bounds. ` +
        `Only US, Canada, and Mexico are supported. ` +
        `Coordinates: ${latitude}, ${longitude}`
      );
    }

    // Determine accuracy level
    const accuracy = postal_code ? 'postal_code' : (state_province ? 'city_state' : 'city_only');

    return {
      latitude,
      longitude,
      accuracy,
      display_name: result.display_name,
    };
  } catch (error) {
    if (error.response) {
      throw new Error(`Geocoding API error: ${error.response.status} - ${error.response.statusText}`);
    }
    if (error.message.includes('North America')) {
      throw error; // Re-throw validation errors
    }
    throw new Error(`Geocoding failed: ${error.message}`);
  }
};

/**
 * Convert coordinates to PostGIS POINT format
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {string} PostGIS POINT string
 */
export const coordinatesToPostGIS = (latitude, longitude) => {
  return `POINT(${longitude} ${latitude})`;
};

