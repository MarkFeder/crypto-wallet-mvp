const crypto = require('crypto');
const bip39 = require('bip39');
const bitcoin = require('bitcoinjs-lib');
const { BIP32Factory } = require('bip32');
const ecc = require('tiny-secp256k1');
const { ethers } = require('ethers');

// Initialize BIP32 with secp256k1 implementation
const bip32 = BIP32Factory(ecc);

// Generate a new wallet mnemonic
function generateMnemonic() {
  return bip39.generateMnemonic();
}

// Derive Bitcoin address from mnemonic
function deriveBitcoinAddress(mnemonic, index = 0) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = bip32.fromSeed(seed);

  // BIP44 path for Bitcoin: m/44'/0'/0'/0/index
  const path = `m/44'/0'/0'/0/${index}`;
  const child = root.derivePath(path);

  const { address } = bitcoin.payments.p2pkh({
    pubkey: child.publicKey,
    network: bitcoin.networks.bitcoin,
  });

  return {
    address,
    privateKey: child.toWIF(),
  };
}

// Derive Ethereum address from mnemonic
function deriveEthereumAddress(mnemonic, index = 0) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);

  // BIP44 path for Ethereum: m/44'/60'/0'/0/index
  const hdNode = ethers.HDNodeWallet.fromSeed(seed);
  const path = `m/44'/60'/0'/0/${index}`;
  const wallet = hdNode.derivePath(path);

  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
}

// Validate mnemonic
function validateMnemonic(mnemonic) {
  return bip39.validateMnemonic(mnemonic);
}

const MNEMONIC_KEY_ENV = 'MNEMONIC_ENCRYPTION_KEY';
const MNEMONIC_FORMAT_VERSION = 'v1';
const IV_BYTES = 12; // GCM standard nonce length

// Load the mnemonic encryption key. Read at call time so deploy config can set
// it. Throws rather than falling back to storing the mnemonic unencrypted.
function mnemonicKey() {
  const raw = process.env[MNEMONIC_KEY_ENV];
  if (!raw) {
    throw new Error(`${MNEMONIC_KEY_ENV} is not set; refusing to store a wallet mnemonic unencrypted.`);
  }
  const key = Buffer.from(raw, 'hex');
  if (key.length !== 32) {
    throw new Error(
      `${MNEMONIC_KEY_ENV} must be 64 hex characters (32 bytes), got ${raw.length} characters.`
    );
  }
  return key;
}

// Encrypt a wallet mnemonic for storage. Returns "v1:<iv>:<authTag>:<ciphertext>".
function encryptMnemonic(mnemonic) {
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv('aes-256-gcm', mnemonicKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(mnemonic, 'utf8'), cipher.final()]);

  return [
    MNEMONIC_FORMAT_VERSION,
    iv.toString('hex'),
    cipher.getAuthTag().toString('hex'),
    ciphertext.toString('hex'),
  ].join(':');
}

// Decrypt a stored mnemonic. Throws if the value is not in the encrypted format
// or fails GCM authentication (i.e. it was tampered with).
function decryptMnemonic(stored) {
  const parts = stored.split(':');
  if (parts.length !== 4 || parts[0] !== MNEMONIC_FORMAT_VERSION) {
    throw new Error('Stored mnemonic is not in the expected encrypted format.');
  }

  const [, ivHex, authTagHex, ciphertextHex] = parts;
  const decipher = crypto.createDecipheriv('aes-256-gcm', mnemonicKey(), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextHex, 'hex')),
    decipher.final(),
  ]).toString('utf8');
}

module.exports = {
  generateMnemonic,
  deriveBitcoinAddress,
  deriveEthereumAddress,
  validateMnemonic,
  encryptMnemonic,
  decryptMnemonic,
};
