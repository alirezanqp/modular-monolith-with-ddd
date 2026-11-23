import {
  BadRequestException,
  Controller,
  Inject,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ApiTags } from '@nestjs/swagger';
import { AuthenticateCommand, IUserAccessModule } from '@modules/user-access';
import { Request } from 'express';
import { USER_ACCESS_MODULE } from '../modules/tokens';

@ApiTags('Authentication')
@Controller('connect')
export class AuthController {
  constructor(
    @Inject(USER_ACCESS_MODULE) private readonly userAccessModule: IUserAccessModule,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Post('token')
  async token(
    @Req() req: Request,
  ): Promise<{ access_token: string; expires_in: number; token_type: string }> {
    const body = req.body as Record<string, string>;
    if (body.grant_type !== 'password') {
      throw new BadRequestException('Unsupported grant_type');
    }
    if (body.client_id !== 'ro.client' || body.client_secret !== 'secret') {
      throw new UnauthorizedException('Invalid client');
    }

    const result = await this.userAccessModule.executeCommand(
      new AuthenticateCommand(body.username, body.password),
    );

    if (!result.isAuthenticated || !result.user) {
      throw new UnauthorizedException(result.authenticationError ?? 'Invalid credentials');
    }

    const expiresIn = 3600;
    const accessToken = await this.jwtService.signAsync(
      {
        sub: result.user.id,
        login: result.user.login,
        name: result.user.name,
        email: result.user.email,
      },
      {
        expiresIn,
        issuer: this.configService.get<string>('JWT_ISSUER', 'MyMeetings'),
        audience: this.configService.get<string>('JWT_AUDIENCE', 'MyMeetingsAPI'),
      },
    );

    return {
      access_token: accessToken,
      expires_in: expiresIn,
      token_type: 'Bearer',
    };
  }
}
