# Interest-Bearing Loans

## Interest-Bearing Loan Products

Interest-bearing loan products support progressive configurations with validations that apply only to that setup. You can set or update allocation rules for these products.

Multidisbursal progressive loans follow these rules:

- A loan configured with one tranche allows creating two or more disbursements, such as 70$ and 30$, when 'Disallow Expected Disbursements' is disabled at loan level.
- Undoing the last disbursement returns a 403 error when the number of disbursements exceeds the number of tranches configured with disbursement details.

Charge-off behaves as follows:

- Charge-off is prevented if there is any transaction after the charge-off date, but reversed transactions are excluded from this check.
- After a charge is waived and the waive loan charges transaction is undone, charge-off with an earlier date is allowed even though the charge still exists.
- The charge-off transaction is reversed if the amount balance becomes zero after reprocessing.

Interest and chargeback rules include:

- Interest pause is forbidden for a progressive loan with interest recalculation enabled and interest rate zero.
- When a CBR is replayed and the overpayment amount is not lower than the CBR amount, the system reflects it as credit on the EmiModel and calculates interest based on the outstanding amount.
- CBR behaves like Chargeback, so the actual current installment EMI gets increased.
- Each day the 1st installment interest gets recalculated until the maturity date is reached.
- When CBR is more than the overpayment amount, the loan schedule is credited with the difference between CBR amount and overpayment amount, which in this situation is 100.

Penalty accrual follows this schedule:

- The Accrual for penalty is created during COB along with Accrual activity.
- Five or any random number of days later, when a repayment is made to pay off the penalty, the backdated accrual is created along with this repayment.

Static limits and dates apply to interest-bearing loan products.

| Setting | Value |
| --- | --- |
| Effective Rate Limit | 0.09995 |
| Loan Start Date | 1/1/23 |
| Transaction Range | 0.01 - 98.99 |

PayPal currently has two consumer-facing interest-bearing longer term installment lending products that are live in US and German markets.

A product administrator creates an interest-bearing loan product with a principal of 1,000 and a term of three months. The system compares the effective rate against the effective rate limit of 0.09995. The figures are illustrative. This example shows that rates at or below the limit are accepted, while rates above it are rejected, and that tightening the limit rejects more rates.

| Limit | Nominal rate | Effective rate | Result |
| --- | --- | --- | --- |
| 0.09995 | 0.0900 | 0.0900 | Accepted |
| 0.09995 | 0.1050 | 0.1050 | Rejected |
| 0.09990 | 0.09985 | 0.09985 | Accepted |
| 0.09990 | 0.1050 | 0.1050 | Rejected |

A loan officer disburses an interest-bearing loan of 300 with three monthly installments. The borrower repays 100 and then reverses that repayment. Interest accruals do not restart on the reversal date; they resume from the next scheduled repayment date and continue daily until maturity. This example shows that reversing a repayment does not move accruals back to the reversal date.

| Business date | Event | Principal balance | Accrual status |
| --- | --- | --- | --- |
| Day 1 | Loan disbursed | 300.00 | Accruals start |
| Day 5 | Repayment of 100.00 | 200.00 | Accruals continue |
| Day 15 | Repayment reversed | 300.00 | Reversal date recorded |
| Day 22 | COB run | 300.00 | Accruals resume from next schedule date |
| Day 23 | Daily COB | 300.00 | Accrual posted each day |

An interest-bearing loan of 1,000 with three monthly installments reaches maturity. The borrower pays off the principal with a 1,000 repayment on the maturity date, and a penalty charge of 20 is added the same day. At end-of-day processing, the system creates a penalty accrual even though the principal balance is zero. Five days later the borrower repays the penalty, and a backdated accrual is created with that repayment. This example shows that penalty accrual is generated during COB on the maturity date and that a later penalty repayment creates a backdated accrual.

| Date | Event | Principal balance | Penalty balance | Accrual created |
| --- | --- | --- | --- | --- |
| Maturity date | Repayment of 1,000.00 | 0.00 | 0.00 | No |
| Maturity date | Penalty charge of 20.00 | 0.00 | 20.00 | No |
| Maturity date | End-of-day COB | 0.00 | 20.00 | Yes |
| Five days later | Repayment of 20.00 | 0.00 | 0.00 | Yes (backdated) |

A loan officer enters a transaction for a three-month loan of 100 at a nominal rate that produces an effective rate above the 0.09995 limit. The system rejects the total amount of 105. When the rate is lowered so the effective rate falls below the limit, the new total amount is 104, a difference of 1 cent. This example shows that exceeding the effective rate limit forces a rate adjustment that changes the collected total by one cent.

| Case | Nominal rate | Effective rate | Total amount | Result |
| --- | --- | --- | --- | --- |
| Rejected transaction | 0.1200 | 0.1050 | 105.00 | Rejected |
| Accepted transaction | 0.0945 | 0.0609 | 104.00 | Accepted |
| Difference | - | - | 1.00 | 1 cent |
