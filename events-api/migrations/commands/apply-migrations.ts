import 'dotenv/config';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { argv, exit } from 'node:process';
import { drizzle } from 'drizzle-orm/libsql';
import { sql } from 'drizzle-orm';

const db = drizzle(process.env.DB_FILE_NAME ?? '');

// db.$client.execute

async function bootstrap() {
  const allowedCommands = ['--up', '--down'];

  const args = argv.slice(2);

  const command = args.at(0);
  if (!command) {
    console.error('No command provided');
    exit(1);
  }

  if (!allowedCommands.includes(command)) {
    console.error('Invalid command provided');
    exit(1);
  }

  await runMigrations(command === '--up' ? 'up' : 'down');
}

bootstrap();

async function runMigrations(command: 'up' | 'down') {
  const migrationFiles = await getMigrationFiles();

  await prepareMigrationsTable();

  for (const migrationFile of migrationFiles) {
    const filePath = join(__dirname, '..', migrationFile);
    await applySingleMigration({
      command,
      fileName: migrationFile,
      filePath,
    });
  }
}

async function getMigrationFiles(): Promise<string[]> {
  const folderPath = join(__dirname, '..');
  const files = await readdir(folderPath);

  const migrationFiles = files
    .filter((file) => {
      return file.endsWith('.sql');
    })
    .sort((a, b) => {
      const aTimestamp = parseInt(a.split('-').at(0) ?? '');
      const bTimestamp = parseInt(b.split('-').at(0) ?? '');

      return aTimestamp - bTimestamp;
    });

  return migrationFiles;
}

async function prepareMigrationsTable() {
  await db.$client.execute(`
    CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function applySingleMigration({
  command,
  fileName,
  filePath,
}: {
  command: 'up' | 'down';
  fileName: string;
  filePath: string;
}) {
  const { upSql, downSql } = await parseSqlFile(filePath);

  if (command === 'up') {
    const isApplied = await db.all(
      sql`SELECT * FROM migrations WHERE name = ${fileName}`,
    );
    const alreadyApplied = isApplied.length > 0;

    if (alreadyApplied) {
      console.log(`Skipping already applied migration: ${fileName}`);
      return;
    }

    console.log(`Applying migration: ${fileName}`);

    await db.run(upSql);
    await db.run(sql`INSERT INTO migrations (name) VALUES (${fileName})`);

    console.log(`Migration applied: ${fileName}`);
    return;
  }

  console.log(`Reverting migration: ${fileName}`);

  await db.run(downSql);
  await db.run(sql`DELETE FROM migrations WHERE name = ${fileName}`);
}

async function parseSqlFile(filePath: string) {
  const fileContent = await readFile(filePath, 'utf-8');

  const [upSql, downSql] = fileContent.split('-- DOWN');
  if (!upSql || !downSql) {
    throw new Error('Invalid migration file');
  }

  return {
    upSql: upSql.replace('-- UP', '').trim(),
    downSql: downSql.trim(),
  };
}
