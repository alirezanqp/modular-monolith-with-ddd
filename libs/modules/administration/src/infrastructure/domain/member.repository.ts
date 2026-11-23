import { SqlConnectionFactory, transactionStorage } from '@building-blocks/infrastructure';
import { PoolClient } from 'pg';
import { Member } from '../../domain/members/member';
import { MemberId } from '../../domain/members/member-id';
import { IMemberRepository } from '../../domain/members/member.repository';

export class MemberRepository implements IMemberRepository {
  constructor(private readonly sqlConnectionFactory: SqlConnectionFactory) {}

  private async client(): Promise<{ client: PoolClient; release: boolean }> {
    const tx = transactionStorage.getStore();
    if (tx) {
      return { client: tx.client, release: false };
    }
    return { client: await this.sqlConnectionFactory.getOpenConnection(), release: true };
  }

  async add(member: Member): Promise<void> {
    const { client, release } = await this.client();
    try {
      await client.query(
        `INSERT INTO administration.members (
           id, login, email, first_name, last_name, name, create_date
         ) VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (id) DO NOTHING`,
        [
          member.id.value,
          member.login,
          member.email,
          member.firstName,
          member.lastName,
          member.name,
          member.createDate,
        ],
      );
    } finally {
      if (release) client.release();
    }
  }

  async getById(id: MemberId): Promise<Member | null> {
    const { client, release } = await this.client();
    try {
      const result = await client.query(
        `SELECT id, login, email, first_name, last_name, name, create_date
         FROM administration.members WHERE id = $1`,
        [id.value],
      );
      const row = result.rows[0];
      if (!row) return null;
      return Member.reconstitute({
        id: row.id,
        login: row.login,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        name: row.name,
        createDate: row.create_date,
      });
    } finally {
      if (release) client.release();
    }
  }
}
