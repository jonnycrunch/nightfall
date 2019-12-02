import { getContract } from '../src/contractUtils';
import bc from '../src/web3';

let accounts;
let contractInstance;
beforeAll(async () => {
  if (!(await bc.isConnected())) await bc.connect();
  accounts = await (await bc.connection()).eth.getAccounts();
  ({ contractInstance } = await getContract('MiMC_Hash'));
});

describe('MiMC hash tests', () => {
  test('MiMC hash correctly returns the hash of "0x12345"', async () => {
    const msg = '0x12345';
    const testHash = await contractInstance.Hash([msg],{});
    const hash = mimcHash([msg]);
    
  });
});
