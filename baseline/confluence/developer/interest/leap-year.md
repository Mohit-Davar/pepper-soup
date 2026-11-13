# Leap Year Interest Calculation

Leap year interest calculation applies when days in year is set to ACTUAL on a progressive loan product. The setting is inherited by loans created from that product. It controls how many days in the year are used when calculating interest. The dropdown appears only when ACTUAL is selected for days in year.

The dropdown has two values:

| Value | Days in year used |
| --- | --- |
| FULL_LEAP_YEAR | 366 if the year is a leap year, otherwise 365 |
| FEB_29_PERIOD_ONLY | 366 for the period that contains 29 February, otherwise 365 |

Interest uses the simplified formula: interest rate * days in month / days in year.

Limits:

- 366 days applies only to the period that contains 29 February.
- 365 days applies to all other periods, even in a leap year.

A Progressive loan uses ACTUAL days in a year with the FEB_29_PERIOD_ONLY option. The principal is 1,000, the annual interest rate is 12%, and the loan is repaid in three monthly installments with fixed principal of 333.33, 333.33, and 333.34. Disbursement is on 1 January 2024, a leap year, so the period from 1 February to 1 March contains 29 February and uses 366 days; the other periods use 365 days. The figures are illustrative. This option applies only to Progressive loans; overdue loans do not change the calculation, and interest is not recalculated after the maturity date or because of additional installments. With FULL_LEAP_YEAR instead, every period in this leap year would use 366 days.

| Period | Days in month | Days in year | Opening balance | Interest | Principal paid | Installment | Closing balance |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 31 | 365 | 1,000.00 | 10.19 | 333.33 | 343.52 | 666.67 |
| 2 | 29 | 366 | 666.67 | 6.34 | 333.33 | 339.67 | 333.34 |
| 3 | 31 | 365 | 333.34 | 3.40 | 333.34 | 336.74 | 0.00 |
| Total |  |  |  | 19.93 | 1,000.00 | 1,019.93 |  |

A Progressive loan uses ACTUAL days in a year with FEB_29_PERIOD_ONLY, but its term runs from 1 March to 1 June 2024, so no period contains 29 February even though 2024 is a leap year. The principal is 1,000, the annual interest rate is 12%, and the loan is repaid in three monthly installments with fixed principal of 333.33, 333.33, and 333.34. Every period therefore uses 365 days. In a non-leap year the same schedule would also use 365 days for every period.

| Period | Days in month | Days in year | Opening balance | Interest | Principal paid | Installment | Closing balance |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 31 | 365 | 1,000.00 | 10.19 | 333.33 | 343.52 | 666.67 |
| 2 | 30 | 365 | 666.67 | 6.58 | 333.33 | 339.91 | 333.34 |
| 3 | 31 | 365 | 333.34 | 3.40 | 333.34 | 336.74 | 0.00 |
| Total |  |  |  | 20.17 | 1,000.00 | 1,020.17 |  |
