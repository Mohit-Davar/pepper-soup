# Interest Refunds

## Interest Refund overview

Fineract creates an Interest Refund transaction whenever a configured refund-type transaction posts on a progressive, interest-bearing loan. The system calculates the credit for interest charged to the loan and posts it as a credit adjustment of type “Interest Refund”. Payment allocation rules can be defined for the Interest Refund transaction type.

## Configuration

Interest Refund configuration is optional for a progressive, interest bearing loan product. It instructs Fineract to calculate an interest refund amount and create an “Interest Refund” transaction when a selected refund transaction posts. You set it up on the loan product using the “Interest refund” tab, and a loan account inherits the configuration when submitted, though you may override it at the loan account level.

The backend supports these refund transaction types for the Interest Refund mapping:

| Refund transaction type | Source |
| --- | --- |
| Payout refund | Backend template call for loan product |
| Merchant issued refund | Backend template call for loan product |

Configuration rules:

- You can select multiple transaction types for Interest Refund configuration.
- The mapping controls when Interest Refund transactions occur and their balance.
- The backend supports Interest Refund transaction creation triggering configuration with mappings which transactions shall trigger Interest refund transaction creation when loan product was created or modified.

## Transaction creation

The system creates an Interest Refund transaction when a configured refund transaction occurs and the target transaction exists, is a payout refund or merchant issued refund type, and is not reversed.

Interest Refund transaction creation depends on the interestRefundCalculation setting:

- When interestRefundCalculation=false, the system skips Interest Refund transaction creation for that refund transaction.
- When interestRefundCalculation=true, the system calculates and generates the Interest Refund.
- When interestRefundCalculation is not provided, the system falls back to the loan product configuration.

If an Interest Refund transaction was created, the system raises a business event.

## Journal entries

The journal entries for an interest refund depend on whether the loan account is charge-off. For non charge-off accounts, the entry debits Income from Interest and credits Loan portfolio, Interest Receivable, Fees Receivable, Penalties Receivable and Overpayment. For charge-off accounts, the entry debits Income from Interest and credits Income from charge-off Interest and Overpayment. A reversal posts the opposite entries.

Interest Refund journal entries for non charge-off loan accounts:

| Debit/Credit | Account (GL-Code) | Amount |
| --- | --- | --- |
| Debit | Income from Interest (404000) | Total amount calculated to be refunded |
| Credit | Loan portfolio (112601) | Total principal portion allocated |
| Credit | Interest Receivable (112603) | Total interest portion allocated |
| Credit | Fees Receivable (112603) | Total fees portion allocated |
| Credit | Penalties Receivable (112603) | Total penalties portion allocated |
| Credit | Overpayment (245000) | Total overpayment portion allocated |

Reversal entries for non charge-off loan accounts:

| Debit/Credit | Account (GL-Code) | Amount |
| --- | --- | --- |
| Credit | Income from Interest (404000) | Total amount calculated to be refunded |
| Debit | Loan portfolio (112601) | Total principal portion allocated |
| Debit | Interest Receivable (112603) | Total interest portion allocated |
| Debit | Fees Receivable (112603) | Total fees portion allocated |
| Debit | Penalties Receivable (112603) | Total penalties portion allocated |
| Debit | Overpayment (245000) | Total overpayment portion allocated |

Interest Refund journal entries for charge-off loan accounts:

| Debit/Credit | Account (GL-Code) | Amount |
| --- | --- | --- |
| Debit | Income from Interest (404000) | Total amount entered for 'Payment Waiver' transaction |
| Credit | Income from charge-off Interest (404001) | Total principal portion allocated |
| Credit | Income from charge-off Interest (404001) | Total interest portion allocated |
| Credit | Income from charge-off Interest (404001) | Total fees portion allocated |
| Credit | Income from charge-off Interest (404001) | Total penalties portion allocated |
| Credit | Overpayment (245000) | Total overpayment portion allocated |

Reversal entries for charge-off loan accounts:

| Debit/Credit | Account (GL-Code) | Amount |
| --- | --- | --- |
| Credit | Income from Interest (404000) | Total amount entered for 'Payment Waiver' transaction |
| Debit | Income from charge-off Interest (404001) | Total principal portion allocated |
| Debit | Income from charge-off Interest (404001) | Total interest portion allocated |
| Debit | Income from charge-off Interest (404001) | Total fees portion allocated |
| Debit | Income from charge-off Interest (404001) | Total penalties portion allocated |
| Debit | Overpayment (245000) | Total overpayment portion allocated |

## Payment allocation

An interest refund is applied to interest accrual first, and any overpayment is treated as a refund to principal. Payment allocation rules control this allocation.

Allocation behaviour:

- The Advanced payment allocation processor (AdvancedPaymentScheduleTransactionProcessor) handles transaction allocations for interest refund transactions.

## Calculation method

The interest refund calculation determines the interest to be refunded, applies the refund to the oldest disbursement first and works forward in time when the refund exceeds that disbursement record, then recalculates total interest to date for the loan.

For each day after the refund:

- New outstanding principal equals disbursements minus the applicable refund.
- New interest accrual equals new principal times the daily periodic interest rate.
- Interest refund equals original interest accrual minus new interest accrual.
- Adjusted principal balance cannot be less than 0.00.

## Reversal and reprocessing

You can refund multiple partial interest amounts. When a Merchant Issued Refund or Payout Refund transaction is reverted, its related Interest Refund transaction must also be reverted, and LoanAdjustTransactionBusinessEvent is triggered for both transactions. A RELATED transaction relation connects each Merchant Issued Refund or Payout Refund transaction to its Interest Refund transaction; if the Interest Refund transaction was created first, the Merchant Issued Refund points to it. The REPLAYED relationship is created automatically.

Backdated transactions or reversals can change the interest due amounts, so the Interest Refund transaction amount may need recalculation and reverse-replaying. During loan transaction reprocessing, if the originally calculated Interest Refund amount differs from the previous amount, it is reverse-replayed. When a Merchant Issued Refund is reverse-replayed, its related Interest Refund transaction is marked reverse-replayed automatically to preserve the original transaction order, and the RELATED relationship between them is reestablished.

## Worked examples

A progressive, interest-bearing loan receives a single disbursement of 1,000.00 on 1-Jan. The annual interest rate is 10%, giving a daily periodic rate of 0.000274 and daily interest of 0.27 on the full balance. On 10-Jan a merchant issued refund of 500.00 posts and interestRefundCalculation is true, so Fineract creates an Interest Refund transaction. The figures are illustrative.

| Date | Original principal | Original daily interest | Original interest PTD | Adjusted principal | Adjusted daily interest | Adjusted interest PTD | Daily interest refund |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1-Jan | 1,000.00 | 0.27 | 0.27 | 500.00 | 0.14 | 0.14 | 0.13 |
| 2-Jan | 1,000.00 | 0.27 | 0.54 | 500.00 | 0.14 | 0.28 | 0.13 |
| 3-Jan | 1,000.00 | 0.27 | 0.81 | 500.00 | 0.14 | 0.42 | 0.13 |
| 4-Jan | 1,000.00 | 0.27 | 1.08 | 500.00 | 0.14 | 0.56 | 0.13 |
| 5-Jan | 1,000.00 | 0.27 | 1.35 | 500.00 | 0.14 | 0.70 | 0.13 |
| 6-Jan | 1,000.00 | 0.27 | 1.62 | 500.00 | 0.14 | 0.84 | 0.13 |
| 7-Jan | 1,000.00 | 0.27 | 1.89 | 500.00 | 0.14 | 0.98 | 0.13 |
| 8-Jan | 1,000.00 | 0.27 | 2.16 | 500.00 | 0.14 | 1.12 | 0.13 |
| 9-Jan | 1,000.00 | 0.27 | 2.43 | 500.00 | 0.14 | 1.26 | 0.13 |
| 10-Jan | 1,000.00 | 0.27 | 2.70 | 500.00 | 0.14 | 1.40 | 0.13 |
| Total |  |  | 2.70 |  |  | 1.40 | 1.30 |

The interest refund is 1.30, calculated as original interest accrued of 2.70 minus new interest accrued of 1.40.

| Account | GL code | Debit | Credit |
| --- | --- | --- | --- |
| Income from Interest | 404000 | 1.30 |  |
| Interest Receivable | 112603 |  | 1.30 |
| Loan portfolio | 112601 |  | 0.00 |
| Fees Receivable | 112603 |  | 0.00 |
| Penalties Receivable | 112603 |  | 0.00 |
| Overpayment | 245000 |  | 0.00 |

Fineract links the Interest Refund transaction to the merchant refund with a RELATED relationship and raises LoanAdjustTransactionBusinessEvent.

The same loan and refund as Example 1 are used, but the value of interestRefundCalculation changes. When it is false, Fineract skips Interest Refund transaction creation for that refund transaction. When it is not provided, Fineract falls back to the loan product configuration; if the product enables calculation, the result is identical to Example 1, otherwise no Interest Refund transaction is created.

| interestRefundCalculation | Loan product calculation enabled | Result |
| --- | --- | --- |
| true | — | Interest Refund transaction created for 1.30 |
| false | — | No Interest Refund transaction created |
| not provided | enabled | Interest Refund transaction created for 1.30 |
| not provided | disabled | No Interest Refund transaction created |

Only the flag setting changes; the underlying calculation and amounts stay the same when creation occurs.

The loan is now a charge-off account. A merchant issued refund of 500.00 posts on 10-Jan and interestRefundCalculation is true, so Fineract calculates an interest refund of 1.30 and posts it to charge-off income accounts. When the merchant refund is later reverted, the related Interest Refund transaction is reverted as well, and LoanAdjustTransactionBusinessEvent is raised for both transactions.

| Entry | Account | GL code | Debit | Credit |
| --- | --- | --- | --- | --- |
| Original | Income from Interest | 404000 | 1.30 |  |
| Original | Income from charge-off Interest | 404001 |  | 1.30 |
| Reversal | Income from Interest | 404000 |  | 1.30 |
| Reversal | Income from charge-off Interest | 404001 | 1.30 |  |

The RELATED relationship between the merchant refund and the Interest Refund transaction is reestablished after reverse-replay.
