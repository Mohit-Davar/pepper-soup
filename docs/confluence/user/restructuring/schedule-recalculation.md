# Schedule Recalculation for Overdue Loans

## Schedule Recalculation for Overdue Loans

### Interest recalculation scope and behavior

Interest recalculation applies to loan accounts with Interest Recalculation enabled when an instalment is not paid on its instalment date. The system recalculates interest for all instalments according to the overdue days and regenerates the repayment schedule. If the loan is not interest-bearing, there is nothing to recalculate.

The recalculation follows these rules:

- Progressive interest-bearing loans handle overdue instalments similarly to cumulative loans when interest recalculation is enabled.
- The recalculation adjusts both the interest and principal portions of instalments according to the daily or same-as-repayment-period strategy.
- Weekly, monthly and mixed strategies are not covered.
- Overdue last instalments are not covered.

### Configuration and COB job setup

Schedule recalculation for overdue loans runs as a configured business step in the Loan COB job. You set interest recalculation as the last step, enable interest recalculation on loans, and set the interest calculation type to DAILY. The step runs at start of business day using the actual business date, after all end of business day business steps.

### Repayment schedule updates and scenarios

The repayment schedule updates after close of business when an installment is overdue, so that repayment amounts stay correct for late repayments and the schedule remains valid for business days.

The schedule updates correctly after COB for the following overdue scenarios:

- One overdue installment.
- Two or more installments overdue in a row.
- Late repayment on the next installment due date.
- Late repayment on a day between the start and due dates.
- Partial late repayment on the same day where the sum of partial repayments fully repays the overdue installment.
- Partial late repayment on different business days during the same installment period.

For the MIXED strategy, the schedule updates correctly after COB for the same overdue scenarios:

- One overdue installment.
- Two or more installments overdue in a row.
- Late repayment on the next installment due date.
- Late repayment on a day between the start and due dates.
- Partial late repayment on the same day where the sum of partial repayments fully repays the overdue installment.
- Partial late repayment on different business days during the same installment period.

For an interest bearing progressive loan with interest recalculation enabled, additional interest on overdue principal is handled and shown on the repayment schedule when the installment becomes overdue.

### Post-maturity late repayment handling

When a borrower makes a late repayment after the maturity date, the system creates a new installment as of the repayment date and calculates interest for the extra days from the last maturity date on the current reducing principal balance. No new installment is created during the end-of-day job, and that job does not add, calculate, or collect interest after maturity. Repayment after maturity collects only the interest in the repayment schedule for the installment being fulfilled. The model holds and calculates overdue interest so payoff calculations are not broken, and creates a new installment only when repayment happens.

The advanced payment processor handles post-maturity repayments as follows:

- Get payable details using the payable details calculator.
- Update the repayment schedule period due principal and due interest.
- Allocate the repayment transaction to that period.
- Call the payable details calculator with paid principal times -1 as a balance correction.
- Update the repayment schedule period again from the model.
- Proceed to the next installment if any unprocessed amount remains.

### Rate factor formulas

The rate factor depends on how often repayments occur: monthly, weekly or daily. Each formula adds one to the product of the interest rate, the repayment frequency, and the ratio of actual days in the period to calculated days in the period.

| Frequency | Rate factor formula |
| --- | --- |
| Monthly | 1 + rate of interest × repaid every × days in month ÷ days in year × actual days in period ÷ calculated days in period |
| Weekly | 1 + rate of interest × 7 × repaid every ÷ days in year × actual days in period ÷ calculated days in period |
| Daily | 1 + rate of interest × repaid every ÷ days in year × actual days in period ÷ calculated days in period |

### Worked examples

A customer takes a 900 loan with 12% annual interest, repaid in three equal monthly installments over 30-day months. Interest recalculation is enabled, but every installment is paid on time, so the schedule remains as originally generated. The figures are illustrative. On-time payments keep the original schedule unchanged.

| Installment | Due date | Opening balance | Interest | Principal | Closing balance |
| --- | --- | --- | --- | --- | --- |
| 1 | Feb 1 | 900.00 | 9.00 | 297.02 | 602.98 |
| 2 | Mar 1 | 602.98 | 6.03 | 299.99 | 302.99 |
| 3 | Apr 1 | 302.99 | 3.03 | 302.99 | 0.00 |
| Total |  |  | 18.06 | 900.00 |  |

The second installment of 306.02, due on Mar 1, is not paid. Interest recalculation is enabled. On Mar 11, ten days after the due date, the system recalculates interest on the overdue principal of 299.99. Under the daily strategy, interest is charged for the ten actual overdue days. Under the same-as-repayment-period strategy, interest is charged for the full 30-day period. With the same-as-repayment-period setting, the borrower pays 2.00 more in overdue interest because the full month is charged instead of the actual ten days.

| Step | Description | Daily strategy | Same-as-repayment-period |
| --- | --- | --- | --- |
| 1 | Overdue principal on Mar 1 | 299.99 | 299.99 |
| 2 | Overdue days | 10 | 30 |
| 3 | Interest on overdue principal | 1.00 | 3.00 |
| 4 | Added to amount due | 1.00 | 3.00 |

The second installment of 306.02, due Mar 1, remains unpaid. On Mar 11 the customer pays 150.00. The system calculates interest on the overdue principal for the days it was outstanding, applies the payment to interest first and then to principal, and reduces the balance. On Mar 20 the customer pays the remaining amount, and the schedule is closed. Each partial payment reduces the overdue principal, so interest for the remaining days is calculated on a smaller balance.

| Payment date | Amount paid | Interest cleared | Principal cleared | Balance after payment |
| --- | --- | --- | --- | --- |
| Mar 11 | 150.00 | 1.00 | 149.00 | 150.99 |
| Mar 20 | 151.44 | 0.45 | 150.99 | 0.00 |

See also: [Backdated Loans: Backdated Loans](confluence-link:Backdated%20Loans#backdated-loans), [Interest Calculation: EMI Calculation](confluence-link:Interest%20Calculation#emi-calculation), [Interest Timing: Early and Late Repayment Interest](confluence-link:Interest%20Timing#early-and-late-repayment-interest), [Loan Payoff: Loan Payoff](confluence-link:Loan%20Payoff#loan-payoff).
