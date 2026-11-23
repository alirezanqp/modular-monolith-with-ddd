import { IQueryHandler, ISqlConnectionFactory } from '@building-blocks/application';
import { releaseIfNotInTransaction } from '@building-blocks/infrastructure';
import { GetAuthenticatedUserQuery, GetUserQuery, UserDto } from './get-user.query';

function mapUserRow(row: {
  id: string;
  login: string;
  email: string;
  first_name: string;
  last_name: string;
  name: string;
  is_active: boolean;
}): UserDto {
  return {
    id: row.id,
    login: row.login,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    name: row.name,
    isActive: row.is_active,
  };
}

export class GetUserQueryHandler implements IQueryHandler<GetUserQuery, UserDto | null> {
  constructor(private readonly sqlConnectionFactory: ISqlConnectionFactory) {}

  async handle(query: GetUserQuery): Promise<UserDto | null> {
    const connection = await this.sqlConnectionFactory.getOpenConnection();
    try {
      const result = await connection.query(
        `SELECT id, login, email, first_name, last_name, name, is_active
         FROM users.v_users WHERE id = $1`,
        [query.userId],
      );
      const row = result.rows[0] as
        | {
            id: string;
            login: string;
            email: string;
            first_name: string;
            last_name: string;
            name: string;
            is_active: boolean;
          }
        | undefined;
      return row ? mapUserRow(row) : null;
    } finally {
      releaseIfNotInTransaction(connection);
    }
  }
}

export class GetAuthenticatedUserQueryHandler
  implements IQueryHandler<GetAuthenticatedUserQuery, UserDto | null>
{
  constructor(private readonly inner: GetUserQueryHandler) {}

  handle(query: GetAuthenticatedUserQuery): Promise<UserDto | null> {
    return this.inner.handle(new GetUserQuery(query.userId));
  }
}
