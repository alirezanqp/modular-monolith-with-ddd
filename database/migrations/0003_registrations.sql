-- Registrations module tables and views

CREATE TABLE IF NOT EXISTS registrations.user_registrations (
    id uuid PRIMARY KEY,
    login text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    name text NOT NULL,
    status_code text NOT NULL,
    register_date timestamptz NOT NULL,
    confirmed_date timestamptz NULL
);

CREATE OR REPLACE VIEW registrations.v_user_registrations AS
SELECT
    ur.id,
    ur.login,
    ur.email,
    ur.first_name,
    ur.last_name,
    ur.name,
    ur.status_code,
    ur.register_date,
    ur.confirmed_date
FROM registrations.user_registrations AS ur;
