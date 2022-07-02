import {expect} from 'chai';
import {readWhitelist, unpackNftTypes} from '../src/whitelist/reader';

describe('The whitelist reader', () => {
  it('decomposes the packed NFT types from the whitelist', async () => {
    const packedNftTypes = parseInt('0xf', 16);
    const nftTypes = unpackNftTypes(packedNftTypes);

    expect(nftTypes).to.deep.equal([0, 1, 2, 3]);
  });

  it('reads the correct types from the whitelist', async () => {
    const whitelistPath = 'tests/test-whitelist.json';
    const whitelist = await readWhitelist(whitelistPath);

    const firstAddress = '0xDEC21982F07E8bff9b4c8FA8d18e550De0FACDDd';
    const firstPackedNftTypes = whitelist.find(
      entry => entry.address.toLowerCase() === firstAddress.toLocaleLowerCase()
    )?.packedNftTypes;
    expect(firstPackedNftTypes).to.deep.equal(
      2 ** 0 + 2 ** 1 + 2 ** 2 + 2 ** 3 + 2 ** 5
    );
  });
});
