# Database Setup

PostgreSQL with PostGIS extension for the Shipment Quote Calculator.

## 🚀 Quick Start

```bash
# Start database (Docker)
docker-compose up -d

# Verify PostGIS
docker-compose exec postgres psql -U postgres -d shipment_quotes -c "SELECT PostGIS_version();"
```

## 📊 Database Schema

### `quotes` Table

Stores all shipment quotes with geographic data.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `origin_city` | VARCHAR(100) | Origin city name |
| `origin_postal_code` | VARCHAR(20) | Optional postal/ZIP code |
| `origin_state_province` | VARCHAR(50) | State or province |
| `origin_country` | VARCHAR(2) | Country code (CA, US, MX) |
| `origin_coordinates` | GEOGRAPHY(POINT) | PostGIS point (lat/lng) |
| `destination_city` | VARCHAR(100) | Destination city name |
| `destination_postal_code` | VARCHAR(20) | Optional postal/ZIP code |
| `destination_state_province` | VARCHAR(50) | State or province |
| `destination_country` | VARCHAR(2) | Country code (CA, US, MX) |
| `destination_coordinates` | GEOGRAPHY(POINT) | PostGIS point (lat/lng) |
| `lane` | VARCHAR(255) | Auto-computed route (e.g., "Toronto, ON → Vancouver, BC") |
| `equipment_type` | VARCHAR(20) | Equipment: `dry_van`, `reefer`, `flatbed`, `step_deck`, `hotshot`, `straight_truck` |
| `total_weight` | DECIMAL(10,2) | Weight in pounds/kg |
| `pickup_date` | DATE | Pickup date |
| `distance_miles` | DECIMAL(10,2) | Calculated distance (miles) |
| `distance_kilometers` | DECIMAL(10,2) | Calculated distance (km) |
| `quote_amount` | DECIMAL(10,2) | Final quote price |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

**Indexes:** City, postal code, equipment type, pickup date, created_at, lane, and spatial indexes on coordinates.

**Functions:**
- `update_lane()` - Auto-updates lane field on insert/update
- `calculate_distance()` - Calculates distance between two PostGIS points

**View:**
- `quotes_with_distance` - Includes calculated distances from coordinates

## 🔌 Connection Details

**Docker:**
- Host: `localhost`
- Port: `5433` (external, maps to 5432 internally)
- Database: `shipment_quotes`
- Username: `postgres`
- Password: `postgres`

**Backend `.env`:**
```env
DB_HOST=localhost
DB_PORT=5433
DB_NAME=shipment_quotes
DB_USER=postgres
DB_PASSWORD=postgres
```

## 📦 Manual Installation

1. Install [PostgreSQL](https://www.postgresql.org/download/) and [PostGIS](https://postgis.net/install/)
2. Create database: `createdb -U postgres shipment_quotes`
3. Enable PostGIS: `psql -U postgres -d shipment_quotes -c "CREATE EXTENSION IF NOT EXISTS postgis;"`
4. Initialize schema: `psql -U postgres -d shipment_quotes -f database/schema.sql`

## 💻 Useful Commands

```bash
# Start/stop
docker-compose up -d
docker-compose down

# Connect to database
docker-compose exec postgres psql -U postgres -d shipment_quotes

# View tables
docker-compose exec postgres psql -U postgres -d shipment_quotes -c "\dt"

# Check PostGIS extensions
docker-compose exec postgres psql -U postgres -d shipment_quotes -c "\dx"

# View logs
docker-compose logs postgres
```

## 🔍 Troubleshooting

**Port in use:** Change port in `docker-compose.yml` (default: 5433)

**Connection refused:** Wait a few seconds after `docker-compose up -d`, verify with `docker-compose ps`

**PostGIS not found:** Run `CREATE EXTENSION IF NOT EXISTS postgis;`

**Schema not initialized:** Check `database/init/01_schema.sql` exists, view logs: `docker-compose logs postgres`

---

For more details, see [Main README](../README.md) or [Backend README](../backend/README.md).
