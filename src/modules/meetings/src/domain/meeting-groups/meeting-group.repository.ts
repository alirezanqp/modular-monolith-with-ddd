import { MeetingGroup } from './meeting-group';
import { MeetingGroupId } from '../shared/typed-ids';

export interface IMeetingGroupRepository {
  add(meetingGroup: MeetingGroup): Promise<void>;
  update(meetingGroup: MeetingGroup): Promise<void>;
  getById(id: MeetingGroupId): Promise<MeetingGroup | null>;
}
