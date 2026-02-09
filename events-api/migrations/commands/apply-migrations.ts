import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { argv, exit } from "node:process";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";

const dbUrl = `postgresql://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`;

const db = drizzle(dbUrl);

async function bootstrap() {
  const allowedCommands = ["--up", "--down"];

  const args = argv.slice(2);

  const command = args.at(0);
  if (!command) {
    console.error("No command provided");
    exit(1);
  }

  if (!allowedCommands.includes(command)) {
    console.error("Invalid command provided");
    exit(1);
  }

  await runMigrations(command === "--up" ? "up" : "down");
}

bootstrap();

async function runMigrations(command: "up" | "down") {
  const migrationFiles = await getMigrationFiles();

  await prepareMigrationsTable();

  for (const migrationFile of migrationFiles) {
    const filePath = join(__dirname, "..", migrationFile);
    await applySingleMigration({
      command,
      fileName: migrationFile,
      filePath,
    });
  }
}

async function getMigrationFiles(): Promise<string[]> {
  const folderPath = join(__dirname, "..");
  const files = await readdir(folderPath);

  const migrationFiles = files
    .filter((file) => {
      return file.endsWith(".sql");
    })
    .sort((a, b) => {
      const aTimestamp = parseInt(a.split("-").at(0) ?? "");
      const bTimestamp = parseInt(b.split("-").at(0) ?? "");

      return aTimestamp - bTimestamp;
    });

  return migrationFiles;
}

async function prepareMigrationsTable() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        name TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function applySingleMigration({
  command,
  fileName,
  filePath,
}: {
  command: "up" | "down";
  fileName: string;
  filePath: string;
}) {
  const { upSql, downSql } = await parseSqlFile(filePath);

  if (command === "up") {
    const isApplied = await db.execute(
      sql`SELECT * FROM migrations WHERE name = ${fileName}`,
    );
    const alreadyApplied = (isApplied.rowCount ?? 0) > 0;

    if (alreadyApplied) {
      console.log(`Skipping already applied migration: ${fileName}`);
      return;
    }

    console.log(`Applying migration: ${fileName}`);

    await db.execute(upSql);
    await db.execute(sql`INSERT INTO migrations (name) VALUES (${fileName})`);

    console.log(`Migration applied: ${fileName}`);
    return;
  }

  console.log(`Reverting migration: ${fileName}`);

  await db.execute(downSql);
  await db.execute(sql`DELETE FROM migrations WHERE name = ${fileName}`);
}

async function parseSqlFile(filePath: string) {
  const fileContent = await readFile(filePath, "utf-8");

  const [upSql, downSql] = fileContent.split("-- DOWN");
  if (!upSql || !downSql) {
    throw new Error("Invalid migration file");
  }

  return {
    upSql: upSql.replace("-- UP", "").trim(),
    downSql: downSql.trim(),
  };
}
