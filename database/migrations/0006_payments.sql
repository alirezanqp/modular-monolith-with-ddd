-- Payments module tables (tabular + SQL Stream Store style event store)

CREATE TABLE IF NOT EXISTS payments.payers (
    id uuid PRIMARY KEY,
    login text NOT NULL,
    email text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    name text NOT NULL
);

CREATE TABLE IF NOT EXISTS payments.price_list_items (
    id uuid PRIMARY KEY,
    subscription_period_code text NOT NULL,
    country_code text NOT NULL,
    money_value numeric(18, 2) NOT NULL,
    money_currency text NOT NULL,
    price_list_item_category_code text NOT NULL,
    is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS payments.meeting_fees (
    id uuid PRIMARY KEY,
    payer_id uuid NOT NULL,
    meeting_id uuid NOT NULL,
    fee_value numeric(18, 2) NOT NULL,
    fee_currency text NOT NULL,
    status text NOT NULL
);

-- Event store (SQL Stream Store style on PostgreSQL)
CREATE TABLE IF NOT EXISTS payments.streams (
    id bigserial PRIMARY KEY,
    stream_id uuid NOT NULL UNIQUE,
    version integer NOT NULL DEFAULT -1,
    position bigint NOT NULL DEFAULT -1
);

CREATE TABLE IF NOT EXISTS payments.messages (
    stream_id bigint NOT NULL,
    stream_version integer NOT NULL,
    position bigserial NOT NULL,
    message_id uuid NOT NULL,
    created timestamptz NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),
    type text NOT NULL,
    json_data text NOT NULL,
    json_metadata text NULL,
    CONSTRAINT pk_payments_messages PRIMARY KEY (position),
    CONSTRAINT fk_payments_messages_streams
        FOREIGN KEY (stream_id) REFERENCES payments.streams (id),
    CONSTRAINT uq_payments_messages_stream_version UNIQUE (stream_id, stream_version),
    CONSTRAINT uq_payments_messages_stream_message UNIQUE (stream_id, message_id)
);

CREATE INDEX IF NOT EXISTS ix_payments_messages_stream_created
    ON payments.messages (stream_id, created);

CREATE TABLE IF NOT EXISTS payments.subscription_details (
    id text PRIMARY KEY,
    period text NOT NULL,
    status text NOT NULL,
    country_code text NOT NULL,
    expiration_date timestamptz NOT NULL,
    payer_id uuid NOT NULL
);

CREATE TABLE IF NOT EXISTS payments.subscription_payments (
    payment_id text PRIMARY KEY,
    payment_status text NOT NULL,
    period_type text NOT NULL,
    period text NOT NULL,
    payer_id uuid NOT NULL,
    subscription_id text NULL,
    money_value numeric(18, 2) NOT NULL,
    money_currency text NOT NULL,
    date timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS payments.subscription_checkpoints (
    code text PRIMARY KEY,
    position bigint NOT NULL
);
