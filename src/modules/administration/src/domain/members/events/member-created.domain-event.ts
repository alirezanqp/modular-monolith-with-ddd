import { DomainEventBase } from '@building-blocks/domain';
import { MemberId } from '../member-id';

export class MemberCreatedDomainEvent extends DomainEventBase {
  constructor(public readonly memberId: MemberId) {
    super();
  }
}
