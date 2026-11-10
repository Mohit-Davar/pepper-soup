# Delayed Captures and Full-Term Tranches

## Delayed Captures and Full-Term Tranches

### Full term tranche configuration

Full term tranche configuration lets each tranche disbursement keep the actual term length of the loan instead of adjusting to the remaining future installments. You can enable it at the loan product level and at the account level, and it applies only to the progressive type repayment strategy. The option is disabled by default.

The following rules govern full term tranche configuration:

- The full term tranche option appears only when tranche disbursement is enabled at the loan product.
- When enabled, the system uses full term schedule calculation for each tranche disbursement.
- When disabled, the system works normally.
- The enable or disable option is available at the tranche setting screen.

### Schedule generation and installment handling

When full term length for each tranche is enabled, the system generates a schedule and calculation for the full term for each disbursement of the loan account. Installment dates always follow the first disbursement date pattern, and overlapped installments from multiple disbursements aggregate into one single installment. Features added to the schedule affect the whole aggregated schedule rather than each disbursement-level schedule.

The system handles N+1 installments during disbursement as follows:

- When an existing N+1 installment fully overlaps a new installment, they merge together.
- When an existing N+1 installment does not fully overlap a new installment, the system creates a new installment and the N+1 installment becomes shorter.
- When a charge is added after the maturity date, an N+1 installment is created if one does not already exist.
- When a chargeback is added after the maturity date, an N+1 installment is created.

### Scope exclusions

The system does not support the full term length for each tranche disbursement, delayed capture beyond one billing period, refund amounts that trigger reamortization of the remaining repayment schedule, or monetary transactions and repayment allocations.

When the full term tranche configuration is enabled, the following behaviour applies:

- A user can undo the last disbursement.
- After undoing the last disbursement, the system reprocesses the schedule chronologically based on the remaining disbursements and transactions.

### Monetary operations and transaction allocation

Transaction allocation happens normally on the repayment schedule and affects the current schedule.

The system reprocesses the repayment schedule and transactions in these situations:

- Backdated monetary operations, including transactions, charges, reschedule and interest pause.
- Reversal of existing monetary operations.

No differences are required to handle backdated monetary operations or reversal of existing monetary operations compared to normal operations.

### Features working normally with full term tranche

The following features work normally on tranche loans with full term tranche enabled.

Features that work normally on tranche loans with full term tranche enabled:

- Downpayment works normally.
- Interest pause works normally on the full term tranche schedule.
- Capitalised Income works normally on the full term tranche schedule.
- BuyDown fees work normally.
- Charge-back works normally.
- Write-off works normally.
- Re-age works normally on all 3 options.
- Re-amortization works normally on all 3 options.
- Payment Holiday/Reschedule works normally on the full term tranche schedule.
- Contract termination works normally.
- After repayment or charges work as normal, matching the requirements for loans without full term tranches.
- Charges and Penalties work normally on the schedule as per the configured charge calculation type and charge time type.
- Charge off works normally on all 3 options.

Features that do not work normally on tranche loans with full term tranche enabled:

- Further disbursements are not allowed on the charged-off or written-off loan account.
- Disbursement after maturity date is TBD.

### Worked examples

A loan officer enables full-term tranche on a loan product that uses the progressive repayment strategy. The customer receives a single disbursement of 1,000 at a 12% annual interest rate, to be repaid in 3 monthly installments with 30-day months. These figures are illustrative. Because full-term tranche is enabled, the schedule runs for the full term of the disbursement rather than being shortened by any remaining loan term.

| Date | Disbursement | Installment | Principal | Interest | Balance |
| --- | --- | --- | --- | --- | --- |
| Disbursement | 1,000.00 | – | – | – | 1,000.00 |
| Month 1 | – | 343.33 | 333.33 | 10.00 | 666.67 |
| Month 2 | – | 340.00 | 333.33 | 6.67 | 333.34 |
| Month 3 | – | 336.67 | 333.34 | 3.33 | 0.00 |

A loan officer disburses a loan in two tranches of 500 each, one month apart, with full-term tranche enabled. Each tranche carries a 3-month term and 12% annual interest. Installment dates follow the first disbursement, so the second tranche’s installments fall due in months 2, 3, and 4 while the first tranche’s installments fall due in months 1, 2, and 3. The installments due in months 2 and 3 overlap and are aggregated into a single installment each month. Overlapping installments from different tranches are combined into one payment, though if the second disbursement date is on or before an existing installment due date the installments merge into one, while if it is after, a new installment is created and the existing one shortens.

| Date | Disbursement | Installment | Principal | Interest | Balance |
| --- | --- | --- | --- | --- | --- |
| Month 0 | 500.00 | – | – | – | 500.00 |
| Month 1 | 500.00 | 171.67 | 166.67 | 5.00 | 833.33 |
| Month 2 | – | 341.66 | 333.33 | 8.33 | 500.00 |
| Month 3 | – | 338.34 | 333.34 | 5.00 | 166.66 |
| Month 4 | – | 168.33 | 166.66 | 1.67 | 0.00 |

With full-term tranche enabled, a loan officer disburses 500, collects one installment, then disburses a second 500. The officer later undoes the second disbursement. The system removes the second tranche from the schedule while keeping the repayment already made, and the account continues on the original term for the first tranche. Undo is available only while full-term tranche is enabled and the account has not been charged off or written off.

| Date | Disbursement | Installment | Principal | Interest | Balance |
| --- | --- | --- | --- | --- | --- |
| Month 0 | 500.00 | – | – | – | 500.00 |
| Month 1 | – | 171.67 | 166.67 | 5.00 | 333.33 |
| Month 1 | 500.00 | – | – | – | 833.33 |
| Month 1 | (500.00) | – | – | – | 333.33 |
| Month 2 | – | 170.00 | 166.66 | 3.34 | 166.67 |
| Month 3 | – | 168.33 | 166.67 | 1.66 | 0.00 |

A loan with full-term tranche enabled matures after its third installment. A flat charge of 20 is added after the maturity date. Because the charge falls after the final installment, the system creates a new N+1 installment for the charge rather than adding it to an existing installment. If the same charge is added before maturity, it is added to the next scheduled installment rather than creating a new N+1 installment.

| Date | Disbursement | Installment | Principal | Interest | Fees | Balance |
| --- | --- | --- | --- | --- | --- | --- |
| Month 0 | 1,000.00 | – | – | – | – | 1,000.00 |
| Month 1 | – | 343.33 | 333.33 | 10.00 | – | 666.67 |
| Month 2 | – | 340.00 | 333.33 | 6.67 | – | 333.34 |
| Month 3 | – | 336.67 | 333.34 | 3.33 | – | 0.00 |
| Month 4 | – | – | – | – | 20.00 | 20.00 |
| Month 4 | – | 20.00 | – | – | 20.00 | 0.00 |
