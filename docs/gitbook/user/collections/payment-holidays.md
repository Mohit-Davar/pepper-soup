# Payment Holidays

A payment holiday defers repayments without classifying the account as delinquent. Future installments move forward according to the holiday period, and the maturity date reschedules accordingly. The down-payment installment is not affected. Payment holidays do not change the Effective Interest Rate calculation or amortization and income recognition calculations.

Rules and limits:

- You can apply multiple payment holiday periods to one account.
- Payment holiday periods must not overlap; the system validates this.
- The system allows backdated payment holiday entries.
- Delinquency and pause calculations are handled automatically because future installments move as per the holiday period.
- For past-due installments, installments already due are not extended; only future installments are extended.
- For multi-disbursement loans where the first down payment is past due and the second down payment is received, apply the payment holiday on the date of the second down payment.
- Repayment due notification configuration can be set at product level and defaults to the global default.
- The N+1 installment is treated as a regular installment while applying the holiday and is rescheduled as per the holiday set.
- For a 1-month payment holiday with fees, fee/penalty due dates in the future will also get moved forward to the next payment due date.

Holiday length and supported updates:

| Holiday length | Updates supported |
| --- | --- |
| 1-month payment holiday | Repayment next due date, remaining schedule payment due dates, and maturity date |
| 2-month payment holiday | Repayment next due date, remaining schedule payment due dates, and maturity date |

> **Note:** A payment holiday applies on an installment due date and cannot be applied after the maturity date.

Figures in this example are illustrative. A four-installment loan with a 25 percent down payment is created and disbursed on 1 August with a principal balance of 1,000 and a maturity date of 1 November. Installments are due on 8/1, 9/1, 10/1 and 11/1, each for 250. After the down payment, the principal balance is 750, the installment due 8/1 is 0, and the installments due 9/1, 10/1 and 11/1 are each 250. A one-month payment holiday is approved on 5 August. The maturity date moves to 1 December, the installment due 8/1 remains 0, and the installments now due 10/1, 11/1 and 12/1 are each 250. Autopayments on 1 October, 1 November and 1 December then reduce the principal balance to 500, 250 and finally 0. With a two-month holiday instead, the same future installments fall on 11/1, 12/1 and 1 January and maturity moves to 1 January. This example shows how a payment holiday defers future installments without marking the account delinquent and moves the maturity date with the schedule.

| Due date | Amount due | Principal paid | Principal balance |
| --- | --- | --- | --- |
| 8/1 | 0.00 | 0.00 | 750.00 |
| 10/1 | 250.00 | 250.00 | 500.00 |
| 11/1 | 250.00 | 250.00 | 250.00 |
| 12/1 | 250.00 | 250.00 | 0.00 |
| Total | 750.00 | 750.00 | — |

A down payment fails, so the principal balance remains 1,000 and the installments due 8/1, 9/1, 10/1 and 11/1 are each 250. A two-month payment holiday is approved on 5 August while the 8/1 installment is past due. The past-due installment is not extended; only future installments are moved. The maturity date moves to 1 January, the installment due 8/1 remains 250, and the installments now due 11/1, 12/1 and 1 January are each 250. This shows that installments already due when the holiday starts stay on their original dates, while only future installments are rescheduled.

| Due date | Amount due | Treatment | Principal balance |
| --- | --- | --- | --- |
| 8/1 | 250.00 | Past due; not extended | 1,000.00 |
| 11/1 | 250.00 | Moved forward by holiday | 1,000.00 |
| 12/1 | 250.00 | Moved forward by holiday | 1,000.00 |
| 1/1 | 250.00 | Moved forward by holiday | 1,000.00 |
| Total | 1,000.00 | — | — |

A four-installment loan with a 25 percent down payment is created and disbursed on 1 August with a principal balance of 1,000 and a maturity date of 1 November. Installments are due on 8/1, 9/1, 10/1 and 11/1, each for 250. After the down payment is reversed, the principal balance returns to 1,000. An NSF fee of 15 is added to the penalty balance, so the installment due 9/1 becomes 265 while the others remain 250. A real-time payment on 3 August brings the principal balance to 750 and leaves the penalty balance at 15; the installment due 8/1 is 0, the installment due 9/1 is 265, and the installments due 10/1 and 11/1 are each 250. A one-month payment holiday approved on 5 August moves the penalty with the future installments: the maturity date becomes 1 December, the installment due 8/1 is 0, and the installments now due 10/1, 11/1 and 12/1 are 265, 250 and 250 respectively. Autopayments on 1 October, 1 November and 1 December then clear the schedule to a principal balance of 0 and a penalty balance of 0. This shows that future fees and penalties move with the rescheduled installments and are cleared when that installment is paid.

| Due date | Amount due | Principal paid | Penalty paid | Principal balance | Penalty balance |
| --- | --- | --- | --- | --- | --- |
| 8/1 | 0.00 | 0.00 | 0.00 | 750.00 | 15.00 |
| 10/1 | 265.00 | 250.00 | 15.00 | 500.00 | 0.00 |
| 11/1 | 250.00 | 250.00 | 0.00 | 250.00 | 0.00 |
| 12/1 | 250.00 | 250.00 | 0.00 | 0.00 | 0.00 |
| Total | 765.00 | 750.00 | 15.00 | — | — |
