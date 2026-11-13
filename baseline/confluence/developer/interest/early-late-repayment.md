# Early and Late Repayment Interest

## Early and late repayment interest behavior

Early repayment recalculates interest as of the payment date, so the interest for that installment period is collected early and the lower principal balance reduces interest over the remaining life of the loan. Because the schedule is not re-amortized, the reduced interest affects the final installment. Late repayment collects interest only until the installment date, matching the repayment schedule interest due balance, and the higher balance results in additional interest and a higher final payment.

## Early repayment rules

Early repayment rules decide how interest is collected and how the repayment schedule changes when you repay before an installment is due. The outcome depends on whether the configuration allocates advance amounts to the next installment or the last installment.

Advance amounts from early repayments are allocated as follows:

- Advance amounts go to the next installment or the last installment based on the configuration set.

Interest collection depends on the configuration:

- Calculated interest is collected only for early payments with adjust to next installment configuration.
- No interest is collected when the early payment happens with adjust to last installment configuration; only principal is collected.

Early partial payments:

- Early partial payments collect the recalculated interest of that installment period as of the payment date, and the collected interest becomes the interest portion of that installment period.
- Remaining installments are recalculated based on the principal balance as of that installment period, and the interest amount is adjusted accordingly.

Early payment of EMI or a greater amount:

- Early payment of EMI or a greater amount closes the installment period with interest recalculated.
- Remaining installments are recalculated according to the new principal balance, and the interest amount is adjusted accordingly.
- Interest is recalculated and collected as of the transaction date where the early payment is happening.

Adjust to last installment exception:

- For early repayment with adjust to last installment configuration, no interest is collected except when the only installment not yet paid is the current installment; in that case the payable interest must be calculated and paid.

Payable interest for the current installment:

- Payable interest to be collected as of the early repayment date is the interest of that installment period.
- Calculated interest is collected only for early payments of the current installment.
- Payable interest of the current installment is the total interest for the past days of the current installment plus the daily interest of the current date.
- If the installment is a future installment but not the current one, there is no payable interest because there were no past days.

Effect on final installments:

- Reduced interest due to early repayment impacts the final installment, and the final installment EMI is relatively lower than the other installments EMIs.

## Late repayment rules

A late repayment can cover some periods late and other periods in advance. Late repayments do not create new installments unless they arrive after the maturity date.

Late repayments behave as follows:

- Any advance amounts out of late repayments adjust to the next installment, the last installment, or the first next installment with any remaining amount to the last installment.
- The system recalculates the remaining installments based on the new principal balance and adjusts interest accordingly.
- The last not yet fully paid installment EMI becomes relatively higher than the other installments EMIs.
- Late repayments arriving after the maturity date collect the installment interest they are fulfilling.
- When a late repayment arrives after the maturity date, the system creates a new installment as of the repayment date and calculates its interest for the extra days from the last maturity date on the first overdue principal balance.

## Progressive interest bearing loans

For a progressive interest bearing loan product with interest recalculation enabled, the system supports early and late payment situations. The only supported advance payments adjustment type is Adjust last, unpaid period. When you make an in advance payment, the system amends the EMI of the last unpaid period. If the last installment was fully paid, the system amends the last but one period instead.

## Recalculation scope and maturity

Interest recalculation replays all transaction types, including accruals, in reverse order and applies only up to the maturity date. The system does not recalculate interest after the maturity date.

## Interest calculation configuration

The daily rate factor is 1 + (rate of interest × (repaid every / days in year) × actual days in period / calculated days in period). Interest calculation runs daily, interest recalculation is enabled with a frequency interval of 1, and outstanding principal is recalculated daily.

## Worked examples

A loan of 1,000 carries an annual interest rate of 12%, is repayable in 3 monthly installments, and uses 30-day months and a 360-day year. The level installment is 340.00, due on the first day of each month. The borrower pays the second installment, due on 3/1, late on 3/15. Interest for that installment is collected only to the installment date, and the unpaid balance attracts additional interest until the payment date, so the final installment rises. The figures are illustrative.

| Date | Event | Opening balance | Interest collected | Principal paid | Closing balance | Installment total |
| --- | --- | --- | --- | --- | --- | --- |
| 2/1 | Installment 1 due | 1,000.00 | 10.00 | 330.00 | 670.00 | 340.00 |
| 3/15 | Installment 2 paid late | 670.00 | 10.05 | 329.95 | 340.05 | 340.00 |
| 4/1 | Final installment | 340.05 | 1.81 | 340.05 | 0.00 | 341.86 |
| Totals |  |  | 21.86 | 1,000.00 |  | 1,021.86 |

The late payment keeps the balance higher for 15 extra days, so the final installment is 341.86 instead of 340.07.

The same loan of 1,000 at 12% annually with 3 monthly installments and 30-day months matures on 4/1. The scheduled final installment is 340.07. The borrower pays the last installment on 4/15, after maturity. A new installment is created as of 4/15; it collects the installment interest due to the maturity date plus interest for the 14 extra days on the overdue principal, so the final payment is higher than the scheduled final installment.

| Date | Event | Opening balance | Interest to maturity | Extra-days interest | Principal paid | Closing balance | Installment total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2/1 | Installment 1 due | 1,000.00 | 10.00 | 0.00 | 330.00 | 670.00 | 340.00 |
| 3/1 | Installment 2 due | 670.00 | 6.70 | 0.00 | 333.30 | 336.70 | 340.00 |
| 4/15 | Last installment paid after maturity | 336.70 | 3.37 | 1.57 | 336.70 | 0.00 | 341.64 |
| Totals |  |  | 20.07 | 1.57 | 1,000.00 |  | 1,021.64 |

Paying after maturity adds 1.57 of extra-days interest, so the final payment is 341.64 instead of 340.07.

A loan of 1,000 at 12% annually with 3 monthly installments and 30-day months has level installments of 340.00 due on the first of each month. After the first installment is paid on 2/1, the balance is 670.00. The borrower pays 340.00 early on 2/15. With the advance applied to the next installment, interest for the 15 days to the payment date is collected and the balance falls; with the advance applied to the last installment, only principal is collected and no interest is taken on the early payment.

| Configuration | Date | Event | Opening balance | Interest collected | Principal paid | Closing balance | Installment total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Adjust to next | 2/1 | Installment 1 due | 1,000.00 | 10.00 | 330.00 | 670.00 | 340.00 |
| Adjust to next | 2/15 | Early payment of installment 2 | 670.00 | 3.35 | 336.65 | 333.35 | 340.00 |
| Adjust to next | 4/1 | Final installment | 333.35 | 5.00 | 333.35 | 0.00 | 338.35 |
| Adjust to last | 2/1 | Installment 1 due | 1,000.00 | 10.00 | 330.00 | 670.00 | 340.00 |
| Adjust to last | 2/15 | Early payment of installment 2 | 670.00 | 0.00 | 340.00 | 330.00 | 340.00 |
| Adjust to last | 4/1 | Final installment | 330.00 | 4.95 | 330.00 | 0.00 | 334.95 |
| Totals |  |  |  | 18.35 / 14.95 | 1,000.00 / 1,000.00 |  | 1,018.35 / 1,014.95 |

With adjust to last installment, the early payment collects principal only, so total interest falls to 14.95 and the final installment is 334.95, lower than 338.35 under adjust to next.

See also: [Backdated Loans](confluence-link:Backdated%20Loans).
