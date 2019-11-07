const Web3 = require('web3');

export const getEthAccounts = async () => {
  const web3 = new Web3(
    new Web3.providers.HttpProvider(
      `${process.env.BLOCKCHAIN_HOST}:${process.env.BLOCKCHAIN_PORT}`,
    ),
  );
  const accounts = await web3.eth.getAccounts();
  return accounts;
};

export const getAccountBalance = async (addr) => {
  const web3 = new Web3(
    new Web3.providers.HttpProvider(
      `${process.env.BLOCKCHAIN_HOST}:${process.env.BLOCKCHAIN_PORT}`,
    ),
  );
  const balance = await web3.eth.getBalance(addr);
  return balance;
};
