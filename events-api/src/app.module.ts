import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { validateEnv } from "./shared/configs/env.config";
import { DatabaseModule } from "#/modules/database/database.module";
import { EventsModule } from "#/modules/events/events.module";
import { AuthModule } from "#/modules/auth/auth.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      validate: validateEnv,
    }),
    DatabaseModule,
    EventsModule,
    AuthModule,
  ],
})
export class AppModule {}
