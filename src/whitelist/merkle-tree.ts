// Taken from https://github.com/onlydustxyz/themerge-nft/blob/main/tasks/merkle-root.ts
import {ethers} from 'ethers';
import {keccak256} from 'ethers/lib/utils';
import MerkleTree from 'merkletreejs';
import {readWhitelist, WhiteList} from './reader';

export const generateWhitelistMerkleTree = (
  whitelist: WhiteList
): MerkleTree => {
  const leaves = whitelist.map(({address, nftTypes}) =>
    generateLeafData(address, nftTypes)
  );
  const whitelistMerkleTree = new MerkleTree(leaves, keccak256, {
    sortPairs: true,
  });
  return whitelistMerkleTree;
};

const generateLeafData = (address: string, types: number[]): string => {
  return keccak256(
    ethers.utils.hexConcat([address.toLowerCase(), ...types.map(toBytes32)])
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
  nftTypes: number[]
): Promise<string[]> => {
  const leafData = generateLeafData(address, nftTypes);
  const merkleTree = await memoizedMerkleTree();
  return merkleTree.getHexProof(leafData);
};
