import { AggregateRoot } from '@building-blocks/domain';
import { MeetingCommentId } from './meeting-comment-id';

export class MeetingComment extends AggregateRoot {
  readonly id: MeetingCommentId;
  private meetingId = '';
  private authorId = '';
  private inReplyToCommentId: string | null = null;
  private comment = '';
  private createDate = new Date();

  private constructor(id: MeetingCommentId) {
    super();
    this.id = id;
  }

  static create(
    meetingId: string,
    authorId: string,
    comment: string,
    commentingEnabled: boolean,
  ): MeetingComment {
    if (!commentingEnabled) {
      throw new Error('Comment can be created only if commenting for meeting enabled');
    }
    if (!comment || !comment.trim()) {
      throw new Error('Comment text must be provided');
    }
    const entity = new MeetingComment(new MeetingCommentId());
    entity.meetingId = meetingId;
    entity.authorId = authorId;
    entity.comment = comment;
    entity.createDate = new Date();
    return entity;
  }

  getMeetingId(): string {
    return this.meetingId;
  }
  getAuthorId(): string {
    return this.authorId;
  }
  getInReplyToCommentId(): string | null {
    return this.inReplyToCommentId;
  }
  getComment(): string {
    return this.comment;
  }
  getCreateDate(): Date {
    return this.createDate;
  }
}
