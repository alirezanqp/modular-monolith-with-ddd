import { Entity } from '@building-blocks/domain';
import { MeetingId, MemberId } from '../shared/typed-ids';
import { MeetingNotAttendeeAddedDomainEvent } from './events';

export class MeetingNotAttendee extends Entity {
  readonly meetingId: MeetingId;
  readonly memberId: MemberId;
  private _decisionDate: Date;
  private _decisionChanged: boolean;
  private _decisionChangeDate: Date | null;

  private constructor(
    meetingId: MeetingId,
    memberId: MemberId,
    decisionDate: Date,
    decisionChanged: boolean,
    decisionChangeDate: Date | null,
  ) {
    super();
    this.meetingId = meetingId;
    this.memberId = memberId;
    this._decisionDate = decisionDate;
    this._decisionChanged = decisionChanged;
    this._decisionChangeDate = decisionChangeDate;
  }

  static createNew(meetingId: MeetingId, memberId: MemberId): MeetingNotAttendee {
    const notAttendee = new MeetingNotAttendee(meetingId, memberId, new Date(), false, null);
    notAttendee.addDomainEvent(new MeetingNotAttendeeAddedDomainEvent(meetingId, memberId));
    return notAttendee;
  }

  static reconstitute(props: {
    meetingId: string;
    memberId: string;
    decisionDate: Date;
    decisionChanged: boolean;
    decisionChangeDate: Date | null;
  }): MeetingNotAttendee {
    return new MeetingNotAttendee(
      new MeetingId(props.meetingId),
      new MemberId(props.memberId),
      props.decisionDate,
      props.decisionChanged,
      props.decisionChangeDate,
    );
  }

  changeDecision(): void {
    this._decisionChanged = true;
    this._decisionChangeDate = new Date();
  }

  isActiveNotAttendee(memberId: MemberId): boolean {
    return this.memberId.equals(memberId) && !this._decisionChanged;
  }

  get decisionDate(): Date {
    return this._decisionDate;
  }

  get decisionChanged(): boolean {
    return this._decisionChanged;
  }

  get decisionChangeDate(): Date | null {
    return this._decisionChangeDate;
  }
}
