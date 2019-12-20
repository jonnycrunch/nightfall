/**
Implements a mimcHash function, mirroring that written by HarryR in Solidity.
*/

// TODO - move this into zkpUtils?
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
    b = (b * b) % m;
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
  }
  return r;
}

function mimcHash(...msgs) {
  const mimc = '0x6d696d63'; // this is 'mimc' in hex as a nothing-up-my-sleeve seed
  return `0x${mimcpe7mp(
    msgs.map(e => {
      const f = BigInt(e);
      if (f > config.ZOKRATES_PRIME) throw new Error('MiMC input exceeded prime field size');
      return f;
    }),
    BigInt(0),
    utils.keccak256Hash(mimc),
    91,
  )
    .toString(16)
    .padStart(64, '0')}`;
}

export default { mimcHash };
