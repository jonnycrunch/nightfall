import fs from 'fs';
import utils from './zkpUtils';

function writeMimcConstants(file) {
  const mimc = '0x6d696d63'; // this is 'mimc' in hex as a nothing-up-my-sleeve seed
  let c = utils.keccak256Hash(mimc);
  for (let i = 0; i < 91; i++) {
    c = utils.keccak256Hash(c);
    const h = BigInt(`0x${c}`).toString(10);
    fs.writeFileSync(file, `${h},`, { flag: 'a' });
  }
}

writeMimcConstants('mimc-constants.txt');
