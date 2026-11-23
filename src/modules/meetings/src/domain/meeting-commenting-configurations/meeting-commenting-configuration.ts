import { AggregateRoot, IBusinessRule } from '@building-blocks/domain';
import { MeetingGroup } from '../meeting-groups/meeting-group';
import { MeetingId, MemberId } from '../shared/typed-ids';

class MeetingCommentingCanBeEnabledOnlyByGroupOrganizerRule implements IBusinessRule {
  constructor(
    private readonly meetingGroup: MeetingGroup,
    private readonly memberId: MemberId,
  ) {}
  isBroken(): boolean {
    return !this.meetingGroup.isOrganizer(this.memberId);
  }
  get message(): string {
    return 'Meeting commenting can be enabled only by group organizer';
  }
}

class MeetingCommentingCanBeDisabledOnlyByGroupOrganizerRule implements IBusinessRule {
  constructor(
    private readonly meetingGroup: MeetingGroup,
    private readonly memberId: MemberId,
  ) {}
  isBroken(): boolean {
    return !this.meetingGroup.isOrganizer(this.memberId);
  }
  get message(): string {
    return 'Meeting commenting can be disabled only by group organizer';
  }
}

export class MeetingCommentingConfiguration extends AggregateRoot {
  readonly meetingId: MeetingId;
  private _isEnabled: boolean;

  private constructor(meetingId: MeetingId, isEnabled: boolean) {
    super();
    this.meetingId = meetingId;
    this._isEnabled = isEnabled;
  }

  static create(meetingId: MeetingId): MeetingCommentingConfiguration {
    return new MeetingCommentingConfiguration(meetingId, true);
  }

  static reconstitute(
    meetingId: string,
    isEnabled: boolean,
  ): MeetingCommentingConfiguration {
    return new MeetingCommentingConfiguration(new MeetingId(meetingId), isEnabled);
  }

  enable(meetingGroup: MeetingGroup, memberId: MemberId): void {
    this.checkRule(
      new MeetingCommentingCanBeEnabledOnlyByGroupOrganizerRule(meetingGroup, memberId),
    );
    this._isEnabled = true;
  }

  disable(meetingGroup: MeetingGroup, memberId: MemberId): void {
    this.checkRule(
      new MeetingCommentingCanBeDisabledOnlyByGroupOrganizerRule(meetingGroup, memberId),
    );
    this._isEnabled = false;
  }

  get isEnabled(): boolean {
    return this._isEnabled;
  }
}
