# Shipment Quote Calculator - Backend API

Node.js/Express backend for the Shipment Quote Calculator application.

## Features

- ✅ PostgreSQL database connection with connection pooling
- ✅ RESTful API endpoints for quotes
- ✅ Input validation with express-validator
- ✅ Geocoding service (OpenStreetMap Nominatim)
- ✅ Distance calculation using PostGIS
- ✅ Quote calculation with equipment type and weight multipliers
- ✅ Comprehensive error handling
- ✅ North America region validation
- ✅ Pagination support

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL with PostGIS extension
- Database set up (see main project README)

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=shipment_quotes
   DB_USER=postgres
   DB_PASSWORD=postgres
   PORT=3000
   ```

3. **Make sure database is running:**
   ```bash
   # If using Docker:
   docker-compose up -d
   ```

## Running the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check
```
GET /health
```
Check server and database connection status.

### Create Quote
```
POST /api/quotes
Content-Type: application/json

{
  "origin": {
    "city": "Toronto",
    "postal_code": "M5H 2N2",
    "state_province": "ON",
    "country": "CA"
  },
  "destination": {
    "city": "Vancouver",
    "postal_code": "V6B 1A1",
    "state_province": "BC",
    "country": "CA"
  },
  "equipment_type": "dry van",
  "total_weight": 10000,
  "pickup_date": "2024-03-15"
}
```

### Get All Quotes
```
GET /api/quotes?page=1&limit=10
```

### Get Quote by ID
```
GET /api/quotes/:id
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database connection
│   ├── controllers/
│   │   └── quoteController.js    # Quote business logic
│   ├── middleware/
│   │   ├── errorHandler.js       # Error handling
│   │   └── validation.js         # Input validation
│   ├── routes/
│   │   └── quoteRoutes.js        # API routes
│   ├── services/
│   │   ├── geocoding.js          # Geocoding service
│   │   └── quoteCalculator.js   # Quote calculation
│   └── server.js                 # Express app setup
├── .env.example                  # Environment variables template
├── package.json
└── README.md
```

## Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Human-readable error message"
}
```

## Validation

All inputs are validated using express-validator:
- Postal code format validation (US, Canadian, Mexican)
- North America country validation
- Equipment type validation
- Date validation
- Required field validation

## Geocoding

Uses OpenStreetMap Nominatim (free, no API key needed):
- Prioritizes postal code for accuracy
- Falls back to city + state if postal code fails
- Validates coordinates are within North America

## Quote Calculation

Formula:
```
baseQuote = distance_miles × baseRatePerMile
quoteAmount = baseQuote × equipmentMultiplier + (weight × weightRate)
finalQuote = max(quoteAmount, minimumQuote)
```

Equipment multipliers:
- Dry van: 1.0x
- Reefer: 1.2x
- Flatbed: 1.15x

## Testing

Test the API with curl or Postman:

```bash
# Health check
curl http://localhost:3000/health

# Create quote
curl -X POST http://localhost:3000/api/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "origin": {
      "city": "Toronto",
      "postal_code": "M5H 2N2",
      "state_province": "ON",
      "country": "CA"
    },
    "destination": {
      "city": "Vancouver",
      "postal_code": "V6B 1A1",
      "state_province": "BC",
      "country": "CA"
    },
    "equipment_type": "dry van",
    "total_weight": 10000
  }'
```

## Environment Variables

- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 5432)
- `DB_NAME` - Database name (default: shipment_quotes)
- `DB_USER` - Database user (default: postgres)
- `DB_PASSWORD` - Database password (default: postgres)
- `PORT` - Server port (default: 3000)
- `BASE_RATE_PER_MILE` - Base rate per mile (default: 2.00)
- `MINIMUM_QUOTE` - Minimum quote amount (default: 100.00)
- `WEIGHT_RATE_PER_POUND` - Rate per pound (default: 0.01)

## Next Steps

- Add authentication/authorization
- Add rate limiting
- Add request logging
- Add unit tests
- Add integration tests
- Add API documentation (Swagger/OpenAPI)

