# Delayed Captures and Full-Term Tranches

## Full term tranche feature

A full-term tranche gives each disbursement its own independent repayment schedule over the full loan term, regardless of when the disbursement is captured. It applies to multi-disbursement loans where tranche disbursement is enabled at the loan product and the loan schedule type is PROGRESSIVE.

Each disbursement follows these rules:

- Overlapping periods automatically combine repayment amounts into single installments.
- When a disbursement is captured mid-term after the first installment, installments merge into combined amounts for overlapping periods, and the new disbursement generates one additional installment to complete its full term independently.
- When a disbursement is added after the first installment, the system creates new installments after that point, and those installments' EMI includes interest calculated only based on the second disbursement.

## Configuration

You can configure full term tranches at loan product and account level. The option is disabled by default and is available only for the progressive repayment strategy.

The tranche setting screen includes an enable or disable option for full term length for each tranche:

- When disabled, the system works normally.

## Schedule calculation and installment behavior

Installment dates follow the first disbursement date pattern. Changes to features apply to the whole aggregated schedule, not to each disbursement-level schedule.

## Undoing a disbursement

You can undo the last disbursement when full term tranche configuration is enabled. The system reprocesses the schedule chronologically using the remaining disbursements and transactions.

## Backdated operations and reversals

Backdated monetary operations and reversals of existing monetary operations follow the same rules as normal operations. After either type of operation, the system reprocesses the repayment schedule and transactions.

## Transaction allocation

## Other features working normally

## Restrictions and out-of-scope items

You cannot make further disbursements on a charged-off or written-off loan account.

## Worked examples

This example shows a delayed capture with full-term tranche enabled. The figures are illustrative. A loan on the progressive repayment strategy has a principal of 300.00, an annual interest rate of 12.00% (1.00% per month), three monthly installments, and 30-day months. The first disbursement of 300.00 is made on 1-Jan. Its first installment is due on 1-Feb. A second disbursement of 300.00 is captured on 1-Feb after that installment. Because full-term tranche is enabled, the second disbursement receives the full three-month term, so its installments fall on 1-Mar, 1-Apr, and 1-May. The 1-Mar and 1-Apr installments overlap with the first disbursement’s remaining installments and are combined into single installments. The 1-May installment is the additional installment that lets the second disbursement complete its full term independently.

| Date | Event | Principal | Interest | EMI | Balance |
| --- | --- | --- | --- | --- | --- |
| 1-Jan | Disbursement D1 | 300.00 | – | – | 300.00 |
| 1-Feb | Installment 1 (D1) | 100.00 | 3.00 | 103.00 | 200.00 |
| 1-Feb | Disbursement D2 | 300.00 | – | – | 500.00 |
| 1-Mar | Combined installment | 200.00 | 5.00 | 205.00 | 300.00 |
| 1-Apr | Combined installment | 200.00 | 3.00 | 203.00 | 100.00 |
| 1-May | Installment (D2 only) | 100.00 | 1.00 | 101.00 | 0.00 |

Overlapping installments from multiple disbursements are aggregated as one installment, while the second disbursement keeps its full term by adding one installment beyond the first disbursement’s original end date.

This example shows undoing the last disbursement when full-term tranche is enabled. The setup is the same: a principal of 300.00, an annual interest rate of 12.00%, three monthly installments, and 30-day months. The first disbursement of 300.00 is made on 1-Jan, and the first installment of 103.00 is paid on 1-Feb, leaving a balance of 200.00. A second disbursement of 300.00 is captured on 1-Feb, raising the balance to 500.00. The second disbursement is then undone on 1-Feb, removing the 300.00 and restoring the balance to 200.00. The schedule reverts to the original first-disbursement schedule, with installments of 102.00 on 1-Mar and 101.00 on 1-Apr.

| Date | Event | Principal | Interest | EMI | Balance |
| --- | --- | --- | --- | --- | --- |
| 1-Jan | Disbursement D1 | 300.00 | – | – | 300.00 |
| 1-Feb | Installment 1 (D1) | 100.00 | 3.00 | 103.00 | 200.00 |
| 1-Feb | Disbursement D2 | 300.00 | – | – | 500.00 |
| 1-Feb | Undo disbursement D2 | (300.00) | – | – | 200.00 |
| 1-Mar | Installment 2 (D1) | 100.00 | 2.00 | 102.00 | 100.00 |
| 1-Apr | Installment 3 (D1) | 100.00 | 1.00 | 101.00 | 0.00 |

Undoing the last disbursement removes its balance and restores the schedule to the state before that disbursement.
