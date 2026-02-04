import { app } from "#/app";
import { db, seed } from "#/database/database";
import { Logger } from "#/shared/libs/logger.lib";

async function main() {
  await db.init();

  app.listen(9100, () => {
    Logger.info(`Server is running on http://localhost:9100`);
  });
}

main().catch((err) => {
  Logger.error(err);
  process.exit(1);
});
