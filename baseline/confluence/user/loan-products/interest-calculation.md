# Interest Calculation

## EMI Calculation

### EMI calculation overview

The system calculates the monthly payment (EMI) using the configured days in year (360, 364, 365 or Actual) and days in month (30 or Actual), and builds a repayment schedule showing each principal and interest payment.

### Repayment period and day-count settings

Repayment period settings decide how often installments fall due, and day-count settings decide how many days count in a month and in a year.

Repayment every can be set to:

- DAYS (for example, 30 DAYS)
- WEEKS (for example, 2 WEEKS)
- MONTHS (for example, 1 MONTHS)

Period options include:

- Monthly
- Yearly
- Whole period
- Daily
- Weekly

Days in year and days in month settings:

| Setting | Options |
| --- | --- |
| Days in year | 360, 364, 365, ACTUAL (365 or 366 in a leap year) |
| Days in month | 30, ACTUAL |

### Rate factor formulas

The rate factor adjusts interest for each term of the loan based on how many days the term covers.

Rate factor formulas by repayment frequency:

| Frequency | Rate factor formula |
| --- | --- |
| Monthly | 1 + (rate of interest × (repaid every × days in month / days in year) × actual days in period / calculated days in period) |
| Weekly | 1 + (rate of interest × (7 × repaid every / days in year) × actual days in period / calculated days in period) |

Rules:

- The same rule applies for additional periods where the period due date is after the loan maturity date.

### EMI formula

The EMI formula calculates each equal monthly installment from the principal, the rate factor product over the repayment period, and the annuity divisor.

| Term | Meaning |
| --- | --- |
| ratefactor^n | Rate factor product from i = 1 to n of Ri |
| principal | Loan principal |
| fn | Annuity divisor over n installments |

### Installment interest calculation

Installment interest is calculated from the principal balance, the interest rate per year, and the days gap between installments.

The system supports two calculation methods:

- Installment Interest = principal balance × (interest rate per year) × days gap
- Installment Interest = principal balance × (1 − rate factor)

When downpayment is enabled, the principal component in the EMI calculation formula uses the principal balance excluding the downpayment amount, even if the downpayment installment is not paid.

### EMI iteration and adjustment

The system tests whether to recalculate the EMI by comparing the difference between the final payment and the regular payment with half of the loan term. If the difference is large enough, it adjusts the EMI by spreading the difference between the last installment and the calculated EMI across the remaining periods. The adjustment happens only once. If the new difference is not smaller than the original difference, the system keeps the original EMI; otherwise it uses the adjusted EMI.

### Last installment

The system calculates every monthly payment except the last one. The last payment is the remaining balance.

### Rate factor rounding adjustment

The system adjusts the rate factor once per period to match the rounded interest amount for that period. Currency precision and rounding mode require this adjustment, and sub-interest periods can use the adjusted value.

### Interest rate frequency

You can configure the interest rate frequency as per month or per whole term.

### Worked examples

This example shows a simple monthly equated monthly installment (EMI) calculation. The figures are illustrative: a principal of 1,000, an annual interest rate of 12%, three monthly installments, a 360-day year and 30-day months. The user configures the interest rate, repayment frequency and day-count conventions; the system then produces the schedule below. The example shows how the EMI is split into interest and principal, with the final payment covering the remaining balance.

| Period | Opening balance | Interest | Principal | Payment | Closing balance |
| --- | --- | --- | --- | --- | --- |
| 1 | 1,000.00 | 10.00 | 162.55 | 172.55 | 837.45 |
| 2 | 837.45 | 8.37 | 164.18 | 172.55 | 673.27 |
| 3 | 673.27 | 6.73 | 165.82 | 172.55 | 507.45 |
| 4 | 507.45 | 5.07 | 167.48 | 172.55 | 339.97 |
| 5 | 339.97 | 3.40 | 169.15 | 172.55 | 170.82 |
| 6 | 170.82 | 1.71 | 170.82 | 172.53 | 0.00 |
| Total |  | 35.28 | 1,000.00 | 1,035.28 |  |

This example shows how a downpayment changes the EMI. A principal of 1,000 is repaid monthly over three months at 12% annual interest with a 360-day year and 30-day months. A downpayment of 250 is collected at disbursement, so the EMI formula uses a principal of 750 even if the downpayment installment is not paid. The example shows that the downpayment reduces the principal used in the EMI formula, lowering each installment.

| Period | Opening balance | Interest | Principal | Payment | Closing balance |
| --- | --- | --- | --- | --- | --- |
| 1 | 750.00 | 7.50 | 247.52 | 255.02 | 502.48 |
| 2 | 502.48 | 5.02 | 250.00 | 255.02 | 252.48 |
| 3 | 252.48 | 2.52 | 252.48 | 255.00 | 0.00 |
| Total |  | 15.04 | 750.00 | 765.04 |  |

This example shows the effect of changing only the repayment period. A principal of 1,000 is repaid every two months over three installments at 12% annual interest with a 360-day year. Because each period is 60 days, the rate factor is 1.02 instead of 1.01, so each installment is larger and fewer installments are needed. The example shows that lengthening the period raises the rate factor and reduces the number of installments.

| Period | Opening balance | Interest | Principal | Payment | Closing balance |
| --- | --- | --- | --- | --- | --- |
| 1 | 1,000.00 | 20.00 | 326.75 | 346.75 | 673.25 |
| 2 | 673.25 | 13.47 | 333.28 | 346.75 | 339.97 |
| 3 | 339.97 | 6.80 | 339.97 | 346.77 | 0.00 |
| Total |  | 40.27 | 1,000.00 | 1,040.27 |  |

This example shows how an early repayment changes the schedule. A principal of 1,000 is repaid monthly over three months at 12% annual interest with a 360-day year and 30-day months. After the first installment, the borrower repays 150 early; the payment is split into interest for the days elapsed and principal, and the remaining installments keep the same EMI with a smaller final payment. The example shows that an early repayment reduces the balance and leaves a smaller final payment while the regular EMI stays the same.

| Period | Opening balance | Interest | Principal | Payment | Closing balance |
| --- | --- | --- | --- | --- | --- |
| 1 | 1,000.00 | 10.00 | 330.02 | 340.02 | 669.98 |
| Early repayment | 669.98 | 3.35 | 146.65 | 150.00 | 523.33 |
| 2 | 523.33 | 5.23 | 334.79 | 340.02 | 188.54 |
| 3 | 188.54 | 1.89 | 188.54 | 190.43 | 0.00 |
| Total |  | 20.47 | 1,000.00 | 1,020.47 |  |

See also: [Backdated Loans](confluence-link:Backdated%20Loans), [Interest Timing: Early and Late Repayment Interest](confluence-link:Interest%20Timing#early-and-late-repayment-interest).

## Interest Rates by Balance Status

Interest is calculated only on the current principal balance, which is the total principal balance minus the past due principal balance. Interest is not calculated on past due principal amounts. You can configure a separate interest rate for past due principal balance at the loan product level.

The "Do not calculate interest on past due principal balances" checkbox is available under Settings → Interest Recalculation when:

- The loan product is a progressive loan.
- Interest recalculation is enabled.

When this checkbox is set on a loan:

- The checkbox defaults to unchecked.
- If the customer does not pay the first installment on time, the interest balance of the second installment does not change because interest is not calculated on past due principal balances.
- Overdue loans do not change anything.

> **Note:** The configuration to not calculate interest on past due principal amounts is limited to the advance repayment strategy type.

## 366-Day Year Interest

366-day year interest lets you calculate daily interest using 366 days in a leap year and 365 days in a non-leap year. You can apply this to the whole loan year or only to installments that fall between February dates. For multi-year loans, each year uses its own day count: 365 for non-leap years and 366 for leap years. If rescheduling adds 29 February to an interest period that originally ended before that date, interest is recalculated from 1 January to today because the period is now a 366-day year.

## Leap Year Interest Calculation

Leap year interest calculation applies when days in year is set to ACTUAL on a progressive loan product. It determines whether the system uses 366 days or 365 days in a year when calculating interest. The setting is available as a dropdown on the loan product and is inherited by loans created from that product. FULL_LEAP_YEAR is the default value.

The dropdown has two values:

| Dropdown value | Days in year used |
| --- | --- |
| FULL_LEAP_YEAR | 366 if the year is a leap year, otherwise 365 |
| FEB_29_PERIOD_ONLY | 366 for the period that contains 29 February, otherwise 365 |

Interest uses the simplified rate factor: `Interest rate * DAYS IN MONTH / DAYS IN YEAR`.

Example 1: A progressive loan uses Actual days in a year with the February-29-period-only option. The figures are illustrative. A principal of 1,000 is lent at 6% a year and repaid in three equal monthly installments. The loan is disbursed on 1 January 2024, a leap year, so the first period runs from 1 January to 1 February (31 days), the second from 1 February to 1 March (29 days and it contains 29 February), and the third from 1 March to 1 April (31 days). Only the second period uses 366 days in the year; the other two use 365.

| Period | From | To | Days | Year days | Open | Interest | Principal | Pay | Close |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 Jan 2024 | 1 Feb 2024 | 31 | 365 | 1,000.00 | 5.10 | 333.33 | 338.43 | 666.67 |
| 2 | 1 Feb 2024 | 1 Mar 2024 | 29 | 366 | 666.67 | 3.17 | 333.33 | 336.50 | 333.34 |
| 3 | 1 Mar 2024 | 1 Apr 2024 | 31 | 365 | 333.34 | 1.70 | 333.34 | 335.04 | 0.00 |
| Total |  |  |  |  |  | 9.97 | 1,000.00 | 1,009.97 |  |

If the full-leap-year option were chosen instead, all three periods would use 366 days because 2024 is a leap year, rather than only the February period.

Example 2: A progressive loan is disbursed on 1 July 2024, a leap year, and repaid in three monthly installments. The principal is 1,000 and the annual rate is 6%. Because no installment period contains 29 February, the system uses 365 days in the year for every period, even though 2024 is a leap year.

| Period | From | To | Days | Year days | Open | Interest | Principal | Pay | Close |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 Jul 2024 | 1 Aug 2024 | 31 | 365 | 1,000.00 | 5.10 | 333.33 | 338.43 | 666.67 |
| 2 | 1 Aug 2024 | 1 Sep 2024 | 31 | 365 | 666.67 | 3.40 | 333.33 | 336.73 | 333.34 |
| 3 | 1 Sep 2024 | 1 Oct 2024 | 30 | 365 | 333.34 | 1.64 | 333.34 | 334.98 | 0.00 |
| Total |  |  |  |  |  | 10.14 | 1,000.00 | 1,010.14 |  |

This shows that a leap year alone does not switch every period to 366 days; only a period that contains 29 February can use 366 days.
