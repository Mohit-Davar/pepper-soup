# Configurable payment allocations for transactions

This feature provides advanced, transaction-type level control over how payments and credits are allocated across a loan’s repayment schedule. Configurations are defined at the loan product level and inherited by loans created from that product. Existing loans retain the allocation rules that were in effect when they were created. The mechanism supports re-processing and re-amortization behavior to accommodate changes in allocations while preserving financial integrity and accounting consistency.

### Technical role and scope

The configurable payment allocations component operates within the loan management domain, enabling per-transaction-type rules that drive how incoming funds are distributed across installments. The supported transaction types for allocation include:
- Repayment
- Goodwill credit
- Payout refunds
- Merchant refunds
- Charge adjustments
- Downpayments

A default (global) configuration exists to act as a fallback when a specific transaction type does not have an explicit configuration. When a loan is created on a product that allows the "Advanced payment allocation" feature, the product’s allocation rules are inherited by the loan. If the product later changes its rules, those changes apply only to newly created loans; existing loans continue to follow the rules that were in place at their creation.

The system supports a configurable payload that expresses the allocation intent, including both the main allocation path and the optional secondary allocation path, plus rules governing future installments.

### Core concepts and rules

- Main allocation rules determine how a payment is applied within each installment. The primary categories are defined as:
 - Past due installments
 - Due installments
 - Future installments

- Secondary allocation rules determine how any remaining allocation capacity is diverted once the primary allocations have been satisfied. Available secondary targets are:
 - Penalties
 - Fees
 - Principal
 - Interest

- Future installments can be allocated according to one of three future-installment strategies:
 - Next installment: in advance allocations go to the next installment first (based on due date)
 - Last installment: in advance allocations go to the last installment first (based on due date)
 - Reamortization: in advance allocations are divided evenly across all future installments

- Allocation rules are organized per transaction type. A transaction type entry contains a list of ordered rules (by the “order” field). A DEFAULT entry serves as the guaranteed fallback in the absence of a specific configuration for a given transaction type.

- Re-amortization and future allocations interact with principal balances and the amount paid. If the re-amortization amount would overpay the principal portion of all installments, the remaining amount is allocated to the secondary categories as defined (for example, penalties or fees if unpaid).

- When a loan is reprocessed (for example, after an allocation change or a backdated transaction), the system rebuilds the repayment schedule in chronological order using the advanced allocation strategy. This reprocessing is designed to minimize revert-replay and preserve history consistency.

- If a down payment is enabled and there are multiple disbursements, newly created installments may be excluded from recalculation until the relevant transactions have been processed, preventing premature reallocation.

- If a charge is added after repayments have occurred, prior repayments shall not be reverse-replayed as part of the reprocessing flow.

### Processing modes: horizontal vs vertical

Two processing modes govern how allocations are applied during reallocation and re-amortization:
- Horizontal processing (default): allocation rules are applied per installment in a defined order. If any installment is past due with outstanding balance, the system applies the configured rules to that installment before moving to the next. Within the installment, unpaid components (penalty, fee, interest, then principal) are addressed in the sequence defined by the main allocation rules.
- Vertical processing: allocation rules are applied across the repayment schedule, prioritizing the oldest unapplied items by their type (for example, oldest past-due penalties first, then oldest past-due fees, and so on), regardless of installment boundaries. The processing order is defined by the repayment schedule scope rather than installment scope.

A restriction exists for Horizontal processing: allocation rules must be grouped by due type (e.g., all PAST_DUE_* rules together, followed by DUE_*, then IN_ADVANCE_*). Vertical processing does not impose this grouping restriction.

### Data model and configuration (high level)

Configurable payment allocations are expressed per loan product and are inherited by loans created from that product. The configuration model includes:
- A default transaction type configuration (DEFAULT) that acts as the fallback when a specific transaction type has no explicit rule set.
- A per-transaction-type configuration entry containing:
 - A sequence of allocation rules, each with a rule identifier (e.g., PAST_DUE_PENALTY, DUE_PRINCIPAL, IN_ADVANCE_INTEREST, etc.) and an execution order.
 - A future-installment allocation rule, which can be NEXT_INSTALLMENT, LAST_INSTALLMENT, or REAMORTIZATION.
- The ability to map rule order to concrete allocation behavior, including which components (penalties, fees, principal, interest) are targeted and when.

In the product model, there is a dedicated capability to express the default behavior and per-transaction-type overrides. When a loan is created under a product configured with Advanced payment allocation, the rules are inherited for that specific loan. If the product’s rules are subsequently updated, existing loans retain their original rules; new loans adopt the updated configuration.

### Example configuration payload (UI model)

The allocation configuration is consumable as a structured payload in the system. A representative payload segment for the default transaction type is shown below:

```json
{
 "payment_allocation": [
 {
 "transaction_type": "DEFAULT",
 "payment_allocation_order": [
 { "payment_allocation_rule": "DUE_PAST_PENALTY", "order": 1 },
 { "payment_allocation_rule": "DUE_PAST_FEE", "order": 2 },
 { "payment_allocation_rule": "DUE_PAST_INTEREST", "order": 3 },
 { "payment_allocation_rule": "DUE_PAST_PRINCIPAL", "order": 4 },
 { "payment_allocation_rule": "IN_ADVANCE_PENALTY", "order": 5 },
 { "payment_allocation_rule": "IN_ADVANCE_FEE", "order": 6 },
 { "payment_allocation_rule": "IN_ADVANCE_INTEREST", "order": 7 },
 { "payment_allocation_rule": "IN_ADVANCE_PRINCIPAL", "order": 8 }
 ],
 "future_installment_allocation_rule": "NEXT_INSTALLMENT"
 }
 ]
}
```

This example demonstrates a DEFAULT transaction type configuration with an ordered sequence for main (past-due, due, and advance) components and a future-installment rule set to NEXT_INSTALLMENT. The payload is representative of the design described in the feature specification and illustrates how a consumer would express the intended allocation behavior in a production scenario.
```

<div class="param-grid">
 <div class="param-card">
 <span class="param-label">Default transaction type</span>
 <span class="param-value">DEFAULT</span>
 </div>
 <div class="param-card">
 <span class="param-label">Future installment rule</span>
 <span class="param-value">NEXT_INSTALLMENT</span>
 </div>
</div>

### What happens at runtime (summary of processing flow)

1. When a loan product is configured with Advanced payment allocation, the product rules are inherited by new loans created from that product.
2. A loan’s repayment schedule is established according to the loan’s terms and effective allocation rules.
3. On a payment-related event (repayment, goodwill credit, refunds, downpayments, or a charge adjustment), the system determines the applicable allocation path from the transaction-type configuration (or DEFAULT if none is specified).
4. The allocation proceeds according to the active mode (Horizontal or Vertical). If a re-amortization condition is reached (for example, an N+1 installment exists and future-installment allocation is REAMORTIZATION), the repayment schedule is rebuilt to distribute the designated amount evenly across future installments, with principal portions affected per the defined rules.
5. If the re-amortization amount would over-allocate the principal across all installments, any remaining amount is directed to the defined secondary allocations (e.g., penalties or fees).
6. If a down payment or charge is introduced after repayments have occurred, the reprocessing logic adheres to the chronology and selective replays described by the advanced strategy to minimize reverted repayments.
7. Existing loans maintain their allocation behavior; only new loans created after a configuration change adopt the updated rules.

### Calculation context and illustrative example

The reference scenarios in the payment-allocation guidance include straightforward, installment-based schedules that show how allocations apply across simple and complex cases. Consider a simple loan scenario with a single disbursement of 500 and four installments of 125 each. A down payment of 125 reduces the outstanding balance to

375. A payment of 125 on the first due date reduces the first installment balance to 250; subsequent payments then reduce the remaining installments in sequence, matching the simple amortization expected for a constant-principal repayment plan. This basic illustration follows the reference UC01 dataset, where the installation schedule evolves as payments are applied against the principal balance across installments.

The reference material also contains complex use cases for overpayments, refunds, and protracted adjustments (UC02–UC25). These cases demonstrate how the allocation engine handles overpayments by routing excess amounts to future installments, how refunds are re-amortized across past due and upcoming installments, and how partial refunds interact with both past-due and due installments under different future-installment strategies. Where the schedules and outcomes are specified, the numbers reflect exact behavior documented in those scenarios; figures should be consulted directly in the reference material for precise traces in each case.

### Diagram: processing flow (overview)

flowchart TD
 A[Loan product configured with Advanced payment allocation] --> B[Create loan instance (inherit rules)]
 B --> C[Establish repayment schedule]
 C --> D[Receive transaction event (payment, refund, goodwill, downpayment, charge)]
 D --> E{Current mode}
 E -->|Horizontal| F[Apply main allocation rules per installment in order; address penalties, fees, interest, principal by due type]
 E -->|Vertical| G[Apply allocation across repayment schedule by oldest due type first]
 F --> H[Check for re-amortization trigger]
 G --> H
 H --> I{Re-amortization applicable?}
 I -->|Yes| J[Rebuild schedule across future installments; allocate principal portion per future-installment rule; apply secondary rules if needed]
 I -->|No| K[Commit allocations; update balances and GL postings as available]
 J --> K

### Precautions and edge cases

- Inheritance behavior: allocation rules defined on a loan product apply to new loans created from that product; changes to the product rules do not retroactively alter existing loans.
- Re-amortization scope: when activated, it can include an N+1 installment; the amount is distributed across future installments according to the future-installment allocation rule. If the re-amortization amount over-allocates the principal portion, the remainder is allocated per the secondary allocation rules.
- Chronological reprocessing: the advanced strategy reprocesses transactions in chronological order to rebuild the schedule while preserving historical movements and preventing inconsistent histories.
- Down payments: a down payment can affect which installments are subjected to recalculation; the strategy may exclude certain new installments from immediate recalculation until their triggering transactions are processed.
- Existing loans vs new loans: only loans created after the product’s advanced-allocation configuration adopt the updated rules; existing loans retain their original behavior.
- Reverse replay and reallocation: future allocations already applied to installments do not retroactively change during reverse replay; the system focuses on chronological reprocessing to minimize disruption.

### Key terms reference

- DEFAULT: the fallback transaction-type configuration when a specific transaction type lacks an explicit rule set.
- NEXT_INSTALLMENT, LAST_INSTALLMENT, REAMORTIZATION: future installment strategies. NEXT_INSTALLMENT allocates to the next installment first; LAST_INSTALLMENT allocates to the last installment first; REAMORTIZATION distributes the advance amount evenly across all future installments.
- PAST_DUE_* and DUE_* categories: labels used by main allocation rules to indicate target portions (penalties, fees, interest, principal) for past due or due installments.
- IN_ADVANCE_* categories: labels used to indicate target portions (penalties, fees, interest, principal) for installments in advance of their due dates.

The Configurable payment allocations for transactions feature allows lenders to tailor how funds are applied to loans on a per-transaction-type basis, with a fallback default, and with flexible handling of future installments. It supports dynamic reallocation behavior through an advanced repayment strategy, including re-amortization and selective reprocessing to accommodate real-world scenarios such as late payments, refunds, goodwill credits, and downpayments, while preserving prior loan histories.