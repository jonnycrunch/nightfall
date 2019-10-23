/**
This module factors out all of the smart contract abstractions used by
the application
*/

import Web3 from 'web3';
import contract from 'truffle-contract';
import jsonfile from 'jsonfile';
import config from 'config';

export const web3 = new Web3(
  Web3.givenProvider || new Web3.providers.HttpProvider(config.get('web3ProviderURL')),
);

export const FTokenShield = contract(jsonfile.readFileSync('./build/contracts/FTokenShield.json'));
FTokenShield.setProvider(web3.currentProvider);

export const VerifierRegistry = contract(
  jsonfile.readFileSync('./build/contracts/Verifier_Registry.json'),
);
VerifierRegistry.setProvider(web3.currentProvider);

export const Verifier = contract(jsonfile.readFileSync('./build/contracts/GM17_v0.json'));
Verifier.setProvider(web3.currentProvider);

export const FToken = contract(jsonfile.readFileSync('./build/contracts/FToken.json'));
FToken.setProvider(web3.currentProvider);
