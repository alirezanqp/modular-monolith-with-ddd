import { IgnoreMember } from './ignore-member';

export abstract class ValueObject {
  public equals(object?: ValueObject): boolean {
    if (object === null || object === undefined) {
      return false;
    }

    if (object.constructor.name !== this.constructor.name) {
      return false;
    }

    return this.valuesEqual(this, object);
  }

  private valuesEqual(left: ValueObject, right: ValueObject): boolean {
    const leftProps = this.getComparableProperties(left);
    const rightProps = this.getComparableProperties(right);

    if (leftProps.length !== rightProps.length) {
      return false;
    }

    for (let i = 0; i < leftProps.length; i++) {
      const leftValue = (left as unknown as Record<string, unknown>)[leftProps[i]];
      const rightValue = (right as unknown as Record<string, unknown>)[rightProps[i]];

      if (leftValue instanceof ValueObject && rightValue instanceof ValueObject) {
        if (!leftValue.equals(rightValue)) {
          return false;
        }
        continue;
      }

      if (leftValue !== rightValue) {
        return false;
      }
    }

    return true;
  }

  private getComparableProperties(valueObject: ValueObject): string[] {
    return Object.getOwnPropertyNames(valueObject).filter((name) => {
      const descriptor = Object.getOwnPropertyDescriptor(valueObject, name);
      if (!descriptor) {
        return false;
      }

      const ignored = Reflect.getMetadata(
        IgnoreMember.METADATA_KEY,
        valueObject.constructor.prototype,
        name,
      );

      return !ignored;
    });
  }
}
