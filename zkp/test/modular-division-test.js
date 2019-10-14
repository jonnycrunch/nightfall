/* globals BigInt */
// test
import assert from 'assert';
import { modInverse, modDivide } from '../src/modular-division';
import { scalarMult } from '../src/encrypted-commitment';
import { getProps } from '../src/config';

const { babyjubjub, ZOKRATES_PRIME } = getProps();
const Fp = BigInt(ZOKRATES_PRIME);

describe('Tests of the modular division function', () => {
  it('Correctly assert 8/3 mod 5 == 1', () => {
    const a = BigInt(8);
    const b = BigInt(3);
    const m = BigInt(5);
    assert.equal(BigInt(1), modDivide(a, b, m));
  });
  it('Correctly assert division of crypto-size integers mod a large prime', () => {
    const { points, gm } = babyjubjub;
    const gv = points[1];
    const a = (gv[0] * gv[1] * gm[0] * gm[1]) % Fp; // make a huge number mod p
    assert.equal((gm[0] * gv[0]) % Fp, modDivide(a, (gv[1] * gm[1]) % Fp, Fp));
  });
  it('Correctly compute a modular inverse', () => {
    const Sk = BigInt('4');
    assert.equal(BigInt(1), (Sk * modInverse(Sk, Fp)) % Fp);
  });
  it('Correctly invert a scalar multiplication', () => {
    // if Q = n.P then P = Q.n^-1 where n^-1 is the inverse mod #E(Fp)
    const Sk = BigInt('4');
    const { JUBJUBE, JUBJUBC, points } = babyjubjub;
    const gv = points[1];
    const Fq = JUBJUBE / JUBJUBC;
    assert.deepEqual(gv, scalarMult(modInverse(Sk, Fq), scalarMult(Sk, gv)));
  });
});
