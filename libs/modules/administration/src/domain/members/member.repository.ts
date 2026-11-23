import { Member } from './member';
import { MemberId } from './member-id';

export interface IMemberRepository {
  add(member: Member): Promise<void>;
  getById(id: MemberId): Promise<Member | null>;
}
