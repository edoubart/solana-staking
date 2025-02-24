/*
 * Delegating stake to a validator is essentially saying, "I trust this
 * validator to accurately verify transactions on the Solana blockchain. So, I
 * will delegate my stake to this particular validator." The more stake a
 * validator has; the more often that validator will be chosen to verify
 * transactions on the Solana blockchain. If the validator write accurate
 * transactions without censorship, then the validator gets a reward, and you
 * get a reward because you staked your SOL with that validator. But if he
 * writes fraudulent transactions or censors certain types of transactions, both
 * you and the validator risk losing some of your SOL. Essentially, delegating
 * your stake rewards people who protect the integrity of the Solana blockchain.
 */

// NPM Packages
import {
  clusterApiUrl,
  sendAndConfirmTransaction,
  Authorized,
  Connection,
  Keypair,
  Lockup,
  LAMPORTS_PER_SOL,
  StakeProgram,
} from '@solana/web3.js';

// Constants
const SOLANA_AIRDROP_AMOUNT_IN_SOL = 1;
const SOLANA_NETWORK = 'devnet';
const SOLANA_PREFLIGHT_COMMITMENT = 'processed'; // 'finalized'
const SOLANA_STAKE_AMOUNT_IN_SOL = 0.5;
const SOLANA_STAKE_PROGRAM_ID = 'Stake11111111111111111111111111111111111111';
const SOLANA_SELECTED_VALIDATOR_ID = '';

// Solana
const network = clusterApiUrl(SOLANA_NETWORK);
const options = {
  preflightCommitment: SOLANA_PREFLIGHT_COMMITMENT,
};

async function main() {
  let connection = new Connection(network, options.preflightCommitment);

  let stakeProgramId = new PublicKey(SOLANA_STAKE_PROGRAM_ID);

  let votePublicKey = SOLANA_SELECTED_VALIDATOR_ID;

  let accounts = await connection
    .getParsedProgramAccounts(SOLANA_STAKE_PROGRAM_ID, {
      filters: [
        { dataSize: 200 },
        {
          memcmp: {
            offset: 124,
            bytes: SOLANA_SELECTED_VALIDATOR_ID,
          },
        },
      ],
    });

  console.log('accounts: ', accounts);
}

async function runMain() {
  try {
    await main();
  }
  catch(error) {
    console.log("Something went wrong getting delegators by validator: ", error);
  }
}

runMain();
