# BNPL Products

## Pay in 30 Days

Pay in 30 days covers all implementation required to complete the feature's second phase. It lets you disburse a loan in multiple non-tranche amounts without any required time order between disbursements. The web app includes additional loan product fields and updates the loan page to support this disbursal through the new loan wizard.

Late fees use fixed fees for different overdue amount ranges. They apply to loan charges with charge time type Overdue Fees and charge calculation Fixed fees for various Slabs/Ranges of Overdue Amount + Interest + Any Fees.

Administrators manage overdue amount slabs as follows:

- You can add, edit, or remove rows defining overdue amount from, to, and fixed fee fields.
- Late fee charges are determined by slab ranges: between 1 and X1 charges Z1, between X1 and X2 charges Z2, between X3 and X4 charges Z3, and else greater than X3 charges Z4.

The system permits disbursement over the approved or disbursed amount by the configured percentage, not by 100% plus the additional configured percentage.

Figures are illustrative. A loan officer reviews a second disbursement request on a loan with an applied and disbursed amount of 1,000. The product allows approval above the applied amount by a configured percentage, set here to 10 percent. The maximum total approved amount is 1,100, so 100 remains available for the second disbursement. When the configured overage is 50 percent instead of 10 percent, the maximum total becomes 1,500 and a requested second disbursement of 1,500 is rejected because it would exceed that limit.

| Step | Value |
| --- | --- |
| Applied and disbursed amount | 1000.00 |
| Configured overage (10%) | 100.00 |
| Maximum total approved amount | 1100.00 |
| Available for second disbursement | 100.00 |
| Requested second disbursement | 150.00 |
| Result | Rejected |

The example shows that the system caps the combined disbursements at the applied amount plus the configured percentage and rejects any request that would push the total above that cap.

A loan is overdue by 75.00, made up of principal, interest and any earlier overdue fees. The product uses slab ranges for overdue amounts: 1 to 10 charges 0, 10 to 50 charges 5, 50 to 100 charges 12, and anything above 100 charges 20. Because 75.00 falls in the 50 to 100 slab, the late fee is 12.00.

| Overdue amount | Slab | Late fee |
| --- | --- | --- |
| 5.00 | 1 to 10 | 0.00 |
| 25.00 | 10 to 50 | 5.00 |
| 75.00 | 50 to 100 | 12.00 |
| 150.00 | Above 100 | 20.00 |

The example shows that the fee is a flat amount for the whole slab and moves to the next slab amount once the overdue balance crosses a boundary.

## Pay in 3 and Pay in 4

A loan officer issues a Pay-in-4 loan of 1,000 on January 1. The customer pays a 250 down payment the same day, leaving 750 to be repaid in three monthly installments of 250 on February 1, March 1, and April 1. Interest is 12 percent a year, or 1 percent a month, applied to the opening balance of each installment. The figures are illustrative. If the down payment is not applied to the principal, the balance stays blank until the first installment instead of dropping to 750.

| Date | Transaction | Principal | Interest | Due | Balance |
| --- | --- | --- | --- | --- | --- |
| Jan 1 | Disbursement | 1,000.00 | - | - | 1,000.00 |
| Jan 1 | Down payment | 250.00 | - | - | 750.00 |
| Feb 1 | Installment 1 | 250.00 | 7.50 | 257.50 | 500.00 |
| Mar 1 | Installment 2 | 250.00 | 5.00 | 255.00 | 250.00 |
| Apr 1 | Installment 3 | 250.00 | 2.50 | 252.50 | 0.00 |

A loan of 1,000 is disbursed on January 1. The customer pays a 250 down payment the same day, and a 50 fee is added to the amount owed, bringing the balance to 800. The balance is repaid in three monthly installments: the first installment on February 1 includes the 50 fee and is due as 300, while the installments on March 1 and April 1 are 250 each. If the fee is added before the down payment, the balance after both transactions is 1,050 instead of 800.

| Date | Transaction | Principal | Fee | Due | Balance |
| --- | --- | --- | --- | --- | --- |
| Jan 1 | Disbursement | 1,000.00 | - | - | 1,000.00 |
| Jan 1 | Down payment | 250.00 | - | - | 750.00 |
| Jan 1 | Fee | - | 50.00 | - | 800.00 |
| Feb 1 | Installment 1 | 250.00 | 50.00 | 300.00 | 500.00 |
| Mar 1 | Installment 2 | 250.00 | - | 250.00 | 250.00 |
| Apr 1 | Installment 3 | 250.00 | - | 250.00 | 0.00 |

A Pay-in-4 loan is disbursed twice on the same day, 500 in the morning and 500 in the afternoon, for a total of 1,000. The customer makes two down payments of 125 each on that day. Because both disbursements happen on the same day, the system creates only one installment for the remaining 750, due on February 1. If the disbursements occurred on different days, the system would create separate installment blocks for each disbursement instead of a single remaining installment.

| Date | Transaction | Principal | Down payment | Due | Balance |
| --- | --- | --- | --- | --- | --- |
| Jan 1 | Disbursement 1 | 500.00 | - | - | 500.00 |
| Jan 1 | Disbursement 2 | 500.00 | - | - | 1,000.00 |
| Jan 1 | Down payment 1 | - | 125.00 | - | 875.00 |
| Jan 1 | Down payment 2 | - | 125.00 | - | 750.00 |
| Feb 1 | Installment | 750.00 | - | 750.00 | 0.00 |

A loan of 1,000 is disbursed on January 1 with a 250 down payment, leaving 750 to be repaid in three installments of 250. On January 15, a second disbursement of 500 arrives, raising the balance to 1,250. The schedule is recalculated as three installments: 250 due January 15, then 500 due February 1, and 500 due March 1. If the second disbursement arrives after the first installment is paid, the remaining original installments are recalculated with the new principal added.

| Date | Transaction | Principal | Due | Balance |
| --- | --- | --- | --- | --- |
| Jan 1 | Disbursement 1 | 1,000.00 | - | 1,000.00 |
| Jan 1 | Down payment | 250.00 | - | 750.00 |
| Jan 15 | Disbursement 2 | 500.00 | - | 1,250.00 |
| Jan 15 | Installment 1 | 250.00 | 250.00 | 1,000.00 |
| Feb 1 | Installment 2 | 500.00 | 500.00 | 500.00 |
| Mar 1 | Installment 3 | 500.00 | 500.00 | 0.00 |
