# Shipment Quote Calculator - Frontend

Modern Next.js 16 frontend application built with React 19, TypeScript, and Tailwind CSS. Provides an intuitive interface for calculating shipment quotes, viewing quote history, and exporting quote data.

## 📋 Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Components](#components)
- [API Integration](#api-integration)
- [Styling](#styling)
- [TypeScript](#typescript)
- [Additional Resources](#additional-resources)

## ✨ Features

- ✅ **Quote Calculation Form**
  - Origin and destination selection with autocomplete
  - Popular cities dropdown (100+ preset cities)
  - Country selection (CA, US, MX) with visual flags
  - Postal code input with validation
  - Equipment type selection (6 types with icons)
  - Weight input with kg/lbs toggle
  - Pickup date picker
  - Real-time form validation
  - Loading states

- ✅ **Quote Result Display**
  - Calculated quote amount
  - Distance information (miles and kilometers)
  - Equipment type and multiplier
  - Weight information
  - Geocoding accuracy indicator
  - Interactive route map
  - Price breakdown
  - Export to PDF and Excel

- ✅ **Quote History**
  - Paginated quote list
  - Quote details view
  - Search and filter capabilities
  - Refresh functionality
  - Export options

- ✅ **User Experience**
  - Responsive design (mobile, tablet, desktop)
  - Modern, professional UI
  - Smooth animations and transitions
  - Error handling with user-friendly messages
  - Loading indicators
  - Accessible form elements

## 🛠 Technologies

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Utility-first CSS framework
- **Leaflet** - Interactive maps
- **react-leaflet** - React bindings for Leaflet
- **react-datepicker** - Date picker component
- **jsPDF** - PDF generation
- **xlsx** - Excel file generation
- **date-fns** - Date formatting utilities
- **axios** - HTTP client
- **lucide-react** - Icon library

**Why these technologies?**
- **Next.js**: Server-side rendering, excellent performance, built-in routing, easy deployment
- **TypeScript**: Compile-time error checking, better IDE support, improved maintainability
- **Tailwind CSS**: Rapid UI development, consistent design system, responsive utilities
- **Leaflet**: Lightweight, open-source mapping library perfect for route visualization

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Backend API running on `http://localhost:3000` (see [backend README](../backend/README.md))

## 📦 Installation

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```

4. **Edit `.env.local`** if your backend is on a different port (see [Configuration](#configuration))

## ⚙️ Configuration

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:3000` |

**Note**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

The application will start on `http://localhost:3001` (Next.js default port).

Open [http://localhost:3001](http://localhost:3001) in your browser.

## 📁 Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout (metadata, providers)
│   ├── page.tsx            # Main page (quote form + history)
│   └── globals.css         # Global styles
├── components/
│   ├── QuoteForm.tsx       # Quote calculation form
│   ├── QuoteResult.tsx     # Quote result display with map
│   ├── QuoteHistory.tsx    # Quote history list
│   └── RouteMap.tsx        # Interactive route map
├── lib/
│   └── api.ts              # API client (axios wrapper)
├── data/
│   └── popularCities.ts    # Popular cities data (100+ cities)
├── public/
│   ├── flags/              # Country flag images
│   └── icons/              # Equipment type icons
├── .env.local              # Environment variables (not in git)
├── .env.local.example      # Environment variables template
├── package.json
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── README.md
```

## 🧩 Components

- **QuoteForm** (`components/QuoteForm.tsx`) - Form for creating quotes with origin/destination autocomplete, equipment type selection, weight input, and date picker
- **QuoteResult** (`components/QuoteResult.tsx`) - Displays calculated quote with distance, pricing breakdown, interactive map, and export functionality
- **QuoteHistory** (`components/QuoteHistory.tsx`) - Paginated list of all quotes with details view and export options
- **RouteMap** (`components/RouteMap.tsx`) - Interactive Leaflet map showing route between origin and destination with markers

## 🔌 API Integration

The frontend communicates with the backend API through the `api.ts` client.

**Location**: `lib/api.ts`

**Functions**:
- `createQuote(quote: QuoteRequest): Promise<Quote>` - Create new quote
- `getAllQuotes(page?: number, limit?: number): Promise<QuotesListResponse>` - Get all quotes
- `getQuoteById(id: number): Promise<Quote>` - Get quote by ID
- `healthCheck(): Promise<HealthResponse>` - Check API health

**Error Handling**:
- All API calls include error handling
- User-friendly error messages
- Network error detection
- Validation error display

## 🎨 Styling

### Tailwind CSS

The application uses Tailwind CSS 4 for styling:

- **Utility-first approach**: Rapid UI development
- **Responsive design**: Mobile-first breakpoints
- **Custom color scheme**: Professional brown/tan palette
- **Consistent spacing**: Tailwind spacing scale
- **Accessibility**: Focus states, ARIA labels

### Color Palette

```css
Primary: #4E3B31 (Dark Brown)
Secondary: #A67C52 (Medium Brown)
Accent: #C8A27A (Light Brown)
Background: #F7F3EF (Cream)
Highlight: #EBD9C3 (Light Cream)
```

### Responsive Breakpoints

- **Mobile**: Default (< 768px)
- **Tablet**: `md:` (≥ 768px)
- **Desktop**: `lg:` (≥ 1024px)

## 📘 TypeScript

All code is fully typed with TypeScript:

### Type Definitions

**Location**: `lib/api.ts`

```typescript
interface Location {
  city: string;
  postal_code?: string;
  state_province?: string;
  country: 'US' | 'CA' | 'MX';
}

interface QuoteRequest {
  origin: Location;
  destination: Location;
  equipment_type: 'dry_van' | 'reefer' | 'flatbed' | 'step_deck' | 'hotshot' | 'straight_truck';
  total_weight: number;
  pickup_date: string;
}

interface Quote {
  id: number;
  origin_city: string;
  destination_city: string;
  distance_miles: number;
  distance_kilometers: number;
  quote_amount: number;
  equipment_type: string;
  total_weight: number;
  pickup_date: string;
  created_at: string;
  origin_coordinates: { latitude: number; longitude: number };
  destination_coordinates: { latitude: number; longitude: number };
}
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Leaflet Documentation](https://leafletjs.com/)
- [react-leaflet Documentation](https://react-leaflet.js.org/)
---

For backend documentation, see [../backend/README.md](../backend/README.md)  
For main project documentation, see [../README.md](../README.md)
