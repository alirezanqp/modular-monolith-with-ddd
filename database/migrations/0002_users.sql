-- Users module tables and views

CREATE TABLE IF NOT EXISTS users.users (
    id uuid PRIMARY KEY,
    login text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    is_active boolean NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    name text NOT NULL
);

CREATE TABLE IF NOT EXISTS users.user_roles (
    user_id uuid NOT NULL,
    role_code text NOT NULL,
    CONSTRAINT pk_user_roles PRIMARY KEY (user_id, role_code)
);

CREATE TABLE IF NOT EXISTS users.permissions (
    code text PRIMARY KEY,
    name text NOT NULL
);

CREATE TABLE IF NOT EXISTS users.roles_to_permissions (
    role_code text NOT NULL,
    permission_code text NOT NULL,
    CONSTRAINT pk_roles_to_permissions PRIMARY KEY (role_code, permission_code)
);

CREATE OR REPLACE VIEW users.v_users AS
SELECT
    u.id,
    u.is_active,
    u.login,
    u.password,
    u.email,
    u.name,
    u.first_name,
    u.last_name
FROM users.users AS u;

CREATE OR REPLACE VIEW users.v_user_roles AS
SELECT
    ur.user_id,
    ur.role_code
FROM users.user_roles AS ur;

CREATE OR REPLACE VIEW users.v_user_permissions AS
SELECT DISTINCT
    ur.user_id,
    rtp.permission_code
FROM users.user_roles AS ur
INNER JOIN users.roles_to_permissions AS rtp
    ON ur.role_code = rtp.role_code;
