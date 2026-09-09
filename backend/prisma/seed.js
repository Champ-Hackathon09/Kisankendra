import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial KisanKendra data...');

  // 1. Create Centres
  const karnalCentre = await prisma.centre.upsert({
    where: { code: 'HR-KRN-01' },
    update: {},
    create: {
      name: 'Karnal APMC Grain Market Centre',
      code: 'HR-KRN-01',
      district: 'Karnal',
      state: 'Haryana',
      address: 'Near GT Road, New Grain Market, Karnal',
      capacityPerHour: 6,
      currentWaitMinutes: 18,
      operationalStatus: 'NORMAL',
    },
  });

  const sehoreCentre = await prisma.centre.upsert({
    where: { code: 'MP-SEH-01' },
    update: {},
    create: {
      name: 'Sehore Krishi Upaj Mandi',
      code: 'MP-SEH-01',
      district: 'Sehore',
      state: 'Madhya Pradesh',
      address: 'Bhopal-Indore Highway, Sehore',
      capacityPerHour: 5,
      currentWaitMinutes: 25,
      operationalStatus: 'NORMAL',
    },
  });

  // 2. Create Users (Farmer & Operator)
  const defaultPassword = await bcrypt.hash('123456', 10);

  const farmer = await prisma.user.upsert({
    where: { phone: '9876543210' },
    update: {},
    create: {
      name: 'Ramesh Kumar (Farmer)',
      phone: '9876543210',
      password: defaultPassword,
      role: 'FARMER',
      state: 'Haryana',
      district: 'Karnal',
      village: 'Taraori',
    },
  });

  const operator = await prisma.user.upsert({
    where: { phone: '9123456780' },
    update: {},
    create: {
      name: 'Suresh Verma (Mandi Operator)',
      phone: '9123456780',
      password: defaultPassword,
      role: 'OPERATOR',
      state: 'Haryana',
      district: 'Karnal',
      village: 'Karnal City',
    },
  });

  // 3. Seed a Demo Token
  await prisma.token.upsert({
    where: { tokenNumber: 'KK-2026-1001' },
    update: {},
    create: {
      tokenNumber: 'KK-2026-1001',
      farmerId: farmer.id,
      centreId: karnalCentre.id,
      cropType: 'Wheat (Gehu)',
      estimatedWeight: 45.5,
      vehicleNumber: 'HR-05-AB-1234',
      slotDate: new Date().toISOString().split('T')[0],
      slotTime: '10:00 AM - 11:00 AM',
      queuePosition: 1,
      estimatedWaitMinutes: 15,
      status: 'BOOKED',
    },
  });

  console.log('Seed completed successfully!');
  console.log('Demo Farmer Login: Phone 9876543210 | Password 123456');
  console.log('Demo Operator Login: Phone 9123456780 | Password 123456');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
