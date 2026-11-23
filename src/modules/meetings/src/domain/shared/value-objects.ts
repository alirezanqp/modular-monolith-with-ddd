import { ValueObject } from '@building-blocks/domain';

export class MeetingGroupLocation extends ValueObject {
  readonly city: string;
  readonly countryCode: string;

  private constructor(city: string, countryCode: string) {
    super();
    this.city = city;
    this.countryCode = countryCode;
  }

  static create(city: string, countryCode: string): MeetingGroupLocation {
    return new MeetingGroupLocation(city, countryCode);
  }
}

export class MoneyValue extends ValueObject {
  static readonly Undefined = new MoneyValue(null, null);

  readonly value: number | null;
  readonly currency: string | null;

  private constructor(value: number | null, currency: string | null) {
    super();
    this.value = value;
    this.currency = currency;
  }

  static of(value: number, currency: string): MoneyValue {
    if (value < 0) {
      throw new Error('Value of money must not be negative');
    }
    return new MoneyValue(value, currency);
  }

  static free(currency = 'USD'): MoneyValue {
    return new MoneyValue(0, currency);
  }

  get isUndefined(): boolean {
    return this.value === null;
  }

  get isFree(): boolean {
    return this.value === 0;
  }

  multiply(times: number): MoneyValue {
    if (this.isUndefined || this.value === null || !this.currency) {
      return MoneyValue.Undefined;
    }
    return MoneyValue.of(this.value * times, this.currency);
  }
}

export class Term extends ValueObject {
  readonly startDate: Date | null;
  readonly endDate: Date | null;

  private constructor(startDate: Date | null, endDate: Date | null) {
    super();
    this.startDate = startDate;
    this.endDate = endDate;
  }

  static createNewBetweenDates(startDate: Date | null, endDate: Date | null): Term {
    return new Term(startDate, endDate);
  }

  isInTerm(date: Date): boolean {
    const afterStart = !this.startDate || date >= this.startDate;
    const beforeEnd = !this.endDate || date <= this.endDate;
    return afterStart && beforeEnd;
  }
}

export class MeetingTerm extends ValueObject {
  readonly startDate: Date;
  readonly endDate: Date;

  private constructor(startDate: Date, endDate: Date) {
    super();
    this.startDate = startDate;
    this.endDate = endDate;
  }

  static create(startDate: Date, endDate: Date): MeetingTerm {
    return new MeetingTerm(startDate, endDate);
  }

  get hasStarted(): boolean {
    return new Date() >= this.startDate;
  }
}

export class MeetingLocation extends ValueObject {
  readonly name: string;
  readonly address: string;
  readonly postalCode: string;
  readonly city: string;

  private constructor(name: string, address: string, postalCode: string, city: string) {
    super();
    this.name = name;
    this.address = address;
    this.postalCode = postalCode;
    this.city = city;
  }

  static create(
    name: string,
    address: string,
    postalCode: string,
    city: string,
  ): MeetingLocation {
    return new MeetingLocation(name, address, postalCode, city);
  }
}

export class MeetingLimits extends ValueObject {
  readonly attendeesLimit: number | null;
  readonly guestsLimit: number;

  private constructor(attendeesLimit: number | null, guestsLimit: number) {
    super();
    this.attendeesLimit = attendeesLimit;
    this.guestsLimit = guestsLimit;
  }

  static create(attendeesLimit: number | null, guestsLimit: number): MeetingLimits {
    return new MeetingLimits(attendeesLimit, guestsLimit);
  }
}
