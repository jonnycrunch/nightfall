/**
Implements a mimcHash function, mirroring that written by HarryR in Solidity.
*/

// TODO - move this into zkpUtils?
import config from './config';
import utils from './zkpUtils';

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
}

function mimcpe7mp(x, k, seed, roundCount, m = BigInt(config.ZOKRATES_PRIME)) {
  let r = k;
  for (let i = 0; i < x.length; i++) {
    r = (r + x[i] + mimcpe7(x[i], r, seed, roundCount, m)) % m;
  }
  return mimcpe7(x[0], k, seed, roundCount, m);
  // !return r;
}

function mimcHash(msgs) {
  const mimc = '0x6d696d63'; // this is 'mimc' in hex as a nothing-up-my-sleeve seed
  return mimcpe7mp(msgs.map(e => BigInt(e)), BigInt(0), utils.keccak256Hash(mimc), 12); // 91
}

export default { mimcHash };
