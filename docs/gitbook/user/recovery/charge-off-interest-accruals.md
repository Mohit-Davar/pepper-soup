# Charge-Off Interest Accruals

## Charge-Off Interest Accruals

### Charge-off behaviour overview

Charge-off behaviour controls how interest accrues once a loan charges off and applies only to Progressive loan products where interest is not zero. Interest is calculated until the charge-off date, and repayment interest is irrelevant. The behaviour is stored with the product definition as a field on the loan product.

The available charge-off behaviour options are:

- Regular (default)
- Zero interest after charge-off
- Accelerate maturity to charge-off date

Configuration rules:

- If the charge-off behaviour variable is not set, the default is Regular.
- If the variable is set, it is validated as a valid value using ENUM validation with the string name.
- Whether charge-off behaviour is supported for the loan product is validated.
- If a loan product is not progressive or does not have interest or interest recalculation is not enabled, only Regular charge-off behaviour is supported.
- Charge-off behaviour cannot be updated on loan level.
- If charge-off behaviour changes on the product, existing loan accounts remain unaffected.

User interface:

- The loan product Settings page includes a Charge-off behaviour selector located after the down payment section.
- The charge-off behaviour selector is available on the UI for loan products.
- When a loan is opened, the Account details section may show the charge-off behaviour value.

Charge-off processing:

- Once a loan charges off, interest accruals stop; the schedule is adjusted to remove interest projections on future periods after charge off and to proportionally decrease interest on the current period where charge off occurred.
- Once accounting entries have posted for charge off, no further interest accruals can occur on the loan; any further debit or credit adjustments post charge off go through the charged off accounting treatment.
- Any repayment reversal before charge off reverses or replays the charge off and increases the charged off principal and interest amounts.
- Accounting treatments are differentiated between FRAUD and non FRAUD after charge off.
- Interest accrual stops when the loan moves to charge-off state; in case of reversal of charge off, accruals resume and are re-added for past items.
- Main elements are changing schedule future interest to $0, no accrual job, and transaction and validation of journal entries.

Loan product related configuration is stored on loan level.

### Zero interest after charge-off

Zero interest after charge-off applies when the loan product is progressive and interest recalculation is disabled. For interest recalculation = true loans, only the way of calculating interest till the charge-off date changes; the rest is the same. When charge-off is applied, interest becomes zero after the charge-off date and all future interest is set to zero. No interest is added for charged-off loans with this setting.

The system recalculates interest for the partial period on the current instalment up to the charge-off date:

- The period from date is exclusive and the charge-off date is inclusive.
- A new schedule is created with zero interest for future instalments and fractional interest for the current instalment up to the charge-off date.
- Principal due on the period increases with the difference between the original interest of the period and the new interest of the period after charge-off.
- Principal due amount increases with the amount of interest that got removed.
- On the last unpaid installment, principal due is set to the remaining loan balance.

Interest is added when a loan has a reverted charged-off transaction, and reversal of charge-off restores the original schedule and interest.

> **Note:** Accelerate maturity to charge-off date comes later.

### Post-charge-off transactions and reprocessing

When a repayment or other monetary activity occurs after charge-off, the system processes it using existing repayment periods and does not recalculate interest as if the loan were still active. Transactions before the charge-off transaction can recalculate interest, while transactions after it cannot.

The system applies different processing depending on when the activity occurs relative to the charge-off transaction:

- Before charge-off, interest is recalculated for early or late repayment.
- After charge-off, payment allocation is handled instead of interest recalculation.
- If a backdated repayment or other monetary activity occurs, reprocess the transactions.

Charge-off calculations reflect interest up to the charge-off date:

- The charge-off transaction includes the proper interest portion when an early repayment fully pays an installment on a progressive interest-bearing loan product with interest recalculation enabled and the Zero interest after Charge-off strategy.
- Charged interest is calculated until the charge-off date and appears on the charge-off transaction, including for periods closed and marked fully paid by early repayment where interest for remaining days is recognized in the next period.

### Scheduled jobs and exclusions

Scheduled jobs skip loans that have an unreverted charge-off transaction. When a charge-off loan is reversed, the accrual job runs and creates the accruals.

The charge-off exclusion applies to these scheduled jobs:

- Accrual Activity Posting
- Add Accrual Transactions
- Add Accrual Transactions For Loans With Income Posted As Transactions
- Add Periodic Accrual Transactions
- Recalculate Interest for Loans

### Charge-off accounting treatments

Charge-off accounting uses charge-off reasons when they are configured. Users map charge-off reason codes to expense GL accounts through an Advanced Accounting Rule. When such a rule exists, it takes priority over the standard Charge-off Expense and Charge-off Expense fraud configuration; otherwise the system falls back to the original configuration based on the fraud flag set at the loan account.

The following rules apply to charge-off reason-to-GL-account mapping:

- Multiple rules can be configured, but the same reason code cannot be configured twice.
- For one charge-off reason code, only one GL account can be configured.
- The same GL account can be configured for multiple charge-off reasons.
- Only an Expense account can be configured.
- The charge-off reason code value id must be a valid, existing id of a charge-off reason code value.
- The expense GL account id must be a valid, existing Expense GL account id.
- Backend validation is performed.
- An Advanced Accounting Rule maps charge-off reason code with accounting mapping.

The following UI and backend capabilities support charge-off accounting mapping:

- Users can map charge-off reasons to any expense GL account dropdown.
- Users can map one or multiple charge-off reason codes to GL account(s).
- A new Advanced Accounting Rule configuration is added to UI and backend to map charge-off reason code with accounting mapping.
- When advance accounting is mapped, the default mapping for fraud flag is overridden.

### Charge-off reason code configuration constraints

A charge-off reason code is stored as a Long value. If a reason code is configured on any loan product as an Advanced Accounting rule for Charge-off reason, it cannot be deleted. Before deleting a reason code, check whether it is configured on any loan product as an Advanced Accounting rule for Charge-off reason and prevent deletion if it is.

New charge-off options may be available for non-interest bearing, progressive loan products.

For interest bearing products, interest accrual can be suspended once a loan charges off.

Interest till charge-off date = (total interest of the period) / (number of days of the period) * (number of days till charge-off date).

### Worked examples

Example figures are illustrative. A progressive loan product charges interest on a principal of 1,000 at 12% a year, which is 1% a month. The loan has three monthly installments and 30-day months. Interest accrues until the charge-off date, which falls on day 15 of the second period. The schedule removes interest on all future periods, prorates interest on the current period up to the charge-off date, and adds the removed interest to the principal due on that period. If the product uses zero interest after charge-off instead of prorated interest, the current-period interest is removed entirely and added to principal.

The table shows the schedule before charge-off, the adjusted current period, the future period with zero interest, and the totals before and after.

| Period | Due date | Installment | Principal | Interest | Balance |
| --- | --- | --- | --- | --- | --- |
| 1 | Day 30 | 340.00 | 330.00 | 10.00 | 670.00 |
| 2 (original) | Day 60 | 340.00 | 333.30 | 6.70 | 336.70 |
| 2 (charge-off day 15) | Day 60 | 340.00 | 336.65 | 3.35 | 333.35 |
| 3 (future) | Day 90 | 333.35 | 333.35 | 0.00 | 0.00 |
| Totals before | - | 1,020.07 | 1,000.00 | 20.07 | - |
| Totals after | - | 1,013.35 | 1,000.00 | 13.35 | - |

A charged-off loan writes off principal of 800.00, interest of 120.00, fees of 50.00 and a penalty of 30.00. Accounting entries depend on the charge-off reason. When no advanced accounting rule is configured, the fraud flag chooses the expense account: a fraud reason debits Credit Loss/Bad Debt Fraud for the principal, while a delinquent reason debits Credit Loss/Bad Debt. Interest, fees and penalty use their fixed charge-off accounts. If an advanced accounting rule maps the reason to a custom expense account, that account takes priority over the default fraud configuration.

The table compares default accounting entries for fraud and delinquent reasons and shows that a configured advanced accounting rule replaces the default fraud account.

| Reason | Component | Amount | Debit account | Credit account |
| --- | --- | --- | --- | --- |
| Fraud (default) | Principal | 800.00 | Credit Loss/Bad Debt Fraud | Loans Receivable |
| Fraud (default) | Interest | 120.00 | Interest income charge off | Fee Receivable |
| Delinquent (default) | Principal | 800.00 | Credit Loss/Bad Debt | Loans Receivable |
| Delinquent (default) | Interest | 120.00 | Interest income charge off | Fee Receivable |
| Advanced rule (fraud) | Principal | 800.00 | Charge-off-fraud expense | Loans Receivable |

A loan of 1,000 is disbursed on day 1 with a single 30-day period carrying 10.00 interest. An early repayment on day 15 fully pays the period, bringing the balance to zero. The loan is then charged off on day 20. Because the period was closed and fully paid early, the interest for the remaining days until charge-off is still recognized on the charge-off transaction.

The table traces the disbursement, the early repayment, and the charge-off interest recognized for days 16 through 20.

| Step | Date | Principal | Interest | Balance |
| --- | --- | --- | --- | --- |
| Disbursed | Day 1 | 1,000.00 | 0.00 | 1,000.00 |
| Early repayment fully pays period | Day 15 | -1,000.00 | 10.00 | 0.00 |
| Charge-off recognizes interest for days 16-20 | Day 20 | 0.00 | 1.67 | 0.00 |
| Charge-off transaction interest portion | - | - | 1.67 | - |

See also: [Charge-Off Balances: Charge-Off Balances](charge-off-balances.md#charge-off-balances).
