import { randomUUID } from 'crypto';
import { ValueObject } from './value-object';

export abstract class TypedIdValueBase extends ValueObject {
  readonly value: string;

  protected constructor(value?: string) {
    super();
    this.value = value ?? randomUUID();
  }

  equals(other?: ValueObject): boolean {
    if (!(other instanceof TypedIdValueBase)) {
      return false;
    }
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
