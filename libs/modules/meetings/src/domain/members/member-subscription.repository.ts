import { MemberSubscription } from './member-subscription';
import { MemberSubscriptionId } from '../shared/typed-ids';

export interface IMemberSubscriptionRepository {
  add(subscription: MemberSubscription): Promise<void>;
  update(subscription: MemberSubscription): Promise<void>;
  getById(id: MemberSubscriptionId): Promise<MemberSubscription | null>;
}
