import { BusinessRuleValidationException, IBusinessRule } from './business-rule';
import { IDomainEvent } from './domain-event';
import { IgnoreMemberDecorator } from './ignore-member';

export abstract class Entity {
  @IgnoreMemberDecorator()
  private _domainEvents: IDomainEvent[] = [];

  get domainEvents(): ReadonlyArray<IDomainEvent> {
    return this._domainEvents;
  }

  protected addDomainEvent(domainEvent: IDomainEvent): void {
    this._domainEvents.push(domainEvent);
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  protected checkRule(rule: IBusinessRule): void {
    if (rule.isBroken()) {
      throw new BusinessRuleValidationException(rule);
    }
  }
}
