# Re-amortization

## Re-amortization

### Eligibility and applicability

Re-amortization applies to interest-bearing loan accounts that use the Progressive loan repayment strategy. It cannot be applied after the maturity date or after the new maturity date, and it cannot be applied on charge-off or written-off loan accounts. Credit transactions such as disbursements and capitalised income work normally on the re-amortization schedule.

Schedule handling after re-amortization depends on the selected behaviour:

- Default behaviour applies to interest-bearing loan accounts with interest recalculation enabled.
- Interest Waiver behaviour applies to both non-interest-bearing and interest-bearing loan accounts.
- Equal Overdue Interest split behaviour applies to both non-interest-bearing and interest-bearing loan accounts.

### Interest handling options

Interest handling options control how interest and charges are treated when re-amortization is applied to a loan account. You select an option from the Interest handling drop down during application of re-amortization.

The available interest handling options are:

- Default Behavior recalculates actual interest and EMI based on the new principal balance.
- Waive Interest recalculates actual interest and EMI based on the new principal balance.
- Equal Overdue Interest Split splits outstanding payable interest, including chargeback interest, equally among future installments.
- Zero Interest carry forward is an option.
- Interest and Charges equal splits is an option.

Interest calculation follows these rules:

- Interest calculation follows the re-amortization interest handling setting.
- Interest re-calculation based on new dates and charges stays as it is.
- Interest equal splits and charges stays as it is.

### Default behavior details

With default re-amortization behavior, overdue interest including chargeback interest moves to the first installment after the re-amortization date.

The remaining default behaviors are:

- Overdue charge including chargeback charge remains as is on the existing installment.
- Fees or penalties with a due date after the re-amortization date remain as is.

### Waive interest behavior details

When you apply re-amortization with waive interest behaviour, overdue interest including chargeback interest is waived off, while overdue charges including chargeback charges remain as is on existing installments. Fees and penalties with a due date after re-amortization also remain as is, and down-payment amounts are not affected by re-amortization.

### Equal overdue interest split behavior details

Equal Overdue Interest Split divides outstanding charges and penalties equally among the new installments created by re-amortization. Charges and penalties with a due date after the re-amortization date remain unchanged on their existing installment.

### Installment and payment treatment

Re-amortization recalculates the current and all future installments based on the current outstanding principal without changing the repayment schedule structure, adding or removing installments, or changing due dates. It does not recreate repayment periods or create special installments.

The following amounts stay where they are and are not re-amortized:

- The N+1 installment remains as is.
- Partial paid amounts on installments before re-amortization remain as is; only the unpaid amount is re-amortized.
- Down-payment amounts have no impact from re-amortization.
- Fees and penalties remain where they were.
- Chargeback amounts remain as they are.
- Payable interest does not change.
- Accruals do not change.
- Split interest and fees act like standalone amounts and do not take part in recalculation or interest calculation.

Past due periods are treated as follows:

- All past due period EMIs are set to the total amount of paid balances plus charges and are not re-amortized.
- Partial paid amounts remain as they are on the installment, while unpaid overdue amounts are re-amortized accordingly.
- No paid amounts are moved anywhere.

When re-amortization is applied with Default behaviour, waive interest behaviour, or Equal Overdue Interest Split:

- Partial or excess paid amounts on installments before re-amortization remain as is on allocated installments; only the unpaid amount is re-amortized.
- This applies to allocation to the last installment or the next installment.
- Down-payment amounts have no impact from re-amortization under Equal Overdue Interest Split.
- The N+1 installment remains as is under Equal Overdue Interest Split.

### Reversal and repeat re-amortization

You can reverse a re-amortization transaction until it is the latest transaction on the loan, and reversal is allowed at any point in the loan life cycle even when monetary transactions occur after the re-amortization. You can perform multiple re-amortizations on a loan account, but not more than one on the same date, and every re-amortization must use the same interest options as the first re-amortization.

### Accrual handling

Accruals are recalculated and adjusted as of the re-amortization business date at end of day. Accrual activity for overdue installments being re-amortized is reversed or reverse-replayed on that date in real time.

Periodic accrual follows the new installment interest:

- Periodic accrual is calculated and posted periodically based on the new installment interest.
- Accrual activity posts regularly according to the new future installment dates on installment dates at end of day.

Backdated repayments and reversals are handled as follows:

- Any backdated repayment or reversal before the re-amortization date recalculates and posts the difference accrual or accrual adjustment as of the current business date at end of day.
- Any backdated repayment results in installment re-calculation before re-amortization, creating a new accrual activity as of the installment date in real time.
- Any backdated repayment reversal results in installment re-calculation and re-amortization, reversing the respective accrual activity transaction in real time.

### Backdated transactions

Backdated repayment or reversal is allowed; re-amortization is reversed and replayed accordingly.

### Schedule recalculation and preview

You can generate and preview a re-amortized schedule based on selected parameters. The system recalculates and reapplies the repayment schedule, which then reflects the re-amortized details. Any type of transaction and feature works normally on the re-amortization schedule.

1. Generate and preview the re-amortized schedule based on selected parameters.
2. Review the preview schedule.
3. Select “go back” to return to the re-amortization parameter screen if needed.

When a reversal of a re-amortization transaction is done, the repayment schedule is recalculated and reapplied.

### User interface and workflow

You can apply re-amortization from an active loan account and view the re-amortized transaction details in the transaction tab afterward. You can also undo a re-amortized transaction from the UI.

1. Open the loan account and choose "Re-Amortize" from the actions to open the loan reamortize screen.
2. Optionally set Interest Handling, Reason, External Id and Note on the loan reamortize screen.
3. Choose Submit on the loan reamortize screen.

The loan reamortize screen and repayment schedule preview dialog provide the following controls:

- The loan reamortize screen offers Cancel, Submit and Preview buttons.
- The repayment schedule preview dialog offers a Go back button and displays the heading Repayment Schedule Preview.

The Reason field on the loan reamortize screen works as follows:

- The Reason field is a text field.
- The Reason field is optional.

### Worked examples

A loan officer re-amortizes an interest-bearing loan after a borrower misses an installment. The figures are illustrative. The loan has a principal of 1,000.00, an annual interest rate of 12 percent, four monthly installments, and 30-day months. The borrower pays the first installment in full and misses the second. On the re-amortization date, the overdue principal and interest are carried forward, and the system recalculates the installment on the remaining principal balance.

| Date | EMI | Interest | Principal | Balance |
| --- | --- | --- | --- | --- |
| 1/1 | — | — | — | 1,000.00 |
| 2/1 | 260.00 | 10.00 | 250.00 | 750.00 |
| 3/1 | 0.00 | 7.50 | 0.00 | 750.00 |
| 3/15 | — | 3.50 | — | 753.50 |
| 4/1 | 392.50 | 15.04 | 377.46 | 376.04 |
| 5/1 | 379.80 | 3.76 | 376.04 | 0.00 |

When an overdue installment is charged off and the product setting makes future interest zero, the charge-off clears the overdue principal and interest, and subsequent installments collect principal only. The loan keeps its original installment dates.

| Date | EMI | Interest | Principal | Balance |
| --- | --- | --- | --- | --- |
| 1/1 | — | — | — | 1,000.00 |
| 2/1 | 260.00 | 10.00 | 250.00 | 750.00 |
| 3/1 | 260.00 | 7.50 | 252.50 | 497.50 |
| 4/1 | 248.75 | 0.00 | 248.75 | 248.75 |
| 5/1 | 248.75 | 0.00 | 248.75 | 0.00 |

A borrower pays part of an installment and the loan is re-amortized on the re-amortization date. The loan has a principal of 1,000.00, an annual interest rate of 12 percent, four monthly installments, and 30-day months. After the first installment is paid in full, the borrower pays only 100.00 of the second installment. The unpaid principal is carried forward and re-amortized.

| Date | EMI | Interest | Principal | Balance |
| --- | --- | --- | --- | --- |
| 1/1 | — | — | — | 1,000.00 |
| 2/1 | 260.00 | 10.00 | 250.00 | 750.00 |
| 3/1 | 100.00 | 7.50 | 92.50 | 657.50 |
| 3/15 | — | 3.07 | — | 660.57 |
| 4/1 | 335.00 | 6.61 | 328.39 | 332.18 |
| 5/1 | 335.50 | 3.32 | 332.18 | 0.00 |

The same loan can be re-amortized with the waive-interest option instead of the default option. Under waive interest, the overdue interest is cancelled rather than moved to the first installment after the re-amortization date. The result is a lower first installment and less total interest.

| Date | EMI | Interest | Principal | Balance |
| --- | --- | --- | --- | --- |
| 1/1 | — | — | — | 1,000.00 |
| 2/1 | 260.00 | 10.00 | 250.00 | 750.00 |
| 3/1 | 0.00 | 0.00 | 0.00 | 750.00 |
| 3/15 | — | — | — | 750.00 |
| 4/1 | 385.00 | 7.50 | 377.50 | 372.50 |
| 5/1 | 376.23 | 3.73 | 372.50 | 0.00 |
