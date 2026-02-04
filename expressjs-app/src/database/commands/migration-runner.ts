import { db } from "#/database/database";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { argv, exit } from "node:process";
import { QueryRunner } from "typeorm";

async function bootstrap() {
  const allowedCommands = ["--run", "--revert"];

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

  await db.init();

  await runMigrations(command === "--run" ? "run" : "revert");
}

async function runMigrations(command: "run" | "revert") {
  console.log("Running migrations", command);

  const queryRunner = db.connection.createQueryRunner();

  const migrationsFolderPath = join(__dirname, "..", "migrations");
  const migrationFiles = await readdir(migrationsFolderPath);
  const filterdMigrationFiles = migrationFiles
    .filter((file) => {
      return file.endsWith(".sql");
    })
    .sort((a, b) => {
      const aTimestamp = parseInt(a.split("-").at(0) ?? "");
      const bTimestamp = parseInt(b.split("-").at(0) ?? "");

      return aTimestamp - bTimestamp;
    });

  await queryRunner.query(`
    CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await queryRunner.startTransaction();

  try {
    for (const migrationFile of filterdMigrationFiles) {
      const filePath = join(migrationsFolderPath, migrationFile);

      await applySingleMigration({
        command,
        fileName: migrationFile,
        filePath,
        queryRunner,
      });

      if (queryRunner.isTransactionActive) {
        await queryRunner.commitTransaction();
      }
    }
  } catch (error) {
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }

    console.log("Migration failed", error);
    throw error;
  }
}

async function applySingleMigration({
  command,
  fileName,
  filePath,
  queryRunner,
}: {
  command: "run" | "revert";
  queryRunner: QueryRunner;
  fileName: string;
  filePath: string;
}) {
  const { upSql, downSql } = await parseSqlFile(filePath);

  if (command === "run") {
    const migrationApplied = await queryRunner.query(
      "SELECT * FROM migrations WHERE name = ?",
      [fileName]
    );

    if (migrationApplied.length > 0) {
      console.log("Migration already applied", fileName);
      return;
    }

    await queryRunner.query(upSql);
    await queryRunner.query("INSERT INTO migrations (name) VALUES (?)", [
      fileName,
    ]);
  } else {
    await queryRunner.query(downSql);
    await queryRunner.query("DELETE FROM migrations WHERE name = ?", [
      fileName,
    ]);
  }
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

bootstrap();
