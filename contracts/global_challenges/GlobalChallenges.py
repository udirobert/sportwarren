from pyteal import *

def approval_program():
    # Global state keys
    PLATFORM_CREATOR = Bytes("platform_creator")
    CHALLENGE_COUNTER = Bytes("challenge_counter")
    TOTAL_PRIZE_POOL = Bytes("total_prize_pool")
    ACTIVE_CHALLENGES = Bytes("active_challenges")
    PLATFORM_FEE_RATE = Bytes("platform_fee_rate")  # Percentage (e.g., 5 = 5%)
    
    # Local state keys
    USER_CHALLENGES_JOINED = Bytes("user_challenges_joined")
    USER_TOTAL_WINNINGS = Bytes("user_total_winnings")
    USER_REPUTATION_SCORE = Bytes("user_reputation_score")
    
    # Operations
    op_create_challenge = Bytes("create_challenge")
    op_join_challenge = Bytes("join_challenge")
    op_submit_progress = Bytes("submit_progress")
    op_verify_progress = Bytes("verify_progress")
    op_finalize_challenge = Bytes("finalize_challenge")
    op_distribute_prizes = Bytes("distribute_prizes")
    op_sponsor_challenge = Bytes("sponsor_challenge")

    # --- On Creation of the Application ---
    on_create = Seq([
        Assert(Txn.application_id() == Int(0)),
        App.globalPut(PLATFORM_CREATOR, Txn.sender()),
        App.globalPut(CHALLENGE_COUNTER, Int(0)),
        App.globalPut(TOTAL_PRIZE_POOL, Int(0)),
        App.globalPut(ACTIVE_CHALLENGES, Int(0)),
        App.globalPut(PLATFORM_FEE_RATE, Int(5)),  # 5% platform fee
        Approve()
    ])

    # --- On Opt-in to the Application ---
    on_opt_in = Seq([
        Assert(Txn.application_args.length() == Int(1)),  # reputation_score
        App.localPut(Txn.sender(), USER_CHALLENGES_JOINED, Int(0)),
        App.localPut(Txn.sender(), USER_TOTAL_WINNINGS, Int(0)),
        App.localPut(Txn.sender(), USER_REPUTATION_SCORE, Btoi(Txn.application_args[0])),
        Approve()
    ])

    # --- Create Global Challenge ---
    challenge_id = ScratchVar(TealType.uint64)
    prize_pool = ScratchVar(TealType.uint64)
    min_reputation = ScratchVar(TealType.uint64)
    max_participants = ScratchVar(TealType.uint64)
    duration_rounds = ScratchVar(TealType.uint64)
    on_create_challenge = Seq([
        Assert(Txn.application_args.length() == Int(8)),  # title, description, challenge_type, prize_pool, min_reputation, max_participants, duration_rounds, sponsor
        
        # Only verified sponsors or platform creator can create challenges
        Assert(Or(
            Txn.sender() == App.globalGet(PLATFORM_CREATOR),
            App.localGet(Txn.sender(), USER_REPUTATION_SCORE) >= Int(5000)  # High reputation required for sponsorship
        )),
        
        App.globalPut(CHALLENGE_COUNTER, App.globalGet(CHALLENGE_COUNTER) + Int(1)),
        challenge_id.store(App.globalGet(CHALLENGE_COUNTER)),
        prize_pool.store(Btoi(Txn.application_args[3])),
        min_reputation.store(Btoi(Txn.application_args[4])),
        max_participants.store(Btoi(Txn.application_args[5])),
        duration_rounds.store(Btoi(Txn.application_args[6])),
        
        # Store challenge data
        App.globalPut(Concat(Bytes("challenge_title_"), Itob(challenge_id.load())), Txn.application_args[0]),
        App.globalPut(Concat(Bytes("challenge_desc_"), Itob(challenge_id.load())), Txn.application_args[1]),
        App.globalPut(Concat(Bytes("challenge_type_"), Itob(challenge_id.load())), Txn.application_args[2]),
        App.globalPut(Concat(Bytes("challenge_prize_"), Itob(challenge_id.load())), prize_pool.load()),
        App.globalPut(Concat(Bytes("challenge_min_rep_"), Itob(challenge_id.load())), min_reputation.load()),
        App.globalPut(Concat(Bytes("challenge_max_part_"), Itob(challenge_id.load())), max_participants.load()),
        App.globalPut(Concat(Bytes("challenge_sponsor_"), Itob(challenge_id.load())), Txn.application_args[7]),
        App.globalPut(Concat(Bytes("challenge_creator_"), Itob(challenge_id.load())), Txn.sender()),
        App.globalPut(Concat(Bytes("challenge_start_"), Itob(challenge_id.load())), Global.round()),
        App.globalPut(Concat(Bytes("challenge_end_"), Itob(challenge_id.load())), Global.round() + duration_rounds.load()),
        App.globalPut(Concat(Bytes("challenge_participants_"), Itob(challenge_id.load())), Int(0)),
        App.globalPut(Concat(Bytes("challenge_status_"), Itob(challenge_id.load())), Bytes("active")),
        
        # Update global counters
        App.globalPut(TOTAL_PRIZE_POOL, App.globalGet(TOTAL_PRIZE_POOL) + prize_pool.load()),
        App.globalPut(ACTIVE_CHALLENGES, App.globalGet(ACTIVE_CHALLENGES) + Int(1)),
        
        Log(Concat(Bytes("Challenge created with ID: "), Itob(challenge_id.load()))),
        Approve()
    ])

    # --- Join Challenge ---
    challenge_id_join = ScratchVar(TealType.uint64)
    user_reputation = ScratchVar(TealType.uint64)
    min_rep_required = ScratchVar(TealType.uint64)
    current_participants = ScratchVar(TealType.uint64)
    max_part_allowed = ScratchVar(TealType.uint64)
    on_join_challenge = Seq([
        Assert(Txn.application_args.length() == Int(1)),  # challenge_id
        challenge_id_join.store(Btoi(Txn.application_args[0])),
        
        # Check if challenge exists and is active
        Assert(App.globalGet(Concat(Bytes("challenge_status_"), Itob(challenge_id_join.load()))) == Bytes("active")),
        Assert(Global.round() <= App.globalGet(Concat(Bytes("challenge_end_"), Itob(challenge_id_join.load())))),
        
        # Check user reputation requirement
        user_reputation.store(App.localGet(Txn.sender(), USER_REPUTATION_SCORE)),
        min_rep_required.store(App.globalGet(Concat(Bytes("challenge_min_rep_"), Itob(challenge_id_join.load())))),
        Assert(user_reputation.load() >= min_rep_required.load()),
        
        # Check participant limit
        current_participants.store(App.globalGet(Concat(Bytes("challenge_participants_"), Itob(challenge_id_join.load())))),
        max_part_allowed.store(App.globalGet(Concat(Bytes("challenge_max_part_"), Itob(challenge_id_join.load())))),
        Assert(current_participants.load() < max_part_allowed.load()),
        
        # Check if user hasn't already joined
        Assert(App.globalGet(Concat(Bytes("participant_"), Itob(challenge_id_join.load()), Bytes("_"), Txn.sender())) == Int(0)),
        
        # Register participant
        App.globalPut(Concat(Bytes("participant_"), Itob(challenge_id_join.load()), Bytes("_"), Txn.sender()), Int(1)),
        App.globalPut(Concat(Bytes("participant_score_"), Itob(challenge_id_join.load()), Bytes("_"), Txn.sender()), Int(0)),
        App.globalPut(Concat(Bytes("participant_verified_"), Itob(challenge_id_join.load()), Bytes("_"), Txn.sender()), Int(0)),
        
        # Update counters
        App.globalPut(Concat(Bytes("challenge_participants_"), Itob(challenge_id_join.load())), current_participants.load() + Int(1)),
        App.localPut(Txn.sender(), USER_CHALLENGES_JOINED, App.localGet(Txn.sender(), USER_CHALLENGES_JOINED) + Int(1)),
        
        Log(Concat(Bytes("User joined challenge: "), Itob(challenge_id_join.load()))),
        Approve()
    ])

    # --- Submit Progress ---
    challenge_id_progress = ScratchVar(TealType.uint64)
    new_score = ScratchVar(TealType.uint64)
    evidence_hash = ScratchVar(TealType.bytes)
    on_submit_progress = Seq([
        Assert(Txn.application_args.length() == Int(3)),  # challenge_id, score, evidence_hash
        challenge_id_progress.store(Btoi(Txn.application_args[0])),
        new_score.store(Btoi(Txn.application_args[1])),
        evidence_hash.store(Txn.application_args[2]),
        
        # Check if user is participant and challenge is active
        Assert(App.globalGet(Concat(Bytes("participant_"), Itob(challenge_id_progress.load()), Bytes("_"), Txn.sender())) == Int(1)),
        Assert(App.globalGet(Concat(Bytes("challenge_status_"), Itob(challenge_id_progress.load()))) == Bytes("active")),
        Assert(Global.round() <= App.globalGet(Concat(Bytes("challenge_end_"), Itob(challenge_id_progress.load())))),
        
        # Update score (only if higher than current)
        If(new_score.load() > App.globalGet(Concat(Bytes("participant_score_"), Itob(challenge_id_progress.load()), Bytes("_"), Txn.sender())))
        .Then(Seq([
            App.globalPut(Concat(Bytes("participant_score_"), Itob(challenge_id_progress.load()), Bytes("_"), Txn.sender()), new_score.load()),
            App.globalPut(Concat(Bytes("participant_evidence_"), Itob(challenge_id_progress.load()), Bytes("_"), Txn.sender()), evidence_hash.load()),
            App.globalPut(Concat(Bytes("participant_last_update_"), Itob(challenge_id_progress.load()), Bytes("_"), Txn.sender()), Global.latest_timestamp()),
        ])),
        
        Log(Concat(Bytes("Progress submitted for challenge: "), Itob(challenge_id_progress.load()))),
        Approve()
    ])

    # --- Verify Progress ---
    challenge_id_verify = ScratchVar(TealType.uint64)
    target_participant = ScratchVar(TealType.bytes)
    verification_type = ScratchVar(TealType.uint64)  # 1 = approve, 0 = dispute
    verifier_reputation = ScratchVar(TealType.uint64)
    on_verify_progress = Seq([
        Assert(Txn.application_args.length() == Int(3)),  # challenge_id, target_participant, verification_type
        challenge_id_verify.store(Btoi(Txn.application_args[0])),
        target_participant.store(Txn.application_args[1]),
        verification_type.store(Btoi(Txn.application_args[2])),
        
        # Check verifier reputation (must be high enough to verify)
        verifier_reputation.store(App.localGet(Txn.sender(), USER_REPUTATION_SCORE)),
        Assert(verifier_reputation.load() >= Int(1000)),
        
        # Check if target is participant
        Assert(App.globalGet(Concat(Bytes("participant_"), Itob(challenge_id_verify.load()), Bytes("_"), target_participant.load())) == Int(1)),
        
        # Record verification
        App.globalPut(
            Concat(Bytes("verification_"), Itob(challenge_id_verify.load()), Bytes("_"), target_participant.load(), Bytes("_"), Txn.sender()),
            verification_type.load()
        ),
        
        # Update verification count
        If(verification_type.load() == Int(1))
        .Then(App.globalPut(
            Concat(Bytes("participant_verified_"), Itob(challenge_id_verify.load()), Bytes("_"), target_participant.load()),
            App.globalGet(Concat(Bytes("participant_verified_"), Itob(challenge_id_verify.load()), Bytes("_"), target_participant.load())) + Int(1)
        )),
        
        Log(Concat(Bytes("Progress verified for challenge: "), Itob(challenge_id_verify.load()))),
        Approve()
    ])

    # --- Finalize Challenge ---
    challenge_id_final = ScratchVar(TealType.uint64)
    on_finalize_challenge = Seq([
        Assert(Txn.application_args.length() == Int(1)),  # challenge_id
        challenge_id_final.store(Btoi(Txn.application_args[0])),
        
        # Only creator or platform admin can finalize
        Assert(Or(
            Txn.sender() == App.globalGet(PLATFORM_CREATOR),
            Txn.sender() == App.globalGet(Concat(Bytes("challenge_creator_"), Itob(challenge_id_final.load())))
        )),
        
        # Check if challenge has ended
        Assert(Global.round() > App.globalGet(Concat(Bytes("challenge_end_"), Itob(challenge_id_final.load())))),
        Assert(App.globalGet(Concat(Bytes("challenge_status_"), Itob(challenge_id_final.load()))) == Bytes("active")),
        
        # Mark as finalized
        App.globalPut(Concat(Bytes("challenge_status_"), Itob(challenge_id_final.load())), Bytes("finalized")),
        App.globalPut(Concat(Bytes("challenge_finalized_"), Itob(challenge_id_final.load())), Global.latest_timestamp()),
        
        # Update global counters
        App.globalPut(ACTIVE_CHALLENGES, App.globalGet(ACTIVE_CHALLENGES) - Int(1)),
        
        Log(Concat(Bytes("Challenge finalized: "), Itob(challenge_id_final.load()))),
        Approve()
    ])

    # --- Distribute Prizes ---
    challenge_id_prize = ScratchVar(TealType.uint64)
    winner_address = ScratchVar(TealType.bytes)
    prize_amount = ScratchVar(TealType.uint64)
    platform_fee = ScratchVar(TealType.uint64)
    winner_prize = ScratchVar(TealType.uint64)
    on_distribute_prizes = Seq([
        Assert(Txn.application_args.length() == Int(3)),  # challenge_id, winner_address, prize_amount
        challenge_id_prize.store(Btoi(Txn.application_args[0])),
        winner_address.store(Txn.application_args[1]),
        prize_amount.store(Btoi(Txn.application_args[2])),
        
        # Only platform creator can distribute prizes
        Assert(Txn.sender() == App.globalGet(PLATFORM_CREATOR)),
        
        # Check if challenge is finalized
        Assert(App.globalGet(Concat(Bytes("challenge_status_"), Itob(challenge_id_prize.load()))) == Bytes("finalized")),
        
        # Calculate platform fee and winner prize
        platform_fee.store((prize_amount.load() * App.globalGet(PLATFORM_FEE_RATE)) / Int(100)),
        winner_prize.store(prize_amount.load() - platform_fee.load()),
        
        # Record prize distribution
        App.globalPut(Concat(Bytes("challenge_winner_"), Itob(challenge_id_prize.load())), winner_address.load()),
        App.globalPut(Concat(Bytes("challenge_prize_distributed_"), Itob(challenge_id_prize.load())), winner_prize.load()),
        
        # Update winner's total winnings
        App.localPut(winner_address.load(), USER_TOTAL_WINNINGS, App.localGet(winner_address.load(), USER_TOTAL_WINNINGS) + winner_prize.load()),
        
        # Transfer prize (this would be handled by the calling application)
        Log(Concat(Bytes("Prize distributed for challenge: "), Itob(challenge_id_prize.load()))),
        Approve()
    ])

    # --- Main Router ---
    program = Cond(
        [Txn.application_id() == Int(0), on_create],
        [Txn.on_completion() == OnComplete.OptIn, on_opt_in],
        [Txn.on_completion() == OnComplete.NoOp,
            Cond(
                [Txn.application_args[0] == op_create_challenge, on_create_challenge],
                [Txn.application_args[0] == op_join_challenge, on_join_challenge],
                [Txn.application_args[0] == op_submit_progress, on_submit_progress],
                [Txn.application_args[0] == op_verify_progress, on_verify_progress],
                [Txn.application_args[0] == op_finalize_challenge, on_finalize_challenge],
                [Txn.application_args[0] == op_distribute_prizes, on_distribute_prizes],
            )
        ],
        [Txn.on_completion() == OnComplete.DeleteApplication,
            Seq([
                Assert(Txn.sender() == App.globalGet(PLATFORM_CREATOR)),
                Approve()
            ])
        ],
        [Txn.on_completion() == OnComplete.UpdateApplication,
            Seq([
                Assert(Txn.sender() == App.globalGet(PLATFORM_CREATOR)),
                Approve()
            ])
        ],
        [Int(1), Reject()]
    )
    return program

def clear_state_program():
    return Approve()

if __name__ == "__main__":
    with open("global_challenges_approval.teal", "w") as f:
        compiled = compileTeal(approval_program(), Mode.Application, version=6)
        f.write(compiled)

    with open("global_challenges_clear_state.teal", "w") as f:
        compiled = compileTeal(clear_state_program(), Mode.Application, version=6)
        f.write(compiled)