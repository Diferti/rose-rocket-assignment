import { query } from '../config/database.js';
import { geocodeLocation, coordinatesToPostGIS } from '../services/geocoding.js';
import { calculateDistance, calculateQuoteAmount } from '../services/quoteCalculator.js';

/**
 * Create a new quote
 */
export const createQuote = async (req, res, next) => {
  try {
    const {
      origin,
      destination,
      equipment_type,
      total_weight,
      pickup_date,
    } = req.body;

    // Step 1: Geocode origin location
    let originCoords;
    try {
      originCoords = await geocodeLocation(origin);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Geocoding error',
        message: `Failed to geocode origin location: ${error.message}`,
      });
    }

    // Step 2: Geocode destination location
    let destCoords;
    try {
      destCoords = await geocodeLocation(destination);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Geocoding error',
        message: `Failed to geocode destination location: ${error.message}`,
      });
    }

    // Step 3: Calculate distance
    let distance;
    try {
      distance = await calculateDistance(
        originCoords.latitude,
        originCoords.longitude,
        destCoords.latitude,
        destCoords.longitude
      );
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Distance calculation error',
        message: error.message,
      });
    }

    // Step 4: Calculate quote amount
    const quoteAmount = calculateQuoteAmount(
      distance.distance_miles,
      equipment_type,
      total_weight || 0
    );

    // Step 5: Insert into database
    const originPostGIS = coordinatesToPostGIS(originCoords.latitude, originCoords.longitude);
    const destPostGIS = coordinatesToPostGIS(destCoords.latitude, destCoords.longitude);

    const result = await query(
      `INSERT INTO quotes (
        origin_city, origin_postal_code, origin_state_province, origin_country, origin_coordinates,
        destination_city, destination_postal_code, destination_state_province, destination_country, destination_coordinates,
        equipment_type, total_weight, pickup_date,
        distance_miles, distance_kilometers, quote_amount
      ) VALUES ($1, $2, $3, $4, ST_SetSRID(ST_GeomFromText($5), 4326)::geography, $6, $7, $8, $9, ST_SetSRID(ST_GeomFromText($10), 4326)::geography, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        origin.city,
        origin.postal_code || null,
        origin.state_province || null,
        origin.country,
        originPostGIS,
        destination.city,
        destination.postal_code || null,
        destination.state_province || null,
        destination.country,
        destPostGIS,
        equipment_type,
        total_weight || null,
        pickup_date || null,
        distance.distance_miles,
        distance.distance_km,
        quoteAmount,
      ]
    );

    const quote = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Quote created successfully',
      data: {
        ...quote,
        geocoding_accuracy: {
          origin: originCoords.accuracy,
          destination: destCoords.accuracy,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all quotes with pagination
 */
export const getAllQuotes = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await query('SELECT COUNT(*) FROM quotes');
    const total = parseInt(countResult.rows[0].count);

    // Get quotes
    const result = await query(
      `SELECT * FROM quotes 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single quote by ID
 */
export const getQuoteById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query('SELECT * FROM quotes WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: `Quote with ID ${id} not found`,
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

