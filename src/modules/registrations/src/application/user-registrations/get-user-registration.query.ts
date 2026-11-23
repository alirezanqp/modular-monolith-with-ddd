import { QueryBase } from '@building-blocks/application';

export interface UserRegistrationDto {
  id: string;
  login: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  statusCode: string;
  registerDate: Date;
  confirmedDate: Date | null;
}

export class GetUserRegistrationQuery extends QueryBase<UserRegistrationDto | null> {
  constructor(readonly userRegistrationId: string) {
    super();
  }
}
