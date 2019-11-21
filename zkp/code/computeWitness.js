// eslint-disable-next-line import/extensions
import zokrates from '@eyblockchain/zokrates.js';
import { argv } from 'yargs';
import os from 'os';
import utils from '../src/zkpUtils';

/**
 * Runs and outputs the results of compute witness given an input file and a set of arguments.
 * Meant to be run from the cli using `npm run computeWitness -- -i <input file> -a <array-of-args-in-quotes>`
 *
 * @example `npm run computeWitness -- -i ft-burn -a "1 3 5 7"
 * @param -i - Name of file in the gm17 directory
 * @param -a - List of arguments, space separated in quotes
 */
async function computeWitness() {
  const inputFile = argv.i;
  const args = argv.a.split(' ');

  const gm17Directory = `${process.cwd()}/code/gm17`;
  console.group('\nComputing witness at', `${gm17Directory}/${inputFile}/${inputFile}...`);

  const output = await zokrates.computeWitness(
    `${gm17Directory}/${inputFile}/${inputFile}`,
    `${gm17Directory}/${inputFile}`,
    'witness',
    args,
    {
      verbose: true,
    },
  );

  console.log('output:', output);

  const lines = output.split(os.EOL);
  const cpData = [...lines];
  // ~out_130
  let outputValues = [];
  const regex = /(~out_[0-9]+ )([0-9])+/g;
  cpData
    .filter(el => el.match(regex))
    .map(el =>
      el.replace(/(~out_[0-9]+ )([0-9])+/g, (m, out, _val) => {
        const val = parseInt(_val, 10); // get the first number
        outputValues = outputValues.concat(val);
      }),
    );
  outputValues = outputValues.reverse(); // the outputs of zokrates are the wrong way around

  console.log(`outputValues: \n${outputValues}`);

  let outVal;
  switch (utils.isProbablyBinary(outputValues)) {
    case 'decimal':
      console.group('\nOutput from compute-witness:\n');
      console.log(`output array length: ${outputValues.length}\n`);
      console.log(`bin:  ${outputValues.forEach(val => utils.decToBin(val))}`);
      console.log(`dec:  ${outputValues}`);
      console.log(`hex:  ${outputValues.forEach(val => utils.decToHex(val))}`);
      console.groupEnd();
      break;
    default:
      outVal = outputValues.join('');
      console.group('\nOutput from compute-witness:\n');
      console.log(`output array length: ${outputValues.length}\n`);
      console.log(`bin:  ${outVal}`);
      console.log(`dec:  ${utils.binToDec(outVal)}`);
      console.log(`hex:  ${utils.binToHex(outVal)}`);
      console.groupEnd();
  }
  console.log(inputFile, 'SETUP MESSAGE: CREATE WITNESS COMPLETE');
  console.groupEnd();
}

computeWitness();
