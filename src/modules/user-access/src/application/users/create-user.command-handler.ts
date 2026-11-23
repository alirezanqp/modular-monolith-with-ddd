import { ICommandHandler } from '@building-blocks/application';
import { UnitOfWork } from '@building-blocks/infrastructure';
import { User } from '../../domain/users/user';
import { UserId } from '../../domain/users/user-id';
import { CreateUserCommand } from './create-user.command';
import { IUserRepository } from './user.repository';

export class CreateUserCommandHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async handle(command: CreateUserCommand): Promise<void> {
    const existing = await this.userRepository.findById(new UserId(command.userId));
    if (existing) {
      return;
    }

    const user = User.createFromUserRegistration(
      new UserId(command.userId),
      command.login,
      command.password,
      command.email,
      command.firstName,
      command.lastName,
    );

    await this.userRepository.add(user);
    this.unitOfWork.trackAggregate(user);
  }
}
