# Interest Calculation

## EMI Calculation

### EMI calculation scope and rounding

EMI amount rounding applies when the amortization method is EQUAL_INSTALLMENTS and the interest method is Declining Balance. It does not apply when the amortization method is EQUAL_INSTALLMENTS and the interest method is Flat.

Rounding modes and EMI changes follow these rules:

- Rounding modes HALF_UP and UP apply across cumulative and progressive schedule types when down payment is enabled.
- You cannot change an EMI unless it is the last unpaid period and must be amended due to early repayments.

### EMI adjustment and reiteration

The system calculates the monthly payment for every repayment except the last one, which pays the remaining balance. It adjusts the EMI once to minimize the difference between the calculated EMI and the last installment EMI. If the adjusted difference is smaller than the original difference, the adjusted EMI is used; otherwise the reiteration is dropped and the original EMI is used.

### Down payment handling

When down payment is enabled, the Principal component in the EMI calculation formula uses the principal balance excluding the down payment amount, even if the down payment installment is not paid. For an interest bearing progressive loan with interest recalculation and down payment enabled, repayments made during the down payment period do not calculate interest or principal, because those payments fall outside the ProgressiveLoanInterestScheduleModel calculation. The same rule applies to additional periods whose due date is after the loan maturity date.

### Advanced payment transaction processor

The Advanced payment transaction processor uses the EMICalculator instead of its internal calculation to determine repayment periods, principal due, interest due, and related values. Interest recalculation and multi disbursement are out of scope for this processor.

The processor follows this workflow:

- It resets the due principals on the repayment schedule before reprocessing the transactions, including the disbursement transaction.
- It applies transactions and charges one by one.
- It calls the EMICalculator rather than calculating the EMI itself.
- It updates the repayment periods, principal due, interest due, and related values based on the generated model.

Rate factor behaviour:

- The rate factor is adjusted to match the rounded interest amount for the period so that daily interest or sub-period interest can be calculated with the adjusted rate factor.
- The rate factor is adjusted just once per period, and sub-interest periods work with the adjusted value.

Pre-closure interest calculation rules:

- When the rest frequency type is daily and the pre-closure interest calculation strategy is till rest frequency date, interest is calculated as if settings were same as repayment period and till rest frequency date.
- When the rest frequency type is same as repayment period and the pre-closure interest calculation strategy is till pre-closure date, interest is calculated as if settings were same as repayment period and till rest frequency date.
- In both cases, interest is calculated at the end of the actual period.

### Repayment frequency and period options

Repayment frequency sets how often you repay the loan, and period options set the available repayment periods. Repayment frequency is 1 month.

Default period options are monthly, yearly, and whole period.

- Daily and weekly are unusual period options.

### Rate factor formulas

The rate factor depends on the interest calculation type: monthly, weekly or daily. Each type uses its own formula.

| Interest calculation type | Rate factor formula |
| --- | --- |
| Monthly | 1+(rate of interest*(repaid every *days in month /days in year)*actual days in period/calculated days in period) |
| Weekly | 1+(rate of interest*(7*repaid every /days in year)*actual days in period/calculated days in period) |
| Daily | 1+(rate of interest*(repaid every /days in year)*actual days in period/calculated days in period) |
| Rate factor | 1+(rate of interest *(days /year) |

### EMI formula

The EMI formula is (ratefactor^n * principal) / fn.

### Installment interest formulas

Installment interest is principal balance * (1-ratefactor).

| Frequency | Rate factor formula |
| --- | --- |
| Monthly | 1 + rate of interest * repaid every * days in month / days in year * actual days in period / calculated days in period |
| Weekly | 1 + rate of interest * 7 * repaid every / days in year * actual days in period / calculated days in period |
| Daily | 1 + rate of interest * repaid every / days in year * actual days in period / calculated days in period |

### Day-count and interest rate configurations

Day-count and interest rate configurations determine how the system calculates EMI and builds the repayment schedule. You configure the number of days in a year and in a month, the repayment frequency, and the interest rate frequency.

| Configuration | Options |
| --- | --- |
| Days in year | 360, 364, 365, ACTUAL (365 or 366 in a leap year) |
| Days in month | 30 days, ACTUAL |
| Repayment every | DAYS (for example 30 DAYS), WEEKS (for example 2 WEEKS), MONTHS (for example 1 MONTHS) |
| Interest rate frequency | Per month, per whole term |

When the interest rate frequency is per month, the rate factor formula multiplies the original per-year formula by 12. When it is per whole term, the rate factor equals `1 + (rate of interest * actual number of days of the loan / calculated number of days of the loan)`.

The system generates the full amortization schedule by looping through each term to calculate the rate factor using days in the current month, then iterating again to calculate principal and interest payments for each term. Interest for a term equals `Rate Factor - 1` multiplied by the remaining balance, and principal payment equals the monthly payment minus the interest payment for that term. On the last term, the monthly payment is the rest of the remaining balance and might not equal previous payments.

### Payment allocation and period closure

You can pay only payable interest, which is outstanding accumulated interest up to the current date. If your repayment fully covers a period, the principal due changes and the period closes. The same rules apply when an advance payment closes one or more periods without any payable interest.

When a period closes because of full repayment, interest is handled as follows:

- Remaining due interest is recalculated based on the new outstanding loan balance.
- If too much principal was paid for the remaining interest to be recognised on the period, interest moves to the next period.
- When interest moves to the next period, principal due equals the already recognised interest amount, the period stays outstanding with 1 cent of principal, and interest is recalculated based on the newer outstanding loan balance.
- If all principal is fully paid, interest naturally becomes 0.

The system sets the interest calculation window for the upcoming period as follows:

- When a period closes due to full repayment, the from date is current date plus 1 day and belongs to this period.
- When interest moves to the next period, the from date is current date plus 1 day and belongs to this period.
- The next period calculates interest based on the new outstanding loan balance from current date plus 1 day to the next due date.

Advance payments are allocated as follows:

- If an advance installment is also the current installment, payable detail calculates how much interest to pay per transaction date.
- For a future installment whose from date is on or after the transaction date, payable interest is 0 and all payment can go to principal based on the EMI.
- If EMICalculator sees that balance correction exceeds EMI minus payable interest minus projected interest, projected interest moves to the next period.
- If excessive payment or pay-off happens multiple times, interest is pushed to the next installment and recalculated based on the newer outstanding loan balance until the last period.

### Multi disbursement scenarios

Multi disbursement scenarios apply when a second disbursement arrives within the paid installment period, when it arrives on an early-paid loan whose last installment EMI would be reduced, or when an advance payment is adjusted to the next installment. Interest calculation type is the same as the repayment period.

The system supports these multi disbursement scenarios:

- A second disbursement arrives within the paid installment period.
- A second disbursement arrives on an early-paid loan where the last installment EMI would be reduced.
- An advance payment is adjusted to the next installment.

The system also supports these scenarios:

- A second disbursement arrives within the paid installment period.
- A second disbursement arrives on an early-paid loan where the last installment EMI would be reduced.
- An advance payment is adjusted to the last installment.

Additional rules for multi disbursement scenarios:

- A second disbursement can occur on the same date as an installment date.
- Interest calculation type is the same as the repayment period.

### Payment allocation order

A payment is allocated to installments in this order: past installments, due installments, in-advance installments, then the current installment. Past due installments are processed oldest first. In-advance installments are processed next or last based on configuration.

The Rate Factor for simple interest is calculated using simple interest, and a Rate Factor is calculated for each term of the loan to calculate the monthly payment. The monthly repayment amount uses these Rate Factors, except for the last payment, which is just the rest of the balance.

### Interest rate conversion basics

Interest rates convert from a yearly rate to a monthly, weekly or daily rate for calculation. Declining balance interest is principal balance * interest rate.

| Rate type | Conversion |
| --- | --- |
| Monthly interest rate | yearly interest rate/12 |
| Weekly interest rate | yearly interest rate/52 |
| Daily interest rate | yearly interest rate/365 |

| Rate type | Conversion for an installment |
| --- | --- |
| Monthly interest rate | yearly interest rate/12 * total months per installment |
| Weekly interest rate | yearly interest rate/52 * total weeks per installment |
| Daily interest rate | yearly interest rate/365 * avg days in an installment |

Interest calculation is daily at yearly interest rate/365 * no of days in the installments. For community version, when iterating, the EMI adjustment amount is calculated as (Last installment EMI - calculated EMI) / number of (remaining) periods.

### Worked examples

Standard monthly repayment (figures are illustrative). A customer borrows a principal of 1,000 at an annual interest rate of 12 percent. The product uses a 360-day year and 30-day months, with repayment every 1 month over 3 monthly installments. The rate factor for each period is 1.010000000. If the days-in-year setting were changed to 365 while all other inputs stayed the same, each period's interest would be slightly smaller because the annual rate is divided by a larger number.

| Date | Opening balance | Payment | Interest | Principal | Closing balance |
| --- | --- | --- | --- | --- | --- |
| 1/1/24 | 1,000.00 | – | – | – | 1,000.00 |
| 2/1/24 | 1,000.00 | 340.02 | 10.00 | 330.02 | 669.98 |
| 3/1/24 | 669.98 | 340.02 | 6.70 | 333.32 | 336.66 |
| 4/1/24 | 336.66 | 340.03 | 3.37 | 336.66 | 0.00 |
| Total | – | 1,020.07 | 20.07 | 1,000.00 | – |

Downpayment reduces the opening balance. A customer borrows 1,000 at 12 percent per year with a 360-day year and 30-day months. A downpayment of 250 is posted on the first day, leaving 750 to be repaid over 3 monthly installments. The rate factor remains 1.010000000, and the installment is recalculated on the reduced balance.

| Date | Opening balance | Payment | Interest | Principal | Closing balance |
| --- | --- | --- | --- | --- | --- |
| 1/1/24 | 1,000.00 | 250.00 | 0.00 | 250.00 | 750.00 |
| 2/1/24 | 750.00 | 255.02 | 7.50 | 247.52 | 502.48 |
| 3/1/24 | 502.48 | 255.02 | 5.02 | 250.00 | 252.48 |
| 4/1/24 | 252.48 | 255.00 | 2.52 | 252.48 | 0.00 |
| Total | – | 1,015.04 | 15.04 | 1,000.00 | – |

Second disbursement during the term. A customer receives 1,000 on the first day and repays monthly over 3 installments at 12 percent per year (360-day year, 30-day months). After the first installment, a second disbursement of 500 arrives on the same date as an installment, raising the balance. The system recalculates the installment once for the two remaining periods.

| Date | Event | Opening balance | Payment | Interest | Principal | Closing balance |
| --- | --- | --- | --- | --- | --- | --- |
| 1/1/24 | Disbursement | – | – | – | – | 1,000.00 |
| 2/1/24 | First installment | 1,000.00 | 340.02 | 10.00 | 330.02 | 669.98 |
| 2/1/24 | Second disbursement | 669.98 | – | – | – | 1,169.98 |
| 3/1/24 | Recalculated installment | 1,169.98 | 593.78 | 11.70 | 582.08 | 587.90 |
| 4/1/24 | Final installment | 587.90 | 593.78 | 5.88 | 587.90 | 0.00 |

Fifteen-day repayment cycle (unusual period). A customer borrows 1,000 at 12 percent per year with a 360-day year. Repayments fall every 15 days over 4 installments. The rate factor for each 15-day period is 1.005000000, so interest is charged for half a month at a time.

| Date | Opening balance | Payment | Interest | Principal | Closing balance |
| --- | --- | --- | --- | --- | --- |
| 1/1/24 | 1,000.00 | – | – | – | 1,000.00 |
| 1/16/24 | 1,000.00 | 253.13 | 5.00 | 248.13 | 751.87 |
| 1/31/24 | 751.87 | 253.13 | 3.76 | 249.37 | 502.50 |
| 2/15/24 | 502.50 | 253.13 | 2.51 | 250.62 | 251.88 |
| 3/1/24 | 251.88 | 253.14 | 1.26 | 251.88 | 0.00 |
| Total | – | 1,012.53 | 12.53 | 1,000.00 | – |

## Interest Rates by Balance Status

Interest rates can be configured by balance status and balance type at the loan product level. This configuration is limited to the Advance repayment strategy type.

Interest is calculated only on the current principal balance, which is the total principal balance minus the past due principal balance.

- Interest is calculated only on the current principal balance, which is the total principal balance minus the past due principal balance.
- Interest is not calculated on the past due principal amount.

The option to exclude past due principal balances from interest calculation depends on interest recalculation settings.

- The “Do not calculate interest on past due principal balances” checkbox appears under Settings → Interest Recalculation and defaults to unchecked.
- This option is available only when interest recalculation is enabled.
- The setting is supported on the loan product through loan product interest recalculation details and is stored on the loan through loan interest recalculation details when a loan is created.

The field for this option is added to the loan product update request in the Loan Products swagger file.

A loan officer configures a loan with a principal of 1,000.00, an annual interest rate of 12 percent, and three monthly installments over 30-day months; the figures are illustrative. The officer turns on "Do not calculate interest on past due principal balances." When the customer misses the first installment, its principal portion becomes past due. For the second installment, interest is calculated only on the current principal balance—the total principal minus the past due principal—so the past due amount does not increase the interest charge. The example shows that excluding past due principal keeps the second installment interest lower than it would be on the full balance.

| Month | Opening principal | Past due principal | Interest due | Principal due | Total due |
| --- | --- | --- | --- | --- | --- |
| 1 | 1,000.00 | 0.00 | 10.00 | 333.33 | 343.33 |
| 2 | 1,000.00 | 333.33 | 6.67 | 333.33 | 340.00 |
| Total |  |  | 16.67 | 666.66 | 683.33 |

## 366-Day Year Interest

For a multi-year loan, daily interest uses 365 days in non-leap years and 366 days in leap years. Users can configure yearly interest calculation to consider leap years using one of two options: one uses 366 days when the loan has a leap year and 365 days for non-leap years, while the other uses 366 days only if the installment falls in February and otherwise uses 365 days. If rescheduling moves an interest period to include 29 February, interest is recalculated from 1 January to the current date because it is now a 366-day year.

Interest periods can span two calendar years.

- For a period from 13 December 2023 to 13 January 2024, Temenos recognizes 19 days in 2023 and 12 days in 2024.

## Leap Year Interest Calculation

Leap year interest calculation applies when days in year is set to Actual for progressive loans. You choose how the system counts days in a leap year using a dropdown on the loan product that is inherited at loan level.

The dropdown has two options:

- FULL_LEAP_YEAR uses 366 days in year if it is a leap year, otherwise 365.
- FEB_29_PERIOD_ONLY uses 366 days in year only for the period that contains 29 February, otherwise 365.

The default value is FULL_LEAP_YEAR.

Interest uses the rate factor formula: interest rate * days in month / days in year.

The following do not affect leap year interest calculation:

- Overdue loans do not change anything, and interest after the maturity date is not recalculated.
- Additional installments do not change the maturity date and do not trigger interest recalculation.

After reschedule, if the maturity date is now on or after 29 February and FEB_29_PERIOD_ONLY is selected, the system recalculates interest for the period that now contains 29 February.

When days in year is configured to Actual, 366 days is considered only for the period that contains 29 February, and 365 days is considered otherwise, even if the year is a leap year.

A loan officer sets up a progressive loan with a principal of 1,000, an annual interest rate of 12 percent, and monthly installments. The year basis is Actual and the leap year option is Full leap year. The loan starts on 1 January in a leap year, so the gaps are 31 days, 29 days, and 31 days. Because Full leap year is selected, every period uses 366 days in the year. The figures are illustrative. With February 29 period only instead, the first and last periods would use 365 days and only the middle period would use 366 days, making total interest slightly higher.

| Date | Days | Year days | Interest | Principal | Balance |
| --- | --- | --- | --- | --- | --- |
| 1 Feb | 31 | 366 | 10.16 | 329.84 | 670.16 |
| 1 Mar | 29 | 366 | 6.37 | 333.63 | 336.53 |
| 1 Apr | 31 | 366 | 3.42 | 336.53 | 0.00 |
| Total | - | - | 19.95 | 1,000.00 | - |

A loan officer sets up the same loan, but the start date is 1 January in a non-leap year and the gaps are 31 days, 28 days, and 31 days. The leap year option remains Full leap year, yet the system uses 365 days in the year for every period because the year is not a leap year. This shows that Full leap year applies 366 days only when the year is actually a leap year.

| Date | Days | Year days | Interest | Principal | Balance |
| --- | --- | --- | --- | --- | --- |
| 1 Feb | 31 | 365 | 10.19 | 329.81 | 670.19 |
| 1 Mar | 28 | 365 | 6.17 | 333.83 | 336.36 |
| 1 Apr | 31 | 365 | 3.43 | 336.36 | 0.00 |
| Total | - | - | 19.79 | 1,000.00 | - |

A loan officer sets up the same loan with a principal of 1,000 and an annual interest rate of 12 percent, but the start date is 1 March in a leap year, so the gaps are 31 days, 30 days, and 31 days and no period contains 29 February. The leap year option is February 29 period only, so every period uses 365 days in the year. This shows that when no period contains 29 February, the option behaves like a 365-day year; under Full leap year the same loan would use 366 days for every period and produce slightly lower interest.

| Date | Days | Year days | Interest | Principal | Balance |
| --- | --- | --- | --- | --- | --- |
| 1 Apr | 31 | 365 | 10.19 | 329.81 | 670.19 |
| 1 May | 30 | 365 | 6.61 | 333.39 | 336.80 |
| 1 Jun | 31 | 365 | 3.43 | 336.80 | 0.00 |
| Total | - | - | 20.23 | 1,000.00 | - |
