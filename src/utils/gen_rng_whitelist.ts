import { ethers } from "ethers";
import {fstat, writeFileSync} from "fs";

const args = process.argv.slice(2)
if(args.length != 2){
    cliError("Invalid command. Requires 2 argument.");
}
const outputFile = args[0];
const numberOfAccounts = +args[1];
if(isNaN(numberOfAccounts)){
    cliError("Invalid command. Argument must be a numeric value.");
}
console.log(`Requested generation of ${numberOfAccounts} accounts`);


const whitelistedWallets: WhitelistedAccount[] = [];
for (let i = 0; i < numberOfAccounts; i++){
    const wallet = ethers.Wallet.createRandom();
    const address = wallet.address;
    whitelistedWallets.push({
        address,
        nftType: "1",
    });
}

const whitelist: Whitelist = {
    whitelist:  whitelistedWallets,
};

writeFileSync(outputFile, JSON.stringify(whitelist, null, "\t"));

function cliError(msg: string, errorCode: number = 1){
    console.error(msg);
    console.log(help());
    process.exit(errorCode);
}

function help() : string{
    return `yarn utils:gen-whitelist OUTPUT_FILE NUMBER_OF_ACCOUNTS`;
}

type Whitelist = {
    whitelist: WhitelistedAccount[];
}

type WhitelistedAccount = {
    address: string;
    nftType: string;
};
  