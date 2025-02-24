/*
 * A validator is someone who validates transactions that occur on the Solana
 * blockchain. Validators are responsible for protecting the blockchain's
 * integrity from any fraudulent transactions.
 */

// NPM Packages
import { clusterApiUrl, Connection } from '@solana/web3.js';

// Constants
const SOLANA_NETWORK = 'devnet';
const SOLANA_PREFLIGHT_COMMITMENT = 'processed'; // 'finalized'

// Solana
let network = clusterApiUrl(SOLANA_NETWORK);
let options = {
  preflightCommitment: SOLANA_PREFLIGHT_COMMITMENT,
};

async function main() {
  let connection = new Connection(network, options.preflightCommitment);

  /*
   * Current vote accounts are validators that are currently active, whereas
   * delinquent vote accounts are validators that are currently inactive.
   */
  let { current, delinquent } = await connection.getVoteAccounts();

  console.log('currentCount: ', current.length);
  console.log('currentFirst: ', current[0]);
  console.log('delinquentCount: ', delinquent.length);
}

async function runMain() {
  try {
    await main();
  }
  catch(error) {
    console.log("Something went wrong getting validators: ", error);
  }
}

runMain();
