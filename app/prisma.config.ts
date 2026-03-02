import 'dotenv/config';
import path from 'node:path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: `tsx ${path.join(__dirname, 'prisma', 'seed.ts')}`,
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
