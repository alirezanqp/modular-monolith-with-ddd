-- Schemas and shared infrastructure tables (outbox / inbox / internal commands, emails, migrations journal)

CREATE SCHEMA IF NOT EXISTS app;
CREATE SCHEMA IF NOT EXISTS users;
CREATE SCHEMA IF NOT EXISTS registrations;
CREATE SCHEMA IF NOT EXISTS administration;
CREATE SCHEMA IF NOT EXISTS meetings;
CREATE SCHEMA IF NOT EXISTS payments;

CREATE TABLE IF NOT EXISTS app.migrations_journal (
    script_name text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.emails (
    id uuid PRIMARY KEY,
    from_address text NOT NULL,
    to_address text NOT NULL,
    subject text NOT NULL,
    content text NOT NULL,
    received_date timestamptz NOT NULL
);

-- users messaging infrastructure
CREATE TABLE IF NOT EXISTS users.outbox_messages (
    id uuid PRIMARY KEY,
    occurred_on timestamptz NOT NULL,
    type text NOT NULL,
    data text NOT NULL,
    processed_date timestamptz NULL
);

CREATE TABLE IF NOT EXISTS users.inbox_messages (
    id uuid PRIMARY KEY,
    occurred_on timestamptz NOT NULL,
    type text NOT NULL,
    data text NOT NULL,
    processed_date timestamptz NULL
);

CREATE TABLE IF NOT EXISTS users.internal_commands (
    id uuid PRIMARY KEY,
    enqueue_date timestamptz NOT NULL,
    type text NOT NULL,
    data text NOT NULL,
    processed_date timestamptz NULL,
    error text NULL
);

-- registrations messaging infrastructure
CREATE TABLE IF NOT EXISTS registrations.outbox_messages (
    id uuid PRIMARY KEY,
    occurred_on timestamptz NOT NULL,
    type text NOT NULL,
    data text NOT NULL,
    processed_date timestamptz NULL
);

CREATE TABLE IF NOT EXISTS registrations.inbox_messages (
    id uuid PRIMARY KEY,
    occurred_on timestamptz NOT NULL,
    type text NOT NULL,
    data text NOT NULL,
    processed_date timestamptz NULL
);

CREATE TABLE IF NOT EXISTS registrations.internal_commands (
    id uuid PRIMARY KEY,
    enqueue_date timestamptz NOT NULL,
    type text NOT NULL,
    data text NOT NULL,
    processed_date timestamptz NULL,
    error text NULL
);

-- administration messaging infrastructure
CREATE TABLE IF NOT EXISTS administration.outbox_messages (
    id uuid PRIMARY KEY,
    occurred_on timestamptz NOT NULL,
    type text NOT NULL,
    data text NOT NULL,
    processed_date timestamptz NULL
);

CREATE TABLE IF NOT EXISTS administration.inbox_messages (
    id uuid PRIMARY KEY,
    occurred_on timestamptz NOT NULL,
    type text NOT NULL,
    data text NOT NULL,
    processed_date timestamptz NULL
);

CREATE TABLE IF NOT EXISTS administration.internal_commands (
    id uuid PRIMARY KEY,
    enqueue_date timestamptz NOT NULL,
    type text NOT NULL,
    data text NOT NULL,
    processed_date timestamptz NULL,
    error text NULL
);

-- meetings messaging infrastructure
CREATE TABLE IF NOT EXISTS meetings.outbox_messages (
    id uuid PRIMARY KEY,
    occurred_on timestamptz NOT NULL,
    type text NOT NULL,
    data text NOT NULL,
    processed_date timestamptz NULL
);

CREATE TABLE IF NOT EXISTS meetings.inbox_messages (
    id uuid PRIMARY KEY,
    occurred_on timestamptz NOT NULL,
    type text NOT NULL,
    data text NOT NULL,
    processed_date timestamptz NULL
);

CREATE TABLE IF NOT EXISTS meetings.internal_commands (
    id uuid PRIMARY KEY,
    enqueue_date timestamptz NOT NULL,
    type text NOT NULL,
    data text NOT NULL,
    processed_date timestamptz NULL,
    error text NULL
);

-- payments messaging infrastructure
CREATE TABLE IF NOT EXISTS payments.outbox_messages (
    id uuid PRIMARY KEY,
    occurred_on timestamptz NOT NULL,
    type text NOT NULL,
    data text NOT NULL,
    processed_date timestamptz NULL
);

CREATE TABLE IF NOT EXISTS payments.inbox_messages (
    id uuid PRIMARY KEY,
    occurred_on timestamptz NOT NULL,
    type text NOT NULL,
    data text NOT NULL,
    processed_date timestamptz NULL
);

CREATE TABLE IF NOT EXISTS payments.internal_commands (
    id uuid PRIMARY KEY,
    enqueue_date timestamptz NOT NULL,
    type text NOT NULL,
    data text NOT NULL,
    processed_date timestamptz NULL,
    error text NULL
);
