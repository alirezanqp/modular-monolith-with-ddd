import { AggregateRoot } from '@building-blocks/domain';
import { MeetingAttendeeAddedDomainEvent } from './events/meeting-attendee-added.domain-event';
import { MeetingId } from './meeting-id';
import { MoneyValue } from '../shared/money-value';

export interface MeetingAttendeeState {
  attendeeId: string;
  decisionDate: Date;
  roleCode: string;
  guestsNumber: number;
  isRemoved: boolean;
  removedDate: Date | null;
  isFeePaid: boolean;
}

export interface MeetingWaitlistState {
  memberId: string;
  signUpDate: Date;
  isSignedOff: boolean;
}

export interface MeetingNotAttendeeState {
  memberId: string;
  decisionDate: Date;
}

export class Meeting extends AggregateRoot {
  readonly id: MeetingId;
  private meetingGroupId = '';
  private title = '';
  private termStartDate = new Date();
  private termEndDate = new Date();
  private description = '';
  private locationName = '';
  private locationAddress = '';
  private locationPostalCode = '';
  private locationCity = '';
  private attendeesLimit: number | null = null;
  private guestsLimit = 0;
  private rsvpTermStartDate: Date | null = null;
  private rsvpTermEndDate: Date | null = null;
  private eventFeeValue: number | null = null;
  private eventFeeCurrency: string | null = null;
  private creatorId = '';
  private createDate = new Date();
  private attendees: MeetingAttendeeState[] = [];
  private waitlist: MeetingWaitlistState[] = [];
  private notAttendees: MeetingNotAttendeeState[] = [];
  private isCanceled = false;
  private cancelDate: Date | null = null;

  private constructor(id: MeetingId) {
    super();
    this.id = id;
  }

  static createNew(input: {
    meetingGroupId: string;
    title: string;
    termStart: Date;
    termEnd: Date;
    description: string;
    locationName: string;
    locationAddress: string;
    locationPostalCode: string;
    locationCity: string;
    attendeesLimit: number | null;
    guestsLimit: number;
    rsvpStart: Date | null;
    rsvpEnd: Date | null;
    eventFee: MoneyValue | null;
    hostMemberIds: string[];
    creatorId: string;
  }): Meeting {
    const meeting = new Meeting(new MeetingId());
    meeting.meetingGroupId = input.meetingGroupId;
    meeting.title = input.title;
    meeting.termStartDate = input.termStart;
    meeting.termEndDate = input.termEnd;
    meeting.description = input.description;
    meeting.locationName = input.locationName;
    meeting.locationAddress = input.locationAddress;
    meeting.locationPostalCode = input.locationPostalCode;
    meeting.locationCity = input.locationCity;
    meeting.attendeesLimit = input.attendeesLimit;
    meeting.guestsLimit = input.guestsLimit;
    meeting.rsvpTermStartDate = input.rsvpStart;
    meeting.rsvpTermEndDate = input.rsvpEnd;
    meeting.eventFeeValue = input.eventFee?.value ?? null;
    meeting.eventFeeCurrency = input.eventFee?.currency ?? null;
    meeting.creatorId = input.creatorId;
    meeting.createDate = new Date();

    for (const hostId of input.hostMemberIds) {
      meeting.attendees.push({
        attendeeId: hostId,
        decisionDate: new Date(),
        roleCode: 'Host',
        guestsNumber: 0,
        isRemoved: false,
        removedDate: null,
        isFeePaid: false,
      });
    }
    return meeting;
  }

  static restore(props: {
    id: string;
    meetingGroupId: string;
    title: string;
    termStartDate: Date;
    termEndDate: Date;
    description: string;
    locationName: string;
    locationAddress: string;
    locationPostalCode: string;
    locationCity: string;
    attendeesLimit: number | null;
    guestsLimit: number;
    rsvpTermStartDate: Date | null;
    rsvpTermEndDate: Date | null;
    eventFeeValue: number | null;
    eventFeeCurrency: string | null;
    creatorId: string;
    createDate: Date;
    attendees: MeetingAttendeeState[];
    waitlist: MeetingWaitlistState[];
    notAttendees: MeetingNotAttendeeState[];
    isCanceled: boolean;
    cancelDate: Date | null;
  }): Meeting {
    const meeting = new Meeting(new MeetingId(props.id));
    Object.assign(meeting, {
      meetingGroupId: props.meetingGroupId,
      title: props.title,
      termStartDate: props.termStartDate,
      termEndDate: props.termEndDate,
      description: props.description,
      locationName: props.locationName,
      locationAddress: props.locationAddress,
      locationPostalCode: props.locationPostalCode,
      locationCity: props.locationCity,
      attendeesLimit: props.attendeesLimit,
      guestsLimit: props.guestsLimit,
      rsvpTermStartDate: props.rsvpTermStartDate,
      rsvpTermEndDate: props.rsvpTermEndDate,
      eventFeeValue: props.eventFeeValue,
      eventFeeCurrency: props.eventFeeCurrency,
      creatorId: props.creatorId,
      createDate: props.createDate,
      attendees: props.attendees,
      waitlist: props.waitlist,
      notAttendees: props.notAttendees,
      isCanceled: props.isCanceled,
      cancelDate: props.cancelDate,
    });
    return meeting;
  }

  addAttendee(memberId: string, guestsNumber: number): void {
    if (this.isCanceled) {
      throw new Error('Meeting is canceled');
    }
    if (this.attendees.some((a) => a.attendeeId === memberId && !a.isRemoved)) {
      throw new Error('Member cannot be an attendee of meeting more than once');
    }
    if (guestsNumber > this.guestsLimit) {
      throw new Error('Meeting guests number is above limit');
    }
    if (this.attendeesLimit !== null) {
      const current = this.attendees
        .filter((a) => !a.isRemoved)
        .reduce((sum, a) => sum + 1 + a.guestsNumber, 0);
      if (current + 1 + guestsNumber > this.attendeesLimit) {
        throw new Error('Meeting attendees number is above limit');
      }
    }

    const feeValue =
      this.eventFeeValue === null ? null : this.eventFeeValue * (1 + guestsNumber);
    this.attendees.push({
      attendeeId: memberId,
      decisionDate: new Date(),
      roleCode: 'Attendee',
      guestsNumber,
      isRemoved: false,
      removedDate: null,
      isFeePaid: false,
    });
    this.addDomainEvent(
      new MeetingAttendeeAddedDomainEvent(
        this.id.value,
        memberId,
        feeValue,
        this.eventFeeCurrency,
      ),
    );
  }

  cancel(): void {
    if (!this.isCanceled) {
      this.isCanceled = true;
      this.cancelDate = new Date();
    }
  }

  getMeetingGroupId(): string {
    return this.meetingGroupId;
  }
  getTitle(): string {
    return this.title;
  }
  getTermStartDate(): Date {
    return this.termStartDate;
  }
  getTermEndDate(): Date {
    return this.termEndDate;
  }
  getDescription(): string {
    return this.description;
  }
  getLocationName(): string {
    return this.locationName;
  }
  getLocationAddress(): string {
    return this.locationAddress;
  }
  getLocationPostalCode(): string {
    return this.locationPostalCode;
  }
  getLocationCity(): string {
    return this.locationCity;
  }
  getAttendeesLimit(): number | null {
    return this.attendeesLimit;
  }
  getGuestsLimit(): number {
    return this.guestsLimit;
  }
  getRsvpTermStartDate(): Date | null {
    return this.rsvpTermStartDate;
  }
  getRsvpTermEndDate(): Date | null {
    return this.rsvpTermEndDate;
  }
  getEventFeeValue(): number | null {
    return this.eventFeeValue;
  }
  getEventFeeCurrency(): string | null {
    return this.eventFeeCurrency;
  }
  getCreatorId(): string {
    return this.creatorId;
  }
  getCreateDate(): Date {
    return this.createDate;
  }
  getAttendees(): MeetingAttendeeState[] {
    return this.attendees;
  }
  getCancelDate(): Date | null {
    return this.cancelDate;
  }
  getIsCanceled(): boolean {
    return this.isCanceled;
  }
}
