# Payment Allocation Strategies

## Payment Allocation Strategies

### Payment allocation strategy overview

A repayment strategy decides how a repayment transaction is distributed across an instalment's unpaid balances. The strategy applies to credit adjustments, repayments, refunds, goodwill credits and waivers.

The strategy orders transactions within an instalment and pays them off within that instalment's timeframe.

- The current repayment strategy order is Penalty, Fee, Interest, Principal.
- If an instalment has unpaid balances, the strategy distributes the transaction amount in that order.

### New repayment strategy order

The new repayment strategy allocates payments in this order: due charges, due penalty, due fee, due interest, due principal, in advanced principal, in advanced penalty, in advanced fee, in advanced interest.

### Reverse-replay logic

Reverse-replay logic recalculates installment balances when you execute a payment transaction or add a charge, starting from the first Disbursement and resetting installment balances. It applies to region DE (Germany) and product PayIn30.

Reverse-replay follows these rules:

- Transactions and charges are ordered, and repayment distribution respects that order.
- If you add a repayment and a charge occurs on the same day, no reverse-replay occurs.
- If you add another repayment on the same day, that repayment pays the charge.
- Charges are assigned to repayment installments before transactions are reprocessed; when a new charge is added to an installment, even if its submitted or due date is later than the repayment transaction, the repayment transaction is reverse-replayed and distributes part of its amount to pay that charge.
- If the before and after balances do not match, the system reverses the original transaction and creates a new transaction with the same properties but different balances.

The payment allocation order for Pin30 in DE (Germany) applies to all transaction types.

| Position | Allocation target |
| --- | --- |
| 1 | DuePenalties |
| 2 | DueInterest |
| 3 | DuePrincipal |
| 4 | DueFees |
| 5 | InAdvancePenalties |
| 6 | InAdvanceInterest |
| 7 | InAdvancePrincipal |
| 8 | InAdvanceFees |

### Fine-grained allocation rules

Fine-grained transaction allocation rules decide how payments are applied to Fee, Penalty and Principal, and create allocation mapping entries for each monetary transaction.

The predefined allocation rules cover six categories:

- DUE PRINCIPAL
- DUE FEE
- DUE PENALTY
- IN ADVANCE PRINCIPAL
- IN ADVANCE FEE
- IN ADVANCE PENALTY

### Allocation outcomes and handling

A payment can result in two outcomes: to be paid and to be debt. The outcome decides where each part of the payment goes.

The system allocates each part of a payment based on its outcome:

- Principal goes to the amortization schedule.
- Fee and penalty go to charge payment handling.
- Overpayment goes to overpayment handling.

### Overpayment and credit balance refund

Repayment transactions aim to pay down outstanding balances. Every transaction or charge is assigned to an installment to monitor the debt and repayments and decide on the distribution. For transactions the transaction date is used for assignment; for charges the due date is used, with specific due date charge using due date, disbursement fee using disbursal date, installment fee using installment due date, and overdue penalty due from the moment it was added.

A new repayment strategy introduces two buckets: Due charges and In advance principal, allowing payment of a charge on or after the charge due date, with the strategy aware of any unpaid but due charge or penalty.

Overpayment occurs when a repayment exceeds the total outstanding balance. The system refunds the overpaid amount back to the customer through a credit balance refund. If the overpayment amount is lower than the credit balance refund amount, principal outstanding is increased and the amortization schedule is updated with only the principal portion.

### Strategy issues and expected behavior

The new payment strategy due-penalty-fee-interest-principal-in-advance-principal-penalty-fee-interest-strategy and the New DueInAdvance payment strategy show known issues when a payment includes an in advance portion.

Known issues with in advance payments:

- Paying only principal leaves the extra in advance part off the repayment schedule and transactions tab and puts the loan into OVERPAID status.
- With the New DueInAdvance payment strategy, the In Advance column on the Repayment schedule tab shows an incorrect amount when in advance portions exist.
- The expected In Advance column value is either 1000 EUR for principal only or 1100 EUR for principal plus penalty plus fee, and the correct expected result is under investigation.

> **Note:** Paying more than the actual due payment should leave the loan status ACTIVE.

### Accrual configuration and consistency

Accrual posting for charges can be configured to use either the charge created date or the due date, and the system posts accrual journal entries according to that setting. Accrual jobs, end-of-day jobs, and accrual made through the API behave consistently. When accrual is reverse-replayed, the recreated accrual uses the same value date as the original accrual transaction to avoid accounting issues.

The following rules apply to accrual and fee behaviour:

- With immediate accrual, multiple accruals can occur on the same day.
- If waiving a loan charge completes an N+1 installment as a side effect, the paid-by date is the transaction date of the waive-charge transaction.
- Fees added to loans are a source of income, and backdated transactions or reverse-replay can change how money is distributed and pay off fees retrospectively, changing the amount of income.
- Fees added to an instalment must be paid by a payment created after the fee is due; this applies to any other income source too.

### UI screen fields and navigation

The advance payment allocation tab screen shows the fields Credit Allocation Strategy and Future Installment Allocation Rule, along with the text You can drag and drop the rows to set a Payment Allocations order; Order; Payment Allocation Rule; Credit Allocation Rule.

1. Open the loan product wizard.
2. Open the PAYMENT ALLOCATION step.
3. Choose the tab labeled with the transaction value to open the advance payment allocation tab screen.

Two global settings control accrual behaviour:

- charge_accrual_date accepts submitted on or due date and defaults to due date.
- Accrual_timing accepts immediate or job and defaults to job.

### Example allocation orders

The payment allocation order lists the charge types and due dates the system applies to a repayment, in the order they are paid off.

| Repayment | Allocation order |
| --- | --- |
| 31-Jan Autopayment | DuePrincipal due 31-Jan |
| 1-Mar Autopayment | DuePrincipal due 1-Mar then DueFees due 1-Mar |
| 25-Jan Rt Repayment | InAdvancePrincipal due 31-Jan |
| 10-Feb Rt Repayment | InAdvancePrincipal due 1-Mar then InAdvanceFees due 1-Mar |
| 1-Mar Autopayment | Due Penalties due 28-Jan then DuePrincipal due 31-Jan |
| 1-Mar Autopayment | Due Penalties due 15-Feb then DuePrincipal due 1-Mar then DueFees due 1-Mar |
| 8-Mar Rt Repayment | Due Penalties due 15-Feb (Oldest First) then Due Penalties due 7-Mar (Oldest First) then DuePrincipal due 1-Mar then DueFees due 1-Mar |
| 16-Jan RT Repayment | InAdvancePrincipal due 31-Jan |
| 1-Feb Real Time Repayment | InAdavncePrincipal due 1-Mar |
| 25-Jan Real Time Repayment | InAdvancePrincipal due 31-Jan |
| 30-Jan Real Time Repayment | InAdvance Penalties due 28-Jan then InAdvancePrincipal due 31-Jan |
| 10-Feb Real Time Repayment | InAdvancePrincipal due 1-Mar then InAdvanceFees due 1-Mar |
| 24-Feb Real Time Repayment | Due Penalties due 15-Feb then InAdvancePrincipal due 1-Mar then InAdvanceFees due 1-Mar |
| 1-Mar Autopayment | Due Penalties due 15-Feb (Oldest First) then Due Penalties due 26-Feb (Oldest First) then DuePrincipal due 1-Mar then DueFees due 1-Mar |
| 1-Mar Autopayment | Due Penalties due 15-Feb then DuePrincipal due 1-Mar then DueFees due 1-Mar |
| 8-Mar Real Time Repayment | Due Penalties due 15-Feb (Oldest First) then DuePrincipal due 1-Mar |
| 15-Mar Real Time Repayment | DuePrincipal due 1-Mar |
| 22-Mar Real Time Repayment | DuePrincipal due 1-Mar then DueFees due 1-Mar then Due Penalties due 7-Mar (Oldest First) |
| 10-Feb Real Time Repayment | InAdvancePrincipal due 1-Mar then InAdvanceFees due 1-Mar |
| 21-Feb Real Time Repayment | Due Penalties due 15-Feb then InAdvancePrincipal due 1-Mar |
| 28-Feb Real Time Repayment | InAdvancePrincipal due 15-Feb then InAdvanceFees due 1-Mar |
| 1-Mar Autopayment | DueFees due 1-Mar |
| 21-Feb Real Time Repayment | Due Penalties due 15-Feb then InAdvancePrincipal due 1-Mar then InAdvanceFees due 1-Mar |
| 28-Feb Real Time Repayment | InAdvanceFees due 1-Mar |
| 1-Mar Autopayment | Due Penalties due 15-Feb then DuePrincipal due 1-Mar then DueFees due 1-Mar |
| 8-Mar Real Time Repayment | Due Penalties due 15-Feb (Oldest First) then Due Penalties due 7-Mar (Oldest First) then DuePrincipal due 1-Mar |
| 15-Mar Real Time Repayment | DuePrincipal due 1-Mar |
| 22-Mar Real Time Repayment | DuePrincipal due 1-Mar then DueFees due 1-Mar |
| 31-Jan Autopayment | DuePrincipal due 31-Jan |
| 1-Mar Autopayment | DuePrincipal due 1-Mar then DueFees due 1-Mar |
| 25-Jan Rt Repayment | InAdvancePrincipal due 31-Jan |
| 31-Jan Autopayment | Due Penalties due 28-Jan then DuePrincipal due 31-Jan |
| 10-Feb Rt Repayment | InAdvancePrincipal due 1-Mar then InAdvanceFees due 1-Mar |
| 8-Mar Rt Repayment | Due Penalties due 15-Feb (Oldest First) then DuePrincipal due 1-Mar then DueFees due 1-Mar then Due Penalties due 7-Mar (Oldest First) |
| 16-Jan RT Repayment | InAdvancePrincipal due 31-Jan |
| 1-Feb Real Time Repayment | InAdavncePrincipal due 1-Mar |
| 25-Jan Real Time Repayment | InAdvancePrincipal due 31-Jan |
| 30-Jan Real Time Repayment | InAdvance Penalties due 28-Jan then InAdvancePrincipal due 31-Jan |

Use case: Disburse loan on 14th of May, add Snooze fee (amount based on disbursement amount) due 31st of May, do an extra disbursement on 16th of May; the accrual needs to be reverse-replayed since the amount should be higher.

### Worked examples

A loan of 1,000 is disbursed on Day 1 with principal due on Day 30. With no other charges, a repayment of 1,000 on Day 30 clears the loan. If a 20 fee is also due on Day 30, a repayment of 1,020 on Day 30 clears both principal and fee. The figures in this example are illustrative.

| Step | Date | Transaction | Principal | Fee | Principal due | Total due |
| --- | --- | --- | --- | --- | --- | --- |
| Disburse | Day 1 | 1,000.00 | - | - | 1,000.00 | 1,000.00 |
| Repay no fee | Day 30 | 1,000.00 | 1,000.00 | - | - | - |
| Add fee | Day 25 | - | 20.00 | - | 1,000.00 | 1,020.00 |
| Repay with fee | Day 30 | 1,020.00 | 1,000.00 | 20.00 | - | - |

Adding a due fee increases the repayment needed to clear the loan by the fee amount.

A loan of 1,000 is disbursed on Day 1. The customer repays 600 on Day 10, leaving 400 of principal. On Day 15, a 40 charge is added with a due date of Day 20. On Day 18, before the charge is due, the customer repays 350; because the charge is not yet due, the amount pays principal only and the charge stays unpaid. On Day 21, after the charge is due, the customer repays 40; this amount pays the charge, leaving 50 outstanding.

| Step | Date | Transaction | Principal | Charge | Principal due | Total due |
| --- | --- | --- | --- | --- | --- | --- |
| Disburse | Day 1 | 1,000.00 | - | - | 1,000.00 | 1,000.00 |
| Repay | Day 10 | 600.00 | - | - | 400.00 | 400.00 |
| Add charge | Day 15 | - | 40.00 | - | 400.00 | 440.00 |
| Repay | Day 18 | 350.00 | - | - | 50.00 | 90.00 |
| Repay | Day 21 | - | 40.00 | - | 50.00 | 50.00 |

A repayment made before a charge due date does not pay the charge; a repayment made after the due date pays it.

A loan of 1,000 is disbursed on Day 1. On Day 25, a 20 fee is added with due date Day 60. On Day 40, the customer repays 1,020, clearing principal and fee. The repayment is then reversed, restoring principal of 1,000 and fee of 20. On Day 45, a 15 penalty is added with due date Day 45. On Day 60, the customer repays 1,035. The payment covers the due principal of 1,000, the due penalty of 15, and the due fee of 20, clearing all balances.

| Step | Date | Transaction | Principal | Penalty | Fee | Principal due | Total due |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Disburse | Day 1 | 1,000.00 | - | - | - | 1,000.00 | 1,000.00 |
| Add fee | Day 25 | - | - | 20.00 | - | 1,000.00 | 1,020.00 |
| Repay | Day 40 | 1,020.00 | - | - | - | - | - |
| Reverse | Day 40 | - | - | - | - | 1,000.00 | 1,020.00 |
| Add penalty | Day 45 | - | 15.00 | - | - | 1,000.00 | 1,035.00 |
| Repay | Day 60 | 1,035.00 | 15.00 | 20.00 | - | - | - |

A repayment large enough to cover all due amounts pays principal, penalty, and fee together.

A loan of 1,000 is disbursed on Day 1. On Day 25, a 15 penalty is added with due date Day 28. On Day 30, the customer repays 500. The payment first covers the due penalty of 15 and then applies 485 to principal, leaving 515 of principal outstanding.

| Step | Date | Transaction | Principal | Penalty | Principal due | Total due |
| --- | --- | --- | --- | --- | --- | --- |
| Disburse | Day 1 | 1,000.00 | - | - | 1,000.00 | 1,000.00 |
| Add penalty | Day 25 | - | 15.00 | - | 1,000.00 | 1,015.00 |
| Repay | Day 30 | 500.00 | 15.00 | - | 515.00 | 515.00 |

When a penalty is due, a partial repayment pays the penalty before it reduces principal.
