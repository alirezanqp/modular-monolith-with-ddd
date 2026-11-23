import { IBusinessRule } from '@building-blocks/domain';
import { MeetingGroup } from '../meeting-groups/meeting-group';
import { MemberId } from '../shared/typed-ids';
import { MeetingLimits, MeetingTerm, Term } from '../shared/value-objects';
import { MeetingAttendee } from './meeting-attendee';
import { MeetingNotAttendee } from './meeting-not-attendee';
import { MeetingWaitlistMember } from './meeting-waitlist-member';

export class MeetingCannotBeChangedAfterStartRule implements IBusinessRule {
  constructor(private readonly term: MeetingTerm) {}
  isBroken(): boolean {
    return this.term.hasStarted;
  }
  get message(): string {
    return 'Meeting cannot be changed after start';
  }
}

export class AttendeeCanBeAddedOnlyInRsvpTermRule implements IBusinessRule {
  constructor(private readonly rsvpTerm: Term) {}
  isBroken(): boolean {
    return !this.rsvpTerm.isInTerm(new Date());
  }
  get message(): string {
    return 'Attendee can be added only in RSVP term';
  }
}

export class MeetingAttendeeMustBeAMemberOfGroupRule implements IBusinessRule {
  constructor(
    private readonly attendeeId: MemberId,
    private readonly meetingGroup: MeetingGroup,
  ) {}
  isBroken(): boolean {
    return !this.meetingGroup.isMemberOfGroup(this.attendeeId);
  }
  get message(): string {
    return 'Meeting attendee must be a member of group';
  }
}

export class MemberCannotBeAnAttendeeOfMeetingMoreThanOnceRule implements IBusinessRule {
  constructor(
    private readonly attendeeId: MemberId,
    private readonly attendees: MeetingAttendee[],
  ) {}
  isBroken(): boolean {
    return this.attendees.some((a) => a.isActiveAttendee(this.attendeeId));
  }
  get message(): string {
    return 'Member cannot be an attendee of meeting more than once';
  }
}

export class MeetingGuestsNumberIsAboveLimitRule implements IBusinessRule {
  constructor(
    private readonly guestsLimit: number,
    private readonly guestsNumber: number,
  ) {}
  isBroken(): boolean {
    return this.guestsNumber > this.guestsLimit;
  }
  get message(): string {
    return 'Meeting guests number is above limit';
  }
}

export class MeetingAttendeesNumberIsAboveLimitRule implements IBusinessRule {
  constructor(
    private readonly attendeesLimit: number | null,
    private readonly allActiveAttendeesWithGuestsNumber: number,
    private readonly guestsNumber: number,
  ) {}
  isBroken(): boolean {
    if (this.attendeesLimit === null) return false;
    return this.allActiveAttendeesWithGuestsNumber + 1 + this.guestsNumber > this.attendeesLimit;
  }
  get message(): string {
    return 'Meeting attendees number is above limit';
  }
}

export class MemberCannotBeNotAttendeeTwiceRule implements IBusinessRule {
  constructor(
    private readonly notAttendees: MeetingNotAttendee[],
    private readonly memberId: MemberId,
  ) {}
  isBroken(): boolean {
    return this.notAttendees.some((n) => n.isActiveNotAttendee(this.memberId));
  }
  get message(): string {
    return 'Member cannot be not attendee twice';
  }
}

export class NotActiveNotAttendeeCannotChangeDecisionRule implements IBusinessRule {
  constructor(
    private readonly notAttendees: MeetingNotAttendee[],
    private readonly memberId: MemberId,
  ) {}
  isBroken(): boolean {
    return !this.notAttendees.some((n) => n.isActiveNotAttendee(this.memberId));
  }
  get message(): string {
    return 'Not active not attendee cannot change decision';
  }
}

export class MemberOnWaitlistMustBeAMemberOfGroupRule implements IBusinessRule {
  constructor(
    private readonly meetingGroup: MeetingGroup,
    private readonly memberId: MemberId,
  ) {}
  isBroken(): boolean {
    return !this.meetingGroup.isMemberOfGroup(this.memberId);
  }
  get message(): string {
    return 'Member on waitlist must be a member of group';
  }
}

export class MemberCannotBeMoreThanOnceOnMeetingWaitlistRule implements IBusinessRule {
  constructor(
    private readonly waitlist: MeetingWaitlistMember[],
    private readonly memberId: MemberId,
  ) {}
  isBroken(): boolean {
    return this.waitlist.some((w) => w.isActiveOnWaitList(this.memberId));
  }
  get message(): string {
    return 'Member cannot be more than once on meeting waitlist';
  }
}

export class NotActiveMemberOfWaitlistCannotBeSignedOffRule implements IBusinessRule {
  constructor(
    private readonly waitlist: MeetingWaitlistMember[],
    private readonly memberId: MemberId,
  ) {}
  isBroken(): boolean {
    return !this.waitlist.some((w) => w.isActiveOnWaitList(this.memberId));
  }
  get message(): string {
    return 'Not active member of waitlist cannot be signed off';
  }
}

export class OnlyMeetingOrGroupOrganizerCanSetMeetingMemberRolesRule implements IBusinessRule {
  constructor(
    private readonly settingMemberId: MemberId,
    private readonly meetingGroup: MeetingGroup,
    private readonly attendees: MeetingAttendee[],
  ) {}
  isBroken(): boolean {
    const isGroupOrganizer = this.meetingGroup.isOrganizer(this.settingMemberId);
    const isMeetingHost = this.attendees.some((a) =>
      a.isActiveAttendee(this.settingMemberId) ? a.isActiveHost() : false,
    );
    return !isGroupOrganizer && !isMeetingHost;
  }
  get message(): string {
    return 'Only meeting or group organizer can set meeting member roles';
  }
}

export class OnlyMeetingAttendeeCanHaveChangedRoleRule implements IBusinessRule {
  constructor(
    private readonly attendees: MeetingAttendee[],
    private readonly memberId: MemberId,
  ) {}
  isBroken(): boolean {
    return !this.attendees.some((a) => a.isActiveAttendee(this.memberId));
  }
  get message(): string {
    return 'Only meeting attendee can have changed role';
  }
}

export class MeetingMustHaveAtLeastOneHostRule implements IBusinessRule {
  constructor(private readonly hostsNumber: number) {}
  isBroken(): boolean {
    return this.hostsNumber < 1;
  }
  get message(): string {
    return 'Meeting must have at least one host';
  }
}

export class OnlyActiveAttendeeCanBeRemovedFromMeetingRule implements IBusinessRule {
  constructor(
    private readonly attendees: MeetingAttendee[],
    private readonly attendeeId: MemberId,
  ) {}
  isBroken(): boolean {
    return !this.attendees.some((a) => a.isActiveAttendee(this.attendeeId));
  }
  get message(): string {
    return 'Only active attendee can be removed from meeting';
  }
}

export class AttendeesLimitCannotBeChangedToSmallerThanActiveAttendeesRule
  implements IBusinessRule
{
  constructor(
    private readonly meetingLimits: MeetingLimits,
    private readonly allActiveAttendeesWithGuestsNumber: number,
  ) {}
  isBroken(): boolean {
    if (this.meetingLimits.attendeesLimit === null) return false;
    return this.meetingLimits.attendeesLimit < this.allActiveAttendeesWithGuestsNumber;
  }
  get message(): string {
    return 'Attendees limit cannot be changed to smaller than active attendees';
  }
}
