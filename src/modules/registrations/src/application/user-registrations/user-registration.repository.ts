import { UserRegistration } from '../../domain/user-registrations/user-registration';
import { UserRegistrationId } from '../../domain/user-registrations/user-registration-id';

export interface IUserRegistrationRepository {
  add(registration: UserRegistration): Promise<void>;
  getById(id: UserRegistrationId): Promise<UserRegistration>;
  update(registration: UserRegistration): Promise<void>;
}
