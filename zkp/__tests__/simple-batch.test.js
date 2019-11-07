/* eslint-disable import/no-unresolved */

import utils from 'zkp-utils';
import { getEthAccounts, getAccountBalance } from '../src/account-utils/account-utils';

import controller from '../src/batch-functions';
import fcontroller from '../src/f-token-controller';
import vk from '../src/vk-controller';
import { FToken } from '../src/contract-abstractions';

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
let ftoken;
let commitments = [];

beforeAll(async () => {
  await vk.runController();
  ftoken = await FToken.deployed(); // get an instance of the ERC20 contract
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
    const accounts = await getEthAccounts();
    const AMOUNT = 10000;
    const bal1 = await ftoken.balanceOf.call(accounts[0]);
    await ftoken.mint(accounts[0], AMOUNT, {
      from: accounts[0],
      gas: 4000000,
    });
    const bal2 = await ftoken.balanceOf.call(accounts[0]);
    expect(AMOUNT).toEqual(bal2 - bal1);
  });

  test('Should mint an ERC-20 commitment Z_A_C for Alice of value C', async () => {
    const accounts = await getEthAccounts();
    const [zTest, zIndex] = await fcontroller.mint(C, pkA, S_A_C, accounts[0]);
    zInd1 = parseInt(zIndex, 10);
    expect(Z_A_C).toEqual(zTest);
  });

  test('Should transfer ERC-20 commitments of various values to 19 receipients and get change', async () => {
    // the E's becomes Bobs'.
    const accounts = await getEthAccounts();
    const bal1 = await getAccountBalance(accounts[0]);
    const response = await controller.simpleFungibleBatchTransfer(
      C,
      E,
      pkB,
      S_A_C,
      S_B_E,
      skA,
      Z_A_C,
      zInd1,
      accounts[0],
    );
    zInd2 = parseInt(response.z_E_index, 10);
    commitments = response.z_E;
    const bal2 = await getAccountBalance(accounts[0]);
    const wei = parseInt(bal1, 10) - parseInt(bal2, 10);
    console.log('gas consumed was', wei / 20e9);
    console.log('approx total cost in USD @$200/ETH was', wei * 200e-18);
    console.log('approx per transaction cost in USD @$200/ETH was', (wei * 200e-18) / 20);
  });

  test('Should transfer a pair of the 20 ERC-20 commitments that have just been created', async () => {
    const accounts = await getEthAccounts();
    const c = '0x00000000000000000000000000000002';
    const d = '0x00000000000000000000000000000002';
    const e = '0x00000000000000000000000000000001';
    const f = '0x00000000000000000000000000000003';
    const pkE = await utils.rndHex(32); // public key of Eve, who we transfer to
    await fcontroller.transfer(
      c,
      d,
      e,
      f,
      pkE,
      S_B_E[18],
      S_B_E[19],
      await utils.rndHex(32),
      await utils.rndHex(32),
      skB,
      commitments[18],
      zInd2 - 1,
      commitments[19],
      zInd2,
      accounts[0],
    );
  });
});
