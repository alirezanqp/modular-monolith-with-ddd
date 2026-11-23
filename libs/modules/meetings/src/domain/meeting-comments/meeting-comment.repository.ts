import { MeetingComment } from './meeting-comment';
import { MeetingCommentId } from '../shared/typed-ids';

export interface IMeetingCommentRepository {
  add(comment: MeetingComment): Promise<void>;
  update(comment: MeetingComment): Promise<void>;
  getById(id: MeetingCommentId): Promise<MeetingComment | null>;
}
