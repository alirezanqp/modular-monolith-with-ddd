import { AggregateRoot } from '@building-blocks/domain';
import { MemberId } from '../shared/typed-ids';

export class Member extends AggregateRoot {
  readonly id: MemberId;
  private _login: string;
  private _email: string;
  private _firstName: string;
  private _lastName: string;
  private _name: string;
  private _createDate: Date;

  private constructor(
    id: MemberId,
    login: string,
    email: string,
    firstName: string,
    lastName: string,
    name: string,
    createDate: Date,
  ) {
    super();
    this.id = id;
    this._login = login;
    this._email = email;
    this._firstName = firstName;
    this._lastName = lastName;
    this._name = name;
    this._createDate = createDate;
  }

  static create(
    id: string,
    login: string,
    email: string,
    firstName: string,
    lastName: string,
    name: string,
  ): Member {
    return new Member(
      new MemberId(id),
      login,
      email,
      firstName,
      lastName,
      name,
      new Date(),
    );
  }

  static reconstitute(props: {
    id: string;
    login: string;
    email: string;
    firstName: string;
    lastName: string;
    name: string;
    createDate: Date;
  }): Member {
    return new Member(
      new MemberId(props.id),
      props.login,
      props.email,
      props.firstName,
      props.lastName,
      props.name,
      props.createDate,
    );
  }

  get login(): string {
    return this._login;
  }
  get email(): string {
    return this._email;
  }
  get firstName(): string {
    return this._firstName;
  }
  get lastName(): string {
    return this._lastName;
  }
  get name(): string {
    return this._name;
  }
  get createDate(): Date {
    return this._createDate;
  }
}
