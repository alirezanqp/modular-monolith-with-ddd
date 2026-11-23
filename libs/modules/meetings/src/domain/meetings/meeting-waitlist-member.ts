import { Entity } from '@building-blocks/domain';
import { MeetingId, MemberId } from '../shared/typed-ids';
import {
  MeetingWaitlistMemberAddedDomainEvent,
  MemberSignedOffFromMeetingWaitlistDomainEvent,
} from './events';

export class MeetingWaitlistMember extends Entity {
  readonly meetingId: MeetingId;
  readonly memberId: MemberId;
  readonly signUpDate: Date;
  private _isSignedOff: boolean;
  private _signOffDate: Date | null;
  private _isMovedToAttendees: boolean;
  private _movedToAttendeesDate: Date | null;

  private constructor(
    meetingId: MeetingId,
    memberId: MemberId,
    signUpDate: Date,
    isSignedOff: boolean,
    signOffDate: Date | null,
    isMovedToAttendees: boolean,
    movedToAttendeesDate: Date | null,
  ) {
    super();
    this.meetingId = meetingId;
    this.memberId = memberId;
    this.signUpDate = signUpDate;
    this._isSignedOff = isSignedOff;
    this._signOffDate = signOffDate;
    this._isMovedToAttendees = isMovedToAttendees;
    this._movedToAttendeesDate = movedToAttendeesDate;
  }

  static createNew(meetingId: MeetingId, memberId: MemberId): MeetingWaitlistMember {
    const member = new MeetingWaitlistMember(
      meetingId,
      memberId,
      new Date(),
      false,
      null,
      false,
      null,
    );
    member.addDomainEvent(new MeetingWaitlistMemberAddedDomainEvent(meetingId, memberId));
    return member;
  }

  static reconstitute(props: {
    meetingId: string;
    memberId: string;
    signUpDate: Date;
    isSignedOff: boolean;
    signOffDate: Date | null;
    isMovedToAttendees: boolean;
    movedToAttendeesDate: Date | null;
  }): MeetingWaitlistMember {
    return new MeetingWaitlistMember(
      new MeetingId(props.meetingId),
      new MemberId(props.memberId),
      props.signUpDate,
      props.isSignedOff,
      props.signOffDate,
      props.isMovedToAttendees,
      props.movedToAttendeesDate,
    );
  }

  isActive(): boolean {
    return !this._isSignedOff && !this._isMovedToAttendees;
  }

  isActiveOnWaitList(memberId: MemberId): boolean {
    return this.memberId.equals(memberId) && this.isActive();
  }

  signOff(): void {
    this._isSignedOff = true;
    this._signOffDate = new Date();
    this.addDomainEvent(
      new MemberSignedOffFromMeetingWaitlistDomainEvent(this.meetingId, this.memberId),
    );
  }

  markIsMovedToAttendees(): void {
    this._isMovedToAttendees = true;
    this._movedToAttendeesDate = new Date();
  }

  get isSignedOff(): boolean {
    return this._isSignedOff;
  }

  get signOffDate(): Date | null {
    return this._signOffDate;
  }

  get isMovedToAttendees(): boolean {
    return this._isMovedToAttendees;
  }

  get movedToAttendeesDate(): Date | null {
    return this._movedToAttendeesDate;
  }
}
