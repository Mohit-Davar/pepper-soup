<!-- Labels: user, buy-down-fees -->
# Buy-Down fees

This feature provides an amortization mechanism for 0% interest loans where a merchant fee or PayPal expense is collected at disbursement and subsequently amortized into interest income over the loan term. The business intent is to recognize revenue from these fees as the loan is serviced, while maintaining a transparent, auditable trail of how the fee is funded upfront and how it accrues over time. The audience for this behavior includes operations staff, loan officers, branch managers, and credit agents who manage disbursements, servicing, and accounting reconciliations.

### How it works in practice

- On disbursement, Buy-Down fees are recorded as an expense and, simultaneously, a Deferred Income liability is created to hold the revenue until it is amortized over the life of the loan.
- Each servicing period (typically monthly), a portion of the Deferred Income is amortized into income, increasing the system’s recognized Interest/Fees Income while reducing the Deferred Income liability.
- An accrual process records interest receivable against the outstanding balance and recognizes associated interest income, aligning with the loan’s accounting cycle.
- When the loan is completed, the remaining balances are settled, and the amortization schedule should reconcile to zero for the loan, with all related entries balanced across the accounting records.

These steps are illustrated by the reference accounting mappings and amortization schedules shown in the authoritative examples below.

### Core accounting and scheduling concepts

- Buy-Down fees are treated as an upfront expense funded by the charging of the fee at disbursement. The associated liability is labeled Deferred Income.
- Amortization of Buy-Down fees reduces the Deferred Income liability and increases Income from amortization (recorded as Interest/fees Income) over the loan’s term.
- An accrual process posts monthly Interest Receivable against the Loan Portfolio and records Interest Income, reflecting the ongoing revenue recognition from the fee amortization.
- The loan’s opening balance must equal the prior period’s closing balance; subsequent period balances flow from standard principal repayments plus amortization of the Buy-Down fees.
- If a loan is paid off early, the remaining Deferred Income and amortization entries are settled in accordance with the payoff event, and the schedule reflects the new payoff balance.
- In the event of a charge-off, the system records a charge-off expense and adjusts the related loan receivable and income components as shown in the example sequences.
- Some adjustment entries exist for Buy-Down fees (Buy Down fees Adjustment) to reflect changes in the amortization schedule. In one observed example, adjustments of 10 and 5 were posted mid-period; the example notes a lack of a dedicated allocation strategy for these adjustments in the visible data.

> Note: The following sections reproduce exact, evidenced steps, calculations, and outcomes from the referenced material. All figures are taken from the documented examples and are shown to two decimal places .

### Navigation and data-entry steps (UI-operational view)

1) Navigate to the Buy-Down feature:
- Go to the navigation path: **Fees > Buy-down fees > Buy-Down fees**.
- Expected system outcome: access to the Buy-Down fees management view where you can create and manage buy-down entries.

2) Create a new Buy-Down entry (disbursement and fee):
- Enter **Disbursement** amount (the base loan amount to be financed) and **Buy Down fees** (the fee being amortized).
- Observe system outcome after save: the system records an initial Buy-Down expense and creates a associated **Deferred Income** liability, establishing the upfront funding and future amortization pathway.

3) Review and run the amortization framework for the loan:
- The system sets up a monthly amortization schedule that debits the Deferred Income liability and credits the Income from amortization (via an Interest/fees Income line) for each period.
- Expected system outcome: the Deferred Income balance declines over time as amortization progresses, and Income from amortization increases .

4) Observe monthly accruals during servicing:
- Each accrual period posts an **Accrual** event to record Interest Receivable and related Interest Income, aligning with the loan’s day-count conventions.
- Expected system outcome: the Interest Receivable balance grows by the period’s interest amount and is offset by recognized Interest Income.

5) Reconcile at loan completion or payoff:
- Upon full repayment, the closing balances should reconcile to zero, and all related entries (including amortization and accruals) should balance across the accounting records.
- If payoff occurs early, the system must reflect the early payoff in the amortization schedule and adjust the remaining balances .
- If a charge-off occurs, the system records the charge-off expense and reduces the loan receivable appropriately.

### Worked examples (calculation and schedule references)
#### Example calculation: Simple loan with Buy-Down fees amortized on disbursement day
- Parameters and inputs
 - Interest Rate: 7% annual, nominal daily rate 0.07/360 = 0.000194444
 - Days in year: 360
 - Days in month: 30
 - Disbursement: 100
 - Buy Down fees: 50
 - Repaid every: 1 month
- Observed outcome (monthly amortization and payments)
 - Initial balance: 100
 - After first period (month 1): Balance 66.86; EMI 33.72; Principal 33.14; Interest 0.58
 - After second period (month 2): Balance 33.53; EMI 33.72; Principal 33.33; Interest 0.39
 - After third period (month 3): Balance 0.00; EMI 33.73; Principal 33.53; Interest 0.20
- Interpretation
 - The loan amortizes a portion of principal each period while a small period-based interest accrual is recognized. The numbers shown reflect the specific example schedule and illustrate how the monthly payments allocate between principal and interest.
- Summary line items (from the example)
 - Total EMI payments across the shown periods: 101.17
 - Total principal repaid: 100.00
 - Total interest component observed: 1.17

<div class="param-grid">
 <div class="param-card"><span class="param-label">Principal</span><span class="param-value">100.00</span></div>
 <div class="param-card"><span class="param-label">Buy Down fees</span><span class="param-value">50.00</span></div>
 <div class="param-card"><span class="param-label">Interest Rate</span><span class="param-value">7% annually</span></div>
</div>

<div class="calc-box">
 <div class="calc-title">Calculation</div>
 <div class="calc-step"><strong>Formula:</strong> Balance progression and interest are computed using a daily rate of 0.07/360 and month length of 30 days.</div>
 <div class="calc-step"><strong>Substitution:</strong> Period 1 interest = 100 × 0.07/360 × 30 = 0.58; Principal paid = 33.14; New balance = 100 − 33.14 = 66.86.</div>
 <div class="calc-step calc-result"><strong>Result:</strong> Amortization and accrual follows the schedule: after month 1, balance 66.86; after month 2, balance 33.53; after month 3, balance 0.00; total interest observed = 1.17.</div>
</div>

### Observed accounting mappings (highlights)

- Initial entry on disbursement (Buy-Down fees):
 - Debit Buy Down fees Expense; Credit Deferred Income
 - This creates the obligation (Deferred Income) to recognize the fee over time.
- Monthly amortization ( Buy Down fees amortization ):
 - Debit Deferred Income; Credit Interest/fees Income
 - This reduces the Deferred Income liability and recognizes income from the amortized fee.
- Period accruals (Accrual):
 - Debit Interest Receivable; Credit Interest Income
 - Reflects interest earned on the outstanding balance during the period.
- Payoff and adjustments:
 - Payoff events and adjustments are reflected in the ledger with the associated impact on Loan Receivable, Deferred Income, and related income/expense accounts as shown in the reference sequences.

### Edge cases and observed deviations

- Buy-Down adjustments: The reference sequences include Buy Down fees Adjustment entries (for example, entries of 10 and 5) that alter the amortization path. An observed note states there is no Allocation strategy documented for Buy Down Fees Adjustment in one example (no allocation strategy for Buy Down Fees Adjustment).
- Daily amortization entries: The material shows a placeholder for Daily Amortization entries and questions whether they should be part of the regular transaction list. This indicates a potential variance in how frequently amortization postings may appear in the system; it is an observed item rather than a mandated behavior.
- Early payoff: When the loan is paid off earlier than the original schedule, the amortization timeline and payoff entries adjust (example shows a payoff event with remaining balance and interest).
- Charge-off: In a charge-off scenario, the entries move remaining loan balances through charge-off expenses and related losses, with associated adjustments to the loan receivable and income components.

### Important integrity checks for operatives

- Opening balances must equal the prior period’s closing balances. The amortization and accrual flows should maintain consistency across periods.
- Payment allocations must reconcile with the transaction amount. The sum of principal and interest components in each period should equal the period’s EMI, and the sum of all EMIs should reconcile to the total repaid principal.
- Remaining cash, outstanding dues, and deferred income balances must reconcile at each reconciliation point, especially at loan completion or payoff.
- Where actual journal entries are available, verify that debits and credits balance within each event (e.g., disbursement, amortization, accrual, payoff, or charge-off).
- Rounding and precision: calculation results and ledger postings are shown to two decimal places in the published schedules. Use standard two-decimal representation for operations and reporting.

### Glossary of terms (quick reference)

- Buy-Down fees: Fees collected at loan disbursement that are amortized into interest income over the loan term.
- Deferred Income: The liability account that holds the revenue recognized from Buy-Down fees until amortized.
- Interest/fees Income: The income account that records amortized Buy-Down fees as they are recognized over time.
- Interest Receivable: Asset account representing accrued interest not yet collected.
- Accrual: Periodic posting to recognize revenue or income earned in the period.

This page consolidates the verified behavior, the observed sequences, and the operational steps required to use Buy-Down fees within the loan servicing and accounting workflows. It presents a complete, publication-ready view of what the feature does, how it behaves, the user-facing steps to operate it, and the financial effects and integrity checks that must be observed.