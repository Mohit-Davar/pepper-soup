# Loan Lifecycle Dates

## Loan lifecycle dates and statuses

A loan moves through the statuses Created, Approved, Disbursed, Active, Closed (fully paid), and Overpaid. Status changes when the loan balance changes because of a backdated repayment or reversal. Delinquency and Breach Evaluation are recalculated when a backdated repayment or reversal happens. Backdated repayment or reversals are not allowed on a written-off loan account.

Backdated repayment or reversal results:

- If the loan balance becomes zero, the loan moves to Closed status.
- If the loan balance becomes negative, the loan moves to Overpaid status.
- If a reversal of repayment is done on a closed loan account, the loan becomes Active again.

Transaction allocation rules:

- If all charges are fully paid before the backdated transaction, the backdated transaction pays no charges and no transaction allocation changes.
- If an undo transaction reverts a transaction that paid portions of any charges, existing transactions after the reverted transaction might need reevaluation and allocation changes.
- Otherwise allocation is always principal and no allocation of an existing transaction changes.

Overpaid loan resolution:

- If the overpayment amount and CBR match, the loan goes from Overpaid state into Closed (fully paid).

> **Note:** No transaction can be executed on a future date.

## Custom loan lifecycle change history

The custom loan lifecycle change history module records extra details when a loan lifecycle status changes, including the business date of the change. You configure which status changes the module tracks.

| Column | Description |
| --- | --- |
| id | Primary key |
| loan_id | The loan whose status changed |
| status_code | The new loan status |
| status_change_business_date | The business date when the status changed |
| created by | User who created the record |
| created date time | When the record was created |
| updated by | User who last updated the record |
| updated date time | When the record was last updated |

Configure the status changes to track using custom.module.loan.lifecycle.allowed.status.codes:

- ALL tracks every status change and is the default option.
- OVERPAID, CLOSED_OBLIGATIONS_MET tracks when the loan is closed and fully paid or when the loan is overpaid.

When the LoanStatusChangedBusinessEvent is triggered, the system fetches the actual business date and stores it in the database.

## Worked examples

The custom module persists every loan lifecycle change in the custom_loan_lifecycle_change_history table. The figures below are illustrative. A loan of 1,000 with three monthly installments moves from Created to Approved on business day 5, to Disbursed on day 10, and to Closed on day 40. Each change adds one history record identified by id, linked to the loan through loan_id, and stamped with status_change_business_date and status_code.

| id | loan_id | status_change_business_date | status_code |
| --- | --- | --- | --- |
| 1 | 42 | 2024-01-01 | Created |
| 2 | 42 | 2024-01-05 | Approved |
| 3 | 42 | 2024-01-10 | Disbursed |
| 4 | 42 | 2024-02-09 | Closed |

The primary key on id, the foreign key on loan_id, and the regular indexes on status_change_business_date and status_code let the module read a loan's full history or filter changes by date and status without a full table scan.
