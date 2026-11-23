import { AggregateRoot } from '@building-blocks/domain';
import { Meeting } from '../meetings/meeting';
import { MeetingGroupCreatedDomainEvent } from './events/meeting-group-created.domain-event';
import { MeetingGroupId } from './meeting-group-id';
import { MeetingCanBeOrganizedOnlyByPayedGroupRule } from './rules/meeting-can-be-organized-only-by-payed-group.rule';
import { MeetingHostMustBeAMeetingGroupMemberRule } from './rules/meeting-host-must-be-group-member.rule';
import { MeetingGroupLocation } from '../shared/meeting-group-location';
import { MoneyValue } from '../shared/money-value';

export interface MeetingGroupMemberState {
  memberId: string;
  joinedDate: Date;
  roleCode: string;
  isActive: boolean;
  leaveDate: Date | null;
}

export class MeetingGroup extends AggregateRoot {
  readonly id: MeetingGroupId;
  private name = '';
  private description = '';
  private locationCity = '';
  private locationCountryCode = '';
  private creatorId = '';
  private createDate = new Date();
  private paymentDateTo: Date | null = null;
  private members: MeetingGroupMemberState[] = [];

  private constructor(id: MeetingGroupId) {
    super();
    this.id = id;
  }

  static createBasedOnProposal(
    meetingGroupProposalId: string,
    name: string,
    description: string,
    location: MeetingGroupLocation,
    creatorId: string,
  ): MeetingGroup {
    const group = new MeetingGroup(new MeetingGroupId(meetingGroupProposalId));
    group.name = name;
    group.description = description;
    group.locationCity = location.city;
    group.locationCountryCode = location.countryCode;
    group.creatorId = creatorId;
    group.createDate = new Date();
    group.members = [
      {
        memberId: creatorId,
        joinedDate: new Date(),
        roleCode: 'Organizer',
        isActive: true,
        leaveDate: null,
      },
    ];
    group.addDomainEvent(
      new MeetingGroupCreatedDomainEvent(group.id.value, creatorId, name),
    );
    return group;
  }

  static restore(props: {
    id: string;
    name: string;
    description: string;
    locationCity: string;
    locationCountryCode: string;
    creatorId: string;
    createDate: Date;
    paymentDateTo: Date | null;
    members: MeetingGroupMemberState[];
  }): MeetingGroup {
    const group = new MeetingGroup(new MeetingGroupId(props.id));
    group.name = props.name;
    group.description = props.description;
    group.locationCity = props.locationCity;
    group.locationCountryCode = props.locationCountryCode;
    group.creatorId = props.creatorId;
    group.createDate = props.createDate;
    group.paymentDateTo = props.paymentDateTo;
    group.members = props.members;
    return group;
  }

  editGeneralAttributes(
    name: string,
    description: string,
    location: MeetingGroupLocation,
  ): void {
    this.name = name;
    this.description = description;
    this.locationCity = location.city;
    this.locationCountryCode = location.countryCode;
  }

  joinToGroup(memberId: string): void {
    if (this.members.some((m) => m.memberId === memberId && m.isActive)) {
      throw new Error('Meeting group member cannot be added twice');
    }
    this.members.push({
      memberId,
      joinedDate: new Date(),
      roleCode: 'Member',
      isActive: true,
      leaveDate: null,
    });
  }

  leaveGroup(memberId: string): void {
    const member = this.members.find((m) => m.memberId === memberId && m.isActive);
    if (!member) {
      throw new Error('Not actual group member cannot leave group');
    }
    member.isActive = false;
    member.leaveDate = new Date();
  }

  setExpirationDate(dateTo: Date): void {
    this.paymentDateTo = dateTo;
  }

  createMeeting(input: {
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
    this.checkRule(new MeetingCanBeOrganizedOnlyByPayedGroupRule(this.paymentDateTo));
    const hosts = input.hostMemberIds.length ? input.hostMemberIds : [input.creatorId];
    this.checkRule(
      new MeetingHostMustBeAMeetingGroupMemberRule(
        input.creatorId,
        hosts,
        this.members.filter((m) => m.isActive).map((m) => m.memberId),
      ),
    );

    return Meeting.createNew({
      meetingGroupId: this.id.value,
      ...input,
      hostMemberIds: hosts,
    });
  }

  isMember(memberId: string): boolean {
    return this.members.some((m) => m.memberId === memberId && m.isActive);
  }

  getName(): string {
    return this.name;
  }
  getDescription(): string {
    return this.description;
  }
  getLocation(): MeetingGroupLocation {
    return MeetingGroupLocation.create(this.locationCity, this.locationCountryCode);
  }
  getCreatorId(): string {
    return this.creatorId;
  }
  getCreateDate(): Date {
    return this.createDate;
  }
  getPaymentDateTo(): Date | null {
    return this.paymentDateTo;
  }
  getMembers(): MeetingGroupMemberState[] {
    return this.members;
  }
}
