# Down Payments

## Down payment overview

A down payment is an amount collected at disbursement. You can enable it at the loan product level, and it then applies to every loan account of that product and every disbursement of those accounts. Down payments behave like installments: amount allocations and repayment fulfillment work the same way. Multiple down payments can be collected for multiple disbursements of the same account. When a down-payment percentage is defined at the loan product, that same percentage applies to all disbursements of those accounts.

## Enabling and configuring down payment

You enable it at the loan product level and set the percentage of the disbursed amount to collect. You can collect it automatically or manually. Changes affect only new loan accounts; existing accounts keep their current configuration.

Configuration options:

- Enable or disable auto repayment of down payment at the loan product level.
- Enable or disable the "do not extend loan schedule for multi disbursal" checkbox at the loan product level.

| Setting | Description |
| --- | --- |
| Down payment | Enable or disable collection of a percentage of the disbursement amount at the loan product level. |
| Down payment percentage | Percentage of the disbursed amount collected as down payment; applies to all disbursements of accounts using the product. |
| Auto repayment for down payment | Subtracts the down payment from the disbursed amount or from a created payment transaction. |
| Do not extend loan schedule for multi disbursal | Loan inherits this checkbox from the product-level Down payment configuration. |

## Auto repayment of down payment

When auto repayment of down payment is enabled, disbursements trigger an auto downpayment transaction for the down payment amount. The system applies this to all new loan accounts and all disbursements belonging to that loan product.

## Down payment installments and schedule

A down-payment installment is due on the disbursement date, and its amount is based on the down-payment percentage in the product configuration. The system creates one down-payment installment for each disbursement even if the disbursement falls on the same dates. The repayment schedule includes down-payment installments when down-payment is enabled, and the number of repayments excludes them. If a down-payment installment falls on an existing regular installment due-date, the schedule shows two installments on the same date. When a disbursement is reverted, only the related down-payment installment is deleted. With down payment enabled, re-scheduling the loan repayment schedule gives an error.

Schedule state and down-payment installment inclusion

| Loan state | Down-payment installment in schedule |
| --- | --- |
| Created | Yes, using the default amount and default date as expected disbursement |
| Approved | Yes, using the default amount and default date as expected disbursement |

Event handling for down-payment installments:

- When a down-payment installment is due, the system sends a payment due event.

## Repayment priority and allocation

Repayment on down payments follows the payment allocation rules. You can make a repayment using the DownPayment payment type. When a regular installment and a downpayment installment fall due on the same date, the regular installment takes priority, and the downpayment installment is paid only after the regular installment is fully paid.

Specified due-date charges and charge-back amounts are allocated as follows:

- Specified due-date charges are allocated to the next down-payment or installment.

## Charges, interest, and delinquency

You cannot add charges, chargebacks, or interest to a downpayment installment. The system allocates any charge, chargeback, or interest to the next regular installment instead.

## Disbursement reversal

Reversing a disbursement also reverses the down payment and its accounting entries. Without auto down-payment, reversal is allowed only when no payment has happened; in that case the installment is deleted. If payments have already been made, reversal is not allowed.

## Multi-disbursement and schedule extension

A multi-disbursement loan can receive more than one disbursement. The "do not extend loan schedule for multi disbursal" checkbox controls whether a later disbursement extends the repayment schedule. Loan term frequency and number of repayments logic ignores down payment periods.

Schedule behavior at disbursement:

- When the checkbox is enabled, a new disbursement does not extend the loan schedule.
- When the checkbox is disabled, the loan schedule extends to the exact number of repayments.
- At disbursement, Fineract distributes the amount amongst the existing installments without extending the schedule.

| Loan product | Repayments | Balance | Installments |
| --- | --- | --- | --- |
| Example product | 3 (1 per month) | 1000 | 333.33, 333.33, 333.34 |

A second disbursement added after the second period due date has no impact on earlier installments.

## Repayment start date and loan term

The repayment start date option on a loan product decides whether the repayment schedule starts from the loan submitted date or the loan disbursed date. The default option is the loan disbursed date. With a down payment, the loan term is defined by the number of repayments minus one, and you must not count the down payment as an installment in the number of repayments field. The loan term field is read only at loan account creation and is calculated as `repay every * number of repayment`.

## Backdated disbursement

A backdated disbursement sets the disbursement date to a date on or after loan submission.

The effect on the loan schedule depends on how the schedule is based:

- If the schedule is based on the loan submission date, no reschedule happens when backdated disbursement occurs.
- If the schedule is based on the first disbursement date and a disbursement has already happened, the loan is rescheduled according to the new disbursement date.

When backdated disbursement happens, the loan schedule is regenerated and the transactions are reprocessed.

## Transaction processing and accounting

The down payment transaction type uses the same accounting as repayment. Disbursement and Undo Disbursement require disbursement amount, transaction date, classification, and payment type. EMI is calculated by deducting the down payment principal from the principal balance even when the down payment transaction is not paid. No multi-disbursement is supported.

A disbursement transaction is processed as follows:

- The transaction is stored in the transaction table.
- Allocations are stored in the allocation table.
- Accounting entries are created based on the allocation.
- Balances are stored in the balances table and updated after the transaction.
- External business events are triggered.

## Known issues

Known issues with down payments include incorrect installment amounts and interest calculations. The last installment of a Pay in 3 installment loan with down payment may include an extra amount instead of being 33.34. Interest on an interest bearing loan with down payment enabled is not always calculated correctly.

## Worked examples

A loan product has down-payment enabled at 25 percent of the disbursement amount and auto repayment of down-payment enabled. The loan principal is 1,000, the number of repayments is 3, repayments are monthly, and months are 30 days. These figures are illustrative. On the disbursement date of January 1, the system creates a down-payment installment of 250 and, because auto repayment is enabled, posts a down-payment transaction of 250 for January 1. The number of repayments excludes the down-payment installment, so the loan term is 3 × 30 = 90 days and the schedule contains four installments: the down-payment due January 1 and three regular installments of 250 due February 1, March 1, and April 1. The example shows that auto repayment posts the down-payment on the disbursement date and that the loan term excludes the down-payment installment.

| Date | Type | Principal | Due | Paid | Balance |
| --- | --- | --- | --- | --- | --- |
| Jan 1 | Down-payment | 250.00 | 250.00 | 250.00 | 750.00 |
| Feb 1 | Regular | 250.00 | 250.00 | 0.00 | 750.00 |
| Mar 1 | Regular | 250.00 | 250.00 | 0.00 | 750.00 |
| Apr 1 | Regular | 250.00 | 250.00 | 0.00 | 750.00 |

The same loan has a principal of 1,000, a 25 percent down-payment, and three monthly repayments. Disbursement on January 1 creates a down-payment of 250 due January 1 and regular installments of 250 due February 1, March 1, and April 1. A repayment of 250 on January 1 settles the down-payment and leaves a balance of 750. A repayment of 250 on February 1 settles the first regular installment and leaves a balance of 500. A repayment of 400 on February 15 fully pays the March 1 installment and applies 150 early to the April 1 installment, leaving 100 due on April 1 and a balance of 100. The example shows how repayments reduce the balance by principal paid and how early payment covers a future installment in full before touching the next one.

| Installment | Due date | Type | Principal | Due | Paid | Balance |
| --- | --- | --- | --- | --- | --- | --- |
| Down-payment | Jan 1 | Down-payment | 250.00 | 0.00 | 250.00 | 750.00 |
| Regular 1 | Feb 1 | Regular | 250.00 | 0.00 | 250.00 | 500.00 |
| Regular 2 | Mar 1 | Regular | 250.00 | 0.00 | 250.00 | 250.00 |
| Regular 3 | Apr 1 | Regular | 250.00 | 100.00 | 150.00 | 100.00 |

The same loan has a principal of 1,000, a 25 percent down-payment, and three monthly repayments. A charge of 50 is added on January 1. No charge or interest can be added to a down-payment installment, so the charge is allocated to the next regular installment, due February 1. That installment becomes 300, consisting of 250 principal and 50 charge. A repayment of 250 on January 1 settles the down-payment and leaves a balance of 800. A repayment of 300 on February 1 settles the February 1 installment and leaves a balance of 500. The March 1 and April 1 installments remain 250 each. The example shows that charges move to the next regular installment, never to the down-payment installment.

| Installment | Due date | Type | Principal | Charge | Due | Paid | Balance |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Down-payment | Jan 1 | Down-payment | 250.00 | 0.00 | 250.00 | 250.00 | 800.00 |
| Regular 1 | Feb 1 | Regular | 250.00 | 50.00 | 300.00 | 300.00 | 500.00 |
| Regular 2 | Mar 1 | Regular | 250.00 | 0.00 | 250.00 | 0.00 | 500.00 |
| Regular 3 | Apr 1 | Regular | 250.00 | 0.00 | 250.00 | 0.00 | 500.00 |

A loan has down-payment enabled at 25 percent and two disbursements of 1,000 each on the same day, January 1. The system creates one down-payment installment for each disbursement, so two down-payment installments of 250 each are due on January 1. If a loan had three disbursements on the same day, the schedule would show three down-payment installments of 250 each on that date. The example shows that each disbursement produces its own down-payment installment even when disbursement dates coincide.

| Disbursement | Date | Amount | Down-payment | Due date |
| --- | --- | --- | --- | --- |
| 1 | Jan 1 | 1,000.00 | 250.00 | Jan 1 |
| 2 | Jan 1 | 1,000.00 | 250.00 | Jan 1 |
