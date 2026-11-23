-- Administration module tables and views

CREATE TABLE IF NOT EXISTS administration.members (
    id uuid PRIMARY KEY,
    login text NOT NULL,
    email text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    name text NOT NULL
);

CREATE TABLE IF NOT EXISTS administration.meeting_group_proposals (
    id uuid PRIMARY KEY,
    name text NOT NULL,
    description text NULL,
    location_city text NOT NULL,
    location_country_code text NOT NULL,
    proposal_user_id uuid NOT NULL,
    proposal_date timestamptz NOT NULL,
    status_code text NOT NULL,
    decision_date timestamptz NULL,
    decision_user_id uuid NULL,
    decision_code text NULL,
    decision_reject_reason text NULL
);

CREATE OR REPLACE VIEW administration.v_members AS
SELECT
    m.id,
    m.login,
    m.email,
    m.first_name,
    m.last_name,
    m.name
FROM administration.members AS m;

CREATE OR REPLACE VIEW administration.v_meeting_group_proposals AS
SELECT
    p.id,
    p.name,
    p.description,
    p.location_city,
    p.location_country_code,
    p.proposal_user_id,
    p.proposal_date,
    p.status_code,
    p.decision_date,
    p.decision_user_id,
    p.decision_code,
    p.decision_reject_reason
FROM administration.meeting_group_proposals AS p;
