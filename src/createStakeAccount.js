/*
 * A Stake Account is a special type of account in Solana. You store your own
 * SOL in a Stake Account, and have the authority to delegate and withdraw
 * funds from your Stake Account.i But, the Stake Account is technically owned
 * by the Stake Program which runs the complex transactions required to
 * facilitate staking.
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

// Solana
const network = clusterApiUrl(SOLANA_NETWORK);
const options = {
  preflightCommitment: SOLANA_PREFLIGHT_COMMITMENT,
};

async function main() {
  const connection = new Connection(network, options.preflightCommitment);

  const wallet = Keypair.generate();

  let airdropSignature = await connection
    .requestAirdrop(
      wallet.publicKey,
      SOLANA_AIRDROP_AMOUNT_IN_SOL * LAMPORTS_PER_SOL
    );

  await connection.confirmTransaction(airdropSignature);

  let balance = await connection.getBalance(wallet.publicKey);

  console.log('balance: ', balance);

  // Create account for Stake Account.
  const stakeAccount = Keypair.generate();
  const minimumRent = await connection
    .getMinimumBalanceForRentExemption(StakeProgram.space);
  const amountUserWantsToStake = 0.5 * LAMPORTS_PER_SOL;
  const amountToStake = minimumRent + amountUserWantsToStake;

  console.log('amountToStake: ', amountToStake);

  // Turn regular account into a Stake Account.
  const stakeAuthority = wallet.publicKey;
  const withdrawAuthority = wallet.publicKey;
  const authority = new Authorized(stakeAuthority, withdrawAuthority);
  const origin = wallet.publicKey;
  const expiration = 0;
  const epoch = 0;
  const custodian = wallet.publicKey;
  const lockup = new Lockup(expiration, epoch, custodian);
  const createStakeAccountTransaction = StakeProgram.createAccount({
    authorized: authority,
    fromPubkey: origin,
    lamports: amountToStake,
    lockup: lockup,
    stakePubkey: stakeAccount.publicKey,
  });

  const txid = await sendAndConfirmTransaction(
    connection,
    createStakeAccountTransaction,
    [ wallet, stakeAccount ]
  );

  console.log("Stake Account created successfully. Txid: ", txid);

  let stakeAccountBalance = await connection.getBalance(stakeAccount);

  console.log("Stake Account balance: ", stakeAccountBalance);

  let stakeAccountStatus = await connection
    .getStakeActivationStatus(stakeAccount);

  console.log("Stake Account status: ", stakeStatus);
}

async function runMain() {
  try {
    await main();
  }
  catch(error) {
    console.log("Something went wrong creating Stake Account: ", error);
  }
}

runMain();
