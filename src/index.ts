import {
  createConfig,
  defaultEndpointsFactory,
  Routing,
  z,
  createServer,
  ServeStatic,
  createHttpError,
} from 'express-zod-api';
import {Handler} from 'express-zod-api/dist/endpoint';
import path from 'path';
import {generateProofFor} from './whitelist/merkle-tree';
import {memoizedWhitelist} from './whitelist/reader';

const config = createConfig({
  server: {
    listen: process.env.PORT ? parseInt(process.env.PORT) : 8000,
  },
  cors: true,
  logger: {
    level: 'debug',
    color: true,
  },
});

const handleProofGeneration: Handler<
  {address: string},
  {proof: string[]; types: number[]},
  {}
> = async ({input: {address}, logger}) => {
  const whitelist = await memoizedWhitelist();
  const nftTypes = whitelist.find(
    entry => entry.address.toLowerCase() === address
  )?.nftTypes;
  if (!nftTypes) {
    throw createHttpError(403, 'Your address is not whitelisted');
  }
  logger.debug(`Generating proof for ${address} and types ${nftTypes}`);
  const proof = await generateProofFor(address, nftTypes);

  return {proof, types: nftTypes};
};

const proofGenerationEndpoint = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({
    address: z.string().transform(address => address.toLowerCase()),
  }),
  output: z.object({
    proof: z.array(z.string()),
    types: z.array(z.number()),
  }),
  handler: handleProofGeneration,
});

const greetingEndpoint = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({}),
  output: z.object({
    greeting: z.string(),
  }),
  handler: async () => {
    return {greeting: 'Ethereum - The Merge NFT by OnlyDust'};
  },
});

const routing: Routing = {
  proof: proofGenerationEndpoint,
  static: new ServeStatic(path.join(__dirname, 'public'), {
    dotfiles: 'deny',
    index: false,
    redirect: false,
  }),
  '': greetingEndpoint,
};

export const {app, logger, httpServer} = createServer(config, routing);
