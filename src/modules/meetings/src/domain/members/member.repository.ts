import { Member } from './member';
import { MemberId } from '../shared/typed-ids';

export interface IMemberRepository {
  add(member: Member): Promise<void>;
  getById(id: MemberId): Promise<Member | null>;
}
