import { AuthConfig } from "#/shared/configs/auth.config";
import { AuthGuard as LibGuard } from "@nestjs/passport";

export class AuthTokenGuard extends LibGuard(AuthConfig.AuthTokenStrategyKey) {}
