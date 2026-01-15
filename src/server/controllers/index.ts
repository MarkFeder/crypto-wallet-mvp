import * as authController from './authController';
import * as walletController from './walletController';
import * as transactionController from './transactionController';
import * as priceController from './priceController';

export const controllers = {
  auth: authController,
  wallet: walletController,
  transaction: transactionController,
  price: priceController,
};

export { authController, walletController, transactionController, priceController };

export default controllers;
