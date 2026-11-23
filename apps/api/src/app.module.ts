import { Inject, MiddlewareConsumer, Module, NestModule, OnModuleDestroy } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LoggerModule } from 'nestjs-pino';
import { AuthController } from './auth/auth.controller';
import { JwtStrategy } from './auth/jwt.strategy';
import { ExecutionContextMiddleware } from './execution-context/execution-context.middleware';
import { ProblemDetailsFilter } from './filters/problem-details.filter';
import { AdministrationMeetingGroupProposalsController } from './modules/administration/meeting-group-proposals.controller';
import { CompositionRoot, createCompositionRoot } from './modules/composition-root';
import { MeetingsControllers } from './modules/meetings/meetings.controllers';
import { PaymentsControllers } from './modules/payments/payments.controllers';
import { UserRegistrationsController } from './modules/user-access/user-registrations.controller';
import {
  ADMINISTRATION_MODULE,
  EVENTS_BUS,
  MEETINGS_MODULE,
  PAYMENTS_MODULE,
  REGISTRATIONS_MODULE,
  USER_ACCESS_MODULE,
} from './modules/tokens';
import { AuthenticatedUserController } from './modules/user-access/authenticated-user.controller';

export const COMPOSITION_ROOT = Symbol('COMPOSITION_ROOT');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
        level: process.env.LOG_LEVEL ?? 'info',
      },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'mymeetings-dev-secret'),
      }),
    }),
  ],
  controllers: [
    AuthController,
    AuthenticatedUserController,
    UserRegistrationsController,
    AdministrationMeetingGroupProposalsController,
    MeetingsControllers,
    PaymentsControllers,
  ],
  providers: [
    JwtStrategy,
    {
      provide: COMPOSITION_ROOT,
      inject: [ConfigService],
      useFactory: (config: ConfigService): CompositionRoot => {
        const connectionString = config.get<string>(
          'DATABASE_URL',
          'postgres://mymeetings:mymeetings@localhost:5432/MyMeetings',
        );
        return createCompositionRoot(connectionString);
      },
    },
    {
      provide: USER_ACCESS_MODULE,
      inject: [COMPOSITION_ROOT],
      useFactory: (root: CompositionRoot) => root.userAccess.facade,
    },
    {
      provide: REGISTRATIONS_MODULE,
      inject: [COMPOSITION_ROOT],
      useFactory: (root: CompositionRoot) => root.registrations.facade,
    },
    {
      provide: ADMINISTRATION_MODULE,
      inject: [COMPOSITION_ROOT],
      useFactory: (root: CompositionRoot) => root.administration.facade,
    },
    {
      provide: MEETINGS_MODULE,
      inject: [COMPOSITION_ROOT],
      useFactory: (root: CompositionRoot) => root.meetings.facade,
    },
    {
      provide: PAYMENTS_MODULE,
      inject: [COMPOSITION_ROOT],
      useFactory: (root: CompositionRoot) => root.payments.facade,
    },
    {
      provide: EVENTS_BUS,
      inject: [COMPOSITION_ROOT],
      useFactory: (root: CompositionRoot) => root.eventsBus,
    },
    {
      provide: APP_FILTER,
      useClass: ProblemDetailsFilter,
    },
  ],
})
export class AppModule implements NestModule, OnModuleDestroy {
  constructor(@Inject(COMPOSITION_ROOT) private readonly compositionRoot: CompositionRoot) {}

  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(ExecutionContextMiddleware).forRoutes('*');
  }

  onModuleDestroy(): void {
    this.compositionRoot.stop();
  }
}
