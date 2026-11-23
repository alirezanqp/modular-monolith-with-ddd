import { ICommandHandler } from '@building-blocks/application';
import { UnitOfWork } from '@building-blocks/infrastructure';
import { Member } from '../../domain/members/member';
import { MemberId } from '../../domain/members/member-id';
import { IMemberRepository } from '../../domain/members/member.repository';
import { CreateMemberCommand } from './create-member.command';

export class CreateMemberCommandHandler implements ICommandHandler<CreateMemberCommand> {
  constructor(
    private readonly repository: IMemberRepository,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async handle(command: CreateMemberCommand): Promise<void> {
    const existing = await this.repository.getById(new MemberId(command.memberId));
    if (existing) {
      return;
    }

    const member = Member.create(
      command.memberId,
      command.login,
      command.email,
      command.firstName,
      command.lastName,
      command.name,
    );
    await this.repository.add(member);
    this.unitOfWork.trackAggregate(member);
  }
}
