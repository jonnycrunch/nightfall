/* eslint-disable import/no-unresolved */

import utils from 'zkp-utils';
import AccountUtils from '../src/account-utils/account-utils';

import controller from '../src/batch-functions';
import vk from '../src/vk-controller';
import { FToken } from '../src/contract-abstractions';

jest.setTimeout(7200000);

const PROOF_LENGTH = 20;
const C = '0x00000000000000000000000000000014'; // 128 bits = 16 bytes = 32 chars
const E = new Array(20).fill('0x00000000000000000000000000000001');
const skA = '0x0000000000111111111111111111111111111111111111111111111111111111';
let S_A_C;
let S_B_E = [];
let pkA;
let pkB = [];
let Z_A_C;
// storage for z indexes
let zInd1;
let ftoken;

beforeAll(async () => {
  await vk.runController;
  ftoken = await FToken.deployed(); // get and instance of the ERC20 contract
  for (let i = 0; i < PROOF_LENGTH; i++) {
    S_B_E[i] = utils.rndHex(32);
    pkB[i] = utils.rndHex(32);
  }
  S_B_E = await Promise.all(S_B_E);
  pkB = await Promise.all(pkB);
  S_A_C = await utils.rndHex(32);
  pkA = utils.ensure0x(utils.strip0x(utils.hash(skA)).padStart(32, '0'));
  Z_A_C = utils.concatenateThenHash(C, pkA, S_A_C);
});

// eslint-disable-next-line no-undef
describe('f-token-controller.js tests', () => {
  // Alice has C + D to start total = 50 ETH
  // Alice sends Bob E and gets F back (Bob has 40 ETH, Alice has 10 ETH)
  // Bob then has E+G at total of 70 ETH
  // Bob sends H to Alice and keeps I (Bob has 50 ETH and Alice has 10+20=30 ETH)

  test('Should create 10000 tokens in accounts[0]', async () => {
    // fund some accounts with FToken
    const accounts = await AccountUtils.getEthAccounts();
    const AMOUNT = 10000;
    const bal1 = await ftoken.balanceOf.call(accounts[0]);
    await controller.buyFToken(AMOUNT, accounts[0]);
    const bal2 = await ftoken.balanceOf.call(accounts[0]);
    expect(AMOUNT).toEqual(bal2 - bal1);
  });

  test('Should mint an ERC-20 commitment Z_A_C for Alice of value C', async () => {
    const accounts = await AccountUtils.getEthAccounts();
    const [zTest, zIndex] = await controller.mint(C, pkA, S_A_C, accounts[0]);
    zInd1 = parseInt(zIndex, 10);
    expect(Z_A_C).toEqual(zTest);
  });

  test('Should transfer ERC-20 commitments of various values to 19 receipients and get change', async () => {
    // the E's becomes Bobs'.
    const accounts = await AccountUtils.getEthAccounts();
    await controller.simpleBatchTransfer(C, E, pkB, S_A_C, S_B_E, skA, Z_A_C, zInd1, accounts[0]);
  });
});
