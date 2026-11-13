# Next and Last Installment Allocation

The Next/Last Installment allocation rule decides how an advance payment is split between the next installment and the last installment of a loan. You use it when a repayment arrives before its due date and you want the excess to reduce future installments rather than the current one. The configuration is available to select the Next/Last Installment option for advance amount allocation.

Allocation order:

- Overdue interest, overdue principal, overdue fees, due interest, due principal, due fees, advance principal, advance interest, advance fees.

How the next installment is chosen:

- If the repayment date is before the current installment due date, the current installment is the next installment.
- If the repayment date is on the current installment due date, the upcoming next installment is the next installment.

How an advance amount allocates:

- Any advance amount first allocates to the next installment and the remaining amount allocates to the last installment.
- If the advance amount arrives on the next installment date itself, it allocates to that current installment first and the remaining amount allocates to the last installment.
- Once allocated to the next installment, allocation jumps to the last installment and allocates from behind (last, then last but one, then last but two, and so on).

What happens when the current installment is fully paid:

- The Last rule allocates any in-advance portions to the last installment as the last installment strategy.

> **Note:** There is always a next installment under the Next-Last allocation rule, and there are no changes regarding the last installment.

An early payment arrives before the first installment is due. The loan has a principal of 1,000.00, an annual interest rate of 12 percent, and four monthly installments with 30-day months. The installments are due on the first day of each of the next four months. The customer pays 600.00 on the fifteenth day of the month before the first due date, so the first installment is the next installment and the fourth installment is the last installment. The figures are illustrative. The example shows that an early payment clears the next installment first and then fills installments backward from the last.

| Installment | Due | Allocated | Remaining payment |
| --- | --- | --- | --- |
| Installment 1 (next) | 260.00 | 260.00 | 340.00 |
| Installment 4 (last) | 252.50 | 252.50 | 87.50 |
| Installment 3 (last but one) | 255.00 | 87.50 | 0.00 |

A payment arrives exactly on the first installment's due date. The loan has a principal of 1,000.00, an annual interest rate of 12 percent, and four monthly installments with 30-day months. The installments are due on the first day of each of the next four months. The customer pays 600.00 on the first day of Month 1, which is the due date of Installment 1; Installment 2 is the upcoming next installment and Installment 4 is the last installment. Under the earlier configuration the excess after Installment 1 went directly to the last installment; the current configuration fills the next installment before reaching the last.

| Installment | Due | Allocated | Remaining payment |
| --- | --- | --- | --- |
| Installment 1 (current) | 260.00 | 260.00 | 340.00 |
| Installment 2 (next) | 257.50 | 257.50 | 82.50 |
| Installment 4 (last) | 252.50 | 82.50 | 0.00 |
