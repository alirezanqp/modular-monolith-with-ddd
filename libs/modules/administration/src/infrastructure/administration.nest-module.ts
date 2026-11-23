import { DynamicModule, Module } from '@nestjs/common';
import {
  BackgroundProcessor,
  IEventsBus,
  SqlConnectionFactory,
} from '@building-blocks/infrastructure';
import { IExecutionContextAccessor } from '@building-blocks/application';
import { ADMINISTRATION_MODULE } from '../application/contracts/i-administration-module';
import {
  AdministrationModuleFacade,
  bootstrapAdministrationModule,
} from './administration-module';

export const ADMINISTRATION_EVENTS_BUS = Symbol('ADMINISTRATION_EVENTS_BUS');
export const ADMINISTRATION_SQL = Symbol('ADMINISTRATION_SQL');
export const ADMINISTRATION_EXECUTION_CONTEXT = Symbol('ADMINISTRATION_EXECUTION_CONTEXT');
export const ADMINISTRATION_BACKGROUND = Symbol('ADMINISTRATION_BACKGROUND');

@Module({})
export class AdministrationNestModule {
  static forRoot(): DynamicModule {
    return {
      module: AdministrationNestModule,
      providers: [
        {
          provide: ADMINISTRATION_MODULE,
          useFactory: async (
            sql: SqlConnectionFactory,
            eventsBus: IEventsBus,
            executionContextAccessor: IExecutionContextAccessor,
            backgroundProcessor?: BackgroundProcessor,
          ): Promise<AdministrationModuleFacade> =>
            bootstrapAdministrationModule({
              sqlConnectionFactory: sql,
              eventsBus,
              executionContextAccessor,
              backgroundProcessor,
            }),
          inject: [
            ADMINISTRATION_SQL,
            ADMINISTRATION_EVENTS_BUS,
            ADMINISTRATION_EXECUTION_CONTEXT,
            { token: ADMINISTRATION_BACKGROUND, optional: true },
          ],
        },
      ],
      exports: [ADMINISTRATION_MODULE],
    };
  }
}
