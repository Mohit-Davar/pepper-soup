# Same-Day Disbursement and Installments

Same-day disbursement lets you disburse a loan and apply a repayment on the same day. It applies when the disbursal date and an installment due date overlap, including on overpaid loans and multi tranche loan accounts with Progressive or Cumulative loan schedules. The amortization schedule reflects and calculates the disbursement and any repayment made on the disbursement date.

The repayment schedule uses this order when the disbursal date and installment due date overlap:

- Normal installment.
- Disbursement.
- Down payment installment, if applicable.

Same-day disbursement rules:

- You can add payments on the same day of disbursement.
- Disbursement and Undo Disbursement require disbursement amount, transaction date, classification, and payment type.
- No multi-disbursement is supported.
- You can define the transaction date for Disbursement on an overpaid loan.
- Disbursement on an overpaid loan is allowed on ACTIVE, CLOSED (OBLIGATIONS MET), and OVERPAID loans.

When repayment happens on the disbursement date:

- Amortization is calculated for the repayment.
- The amortization schedule is amended.
- The amortization schedule is recalculated accordingly.

Overpaid loan handling:

- The initial overpaid amount is adjusted or marked paid as advance payments to future installments as per account configuration, and loan balances are updated accordingly.
- You can add specific due date charges on overpaid loans, and loan balances and repayment schedule are updated accordingly.
- In each situation, the outstanding principal of the actual installment increases by the full amount of the Disbursement transaction and the overpayment amount is allocated as repayment for principal ultimately.

> **Note:** During same-day operations, a disbursement transaction can happen before the CBR transaction, resulting in disbursement on an overpaid loan account and CBR on an active loan account.

Disbursement on an overpaid loan when the disbursement does not exceed the overpaid amount. The figures are illustrative. A loan with three monthly installments of 100.00 each is overpaid by 50.00 after a repayment of 350.00 covers 300.00 due, leaving outstanding principal at 0.00. The allocation rule is Based on next installment with past due, due and future. The user disburses 20.00 on the same day. If the disbursement equals the overpaid amount, the loan closes as OBLIGATIONS MET; under a reamortization rule the same disbursement recalculates the remaining installments instead of advancing the next one.

| Step | Transaction | Principal due | Principal paid | Overpaid added | Overpaid used | Outstanding | Overpaid | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Repayment of 350.00 on 300.00 due | 300.00 | 300.00 | 50.00 | — | 0.00 | 50.00 | OVERPAID |
| 2 | Disbursement of 20.00 | 20.00 | 20.00 | — | 20.00 | 0.00 | 30.00 | OVERPAID |

Disbursement on an overpaid loan when the disbursement exceeds the overpaid amount. A loan with outstanding principal of 25.00 is overpaid by 50.00 after a repayment of 75.00 covers 25.00 due. The user disburses 75.00 on the same day. The 50.00 overpayment is applied to the new principal, and the remaining 25.00 becomes outstanding, so the loan returns to ACTIVE.

| Step | Transaction | Principal due | Principal paid | Overpaid used | Outstanding | Overpaid | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Repayment of 75.00 on 25.00 due | 25.00 | 25.00 | — | 0.00 | 50.00 | OVERPAID |
| 2 | Disbursement of 75.00 | 75.00 | 50.00 | 50.00 | 25.00 | 0.00 | ACTIVE |

Same-day disbursement and credit balance refund on a loan that moves through overpaid status. On day 1 a loan is disbursed for 500.00 and a down payment of 125.00 is taken, leaving a balance of 375.00. On day 2 a refund of 500.00 posts, leaving a balance of -125.00 and an overpaid amount of 125.00. On day 3 a CBR of 125.00 brings the balance to 0.00, and a disbursement of 500.00 with a down payment of 125.00 leaves a balance of 375.00 and the loan active. Because the disbursement and CBR can post in either order on the same day, the disbursement may hit an overpaid account while the CBR hits an active account.

| Day | Event | Balance | Overpaid | Status |
| --- | --- | --- | --- | --- |
| 1 | Disburse 500.00; down payment 125.00 | 375.00 | — | ACTIVE |
| 2 | Refund 500.00 | -125.00 | 125.00 | OVERPAID |
| 3 | CBR 125.00 | 0.00 | — | ACTIVE |
| 3 | Disburse 500.00; down payment 125.00 | 375.00 | — | ACTIVE |
