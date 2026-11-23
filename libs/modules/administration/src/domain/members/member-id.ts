import { TypedIdValueBase } from '@building-blocks/domain';

export class MemberId extends TypedIdValueBase {
  constructor(value?: string) {
    super(value);
  }
}
