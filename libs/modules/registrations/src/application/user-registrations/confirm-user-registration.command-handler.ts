import { ICommandHandler } from '@building-blocks/application';
import { UnitOfWork } from '@building-blocks/infrastructure';
import { UserRegistrationId } from '../../domain/user-registrations/user-registration-id';
import { ConfirmUserRegistrationCommand } from './confirm-user-registration.command';
import { IUserRegistrationRepository } from './user-registration.repository';

export class ConfirmUserRegistrationCommandHandler
  implements ICommandHandler<ConfirmUserRegistrationCommand>
{
  constructor(
    private readonly repository: IUserRegistrationRepository,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async handle(command: ConfirmUserRegistrationCommand): Promise<void> {
    const registration = await this.repository.getById(
      new UserRegistrationId(command.userRegistrationId),
    );
    registration.confirm();
    await this.repository.update(registration);
    this.unitOfWork.trackAggregate(registration);
  }
}
