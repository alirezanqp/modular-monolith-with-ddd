import { MeetingMemberCommentLike } from './meeting-member-comment-like';
import { MeetingCommentId, MemberId } from '../shared/typed-ids';

export interface IMeetingMemberCommentLikesRepository {
  add(like: MeetingMemberCommentLike): Promise<void>;
  remove(meetingCommentId: MeetingCommentId, memberId: MemberId): Promise<void>;
  countForMember(meetingCommentId: MeetingCommentId, memberId: MemberId): Promise<number>;
}
