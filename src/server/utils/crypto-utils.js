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

module.exports = {
  generateMnemonic,
  deriveBitcoinAddress,
  deriveEthereumAddress,
  validateMnemonic,
};
