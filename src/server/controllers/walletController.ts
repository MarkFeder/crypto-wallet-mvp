import { Request, Response } from 'express';
import db from '../config/db';
import * as cryptoUtils from '../utils/cryptoUtils';
import queries from '../queries';
import { sendSuccess, notFound, serverError } from '../utils/apiResponse';
import { HTTP_STATUS } from '../../common/constants/server';
import { strings } from '../locales/strings';

// Note: Express Request type is augmented in ../types/express.d.ts

interface WalletRow {
  id: number;
  name: string;
  created_at: string;
}

interface AddressRow {
  currency: string;
  address: string;
  balance: string;
}

export const createWallet = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name } = req.body;
    const userId = req.user!.id;

    const mnemonic = cryptoUtils.generateMnemonic();

    const walletResult = await db.query<WalletRow>(queries.wallet.createWallet, [
      userId,
      name,
      mnemonic,
    ]);
    const wallet = walletResult.rows[0];

    const btcAddress = cryptoUtils.deriveBitcoinAddress(mnemonic);
    const ethAddress = cryptoUtils.deriveEthereumAddress(mnemonic);

    await db.query(queries.wallet.insertWalletAddress, [wallet.id, 'BTC', btcAddress.address]);
    await db.query(queries.wallet.insertWalletAddress, [wallet.id, 'ETH', ethAddress.address]);

    return sendSuccess(
      res,
      {
        wallet,
        mnemonic,
        addresses: {
          BTC: btcAddress.address,
          ETH: ethAddress.address,
        },
      },
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    return serverError(res, strings.wallet.failedToCreate, error as Error);
  }
};

export const getWallets = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user!.id;

    const walletsResult = await db.query<WalletRow>(queries.wallet.findWalletsByUserId, [userId]);

    const wallets = await Promise.all(
      walletsResult.rows.map(async wallet => {
        const addressesResult = await db.query<AddressRow>(queries.wallet.findAddressesByWalletId, [
          wallet.id,
        ]);

        return {
          ...wallet,
          addresses: addressesResult.rows,
        };
      })
    );

    return sendSuccess(res, { wallets });
  } catch (error) {
    return serverError(res, strings.wallet.failedToFetch, error as Error);
  }
};

export const getWalletById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user!.id;
    const walletId = req.params.id;

    const walletResult = await db.query<WalletRow>(queries.wallet.findWalletByIdAndUserId, [
      walletId,
      userId,
    ]);

    if (walletResult.rows.length === 0) {
      return notFound(res, strings.wallet.notFound);
    }

    const wallet = walletResult.rows[0];

    const addressesResult = await db.query<AddressRow>(queries.wallet.findAddressesByWalletId, [
      walletId,
    ]);

    return sendSuccess(res, {
      wallet: {
        id: wallet.id,
        name: wallet.name,
        created_at: wallet.created_at,
        addresses: addressesResult.rows,
      },
    });
  } catch (error) {
    return serverError(res, strings.wallet.failedToFetchSingle, error as Error);
  }
};
