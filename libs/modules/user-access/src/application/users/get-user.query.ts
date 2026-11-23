import { QueryBase } from '@building-blocks/application';

export interface UserDto {
  id: string;
  login: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  isActive: boolean;
}

export class GetUserQuery extends QueryBase<UserDto | null> {
  constructor(readonly userId: string) {
    super();
  }
}

export class GetAuthenticatedUserQuery extends QueryBase<UserDto | null> {
  constructor(readonly userId: string) {
    super();
  }
}
