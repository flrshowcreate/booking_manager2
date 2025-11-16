import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@flrshowcreate.ro' },
    update: {},
    create: {
      email: 'admin@flrshowcreate.ro',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Created admin user');

  // Create companies (promoters)
  const universalMusic = await prisma.company.create({
    data: {
      name: 'Universal Music România',
      type: 'PROMOTER',
      tags: ['major-label', 'international'],
    },
  });

  const manevtm = await prisma.company.create({
    data: {
      name: 'ManeleVTM Records',
      type: 'PROMOTER',
      tags: ['manele', 'local'],
    },
  });

  const defJam = await prisma.company.create({
    data: {
      name: 'Def Jam România',
      type: 'PROMOTER',
      tags: ['hip-hop', 'urban'],
    },
  });

  const externalPromoter = await prisma.company.create({
    data: {
      name: 'External Events SRL',
      type: 'PROMOTER',
      tags: ['external'],
    },
  });
  console.log('✅ Created companies');

  // Create artists
  const artists = await Promise.all([
    prisma.artist.create({
      data: {
        name: 'DJ Project',
        defaultCommissionPct: 10,
        tags: ['dance', 'pop'],
      },
    }),
    prisma.artist.create({
      data: {
        name: 'Smiley',
        defaultCommissionPct: 10,
        tags: ['pop', 'romanian'],
      },
    }),
    prisma.artist.create({
      data: {
        name: 'INNA',
        defaultCommissionPct: 10,
        tags: ['dance', 'international'],
      },
    }),
    prisma.artist.create({
      data: {
        name: 'Carla\'s Dreams',
        defaultCommissionPct: 10,
        tags: ['alternative', 'romanian'],
      },
    }),
    prisma.artist.create({
      data: {
        name: 'Delia',
        defaultCommissionPct: 10,
        tags: ['pop', 'romanian'],
      },
    }),
  ]);
  console.log('✅ Created artists');

  // Create venues
  const venues = await Promise.all([
    prisma.venue.create({
      data: {
        name: 'Sala Palatului',
        address: 'Strada Ion Campineanu 28',
        city: 'București',
        country: 'România',
        lat: 44.4370,
        lng: 26.0960,
        capacity: 4000,
      },
    }),
    prisma.venue.create({
      data: {
        name: 'Arenele Romane',
        address: 'Strada Ion Brezoianu 23-25',
        city: 'București',
        country: 'România',
        lat: 44.4423,
        lng: 26.0959,
        capacity: 6000,
      },
    }),
    prisma.venue.create({
      data: {
        name: 'Berăria H',
        address: 'Șoseaua Mihai Bravu 435-437',
        city: 'București',
        country: 'România',
        lat: 44.4123,
        lng: 26.1454,
        capacity: 1500,
      },
    }),
    prisma.venue.create({
      data: {
        name: 'Arena Națională',
        address: 'Strada Basarabia 37-39',
        city: 'București',
        country: 'România',
        lat: 44.4372,
        lng: 26.1527,
        capacity: 55000,
      },
    }),
    prisma.venue.create({
      data: {
        name: 'BT Arena',
        address: 'Strada Splaiul Independenței 291',
        city: 'Cluj-Napoca',
        country: 'România',
        lat: 46.7689,
        lng: 23.5895,
        capacity: 10000,
      },
    }),
  ]);
  console.log('✅ Created venues');

  // Create events
  const now = new Date();
  const events = [
    {
      artistId: artists[0].id,
      promoterId: universalMusic.id,
      venueId: venues[0].id,
      dateStart: new Date(now.getFullYear(), now.getMonth() + 1, 15, 20, 0),
      dateEnd: new Date(now.getFullYear(), now.getMonth() + 1, 15, 23, 0),
      bookingStatus: 'CONFIRMED' as const,
      paymentStatus: 'FIRST_INVOICE_PAID' as const,
      grossRevenue: 50000,
      commissionPct: 10,
      notes: 'VIP section available',
    },
    {
      artistId: artists[1].id,
      promoterId: manevtm.id,
      venueId: venues[1].id,
      dateStart: new Date(now.getFullYear(), now.getMonth() + 1, 20, 19, 0),
      dateEnd: new Date(now.getFullYear(), now.getMonth() + 1, 20, 22, 30),
      bookingStatus: 'CONFIRMED' as const,
      paymentStatus: 'ALL_PAID' as const,
      grossRevenue: 75000,
      commissionPct: 10,
    },
    {
      artistId: artists[2].id,
      promoterId: defJam.id,
      venueId: venues[2].id,
      dateStart: new Date(now.getFullYear(), now.getMonth(), 25, 21, 0),
      dateEnd: new Date(now.getFullYear(), now.getMonth(), 26, 0, 0),
      bookingStatus: 'CONFIRMED' as const,
      paymentStatus: 'CONTRACT_SIGNED' as const,
      grossRevenue: 40000,
      commissionPct: 10,
    },
    {
      artistId: artists[3].id,
      promoterId: universalMusic.id,
      venueId: venues[3].id,
      dateStart: new Date(now.getFullYear(), now.getMonth() + 2, 5, 20, 0),
      dateEnd: new Date(now.getFullYear(), now.getMonth() + 2, 5, 23, 30),
      bookingStatus: 'PENDING' as const,
      grossRevenue: 120000,
      commissionPct: 10,
      notes: 'Stadium concert - requires special permits',
    },
    {
      artistId: artists[4].id,
      promoterId: externalPromoter.id,
      venueId: venues[4].id,
      dateStart: new Date(now.getFullYear(), now.getMonth() + 1, 28, 19, 30),
      dateEnd: new Date(now.getFullYear(), now.getMonth() + 1, 28, 22, 0),
      bookingStatus: 'CONFIRMED' as const,
      paymentStatus: 'FIRST_INVOICE_PAID' as const,
      grossRevenue: 60000,
      commissionPct: 10,
    },
  ];

  for (const eventData of events) {
    await prisma.event.create({ data: eventData });
  }
  console.log('✅ Created events');

  // Create sample invoice
  const firstEvent = await prisma.event.findFirst({
    where: { grossRevenue: { not: null } },
  });

  if (firstEvent) {
    const invoice = await prisma.invoice.create({
      data: {
        eventId: firstEvent.id,
        number: 'INV-202501-0001',
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        currency: 'RON',
        subtotal: firstEvent.grossRevenue! * 0.1,
        vatPct: 19,
        total: firstEvent.grossRevenue! * 0.1 * 1.19,
        status: 'SENT',
      },
    });

    await prisma.invoiceLineItem.create({
      data: {
        invoiceId: invoice.id,
        description: 'Booking Commission',
        quantity: 1,
        unitPrice: firstEvent.grossRevenue! * 0.1,
        total: firstEvent.grossRevenue! * 0.1,
      },
    });

    console.log('✅ Created sample invoice');
  }

  console.log('🎉 Seed completed successfully!');
  console.log('\n📧 Login credentials:');
  console.log('   Email: admin@flrshowcreate.ro');
  console.log('   Password: admin123');
  console.log('\n⚠️  Remember to change these in production!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
