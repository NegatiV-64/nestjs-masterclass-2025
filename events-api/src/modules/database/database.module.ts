import { Module } from "@nestjs/common";
import { DatabaseService, drizzleProvider } from "./database.service";

@Module({
  providers: [drizzleProvider],
  exports: [DatabaseService],
})
export class DatabaseModule {}
