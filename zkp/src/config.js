/* global BigInt */
/**
@module config.js
@author Westlad, Chaitanya-Konda, iAmMichaelConnor
@desc constants used by a nubmer of other modules
*/

let env = 'local'; // set the environment to local if not mentioned while starting the app

/* PATH NAMING CONVENTIONS:

FILENAME_FILEPATH - path up to and including a file called /fileName.extension


DIRNAME_DIRPATH - path to inside a folder called /dirName/.
E.g. for .../parentDir/dirName/fileName.extension, DIRNAME_DIRPATH is to within .../parentDir/dirName/

FILENAME_DIRPATH - path to inside the folder which contains fileName.extension.
E.g. for .../dirName/fileName.extension, FILENAME_DIRPATH is to within .../dirName/


DIRNAME_PARENTPATH - path to inside the parent directory of a directory. E.g. for /parentDir/dirName/fileName.extension, DIRNAME_PARENTPATH is to /parentDir/

FILENAME_PARENTPATH - path to inside the parent directory of a file's containing folder.
E.g. for .../parentDir/dirName/filename.extension, FILENAME_PARENTPATH is .../parentDir/

REL - relative path (relative from process.env.PWD, which in our repo is from path-to-/nightfall/zkp/) (the ./nightfall shell script executes all of this zkp node code from within path-to/zkp/)
i.e. DIRNAME_DIRPATH_REL: "/dirName/" is a relative path which (on the host machine) points to: path-to-/nightfall/zkp/dirName/

ABS - absolute path
*/
const commonConfig = {
  HASHLENGTH: 27, // expected length of a hash in bytes
  ZOKRATES_IMAGE: 'zokrates/zokrates:0.4.11', // tag of Zorates docker image
  ZKP_PWD: 'zkp',
  ZKP_SRC_REL: 'src/',
  ZKP_SAFE_DUMP_DIRPATH_REL: 'code/safe-dump/', // safe-dump is a folder for dumping new files which node or zokrates create onto the host machine. Using the safe-dump folder in this way reduces the risk of overwriting data in the 'code' folder.
  //* ****
  ZOKRATES_HOST_CODE_DIRPATH_REL: 'code/', // path to code files on the host from process.env.PWD (= path-to-/nightfall/zkp/)
  ZOKRATES_HOST_CODE_PARENTPATH_REL: './',
  //* ****
  ZOKRATES_CONTAINER_CODE_CALIBRATION_FILEPATH_ABS: 'home/zokrates/code/code-calibration.txt',
  //* ****
  ZOKRATES_CONTAINER_CODE_DIRPATH_ABS: '/home/zokrates/code/', // path to within the 'code' folder in the container - must exist
  ZOKRATES_CONTAINER_CODE_PARENTPATH_ABS: '/home/zokrates/',
  //* ****
  ZOKRATES_APP_FILEPATH_ABS: '/home/zokrates/zokrates', // path to the ZoKrates app in the container
  ZOKRATES_APP_DIRPATH_ABS: '/home/zokrates/',
  ZOKRATES_APP_PARENTPATH_ABS: '/home/',
  //* ****
  ZOKRATES_OUTPUTS_DIRPATH_ABS: '/home/zokrates/', // container path to the output files written by ZoKrates
  ZOKRATES_OUTPUTS_PARENTPATH_ABS: '/home/',
  //* ****
  ZOKRATES_PRIME: '21888242871839275222246405745257275088548364400416034343698204186575808495617', // decimal representation of the prime p of GaloisField(p)
  // NOTE: 2^253 < ZOKRATES_PRIME < 2^254 - so we must use 253bit numbers to be safe (and lazy) - let's use 248bit numbers (because hex numbers ought to be an even length, and 8 divides 248 (248 is 31 bytes is 62 hex numbers))
  ZOKRATES_PACKING_SIZE: '128', // ZOKRATES_PRIME is approx 253-254bits (just shy of 256), so we pack field elements into blocks of 128 bits.
  MERKLE_DEPTH: 33, // 27, //the depth of the coin Merkle tree
  MERKLE_CHUNK_SIZE: 512, // the number of tokens contained in a chunk of the merkle tree.

  ZOKRATES_BACKEND: 'gm17',

  NFT_MINT_DIR: 'gm17/nft-mint/',
  NFT_TRANSFER_DIR: 'gm17/nft-transfer/',
  NFT_BURN_DIR: 'gm17/nft-burn/',

  FT_MINT_DIR: 'gm17/ft-mint/',
  FT_TRANSFER_DIR: 'gm17/ft-transfer/',
  FT_BURN_DIR: 'gm17/ft-burn/',

  FT_KYC_MINT_DIR: 'gm17/ft-kyc-mint/',
  FT_KYC_TRANSFER_DIR: 'gm17/ft-kyc-transfer/',
  FT_KYC_BURN_DIR: 'gm17/ft-kyc-burn/',

  AGREE_CONTRACT_DIR: '/code/gm17/agree-contract/',

  NFT_MINT_VK: './code/gm17/nft-mint/nft-mint-vk.json',
  NFT_TRANSFER_VK: './code/gm17/nft-transfer/nft-transfer-vk.json',
  NFT_BURN_VK: './code/gm17/nft-burn/nft-burn-vk.json',

  FT_MINT_VK: './code/gm17/ft-mint/ft-mint-vk.json',
  FT_TRANSFER_VK: './code/gm17/ft-transfer/ft-transfer-vk.json',
  FT_BURN_VK: './code/gm17/ft-burn/ft-burn-vk.json',

  FT_KYC_MINT_VK: './code/gm17/ft-kyc-mint/ft-kyc-mint-vk.json',
  FT_KYC_TRANSFER_VK: './code/gm17/ft-kyc-transfer/ft-kyc-transfer-vk.json',
  FT_KYC_BURN_VK: './code/gm17/ft-kyc-burn/ft-kyc-burn-vk.json',

  AGREE_CONTRACT_VK: './code/gm17/agree-contract/agree-contract-vk.json',

  VK_IDS: './src/vkIds.json',
  STATS: './src/stats.json',
  VERIFYING_KEY_CHUNK_SIZE: 10,
  INPUT_CHUNK_SIZE: 128,
  GASPRICE: 20000000000,
  KYC: true,
  babyjubjub: {
    JUBJUBE: BigInt(
      '21888242871839275222246405745257275088614511777268538073601725287587578984328',
    ),
    JUBJUBC: BigInt(8), // Cofactor
    JUBJUBA: BigInt(168700), // Coefficient A
    JUBJUBD: BigInt(168696), // Coefficient D
    MONTA: BigInt(168698), // int(2*(JUBJUB_A+JUBJUB_D)/(JUBJUB_A-JUBJUB_D))
    MONTB: BigInt(1), // int(4/(JUBJUB_A-JUBJUB_D))
    gm: [
      BigInt('16540640123574156134436876038791482806971768689494387082833631921987005038935'),
      BigInt('20819045374670962167435360035096875258406992893633759881276124905556507972311'),
    ], // gm - used for Master public key generation and encryption
    infinity: [BigInt(0), BigInt(1)],
    points: [
      [
        BigInt('13418723823902222986275588345615650707197303761863176429873001977640541977977'),
        BigInt('15255921313433251341520743036334816584226787412845488772781699434149539664639'),
      ], // gk - used to generate use public key
      [
        BigInt('10096735692467598736728394557736034054031417419721869067082824451240861468728'),
        BigInt('16704592219657141368520262522286248296157931669321735564513068002743507745908'),
      ], // gv - used to turn token value into point
      [
        BigInt('13312232735691933658355691628172862856002099081831058080743469900077389848112'),
        BigInt('13997829888819279202328839701908695991998552542771378089573544166678617234314'),
      ], // rest are used for Pedersen hashing
      [
        BigInt('3514614172108804338031132171140068954832144631243755202685348634084887116595'),
        BigInt('15464894923367337880246198022819299804461472054752016232660084768002214822896'),
      ],
      [
        BigInt('15118628380960917951049569119912548662747322287644759811263888312919249703276'),
        BigInt('20910093482714196883913434341954530700836700132902516503233669201436063149009'),
      ],
      [
        BigInt('12047448614322625640496087488290723061283996543855169192549742347740217312911'),
        BigInt('16179347143471683729835238045770641754106645772730542840306059882771262928390'),
      ],
      [
        BigInt('12701245173613054114260668542643518710151543759808175831262148773821226772548'),
        BigInt('6893882093554801220855651573375911275440312424798351852776449414399981870319'),
      ],
      [
        BigInt('2944698428855471170284815781705687753367479016293091716206788980482046638948'),
        BigInt('17360101552805013843890050881314712134389035043192466182420273655548320239406'),
      ],
      [
        BigInt('14561966822440683665541629338358038450751192033904756806839710397580365916408'),
        BigInt('2103279357051120614300268561700949519576521616178686690761693996681299230890'),
      ],
      [
        BigInt('6226499033652114521979121779728984801913588832404495199289210905837818402723'),
        BigInt('7443974969385276473096219793909172323973358085935860096061435962537700448286'),
      ],
    ],
  },
  authority: {
    test: true, // if this is set, the test private keys will be used to generate public keys
    TEST_PRIVATE_KEY_1: BigInt(123),
    TEST_PRIVATE_KEY_2: BigInt(456),
    PUBLIC_KEY_1: [BigInt(1), BigInt(2)],
    PUBLIC_KEY_2: [BigInt(3), BigInt(4)],
  },
};

const props = {
  local: {
    ...commonConfig,
    zkp: {
      app: {
        host: 'http://zkp',
        port: '80',
      },
      rpc: {
        host: 'http://ganache',
        port: '8545',
      },
      volume: 'nightfall-kyc_zkp-code',
    },
  },
  test: {
    ...commonConfig,
    zkp: {
      app: {
        host: 'http://zkp_test',
        port: '80',
      },
      rpc: {
        host: 'http://ganache_test',
        port: '8545',
      },
      volume: 'nightfall_zkp_code_test',
    },
  },
};

/**
 * Set the environment
 * @param { string } environment - environment of app
 */
export function setEnv(environment) {
  if (props[environment]) {
    env = environment;
  }
}

/**
 * get the appropriate environment config
 */
export const getProps = () => props[env];
setEnv(process.env.NODE_ENV);
