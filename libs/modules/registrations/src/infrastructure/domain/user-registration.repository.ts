import { ISqlConnectionFactory } from '@building-blocks/application';
import { releaseIfNotInTransaction } from '@building-blocks/infrastructure';
import { IUserRegistrationRepository } from '../../application/user-registrations/user-registration.repository';
import { UserRegistration } from '../../domain/user-registrations/user-registration';
import { UserRegistrationId } from '../../domain/user-registrations/user-registration-id';

export class UserRegistrationRepository implements IUserRegistrationRepository {
  constructor(private readonly sql: ISqlConnectionFactory) {}

  async add(registration: UserRegistration): Promise<void> {
    const client = await this.sql.getOpenConnection();
    try {
      await client.query(
        `INSERT INTO registrations.user_registrations
         (id, login, email, password, first_name, last_name, name, status_code, register_date, confirmed_date)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          registration.id.value,
          registration.getLogin(),
          registration.getEmail(),
          registration.getPassword(),
          registration.getFirstName(),
          registration.getLastName(),
          registration.getName(),
          registration.getStatusCode(),
          registration.getRegisterDate(),
          registration.getConfirmedDate(),
        ],
      );
    } finally {
      releaseIfNotInTransaction(client);
    }
  }

  async getById(id: UserRegistrationId): Promise<UserRegistration> {
    const client = await this.sql.getOpenConnection();
    try {
      const result = await client.query(
        `SELECT id, login, email, password, first_name, last_name, name, status_code, register_date, confirmed_date
         FROM registrations.user_registrations WHERE id = $1`,
        [id.value],
      );
      const row = result.rows[0];
      if (!row) {
        throw new Error(`User registration ${id.value} not found`);
      }
      return UserRegistration.restore({
        id: row.id,
        login: row.login,
        email: row.email,
        password: row.password,
        firstName: row.first_name,
        lastName: row.last_name,
        name: row.name,
        statusCode: row.status_code,
        registerDate: row.register_date,
        confirmedDate: row.confirmed_date,
      });
    } finally {
      releaseIfNotInTransaction(client);
    }
  }

  async update(registration: UserRegistration): Promise<void> {
    const client = await this.sql.getOpenConnection();
    try {
      await client.query(
        `UPDATE registrations.user_registrations
         SET status_code = $2, confirmed_date = $3
         WHERE id = $1`,
        [registration.id.value, registration.getStatusCode(), registration.getConfirmedDate()],
      );
    } finally {
      releaseIfNotInTransaction(client);
    }
  }
}
