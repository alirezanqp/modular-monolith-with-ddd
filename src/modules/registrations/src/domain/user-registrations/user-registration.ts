import { AggregateRoot } from '@building-blocks/domain';
import { UserRegistrationConfirmedDomainEvent } from './events/user-registration-confirmed.domain-event';
import { UserRegistrationPendingDomainEvent } from './events/user-registration-pending.domain-event';
import { UserRegistrationCannotBeConfirmedMoreThanOnceRule } from './rules/user-registration-cannot-be-confirmed-more-than-once.rule';
import { UserRegistrationId } from './user-registration-id';
import { UserRegistrationStatus } from './user-registration-status';

export class UserRegistration extends AggregateRoot {
  private constructor(
    readonly id: UserRegistrationId,
    private readonly login: string,
    private readonly password: string,
    private readonly email: string,
    private readonly firstName: string,
    private readonly lastName: string,
    private readonly name: string,
    private statusCode: string,
    private readonly registerDate: Date,
    private confirmedDate: Date | null,
  ) {
    super();
  }

  static registerNewUser(
    id: UserRegistrationId,
    login: string,
    password: string,
    email: string,
    firstName: string,
    lastName: string,
    confirmLink?: string,
  ): UserRegistration {
    const name = `${firstName} ${lastName}`;
    const registration = new UserRegistration(
      id,
      login,
      password,
      email,
      firstName,
      lastName,
      name,
      UserRegistrationStatus.WaitingForConfirmation,
      new Date(),
      null,
    );
    registration.addDomainEvent(
      new UserRegistrationPendingDomainEvent(
        id.value,
        login,
        email,
        firstName,
        lastName,
        name,
        password,
        confirmLink,
      ),
    );
    return registration;
  }

  static restore(props: {
    id: string;
    login: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    name: string;
    statusCode: string;
    registerDate: Date;
    confirmedDate: Date | null;
  }): UserRegistration {
    return new UserRegistration(
      new UserRegistrationId(props.id),
      props.login,
      props.password,
      props.email,
      props.firstName,
      props.lastName,
      props.name,
      props.statusCode,
      props.registerDate,
      props.confirmedDate,
    );
  }

  confirm(): void {
    this.checkRule(new UserRegistrationCannotBeConfirmedMoreThanOnceRule(this.statusCode));
    this.statusCode = UserRegistrationStatus.Confirmed;
    this.confirmedDate = new Date();
    this.addDomainEvent(new UserRegistrationConfirmedDomainEvent(this.id.value));
  }

  getLogin(): string {
    return this.login;
  }

  getPassword(): string {
    return this.password;
  }

  getEmail(): string {
    return this.email;
  }

  getFirstName(): string {
    return this.firstName;
  }

  getLastName(): string {
    return this.lastName;
  }

  getName(): string {
    return this.name;
  }

  getStatusCode(): string {
    return this.statusCode;
  }

  getRegisterDate(): Date {
    return this.registerDate;
  }

  getConfirmedDate(): Date | null {
    return this.confirmedDate;
  }
}
