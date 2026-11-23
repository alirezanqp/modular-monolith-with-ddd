import { config as loadEnv } from 'dotenv';
import bcrypt from 'bcrypt';
import { Client } from 'pg';

loadEnv();

const MEMBER_ID = '2ebfecfc-ed13-43b8-b516-6ac89d51c510';
const ADMIN_ID = '4065630e-4a4c-4f01-9142-0bacf6b8c64d';

const PERMISSIONS: Array<{ code: string; name: string }> = [
  // Meetings
  { code: 'GetMeetingGroupProposals', name: 'GetMeetingGroupProposals' },
  { code: 'ProposeMeetingGroup', name: 'ProposeMeetingGroup' },
  { code: 'CreateNewMeeting', name: 'CreateNewMeeting' },
  { code: 'EditMeeting', name: 'EditMeeting' },
  { code: 'AddMeetingAttendee', name: 'AddMeetingAttendee' },
  { code: 'RemoveMeetingAttendee', name: 'RemoveMeetingAttendee' },
  { code: 'AddNotAttendee', name: 'AddNotAttendee' },
  { code: 'ChangeNotAttendeeDecision', name: 'ChangeNotAttendeeDecision' },
  { code: 'SignUpMemberToWaitlist', name: 'SignUpMemberToWaitlist' },
  { code: 'SignOffMemberFromWaitlist', name: 'SignOffMemberFromWaitlist' },
  { code: 'SetMeetingHostRole', name: 'SetMeetingHostRole' },
  { code: 'SetMeetingAttendeeRole', name: 'SetMeetingAttendeeRole' },
  { code: 'CancelMeeting', name: 'CancelMeeting' },
  { code: 'GetAllMeetingGroups', name: 'GetAllMeetingGroups' },
  {
    code: 'EditMeetingGroupGeneralAttributes',
    name: 'EditMeetingGroupGeneralAttributes',
  },
  { code: 'JoinToGroup', name: 'JoinToGroup' },
  { code: 'LeaveMeetingGroup', name: 'LeaveMeetingGroup' },
  { code: 'AddMeetingComment', name: 'AddMeetingComment' },
  { code: 'EditMeetingComment', name: 'EditMeetingComment' },
  { code: 'RemoveMeetingComment', name: 'RemoveMeetingComment' },
  { code: 'AddMeetingCommentReply', name: 'AddMeetingCommentReply' },
  { code: 'LikeMeetingComment', name: 'LikeMeetingComment' },
  { code: 'UnlikeMeetingComment', name: 'UnlikeMeetingComment' },
  { code: 'EnableMeetingCommenting', name: 'EnableMeetingCommenting' },
  { code: 'DisableMeetingCommenting', name: 'DisableMeetingCommenting' },
  { code: 'MyMeetingGroupsView', name: 'MyMeetingGroupsView' },
  { code: 'MyMeetingsGroupsView', name: 'MyMeetingsGroupsView' },
  { code: 'AllMeetingGroupsView', name: 'AllMeetingGroupsView' },
  { code: 'SubscriptionView', name: 'SubscriptionView' },
  { code: 'EmailsView', name: 'EmailsView' },
  { code: 'MyMeetingsView', name: 'MyMeetingsView' },
  {
    code: 'GetAuthenticatedMemberMeetings',
    name: 'GetAuthenticatedMemberMeetings',
  },
  {
    code: 'GetAuthenticatedMemberMeetingGroups',
    name: 'GetAuthenticatedMemberMeetingGroups',
  },
  { code: 'GetMeetingGroupDetails', name: 'GetMeetingGroupDetails' },
  { code: 'GetMeetingDetails', name: 'GetMeetingDetails' },
  { code: 'GetMeetingAttendees', name: 'GetMeetingAttendees' },
  // Administration
  { code: 'AcceptMeetingGroupProposal', name: 'AcceptMeetingGroupProposal' },
  { code: 'AdministrationsView', name: 'AdministrationsView' },
  // Payments
  { code: 'RegisterPayment', name: 'RegisterPayment' },
  { code: 'BuySubscription', name: 'BuySubscription' },
  { code: 'RenewSubscription', name: 'RenewSubscription' },
  { code: 'CreatePriceListItem', name: 'CreatePriceListItem' },
  { code: 'ActivatePriceListItem', name: 'ActivatePriceListItem' },
  { code: 'DeactivatePriceListItem', name: 'DeactivatePriceListItem' },
  {
    code: 'ChangePriceListItemAttributes',
    name: 'ChangePriceListItemAttributes',
  },
  {
    code: 'GetAuthenticatedPayerSubscription',
    name: 'GetAuthenticatedPayerSubscription',
  },
  { code: 'GetPriceListItem', name: 'GetPriceListItem' },
];

const MEMBER_PERMISSIONS = [
  'GetMeetingGroupProposals',
  'ProposeMeetingGroup',
  'CreateNewMeeting',
  'EditMeeting',
  'AddMeetingAttendee',
  'RemoveMeetingAttendee',
  'AddNotAttendee',
  'ChangeNotAttendeeDecision',
  'SignUpMemberToWaitlist',
  'SignOffMemberFromWaitlist',
  'SetMeetingHostRole',
  'SetMeetingAttendeeRole',
  'CancelMeeting',
  'GetAllMeetingGroups',
  'EditMeetingGroupGeneralAttributes',
  'JoinToGroup',
  'LeaveMeetingGroup',
  'AddMeetingComment',
  'EditMeetingComment',
  'RemoveMeetingComment',
  'AddMeetingCommentReply',
  'LikeMeetingComment',
  'UnlikeMeetingComment',
  'GetAuthenticatedMemberMeetingGroups',
  'GetMeetingGroupDetails',
  'GetMeetingDetails',
  'GetMeetingAttendees',
  'MyMeetingsGroupsView',
  'MyMeetingGroupsView',
  'SubscriptionView',
  'EmailsView',
  'AllMeetingGroupsView',
  'MyMeetingsView',
  'GetAuthenticatedMemberMeetings',
  'RegisterPayment',
  'BuySubscription',
  'RenewSubscription',
  'GetAuthenticatedPayerSubscription',
  'GetPriceListItem',
];

const ADMIN_PERMISSIONS = [
  'AcceptMeetingGroupProposal',
  'AdministrationsView',
  'CreatePriceListItem',
  'ActivatePriceListItem',
  'DeactivatePriceListItem',
  'ChangePriceListItemAttributes',
  'GetPriceListItem',
];

const PRICE_LIST_ITEMS: Array<{
  id: string;
  period: string;
  category: string;
  country: string;
  value: number;
  currency: string;
}> = [
  {
    id: 'd58f0876-efe3-4b4c-b196-a4c3d5fadd24',
    period: 'Month',
    category: 'New',
    country: 'PL',
    value: 60,
    currency: 'PLN',
  },
  {
    id: 'd48e9951-2ae8-467e-a257-a1f492dbd36d',
    period: 'HalfYear',
    category: 'New',
    country: 'PL',
    value: 320,
    currency: 'PLN',
  },
  {
    id: 'b7bbe846-c151-48b5-85ef-a5737108640c',
    period: 'Month',
    category: 'New',
    country: 'US',
    value: 15,
    currency: 'USD',
  },
  {
    id: '92666bf7-7e86-4784-9c69-e6f3b8bb0ea6',
    period: 'HalfYear',
    category: 'New',
    country: 'US',
    value: 80,
    currency: 'USD',
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    period: 'Month',
    category: 'Renewal',
    country: 'PL',
    value: 60,
    currency: 'PLN',
  },
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    period: 'HalfYear',
    category: 'Renewal',
    country: 'PL',
    value: 320,
    currency: 'PLN',
  },
  {
    id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    period: 'Month',
    category: 'Renewal',
    country: 'US',
    value: 15,
    currency: 'USD',
  },
  {
    id: 'd4e5f6a7-b8c9-0123-def0-234567890123',
    period: 'HalfYear',
    category: 'Renewal',
    country: 'US',
    value: 80,
    currency: 'USD',
  },
  {
    id: 'e5f6a7b8-c9d0-1234-ef01-345678901234',
    period: 'Month',
    category: 'New',
    country: 'NL',
    value: 12,
    currency: 'EUR',
  },
  {
    id: 'f6a7b8c9-d0e1-2345-f012-456789012345',
    period: 'HalfYear',
    category: 'New',
    country: 'NL',
    value: 65,
    currency: 'EUR',
  },
];

async function seedPermissions(client: Client): Promise<void> {
  for (const permission of PERMISSIONS) {
    await client.query(
      `INSERT INTO users.permissions (code, name)
       VALUES ($1, $2)
       ON CONFLICT (code) DO NOTHING`,
      [permission.code, permission.name],
    );
  }

  for (const code of MEMBER_PERMISSIONS) {
    await client.query(
      `INSERT INTO users.roles_to_permissions (role_code, permission_code)
       VALUES ('Member', $1)
       ON CONFLICT DO NOTHING`,
      [code],
    );
  }

  for (const code of ADMIN_PERMISSIONS) {
    await client.query(
      `INSERT INTO users.roles_to_permissions (role_code, permission_code)
       VALUES ('Administrator', $1)
       ON CONFLICT DO NOTHING`,
      [code],
    );
  }
}

async function seedUsers(client: Client): Promise<void> {
  const memberPassword = bcrypt.hashSync('testMemberPass', 10);
  const adminPassword = bcrypt.hashSync('testAdminPass', 10);
  const now = new Date();

  await client.query(
    `INSERT INTO registrations.user_registrations (
       id, login, email, password, first_name, last_name, name,
       status_code, register_date, confirmed_date
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     ON CONFLICT (id) DO NOTHING`,
    [
      MEMBER_ID,
      'testMember@mail.com',
      'testMember@mail.com',
      memberPassword,
      'John',
      'Doe',
      'John Doe',
      'Confirmed',
      now,
      now,
    ],
  );

  await client.query(
    `INSERT INTO users.users (
       id, login, email, password, is_active, first_name, last_name, name
     ) VALUES ($1, $2, $3, $4, true, $5, $6, $7)
     ON CONFLICT (id) DO NOTHING`,
    [
      MEMBER_ID,
      'testMember@mail.com',
      'testMember@mail.com',
      memberPassword,
      'John',
      'Doe',
      'John Doe',
    ],
  );

  await client.query(
    `INSERT INTO meetings.members (id, login, email, first_name, last_name, name)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (id) DO NOTHING`,
    [
      MEMBER_ID,
      'testMember@mail.com',
      'testMember@mail.com',
      'John',
      'Doe',
      'John Doe',
    ],
  );

  await client.query(
    `INSERT INTO payments.payers (id, login, email, first_name, last_name, name)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (id) DO NOTHING`,
    [
      MEMBER_ID,
      'testMember@mail.com',
      'testMember@mail.com',
      'John',
      'Doe',
      'John Doe',
    ],
  );

  await client.query(
    `INSERT INTO administration.members (id, login, email, first_name, last_name, name)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (id) DO NOTHING`,
    [
      MEMBER_ID,
      'testMember@mail.com',
      'testMember@mail.com',
      'John',
      'Doe',
      'John Doe',
    ],
  );

  await client.query(
    `INSERT INTO users.user_roles (user_id, role_code)
     SELECT $1, 'Member'
     WHERE NOT EXISTS (
       SELECT 1 FROM users.user_roles WHERE user_id = $1 AND role_code = 'Member'
     )`,
    [MEMBER_ID],
  );

  await client.query(
    `INSERT INTO registrations.user_registrations (
       id, login, email, password, first_name, last_name, name,
       status_code, register_date, confirmed_date
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     ON CONFLICT (id) DO NOTHING`,
    [
      ADMIN_ID,
      'testAdmin@mail.com',
      'testAdmin@mail.com',
      adminPassword,
      'Jane',
      'Doe',
      'Jane Doe',
      'Confirmed',
      now,
      now,
    ],
  );

  await client.query(
    `INSERT INTO users.users (
       id, login, email, password, is_active, first_name, last_name, name
     ) VALUES ($1, $2, $3, $4, true, $5, $6, $7)
     ON CONFLICT (id) DO NOTHING`,
    [
      ADMIN_ID,
      'testAdmin@mail.com',
      'testAdmin@mail.com',
      adminPassword,
      'Jane',
      'Doe',
      'Jane Doe',
    ],
  );

  await client.query(
    `INSERT INTO users.user_roles (user_id, role_code)
     SELECT $1, 'Administrator'
     WHERE NOT EXISTS (
       SELECT 1 FROM users.user_roles WHERE user_id = $1 AND role_code = 'Administrator'
     )`,
    [ADMIN_ID],
  );
}

async function seedCountries(client: Client): Promise<void> {
  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'PL', name: 'Poland' },
    { code: 'NL', name: 'Netherlands' },
  ];

  for (const country of countries) {
    await client.query(
      `INSERT INTO meetings.countries (code, name)
       VALUES ($1, $2)
       ON CONFLICT (code) DO NOTHING`,
      [country.code, country.name],
    );
  }
}

async function seedPriceList(client: Client): Promise<void> {
  for (const item of PRICE_LIST_ITEMS) {
    await client.query(
      `INSERT INTO payments.price_list_items (
         id, subscription_period_code, country_code, money_value,
         money_currency, price_list_item_category_code, is_active
       ) VALUES ($1, $2, $3, $4, $5, $6, true)
       ON CONFLICT (id) DO NOTHING`,
      [
        item.id,
        item.period,
        item.country,
        item.value,
        item.currency,
        item.category,
      ],
    );
  }
}

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    await client.query('BEGIN');
    await seedPermissions(client);
    await seedUsers(client);
    await seedCountries(client);
    await seedPriceList(client);
    await client.query('COMMIT');
    console.log('Seed complete.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
