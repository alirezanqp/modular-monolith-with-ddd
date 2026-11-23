import { DomainEventBase } from '@building-blocks/domain';

export class UserRegistrationConfirmedDomainEvent extends DomainEventBase {
  constructor(readonly userRegistrationId: string) {
    super();
  }
}
