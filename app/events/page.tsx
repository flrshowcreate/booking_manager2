import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils';
import { Plus } from 'lucide-react';

async function getEvents() {
  return await prisma.event.findMany({
    include: {
      artist: true,
      venue: true,
      promoter: true,
    },
    orderBy: {
      dateStart: 'desc',
    },
  });
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="mt-2 text-gray-600">Manage all your bookings</p>
        </div>
        <Link href="/events/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Event
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="block rounded-lg border p-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {event.artist.name}
                      </h3>
                      <span
                        className={`rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(
                          event.bookingStatus
                        )}`}
                      >
                        {event.bookingStatus}
                      </span>
                      {event.paymentStatus && (
                        <span
                          className={`rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(
                            event.paymentStatus
                          )}`}
                        >
                          {event.paymentStatus.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                      <span>{formatDate(event.dateStart)}</span>
                      <span>•</span>
                      <span>{event.venue?.name || 'Venue TBD'}</span>
                      <span>•</span>
                      <span>{event.venue?.city || 'Location TBD'}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Promoter: {event.promoter.name}
                    </div>
                  </div>
                  <div className="text-right">
                    {event.grossRevenue && (
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(event.grossRevenue)}
                      </div>
                    )}
                    {event.commissionPct && event.grossRevenue && (
                      <div className="text-sm text-gray-600">
                        Commission: {formatCurrency((event.grossRevenue * event.commissionPct) / 100)}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
            {events.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-gray-600">No events found</p>
                <Link href="/events/new">
                  <Button className="mt-4">Create your first event</Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
