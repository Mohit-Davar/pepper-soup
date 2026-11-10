# Payment Holidays

## Payment Holidays

A payment holiday moves future installments on a loan account according to the holiday period and reschedules the maturity date accordingly. It applies on an installment due date and cannot be set on a backdated date or after the maturity date.

The following rules apply when a payment holiday is applied:

- Future installments are moved according to the holiday period; installments already due are not extended.
- The down-payment installment is not affected.
- The N+1 installment is treated as a regular installment and is rescheduled according to the holiday set.
- Fee and penalty due dates in the future move forward to the next payment due date.
- Delinquency and pause calculations are independent and handled automatically.
- Account changed events are triggered when payment holidays are applied.

For multi-disbursement loans, the payment holiday date depends on the status of the down payments:

- If the first down payment is past due and the second down payment is received, apply the payment holiday on the date of the second down payment.

After a payment holiday is approved, an API call can update the following dates:

- Repayment next due date.
- Remaining schedule payment due dates.
- Maturity date.

A customer borrows 1,200 and repays it in four equal monthly installments of 300. The installments fall due on 1 April, 1 May, 1 June, and 1 July, and the loan matures on 1 July. Before any installment is due, the officer approves a one-month payment holiday on 15 March. The figures in this example are illustrative.

| Installment | Original due date | New due date | Amount | Balance after payment |
| --- | --- | --- | --- | --- |
| 1 | 1 April | 1 May | 300.00 | 900.00 |
| 2 | 1 May | 1 June | 300.00 | 600.00 |
| 3 | 1 June | 1 July | 300.00 | 300.00 |
| 4 | 1 July | 1 August | 300.00 | 0.00 |
| Maturity | 1 July | 1 August | — | — |

If the approved holiday is two months instead of one, every future due date and the maturity date shift by two months rather than one.

A customer borrows 1,200 and repays it in four equal monthly installments of 300 due on 1 April, 1 May, 1 June, and 1 July, maturing on 1 July. The first installment remains unpaid when it becomes due on 1 April. On 15 April, with that installment already overdue, the officer approves a two-month payment holiday. The overdue installment keeps its original date, while later installments move forward by two months.

| Installment | Original due date | New due date | Amount | Balance after payment |
| --- | --- | --- | --- | --- |
| 1 | 1 April | 1 April | 300.00 | 900.00 |
| 2 | 1 May | 1 July | 300.00 | 600.00 |
| 3 | 1 June | 1 August | 300.00 | 300.00 |
| 4 | 1 July | 1 September | 300.00 | 0.00 |
| Maturity | 1 July | 1 September | — | — |

A customer borrows 1,200 and repays it in four monthly installments of 300 due on 1 April, 1 May, 1 June, and 1 July, maturing on 1 July. A 15 fee is added to the second installment, so its amount becomes 315. After the first installment is paid on 1 April, the officer approves a one-month payment holiday on 15 April. The second installment moves to 1 June and keeps the 315 amount, while the remaining installments move forward by one month and the fee is settled with that installment.

| Installment | Original due date | New due date | Amount | Balance after payment |
| --- | --- | --- | --- | --- |
| 1 | 1 April | 1 April | 300.00 | 900.00 |
| 2 | 1 May | 1 June | 315.00 | 600.00 |
| 3 | 1 June | 1 July | 300.00 | 300.00 |
| 4 | 1 July | 1 August | 300.00 | 0.00 |
| Maturity | 1 July | 1 August | — | — |
