/**
Implements a mimcHash function, mirroring that written by HarryR in Solidity.
*/

// TODO - move this into zkpUtils?
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> changes to merkle tree code
import config from 'config';
import utils from './zkpUtils';

function addMod(addMe, m) {
  return addMe.reduce((e, acc) => (e + acc) % m, BigInt(0));
}

function powerMod(base, exponent, m) {
  if (m === BigInt(1)) return BigInt(0);
  let result = BigInt(1);
  let b = base % m;
  let e = exponent;
  while (e > BigInt(0)) {
    if (e % BigInt(2) === BigInt(1)) result = (result * b) % m;
    e >>= BigInt(1);
<<<<<<< HEAD
=======
import config from './config';
import utils from './zkpUtils';

function addMod(addMe, m) {
  return addMe.reduce((e, acc) => (e + acc) % m, BigInt(0));
}

function powerMod(base, exponent, m) {
  if (m === BigInt(1)) return BigInt(0);
  let result = BigInt(1);
  let b = base % m;
  let e = exponent;
<<<<<<< HEAD
  while (e > 0) {
    if (e % 2 === 1) result = (result * b) % m;
    e >>= 1;
>>>>>>> feat(zkp): add mimc hash functions
    b = (b * b) % m;
=======
  while (e > BigInt(0)) {
    if (e % BigInt(2) === BigInt(1)) result = (result * b) % m;
    e >>= BigInt(1);
<<<<<<< HEAD
    b = mod(b * b, m);
>>>>>>> feat(zkp): debugging mimc hash
=======
    b = (b * b) % m;
>>>>>>> feat(zkp): solidity and node versions of MiMC agree
=======
    b = (b * b) % m;
>>>>>>> changes to merkle tree code
=======
import config from './config';
import utils from './zkpUtils';

function mod(a, m) {
  return ((a % m) + m) % m;
}

function addMod(addMe, m) {
  return addMe.reduce((e, acc) => mod(e + acc, m), BigInt(0));
}

function powerMod(base, exponent, m) {
  if (m === BigInt(1)) return BigInt(0);
  let result = BigInt(1);
  let b = mod(base, m);
  let e = exponent;
<<<<<<< HEAD
  while (e > 0) {
    if (e % 2 === 1) result = (result * b) % m;
    e >>= 1;
    b = (b * b) % m;
>>>>>>> feat(zkp): add mimc hash functions
=======
  while (e > BigInt(0)) {
    if (e % BigInt(2) === BigInt(1)) result = mod(result * b, m);
    e >>= BigInt(1);
    b = mod(b * b, m);
>>>>>>> feat(zkp): debugging mimc hash
  }
  return result;
}

/**
mimc encryption function
@param  {String} x - the input value
@param {String} k - the key value
@param {String} seed - input seed for first round (=0n for a hash)
@param
*/
function mimcpe7(x, k, seed, roundCount, m) {
  let xx = x;
  let t;
  let c = seed;
  for (let i = 0; i < roundCount; i++) {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> changes to merkle tree code
    c = utils.keccak256Hash(c);
    t = addMod([xx, BigInt(c), k], m); // t = x + c_i + k
    xx = powerMod(t, BigInt(7), m); // t^7
  }
  // Result adds key again as blinding factor
  return addMod([xx, k], m);
}

function mimcpe7mp(x, k, seed, roundCount, m = BigInt(config.ZOKRATES_PRIME)) {
  let r = k;
  let i;
  for (i = 0; i < x.length; i++) {
    r = (r + (x[i] % m) + mimcpe7(x[i], r, seed, roundCount, m)) % m;
<<<<<<< HEAD
=======
    c = utils.hash(c); // TODO
    t = addMod([xx, c, k], m); // t = x + c_i + k
    xx = powerMod(t, 7, m); // t^7
=======
    c = utils.keccak256Hash(c);
    t = addMod([xx, BigInt(`0x${c}`), k], m); // t = x + c_i + k
    xx = powerMod(t, BigInt(7), m); // t^7
<<<<<<< HEAD
    a = mulMod([t, t], m);
    const yy = mulMod([mulMod([mulMod([a, a], m), a], m), t], m);
    // console.log('different', xx, yy);
>>>>>>> feat(zkp): debugging mimc hash
=======
>>>>>>> feat(zkp): intermediate save
  }
  // Result adds key again as blinding factor
  return addMod([xx, k], m);
}

function mimcpe7mp(x, k, seed, roundCount, m = BigInt(config.ZOKRATES_PRIME)) {
  let r = k;
<<<<<<< HEAD
  for (let i = 0; i < x.length; i++) {
<<<<<<< HEAD
    r = (r + x[i] + mimcpe7(x[i], r, seed, roundCount)) % m;
>>>>>>> feat(zkp): add mimc hash functions
=======
=======
  let i;
  for (i = 0; i < x.length; i++) {
<<<<<<< HEAD
>>>>>>> feat(zkp): intermediate save
    r = (r + x[i] + mimcpe7(x[i], r, seed, roundCount, m)) % m;
>>>>>>> feat(zkp): debugging mimc hash
=======
    r = (r + (x[i] % m) + mimcpe7(x[i], r, seed, roundCount, m)) % m;
>>>>>>> feat(zkp): solidity and node versions of MiMC agree
=======
>>>>>>> changes to merkle tree code
=======
    c = utils.hash(c); // TODO
    t = addMod([xx, c, k], m); // t = x + c_i + k
    xx = powerMod(t, 7, m); // t^7
=======
    c = utils.keccak256Hash(c);
    t = addMod([xx, BigInt(`0x${c}`), k], m); // t = x + c_i + k
    xx = powerMod(t, BigInt(7), m); // t^7
<<<<<<< HEAD
    a = mulMod([t, t], m);
    const yy = mulMod([mulMod([mulMod([a, a], m), a], m), t], m);
    // console.log('different', xx, yy);
>>>>>>> feat(zkp): debugging mimc hash
=======
>>>>>>> feat(zkp): intermediate save
  }
  // Result adds key again as blinding factor
  return addMod([xx, k], m);
}

function mimcpe7mp(x, k, seed, roundCount, m = BigInt(config.ZOKRATES_PRIME)) {
  let r = k;
<<<<<<< HEAD
  for (let i = 0; i < x.length; i++) {
<<<<<<< HEAD
    r = (r + x[i] + mimcpe7(x[i], r, seed, roundCount)) % m;
>>>>>>> feat(zkp): add mimc hash functions
=======
=======
  let i;
  for (i = 0; i < x.length; i++) {
>>>>>>> feat(zkp): intermediate save
    r = (r + x[i] + mimcpe7(x[i], r, seed, roundCount, m)) % m;
>>>>>>> feat(zkp): debugging mimc hash
  }
  return k + x[0] + mimcpe7(x[0], k, seed, roundCount, m);
  // return r;
}

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
function mimcHash(...msgs) {
  // elipses means input stored in array called msgs
  const mimc = '0x6d696d63'; // this is 'mimc' in hex as a nothing-up-my-sleeve seed
  return `0x${mimcpe7mp(
    // '${' notation '0x${x}' -> '0x34' w/ x=34
=======
function mimcHash(...msgs) {
  const mimc = '0x6d696d63'; // this is 'mimc' in hex as a nothing-up-my-sleeve seed
  return `0x${mimcpe7mp(
>>>>>>> changes to merkle tree code
    msgs.map(e => {
      const f = BigInt(e);
      if (f > config.ZOKRATES_PRIME) throw new Error('MiMC input exceeded prime field size');
      return f;
    }),
<<<<<<< HEAD
    BigInt(0), // k
    utils.keccak256Hash(mimc), // seed
    91, // rounds of hashing
  )
    .toString(16) // hex string - can remove 0s
    .padStart(64, '0')}`; // so pad
=======
function mimcHash(msgs) {
<<<<<<< HEAD
  return mimcpe7mp(msgs, 0, utils.sha256Hash('mimc'), 91);
>>>>>>> feat(zkp): add mimc hash functions
=======
  const mimc = '0x6d696d63'; // this is 'mimc' in hex as a nothing-up-my-sleeve seed
<<<<<<< HEAD
  return mimcpe7mp(msgs.map(e => BigInt(e)), BigInt(0), utils.keccak256Hash(mimc), 12); // 91
>>>>>>> feat(zkp): debugging mimc hash
=======
  return mimcpe7mp(msgs.map(e => BigInt(e)), BigInt(0), utils.keccak256Hash(mimc), 91); // 91
>>>>>>> feat(zkp): intermediate save
=======
    BigInt(0),
    utils.keccak256Hash(mimc),
    91,
  )
    .toString(16)
    .padStart(64, '0')}`;
>>>>>>> changes to merkle tree code
=======
function mimcHash(msgs) {
<<<<<<< HEAD
  return mimcpe7mp(msgs, 0, utils.sha256Hash('mimc'), 91);
>>>>>>> feat(zkp): add mimc hash functions
=======
  const mimc = '0x6d696d63'; // this is 'mimc' in hex as a nothing-up-my-sleeve seed
<<<<<<< HEAD
  return mimcpe7mp(msgs.map(e => BigInt(e)), BigInt(0), utils.keccak256Hash(mimc), 12); // 91
>>>>>>> feat(zkp): debugging mimc hash
=======
  return mimcpe7mp(msgs.map(e => BigInt(e)), BigInt(0), utils.keccak256Hash(mimc), 91); // 91
>>>>>>> feat(zkp): intermediate save
}

export default { mimcHash };
