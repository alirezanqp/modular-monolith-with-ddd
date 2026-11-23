import { DomainEventBase } from '@building-blocks/domain';

export class UserCreatedDomainEvent extends DomainEventBase {
  constructor(
    readonly userId: string,
    readonly login: string,
    readonly email: string,
  ) {
    super();
  }
}
