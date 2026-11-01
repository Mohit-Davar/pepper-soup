# EIR Calculation Phase 2 - Accounting

This page documents the accounting behavior that accompanies of the Economic Interest Rate (EIR) calculation, focusing on the mapping of loan lifecycle events to General Ledger (GL) postings. The content captures the confirmed posting rules for principal, interest, fees, penalties, and related adjustments as assets, liabilities, or income/expense, verifying the correct financial treatment across disbursement, repayment, amortization, and post-life events such as write-offs and charge-offs. The material is written for operations staff, loan officers, branch managers, and credit agents who observe, validate, and audit postings within loan servicing. The mappings shown here are intended to be applied consistently across lifecycle events to preserve financial integrity and traceability.

> Note: All postings are exact as evidenced in the reference data. The representations below use the same GL codes and account names, and describe the observed debit/credit directions and the allocation contexts relevant to each transaction type. Where a single transaction type drives multiple credits or debits (to reflect principal, overpayments, and ancillary receivable components), the primary postings are listed first, with follow-on bullets indicating additional credits or debits observed in the source.

### Key concepts and observable outcomes
- The accounting model links economic events in the EIR workflow to specific GL accounts. Principal-related movements typically affect the Loans Receivable Principal asset account, while timing-related elements (such as deferred interest) move to liability accounts (Deferred Interest) and income components (Interest income) are recognized when earned.
- Fee and penalty components are tracked separately through Fee Receivable (Penalty Receivable) and Fees Receivable, and are allocated according to the defined mapping type (for example, Prin, Fees, and Penalty or penalties and fees-specific allocations).
- The system uses a Suspense/clearing account to reconcile disbursements and certain interim movements before permanent allocation to principal or other components.
- Overpayments create an Overpayment Liability (a separate reserve/clearing liability) that can be released or offset by future transactions and payout refunds.
- Post-charge-off events (including write-offs and charge-offs) involve dedicated expense and income lines (such as Charge off expense and Credit loss-bad dept) and may trigger goodwill-related adjustments and further allocations to penalties or fees as evidenced in the data.
- Payout refunds on active loan accounts have explicit mappings to Penalties, Fees, Principal, and Overpayment Liability, reflecting the distribution of refunds to various components.

### Regular accounting mappings (observed postings)
The following postings summarize the observed debit/credit relationships for standard lifecycle events. Each item shows the primary debit and credit directions and the associated allocation context.

- Discount fees
 - Debit: 112601 — Loans Receivable Principal (Asset) — Loan Portfolio
 - Credit: 240005 — Deferred Interest (Liability) — Prin, Fees, and Penalty
 - Allocation context: Principal-related impact with deferral of related interest income.

- Disbursement
 - Debit: 112601 — Loans Receivable Principal (Asset) — Loan Portfolio
 - Credit: 145023 — Suspense/clearing account (Asset/Liability) — Prin
 - Allocation context: Initial funding to the loan, with interim clearing of funds.

- Repayment (principal, and associated components)
 - Debit: 145023 — Suspense/clearing account (Asset/Liability) — Prin, Fees, and Penalty and excess
 - Credit: 112601 — Loans Receivable Principal (Asset) — Loan Portfolio
 - Credit: 245000 — Other Credit liability (Overpayment Liability) — excess
 - Credit: 112603 — Fee Receivable (Penalty Receivable) — Penalty
 - Credit: 112603 — Fee Receivable (Fees Receivable) — Fees
 - Allocation context: Principal repayment reduces the loan balance; any excess is recorded to overpayment liability; ancillary components (penalties and fees) are posted to their receivable accounts.

- Repayment Reversal
 - Debit: 112601 — Loans Receivable Principal (Asset) — Loan Portfolio
 - Debit: 245000 — Other Credit liability (Overpayment Liability) — excess
 - Debit: 112603 — Fee Receivable (Fees Receivable) — Fees
 - Debit: 112603 — Fee Receivable (Penalty Receivable) — Penalty
 - Credit: 145023 — Suspense/clearing account (Asset/Liability) — excess
 - Allocation context: Reverses the principal and associated receivable allocations from a prior repayment, returning funds to the suspense/clearing context.

- Amortization (deferral release to income)
 - Debit: 240005 — Deferred Interest (Liability) — Deferred Interest
 - Credit: 404000 — Interest income (Income)
 - Allocation context: Recognizes interest income as amortized from the deferred interest balance over the period.

- Amortization (charge-off context)
 - Debit: 240005 — Deferred Interest (Liability) — Deferred Interest
 - Credit: 744007/744037 — Credit loss-bad debt / credit loss-bad debt- fraud (Expense)
 - Allocation context: Allocates amortized interest against credit losses associated with charge-off events.

- Write-off
 - Debit: 744008 — recoveries (Expense) — Losses Written-off
 - Credit: 112603 — Fee Receivable (Fees Receivable) — Fees
 - Credit: 112603 — Fee Receivable (Penalty Receivable) — Penalty
 - Additional lines show principal adjustments and reallocation related to the write-off event; these lines reflect the interaction of principal write-off with associated fees/penalties and related overpayments.
 - Allocation context: Recognizes charged-off amounts as losses and clears associated fee/penalty receivables where standard.

- CBR (Credit Balance Reversal) and CBR Reversal
 - Debit: 245000 — Other Credit liability (Overpayment Liability) — excess
 - Credit: 145023 — Suspense/clearing account (Asset/Liability) — excess
 - Reversal: Debit 145023 — Suspense/clearing account; Credit 245000 — Overpayment Liability
 - Allocation context: Moves funds into or out of the overpayment-related liability depending on the CBR event state.

- Goodwill Credit (principal balance adjustment and related effects)
 - Debit: 744003 — Principal bal adjustment (Expense) — Prin,excess
 - Debit: 404008 — Fee Charge off (Income) — Fees and Penalty
 - Credit: 404008 — Fee Charge off (Income) — Fees and Penalties (as observed across the Goodwill scenario)
 - Allocation context: Adjusts principal balance and captures any associated goodwill-related impacts to fees/penalties as part of the adjustment flow.

- Charge addition and adjustments (fees and penalties tracking)
 - Debit: 112603 — Fee Receivable (Fees Receivable) — Fees
 - Credit: 404007 — Fee Income (Income) — Fees
 - Allocation context: Records additional charges to fees receivable and recognizes associated fee income.

- Charge Adjustment Reversal (from fees)
 - Debit: 404007 — Fee Income (Income) — Fees
 - Credit: 112601 — Loans Receivable Principal (Asset) — Prin
 - Allocation context: Reverses prior fee-based adjustments against principal.

- Charge Adjustment Reversal (from Penalty)
 - Debit: 404008 — Fee Charge off (Income) — Penalty
 - Credit: 245000 — Overpayment Liability (Liability) — excess
 - Allocation context: Reverses prior penalty-related adjustments affecting the overpayment liability.

> Important: The postings above are exact as evidenced in the reference data. Each transaction type’s observed postings may comprise multiple lines to reflect principal, interest, fees, penalties, and overpayments. The primary lines listed here are representative; the complete set of lines includes supporting adjustments and reversals as shown in the source.

### Payout refunds on active loan accounts
Payout refunds for active loans follow a dedicated mapping that allocates the refunded amounts across penalties, fees, principal, and overpayments, with the fund-source accounts guiding where the cash flows are recorded. The observed mappings include:

- Penalty refunds on active loans (Cash in)
 - Fund source and Penalties Receivable are affected; cash is recorded as a debit to the fund source and a credit to Penalties Receivable (with the associated reversal path defined in the sheet).
- Fees refunds on active loans (Cash in)
 - Fund source and Fees Receivable are affected; cash inflows are recorded against Fees Receivable.
- Principal refunds (Cash in)
 - Fund source and Loan portfolio are affected; refunds reduce the principal balance via the loan account postings.
- Overpayment refunds (Cash in)
 - Over payment liability is credited, UNC (Unallocated Credit) and UNC-related posts are reflected in the fund source and Overpayment Liability accounts.
- Penalty refunds (Cash out)
 - Penalties Receivable is debited when refunds are disbursed, reducing the related receivable; the fund source accounts reflect the cash outflow.
- Fees refunds (Cash out)
 - Fees Receivable is debited, reducing the associated receivable; the fund source accounts reflect the cash outflow.
- Principal refunds (Cash out)
 - The ChargeOff expense/Charge Off Fraud expense category is used for refunds related to charge-off contexts; the postings map to the respective fund source accounts.
- Overpayment refunds (Cash out)
 - The Overpayment Liability is debited as refunds are processed and cash flows out of the fund source.

These mappings verify refunds are allocated consistently to the same components as the original postings, preserving the integrity of the customer’s account and the institution’s financial records.

### Observation and audit considerations
- Each period’s opening balance must equal the previous period’s closing balance after accounting for all postings in that period. This requires reconciling the principal, interest, fees, penalties, and overpayment components across the lifecycle events documented above.
- Payment allocations must reconcile to the transaction amount being posted, with the sum of debits and credits balancing for each event.
- Remaining cash, outstanding dues, and overpayment liabilities must reconcile after every lifecycle event (disbursement, repayment, refunds, and adjustments).
- Where journal entries are available, verify that debits equal credits for each event, with precise rounding and a clearly defined day-count convention .

### Diagram: high-level flow of accounting postings

flowchart TD
 A[Disbursement] --> B[Dr 112601 Loans Receivable Principal]
 A --> C[Cr 145023 Suspense/clearing account]
 D[Repayment] --> E[Dr 145023 Suspense/clearing account]
 D --> F[Cr 112601 Loans Receivable Principal]
 D --> G[Cr 245000 Overpayment Liability]
 D --> H[Cr 112603 Fee Receivable (Penalty)]
 D --> I[Cr 112603 Fee Receivable (Fees)]
 J[Amortization] --> K[Dr 240005 Deferred Interest]
 J --> L[Cr 404000 Interest income]

### Appendix: Key GL accounts referenced in this phase
- 112601 Loans Receivable Principal — Loan Portfolio (Asset)
- 240005 Deferred Interest — Deferred Income (Liability)
- 145023 Suspense/clearing account — Fund source (Asset/Liability)
- 245000 Other Credit liability — Overpayment Liability (Liability)
- 112603 Fee Receivable — Penalty Receivable (Asset) and Fees Receivable (Asset)
- 404000 Interest income — Income
- 404007 Fee Income — Income
- 404008 Fee Charge off — Asset (and related Income adjustments)
- 744003 Principal bal adjustment — Expense
- 744007/744037 Credit loss-bad dept/credit loss-bad dept- fraud — Expense
- 744008 Recoveries — Expense
- Royalties and goodwill cleanse lines appear in Goodwill Credit pathways and are captured under the Goodwill Credit postings in the reference data. See the main postings above for context.

### Glossary
- EIR (Economic Interest Rate) Calculation : The second phase of the EIR workflow that translates the economic terms of a loan (principal, interest, fees, penalties) into accounting entries.
- Principal Receivable (Loans Receivable Principal): The nominal outstanding balance of the loan principal as an asset on the loan portfolio.
- Deferred Interest (Deferred Income): A liability reflecting interest that has been accrued, but not yet recognized as income.
- Suspense/clearing account: A temporary account used to accumulate funds during interim steps of a transaction before final allocation.
- Overpayment Liability: A liability that records amounts paid by customers in excess of amounts due, until allocated or refunded.
- Fee Receivable and Penalty Receivable: Asset accounts capturing fees and penalties billed but not yet received or allocated; used in conjunction with Fee Income and related postings.
- Charge off and credit loss postings: Expense accounts used to recognize losses and the related effects on the income statement.
- Goodwill Balance Adjustments: Adjustments that affect the principal balance and related fee treatment in goodwill-related scenarios.

If you require a more granular view of every line in the reference mappings (including every column’s labeled fields for each row), we can provide an itemized appendix that reproduces the exact multi-line postings for each transaction type. The representations above reflect the verified, observable behavior and the principal postings that agencies in operations should expect when observing accounting for EIR.