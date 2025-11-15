# Shipment Quote Calculator - Frontend

Next.js 14 frontend with TypeScript, Tailwind CSS, and React.

## Features

- ✅ TypeScript for type safety
- ✅ Next.js 14 with App Router
- ✅ Tailwind CSS for styling
- ✅ Popular cities autocomplete
- ✅ Quote calculation form
- ✅ Quote history with pagination
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running on `http://localhost:3000`

### Installation

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` if your backend is on a different port:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3001](http://localhost:3001)

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Main page
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── QuoteForm.tsx       # Quote calculation form
│   │   ├── QuoteResult.tsx     # Quote result display
│   │   └── QuoteHistory.tsx    # Quote history list
│   ├── lib/
│   │   └── api.ts              # API client
│   └── data/
│       └── popularCities.ts   # Popular cities data
├── .env.local.example
└── package.json
```

## Features

### Quote Form
- Origin and destination selection
- Popular cities autocomplete
- Optional postal codes for accuracy
- Equipment type selection
- Weight and pickup date (optional)
- Real-time validation

### Quote Result
- Display calculated quote amount
- Distance information
- Equipment type and weight
- Geocoding accuracy indicator
- Quote ID and timestamp

### Quote History
- List of all previous quotes
- Pagination support
- Quick view of quote details
- Refresh functionality

## API Integration

The frontend connects to the backend API at `NEXT_PUBLIC_API_URL`:

- `POST /api/quotes` - Create quote
- `GET /api/quotes` - Get all quotes
- `GET /api/quotes/:id` - Get quote by ID
- `GET /health` - Health check

## Styling

Uses Tailwind CSS for styling:
- Responsive design (mobile-first)
- Modern UI components
- Consistent color scheme
- Accessible form elements

## TypeScript

All components and utilities are fully typed:
- Type-safe API calls
- Type-safe form handling
- Type-safe data structures

## Next Steps

- Add loading skeletons
- Add error boundaries
- Add toast notifications
- Add map visualization
- Add export functionality
- Add filtering/sorting in history
