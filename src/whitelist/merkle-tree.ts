// Taken from https://github.com/onlydustxyz/themerge-nft/blob/main/tasks/merkle-root.ts
import {ethers} from 'ethers';
import {keccak256} from 'ethers/lib/utils';
import MerkleTree from 'merkletreejs';
import {readWhitelist, WhiteList} from './reader';

export const generateWhitelistMerkleTree = (
  whitelist: WhiteList
): MerkleTree => {
  const leaves = whitelist.map(({address, packedNftTypes}) =>
    generateLeafData(address, packedNftTypes)
  );
  const whitelistMerkleTree = new MerkleTree(leaves, keccak256, {
    sortPairs: true,
  });
  return whitelistMerkleTree;
};

const generateLeafData = (address: string, packedNftTypes: number): string => {
  return keccak256(
    ethers.utils.hexConcat([address.toLowerCase(), toBytes32(packedNftTypes)])
  );
};

const toBytes32 = (value: number): string => {
  return ethers.utils.hexZeroPad(ethers.utils.hexlify(value), 32);
};

export const getMerkleTree = async (
  pathToWhitelist: string
): Promise<MerkleTree> => {
  const whitelist = await readWhitelist(pathToWhitelist);
  const merkleTree = generateWhitelistMerkleTree(whitelist);
  return merkleTree;
};

const WHITELIST_PATH = process.env.WHITELIST_PATH as string;

let merkleTree: MerkleTree;

const memoizedMerkleTree = async () => {
  if (merkleTree) {
    return merkleTree;
  }
  merkleTree = await getMerkleTree(WHITELIST_PATH);
  return merkleTree;
};

export const generateProofFor = async (
  address: string,
  packedNftTypes: number
): Promise<string[]> => {
  const leafData = generateLeafData(address, packedNftTypes);
  const merkleTree = await memoizedMerkleTree();
  return merkleTree.getHexProof(leafData);
};
