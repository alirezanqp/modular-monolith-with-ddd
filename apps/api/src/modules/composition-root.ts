import { InMemoryEventsBus } from '@building-blocks/infrastructure';
import { bootstrapAdministrationModule } from '@modules/administration';
import { bootstrapMeetingsModule } from '@modules/meetings';
import { bootstrapPaymentsModule } from '@modules/payments';
import { bootstrapRegistrationsModule } from '@modules/registrations';
import { bootstrapUserAccessModule } from '@modules/user-access';
import { getRequestExecutionContext } from '../execution-context/request-execution-context';

export interface CompositionRoot {
  eventsBus: InMemoryEventsBus;
  userAccess: ReturnType<typeof bootstrapUserAccessModule>;
  registrations: ReturnType<typeof bootstrapRegistrationsModule>;
  administration: ReturnType<typeof bootstrapAdministrationModule>;
  meetings: ReturnType<typeof bootstrapMeetingsModule>;
  payments: ReturnType<typeof bootstrapPaymentsModule>;
  stop(): void;
}

export function createCompositionRoot(connectionString: string): CompositionRoot {
  const eventsBus = new InMemoryEventsBus();
  const executionContextAccessor = {
    get userId() {
      return getRequestExecutionContext().userId;
    },
    get correlationId() {
      return getRequestExecutionContext().correlationId;
    },
    get isAvailable() {
      return getRequestExecutionContext().isAvailable;
    },
  };

  const userAccess = bootstrapUserAccessModule({
    connectionString,
    eventsBus,
    executionContextAccessor,
  });
  const registrations = bootstrapRegistrationsModule({
    connectionString,
    eventsBus,
    executionContextAccessor,
  });
  const administration = bootstrapAdministrationModule({
    connectionString,
    eventsBus,
    executionContextAccessor,
  });
  const meetings = bootstrapMeetingsModule({
    connectionString,
    eventsBus,
    executionContextAccessor,
  });
  const payments = bootstrapPaymentsModule({
    connectionString,
    eventsBus,
    executionContextAccessor,
  });

  eventsBus.start();

  return {
    eventsBus,
    userAccess,
    registrations,
    administration,
    meetings,
    payments,
    stop() {
      eventsBus.stop();
      userAccess.stop();
      registrations.stop();
      administration.stop();
      meetings.stop();
      payments.stop();
    },
  };
}
