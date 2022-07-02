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
        packedNftTypes: 127,
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
    expect(merkleTree.getLeafCount()).to.equal(4);

    const merkleRoot = ethers.utils.hexlify(merkleTree.getRoot());
    expect(merkleRoot).to.equal(
      '0x3481fd119b5a1fedb3c737d29da0ee4b01e1e05e26e6c848c5f345c6cce44c22'
    );
  });
});
