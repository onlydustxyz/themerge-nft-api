import {
  createConfig,
  defaultEndpointsFactory,
  Routing,
  z,
  createServer,
  createHttpError,
  ServeStatic,
} from 'express-zod-api';
import {Handler} from 'express-zod-api/dist/endpoint';
import path from 'path';

import {
  initializeWhitelist,
  getWhitelistDataFromdAddress,
} from './utils/whitelist';
import {initializeMerkleTree, generateProof} from './utils/merkleTree';

import {logger as baseLogger} from './utils/logger';

const config = createConfig({
  server: {
    listen: process.env.PORT ? parseInt(process.env.PORT) : 8300,
  },
  cors: true,
  logger: baseLogger,
});

const handleProofGeneration: Handler<
  {address: string},
  {proof: string[]; types: number[]},
  {}
> = async ({input: {address}, logger}) => {
  logger.debug(`Getting whitelisted types for ${address}`);
  const types = getWhitelistDataFromdAddress(address)?.types || [];

  if (types.length === 0) {
    throw createHttpError(403, 'Your address is not whitelisted');
  }

  logger.debug(`Generating proof for ${address} and types ${types.join(', ')}`);
  const proof = generateProof(address, types);

  if (!proof) {
    throw createHttpError(403, 'Your address is not whitelisted');
  }

  return {proof, types};
};

const proofGenerationEndpoint = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({
    address: z.string(),
  }),
  output: z.object({
    proof: z.array(z.string()),
    types: z.array(z.number()),
  }),
  handler: handleProofGeneration,
});

const routing: Routing = {
  proof: proofGenerationEndpoint,
  static: new ServeStatic(path.join(__dirname, 'public'), {
    dotfiles: 'deny',
    index: false,
    redirect: false,
  }),
};

initializeWhitelist();
initializeMerkleTree();

export const {app, httpServer} = createServer(config, routing);
