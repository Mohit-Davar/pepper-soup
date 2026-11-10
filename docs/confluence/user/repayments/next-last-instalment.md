# Next and Last Instalment Allocation

## Next and Last Instalment Allocation

The Next / Last installment option controls how an advance payment is allocated under the Future Installment allocation rule of the Advanced payment allocation strategy. You select this option in the Advance amount allocation configuration. The rule always identifies a next installment; the last installment behaviour is unchanged.

The system allocates an advance amount as follows:

- Any advance amount first allocates to the next installment, and any remaining amount allocates to the last installment.
- If the repayment date falls on the next installment date itself, the amount allocates to that current installment first, and the remaining amount allocates to the last installment.
- If the repayment date is before the current installment due date, the current installment behaves as the next installment.
- If the repayment date is on the current installment due date, the upcoming next installment is the next installment.
- Once allocated to the next installment, allocation jumps to the last installment and allocates from behind: last, last but one, last but two, and so on.

When the current installment is fully paid, the system applies the Last installment strategy as follows:

- Any advance portions allocate to the last installment.
- If the repayment date is on the current installment due date, the Next rule is skipped and any advance portions allocate as the Last installment strategy.

| Allocation order |
| --- |
| Overdue interest, overdue principal, overdue fees, due interest, due principal, due fees, advance principal, advance interest, advance fees |

Figures in this example are illustrative. A loan of 1,200.00 is repaid in four monthly installments of 300.00 each, with 30-day months. An advance payment of 500.00 arrives ten days before the first installment is due. With the Next / Last option selected, the first installment is treated as the next installment, so the advance covers it in full and the remaining 200.00 is applied to the last installment.

| Installment | Due | Advance applied | Still due |
| --- | --- | --- | --- |
| 1 | 300.00 | 300.00 | 0.00 |
| 2 | 300.00 | 0.00 | 300.00 |
| 3 | 300.00 | 0.00 | 300.00 |
| 4 | 300.00 | 200.00 | 100.00 |
| Total | 1,200.00 | 500.00 | 700.00 |

The advance clears the next installment first and reduces the last installment by the remainder.

A loan of 1,200.00 is repaid in four monthly installments of 300.00 each. An advance payment of 700.00 arrives before the first installment is due. The next installment is covered first, and the remaining 400.00 fills the last installment and then moves one step backward to the third installment.

| Installment | Due | Advance applied | Still due |
| --- | --- | --- | --- |
| 1 | 300.00 | 300.00 | 0.00 |
| 2 | 300.00 | 0.00 | 300.00 |
| 3 | 300.00 | 100.00 | 200.00 |
| 4 | 300.00 | 300.00 | 0.00 |
| Total | 1,200.00 | 700.00 | 500.00 |

If the same 700.00 is paid on the due date, the next rule is skipped and the full amount clears the last two installments and reduces the second installment by 100.00.

A loan of 1,000.00 is repaid in four monthly installments of 250.00 each. An advance payment of 600.00 is made on the first installment due date. Because the payment date is a due date, the next rule is skipped and the last rule applies, so the amount is allocated to the last installments starting from the end.

| Installment | Due | Advance applied | Still due |
| --- | --- | --- | --- |
| 1 | 250.00 | 0.00 | 250.00 |
| 2 | 250.00 | 100.00 | 150.00 |
| 3 | 250.00 | 250.00 | 0.00 |
| 4 | 250.00 | 250.00 | 0.00 |
| Total | 1,000.00 | 600.00 | 400.00 |

The payment skips the next installment, clears the last two installments, and applies 100.00 to the second installment.

See also: [Payment Allocation Strategies: Payment Allocation Strategies](confluence-link:Payment%20Allocation%20Strategies#payment-allocation-strategies).
