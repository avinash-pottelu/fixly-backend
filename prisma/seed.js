const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const services = [
  {
    name: 'Electrician',
    category: 'ELECTRICIAN',
    description: 'Professional electrical services including wiring, repairs, installations, and safety inspections.',
    icon: '⚡',
  },
  {
    name: 'Plumber',
    category: 'PLUMBER',
    description: 'Expert plumbing services for leak repairs, pipe installations, drain cleaning, and water heaters.',
    icon: '🔧',
  },
  {
    name: 'Carpenter',
    category: 'CARPENTER',
    description: 'Skilled carpentry for furniture assembly, custom woodwork, door/window repairs, and installations.',
    icon: '🪚',
  },
  {
    name: 'Painter',
    category: 'PAINTER',
    description: 'Professional interior and exterior painting services with quality finishes.',
    icon: '🎨',
  },
  {
    name: 'Cleaner',
    category: 'CLEANER',
    description: 'Thorough home and office cleaning services, including deep cleaning and move-in/out cleaning.',
    icon: '🧹',
  },
  {
    name: 'AC Repair',
    category: 'AC_REPAIR',
    description: 'AC installation, servicing, repair, and maintenance for all brands and models.',
    icon: '❄️',
  },
  {
    name: 'Appliance Repair',
    category: 'APPLIANCE_REPAIR',
    description: 'Repair and maintenance of home appliances including washing machines, refrigerators, and ovens.',
    icon: '🔌',
  },
  {
    name: 'Home Maintenance',
    category: 'HOME_MAINTENANCE',
    description: 'General home maintenance, handyman services, and minor repairs for all your home needs.',
    icon: '🏠',
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  for (const service of services) {
    await prisma.service.upsert({
      where: { category: service.category },
      update: {},
      create: service,
    });
  }

  // Create default admin
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@Fixly2024', 12);

  await prisma.user.upsert({
    where: { email: 'admin@fixly.com' },
    update: {},
    create: {
      full_name: 'Fixly Admin',
      email: 'admin@fixly.com',
      password: hashedPassword,
      role: 'ADMIN',
      phone: '+91-0000000000',
    },
  });

  console.log('✅ Seeding complete!');
  console.log('📧 Admin: admin@fixly.com');
  console.log('🔐 Password: Admin@Fixly2024 (change immediately in production)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
