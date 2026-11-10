# New API Requests

## New API Requests

### Loan schedule generation

The calculateLoanSchedule library generates a repayment schedule from the loan amount, terms, and interest rate without any database dependency. The fineract-progressive-loan module can be built as a standalone jar, and ProgressiveLoanScheduleGenerator can be invoked to generate the schedule. DefaultScheduledDateGenerator uses net.fortuna.ical4j.model.Recur, and a new generateRepaymentPeriods method works without working days and holidays. calculateLoanSchedule is changed.

LoanRepaymentScheduleModelData is the loan repayment schedule request model.

ProgressiveLoanScheduleGenerator accepts the following input and produces the following output:

- ProgressiveLoanScheduleGenerator is invoked with MathContext and LoanRepaymentScheduleModelData modelData.
- ProgressiveLoanScheduleGenerator returns LoanScheduleModel.
- LoanScheduleModel output contains periods: List<LoanSchedulePeriodData>.

LoanRepaymentScheduleModelData requires the following mandatory fields:

- daysInMonth of type DaysInMonthType is mandatory.
- daysInYear of type DaysInYearType is mandatory.

### Downpayment loan fields

A loan product configures optional downpayment fields, and those settings can be overridden for an individual loan. The enableDownpayment field accepts true or false to decide dynamically whether the loan is a downpayment loan under the same product constraints. Additional fields for downpayment loans include dynamically passing numberOfRepayments (terms) and downPaymentAmountPercentage.

### Schedule generation options

Schedule generation can use one of three configuration options: an in-house PayPal deployment that copies the Fineract implementation and runs on-premises, a Fineract library added as a dependency to generate the loan schedule, or a Fineract deployment for the Offers domain that calls the service directly and supports only calculateLoanSchedule.

### Loan API endpoints

You can retrieve a loan by its ID or external ID, and create a loan using the loan API endpoints. The GET loan by ID endpoint returns additional fields.

| Endpoint | Method | Path |
| --- | --- | --- |
| GET loan by ID | GET | /fineract-provider/api/v1/loans/{loanId} |
| GET loan by external ID | GET | /fineract-provider/api/v1/loans/external-id/{externalloanId} |
| Create loan | POST | /fineract-provider/api/v1/loans |

### Create loan API fields

The POST create loan API supports nominal interest rate and downpayment fields. The nominal interest rate field maps to interestRatePerPeriod.

### Loan summary interest fields

The loan summary exposes interest fields that show posted, accrued, delinquent, refunded, and waived interest amounts as BigDecimal values. These fields apply to loan summary responses and include existing totals alongside newly mapped fields.

| Field | Maps to | Type | Meaning | Example |
| --- | --- | --- | --- | --- |
| total_unpaid_accrual_activity_interest | totalUnpaidAccruedDueInterest | BigDecimal | Total unpaid posted interest amount on the loan | 30.00 |
| total_unpaid_accrued_interest | totalUnpaidAccruedNotDueInterest | BigDecimal | Total unpaid accrued interest calculated from the last non-monetary interest activity posting date and not yet posted on the billing period | 1.00 |
| total_interest | summary.interestCharged and repaymentSchedule.totalInterestCharged | BigDecimal | Total interest on the loan including paid, unpaid and projected | 40.00 |
| delinquent_interest | delinquentInterest | BigDecimal | Delinquent amount with interest portion | 0.10 |
| total_interest_refund | totalInterestRefund | BigDecimal | Total refund amount when a merchant or agent initiates a disbursement refund (not reversed) | 0.10 |
| total_payment_waiver | totalInterestPaymentWaiver | BigDecimal | Total interest payment waiver amount when PayPal initiates an interest payment waiver transaction (not reversed) | 0.10 |

### Interest calculation management

Stopping interest calculations is a brand new API rather than a change to what the estimation documentation discussed.

The POST manage interest endpoint supports stopping interest calculations, restarting interest calculations, and reducing interest calculations.

The endpoint supports the following actions:

- Stopping interest calculations.
- Restarting interest calculations.
- Reducing interest rate.

### Interest payment waiver API

You create an interest payment waiver by posting to the loan transactions endpoint using the interestpaymentwaiver command. The request includes a transaction amount and a transaction date, and the call publishes a payment waiver transaction changed event.

1. POST to /fineract-provider/api/v1/loans/{loanId}/transactions?command=interestpaymentwaiver.
2. POST to /fineract-provider/api/v1/loans/external-id/{externalloanId}/transactions?command=interestpaymentwaiver.

The interest payment waiver request body contains these fields:

- transactionAmount of type BigDecimal, for example 10.90.
- transactionDate of type String.

### Interest payment waiver reversal API

You reverse an interest payment waiver by sending a POST request to /fineract-provider/api/v1/loans/{loanId}/transactions/{transactionId} or /fineract-provider/api/v1/loans/external-id/{externalLoanId}/transactions/external-id/{transactionExternalId}.

The reversal request body contains:

- transactionAmount of type BigDecimal, for example 0.
- transactionDate of type String.

The system publishes a transaction changed event with type PAYMENT_WAIVER_REVERSAL as part of the real-time API call.

### Interest refund APIs

The interest refund APIs post interest refunds for merchant-issued and payout refunds as part of the same API call, and publish a transaction changed event of type INTEREST_REFUND as part of the real-time API call.

The interest refund reversal endpoint reverses interest refunds for merchant-issued and payout refund reversals as part of the same API call, and publishes a transaction changed event of type INTEREST_REFUND_REVERSAL as part of the real-time API call.

The existing refund APIs publish transaction changed events as part of the real-time API call.

- A merchant-issued refund publishes MERCHANT_ISSUED_REFUND.
- A payout refund publishes PAYOUT_REFUND.
- A merchant-issued refund reversal publishes MERCHANT_ISSUED_REFUND_REVERSAL.
- A payout refund reversal publishes PAYOUT_REFUND_REVERSAL.

ApplicationCurrency is an entity class that extends org.springframework.data.domain.Persistable and implements PersistenceWeaved, PersistenceWeavedChangeTracking, PersistenceWeavedFetchGroups and PersistenceObject under org.eclipse.persistence.internal.

The hard dependencies needed when the project module is included inside the fatjar are org.eclipse.persistence.core version 4.0.2, ical4j version 3.2.19, and spring-data-commons version 2.5.7.

### Worked examples

The calculateLoanSchedule library generates a standard amortizing schedule when downpayment is disabled. The figures are illustrative: a principal of 1,000.00 in USD, a nominal annual interest rate of 12%, three monthly installments, and 30-day months. DefaultScheduledDateGenerator uses net.fortuna.ical4j.model.Recur to derive the installment dates from the mandatory start date and frequency. Interest accrues monthly on the outstanding balance, and the equated installment is calculated from the principal, rate, and term. When installmentAmountInMultiplesOf is configured, the equated installment is rounded up to the nearest multiple before amortization, which raises each fixed payment, reduces the final payment, and lowers total interest relative to the unrounded schedule.

| No. | Payment | Interest | Principal | Balance |
| --- | --- | --- | --- | --- |
| 1 | 340.03 | 10.00 | 330.03 | 669.97 |
| 2 | 340.03 | 6.70 | 333.33 | 336.64 |
| 3 | 340.01 | 3.37 | 336.64 | 0.00 |

The calculateLoanSchedule library generates a downpayment schedule when the enableDownpayment field is true and the downPaymentAmountPercentage is supplied on the loan product or overridden for the loan. A principal of 1,000.00 in USD carries a 20% down payment, so 200.00 is deducted upfront and 800.00 is financed. The nominal annual interest rate is 12%, with three monthly installments and 30-day months. Interest accrues only on the financed balance after the down payment. If downpayment is disabled, the library skips the upfront deduction and produces the standard schedule from the previous example instead.

| Stage | Payment | Interest | Principal | Balance |
| --- | --- | --- | --- | --- |
| Downpayment | 200.00 | – | 200.00 | 800.00 |
| 1 | 272.02 | 8.00 | 264.02 | 535.98 |
| 2 | 272.02 | 5.36 | 266.66 | 269.32 |
| 3 | 272.01 | 2.69 | 269.32 | 0.00 |
