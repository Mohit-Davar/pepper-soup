# Same-Day Disbursement and Instalments

## Same-Day Disbursement and Instalments

### Same-day disbursement and repayment schedule

When disbursement occurs on an installment due date, that installment stays unchanged and the remaining disbursement amount is split between all remaining future installments whose due date is later than the disbursement date. You can add payments on the same day as disbursement, and amortization is calculated for any repayment made on that date. The amortization schedule is amended and recalculated accordingly.

The repayment schedule order when the disbursal date and an installment due date overlap is:

- Normal installment.
- Disbursement.
- Down payment installment, if applicable.

### Disbursement on overpaid loans

You can disburse on an overpaid loan account during same-day operation, even when the disbursement happens before the Credit Balance Refund (CBR) transaction. This applies to multi tranche loan accounts with either a progressive or cumulative loan schedule, and the loan can be ACTIVE, CLOSED (OBLIGATIONS MET), or OVERPAID. You can set the transaction date for the disbursement.

The system handles the overpaid amount and balances as follows:

- The initial overpaid amount is adjusted or marked paid as advance payments to future installments according to account configuration.
- Loan balances are updated accordingly for disbursements on overpaid loans, including loans with a cumulative loan schedule.
- The outstanding principal of the actual installment increases by the full disbursement amount, and the overpayment amount is allocated as repayment for principal ultimately.

Reversing a disbursement works as follows:

- If the disbursement is reversed and the loan moves from Active back to Approved, last_closed_business_date is reset so that the COB job picks up the loan and calculates and processes the necessary items when it is disbursed again.
- All transactions on the loan are reversed when the disbursement is undone.

### Credit Balance Refund

A Credit Balance Refund is a credit type transaction in Fineract that refunds a customer when their loan is overpaid. It is available only for loans in OVERPAID status.

The following rules apply to Credit Balance Refund transactions:

- The refund amount matches the overpayment amount on the loan.
- You can set a lower refund amount than the overpayment, but this does not make sense.
- The refund amount cannot be higher than the overpayment amount on the loan.
- You can define the transaction date for the refund.
- Backdated transactions are allowed after the refund.
- Backdated transactions after the refund can lead to situations where the original refund amount is higher or lower than the overpayment amount on the loan.
- If backdated transactions cause the refund amount to exceed the overpayment after reprocessing, the outstanding principal of the actual instalment increases by the full refund amount and the overpayment is allocated as repayment for principal.
- On the repayment schedule, the full refund amount appears as Credit Principal.

### Chargeback

A Chargeback transaction undoes a previous repayment or refund without reverting it. You can create a Chargeback on an overpaid loan, before or after the maturity date.

Chargeback transactions follow these rules:

- The Chargeback amount must be equal to or lower than the target transaction amount.
- Multiple Chargeback transactions can target the same transaction, but their cumulative amount cannot exceed the target transaction amount.
- The Chargeback transaction date is always the actual business date and cannot be defined.
- Backdated transactions are allowed after a Chargeback.
- Chargeback supports principal, fee, and penalty amounts, allocated between those buckets based on the target transaction.
- Allocation priority order matters only when the Chargeback is partial.
- When the target transaction repaid fee and/or penalty alongside principal, the same type of fee and/or penalty is created during Chargeback.

The effect on the loan depends on whether it was overpaid:

- When the overpayment amount is higher than the Chargeback amount, the Chargeback transaction has no effect on the repayment schedule; only the overpayment amount on the loan is decreased and proper accounting entries are created.
- When the Chargeback amount is higher than the overpayment on the loan, the outstanding principal of the actual installment is increased by the full Chargeback transaction amount and the remaining overpayment amount is allocated as repayment for principal.

The effect on the repayment schedule depends on timing relative to maturity:

- Before maturity, the actual installment is increased by the full Chargeback transaction amount and delinquency calculation is immediately triggered from that date until fully paid.
- After maturity, a new installment (N+1) is created if it did not exist before, with the full Chargeback transaction amount.

Chargeback accounting and principal recognition work as follows:

- The Chargeback amount is recognised as outstanding principal.
- On the repayment schedule the full Chargeback amount appears as Credit Principal.

### Charges on overpaid loans

You can add charges and chargebacks on overpaid loans, and the system updates loan balances and the repayment schedule accordingly.

Charge addition and chargeback follow these rules:

- Amount allocation for charges and chargebacks on overpaid loans remains the same as for disbursements.
- Chargeback credit allocation can be configured when Repayment strategy is Advanced payment allocation.

### Worked examples

A loan officer disburses part of an approved loan, takes a down payment, and later processes a refund that overpays the account. The figures are illustrative. On day one, 600 is disbursed and a down payment of 150 is taken, leaving 450 outstanding across three installments of 150 each. On day two, a refund of 600 posts, clearing the principal and creating an overpayment of 150. On day three, a credit balance refund of 150 clears the overpayment, and on the same day a new disbursement of 600 reopens the loan, followed by a down payment of 150 that leaves 450 outstanding across three installments of 150 each.

| Day | Transaction | Loan balance | Overpayment | Loan status | Installments due |
| --- | --- | --- | --- | --- | --- |
| 1 | Disburse 600, down payment 150 | 450.00 | 0.00 | Active | 3 × 150.00 |
| 2 | Refund 600 | 0.00 | 150.00 | Overpaid | — |
| 3 | Credit balance refund 150 | 0.00 | 0.00 | Closed (obligations met) | — |
| 3 | Disburse 600 | 600.00 | 0.00 | Active | — |
| 3 | Down payment 150 | 450.00 | 0.00 | Active | 3 × 150.00 |

This shows that a credit balance refund can close an overpaid loan and that a same-day disbursement can reopen it with a fresh repayment schedule.

An operations officer processes several disbursements on a loan that uses a cumulative repayment schedule, so no advance payment allocation is applied. The loan is disbursed for 800 and an automatic down payment of 200 is taken, leaving 600 outstanding. A repayment of 700 then overpays the account by 100. A disbursement of 30 consumes part of the overpayment, leaving 70 overpaid. A second disbursement of 70 consumes the rest and closes the loan as obligations met. A final disbursement of 90 with an automatic down payment of 20 reopens the loan with 70 outstanding.

| Step | Transaction | Loan balance | Overpayment | Loan status |
| --- | --- | --- | --- | --- |
| 1 | Disburse 800, down payment 200 | 600.00 | 0.00 | Active |
| 2 | Repayment 700 | 0.00 | 100.00 | Overpaid |
| 3 | Disburse 30 | 0.00 | 70.00 | Overpaid |
| 4 | Disburse 70 | 0.00 | 0.00 | Closed (obligations met) |
| 5 | Disburse 90, down payment 20 | 70.00 | 0.00 | Active |

Each disbursement on an overpaid loan first uses the overpayment as principal repayment before the account can close or continue active.

A loan officer posts a chargeback against a repayment on an overpaid loan. The loan has no outstanding principal and an overpayment of 100. A chargeback of 40 is lower than the overpayment, so the loan stays overpaid, the overpayment falls to 60, and the repayment schedule is unchanged. If the chargeback were 100 instead, it would equal the overpayment, the loan would close as obligations met, the overpayment would fall to 0, and the schedule would still be unchanged.

| Step | Transaction | Loan balance | Overpayment | Loan status | Schedule change |
| --- | --- | --- | --- | --- | --- |
| 1 | Repayment 600 on 500 balance | 0.00 | 100.00 | Overpaid | None |
| 2 | Chargeback 40 (partial) | 0.00 | 60.00 | Overpaid | None |
| 3 | Chargeback 100 (full, alternate) | 0.00 | 0.00 | Closed (obligations met) | None |

The result changes with the chargeback amount: a partial chargeback only reduces the overpayment, while a full chargeback closes the loan; neither touches the repayment schedule.

An administrator adds a due-date charge to an overpaid loan. The loan has no outstanding principal and an overpayment of 120. A fee charge of 30 is smaller than the overpayment, so the overpayment rises to 150, the last installment shows overpaid 150.00, and the charge is marked fully paid while the loan stays overpaid. If the charge were 120 instead, it would equal the overpayment, the overpayment would fall to 0, the last installment would show no overpayment, the loan would close, and the charge would still be marked fully paid.

| Step | Transaction | Loan balance | Overpayment | Loan status | Last installment overpaid |
| --- | --- | --- | --- | --- | --- |
| 1 | Refund creates overpayment | 0.00 | 120.00 | Overpaid | 120.00 |
| 2 | Fee charge 30 (overpayment greater) | 0.00 | 150.00 | Overpaid | 150.00 |
| 3 | Fee charge 120 (overpayment equal, alternate) | 0.00 | 0.00 | Closed (obligations met) | 0.00 |

The result changes with the charge amount: a smaller charge adds to the overpayment, while a charge equal to the overpayment clears it and closes the loan.
