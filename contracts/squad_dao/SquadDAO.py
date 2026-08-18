from pyteal import *

def approval_program():
    # Global state keys
    DAO_CREATOR = Bytes("creator")
    GOVERNANCE_TOKEN_ID = Bytes("governance_token_id")
    PROPOSAL_COUNTER = Bytes("proposal_counter")

    # Local state keys
    USER_TOKEN_BALANCE = Bytes("user_token_balance")

    # Operations
    op_create_dao = Bytes("create_dao")
    op_opt_in = Bytes("opt_in")
    op_create_proposal = Bytes("create_proposal")
    op_vote = Bytes("vote")
    op_execute_proposal = Bytes("execute_proposal")

    # --- On Creation of the Application ---
    on_create = Seq([
        Assert(Txn.application_id() == Int(0)),
        App.globalPut(DAO_CREATOR, Txn.sender()),
        App.globalPut(PROPOSAL_COUNTER, Int(0)),
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.AssetConfig,
            TxnField.config_asset_total: Int(1000000),
            TxnField.config_asset_decimals: Int(0),
            TxnField.config_asset_unit_name: Bytes("SDAO"),
            TxnField.config_asset_name: Bytes("SquadDAO Token"),
            TxnField.config_asset_manager: Global.current_application_address(),
            TxnField.config_asset_reserve: Global.current_application_address(),
            TxnField.config_asset_freeze: Global.current_application_address(),
            TxnField.config_asset_clawback: Global.current_application_address(),
            TxnField.fee: Int(0),
        }),
        InnerTxnBuilder.Submit(),
        App.globalPut(GOVERNANCE_TOKEN_ID, InnerTxn.created_asset_id()),
        Approve()
    ])

    # --- On Opt-in to the Application ---
    on_opt_in = Seq([
        Assert(Txn.application_args.length() == Int(0)),
        App.localPut(Txn.sender(), USER_TOKEN_BALANCE, Int(0)),
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.AssetTransfer,
            TxnField.xfer_asset: App.globalGet(GOVERNANCE_TOKEN_ID),
            TxnField.asset_receiver: Txn.sender(),
            TxnField.asset_amount: Int(100),
            TxnField.sender: Global.current_application_address(),
            TxnField.fee: Int(0),
        }),
        InnerTxnBuilder.Submit(),
        Approve()
    ])

    # --- Create Proposal ---
    proposal_id_create = ScratchVar(TealType.uint64)
    on_create_proposal = Seq([
        Assert(Txn.application_args.length() == Int(3)),
        Assert(App.localGet(Txn.sender(), USER_TOKEN_BALANCE) > Int(0)),
        App.globalPut(PROPOSAL_COUNTER, App.globalGet(PROPOSAL_COUNTER) + Int(1)),
        proposal_id_create.store(App.globalGet(PROPOSAL_COUNTER)),
        App.globalPut(Concat(Bytes("prop_desc_"), Itob(proposal_id_create.load())), Txn.application_args[0]),
        App.globalPut(Concat(Bytes("prop_start_"), Itob(proposal_id_create.load())), Btoi(Txn.application_args[1])),
        App.globalPut(Concat(Bytes("prop_end_"), Itob(proposal_id_create.load())), Btoi(Txn.application_args[2])),
        App.globalPut(Concat(Bytes("prop_for_"), Itob(proposal_id_create.load())), Int(0)),
        App.globalPut(Concat(Bytes("prop_against_"), Itob(proposal_id_create.load())), Int(0)),
        Approve()
    ])

    # --- Vote on Proposal ---
    proposal_id_vote = ScratchVar(TealType.uint64)
    vote_type_vote = ScratchVar(TealType.uint64)
    voting_power_vote = ScratchVar(TealType.uint64)
    voted_key = ScratchVar(TealType.bytes)
    on_vote = Seq([
        Assert(Txn.application_args.length() == Int(2)),
        proposal_id_vote.store(Btoi(Txn.application_args[0])),
        vote_type_vote.store(Btoi(Txn.application_args[1])),
        Assert(App.localGet(Txn.sender(), USER_TOKEN_BALANCE) > Int(0)),
        Assert(App.globalGet(Concat(Bytes("prop_start_"), Itob(proposal_id_vote.load()))) != Int(0)),
        Assert(Global.round() >= App.globalGet(Concat(Bytes("prop_start_"), Itob(proposal_id_vote.load())))),
        Assert(Global.round() <= App.globalGet(Concat(Bytes("prop_end_"), Itob(proposal_id_vote.load())))),
        voted_key.store(Concat(Bytes("voted_on_"), Itob(proposal_id_vote.load()))),
        Assert(App.localGet(Txn.sender(), voted_key.load()) == Int(0)),
        voting_power_vote.store(App.localGet(Txn.sender(), USER_TOKEN_BALANCE)),
        If(vote_type_vote.load() == Int(1))
        .Then(App.globalPut(Concat(Bytes("prop_for_"), Itob(proposal_id_vote.load())), App.globalGet(Concat(Bytes("prop_for_"), Itob(proposal_id_vote.load()))) + voting_power_vote.load()))
        .Else(App.globalPut(Concat(Bytes("prop_against_"), Itob(proposal_id_vote.load())), App.globalGet(Concat(Bytes("prop_against_"), Itob(proposal_id_vote.load()))) + voting_power_vote.load())),
        App.localPut(Txn.sender(), Concat(Bytes("voted_on_"), Itob(proposal_id_vote.load())), Int(1)),
        Approve()
    ])

    # --- Execute Proposal ---
    proposal_id_execute = ScratchVar(TealType.uint64)
    votes_for_execute = ScratchVar(TealType.uint64)
    votes_against_execute = ScratchVar(TealType.uint64)
    on_execute_proposal = Seq([
        Assert(Txn.application_args.length() == Int(1)),
        proposal_id_execute.store(Btoi(Txn.application_args[0])),
        Assert(App.globalGet(Concat(Bytes("prop_end_"), Itob(proposal_id_execute.load()))) != Int(0)),
        Assert(Global.round() > App.globalGet(Concat(Bytes("prop_end_"), Itob(proposal_id_execute.load())))),
        votes_for_execute.store(App.globalGet(Concat(Bytes("prop_for_"), Itob(proposal_id_execute.load())))),
        votes_against_execute.store(App.globalGet(Concat(Bytes("prop_against_"), Itob(proposal_id_execute.load())))),
        Assert(votes_for_execute.load() > votes_against_execute.load()),
        App.globalPut(Concat(Bytes("prop_executed_"), Itob(proposal_id_execute.load())), Int(1)),
        Log(Bytes("Proposal executed successfully!")),
        Approve()
    ])

    # --- Main Router ---
    program = Cond(
        [Txn.application_id() == Int(0), on_create],
        [Txn.on_completion() == OnComplete.OptIn, on_opt_in],
        [Txn.on_completion() == OnComplete.NoOp,
            Cond(
                [Txn.application_args[0] == op_create_proposal, on_create_proposal],
                [Txn.application_args[0] == op_vote, on_vote],
                [Txn.application_args[0] == op_execute_proposal, on_execute_proposal],
            )
        ],
        [Txn.on_completion() == OnComplete.DeleteApplication,
            Seq([
                Assert(Txn.sender() == App.globalGet(DAO_CREATOR)),
                Approve()
            ])
        ],
        [Txn.on_completion() == OnComplete.UpdateApplication,
            Seq([
                Assert(Txn.sender() == App.globalGet(DAO_CREATOR)),
                Approve()
            ])
        ],
        [Int(1), Reject()]
    )
    return program

def clear_state_program():
    return Approve()

if __name__ == "__main__":
    with open("squad_dao_approval.teal", "w") as f:
        compiled = compileTeal(approval_program(), Mode.Application, version=6)
        f.write(compiled)

    with open("squad_dao_clear_state.teal", "w") as f:
        compiled = compileTeal(clear_state_program(), Mode.Application, version=6)
        f.write(compiled)