import {ethers} from 'ethers';
import {MerkleTree} from 'merkletreejs';
import {} from 'keccak256';
import {keccak256} from 'ethers/lib/utils';

import {getWhitelist} from './whitelist';
import {logger} from './logger';

let whitelistMerkleTree: MerkleTree;

export function initializeMerkleTree() {
  logger.info('Initialize merkle tree');

  const whitelistMerkleData = processWhitelistMerkleData();
  whitelistMerkleTree = whitelistMerkleData.whitelistMerkleTree;
}

export function getMerkleTree() {
  if (!whitelistMerkleTree) {
    throw new Error(
      'You need to initialize the merkle tree using "initializeMerkleTree"  before using this method.'
    );
  }

  return whitelistMerkleTree;
}

export function generateProof(address: string, types: number[]): string[] {
  const leafData = keccak256(generateLeafData(address, packTokenIds(types)));

  return whitelistMerkleTree.getHexProof(leafData);
}

function generateLeafData(address: string, packedTokenIds: number): string {
  return ethers.utils.hexConcat([address, toBytes32(packedTokenIds)]);
}

function processWhitelistMerkleData() {
  const whitelistLeafData = [];
  const whitelistedAccounts = getWhitelist();
  for (const i in whitelistedAccounts) {
    const whitelistedAccount = whitelistedAccounts[i];
    whitelistLeafData.push(
      generateLeafData(
        whitelistedAccount.address,
        packTokenIds(whitelistedAccount.types)
      )
    );
  }

  // Build leaf nodes from whitelisted addresses.
  const leafNodes = whitelistLeafData.map(addr => keccak256(addr));

  // Build the Merkle Tree.
  const whitelistMerkleTree = new MerkleTree(leafNodes, keccak256, {
    sortPairs: true,
  });
  // Get the root hash of the Merkle Tree.
  const whitelistMerkleRootHash = ethers.utils.hexlify(
    whitelistMerkleTree.getRoot()
  );

  logger.info(`Whitelist Merkle Tree Root: ${whitelistMerkleRootHash}`);

  return {
    whitelistMerkleTree,
    whitelistMerkleRootHash,
    leafNodes,
  };
}

function toBytes32(value: number): string {
  return ethers.utils.hexZeroPad(ethers.utils.hexlify(value), 32);
}

const packTokenIds = (tokenIds: number[]): number =>
  tokenIds.reduce((acc, tokenId) => acc + 2 ** tokenId, 0);
