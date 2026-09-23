/**
 * Encrypt existing plaintext wallet mnemonics
 *
 * Before this migration, `wallets.encrypted_mnemonic` was populated with the raw
 * BIP-39 phrase despite its name — the column promised encryption that the
 * application never performed. This backfills every row that is not already in
 * the v1 AES-256-GCM format.
 *
 * The cipher logic is duplicated here deliberately rather than imported from
 * src/: a migration has to keep producing the same bytes after the application
 * code moves on, so it must not depend on it.
 *
 * Requires MNEMONIC_ENCRYPTION_KEY (64 hex chars = 32 bytes). The migration
 * aborts before writing anything if the key is missing or malformed, so a
 * plaintext phrase is never overwritten by something unrecoverable.
 *
 * Idempotent: rows already in the "v1:" format are skipped, so re-running — or
 * running after the application has already started encrypting — is safe.
 *
 * Scope note: this reads and writes only the `wallets` table. The wallet
 * queries elsewhere in the app reference `wallet_address`/`token_symbol`/
 * `timestamp` columns on `transactions`, which this initial-schema migration
 * does NOT create, so the deployed schema may not match these migrations.
 * Confirm `wallets.encrypted_mnemonic` exists before running against a database
 * whose schema was created out of band.
 */

const crypto = require('crypto');

const FORMAT_VERSION = 'v1';
const IV_BYTES = 12; // GCM standard nonce length
const KEY_ENV = 'MNEMONIC_ENCRYPTION_KEY';

function getKey() {
  const raw = process.env[KEY_ENV];
  if (!raw) {
    throw new Error(`${KEY_ENV} is not set; refusing to run the mnemonic backfill.`);
  }
  const key = Buffer.from(raw, 'hex');
  if (key.length !== 32) {
    throw new Error(`${KEY_ENV} must be 64 hex characters (32 bytes), got ${raw.length}.`);
  }
  return key;
}

function encryptMnemonic(mnemonic) {
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(mnemonic, 'utf8'), cipher.final()]);

  return [
    FORMAT_VERSION,
    iv.toString('hex'),
    cipher.getAuthTag().toString('hex'),
    ciphertext.toString('hex'),
  ].join(':');
}

exports.up = async (pgm) => {
  const rows = await pgm.db.select('SELECT id, encrypted_mnemonic FROM wallets');

  const plaintextRows = rows.filter(
    (row) => !String(row.encrypted_mnemonic).startsWith(`${FORMAT_VERSION}:`)
  );

  if (plaintextRows.length === 0) {
    console.log(`Mnemonic backfill: no plaintext rows found among ${rows.length} wallet row(s).`);
    return;
  }

  // Fail before writing anything if the key is absent or malformed.
  getKey();

  for (const row of plaintextRows) {
    await pgm.db.query('UPDATE wallets SET encrypted_mnemonic = $1 WHERE id = $2', [
      encryptMnemonic(row.encrypted_mnemonic),
      row.id,
    ]);
  }

  console.log(
    `Mnemonic backfill: encrypted ${plaintextRows.length} of ${rows.length} wallet row(s).`
  );
};

exports.down = () => {
  // Intentionally a no-op. Decrypting mnemonics back to plaintext on rollback
  // would reintroduce exactly the exposure this migration removes, and the
  // application writes ciphertext regardless of which migrations have run, so
  // leaving the data encrypted is the consistent state.
  console.warn('Mnemonic backfill has no down migration; stored mnemonics remain encrypted.');
};
