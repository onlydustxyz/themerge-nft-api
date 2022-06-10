import {readFileSync} from 'fs';
import {logger} from './logger';

const WHITELIST_FILE = process.env.WHITELIST_FILE as string;

interface WhitelistFileItem {
  address: string;
  types: number[];
}

interface WhitelistFileContent {
  whitelist: WhitelistFileItem[];
}

let whitelistDataByAddress: Record<
  WhitelistFileItem['address'],
  WhitelistFileItem
>;

export function getWhitelist() {
  const whitelistData = readFileSync(WHITELIST_FILE).toString();

  const whitelistContent = JSON.parse(whitelistData) as WhitelistFileContent;

  return whitelistContent.whitelist;
}

export function getWhitelistDataFromdAddress(address: string) {
  return whitelistDataByAddress[address] || null;
}

export function initializeWhitelist() {
  logger.info('Initialize whitelist');

  whitelistDataByAddress = buildWhitelistDataByAddress();
}

function buildWhitelistDataByAddress() {
  const whitelist = getWhitelist();

  return whitelist.reduce((aggregator, whitelistItem) => {
    return {
      ...aggregator,
      [whitelistItem.address]: whitelistItem,
    };
  }, {} as typeof whitelistDataByAddress);
}
