import { UserRole } from "src/shared/types";

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}
