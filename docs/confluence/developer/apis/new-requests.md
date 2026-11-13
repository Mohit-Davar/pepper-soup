# Loan Schedule and Interest APIs

## Loan schedule generation library

A separate library generates the loan repayment schedule without database dependency. It is packaged as a separate jar that you can add as a dependency, with a YAML file as input providing loan term, interest rate, and other details.

The LoanRepaymentScheduleModelData input model requires these fields:

| Field | Required |
| --- | --- |
| schedule generation start date | required |
| currency | required |
| disbursement amount | required |
| disbursement date | required |
| number of repayments | required |
| repayment frequency | required |
| repayment frequency type | required |
| nominal interest rate | required |
| downpayment enabled | required |
| daysInMonth | required |
| daysInYear | required |
| downpayment percentage | optional |
| installmentAmountInMultiplesOf | optional |
| fixed_length | optional |

The ProgressiveLoanScheduleGenerator is invoked with MathContext and LoanRepaymentScheduleModelData as input parameters and returns a LoanScheduleModel. The LoanScheduleModel output contains a list of LoanSchedulePeriodData periods.

DefaultScheduledDateGenerator uses net.fortuna.ical4j.model.Recur.

The hard dependencies forced on library consumers are org.eclipse.persistence.core version 4.0.2, ical4j version 3.2.19, and spring-data-commons version 2.5.7.

> **Note:** The separate loan schedule library does not support loan term variations, charges, holidays, working days, multiple disbursements, or interest rate changes.

## Downpayment loans

A downpayment loan lets you set the number of repayments and the down payment as a percentage dynamically under the same product constraints. The enableDownpayment field decides whether the loan is a downpayment loan.

Additional fields for downpayment loans:

- numberOfRepayments (terms)
- downPaymentAmountPercentage

## Loan creation API

Use the POST create loan API to create a loan. The endpoint is /fineract-provider/api/v1/loans. The request supports a nominal interest rate field and a downpayment or not field.

## Get loan by ID API

Use the Get Loan by ID API to retrieve a loan by its internal ID or external ID. The API returns additional fields.

Endpoints:

- /fineract-provider/api/v1/loans/{loanId}
- /fineract-provider/api/v1/loans/external-id/{externalloanId}

## Interest management API

The POST manage interest API lets you stop interest calculations, restart interest calculations, and reduce interest calculations.

> **Note:** Stopping interest calculations is a brand new API and differs from what the estimation documentation described.

## Interest payment waiver API

Use the Interest Payment Waiver API to waive interest on a loan transaction. You can also reverse a previously created interest payment waiver.

Endpoints

| Operation | Endpoint |
| --- | --- |
| Create interest payment waiver | /fineract-provider/api/v1/loans/{loanId}/transactions?command=interestpaymentwaiver |
| Create interest payment waiver | /fineract-provider/api/v1/loans/external-id/{externalloanId}/transactions?command=interestpaymentwaiver |
| Reverse interest payment waiver | /fineract-provider/api/v1/loans/{loanId}/transactions/{transactionId} |
| Reverse interest payment waiver | /fineract-provider/api/v1/loans/external-id/{externalLoanId}/transactions/external-id/{transactionExternalId} |

Events

- The system publishes a transaction changed event with type PAYMENT_WAIVER when you create an interest payment waiver.
- The system publishes a transaction changed event with type PAYMENT_WAIVER_REVERSAL when you reverse an interest payment waiver.

## Interest refund API

The interest refund API posts an interest refund together with a merchant-issued or payout refund in a single API call. The system publishes a transaction changed event for each refund type as part of the real-time call.

The system publishes these events during a disbursement refund:

- MERCHANT_ISSUED_REFUND or PAYOUT_REFUND
- INTEREST_REFUND

The interest refund reversal endpoint reverses an interest refund together with a merchant-issued or payout refund reversal in a single API call.

The system publishes these events during a disbursement refund reversal:

- MERCHANT_ISSUED_REFUND_REVERSAL or PAYOUT_REFUND_REVERSAL
- INTEREST_REFUND_REVERSAL

## Prepayment API

The prepayment API fetches prepayment amounts and processes prepayments using the existing repayment endpoint. Prepayments apply to progressive loans.

The prepayment response includes:

- Principal
- Fee
- Penalty
- Total

Prepayment processing:

- Applies the repayment allocation strategy.

## Web client batch and templates

The web client batch API lets you mix web client and term commands in a single batch request using feign or fineract-client. The template API supports web client action templates.

## Worked examples

The separate schedule library builds a repayment schedule from the loan inputs alone, with no database dependency. This example uses illustrative figures: a disbursement amount of 1,200.00, a nominal annual interest rate of 12%, four monthly installments, and 30-day months. Interest is calculated on the opening balance of each period, and the principal is repaid in equal amounts.

| Installment | Opening balance | Interest | Principal paid | Installment amount | Closing balance |
| --- | --- | --- | --- | --- | --- |
| 1 | 1,200.00 | 12.00 | 300.00 | 312.00 | 900.00 |
| 2 | 900.00 | 9.00 | 300.00 | 309.00 | 600.00 |
| 3 | 600.00 | 6.00 | 300.00 | 306.00 | 300.00 |
| 4 | 300.00 | 3.00 | 300.00 | 303.00 | 0.00 |
| Total |  | 30.00 | 1,200.00 | 1,230.00 |  |

The example shows that the library returns one period per installment, that balances decrease by the principal paid, and that totals equal the sum of the period rows.

The Get Loan by Id response adds interest-bearing summary fields to the loan resource. This example uses illustrative figures for a loan with a nominal interest rate of 12.000000 percent, posted but unpaid interest of 12.50, accrued but not yet posted interest of 2.00, total interest of 45.00, delinquent interest of 0.50, and no interest refunds or waivers.

| Field | Type | Value | Meaning |
| --- | --- | --- | --- |
| nominalInterestRate | String | 12.000000 | Nominal annual rate as text, used to keep total interest within APR. |
| totalUnpaidAccruedDueInterest | BigDecimal | 12.50 | Posted interest that remains unpaid. |
| totalUnpaidAccruedNotDueInterest | BigDecimal | 2.00 | Interest accrued since the last monetary posting and not yet posted. |
| totalInterest | BigDecimal | 45.00 | Total interest across paid, unpaid and projected amounts. |
| delinquentInterest | BigDecimal | 0.50 | Interest portion of the delinquent amount. |
| totalInterestRefund | BigDecimal | 0.00 | Interest refunded through a disbursement refund, not reversed. |
| totalInterestPaymentWaiver | BigDecimal | 0.00 | Interest waived through a payment waiver, not reversed. |

The example shows how the new fields map to their model names and what each interest category represents.

The interest payment waiver and reversal endpoints accept the same request shape: a monetary amount and a date string. A waiver posts a new interest payment waiver transaction; a reversal posts a reversing transaction for an earlier waiver. This example uses illustrative figures.

| Endpoint | Field | Type | Example value |
| --- | --- | --- | --- |
| Create interest payment waiver | transactionAmount | BigDecimal | 15.00 |
| Create interest payment waiver | transactionDate | String | 10 March 2024 |
| Create interest payment waiver reversal | transactionAmount | BigDecimal | 5.00 |
| Create interest payment waiver reversal | transactionDate | String | 12 March 2024 |

The example shows that both requests carry transactionAmount and transactionDate, while the reversal targets an existing waiver transaction rather than creating a new one.

A merchant-issued disbursement refund returns a changes map that identifies the interest refund transaction. This example uses illustrative figures for the map entries.

| Key | Value |
| --- | --- |
| officeId | 2 |
| clientId | 8 |
| loanId | 8 |
| resourceId | 3001 |
| interestRefundTransactionId | 3002 |
| transactionDate | 10 March 2024 |
| transactionAmount | 50.00 |
| locale | en |
| dateFormat | dd MMMM yyyy |
| paymentTypeId | 1 |
| externalId | a1b2c3d4-e5f6-7890-abcd-ef1234567890 |
| resourceExternalId | a1b2c3d4-e5f6-7890-abcd-ef1234567890 |

The example shows that the changes map carries the new interest refund transaction identifier alongside the standard refund details.
