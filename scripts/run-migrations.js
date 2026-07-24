#!/usr/bin/env node
const path = require('path');
const { spawnSync } = require('child_process');

const LOCAL_DEFAULTS = Object.freeze({
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_USER: 'powermech_dev',
  DB_PASSWORD: 'dev_local_only',
  DB_NAME: 'powermech_ai_dev',
});

const readRequiredString = (name) => {
  const value = process.env[name] ?? LOCAL_DEFAULTS[name];
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${name} must be a non-empty string.`);
  }
  return value;
};

const readDatabaseConfig = () => {
  const portValue = readRequiredString('DB_PORT');
  const port = Number(portValue);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('DB_PORT must be an integer between 1 and 65535.');
  }

  return {
    host: readRequiredString('DB_HOST'),
    port,
    user: readRequiredString('DB_USER'),
    password: readRequiredString('DB_PASSWORD'),
    database: readRequiredString('DB_NAME'),
  };
};

const buildDatabaseUrl = ({ host, port, user, password, database }) => {
  const databaseUrl = new URL('postgresql://localhost');
  databaseUrl.hostname = host;
  databaseUrl.port = String(port);
  databaseUrl.username = user;
  databaseUrl.password = password;
  databaseUrl.pathname = `/${database}`;
  return databaseUrl.toString();
};

const runMigration = (action, extraArguments, databaseUrl) => {
  const cliPath = require.resolve('node-pg-migrate/bin/node-pg-migrate');
  const migrationsDirectory = path.resolve(__dirname, '..', 'migrations');
  const result = spawnSync(
    process.execPath,
    [
      cliPath,
      action,
      ...extraArguments,
      '--migrations-dir',
      migrationsDirectory,
      '--database-url-var',
      'DATABASE_URL',
    ],
    {
      env: { ...process.env, DATABASE_URL: databaseUrl },
      shell: false,
      stdio: 'inherit',
    },
  );

  if (result.error) {
    throw new Error(`Unable to start node-pg-migrate: ${result.error.message}`);
  }
  return result.status ?? 1;
};

const main = () => {
  const command = process.argv[2];
  if (!['up', 'down', 'reset'].includes(command)) {
    throw new Error('Usage: node scripts/run-migrations.js <up|down|reset>');
  }

  const databaseUrl = buildDatabaseUrl(readDatabaseConfig());

  if (command === 'reset') {
    const downStatus = runMigration('down', ['0'], databaseUrl);
    if (downStatus !== 0) return downStatus;
    return runMigration('up', [], databaseUrl);
  }

  return runMigration(command, [], databaseUrl);
};

try {
  process.exitCode = main();
} catch (error) {
  console.error(`Migration command failed: ${error.message}`);
  process.exitCode = 1;
}
