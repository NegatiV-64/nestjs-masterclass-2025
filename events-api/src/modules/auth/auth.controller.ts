import { Body, Controller, Post } from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { AuthService } from "./auth.service";

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
}
