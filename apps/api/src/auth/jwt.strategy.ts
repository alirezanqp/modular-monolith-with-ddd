import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: string;
  login: string;
  name: string;
  email?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'mymeetings-dev-secret'),
      issuer: configService.get<string>('JWT_ISSUER', 'MyMeetings'),
      audience: configService.get<string>('JWT_AUDIENCE', 'MyMeetingsAPI'),
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
