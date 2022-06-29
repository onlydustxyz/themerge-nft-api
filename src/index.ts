import {
  createConfig,
  defaultEndpointsFactory,
  Routing,
  z,
  createServer,
  ServeStatic,
} from 'express-zod-api';
import {Handler} from 'express-zod-api/dist/endpoint';
import path from 'path';
import {generateProofFor} from './whitelist/merkle-tree';

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
  {address: string; types: number[]},
  {proof: string[]},
  {}
> = async ({input: {address, types}, logger}) => {
  logger.debug(`Generating proof for ${address} and types ${types}`);
  const proof = await generateProofFor(address, types);

  return {proof};
};

const proofGenerationEndpoint = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({
    address: z.string(),
    types: z.array(z.string()).transform(types => types.map(parseInt)),
  }),
  output: z.object({
    proof: z.array(z.string()),
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
