# Loan Application Fields

Down payment fields decide whether a loan is a down payment loan under the same product constraints, and they control how much of the disbursed amount goes toward the down payment. You can enable or disable the down payment feature when you create or modify a loan account.

| Field | Effect |
| --- | --- |
| Down payment enabled | Decides dynamically whether the loan is a down payment loan under the same product constraints. |
| Down payment override | Overrides the down payment setting configured on the loan product. |
| Automatic repayment for down payment | Overrides the value set on the loan product when provided; otherwise the loan product value is used. |
| Disbursed amount percentage for down payment | Overrides the value set on the loan product when provided; otherwise the loan product value is used. |

The only allowed use case for overriding down payment is when down payment was configured on the loan product but should be disabled during loan submission.

- If down payment was not set and enabled on the loan product, it cannot be set and configured on the loan level.

Situation: payable interest inside one installment period. Figures are illustrative. A 10-day installment period carries 10.00 of interest payable for the period, and no payment is made until day 5, when the borrower pays 3.00 toward interest. Each day the system spreads the unpaid part of the period's interest over the days left in the period, so payable interest builds up day by day, and a payment lowers what is still payable.

| Day | Days left | Daily accrual | Payable before payment | Payment | Payable after payment |
| --- | --- | --- | --- | --- | --- |
| 1 | 10 | 1.00 | 1.00 | 0.00 | 1.00 |
| 2 | 9 | 1.00 | 2.00 | 0.00 | 2.00 |
| 3 | 8 | 1.00 | 3.00 | 0.00 | 3.00 |
| 4 | 7 | 1.00 | 4.00 | 0.00 | 4.00 |
| 5 | 6 | 1.00 | 5.00 | 3.00 | 2.00 |

The example shows payable interest accumulating daily within the period and a payment reducing the amount still payable; the daily amount equals the unpaid period interest divided by the days left.

Situation: a disbursement repaid through equal monthly installments. A loan of 1,000.00 is disbursed at an annual interest rate of 12% and repaid in 3 monthly installments over 30-day months. Interest each month is 1% of the opening balance, principal is repaid in equal parts, the first installment is paid on time, and the later installments remain outstanding.

| Installment | Opening balance | Interest | Principal due | Due | Paid | Ending balance | Outstanding |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Disbursement | 1,000.00 | 0.00 | 0.00 | 0.00 | 0.00 | 1,000.00 | 0.00 |
| 1 | 1,000.00 | 10.00 | 333.33 | 343.33 | 343.33 | 666.67 | 0.00 |
| 2 | 666.67 | 6.67 | 333.33 | 340.00 | 0.00 | 333.34 | 340.00 |
| 3 | 333.34 | 3.33 | 333.34 | 336.67 | 0.00 | 0.00 | 336.67 |
| Total | - | 20.00 | 1,000.00 | 1,020.00 | 343.33 | - | 676.67 |

The example shows interest falling as the balance falls and an on-time payment clearing an installment from outstanding; if the first installment were left unpaid, it would stay outstanding at 343.33 and its payable interest would keep accruing daily instead.
