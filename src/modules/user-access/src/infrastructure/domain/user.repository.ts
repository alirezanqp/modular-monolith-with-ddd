import { ISqlConnectionFactory } from '@building-blocks/application';
import { transactionStorage } from '@building-blocks/infrastructure';
import { IUserRepository } from '../../application/users/user.repository';
import { User } from '../../domain/users/user';
import { UserId } from '../../domain/users/user-id';

export class UserRepository implements IUserRepository {
  constructor(private readonly sqlConnectionFactory: ISqlConnectionFactory) {}

  async add(user: User): Promise<void> {
    const client = await this.sqlConnectionFactory.getOpenConnection();
    try {
      await client.query(
        `INSERT INTO users.users (id, login, email, password, is_active, first_name, last_name, name)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          user.id.value,
          user.getLogin(),
          user.getEmail(),
          user.getPassword(),
          user.getIsActive(),
          user.getFirstName(),
          user.getLastName(),
          user.getName(),
        ],
      );
      for (const role of user.getRoles()) {
        await client.query(
          `INSERT INTO users.user_roles (user_id, role_code) VALUES ($1, $2)`,
          [user.id.value, role],
        );
      }
    } finally {
      if (!transactionStorage.getStore()) {
        client.release();
      }
    }
  }

  async findById(id: UserId): Promise<User | null> {
    return this.findByColumn('id', id.value);
  }

  async findByLogin(login: string): Promise<User | null> {
    return this.findByColumn('login', login);
  }

  private async findByColumn(column: 'id' | 'login', value: string): Promise<User | null> {
    const client = await this.sqlConnectionFactory.getOpenConnection();
    try {
      const result = await client.query(
        `SELECT id, login, email, password, is_active, first_name, last_name, name
         FROM users.users WHERE ${column} = $1`,
        [value],
      );
      const row = result.rows[0] as
        | {
            id: string;
            login: string;
            email: string;
            password: string;
            is_active: boolean;
            first_name: string;
            last_name: string;
            name: string;
          }
        | undefined;
      if (!row) {
        return null;
      }

      const rolesResult = await client.query(
        `SELECT role_code FROM users.user_roles WHERE user_id = $1`,
        [row.id],
      );

      return User.restore({
        id: row.id,
        login: row.login,
        email: row.email,
        password: row.password,
        isActive: row.is_active,
        firstName: row.first_name,
        lastName: row.last_name,
        name: row.name,
        roles: rolesResult.rows.map((r: { role_code: string }) => r.role_code),
      });
    } finally {
      if (!transactionStorage.getStore()) {
        client.release();
      }
    }
  }
}
