import { ExecutionContextAccessor, HandlerRegistry, IExecutionContextAccessor, Mediator } from '@building-blocks/application';
import {
  BackgroundProcessor, createCommandFactory, createTypedEventFactory, DomainEventsDispatcher,
  InMemoryEventsBus, InboxAccessor, InboxProcessor, InternalCommandsAccessor, InternalCommandsProcessor,
  OutboxAccessor, OutboxProcessor, SqlConnectionFactory, UnitOfWork,
} from '@building-blocks/infrastructure';
import { MeetingAttendeeAddedIntegrationEvent } from '@modules/meetings';
import { NewUserRegisteredIntegrationEvent } from '@modules/registrations';
import { randomUUID } from 'crypto';
import { IPaymentsModule } from '../application/contracts/payments.module';
import * as C from '../application/commands/payments.commands';
import * as H from '../application/handlers/payments.handlers';
import { AggregateStore } from './aggregate-store/aggregate-store';
import { SubscriptionPaymentPaidIntegrationEvent } from '../integration-events/subscription-payment-paid.integration-event';

export class PaymentsModuleFacade implements IPaymentsModule {
  constructor(private readonly mediator: Mediator) {}
  executeCommand(command: never): Promise<void>;
  executeCommand<TResult>(command: never): Promise<TResult>;
  executeCommand(command: never) { return this.mediator.send(command); }
  executeQuery<TResult>(query: never) { return this.mediator.query(query) as Promise<TResult>; }
}

export function bootstrapPaymentsModule(options: {
  connectionString: string;
  eventsBus: InMemoryEventsBus;
  executionContextAccessor?: IExecutionContextAccessor;
}) {
  const sql = new SqlConnectionFactory(options.connectionString);
  const schema = 'payments';
  const outbox = new OutboxAccessor(schema);
  const inbox = new InboxAccessor(schema);
  const internalCommands = new InternalCommandsAccessor(schema);
  const domainEvents = new DomainEventsDispatcher();
  const unitOfWork = new UnitOfWork(sql, domainEvents, outbox, schema);
  const registry = new HandlerRegistry();
  const executionContext = options.executionContextAccessor ?? new ExecutionContextAccessor(null, 'payments');
  const mediator = new Mediator(registry, executionContext, unitOfWork, (work) => sql.withTransaction(async () => work()));
  const store = new AggregateStore(sql);

  registry.registerCommandHandlerWithResult(C.BuySubscriptionCommand as any, new H.BuySubscriptionCommandHandler(sql, store) as any);
  registry.registerCommandHandler(C.MarkSubscriptionPaymentAsPaidCommand, new H.MarkSubscriptionPaymentAsPaidCommandHandler(sql, store, unitOfWork));
  registry.registerCommandHandler(C.CreatePayerCommand, new H.CreatePayerCommandHandler(sql));
  registry.registerCommandHandler(C.CreateMeetingFeeCommand, new H.CreateMeetingFeeCommandHandler(sql));
  registry.registerCommandHandlerWithResult(C.CreatePriceListItemCommand as any, new H.CreatePriceListItemCommandHandler(sql) as any);
  registry.registerQueryHandler(C.GetPriceListItemsQuery, new H.GetPriceListItemsQueryHandler(sql));
  registry.registerQueryHandler(C.GetPayerSubscriptionQuery, new H.GetPayerSubscriptionQueryHandler(sql));
  registry.registerQueryHandler(C.GetMeetingFeesQuery, new H.GetMeetingFeesQueryHandler(sql));

  const subscribeInbox = (typeName: string) => {
    options.eventsBus.subscribe(typeName, {
      async handle(event: any) {
        await sql.withTransaction(async (client) => {
          await inbox.add(client, {
            id: event.id,
            occurredOn: event.occurredOn,
            type: typeName,
            data: JSON.stringify(event),
          });
        });
      },
    });
  };
  subscribeInbox(NewUserRegisteredIntegrationEvent.name);
  subscribeInbox(MeetingAttendeeAddedIntegrationEvent.name);

  const outboxProcessor = new OutboxProcessor(
    sql, outbox, options.eventsBus,
    createTypedEventFactory({ [SubscriptionPaymentPaidIntegrationEvent.name]: SubscriptionPaymentPaidIntegrationEvent as any }),
  );
  const inboxProcessor = new InboxProcessor(sql, inbox, internalCommands, (type, data) => {
    if (type === NewUserRegisteredIntegrationEvent.name) {
      return {
        id: randomUUID(),
        type: C.CreatePayerCommand.name,
        data: {
          id: randomUUID(), payerId: data.userRegistrationId, login: data.login, email: data.email,
          firstName: data.firstName, lastName: data.lastName,
        },
      };
    }
    if (type === MeetingAttendeeAddedIntegrationEvent.name && data.feeValue) {
      return {
        id: randomUUID(),
        type: C.CreateMeetingFeeCommand.name,
        data: {
          id: randomUUID(), meetingFeeId: randomUUID(), payerId: data.attendeeId,
          meetingId: data.meetingId, feeValue: data.feeValue, feeCurrency: data.feeCurrency,
        },
      };
    }
    return null;
  });
  const internalProcessor = new InternalCommandsProcessor(
    sql, internalCommands, mediator,
    createCommandFactory({
      [C.CreatePayerCommand.name]: C.CreatePayerCommand,
      [C.CreateMeetingFeeCommand.name]: C.CreateMeetingFeeCommand,
    }),
  );

  const background = new BackgroundProcessor();
  background.start([
    { name: 'payments-outbox', intervalMs: 2000, work: () => outboxProcessor.process() },
    { name: 'payments-inbox', intervalMs: 2000, work: () => inboxProcessor.process() },
    { name: 'payments-internal', intervalMs: 2000, work: () => internalProcessor.process() },
  ]);

  return { facade: new PaymentsModuleFacade(mediator) as IPaymentsModule, stop: () => background.stop() };
}
