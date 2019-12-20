import { getTruffleContractInstance } from '../src/contractUtils';
import bc from '../src/web3';

import mimc from '../src/mimc-hash';

let accounts;
let contractInstance;
beforeAll(async () => {
  if (!(await bc.isConnected())) await bc.connect();
  accounts = await (await bc.connection()).eth.getAccounts();
  ({ contractInstance } = await getTruffleContractInstance('MiMC'));
});

describe('MiMC hash tests', () => {
  test('MiMC hash correctly returns the hash of "0x12345"', async () => {
    const msg = '0x005b570ac05e96f3d8d205138e9b5ee0371377117020468b0fa81419a0a007ae';
    const testHash = await contractInstance.mimcHash([msg], { from: accounts[0], gas: 4000000 });
    const hash = mimc.mimcHash(msg);
    console.log('node', hash);
    console.log('blockchain', testHash);
    expect(hash).toEqual(testHash);
  });
});
