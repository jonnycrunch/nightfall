<<<<<<< HEAD
<<<<<<< HEAD
import { getTruffleContractInstance } from '../src/contractUtils';
import bc from '../src/web3';

import mimc from '../src/mimc-hash';

import mimc from '../src/mimc-hash';

=======
import { getContract } from '../src/contractUtils';
=======
import { getTruffleContractInstance } from '../src/contractUtils';
>>>>>>> feat(zkp): debugging mimc hash
import bc from '../src/web3';
import mimc from '../src/mimc-hash';

>>>>>>> feat(zkp): add mimc hash functions
let accounts;
let contractInstance;
beforeAll(async () => {
  if (!(await bc.isConnected())) await bc.connect();
  accounts = await (await bc.connection()).eth.getAccounts();
<<<<<<< HEAD
<<<<<<< HEAD
  ({ contractInstance } = await getTruffleContractInstance('MiMC'));
=======
  ({ contractInstance } = await getContract('MiMC_Hash'));
>>>>>>> feat(zkp): add mimc hash functions
=======
  ({ contractInstance } = await getTruffleContractInstance('MiMC'));
>>>>>>> feat(zkp): debugging mimc hash
});

describe('MiMC hash tests', () => {
  test('MiMC hash correctly returns the hash of "0x12345"', async () => {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    const msg = '0x005b570ac05e96f3d8d205138e9b5ee0371377117020468b0fa81419a0a007ae';
    const testHash = await contractInstance.mimcHash([msg], { from: accounts[0], gas: 4000000 });
    const hash = mimc.mimcHash(msg);
    console.log('node', hash);
    console.log('blockchain', testHash);
    expect(hash).toEqual(testHash);
=======
    const msg = '0xe65b570ac05e96f3d8d205138e9b5ee0371377117020468b0fa81419a0a007ae';
    const testHash = await contractInstance.Hash([msg], { from: accounts[0], gas: 4000000 });
=======
    const msg = '0x005b570ac05e96f3d8d205138e9b5ee0371377117020468b0fa81419a0a007ae';
    const testHash = await contractInstance.mimcHash([msg], { from: accounts[0], gas: 4000000 });
>>>>>>> changes to merkle tree code
    const hash = mimc.mimcHash(msg);
    console.log('node', hash);
    console.log('blockchain', testHash);
    expect(hash).toEqual(testHash);
  });
<<<<<<< HEAD
=======
    const msg = '0xe65b570ac05e96f3d8d205138e9b5ee0371377117020468b0fa81419a0a007ae';
    const testHash = await contractInstance.Hash([msg], { from: accounts[0], gas: 4000000 });
    const hash = mimc.mimcHash([msg]);
    console.log('node', hash.toString(10));
    console.log('blockchain', testHash.toString(10));
    // expect(hash).toEqual(testHash);
  });
>>>>>>> feat(zkp): debugging mimc hash
  test('test modMul function', async () => {
    const t = BigInt(
      '14686898617697374517354030448549207100630038260701390942534165322324606310525',
    );
    const localQ = BigInt('0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001');
    const result = await contractInstance.testModMul.call();
    const test = (t * t) % localQ;
    console.log('results', result.toString(10), test.toString(10));
    expect(result.toString(10)).toEqual(test.toString(10));
<<<<<<< HEAD
>>>>>>> feat(zkp): debugging mimc hash
  });
=======
>>>>>>> feat(zkp): intermediate save
=======
    const msg = '0x12345';
    const testHash = await contractInstance.Hash([msg],{});
    const hash = mimcHash([msg]);
    
=======
>>>>>>> feat(zkp): debugging mimc hash
  });
>>>>>>> feat(zkp): add mimc hash functions
});
