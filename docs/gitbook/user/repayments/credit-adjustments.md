# Credit Adjustments

## Credit Adjustments

A credit adjustment records a charge against a loan account. You can add a loan charge to a closed, overpaid, or matured loan. If a closed loan receives a charge, it reopens as an outstanding balance occurs. If an overpaid loan receives a charge and the overpaid amount is greater than the charge amount, it remains overpaid.

Payment allocation rules determine how monies are applied:

- Monies apply to the interest balance of a single amount due first, from the oldest due amount to the most current due amount.
- For future balances, monies apply to principal balances only.
- Where applicable, future interest accrued but not yet due can be satisfied, such as in early payoff.
- Rules define how many future payments are satisfied before triggering a re-amortization of the repayment schedule.
- Rules define whether monies apply to the next installment due or the last installment due.

Interest calculation rules include:

- For interest bearing loans with decreasing balance and Equal Installments (Daily) interest calculation, interest is calculated properly for the installments.
- For each normal repayment installment, interest is calculated based on the outstanding balance.
- Advance payment allocation disbursement supports decreasing balance interest calculation.
- Interest is not allocated for the down-payment installment when down-payment installment is enabled.

Pre-closure interest calculation rules define when interest stops calculating:

- Calculate till pre closure date calculates interest till the closing date; for example, if the loan closing date is 20th February, interest is calculated till 20th February.
- Calculate till rest frequency date calculates interest till the rest period; for example, if the loan closing date is 20th February, interest is calculated till the repayment period due date.

A refund is any type of credit adjustment.

Charge adjustment transactions appear in the UI as follows:

- A charge adjustment transaction button is added to the UI to invoke the charge-adjustment transaction.
- A charge adjustment transaction row in the transaction tab has the undo button enabled and the edit and charge-back buttons disabled.
- A reversed charge adjustment transaction row has the undo, edit, and charge-back buttons all disabled.
- Clicking a charge adjustment transaction row shows the linked loan charge account.

Figures are illustrative. A loan officer disburses a declining-balance loan of 1,200 at 12 percent per year, to be repaid in three equal monthly installments over 30-day months. Interest is calculated on the outstanding balance at the start of each month, and the first installment falls due one month after disbursement. If an additional disbursement is made after the first installment, the opening balance for the next installment rises and its interest charge increases accordingly.

| Installment | Opening balance | Interest | Principal paid | Closing balance |
| --- | --- | --- | --- | --- |
| 1 | 1,200.00 | 12.00 | 396.02 | 803.98 |
| 2 | 803.98 | 8.04 | 399.98 | 404.00 |
| 3 | 404.00 | 4.04 | 404.00 | 0.00 |
| Total |  | 24.08 | 1,200.00 |  |

A loan officer disburses a 1,000 loan at 12 percent per year with three equal monthly installments. After the first installment, the borrower makes a partial repayment before the next due date, and the remaining schedule is re-amortized over the two months left. If a partial repayment is made before the next due date, the balance falls and the remaining installments are re-amortized, so later interest is lower.

| Event | Opening balance | Interest | Principal paid | Closing balance |
| --- | --- | --- | --- | --- |
| 1st installment | 1,000.00 | 10.00 | 330.02 | 669.98 |
| Partial repayment | 669.98 | 0.00 | 200.00 | 469.98 |
| 2nd installment | 469.98 | 4.70 | 233.82 | 236.16 |
| 3rd installment | 236.16 | 2.36 | 236.16 | 0.00 |
| Total |  | 17.06 | 1,000.00 |  |
