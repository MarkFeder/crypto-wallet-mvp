import * as bip39 from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory, BIP32Interface } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { ethers } from 'ethers';

// Initialize BIP32 with secp256k1 implementation
const bip32 = BIP32Factory(ecc);

interface DerivedAddress {
  address: string;
  privateKey: string;
}

/**
 * Generate a new wallet mnemonic
 */
export function generateMnemonic(): string {
  return bip39.generateMnemonic();
}

/**
 * Derive Bitcoin address from mnemonic
 */
export function deriveBitcoinAddress(mnemonic: string, index: number = 0): DerivedAddress {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root: BIP32Interface = bip32.fromSeed(seed);

  // BIP44 path for Bitcoin: m/44'/0'/0'/0/index
  const path = `m/44'/0'/0'/0/${index}`;
  const child = root.derivePath(path);

  const { address } = bitcoin.payments.p2pkh({
    pubkey: child.publicKey,
    network: bitcoin.networks.bitcoin,
  });

  return {
    address: address || '',
    privateKey: child.toWIF(),
  };
}

/**
 * Derive Ethereum address from mnemonic
 */
export function deriveEthereumAddress(mnemonic: string, index: number = 0): DerivedAddress {
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

/**
 * Validate mnemonic
 */
export function validateMnemonic(mnemonic: string): boolean {
  return bip39.validateMnemonic(mnemonic);
}
