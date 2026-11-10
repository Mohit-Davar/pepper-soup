# Contract Termination

## Contract Termination

### Eligibility and permissions

Contract termination applies to an active loan of progressive type that has not already been contract terminated or charged off. A user must hold contract termination permission to perform it through the API or the UI.

### Transaction characteristics

Contract termination creates a non-monetary transaction of type CONTRACT_TERMINATION as of the current date only; backdating is not allowed.

Contract termination does not require these fields or details:

- A transaction date.
- A payment type or payment details.
- A transaction amount.

Contract termination supports these fields:

- External ID.
- Note.

No transaction amount is displayed for contract termination.

### UI access and fields

You can invoke Contract Termination for active loans from the More menu in the Mifos Web App. You can also undo a Contract Termination.

The screen shows the following fields:

- Transaction date shows the current business date and cannot be edited.
- Transaction amount is shown and cannot be edited.

### Schedule and maturity changes

When a loan contract is terminated, all installments accelerate and become due as of the contract terminated date. Interest through that date and the outstanding principal balance make up the amount due, and the maturity date moves to the contract terminated date.

The system recalculates the repayment schedule as follows:

- All future installments are removed.
- Any outstanding balances move to the current installment.
- Charges with a due date after the new maturity date move to an additional installment.

Contract termination follows the same behaviour as charge-off:

- It accelerates the maturity date to the contract terminated date.
- Its balances calculation is similar to charge-off balances calculation.

The template API returns outstanding balances up to the current date.

### Accrual and delinquency

After termination, accrual and accrual activity stop and no future accruals occur. Delinquency bucketing continues under the accelerated schedule, and days past due are calculated from the new due dates.

### Charge-off interaction

You can charge off a loan account only after its contract has been terminated. Charge-off does not change the repayment schedule.

Charge-off and charge-back rules for terminated accounts:

- Charge-off is allowed on terminated loan accounts.
- Chargebacks are allowed on terminated loan accounts.
- Contract termination is not supported on charged-off loans.

### Reversal and undo

You can reverse or undo a contract termination. The system recalculates and reapplies the repayment schedule and all transactions accordingly. New balances are calculated and reflected in the repayment schedule.

When you reverse a termination, you can provide the following:

- Notes
- External ID

After reversal:

- The loan sub-status is removed.
- You can terminate the loan again.

### Backdated transactions and reverse-replay

You can record backdated payments and reverse transactions before or after contract termination. A backdated transaction triggers reverse-replay: the system regenerates the schedule if the transaction date is before the termination date, then reapplies all transactions in order, similar to how it handles charged-off loans with accelerated maturity. Current-date accrual is created as it is at charge-off.

### Termination after maturity

When you terminate a contract after its maturity date, the existing installments and the maturity date stay unchanged, and interest is calculated only up to the original maturity date, not up to the termination date. Contract termination is always dated as of the current date; neither future dating nor backdating is allowed.

### N+1 installments and charges

Contract termination does not affect the N+1 installment, and charges remain allowed after the termination date.

Charges after maturity apply to the additional installment:

- Charges after maturity apply on the additional installment.

### Loan status and sub-status

Contract termination leaves the loan status ACTIVE and sets the sub-status to CONTRACT_TERMINATED. You cannot terminate a contract more than once. The system triggers an Account Changed event during termination, but creates no accounting entry activity for it. Configuration that affects contract termination is documented in the user documentation.

Contract termination ends the loan contract while keeping the loan active under a terminated sub-status.

### Worked examples

A loan officer terminates an active progressive loan before its maturity. The figures are illustrative. The loan has a principal of 1,000.00, an annual interest rate of 12 percent (1 percent per 30-day month), and three monthly installments. The borrower pays the first installment of 510.00 on its due date, reducing the principal to 500.00. On the due date of the second installment, the officer marks the loan for contract termination as of the current date. The system sets the sub-status to Contract Terminated, keeps the loan status active, removes future installments, and moves the outstanding principal and accrued interest to the current installment. The example shows that the termination amount equals the outstanding principal plus interest accrued up to the termination date.

| Event | Principal due | Interest due | Total due | Remaining principal |
| --- | --- | --- | --- | --- |
| Loan disbursed | — | — | — | 1,000.00 |
| Installment 1 paid | 500.00 | 10.00 | 510.00 | 500.00 |
| Contract termination | 500.00 | 5.00 | 505.00 | 500.00 |

A loan officer terminates an active progressive loan that carries an outstanding charge. The figures are illustrative. The loan has a principal of 1,000.00, an annual interest rate of 12 percent (1 percent per 30-day month), and three monthly installments. After the first installment of 510.00 is paid, the principal is 500.00. A charge of 50.00 is added to the account before termination. On the second installment due date, the officer marks the loan for contract termination as of the current date. The charge is added to the termination amount, and the sub-status becomes Contract Terminated while the loan status remains active. Compared with termination without a charge, the only change is that the outstanding charge is added to the amount due.

| Event | Principal due | Interest due | Charge due | Total due | Remaining principal |
| --- | --- | --- | --- | --- | --- |
| Loan disbursed | — | — | — | — | 1,000.00 |
| Installment 1 paid | 500.00 | 10.00 | — | 510.00 | 500.00 |
| Charge added | — | — | 50.00 | 50.00 | 500.00 |
| Contract termination | 500.00 | 5.00 | 50.00 | 555.00 | 500.00 |

A loan officer terminates an active loan on a date that falls between installment due dates. The figures are illustrative. The loan has a principal of 1,000.00, an annual interest rate of 12 percent (1 percent per 30-day month), and three monthly installments. The borrower pays the first installment of 510.00 on its due date, leaving 500.00 outstanding. Fifteen days into the next month, the officer marks the loan for contract termination as of the current date. Interest accrues for the fifteen days on the outstanding principal, and the maturity date moves to the termination date. The example shows that interest is calculated only up to the termination date, even when that date falls between scheduled installments.

| Event | Principal outstanding | Days | Interest due | Total due | Remaining principal |
| --- | --- | --- | --- | --- | --- |
| Loan disbursed | 1,000.00 | — | — | — | 1,000.00 |
| Installment 1 paid | 500.00 | 30 | 10.00 | 510.00 | 500.00 |
| Contract termination | 500.00 | 15 | 2.50 | 502.50 | 500.00 |
