import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatCurrency, getStatusColor, calculateCommission } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

async function getEvent(id: string) {
  return await prisma.event.findUnique({
    where: { id },
    include: {
      artist: true,
      venue: true,
      promoter: true,
      files: {
        orderBy: { createdAt: 'desc' },
      },
      invoices: {
        include: {
          payments: true,
        },
      },
    },
  });
}

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await getEvent(params.id);

  if (!event) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Event Not Found</h2>
          <Link href="/events">
            <Button className="mt-4">Back to Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  const commission = event.grossRevenue
    ? calculateCommission(event.grossRevenue, event.commissionPct)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/events">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{event.artist.name}</h1>
          <p className="mt-1 text-gray-600">
            {event.venue?.name || 'Venue TBD'} • {formatDate(event.dateStart)}
          </p>
        </div>
        <div className="flex gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-sm font-medium ${getStatusColor(
              event.bookingStatus
            )}`}
          >
            {event.bookingStatus}
          </span>
          {event.paymentStatus && (
            <span
              className={`rounded-full border px-3 py-1 text-sm font-medium ${getStatusColor(
                event.paymentStatus
              )}`}
            >
              {event.paymentStatus.replace(/_/g, ' ')}
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {event.grossRevenue ? formatCurrency(event.grossRevenue) : 'TBD'}
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">
              Commission ({event.commissionPct}%)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {formatCurrency(commission)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Event Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-base font-semibold">
              {new Date(event.dateStart).toLocaleTimeString('ro-RO', {
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              -
              {new Date(event.dateEnd).toLocaleTimeString('ro-RO', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
            <p className="text-sm text-gray-600">{formatDate(event.dateStart)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Artist</p>
              <p className="mt-1 text-base font-semibold">{event.artist.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Promoter</p>
              <p className="mt-1 text-base font-semibold">{event.promoter.name}</p>
            </div>
            {event.venue && (
              <div>
                <p className="text-sm font-medium text-gray-500">Venue</p>
                <div className="mt-1 flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-base font-semibold">{event.venue.name}</p>
                    {event.venue.address && (
                      <p className="text-sm text-gray-600">{event.venue.address}</p>
                    )}
                    {event.venue.city && (
                      <p className="text-sm text-gray-600">
                        {event.venue.city}, {event.venue.country}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            {event.notes && (
              <div>
                <p className="text-sm font-medium text-gray-500">Notes</p>
                <p className="mt-1 text-sm text-gray-700">{event.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['CONTRACT', 'FIRST_INVOICE', 'FINAL_INVOICE'].map((type) => {
                const file = event.files.find((f) => f.type === type);
                return (
                  <div
                    key={type}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {type.replace(/_/g, ' ')}
                      </p>
                      {file && (
                        <p className="text-xs text-gray-500">{file.filename}</p>
                      )}
                    </div>
                    {file ? (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">Not uploaded</span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {event.invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {event.invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{invoice.number}</p>
                    <p className="text-sm text-gray-600">
                      Due: {formatDate(invoice.dueDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(
                        invoice.status
                      )}`}
                    >
                      {invoice.status}
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(invoice.total, invoice.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
