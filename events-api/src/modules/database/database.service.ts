import { drizzle } from "drizzle-orm/libsql";
import { Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EnvConfig } from "src/shared/configs/env.config";
import * as schema from "./schema";
import { Client, createClient } from "@libsql/client";

export const DatabaseService = "DatabaseService";

export const drizzleProvider: Provider = {
  provide: DatabaseService,
  inject: [ConfigService],
  useFactory: (configService: ConfigService<EnvConfig, true>) => {
    const dbFileName = configService.get("DB_FILE_NAME", { infer: true });

    const client = createClient({ url: dbFileName });
    const db = drizzle({ client });

    return db;
  },
};

export type DatabaseClient = ReturnType<typeof drizzle<typeof schema, Client>>;
