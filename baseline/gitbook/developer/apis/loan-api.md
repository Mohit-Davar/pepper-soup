# Loan API

## Loan API overview

The GET Loan by ID/external-id API returns loan details based on business events. Field names in the response are camelCase.

The API returns these additional fields:

- norminal_interest_rate
- total_unpaid_posted_interest
- total_unpaid_accrued_interest
- total_interest
- delinquent_interest
- total_interest_refunds
- total_interest_payment_waiver
- totalUnpaidAccruedDueInterest
- totalUnpaidAccruedNotDueInterest
- delinquentInterest
- delinquentFee
- totalInterestRefund
- totalInterestPaymentWaiver
- totalUnpaidPayableDueInterest
- totalUnpaidPayableNotDueInterest

totalInterestRefund is the total refund amount of interest refund transactions that are not reversed.

> **Note:** The right value is calculated for the new fields in the GET Loan API response.

## Creating loans

You can create loans through the POST create loan API. The API supports additional fields including nominal interest rate, enableDownPayment, enableAutoRepaymentForDownPayment, and disbursedAmountPercentageForDownPayment.

> **Note:** Disbursement is rejected on this API; use the dedicated undo disbursal API instead.

## Down payment configuration

Down payment configuration lets you enable or disable down payment on a loan account at loan creation or modification, even when the loan product already has down payment configured. You can also override the down payment settings inherited from the loan product.

Rules for down payment configuration:

- enableDownPayment decides dynamically whether the loan is a down payment loan under the same product constraints.
- You can use enableDownPayment override only when down payment was configured on the loan product but should be disabled during loan submission.
- If down payment was not set and enabled on the loan product, you cannot set and configure it at the loan level.
- If enableAutoRepaymentForDownPayment or disbursedAmountPercentageForDownPayment is provided, those values override the values fetched from the loan product.
- If enableAutoRepaymentForDownPayment or disbursedAmountPercentageForDownPayment is not provided, whatever was set on the loan product is used.

## Loan lifecycle actions

You can undo an approved loan, disburse an approved loan account, and undo a disbursed loan account. Undoing approval returns the loan to the created state. Undoing disbursement returns the loan account to the approval state.

## Undoing transactions and charges

Undoing a transaction applies only to transactions belonging to the loan. If the transactionId does not belong to the loan, PUT /loans/{loanId}/transactions/{transactionId}?command=undo returns HTTP 404.

The same behaviour applies to:

- Fetching loan details.
- Transaction reversal.
- Chargeback.
- Undoing a loan charge transaction.

Loan charges support:

- Fetching a loan charge.
- Updating a loan charge.
- Paying, waiving or adjusting a loan charge.
- Deleting a loan charge.

## Loan charges

You can create, pay, update, adjust and delete charges on a loan. Each call returns resourceId as the chargeId, except an adjustment, which returns resourceId as the transactionId.

| Action | Endpoint | Returns |
| --- | --- | --- |
| Create loan charge | POST /loans/<loanId>/charges | resourceId as the chargeId |
| Pay loan charge | POST /loans/<loanId>/charges?command=pay | resourceId as the chargeId |
| Pay loan charge | POST /loans/<loanId>/charges/<chargeId>?command=pay | resourceId as the chargeId |
| Update loan charge | PUT /loans/<loanId>/charges/<chargeId> | resourceId as the chargeId |
| Adjustment for loan charge | POST /loans/<loanId>/charges/<chargeId>?command=adjustment | resourceId as the transactionId |
| Delete loan charge | DELETE /loans/<loanId>/charges/<chargeId> | resourceId as the chargeId |

Paying a loan charge uses subEntity for Loan Transaction.

- Paying a loan charge uses subEntity for Loan Transaction.

## Payable interest fields

Payable interest fields show the interest a borrower owes on a loan. totalUnpaidPayableDueInterest covers interest due as of the installment date plus past due interest as of the installment date, including outstanding interest on past due installments. totalUnpaidPayableNotDueInterest covers accumulated daily interest of the current installment period, and the accumulation restarts for every installment period. Both fields are based on the actual balances of the repayment schedules. Payable interest calculation for loan details uses the EMICalculator to calculate daily interest instead of the prior formula based on interest due divided by number of days.

## Term fields

The get loan API returns updated_term, which holds the new extended term caused by multiple tranche disbursements. It also returns actual_no_term, an integer showing the actual number of term. The system calculates actual_no_term on the fly for all repayment periods except disbursement, downpayment, and the installment after the last one, and adds it to loan related events.

## Loan product API

Use the loan product API to create and configure loan products. Call the template endpoint to get all available configuration options, or fetch a specific loan product with or without template details.

Endpoints:

- GET /v1/loanproducts/template returns all available configuration options needed to create and configure a new loan product on the UI.
- GET /v1/loanproducts/{loanProductId}?template=false returns the loan product details of a specific loan product without template details.
- GET /v1/loanproducts/{loanProductId}?template=true returns the loan product details of a specific loan product and all available configuration options needed to update a loan product.

Response contents:

- The loan product fetch details response returns the same field and containing mapping as the template response.
- The loan product template API call and the specific loan product details with template details API call return all available write-off reason code values as List<CodeValueData> writeOffReasonOptions.

## Template API

The Template API returns all outstanding balances up to the current date, the same as prepaying a loan. Without a query parameter, it returns everything.

The Merchant Issued Refund / Payout Refund API endpoint accepts this optional field:

- interestRefundCalculation is an optional boolean field.

## Working capital loans

Working capital loans support external IDs. When automatic external ID generation is enabled and you do not supply one, Fineract generates an external ID for each working capital loan transaction. Loan transactions are fetched through a separate API and are not included in working capital loan details. The loan read endpoint GET /loans/{loanId} and GET /loans/external-id/{loanExternalId} includes the delinquency calculation pause flag.

## Worked examples

A loan of 1,000.00 is disbursed on Day 1. The annual interest rate is 12% and interest accrues at 3.00 per day; these figures are illustrative. No installment is due during the period shown, so totalUnpaidPayableDueInterest remains zero while totalUnpaidPayableNotDueInterest accumulates daily. On Day 5 a payment of 2.00 is applied to interest. With or without a repayment scheduled for 1-Feb, the values through Day 5 are identical because the repayment has not yet occurred.

| Day | Daily interest | totalUnpaidPayableDueInterest | totalUnpaidPayableNotDueInterest | currentInstallmentPayableInterest |
| --- | --- | --- | --- | --- |
| Day 1 | 0.00 | 0.00 | 0.00 | 0.00 |
| Day 2 | 3.00 | 0.00 | 3.00 | 3.00 |
| Day 3 | 3.00 | 0.00 | 6.00 | 6.00 |
| Day 4 | 3.00 | 0.00 | 9.00 | 9.00 |
| Day 5 before payment | 3.00 | 0.00 | 12.00 | 12.00 |
| Day 5 after payment of 2.00 | 0.00 | 0.00 | 10.00 | 10.00 |

The example shows that due interest stays at zero until an installment is past due, while not-due interest builds each day and drops when interest is paid.

A loan of 1,000.00 with an annual interest rate of 12% is repaid in three monthly installments of 340.00 over 30-day months; these figures are illustrative. Interest for the first month is 10.00. The table shows each installment's interest, principal, closing balance, and amount due. If the first installment is paid on time, the first row is marked paid and later interest accrues on the reduced balance. A second table shows full prepayment two days after disbursement: two days of interest total 0.67, so the amount due is 1,000.67 instead of 1,020.07.

| Installment | Due date | Days | Opening balance | Interest | Principal | Closing balance | Due | Paid | Outstanding |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 1-Feb | 30 | 1000.00 | 10.00 | 330.00 | 670.00 | 340.00 | 340.00 | 0.00 |
| 2 | 1-Mar | 30 | 670.00 | 6.70 | 333.30 | 336.70 | 340.00 |  | 340.00 |
| 3 | 1-Apr | 30 | 336.70 | 3.37 | 336.70 | 0.00 | 340.07 |  | 340.07 |
| Totals |  |  |  | 20.07 | 1000.00 |  | 1020.07 | 340.00 | 680.07 |

| Day | Event | Principal | Interest | Total | Closing balance |
| --- | --- | --- | --- | --- | --- |
| Day 1 | Disbursement | 1000.00 |  |  | 1000.00 |
| Day 2 | Interest accrual |  | 0.67 |  | 1000.00 |
| Day 2 | Full prepayment | 1000.00 | 0.67 | 1000.67 | 0.00 |

The example shows how the amortization schedule reduces the balance by principal paid and how early repayment cuts total interest to only the days elapsed.
