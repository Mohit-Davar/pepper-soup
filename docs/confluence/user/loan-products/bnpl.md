# BNPL Products

## Pay in 30 Days

Pay in 30 Days lets you disburse a loan account in multiple payments without any required order between them. The loan page supports disbursal of non-tranche multiple disbursals through the new loan wizard.

## Pay in 3 and Pay in 4

Pay in 3 and Pay in 4 let you split a loan into equal installments. When you disburse on an installment due date, that installment stays unchanged and the disbursement amount is split between all remaining installments whose due date is later than the disbursement date. When you extend the repayment schedule, already paid installments stay intact and no changes are made to them.

Example: down payment on a 1,000 loan. The figures are illustrative. A loan of 1,000 is disbursed with a 25 per cent down payment of 250 and four monthly installments of 250, due on the first of each month (1/1, 2/1, 3/1, 4/1) in 30-day months, with no interest or fees. The down payment is treated as the first installment; when it is paid on 1/1 the balance falls from 1,000 to 750, and the three remaining installments stay due at 250 each. After the first two installments are paid the balance is 500 with two installments still due, and paying all four brings the balance to zero.

| Date | Due | Paid | Balance |
| --- | --- | --- | --- |
| 1/1/22 | 250.00 | 250.00 | 750.00 |
| 2/1/22 | 250.00 | 250.00 | 500.00 |
| 3/1/22 | 250.00 | 250.00 | 250.00 |
| 4/1/22 | 250.00 | 250.00 | 0.00 |

Example: a charge added to the next unpaid installment. A loan of 1,000 has a 25 per cent down payment of 250 paid on 1/1, leaving a balance of 750, and four monthly installments of 250 due on the first of each month. A charge of 50 is assessed on 1/1. Because the 1/1 installment is already paid, the charge is added to the next installment (2/1), raising it from 250 to 300 and taking the balance to 800; the 3/1 and 4/1 installments stay at 250. If the charge were assessed before the first installment is paid, it would be added to that first installment instead, making it 300 on 1/1 while the later installments remain 250.

| Date | Event | Due | Paid | Balance |
| --- | --- | --- | --- | --- |
| 1/1/22 | Down payment | 250.00 | 250.00 | 750.00 |
| 1/1/22 | Charge |  |  | 800.00 |
| 2/1/22 | Installment | 300.00 |  | 800.00 |
| 3/1/22 | Installment | 250.00 |  | 800.00 |
| 4/1/22 | Installment | 250.00 |  | 800.00 |

Example: a second disbursement made on an installment due date. A loan of 1,000 has four monthly installments of 250 due on the first of each month (1/1, 2/1, 3/1, 4/1) in 30-day months, with no interest or fees. The first installment is paid on 1/1, leaving a balance of 750 and installments of 250 due on 2/1, 3/1 and 4/1. A second disbursement of 1,000 is made on 2/1, which is itself an installment due date, so the balance rises to 1,750. The 2/1 installment is not changed and stays at 250; the new 1,000 is split between the later installments whose due dates fall after 2/1 (3/1 and 4/1), adding 500 to each so they become 750. If the disbursement fell on a date that is not an installment due date, it would be spread across all remaining installments including the next one instead.

| Date | Event | Due | Balance |
| --- | --- | --- | --- |
| 1/1/22 | First installment paid | 250.00 | 750.00 |
| 2/1/22 | Second disbursement (due date) | 250.00 | 1,750.00 |
| 3/1/22 | Installment | 750.00 | 1,750.00 |
| 4/1/22 | Installment | 750.00 | 1,750.00 |

See also: [Investor Module](confluence-link:Investor%20Module), [Financial Year-End](confluence-link:Financial%20Year-End).
