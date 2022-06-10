import chai, {expect} from 'chai';
import chaiHttp from 'chai-http';
import {app, httpServer} from '../src';

chai.use(chaiHttp);

describe('The API', () => {
  after(() => {
    httpServer.close();
  });

  it('provides the merkle proof when the input address is in the whitelist', async () => {
    const {
      body: {
        status,
        data: {proof, types},
      },
    } = await chai
      .request(app)
      .get('/proof?address=0xfBFd04eA14735Ca7898B212b9CcA741134B5491a');

    expect(status).to.equal('success');
    expect(proof).to.deep.equal([
      '0x57d7d5137fadc7fd6db314eed0fa8c4756da912ba5fc556c1924f38159f01b33',
      '0x88733d6b1a55e63068c84389221a0cfc089e3d4ef3a7378915ee0c54cef8f819',
      '0x01e7b53ec828cb7063893b163228582e7d6b99320b882ea233961f9d5894a9d0',
      '0x8f47b1f17c94e87bf35cd83515c79a8abc3ff3f1a6f7d3438bb42b0f609f8931',
    ]);
    expect(types).to.deep.equal([1]);
  });
});
