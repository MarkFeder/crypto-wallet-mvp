# Database Migrations Guide

This project uses `node-pg-migrate` for versioned database migrations.

## Quick Start

```bash
# Check migration status
npm run migrate:status

# Run all pending migrations
npm run migrate:up

# Preview migrations without applying (dry run)
npm run migrate:dry

# Rollback the last migration
npm run migrate:down

# Create a new migration
npm run migrate:create add-feature-name
```

## Commands Reference

| Command | Description |
|---------|-------------|
| `npm run migrate` | Interactive migration tool |
| `npm run migrate:up` | Apply all pending migrations |
| `npm run migrate:down` | Rollback the last migration |
| `npm run migrate:status` | Show applied migrations |
| `npm run migrate:dry` | Preview without executing |
| `npm run migrate:create <name>` | Create a new migration file |
| `npm run migrate:mark <name>` | Mark migration as complete without running |

## For Existing Databases

If you have an existing database that already has the schema, mark the initial migration as complete:

```bash
npm run migrate:mark 1736780400000_initial-schema
```

This tells the migration system that the initial schema is already in place.

## Creating Migrations

### 1. Generate a new migration file

```bash
npm run migrate:create add-user-preferences
```

This creates a file like `migrations/1736789999999_add-user-preferences.js`.

### 2. Write the migration

```javascript
exports.up = (pgm) => {
  pgm.addColumn('users', {
    preferences: { type: 'jsonb', default: '{}' }
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('users', 'preferences');
};
```

### 3. Test the migration

```bash
# Preview changes
npm run migrate:dry

# Apply migration
npm run migrate:up

# If something goes wrong
npm run migrate:down
```

## Production Best Practices

### 1. Expand-Contract Pattern

For zero-downtime deployments, use the expand-contract pattern:

**Bad (blocks table):**
```javascript
// Renaming a column - DON'T DO THIS
pgm.renameColumn('users', 'name', 'full_name');
```

**Good (zero-downtime):**
```javascript
// Migration 1: Add new column
exports.up = (pgm) => {
  pgm.addColumn('users', {
    full_name: { type: 'varchar(255)' }
  });
};

// Migration 2: Backfill data (after deploying code that writes to both)
exports.up = async (pgm) => {
  await pgm.sql(`
    UPDATE users SET full_name = name WHERE full_name IS NULL
  `);
};

// Migration 3: Drop old column (after code no longer reads from it)
exports.up = (pgm) => {
  pgm.dropColumn('users', 'name');
};
```

### 2. Large Table Updates

For tables with millions of rows, update in batches:

```javascript
exports.up = async (pgm) => {
  // Add nullable column (instant)
  pgm.addColumn('large_table', {
    new_column: { type: 'integer' }
  });

  // Backfill in batches
  let updated = 0;
  const batchSize = 10000;

  do {
    const result = await pgm.db.query(`
      UPDATE large_table
      SET new_column = 0
      WHERE id IN (
        SELECT id FROM large_table
        WHERE new_column IS NULL
        LIMIT ${batchSize}
      )
    `);
    updated = result.rowCount;
    console.log(`Updated ${updated} rows...`);
  } while (updated === batchSize);
};
```

### 3. Pre-Deployment Checklist

- [ ] Test migration on a copy of production data
- [ ] Verify rollback works (`migrate:down` then `migrate:up`)
- [ ] Check for table locks on large tables
- [ ] Schedule during low-traffic window
- [ ] Have a backup ready
- [ ] Monitor database performance during migration

### 4. Running in Production

```bash
# 1. Check current status
npm run migrate:status

# 2. Preview changes
npm run migrate:dry

# 3. Run migrations (will prompt for confirmation)
NODE_ENV=production npm run migrate:up

# 4. Verify success
npm run migrate:status
```

## Migration API Reference

Common `pgm` methods:

```javascript
// Tables
pgm.createTable('table_name', { columns });
pgm.dropTable('table_name');
pgm.renameTable('old_name', 'new_name');

// Columns
pgm.addColumn('table', { column_name: { type: 'varchar(255)' } });
pgm.dropColumn('table', 'column_name');
pgm.renameColumn('table', 'old_name', 'new_name');
pgm.alterColumn('table', 'column', { notNull: true });

// Indexes
pgm.createIndex('table', 'column');
pgm.createIndex('table', ['col1', 'col2'], { unique: true });
pgm.dropIndex('table', 'column');

// Constraints
pgm.addConstraint('table', 'constraint_name', { check: 'amount > 0' });
pgm.createConstraint('table', 'fk_name', {
  foreignKeys: {
    columns: 'user_id',
    references: 'users(id)',
    onDelete: 'CASCADE'
  }
});

// Raw SQL
pgm.sql('UPDATE users SET active = true');
```

## File Structure

```
crypto-wallet-mvp/
├── migrations/
│   ├── 1736780400000_initial-schema.js      # Baseline schema
│   └── 1736780400001_add-feature.js         # Future migrations
├── scripts/
│   ├── migrate.js                           # Migration runner
│   └── markMigrationComplete.js             # Mark existing schemas
└── migrate.config.js                        # Configuration
```

## Troubleshooting

### Migration fails with "relation already exists"

Your database already has the schema. Mark the migration as complete:
```bash
npm run migrate:mark 1736780400000_initial-schema
```

### Cannot connect to database

Check your `.env` file has correct database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crypto_wallet
DB_USER=postgres
DB_PASSWORD=your_password
```

### Rollback fails

If a migration partially applied, you may need to manually fix the database state before rolling back. Check the `pgmigrations` table to see what was recorded.
