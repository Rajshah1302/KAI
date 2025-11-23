#[test_only]
module dao::comprehensive_tests;

use std::debug;
use sui::test_scenario as ts;
use std::unit_test;
use sui::clock;
use sui::coin;
use sui::sui::SUI;
use dao::kai::{
    Self,
    DataDAO,
    AccountCap,
    DataCategory,
    DataSubmission,
    Proposal,
    Marketplace,
};

// Test addresses
const ADMIN: address = @0xAD;
const ALICE: address = @0xA11CE;
const BOB: address = @0xB0B;
const CHARLIE: address = @0xC;
const DAVE: address = @0xD;

// Helper function to initialize DAO for tests
fun init_dao_for_testing(scenario: &mut ts::Scenario) {
    ts::next_tx(scenario, ADMIN);
    {
        kai::test_init(ts::ctx(scenario));
    };
}

// ==================== INITIALIZATION TESTS ====================

#[test]
fun test_dao_initialization() {
    let mut scenario = ts::begin(ADMIN);
    init_dao_for_testing(&mut scenario);
    
    ts::next_tx(&mut scenario, ADMIN);
    {
        let dao = ts::take_shared<DataDAO>(&scenario);
        let marketplace = ts::take_shared<Marketplace>(&scenario);
        
        // Verify DAO initial state
        assert!(kai::get_treasury(&dao) == 0, 0);
        assert!(kai::get_kai_reserve(&dao) == 300_000_000000, 1); // 30% of supply
        assert!(kai::get_reward_pool(&dao) == 700_000_000000, 2); // 70% of supply
        
        ts::return_shared(dao);
        ts::return_shared(marketplace);
    };
    
    ts::end(scenario);
}

// ==================== KAI TOKEN PURCHASE TESTS ====================

#[test]
fun test_purchase_kai_single_user() {
    let mut scenario = ts::begin(ADMIN);
    init_dao_for_testing(&mut scenario);
    
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let payment = coin::mint_for_testing<SUI>(1000, ts::ctx(&mut scenario));
        
        let account = kai::purchase_kai(&mut dao, payment, ts::ctx(&mut scenario));
        
        // Should receive 1000 * 1000 = 1_000_000 KAI (with 6 decimals)
        assert!(kai::get_kai_balance(&account) == 1_000_000, 0);
        assert!(kai::get_treasury(&dao) == 1000, 1);
        assert!(kai::get_kai_reserve(&dao) == 299_999_000000, 2);
        
        transfer::public_transfer(account, ALICE);
        ts::return_shared(dao);
    };
    
    ts::end(scenario);
}

#[test]
fun test_purchase_kai_multiple_users() {
    let mut scenario = ts::begin(ADMIN);
    init_dao_for_testing(&mut scenario);
    
    // Alice purchases
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let payment = coin::mint_for_testing<SUI>(5000, ts::ctx(&mut scenario));
        let account = kai::purchase_kai(&mut dao, payment, ts::ctx(&mut scenario));
        transfer::public_transfer(account, ALICE);
        ts::return_shared(dao);
    };
    
    // Bob purchases
    ts::next_tx(&mut scenario, BOB);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let payment = coin::mint_for_testing<SUI>(3000, ts::ctx(&mut scenario));
        let account = kai::purchase_kai(&mut dao, payment, ts::ctx(&mut scenario));
        transfer::public_transfer(account, BOB);
        ts::return_shared(dao);
    };
    
    // Verify final state
    ts::next_tx(&mut scenario, ADMIN);
    {
        let dao = ts::take_shared<DataDAO>(&scenario);
        assert!(kai::get_treasury(&dao) == 8000, 0); // 5000 + 3000
        // 300M - (5000*1000 + 3000*1000) = 300M - 8M = 292M
        assert!(kai::get_kai_reserve(&dao) == 300_000_000000 - 8_000_000, 1);
        ts::return_shared(dao);
    };
    
    ts::end(scenario);
}

#[test]
fun test_add_kai_to_existing_account() {
    let mut scenario = ts::begin(ADMIN);
    init_dao_for_testing(&mut scenario);
    
    // Initial purchase
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let payment = coin::mint_for_testing<SUI>(1000, ts::ctx(&mut scenario));
        let account = kai::purchase_kai(&mut dao, payment, ts::ctx(&mut scenario));
        transfer::public_transfer(account, ALICE);
        ts::return_shared(dao);
    };
    
    // Add more KAI
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let mut account = ts::take_from_sender<AccountCap>(&scenario);
        let payment = coin::mint_for_testing<SUI>(2000, ts::ctx(&mut scenario));
        
        kai::add_kai(&mut dao, &mut account, payment, ts::ctx(&mut scenario));
        assert!(kai::get_kai_balance(&account) == 3_000_000, 0); // 1M + 2M
        
        ts::return_to_sender(&scenario, account);
        ts::return_shared(dao);
    };
    
    ts::end(scenario);
}

#[test]
#[expected_failure(abort_code = kai::ENoKAIAvailable)]
fun test_purchase_exceeds_reserve() {
    let mut scenario = ts::begin(ADMIN);
    init_dao_for_testing(&mut scenario);
    
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        
        // Reserve has 300_000_000000 KAI (300M KAI with 6 decimals)
        // At price 1000: 1 SUI = 1000 KAI
        // Max purchasable = 300_000_000000 / 1000 = 300_000_000 SUI (300M SUI)
        // Try to purchase with 301_000_000 SUI which needs 301B KAI (exceeds reserve)
        let payment = coin::mint_for_testing<SUI>(301_000_000, ts::ctx(&mut scenario));
        let account = kai::purchase_kai(&mut dao, payment, ts::ctx(&mut scenario));
        
        transfer::public_transfer(account, ALICE);
        ts::return_shared(dao);
    };
    
    ts::end(scenario);
}

// ==================== KAI BURN/REDEEM TESTS ====================

#[test]
fun test_burn_kai_for_sui() {
    let mut scenario = ts::begin(ADMIN);
    init_dao_for_testing(&mut scenario);
    
    // Purchase KAI
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let payment = coin::mint_for_testing<SUI>(10_000, ts::ctx(&mut scenario));
        let account = kai::purchase_kai(&mut dao, payment, ts::ctx(&mut scenario));
        transfer::public_transfer(account, ALICE);
        ts::return_shared(dao);
    };
    
    // Burn half of KAI
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let mut account = ts::take_from_sender<AccountCap>(&scenario);
        
        let sui_coin = kai::burn_kai(&mut dao, &mut account, 5_000_000, ts::ctx(&mut scenario));
        assert!(coin::value(&sui_coin) == 5_000, 0);
        assert!(kai::get_kai_balance(&account) == 5_000_000, 1);
        
        unit_test::destroy(sui_coin);
        ts::return_to_sender(&scenario, account);
        ts::return_shared(dao);
    };
    
    ts::end(scenario);
}

#[test]
#[expected_failure(abort_code = kai::EInsufficientKAI)]
fun test_burn_exceeds_balance() {
    let mut scenario = ts::begin(ADMIN);
    init_dao_for_testing(&mut scenario);
    
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let payment = coin::mint_for_testing<SUI>(1000, ts::ctx(&mut scenario));
        let account = kai::purchase_kai(&mut dao, payment, ts::ctx(&mut scenario));
        transfer::public_transfer(account, ALICE);
        ts::return_shared(dao);
    };
    
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let mut account = ts::take_from_sender<AccountCap>(&scenario);
        
        // Try to burn more than available
        let sui_coin = kai::burn_kai(&mut dao, &mut account, 2_000_000, ts::ctx(&mut scenario));
        
        unit_test::destroy(sui_coin);
        ts::return_to_sender(&scenario, account);
        ts::return_shared(dao);
    };
    
    ts::end(scenario);
}

// ==================== CATEGORY PROPOSAL TESTS ====================

#[test]
fun test_propose_and_execute_category() {
    let mut scenario = ts::begin(ADMIN);
    let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
    init_dao_for_testing(&mut scenario);
    
    // Alice and Bob buy KAI (need 30% for quorum)
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let payment = coin::mint_for_testing<SUI>(150_000, ts::ctx(&mut scenario));
        let account = kai::purchase_kai(&mut dao, payment, ts::ctx(&mut scenario));
        transfer::public_transfer(account, ALICE);
        ts::return_shared(dao);
    };
    
    ts::next_tx(&mut scenario, BOB);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let payment = coin::mint_for_testing<SUI>(100_000, ts::ctx(&mut scenario));
        let account = kai::purchase_kai(&mut dao, payment, ts::ctx(&mut scenario));
        transfer::public_transfer(account, BOB);
        ts::return_shared(dao);
    };
    
    // Alice proposes category
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let mut account = ts::take_from_sender<AccountCap>(&scenario);
        
        kai::propose_category(
            &mut dao,
            &mut account,
            b"Healthcare",
            b"Medical and health data",
            10_000_000,
            &clock,
            ts::ctx(&mut scenario),
        );
        
        ts::return_to_sender(&scenario, account);
        ts::return_shared(dao);
    };
    
    // Alice and Bob vote
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let account = ts::take_from_sender<AccountCap>(&scenario);
        let mut proposal = ts::take_shared<Proposal>(&scenario);
        
        kai::vote(&mut dao, &account, &mut proposal, &clock, ts::ctx(&mut scenario));
        
        ts::return_to_sender(&scenario, account);
        ts::return_shared(dao);
        ts::return_shared(proposal);
    };
    
    ts::next_tx(&mut scenario, BOB);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let account = ts::take_from_sender<AccountCap>(&scenario);
        let mut proposal = ts::take_shared<Proposal>(&scenario);
        
        kai::vote(&mut dao, &account, &mut proposal, &clock, ts::ctx(&mut scenario));
        
        ts::return_to_sender(&scenario, account);
        ts::return_shared(dao);
        ts::return_shared(proposal);
    };
    
    // Wait for voting period to end
    clock::increment_for_testing(&mut clock, 604800001);
    
    // Execute proposal
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let mut proposal = ts::take_shared<Proposal>(&scenario);
        
        kai::execute_category_proposal(&mut dao, &mut proposal, &clock, ts::ctx(&mut scenario));
        assert!(kai::is_proposal_executed(&proposal), 0);
        
        ts::return_shared(dao);
        ts::return_shared(proposal);
    };
    
    clock::destroy_for_testing(clock);
    ts::end(scenario);
}

// ==================== DATA SUBMISSION TESTS ====================

#[test]
fun test_submit_and_approve_data() {
    let mut scenario = ts::begin(ADMIN);
    let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
    init_dao_for_testing(&mut scenario);
    
    // Alice buys enough KAI for quorum + threshold
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let payment = coin::mint_for_testing<SUI>(250_000, ts::ctx(&mut scenario));
        let account = kai::purchase_kai(&mut dao, payment, ts::ctx(&mut scenario));
        transfer::public_transfer(account, ALICE);
        ts::return_shared(dao);
    };
    
    // Create category
    ts::next_tx(&mut scenario, ADMIN);
    {
        kai::create_test_category(
            b"AI Training",
            b"Data for AI models",
            50_000_000,
            true,
            ts::ctx(&mut scenario),
        );
    };
    
    // Bob submits data
    ts::next_tx(&mut scenario, BOB);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let category = ts::take_shared<DataCategory>(&scenario);
        
        kai::submit_data(
            &mut dao,
            &category,
            b"walrus_blob_xyz789",
            b"{\"type\":\"medical\",\"size\":1024}",
            &clock,
            ts::ctx(&mut scenario),
        );
        
        ts::return_shared(dao);
        ts::return_shared(category);
    };
    
    // Alice votes to approve
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let account = ts::take_from_sender<AccountCap>(&scenario);
        let mut proposal = ts::take_shared<Proposal>(&scenario);
        
        kai::vote(&mut dao, &account, &mut proposal, &clock, ts::ctx(&mut scenario));
        
        ts::return_to_sender(&scenario, account);
        ts::return_shared(dao);
        ts::return_shared(proposal);
    };
    
    // Wait and execute
    clock::increment_for_testing(&mut clock, 604800001);
    
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let mut proposal = ts::take_shared<Proposal>(&scenario);
        let mut submission = ts::take_shared<DataSubmission>(&scenario);
        let category = ts::take_shared<DataCategory>(&scenario);
        
        kai::execute_data_proposal(
            &mut dao,
            &mut proposal,
            &mut submission,
            &category,
            &clock,
            ts::ctx(&mut scenario),
        );
        
        assert!(kai::is_submission_approved(&submission), 0);
        assert!(kai::is_proposal_executed(&proposal), 1);
        
        ts::return_shared(dao);
        ts::return_shared(proposal);
        ts::return_shared(submission);
        ts::return_shared(category);
    };
    
    clock::destroy_for_testing(clock);
    ts::end(scenario);
}

#[test]
#[expected_failure(abort_code = kai::ECategoryInactive)]
fun test_submit_to_inactive_category() {
    let mut scenario = ts::begin(ADMIN);
    let clock = clock::create_for_testing(ts::ctx(&mut scenario));
    init_dao_for_testing(&mut scenario);
    
    // Create inactive category
    ts::next_tx(&mut scenario, ADMIN);
    {
        kai::create_test_category(
            b"Inactive",
            b"Not active",
            10_000_000,
            false, // Inactive!
            ts::ctx(&mut scenario),
        );
    };
    
    // Try to submit data
    ts::next_tx(&mut scenario, BOB);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let category = ts::take_shared<DataCategory>(&scenario);
        
        kai::submit_data(
            &mut dao,
            &category,
            b"blob_id",
            b"metadata",
            &clock,
            ts::ctx(&mut scenario),
        );
        
        ts::return_shared(dao);
        ts::return_shared(category);
    };
    
    clock::destroy_for_testing(clock);
    ts::end(scenario);
}

// ==================== PRICING TESTS ====================

#[test]
fun test_propose_price_and_purchase() {
    let mut scenario = ts::begin(ADMIN);
    let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
    init_dao_for_testing(&mut scenario);
    
    // Alice buys KAI
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let payment = coin::mint_for_testing<SUI>(200_000, ts::ctx(&mut scenario));
        let account = kai::purchase_kai(&mut dao, payment, ts::ctx(&mut scenario));
        transfer::public_transfer(account, ALICE);
        ts::return_shared(dao);
    };
    
    // Create approved submission
    let submission_id;
    ts::next_tx(&mut scenario, ADMIN);
    {
        kai::create_test_submission(
            b"approved_blob",
            b"approved_metadata",
            object::id_from_address(@0x1),
            BOB,
            true,
            0,
            false,
            ts::ctx(&mut scenario),
        );
        
        // Get the submission ID from the next transaction
    };
    
    ts::next_tx(&mut scenario, ADMIN);
    {
        let submission = ts::take_shared<DataSubmission>(&scenario);
        submission_id = object::id(&submission);
        ts::return_shared(submission);
    };
    
    // Alice proposes price
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let account = ts::take_from_sender<AccountCap>(&scenario);
        
        kai::propose_price(&mut dao, &account, submission_id, 5000, &clock, ts::ctx(&mut scenario));
        
        ts::return_to_sender(&scenario, account);
        ts::return_shared(dao);
    };
    
    // Vote
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let account = ts::take_from_sender<AccountCap>(&scenario);
        let mut proposal = ts::take_shared<Proposal>(&scenario);
        
        kai::vote(&mut dao, &account, &mut proposal, &clock, ts::ctx(&mut scenario));
        
        ts::return_to_sender(&scenario, account);
        ts::return_shared(dao);
        ts::return_shared(proposal);
    };
    
    // Execute pricing
    clock::increment_for_testing(&mut clock, 604800001);
    
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let mut proposal = ts::take_shared<Proposal>(&scenario);
        let mut submission = ts::take_shared<DataSubmission>(&scenario);
        let mut marketplace = ts::take_shared<Marketplace>(&scenario);
        
        kai::execute_price_proposal(
            &mut dao,
            &mut proposal,
            &mut submission,
            &mut marketplace,
            &clock,
            ts::ctx(&mut scenario),
        );
        
        assert!(kai::is_submission_listed(&submission), 0);
        assert!(kai::get_submission_price(&submission) == 5000, 1);
        
        ts::return_shared(dao);
        ts::return_shared(proposal);
        ts::return_shared(submission);
        ts::return_shared(marketplace);
    };
    
    // Charlie purchases data
    ts::next_tx(&mut scenario, CHARLIE);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let submission = ts::take_shared<DataSubmission>(&scenario);
        let payment = coin::mint_for_testing<SUI>(5000, ts::ctx(&mut scenario));
        
        kai::purchase_data(&mut dao, &submission, payment, ts::ctx(&mut scenario));
        
        ts::return_shared(dao);
        ts::return_shared(submission);
    };
    
    // Verify treasury increased
    ts::next_tx(&mut scenario, ADMIN);
    {
        let dao = ts::take_shared<DataDAO>(&scenario);
        // Should have 200_000 (from Alice) + 5000 (from Charlie)
        assert!(kai::get_treasury(&dao) == 205_000, 0);
        ts::return_shared(dao);
    };
    
    clock::destroy_for_testing(clock);
    ts::end(scenario);
}

#[test]
#[expected_failure(abort_code = kai::ENotListed)]
fun test_purchase_unlisted_data() {
    let mut scenario = ts::begin(ADMIN);
    init_dao_for_testing(&mut scenario);
    
    // Create unlisted submission
    ts::next_tx(&mut scenario, ADMIN);
    {
        kai::create_test_submission(
            b"blob",
            b"meta",
            object::id_from_address(@0x1),
            BOB,
            true,
            1000,
            false, // Not listed!
            ts::ctx(&mut scenario),
        );
    };
    
    // Try to purchase
    ts::next_tx(&mut scenario, CHARLIE);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let submission = ts::take_shared<DataSubmission>(&scenario);
        let payment = coin::mint_for_testing<SUI>(1000, ts::ctx(&mut scenario));
        
        kai::purchase_data(&mut dao, &submission, payment, ts::ctx(&mut scenario));
        
        ts::return_shared(dao);
        ts::return_shared(submission);
    };
    
    ts::end(scenario);
}

// ==================== VOTING CONSTRAINT TESTS ====================

#[test]
#[expected_failure(abort_code = kai::EAlreadyVoted)]
fun test_cannot_vote_twice() {
    let mut scenario = ts::begin(ADMIN);
    let clock = clock::create_for_testing(ts::ctx(&mut scenario));
    init_dao_for_testing(&mut scenario);
    
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let payment = coin::mint_for_testing<SUI>(10_000, ts::ctx(&mut scenario));
        let account = kai::purchase_kai(&mut dao, payment, ts::ctx(&mut scenario));
        transfer::public_transfer(account, ALICE);
        ts::return_shared(dao);
    };
    
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let mut account = ts::take_from_sender<AccountCap>(&scenario);
        kai::propose_category(&mut dao, &mut account, b"Test", b"Test", 1000, &clock, ts::ctx(&mut scenario));
        ts::return_to_sender(&scenario, account);
        ts::return_shared(dao);
    };
    
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let account = ts::take_from_sender<AccountCap>(&scenario);
        let mut proposal = ts::take_shared<Proposal>(&scenario);
        
        kai::vote(&mut dao, &account, &mut proposal, &clock, ts::ctx(&mut scenario));
        kai::vote(&mut dao, &account, &mut proposal, &clock, ts::ctx(&mut scenario)); // Should fail
        
        ts::return_to_sender(&scenario, account);
        ts::return_shared(dao);
        ts::return_shared(proposal);
    };
    
    clock::destroy_for_testing(clock);
    ts::end(scenario);
}

#[test]
#[expected_failure(abort_code = kai::EVotingEnded)]
fun test_cannot_vote_after_deadline() {
    let mut scenario = ts::begin(ADMIN);
    let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
    init_dao_for_testing(&mut scenario);
    
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let payment = coin::mint_for_testing<SUI>(10_000, ts::ctx(&mut scenario));
        let account = kai::purchase_kai(&mut dao, payment, ts::ctx(&mut scenario));
        transfer::public_transfer(account, ALICE);
        ts::return_shared(dao);
    };
    
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let mut account = ts::take_from_sender<AccountCap>(&scenario);
        kai::propose_category(&mut dao, &mut account, b"Test", b"Test", 1000, &clock, ts::ctx(&mut scenario));
        ts::return_to_sender(&scenario, account);
        ts::return_shared(dao);
    };
    
    // Time passes
    clock::increment_for_testing(&mut clock, 604800001);
    
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let account = ts::take_from_sender<AccountCap>(&scenario);
        let mut proposal = ts::take_shared<Proposal>(&scenario);
        
        kai::vote(&mut dao, &account, &mut proposal, &clock, ts::ctx(&mut scenario)); // Should fail
        
        ts::return_to_sender(&scenario, account);
        ts::return_shared(dao);
        ts::return_shared(proposal);
    };
    
    clock::destroy_for_testing(clock);
    ts::end(scenario);
}

// ==================== INTEGRATION TESTS ====================

#[test]
fun test_full_dao_lifecycle() {
    let mut scenario = ts::begin(ADMIN);
    let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
    init_dao_for_testing(&mut scenario);
    
    // Step 1: Multiple users buy KAI
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let payment = coin::mint_for_testing<SUI>(150_000, ts::ctx(&mut scenario));
        let account = kai::purchase_kai(&mut dao, payment, ts::ctx(&mut scenario));
        transfer::public_transfer(account, ALICE);
        ts::return_shared(dao);
    };
    
    ts::next_tx(&mut scenario, BOB);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let payment = coin::mint_for_testing<SUI>(100_000, ts::ctx(&mut scenario));
        let account = kai::purchase_kai(&mut dao, payment, ts::ctx(&mut scenario));
        transfer::public_transfer(account, BOB);
        ts::return_shared(dao);
    };
    
    // Step 2: Create and approve a category
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let mut account = ts::take_from_sender<AccountCap>(&scenario);
        kai::propose_category(&mut dao, &mut account, b"Finance", b"Financial data", 25_000_000, &clock, ts::ctx(&mut scenario));
        ts::return_to_sender(&scenario, account);
        ts::return_shared(dao);
    };
    
    // Vote on category
    ts::next_tx(&mut scenario, ALICE);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let account = ts::take_from_sender<AccountCap>(&scenario);
        let mut proposal = ts::take_shared<Proposal>(&scenario);
        kai::vote(&mut dao, &account, &mut proposal, &clock, ts::ctx(&mut scenario));
        ts::return_to_sender(&scenario, account);
        ts::return_shared(dao);
        ts::return_shared(proposal);
    };
    
    ts::next_tx(&mut scenario, BOB);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let account = ts::take_from_sender<AccountCap>(&scenario);
        let mut proposal = ts::take_shared<Proposal>(&scenario);
        kai::vote(&mut dao, &account, &mut proposal, &clock, ts::ctx(&mut scenario));
        ts::return_to_sender(&scenario, account);
        ts::return_shared(dao);
        ts::return_shared(proposal);
    };
    
    clock::increment_for_testing(&mut clock, 604800001);
    
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut dao = ts::take_shared<DataDAO>(&scenario);
        let mut proposal = ts::take_shared<Proposal>(&scenario);
        kai::execute_category_proposal(&mut dao, &mut proposal, &clock, ts::ctx(&mut scenario));
        ts::return_shared(dao);
        ts::return_shared(proposal);
    };
    
    // Step 3: Verify complete lifecycle
    ts::next_tx(&mut scenario, ADMIN);
    {
        let dao = ts::take_shared<DataDAO>(&scenario);
        assert!(kai::get_treasury(&dao) == 250_000, 0);
        ts::return_shared(dao);
    };
    
    clock::destroy_for_testing(clock);
    ts::end(scenario);
}
