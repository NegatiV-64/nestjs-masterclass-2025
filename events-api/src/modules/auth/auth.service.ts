import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import {
  type DatabaseClient,
  DatabaseService,
} from "../database/database.service";
import { ConfigService } from "@nestjs/config";
import { EnvConfig } from "src/shared/configs/env.config";
import { JwtService } from "@nestjs/jwt";
import { RegisterDto } from "./dto/register.dto";
import { Hasher } from "src/shared/libs";
import { usersTable } from "../database/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { AuthTokenPayload } from "./types/auth-payload.type";

@Injectable()
export class AuthService {
  constructor(
    @Inject(DatabaseService) private readonly databaseService: DatabaseClient,
    private readonly configService: ConfigService<EnvConfig, true>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email;
    const password = await Hasher.hash(dto.password);

    const user = await this.databaseService
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .get();

    if (user) {
      throw new BadRequestException("User with this email already exists");
    }

    const newUser = await this.databaseService
      .insert(usersTable)
      .values({
        id: randomUUID(),
        email,
        password,
        role: dto.role,
      })
      .returning()
      .get();

    const authToken = await this.generateAuthToken({
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role as never,
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
