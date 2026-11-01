<!-- Labels: developer, phase-2 -->
# EIR Calculation Phase 2 - Accounting

This document details the accounting behavior observed in the workstream for the EIR (Effective Interest Rate) calculations under the Working Capital (PPWC / EIR) program. It documents how transaction events are translated into double-entry accounting postings, the allocation of amounts to GL accounts, and the handling of post-disbursement events such as repayments, amortization, write-offs, charge-offs, goodwill adjustments, and payout refunds. The material is grounded in the available accounting mappings and does not introduce any external or internal implementation details beyond what is evidenced in the reference data.

### Scope and role of the accounting component

The accounting component translates loan and cash events into generalized ledger postings according to a fixed set of mappings. The mappings are recorded in three major areas:

- Accounting-regular: standard postings for routine events such as disbursement, repayment, amortization, and write-off related activities.
- Accounting-after charge-off: postings that occur after a charge-off has been identified, including the recognition of credit losses and subsequent reversals, as well as goodwill-related adjustments.
- Payout Refund Transaction Accounts: postings that occur when refunds are issued on active or charge-off loan accounts, including refunds of penalties, fees, and principal-related adjustments.

Within each area, the entries are defined as double-entry postings using specific GL (General Ledger) codes and their associated descriptions. The intention is that every event results in balanced debits and credits to the relevant accounts, preserving the integrity of the ledger.

### Core principles evidenced in the accounting mappings

- Double-entry discipline: every transaction is expressed as a set of debits and credits that sum to zero, with the affected GL accounts clearly named (e.g., Loans Receivable Principal, Deferred Interest, Fee Receivable, Penalties Receivable, Overpayment Liability, and various Income/Expense accounts).
- Asset, liability, income, and expense delineation: the mappings assign postings to asset accounts (e.g., Loans Receivable Principal), liabilities (e.g., Deferred Interest), receivables (e.g., Fees Receivable, Penalties Receivable), and associated income/expense accounts (e.g., Interest income, Charge off expense).
- Allocation-type semantics: many entries include an Allocation type that describes which component of the transaction is affected (for example, Prin, Fees, and Penalty; Int; Penalty; Fees; excess).
- Periodic integrity: the posted lines for a given event are designed to reconcile within the same transaction (opening balance and closing balance invariants apply across periods; postings are expected to balance within each event).

The remainder of this document presents the observed patterns in a structured, verifiable manner, aligned with the three areas listed above.

---

## Accounting-regular: routine postings

This section summarizes representative postings used for regular loan-related events. Each entry shows the direction (Dr or Cr), the GL code, and the GL name as observed in the reference mappings.

- Discount fees
 - Debit: 112601 Loans Receivable Principal (Loan Portfolio, Asset)
 - Credit: 240005 Deferred Interest (Deferred Income, Liability)
 - Note: This represents charging the discount/fee against the loan principal and deferring income as a liability.

- Discount fees Adjustment
 - Debit: 240005 Deferred Interest (Deferred Income, Liability)
 - Credit: 112601 Loans Receivable Principal (Loan Portfolio, Asset)
 - Note: Adjustment reverses the prior deferral to reflect updated timing or recognition.

- Disbursement
 - Debit: 112601 Loans Receivable Principal (Loan Portfolio, Asset)
 - Credit: 145023 Suspense/clearing account (Fund source, Asset/Liability)
 - Note: Funds disbursed are recorded against the loan principal and a suspense/clearing account captures the source until finalized.

- Disbursement Reversal
 - Debit: 145023 Suspense/clearing account (Fund source, Asset/Liability)
 - Credit: 112601 Loans Receivable Principal (Loan Portfolio, Asset)
 - Note: Reversal of a prior disbursement posting.

- Repayment
 - Debit: 145023 Suspense/clearing account (Fund source, Asset/Liability)
 - Credit: 112601 Loans Receivable Principal (Loan Portfolio, Asset)
 - Additional credits (to complete the allocation):
 - Credit: 245000 Other Credit liability (Overpayment Liability, Liability) [allocation: excess]
 - Credit: 112603 Fee Receivable (Penalty Receivable, Asset) [allocation: Penalty]
 - Credit: 112603 Fee Receivable (Fees Receivable, Asset) [allocation: fees]
 - Note: The repayment reduces principal and allocates any excess to overpayment liabilities and associated fee/penalty receivables.

- Repayment Reversal
 - Debit: 112601 Loans Receivable Principal (Loan Portfolio, Asset)
 - Credits: (to reflect reversal of a repayment)
 - Credit to 245000 Overpayment Liability (Liability, excess)
 - Credit to 112603 Fee Receivable (Fees Receivable, Asset)
 - Credit to 112603 Fee Receivable (Penalty Receivable, Asset)
 - Note: Reversal entries restore the previously paid amounts to their original accounts.

- Amortization
 - Debit: 240005 Deferred Interest (Deferred Income, Liability)
 - Credit: 404000 Interest income (Income from Amortization, Income)
 - Note: Recognizes accrued interest against the deferred amount and records interest income .

- Amortization in Charge-off
 - Debit: 240005 Deferred Interest (Deferred Income, Liability)
 - Credit: 744007/744037 Credit loss-bad debt/credit loss-bad debt- fraud (Charge off expense, Expense)
 - Note: When amortization interacts with a charge-off event, related credit losses are recognized.

- Write-off
 - Debit: 744008 recoveries (Expense: Losses Written-off; Prin, fees, and Penalty)
 - Credits:
 - 112601 Loans Receivable Principal (Assets, Prin)
 - 112603 Fee Receivable (Fees Receivable, Asset)
 - 112603 Fee Receivable (Penalty Receivable, Asset)
 - Note: Writing off the loan reduces the principal and related receivables, with any recoveries treated separately.

- Write-off Reversal
 - Debit: 112601 Loans Receivable Principal (Asset, Prin)
 - Debit: 112603 Fee Receivable (Fees Receivable, Asset)
 - Debit: 112603 Fee Receivable (Penalty Receivable, Asset)
 - Credit: 744008 recoveries (Expense: Losses Written-off, Prin)
 - Note: Reverses the write-off if a recovery or reversal occurs, restoring the original receivable balances.

- CBR (Credit Balance Reversal) and CBR Reversal
 - Debit: 245000 Other Credit liability (Overpayment Liability, Liability)
 - Credit: 145023 Suspense/clearing account (Fund source, Asset/Liability)
 - CBR Reversal reverses the above so that the overpayment liability and suspense balance are restored to their prior state.

- Goodwill Credit and Goodwill Credit Reversal
 - Goodwill Credit (Dr): 744003 Principal bal adjustment; 404008 Fee Charge off (income recognized) and 404008 Fee Charge off (income for Penalty)
 - Credits:
 - 112601 Loans Receivable Principal (Asset, Prin)
 - 112603 Fee Receivable (Fees Receivable, Asset)
 - 245000 Other Credit liability (Overpayment Liability, Liability)
 - Goodwill Credit Reversal (Dr): 112601; 112603; 245000; Cr: 404008 (Fee Charge off) for both Fees and Penalty components
 - 744003 (Principal bal adjustment) posts as an expense against Goodwill Credit; 404008 entries capture income from Goodwill Credit Fees/Penalties
 - Note: Goodwill adjustments affect principal balances and related fee/penalty income and are accounted for using the described GLs.

- Charge Addition and Charge Waive (from Fees)
 - Charge Addition:
 - Debit: 112603 Fee Receivable (Fees Receivable, Asset)
 - Credit: 404007 Fee Income (Income from Fees, Income)
 - Charge Waive:
 - Debit: 404007 Fee Income (Income from Fees, Income)
 - Credit: 112603 Fee Receivable (Fees Receivable, Asset)
 - Note: These entries reflect the adjustment of fees recognized as income or the reversal of fee receivables when waivers occur.

- Charge Adjustment (from fees) and Reversal (from fees)
 - Charge Adjustment (from fees):
 - Debit: 404007 Fee Income (Income from fees, Income)
 - Credit: 112603 Fee Receivable (Fees Receivable, Asset)
 - Charge Adjustment Reversal (from fees):
 - Debit: 112603 Fee Receivable (Fees Receivable, Asset)
 - Credit: 245000 Overpayment Liability (Overpayment Liability, Liability)
 - Note: These patterns show how fee income entries are adjusted and subsequently reversed when required.

- Charge Adjustment (from Penalty) and Reversal (from Penalty)
 - Charge Adjustment (from Penalty):
 - Debit: 404007 Fee Income (Income from Penalty, Income)
 - Credit: 112603 Fee Receivable (Penalty Receivable, Asset)
 - Charge Adjustment Reversal (from Penalty):
 - Debit: 245000 Overpayment Liability (Overpayment Liability, Liability)
 - Credit: 404007 Fee Income (Income from Penalty, Income)
 - Note: Mirrors the fees pattern for penalties.

> Integrity note: Across all these regular postings, the structure is designed to maintain balanced postings within each event. The Debit side and Credit side lists align to reflect the economic substance of the event while preserving accounting equality.

---

## Accounting-after charge-off: post-closure accounting for charge-offs

When a charge-off is identified, the system posts dedicated lines that recognize the loss and, when applicable, the offsetting recoveries and goodwill-related adjustments. shows postings across Credit Loss (bad debt) and related income/expense lines, followed by possible reversals should circumstances change.

- Charge-off (recognizing loss and related charge-off expenses)
 - Debit: 744007/744037 Credit loss-bad debt/credit loss-bad debt- fraud (Charge off expense, Prin)
 - Debit: 404008 Fee Charge off (Income from ChargeOff Fees, Fees) and Debit: 404008 Fee Charge off (Income from ChargeOff Penalties, Penalty)
 - Credit: 112601 Loans Receivable Principal (Asset, Prin)
 - Credit: 112603 Fee Receivable (Fees Receivable, Asset) [and Credit: 112603 Fee Receivable (Penalty Receivable, Asset)]
 - Note: This pattern recognizes the loss on the loan and records any related fee/penalty income as part of the charge-off process.

- Charge-off Reversal (restoring balances if the charge-off is reversed)
 - Debit: 112603 Fee Receivable (Fees Receivable, Asset) and 112603 Fee Receivable (Penalty Receivable, Asset)
 - Credit: 404008 Fee Charge off (Income from ChargeOff Fees / Penalties)
 - Debit: 245000 Overpayment Liability (Overpayment Liability, Liability)
 - Credit: 404008 Fee Charge off (Income from ChargeOff Fees / Penalties)
 - Note: Reverses the charge-off-related postings when recoveries or modifications occur.

- Post-charge-off repayments and recoveries
 - The tables show continued postings for repayments and amortization that occur after charge-off, including amortization against the deferred interest and subsequent postings to credit loss/charge-off accounts as standard.

- CBR and CBR reversal after charge-off
 - Debit: 245000 Overpayment Liability (Overpayment Liability, Liability)
 - Credit: 145023 Suspense/clearing account (Fund source, Asset/Liability)
 - CBR reversal restores the suspended balance to its prior state. This is followed by associated postings to restore the overpayment liability lines if applicable.

- Goodwill adjustments after charge-off
 - Similar to regular Goodwill entries, but with the context of charge-off, including adjustments to principal balances and the related income/expense lines.

- Amortization after charge-off
 - Continued amortization pattern against the Deferred Interest (240005) and recognition of Interest income (404000) to the ongoing accounting horizon.

> Integrity note: The post-charge-off postings are designed to support traceable recoveries and reversals, while preserving the net effect on the principal and the related receivables and liabilities.

---

## Payout Refund Transaction Accounts: refunds on active or charge-off loans

The Payout Refund mapping defines how refunds are posted when a payout event is reversed or refunded on an active loan account or in the context of charge-offs. The entries allocate to penalties, fees, principal, and related receivables/liabilities via a consistent set of GL postings.

- Payout Refund: Penalty (Cash in)
 - Debit: 145023 (Suspense/clearing account or Fund source)
 - Credit: 112603 Penalties Receivable (Fund source mapping field shown as Penalties Receivable)

- Payout Refund: Fees (Cash in)
 - Debit: 145023
 - Credit: 112603 Fees Receivable (Fund source mapping field shown as Fees Receivable)

- Payout Refund: Principal (Cash in) – Unallocated Credit (UNC)
 - Debit: 145023
 - Credit: 245000 Over payment liability (Fund source mapping field shows Over payment liability)
 - Note: UNC represents a balance that may be allocated to principal and related charge-off expenses.

- Payout Refund: Principal (Cash in) – Charge-off impact
 - Debit: 145023
 - Credit: 744007/744037 Credit loss-bad debt (ChargeOff Expense / Charge Off Fraud Expense)
 - Note: When refunds affect charge-off related expenses, postings move through the Charge Off Expense accounts (and related income lines) as shown in the mapping.

- Payout Refund: Principal (Cash in) – Allocation to Charge-off related income/expense
 - Debit: 145023
 - Credit: 744003 Principal bal adjustment (Goodwill/Balance related adjustment)
 - Note: The Goodwill balance adjustments reflect the interaction of refunds with goodwill adjustments , using the charged-off and recovery streams.

- Payout Refund: Principal (Cash out) – Loan principal realignment
 - Debit: 112601 Loans Receivable Principal (Asset, Prin)
 - Credit: 145023 (Fund source)
 - Note: Cash outflows from the suspense/fund source are reflected against the loan principal to realign balances when refunds are issued on active or charge-off accounts.

- Payout Refund: Penalty / Fees (Cash out)
 - Debit: 112603 Penalties Receivable / Fees Receivable (Asset)
 - Credit: 145023 (Fund source)
 - Note: Refunds may reverse earlier penalities or fees postings depending on the refinement of the refund event.

- Payout Refund: Principal (Cash out) – Additional allocations
 - Debit: 744007/740037 (Charge Off Expense / Charge Off Fraud Expense)
 - Credit: 245000 Over payment liability (Fund source)
 - Note: When refunds on charge-off loans involve recovery or adjustment of charge-off expenses, the postings may credit the Charge Off Expense accounts as shown in the mapping.

> Integrity note: Each payout refund event posts to the Suspense/clearing account (145023) and then reallocates to the standard receivable, liability, or income/expense accounts, keeping the debits equal to credits at the transaction level.

---

### Example pattern snippets (evidenced postings)

The reference data includes explicit lines for several representative postings. The following small, concrete patterns illustrate the practical postings you can expect to see in the ledgers:

- Discount fees pattern (regular postings)
 - Debit: 112601 Loans Receivable Principal
 - Credit: 240005 Deferred Interest
 - This reflects the initial recognition of a discount/fee against the loan principal and the deferral of income.

- Disbursement pattern (regular postings)
 - Debit: 112601 Loans Receivable Principal
 - Credit: 145023 Suspense/clearing account
 - Represents the cash disbursement crediting the loan principal with a source tracked in the suspense account.

- Repayment pattern (regular postings)
 - Debit: 145023 Suspense/clearing account
 - Credit: 112601 Loans Receivable Principal
 - Credit: 245000 Overpayment Liability (excess)
 - Credit: 112603 Fee Receivable (Penalty Receivable)
 - Credit: 112603 Fee Receivable (Fees Receivable)
 - Demonstrates how incoming repayments reduce principal and allocate any excess to related receivables.

- Amortization and related credit loss (regular postings)
 - Debit: 240005 Deferred Interest
 - Credit: 404000 Interest income
 - Demonstrates amortization of the deferred interest into income as the loan accrues.

- Write-off and reversal patterns (regular postings)
 - Debit: 744008 recoveries
 - Credit: 112601 Loans Receivable Principal
 - Credit: 112603 Fee Receivable (Fees Receivable)
 - Credit: 112603 Fee Receivable (Penalty Receivable)
 - Write-off reversal posts the opposite directions to restore the original balances when recoveries occur.

> Note: The patterns shown here reflect the exact directions and GL codes visible in the reference data. Amounts are not provided in the reference; the emphasis is on the exact accounts and the direction of posting.

---

## Validation and integrity considerations

- Balance invariants: For every event, the sum of debits equals the sum of credits within that event, verifying ledger balance at posting time.
- Period integrity: Each period’s opening balance corresponds to the previous period’s closing balance. This is maintained by the clean sequencing of postings per event and per cycle.
- Allocation reconciliation: Payment allocations (principal, interest, fees, penalties, and any excess/overpayment) are reconciled within the same event, aligning with the allocation type definitions (Prin, Fees, and Penalty; Int; excess).
- Journal entry balance: Where journal entries are available, debit and credit lines are balanced in aggregate, including multi-line allocations for complex events such as repayments that generate multiple credits.
- Rounding and precision: No explicit numeric examples with amounts are provided in the reference data; when present in actual postings, rounding rules follow the standard HALF_UP or HALF_EVEN conventions as defined by the broader ledger policy. The documentation preserves the exact GL codes and directions observed.

---

## Notes on scope and boundaries

- This page summarizes the accounting behavior strictly as evidenced in the supplied reference data for EIR Calculation - Accounting. It does not introduce new UI controls, REST endpoints, or private infrastructure details.
- The content distinguishes implemented Postings and their relationships from any proposals or planning material not reflected . Where the reference data provides explicit lines, those lines are reproduced in the pattern descriptions above; where it does not specify a numeric amount, the associated qualitative description is provided to preserve factual fidelity.
- No internal identifiers, ticket numbers, or confidential artifacts are included beyond the GL codes and account names that appear in the reference data. The intent is to present a standalone, publication-ready technical reference.

---

If you need focused breakdowns by specific transaction scenarios (for example, “Disbursement after a partial repayment” or “Charge-off with subsequent recovery”), I can extract and organize the exact postings evidencing those paths from the reference data into a compact scenario deck.