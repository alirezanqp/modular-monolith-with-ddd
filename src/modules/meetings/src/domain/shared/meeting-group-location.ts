import { ValueObject } from '@building-blocks/domain';

export class MeetingGroupLocation extends ValueObject {
  private constructor(
    readonly city: string,
    readonly countryCode: string,
  ) {
    super();
  }

  static create(city: string, countryCode: string): MeetingGroupLocation {
    return new MeetingGroupLocation(city, countryCode);
  }
}
