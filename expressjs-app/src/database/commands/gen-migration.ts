import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { argv } from "node:process";

async function generateMigration(name: string) {
  const timestamp = new Date().getTime();

  const migrationDir = join(__dirname, "..", "migrations");
  const migrationName = `${timestamp}-${name}.sql`;

  const fileContent = `-- UP
-- Write your migration here
-- DOWN
-- Write your rollback here`;

  await writeFile(join(migrationDir, migrationName), fileContent);

  console.log("Migration created", migrationName);
}

async function bootstrap() {
  const args = argv.slice(2);
  const fileName = args.at(0);

  if (!fileName) {
    console.error("No migration name provided");
    process.exit(1);
  }

  const migrationName = fileName.replace("--name=", "").trim();
  if (!migrationName) {
    console.error("Invalid migration name provided");
    process.exit(1);
  }

  await generateMigration(migrationName);
}

bootstrap()