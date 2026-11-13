# Credit Adjustments

## Credit adjustment overview

Credit adjustments track amounts added to or removed from a loan account outside of normal repayments. They appear in the loan summary, the repayment schedule API, the retrieve loan API, and the accounts changed event.

| Field | Meaning |
| --- | --- |
| credit_adjustments | Amount paid to the loan account through transaction types such as a refund, goodwill credit, or fees waiver. |
| debit_adjustments | Amount debited to the loan account through the reversal of transaction types such as a refund, goodwill credit, or fees waiver. |
| Loan summary outstanding amount | Original amount plus credit adjustments minus paid, waived, and written-off amounts. |
| Credit adjustment column in the loan summary | Sum of all chargeback credit on the loan account. |
| GET repayment schedule API parameters | Two parameters showing the sum of credit adjustments and debit adjustments. |
| Retrieve loan API parameters | Two parameters summing amounts. |
| Accounts changed event | Includes the same fields. |

## Charge adjustment transactions

A charge adjustment transaction offsets or reverses charges that have already been paid on a loan.

Use the charge adjustment transaction button to create one.

- The charge adjustment transaction row in the transaction tab has the undo button enabled, while the edit and charge-back buttons are disabled.
- A reversed charge adjustment transaction has the undo, edit, and charge-back buttons disabled.
- Clicking a charge adjustment transaction row shows the linked loan charge account.

## Credit balance refunds

A Credit Balance Refund (CBR) transaction refunds a customer when a loan is overpaid. You can create a CBR only on a loan in OVERPAID status. The CBR amount matches the overpayment amount and cannot be higher than it. You may set the transaction date for the CBR.

Rules for CBR transactions:

- The CBR amount can be lower than the overpayment amount, but doing so does not make sense.
- Backdated transactions are allowed after a CBR.
- If a backdated transaction follows a CBR and the CBR amount is higher than the overpayment amount after reprocessing, the outstanding principal of the actual installment increases by the full CBR amount and the overpayment amount is allocated as repayment for principal.
- On the repayment schedule, the full CBR amount appears as Credit Principal.

## Discount adjustments

A discount adjustment reduces a discount fee. You can post it backdated, but the system creates the discount fees amortization adjustment as of the current date rather than the backdated transaction date. You can undo a discount adjustment transaction, and you can post multiple discount fee adjustments. A discount fee adjustment cannot exceed the Discount fee.

## Backdated transactions

A backdated transaction is dated before the current date. The system checks whether any later non-reversed transaction exists on the loan before treating a transaction as backdated. If reprocessing does not affect charges or credit balance refunds, the system unwinds the transaction’s effects on the balance and its allocations, then fast forwards back to the present day with the backdated loan accounted for. If reprocessing affects charges or credit balance refunds, the system starts reprocessing immediately and lets the reprocessor calculate everything for the new transaction as well.

When reprocessing a backdated transaction, the system:

- Queries only transactions dated on or after the backdated transaction.
- Processes the repayments in reverse order as undo transactions.
- Applies those repayments again.

## GL postings for charge-off loans

A charge adjustment transaction on a charge-off loan account posts to three general ledger accounts: one debit and two credits.

| GL account | Type | Posting |
| --- | --- | --- |
| 404007 Fee Income | Income | Debit |
| 404008 Fee Charge off | Asset | Credit |
| 245000 Other Credit liability | Liability | Credit |

## Repayment schedule and interest calculation

Interest is calculated using the declining balance method with daily accrual and equal installments. For each normal repayment installment, interest is based on the outstanding balance. Interest is not allocated for the down-payment installment.

## Pre-closure interest rules

Pre-closure interest rules decide how far interest is calculated when a loan closes early.

Interest can be calculated up to either of these dates:

- Calculate till pre-closure date: interest is calculated up to the loan closing date. For example, if the loan closes on 20 February, interest is calculated up to 20 February.
- Calculate till rest frequency date: interest is calculated up to the end of the repayment period. For example, if the loan closes on 20 February, interest is calculated up to the repayment period due date.

## Payment allocation rules

Payment allocation rules decide how monies are applied to amounts due. They cover interest and principal balances, future balances, early payoff, the number of future payments satisfied before re-amortization, and whether monies apply to the next or last installment due.

Allocation rules:

- Monies apply to the interest balance of a single amount due first, from the oldest due amount to the most current due amount.
- For future balances, monies apply to principal balances only.
- Future interest accrued but not yet due can be satisfied through early payoff.
- You can define how many future payments are satisfied before the repayment schedule is re-amortized.
- You can define whether monies apply to the next installment due or the last installment due.

> **Note:** Advance payment allocation to support the interest component is not available.

## Goodwill credit allocation

Goodwill credit is allocated either to past due principal and then the last installment, or to the next installment, depending on the use case.

| Use case | Allocation order |
| --- | --- |
| UC15 | Past due principal, then last installment |
| UC16 | Next installment |

## Undoing and replaying transactions

Undoing a transaction reverses its effect and recalculates the delinquency and breach evaluation, the amortization schedule, and the delinquency schedule. Replaying a transaction reapplies it to installments starting from the first unpaid installment. Reversal can only be recalculated from the original transaction date.

When a transaction is reversed:

- The system sets the reversed on date.
- The system updates the amortization schedule.
- The system updates the delinquency schedule by subtracting the unpaid amount from the last paid period; if the amount exceeds the last period paid amount, earlier periods become unpaid recursively.
- The system updates the breach schedule and does not modify the near breach flag.

| Scenario | Resulting installment amounts |
| --- | --- |
| Reversal of a $400.00 payment | $125.00, $125.00, $125.00, $125.00 |
| Replay of a 4 Jan payment | $75.00, $125.00, $125.00, $125.00 |
| Replay of a 16 Jan payment | $0.00, $75.00, $125.00, $125.00 |
| Reversal of a credit balance refund | $25.00, $125.00, $125.00, $125.00 |

When nothing is past due or due, a refund applies to the final installments.

## Worked examples

Example 1 — Goodwill credit posted to a loan account. A customer is disbursed a loan of 1,000.00 and repays 500.00. The bank then posts a goodwill credit of 100.00 to the loan account as a credit adjustment. No fees are waived and no amount is written off. The figures in this example are illustrative.

| Component | Amount |
| --- | --- |
| Original principal | 1,000.00 |
| Credit adjustment | 100.00 |
| Paid | -500.00 |
| Waived | 0.00 |
| Written-off | 0.00 |
| Outstanding | 600.00 |

The outstanding amount equals the original principal plus credit adjustments, minus amounts paid, waived, and written off.

Example 2 — Credit Balance Refund on an overpaid loan. A loan of 1,000.00 is overpaid by 200.00 when the customer pays 1,200.00, moving the account to OVERPAID status. The bank posts a Credit Balance Refund of 200.00 to return the excess to the customer. On the repayment schedule, the full CBR amount appears as Credit Principal.

| Component | Amount |
| --- | --- |
| Original principal | 1,000.00 |
| Credit adjustment (CBR) | 200.00 |
| Paid | -1,200.00 |
| Waived | 0.00 |
| Written-off | 0.00 |
| Outstanding | 0.00 |

The refund clears the overpayment and returns the outstanding balance to zero.
