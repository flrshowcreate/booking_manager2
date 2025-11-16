'use client';

import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  className: string;
  extendedProps: {
    artistName: string;
    venueName: string;
    bookingStatus: string;
    paymentStatus: string | null;
  };
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();

      const calendarEvents = data.map((event: any) => ({
        id: event.id,
        title: event.artist.name,
        start: event.dateStart,
        end: event.dateEnd,
        className: `event-${event.bookingStatus.toLowerCase()}`,
        extendedProps: {
          artistName: event.artist.name,
          venueName: event.venue?.name || 'TBD',
          bookingStatus: event.bookingStatus,
          paymentStatus: event.paymentStatus,
        },
      }));

      setEvents(calendarEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleEventClick(info: any) {
    router.push(`/events/${info.event.id}`);
  }

  function handleDateClick(info: any) {
    router.push(`/events/new?date=${info.dateStr}`);
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg">Loading calendar...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="mt-2 text-gray-600">View and manage your bookings</p>
        </div>
        <Button onClick={() => router.push('/events/new')}>New Event</Button>
      </div>

      <Card className="p-6">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek',
          }}
          events={events}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          height="auto"
          eventDisplay="block"
          displayEventTime={true}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false,
          }}
        />
      </Card>

      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-yellow-200 border-l-4 border-yellow-500" />
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-green-200 border-l-4 border-green-500" />
          <span>Confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-red-200 border-l-4 border-red-500" />
          <span>Cancelled</span>
        </div>
      </div>
    </div>
  );
}
