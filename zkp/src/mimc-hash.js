/**
Implements a mimcHash function, mirroring that written by HarryR in Solidity.
*/

// TODO - move this into zkpUtils?
import config from 'config';
import utils from './zkpUtils';

<<<<<<< HEAD
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
    b = (b * b) % m;
=======
function mod(a, m) {
  return ((a % m) + m) % m;
}

function addMod(addMe, m) {
  const sum = addMe.reduce((e, acc) => mod(e + acc, m), BigInt(0));
  return mod(sum, m);
}

function mulMod(timesMe, m) {
  const product = timesMe.reduce((e, acc) => mod(e * acc, m), BigInt(1));
  return mod(product, m);
}

function powerMod(base, exponent, m) {
  if (m === BigInt(1)) return BigInt(0);
  let result = BigInt(1);
  let b = mod(base, m);
  let e = exponent;
  while (e > BigInt(0)) {
    if (e % BigInt(2) === BigInt(1)) result = mod(result * b, m);
    e /= BigInt(2);
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
  let a;
  console.log('roundCount', roundCount);
  for (let i = 0; i < roundCount; i++) {
    c = utils.keccak256Hash(c);
<<<<<<< HEAD
    t = addMod([xx, BigInt(c), k], m); // t = x + c_i + k
    xx = powerMod(t, BigInt(7), m); // t^7
  }
  // Result adds key again as blinding factor
  return addMod([xx, k], m);
=======
    // console.log(xx,BigInt(`0x${c}`),k);
    t = addMod([xx, BigInt(`0x${c}`), k], m); // t = x + c_i + k
    // console.log('sum', (xx + BigInt(`0x${c}`) + k) % m);
    xx = powerMod(t, BigInt(7), m); // t^7
    a = mulMod([t, t], m);
    const yy = mulMod([mulMod([mulMod([a, a], m), a], m), t], m);
    // console.log('different', xx, yy);
  }
  // Result adds key again as blinding factor
  // return addMod([xx, k], m);
  // console.log('c', c)
  console.log('t', t);
  return a;
  //return BigInt(`0x${c}`);
>>>>>>> feat(zkp): debugging mimc hash
}

function mimcpe7mp(x, k, seed, roundCount, m = BigInt(config.ZOKRATES_PRIME)) {
  let r = k;
<<<<<<< HEAD
  let i;
  for (i = 0; i < x.length; i++) {
    r = (r + (x[i] % m) + mimcpe7(x[i], r, seed, roundCount, m)) % m;
=======
  for (let i = 0; i < x.length; i++) {
    r = (r + x[i] + mimcpe7(x[i], r, seed, roundCount, m)) % m;
>>>>>>> feat(zkp): debugging mimc hash
  }
  return mimcpe7(x[0], k, seed, roundCount, m);
  // !return r;
}

<<<<<<< HEAD
function mimcHash(...msgs) { //elipses means input stored in array called msgs
  const mimc = '0x6d696d63'; // this is 'mimc' in hex as a nothing-up-my-sleeve seed
  return `0x${mimcpe7mp( // '${' notation '0x${x}' -> '0x34' w/ x=34
    msgs.map(e => {
      const f = BigInt(e);
      if (f > config.ZOKRATES_PRIME) throw new Error('MiMC input exceeded prime field size');
      return f;
    }),
    BigInt(0), //k
    utils.keccak256Hash(mimc), //seed
    91, //rounds of hashing
  )
    .toString(16) //hex string - can remove 0s
    .padStart(64, '0')}`; //so pad
=======
function mimcHash(msgs) {
  const mimc = '0x6d696d63'; // this is 'mimc' in hex as a nothing-up-my-sleeve seed
  return mimcpe7mp(msgs.map(e => BigInt(e)), BigInt(0), utils.keccak256Hash(mimc), 12); // 91
>>>>>>> feat(zkp): debugging mimc hash
}

export default { mimcHash };
