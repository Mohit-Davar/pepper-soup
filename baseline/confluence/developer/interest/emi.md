# EMI Calculation

## EMI calculation overview

The system calculates the monthly repayment amount (EMI) for a loan using configured days-in-year and days-in-month settings, and builds a repayment schedule showing the principal and interest portions of each payment. It applies when the repayment period is monthly. The last payment is the remaining balance and may differ from earlier payments.

The calculation works as follows:

- It loops through each loan term, calculating a rate factor for the term using the number of days in that month.
- It uses the rate factor from the previous iteration to calculate fi, the denominator of the monthly payment formula.
- It uses the product of all rate factors and fi to calculate the monthly payment.
- It iterates through each term again, using the monthly payment to calculate principal and interest for each term.
- Interest for a term is `(rate factor − 1) × remaining balance`.
- Principal for a term is `monthly payment − interest for that term`.

Downpayment handling:

- When downpayment is enabled, the principal component of the EMI calculation uses the principal balance excluding the downpayment amount.
- This applies even if the downpayment installment is not paid.

## Rate factor formulas

The rate factor formula depends on how often repayments are made.

| Frequency | Rate factor formula |
| --- | --- |
| Per year | 1 + (rate of interest × (days / days in year)) |
| Monthly | 1 + (rate of interest × (repaid every × days in month / days in year) × (actual days in period / calculated days in period)) |
| Weekly | 1 + (rate of interest × (7 × repaid every / days in year) × (actual days in period / calculated days in period)) |
| Whole term | 1 + (rate of interest × (actual number of days of loan from start date to actual maturity / calculated number of days of loan from start date to expected maturity)) |

## EMI formula

`EMI = Σ (i = 1..n) Ri × principal / fn`

## Installment interest

`installment interest = principal balance × (rate factor − 1)`

## Days in year and month configurations

Two settings decide how interest accrues: days in the month and days in the year.

| Setting | Options |
| --- | --- |
| Days in month | 30 DAYS (one month is 30 days), ACTUAL (the actual number of days in the month) |
| Days in year | 360, 364, 365, ACTUAL (365 or 366 in a leap year) |

Supported configurations include 360/30, 365/ACTUAL, and 366/ACTUAL.

## Repayment frequency

Repayment frequency sets how often you repay a loan. You can choose DAYS (for example, 30 DAYS), WEEKS (for example, 2 WEEKS), or MONTHS (for example, 1 MONTHS).

Default period options:

- Monthly
- Yearly
- Whole period

Unusual period options:

- Daily
- Weekly

## EMI iteration and adjustment

The system decides whether to iterate the EMI by comparing the difference between the final payment and the regular payment against half the term. If iteration is needed, it adjusts the EMI once and keeps the adjusted EMI only when the new difference is smaller than the original difference; otherwise it uses the original EMI.

Rules for EMI iteration and adjustment:

- The system iterates the EMI when `(|diff| * 100) > floor(term / 2)`, where diff is the difference between the final payment and the regular payment.
- The EMI adjustment equals `(last installment EMI - calculated EMI) / number of remaining periods`.
- The system performs the EMI adjustment only once to avoid endless loops.
- After reiteration, if the new difference between the final payment and the regular payment is not smaller than the original difference, the system drops the reiteration and uses the original EMI.

## Rate factor adjustment for rounding

The system adjusts the rate factor to match the rounded interest amount for the period so that daily interest or sub-period interest can be calculated with the adjusted value. Currency precision and rounding mode make this adjustment necessary, and one adjustment per period is enough for sub-interest periods to work with the adjusted value. The same rule applies to additional periods where the period due date falls after the loan maturity date.

## Test scenario values

| Setting | Value |
| --- | --- |
| Should iterate | FALSE |
| Iterate with | 0.00 |
| Days in year | 360 |
| Principal | 100 |
| Repay every | 1 month |
| Repaid every | 1 month |
| Loan start date | 1/1/23 |
| Transaction range | 0.01 - 98.99 |

See also: [Schedule Recalculation for Overdue Loans](confluence-link:Schedule%20Recalculation%20for%20Overdue%20Loans), [Backdated Loans](confluence-link:Backdated%20Loans), [Early and Late Repayment Interest](confluence-link:Early%20and%20Late%20Repayment%20Interest), [Interest Rate Changes](confluence-link:Interest%20Rate%20Changes).
