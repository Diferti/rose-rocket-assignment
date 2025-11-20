# Shipment Quote Calculator - Backend API

Node.js/Express RESTful API backend for the Shipment Quote Calculator application. Provides endpoints for quote calculation, geocoding, distance calculation, and quote history management.

## 📋 Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Services](#services)
- [Error Handling](#error-handling)
- [Validation](#validation)
- [Additional Resources](#additional-resources)

<a id="features"></a>
## ✨ Features

- ✅ **PostgreSQL Integration** - Connection pooling, PostGIS for geographic calculations, prepared statements
- ✅ **RESTful API** - JSON endpoints with consistent responses and pagination support
- ✅ **Input Validation** - express-validator with postal code, country, equipment type, and date validation
- ✅ **Geocoding Service** - OpenStreetMap Nominatim integration with postal code priority and city fallback
- ✅ **Distance Calculation** - OSRM driving distance (primary) with PostGIS great-circle fallback
- ✅ **Quote Calculation** - Distance-based pricing with equipment type multipliers and weight adjustments
- ✅ **Error Handling** - Centralized error handling with consistent response format and HTTP status codes

<a id="technologies"></a>
## 🛠 Technologies

- **Node.js** (v18+) - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Database (via `pg` library)
- **PostGIS** - Spatial database extension
- **express-validator** - Input validation
- **axios** - HTTP client for external APIs
- **dotenv** - Environment variable management
- **cors** - Cross-origin resource sharing
- **nodemon** - Development auto-reload

**Why these technologies?**
- **Express.js**: Lightweight, flexible, and widely adopted. Perfect for REST APIs.
- **PostgreSQL + PostGIS**: Industry standard for geographic data. PostGIS provides powerful spatial functions.
- **express-validator**: Robust validation that integrates seamlessly with Express middleware.

<a id="prerequisites"></a>
## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL with PostGIS extension
- Database running (see main project README for setup)

<a id="installation"></a>
## 📦 Installation

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file** with your configuration (see [Configuration](#configuration))

5. **Ensure database is running:**
   ```bash
   # From project root
   docker-compose up -d
   ```

<a id="configuration"></a>
## ⚙️ Configuration

Create a `.env` file in the `backend` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shipment_quotes
DB_USER=postgres
DB_PASSWORD=postgres

# Server Configuration
PORT=3000

# Quote Calculation Settings
BASE_RATE_PER_MILE=2.00
MINIMUM_QUOTE=100.00
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `shipment_quotes` |
| `DB_USER` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `PORT` | Server port | `3000` |
| `BASE_RATE_PER_MILE` | Base rate per mile | `2.00` |
| `MINIMUM_QUOTE` | Minimum quote amount | `100.00` |

<a id="running-the-server"></a>
## 🚀 Running the Server

### Development Mode

```bash
npm run dev
```

This starts the server with `nodemon` for automatic reloading on file changes.

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

<a id="api-endpoints"></a>
## 📡 API Endpoints

### Health Check

Check server and database connection status.

```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-03-10T12:00:00.000Z"
}
```

### Create Quote

Create a new shipment quote.

```http
POST /api/quotes
Content-Type: application/json
```

**Request Body:**
```json
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
  "equipment_type": "dry_van",
  "total_weight": 10000,
  "pickup_date": "2024-03-15"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Quote created successfully",
  "data": {
    "id": 1,
    "origin_city": "Toronto",
    "origin_postal_code": "M5H 2N2",
    "origin_state_province": "ON",
    "origin_country": "CA",
    "destination_city": "Vancouver",
    "destination_postal_code": "V6B 1A1",
    "destination_state_province": "BC",
    "destination_country": "CA",
    "equipment_type": "dry_van",
    "total_weight": 10000,
    "pickup_date": "2024-03-15",
    "distance_miles": 2756.23,
    "distance_kilometers": 4435.67,
    "quote_amount": 5512.46,
    "created_at": "2024-03-10T12:00:00.000Z",
    "origin_coordinates": {
      "latitude": 43.6532,
      "longitude": -79.3832
    },
    "destination_coordinates": {
      "latitude": 49.2827,
      "longitude": -123.1207
    },
    "geocoding_accuracy": {
      "origin": "postal_code",
      "destination": "postal_code"
    }
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Validation error",
  "message": "Origin city is required"
}
```

### Get All Quotes

Retrieve all quotes with pagination.

```http
GET /api/quotes?page=1&limit=10
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "origin_city": "Toronto",
      "destination_city": "Vancouver",
      "quote_amount": 5512.46,
      "created_at": "2024-03-10T12:00:00.000Z",
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### Get Quote by ID

Retrieve a specific quote by ID.

```http
GET /api/quotes/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    ...
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Not found",
  "message": "Quote with ID 1 not found"
}
```

<a id="project-structure"></a>
## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # PostgreSQL connection pool
│   ├── controllers/
│   │   └── quoteController.js   # Quote request handlers
│   ├── middleware/
│   │   ├── errorHandler.js      # Centralized error handling
│   │   └── validation.js        # Input validation rules
│   ├── routes/
│   │   └── quoteRoutes.js       # API route definitions
│   ├── services/
│   │   ├── geocoding.js         # Geocoding service (Nominatim)
│   │   └── quoteCalculator.js   # Quote calculation logic
│   └── server.js                # Express app setup
├── .env.example                 # Environment variables template
├── .env                         # Your environment variables (not in git)
├── package.json
└── README.md
```

<a id="services"></a>
## 🔧 Services

### Geocoding Service

Located in `src/services/geocoding.js`:

- **Function**: `geocodeLocation(location)`
- **Purpose**: Convert location (city, postal code) to coordinates
- **Service**: OpenStreetMap Nominatim
- **Features**:
  - Prioritizes postal code for accuracy
  - Falls back to city + state if postal code fails
  - Validates coordinates are within North America
  - Returns accuracy level (postal_code, city_state, city_only)

### Quote Calculator Service

Located in `src/services/quoteCalculator.js`:

- **Function**: `calculateDistance(originLat, originLon, destLat, destLon)`
  - Tries OSRM driving distance first
  - Falls back to PostGIS great-circle distance
  - Returns distance in miles and kilometers

- **Function**: `calculateQuoteAmount(distanceMiles, equipmentType, totalWeight)`
  - Calculates base quote from distance
  - Applies equipment type multiplier
  - Adds weight-based pricing (if over 10,000 lbs)
  - Enforces minimum quote

**Quote Calculation Formula:**
```
baseQuote = distance_miles × BASE_RATE_PER_MILE
quoteAfterEquipment = baseQuote × equipmentMultiplier
quoteWithWeight = quoteAfterEquipment + weightFactor
finalQuote = max(quoteWithWeight, MINIMUM_QUOTE)
```

**Equipment Multipliers:**
- `dry_van`: 1.0x (base)
- `reefer`: 1.2x (+20%)
- `flatbed`: 1.15x (+15%)
- `step_deck`: 1.20x (+20%)
- `hotshot`: 0.85x (-15%)
- `straight_truck`: 0.95x (-5%)

**Weight Pricing:**
- Base threshold: 10,000 lbs
- Additional: $0.10 per 100 lbs over threshold

<a id="error-handling"></a>
## ⚠️ Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Human-readable error message"
}
```

**Error Types:**
- `Validation error` - Input validation failed (400)
- `Geocoding error` - Failed to geocode location (400)
- `Distance calculation error` - Failed to calculate distance (500)
- `Not found` - Resource not found (404)
- `Database error` - Database operation failed (500)
- `Internal server error` - Unexpected error (500)

<a id="validation"></a>
## ✅ Validation

All inputs are validated using `express-validator`:

### Location Validation
- **City**: Required, non-empty string
- **Postal Code**: Optional, validated by country format:
  - US: `^\d{5}(-\d{4})?$` (5 digits or ZIP+4)
  - CA: `^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$` (A1A 1A1 format)
  - MX: `^\d{5}$` (5 digits)
- **State/Province**: Optional, non-empty string
- **Country**: Required, must be 'US', 'CA', or 'MX'

### Quote Validation
- **Equipment Type**: Required, must be one of:
  - `dry_van`, `reefer`, `flatbed`, `step_deck`, `hotshot`, `straight_truck`
- **Total Weight**: Required, must be > 0
- **Pickup Date**: Required, must be valid date, must be in the future

<a id="additional-resources"></a>
## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [express-validator Documentation](https://express-validator.github.io/docs/)
- [OpenStreetMap Nominatim](https://nominatim.org/)
- [OSRM Routing](http://project-osrm.org/)
---

For frontend documentation, see [../frontend/README.md](../frontend/README.md)  
For main project documentation, see [../README.md](../README.md)
