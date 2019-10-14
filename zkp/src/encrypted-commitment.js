/* global BigInt */
/**
functions to manage a commitment which is created using encryption, rather than
a hash (and can thus be un-hidden if you know the cryption key).
It uses a modified form of El-Gamal, which enables encryption of two messages
*/
import random from 'random-bigint';
import { getProps } from './config';
import { modDivide } from './modular-division';

const utils = require('zkp-utils')('/app/config/stats.json');

export const { babyjubjub, authority, ZOKRATES_PRIME, HASHLENGTH } = getProps();
const one = BigInt(1);

const { JUBJUBE, JUBJUBC } = babyjubjub;
export const Fp = BigInt(ZOKRATES_PRIME); // the prime field used with the curve E(Fp)
export const Fq = JUBJUBE / JUBJUBC;

function isOnCurve(p) {
  const { JUBJUBA: a, JUBJUBD: d } = babyjubjub;
  const uu = (p[0] * p[0]) % Fp;
  const vv = (p[1] * p[1]) % Fp;
  const uuvv = (uu * vv) % Fp;
  return (a * uu + vv) % Fp === (one + d * uuvv) % Fp;
}

export function negate(g) {
  return [Fp - g[0], g[1]]; // this is wierd - we negate the x coordinate, not the y with babyjubjub!
}

/**
Point addition on the babyjubjub curve TODO - MOD P THIS
*/
export function add(p, q) {
  const { JUBJUBA: a, JUBJUBD: d } = babyjubjub;
  const u1 = p[0];
  const v1 = p[1];
  const u2 = q[0];
  const v2 = q[1];
  const uOut = modDivide(u1 * v2 + v1 * u2, one + d * u1 * u2 * v1 * v2, Fp);
  const vOut = modDivide(v1 * v2 - a * u1 * u2, one - d * u1 * u2 * v1 * v2, Fp);
  if (!isOnCurve([uOut, vOut])) throw new Error('Addition point is not on the babyjubjub curve');
  return [uOut, vOut];
}

/**
Scalar multiplication on a babyjubjub curve
@param {BigInt} _a - scalar mod p
@param {Object} _h - curve point in u,v coordinates
*/
export function scalarMult(_a, h) {
  // if (typeof _a !== 'bigint') throw new Error('Scalar multiplier must be a BigInt'); // eslint-disable-line valid-typeof
  const { infinity } = babyjubjub;
  const a = ((BigInt(_a) % Fq) + Fq) % Fq; // just in case we get a value that's too big or negative
  const exponent = a
    .toString(2)
    // .padStart(256, '0')
    .split(''); // extract individual binary elements
  let doubledP = [...h]; // deep copy h to prevent h being mutated by the algorithm
  let accumulatedP = infinity;
  for (let i = exponent.length - 1; i >= 0; i--) {
    const candidateP = add(accumulatedP, doubledP);
    accumulatedP = exponent[i] === '1' ? candidateP : accumulatedP;
    // if (exponent[i] === '1') console.log('match', i, exponent[i]);
    doubledP = add(doubledP, doubledP);
  }
  if (!isOnCurve(accumulatedP))
    throw new Error('Scalar multiplication point is not on the babyjubjub curve');
  return accumulatedP;
}

// get some public keys to use with encryption
export function getAuthorityPublicKeys() {
  const y1 = authority.test
    ? scalarMult(authority.TEST_PRIVATE_KEY_1, babyjubjub.gm)
    : authority.PUBLIC_KEY_1;
  const y2 = authority.test
    ? scalarMult(authority.TEST_PRIVATE_KEY_2, babyjubjub.gm)
    : authority.PUBLIC_KEY_2;
  return { y1, y2 };
}

// get the authority secret keys for decryption - only used for test
function getAuthoritySecretKeys() {
  if (!authority.test)
    throw new Error('Attempting to use test secret keys while not in test mode. This is insecure.');
  const Sk1 = authority.TEST_PRIVATE_KEY_1;
  const Sk2 = authority.TEST_PRIVATE_KEY_2;
  // const invSk1 = -Sk1; // modInverse(Sk1, Fq); // note inverses are computed over Fq, the order of the curve, not Fp
  // const invSk2 = -Sk2; // modInverse(Sk2, Fq);
  return { Sk1, Sk2 };
}

/**
generates a random scalar mod Fq for use in encryption
*/
export function rndFieldElement() {
  return random(253) % Fq;
}

/**
Performs 2-message El-Gamal encryption
@param {String} A - hex string containing a scalar value to be encrypted
@param {Array(BigInt)} Pk - curve point representing the user's public key
@param {BigInt} r - random BigInt mod Fq
y1 - curve point representing the authority's public key
y2 - curve point representing the authority's other public key
gv = curve point
g = another curve point, unrelated to gv
*/
export function enc2(A, Pk, r) {
  const { points, gm } = babyjubjub;
  const { y1, y2 } = getAuthorityPublicKeys();
  // these are the elements that make up z, which is now a vector comprising ec points and a hash
  const c0 = scalarMult(r, gm);
  const c1 = add(scalarMult(A, points[1]), scalarMult(r, y1));
  const c2 = add(Pk, scalarMult(r, y2));
  return { c0, c1, c2 };
}

/**
Decrypt the above
*/
export function dec2(c0, c1, c2) {
  const { Sk1, Sk2 } = getAuthoritySecretKeys();
  const m1 = add(c1, scalarMult(Sk1, negate(c0)));
  const m2 = add(c2, scalarMult(Sk2, negate(c0)));
  return { m1, m2 };
}

/**
Pedersen hash of A, pk
*/
function pedersen(A, pk, S) {
  const { points } = babyjubjub;
  const pkx = pk[0].toString();
  const pky = pk[1].toString();
  return add(
    add(scalarMult(A, points[2]), scalarMult(pkx, points[3])),
    add(scalarMult(S, points[4]), scalarMult(pky, points[5])),
  );
}

/**
'compresses' a curve point into a single hex value
*/
function edwardsCompress(p) {
  const px = p[0];
  const py = p[1];
  const xBits = px.toString(2).padStart(256, '0');
  const yBits = py.toString(2).padStart(256, '0');
  // TODO - check this =  Is probing the LSB correct?
  const sign = xBits[255] === '1' ? '1' : '0';
  const yBitsC = sign.concat(yBits.slice(1)); // add in the sign bit
  const y = utils.ensure0x(BigInt('0b'.concat(yBitsC)).toString(16)); // put yBits into hex
  return y;
}

/**
Creates a hash from the values to be committed, This is a pedersen hash (efficient)
followed by a sha hash (secure). This can be used as the leaf of a Merkle tree
*/
export function hash(A, pk, S) {
  const p = pedersen(A, pk, S);
  const cp = edwardsCompress(p);
  return utils.recursiveHashConcat(cp.slice(-2 * HASHLENGTH));
}
