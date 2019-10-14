/* globals BigInt */
import assert from 'assert';
import {
  scalarMult,
  babyjubjub,
  enc2,
  dec2,
  add,
  negate,
  hash,
  rndFieldElement,
} from '../src/encrypted-commitment';

describe('Babyjubjub cryptography tests', () => {
  it('Correctly compute a scalar multiplier on the Babyjubjub curve', () => {
    const { points } = babyjubjub;
    const gv = points[1];
    const Sk = BigInt('4');
    // this comes from Zokrates Pedersen512bit code so we know its 4.gv:
    const PkTest = [
      BigInt('10624360821702266736197468438435445939719745367234393212061381062942588576905'),
      BigInt('17522620677401472201433112250371604936150385414760411280739362011041111141253'),
    ];
    const Pk = scalarMult(Sk, gv);
    assert.deepEqual(PkTest, Pk);
  });
  it('Correctly perform point addition', () => {
    const { points } = babyjubjub;
    const gv = points[1];
    const sum = add(add(add(gv, gv), gv), gv);
    const mult = scalarMult(BigInt(4), gv);
    assert.deepEqual(sum, mult);
  });
  it('Correctly perform subtraction', () => {
    const { points, infinity } = babyjubjub;
    const gv = points[1];
    const dif = add(gv, negate(gv));
    assert.deepEqual(infinity, dif);
  });
  it('Correctly encrypt then decrypt a scalar together with a curve point', () => {
    const { points } = babyjubjub;
    const gv = points[1];
    const gk = points[0];
    const S = '0x1234';
    const Sk = BigInt('4');
    const A = BigInt('10');
    const Pk = scalarMult(Sk, gk);
    const { c0, c1, c2 } = enc2(A, Pk, rndFieldElement());
    // now test with a decryption
    const m1Test = scalarMult(A, gv);
    const m2Test = Pk;
    const { m1, m2 } = dec2(c0, c1, c2);
    assert.deepEqual(m1Test, m1);
    assert.deepEqual(m2Test, m2);
    assert.ok(hash(A, Pk, S));
  });
  it('Correctly negates a point on the curve', () => {
    const { points } = babyjubjub;
    const gv = points[1];
    assert.deepEqual(scalarMult(BigInt(-1), gv), negate(gv));
  });
});
