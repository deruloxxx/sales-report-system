import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // パスワードハッシュ生成
  const passwordHash = await bcrypt.hash('Test1234', 10);

  // 1. 営業マスタ（上長 → 営業担当の順で作成）
  const tanaka = await prisma.salesStaff.create({
    data: {
      name: '田中太郎',
      email: 'tanaka@example.com',
      passwordHash,
      department: '営業部',
      position: '課長',
      managerId: null,
    },
  });

  const suzuki = await prisma.salesStaff.create({
    data: {
      name: '鈴木花子',
      email: 'suzuki@example.com',
      passwordHash,
      department: '営業部',
      position: '担当',
      managerId: tanaka.id,
    },
  });

  const sato = await prisma.salesStaff.create({
    data: {
      name: '佐藤次郎',
      email: 'sato@example.com',
      passwordHash,
      department: '営業部',
      position: '担当',
      managerId: tanaka.id,
    },
  });

  // 2. 顧客マスタ
  const customerA = await prisma.customer.create({
    data: {
      name: 'テスト株式会社A',
      address: '東京都千代田区1-1-1',
      phone: '03-1234-5678',
      salesStaffId: suzuki.id,
    },
  });

  const customerB = await prisma.customer.create({
    data: {
      name: 'テスト株式会社B',
      address: '東京都港区2-2-2',
      phone: '03-2345-6789',
      salesStaffId: suzuki.id,
    },
  });

  const customerC = await prisma.customer.create({
    data: {
      name: 'テスト株式会社C',
      address: '東京都新宿区3-3-3',
      phone: '03-3456-7890',
      salesStaffId: sato.id,
    },
  });

  // 3. 日報（鈴木花子の日報）
  const report1 = await prisma.dailyReport.create({
    data: {
      salesStaffId: suzuki.id,
      reportDate: new Date('2026-03-01'),
      status: 'submitted',
      problem: '提案資料の準備が遅れている',
      plan: '明日中に提案資料を完成させる',
    },
  });

  // 4. 訪問記録
  await prisma.visitRecord.create({
    data: {
      dailyReportId: report1.id,
      customerId: customerA.id,
      visitContent: '新規サービスの提案を実施。先方は前向きに検討中。',
    },
  });

  await prisma.visitRecord.create({
    data: {
      dailyReportId: report1.id,
      customerId: customerB.id,
      visitContent: '契約更新の打ち合わせ。来月中に更新予定。',
    },
  });

  // 5. 上長コメント
  await prisma.managerComment.create({
    data: {
      dailyReportId: report1.id,
      commenterId: tanaka.id,
      commentBody: '提案資料の件、サポートが必要なら声をかけてください。',
    },
  });

  console.log('Seed data created successfully');
  console.log({
    salesStaffs: [tanaka.name, suzuki.name, sato.name],
    customers: [customerA.name, customerB.name, customerC.name],
    dailyReports: 1,
    visitRecords: 2,
    managerComments: 1,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
