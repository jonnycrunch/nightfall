import { whisperTransaction } from './whisper';
import { accounts, db, offchain, zkp } from '../rest';

/**
 * This function will insert NFT commitment in database
 * req.user {
    address: '0x04b95c76d5075620a655b707a7901462aea8656d',
    name: 'alice',
    pk_A: '0x4c45963a12f0dfa530285fde66ac235c8f8ddf8d178098cdb292ac',
    password: 'alicesPassword'
 }
 * req.body {
    tokenUri: 'unique token name'
    tokenId: '0x1448d8ab4e0d610000000000000000000000000000000000000000000000000'
    salt: '0xE9A313C89C449AF6E630C25AB3ACC0FC3BAB821638E0D55599B518',
    commitment: '0xdd3434566',
    commitmentIndex: 1,
    isReceived: true,
    zCorrect: true,
    zOnchainCorrect: true,
  }
 * @param {*} req
 * @param {*} res
 */
export async function insertNFTCommitmentToDb(req, res, next) {
  try {
    res.data = await db.insertNFTCommitment(req.user, req.body);
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will fetch NFT commitments from database
 * req.user {
    address: '0x04b95c76d5075620a655b707a7901462aea8656d',
    name: 'alice',
    pk_A: '0x4c45963a12f0dfa530285fde66ac235c8f8ddf8d178098cdb292ac',
    password: 'alicesPassword'
 }
 * req.query {
    pageNo: 1,
    limit: 4
  }
 * @param {*} req
 * @param {*} res
 */
export async function getNFTCommitments(req, res, next) {
  try {
    res.data = await db.getNFTCommitments(req.user, req.query);
    console.log(res.data);
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will fetch NFT commitment transactions from database
 * req.user {
    address: '0x04b95c76d5075620a655b707a7901462aea8656d',
    name: 'alice',
    pk_A: '0x4c45963a12f0dfa530285fde66ac235c8f8ddf8d178098cdb292ac',
    password: 'alicesPassword'
 }
 * req.query {
    pageNo: 1,
    limit: 4
  }
 * @param {*} req
 * @param {*} res
 */
export async function getNFTCommitmentTransactions(req, res, next) {
  try {
    res.data = await db.getNFTCommitmentTransactions(req.user, req.query);
    next();
  } catch (err) {
    next(err);
  }
}

// check correctness
export async function checkCorrectnessForNFTCommitment(req, res, next) {
  try {
    res.data = await zkp.checkCorrectnessForNFTCommitment(req.headers, req.body);
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will mint a token and add a transaction in db
 * req.user {
    address: '0x04b95c76d5075620a655b707a7901462aea8656d',
    name: 'alice',
    pk_A: '0x4c45963a12f0dfa530285fde66ac235c8f8ddf8d178098cdb292ac',
    password: 'alicesPassword'
 }
 * req.body {
    salt: '0xE9A313C89C449AF6E630C25AB3ACC0FC3BAB821638E0D55599B518',
    uri: 'unique token name',
    tokenId: '0x1448d8ab4e0d610000000000000000000000000000000000000000000000000'
  }
 * @param {*} req
 * @param {*} res
 */
export async function mintToken(req, res, next) {
  const { uri, tokenId, contractAddress } = req.body;
  try {
    // mint a private 'token commitment' within the shield contract to represent the public NFToken with the specified tokenId
    const data = await zkp.mintToken(req.user, {
      tokenId,
      ownerPublicKey: req.user.pk_A,
    });

    // add the new token commitment (and details of its hash preimage) to the token db.
    await db.insertNFTCommitment(req.user, {
      tokenId,
      tokenUri: uri,
      shieldContractAddress: contractAddress,
      salt: data.salt,
      commitment: data.commitment,
      commitmentIndex: parseInt(data.commitmentIndex, 16),
      isMinted: true,
    });

    // update public_token db: set is_shielded to 'true' to indicate that the token is 'in escrow' in the shield contract.
    await db.updateNFTokenByTokenId(req.user, tokenId, {
      uri,
      tokenId,
      shieldContractAddress: contractAddress,
      isShielded: true,
    });

    res.data = data;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will transfer a token and update db
 * req.user {
    address: '0x04b95c76d5075620a655b707a7901462aea8656d',
    name: 'alice',
    pk_A: '0x4c45963a12f0dfa530285fde66ac235c8f8ddf8d178098cdb292ac',
    password: 'alicesPassword'
  }
 * req.body {
    tokenId: '0x1448d8ab4e0d610000000000000000000000000000000000000000000000000',
    uri: 'unique token name',
    salt: '0xe9a313c89c449af6e630c25ab3acc0fc3bab821638e0d55599b518',
    transferredSalt: '0xF4C7028D78D140333A36381540E70E6210895A994429FB0483FB91',
    commitment: '0xca2c0c099289896be4d72c74f801bed6e4b2cd5297bfcf29325484',
    receiver: 'bob',
    commitmentIndex: 0,
    receiverPublicKey: '0xebbabcc471780d9581451e1b2f03bb54638800dd441d1e5c2344f8'
  }
 * @param {*} req
 * @param {*} res
 */
export async function transferToken(req, res, next) {
  try {
    // Generate a new one-time-use Ethereum address for the sender to use
    const password = (req.user.address + Date.now()).toString();
    const address = (await accounts.createAccount(password)).data;
    await db.updateUserWithPrivateAccount(req.user, { address, password });
    await accounts.unlockAccount({ address, password });

    // get logged in user's secretkey.
    const user = await db.fetchUser(req.user);
    req.body.senderSecretKey = user.secretkey;

    // Fetch the receiver's pk from the PKD by passing their username
    req.body.receiverPublicKey = await offchain.getZkpPublicKeyFromName(req.body.receiver);

    // Transfer the token under zero-knowledge:
    // Nullify the sender's 'token commitment' within the shield contract.
    // Add a new token commitment to the shield contract to represent that the token is now owned by the receiver.
    const data = await zkp.spendToken(
      { address },
      {
        tokenId: req.body.tokenId,
        receiverPublicKey: req.body.receiverPublicKey,
        originalCommitmentSalt: req.body.salt,
        senderSecretKey: req.body.senderSecretKey,
        commitment: req.body.commitment,
        commitmentIndex: req.body.commitmentIndex,
      },
    );

    // Update the sender's token db.
    await db.updateNFTCommitmentByTokenId(req.user, req.body.tokenId, {
      tokenId: req.body.tokenId,
      tokenUri: req.body.uri,
      salt: req.body.salt,
      commitment: req.body.commitment,
      commitmentIndex: req.body.commitmentIndex,
      transferredSalt: data.transferredSalt,
      transferredCommitment: data.transferredCommitment,
      transferredCommitmentIndex: parseInt(data.transferredCommitmentIndex, 16),
      receiver: req.body.receiver,
      isTransferred: true,
    });

    // Send details of the newly-created token commitment to Bob (the receiver) via Whisper.
    await whisperTransaction(req, {
      tokenUri: req.body.uri,
      tokenId: req.body.tokenId,
      shieldContractAddress: req.body.contractAddress,
      salt: data.transferredSalt,
      commitment: data.transferredCommitment,
      commitmentIndex: parseInt(data.transferredCommitmentIndex, 16),
      blockNumber: data.txReceipt.receipt.blockNumber,
      receiver: req.body.receiver,
      receiverPublicKey: req.body.receiverPublicKey,
      for: 'NFTCommitment',
    });

    res.data = data;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will burn a token and update db's
 * req.user {
     address: '0x7d6ca0d3d9246686626dd5b59f5bbd323cbcb15b',
    name: 'bob',
    pk_A: '0xebbabcc471780d9581451e1b2f03bb54638800dd441d1e5c2344f8',
    password: 'bobsPassword'
  }
 * req.body {
     tokenId: '0x1448d8ab4e0d610000000000000000000000000000000000000000000000000',
      uri: 'unique token name',
      salt: '0xf4c7028d78d140333a36381540e70e6210895a994429fb0483fb91',
      commitment: '0xe0e327cee19c16949a829977a1e3a36b92c2ef22b735b6d7af6c33',
      commitmentIndex: 1,
      payTo: 'bob',
  }
 * @param {*} req
 * @param {*} res
 */
export async function burnToken(req, res, next) {
  try {
    const payToAddress = await offchain.getAddressFromName(req.body.payTo || req.user.name);

    // get logged in user.
    const user = await db.fetchUser(req.user);
    // Release the public token from escrow:
    // Nullify the burnor's 'token commitment' within the shield contract.
    // Transfer the public token from the shield contract to the owner.
    res.data = await zkp.burnToken(req.user, {
      tokenId: req.body.tokenId,
      salt: req.body.salt,
      secretKey: user.secretkey,
      commitment: req.body.commitment,
      commitmentIndex: req.body.commitmentIndex,
      tokenReceiver: payToAddress,
    });

    await db.updateNFTCommitmentByTokenId(req.user, req.body.tokenId, {
      tokenId: req.body.tokenId,
      tokenUri: req.body.uri,
      salt: req.body.salt,
      commitment: req.body.commitment,
      commitmentIndex: req.body.commitmentIndex,
      receiver: req.body.payTo || req.user.name,
      isBurned: true,
    });

    if (req.body.payTo) {
      // Send details of the token to the receiver via Whisper
      await whisperTransaction(req, {
        uri: req.body.uri,
        tokenId: req.body.tokenId,
        shieldContractAddress: req.body.contractAddress,
        receiver: req.body.payTo, // this will change when payTo will be a user other than burner himself.
        sender: req.user.name,
        senderAddress: req.user.address,
        blockNumber: res.data.txReceipt.receipt.blockNumber,
        for: 'NFTToken',
      });
    } else {
      await db.insertNFToken(req.user, {
        uri: req.body.uri,
        tokenId: req.body.tokenId,
        shieldContractAddress: req.body.contractAddress,
        sender: req.user.name,
        senderAddress: req.user.address,
        isReceived: true,
      });
    }

    res.data = { message: 'burn successful' };
    next();
  } catch (err) {
    next(err);
  }
}
