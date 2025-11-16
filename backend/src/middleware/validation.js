import { body, validationResult } from 'express-validator';

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      message: 'Please check your input data',
      errors: errors.array(),
    });
  }
  next();
};

/**
 * Validation rules for creating a quote
 */
export const validateQuote = [
  // Origin location
  body('origin.city')
    .trim()
    .notEmpty()
    .withMessage('Origin city is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Origin city must be between 2 and 100 characters'),

  body('origin.postal_code')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Postal code must be 20 characters or less')
    .custom((value) => {
      if (!value) return true; // Optional field
      // Validate US ZIP code format (5 digits or ZIP+4)
      const usZipRegex = /^\d{5}(-\d{4})?$/;
      // Validate Canadian postal code format (A1A 1A1)
      const caPostalRegex = /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/i;
      // Validate Mexican postal code format (5 digits)
      const mxPostalRegex = /^\d{5}$/;
      
      if (usZipRegex.test(value) || caPostalRegex.test(value) || mxPostalRegex.test(value)) {
        return true;
      }
      throw new Error('Invalid postal code format. Use US ZIP, Canadian postal code, or Mexican CP format');
    }),

  body('origin.state_province')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('State/province must be 50 characters or less'),

  body('origin.country')
    .trim()
    .notEmpty()
    .withMessage('Origin country is required')
    .isIn(['US', 'CA', 'MX'])
    .withMessage('Origin country must be US, CA, or MX'),

  // Destination location
  body('destination.city')
    .trim()
    .notEmpty()
    .withMessage('Destination city is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Destination city must be between 2 and 100 characters'),

  body('destination.postal_code')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Postal code must be 20 characters or less')
    .custom((value) => {
      if (!value) return true; // Optional field
      const usZipRegex = /^\d{5}(-\d{4})?$/;
      const caPostalRegex = /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/i;
      const mxPostalRegex = /^\d{5}$/;
      
      if (usZipRegex.test(value) || caPostalRegex.test(value) || mxPostalRegex.test(value)) {
        return true;
      }
      throw new Error('Invalid postal code format. Use US ZIP, Canadian postal code, or Mexican CP format');
    }),

  body('destination.state_province')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('State/province must be 50 characters or less'),

  body('destination.country')
    .trim()
    .notEmpty()
    .withMessage('Destination country is required')
    .isIn(['US', 'CA', 'MX'])
    .withMessage('Destination country must be US, CA, or MX'),

  // Shipment details
  body('equipment_type')
    .trim()
    .notEmpty()
    .withMessage('Equipment type is required')
    .isIn(['dry_van', 'reefer', 'flatbed', 'step_deck', 'hotshot', 'straight_truck'])
    .withMessage('Equipment type must be: dry van, reefer, or flatbed'),

  body('total_weight')
    .notEmpty()
    .withMessage('Total weight is required')
    .isFloat({ gt: 0 })
    .withMessage('Total weight must be greater than 0'),

  body('pickup_date')
    .notEmpty()
    .withMessage('Pickup date is required')
    .isISO8601()
    .withMessage('Pickup date must be a valid ISO 8601 date (YYYY-MM-DD)')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        throw new Error('Pickup date cannot be in the past');
      }
      return true;
    }),

  handleValidationErrors,
];

/**
 * Validation rules for query parameters (pagination, filtering)
 */
export const validateQueryParams = [
  body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  handleValidationErrors,
];

