module dao::kai;

use std::vector;
use sui::balance::{Self, Balance};
use sui::clock::{Self, Clock};
use sui::coin::{Self, Coin, TreasuryCap};
use sui::sui::SUI;
use sui::table::{Self, Table};
use sui::tx_context::sender;

const EInsufficientKAI: u64 = 1;
const ENoKAIAvailable: u64 = 2;
const EWrongDAO: u64 = 3;
const EAlreadyVoted: u64 = 4;
const EVotingEnded: u64 = 5;
const EVotingNotEnded: u64 = 6;
const ENotListed: u64 = 7;
const EInsufficientPayment: u64 = 8;
const ECategoryInactive: u64 = 9;
const ECategoryNotFound: u64 = 10;
const EInvalidData: u64 = 11;

public struct KAI has drop {}

public struct DataDAO has key {
    id: UID,
    treasury: Balance<SUI>,
    kai_reserve: Balance<KAI>,
    reward_pool: Balance<KAI>,
    kai_price: u64,
    quorum: u64,
    threshold: u64,
    vote_time: u64,
}

public struct AccountCap has key, store {
    id: UID,
    dao_id: ID,
    kai_balance: Balance<KAI>,
}

public struct DataCategory has key, store {
    id: UID,
    name: vector<u8>,
    description: vector<u8>,
    reward_amount: u64,
    active: bool,
}

public struct DataSubmission has key, store {
    id: UID,
    walrus_blob_id: vector<u8>,
    metadata: vector<u8>,
    category_id: ID,
    submitter: address,
    approved: bool,
    price: u64,
    listed: bool,
}

public struct Proposal has key, store {
    id: UID,
    dao_id: ID,
    proposal_type: u8,
    data: vector<u8>,
    votes: u64,
    voters: vector<address>,
    ends: u64,
    executed: bool,
}

public struct Marketplace has key {
    id: UID,
    listings: Table<ID, u64>,
}

fun init(witness: KAI, ctx: &mut TxContext) {  // ✅ Remove 'entry'
    let (mut treasury_cap, metadata) = coin::create_currency(
        witness,
        6,
        b"KAI",
        b"KAI Token",
        b"Data DAO Governance Token",
        option::none(),
        ctx,
    );

    transfer::public_freeze_object(metadata);

    let total_supply = coin::mint(&mut treasury_cap, 1_000_000_000000, ctx);
    let mut total_balance = coin::into_balance(total_supply);

    let reserve_amount = 300_000_000000;
    let kai_reserve = balance::split(&mut total_balance, reserve_amount);
    let reward_pool = total_balance;

    let dao = DataDAO {
        id: object::new(ctx),
        treasury: balance::zero(),
        kai_reserve,
        reward_pool,
        kai_price: 1000,
        quorum: 30,
        threshold: 70,
        vote_time: 604800000,
    };

    transfer::share_object(dao);
    transfer::share_object(Marketplace {
        id: object::new(ctx),
        listings: table::new(ctx),
    });

    transfer::public_transfer(treasury_cap, @0x0);
}
// Purchase KAI with SUI
public fun purchase_kai(dao: &mut DataDAO, payment: Coin<SUI>, ctx: &mut TxContext): AccountCap {
    let sui_amount = coin::value(&payment);
    let kai_amount = sui_amount * dao.kai_price;

    assert!(balance::value(&dao.kai_reserve) >= kai_amount, ENoKAIAvailable);

    let kai_balance = balance::split(&mut dao.kai_reserve, kai_amount);
    balance::join(&mut dao.treasury, coin::into_balance(payment));

    let dao_id = object::uid_to_inner(&dao.id);
    AccountCap {
        id: object::new(ctx),
        dao_id,
        kai_balance,
    }
}

// Add KAI to existing account
public fun add_kai(
    dao: &mut DataDAO,
    account: &mut AccountCap,
    payment: Coin<SUI>,
    _ctx: &mut TxContext,
) {
    assert!(&account.dao_id == object::uid_as_inner(&dao.id), EWrongDAO);

    let sui_amount = coin::value(&payment);
    let kai_amount = sui_amount * dao.kai_price;

    assert!(balance::value(&dao.kai_reserve) >= kai_amount, ENoKAIAvailable);

    let kai_balance = balance::split(&mut dao.kai_reserve, kai_amount);
    balance::join(&mut account.kai_balance, kai_balance);
    balance::join(&mut dao.treasury, coin::into_balance(payment));
}

// Burn KAI to redeem SUI
public fun burn_kai(
    dao: &mut DataDAO,
    account: &mut AccountCap,
    amount: u64,
    ctx: &mut TxContext,
): Coin<SUI> {
    assert!(&account.dao_id == object::uid_as_inner(&dao.id), EWrongDAO);
    assert!(balance::value(&account.kai_balance) >= amount, EInsufficientKAI);

    let kai_to_burn = balance::split(&mut account.kai_balance, amount);
    balance::join(&mut dao.reward_pool, kai_to_burn); // Return to pool

    let sui_amount = amount / dao.kai_price;
    coin::take(&mut dao.treasury, sui_amount, ctx)
}

// Create Category Proposal (Type 1)
public fun propose_category(
    dao: &mut DataDAO,
    account: &mut AccountCap,
    name: vector<u8>,
    description: vector<u8>,
    reward_amount: u64,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    assert!(&account.dao_id == object::uid_as_inner(&dao.id), EWrongDAO);

    let dao_id = object::uid_to_inner(&dao.id);
    let ends = clock::timestamp_ms(clock) + dao.vote_time;

    // Encode proposal data: type|name|desc|reward
    let mut data = vector::empty<u8>();
    vector::append(&mut data, name);
    vector::push_back(&mut data, 0); // separator
    vector::append(&mut data, description);
    vector::push_back(&mut data, 0);
    vector::append(&mut data, encode_u64(reward_amount));

    let proposal = Proposal {
        id: object::new(ctx),
        dao_id,
        proposal_type: 1,
        data,
        votes: 0,
        voters: vector::empty(),
        ends,
        executed: false,
    };

    transfer::share_object(proposal);
}

// Submit Data (Auto-creates Proposal Type 2)
// This function creates a data submission and automatically creates a proposal for DAO approval
public fun submit_data(
    dao: &mut DataDAO,
    category: &DataCategory,
    walrus_blob_id: vector<u8>,
    metadata: vector<u8>,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    // Validate category is active
    assert!(category.active, ECategoryInactive);
    
    // Validate inputs are not empty
    assert!(vector::length(&walrus_blob_id) > 0, EInvalidData);
    assert!(vector::length(&metadata) > 0, EInvalidData);

    let dao_id = object::uid_to_inner(&dao.id);
    let category_id = object::id(category);

    // Create submission with all relevant data
    let submission = DataSubmission {
        id: object::new(ctx),
        walrus_blob_id,
        metadata,
        category_id,
        submitter: sender(ctx),
        approved: false,
        price: 0,
        listed: false,
    };

    let submission_id = object::id(&submission);
    
    // Make submission a shared object so it can be queried and referenced
    transfer::share_object(submission);

    // Auto-create proposal for data approval
    // Encode proposal data: submission_id|walrus_blob_id|metadata|category_id
    let mut proposal_data = vector::empty<u8>();
    
    // Add submission ID (32 bytes)
    vector::append(&mut proposal_data, object::id_to_bytes(&submission_id));
    
    // Add separator and walrus blob ID
    vector::push_back(&mut proposal_data, 0); // separator
    vector::append(&mut proposal_data, walrus_blob_id);
    
    // Add separator and metadata
    vector::push_back(&mut proposal_data, 0); // separator
    vector::append(&mut proposal_data, metadata);
    
    // Add separator and category ID
    vector::push_back(&mut proposal_data, 0); // separator
    vector::append(&mut proposal_data, object::id_to_bytes(&category_id));

    let ends = clock::timestamp_ms(clock) + dao.vote_time;
    let proposal = Proposal {
        id: object::new(ctx),
        dao_id,
        proposal_type: 2, // Data Approval Proposal
        data: proposal_data,
        votes: 0,
        voters: vector::empty(),
        ends,
        executed: false,
    };

    transfer::share_object(proposal);
}

// Vote on Proposal
public fun vote(
    dao: &mut DataDAO,
    account: &AccountCap,
    proposal: &mut Proposal,
    clock: &Clock,
    ctx: &TxContext,
) {
    assert!(&account.dao_id == object::uid_as_inner(&dao.id), EWrongDAO);
    assert!(&proposal.dao_id == object::uid_as_inner(&dao.id), EWrongDAO);
    assert!(proposal.ends > clock::timestamp_ms(clock), EVotingEnded);
    assert!(!vector::contains(&proposal.voters, &sender(ctx)), EAlreadyVoted);

    let vote_power = balance::value(&account.kai_balance);
    proposal.votes = proposal.votes + vote_power;
    vector::push_back(&mut proposal.voters, sender(ctx));
}

// Execute Category Proposal
public fun execute_category_proposal(
    dao: &mut DataDAO,
    proposal: &mut Proposal,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    assert!(&proposal.dao_id == object::uid_as_inner(&dao.id), EWrongDAO);
    assert!(proposal.ends < clock::timestamp_ms(clock), EVotingNotEnded);
    assert!(!proposal.executed, 0);
    assert!(proposal.proposal_type == 1, 0);

    let total_supply = 1_000_000_000000;
    let locked = balance::value(&dao.kai_reserve) + balance::value(&dao.reward_pool);
    let total_kai = total_supply - locked;

    let vote_percentage = if (total_kai > 0) {
        (proposal.votes * 100) / total_kai
    } else {
        0
    };

    proposal.executed = true;

    if (vote_percentage >= dao.quorum) {
        // Parse data and create category
        let (name, desc, reward) = decode_category_data(&proposal.data);

        let category = DataCategory {
            id: object::new(ctx),
            name,
            description: desc,
            reward_amount: reward,
            active: true,
        };

        transfer::share_object(category);
    };
}

// Execute Data Approval Proposal
// This function executes a data approval proposal after voting has ended
public fun execute_data_proposal(
    dao: &mut DataDAO,
    proposal: &mut Proposal,
    submission: &mut DataSubmission,
    category: &DataCategory,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    assert!(&proposal.dao_id == object::uid_as_inner(&dao.id), EWrongDAO);
    assert!(proposal.ends < clock::timestamp_ms(clock), EVotingNotEnded);
    assert!(!proposal.executed, 0);
    assert!(proposal.proposal_type == 2, 0);
    assert!(&submission.category_id == object::id(category), ECategoryNotFound);

    // Calculate total circulating KAI for quorum calculation
    let total_supply = 1_000_000_000000;
    let locked = balance::value(&dao.kai_reserve) + balance::value(&dao.reward_pool);
    let total_kai = total_supply - locked;

    let vote_percentage = if (total_kai > 0) {
        (proposal.votes * 100) / total_kai
    } else {
        0
    };

    // Mark proposal as executed
    proposal.executed = true;

    // If quorum reached and approval threshold met, approve submission
    if (vote_percentage >= dao.quorum && vote_percentage >= dao.threshold) {
        submission.approved = true;

        // Reward submitter from reward pool
        assert!(balance::value(&dao.reward_pool) >= category.reward_amount, EInsufficientKAI);
        let reward = balance::split(&mut dao.reward_pool, category.reward_amount);
        
        // Create or get existing account for submitter and transfer reward
        let reward_account = AccountCap {
            id: object::new(ctx),
            dao_id: object::uid_to_inner(&dao.id),
            kai_balance: reward,
        };

        transfer::transfer(reward_account, submission.submitter);
    };
}

// Execute Price Proposal
public fun execute_price_proposal(
    dao: &mut DataDAO,
    proposal: &mut Proposal,
    submission: &mut DataSubmission,
    marketplace: &mut Marketplace,
    clock: &Clock,
    _ctx: &mut TxContext,
) {
    assert!(&proposal.dao_id == object::uid_as_inner(&dao.id), EWrongDAO);
    assert!(proposal.ends < clock::timestamp_ms(clock), EVotingNotEnded);
    assert!(!proposal.executed, 0);
    assert!(proposal.proposal_type == 3, 0);

    let total_supply = 1_000_000_000000;
    let locked = balance::value(&dao.kai_reserve) + balance::value(&dao.reward_pool);
    let total_kai = total_supply - locked;

    let vote_percentage = if (total_kai > 0) {
        (proposal.votes * 100) / total_kai
    } else {
        0
    };

    proposal.executed = true;

    if (vote_percentage >= dao.quorum) {
        let price = decode_price_data(&proposal.data);
        submission.price = price;
        submission.listed = true;

        let submission_id = object::id(submission);
        table::add(&mut marketplace.listings, submission_id, price);
    };
}

public fun propose_price(
    dao: &mut DataDAO,
    account: &AccountCap,
    submission_id: ID,
    price: u64,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    assert!(&account.dao_id == object::uid_as_inner(&dao.id), EWrongDAO);

    let dao_id = object::uid_to_inner(&dao.id);
    let ends = clock::timestamp_ms(clock) + dao.vote_time;

    let mut data = object::id_to_bytes(&submission_id);
    vector::append(&mut data, encode_u64(price));

    let proposal = Proposal {
        id: object::new(ctx),
        dao_id,
        proposal_type: 3,
        data,
        votes: 0,
        voters: vector::empty(),
        ends,
        executed: false,
    };

    transfer::share_object(proposal);
}

// Purchase Data
public fun purchase_data(
    dao: &mut DataDAO,
    submission: &DataSubmission,
    payment: Coin<SUI>,
    _ctx: &mut TxContext,
) {
    assert!(submission.listed, ENotListed);
    assert!(coin::value(&payment) >= submission.price, EInsufficientPayment);

    balance::join(&mut dao.treasury, coin::into_balance(payment));
}

// Helper functions
fun encode_u64(n: u64): vector<u8> {
    let mut bytes = vector::empty<u8>();
    let mut num = n;
    let mut i = 0;
    while (i < 8) {
        vector::push_back(&mut bytes, ((num % 256) as u8));
        num = num / 256;
        i = i + 1;
    };
    bytes
}

fun decode_category_data(data: &vector<u8>): (vector<u8>, vector<u8>, u64) {
    let mut name = vector::empty<u8>();
    let mut desc = vector::empty<u8>();
    let mut i = 0;

    // Parse name
    while (i < vector::length(data) && *vector::borrow(data, i) != 0) {
        vector::push_back(&mut name, *vector::borrow(data, i));
        i = i + 1;
    };
    i = i + 1;

    // Parse desc
    while (i < vector::length(data) && *vector::borrow(data, i) != 0) {
        vector::push_back(&mut desc, *vector::borrow(data, i));
        i = i + 1;
    };
    i = i + 1;

    // Parse reward (last 8 bytes in little-endian)
    let mut reward = 0u64;
    let mut shift = 0u8;
    while (i < vector::length(data) && shift < 64) {
        let byte_val = (*vector::borrow(data, i) as u64);
        reward = reward + (byte_val << shift);
        shift = shift + 8;
        i = i + 1;
    };

    (name, desc, reward)
}

fun decode_price_data(data: &vector<u8>): u64 {
    let len = vector::length(data);
    let mut price = 0u64;
    let mut shift = 0u8;
    let start = if (len >= 8) { len - 8 } else { 0 };
    let mut i = start;

    while (i < len && shift < 64) {
        let byte_val = (*vector::borrow(data, i) as u64);
        price = price + (byte_val << shift);
        shift = shift + 8;
        i = i + 1;
    };

    price
}

// Getters
public fun get_kai_balance(account: &AccountCap): u64 { balance::value(&account.kai_balance) }

public fun get_treasury(dao: &DataDAO): u64 { balance::value(&dao.treasury) }

public fun get_reward_pool(dao: &DataDAO): u64 { balance::value(&dao.reward_pool) }

public fun get_kai_reserve(dao: &DataDAO): u64 { balance::value(&dao.kai_reserve) }

public fun get_dao_id(dao: &DataDAO): ID { object::uid_to_inner(&dao.id) }

// Submission getters
public fun get_submission_submitter(submission: &DataSubmission): address { submission.submitter }

public fun get_submission_category(submission: &DataSubmission): ID { submission.category_id }

public fun get_submission_walrus_id(submission: &DataSubmission): vector<u8> { submission.walrus_blob_id }

public fun get_submission_metadata(submission: &DataSubmission): vector<u8> { submission.metadata }

public fun is_submission_approved(submission: &DataSubmission): bool { submission.approved }

public fun is_submission_listed(submission: &DataSubmission): bool { submission.listed }

public fun get_submission_price(submission: &DataSubmission): u64 { submission.price }

// Proposal getters
public fun get_proposal_type(proposal: &Proposal): u8 { proposal.proposal_type }

public fun get_proposal_votes(proposal: &Proposal): u64 { proposal.votes }

public fun get_proposal_ends(proposal: &Proposal): u64 { proposal.ends }

public fun is_proposal_executed(proposal: &Proposal): bool { proposal.executed }

public fun get_proposal_voters(proposal: &Proposal): vector<address> { proposal.voters }

public fun get_proposal_data(proposal: &Proposal): vector<u8> { proposal.data }

// Helper to decode submission data from proposal
// Returns: (submission_id_bytes, walrus_id, metadata, category_id_bytes)
// Note: IDs are returned as bytes; convert to ID type in frontend/off-chain
public fun decode_submission_proposal_data(data: &vector<u8>): (vector<u8>, vector<u8>, vector<u8>, vector<u8>) {
    let mut i = 0;
    
    // Extract submission ID (first 32 bytes)
    let mut submission_id_bytes = vector::empty<u8>();
    while (i < 32 && i < vector::length(data)) {
        vector::push_back(&mut submission_id_bytes, *vector::borrow(data, i));
        i = i + 1;
    };
    
    // Skip separator
    i = i + 1;
    
    // Extract walrus blob ID
    let mut walrus_id = vector::empty<u8>();
    while (i < vector::length(data) && *vector::borrow(data, i) != 0) {
        vector::push_back(&mut walrus_id, *vector::borrow(data, i));
        i = i + 1;
    };
    i = i + 1; // Skip separator
    
    // Extract metadata
    let mut metadata = vector::empty<u8>();
    while (i < vector::length(data) && *vector::borrow(data, i) != 0) {
        vector::push_back(&mut metadata, *vector::borrow(data, i));
        i = i + 1;
    };
    i = i + 1; // Skip separator
    
    // Extract category ID (remaining 32 bytes)
    let mut category_id_bytes = vector::empty<u8>();
    while (i < vector::length(data) && vector::length(&category_id_bytes) < 32) {
        vector::push_back(&mut category_id_bytes, *vector::borrow(data, i));
        i = i + 1;
    };
    
    (submission_id_bytes, walrus_id, metadata, category_id_bytes)
}

// TESTS
#[test_only]
use sui::test_scenario as ts;
#[test_only]
use sui::test_utils;

#[test_only]
const ADMIN: address = @0xAD;
#[test_only]
const USER1: address = @0xA;
#[test_only]
const USER2: address = @0xB;
#[test_only]
const USER3: address = @0xC;
#[test_only]
public fun test_init(ctx: &mut TxContext) {
    // Create mock treasury cap and mint supply
    let mut total_supply = balance::create_supply<KAI>(KAI {});
    let mut kai_balance = balance::increase_supply(&mut total_supply, 1_000_000_000000);

    // Split: 30% for sale, 70% for rewards
    let reserve_amount = 300_000_000000;
    let kai_reserve = balance::split(&mut kai_balance, reserve_amount);
    let reward_pool = kai_balance;

    let dao = DataDAO {
        id: object::new(ctx),
        treasury: balance::zero(),
        kai_reserve,
        reward_pool,
        kai_price: 1000,
        quorum: 30,
        threshold: 70,
        vote_time: 604800000,
    };

    transfer::share_object(dao);
    transfer::share_object(Marketplace {
        id: object::new(ctx),
        listings: table::new(ctx),
    });

    // Destroy supply (not needed in tests)
    sui::test_utils::destroy(total_supply);
}
#[test]
fun test_01_init_and_purchase_kai() {
    let mut ts = ts::begin(ADMIN);
    let clock = clock::create_for_testing(ts::ctx(&mut ts));

    // Init DAO
    {
        test_init(ts::ctx(&mut ts));
    };

    // User1 purchases KAI
    ts::next_tx(&mut ts, USER1);
    {
        let mut dao = ts::take_shared<DataDAO>(&ts);
        let payment = coin::mint_for_testing<SUI>(1000, ts::ctx(&mut ts));

        let account = purchase_kai(&mut dao, payment, ts::ctx(&mut ts));
        assert!(get_kai_balance(&account) == 1_000_000, 1); // 1000 KAI

        transfer::public_transfer(account, USER1);
        ts::return_shared(dao);
    };

    clock::destroy_for_testing(clock);
    ts::end(ts);
}

#[test]
fun test_02_add_kai_to_existing_account() {
    let mut ts = ts::begin(ADMIN);
    let clock = clock::create_for_testing(ts::ctx(&mut ts));

    test_init(ts::ctx(&mut ts));

    // User1 purchases initial KAI
    ts::next_tx(&mut ts, USER1);
    {
        let mut dao = ts::take_shared<DataDAO>(&ts);
        let payment = coin::mint_for_testing<SUI>(500, ts::ctx(&mut ts));
        let account = purchase_kai(&mut dao, payment, ts::ctx(&mut ts));
        transfer::public_transfer(account, USER1);
        ts::return_shared(dao);
    };

    // User1 adds more KAI
    ts::next_tx(&mut ts, USER1);
    {
        let mut dao = ts::take_shared<DataDAO>(&ts);
        let mut account = ts::take_from_sender<AccountCap>(&ts);
        let payment = coin::mint_for_testing<SUI>(500, ts::ctx(&mut ts));

        add_kai(&mut dao, &mut account, payment, ts::ctx(&mut ts));
        assert!(get_kai_balance(&account) == 1_000_000, 2); // 1000 KAI total

        ts::return_to_sender(&ts, account);
        ts::return_shared(dao);
    };

    clock::destroy_for_testing(clock);
    ts::end(ts);
}

#[test]
fun test_03_burn_kai_for_sui() {
    let mut ts = ts::begin(ADMIN);
    let clock = clock::create_for_testing(ts::ctx(&mut ts));

    test_init(ts::ctx(&mut ts));

    // User1 purchases KAI
    ts::next_tx(&mut ts, USER1);
    {
        let mut dao = ts::take_shared<DataDAO>(&ts);
        let payment = coin::mint_for_testing<SUI>(1000, ts::ctx(&mut ts));
        let account = purchase_kai(&mut dao, payment, ts::ctx(&mut ts));
        transfer::public_transfer(account, USER1);
        ts::return_shared(dao);
    };

    // User1 burns 500 KAI
    ts::next_tx(&mut ts, USER1);
    {
        let mut dao = ts::take_shared<DataDAO>(&ts);
        let mut account = ts::take_from_sender<AccountCap>(&ts);

        let sui_coin = burn_kai(&mut dao, &mut account, 500_000, ts::ctx(&mut ts));
        assert!(coin::value(&sui_coin) == 500, 3);
        assert!(get_kai_balance(&account) == 500_000, 4); // 500 KAI left

        test_utils::destroy(sui_coin);
        ts::return_to_sender(&ts, account);
        ts::return_shared(dao);
    };

    clock::destroy_for_testing(clock);
    ts::end(ts);
}

#[test]
fun test_04_propose_and_execute_category() {
    let mut ts = ts::begin(ADMIN);
    let mut clock = clock::create_for_testing(ts::ctx(&mut ts));

    test_init(ts::ctx(&mut ts));

    // User1 and User2 purchase KAI
    ts::next_tx(&mut ts, USER1);
    {
        let mut dao = ts::take_shared<DataDAO>(&ts);
        let payment = coin::mint_for_testing<SUI>(100_000, ts::ctx(&mut ts));
        let account = purchase_kai(&mut dao, payment, ts::ctx(&mut ts));
        transfer::public_transfer(account, USER1);
        ts::return_shared(dao);
    };

    ts::next_tx(&mut ts, USER2);
    {
        let mut dao = ts::take_shared<DataDAO>(&ts);
        let payment = coin::mint_for_testing<SUI>(50_000, ts::ctx(&mut ts));
        let account = purchase_kai(&mut dao, payment, ts::ctx(&mut ts));
        transfer::public_transfer(account, USER2);
        ts::return_shared(dao);
    };

    // User1 proposes category
    ts::next_tx(&mut ts, USER1);
    {
        let mut dao = ts::take_shared<DataDAO>(&ts);
        let mut account = ts::take_from_sender<AccountCap>(&ts);

        propose_category(
            &mut dao,
            &mut account,
            b"Medical Data",
            b"Health records",
            10_000_000,
            &clock,
            ts::ctx(&mut ts),
        );

        ts::return_to_sender(&ts, account);
        ts::return_shared(dao);
    };

    // User1 and User2 vote
    ts::next_tx(&mut ts, USER1);
    {
        let mut dao = ts::take_shared<DataDAO>(&ts);
        let account = ts::take_from_sender<AccountCap>(&ts);
        let mut proposal = ts::take_shared<Proposal>(&ts);

        vote(&mut dao, &account, &mut proposal, &clock, ts::ctx(&mut ts));

        ts::return_to_sender(&ts, account);
        ts::return_shared(dao);
        ts::return_shared(proposal);
    };

    ts::next_tx(&mut ts, USER2);
    {
        let mut dao = ts::take_shared<DataDAO>(&ts);
        let account = ts::take_from_sender<AccountCap>(&ts);
        let mut proposal = ts::take_shared<Proposal>(&ts);

        vote(&mut dao, &account, &mut proposal, &clock, ts::ctx(&mut ts));

        ts::return_to_sender(&ts, account);
        ts::return_shared(dao);
        ts::return_shared(proposal);
    };

    // Advance time and execute
    clock::increment_for_testing(&mut clock, 604800001);

    ts::next_tx(&mut ts, USER1);
    {
        let mut dao = ts::take_shared<DataDAO>(&ts);
        let mut proposal = ts::take_shared<Proposal>(&ts);

        execute_category_proposal(&mut dao, &mut proposal, &clock, ts::ctx(&mut ts));
        assert!(proposal.executed == true, 5);

        ts::return_shared(dao);
        ts::return_shared(proposal);
    };

    clock::destroy_for_testing(clock);
    ts::end(ts);
}

#[test]
fun test_05_submit_data_and_approve() {
    let mut ts = ts::begin(ADMIN);
    let mut clock = clock::create_for_testing(ts::ctx(&mut ts));

    test_init(ts::ctx(&mut ts));

    // Setup: User1 purchases 35% of circulating supply to reach quorum
    ts::next_tx(&mut ts, USER1);
    {
        let mut dao = ts::take_shared<DataDAO>(&ts);
        let payment = coin::mint_for_testing<SUI>(300_000, ts::ctx(&mut ts));
        let account = purchase_kai(&mut dao, payment, ts::ctx(&mut ts));
        transfer::public_transfer(account, USER1);
        ts::return_shared(dao);
    };

    let category_id;
    ts::next_tx(&mut ts, USER1);
    {
        let category = DataCategory {
            id: object::new(ts::ctx(&mut ts)),
            name: b"Test Category",
            description: b"Test",
            reward_amount: 5_000_000,
            active: true,
        };
        category_id = object::id(&category);
        transfer::share_object(category);
    };

    // User2 submits data (no KAI needed)
    ts::next_tx(&mut ts, USER2);
    {
        let mut dao = ts::take_shared<DataDAO>(&ts);
        let category = ts::take_shared<DataCategory>(&ts);

        submit_data(
            &mut dao,
            &category,
            b"walrus_blob_123",
            b"metadata_json",
            &clock,
            ts::ctx(&mut ts),
        );

        ts::return_shared(dao);
        ts::return_shared(category);
    };

    // User1 votes to approve
    ts::next_tx(&mut ts, USER1);
    {
        let mut dao = ts::take_shared<DataDAO>(&ts);
        let account = ts::take_from_sender<AccountCap>(&ts);
        let mut proposal = ts::take_shared<Proposal>(&ts);

        vote(&mut dao, &account, &mut proposal, &clock, ts::ctx(&mut ts));

        ts::return_to_sender(&ts, account);
        ts::return_shared(dao);
        ts::return_shared(proposal);
    };

    // Execute after time passes
    clock::increment_for_testing(&mut clock, 604800001);

    ts::next_tx(&mut ts, USER1);
    {
        let mut dao = ts::take_shared<DataDAO>(&ts);
        let mut proposal = ts::take_shared<Proposal>(&ts);
        let mut submission = ts::take_shared<DataSubmission>(&ts);
        let category = ts::take_shared<DataCategory>(&ts);

        execute_data_proposal(
            &mut dao,
            &mut proposal,
            &mut submission,
            &category,
            &clock,
            ts::ctx(&mut ts),
        );

        assert!(submission.approved == true, 6);

        ts::return_shared(dao);
        ts::return_shared(proposal);
        ts::return_shared(submission);
        ts::return_shared(category);
    };

    clock::destroy_for_testing(clock);
    ts::end(ts);
}
#[test]
fun test_06_set_price_and_purchase_data() {
    let mut ts = ts::begin(ADMIN);
    let mut clock = clock::create_for_testing(ts::ctx(&mut ts));

    test_init(ts::ctx(&mut ts));

    // Setup - User1 gets 30% of supply
    ts::next_tx(&mut ts, USER1);
    {
        let mut dao = ts::take_shared<DataDAO>(&ts);
        let payment = coin::mint_for_testing<SUI>(300_000, ts::ctx(&mut ts));
        let account = purchase_kai(&mut dao, payment, ts::ctx(&mut ts));
        transfer::public_transfer(account, USER1);
        ts::return_shared(dao);
    };

    let submission_id;
    ts::next_tx(&mut ts, USER2);
    {
        let submission = DataSubmission {
            id: object::new(ts::ctx(&mut ts)),
            walrus_blob_id: b"blob123",
            metadata: b"meta",
            category_id: object::id_from_address(@0x1),
            submitter: USER2,
            approved: true,
            price: 0,
            listed: false,
        };
        submission_id = object::id(&submission);
        transfer::share_object(submission);
    };

    // Propose price
    ts::next_tx(&mut ts, USER1);
    {
        let mut dao = ts::take_shared<DataDAO>(&ts);
        let account = ts::take_from_sender<AccountCap>(&ts);

        propose_price(&mut dao, &account, submission_id, 1000, &clock, ts::ctx(&mut ts));

        ts::return_to_sender(&ts, account);
        ts::return_shared(dao);
    };

    // Vote and execute
    ts::next_tx(&mut ts, USER1);
    {
        let mut dao = ts::take_shared<DataDAO>(&ts);
        let account = ts::take_from_sender<AccountCap>(&ts);
        let mut proposal = ts::take_shared<Proposal>(&ts);

        vote(&mut dao, &account, &mut proposal, &clock, ts::ctx(&mut ts));

        ts::return_to_sender(&ts, account);
        ts::return_shared(dao);
        ts::return_shared(proposal);
    };

    clock::increment_for_testing(&mut clock, 604800001);

    ts::next_tx(&mut ts, USER1);
    {
        let mut dao = ts::take_shared<DataDAO>(&ts);
        let mut proposal = ts::take_shared<Proposal>(&ts);
        let mut submission = ts::take_shared<DataSubmission>(&ts);
        let mut marketplace = ts::take_shared<Marketplace>(&ts);

        execute_price_proposal(
            &mut dao,
            &mut proposal,
            &mut submission,
            &mut marketplace,
            &clock,
            ts::ctx(&mut ts),
        );

        assert!(submission.listed == true, 7);
        assert!(submission.price == 1000, 8);

        ts::return_shared(dao);
        ts::return_shared(proposal);
        ts::return_shared(submission);
        ts::return_shared(marketplace);
    };

    // Purchase data
    ts::next_tx(&mut ts, USER3);
    {
        let mut dao = ts::take_shared<DataDAO>(&ts);
        let submission = ts::take_shared<DataSubmission>(&ts);
        let payment = coin::mint_for_testing<SUI>(1000, ts::ctx(&mut ts));

        purchase_data(&mut dao, &submission, payment, ts::ctx(&mut ts));

        ts::return_shared(dao);
        ts::return_shared(submission);
    };

    clock::destroy_for_testing(clock);
    ts::end(ts);
}
#[test]
#[expected_failure(abort_code = EAlreadyVoted)]
fun test_07_cannot_vote_twice() {
    let mut ts = ts::begin(ADMIN);
    let mut clock = clock::create_for_testing(ts::ctx(&mut ts));

    test_init(ts::ctx(&mut ts));

    ts::next_tx(&mut ts, USER1);
    {
        let mut dao = ts::take_shared<DataDAO>(&ts);
        let payment = coin::mint_for_testing<SUI>(10_000, ts::ctx(&mut ts));
        let account = purchase_kai(&mut dao, payment, ts::ctx(&mut ts));
        transfer::public_transfer(account, USER1);
        ts::return_shared(dao);
    };

    ts::next_tx(&mut ts, USER1);
    {
        let mut dao = ts::take_shared<DataDAO>(&ts);
        let mut account = ts::take_from_sender<AccountCap>(&ts);
        propose_category(&mut dao, &mut account, b"Test", b"Test", 1000, &clock, ts::ctx(&mut ts));
        ts::return_to_sender(&ts, account);
        ts::return_shared(dao);
    };

    ts::next_tx(&mut ts, USER1);
    {
        let mut dao = ts::take_shared<DataDAO>(&ts);
        let account = ts::take_from_sender<AccountCap>(&ts);
        let mut proposal = ts::take_shared<Proposal>(&ts);

        vote(&mut dao, &account, &mut proposal, &clock, ts::ctx(&mut ts));
        vote(&mut dao, &account, &mut proposal, &clock, ts::ctx(&mut ts)); // Should fail

        ts::return_to_sender(&ts, account);
        ts::return_shared(dao);
        ts::return_shared(proposal);
    };

    clock::destroy_for_testing(clock);
    ts::end(ts);
}

#[test]
#[expected_failure(abort_code = EVotingEnded)]
fun test_08_cannot_vote_after_deadline() {
    let mut ts = ts::begin(ADMIN);
    let mut clock = clock::create_for_testing(ts::ctx(&mut ts));

    test_init(ts::ctx(&mut ts));

    ts::next_tx(&mut ts, USER1);
    {
        let mut dao = ts::take_shared<DataDAO>(&ts);
        let payment = coin::mint_for_testing<SUI>(10_000, ts::ctx(&mut ts));
        let account = purchase_kai(&mut dao, payment, ts::ctx(&mut ts));
        transfer::public_transfer(account, USER1);
        ts::return_shared(dao);
    };

    ts::next_tx(&mut ts, USER1);
    {
        let mut dao = ts::take_shared<DataDAO>(&ts);
        let mut account = ts::take_from_sender<AccountCap>(&ts);
        propose_category(&mut dao, &mut account, b"Test", b"Test", 1000, &clock, ts::ctx(&mut ts));
        ts::return_to_sender(&ts, account);
        ts::return_shared(dao);
    };

    clock::increment_for_testing(&mut clock, 604800001);

    ts::next_tx(&mut ts, USER1);
    {
        let mut dao = ts::take_shared<DataDAO>(&ts);
        let account = ts::take_from_sender<AccountCap>(&ts);
        let mut proposal = ts::take_shared<Proposal>(&ts);

        vote(&mut dao, &account, &mut proposal, &clock, ts::ctx(&mut ts)); // Should fail

        ts::return_to_sender(&ts, account);
        ts::return_shared(dao);
        ts::return_shared(proposal);
    };

    clock::destroy_for_testing(clock);
    ts::end(ts);
}
