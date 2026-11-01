<!-- Labels: developer, repayment-percentage -->
# API: modifying repayment percentage

This design describes the intended capability to modify the repayment percentage for Pepper-Soup's Working Capital products (PPWC / EIR). In PPWC, repayments are made as a percentage of daily PayPal sales, with a configurable rate stated as 10–30%. The design purpose of the API is to allow a customer or system to adjust that percentage to influence the pace of repayment. base does not describe concrete REST endpoints, request payloads, or HTTP codes; this page documents the verified concepts, constraints, and accounting implications associated with modifying the repayment percentage. Where the design references concrete values or ledger behavior, those details are preserved verbatim.

### Conceptual scope and guarantees

- Role and boundaries: The repayment percentage is a configuration that determines how large each daily repayment is, relative to the daily PayPal sales used to service a PPWC loan. The rate is explicitly described as configurable within a range of 10% to 30%. This design documents how that configurability is intended to operate and how changes to the percentage interact with the system's repayment mechanics.
- Valid value range: The rate must lie within the inclusive range [10%, 30%]. Values outside this range constitute a guard condition described by the design. The system is expected to reject values outside this range and surface a validation error.
- Behavioral scope: The design focuses on the ability to modify the repayment percentage and the associated accounting implications. It does not define concrete REST endpoints, payload schemas, or error codes in this design-only reference. The timing and exact effects of a change on the daily payout schedule are not defined beyond the general principle that repayments are computed as a percentage of daily PayPal sales.

### Design context and responsibilities

- Domain role: The component governs PPWC repayment behavior by regulating the proportion of daily PayPal-derived cash flows that are allocated to loan repayment. This affects how quickly principal is reduced and how cash flows are allocated to fund sources and related accounts.
- Persisted configuration: The repayment percentage is a configurable value intended to influence the daily repayment calculation. The exact persistence model, schema, and update semantics are not described in this design-only reference; the emphasis is on the existence of the configurability and the constraint on its range.
- Validation and invariants: The primary invariant documented here is the rate-range constraint: 10% ≤ repayment percentage ≤ 30%. Any attempt to set a value outside that interval should fail validation, producing an error condition described in the validation guards section.

### Validation guards and preconditions

- Guard: New repayment percentage must be within the inclusive range [10%, 30%]. Any value outside this range is rejected by validation logic.
- Preconditions for updates: An update operation is allowed only if the system is in a state where repayment percentage is configurable. The design does not specify state transitions, but the update is treated as a configuration change rather than a one-off calculation.

### Behavior overview (conceptual)

- What it does: The repayment percentage determines the share of daily PayPal sales allocated to PPWC repayment. Adjusting this percentage changes the portion of daily payables directed toward loan principal (and potentially related components under the PPWC construct).
- Why it matters: A higher percentage accelerates repayment, reducing overall outstanding principal more quickly, while a lower percentage slows repayment, extending the duration of the loan while potentially affecting cash flow timing.
- What happens afterward: The updated percentage informs subsequent daily repayment calculations. The design does not specify the exact timing of recalculation relative to daily settlement, nor whether past payments are retroactively adjusted; those details are not described in this design. The primary objective documented here is to allows configuration and enforce the 10–30% constraint.

### Accounting implications (Payout refunds and adjustments)

The design references specific accounting mappings for payouts and refunds related to PPWC repayments. The following entries describe the ledger behavior associated with Payout Refund transactions on an active loan account, showing the debit and credit accounts involved, the type of fund source, and the target balance sheet line items.

#### Payout Refund Transaction Accounting entries (Cash In)

- Penalty
 - Debit: 145023 (Fund source)
 - Credit: 112603 (Penalties Receivable)
 - Mapping: Penalties Receivable (Fund source to Penalties Receivable)

- Fees
 - Debit: 145023 (Fund source)
 - Credit: 112603 (Fees Receivable)
 - Mapping: Fees Receivable (Fund source to Fees Receivable)

- Principal
 - Debit: 145023 (Fund source)
 - Credit: 112601 (Loan portfolio)
 - Mapping: Loan portfolio (Fund source to Loan portfolio)

- Unallocated Credit (UNC)
 - Debit: 145023 (Fund source)
 - Credit: 245000 (Over payment liability)
 - Mapping: Over payment liability (Fund source to Over payment liability)

- Penalty (ChargeOff Penalty) Cash In
 - Debit: 145023 (Fund source)
 - Credit: 404008 (Income from ChargeOff Penalty)
 - Mapping: Income from ChargeOff Penalty (Fund source to Income from ChargeOff Penalty)

- Fees (ChargeOff Fees) Cash In
 - Debit: 145023 (Fund source)
 - Credit: 404008 (Income from ChargeOff Fees)
 - Mapping: Income from ChargeOff Fees (Fund source to Income from ChargeOff Fees)

- Principal (ChargeOff Expense / Charge Off Fraud Expense) Cash In
 - Debit: 145023 (Fund source)
 - Credit: 744007/740037 (ChargeOff Expense / Charge Off Fraud Expense)
 - Mapping: ChargeOff Expense / Charge Off Fraud Expense (Fund source to ChargeOff Expense / Charge Off Fraud Expense)

- Unallocated Credit (UNC) Cash In
 - Debit: 245000 (Over payment liability)
 - Credit: 145023 (Fund source)
 - Mapping: Over payment liability (Over payment liability to Fund source)

#### Payout Refund Transaction Accounting entries (Cash Out)

- Penalty Cash Out
 - Debit: 112603 (Penalties Receivable)
 - Credit: 145023 (Fund source)
 - Mapping: Penalties Receivable (Fund source to Penalties Receivable)

- Fees Cash Out
 - Debit: 112603 (Fees Receivable)
 - Credit: 145023 (Fund source)
 - Mapping: Fees Receivable (Fund source to Fees Receivable)

- Principal Cash Out
 - Debit: 112601 (Loan portfolio)
 - Credit: 145023 (Fund source)
 - Mapping: Loan portfolio (Fund source to Loan portfolio)

- Unallocated Credit (UNC) Cash Out
 - Debit: 245000 (Over payment liability)
 - Credit: 145023 (Fund source)
 - Mapping: Over payment liability (Over payment liability to Fund source)

> Notes:
> - The entries above reflect the referenced ledger mappings for Payout Refund transactions on active loan accounts. The detailed partner accounts (e.g., specific fund sources and income/expense accounts) are shown as described in the reference data.
> - The data presented here is part of a design-only reference and reflects the intended accounting treatment for the Payout Refund flow. The exact runtime journal entries may differ in implementation-specific deployments.

### Return to design considerations

- Endpoints and payloads: This design-only reference does not specify REST endpoints, request schemas, or HTTP codes. It concentrates on the conceptual API capability to modify the repayment percentage, the range constraint, and the associated accounting implications.
- State and lifecycle: No explicit state machine or lifecycle transitions are defined in this design. The focus remains on the configurability, the range guard, and the reflected accounting behavior for payouts and refunds.
- Edge cases: The design notes that refunds and charge-off related entries exist in the ledger mapping. The exact handling of simultaneous updates to the repayment percentage and ongoing payout refunds is not described beyond the general ledger mappings displayed above.

### Practical takeaways for implementers

- Implementers should enforce the 10–30% range as a validation guard on any API surface intended to modify the repayment percentage.
- Any change to the repayment percentage should influence subsequent payout calculations, in line with the policy that repayments are a percentage of daily PayPal sales. The precision of calculations, day-count conventions, and real-time vs batch application are not specified in this design, so concrete implementation should follows existing PPWC scheduling logic.
- The ledger implications for payout refunds are well defined in the design data. When implementing payout refunds or reversals, verify journal entries balance according to the mapping presented above, with the standard debits and credits to fund sources and related revenue/expense or liability accounts.

If you need deeper details about how the repayment percentage interacts with daily settlement or about implementing a concrete REST API surface, those specifications would need to be provided or derived from additional design artifacts beyond the current design-only reference.