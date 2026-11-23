import { AggregateRoot } from '@building-blocks/domain';
import { UserId } from './user-id';
import { UserCreatedDomainEvent } from './events/user-created.domain-event';

export class User extends AggregateRoot {
  private constructor(
    readonly id: UserId,
    private readonly login: string,
    private password: string,
    private readonly email: string,
    private isActive: boolean,
    private readonly firstName: string,
    private readonly lastName: string,
    private readonly name: string,
    private roles: string[],
  ) {
    super();
  }

  static createFromUserRegistration(
    id: UserId,
    login: string,
    password: string,
    email: string,
    firstName: string,
    lastName: string,
  ): User {
    const user = new User(
      id,
      login,
      password,
      email,
      true,
      firstName,
      lastName,
      `${firstName} ${lastName}`,
      ['Member'],
    );
    user.addDomainEvent(new UserCreatedDomainEvent(id.value, login, email));
    return user;
  }

  static createAdmin(
    id: UserId,
    login: string,
    password: string,
    email: string,
    firstName: string,
    lastName: string,
  ): User {
    return new User(
      id,
      login,
      password,
      email,
      true,
      firstName,
      lastName,
      `${firstName} ${lastName}`,
      ['Administrator'],
    );
  }

  static restore(props: {
    id: string;
    login: string;
    password: string;
    email: string;
    isActive: boolean;
    firstName: string;
    lastName: string;
    name: string;
    roles: string[];
  }): User {
    return new User(
      new UserId(props.id),
      props.login,
      props.password,
      props.email,
      props.isActive,
      props.firstName,
      props.lastName,
      props.name,
      props.roles,
    );
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

  getIsActive(): boolean {
    return this.isActive;
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

  getRoles(): string[] {
    return [...this.roles];
  }
}
