# Shipment Quote Calculator

A full-stack web application for calculating shipping quotes across North America (Canada, USA, and Mexico). The application provides accurate distance-based pricing with support for multiple equipment types, weight considerations, and comprehensive quote history management.

## 📋 Table of Contents

- [Description](#description)
- [Features](#features)
- [Technologies](#technologies)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Database Setup](#database-setup)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Additional Documentation](#additional-documentation)

## 📝 Description

The Shipment Quote Calculator is a professional logistics application designed to help businesses and individuals calculate accurate shipping quotes for freight transportation across North America. The system:

- **Geocodes** origin and destination locations using OpenStreetMap Nominatim
- **Calculates distances** using driving routes (OSRM) with fallback to great-circle distance
- **Computes quotes** based on distance, equipment type, and weight
- **Stores all quotes** in a PostgreSQL database with PostGIS for geographic data
- **Provides a modern UI** with interactive maps, quote history, and export capabilities

The application supports shipments within the United States, Canada, and Mexico, with validation to ensure all locations are within North America bounds.

## ✨ Features

### Core Functionality

- ✅ **Quote Calculation**
  - Origin and destination geocoding with postal code support
  - Driving distance calculation (OSRM API) with great-circle fallback
  - Equipment type-based pricing (6 types: dry van, reefer, flatbed, step deck, hotshot, straight truck)
  - Weight-based pricing adjustments
  - Minimum quote enforcement

- ✅ **Location Management**
  - Popular cities autocomplete (100+ preset cities across North America)
  - Free text input for any city
  - Postal code validation (Canadian, US ZIP, Mexican formats)
  - Country selection (CA, US, MX) with visual flags
  - North America region validation

- ✅ **Quote History**
  - Complete quote history with pagination
  - Search and filter capabilities
  - Detailed quote information display
  - Export to PDF and Excel

- ✅ **User Interface**
  - Responsive design (mobile, tablet, desktop)
  - Interactive route map visualization
  - Real-time form validation
  - Loading states and error handling
  - Modern, professional design

## 🛠 Technologies

### Backend

- **Node.js** (v18+) - JavaScript runtime
- **Express.js** - Web framework for RESTful API
- **PostgreSQL** - Relational database
- **PostGIS** - Spatial database extension for geographic data
- **pg** - PostgreSQL client for Node.js
- **express-validator** - Input validation middleware
- **axios** - HTTP client for external APIs
- **dotenv** - Environment variable management

**Why these technologies?**
- **Node.js/Express**: Fast, lightweight, and perfect for REST APIs. Excellent ecosystem and easy to deploy.
- **PostgreSQL + PostGIS**: Industry-standard for geographic data. PostGIS provides powerful spatial functions for distance calculations and geographic queries.
- **express-validator**: Robust validation library that integrates seamlessly with Express.

### Frontend

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS 4** - Utility-first CSS framework
- **Leaflet** - Interactive maps
- **react-leaflet** - React bindings for Leaflet
- **react-datepicker** - Date picker component
- **jsPDF** - PDF generation
- **xlsx** - Excel file generation
- **date-fns** - Date formatting utilities
- **axios** - HTTP client

**Why these technologies?**
- **Next.js**: Server-side rendering, excellent performance, built-in routing, and easy deployment.
- **TypeScript**: Catches errors at compile time, improves code maintainability, and provides better IDE support.
- **Tailwind CSS**: Rapid UI development with utility classes, consistent design system.
- **Leaflet**: Lightweight, open-source mapping library perfect for route visualization.

### External Services

- **OpenStreetMap Nominatim** - Free geocoding service (no API key required)
- **OSRM (Open Source Routing Machine)** - Free driving distance calculation (no API key required)

**Why these services?**
- **Free and open-source**: No API keys needed, no rate limits for development
- **Reliable**: Well-maintained services with good uptime
- **Accurate**: Nominatim provides good geocoding accuracy, OSRM uses real road networks

### Development Tools

- **Docker** - Containerization for database
- **Docker Compose** - Multi-container orchestration
- **concurrently** - Run multiple npm scripts simultaneously
- **nodemon** - Auto-reload for development
- **ESLint** - Code linting

## 📁 Project Structure

```
rose-rocket-assignment/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Validation, error handling
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic (geocoding, calculations)
│   │   └── server.js       # Express app entry point
│   ├── package.json
│   ├── package-lock.json
│   └── README.md
│
├── frontend/               # Next.js application
│   ├── app/                # Next.js App Router pages
│   ├── components/         # React components
│   ├── lib/                # Utilities (API client)
│   ├── data/               # Static data (popular cities)
│   ├── public/             # Static assets (icons, flags)
│   ├── package.json
│   ├── package-lock.json
│   └── README.md
│
├── database/               # Database scripts
│   ├── init/               # Initialization scripts
│   ├── schema.sql          # Database schema
│   ├── test_connection.sql # Test queries
│   └── README.md
│
├── scripts/                # Utility scripts
│   └── wait-for-db.js      # Database readiness checker
│
├── docker-compose.yml      # Docker configuration for PostgreSQL/PostGIS
├── package.json            # Root package.json (orchestrates all services)
├── PROJECT_PLAN.md         # Development plan and requirements
└── README.md               # This file (main documentation)
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **pnpm**/**yarn**
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
- **Git** - [Download](https://git-scm.com/)

**Important:** Make sure Docker Desktop is running before executing `npm run dev`.

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone git@github.com:Diferti/rose-rocket-assignment.git
cd rose-rocket-assignment
```

### 2. Install All Dependencies

```bash
npm install
```

This will automatically install:
- Root dependencies (development tools)
- Backend dependencies
- Frontend dependencies

### 3. Start Everything

```bash
npm run dev
```

This single command will:
- ✅ Start Docker containers (PostgreSQL database)
- ✅ Wait for the database to be ready
- ✅ Start the backend server on `http://localhost:3000`
- ✅ Start the frontend server on `http://localhost:3001`

**That's it!** The application is now running. Open your browser and navigate to [http://localhost:3001](http://localhost:3001)

### 4. Stop Everything

To stop all services and Docker containers:

```bash
npm run docker:down
```

Or press `Ctrl+C` in the terminal where `npm run dev` is running.

## 📜 Available Scripts

The root `package.json` provides the following scripts:

- **`npm install`** - Installs all dependencies (root, backend, and frontend)
- **`npm run dev`** - Starts everything (Docker, backend, and frontend)
- **`npm run dev:backend`** - Start only the backend server
- **`npm run dev:frontend`** - Start only the frontend server
- **`npm run docker:up`** - Start Docker containers
- **`npm run docker:down`** - Stop Docker containers
- **`npm run docker:logs`** - View Docker container logs

**Note:** Running `npm run dev` automatically handles Docker startup and waits for the database to be ready before starting the backend and frontend services.

## 📖 Database Setup

The project uses Docker to run PostgreSQL with PostGIS. The database is **automatically started and initialized** when you run `npm run dev`. No manual setup required!

**Connection Details:**
- Host: `localhost`
- Port: `5433` (external port, mapped from container port 5432)
- Database: `shipment_quotes`
- Username: `postgres`
- Password: `postgres`

**Manual Database Management:**

If you need to manually manage the database:

```bash
# Start database only
npm run docker:up

# Stop database
npm run docker:down

# View database logs
npm run docker:logs

# Verify database is running
docker-compose exec postgres psql -U postgres -d shipment_quotes -c "SELECT PostGIS_version();"
```

**Note:** The database schema is automatically initialized when the container starts for the first time. The initialization scripts are located in `database/init/`.

## 💻 Usage

### Creating a Quote

1. **Select Origin:**
   - Choose country (CA, US, MX)
   - Enter city name (use presets for popular cities)
   - Optionally enter postal code for better accuracy

2. **Select Destination:**
   - Choose country
   - Enter city name
   - Optionally enter postal code

3. **Select Equipment Type:**
   - Choose from: Dry Van, Reefer, Flatbed, Step Deck, Hotshot, or Straight Truck

4. **Enter Weight:**
   - Enter total weight in kg or lbs
   - Weight affects pricing if over 10,000 lbs

5. **Select Pickup Date:**
   - Choose a future date

6. **Calculate Quote:**
   - Click "Calculate Quote" button
   - View the calculated quote with distance and pricing breakdown

### Viewing Quote History

- Click "View History" to see all previous quotes
- Use pagination to navigate through quotes
- Click on a quote to view details
- Export quotes to PDF or Excel

### Exporting Quotes

- Click the download button on any quote
- Choose PDF or Excel format
- Files are automatically downloaded

## 📡 API Documentation

The backend provides a RESTful API for quote management. All endpoints return JSON responses.

**Base URL:** `http://localhost:3000`

### Available Endpoints

- `GET /health` - Health check endpoint
- `POST /api/quotes` - Create a new quote
- `GET /api/quotes` - Get all quotes (with pagination)
- `GET /api/quotes/:id` - Get a specific quote by ID

### Quick Example

**Create Quote:**
```bash
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
    "equipment_type": "dry_van",
    "total_weight": 10000,
    "pickup_date": "2024-03-15"
  }'
```

**For complete API documentation** including request/response examples, error codes, and validation rules, see the [Backend README](./backend/README.md#api-endpoints).

## 🏗 Architecture

### System Architecture

```
                    ┌─────────────┐
                    │   Browser   │
                    │  (Next.js)  │
                    └──────┬──────┘
                           │ HTTP/REST
                           │
                    ┌──────▼──────┐
                    │   Express   │
                    │    API      │
                    └──────┬──────┘
                           │
                     ┌─────┴────┐
                     │          │
                 ┌───▼───┐ ┌────▼────┐
                 │PostGIS│ │Nominatim│
                 │  DB   │ │  API    │
                 └───────┘ └─────────┘
```

### Data Flow

1. **User submits quote form** → Frontend validates input
2. **Frontend sends request** → Backend API endpoint
3. **Backend geocodes locations** → OpenStreetMap Nominatim
4. **Backend calculates distance** → OSRM API (or PostGIS fallback)
5. **Backend calculates quote** → Business logic with multipliers
6. **Backend stores quote** → PostgreSQL with PostGIS
7. **Backend returns quote** → Frontend displays result

### Database Schema

The `quotes` table stores:
- Location data (city, postal code, state/province, country)
- Geographic coordinates (PostGIS GEOGRAPHY type)
- Quote details (equipment type, weight, pickup date)
- Calculated values (distance, quote amount)
- Timestamps

## 📚 Additional Documentation

- [Backend README](./backend/README.md) - Backend-specific documentation
- [Frontend README](./frontend/README.md) - Frontend-specific documentation
- [Database Setup](./database/README.md) - Database setup instructions
- [Project Plan](./PROJECT_PLAN.md) - Original project planning document
---
