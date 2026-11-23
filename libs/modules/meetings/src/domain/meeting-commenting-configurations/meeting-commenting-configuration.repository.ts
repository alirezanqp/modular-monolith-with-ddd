import { MeetingCommentingConfiguration } from './meeting-commenting-configuration';
import { MeetingId } from '../shared/typed-ids';

export interface IMeetingCommentingConfigurationRepository {
  add(configuration: MeetingCommentingConfiguration): Promise<void>;
  update(configuration: MeetingCommentingConfiguration): Promise<void>;
  getByMeetingId(meetingId: MeetingId): Promise<MeetingCommentingConfiguration | null>;
}
