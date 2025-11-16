import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkEventOverlap } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const artistId = searchParams.get('artistId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {};

    if (artistId) where.artistId = artistId;
    if (status) where.bookingStatus = status;
    if (startDate) {
      where.dateStart = { ...where.dateStart, gte: new Date(startDate) };
    }
    if (endDate) {
      where.dateEnd = { ...where.dateEnd, lte: new Date(endDate) };
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        artist: true,
        venue: true,
        promoter: true,
      },
      orderBy: {
        dateStart: 'desc',
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check for double booking
    if (body.artistId && body.dateStart && body.dateEnd) {
      const existingEvents = await prisma.event.findMany({
        where: {
          artistId: body.artistId,
          bookingStatus: { not: 'CANCELLED' },
        },
      });

      for (const existing of existingEvents) {
        if (
          checkEventOverlap(
            { dateStart: new Date(body.dateStart), dateEnd: new Date(body.dateEnd) },
            { dateStart: existing.dateStart, dateEnd: existing.dateEnd }
          )
        ) {
          if (!body.overrideReason) {
            return NextResponse.json(
              {
                error: 'DOUBLE_BOOKING',
                message: 'Artist has overlapping event',
                conflictingEvent: existing,
              },
              { status: 409 }
            );
          }
        }
      }
    }

    const event = await prisma.event.create({
      data: {
        ...body,
        dateStart: new Date(body.dateStart),
        dateEnd: new Date(body.dateEnd),
      },
      include: {
        artist: true,
        venue: true,
        promoter: true,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Failed to create event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
