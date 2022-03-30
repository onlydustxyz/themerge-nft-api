import {readFileSync} from 'fs';
import {ethers} from 'ethers';
import {MerkleTree} from 'merkletreejs';
import {} from 'keccak256';
import {keccak256} from 'ethers/lib/utils';
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

const WHITELIST_FILE = process.env.WHITELIST_FILE as string;

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
  const proof = generateProof(address, types);

  return {proof};
};

const proofGenerationEndpoint = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({
    address: z.string(),
    types: z.array(z.number()),
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
    return {greeting: 'Ethereum - The Merge NFT by Magic Dust'};
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

// Process whitelist
const whitelistMerkleData = processWhitelistMerkleData();
const whitelistMerkleTree = whitelistMerkleData.whitelistMerkleTree;

function generateProof(address: string, types: number[]): string[] {
  const leafData = keccak256(generateLeafData(address, types));
  return whitelistMerkleTree.getHexProof(leafData);
}

function processWhitelistMerkleData() {
  const whitelistLeafData = [];
  const whitelistedAccounts = getWhitelist();
  for (const i in whitelistedAccounts) {
    const whitelistedAccount = whitelistedAccounts[i];
    whitelistLeafData.push(
      generateLeafData(whitelistedAccount.address, whitelistedAccount.types)
    );
  }
  // Build leaf nodes from whitelisted addresses.
  const leafNodes = whitelistLeafData.map(addr => keccak256(addr));

  // Build the Merkle Tree.
  const whitelistMerkleTree = new MerkleTree(leafNodes, keccak256, {
    sortPairs: true,
  });
  // Get the root hash of the Merkle Tree.
  const whitelistMerkleRootHash = ethers.utils.hexlify(
    whitelistMerkleTree.getRoot()
  );
  logger.info(`Whitelist Merkle Tree Root: ${whitelistMerkleRootHash}`);
  return {
    whitelistMerkleTree,
    whitelistMerkleRootHash,
    leafNodes,
  };
}

function getWhitelist() {
  const whitelistData = readFileSync(WHITELIST_FILE).toString();
  return JSON.parse(whitelistData).whitelist;
}

function generateLeafData(address: string, types: number[]): string {
  return ethers.utils.hexConcat([address, ...types.map(toBytes32)]);
}

function toBytes32(value: number): string {
  return ethers.utils.hexZeroPad(ethers.utils.hexlify(value), 32);
}
