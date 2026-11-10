# Loan Lifecycle Dates

## Loan Lifecycle Dates

The custom module records extra dates whenever the loan lifecycle changes, such as when a loan becomes overpaid or matured. You can configure which status changes the module tracks.

Configuration key custom.module.loan.lifecycle.allowed.status.codes accepts a list of statuses:

- ALL tracks every status change and is the default.
- OVERPAID,CLOSED_OBLIGATIONS_MET tracks when the loan gets closed because it is fully paid or when the loan gets overpaid.

When a loan is overpaid, the system records the date as follows:

- Overpaid on date is set as the date the loan was submitted instead of the transaction date.

Example 1: Overpaid loan records the submission date. A loan officer opens a loan of 1,200 with an annual interest rate of 12%, three monthly installments, and 30-day months. The first two installments are 412 each. In the final month the borrower pays 412, although only 399.96 is due. The figures in this example are illustrative. The system records the date the payment was submitted as the overpaid date, rather than the date the transaction was processed.

| Month | Opening Balance | Interest | Payment | Principal | Closing Balance | Overpaid |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1,200.00 | 12.00 | 412.00 | 400.00 | 800.00 | 0.00 |
| 2 | 800.00 | 8.00 | 412.00 | 404.00 | 396.00 | 0.00 |
| 3 | 396.00 | 3.96 | 412.00 | 396.00 | 0.00 | 12.04 |

Example 2: On-time repayment marks the loan as matured. Using the same loan of 1,200 at 12% annual interest with three monthly installments, the borrower pays exactly 399.96 in the final month. The balance reaches zero and the system records the matured date as a lifecycle change.

| Month | Opening Balance | Interest | Payment | Principal | Closing Balance | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1,200.00 | 12.00 | 412.00 | 400.00 | 800.00 | Active |
| 2 | 800.00 | 8.00 | 412.00 | 404.00 | 396.00 | Active |
| 3 | 396.00 | 3.96 | 399.96 | 396.00 | 0.00 | Matured |

Example 3: Rescheduling stores a new lifecycle date. After the first installment, the outstanding balance is 800. A loan officer reschedules the loan to two remaining installments of 408 each. The system records the reschedule date as a status change. A user may reschedule the same active loan more than once, even on the same date, and each reschedule is stored as a separate change that can be found by date or by status.

| Month | Opening Balance | Interest | Payment | Principal | Closing Balance | Event |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1,200.00 | 12.00 | 412.00 | 400.00 | 800.00 | Rescheduled |
| 2 | 800.00 | 8.00 | 408.00 | 400.00 | 400.00 | Active |
| 3 | 400.00 | 4.00 | 404.00 | 400.00 | 0.00 | Matured |
