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

  it('responds with an error when the requesting address is not in the whitelist', async () => {
    const {
      body: {status, error},
      status: httpStatus,
    } = await chai.request(app).get('/proof?address=yolo');

    expect(status).to.equal('error');
    expect(httpStatus).to.equal(403);
    expect(error.message).to.equal('Your address is not whitelisted');
  });

  it('provides the NFT types when the input address is in the whitelist', async () => {
    const {
      body: {
        status,
        data: {types},
      },
    } = await chai
      .request(app)
      .get('/proof?address=0x1224E844C1374A8eABf7eC32EC02f41d335ad2Ca');

    expect(status).to.equal('success');
    expect(types).to.deep.equal([0, 2, 3]);
  });

  it('provides the merkle proof when the input address is in the whitelist', async () => {
    const {
      body: {
        status,
        data: {proof},
      },
    } = await chai
      .request(app)
      .get('/proof?address=0xEb5576E75C88214828f2F43313f7DB79bD7b1365');

    expect(status).to.equal('success');
    expect(proof).to.deep.equal([
      '0x9532d0f398f26187060e2952d67e71802d4904df3f38455addb17ff383cec9c0',
      '0x2349e2a08949a1c9b4f4a41c090a28ea394f3aa24d793209146455325a6ca2dc',
    ]);
  });
});
