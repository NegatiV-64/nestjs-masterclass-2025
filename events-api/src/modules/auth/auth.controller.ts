import { Body, Controller, Post } from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { AuthService } from "./auth.service";
import { LoginDto } from "#/modules/auth/dto/login.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(@Body() body: RegisterDto) {
    const authToken = await this.authService.register(body);

    return {
      message: "User registered successfully",
      data: {
        authToken,
      },
    };
  }

  @Post("login")
  async login(@Body() body: LoginDto) {
    const authToken = await this.authService.login(body.email, body.password);

    return {
      message: "User logged in successfully",
      data: {
        authToken,
      },
    };
  }
}
