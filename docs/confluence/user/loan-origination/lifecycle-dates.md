# Loan Lifecycle Dates

The loan lifecycle dates feature records extra dates when a loan changes status, such as when it matures or becomes overpaid. You choose which status changes to track. The system stores the actual business date each time a tracked status change occurs.

Loan statuses:

- Created
- Approved
- Disbursed
- Active
- Closed (fully paid)
- Overpaid

Configuration key custom.module.loan.lifecycle.allowed.status.codes accepts a list of statuses:

| Value | Tracks |
| --- | --- |
| ALL | Every status change (default) |
| OVERPAID, CLOSED_OBLIGATIONS_MET | When the loan is closed and fully paid, or when the loan is overpaid |

A loan officer issues a loan of 1,000 at 12% annual interest with 3 monthly installments and 30-day months. The figures are illustrative. The loan starts as Created, moves to Approved, then to Disbursed and Active. When the borrower repays the full amount early, the status becomes Overpaid. The system records the overpaid date as the transaction date, not the date the repayment was submitted. If the overpayment is backdated, a correction request is required and no details are sent to other systems.

| Step | Date | Status | Extra date stored |
| --- | --- | --- | --- |
| Created | Day 0 | Created | — |
| Approved | Day 5 | Approved | — |
| Disbursed | Day 10 | Active | — |
| Overpaid | Day 20 | Overpaid | Day 20 |

The example shows that the overpaid date comes from the transaction date and that the system keeps a dated history of each lifecycle status change.
