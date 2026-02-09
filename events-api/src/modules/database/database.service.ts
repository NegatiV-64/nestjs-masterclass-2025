import { EnvConfig } from "#/shared/configs/env.config";
import * as schema from "./schema";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle } from "drizzle-orm/node-postgres";

@Injectable()
export class DatabaseService {
  public db: NodePgDatabase<typeof schema>;

  constructor(configService: ConfigService<EnvConfig, true>) {
    const dbUser = configService.get("DATABASE_USER", { infer: true });
    const dbPassword = configService.get("DATABASE_PASSWORD", { infer: true });
    const dbHost = configService.get("DATABASE_HOST", { infer: true });
    const dbPort = configService.get("DATABASE_PORT", { infer: true });
    const dbName = configService.get("DATABASE_NAME", { infer: true });

    const dbUrl = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;

    const db = drizzle(dbUrl, {
      schema: schema,
    });

    this.db = db;
  }
}
