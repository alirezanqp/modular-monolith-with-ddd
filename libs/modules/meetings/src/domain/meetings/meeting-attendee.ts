import { Entity, IBusinessRule } from '@building-blocks/domain';
import { MeetingAttendeeChangedDecisionDomainEvent } from '../meeting-groups/events';
import { MeetingId, MemberId } from '../shared/typed-ids';
import { MoneyValue } from '../shared/value-objects';
import {
  MeetingAttendeeAddedDomainEvent,
  MeetingAttendeeRemovedDomainEvent,
  MemberSetAsAttendeeDomainEvent,
  NewMeetingHostSetDomainEvent,
} from './events';
import { MeetingAttendeeRole } from './meeting-attendee-role';

class ReasonOfRemovingAttendeeFromMeetingMustBeProvidedRule implements IBusinessRule {
  constructor(private readonly reason: string) {}
  isBroken(): boolean {
    return !this.reason || this.reason.trim().length === 0;
  }
  get message(): string {
    return 'Reason of removing attendee from meeting must be provided';
  }
}

class MemberCannotHaveSetAttendeeRoleMoreThanOnceRule implements IBusinessRule {
  constructor(private readonly role: MeetingAttendeeRole) {}
  isBroken(): boolean {
    return this.role.equals(MeetingAttendeeRole.Attendee);
  }
  get message(): string {
    return 'Member cannot have set attendee role more than once';
  }
}

export class MeetingAttendee extends Entity {
  readonly attendeeId: MemberId;
  readonly meetingId: MeetingId;
  private _decisionDate: Date;
  private _role: MeetingAttendeeRole;
  private _guestsNumber: number;
  private _decisionChanged: boolean;
  private _decisionChangeDate: Date | null;
  private _removedDate: Date | null;
  private _removingMemberId: MemberId | null;
  private _removingReason: string | null;
  private _isRemoved: boolean;
  private _fee: MoneyValue;
  private _isFeePaid: boolean;

  private constructor(
    meetingId: MeetingId,
    attendeeId: MemberId,
    decisionDate: Date,
    role: MeetingAttendeeRole,
    guestsNumber: number,
    fee: MoneyValue,
    decisionChanged: boolean,
    decisionChangeDate: Date | null,
    isRemoved: boolean,
    removedDate: Date | null,
    removingMemberId: MemberId | null,
    removingReason: string | null,
    isFeePaid: boolean,
  ) {
    super();
    this.meetingId = meetingId;
    this.attendeeId = attendeeId;
    this._decisionDate = decisionDate;
    this._role = role;
    this._guestsNumber = guestsNumber;
    this._fee = fee;
    this._decisionChanged = decisionChanged;
    this._decisionChangeDate = decisionChangeDate;
    this._isRemoved = isRemoved;
    this._removedDate = removedDate;
    this._removingMemberId = removingMemberId;
    this._removingReason = removingReason;
    this._isFeePaid = isFeePaid;
  }

  static createNew(
    meetingId: MeetingId,
    attendeeId: MemberId,
    decisionDate: Date,
    role: MeetingAttendeeRole,
    guestsNumber: number,
    eventFee: MoneyValue,
  ): MeetingAttendee {
    const fee = eventFee.isUndefined
      ? MoneyValue.Undefined
      : eventFee.multiply(1 + guestsNumber);

    const attendee = new MeetingAttendee(
      meetingId,
      attendeeId,
      decisionDate,
      role,
      guestsNumber,
      fee,
      false,
      null,
      false,
      null,
      null,
      null,
      false,
    );

    attendee.addDomainEvent(
      new MeetingAttendeeAddedDomainEvent(
        meetingId,
        attendeeId,
        decisionDate,
        role.value,
        guestsNumber,
        fee.value,
        fee.currency,
      ),
    );
    return attendee;
  }

  static reconstitute(props: {
    meetingId: string;
    attendeeId: string;
    decisionDate: Date;
    roleCode: string;
    guestsNumber: number;
    feeValue: number | null;
    feeCurrency: string | null;
    decisionChanged: boolean;
    decisionChangeDate: Date | null;
    isRemoved: boolean;
    removedDate: Date | null;
    removingMemberId: string | null;
    removingReason: string | null;
    isFeePaid: boolean;
  }): MeetingAttendee {
    return new MeetingAttendee(
      new MeetingId(props.meetingId),
      new MemberId(props.attendeeId),
      props.decisionDate,
      MeetingAttendeeRole.of(props.roleCode),
      props.guestsNumber,
      props.feeValue === null
        ? MoneyValue.Undefined
        : MoneyValue.of(props.feeValue, props.feeCurrency ?? 'USD'),
      props.decisionChanged,
      props.decisionChangeDate,
      props.isRemoved,
      props.removedDate,
      props.removingMemberId ? new MemberId(props.removingMemberId) : null,
      props.removingReason,
      props.isFeePaid,
    );
  }

  changeDecision(): void {
    this._decisionChanged = true;
    this._decisionChangeDate = new Date();
    this.addDomainEvent(
      new MeetingAttendeeChangedDecisionDomainEvent(this.attendeeId, this.meetingId.value),
    );
  }

  isActiveAttendee(attendeeId: MemberId): boolean {
    return this.attendeeId.equals(attendeeId) && !this._decisionChanged && !this._isRemoved;
  }

  isActive(): boolean {
    return !this._decisionChangeDate && !this._isRemoved;
  }

  isActiveHost(): boolean {
    return this.isActive() && this._role.equals(MeetingAttendeeRole.Host);
  }

  getAttendeeWithGuestsNumber(): number {
    return 1 + this._guestsNumber;
  }

  setAsHost(): void {
    this._role = MeetingAttendeeRole.Host;
    this.addDomainEvent(new NewMeetingHostSetDomainEvent(this.meetingId, this.attendeeId));
  }

  setAsAttendee(): void {
    this.checkRule(new MemberCannotHaveSetAttendeeRoleMoreThanOnceRule(this._role));
    this._role = MeetingAttendeeRole.Attendee;
    this.addDomainEvent(new MemberSetAsAttendeeDomainEvent(this.meetingId, this.attendeeId));
  }

  remove(removingMemberId: MemberId, reason: string): void {
    this.checkRule(new ReasonOfRemovingAttendeeFromMeetingMustBeProvidedRule(reason));
    this._isRemoved = true;
    this._removedDate = new Date();
    this._removingReason = reason;
    this._removingMemberId = removingMemberId;
    this.addDomainEvent(
      new MeetingAttendeeRemovedDomainEvent(this.attendeeId, this.meetingId, reason),
    );
  }

  get role(): MeetingAttendeeRole {
    return this._role;
  }

  get guestsNumber(): number {
    return this._guestsNumber;
  }

  get decisionDate(): Date {
    return this._decisionDate;
  }

  get fee(): MoneyValue {
    return this._fee;
  }

  get decisionChanged(): boolean {
    return this._decisionChanged;
  }

  get decisionChangeDate(): Date | null {
    return this._decisionChangeDate;
  }

  get isRemoved(): boolean {
    return this._isRemoved;
  }

  get removedDate(): Date | null {
    return this._removedDate;
  }

  get removingMemberId(): MemberId | null {
    return this._removingMemberId;
  }

  get removingReason(): string | null {
    return this._removingReason;
  }

  get isFeePaid(): boolean {
    return this._isFeePaid;
  }
}
