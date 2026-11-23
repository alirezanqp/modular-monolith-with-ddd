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
