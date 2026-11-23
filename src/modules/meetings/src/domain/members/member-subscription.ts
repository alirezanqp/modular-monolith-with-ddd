import { AggregateRoot } from '@building-blocks/domain';
import { MemberId, MemberSubscriptionId } from '../shared/typed-ids';

export class MemberSubscription extends AggregateRoot {
  readonly id: MemberSubscriptionId;
  private _expirationDate: Date;

  private constructor(id: MemberSubscriptionId, expirationDate: Date) {
    super();
    this.id = id;
    this._expirationDate = expirationDate;
  }

  static createForMember(memberId: MemberId, expirationDate: Date): MemberSubscription {
    return new MemberSubscription(MemberSubscriptionId.ofMember(memberId), expirationDate);
  }

  static reconstitute(memberId: string, expirationDate: Date): MemberSubscription {
    return new MemberSubscription(new MemberSubscriptionId(memberId), expirationDate);
  }

  changeExpirationDate(expirationDate: Date): void {
    this._expirationDate = expirationDate;
  }

  get expirationDate(): Date {
    return this._expirationDate;
  }
}
