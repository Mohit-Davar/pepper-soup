# Interest on Chargebacks

## Interest on Chargebacks

### Chargeback basics

A chargeback transaction always targets an existing transaction and can charge back that transaction in full or in part. The chargeback posts on the actual, current date. Its amount can equal or be lower than the target transaction amount, but cannot exceed it. The chargeback amount cannot exceed the amount of the related payment transaction.

### Chargeback amount allocation

A chargeback always increases the due principal only for non-progressive loans. For interest-bearing loans without a custom allocation rule configured for the Chargeback transaction, the chargeback amount also increases the due principal only.

For interest-bearing loans with a custom allocation rule configured for the Chargeback transaction, balances are credited in the order of the allocation rule and only up to the amount paid for each balance on the target transaction.

If the payment being charged back includes any interest, the chargeback includes that interest portion, and the interest portion from the target transaction is credited back as principal as part of the Chargeback transaction.

Chargeback amount allocation priority is configurable, and the allocation rule order defines the order in which the Chargeback amount is credited back; this order only matters for partial chargebacks of the target transaction amount.

### Chargeback timing and maturity

A chargeback before the maturity date increases the outstanding principal, and interest is calculated on the increased amount. A chargeback on or after the maturity date does not increase the outstanding principal and no interest is calculated.

If the original transaction portions changed, the system recalculates and reallocates the chargeback.

### Repayment schedule placement

The system adds the chargeback amount to the next unpaid installment in the repayment schedule and retains the linkage between the chargeback and the repayment, the same as for non-interest bearing loans.

The next installment depends on the date relative to the current installment due date:

- If the current date is before the current installment due date, the next installment is the current installment.
- If the current date is on the current period due date, the next installment is the period just after the current period.

### Progressive loans with interest recalculation enabled

For progressive loans where interest recalculation is enabled, the system reprocesses all transactions including the Chargeback to recalculate interest if the principal due amount changed.

### Progressive loans with interest recalculation not enabled

Chargeback behaviour #1 applies to progressive loans with interest recalculation not enabled when no Chargeback allocation rule is configured.

The following rules apply:

- No interest recalculation happens.
- If the original transaction portions changed, the Chargeback does not need to be recalculated and reallocated because the Chargeback amount cannot be changed and all amount was allocated already to principal.
- Reprocessing is still needed and the repayment schedule might change.

### Progressive loans with interest recalculation enabled and allocation rule configured

Chargeback behaviour #2 applies to progressive loans with interest recalculation enabled when a Chargeback allocation rule is configured.

The allocation priority depends on the chargeback scenario:

- Full chargeback before maturity date: Interest, penalties, fees, Principal.
- Partial chargeback before maturity date: Interest, fees, Principal.
- Partial chargeback before maturity date with a change in allocation rule: Principal, Interest, fees.
- Two chargebacks before maturity: Principal, Interest, fees.

### Full chargeback behaviour

Full chargeback behaviour applies to any non-progressive loan. It also applies to a progressive loan when no chargeback allocation rule is configured, including when interest recalculation is enabled but no chargeback transaction allocation rule is set.

### Chargeback allowance and reprocessing

A Chargeback is allowed on a progressive, interest-bearing loan with interest recalculation enabled when no Chargeback transaction allocation rule is set. If the original transaction portions changed, the Chargeback must be recalculated and reallocated, reprocessing is needed, and the repayment schedule might change.

### EMI impact

Credited principal increases the EMI of that period, and credited interest increases the EMI of that period if applicable.

### Interest treatment

Charged back interest is paid as a fixed amount as part of the period it belongs to. It does not go through interest recalculation again, and the system creates no new accrual transactions or income recognition for it. No accrual is created for charged back fees and penalties.

### Chargeback allocation rule configuration

You can configure how a chargeback transaction is allocated on a loan product for progressive loans. Chargeback on a loan with interest recalculation is disabled. The EMI Calculator does not handle post maturity date interest periods, and N+1 period handling can be the same as non interest recalculation cases.

The allocation rule supports four options:

- PRINCIPAL
- INTEREST
- FEE
- PENALTY

Allocation follows these rules:

- Allocation priority is Interest, fees, Principal.
- Iteration is not performed; iterate with value 0.00.
- Implementation is for progressive loan type only.

### Worked examples

Situation: a full chargeback before maturity with no chargeback allocation rule and interest recalculation enabled. Setup (illustrative figures): a loan of 1,000.00 at 12% per year, 30-day months, and monthly installments. A repayment of 340.00 (principal 330.00, interest 10.00) is posted on 2/1. On 3/1, before maturity, an officer charges back the full 340.00. With no allocation rule, the entire amount is credited back to principal, the chargeback is added to the next unpaid installment, and interest is recalculated on the higher outstanding balance. Posting the chargeback on a later business date shifts the interest calculation dates, so the total interest changes slightly while the same rule applies.

| Date | Transaction | Payment | Principal | Interest | Balance after |
| --- | --- | --- | --- | --- | --- |
| 2/1 | Repayment | 340.00 | 330.00 | 10.00 | 670.00 |
| 3/1 | Chargeback (full) | 340.00 | 340.00 | 0.00 | 1,010.00 |
| 4/1 | Installment with chargeback | 680.00 | 669.90 | 10.10 | 340.10 |
| 5/1 | Final installment | 343.50 | 340.10 | 3.40 | 0.00 |
| Total |  | 1,703.50 | 1,680.00 | 23.50 |  |

Situation: a partial chargeback before maturity with a chargeback allocation rule and interest recalculation disabled. Setup: a repayment of 100.00 is allocated as 70.00 principal, 20.00 fee, and 10.00 interest. On 3/1, before maturity, an officer charges back 80.00. The allocation rule is Principal, then Interest, then Fee. The system credits 70.00 to principal and 10.00 to interest, using the full chargeback amount; nothing is credited to fee. Due principal rises by 70.00 and due interest by 10.00, while the fee due is unchanged. If the rule were Interest, Principal, Fee instead, the 80.00 would credit 10.00 to interest first and then 70.00 to principal, leaving the fee unchanged; the total credited is still 80.00.

| Balance type | Amount paid on target | Chargeback credited | Effect on due balance |
| --- | --- | --- | --- |
| Principal | 70.00 | 70.00 | Increases by 70.00 |
| Interest | 10.00 | 10.00 | Increases by 10.00 |
| Fee | 20.00 | 0.00 | Unchanged at 20.00 |
| Total | 100.00 | 80.00 |  |

Situation: a chargeback posted after the maturity date. Setup: a loan matures on 4/1 with no outstanding balance. On 5/1, after maturity, an officer charges back 250.00 against a March repayment (principal 240.00, interest 10.00). Because the chargeback is after maturity, no interest is calculated on the credited principal and no interest recalculation is performed. The 250.00 is added to the outstanding principal as a fixed amount and no new accrual is created.

| Date | Event | Principal credited | Interest credited | Principal due after | Interest accrued after |
| --- | --- | --- | --- | --- | --- |
| 4/1 | Maturity reached | 0.00 | 0.00 | 0.00 | 0.00 |
| 5/1 | Chargeback posted | 250.00 | 0.00 | 250.00 | 0.00 |
| 6/1 | One month later | 0.00 | 0.00 | 250.00 | 0.00 |
| Total |  | 250.00 | 0.00 |  |  |

Situation: a chargeback that includes interest, fee, and principal. Setup: a chargeback of 100.00 credits 70.00 to principal, 20.00 to fee, and 10.00 to interest. The system posts the chargeback but creates no accrual or income-recognition entries for the 20.00 fee and 10.00 interest. Those amounts are collected as fixed amounts in their period, while only the principal changes the outstanding balance.

| Chargeback portion | Amount | Accrual created | How it is collected |
| --- | --- | --- | --- |
| Principal | 70.00 | Yes | Added to due principal |
| Fee | 20.00 | No | Fixed amount in its period |
| Interest | 10.00 | No | Fixed amount in its period |
| Total | 100.00 |  |  |
