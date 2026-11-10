# Financial Year-End

## Financial Year-End

Financial year-end lets you close a fiscal year by manually calculating profit and loss and posting the result as a manual journal entry. Manual journal entries can be posted at asset owner level when asset externalization is enabled, and you can specify the asset owner for each entry.

The trial balance summary report reflects manual journal entries that include asset owner details.

- The trial balance summary report includes manual journal entry data with asset owner details.

A four-installment loan of 1,000 is disbursed on 1-Aug. A 250 down payment reduces the principal to 750 and the first installment to 0. A payment holiday approved on 5-Aug extends the remaining installments. The figures below are illustrative.

| Holiday | New maturity | Installment 2 | Installment 3 | Installment 4 | Final balance |
| --- | --- | --- | --- | --- | --- |
| 1 month | 1-Dec | 10/1 | 11/1 | 12/1 | 0.00 |
| 2 months | 1-Jan | 11/1 | 12/1 | 1/1 | 0.00 |

With a two-month holiday, every remaining due date shifts one month later compared with a one-month holiday.

A four-installment loan of 1,000 is disbursed on 1-Aug. The down payment fails, so the principal stays at 1,000 and all four installments of 250 remain due. A two-month payment holiday approved on 5-Aug extends only future installments; the installment already due on 8/1 is not extended.

| Date | Event | Principal | Installment due | Treatment |
| --- | --- | --- | --- | --- |
| 1-Aug | Disbursed | 1,000.00 | 250.00 | Down payment failed |
| 8/1 | Installment 1 due | 1,000.00 | 250.00 | Past due, not extended |
| 5-Aug | Holiday approved | 1,000.00 | - | Maturity moved to 1-Jan |
| 1-Oct | Payment | 500.00 | 250.00 | Principal reduced |
| 1-Nov | Payment | 250.00 | 250.00 | Principal reduced |
| 1-Dec | Payment | 0.00 | 250.00 | Loan repaid |

A four-installment loan of 1,000 is disbursed on 1-Aug. The down payment is completed and then reversed, restoring the principal to 1,000. An NSF fee adds 15 to the penalty balance, making the second installment 265. A real-time payment on 3-Aug reduces the principal to 750 and settles the first installment. A one-month payment holiday approved on 5-Aug extends the remaining installments.

| Date | Event | Principal | Penalty | Installment due | Notes |
| --- | --- | --- | --- | --- | --- |
| 1-Aug | Disbursed | 1,000.00 | 0.00 | 250.00 | - |
| 2-Aug | Down payment reversed | 1,000.00 | 0.00 | 250.00 | Principal restored |
| 2-Aug | NSF fee applied | 1,000.00 | 15.00 | 265.00 | Fee added to installment 2 |
| 3-Aug | Real-time payment | 750.00 | 15.00 | 0.00 | Installment 1 settled |
| 5-Aug | Holiday approved | 750.00 | 15.00 | - | Maturity moved to 1-Dec |
| 1-Oct | Payment | 500.00 | 0.00 | 265.00 | Principal and penalty paid |

See also: [BNPL: Pay in 3 and 4](confluence-link:BNPL#pay-in-3-and-4), [Asset Externalization: Asset Externalization](confluence-link:Asset%20Externalization#asset-externalization).
