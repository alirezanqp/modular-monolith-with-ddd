import { config as loadEnv } from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';

loadEnv();

const migrationsDir = path.join(__dirname, 'migrations');

async function ensureJournal(client: Client): Promise<void> {
  await client.query(`
    CREATE SCHEMA IF NOT EXISTS app;
    CREATE TABLE IF NOT EXISTS app.migrations_journal (
      script_name text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    );
  `);
}

async function getAppliedScripts(client: Client): Promise<Set<string>> {
  const result = await client.query<{ script_name: string }>(
    'SELECT script_name FROM app.migrations_journal',
  );
  return new Set(result.rows.map((row) => row.script_name));
}

function listMigrationFiles(): string[] {
  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Migrations directory not found: ${migrationsDir}`);
  }

  return fs
    .readdirSync(migrationsDir)
    .filter((name) => name.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b));
}

async function applyMigration(
  client: Client,
  scriptName: string,
): Promise<void> {
  const fullPath = path.join(migrationsDir, scriptName);
  const sql = fs.readFileSync(fullPath, 'utf8');

  await client.query('BEGIN');
  try {
    await client.query(sql);
    await client.query(
      'INSERT INTO app.migrations_journal (script_name, applied_at) VALUES ($1, now())',
      [scriptName],
    );
    await client.query('COMMIT');
    console.log(`Applied ${scriptName}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
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
    await ensureJournal(client);
    const applied = await getAppliedScripts(client);
    const files = listMigrationFiles();

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`Skipping ${file} (already applied)`);
        continue;
      }
      await applyMigration(client, file);
    }

    console.log('Migrations complete.');
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
