# Loan Payoff

## What pay-off is and when to use it

Pay-off is a repayment done as of the current date, with interest calculated as of that date.

## Pay-off amount and calculation

The pay-off amount is the exact amount required to close the loan. It includes total outstanding principal, fees, and penalties as of the transaction date.

The calculation includes:

- All outstanding balances calculated up to the pay-off date or the end of the pay-off period due date, based on configuration.
- Outstanding balances of all past due installments, not only the current period's payable details.

Special cases:

- If the transaction date is on or before the first disbursement date, all principal is due but no interest for an interest-bearing loan product.
- If the transaction date is on or after the maturity date, all outstanding balances are due.

## Interest recalculation for pay-off

Interest recalculation decides how much interest you pay when you pay off a loan. When it is disabled, you pay the full principal, calculated interest, and fees, and payable interest is the same whether pay-off happens mid-lifecycle or on the maturity date. When it is enabled, you pay the full principal and interest recognized only until the pay-off date.

For progressive loans:

- With interest recalculation enabled, payable interest until the pay-off date is calculated, the current installment is modified, and interest from upcoming installments is lifted if the transaction amount covers the outstanding principal on that installment.
- With interest recalculation disabled, the pay-off amount is allocated across each installment instead of modifying the current period to reflect the full amount paid.

## Pay-off status and accounting

When a loan is marked Pay-off, its status changes to closed. The accounting entry for a pay-off transaction is the same as for a repayment transaction.

## Transactions on a paid-off loan

You can disburse funds on a pay-off loan account. Chargeback is not allowed yet.

## Backdated pay-off and reverse replay

A backdated pay-off or the reversal of an older transaction triggers reverse replay of the loan account, and the system updates the loan status accordingly. When backdated pay-off happens, the system reverts accrual transactions that occurred after that date.

## Pay-off timing and editability

You can request a pay-off as of any date from the last repayment date up to the current date. The system calculates and collects interest as of the pay-off date you enter. You cannot edit the calculated pay-off values.

## Prepayment

You can prepay a Working Capital loan by repaying the full outstanding balance. After successful prepayment processing, the outstanding balance becomes zero and the loan is closed (fully paid).

Prepayment rules:

- Reversal of prepayments is supported.
- Backdated prepayments are supported.
- The prepayment date cannot be earlier than the latest payment transaction date.
- The prepayment date cannot be in the future.

> **Note:** Pay-off of the complete amount including interest till the pay-off date is marked TEST.

## Repayment rules

Repayment calculates interest using the current amortization schedule plus the full repayment amount. Backdated repayment does not apply to Repayment. Repayment on a closed loan is treated as an overpayment and moves the loan to overpaid status.

## Working capital N+1 installments

When you add a charge after the maturity date, the system creates an N+1 installment if one does not already exist. Only a repayment made after the due date pays this installment. The maturity date stays unchanged. This applies to working capital loans in CLOSED or OVERPAID status.

## Rounding and product-specific behavior

Rounding up according to the installmentAmountInMultipleOf setting applies to equal installments with flat interest and equal installments with declining balance interest.

For loans with the PIN4_DOWNPAYMENT_AUTO_ADVANCED_PAYMENT_ALLOCATION product, after a charge back of the last transaction, another repayment does not throw an NPE and the repayment transaction is created successfully.

## Rate factor accrual

Rate factor accrual is an alternative to accruing interest based on interest due divided by the number of days.

## UI prepayment flow

You can trigger a full repayment (prepayment) transaction from the UI on an active loan account.

## Worked examples

A customer requests a payoff on day 30 of a 1,000.00 principal loan at 12.00% per annum with 3 monthly installments and 30-day months; the figures are illustrative. Interest recalculation may be disabled or enabled, and the payoff amount is the outstanding principal plus applicable interest. With recalculation disabled the borrower pays the full 30.00 term interest even though only one month has elapsed; with it enabled the borrower pays only the 10.00 interest recognized until the payoff date.

| Component | Recalculation disabled | Recalculation enabled |
| --- | --- | --- |
| Outstanding principal | 1,000.00 | 1,000.00 |
| Interest for full term (3 months) | 30.00 | — |
| Interest till payoff date (1 month) | — | 10.00 |
| Fees and penalties | 0.00 | 0.00 |
| Payoff amount | 1,030.00 | 1,010.00 |
| Principal after payoff | 0.00 | 0.00 |
| Loan status | Closed | Closed |

The same loan is now past due: installment 1, due on day 30, remains unpaid when the payoff is requested on day 60. Interest recalculation is enabled, and the payoff amount is allocated across each installment. The payoff amount includes the unpaid balances of installments 1 and 2 rather than only the current period, so the loan closes with zero outstanding principal and interest.

| Installment | Due date | Status | Principal | Interest | Total |
| --- | --- | --- | --- | --- | --- |
| Installment 1 | Day 30 | Past due | 300.00 | 9.00 | 309.00 |
| Installment 2 | Day 60 | Due | 300.00 | 9.00 | 309.00 |
| Installment 3 | Day 90 | Upcoming | 300.00 | 0.00 | 300.00 |
| Payoff total |  |  | 900.00 | 18.00 | 918.00 |
