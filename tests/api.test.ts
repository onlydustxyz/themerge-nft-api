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
      .get('/proof?address=0x1224E844C1374a8eABf7eC32EC02f41d335ad2Ca');

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
      .get('/proof?address=0xEb5576e75C88214828f2F43313f7DB79bD7b1365');

    expect(status).to.equal('success');
    expect(proof).to.deep.equal([
      '0x08a9598a94f417d6792ba7a15ab4307d4b7ccd5f0abdf9cbbc46f2e4fd517b3d',
      '0xd81cb71f80bcb35027632cccfe5d966429e0cb5f78f27991ff2e96b05d028a1a',
    ]);
  });
});
