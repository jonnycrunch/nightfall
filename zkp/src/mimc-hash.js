/**
Implements a mimcHash function, mirroring that written by HarryR in Solidity.
*/

// TODO - move this into zkpUtils?
import config from './config';
import utils from './zkpUtils';

function addMod(addMe, m = config.ZOKRATES_PRIME) {
  const sum = addMe.reduce((e, acc) => e + acc);
  return ((sum % m) + m) % m;
}

function powerMod(base, exponent, m = config.ZOKRATES_PRIME) {
  if (m === 1) return 0;
  let result = 1;
  let b = base % m;
  let e = exponent;
  while (e > 0) {
    if (e % 2 === 1) result = (result * b) % m;
    e >>= 1;
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
    c = utils.hash(c); // TODO
    t = addMod([xx, c, k], m); // t = x + c_i + k
    xx = powerMod(t, 7, m); // t^7
  }
  // Result adds key again as blinding factor
  return addMod(xx, k);
}

function mimcpe7mp(x, k, seed, roundCount, m = config.ZOKRATES_PRIME) {
  let r = k;
  for (let i = 0; i < x.length; i++) {
    r = (r + x[i] + mimcpe7(x[i], r, seed, roundCount)) % m;
  }
  return r;
}

function mimcHash(msgs) {
  return mimcpe7mp(msgs, 0, utils.sha256Hash('mimc'), 91);
}

export default { mimcHash };
