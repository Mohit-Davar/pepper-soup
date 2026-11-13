# Projected Balances

The Projected Amortization Schedule shows the expected payment path for a Working Capital (WC) loan. The system generates it automatically when the loan is created and keeps it current across the full loan life cycle. It updates based on approval, disbursement, and repayment activity, including payments made, missed, or overpaid.

The schedule includes the following columns:

| Column | Description |
| --- | --- |
| Amortization Installment No | Serial number of the installment |
| Amortization Installment Date | Date of the installment |
| Expected Payment Amount | Calculated period payment amount |
| Discount Factor | Factor used in the calculation |
| NPV Value | Net present value of the installment |
| Balance | Remaining loan balance |
| Net Amortization Amount | Calculated amortized amount |
| Actual Payment Amount | Amount actually paid |
| Actual Amortization Amount | Amount actually amortized |
| Income Modification | Total expected amortization minus actual amortization as of the payment date |
| Deferred Balance | Discount amount balance |

For Working Capital loans, the schedule uses DUE and IN ADVANCE transaction allocation balances; PAST DUE is not applicable:

- DUE PRINCIPAL is the projected principal payment.
- DUE FEE and DUE PENALTY are current or older charges based on their specific due date.
- IN ADVANCE PRINCIPAL is over projected principal payment.
- IN ADVANCE FEE and IN ADVANCE PENALTY are future charges based on their specific due date.

Other behaviour of the schedule:

- Totals in the amortization table can be off by a couple of cents because of rounding from the precise model to the currency of the loan, handled the same way as with progressive loans.
- Zero-filled rows do not create an actual transaction; they are cosmetic changes on the schedule.
- Zero-filled rows are considered as actual payments by the expected payment schedule, so expectations are recalculated as if a zero-amount repayment transaction landed.
- When input field values become too low and calculated values cannot be calculated, the system throws a valid error message referencing the issue, such as unable to calculate a valid EIR.

The loan account view screen shows the Projected Amortization Schedule with serial number of the installment, installment date, amortization installment date, expected payment as the calculated period payment amount value, and expected amortization amount as the calculated value.

The screen also shows the Amortization Schedule/running schedule with serial number of the transaction, amortization date as per input frequency, expected payment as the calculated period payment amount value, expected amortization amount as the calculated value, paid date, actual payment amount, balance of the loan which adds disbursement and discount amount and subtracts payment amount when payment is made, actual amortization amount as the calculated amortized amount, fees amount if any, penalty amount if any, income modification as total expected amortization minus actual amortization as of the payment date, and deferred balance as discount amount balance.

## Hide projected balances

Use the loan amortization schedule tab to view the projected amortization schedule, which the system automatically generates and maintains across the full loan lifecycle.

| Field | Required | Description |
| --- | --- | --- |
| Hide Projected | No | Hide the projected balances from the schedule. |

## Worked examples

A working capital loan is disbursed with a principal of 990, an annual interest rate of 12 percent, three monthly installments, and 30-day months. The figures are illustrative. The system creates the projected amortization schedule at disbursement and shows one row for each installment. The balance falls to zero by the last installment, and the NPV column shows each payment discounted to its present value.

| Installment | Date | Expected payment | Discount factor | NPV value | Balance | Net amortization | Actual payment | Actual amortization | Income modification | Deferred balance |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 2/1/2024 | 339.90 | 0.9901 | 336.53 | 660.00 | -9.90 | 339.90 | 330.00 | 0.00 | 0.00 |
| 2 | 3/1/2024 | 336.60 | 0.9803 | 329.97 | 330.00 | -6.60 | 336.60 | 330.00 | 0.00 | 0.00 |
| 3 | 4/1/2024 | 333.30 | 0.9706 | 323.50 | 0.00 | -3.30 | 333.30 | 330.00 | 0.00 | 0.00 |

The same loan is used, but the borrower pays 400 on the first installment, misses the second installment entirely, and pays 520 on the third installment to close the loan. Interest is a flat 10 per month and the discount factor is 1.0000 so the arithmetic stays easy to check by hand. The system recalculates the schedule after every payment, so the balance drops faster after the overpayment and stays flat after the missed payment. An overpayment appears as IN ADVANCE principal, while a missed payment leaves DUE principal until it is paid. If the first payment were 300 instead of 400, the balance would decline more slowly and the income modification would be positive rather than negative.

| Installment | Date | Expected payment | Discount factor | NPV value | Balance | Net amortization | Actual payment | Actual amortization | Income modification | Deferred balance |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 2/1/2024 | 310.00 | 1.0000 | 310.00 | 510.00 | -10.00 | 400.00 | 390.00 | 90.00 | 0.00 |
| 2 | 3/1/2024 | 310.00 | 1.0000 | 310.00 | 510.00 | 0.00 | 0.00 | 0.00 | -300.00 | 0.00 |
| 3 | 4/1/2024 | 310.00 | 1.0000 | 310.00 | 0.00 | -10.00 | 520.00 | 510.00 | 210.00 | 0.00 |

A working capital loan has a principal of 900 and an origination discount fee of 100, so the total amount to collect is 1,000 over five monthly installments of 200. The figures are illustrative. The system amortizes 10 percent of each payment toward the discount fee and holds the unearned part in a deferred balance. If the discount fee were reduced to 50 after the first payment, the deferred balance would fall by the unearned portion and an income modification would post for the change.

| Installment | Date | Expected payment | Discount factor | NPV value | Balance | Net amortization | Actual payment | Actual amortization | Income modification | Deferred balance |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 2/1/2024 | 200.00 | 1.0000 | 200.00 | 720.00 | -20.00 | 200.00 | 180.00 | 0.00 | 80.00 |
| 2 | 3/1/2024 | 200.00 | 1.0000 | 200.00 | 540.00 | -20.00 | 200.00 | 180.00 | 0.00 | 60.00 |
| 3 | 4/1/2024 | 200.00 | 1.0000 | 200.00 | 360.00 | -20.00 | 200.00 | 180.00 | 0.00 | 40.00 |
| 4 | 5/1/2024 | 200.00 | 1.0000 | 200.00 | 180.00 | -20.00 | 200.00 | 180.00 | 0.00 | 20.00 |
| 5 | 6/1/2024 | 200.00 | 1.0000 | 200.00 | 0.00 | -20.00 | 200.00 | 180.00 | 0.00 | 0.00 |
