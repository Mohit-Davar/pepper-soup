# Pay in 3 and Pay in 4

A pay-in-4 loan is created with a principal of 1,000 and no interest or fees. The first installment of 250 is treated as a downpayment due on the disbursement date, 1/1; the remaining installments of 250 fall due on 2/1, 3/1 and 4/1. These figures are illustrative.

| Date | Type | Due | Paid | Balance |
| --- | --- | --- | --- | --- |
| 1/1 | Downpayment | 250.00 | 250.00 | 750.00 |
| 2/1 | Installment | 250.00 | 250.00 | 500.00 |
| 3/1 | Installment | 250.00 |  | 500.00 |
| 4/1 | Installment | 250.00 |  | 500.00 |
| Total |  | 1,000.00 | 500.00 |  |

Paying only the downpayment leaves the balance at 750.00 with all later installments still due. If an extra 400.00 is paid on 2/15 toward the 3/1 installment, the 4/1 installment shows 100.00 due with 150.00 paid and a remaining balance of 100.00.

A pay-in-4 loan of 1,000 carries a 50 charge on the disbursement date, 1/1. The first installment of 250 is the downpayment; the charge is added to the next unpaid installment, so the 2/1 installment becomes 300.00 due while the 3/1 and 4/1 installments remain 250.00 each.

| Date | Type | Due | Paid | Balance |
| --- | --- | --- | --- | --- |
| 1/1 | Downpayment | 250.00 | 250.00 | 750.00 |
| 1/1 | Charge | 50.00 |  | 800.00 |
| 2/1 | Installment | 300.00 | 300.00 | 500.00 |
| 3/1 | Installment | 250.00 |  | 500.00 |
| 4/1 | Installment | 250.00 |  | 500.00 |

If the charge is assessed before the downpayment is paid, it is added to the first installment instead, making the 1/1 due 300.00 and leaving the later installments at 250.00.

A loan is disbursed for 1,000 on 1/1 with four installments of 250. A repayment of 250 on 1/1 reduces the balance to 750. A second disbursement of 1,000 on 1/15 brings the balance to 1,750, and the schedule is recast to 250 due on 1/15 followed by 500 due on 2/1, 3/1 and 4/1. No interest or fees apply.

| Date | Event | Due | Paid | Balance |
| --- | --- | --- | --- | --- |
| 1/1 | Disbursement |  |  | 1,000.00 |
| 1/1 | Installment | 250.00 | 250.00 | 750.00 |
| 1/15 | Disbursement |  |  | 1,750.00 |
| 1/15 | Installment | 250.00 | 250.00 | 1,500.00 |
| 2/1 | Installment | 500.00 |  | 1,500.00 |
| 3/1 | Installment | 500.00 |  | 1,500.00 |
| 4/1 | Installment | 500.00 |  | 1,500.00 |

If the second disbursement uses the same business date as the first, the new installments are merged on that date rather than creating a separate 1/15 installment.

A pay-in-4 loan of 1,000 has installments of 250 due on 1/1, 2/1, 3/1 and 4/1. A repayment of 400 on 1/1 covers the first installment and applies 150 to the next installment, so the 2/1 installment shows 100.00 due. The balance after the 1/1 payment is 600.00.

| Date | Due | Paid | Balance |
| --- | --- | --- | --- |
| 1/1 | 250.00 | 400.00 | 600.00 |
| 2/1 | 100.00 | 100.00 | 500.00 |
| 3/1 | 250.00 |  | 500.00 |
| 4/1 | 250.00 |  | 500.00 |

A full overpayment of 500 on 1/1 covers the first two installments entirely, leaving 3/1 and 4/1 due with nothing paid.

Transfer of ownership for an active loan with a balance greater than 0.00 takes effect at close of business on the request date; if the balance is 0.00 or negative, the transfer is declined, no transfer record is written, and no GL entries are posted. The settlement_date is stored as a date in the Loan_externalisation table. For example, a sale requested on 05/06/2023 settles on 05/06/2023 and is effective from 05/07/2023; a future settlement requested on 05/06/2023 settles on 05/10/2023 and is effective from 05/11/2023.

| Sale request | Settlement date (COB) | Effective from | Transfer recorded |
| --- | --- | --- | --- |
| 05/06/2023 | 05/06/2023 | 05/07/2023 | Yes |
| 05/06/2023 | 05/10/2023 | 05/11/2023 | Yes |

See also: [Investor Module](../assets-investors/investor-module.md), [Financial Year-End](../accounting-reporting/financial-year-end.md).
