# Interest Transactions

## Interest Waivers

### Interest waiver basics

An interest waiver reduces an interest balance on a loan account. Waivers apply to interest balances first. You can post an Interest Payment Waiver transaction on an active or closed loan account, and it appears on the transaction tab where you can undo, modify, or charge it back. You can also post a Payment Waiver transaction on an active or closed loan account.

### Transaction behavior and lifecycle

The Interest Payment Waiver transaction behaves like the goodwill credit and refund transactions. It appears on the transaction tab, can be undone or modified from the UI, and supports charge-back, reverse replay, and replay for changed allocation.

Repayment schedule allocation follows these rules:

- Repayment schedule allocation for Payment Waiver follows the advance repayment strategy set, the same as goodwill credit and refund transaction allocations.
- Reverse replay allocation for Payment Waiver works the same as for goodwill credit and refund transactions.

### Configuration

You can configure how the system allocates payments to an Interest Payment Waiver transaction at loan product level, both when you create the product and when you modify it.

The following rules apply to Interest Payment Waiver transactions:

- Payment allocation rules must allow unique payment allocation for this transaction type.
- The transaction amount must obey the payment allocation order set at the advance allocation strategy.
- When Advanced payment allocation is set, allocation rules can be configured for this transaction type.

### User interface

1. Open the loan account.
2. Choose "Waive Interest" from the actions to open the waive interest screen.
3. Enter the date in the required Interest waived on field.
4. Choose Cancel or Submit.

### Accounting entries for non charge-off loans

For non charge-off loan accounts, the Payment Waiver transaction posts a debit to Income from Interest (GL 404000) for the total amount entered, with credits to Loan portfolio (GL 112601), Interest Receivable (GL 112603), Fees Receivable (GL 112603), Penalties Receivable (GL 112603), and Overpayment (GL 245000) for their respective allocated portions. The reversal entry credits Income from Interest (GL 404000) for the total amount and debits those same accounts for their respective allocated portions.

### Accounting entries for charge-off loans

For charge-off loan accounts, the Payment Waiver transaction posts a debit to Income from Interest (GL 404000) for the total amount entered.

The same transaction posts credits for each portion of the waiver:

- Income from charge-off Interest (GL 404001) for the principal, interest, fees, and penalties portions.
- Overpayment (GL 245000) for the overpayment portion.

Reversing the Payment Waiver posts the opposite entries:

- A credit to Income from Interest (GL 404000) for the total amount.
- Debits to Income from charge-off Interest (GL 404001) for the principal, interest, fees, and penalties portions, and to Overpayment (GL 245000) for the overpayment portion.

### Alternate accounting entries

Alternate accounting entries apply when a waiver is posted to a loan account that is not charge-off or charge-off, and when such a waiver is reversed. The entries differ by account type and by transaction direction. Non-disbursed loans are excluded from sending RepaymentDueBusinessEvent, and a loan with 0 outstanding balance does not trigger RepaymentDueBusinessEvent.

| Transaction | Account type | Debit | Credit |
| --- | --- | --- | --- |
| Payment Waiver | Non charge-off | Loan portfolio (GL 112601), Interest Receivable (GL 112603), Fees Receivable (GL 112603), Penalties Receivable (GL 112603), Overpayment | Loan portfolio (GL 112601) |
| Reversal of Payment Waiver | Non charge-off | Income from Interest (GL 404000) | Loan portfolio (GL 112601), Interest Receivable (GL 112603), Fees Receivable (GL 112603), Penalties Receivable (GL 112603), Overpayment |
| Payment Waiver | Charge-off | Income from charge-off Interest (GL 404001) | Income from charge-off Interest (GL 404001) for principal, interest, and fees; Income from charge-off Interest (GL 112603) for penalties; Overpayment |
| Reversal of Payment Waiver | Charge-off | Income from charge-off Interest (GL 404001) for principal, interest, and fees; Income from charge-off Interest (GL 112603) for penalties; Overpayment | Income from Interest (GL 404000) |

Under accrual-based accounting, waived-off interest posts a debit to Asset Interest Receivable and a credit to Expense Losses Written-off.

### Worked examples

A payment waiver reduces an interest balance before it touches the loan principal. The figures below are illustrative. A customer borrows 900 on the first day of the month. The loan runs for three monthly installments of 310, each split into 300 principal and 10 interest, and every month is treated as 30 days. Before the first installment is due, the officer posts a payment waiver of 310 on the first day of the next month. Because the allocation order is interest first, the waiver clears the 10 interest balance and applies the remaining 300 to principal.

| Date | Transaction | Amount | Interest | Principal | Balance |
| --- | --- | --- | --- | --- | --- |
| Jan 1 | Disbursement | 900.00 | – | – | 900.00 |
| Feb 1 | Payment waiver | 310.00 | 10.00 | 300.00 | 600.00 |
| Mar 1 | Installment due | 310.00 | 10.00 | 300.00 | 300.00 |
| Apr 1 | Installment due | 310.00 | 10.00 | 300.00 | 0.00 |

The example shows that the waiver clears interest first and only then reduces the principal, so the next installment falls on a smaller balance.

When a fee is already on the account, the waiver pays interest and the fee before it reduces principal. A customer borrows 900 on the first day of the month. Mid-month a fee of 30 is assessed, and by the first day of the next month an interest balance of 10 has accrued. The officer posts a payment waiver of 120. The allocation order is interest, then fee, then principal.

| Date | Transaction | Amount | Interest | Fee | Principal | Balance |
| --- | --- | --- | --- | --- | --- | --- |
| Jan 1 | Disbursement | 900.00 | – | – | – | 900.00 |
| Jan 15 | Fee assessed | 30.00 | – | 30.00 | – | 900.00 |
| Feb 1 | Interest accrues | 10.00 | 10.00 | – | – | 900.00 |
| Feb 1 | Payment waiver | 120.00 | 10.00 | 30.00 | 80.00 | 820.00 |

The example shows that the fee is settled before principal, so the principal reduction is smaller than the waiver amount.

The allocation order set at the advance allocation strategy decides which balance a payment waiver hits first. A loan of 900 carries an unpaid interest balance of 10. An officer posts a payment waiver of 100. With interest-first allocation, the waiver clears the interest and applies the remaining 90 to principal.

| Date | Transaction | Amount | Interest | Principal | Balance |
| --- | --- | --- | --- | --- | --- |
| Jan 1 | Disbursement | 900.00 | – | – | 900.00 |
| Feb 1 | Interest accrues | 10.00 | 10.00 | – | 900.00 |
| Feb 1 | Payment waiver | 100.00 | 10.00 | 90.00 | 810.00 |

If the strategy is changed to principal first, the same 100 waiver reduces principal by 100.00, leaves the balance at 800.00, and leaves the 10.00 interest unpaid.

A reversed waiver is replayed the same way as any other transaction, and the restored interest balance changes how a later payment splits. A customer borrows 900 on the first day of the month. Mid-month the officer posts a payment waiver of 10 that covers only interest, so the principal balance stays at 900. On the first day of the next month a repayment of 240 pays 10 interest and 230 principal. The waiver is then reversed, putting the 10 interest back. When the repayment is replayed, it pays 20 interest and 220 principal.

| Date | Transaction | Amount | Interest | Principal | Balance |
| --- | --- | --- | --- | --- | --- |
| Jan 1 | Disbursement | 900.00 | – | – | 900.00 |
| Jan 15 | Payment waiver | 10.00 | 10.00 | 0.00 | 900.00 |
| Feb 1 | Repayment | 240.00 | 10.00 | 230.00 | 670.00 |
| Feb 2 | Waiver reversal | 10.00 | 10.00 | 0.00 | 670.00 |
| Feb 1 | Repayment replayed | 240.00 | 20.00 | 220.00 | 450.00 |

The example shows that reversing a waiver restores the interest balance, so a replayed repayment splits differently between interest and principal.

## Interest Refunds

### Interest Refund overview

An Interest Refund transaction credits interest charged to a loan when a refund posts, so customers pay interest only on the net purchase amount. It applies to progressive, interest bearing loans and is created by Fineract whenever a configured refund type transaction is triggered.

The following rules apply to Interest Refund configuration:

- Interest Refund configuration for a loan product is optional.
- Available refund transactions are Payout refund and Merchant issued refund.
- Multiple transaction types can be selected for Interest Refund configuration.
- The configuration can be stored on a loan product and is inherited by loans submitted from that product.
- Allocation rules can be defined for Interest Refund transactions.
- Merchant issued refund and payout refund handling is separate from repayment handling.
- For a progressive, interest bearing loan product, the optional Interest Refund configuration instructs Fineract to calculate an interest refund amount and create an Interest Refund transaction with the calculated balance for Payment type refund transactions.
- The Progressive loan product Interest refund tab selects one of both refund transaction types to control when Interest refund transaction is created with the right balance.

The following transaction types are involved:

- Interest Refund is a transaction type.
- Journal entries are passed for Interest Refund transactions for a loan account.
- Backend support maps which transactions trigger Interest Refund transaction creation when a loan product is created or modified.

### Configuration and enabling

Interest refunds apply when a refund transaction is processed for a loan product that supports interest refund types. Payment allocation rules allow unique payment allocation for the Interest Refund transaction type.

1. Open the Create Loan Product page and choose "INTEREST REFUND" from the step label.
2. On the loan product interest refund step screen, set Supported Interest Refund Types.

The interest refund calculation setting controls whether an Interest Refund transaction is created for a merchant issued refund or payout refund:

- When the setting is false, the system skips Interest Refund transaction creation for that refund transaction.
- When the setting is true, the system calculates and generates the Interest Refund.
- When the setting is not provided, the system falls back to the loan product configuration.

On the merchant/payout refund transaction screen:

- The checkbox "Skip Interest Refund Transaction Posting" defaults to disabled.
- The Merchant Issued Refund / Payout Refund API accepts an optional boolean field for interest refund calculation.

### Transaction creation

You can create an Interest Refund transaction when the configured refund transaction has occurred. The system sets a transaction relationship between the target refund transaction and the Interest Refund transaction, whether creation is automatic or manual. A manually created Interest Refund transaction is allowed only if no existing Interest Refund transaction already exists.

1. Call /loans/<loan_id>/transactions/<transaction_id>?command=interest-refund.
2. Call /loans/external-id/<loan_external_id>/transactions/<transaction_id>?command=interest-refund.
3. Call /loans/<loan_id>/transactions/external-id/<transaction_external_id>?command=interest-refund.
4. Call /loans/external-id/<loan_external_id>/transactions/external-id/<transaction_external_id>?command=interest-refund.

The response uses the same fields as other transactions.

### Transaction relationships and reversals

A Merchant Issued Refund or Payout Refund transaction links to its related Interest Refund transaction through a transaction relation. Reversing the refund transaction reverses the related Interest Refund transaction automatically.

The following rules govern how the relationship works:

- Merchant Issued Refund points to Interest Refund when the Interest Refund transaction was created first.
- The relation reverses the related Interest Refund transaction automatically when the related Refund transaction gets reversed.
- When a Merchant Issued Refund gets reverse-replayed, the related Interest Refund transaction is marked as reverse-replayed automatically to keep the original transaction order.
- The RELATED relationship between Merchant Issued Refund or Payout Refund and the related Interest Refund transaction needs to be reestablished after reverse-replay.
- REPLAYED relationship happens automatically.

Recalculation can change the Interest Refund transaction during reprocessing:

- During loan transaction reprocessing, the originally calculated Interest Refund transaction amount might need to be recalculated.
- If the new amount differs from the previous one, it needs to be reverse-replayed.
- If a previous repayment got reversed, the interest due amounts might change, and the calculated interest due and interest refund amount might need to be changed.

### Allocation rules

An interest refund is applied to interest accrual first. Any overpayment is treated as a refund to principal, controlled by payment allocation rules. The refund is applied to the oldest disbursement and works forward in time when the refund is greater than the disbursement record. The balance of the interest refund is calculated properly.

### Interest refund calculation method

The system recalculates total interest to date for the loan and determines the interest to be refunded by processing each day from disbursement to the transaction date. For each day, it subtracts the applicable refund from disbursements to get the new principal, applies the daily periodic interest rate to that principal to get the new interest accrual, and subtracts the new interest accrual from the original interest accrual to get the interest refund. The adjusted principal balance cannot be less than 0.00. The system applies the refund to the oldest disbursement, working forward in time when the refund is greater than the disbursement record.

### Use cases

Interest refund use cases cover single and multi disbursements, full and partial refunds, single and multiple refunds, timing within the first installment period, after the first installment period, after all installments are paid, crossing multiple installment periods, and one time payment prior to refund. Interest refund is applied to interest accrued.

| Use case | Scenario | Reference |
| --- | --- | --- |
| UC1 | Single disbursement, full refund within first installment period | R16 |
| UC2 | Single disbursement, full refund after first installment period | R17 |
| UC3 | Single disbursement, full refund after all installments are paid | R18 |
| UC4 | Multi disbursements, same day, full refund within first installment period | R19 |
| UC5 | Multi disbursements, different days, full refund within first installment period | R20 |
| UC6 | Multi disbursements, different days, full refund after first installment period | R21 |
| UC7 | Multi disbursements, different days, full refund after all installments are paid | R22 |
| UC8 | Single disbursement, partial refund within first installment period | R23 |
| UC9 | Single disbursement, partial refund after first installment period | R24 |
| UC10 | Single disbursement, partial refund after all installments are paid | R25 |
| UC11 | Multi disbursements, same day, partial refund within first installment period | R26 |
| UC12 | Multi disbursements, different days, partial refund within first installment period | R27 |
| UC13 | Multi disbursements, different days, partial refund after first installment period | R28 |
| UC14 | Multi disbursements, different days, partial refund after all installments are paid | R29 |
| UC15 | Single disbursement, multiple partial refund within first installment period | R30 |
| UC16 | Single disbursement, multiple partial refund after first installment period | R31 |
| UC17 | Single disbursement, multiple partial refund after all installments are paid | R32 |
| UC18 | Multi disbursements, same day, multiple partial refund within first installment period | R33 |
| UC19 | Multi disbursements, different days, multiple partial refund within first installment period | R34 |
| UC20 | Multi disbursements, different days, multiple partial refund after first installment period | R35 |
| UC21 | Multi disbursements, different days, multiple partial refund after all installments are paid | R36 |
| UC22 | Multi disbursements, different days, multiple partial refund crossing multiple installment periods | R37 |
| UC23 | Single disbursement, multiple partial refund within first installment period, one time payment prior to refund | R1 |

| Use case | Scenario | Daily periodic rate |
| --- | --- | --- |
| UC08 | Single disbursement with a partial refund within the first installment period | 0.0002736986 |
| UC09 | Single disbursement with a partial refund after the first installment period | 0.0002736986 |
| UC10 | Single disbursement with a partial refund after all installments are paid | 0.0002736986 |
| UC11 | Multi disbursements on the same day with a partial refund within the first installment period | 0.02736986% |
| UC12 | Multi disbursements on different days with a partial refund within the first installment period | 0.02736986% |
| UC13 | Multi disbursements on different days with a partial refund after the first installment period | 0.02736986% |
| UC14 | Multi disbursements on different days with a partial refund after all installments are paid | 0.02736986% |
| UC15 | Single disbursement with multiple partial refunds within the first installment period | 0.0002736986 |

| Use case | Scenario | Loan details |
| --- | --- | --- |
| UC10 | Single disbursement with a partial refund after all installments are paid | 12 month installment loan with monthly payments of 87.90 |
| UC15 | Single disbursement with multiple partial refunds within the first installment period | 6 month installment loan with monthly payments of 91.67 |
| UC16 | Single disbursement, multiple partial refund after first installment period scenario |  |
| UC17 | Single disbursement, multiple partial refund after all installments are paid scenario |  |
| UC18 | Multi disbursements, same days, multiple partial refund within first installment period scenario |  |
| UC20 | Multi disbursements, different days, multiple partial refunds after first installment period scenario | 6 month installment loan with monthly payments of 171.56 and a daily periodic rate of 0.02736986% |

| Refund column | Applies to |
| --- | --- |
| First Refund | UC20 |
| Second Refund | UC20 |
| Third Refund | UC20 |

### Journal entries for non charge-off loans

For non charge-off loan accounts, an interest refund posts one debit and five credits across the income, receivable and overpayment GL accounts. The amounts reflect the portions allocated to principal, interest, fees, penalties and overpayment.

| Entry | GL account | Amount |
| --- | --- | --- |
| Debit Income from Interest | 404000 Interest Income | Total amount calculated to be refunded |
| Credit Loan portfolio | 112601 Loans Receivable | Total principal portion allocated |
| Credit Interest Receivable | 112603 fees/Interest Receivable | Total interest portion allocated |
| Credit Fees Receivable | 112603 fees/Interest Receivable | Total fees portion allocated |
| Credit Penalties Receivable | 112603 fees/Interest Receivable | Total penalties portion allocated |
| Credit Overpayment | 245000 Overpayment account | Total overpayment portion allocated |

### Reversal entries for non charge-off loans

For a non charge-off loan account, the reversal entry credits Income from Interest GL 404000 Interest Income for the total amount calculated to be refunded.

| Debit GL | Amount |
| --- | --- |
| Loan portfolio GL 112601 Loans Receivable | Total principal portion which got allocated |
| Interest Receivable GL 112603 fees/Interest Receivable | Total interest portion which got allocated |
| Fees Receivable GL 112603 fees/Interest Receivable | Total fees portion which got allocated |
| Penalties Receivable GL 112603 fees/Interest Receivable | Total penalties portion which got allocated |
| Overpayment GL 245000 Overpayment account | Total overpayment portion which got allocated |

### Journal entries for charge-off loans

| GL account | Debit or credit | Amount |
| --- | --- | --- |
| 404000 Interest Income | Debit | Total amount entered for the payment waiver transaction |
| 404001 Interest income charge off | Credit | Total principal portion allocated |
| 404001 Interest income charge off | Credit | Total interest portion allocated |
| 404001 Interest income charge off | Credit | Total fees portion allocated |
| 404001 Interest income charge off | Credit | Total penalties portion allocated |
| 245000 Overpayment account | Credit | Total overpayment portion allocated |

### Reversal entries for charge-off loans

| GL account | Entry type | Amount |
| --- | --- | --- |
| 404000 Interest Income | Credit | Total amount entered for the payment waiver transaction |
| 404001 Interest income charge off | Debit | Total principal portion allocated |
| 404001 Interest income charge off | Debit | Total interest portion allocated |
| 404001 Interest income charge off | Debit | Total fees portion allocated |
| 404001 Interest income charge off | Debit | Total penalties portion allocated |
| 245000 Overpayment account | Debit | Total overpayment portion allocated |

### Worked examples

A customer receives a single disbursement of 1,000.00 on 1 March. The loan uses a daily periodic interest rate of 0.0002736986, so interest accrues at 0.27 per day on the full balance. On 10 March a merchant refund of 500.00 posts. Because the refund is partial and falls inside the first installment period, the system recalculates interest as if 500.00 had been removed from the principal from 1 March. The figures in this example are illustrative. Whether the partial refund posts within the first installment period, after it, or after all installments are paid, the calculation method is the same, but earlier repayments reduce the principal base and therefore lower the refund amount. This shows that the interest refund equals the original interest accrued minus the interest accrued on the reduced principal.

| Date | Event | Principal balance | Daily interest | Interest accrued PTD | Adjusted principal | Adjusted interest PTD | Interest refund |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1-Mar | Disbursement 1,000.00 | 1,000.00 | 0.27 | 0.27 | 500.00 | 0.14 | 0.13 |
| 2-Mar | No activity | 1,000.00 | 0.27 | 0.54 | 500.00 | 0.28 | 0.26 |
| 3-Mar | No activity | 1,000.00 | 0.27 | 0.81 | 500.00 | 0.42 | 0.39 |
| 4-Mar | No activity | 1,000.00 | 0.27 | 1.08 | 500.00 | 0.56 | 0.52 |
| 5-Mar | No activity | 1,000.00 | 0.27 | 1.35 | 500.00 | 0.70 | 0.65 |
| 10-Mar | Partial refund 500.00 posts | 1,000.00 | 0.27 | 2.70 | 500.00 | 1.40 | 1.30 |

A customer receives a single disbursement of 1,000.00 on 1 March. Interest accrues at 0.27 per day. On 10 March a merchant refund of the full 1,000.00 posts. Because the adjusted principal cannot fall below 0.00, the system sets the adjusted principal to 0.00 and stops interest accrual on the adjusted schedule, so the interest refund equals all interest accrued to date. If the same full refund were posted after the first installment or after all installments were paid, earlier repayments would already have lowered the principal, so the refundable interest base and the refund amount would be smaller.

| Date | Event | Principal balance | Daily interest | Interest accrued PTD | Adjusted principal | Adjusted interest PTD | Interest refund |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1-Mar | Disbursement 1,000.00 | 1,000.00 | 0.27 | 0.27 | 0.00 | 0.00 | 0.27 |
| 2-Mar | No activity | 1,000.00 | 0.27 | 0.54 | 0.00 | 0.00 | 0.54 |
| 3-Mar | No activity | 1,000.00 | 0.27 | 0.81 | 0.00 | 0.00 | 0.81 |
| 4-Mar | No activity | 1,000.00 | 0.27 | 1.08 | 0.00 | 0.00 | 1.08 |
| 5-Mar | No activity | 1,000.00 | 0.27 | 1.35 | 0.00 | 0.00 | 1.35 |
| 10-Mar | Full refund 1,000.00 posts | 1,000.00 | 0.27 | 2.70 | 0.00 | 0.00 | 2.70 |

A loan has two disbursements on 1 March: 250.00 followed by 750.00, bringing the principal to 1,000.00. Interest accrues at 0.27 per day. On 10 March a merchant refund of 500.00 posts. The system applies the refund to the oldest disbursement first, so it clears the 250.00 disbursement and reduces the 750.00 disbursement to 500.00. The adjusted principal is therefore 500.00 and adjusted interest accrues at 0.14 per day. If the disbursements had occurred on different days instead of the same day, the refund would still target the oldest disbursement first, but interest before the later disbursement would be calculated on the smaller balance.

| Date | Event | Principal balance | Daily interest | Interest accrued PTD | Adjusted principal | Adjusted interest PTD | Interest refund |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1-Mar | Disbursements 250.00 + 750.00 | 1,000.00 | 0.27 | 0.27 | 500.00 | 0.14 | 0.13 |
| 2-Mar | No activity | 1,000.00 | 0.27 | 0.54 | 500.00 | 0.28 | 0.26 |
| 3-Mar | No activity | 1,000.00 | 0.27 | 0.81 | 500.00 | 0.42 | 0.39 |
| 4-Mar | No activity | 1,000.00 | 0.27 | 1.08 | 500.00 | 0.56 | 0.52 |
| 5-Mar | No activity | 1,000.00 | 0.27 | 1.35 | 500.00 | 0.70 | 0.65 |
| 10-Mar | Partial refund 500.00 posts | 1,000.00 | 0.27 | 2.70 | 500.00 | 1.40 | 1.30 |

A customer receives a single disbursement of 1,000.00 on 1 March. Interest accrues at 0.27 per day. On 10 March a first merchant refund of 500.00 posts, and on 20 March a second merchant refund of 250.00 posts. Each refund is applied to the oldest outstanding disbursement, so the adjusted principal falls from 1,000.00 to 500.00 and then to 250.00, never below 0.00. Adjusted interest accrues at 0.14 per day after the first refund and at 0.07 per day after the second. Whether the refunds occur within the first installment period, after it, or after all installments are paid, the calculation method is the same, but repayments made before a refund reduce the principal base and therefore lower the refund amount.

| Date | Event | Principal balance | Daily interest | Interest accrued PTD | Adjusted principal | Adjusted interest PTD | Interest refund |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1-Mar | Disbursement 1,000.00 | 1,000.00 | 0.27 | 0.27 | 1,000.00 | 0.27 | 0.00 |
| 10-Mar | First refund 500.00 posts | 1,000.00 | 0.27 | 2.70 | 500.00 | 1.40 | 1.30 |
| 11-Mar | No activity | 1,000.00 | 0.27 | 2.97 | 500.00 | 1.54 | 1.43 |
| 20-Mar | Second refund 250.00 posts | 1,000.00 | 0.27 | 5.40 | 250.00 | 2.10 | 3.30 |
| 21-Mar | No activity | 1,000.00 | 0.27 | 5.67 | 250.00 | 2.17 | 3.50 |
| 30-Mar | No activity | 1,000.00 | 0.27 | 8.10 | 250.00 | 2.80 | 5.30 |
