import { TypedIdValueBase } from '@building-blocks/domain';

export class UserId extends TypedIdValueBase {
  constructor(value?: string) {
    super(value);
  }
}
