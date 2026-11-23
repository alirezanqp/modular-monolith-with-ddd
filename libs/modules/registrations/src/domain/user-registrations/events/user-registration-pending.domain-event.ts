import { DomainEventBase } from '@building-blocks/domain';

export class UserRegistrationPendingDomainEvent extends DomainEventBase {
  constructor(
    readonly userRegistrationId: string,
    readonly login: string,
    readonly email: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly name: string,
    readonly password: string,
    readonly confirmLink?: string,
  ) {
    super();
  }
}
