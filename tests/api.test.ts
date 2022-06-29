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
    expect(greeting).to.be.a('string');
  });

  it('provides the merkle proof when the input address is in the whitelist', async () => {
    const {
      body: {
        status,
        data: {proof},
      },
    } = await chai
      .request(app)
      .get(
        '/proof?address=0xEb5576e75C88214828f2F43313f7DB79bD7b1365&types[]=0'
      );

    expect(status).to.equal('success');
    expect(proof).to.deep.equal([
      '0xfb94efb36a585ccc50951199300331806da0d6a216d07cc82dda4229a19d0a96',
      '0x27f2a2e4049be717e5e8c7a112ab69241ca7e69f231fb0e134ad9afd75ae8a6b',
      '0x0db74d7a103e91f094cb3054c78220af62cb9f5e6248ed0df7ecb82f2515b74b',
    ]);
  });
});
