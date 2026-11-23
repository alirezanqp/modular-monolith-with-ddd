export class MeetingGroupProposalStatus {
  static readonly InVerification = new MeetingGroupProposalStatus('InVerification');
  static readonly Accepted = new MeetingGroupProposalStatus('Accepted');

  private constructor(public readonly value: string) {}

  static of(value: string): MeetingGroupProposalStatus {
    if (value === MeetingGroupProposalStatus.Accepted.value) {
      return MeetingGroupProposalStatus.Accepted;
    }
    return MeetingGroupProposalStatus.InVerification;
  }

  equals(other: MeetingGroupProposalStatus): boolean {
    return this.value === other.value;
  }
}
