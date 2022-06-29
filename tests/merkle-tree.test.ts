import {expect} from 'chai';
import {ethers} from 'ethers';
import {
  generateWhitelistMerkleTree,
  getMerkleTree,
} from '../src/whitelist/merkle-tree';
import {WhiteList} from '../src/whitelist/reader';

describe('The merkle tree computation', () => {
  it('generates a merkle tree from a simple whitelist', async () => {
    const whitelist: WhiteList = [
      {
        address: '0x2c9758BDe2DBc7F6a259a5826a85761FcE322708',
        nftTypes: [0, 1, 2, 3, 4, 5, 6],
      },
    ];
    const merkleTree = generateWhitelistMerkleTree(whitelist);

    expect(merkleTree.getDepth()).to.equal(0);
    expect(merkleTree.getLeafCount()).to.equal(1);
  });

  it('generates a merkle tree from a complex whitlist', async () => {
    const fixtureWhitelistPath = 'tests/test-whitelist.json';
    const merkleTree = await getMerkleTree(fixtureWhitelistPath);

    expect(merkleTree.getDepth()).to.equal(2);
    expect(merkleTree.getLeafCount()).to.equal(3);

    const merkleRoot = ethers.utils.hexlify(merkleTree.getRoot());
    expect(merkleRoot).to.equal(
      '0x1231ef97f498d2021769f00cd842695f991d0144d798c8d7c3e11c860f4a68cf'
    );
  });
});
