import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthTokenStrategy } from "#/modules/auth/strategies/auth-token.strategy";
import { AuthController } from "#/modules/auth/auth.controller";
import { AuthService } from "#/modules/auth/auth.service";
import { DatabaseModule } from "#/modules/database/database.module";

@Module({
  imports: [JwtModule, DatabaseModule, PassportModule],
  providers: [AuthService, AuthTokenStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
