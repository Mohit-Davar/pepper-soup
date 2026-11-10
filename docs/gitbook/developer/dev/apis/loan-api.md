# Loan API

## Loan API

### Loan API response fields

Field names in the GET Loan API response are camelCase. The GET Loan by ID/external-id API returns additional interest-related fields, including norminal_interest_rate, total_unpaid_posted_interest, total_unpaid_accrued_interest, total_interest, delinquent_interest, total_interest_refunds, total_interest_payment_waiver, totalUnpaidAccruedDueInterest, totalUnpaidAccruedNotDueInterest, delinquentInterest, delinquentFee, totalInterestRefund, totalInterestPaymentWaiver, totalUnpaidPayableDueInterest, and totalUnpaidPayableNotDueInterest. Delinquency includes interest, fee, penalty, and principal portions.

| Field | Example value |
| --- | --- |
| proposedPrincipal | 500.000000 |
| approvedPrincipal | 450.000000 |
| principal | 500.000000 |
| netDisbursalAmount | 250.00 |

### Down payment configuration

You can enable or disable down payment at the loan account level through the loan account create and modify APIs. Down payment can only be set and configured on the loan level when it is set and enabled on the loan product.

The following rules apply to down payment overrides:

- The enableDownPayment override is allowed only when down payment is configured on the loan product but disabled during loan submission.
- If enableAutoRepaymentForDownPayment or disbursedAmountPercentageForDownPayment is provided, those values override the loan product values.
- If either field is not provided, the values set on the loan product are used.

### Down payment fields in create loan API

The POST create loan API accepts down payment fields that control whether a loan is treated as a down payment loan and how its principal is set.

The API supports the following down payment fields:

- enableDownPayment (also written as enableDownpayment) decides dynamically whether the loan is a down payment loan.
- enableAutoRepaymentForDownPayment controls automatic repayment for down payment loans.
- disbursedAmountPercentageForDownPayment sets the disbursed amount as a percentage for down payment loans.
- interestRatePerPeriod sets the nominal interest rate per period.

For WC loans, database fields m_wc_loan.principal_amount_proposed, m_wc_loan.approved_principal and m_wc_loan.principal_amount hold proposed, approved and principal amounts respectively.

For WC loans, lastPaymentDate and lastPaymentAmount are not exposed via GetLoan API or via GET delinquency-range-schedule, GET delinquencyrangetags, GET breach-schedule, unlike non-WC loans where they are returned via ?associations=collection.

For WC loans, the overpaid date is not exposed; there is no field that tells on what date the loan became overpaid.

The GET Loan by ID/external-id API returns field totalInterestRefund of type BigDecimal representing the total refund amount of interest refund transactions which are not reversed.

A new field flags is added to LoanTransactionDataV1 and the serializer is enhanced for the flags field.

Loan details API / collection details should be extended with two new fields: Delinquency start date (if applicable) and Breach start date (if applicable).

The Template API is extended for this operation.

### Payable interest calculation

Payable interest calculation splits unpaid interest into due and not-due amounts. The calculation uses the EMICalculator so daily interest matches the legacy accrual calculation and the EMICalculator, and it is performed on the fly up to yesterday's transaction using an interest model. WCP loan details GET API JSON parameters should contain similar JSON parameters as of Term loans along with other parameters specific to WCP.

The two payable interest amounts are calculated as follows:

- totalUnpaidPayableDueInterest is the total interest due as of the installment date plus past due interest as of the installment date, based on actual balances of repayment schedules.
- totalUnpaidPayableNotDueInterest is the accumulated daily interest of the current installment period based on actual balances of repayment schedules, and the accumulation restarts for every installment period.

Calculation of totalUnpaidPayableDueInterest and totalUnpaidPayableNotDueInterest is moved out of LoanSummaryData into a service that builds the loan interest model.

### Worked examples

A loan of 1,000.00 is disbursed at an annual interest rate of 12% with three monthly installments and 30-day months. The figures are illustrative. The borrower pays each installment on time, so the opening balance falls by the principal portion of each payment and the final outstanding balance is zero. The schedule shows how each installment splits into interest and principal and how the balance declines to zero.

| Installment | Opening balance | Interest due | Principal due | Total due | Paid | Outstanding |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1,000.00 | 10.00 | 330.02 | 340.02 | 340.02 | 669.98 |
| 2 | 669.98 | 6.70 | 333.32 | 340.02 | 340.02 | 336.66 |
| 3 | 336.66 | 3.37 | 336.66 | 340.03 | 340.03 | 0.00 |
| Total |  | 20.07 | 1,000.00 | 1,020.07 | 1,020.07 |  |

The same loan is observed on day 40 after installment 1 of 340.02 falls due on day 30 and remains unpaid. Because the installment is past due, its interest portion is recorded as due interest without further daily accumulation, while interest on the outstanding balance continues to accrue daily for the current period. The table separates interest that is already due from interest that is still accumulating.

| Day | Event | Balance | Interest due and unpaid | Daily accrual current period | totalUnpaidPayableDueInterest | totalUnpaidPayableNotDueInterest |
| --- | --- | --- | --- | --- | --- | --- |
| 30 | Installment 1 due, unpaid | 1,000.00 | 10.00 | 0.00 | 10.00 | 0.00 |
| 31 | One day of daily interest accrues | 1,000.00 | 10.00 | 0.33 | 10.00 | 0.33 |
| 40 | Ten days of daily interest accrued | 1,000.00 | 10.00 | 3.33 | 10.00 | 3.33 |

The borrower prepays the full loan on day 30 instead of waiting for the installment schedule. Interest accrues for the 30 days before the prepayment, and the repayment covers the full principal plus that interest, leaving a zero balance. The table shows that a prepayment settles remaining principal plus accrued interest up to the prepayment date.

| Event | Principal | Interest | Total paid | Outstanding |
| --- | --- | --- | --- | --- |
| Disbursement | 1,000.00 | 0.00 | 0.00 | 1,000.00 |
| Accrual to day 30 | 0.00 | 10.00 | 0.00 | 1,000.00 |
| Full prepayment on day 30 | 1,000.00 | 10.00 | 1,010.00 | 0.00 |

After installment 1 is paid on day 30, the daily payable interest for the new installment period starts at zero and accumulates each day on the reduced balance. If a partial payment is made, it reduces the payable interest before further accrual continues. The table shows the daily restart and growth of current-installment payable interest.

| Day | Event | Balance | currentInstallmentPayableInterest |
| --- | --- | --- | --- |
| 30 | Installment 1 paid | 669.98 | 0.00 |
| 31 | One day accrues | 669.98 | 0.22 |
| 40 | Ten days accrued | 669.98 | 2.23 |
