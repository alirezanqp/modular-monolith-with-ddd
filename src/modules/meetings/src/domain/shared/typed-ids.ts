import { TypedIdValueBase } from '@building-blocks/domain';

export class MemberId extends TypedIdValueBase {
  constructor(value?: string) {
    super(value);
  }
}

export class MeetingGroupId extends TypedIdValueBase {
  constructor(value?: string) {
    super(value);
  }
}

export class MeetingId extends TypedIdValueBase {
  constructor(value?: string) {
    super(value);
  }
}

export class MeetingGroupProposalId extends TypedIdValueBase {
  constructor(value?: string) {
    super(value);
  }
}

export class MeetingCommentId extends TypedIdValueBase {
  constructor(value?: string) {
    super(value);
  }
}

export class MeetingMemberCommentLikeId extends TypedIdValueBase {
  constructor(value?: string) {
    super(value);
  }
}

export class MemberSubscriptionId extends TypedIdValueBase {
  constructor(value?: string) {
    super(value);
  }

  static ofMember(memberId: MemberId): MemberSubscriptionId {
    return new MemberSubscriptionId(memberId.value);
  }
}
