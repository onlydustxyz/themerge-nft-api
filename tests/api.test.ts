import chai, {expect} from 'chai';
import chaiHttp from 'chai-http';
import {app, httpServer} from '../src';

chai.use(chaiHttp);

describe('The API', () => {
  after(() => {
    httpServer.close();
  });

  it('responds with a greeting on the greeting path', async () => {
    const response = await chai.request(app).get('/');

    const {
      data: {greeting},
    } = await response.body;
    expect(greeting).to.equal('Ethereum - The Merge NFT by Magic Dust');
  });
});
