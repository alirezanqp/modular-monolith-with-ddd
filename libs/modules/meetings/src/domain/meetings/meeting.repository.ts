import { Meeting } from './meeting';
import { MeetingId } from '../shared/typed-ids';

export interface IMeetingRepository {
  add(meeting: Meeting): Promise<void>;
  update(meeting: Meeting): Promise<void>;
  getById(id: MeetingId): Promise<Meeting | null>;
}
