import { ValueObject } from '@building-blocks/domain';

export class MoneyValue extends ValueObject {
  private constructor(
    readonly value: number,
    readonly currency: string,
  ) {
    super();
  }

  static of(value: number, currency: string): MoneyValue {
    return new MoneyValue(value, currency);
  }

  static free(currency = 'USD'): MoneyValue {
    return new MoneyValue(0, currency);
  }

  isFree(): boolean {
    return this.value === 0;
  }
}
