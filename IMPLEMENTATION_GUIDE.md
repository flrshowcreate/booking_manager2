# Implementation Guide - Booking Manager v3.0

This guide covers implementing the remaining features and extending the application.

## Table of Contents

1. [File Upload Implementation](#file-upload-implementation)
2. [Google Maps Integration](#google-maps-integration)
3. [PDF Generation](#pdf-generation)
4. [Email System](#email-system)
5. [Public Widgets](#public-widgets)
6. [Advanced Features](#advanced-features)

---

## File Upload Implementation

### Setting Up Supabase Storage

1. **Create Supabase Project**
   ```bash
   # Install Supabase client
   npm install @supabase/supabase-js
   ```

2. **Configure Storage**
   ```typescript
   // lib/supabase.ts
   import { createClient } from '@supabase/supabase-js';

   export const supabase = createClient(
     process.env.STORAGE_ENDPOINT!,
     process.env.SUPABASE_KEY!
   );
   ```

3. **File Upload Component**
   ```typescript
   // components/file-upload.tsx
   'use client';

   import { useState } from 'react';
   import { supabase } from '@/lib/supabase';

   export function FileUpload({ eventId, fileType, onUpload }: Props) {
     async function handleUpload(file: File) {
       const path = `events/${eventId}/${fileType}/${file.name}`;
       
       const { data, error } = await supabase.storage
         .from('event-files')
         .upload(path, file);

       if (error) throw error;

       const { data: { publicUrl } } = supabase.storage
         .from('event-files')
         .getPublicUrl(path);

       await fetch('/api/event-files', {
         method: 'POST',
         body: JSON.stringify({
           eventId,
           type: fileType,
           url: publicUrl,
           filename: file.name,
           mimeType: file.type,
           size: file.size,
         }),
       });

       onUpload();
     }

     return (
       <input
         type="file"
         accept=".pdf,.jpg,.jpeg,.png"
         onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
       />
     );
   }
   ```

4. **API Route for File Metadata**
   ```typescript
   // app/api/event-files/route.ts
   import { prisma } from '@/lib/prisma';
   import { getServerSession } from 'next-auth';

   export async function POST(request: Request) {
     const session = await getServerSession();
     const body = await request.json();

     const file = await prisma.eventFile.create({
       data: {
         ...body,
         uploadedBy: session.user.id,
       },
     });

     return Response.json(file);
   }
   ```

---

## Google Maps Integration

### Location Picker Component

1. **Install Google Maps Loader**
   ```bash
   npm install @googlemaps/js-api-loader
   ```

2. **Create Location Picker**
   ```typescript
   // components/location-picker.tsx
   'use client';

   import { useEffect, useRef, useState } from 'react';
   import { Loader } from '@googlemaps/js-api-loader';

   interface Location {
     name: string;
     address: string;
     lat: number;
     lng: number;
     placeId: string;
   }

   export function LocationPicker({ onSelect }: { onSelect: (loc: Location) => void }) {
     const mapRef = useRef<HTMLDivElement>(null);
     const inputRef = useRef<HTMLInputElement>(null);
     const [map, setMap] = useState<google.maps.Map>();

     useEffect(() => {
       const loader = new Loader({
         apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
         version: 'weekly',
         libraries: ['places'],
       });

       loader.load().then(() => {
         if (!mapRef.current) return;

         const map = new google.maps.Map(mapRef.current, {
           center: { lat: 44.4268, lng: 26.1025 }, // Bucharest
           zoom: 13,
         });

         const autocomplete = new google.maps.places.Autocomplete(inputRef.current!);
         autocomplete.bindTo('bounds', map);

         autocomplete.addListener('place_changed', () => {
           const place = autocomplete.getPlace();

           if (!place.geometry?.location) return;

           map.setCenter(place.geometry.location);
           map.setZoom(15);

           new google.maps.Marker({
             map,
             position: place.geometry.location,
           });

           onSelect({
             name: place.name || '',
             address: place.formatted_address || '',
             lat: place.geometry.location.lat(),
             lng: place.geometry.location.lng(),
             placeId: place.place_id || '',
           });
         });

         setMap(map);
       });
     }, []);

     return (
       <div className="space-y-4">
         <input
           ref={inputRef}
           type="text"
           placeholder="Search for a location..."
           className="w-full rounded-md border p-2"
         />
         <div ref={mapRef} className="h-96 rounded-md" />
       </div>
     );
   }
   ```

3. **Usage in Event Form**
   ```typescript
   <LocationPicker
     onSelect={(location) => {
       setFormData({
         ...formData,
         venueName: location.name,
         venueAddress: location.address,
         venueLat: location.lat,
         venueLng: location.lng,
       });
     }}
   />
   ```

---

## PDF Generation

### Invoice PDF Generator

1. **Create PDF Template**
   ```typescript
   // lib/pdf/invoice-template.tsx
   import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

   const styles = StyleSheet.create({
     page: { padding: 40, fontSize: 11 },
     header: { fontSize: 20, marginBottom: 20, fontWeight: 'bold' },
     section: { marginBottom: 15 },
     row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
     table: { marginTop: 20 },
     tableHeader: { backgroundColor: '#f0f0f0', padding: 8, fontWeight: 'bold' },
   });

   export const InvoiceTemplate = ({ invoice, event }: Props) => (
     <Document>
       <Page size="A4" style={styles.page}>
         <View style={styles.header}>
           <Text>Invoice {invoice.number}</Text>
         </View>

         <View style={styles.section}>
           <Text>Date: {new Date(invoice.issueDate).toLocaleDateString()}</Text>
           <Text>Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</Text>
         </View>

         <View style={styles.section}>
           <Text style={{ fontWeight: 'bold' }}>Bill To:</Text>
           <Text>{event.promoter.name}</Text>
         </View>

         <View style={styles.table}>
           <View style={[styles.row, styles.tableHeader]}>
             <Text style={{ flex: 2 }}>Description</Text>
             <Text style={{ flex: 1, textAlign: 'right' }}>Amount</Text>
           </View>
           {invoice.lineItems.map((item) => (
             <View key={item.id} style={styles.row}>
               <Text style={{ flex: 2 }}>{item.description}</Text>
               <Text style={{ flex: 1, textAlign: 'right' }}>
                 {item.total.toFixed(2)} {invoice.currency}
               </Text>
             </View>
           ))}
         </View>

         <View style={[styles.row, { marginTop: 20, fontWeight: 'bold' }]}>
           <Text>Total:</Text>
           <Text>{invoice.total.toFixed(2)} {invoice.currency}</Text>
         </View>
       </Page>
     </Document>
   );
   ```

2. **Generate PDF API**
   ```typescript
   // app/api/invoices/[id]/pdf/route.ts
   import { prisma } from '@/lib/prisma';
   import { pdf } from '@react-pdf/renderer';
   import { InvoiceTemplate } from '@/lib/pdf/invoice-template';

   export async function GET(
     request: Request,
     { params }: { params: { id: string } }
   ) {
     const invoice = await prisma.invoice.findUnique({
       where: { id: params.id },
       include: {
         lineItems: true,
         event: { include: { artist: true, promoter: true } },
       },
     });

     if (!invoice) {
       return new Response('Not found', { status: 404 });
     }

     const doc = <InvoiceTemplate invoice={invoice} event={invoice.event} />;
     const blob = await pdf(doc).toBlob();

     return new Response(blob, {
       headers: {
         'Content-Type': 'application/pdf',
         'Content-Disposition': `attachment; filename="invoice-${invoice.number}.pdf"`,
       },
     });
   }
   ```

---

## Email System

### Resend Integration

1. **Create Email Templates**
   ```typescript
   // lib/email/templates.ts
   export const emailTemplates = {
     contractSigned: (event: Event) => ({
       subject: `Contract signed for ${event.artist.name}`,
       html: `
         <h1>Contract Signed</h1>
         <p>The contract for ${event.artist.name} at ${event.venue.name} has been signed.</p>
         <p>Event Date: ${new Date(event.dateStart).toLocaleDateString()}</p>
       `,
     }),

     invoiceDue: (invoice: Invoice) => ({
       subject: `Invoice ${invoice.number} is due`,
       html: `
         <h1>Invoice Due</h1>
         <p>Invoice ${invoice.number} is due on ${new Date(invoice.dueDate).toLocaleDateString()}.</p>
         <p>Amount: ${invoice.total} ${invoice.currency}</p>
       `,
     }),
   };
   ```

2. **Send Email Function**
   ```typescript
   // lib/email/send.ts
   import { Resend } from 'resend';

   const resend = new Resend(process.env.RESEND_API_KEY);

   export async function sendEmail({
     to,
     subject,
     html,
   }: {
     to: string;
     subject: string;
     html: string;
   }) {
     await resend.emails.send({
       from: process.env.EMAIL_FROM!,
       to,
       subject,
       html,
     });
   }
   ```

3. **Trigger Emails**
   ```typescript
   // In your API routes
   import { sendEmail } from '@/lib/email/send';
   import { emailTemplates } from '@/lib/email/templates';

   // When contract is signed
   await sendEmail({
     to: 'admin@flrshowcreate.ro',
     ...emailTemplates.contractSigned(event),
   });
   ```

---

## Public Widgets

### Confirmed Shows API

```typescript
// app/api/public/confirmed-shows/route.ts
import { prisma } from '@/lib/prisma';

export async function GET() {
  const events = await prisma.event.findMany({
    where: {
      bookingStatus: 'CONFIRMED',
      dateStart: { gte: new Date() },
    },
    include: {
      artist: { select: { name: true } },
      venue: { select: { name: true, city: true } },
    },
    orderBy: { dateStart: 'asc' },
    take: 50,
  });

  return Response.json(events);
}
```

### Embeddable Widget

```html
<!-- public/widget.js -->
<script>
  (function() {
    async function loadShows() {
      const response = await fetch('https://your-domain.com/api/public/confirmed-shows');
      const shows = await response.json();
      
      const container = document.getElementById('booking-widget');
      container.innerHTML = shows.map(show => `
        <div class="show-item">
          <h3>${show.artist.name}</h3>
          <p>${new Date(show.dateStart).toLocaleDateString()} - ${show.venue.name}, ${show.venue.city}</p>
        </div>
      `).join('');
    }
    
    loadShows();
  })();
</script>
```

### Usage

```html
<div id="booking-widget"></div>
<script src="https://your-domain.com/widget.js"></script>
```

---

## Advanced Features

### Task Auto-Shifting

When event date changes, update linked tasks:

```typescript
// lib/task-utils.ts
export async function updateTasksDueDate(
  eventId: string,
  oldDate: Date,
  newDate: Date
) {
  const deltaDays = Math.floor(
    (newDate.getTime() - oldDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const tasks = await prisma.task.findMany({
    where: { eventId, dueDate: { not: null } },
  });

  for (const task of tasks) {
    const newDueDate = new Date(task.dueDate!);
    newDueDate.setDate(newDueDate.getDate() + deltaDays);

    await prisma.task.update({
      where: { id: task.id },
      data: { dueDate: newDueDate },
    });
  }
}
```

### Exclusivity Radius Check

```typescript
// lib/exclusivity.ts
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function checkExclusivityRadius(
  eventId: string,
  date: Date,
  lat: number,
  lng: number,
  radiusKm: number,
  days: number
) {
  const startDate = new Date(date);
  startDate.setDate(startDate.getDate() - days);
  
  const endDate = new Date(date);
  endDate.setDate(endDate.getDate() + days);

  const nearbyEvents = await prisma.event.findMany({
    where: {
      id: { not: eventId },
      dateStart: { gte: startDate, lte: endDate },
      venue: {
        lat: { not: null },
        lng: { not: null },
      },
    },
    include: { venue: true, artist: true },
  });

  return nearbyEvents.filter(event => {
    const distance = calculateDistance(
      lat,
      lng,
      event.venue!.lat!,
      event.venue!.lng!
    );
    return distance <= radiusKm;
  });
}
```

---

## Testing

### Cypress Tests

```typescript
// cypress/e2e/events.cy.ts
describe('Events', () => {
  it('creates a new event', () => {
    cy.visit('/events/new');
    cy.get('[name="artistId"]').select('DJ Project');
    cy.get('[name="promoterId"]').select('Universal Music România');
    cy.get('[name="dateStart"]').type('2025-03-15T20:00');
    cy.get('[name="dateEnd"]').type('2025-03-15T23:00');
    cy.get('[name="grossRevenue"]').type('50000');
    cy.get('button[type="submit"]').click();
    
    cy.url().should('include', '/events/');
    cy.contains('DJ Project');
  });

  it('uploads files', () => {
    cy.visit('/events/event-id');
    cy.get('input[type="file"]').first().selectFile('contract.pdf');
    cy.contains('contract.pdf');
  });
});
```

---

## Next Steps

1. **Authentication**: Implement full NextAuth setup with role-based access
2. **Notifications**: Add real-time notifications for status changes
3. **Analytics**: Add charts for revenue trends and booking rates
4. **Mobile App**: Consider React Native version
5. **API Documentation**: Generate OpenAPI/Swagger docs

---

For questions or support, contact support@flrshowcreate.ro
