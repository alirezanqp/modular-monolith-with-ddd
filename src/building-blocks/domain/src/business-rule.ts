export interface IBusinessRule {
  isBroken(): boolean;
  message: string;
}

export class BusinessRuleValidationException extends Error {
  constructor(public readonly brokenRule: IBusinessRule) {
    super(brokenRule.message);
    this.name = 'BusinessRuleValidationException';
  }
}
