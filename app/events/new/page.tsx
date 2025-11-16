'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [artists, setArtists] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [promoters, setPromoters] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    artistId: '',
    promoterId: '',
    venueId: '',
    dateStart: '',
    dateEnd: '',
    bookingStatus: 'PENDING',
    paymentStatus: '',
    grossRevenue: '',
    commissionPct: '10',
    notes: '',
  });

  useEffect(() => {
    fetchFormData();
  }, []);

  async function fetchFormData() {
    try {
      const [artistsRes, venuesRes, promotersRes] = await Promise.all([
        fetch('/api/artists'),
        fetch('/api/venues'),
        fetch('/api/companies?type=PROMOTER'),
      ]);

      const [artistsData, venuesData, promotersData] = await Promise.all([
        artistsRes.json(),
        venuesRes.json(),
        promotersRes.json(),
      ]);

      setArtists(artistsData);
      setVenues(venuesData);
      setPromoters(promotersData);
    } catch (error) {
      console.error('Failed to fetch form data:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          grossRevenue: formData.grossRevenue ? parseFloat(formData.grossRevenue) : null,
          commissionPct: parseFloat(formData.commissionPct),
          paymentStatus: formData.paymentStatus || null,
        }),
      });

      if (response.status === 409) {
        const data = await response.json();
        if (data.error === 'DOUBLE_BOOKING') {
          const confirmed = window.confirm(
            `Warning: ${data.message}\n\nConflicting event: ${data.conflictingEvent.artist.name}\n\nDo you want to override?`
          );

          if (confirmed) {
            const reason = window.prompt('Please provide a reason for the override:');
            if (reason) {
              await handleSubmit(e); // Retry with override
              return;
            }
          }
          setLoading(false);
          return;
        }
      }

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      const event = await response.json();
      router.push(`/events/${event.id}`);
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('Failed to create event. Please try again.');
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">New Event</h1>
        <p className="mt-2 text-gray-600">Create a new booking</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="artistId">Artist *</Label>
                <select
                  id="artistId"
                  name="artistId"
                  value={formData.artistId}
                  onChange={handleChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select artist...</option>
                  {artists.map((artist) => (
                    <option key={artist.id} value={artist.id}>
                      {artist.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="promoterId">Promoter *</Label>
                <select
                  id="promoterId"
                  name="promoterId"
                  value={formData.promoterId}
                  onChange={handleChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select promoter...</option>
                  {promoters.map((promoter) => (
                    <option key={promoter.id} value={promoter.id}>
                      {promoter.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venueId">Venue</Label>
                <select
                  id="venueId"
                  name="venueId"
                  value={formData.venueId}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select venue...</option>
                  {venues.map((venue) => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name} - {venue.city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bookingStatus">Booking Status *</Label>
                <select
                  id="bookingStatus"
                  name="bookingStatus"
                  value={formData.bookingStatus}
                  onChange={handleChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateStart">Start Date & Time *</Label>
                <Input
                  id="dateStart"
                  name="dateStart"
                  type="datetime-local"
                  value={formData.dateStart}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateEnd">End Date & Time *</Label>
                <Input
                  id="dateEnd"
                  name="dateEnd"
                  type="datetime-local"
                  value={formData.dateEnd}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grossRevenue">Gross Revenue (RON)</Label>
                <Input
                  id="grossRevenue"
                  name="grossRevenue"
                  type="number"
                  step="0.01"
                  value={formData.grossRevenue}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="commissionPct">Commission (%)</Label>
                <Input
                  id="commissionPct"
                  name="commissionPct"
                  type="number"
                  step="0.01"
                  value={formData.commissionPct}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <select
                  id="paymentStatus"
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Not set</option>
                  <option value="CONTRACT_SIGNED">Contract Signed</option>
                  <option value="FIRST_INVOICE_PAID">First Invoice Paid</option>
                  <option value="ALL_PAID">All Paid</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Additional notes about this event..."
              />
            </div>

            {formData.grossRevenue && formData.commissionPct && (
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm font-medium text-blue-900">
                  Commission Amount:{' '}
                  {new Intl.NumberFormat('ro-RO', {
                    style: 'currency',
                    currency: 'RON',
                  }).format((parseFloat(formData.grossRevenue) * parseFloat(formData.commissionPct)) / 100)}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Event'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
