# Financial Year-End

## Financial Year-End

Fineract does not include a Financial Year Ending process. You manually calculate profit and loss for the financial year and post it as a manual journal entry.

When asset externalization is turned on, the manual journal entry screen includes the following behaviour:

- You can post manual journal entries at asset owner level.
- You select the required asset owner from the asset Owners drop-down field.
- The trial balance summary report includes manual journal entry data with asset owner details.

An officer prepares the year-end figures for a four-installment loan of 1,000 disbursed on 1-July. A 25 percent down payment is completed, reducing the principal balance to 750 and setting the first installment to 0. Three installments of 250 remain due on 1-August, 1-September and 1-October. The figures are illustrative. These balances are used when the officer manually calculates profit and loss for the year-end journal entry.

| Date | Event | Principal paid | Principal balance |
| --- | --- | --- | --- |
| 1-Jul | Disbursement | 0.00 | 1,000.00 |
| 1-Jul | Down payment | 250.00 | 750.00 |
| 1-Aug | Installment 1 | 0.00 | 750.00 |
| 1-Sep | Installment 2 | 250.00 | 500.00 |
| 1-Oct | Installment 3 | 250.00 | 250.00 |
| 1-Nov | Installment 4 | 250.00 | 0.00 |

The officer approves a payment holiday on the same loan. With a one-month holiday, the remaining installments move to 1-September, 1-October and 1-November, and the maturity date moves to 1-December. With a two-month holiday, they move to 1-October, 1-November and 1-December, and maturity moves to 1-January. The user selects the holiday length in the loan schedule, and the due dates are recalculated. A two-month holiday shifts maturity and due dates one month later than a one-month holiday. The officer uses the revised dates to confirm which balances are outstanding at year end before posting the manual journal entry.

| Installment | Due date after 1-month holiday | Due date after 2-month holiday |
| --- | --- | --- |
| Installment 2 | 1-Sep | 1-Oct |
| Installment 3 | 1-Oct | 1-Nov |
| Installment 4 | 1-Nov | 1-Dec |
| Maturity | 1-Dec | 1-Jan |

The down payment fails, so the principal balance stays at 1,000 and all four installments of 250 remain due. When the officer approves a two-month payment holiday, installments that are already due are not extended; only future installments move to later dates. The user checks the past-due status before approving the holiday, because those amounts must still be collected on their original dates. The unchanged past-due amounts are included in the year-end manual journal entry calculation.

| Installment | Original due date | Status before holiday | Due date after holiday |
| --- | --- | --- | --- |
| Installment 1 | 1-Jul | Past due | 1-Jul |
| Installment 2 | 1-Aug | Future | 1-Oct |
| Installment 3 | 1-Sep | Future | 1-Nov |
| Installment 4 | 1-Oct | Future | 1-Dec |

A fee of 15 is added to the penalty balance, so the second installment rises to 265. When a payment is received, the principal balance falls to 750 and the penalty balance remains 15 until it is cleared. After the penalty is paid, the installment returns to the regular 250. The officer tracks fee and penalty balances separately because they affect the profit and loss figure posted in the manual year-end journal entry.

| Event | Principal balance | Penalty balance | Next installment amount |
| --- | --- | --- | --- |
| Start | 1,000.00 | 0.00 | 250.00 |
| Fee applied | 1,000.00 | 15.00 | 265.00 |
| Payment received | 750.00 | 15.00 | 265.00 |
| Penalty cleared | 750.00 | 0.00 | 250.00 |

See also: [Asset Externalization: Asset Externalization](../assets-investors/asset-externalization.md#asset-externalization), [BNPL Products: Pay in 3 and Pay in 4](../loan-products/bnpl.md#pay-in-3-and-pay-in-4).
