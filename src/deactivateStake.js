/*
 * Delegating stake to a validator is essentialy saying "I trust this validator
 * to accurately verify transactions on the Solana blockchain. So, I will
 * delegate my stake to this particular validator." The more stake a validator
 * has, the more often that that validator will be chosen to verify transactions
 * on the Solana blockchain. If the validator write accurate transactions
 * without censorship, then the validator gets a reward, and you get a reward
 * because you staked your SOL with that validator. But if he writes fraudulent
 * transactions or censor certain types of transactions, both you and the
 * validator risk loosing some of your SOL. Essentialy, delagating your stake
 * rewards people who protect the integrity of the Solana blockchain.
 */

/*
 * Deactivating stake is basically the opposite of delegating stake. You stop
 * delegating your stake to a specific validator; your stake becomes undelegated.
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

// Solana
const network = clusterApiUrl(SOLANA_NETWORK);
const options = {
  preflightCommitment: SOLANA_PREFLIGHT_COMMITMENT,
};

async function main() {
  let connection = new Connection(network, options.preflightCommitment);

  // Generate wallet.
  let wallet = Keypair.generate();

  // Request airdrop to wallet.
  let airdropTx = await connection
    .requestAirdrop(
      wallet.publicKey,
      SOLANA_AIRDROP_AMOUNT_IN_SOL * LAMPORTS_PER_SOL
    );

  await connection.confirmTransaction(airdropTx);

  let walletBalance = await connection.getBalance(wallet.publicKey);

  console.log('walletBalance: ', walletBalance);

  // Create account for Stake Account.
  let stakeAccount = Keypair.generate();
  let minimumRent = await connection
    .getMinimumBalanceForRentExemption(StakeProgram.space);
  let amountUserWantsToStake = SOLANA_STAKE_AMOUNT_IN_SOL * LAMPORTS_PER_SOL;
  let amountToStake = minimumRent + amountUserWantsToStake;

  console.log('amountToStake: ', amountToStake);

  // Turn regular account into a Stake Account.
  let stakeAuthority = wallet.publicKey;
  let withdrawAuthority = wallet.publicKey;
  let authority = new Authorized(stakeAuthority, withdrawAuthority);
  let originOfFunds = wallet.publicKey;
  let expiration = 0;
  let epoch = 0;
  let custodian = wallet.publicKey;
  let lockup = new Lockup(expiration, epoch, custodian);
  let createStakeAccountTx = StakeProgram.createAccount({
    authorized: authority,
    fromPubkey: originOfFunds,
    lamports: amountToStake,
    lockup: lockup,
    stakePubkey: stakeAccount.publicKey,
  });

  let createStakeAccountTxId = await sendAndConfirmTransaction(
    connection,
    createStakeAccountTx,
    [ wallet, stakeAccount ]
  );

  console.log('createStakeAccountTxId: ', createStakeAccountTxId);

  let stakeAccountBalance = await connection.getBalance(stakeAccount);

  console.log('stakeAccountBalance: ', stakeAccountBalance);

  let stakeAccountStatus = await connection
    .getStakeActivationStatus(stakeAccount);

  console.log('stakeAccountStatus: ', stakeAccountStatus);

  // Get validator.
  let validators = await connection.getVoteAccounts();
  let selectedValidator = validators.current[0];
  let selectedValidatorPubkey = new PublicKey(selectedValidator.votePubkey);

  console.log('selectedValidatorPubkey: ', selectedValidatorPubkey);

  // Delegate stake to validator.
  let delegateStakeTx = StakeProgram.delegate({
    stakePubkey: stakeAccount.publicKey,
    authorizedPubkey: wallet.publicKey,
    votePubkey: selectedValidatorPubkey,
  });

  let delegateStakeTxId = await sendAndConfirmTransaction(
    connection,
    delegateStakeTx,
    [ wallet ]
  );

  console.log('delegateStakeTxId: ', delegateStakeTxId);

  stakeAccountStatus = await connection
    .getStakeActivationStatus(stakeAccount);

  console.log('stakeAccountStatus: ', stakeAccountStatus);

  // Deactivate stake.
  let deactivateStakeTx = StakeProgram.deactivate({
    stakePubkey: stakeAccount.publicKey,
    authorizedPubkey: wallet.publicKey,
  });

  let delegateStakeTxId = await sendAndConfirmTransaction(
    connection,
    deactivateStakeTx,
    [ wallet ]
  );

  console.log('deactivateStakeTxId: ', deactivateStakeTxId);
}

async function runMain() {
  try {
    await main();
  }
  catch(error) {
    console.log("Something went wrong delegating stake: ", error);
  }
}

runMain();
