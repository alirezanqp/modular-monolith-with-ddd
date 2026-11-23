export class MeetingGroupMemberRole {
  static readonly Organizer = new MeetingGroupMemberRole('Organizer');
  static readonly Member = new MeetingGroupMemberRole('Member');

  private constructor(public readonly value: string) {}

  static of(value: string): MeetingGroupMemberRole {
    if (value === MeetingGroupMemberRole.Organizer.value) {
      return MeetingGroupMemberRole.Organizer;
    }
    return MeetingGroupMemberRole.Member;
  }

  equals(other: MeetingGroupMemberRole): boolean {
    return this.value === other.value;
  }
}
