from pyteal import *

def approval_program():
    # Global state keys
    ORACLE_CREATOR = Bytes("oracle_creator")
    MATCH_COUNTER = Bytes("match_counter")
    MIN_VERIFICATIONS = Bytes("min_verifications")
    REPUTATION_THRESHOLD = Bytes("reputation_threshold")

    # Local state keys
    USER_REPUTATION = Bytes("user_reputation")
    VERIFICATION_COUNT = Bytes("verification_count")

    # Operations
    op_submit_match = Bytes("submit_match")
    op_verify_match = Bytes("verify_match")
    op_dispute_match = Bytes("dispute_match")
    op_resolve_dispute = Bytes("resolve_dispute")
    op_update_reputation = Bytes("update_reputation")

    # --- On Creation of the Application ---
    on_create = Seq([
        Assert(Txn.application_id() == Int(0)),
        App.globalPut(ORACLE_CREATOR, Txn.sender()),
        App.globalPut(MATCH_COUNTER, Int(0)),
        App.globalPut(MIN_VERIFICATIONS, Int(3)),  # Minimum 3 verifications required
        App.globalPut(REPUTATION_THRESHOLD, Int(50)),  # Minimum reputation to verify
        Approve()
    ])

    # --- On Opt-in to the Application ---
    on_opt_in = Seq([
        Assert(Txn.application_args.length() == Int(0)),
        App.localPut(Txn.sender(), USER_REPUTATION, Int(100)),  # Starting reputation
        App.localPut(Txn.sender(), VERIFICATION_COUNT, Int(0)),
        Approve()
    ])

    # --- Submit Match Result ---
    match_id_submit = ScratchVar(TealType.uint64)
    on_submit_match = Seq([
        Assert(Txn.application_args.length() == Int(6)),  # match_id, home_team, away_team, home_score, away_score, metadata
        Assert(App.localGet(Txn.sender(), USER_REPUTATION) >= App.globalGet(REPUTATION_THRESHOLD)),
        App.globalPut(MATCH_COUNTER, App.globalGet(MATCH_COUNTER) + Int(1)),
        match_id_submit.store(App.globalGet(MATCH_COUNTER)),
        
        # Store match data
        App.globalPut(Concat(Bytes("match_submitter_"), Itob(match_id_submit.load())), Txn.sender()),
        App.globalPut(Concat(Bytes("match_home_team_"), Itob(match_id_submit.load())), Txn.application_args[1]),
        App.globalPut(Concat(Bytes("match_away_team_"), Itob(match_id_submit.load())), Txn.application_args[2]),
        App.globalPut(Concat(Bytes("match_home_score_"), Itob(match_id_submit.load())), Btoi(Txn.application_args[3])),
        App.globalPut(Concat(Bytes("match_away_score_"), Itob(match_id_submit.load())), Btoi(Txn.application_args[4])),
        App.globalPut(Concat(Bytes("match_metadata_"), Itob(match_id_submit.load())), Txn.application_args[5]),
        App.globalPut(Concat(Bytes("match_timestamp_"), Itob(match_id_submit.load())), Global.latest_timestamp()),
        App.globalPut(Concat(Bytes("match_status_"), Itob(match_id_submit.load())), Bytes("pending")),
        App.globalPut(Concat(Bytes("match_verifications_"), Itob(match_id_submit.load())), Int(0)),
        App.globalPut(Concat(Bytes("match_disputes_"), Itob(match_id_submit.load())), Int(0)),
        
        Log(Concat(Bytes("Match submitted with ID: "), Itob(match_id_submit.load()))),
        Approve()
    ])

    # --- Verify Match Result ---
    match_id_verify = ScratchVar(TealType.uint64)
    verifier_reputation = ScratchVar(TealType.uint64)
    verification_weight = ScratchVar(TealType.uint64)
    current_verifications = ScratchVar(TealType.uint64)
    verification_key = ScratchVar(TealType.bytes)
    on_verify_match = Seq([
        Assert(Txn.application_args.length() == Int(3)),  # match_id, verification_type (1=confirm, 0=dispute), role_weight
        match_id_verify.store(Btoi(Txn.application_args[1])),
        Assert(App.globalGet(Concat(Bytes("match_submitter_"), Itob(match_id_verify.load()))) != Bytes("")),  # Match exists
        Assert(App.globalGet(Concat(Bytes("match_status_"), Itob(match_id_verify.load()))) == Bytes("pending")),  # Still pending
        
        # Check verifier hasn't already verified this match
        verification_key.store(Concat(Bytes("verified_"), Itob(match_id_verify.load()), Bytes("_"), Txn.sender())),
        Assert(App.globalGet(verification_key.load()) == Int(0)),
        
        # Check verifier reputation
        verifier_reputation.store(App.localGet(Txn.sender(), USER_REPUTATION)),
        Assert(verifier_reputation.load() >= App.globalGet(REPUTATION_THRESHOLD)),
        
        # Calculate verification weight based on reputation and role
        verification_weight.store(verifier_reputation.load() + Btoi(Txn.application_args[2])),  # reputation + role bonus
        
        # Record verification
        App.globalPut(verification_key.load(), verification_weight.load()),
        current_verifications.store(App.globalGet(Concat(Bytes("match_verifications_"), Itob(match_id_verify.load())))),
        App.globalPut(Concat(Bytes("match_verifications_"), Itob(match_id_verify.load())), current_verifications.load() + verification_weight.load()),
        
        # Update verifier's verification count
        App.localPut(Txn.sender(), VERIFICATION_COUNT, App.localGet(Txn.sender(), VERIFICATION_COUNT) + Int(1)),
        
        # Check if match is now verified (enough verification weight)
        If(App.globalGet(Concat(Bytes("match_verifications_"), Itob(match_id_verify.load()))) >= App.globalGet(MIN_VERIFICATIONS) * Int(100))
        .Then(App.globalPut(Concat(Bytes("match_status_"), Itob(match_id_verify.load())), Bytes("verified")))
        .Else(App.globalPut(Concat(Bytes("match_status_"), Itob(match_id_verify.load())), Bytes("pending"))),
        
        Log(Concat(Bytes("Match verified by: "), Txn.sender())),
        Approve()
    ])

    # --- Dispute Match Result ---
    match_id_dispute = ScratchVar(TealType.uint64)
    disputer_reputation = ScratchVar(TealType.uint64)
    dispute_weight = ScratchVar(TealType.uint64)
    current_disputes = ScratchVar(TealType.uint64)
    dispute_key = ScratchVar(TealType.bytes)
    on_dispute_match = Seq([
        Assert(Txn.application_args.length() == Int(3)),  # match_id, dispute_reason, evidence_hash
        match_id_dispute.store(Btoi(Txn.application_args[1])),
        Assert(App.globalGet(Concat(Bytes("match_submitter_"), Itob(match_id_dispute.load()))) != Bytes("")),  # Match exists
        
        # Check disputer hasn't already disputed this match
        dispute_key.store(Concat(Bytes("disputed_"), Itob(match_id_dispute.load()), Bytes("_"), Txn.sender())),
        Assert(App.globalGet(dispute_key.load()) == Int(0)),
        
        # Check disputer reputation
        disputer_reputation.store(App.localGet(Txn.sender(), USER_REPUTATION)),
        Assert(disputer_reputation.load() >= App.globalGet(REPUTATION_THRESHOLD)),
        
        # Calculate dispute weight
        dispute_weight.store(disputer_reputation.load()),
        
        # Record dispute
        App.globalPut(dispute_key.load(), dispute_weight.load()),
        current_disputes.store(App.globalGet(Concat(Bytes("match_disputes_"), Itob(match_id_dispute.load())))),
        App.globalPut(Concat(Bytes("match_disputes_"), Itob(match_id_dispute.load())), current_disputes.load() + dispute_weight.load()),
        App.globalPut(Concat(Bytes("dispute_reason_"), Itob(match_id_dispute.load()), Bytes("_"), Txn.sender()), Txn.application_args[2]),
        App.globalPut(Concat(Bytes("dispute_evidence_"), Itob(match_id_dispute.load()), Bytes("_"), Txn.sender()), Txn.application_args[3]),
        
        # Mark match as disputed if significant dispute weight
        If(App.globalGet(Concat(Bytes("match_disputes_"), Itob(match_id_dispute.load()))) >= Int(200))  # Threshold for dispute
        .Then(App.globalPut(Concat(Bytes("match_status_"), Itob(match_id_dispute.load())), Bytes("disputed"))),
        
        Log(Concat(Bytes("Match disputed by: "), Txn.sender())),
        Approve()
    ])

    # --- Update User Reputation ---
    reputation_change = ScratchVar(TealType.uint64)
    new_reputation = ScratchVar(TealType.uint64)
    on_update_reputation = Seq([
        Assert(Txn.application_args.length() == Int(3)),  # target_user, reputation_change, reason
        Assert(Txn.sender() == App.globalGet(ORACLE_CREATOR)),  # Only oracle creator can update reputation
        
        reputation_change.store(Btoi(Txn.application_args[2])),
        new_reputation.store(App.localGet(Txn.application_args[1], USER_REPUTATION) + reputation_change.load()),
        
        # Ensure reputation doesn't go below 0
        If(new_reputation.load() < Int(0))
        .Then(App.localPut(Txn.application_args[1], USER_REPUTATION, Int(0)))
        .Else(App.localPut(Txn.application_args[1], USER_REPUTATION, new_reputation.load())),
        
        Log(Concat(Bytes("Reputation updated for: "), Txn.application_args[1])),
        Approve()
    ])

    # --- Main Router ---
    program = Cond(
        [Txn.application_id() == Int(0), on_create],
        [Txn.on_completion() == OnComplete.OptIn, on_opt_in],
        [Txn.on_completion() == OnComplete.NoOp,
            Cond(
                [Txn.application_args[0] == op_submit_match, on_submit_match],
                [Txn.application_args[0] == op_verify_match, on_verify_match],
                [Txn.application_args[0] == op_dispute_match, on_dispute_match],
                [Txn.application_args[0] == op_update_reputation, on_update_reputation],
            )
        ],
        [Txn.on_completion() == OnComplete.DeleteApplication,
            Seq([
                Assert(Txn.sender() == App.globalGet(ORACLE_CREATOR)),
                Approve()
            ])
        ],
        [Txn.on_completion() == OnComplete.UpdateApplication,
            Seq([
                Assert(Txn.sender() == App.globalGet(ORACLE_CREATOR)),
                Approve()
            ])
        ],
        [Int(1), Reject()]
    )
    return program

def clear_state_program():
    return Approve()

if __name__ == "__main__":
    with open("match_verification_approval.teal", "w") as f:
        compiled = compileTeal(approval_program(), Mode.Application, version=6)
        f.write(compiled)

    with open("match_verification_clear_state.teal", "w") as f:
        compiled = compileTeal(clear_state_program(), Mode.Application, version=6)
        f.write(compiled)