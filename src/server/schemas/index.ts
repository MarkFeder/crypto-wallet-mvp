import * as authSchemas from './authSchemas';
import * as walletSchemas from './walletSchemas';
import * as transactionSchemas from './transactionSchemas';

export const schemas = {
  auth: authSchemas,
  wallet: walletSchemas,
  transaction: transactionSchemas,
};

export { authSchemas, walletSchemas, transactionSchemas };

export default schemas;
