export class MeetingAttendeeRole {
  static readonly Host = new MeetingAttendeeRole('Host');
  static readonly Attendee = new MeetingAttendeeRole('Attendee');

  private constructor(public readonly value: string) {}

  static of(value: string): MeetingAttendeeRole {
    if (value === MeetingAttendeeRole.Host.value) {
      return MeetingAttendeeRole.Host;
    }
    return MeetingAttendeeRole.Attendee;
  }

  equals(other: MeetingAttendeeRole): boolean {
    return this.value === other.value;
  }
}
