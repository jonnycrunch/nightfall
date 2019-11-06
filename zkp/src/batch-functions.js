/**
module containing functions specific to batched proofs
*/
import jsonfile from 'jsonfile';
import { FTokenShield, VerifierRegistry, Verifier } from './contract-abstractions';
import zkp from './f-token-zkp';
import conf from './config';
import { computePath, computeVectors, checkRoot } from './compute-vectors';
import { computeProof } from './common-token-functions';
import Element from './Element';

const utils = require('zkp-utils');

const {
  BATCH_PROOF_SIZE,
  VK_IDS,
  MERKLE_HASHLENGTH,
  ZOKRATES_PACKING_SIZE,
  FT_SIMPLE_BATCH_TRANSFER_DIR,
} = conf;

/**
This function checks that an array is compatible with the batch proof
*/
function isArrayCorrect(array) {
  if (!Array.isArray(array)) throw new Error('The object passed was not an array');
  return array.length === BATCH_PROOF_SIZE;
}
/** TODO - will this work
This function is the simple batch equivalent of fungible transfer.  It takes a single
input coin and splits it between 20 recipients (some of which could be the original owner)
It's really the 'split' of a join-split.  It's no use for non-fungibles because, for them,
there's no concept of joining and splitting (yet).
@param {string} C - The value of the input coin C
@param {array} E - The values of the output coins (including the change coin)
@param {array} pkB - Bobs' public keys (must include at least one of pkA for change)
@param {string} S_C - Alice's salt
@param {array} S_E - Bobs' salts
@param {string} skA - Alice's private ('s'ecret) key
@param {string} zC - Alice's token commitment
@param {integer} zCIndex - the position of zC in the on-chain Merkle Tree
@param {string} account - the account that is paying for this
@returns {array} zE - The output token commitments
@returns {array} z_E_index - the indexes of the commitments within the Merkle Tree.  This is required for later transfers/joins so that Alice knows which leaf of the Merkle Tree she needs to get from the fTokenShield contract in order to calculate a path.
@returns {object} txObj - a promise of a blockchain transaction
*/
async function simpleFungibleBatchTransfer(C, E, _pkB, _S_C, _S_E, _skA, _zC, zCIndex, account) {
  console.group('\nIN TRANSFER...');
  // firstly, we may have been passed hex strings longer than 216 bits.  That won't work
  // for our scheme so we need to zero out any leading zeros. (Ignore coins because they are 128 bits)
  const pkB = _pkB.map(k => utils.zeroMSBs(k));
  const S_C = utils.zeroMSBs(_S_C);
  const S_E = _S_E.map(k => utils.zeroMSBs(k));
  const skA = utils.zeroMSBs(_skA);
  const zC = utils.zeroMSBs(_zC);

  // check we have arrays of the correct length
  if (!isArrayCorrect(E)) throw new Error('Array E was the wrong length');
  if (!isArrayCorrect(pkB)) throw new Error('Array pkB was the wrong length');
  if (!isArrayCorrect(S_E)) throw new Error('Array S_E was the wrong length');

  // as BigInt is a better representation (up until now we've preferred hex strings),
  // we may get inputs passed as hex strings so let's do a conversion just in case

  // addition check
  const c = BigInt(C);
  const T = E.reduce((acc, e) => acc + BigInt(e), BigInt(0));
  if (c !== T) throw new Error(`Input commitment value was ${C} but output total was ${T}`);

  console.log('Finding the relevant Shield and Verifier contracts');
  const fTokenShield = await FTokenShield.deployed();
  const verifier = await Verifier.deployed();
  const verifierRegistry = await VerifierRegistry.deployed();
  console.log('FTokenShield contract address:', fTokenShield.address);
  console.log('Verifier contract address:', verifier.address);
  console.log('VerifierRegistry contract address:', verifierRegistry.address);

  // get the simple fungible batch Transfer vkId
  console.log('Reading vkIds from json file...');
  const vkIds = await new Promise((resolve, reject) =>
    jsonfile.readFile(VK_IDS, (err, data) => {
      // doesn't natively support promises
      if (err) reject(err);
      else resolve(data);
    }),
  );
  const { vkId } = vkIds.SimpleBatchTransferCoin;

  const root = await fTokenShield.latestRoot();
  console.log(`Merkle Root: ${root}`);

  // Calculate new arguments for the proof:
  const pkA = utils.zeroMSBs(utils.hash(skA));
  const nC = utils.zeroMSBs(utils.concatenateThenHash(S_C, skA));
  const zE = [];
  for (let i = 0; i < E.length; i++) {
    zE[i] = utils.zeroMSBs(utils.concatenateThenHash(E[i], pkB[i], S_E[i]));
  }
  // we need the Merkle path from the token commitment to the root, expressed as Elements
  const pathC = await computePath(account, fTokenShield, zC, zCIndex);
  const pathCElements = {
    elements: pathC.path.map(element => new Element(element, 'field', MERKLE_HASHLENGTH * 8, 1)), // we truncate to 216 bits - sending the whole 256 bits will overflow the prime field
    positions: new Element(pathC.positions, 'field', 128, 1),
  };

  // Although we only strictly need the root to be reconciled within zokrates, it's easier to check and intercept any errors in js; so we'll first try to reconcole here:
  checkRoot(zC, pathC, root); // this function currently needs hex rather than BigInt
/*
  console.group('Existing Proof Variables:');
  const p = ZOKRATES_PACKING_SIZE;
  console.log(`C: ${C} : ${utils.hexToFieldPreserve(C, p)}`);
  for (const e of E) console.log(`E: ${e} : ${utils.hexToFieldPreserve(e, p)}`);
  for (const pkb of pkB) console.log(`pkB: ${pkb} : ${utils.hexToFieldPreserve(pkb, p)}`);
  console.log(`S_C: ${S_C} : ${utils.hexToFieldPreserve(S_C, p)}`);
  for (const se of S_E) console.log(`S_E: ${se} : ${utils.hexToFieldPreserve(se, p)}`);
  console.log(`skA: ${skA} : ${utils.hexToFieldPreserve(skA, p)}`);
  console.log(`zC: ${zC} : ${utils.hexToFieldPreserve(zC, p)}`);
  console.groupEnd();

  console.group('New Proof Variables:');
  console.log(`pkA: ${pkA} : ${utils.hexToFieldPreserve(pkA, p)}`);
  console.log(`nC: ${nC} : ${utils.hexToFieldPreserve(nC, p)}`);
  for (const ze of zE) console.log(`zE: ${ze} : ${utils.hexToFieldPreserve(ze, p)}`);
  console.log(`root: ${root} : ${utils.hexToFieldPreserve(root, p)}`);
  console.groupEnd();
*/
  const publicInputHash = utils.zeroMSBs(utils.concatenateThenHash(root, nC, ...zE));
  console.log('publicInputHash:', publicInputHash);

  const inputs = computeVectors([new Element(publicInputHash, 'field', 216, 1)]);
  console.log('inputs:');
  console.log(inputs);

  // get the pwd so we can talk to the container:
  const pwd = process.env.PWD.toString();
  console.log(pwd);

  const hostDir = FT_SIMPLE_BATCH_TRANSFER_DIR;
  console.log(hostDir);

  // compute the proof
  console.log(
    'Computing proof with w=[C,D,E,F,S_C,S_D,S_E,S_F,pathC[], orderC,pathD[], orderD,skA,pkB]  x=[nC,nD,zE,zF,root,1]',
  );
  console.log(
    'vector order: [C,skA,S_C,pathC[0...31],orderC,D,S_D,pathD[0...31], orderD,nC,nD,E,pkB,S_E,zE,F,S_F,zF,root]',
  );
  let proof = await computeProof(
    [
      new Element(publicInputHash, 'field', 216, 1),
      new Element(C, 'field', 128, 1),
      new Element(skA, 'field', 216, 1),
      new Element(S_C, 'field', 216, 1),
      ...pathCElements.elements.slice(1),
      pathCElements.positions,
      new Element(nC, 'field', 216, 1),
      ...E.map(e => new Element(e, 'field', 128, 1)),
      ...pkB.map(pkb => new Element(pkb, 'field', 216, 1)),
      ...S_E.map(se => new Element(se, 'field', 216, 1)),
      ...zE.map(ze => new Element(ze, 'field', 216, 1)),
      new Element(root, 'field', 216, 1),
    ],
    hostDir,
  );

  proof = Object.values(proof);
  // convert to flattened array:
  proof = utils.flattenDeep(proof);
  // convert to decimal, as the solidity functions expect uints
  proof = proof.map(el => utils.hexToDec(el));
  console.groupEnd();

  // send the token to Bob by transforming the commitment
  const [zEIndex, txObj] = await zkp.simpleFungibleBatchTransfer(
    proof,
    inputs,
    vkId,
    root,
    nC,
    zE,
    account,
    fTokenShield,
  );

  console.log('TRANSFER COMPLETE\n');
  console.groupEnd();
  return {
    z_E: zE,
    z_E_index: zEIndex,
    txObj,
  };
}

export default { simpleFungibleBatchTransfer };
