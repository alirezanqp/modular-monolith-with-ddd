import { ICommandHandler, ISqlConnectionFactory } from '@building-blocks/application';
import { releaseIfNotInTransaction } from '@building-blocks/infrastructure';
import { CreateMemberCommand } from './create-member.command';
export class CreateMemberCommandHandler implements ICommandHandler<CreateMemberCommand> {
  constructor(private readonly sql: ISqlConnectionFactory) {}
  async handle(command: CreateMemberCommand): Promise<void> {
    const client = await this.sql.getOpenConnection();
    try {
      await client.query(
        `INSERT INTO administration.members (id, login, email, first_name, last_name, name)
         VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING`,
        [command.memberId, command.login, command.email, command.firstName, command.lastName, `${command.firstName} ${command.lastName}`],
      );
    } finally { releaseIfNotInTransaction(client); }
  }
}
