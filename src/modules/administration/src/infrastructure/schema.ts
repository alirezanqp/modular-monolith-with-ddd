import { SqlConnectionFactory } from '@building-blocks/infrastructure';

const SCHEMA_SQL = `
CREATE SCHEMA IF NOT EXISTS administration;

CREATE TABLE IF NOT EXISTS administration.meeting_group_proposals (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(2000) NULL,
  location_city VARCHAR(50) NOT NULL,
  location_country_code VARCHAR(3) NOT NULL,
  proposal_user_id UUID NOT NULL,
  proposal_date TIMESTAMPTZ NOT NULL,
  status_code VARCHAR(50) NOT NULL,
  decision_date TIMESTAMPTZ NULL,
  decision_user_id UUID NULL,
  decision_code VARCHAR(50) NULL,
  decision_reject_reason VARCHAR(250) NULL
);

CREATE TABLE IF NOT EXISTS administration.members (
  id UUID PRIMARY KEY,
  login VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  name VARCHAR(200) NOT NULL,
  create_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS administration.outbox_messages (
  id UUID PRIMARY KEY,
  occurred_on TIMESTAMPTZ NOT NULL,
  type VARCHAR(255) NOT NULL,
  data TEXT NOT NULL,
  processed_date TIMESTAMPTZ NULL
);

CREATE TABLE IF NOT EXISTS administration.inbox_messages (
  id UUID PRIMARY KEY,
  occurred_on TIMESTAMPTZ NOT NULL,
  type VARCHAR(255) NOT NULL,
  data TEXT NOT NULL,
  processed_date TIMESTAMPTZ NULL
);

CREATE TABLE IF NOT EXISTS administration.internal_commands (
  id UUID PRIMARY KEY,
  enqueue_date TIMESTAMPTZ NOT NULL,
  type VARCHAR(255) NOT NULL,
  data TEXT NOT NULL,
  processed_date TIMESTAMPTZ NULL,
  error TEXT NULL
);

CREATE OR REPLACE VIEW administration.v_meeting_group_proposals AS
SELECT id, name, description, location_city, location_country_code,
       proposal_user_id, proposal_date, status_code,
       decision_date, decision_user_id, decision_code, decision_reject_reason
FROM administration.meeting_group_proposals;

CREATE OR REPLACE VIEW administration.v_members AS
SELECT id, login, email, first_name, last_name, name
FROM administration.members;
`;

export async function ensureAdministrationSchema(
  sqlConnectionFactory: SqlConnectionFactory,
): Promise<void> {
  const client = await sqlConnectionFactory.getOpenConnection();
  try {
    await client.query(SCHEMA_SQL);
  } finally {
    client.release();
  }
}
