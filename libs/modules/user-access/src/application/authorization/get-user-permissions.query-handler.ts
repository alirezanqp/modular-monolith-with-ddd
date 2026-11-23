import { IQueryHandler, ISqlConnectionFactory } from '@building-blocks/application';
import { releaseIfNotInTransaction } from '@building-blocks/infrastructure';
import {
  GetAuthenticatedUserPermissionsQuery,
  GetUserPermissionsQuery,
} from './get-user-permissions.query';

async function loadPermissions(
  sqlConnectionFactory: ISqlConnectionFactory,
  userId: string,
): Promise<string[]> {
  const connection = await sqlConnectionFactory.getOpenConnection();
  try {
    const result = await connection.query(
      `SELECT permission_code FROM users.v_user_permissions WHERE user_id = $1`,
      [userId],
    );
    return result.rows.map((row: { permission_code: string }) => row.permission_code);
  } finally {
    releaseIfNotInTransaction(connection);
  }
}

export class GetUserPermissionsQueryHandler
  implements IQueryHandler<GetUserPermissionsQuery, string[]>
{
  constructor(private readonly sqlConnectionFactory: ISqlConnectionFactory) {}

  handle(query: GetUserPermissionsQuery): Promise<string[]> {
    return loadPermissions(this.sqlConnectionFactory, query.userId);
  }
}

export class GetAuthenticatedUserPermissionsQueryHandler
  implements IQueryHandler<GetAuthenticatedUserPermissionsQuery, string[]>
{
  constructor(private readonly sqlConnectionFactory: ISqlConnectionFactory) {}

  handle(query: GetAuthenticatedUserPermissionsQuery): Promise<string[]> {
    return loadPermissions(this.sqlConnectionFactory, query.userId);
  }
}
