import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, calculateCommission } from '@/lib/utils';
import { Calendar, DollarSign, FileText, TrendingUp } from 'lucide-react';

async function getDashboardData() {
  const [events, invoices] = await Promise.all([
    prisma.event.findMany({
      include: {
        artist: true,
        venue: true,
      },
    }),
    prisma.invoice.findMany({
      where: {
        status: 'OVERDUE',
      },
    }),
  ]);

  const pendingEvents = events.filter((e) => e.bookingStatus === 'PENDING').length;
  const confirmedEvents = events.filter((e) => e.bookingStatus === 'CONFIRMED').length;
  const cancelledEvents = events.filter((e) => e.bookingStatus === 'CANCELLED').length;

  const totalRevenue = events.reduce((sum, e) => sum + (e.grossRevenue || 0), 0);
  const totalCommission = events.reduce(
    (sum, e) => sum + calculateCommission(e.grossRevenue || 0, e.commissionPct),
    0
  );

  const unsignedContracts = events.filter(
    (e) => !e.paymentStatus || e.paymentStatus === 'CONTRACT_SIGNED'
  ).length;

  return {
    pendingEvents,
    confirmedEvents,
    cancelledEvents,
    totalRevenue,
    totalCommission,
    overdueInvoices: invoices.length,
    unsignedContracts,
    recentEvents: events.slice(0, 5),
  };
}

export default async function Dashboard() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Overview of your booking management system
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.confirmedEvents}</div>
            <p className="text-xs text-muted-foreground">
              {data.pendingEvents} pending, {data.cancelledEvents} cancelled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">From all events</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">
              Total Commission
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {formatCurrency(data.totalCommission)}
            </div>
            <p className="text-xs text-blue-700">
              10% of gross revenue (default)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Items</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data.overdueInvoices}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.unsignedContracts} unsigned contracts
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between border-b pb-3 last:border-0"
              >
                <div>
                  <p className="font-medium">{event.artist.name}</p>
                  <p className="text-sm text-gray-600">
                    {event.venue?.name || 'TBD'} •{' '}
                    {new Date(event.dateStart).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      event.bookingStatus === 'CONFIRMED'
                        ? 'bg-green-100 text-green-800'
                        : event.bookingStatus === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {event.bookingStatus}
                  </span>
                  {event.grossRevenue && (
                    <span className="text-sm font-medium">
                      {formatCurrency(event.grossRevenue)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
