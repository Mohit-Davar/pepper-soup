# Loan Submission API

## Loan Submission API

### Global configuration flag behavior

A loan product has a flag called "to apply values from global config or not" in its event settings section. When this flag is true, the loan product reads event values from the global configuration and the user cannot manually enter them at the loan product level because those fields are grayed out. Changes to event values at the global configuration apply to every loan product where the flag is true. The user can manually enter event values only when the flag is false.

### Down payment override rules

The down payment override applies only when down payment is configured on the loan product but the loan submission disables it. You can enable and disable down payment from the loan account create or modify API level.

The system applies down payment repayment settings as follows:

- If automatic repayment for down payment or disbursed amount percentage for down payment is provided, those values override the values fetched from the loan product.
- If neither field is provided, the values set on the loan product are used.
- If down payment was not set and enabled on the loan product, it cannot be set and configured at the loan level.

### Approved amount update

You can update an approved loan amount using the Loan Submission API. The new amount must not be lower than the total already disbursed amounts plus total expected disbursement amounts plus total capitalized income, and it cannot exceed the applied loan amount and allowed over applied max. The new available amount fails validation if the approved amount cannot be lower than the total amount of already disbursed or expected disbursement amounts plus capitalized income.

The API supports two endpoints for updating the approved loan amount:

- PUT /loans/<loan_id>/approved-amount updates the approved loan amount.
- PUT /loans/external-id/<loan_external_id>/approved-amount updates the approved loan amount.

A successful update returns HTTP 200 with a CommandProcessingResult that includes the old approved amount and the new approved amount.

- The new approved loan amount equals total disbursed amount plus total capitalized income plus the new available disbursement amount.
- An indirect loan approved amount change creates an approved amount history entry.

### Available disbursement amount update

You can update the available disbursement amount for a loan using either its loan ID or its external ID. The new amount cannot be negative. A successful response returns HTTP 200 with a CommandProcessingResult that includes the old and new available disbursement amounts and the old and new approved amounts.

### Repayment schedule date update

You can use the API to update the repayment next due date, remaining schedule payment due dates, and maturity date. Installments already due are not extended; only future installments move forward. Future fee and penalty due dates also move forward to the next payment due date.

### Payable interest details

Fetching loan details returns payable interest details, including interest, fee, penalty, and principal portions of delinquency.

Payable interest details include two interest amounts:

- The total interest due as of the installment date plus past due interest as of the installment date is based on actual balances of repayment schedules.
- The accumulated daily interest of the current installment period is based on actual balances of repayment schedules, and the accumulation restarts for every installment period.

The system calculates payable interest as follows:

- The system performs an on-the-fly recalculation of the loan up to yesterday's transaction to fetch payable details using an interest model.
- Payable interest calculation uses the EMICalculator so daily interest matches the legacy accrual calculation and the EMICalculator.

> **Note:** Field names in the GET Loan API response use lowercase letters with no spaces.

### Worked examples

A borrower takes a loan of 1,000 on 1-Jan. The product charges 1.00 interest per day on a 30-day month, and three monthly installments fall due on 1-Feb, 1-Mar and 1-Apr. No payment is made before 1-Feb. The figures are illustrative. The example shows that daily interest accumulates in the not-yet-due field until the installment date, when it moves to the due field.

| Date | Daily interest added | Payable interest not yet due | Total unpaid due interest |
| --- | --- | --- | --- |
| 1-Jan | 0.00 | 0.00 | 0.00 |
| 2-Jan | 1.00 | 1.00 | 0.00 |
| 5-Jan | 1.00 | 4.00 | 0.00 |
| 10-Jan | 1.00 | 9.00 | 0.00 |
| 1-Feb | 0.00 | 0.00 | 30.00 |
| 2-Feb | 1.00 | 1.00 | 30.00 |

The same loan of 1,000 with 1.00 daily interest and installments on 1-Feb, 1-Mar and 1-Apr is now paid on time. The borrower pays 330.00 on 1-Feb, covering 300.00 principal and 30.00 interest. Paying on time clears the due interest and restarts the daily accumulation for the next period.

| Date | Payment received | Interest due for period | Payable interest not yet due | Outstanding balance |
| --- | --- | --- | --- | --- |
| 1-Jan | - | - | 0.00 | 1,000.00 |
| 1-Feb | 330.00 | 30.00 | 0.00 | 700.00 |
| 10-Feb | - | - | 9.00 | 700.00 |
| 1-Mar | 330.00 | 30.00 | 0.00 | 400.00 |
| 10-Mar | - | - | 9.00 | 400.00 |
| 1-Apr | 430.00 | 30.00 | 0.00 | 0.00 |

No payment is made on the 1-Feb installment. When the end-of-day job runs on 2-Feb, the 30.00 January interest remains in the due field while February interest begins to accumulate daily in the not-yet-due field. The due field grows only when an installment date passes unpaid, while the not-yet-due field resets each period and builds day by day.

| Date | Event | Total unpaid due interest | Payable interest not yet due | Outstanding balance |
| --- | --- | --- | --- | --- |
| 1-Feb | Installment 1 due and unpaid | 30.00 | 0.00 | 1,000.00 |
| 2-Feb | End-of-day job runs | 30.00 | 1.00 | 1,000.00 |
| 5-Feb | End-of-day job runs | 30.00 | 4.00 | 1,000.00 |
| 10-Feb | End-of-day job runs | 30.00 | 9.00 | 1,000.00 |
| 1-Mar | Installment 2 due and unpaid | 60.00 | 0.00 | 1,000.00 |

The loan of 1,000 is disbursed on 1-Jan with 1.00 daily interest. The borrower repays the full amount on 3-Jan, two days after disbursement, so only two days of interest are charged. Prepayment shortly after disbursement limits interest to the days the money was actually outstanding.

| Event | Date | Principal | Interest | Total paid | Balance after |
| --- | --- | --- | --- | --- | --- |
| Disbursement | 1-Jan | 1,000.00 | - | - | 1,000.00 |
| Daily accrual | 2-Jan | - | 1.00 | - | 1,000.00 |
| Daily accrual | 3-Jan | - | 1.00 | - | 1,000.00 |
| Full prepayment | 3-Jan | 1,000.00 | 2.00 | 1,002.00 | 0.00 |
