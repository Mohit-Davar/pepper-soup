# Contract Termination

## About Contract Termination

Contract Termination ends an active loan as of the current date. A user with permission can perform it through the API or the UI. Termination starts when the system records a Reschedule / Default or Admin Cancellation trigger event, captures the Reason Code, and begins the termination workflow. Backdated termination is not supported.

You can start Contract Termination from the UI when:

- The loan is active.
- The loan is progressive.
- You use the Contract Termination option under the More item.

## Eligibility and permissions

You can terminate a loan that is active, progressive, not already contract terminated, and not charged-off. You need contract termination permission.

Validations for Contract Termination:

- The loan sub status must not be “CONTRACT_TERMINATED”.

## How to perform Contract Termination

No transaction amount is displayed, and no payment type or payment details are required. You can enter an external ID and a note.

The screen shows the following fields:

- The transaction date shows the current business date and cannot be edited.

## Schedule and maturity changes

Contract termination recalculates the repayment schedule, removes all future installments, moves any outstanding balances to the current installment, and sets the maturity date to the contract terminated date. All installments accelerate and become due as of that date, and no further interest accrues after termination. Delinquency bucketing continues according to the new accelerated schedule.

Termination before the maturity date:

- Charges with a due date after the new maturity date move to an additional installment.
- The N+1 installment is not impacted by termination.

Termination after the maturity date:

- Existing installments and the maturity date remain unchanged.
- Interest is calculated only until the original maturity date, not until the contract termination date.
- Charges after maturity apply on the additional installment.

Contract termination behaves like charge-off with the accelerate maturity date strategy.

| Behaviour | How it applies |
| --- | --- |
| Schedule | Recalculated; future installments removed; outstanding balances moved to the current installment |
| Maturity date | Set to the contract termination date when termination occurs before maturity; unchanged when termination occurs after maturity |
| Interest | Calculated only until the contract termination date before maturity, or until the original maturity date after maturity |
| Charges | Charges due after the new maturity date move to an additional installment |
| Acceleration | All installments become due as of the contract termination date |
| Delinquency | Bucketing continues per the new accelerated schedule |

## Charges and settlement amount

The settlement amount is the total you pay to end the contract early. It combines principal, interest and charges as of the current date.

The system calculates the settlement amount as follows:

- Principal outstanding counts at 100%.
- Add interest accrued.
- Add outstanding charges as of the current date.
- Subtract waivers applied.
- The result is the final total.

> **Note:** The system creates a non-monetary transaction as of the current date when contract termination is done.

## Accrual and delinquency

Accrual and accrual activity stop after termination, and current date accrual is created similarly as it happens at charge-off. Days past due are calculated from the new due dates.

## Loan status and sub-status

After contract termination, the loan status stays ACTIVE and the sub-status changes to CONTRACT_TERMINATED.

## Charge-off and chargebacks

You can charge off a terminated loan account. Charge-off does not change the repayment schedule after termination.

## N+1 installment and charges

## Reversing Contract Termination

You can reverse a contract termination. The system removes the loan sub-status, recalculates and reapplies the repayment schedule, and reapplies all transactions in order.

When reversing contract termination:

- You can add notes and an external ID.
- Backdated payments and reversals are allowed, and the system reverse-replays and adjusts the termination accordingly.

## Payments and transactions after termination

You can record backdated payments after contract termination, and you can reverse transactions before or after termination.

## Events and accounting

Contract Termination triggers an Account Changed event. No accounting entry activity occurs for Contract Termination.

## Worked examples

Contract termination on an installment due date. A customer takes a loan of 1,000 with an annual interest rate of 12%, repaid in 3 monthly installments using 30-day months. The first installment is paid on time. The loan officer processes contract termination on the second installment due date. The figures in this example are illustrative. All future installments are accelerated, so the termination amount is the principal outstanding plus the interest that has accrued since the last payment, and the balance becomes zero. If termination is processed later in the same month instead of on the due date, the interest portion is larger because interest accrues for the extra days.

| Date | Event | Amount | Principal | Interest | Balance |
| --- | --- | --- | --- | --- | --- |
| Start | Disbursement |  |  |  | 1,000.00 |
| 1st due date | Installment paid | 340.00 | 330.00 | 10.00 | 670.00 |
| 2nd due date | Contract termination | 676.70 | 670.00 | 6.70 | 0.00 |

Contract termination with an outstanding charge. The same loan of 1,000 with 12% annual interest and 3 monthly installments is used. A charge of 50.00 is added to the account before the second installment due date. The loan officer processes contract termination on that due date. The termination amount now includes the charge together with the principal outstanding and the accrued interest. If no charge had been added, the termination amount would be 676.70 instead.

| Date | Event | Amount | Principal | Interest | Charges | Balance |
| --- | --- | --- | --- | --- | --- | --- |
| Start | Disbursement |  |  |  |  | 1,000.00 |
| 1st due date | Installment paid | 340.00 | 330.00 | 10.00 |  | 670.00 |
| Mid-cycle | Charge added |  |  |  | 50.00 | 670.00 |
| 2nd due date | Contract termination | 726.70 | 670.00 | 6.70 | 50.00 | 0.00 |
