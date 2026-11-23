import { Entity } from '@building-blocks/domain';
import { MeetingGroupId, MemberId } from '../shared/typed-ids';
import { MeetingGroupMemberRole } from './meeting-group-member-role';
import { NewMeetingGroupMemberJoinedDomainEvent } from './events';

export class MeetingGroupMember extends Entity {
  readonly meetingGroupId: MeetingGroupId;
  readonly memberId: MemberId;
  private _role: MeetingGroupMemberRole;
  private _joinedDate: Date;
  private _isActive: boolean;
  private _leaveDate: Date | null;

  private constructor(
    meetingGroupId: MeetingGroupId,
    memberId: MemberId,
    role: MeetingGroupMemberRole,
    joinedDate: Date,
    isActive: boolean,
    leaveDate: Date | null,
  ) {
    super();
    this.meetingGroupId = meetingGroupId;
    this.memberId = memberId;
    this._role = role;
    this._joinedDate = joinedDate;
    this._isActive = isActive;
    this._leaveDate = leaveDate;
  }

  static createNew(
    meetingGroupId: MeetingGroupId,
    memberId: MemberId,
    role: MeetingGroupMemberRole,
  ): MeetingGroupMember {
    const member = new MeetingGroupMember(
      meetingGroupId,
      memberId,
      role,
      new Date(),
      true,
      null,
    );
    member.addDomainEvent(
      new NewMeetingGroupMemberJoinedDomainEvent(meetingGroupId, memberId, role.value),
    );
    return member;
  }

  static reconstitute(props: {
    meetingGroupId: string;
    memberId: string;
    roleCode: string;
    joinedDate: Date;
    isActive: boolean;
    leaveDate: Date | null;
  }): MeetingGroupMember {
    return new MeetingGroupMember(
      new MeetingGroupId(props.meetingGroupId),
      new MemberId(props.memberId),
      MeetingGroupMemberRole.of(props.roleCode),
      props.joinedDate,
      props.isActive,
      props.leaveDate,
    );
  }

  leave(): void {
    this._isActive = false;
    this._leaveDate = new Date();
  }

  isMember(memberId: MemberId): boolean {
    return this.memberId.equals(memberId) && this._isActive;
  }

  isOrganizer(memberId: MemberId): boolean {
    return this.isMember(memberId) && this._role.equals(MeetingGroupMemberRole.Organizer);
  }

  get role(): MeetingGroupMemberRole {
    return this._role;
  }

  get joinedDate(): Date {
    return this._joinedDate;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get leaveDate(): Date | null {
    return this._leaveDate;
  }
}
