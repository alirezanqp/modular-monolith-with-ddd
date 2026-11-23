import { AggregateRoot } from '@building-blocks/domain';
import { MeetingCommentId, MeetingMemberCommentLikeId, MemberId } from '../shared/typed-ids';

export class MeetingMemberCommentLike extends AggregateRoot {
  readonly id: MeetingMemberCommentLikeId;
  readonly meetingCommentId: MeetingCommentId;
  readonly memberId: MemberId;

  private constructor(
    id: MeetingMemberCommentLikeId,
    meetingCommentId: MeetingCommentId,
    memberId: MemberId,
  ) {
    super();
    this.id = id;
    this.meetingCommentId = meetingCommentId;
    this.memberId = memberId;
  }

  static create(
    meetingCommentId: MeetingCommentId,
    memberId: MemberId,
  ): MeetingMemberCommentLike {
    return new MeetingMemberCommentLike(
      new MeetingMemberCommentLikeId(),
      meetingCommentId,
      memberId,
    );
  }

  static reconstitute(props: {
    id: string;
    meetingCommentId: string;
    memberId: string;
  }): MeetingMemberCommentLike {
    return new MeetingMemberCommentLike(
      new MeetingMemberCommentLikeId(props.id),
      new MeetingCommentId(props.meetingCommentId),
      new MemberId(props.memberId),
    );
  }
}
