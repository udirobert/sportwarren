from pyteal import *

def approval_program():
    # Global state keys
    SYSTEM_CREATOR = Bytes("system_creator")
    REPUTATION_TOKEN_ID = Bytes("reputation_token_id")
    SKILL_TOKEN_ID = Bytes("skill_token_id")
    TOTAL_PLAYERS = Bytes("total_players")
    VERIFICATION_THRESHOLD = Bytes("verification_threshold")
    
    # Local state keys
    PLAYER_REPUTATION = Bytes("player_reputation")
    PLAYER_SKILL_POINTS = Bytes("player_skill_points")
    VERIFICATION_COUNT = Bytes("verification_count")
    ENDORSEMENT_COUNT = Bytes("endorsement_count")
    PROFESSIONAL_SCORE = Bytes("professional_score")
    
    # Operations
    op_create_tokens = Bytes("create_tokens")
    op_opt_in_player = Bytes("opt_in_player")
    op_update_skill = Bytes("update_skill")
    op_endorse_player = Bytes("endorse_player")
    op_verify_achievement = Bytes("verify_achievement")
    op_professional_scout = Bytes("professional_scout")
    op_transfer_reputation = Bytes("transfer_reputation")

    # --- On Creation of the Application ---
    on_create = Seq([
        Assert(Txn.application_id() == Int(0)),
        App.globalPut(SYSTEM_CREATOR, Txn.sender()),
        App.globalPut(TOTAL_PLAYERS, Int(0)),
        App.globalPut(VERIFICATION_THRESHOLD, Int(3)),  # Minimum verifications for skill updates
        
        # Create Reputation Token (REP)
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.AssetConfig,
            TxnField.config_asset_total: Int(1000000000),  # 1 billion tokens
            TxnField.config_asset_decimals: Int(6),
            TxnField.config_asset_unit_name: Bytes("REP"),
            TxnField.config_asset_name: Bytes("SportWarren Reputation"),
            TxnField.config_asset_manager: Global.current_application_address(),
            TxnField.config_asset_reserve: Global.current_application_address(),
            TxnField.config_asset_freeze: Global.current_application_address(),
            TxnField.config_asset_clawback: Global.current_application_address(),
            TxnField.fee: Int(0),
        }),
        InnerTxnBuilder.Submit(),
        App.globalPut(REPUTATION_TOKEN_ID, InnerTxn.created_asset_id()),
        
        # Create Skill Token (SKILL)
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.AssetConfig,
            TxnField.config_asset_total: Int(1000000000),  # 1 billion tokens
            TxnField.config_asset_decimals: Int(6),
            TxnField.config_asset_unit_name: Bytes("SKILL"),
            TxnField.config_asset_name: Bytes("SportWarren Skill Points"),
            TxnField.config_asset_manager: Global.current_application_address(),
            TxnField.config_asset_reserve: Global.current_application_address(),
            TxnField.config_asset_freeze: Global.current_application_address(),
            TxnField.config_asset_clawback: Global.current_application_address(),
            TxnField.fee: Int(0),
        }),
        InnerTxnBuilder.Submit(),
        App.globalPut(SKILL_TOKEN_ID, InnerTxn.created_asset_id()),
        
        Approve()
    ])

    # --- On Opt-in to the Application ---
    on_opt_in = Seq([
        Assert(Txn.application_args.length() == Int(0)),
        App.localPut(Txn.sender(), PLAYER_REPUTATION, Int(1000)),  # Starting reputation: 1000
        App.localPut(Txn.sender(), PLAYER_SKILL_POINTS, Int(0)),
        App.localPut(Txn.sender(), VERIFICATION_COUNT, Int(0)),
        App.localPut(Txn.sender(), ENDORSEMENT_COUNT, Int(0)),
        App.localPut(Txn.sender(), PROFESSIONAL_SCORE, Int(0)),
        
        # Opt player into reputation token
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.AssetTransfer,
            TxnField.xfer_asset: App.globalGet(REPUTATION_TOKEN_ID),
            TxnField.asset_receiver: Txn.sender(),
            TxnField.asset_amount: Int(1000000),  # 1000 REP tokens (with 6 decimals)
            TxnField.sender: Global.current_application_address(),
            TxnField.fee: Int(0),
        }),
        InnerTxnBuilder.Submit(),
        
        # Opt player into skill token
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.AssetTransfer,
            TxnField.xfer_asset: App.globalGet(SKILL_TOKEN_ID),
            TxnField.asset_receiver: Txn.sender(),
            TxnField.asset_amount: Int(0),  # Start with 0 skill points
            TxnField.sender: Global.current_application_address(),
            TxnField.fee: Int(0),
        }),
        InnerTxnBuilder.Submit(),
        
        App.globalPut(TOTAL_PLAYERS, App.globalGet(TOTAL_PLAYERS) + Int(1)),
        Approve()
    ])

    # --- Update Player Skill ---
    skill_category = ScratchVar(TealType.bytes)
    skill_rating = ScratchVar(TealType.uint64)
    verifier_count = ScratchVar(TealType.uint64)
    skill_points_earned = ScratchVar(TealType.uint64)
    on_update_skill = Seq([
        Assert(Txn.application_args.length() == Int(4)),  # skill_category, rating, verifier_address, evidence_hash
        skill_category.store(Txn.application_args[1]),
        skill_rating.store(Btoi(Txn.application_args[2])),
        Assert(skill_rating.load() >= Int(0)),
        Assert(skill_rating.load() <= Int(100)),
        
        # Store skill rating
        App.localPut(Txn.sender(), Concat(Bytes("skill_"), skill_category.load()), skill_rating.load()),
        App.localPut(Txn.sender(), Concat(Bytes("skill_verified_"), skill_category.load()), Global.latest_timestamp()),
        App.localPut(Txn.sender(), Concat(Bytes("skill_verifier_"), skill_category.load()), Txn.application_args[3]),
        App.localPut(Txn.sender(), Concat(Bytes("skill_evidence_"), skill_category.load()), Txn.application_args[4]),
        
        # Calculate skill points earned (rating * 10)
        skill_points_earned.store(skill_rating.load() * Int(10)),
        App.localPut(Txn.sender(), PLAYER_SKILL_POINTS, App.localGet(Txn.sender(), PLAYER_SKILL_POINTS) + skill_points_earned.load()),
        
        # Award skill tokens
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.AssetTransfer,
            TxnField.xfer_asset: App.globalGet(SKILL_TOKEN_ID),
            TxnField.asset_receiver: Txn.sender(),
            TxnField.asset_amount: skill_points_earned.load() * Int(1000),  # Convert to token units
            TxnField.sender: Global.current_application_address(),
            TxnField.fee: Int(0),
        }),
        InnerTxnBuilder.Submit(),
        
        Log(Concat(Bytes("Skill updated: "), skill_category.load(), Bytes(" = "), Itob(skill_rating.load()))),
        Approve()
    ])

    # --- Endorse Player ---
    endorser_reputation = ScratchVar(TealType.uint64)
    endorsement_weight = ScratchVar(TealType.uint64)
    reputation_bonus = ScratchVar(TealType.uint64)
    on_endorse_player = Seq([
        Assert(Txn.application_args.length() == Int(4)),  # target_player, skill_category, rating, comment_hash
        Assert(Txn.sender() != Txn.application_args[1]),  # Can't endorse yourself
        
        # Check endorser reputation
        endorser_reputation.store(App.localGet(Txn.sender(), PLAYER_REPUTATION)),
        Assert(endorser_reputation.load() >= Int(500)),  # Minimum reputation to endorse
        
        # Calculate endorsement weight based on endorser reputation
        endorsement_weight.store(endorser_reputation.load() / Int(100)),
        
        # Store endorsement
        App.globalPut(
            Concat(Bytes("endorsement_"), Txn.application_args[1], Bytes("_"), Txn.application_args[2], Bytes("_"), Txn.sender()),
            Concat(Itob(Btoi(Txn.application_args[3])), Bytes("_"), Itob(Global.latest_timestamp()), Bytes("_"), Txn.application_args[4])
        ),
        
        # Update endorsement count for target player
        App.localPut(Txn.application_args[1], ENDORSEMENT_COUNT, App.localGet(Txn.application_args[1], ENDORSEMENT_COUNT) + Int(1)),
        
        # Award reputation bonus to target player
        reputation_bonus.store(endorsement_weight.load() * Int(5)),
        App.localPut(Txn.application_args[1], PLAYER_REPUTATION, App.localGet(Txn.application_args[1], PLAYER_REPUTATION) + reputation_bonus.load()),
        
        # Award reputation tokens to target player
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.AssetTransfer,
            TxnField.xfer_asset: App.globalGet(REPUTATION_TOKEN_ID),
            TxnField.asset_receiver: Txn.application_args[1],
            TxnField.asset_amount: reputation_bonus.load() * Int(1000),  # Convert to token units
            TxnField.sender: Global.current_application_address(),
            TxnField.fee: Int(0),
        }),
        InnerTxnBuilder.Submit(),
        
        Log(Concat(Bytes("Player endorsed: "), Txn.application_args[1])),
        Approve()
    ])

    # --- Verify Achievement ---
    achievement_points = ScratchVar(TealType.uint64)
    rarity_multiplier = ScratchVar(TealType.uint64)
    on_verify_achievement = Seq([
        Assert(Txn.application_args.length() == Int(4)),  # player_address, achievement_id, rarity, evidence_hash
        Assert(Txn.sender() == App.globalGet(SYSTEM_CREATOR)),  # Only system creator can verify achievements
        
        # Calculate points based on rarity (1=common, 2=rare, 3=epic, 4=legendary)
        rarity_multiplier.store(Btoi(Txn.application_args[3])),
        achievement_points.store(Int(100) * rarity_multiplier.load()),
        
        # Store achievement
        App.globalPut(
            Concat(Bytes("achievement_"), Txn.application_args[1], Bytes("_"), Txn.application_args[2]),
            Concat(Itob(Global.latest_timestamp()), Bytes("_"), Txn.application_args[3], Bytes("_"), Txn.application_args[4])
        ),
        
        # Award reputation and skill points
        App.localPut(Txn.application_args[1], PLAYER_REPUTATION, App.localGet(Txn.application_args[1], PLAYER_REPUTATION) + achievement_points.load()),
        App.localPut(Txn.application_args[1], PLAYER_SKILL_POINTS, App.localGet(Txn.application_args[1], PLAYER_SKILL_POINTS) + achievement_points.load()),
        
        # Award tokens
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.AssetTransfer,
            TxnField.xfer_asset: App.globalGet(REPUTATION_TOKEN_ID),
            TxnField.asset_receiver: Txn.application_args[1],
            TxnField.asset_amount: achievement_points.load() * Int(1000),
            TxnField.sender: Global.current_application_address(),
            TxnField.fee: Int(0),
        }),
        InnerTxnBuilder.Submit(),
        
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.AssetTransfer,
            TxnField.xfer_asset: App.globalGet(SKILL_TOKEN_ID),
            TxnField.asset_receiver: Txn.application_args[1],
            TxnField.asset_amount: achievement_points.load() * Int(1000),
            TxnField.sender: Global.current_application_address(),
            TxnField.fee: Int(0),
        }),
        InnerTxnBuilder.Submit(),
        
        Log(Concat(Bytes("Achievement verified: "), Txn.application_args[2])),
        Approve()
    ])

    # --- Professional Scout Interest ---
    scout_rating = ScratchVar(TealType.uint64)
    professional_bonus = ScratchVar(TealType.uint64)
    on_professional_scout = Seq([
        Assert(Txn.application_args.length() == Int(4)),  # player_address, scout_organization, interest_level, notes_hash
        Assert(Txn.sender() == App.globalGet(SYSTEM_CREATOR)),  # Only verified scouts can register interest
        
        # Calculate professional score bonus based on interest level (1=watching, 2=interested, 3=very_interested)
        scout_rating.store(Btoi(Txn.application_args[3])),
        professional_bonus.store(scout_rating.load() * Int(500)),
        
        # Store scout interest
        App.globalPut(
            Concat(Bytes("scout_interest_"), Txn.application_args[1], Bytes("_"), Txn.sender()),
            Concat(Txn.application_args[2], Bytes("_"), Itob(scout_rating.load()), Bytes("_"), Itob(Global.latest_timestamp()), Bytes("_"), Txn.application_args[4])
        ),
        
        # Update professional score
        App.localPut(Txn.application_args[1], PROFESSIONAL_SCORE, App.localGet(Txn.application_args[1], PROFESSIONAL_SCORE) + professional_bonus.load()),
        
        # Award reputation bonus
        App.localPut(Txn.application_args[1], PLAYER_REPUTATION, App.localGet(Txn.application_args[1], PLAYER_REPUTATION) + professional_bonus.load()),
        
        # Award reputation tokens
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.AssetTransfer,
            TxnField.xfer_asset: App.globalGet(REPUTATION_TOKEN_ID),
            TxnField.asset_receiver: Txn.application_args[1],
            TxnField.asset_amount: professional_bonus.load() * Int(1000),
            TxnField.sender: Global.current_application_address(),
            TxnField.fee: Int(0),
        }),
        InnerTxnBuilder.Submit(),
        
        Log(Concat(Bytes("Professional interest registered for: "), Txn.application_args[1])),
        Approve()
    ])

    # --- Transfer Reputation (Portable Identity) ---
    transfer_amount = ScratchVar(TealType.uint64)
    on_transfer_reputation = Seq([
        Assert(Txn.application_args.length() == Int(2)),  # recipient_address, amount
        transfer_amount.store(Btoi(Txn.application_args[2])),
        Assert(App.localGet(Txn.sender(), PLAYER_REPUTATION) >= transfer_amount.load()),
        
        # Transfer reputation points
        App.localPut(Txn.sender(), PLAYER_REPUTATION, App.localGet(Txn.sender(), PLAYER_REPUTATION) - transfer_amount.load()),
        App.localPut(Txn.application_args[1], PLAYER_REPUTATION, App.localGet(Txn.application_args[1], PLAYER_REPUTATION) + transfer_amount.load()),
        
        # Transfer reputation tokens
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.AssetTransfer,
            TxnField.xfer_asset: App.globalGet(REPUTATION_TOKEN_ID),
            TxnField.asset_sender: Txn.sender(),
            TxnField.asset_receiver: Txn.application_args[1],
            TxnField.asset_amount: transfer_amount.load() * Int(1000),
            TxnField.fee: Int(0),
        }),
        InnerTxnBuilder.Submit(),
        
        Log(Concat(Bytes("Reputation transferred: "), Itob(transfer_amount.load()))),
        Approve()
    ])

    # --- Main Router ---
    program = Cond(
        [Txn.application_id() == Int(0), on_create],
        [Txn.on_completion() == OnComplete.OptIn, on_opt_in],
        [Txn.on_completion() == OnComplete.NoOp,
            Cond(
                [Txn.application_args[0] == op_update_skill, on_update_skill],
                [Txn.application_args[0] == op_endorse_player, on_endorse_player],
                [Txn.application_args[0] == op_verify_achievement, on_verify_achievement],
                [Txn.application_args[0] == op_professional_scout, on_professional_scout],
                [Txn.application_args[0] == op_transfer_reputation, on_transfer_reputation],
            )
        ],
        [Txn.on_completion() == OnComplete.DeleteApplication,
            Seq([
                Assert(Txn.sender() == App.globalGet(SYSTEM_CREATOR)),
                Approve()
            ])
        ],
        [Txn.on_completion() == OnComplete.UpdateApplication,
            Seq([
                Assert(Txn.sender() == App.globalGet(SYSTEM_CREATOR)),
                Approve()
            ])
        ],
        [Int(1), Reject()]
    )
    return program

def clear_state_program():
    return Approve()

if __name__ == "__main__":
    with open("reputation_system_approval.teal", "w") as f:
        compiled = compileTeal(approval_program(), Mode.Application, version=6)
        f.write(compiled)

    with open("reputation_system_clear_state.teal", "w") as f:
        compiled = compileTeal(clear_state_program(), Mode.Application, version=6)
        f.write(compiled)