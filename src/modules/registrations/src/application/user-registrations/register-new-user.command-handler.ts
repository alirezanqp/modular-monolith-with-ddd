import { ICommandHandlerWithResult } from '@building-blocks/application';
import { UnitOfWork } from '@building-blocks/infrastructure';
import * as bcrypt from 'bcrypt';
import { UserRegistration } from '../../domain/user-registrations/user-registration';
import { UserRegistrationId } from '../../domain/user-registrations/user-registration-id';
import { RegisterNewUserCommand } from './register-new-user.command';
import { IUserRegistrationRepository } from './user-registration.repository';

export class RegisterNewUserCommandHandler
  implements ICommandHandlerWithResult<RegisterNewUserCommand, string>
{
  constructor(
    private readonly repository: IUserRegistrationRepository,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async handle(command: RegisterNewUserCommand): Promise<string> {
    const passwordHash = await bcrypt.hash(command.password, 10);
    const id = new UserRegistrationId();
    const registration = UserRegistration.registerNewUser(
      id,
      command.login,
      passwordHash,
      command.email,
      command.firstName,
      command.lastName,
      command.confirmLink,
    );
    await this.repository.add(registration);
    this.unitOfWork.trackAggregate(registration);
    return id.value;
  }
}
