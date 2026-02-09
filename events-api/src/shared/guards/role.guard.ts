import { UserRole } from "#/shared/types";
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";

const RoleDecoratorKey = "roles";

export const Roles = (...roles: UserRole[]) => {
  return SetMetadata(RoleDecoratorKey, roles);
};

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private recflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedRoles = this.recflector.getAllAndOverride<UserRole[]>(
      RoleDecoratorKey,
      [context.getHandler(), context.getClass()],
    );
    if (!allowedRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as {
      userId: string;
      userEmail: string;
      userRole: UserRole;
    };

    return allowedRoles.includes(user.userRole);
  }
}
