import { IsEmail, IsIn, IsString, MaxLength, MinLength } from "class-validator";
import { type UserRole } from "src/shared/types";

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(22)
  password: string;

  @IsString()
  @IsIn(["user", "admin"])
  role: UserRole;
}
