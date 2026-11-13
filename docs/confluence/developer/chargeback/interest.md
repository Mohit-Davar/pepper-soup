# Interest on Chargebacks

## Chargeback overview

A chargeback reverses a payment transaction and returns the paid amount to the loan account. The chargeback transaction is always dated as the current date. The chargeback amount can equal or be lower than the target transaction amount, but cannot exceed it. Full chargeback behaviour applies to any non-progressive loans and to any progressive loans if no chargeback allocation rule is configured, including progressive loans with interest recalculation enabled.

Chargeback behaviour depends on the loan type and configuration.

| Loan type and configuration | Chargeback behaviour |
| --- | --- |
| Non-progressive loans | Chargeback always increases the due principal only. |
| Interest-bearing loans with no Chargeback allocation rule configured | Chargeback behaves the same as for non-progressive loans, increasing due principal only. |
| Interest-bearing loans with a Chargeback allocation rule configured | Balances (principal, interest, fee, penalty) are credited in the order of the allocation rule and only credited back for each balance as they were paid on the target transactions. |
| Progressive loans with interest recalculation enabled and no Chargeback transaction allocation rule set | Chargeback is allowed. |
| Progressive loans with interest recalculation enabled where a Chargeback allocation rule was configured | Behaviour #2 applies. |

The chargeback amount is added to the next unpaid installment in the repayment schedule, and the linkage between the chargeback and the repayment is retained. Since the chargeback transaction is always the current date, only the chargeback is applied to the repayment schedule as the last transaction without reprocessing every transaction.

## Eligibility and timing

Chargeback applies to progressive, interest-bearing loans where interest recalculation is not enabled.

Two behaviours apply depending on whether a Chargeback allocation rule is configured:

- Behaviour #1 applies when no Chargeback allocation rule is configured.
- Behaviour #2 applies when a Chargeback allocation rule is configured.
- The chargeback transaction allocation follows the defined allocation rules.
- The interest portion from the target transaction is also credited back as principal as part of the Chargeback transaction.

> **Note:** When chargeback is not allowed, the chargeback endpoint returns error code error.msg.loan.chargeback.operation.not.allowed with parameterName id and args value 691.

## Allocation rules

The allocation rule order defines the order in which the Chargeback amount is credited back to balances. It only makes a difference if the Chargeback is a partial amount of the target transaction amount; otherwise the same amounts are credited back to the same balances.

Four allocation options are available:

- PRINCIPAL
- INTEREST
- FEE
- PENALTY

> **Note:** Chargeback transaction allocation rule can be configured on the Loan product for progressive loans only.

## How to perform a chargeback

Perform a chargeback by calling the chargeback endpoint for a loan transaction. The system routes the request to the chargeback command handler, which calls the loan write platform service. For non-progressive loans, and for progressive loans without chargeback transaction allocation rules, the abstract loan repayment schedule transaction processor handles the chargeback. For progressive loans with chargeback transaction allocation rules set, the advanced payment schedule transaction processor handles it instead.

| Endpoint | Handler | Implementation | Processor for non-progressive loans and progressive loans without chargeback transaction allocation rules | Processor for progressive loans with chargeback transaction allocation rules |
| --- | --- | --- | --- | --- |
| /loans/<loan_id>/transactions/<transaction_id>?command=chargeback | LoanRepaymentChargebackCommandHandler | org.apache.fineract.portfolio.loanaccount.service.LoanWritePlatformServiceJpaRepositoryImpl#chargebackLoanTransaction | org.apache.fineract.portfolio.loanaccount.domain.transactionprocessor.AbstractLoanRepaymentScheduleTransactionProcessor#handleChargeback | org.apache.fineract.portfolio.loanaccount.domain.transactionprocessor.impl.AdvancedPaymentScheduleTransactionProcessor#handleChargeback |

## Schedule and charges

Charged back interest is paid as a fixed amount as part of the period it belongs to. It does not go through interest recalculation again, and no new accrual transactions are created for it. For progressive loans where interest recalculation is enabled, all transactions including the chargeback must be reprocessed if the principal due amount changed. Credited principal on a period increases the EMI of that period, and credited interest increases the EMI of that period if applicable.

Interest recalculation depends on when the chargeback happens:

- If the chargeback happens before the maturity date, it increases the outstanding principal and interest is calculated on this increased amount (original outstanding principal plus credited back principal).
- If the chargeback happens on or after the maturity date, no interest is recalculated and no interest recalculation is needed.

Charge-back interest and principal of the previous period are split accordingly.

| Charge-back component | Treatment |
| --- | --- |
| Interest | Split accordingly |
| Principal | Split accordingly |

> **Note:** Principal is not considered income.

## Worked examples

A loan of principal 1,000 carries an annual interest rate of 12%, or 1% per month, with three monthly installments and 30-day months; the figures are illustrative. Interest recalculation is disabled and no chargeback allocation rule is configured. The first two installments are paid, leaving a balance of 333.34. A chargeback of the second installment, 340.00, is posted on the current date. Because no allocation rule exists, the full chargeback amount is credited to due principal only and is added to the next unpaid installment; no interest is recalculated.

| Date | Event | Opening balance | Principal due | Credited principal | Interest | Installment | Closing balance |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1/1 | Repayment | 1,000.00 | 333.33 | — | 10.00 | 343.33 | 666.67 |
| 2/1 | Repayment | 666.67 | 333.33 | — | 6.67 | 340.00 | 333.34 |
| 2/15 | Chargeback | 333.34 | — | 340.00 | — | 340.00 | 673.34 |
| 3/1 | Repayment | 673.34 | 673.34 | — | 3.33 | 676.67 | 0.00 |

The example shows that without an allocation rule the chargeback increases principal only, raises the balance before the next installment, and leaves interest unchanged because recalculation is disabled. With interest recalculation enabled and no allocation rule, the same principal-only credit is applied, but the schedule is reprocessed and interest is recalculated on the increased principal.

A loan of principal 1,000 carries an annual interest rate of 12%, or 1% per month, with three monthly installments and 30-day months. Interest recalculation is disabled and the chargeback allocation rule is Interest, Fee, Principal. The first two installments are paid, leaving a balance of 333.34. A partial chargeback of 200.00 is posted for the second installment, which had been paid as principal 333.33, interest 6.67, and fee 5.00. The rule credits interest first (6.67), then fee (5.00), then principal (188.33); only amounts actually paid on the target transaction can be credited back. The credited principal is added to the next unpaid installment.

| Date | Event | Opening balance | Principal due | Credited principal | Interest | Fee | Installment | Closing balance |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1/1 | Repayment | 1,000.00 | 333.33 | — | 10.00 | 5.00 | 348.33 | 666.67 |
| 2/1 | Repayment | 666.67 | 333.33 | — | 6.67 | 5.00 | 345.00 | 333.34 |
| 2/15 | Chargeback | 333.34 | — | 188.33 | 6.67 | 5.00 | 200.00 | 521.67 |
| 3/1 | Repayment | 521.67 | 521.67 | — | 3.33 | 5.00 | 530.00 | 0.00 |

The example shows that a partial chargeback follows the allocation order and credits back only the portions that were paid on the target transaction. With interest recalculation enabled, the credited principal and credited interest are applied as static additions through the EMICalculator, so the credited interest also increases the EMI of that period.

A loan of principal 1,000 carries an annual interest rate of 12%, or 1% per month, with three monthly installments and 30-day months. Interest recalculation is enabled and the chargeback allocation rule is Interest, Principal, Fee. The first two installments are paid, leaving a balance of 333.34. A partial chargeback of 300.00 is posted for the second installment, which had been paid as principal 333.33, interest 6.67, and fee 5.00. The rule credits interest first (6.67) and then principal (293.33). With recalculation enabled, the credited principal is applied as a static addition to the period's due principal, so interest is calculated on the increased balance; the credited interest is added as a static amount to the period's interest. No new accrual entries are created for the charged-back interest.

| Date | Event | Opening balance | Due principal | Credited principal | Total principal | Interest | Credited interest | Fee | Installment | Closing balance |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1/1 | Repayment | 1,000.00 | 333.33 | — | 333.33 | 10.00 | — | 5.00 | 348.33 | 666.67 |
| 2/1 | Repayment | 666.67 | 333.33 | — | 333.33 | 6.67 | — | 5.00 | 345.00 | 333.34 |
| 2/15 | Chargeback | 333.34 | — | 293.33 | 293.33 | — | 6.67 | — | 300.00 | 626.67 |
| 3/1 | Repayment | 626.67 | 333.34 | 293.33 | 626.67 | 6.27 | 6.67 | 5.00 | 644.61 | 0.00 |

The example shows that with recalculation enabled, credited principal increases the balance and the interest base for the period, while credited interest is added as a fixed amount and does not generate new accrual entries. If the chargeback occurs on or after the maturity date, no interest is recalculated and no new interest is charged.
