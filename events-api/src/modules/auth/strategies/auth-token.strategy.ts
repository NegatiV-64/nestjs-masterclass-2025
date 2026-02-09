import { AuthTokenPayload } from "#/modules/auth/types/auth-payload.type";
import { AuthConfig } from "#/shared/configs/auth.config";
import { EnvConfig } from "#/shared/configs/env.config";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class AuthTokenStrategy extends PassportStrategy(
  Strategy,
  AuthConfig.AuthTokenStrategyKey,
) {
  constructor(private readonly configService: ConfigService<EnvConfig, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get("AUTH_JWT_SECRET", { infer: true }),
    });
  }

  validate(payload: AuthTokenPayload) {
    return {
      userId: payload.sub,
      userEmail: payload.email,
      userRole: payload.role,
    };
  }
}
