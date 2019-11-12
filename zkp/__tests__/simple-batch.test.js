/* eslint-disable import/no-unresolved */

import utils from '../src/zkpUtils';
import bc from '../src/web3';
import controller from '../src/f-token-controller';
import { getVkId, getContract } from '../src/contractUtils';

jest.setTimeout(7200000);

const PROOF_LENGTH = 20;
const C = '0x00000000000000000000000000000028'; // 128 bits = 16 bytes = 32 chars
const E = new Array(20).fill('0x00000000000000000000000000000002');
const skA = '0x0000000000111111111111111111111111111111111111111111111111111111';
const skB = '0x0000000000111111111111111111111111111111111111111111111111111112';
let S_A_C;
let S_B_E = [];
let pkA;
let pkB = [];
let Z_A_C;
// storage for z indexes
let zInd1;
let zInd2;
let commitments = [];
let accounts;
let fTokenShieldJson;
let fTokenShieldAddress;

beforeAll(async () => {
  if (!(await bc.isConnected())) await bc.connect();
  accounts = await (await bc.connection()).eth.getAccounts();
  const { contractJson, contractInstance } = await getContract('FTokenShield');
  fTokenShieldAddress = contractInstance.address;
  fTokenShieldJson = contractJson;
  for (let i = 0; i < PROOF_LENGTH; i++) {
    S_B_E[i] = utils.rndHex(32);
    pkB[i] = utils.ensure0x(utils.zeroMSBs(utils.strip0x(utils.hash(skB)).padStart(32, '0')));
  }
  S_B_E = (await Promise.all(S_B_E)).map(k => utils.zeroMSBs(k));
  pkB = (await Promise.all(pkB)).map(k => utils.zeroMSBs(k));
  S_A_C = utils.zeroMSBs(await utils.rndHex(32));
  pkA = utils.ensure0x(utils.zeroMSBs(utils.strip0x(utils.hash(skA)).padStart(32, '0')));
  Z_A_C = utils.zeroMSBs(utils.concatenateThenHash(C, pkA, S_A_C));
});

// eslint-disable-next-line no-undef
describe('f-token-controller.js tests', () => {
  // Alice has C + D to start total = 50 ETH
  // Alice sends Bob E and gets F back (Bob has 40 ETH, Alice has 10 ETH)
  // Bob then has E+G at total of 70 ETH
  // Bob sends H to Alice and keeps I (Bob has 50 ETH and Alice has 10+20=30 ETH)

  test('Should create 10000 tokens in accounts[0]', async () => {
    // fund some accounts with FToken
    const AMOUNT = 10000;
    const bal1 = await controller.getBalance(accounts[0]);
    await controller.buyFToken(AMOUNT, accounts[0]);
    const bal2 = await controller.getBalance(accounts[0]);
    expect(AMOUNT).toEqual(bal2 - bal1);
  });

  test('Should mint an ERC-20 commitment Z_A_C for Alice of value C', async () => {
    const { commitment: zTest, commitmentIndex: zIndex } = await controller.mint(
      C,
      pkA,
      S_A_C,
      await getVkId('MintCoin'),
      {
        account: accounts[0],
        fTokenShieldJson,
        fTokenShieldAddress,
      },
    );
    zInd1 = parseInt(zIndex, 10);
    expect(Z_A_C).toEqual(zTest);
  });

  test('Should transfer ERC-20 commitments of various values to 19 receipients and get change', async () => {
    // the E's becomes Bobs'.
    const bal1 = await controller.getBalance(accounts[0]);
    const inputCommitment = { value: C, salt: S_A_C, commitment: Z_A_C, index: zInd1 };
    const outputCommitments = [];
    for (let i = 0; i < E.length; i++) {
      outputCommitments[i] = { value: E[i], salt: S_B_E[i] };
    }

    const response = await controller.simpleFungibleBatchTransfer(
      inputCommitment,
      outputCommitments,
      pkB,
      skA,
      await getVkId('SimpleBatchTransferCoin'),
      {
        account: accounts[1],
        fTokenShieldJson,
        fTokenShieldAddress,
      },
    );

    zInd2 = parseInt(response.z_E_index, 10);
    commitments = response.z_E;
    const bal2 = await controller.getBalance(accounts[0]);
    const wei = parseInt(bal1, 10) - parseInt(bal2, 10);
    console.log('gas consumed was', wei / 20e9);
    console.log('approx total cost in USD @$200/ETH was', wei * 200e-18);
    console.log('approx per transaction cost in USD @$200/ETH was', (wei * 200e-18) / 20);
  });

  test('Should transfer a pair of the 20 ERC-20 commitments that have just been created', async () => {
    const c = '0x00000000000000000000000000000002';
    const d = '0x00000000000000000000000000000002';
    const e = '0x00000000000000000000000000000001';
    const f = '0x00000000000000000000000000000003';
    const pkE = await utils.rndHex(32); // public key of Eve, who we transfer to
    const inputCommitments = [
      { value: c, salt: S_B_E[18], commitment: commitments[18], index: zInd2 - 1 },
      { value: d, salt: S_B_E[19], commitment: commitments[19], index: zInd2 },
    ];
    const outputCommitments = [
      { value: e, salt: await utils.rndHex(32) },
      { value: f, salt: await utils.rndHex(32) },
    ];

    await controller.transfer(
      inputCommitments,
      outputCommitments,
      pkE,
      skB,
      await getVkId('TransferCoin'),
      {
        account: accounts[1],
        fTokenShieldJson,
        fTokenShieldAddress,
      },
    );
  });
});