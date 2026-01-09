const db = require('../config/db');
const cryptoUtils = require('../utils/crypto-utils');
const queries = require('../queries');
const { sendSuccess, notFound, serverError } = require('../utils/apiResponse');
const { HTTP_STATUS } = require('../../constants/serverConfig');

const createWallet = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    const mnemonic = cryptoUtils.generateMnemonic();

    const walletResult = await db.query(queries.wallet.createWallet, [userId, name, mnemonic]);
    const wallet = walletResult.rows[0];

    const btcAddress = cryptoUtils.deriveBitcoinAddress(mnemonic);
    const ethAddress = cryptoUtils.deriveEthereumAddress(mnemonic);

    await db.query(queries.wallet.insertWalletAddress, [wallet.id, 'BTC', btcAddress.address]);
    await db.query(queries.wallet.insertWalletAddress, [wallet.id, 'ETH', ethAddress.address]);

    return sendSuccess(res, {
      wallet,
      mnemonic,
      addresses: {
        BTC: btcAddress.address,
        ETH: ethAddress.address,
      },
    }, HTTP_STATUS.CREATED);
  } catch (error) {
    return serverError(res, 'Failed to create wallet', error);
  }
};

const getWallets = async (req, res) => {
  try {
    const userId = req.user.id;

    const walletsResult = await db.query(queries.wallet.findWalletsByUserId, [userId]);

    const wallets = await Promise.all(
      walletsResult.rows.map(async (wallet) => {
        const addressesResult = await db.query(queries.wallet.findAddressesByWalletId, [wallet.id]);

        return {
          ...wallet,
          addresses: addressesResult.rows,
        };
      })
    );

    return sendSuccess(res, { wallets });
  } catch (error) {
    return serverError(res, 'Failed to fetch wallets', error);
  }
};

const getWalletById = async (req, res) => {
  try {
    const userId = req.user.id;
    const walletId = req.params.id;

    const walletResult = await db.query(queries.wallet.findWalletByIdAndUserId, [walletId, userId]);

    if (walletResult.rows.length === 0) {
      return notFound(res, 'Wallet not found');
    }

    const wallet = walletResult.rows[0];

    const addressesResult = await db.query(queries.wallet.findAddressesByWalletId, [walletId]);

    return sendSuccess(res, {
      wallet: {
        id: wallet.id,
        name: wallet.name,
        created_at: wallet.created_at,
        addresses: addressesResult.rows,
      },
    });
  } catch (error) {
    return serverError(res, 'Failed to fetch wallet', error);
  }
};

module.exports = { createWallet, getWallets, getWalletById };
