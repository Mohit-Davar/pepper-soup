# Loan Payoff

## Loan Payoff

### Pay-off definition and scope

A pay-off is a repayment done as of the current date with interest calculated as of that date. It can be done as of any date from the last repayment date till the current date.

The pay-off amount includes:

- all principal, interest, fee, and penalty balances
- any accrued interest through the current day
- the pay-off amount required to close the loan on that day

For PIN30 product with 6 installments and advanced payment allocation, the loan balance must be 0 at the end of the repayment schedule.

The system calculates and collects the interest as of the pay-off date entered.

### Pay-off status and accounting

Marking a loan as Pay-off closes the loan status. A backdated pay-off triggers reverse replay of the loan account, updates the loan status accordingly, and reverts accrual transactions that occurred after that date.

The following rules apply to pay-off accounting and transactions:

- The accounting entry of a pay-off transaction is the same as of a repayment transaction.
- Disbursement chargeback is not allowed yet on the pay-off loan account.

### Interest recalculation rules

Interest recalculation decides how much interest is payable when you pay off a loan before maturity.

When interest recalculation is disabled:

- You must pay the full principal, calculated interest, fees, and other amounts to fully pay off the loan.
- Payable interest is the same whether you pay off the loan in the middle of its lifecycle or on the maturity date.

When interest recalculation is enabled:

- You must pay the full principal and the calculated interest up to the pay-off date to fully pay off the loan.
- Payable interest is only the recognized interest up to the pay-off date, so it matters whether you pay off in the middle of the lifecycle or on the maturity date.

For progressive loans:

- When interest recalculation is disabled, the pay-off amount is allocated across each installment rather than modifying the current period to reflect the full amount paid.
- When interest recalculation is enabled, payable interest is calculated up to the pay-off date, the current installment is modified, and interest from upcoming installments is lifted if the transaction amount is enough to fully pay the outstanding principal on that installment.

### Pay-off amount calculation

The pay-off amount is the exact amount required to close the loan as of the transaction date. It equals total outstanding principal plus fees plus penalties. The calculation includes all outstanding balances calculated up to the pay-off date or the end of the pay-off period due date, depending on configuration, and adds all past due installment outstanding balances rather than only the current period's payable details.

Special conditions apply at the start and end of the loan term:

- If the transaction date is on or before the first disbursement date, all principal must be paid but no interest for an interest-bearing loan product.
- If the transaction date is on or after the maturity date, all outstanding balances must be paid.
- The advanced payment allocation processor decides whether repayment starts from the next installment or the last installment.

### Pay-off results and prepayment

A pay-off result equals the outstanding loan amount, and after prepayment the loan is closed. You cannot edit calculated payoff values.

Prepayment follows these rules:

- A Working Capital loan can be prepaid by repaying the full outstanding balance.
- Prepayment uses the Repayment allocation strategy and the same accounting treatment as repayments.
- Reversals of prepayments are supported.
- Backdated prepayments are supported.
- The prepayment date cannot be earlier than the latest payment transaction date.
- The prepayment date cannot be in the future.
- After successful prepayment processing, the outstanding balance becomes zero and the loan is closed.

### User interface and API access

You can pay off or prepay an active loan account from the user interface or through the API. The repayment view pre-fills the transaction amount using the prepayment amounts endpoint.

The following actions are available for an active loan account:

- Pay off or prepay from the user interface.
- Undo the pay-off or prepayment transaction from the transaction tab.
- Trigger a full repayment (prepayment) transaction from the user interface.
- Perform a pay-off transaction through the API.

The API works as follows:

- The GET endpoint fetches prepayment amounts, including principal, fee, penalty and total.
- The existing repayment endpoint is used for prepayment.

### Worked examples

A customer takes a loan of 1,000 at 12 percent annual interest, repayable in three monthly installments over 30-day months. The figures are illustrative. After the first installment is paid, the outstanding principal is 700. Fifteen days later, the customer requests a payoff. The system adds the outstanding principal and the interest that has accrued since the last installment, then closes the loan once the payoff is received.

| Date | Event | Principal paid | Interest paid | Balance |
| --- | --- | --- | --- | --- |
| Day 30 | Installment 1 paid | 300.00 | 10.00 | 700.00 |
| Day 45 | Payoff | 700.00 | 3.50 | 0.00 |
| Total |  | 1,000.00 | 13.50 |  |

The same loan of 1,000 at 12 percent annual interest is set up with interest recalculation disabled. When the customer requests a payoff on day 45, the system does not prorate interest for the partial month. Instead, it collects the full remaining scheduled interest, so the amount due is higher than when recalculation is enabled.

| Date | Event | Principal paid | Interest due | Balance |
| --- | --- | --- | --- | --- |
| Day 30 | Installment 1 paid | 300.00 | 10.00 | 700.00 |
| Day 45 | Payoff | 700.00 | 11.00 | 0.00 |
| Total |  | 1,000.00 | 21.00 |  |

A loan of 1,000 has its first installment of 275, made up of 250 principal and 25 interest, past due. The customer requests a payoff 30 days after the installment was due. The system adds the entire past due installment balance, the remaining principal not yet due, and the interest that has accrued on that remaining principal since the due date.

| Date | Event | Principal | Interest | Total due | Balance |
| --- | --- | --- | --- | --- | --- |
| Day 30 | Installment 1 past due | 250.00 | 25.00 | 275.00 | 1,000.00 |
| Day 60 | Payoff | 750.00 | 7.50 | 757.50 | 0.00 |
| Total |  | 1,000.00 | 32.50 | 1,032.50 |  |

A loan of 1,000 is disbursed on day 1 and the customer requests a payoff on the same day. Because the transaction date is on or before the first disbursement date, the customer must repay the full principal and no interest is charged.

| Date | Event | Principal paid | Interest paid | Balance |
| --- | --- | --- | --- | --- |
| Day 1 | Disbursement | — | — | 1,000.00 |
| Day 1 | Payoff | 1,000.00 | 0.00 | 0.00 |
| Total |  | 1,000.00 | 0.00 |  |
