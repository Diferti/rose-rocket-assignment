# Shipment Quote Calculator - Project Plan

## Assignment Overview
Build a **Shipment Quote Calculator** application that calculates shipping quotes based on origin and destination locations, and maintains a history of all quotes.

---

## Key Terminology

### What is a "Lane"?
In logistics/freight shipping terminology, a **"lane"** refers to a **specific origin-destination route** (origin/destination pair). 

**Examples:**
- "Toronto → Vancouver" is a lane
- "New York → Los Angeles" is a lane
- "Chicago → Miami" is a lane

**In your form context:**
- **Lane** = Origin/Destination pair (the route)
- **Equipment Type** = Type of truck/trailer (dry van, reefer, flatbed)
- **Total Weight** = Weight of the shipment
- **Pickup Date** = When the shipment will be picked up

So "lane (origin/destination pair)" means you need to capture:
- Origin location (city + postal code)
- Destination location (city + postal code)

Together, these form the "lane".

---

## Your Questions Answered

### 1. **Distance Calculation & PostgreSQL GIS**

**Question:** "Will we need to calculate distance between input cities to calculate quote? If yes, can we use PostgreSQL built-in GIS, or does it not have postal codes?"

**Answer:**
- **YES**, distance calculation is likely needed for accurate shipping quotes
- **PostgreSQL with PostGIS** is an excellent choice! Here's why:
  - PostGIS has excellent support for geographic calculations
  - You can store postal codes as text and use geocoding services to get coordinates
  - PostGIS can calculate distances using `ST_Distance` or `ST_DistanceSphere`
  - You can store locations as `POINT` or `GEOGRAPHY` types

**Approach:**
1. **Store postal codes** in the database (as text/varchar)
2. **Geocode postal codes** to get lat/lng coordinates (using a service like Google Maps API, OpenStreetMap Nominatim, or a postal code database)
3. **Store coordinates** in PostGIS `GEOGRAPHY` or `POINT` type
4. **Calculate distance** using PostGIS functions
5. **Calculate quote** based on distance + other factors (weight, service type, etc.)

**Alternative:** If you want to avoid external APIs, you can:
- Use a postal code database with pre-calculated coordinates
- Use a distance matrix API (Google Distance Matrix, Mapbox, etc.)
- Use a simple formula-based approach (Haversine formula) if you have coordinates

---

### 2. **Quote Calculation & History**

**Question:** "It seems to be, we need to calculate quotes and keep history of these quotes."

**Answer:** **YES, exactly!**

**Requirements:**
- Calculate quotes based on:
  - Origin location (city + postal code)
  - Destination location (city + postal code)
  - Possibly: weight, dimensions, service type, etc.
- Store all quote requests in a database
- Maintain history for:
  - Audit purposes
  - Analytics
  - Potential quote retrieval/reference

---

## What You Might Have Missed

### Potential Additional Requirements:

1. **Frontend Requirements:**
   - Form to input origin/destination with:
     - **Autocomplete dropdown** with popular North American cities (presets)
     - **Free text input** for any city (with autocomplete/search)
     - Postal code field (optional but recommended)
     - Equipment type dropdown (dry van, reefer, flatbed)
     - Total weight input
     - Pickup date picker
   - **North America region indicator** (visual badge/text)
   - Display calculated quote
   - View quote history
   - **Validation feedback** for invalid locations/postal codes
   - Possibly: map visualization showing route
   - Responsive design

2. **Backend Requirements:**
   - REST API endpoints:
     - `POST /api/quotes` - Calculate and store a new quote
     - `GET /api/quotes` - List all quotes (with pagination)
     - `GET /api/quotes/:id` - Get specific quote details
   - Input validation
   - Error handling
   - Possibly: rate limiting

3. **Database Schema:**
   - `quotes` table with:
     - id, origin_city, origin_postal_code, destination_city, destination_postal_code
     - **lane** (could be stored as a computed field or separate column: "origin-destination")
     - **equipment_type** (dry van, reefer, flatbed)
     - **total_weight** (in lbs or kg)
     - **pickup_date** (date)
     - distance (calculated), quote_amount, created_at
   - Indexes for performance (on origin, destination, pickup_date, equipment_type)

4. **Business Logic:**
   - Quote calculation formula (distance-based pricing)
   - **North America region validation:**
     - Validate postal code format (US ZIP, Canadian postal code, Mexican CP)
     - Validate geocoded coordinates are within North America bounds
     - Reject locations outside North America with clear error messages
   - Equipment type pricing multipliers (reefer/flatbed may cost more than dry van)
   - Weight-based pricing adjustments
   - Possibly: different service tiers (standard, express, etc.)
   - Currency formatting (USD, CAD, MXN)
   - Validation rules (e.g., minimum distance, supported areas)

5. **Testing:**
   - Unit tests for quote calculation
   - Integration tests for API endpoints
   - Database tests

6. **Documentation:**
   - API documentation
   - README with setup instructions
   - Code comments

7. **Deployment:**
   - Docker setup (optional but impressive)
   - Environment configuration
   - Database migrations

---

## Recommended Tech Stack

### Backend:
- **Language:** Python (FastAPI/Flask) or Node.js (Express) or Java (Spring Boot)
- **Database:** PostgreSQL with PostGIS extension
- **ORM:** SQLAlchemy (Python) or Prisma (Node.js) or JPA (Java)

### Frontend:
- **Framework:** React, Vue, or vanilla JavaScript
- **Styling:** CSS/Tailwind/Bootstrap
- **HTTP Client:** Axios or Fetch API

### Additional Tools:
- **Geocoding:** Google Maps Geocoding API, OpenStreetMap Nominatim (free), or postal code database
- **Distance Calculation:** PostGIS `ST_DistanceSphere` or Haversine formula

---

## Implementation Plan

### Phase 1: Database Setup
1. Set up PostgreSQL with PostGIS extension
2. Create database schema:
   - `quotes` table
   - Indexes on postal codes and dates
3. Create migration scripts

### Phase 2: Backend API
1. Set up backend framework
2. Implement geocoding service (convert postal codes to coordinates)
3. Implement distance calculation (using PostGIS or Haversine)
4. Implement quote calculation logic
5. Create REST API endpoints:
   - POST /api/quotes (create quote)
   - GET /api/quotes (list quotes)
   - GET /api/quotes/:id (get quote)
6. Add input validation and error handling

### Phase 3: Frontend
1. Create quote calculation form
2. Display quote results
3. Create quote history view
4. Add styling and responsive design

### Phase 4: Testing & Polish
1. Write unit tests
2. Write integration tests
3. Add error handling
4. Add loading states
5. Documentation

---

## Sample Data Structure

Based on your mention of cities + postal codes:

```json
{
  "lane": {
    "origin": {
      "city": "Toronto",
      "postal_code": "M5H 2N2"
    },
    "destination": {
      "city": "Vancouver",
      "postal_code": "V6B 1A1"
    }
  },
  "equipment_type": "dry van",  // "dry van", "reefer", or "flatbed"
  "total_weight": 10000,  // in lbs or kg
  "pickup_date": "2024-03-15"  // ISO date format
}
```

**Note:** The "lane" is the combination of origin + destination. You can store it as:
- Separate fields (origin_city, origin_postal_code, destination_city, destination_postal_code)
- Or as a computed/derived field: `lane = origin + " → " + destination`

---

## Next Steps

1. **Read the PDF carefully** to confirm all requirements
2. **Choose your tech stack**
3. **Set up development environment**
4. **Start with database schema**
5. **Implement backend API**
6. **Build frontend**
7. **Test thoroughly**
8. **Document everything**

---

## Tips for Success

1. **Start simple:** Get basic quote calculation working first
2. **Use PostGIS:** It's powerful and shows you understand GIS concepts
3. **Handle edge cases:** Invalid postal codes, same origin/destination, etc.
4. **Clean code:** Follow best practices, add comments
5. **Test thoroughly:** Show you care about quality
6. **Document well:** README, API docs, code comments
7. **Make it look good:** A polished UI shows attention to detail

---

## City Selection Strategy: Hybrid Approach

**Decision:** **Hybrid approach with popular city presets + flexible input, limited to North America**

### Implementation Plan:

#### 1. **Popular City Presets** (Quick Selection)
Provide a dropdown/autocomplete with popular North American cities for quick selection:
- **USA Major Cities:**
  - New York, NY
  - Los Angeles, CA
  - Chicago, IL
  - Houston, TX
  - Phoenix, AZ
  - Philadelphia, PA
  - San Antonio, TX
  - San Diego, CA
  - Dallas, TX
  - San Jose, CA
  - Austin, TX
  - Jacksonville, FL
  - San Francisco, CA
  - Columbus, OH
  - Fort Worth, TX
  - Charlotte, NC
  - Seattle, WA
  - Denver, CO
  - Washington, DC
  - Boston, MA
  - Detroit, MI
  - Nashville, TN
  - Memphis, TN
  - Portland, OR
  - Oklahoma City, OK
  - Las Vegas, NV
  - Louisville, KY
  - Baltimore, MD
  - Milwaukee, WI
  - Albuquerque, NM
  - Tucson, AZ
  - Fresno, CA
  - Sacramento, CA
  - Kansas City, MO
  - Mesa, AZ
  - Atlanta, GA
  - Omaha, NE
  - Miami, FL
  - Oakland, CA
  - Minneapolis, MN
  - Tulsa, OK
  - Cleveland, OH
  - Wichita, KS
  - Arlington, TX

- **Canada Major Cities:**
  - Toronto, ON
  - Montreal, QC
  - Vancouver, BC
  - Calgary, AB
  - Edmonton, AB
  - Ottawa, ON
  - Winnipeg, MB
  - Quebec City, QC
  - Hamilton, ON
  - Kitchener, ON
  - London, ON
  - Halifax, NS
  - Victoria, BC
  - Windsor, ON
  - Saskatoon, SK
  - Regina, SK
  - St. John's, NL
  - Oshawa, ON
  - Barrie, ON
  - Abbotsford, BC

- **Mexico Major Cities:**
  - Mexico City
  - Guadalajara
  - Monterrey
  - Puebla
  - Tijuana
  - León
  - Juárez
  - Torreón
  - Querétaro
  - San Luis Potosí

#### 2. **Flexible Input** (Any City Selection)
- Users can also **type in any city name** (not just from presets)
- Autocomplete/search functionality to help find cities
- System validates and geocodes any valid North American city

#### 3. **North America Region Limitation**
- **Validation:** Only accept cities/postal codes from:
  - **United States** (US postal codes: 5-digit ZIP codes)
  - **Canada** (Canadian postal codes: A1A 1A1 format)
  - **Mexico** (Mexican postal codes: 5-digit CP codes)
- **Implementation:**
  - Validate postal code format based on country
  - Validate geocoded coordinates are within North America bounds
  - Show error message if location is outside North America

#### 4. **UI/UX Design**
- **Origin/Destination Fields:**
  - Autocomplete dropdown with popular cities (presets)
  - Allow free text input for any city
  - Show city, state/province, country
  - Postal code field (optional but recommended)
  - Visual indicator showing "North America only"
- **Validation:**
  - Real-time validation of postal code format
  - Check if geocoded location is in North America
  - Clear error messages for invalid locations

### Benefits of This Approach:
✅ **User-friendly:** Quick selection for common routes  
✅ **Flexible:** Supports any North American city  
✅ **Professional:** Shows attention to UX details  
✅ **Validated:** Ensures geographic constraints  
✅ **Scalable:** Easy to add more preset cities

---

## Implementation Details for North America Validation

### Postal Code Validation:

**United States:**
- Format: 5 digits (e.g., "90210") or ZIP+4 (e.g., "90210-1234")
- Regex: `^\d{5}(-\d{4})?$`

**Canada:**
- Format: A1A 1A1 (letter-digit-letter space digit-letter-digit)
- Regex: `^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$`
- Case-insensitive

**Mexico:**
- Format: 5 digits (e.g., "01000")
- Regex: `^\d{5}$`

### Geographic Bounds for North America:
- **Latitude:** Approximately 7°N to 83°N
- **Longitude:** Approximately -180°W to -50°W (or 180°E to 50°E)
- More precise bounds:
  - **North:** ~83°N (Arctic)
  - **South:** ~7°N (southern Mexico)
  - **East:** ~-50°W (eastern Canada)
  - **West:** ~-180°W (Alaska)

### Geocoding Validation:
After geocoding a postal code/city:
1. Check if coordinates fall within North America bounds
2. Optionally verify country code from geocoding service
3. Reject if outside bounds with error: "Location must be within North America (USA, Canada, or Mexico)"

---

## Questions to Clarify

Before starting, you might want to confirm:
- What factors affect the quote? (distance only? weight? equipment type? pickup date?)
- What's the pricing formula?
- Should quotes expire after a certain time?
- Do we need user authentication?
- Should we support multiple currencies? (USD, CAD, MXN)
- **✅ DECIDED:** Users can input any cities (with popular presets), limited to North America

---

Good luck with your assignment! 🚀

