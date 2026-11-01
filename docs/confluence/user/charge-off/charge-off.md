<!-- Labels: user, charge-off -->
# Charge-off

Charge-off is a formal accounting and servicing state that applies when a loan churns and the collection of the outstanding amount becomes unlikely. In this state, the loan is treated as uncollectible and is effectively frozen; no regular instalment activity is expected, though the system may continue to record recoveries, goodwill adjustments, or other post-charge-off activities as defined by the product’s accounting mappings. This page documents the verified behavior, the business purpose, the user roles that benefit, and the observable outcomes when charge-off occurs.

### Business purpose and beneficiary roles

Charge-off serves two primary purposes. First, it aligns the loan’s operational status with its expected financial outcome, preventing further accruals or postings against a debt that is not expected to be recovered. Second, it triggers the standard accounting treatment across principal, interest, and fees to reflect the loss in the financial statements while preserving traceability of subsequent recoveries or adjustments.

The following roles benefit from clear, predictable charge-off behavior:

- Operations staff: accurate loan statuses and disciplined handling of uncollectible exposures.
- Loan officers and credit agents: consistent rules for when and how a loan is charged off and how subsequent recoveries flow back into accounting.
- Branch managers: assurance that charged-off loans do not appear in normal repayment workflows and that post-charge-off activity remains auditable.
- Finance and accounting teams: standardized postings to the standard asset, liability, and income/expense accounts, with explicit rules for fraud and non-fraud charge-offs.

### When charge-off occurs and what changes

A loan is charged off when collection of the outstanding amount is assessed as not likely. Upon charge-off, the loan enters a frozen state, and the system marks it as charged off. The primary observable changes are:

- The loan’s status is updated to reflect a charge-off condition and, in operating terms, the loan is treated as non-revolving from the standard repayment perspective.
- The system routes subsequent postings to charge-off accounting paths rather than standard repayment allocations. This separation preserves the integrity of income recognition and loss reporting.
- Two distinct categories govern charge-off mappings: Fraud-related charge-offs and Non-Fraud charge-offs, each with its own accounting treatment in the mapping rules.

The product uses explicit mappings to determine which accounts are affected by each portion of the charge-off (principal, interest, and fees) and whether the entries relate to fraud or non-fraud scenarios. The accounting mapping is implemented via dedicated ledger relationships that hook into the loan’s life cycle when the charge-off event is triggered.

### The charge-off event and its triggering behavior

A formal charge-off event is raised as part of the loan’s lifecycle when the system determines that collection is no longer probable. Once this event occurs, an event-driven transition occurs in the servicing layer, and the associated accounting entries are prepared according to the charge-off mappings. The event is defined as an occurrence that must trigger the charge-off accounting flows and the loan’s frozen state.

In addition to the immediate write-off, the system maintains the capability to record recoveries and goodwill adjustments post-charge-off as detailed in the accounting mappings. The sources describe both fraud and non-fraud charge-off patterns and specify how the principal, interest, and fees are moved between asset, revenue, and expense/contra accounts.

### Time-respective repayment strategy and charge-off context

The product supports a time-respective repayment strategy that governs how funds are allocated when repayments and charges occur during or after charge-off. The core principle is that fees and other charges added to the loan are paid by payments associated with the loan only when the payment is created after the fee’s due date. This strategy also governs how repayments are distributed across the loan’s installments when a charge-off is in effect or when the system recomputes installment balances due to reverse/replay of transactions and charges.

Key rule: fees that are part of the instalment must be paid by a payment created after the fee’s due date. The strategy also defines the order in which amounts are allocated when a repayment transaction occurs and the loan’s schedule requires reallocation due to charge additions or payment reversals.

The current behavior (as evidenced by the reference material) makes the repayment allocation follow a defined priority order. When a repayment is posted, the system distributes the amount according to the target repayment installment and the following priority sequence:

- Due charges
- In-advance principal
- Penalty
- Fee
- Interest
- Principal

The reverse-replay logic reprocesses transactions when charges or repayments change the installment balances. If a new charge is added (or a payment is reversed), the system recalculates installments from the first disbursement and re-distributes repayments to reflect the updated balances. If a transaction predates a change in balances, the original transaction can be reversed and replayed with the same properties but with updated balances.

The following sections illustrate how these rules play out in concrete scenarios.

### Calculation references and accounting patterns (summary)

The product provides explicit reference mappings for charge-off accounting, including separate treatment for Fraud and Non-Fraud charge-offs across principal, interest, and fees. The core ledger accounts implicated in the charge-off mappings include asset accounts (Loans Receivable, Fee Receivable, Other Receivables), suspense/clearing accounts, and revenue/expense accounts (Credit Loss/Bad Debt, Charge-off expense, Interest income charge off, Fee Income, and related goodwill or recoveries accounts).

- Principal portions: the system reduces the Loans Receivable balance and recognizes a charge-off expense against Credit Loss/Bad Debt (or Fraud variant) as standard. The principal write-off moves the asset to a associated expense line, reflecting the loss on the loan.
- Interest portions: interest receivable is reclassified into an income-offsetting charge-off entry (Interest income charge off) with a associated adjustment to the related receivable balances.
- Fees portions: fee-related receivables are written off against fee-related charge-off income lines and allowances, with the remainder allocated to the related revenue/expense accounts per the fraud vs non-fraud pattern.

 These rules are implemented in the charge-off accounting mappings and the chart of accounts (COA) that define the GL accounts and their types for each category. The COA identifies the accounts used for:

- Loans Receivable (Asset)
- Fee Receivable (Asset)
- Suspense/Clearing account (Suspense/clearing)
- Other Credit liability (Liability)
- Principal balance adjustment (Expense)
- Interest income charge off (Income)
- Fee Income (Income)
- Credit Loss/Bad Debt (Expense)
- Credit Loss/Bad Debt Fraud (Expense)
- Recoveries (Expense)
- Goodwill-related entries ()

For practitioners, the core takeaway is that charge-off events trigger write-offs against the principal balance first, followed by associated adjustments to interest and fees, with the resulting impact posted to the standard expense or income accounts as dictated by the fraud/non-fraud categorization.

### Worked examples: post-charge-off scenarios (highlights)

The product includes post-charge-off scenario tables that illustrate how balances and postings evolve across several scenarios, including reverse and replay dynamics. The following succinct summaries capture the essence of the scenarios without reproducing every column:

- Scenario S-1 (Scheduled Pmt Rev) demonstrates a charge-off event after a sequence of transactions, including a charge-off entry for fraud and a subsequent reversal and replay of the charge-off. The example shows how the system tracks principal, penalties, fees, and the overall loan balance as it moves through disbursement, snooze, and charge-off-related activities.
- Scenario S-2 Realtime Pmt Rev and Scenario S-3 Auto Pay Pmt Rev illustrate how real-time and auto-pay repayments interact with late charges and charge-off events, including how balance reconciliation occurs when a charge-off occurs and how repayments may be allocated to charge-off-related components.
- Scenario S-4 OCA Repayment Rev and Scenario S-5 GoodwillCredit-back dated demonstrate how recovery-related activities and goodwill entries can interface with charge-off accounting, including recoveries and goodwill adjustments after a charge-off.

In all scenarios, the essential pattern is that the charge-off operation leads to adjustments across principal, interest, and fees, and these adjustments are recorded against the standard expense and revenue accounts, with the Loans Receivable balance reduced . The exact journal entries depend on whether the charge-off is categorized as Fraud or Non-Fraud and on the specific component (principal, interest, fees) being charged off.

<div class="calc-box">
 <div class="calc-title">Calculation</div>
 <div class="calc-step"><strong>Formula:</strong> For a charge-off event, apply the following order to reallocate the loan’s remaining balances: principal write-off, then interest write-off, then fees write-off, and reflect each movement in the associated Ledger Accounts as per the charge-off mapping (fraud or non-fraud). Reduction of the Loans Receivable asset occurs alongside recognition of the related Credit Loss/Bad Debt or Charge-off expense line. If multiple components are involved, process each component in the order specified by the mapping.
 </div>
 <div class="calc-step"><strong>Substitution:</strong> Example principal write-off of 1,000 reduces Loans Receivable by 1,000 and increases Credit Loss/Bad Debt (Expense) by 1,000. Example interest write-off of 50 reduces Interest Receivable by 50 and increases Interest income charge-off (Expense) by

50. Example fees write-off of 20 reduces Fee Receivable by 20 and increases Fee Charge-off (Income or Expense as mapped) by 20.
 </div>
 <div class="calc-step calc-result"><strong>Result:</strong> The loan balance reflects the write-off; relevant income/expense lines reflect the loss; the chart of accounts shows the associated debits and credits per the product’s mapping rules for Fraud and Non-Fraud scenarios.
 </div>
</div>

### Post-charge-off: specific accounting mappings (high-level)

The product differentiates charge-off postings by category and fraud status, with lines that map principal, interest, and fees to the correct ledgers. A concise, non-implementation-specific summary follows:

- Fraud: Principal portion posts to Credit Loss/Bad Debt Fraud and Loans Receivable is reduced ; an expense line for Charge-off - fraud is recognized. Interest portion posts to charge-off interest income with adjustments to Interest Receivable; Fees portion posts to charge-off fees and related Fee Receivable, with Revenue/Expense entries per the mapping. Goodwill or recoveries-related lines may also appear in the sequence.
- Non-Fraud: Similar structure, but postings use the non-fraud variants of the credit loss and charge-off expense lines and the associated loan and revenue/expense accounts.

The COA (Chart of Accounts) defines the exact accounts and their types, including:

- 112601 Loans Receivable (Asset)
- 145023 Suspense/Clearing account (Suspense/clearing account)
- 112603 Fee Receivable (Asset)
- 245000 Other Credit liability (Liability)
- 744003 Principal bal adjustment (Expense)
- 404001 Interest income charge off (Income)
- 404007 Fee Income (Income)
- 404011 Fee Income (Income)
- 404000 Interest income (Income)
- 744007 Credit Loss/Bad Debt (Expense)
- 744037 Credit Loss/Bad Debt Fraud (Expense)
- And related entries for recoveries and goodwill as described in the reference mappings.

These mappings verify that each component moved during charge-off is traceable and auditable, preserving financial integrity across periods.

### Operational guidance for users

- Triggering a charge-off: When the servicing assessment concludes that collection is not likely, the system applies the charge-off workflow, updates the loan’s status to charged-off, and emits the associated accounting postings per the fraud/non-fraud category.
- Post-charge-off activity: The loan remains in a frozen state. If recoveries occur, the system records them against the existing charge-off framework (recoveries entries) and may post goodwill adjustments as dictated by the mappings.
- Replays and reversals: If a new charge is added after repayments have occurred, or if a repayment is reversed, the system may reverse previous postings and replay allocations to reflect the updated balances. The reverse-replay logic starts from the first disbursement and recalculates the installments, reapplying repayments according to the current repayment strategy.

### Diagram: charge-off lifecycle

```
stateDiagram-v2
 [*] --> Active
 Active --> ChargedOff : charge-off event
 ChargedOff --> Recovered : recovery/settlement
 Recovered --> [*]
```

This diagram illustrates the high-level lifecycle: an active loan becomes Charged-off upon the event, and may proceed to recoveries or settle balances, after which the lifecycle concludes.

### Edge cases and exceptions

- Time-sensitive allocations: The repayment strategy emphasizes the timing of charges and repayments. Fees added to a loan must be paid by a payment created after the due date of the fee. This rule verifies income integrity in scenarios where late charges are applied and later repayments occur.
- Reverse/replay behavior: When a charge-off is triggered or when a new charge is added after repayments have posted, the system may reverse prior postings and replay allocations to verify that the charges are recognized against the correct installments. This behavior is described in the Time respective repayment strategy documentation and is fundamental to preserving accurate repayment timing and income recognition.
- Recovery and goodwill: Post-charge-off recoveries and goodwill entries are possible, and the COA mapping includes accounts to reflect such movements. These entries do not alter the fundamental rule that the principal write-off reduces Loans Receivable and is recognized as a loss, with subsequent recoveries flowing through the recoveries accounting lines.

### Additional notes on fidelity and integrity

- Integrity requirements to observe during operation include: opening balances in subsequent periods must equal the closing balances of the prior period; allocations must reconcile with the transaction totals; remaining cash and outstanding dues must reconcile; journal entries must balance when data is available.
- Rounding and precision: All intermediate calculations and postings follow the product’s documented rounding conventions (e.g., HALF_UP or HALF_EVEN) as evidenced in the reference mappings. No invented rounding rules should be introduced.
- -based scope: This page captures the verified behaviors present in the reference material, including the charge-off event definition, the time-respective repayment strategy, and the post-charge-off scenario patterns. It does not introduce speculative capabilities or unsupported UI elements beyond what is evidenced by the published behavior.

### Calculation references (contextual summaries)

- Charge-off accounting entries v2 and v3 define the tabled mappings that tie Charge-off events to GL postings across Fraud and Non-Fraud categories, with principal, interest, and fees allocated to the standard asset, revenue, or expense accounts.
- The COA and PP Full accounting sheets provide the ledger accounts and their types used in charge-off postings, including Loans Receivable, Suspense/Clearing, Fee Receivable, Credit Loss/Bad Debt, Interest income charge off, Fee Income, and related revenue/expense lines.
- Post-charge-off scenarios illustrate how the system handles reverse/replay and how the repayment strategy interacts with charges added after repayments have posted, including scenarios where charges are overdue and repayments are allocated to charges first, or where repayments are allocated in advance of principal.

### Quick glossary (key terms)

- Charge-off: A formal status assigned to a loan when collection is unlikely, resulting in the loan being frozen and written off in accounting.
- Fraud vs Non-Fraud: Distinct charge-off categories with separate accounting mappings.
- Due charges: Charges that are due on or before the current date and are eligible to be paid from a repayment posting.
- In-advance principal: Portions of repayments allocated to principal before certain charges or fees, as defined by the repayment strategy.
- Reverse-replay: The process of undoing and replaying postings when a charge-off or charge/additional charge alters the sequence of repayments.
- Recoveries: Post-charge-off recoveries that restore some value to the loan’s previously charged-off balance.
- Goodwill adjustments: Post-charge-off adjustments recorded for recoveries or adjustments in loss estimates, as defined by mappings.

This page presents the verified, customer-facing behavior for Charge-off and its accounting implications. It is intended to be read as a coherent description of what happens in the system, why it matters for financial reporting, and how human operators should observe and interact with charge-off events in daily servicing.