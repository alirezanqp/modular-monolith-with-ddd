import { IBusinessRule } from '@building-blocks/domain';
import { UserRegistrationStatus } from '../user-registration-status';

export class UserRegistrationCannotBeConfirmedMoreThanOnceRule implements IBusinessRule {
  constructor(private readonly status: string) {}
  isBroken(): boolean {
    return this.status === UserRegistrationStatus.Confirmed;
  }
  get message(): string {
    return 'User Registration cannot be confirmed more than once';
  }
}
