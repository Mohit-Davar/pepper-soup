<!-- Labels: developer, buy-down-fees -->
# Buy-Down fees

Buy-Down fees provide an amortization mechanism for 0% interest loans where a merchant fee or processor expense is collected at disbursement and is subsequently amortized into interest income over the life of the loan. This feature operates within the loan accounting domain to recognize the up-front fee as an expense, establish a Deferred Income liability, and gradually recognize revenue from amortization as the loan progresses. The behavior is evidenced by allocations, accrual entries, and daily amortization schedules described in the reference material, including entries that move amounts from Deferred Income to Interest/Fees Income and the associated impact on loan balances and repayments.

## Conceptual overview and scope

The Buy-Down flow centers on three interacting pieces of the accounting model:
- Up-front recognition of the buy-down fee as an expense and the concurrent establishment of a Deferred Income liability for the same amount.
- Daily amortization of the Deferred Income liability, transferring amounts to Income (Interest/Fees Income) over the loan term.
- Integration with standard loan cash flows (disbursement, repayments, payoff, and potential charge-offs) so that the amortization revenue is recognized in parallel with or during the loan's amortization schedule.

Key invariants verified by the reference data include the following: the opening balance of a period equals the prior period's closing balance, and the sum of cash flows, amortization, and allocations reconciles with the transaction amount. All amounts shown in the examples are grounded in the provided reference data and explicit calculations (e.g., daily rate conventions and daily amortization units).

## Design anchors and accounting model

- Day-count conventions and rate inputs: The reference calculations use a 360-day year and a 30-day month. An annual rate of 7% corresponds to a daily rate of 0.07 / 360 = 0.000194444. These conventions drive the loan interest accrual and underpin the amortization scheduling interplay with the buy-down flow.
- Core ledger mappings (as evidenced in the calculations):
 - Buy Down fees (expense) is recorded at disbursement as a debit to Buy Down Fees Expense and a credit to Deferred Income.
 - Buy Down fees amortization reduces Deferred Income and increases Income from amortization (Interest/fees Income).
 - If the loan later progresses to payoff or charge-off, related entries affect Deferred Income and the relevant expense or income accounts according to the observed patterns in the reference schedules.
- Opening balances and destruction of the deferred amount: Each day or accounting interval reduces the Deferred Income balance by the amortization amount and increases Income , until the Deferred Income balance reaches zero or until the loan ends.

## Journal entry flows (verified patterns)

The reference data describes explicit debit/credit patterns for buy-down accounting events. The following sequences reflect the verified flows.

1) On loan disbursement (recognition of buy-down fee)
- Debit: Buy Down fees (Expense) for the fee amount
- Credit: Deferred Income (Liability) for the same amount
Example: a Buy Down fee of 50 yields Debit Buy Down Fees Expense 50 and Credit Deferred Income 50.

2) Daily amortization of the buy-down item (recognition of amortized income)
- Debit: Deferred Income (Liability) by the daily amortization amount
- Credit: Interest/fees Income (Income)
Example: daily amortization of 0.55 reduces Deferred Income by 0.55 and increases Income from amortization by 0.55. After the first amortization on 1/1/2024, Deferred Income balance decreases from 50 to 49.45.

3) On payoff (final settlement while amortization continues)
- The payoff settles the loan balance and recognizes the remaining accrued income/interest following the existing pattern of entries in the payoff scenario, including recognition of Interest Income associated with the amortization through the payoff date.

4) On charge-off (credit losses interaction)
- The record reflects continuation of amortization flows against Deferred Income, and recognition of credit-loss related adjustments per the documented patterns, so that the amortization revenue follows the status of the loan (charged-off, still accruing, etc.).

5) Adjustment (reallocation or reclassification)
- Buy Down Fees Adjustment entries reclassify amounts between Deferred Income and Buy Down Fees Expense as observed in the example set, altering the balance of Deferred Income and the timing of expense vs. income.

> Note: The exact ledger accounts used in the patterns above reflect the mapping shown in the reference data, including Deferred Income, Buy Down Fees Expense, and Interest/Fees Income, along with standard loan-related balances such as Loan Receivable and the related income lines.

## Calculation reference and illustrative schedules

The reference data provides several concrete scenarios that demonstrate the mechanics of Buy-Down fee amortization. Two representative examples are shown below to illustrate the interpretation of inputs, schedules, and resulting cash flow impacts. All numbers are taken from the reference sheets and are reproduced here to document verified behavior.

### Calculation context: common inputs
- Interest rate: 7% per year, with daily rate r_d = 0.07 / 360 = 0.000194444
- Days in year: 360; Days in month: 30
- Disbursement amount: 100
- Buy Down fees collected at disbursement: 50
- Repaid every: 1 month (for the UC-1 simple loan scenario)
- The amortization period for the buy-down fee in the UC-1 example proceeds on a daily basis, with a daily amortization amount of 0.55 (see the daily amortization entries in the reference). This reduces the Deferred Income by 0.55 per day and increases Income from amortization by 0.55 per day until the Deferred Income balance reaches zero.

<div class="calc-box">
 <div class="calc-title">Calculation</div>
 <div class="calc-step"><strong>Formula:</strong> <code>r_daily = annual_rate / days_in_year</code></div>
 <div class="calc-step"><strong>Amortization rule:</strong> <code>Deferred Income balance decreases by daily amortization amount A; Income increases by A per day</code></div>
 <div class="calc-step calc-result"><strong>Example result (UC-1):</strong> <code>Deferred Income starts at 50; after 1 day: 49.45; daily amortization A = 0.55; Income from amortization increases by 0.55</code></div>
</div>

#### UC-1: Simple loan with Buy-Down on the same day as disbursement
- Inputs (as evidenced in the sheet):
 - Interest rate: 7% (0.000194444 daily)
 - Days in year: 360; Days in month: 30
 - Disbursement: 100
 - Buy Down fees: 50
 - Repaid every: 1 month
- Amortization mechanics (evidenced):
 - At disbursement, the Buy Down fee is recognized as an expense and Deferred Income is created for 50.
 - Daily amortization reduces Deferred Income by 0.55 and recognizes Income from amortization by 0.55 (the 0.55 daily amount is the verified value observed in the daily amortization entries).
 - The loan repayment schedule continues with standard principal and interest components, while the amortization revenue adds to Interest/Fees Income over time.

Example excerpt from the calculation pattern (illustrative subset):
- Beginning balance at disbursement: 100
- Buy Down fee: 50 (recorded as expense; Deferred Income liability: 50)
- Daily amortization (1/1/24 onward): 0.55 per day
- On 1/1/24 (first amortization day): Deferred Income reduces to 49.45; Income from amortization increases by 0.55
- On 2/1/24 (first payment date): Loan balance reduces through the standard EMI (~33.72) and the amortization continues to accrue; the second day onward pattern continues with the same daily amortization until the Deferred Income is exhausted or the loan ends.

The reference shows a reiteration of these steps across multiple days and payments, with the following outcomes in the UC-1 flow: the loan fully amortizes with a total EMI of 33.72 (on the first period), a total interest component that includes the amortized income, and a final payoff that settles the outstanding balance while recognizing the accumulated amortization in the Income lines.

### Calculation context: UC-2 and UC-3 variants
- UC-2 (Early payoff): The structure remains the same for the buy-down amortization, but the loan is repaid early. The amortized buy-down income continues to be recognized up to the payoff date, and the payoff entry closes the loan with the remaining balances settled. The reference calculations show an example payoff on 3/1/24 where the payoff amount equals the outstanding balance, and the income recognition includes the amortization revenue accumulated through the payoff date.
- UC-3 (Charge-off): When a loan is charged off, the pattern preserves the amortization of the buy-down as an income item while recognizing the charge-off pattern for the loan balance. The reference sequence shows the charge-off posting with the associated recognition of amortized income and the related charge-off accounting entries.

## Integrity checks and -based expectations

- Opening and closing balances: Each period’s opening balance equals the prior period’s closing balance, verifying consistent balance propagation through the amortization and regular loan cash flows.
- Allocation integrity: The sum of the EMI components, the daily amortization, and the deferred income movements balance against the observed cash flows and the initial buy-down fee amount.
- Rounding and precision: The examples are expressed with two-decimal monetary precision where shown in the reference data; the underlying conventions use standard rounding consistent with the provided figures (HALF_UP/HALF_EVEN in the context in the ledger entries).
- Journal entry balance: Where ledger entries are provided (Dr/Cr mappings for the various events), the entries balance within each event (debit total equals credit total).

## Operational notes for implementation teams

- Data model alignment: The buy-down flow relies on a dedicated Deferred Income liability that is populated at disbursement and amortized over time. Implementations should verify that the lifecycle of Deferred Income follows the loan’s lifecycle and interacts coherently with the loan’s repayment schedule.
- Scheduling and processing: The daily amortization requires a regular processing path that updates Deferred Income and Income from amortization on each processing cycle. The reference demonstrates daily amortization steps (e.g., 1/1/24 onward) that progressively reduce the liability balance.
- Boundary conditions and adjustments: Include support for Buy Down Fees Adjustment to reclassify amounts between Deferred Income and Buy Down Fees Expense, updating the related balances and the resulting income recognition.
- Edge cases: Early payoff reduces the amortization horizon but continues to recognize the portion of amortized income accrued up to payoff. Charge-off preserves amortization streams against the Deferred Income while applying the standard charge-off accounting pattern.

## Quick reference: representative figures from the reference data
- Daily rate example: 7% annual rate => 0.000194444 daily rate (0.07 / 360)
- Days: 360-day year, 30-day month
- Disbursement example: 100 principal, Buy Down fees collected 50 at disbursement
- Amortization: daily amortization amount observed in the reference is 0.55 in the UC-1 simple loan example, reducing Deferred Income from 50 to 49.45 after the first day
- Payments: EMI around 33.72 (for the simple loan in UC-1) with principal and interest components that include the amortized buy-down income, resulting in a total of 101.17 over three payments in the example set
- Payoff and charge-off flows: payoff date can occur while amortization continues; charge-off flows preserve amortization revenue allocation alongside the charge-off pattern

## Appendix: terminology and excerpts from the reference flows
- Buy Down fees (expense): Debit; Buy Down Fees Expense
- Deferred Income (liability): Credit at recognition, Debit during amortization
- Income from amortization / Interest and fees income: Credit during amortization
- Loan Receivable / Fund source / Suspense accounts: Standard loan accounting balances that interact with the Buy-Down flow
- Buy Down fees amortization (daily): The verified daily entry that reduces Deferred Income and increases Income from amortization by the same amount (e.g., 0.55 per day in UC-1 example)

If you need a narrower excerpt or a larger portion of the sample schedules translated into a machine-readable format (e.g., a JSON-driven test fixture), I can provide a compact representation that preserves the exact numbers and mappings from the reference data.