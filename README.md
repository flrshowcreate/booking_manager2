# Booking Manager v3.0

A production-ready booking management system for music events, built for FLR Show Create SRL.

## Features

- **Dashboard**: KPIs including confirmed events, total revenue, **total commission** (10% default), and overdue items
- **Calendar**: Month and week views with clickable, color-coded event pills
- **Events Management**: CRUD operations with dual status tracking (Booking + Payment)
- **Google Maps Integration**: Location picker with Places Autocomplete
- **Document Management**: Three file uploads per event (Contract, First Invoice, Final Invoice)
- **Finance**: Invoice creation, payment tracking, commission calculations
- **Contacts**: Companies, people, and venue management
- **Double-Booking Protection**: Warns on artist overlaps with override option
- **Public Widgets**: Confirmed shows JSON endpoint and booking request form

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Calendar**: FullCalendar React
- **Backend**: Next.js API routes with Prisma ORM
- **Database**: PostgreSQL (Supabase or Neon recommended)
- **Auth**: NextAuth with credentials provider
- **Maps**: Google Maps JavaScript API + Places
- **Storage**: S3-compatible (Supabase Storage)
- **PDF**: @react-pdf/renderer for invoices

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Google Maps API key
- `STORAGE_ENDPOINT`: S3-compatible storage URL
- `RESEND_API_KEY`: Email service API key

### 3. Initialize Database

```bash
# Push schema to database
npx prisma db push

# Seed with sample data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Database Schema

### Core Models

- **Event**: Main booking entity with dual status tracking
  - `bookingStatus`: PENDING | CONFIRMED | CANCELLED
  - `paymentStatus`: CONTRACT_SIGNED | FIRST_INVOICE_PAID | ALL_PAID
  - `commissionPct`: Default 10%
  - `grossRevenue`: Event revenue
  - Relationships: Artist, Venue, Promoter, Files, Invoices

- **Artist**: Musicians/performers
- **Venue**: Event locations with geocoding
- **Company**: Promoters and other businesses
- **Contact**: People associated with companies
- **EventFile**: Three types per event (CONTRACT, FIRST_INVOICE, FINAL_INVOICE)
- **Invoice**: With line items and payment tracking
- **Task**: To-dos linked to events (auto-shift when event date changes)

## Key Features

### Commission Calculation

Default 10% commission is calculated from `grossRevenue` × `commissionPct`:

```typescript
const commission = (event.grossRevenue * event.commissionPct) / 100;
```

Dashboard shows **Total Commission** across all events.

### Double-Booking Detection

When creating/editing events, the system checks for overlapping dates for the same artist:

```typescript
if (overlap && !overrideReason) {
  return { error: 'DOUBLE_BOOKING', conflictingEvent };
}
```

Allows override with a required reason field.

### File Upload Workflow

Each event supports exactly three document types:
1. **Contract** (PDF/Image)
2. **First Invoice** (PDF/Image)
3. **Final Invoice** (PDF/Image)

Files are uploaded to S3-compatible storage with secure signed URLs for preview.

### Calendar Views

- **Month View**: Shows all events with compact pills
- **Week View**: Detailed daily schedule
- Events color-coded by `bookingStatus`:
  - 🟡 Pending (Yellow)
  - 🟢 Confirmed (Green)
  - 🔴 Cancelled (Red)

## API Routes

### Events

- `GET /api/events` - List all events with filters
- `POST /api/events` - Create new event (with double-booking check)
- `GET /api/events/[id]` - Get single event
- `PATCH /api/events/[id]` - Update event
- `DELETE /api/events/[id]` - Delete event

### Public Endpoints

- `GET /api/public/confirmed-shows` - JSON feed of confirmed events
- `POST /api/public/booking-request` - Accept booking requests

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Database Hosting

Recommended providers:
- **Supabase** (includes storage)
- **Neon** (serverless PostgreSQL)
- **Railway**

### Storage

Use Supabase Storage or any S3-compatible service (AWS S3, Cloudflare R2, etc.)

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:push      # Push schema changes
npm run db:seed      # Seed sample data
npm run db:studio    # Open Prisma Studio
npm run test         # Run Cypress tests
```

## Google Maps Setup

1. Create a project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable APIs:
   - Maps JavaScript API
   - Places API
3. Create API key and add to `.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
4. Restrict key to your domain in production

## Default Credentials (Seed Data)

After running `npm run db:seed`:

- Email: `admin@flrshowcreate.ro`
- Password: `admin123`

**⚠️ Change these in production!**

## Customization

### Commission Rate

Change default in:
1. `.env`: `DEFAULT_COMMISSION_PCT=10`
2. Prisma schema: `defaultCommissionPct Float @default(10.0)`
3. Database: Update existing artists

### Status Options

Edit enums in `prisma/schema.prisma`:

```prisma
enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  // Add more...
}
```

Then run `npx prisma db push`

## Testing

Cypress tests cover:
- Event creation
- File uploads
- Status changes
- Invoice generation

```bash
npm run test          # Open Cypress UI
npm run test:headless # Run in CI mode
```

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
npx prisma db pull
```

### File Upload Errors

Check:
- Storage endpoint is correct
- Storage bucket exists
- API keys are valid

### Calendar Not Loading

Verify:
- Events API returns data: `curl http://localhost:3000/api/events`
- FullCalendar plugins are installed

## Support

For issues or questions:
- GitHub Issues: [your-repo/issues](https://github.com/your-repo/issues)
- Email: support@flrshowcreate.ro

## License

Proprietary - All rights reserved by FLR Show Create SRL

---

Built with ❤️ for the music industry by System One Software
