import express from 'express';
import {
  createQuote,
  getAllQuotes,
  getQuoteById,
} from '../controllers/quoteController.js';
import { validateQuote } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route   POST /api/quotes
 * @desc    Create a new quote
 * @access  Public
 */
router.post('/', validateQuote, createQuote);

/**
 * @route   GET /api/quotes
 * @desc    Get all quotes with pagination
 * @access  Public
 */
router.get('/', getAllQuotes);

/**
 * @route   GET /api/quotes/:id
 * @desc    Get a single quote by ID
 * @access  Public
 */
router.get('/:id', getQuoteById);

export default router;

