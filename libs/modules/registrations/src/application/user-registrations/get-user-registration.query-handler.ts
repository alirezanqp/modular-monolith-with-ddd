import { IQueryHandler, ISqlConnectionFactory } from '@building-blocks/application';
import { releaseIfNotInTransaction } from '@building-blocks/infrastructure';
import { GetUserRegistrationQuery, UserRegistrationDto } from './get-user-registration.query';

export class GetUserRegistrationQueryHandler
  implements IQueryHandler<GetUserRegistrationQuery, UserRegistrationDto | null>
{
  constructor(private readonly sql: ISqlConnectionFactory) {}

  async handle(query: GetUserRegistrationQuery): Promise<UserRegistrationDto | null> {
    const client = await this.sql.getOpenConnection();
    try {
      const result = await client.query(
        `SELECT id, login, email, first_name, last_name, name, status_code, register_date, confirmed_date
         FROM registrations.v_user_registrations WHERE id = $1`,
        [query.userRegistrationId],
      );
      const row = result.rows[0] as
        | {
            id: string;
            login: string;
            email: string;
            first_name: string;
            last_name: string;
            name: string;
            status_code: string;
            register_date: Date;
            confirmed_date: Date | null;
          }
        | undefined;
      if (!row) {
        return null;
      }
      return {
        id: row.id,
        login: row.login,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        name: row.name,
        statusCode: row.status_code,
        registerDate: row.register_date,
        confirmedDate: row.confirmed_date,
      };
    } finally {
      releaseIfNotInTransaction(client);
    }
  }
}
