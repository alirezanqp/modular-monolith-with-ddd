import { IntegrationEvent } from '@building-blocks/infrastructure';

export class NewUserRegisteredIntegrationEvent extends IntegrationEvent {
  constructor(
    readonly userRegistrationId: string,
    readonly login: string,
    readonly email: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly name: string,
    readonly password: string,
    id?: string,
    occurredOn?: Date,
  ) {
    super(id, occurredOn);
  }
}
