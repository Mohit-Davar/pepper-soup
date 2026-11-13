# Same-Day Disbursement and Installments

## Same-day disbursement and installment order

When disbursement happens on the due date of an installment, that installment is not affected. The disbursement amount is split between all remaining future installments, where a future installment has a due date after the disbursement date.

When the disbursal date and an installment due date overlap, the repayment schedule order is: normal installment, disbursement, down payment installment (if applicable).

You can add payments on the same day as disbursement.

## Disbursement on overpaid loans

You can disburse on an overpaid loan account. The transaction date can be defined for the disbursement. Disbursement is allowed on ACTIVE, CLOSED (OBLIGATIONS MET), and OVERPAID loans. In multi tranche loan accounts, disbursement on overpaid loans is supported for both Progressive and Cumulative loan schedules. During same day operations, a disbursement can occur before the CBR transaction, so disbursement may happen on an overpaid loan account while CBR happens on an active loan account.

The system handles the overpayment as follows:

- The initial overpaid amount is adjusted or marked paid as advance payments to future installments as per account configuration, and loan balances are updated accordingly.
- The outstanding principal of the actual installment increases by the full amount of the disbursement transaction, and the overpayment amount is allocated as repayment for principal ultimately.

## Chargeback on overpaid loans

You can perform a chargeback on an overpaid loan. The system updates loan balances and the repayment schedule accordingly. Charge addition and chargeback on overpaid loans are allowed, with amount allocation remaining the same as disbursements.

You can also add specific due date charges on overpaid loans, and the system updates loan balances and the repayment schedule accordingly.

- Chargeback credit allocation can be configured when Repayment strategy is "Advanced payment allocation".

## Chargeback amount and limits

A Chargeback transaction initiates a chargeback on a previous repayment or refund and effectively undoes it without reverting it.

Chargeback amount rules:

- The Chargeback amount must be equal to or lower than the target transaction amount.
- The cumulative amount of Chargeback transactions for the same transaction cannot be higher than the target transaction amount.

## Chargeback timing and date

A Chargeback transaction date is always the actual business date and cannot be defined. Backdated transactions are allowed after a Chargeback.

## Chargeback effect on repayment schedule

A Chargeback transaction affects the repayment schedule differently depending on whether the loan was overpaid and whether the maturity date has passed.

Chargeback effect on the repayment schedule:

- If the loan was overpaid and the overpayment amount is higher than the Chargeback amount, the Chargeback transaction has no effect on the repayment schedule; only the overpayment amount on the loan is decreased and the proper accounting entries are created.
- If the loan was overpaid but the Chargeback amount is higher than the overpayment amount, the outstanding principal of the actual installment is increased by the full Chargeback amount and the overpayment amount is allocated as repayment for principal.
- Before maturity, the actual installment is increased by the full Chargeback amount and delinquency calculation is immediately triggered from that date until it is fully paid.
- After maturity, a new installment (N+1) is created if it did not exist before, with the full Chargeback amount.

## Chargeback allocation between principal, fee, and penalty

A chargeback transaction can charge principal, fee, or penalty. Based on the target transaction that was charged back, the chargeback amount is allocated between principal, fee, and penalty buckets using a priority order. That priority order matters only when the chargeback is partial. When the target transaction repaid fee and/or penalty alongside principal, the same type of fee and/or penalty is created during chargeback.

## Worked examples

A loan becomes overpaid when a repayment exceeds the outstanding principal, and the excess sits in an overpayment liability account. A later disbursement on that overpaid loan is split across the remaining future installments—those whose due date is after the disbursement date—and the overpayment is applied as repayment of principal. With the allocation rule based on the next installment (past due, due, and future), the figures below show what happens when the disbursement is smaller than, equal to, or larger than the overpayment. The figures are illustrative.

| Case | Disbursement | Overpaid before | Overpaid after | Outstanding principal | Loan status | Overpayment GL |
| --- | --- | --- | --- | --- | --- | --- |
| Disbursement below overpayment | 200.00 | 500.00 | 300.00 | 0.00 | OVERPAID | Debit 200.00 |
| Disbursement equals overpayment | 500.00 | 500.00 | 0.00 | 0.00 | CLOSED (OBLIGATIONS MET) | Debit 500.00 |
| Disbursement above overpayment | 750.00 | 500.00 | 0.00 | 250.00 | ACTIVE | Debit 500.00 |

A Chargeback undoes a prior repayment or refund up to the amount of that transaction and always uses the actual business date. On an overpaid loan, the Chargeback first reduces the overpayment. A partial Chargeback leaves the loan overpaid and does not change the repayment schedule. A full Chargeback clears the overpayment and closes the loan. When the Chargeback exceeds the overpayment, the full Chargeback appears as Credit Principal on the actual installment, the overpayment is applied as repayment of principal, and the excess becomes outstanding principal.

| Case | Chargeback | Overpaid before | Overpaid after | Outstanding principal | Loan status | Schedule change | Overpayment GL |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Partial | 200.00 | 500.00 | 300.00 | 0.00 | OVERPAID | None | Debit 200.00 |
| Full | 500.00 | 500.00 | 0.00 | 0.00 | CLOSED (OBLIGATIONS MET) | None | Debit 500.00 |
| Larger than overpayment | 750.00 | 500.00 | 0.00 | 250.00 | ACTIVE | Credit Principal 750.00 | Debit 500.00 |

If the transaction being charged back repaid principal together with fee or penalty, the Chargeback recreates the same charge types. The amount is distributed between principal, fee, and penalty in the configured priority order. That order is meaningful only for a partial Chargeback; a full Chargeback restores every bucket.

| Transaction | Principal | Penalty | Fee | Total |
| --- | --- | --- | --- | --- |
| Original repayment of 800.00 | 500.00 | 200.00 | 100.00 | 800.00 |
| Full Chargeback of 800.00 | 500.00 | 200.00 | 100.00 | 800.00 |
| Partial Chargeback of 400.00, priority FEE, PENALTY, PRINCIPAL | 100.00 | 200.00 | 100.00 | 400.00 |

A charge such as a fee can be added to an overpaid loan and is settled from the overpayment. When the overpayment is greater than the charge, the charge is marked fully paid and the overpayment is reduced. When the overpayment equals the charge, both reach zero and the loan closes. When the charge is greater than the overpayment, the overpayment covers part of the charge and the remainder stays as a receivable.

| Case | Overpaid before | Charge | Overpaid after | Charge status | Loan status |
| --- | --- | --- | --- | --- | --- |
| Overpayment greater than charge | 500.00 | 100.00 | 400.00 | Fully paid | OVERPAID |
| Overpayment equals charge | 500.00 | 500.00 | 0.00 | Fully paid | CLOSED (OBLIGATIONS MET) |
| Overpayment less than charge | 500.00 | 750.00 | 0.00 | Partially paid | OVERPAID |

A disbursement and a credit balance refund can happen on the same day. If the disbursement posts first, it is applied to an active loan; the refund that follows creates the overpayment. A disbursement does not affect an installment whose due date equals the disbursement date; it is spread across installments due later.

| Day | Event | Loan balance | Overpayment | Remaining installments |
| --- | --- | --- | --- | --- |
| 1 | Disburse 500.00 on a 1,000.00 loan; down payment 125.00 | 375.00 | 0.00 | 3 x 125.00 |
| 2 | Refund 500.00 | -125.00 | 125.00 | 3 x 125.00 |
