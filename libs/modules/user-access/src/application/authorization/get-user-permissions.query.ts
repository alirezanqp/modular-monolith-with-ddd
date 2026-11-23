import { QueryBase } from '@building-blocks/application';

export class GetUserPermissionsQuery extends QueryBase<string[]> {
  constructor(readonly userId: string) {
    super();
  }
}

export class GetAuthenticatedUserPermissionsQuery extends QueryBase<string[]> {
  constructor(readonly userId: string) {
    super();
  }
}
