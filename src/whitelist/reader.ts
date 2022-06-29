// Taken from https://github.com/onlydustxyz/themerge-nft/blob/main/tasks/whitelist-reader.ts
import {readFile} from 'fs/promises';

export type WhiteList = {
  address: string;
  nftTypes: number[];
}[];

export const readWhitelist = async (path: string): Promise<WhiteList> => {
  const whitelist = JSON.parse(await readFile(path, 'utf-8'));
  return whitelist.map(({address, nft}: {address: string; nft: string}) => ({
    address,
    nftTypes: unpackNftTypes(parseInt(nft, 16)),
  }));
};

let whitelist: WhiteList;

export const memoizedWhitelist = async () => {
  if (whitelist) {
    return whitelist;
  }
  whitelist = await readWhitelist(process.env.WHITELIST_PATH as string);
  return whitelist;
};

export const unpackNftTypes = (packedValue: number): number[] => {
  const result = [];
  let currentBit = 0;
  while (2 ** currentBit <= packedValue) {
    if (packedValue & (2 ** currentBit)) {
      result.push(currentBit);
    }
    currentBit++;
  }
  return result;
};
