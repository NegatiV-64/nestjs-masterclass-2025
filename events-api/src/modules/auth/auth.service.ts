import { RegisterDto } from "#/modules/auth/dto/register.dto";
import { AuthTokenPayload } from "#/modules/auth/types/auth-payload.type";
import { DatabaseService } from "#/modules/database/database.service";
import { usersTable } from "#/modules/database/schema";
import { EnvConfig } from "#/shared/configs/env.config";
import { Hasher } from "#/shared/libs";
import { UserRole } from "#/shared/types";
import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { eq } from "drizzle-orm";

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService<EnvConfig, true>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email;
    const password = await Hasher.hash(dto.password);

    const user = await this.databaseService.db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });

    if (user) {
      throw new BadRequestException("User with this email already exists");
    }

    const [newUser] = await this.databaseService.db
      .insert(usersTable)
      .values({
        email,
        password,
        role: dto.role,
      })
      .returning();

    const authToken = await this.generateAuthToken({
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role as never,
    });

    return authToken;
  }

  public async login(email: string, password: string) {
    const user = await this.databaseService.db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });
    if (!user) {
      throw new BadRequestException("Invalid email or password");
    }

    const isPasswordValid = await Hasher.verify(user.password, password);
    if (!isPasswordValid) {
      throw new BadRequestException("Invalid email or password");
    }

    const authToken = await this.generateAuthToken({
      sub: user.id,
      email: user.email,
      role: user.role as UserRole,
    });

    return authToken;
  }

  async generateAuthToken(payload: AuthTokenPayload) {
    const jwtSecret = this.configService.get("AUTH_JWT_SECRET", {
      infer: true,
    });
    const jwtExpiresIn = this.configService.get("AUTH_JWT_EXPIRES_IN", {
      infer: true,
    });

    const authToken = await this.jwtService.signAsync<AuthTokenPayload>(
      payload,
      {
        secret: jwtSecret,
        expiresIn: jwtExpiresIn as never,
      },
    );

    return authToken;
  }
}
