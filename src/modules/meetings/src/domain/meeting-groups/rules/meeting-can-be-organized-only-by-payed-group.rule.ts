import { IBusinessRule } from '@building-blocks/domain';

export class MeetingCanBeOrganizedOnlyByPayedGroupRule implements IBusinessRule {
  constructor(private readonly paymentDateTo: Date | null) {}

  isBroken(): boolean {
    if (this.paymentDateTo === null) {
      return false;
    }
    return this.paymentDateTo.getTime() < Date.now();
  }

  get message(): string {
    return 'Meeting can be organized only by paid group';
  }
}
