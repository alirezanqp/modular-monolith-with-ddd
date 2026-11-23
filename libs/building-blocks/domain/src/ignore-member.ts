import 'reflect-metadata';

export class IgnoreMember {
  static readonly METADATA_KEY = 'building-blocks:ignore-member';

  static decorate(): PropertyDecorator {
    return (target: object, propertyKey: string | symbol) => {
      Reflect.defineMetadata(IgnoreMember.METADATA_KEY, true, target, propertyKey);
    };
  }
}

export const IgnoreMemberDecorator = IgnoreMember.decorate;
