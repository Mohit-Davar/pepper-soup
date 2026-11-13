# Payment Allocation Strategies

## Payment allocation strategy overview

Payment allocation strategies decide how the system applies a payment to principal, interest, fees, and penalties. Advance Payment Allocation provides flexible strategies for allocating early payments across those components. Advance Repayment Strategy provides fully configurable payment application logic covering principal, interest, fees, and penalty.

## Payment allocation priority order

A payment is applied to loan components in this priority order: overdue fees and penalties first, then accrued interest, then principal, then future installments. Partial payments are split across components based on this priority, and each component closes automatically once it is fully satisfied.

## Repayment payment order

The repayment payment order decides how the system applies a repayment across charges, penalties, fees, interest and principal.

## Regional product configuration

The payment allocation strategy applies to the PayIn30 product in the DE region. The allocation order is DuePenalties, DueInterest, DuePrincipal, DueFees, InAdvancePenalties, InAdvanceInterest, InAdvancePrincipal, InAdvanceFees, and it stays the same for all transaction types.

## Scope of payment allocation

Payment Allocation applies to credit adjustments, repayments, refunds, goodwill credits, and waivers, whether the amount is paid in full, partial or excess.

## Transaction allocation rules

Predefined transaction allocation rules decide how a payment is applied to principal, fees, and penalties. DUE PRINCIPAL is projected principal payment; DUE FEE and DUE PENALTY are current or older charges based on their specific due date. IN ADVANCE PRINCIPAL is over projected principal payment; IN ADVANCE FEE and IN ADVANCE PENALTY are future charges based on their specific due date.

Allocation targets depend on the transaction type:

- For PRINCIPAL, allocation runs on the amortization schedule.
- For FEE or PENALTY, allocation runs on charge payment handling (charge balances).
- For overpayment, allocation runs on overpayment handling (overpayment balances and status).

For all monetary transactions, allocation mapping entries are created for fee, penalty, and principal based on the allocation rules.

## Same-day repayment and charge behavior

If you add a repayment and then add a charge on the same day, the system does not reverse-replay the repayment. If you add another repayment on the same day as a charge, that repayment pays the charge.

## Accrual configuration and posting

You can configure how the system accrues charges and posts accrual journal entries. Accrual timing controls whether accrual happens immediately or through the nightly close of business job. Charge accrual date controls whether accrual uses the charge created date or the due date. Immediate accrual can post multiple accruals on the same day.

| Setting | Options | Default |
| --- | --- | --- |
| charge_accrual_date | submitted on, due date | due date |
| Accrual_timing | immediate, job | job |

Jobs, close of business jobs, and accrual through the API behave consistently. When reverse replay recreates an accrual on the submitted-on date instead of the due date, it uses the same value date as the original accrual.

## Advanced payment transaction processor

The Advanced payment transaction processor resets the due principals on the repayment schedule before reprocessing the transactions, including the disbursement transaction. It applies transactions and charges one by one. When processing a disbursement transaction, it calls the EMICalculator and uses the generated model to update the repayment periods, principal due, interest due, and related fields instead of calculating an EMI itself. This processor does not use the EMICalculator for interest recalculation or multi-disbursement loans.

## Schedule and installment rules

A schedule must not have a middle installment with a higher amount while the last installment is paid.

## Allocation targets and overpayment handling

Repayment-like transactions pay down outstanding balances. If more repayment occurs than the total outstanding balance, the excess is an overpayment.

## Backdated transactions and reverse replay

Backdated transactions and reverse replay can change how money is distributed and pay off fees retrospectively, which changes the amount of income. Fees added to an instalment must be paid by a payment created after the fee is due; this applies to any other income source too.

## New repayment strategy buckets

The new repayment strategy adds two buckets: Due charges and In advance principal. You can pay charges on or after their due date, and the strategy accounts for any unpaid charge or penalty that is due.

## Worked examples

The figures in this example are illustrative. A loan of 1,000.00 is disbursed on 1 January and falls due in full on 31 January. There are no fees or penalties. The borrower repays 1,000.00 on 31 January, and the entire amount is applied to the due principal.

| Date | Transaction | Amount | Due principal paid | Principal balance | Total balance |
| --- | --- | --- | --- | --- | --- |
| 1 January | Disbursement | 1,000.00 | – | 1,000.00 | 1,000.00 |
| 31 January | Repayment | (1,000.00) | 1,000.00 | 0.00 | 0.00 |
| Total |  | 0.00 | 1,000.00 |  |  |

A loan of 1,000.00 is disbursed on 1 January and is due on 31 January. A fee of 40.00 is posted on 15 January and is due on 20 January. The borrower repays 100.00 on 17 January, before the fee is due, and then repays 100.00 on 20 January, the fee due date. A second fee of 30.00 is posted on 25 January and is not settled by the earlier repayment. If the repayment on 17 January had arrived after 20 January, it would have settled the due fee before reducing principal.

| Date | Transaction | Amount | Due fee paid | In-advance principal paid | Principal balance | Fee balance | Total balance |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 January | Disbursement | 1,000.00 | – | – | 1,000.00 | 0.00 | 1,000.00 |
| 15 January | Fee posted | 40.00 | – | – | 1,000.00 | 40.00 | 1,040.00 |
| 17 January | Repayment | (100.00) | 0.00 | 100.00 | 900.00 | 40.00 | 940.00 |
| 20 January | Repayment | (100.00) | 40.00 | 60.00 | 840.00 | 0.00 | 840.00 |
| 25 January | Fee posted | 30.00 | – | – | 840.00 | 30.00 | 870.00 |
| Total |  | 870.00 | 40.00 | 160.00 |  |  |  |

A loan of 1,000.00 is disbursed on 1 January and is due on 31 January. A fee of 25.00 is posted on 25 January and is due on 1 March. The borrower repays 500.00 on 1 February, before the fee is due, and then repays 525.00 on 1 March, when both the installment and the fee are due. Without the fee, the repayment on 1 March would allocate entirely to due principal.

| Date | Transaction | Amount | In-advance principal paid | Due principal paid | Due fee paid | Principal balance | Fee balance | Total balance |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 January | Disbursement | 1,000.00 | – | – | – | 1,000.00 | 0.00 | 1,000.00 |
| 25 January | Fee posted | 25.00 | – | – | – | 1,000.00 | 25.00 | 1,025.00 |
| 1 February | Repayment | (500.00) | 500.00 | – | – | 500.00 | 25.00 | 525.00 |
| 1 March | Repayment | (525.00) | – | 500.00 | 25.00 | 0.00 | 0.00 | 0.00 |
| Total |  | 0.00 | 500.00 | 500.00 | 25.00 |  |  |  |

A loan of 1,000.00 is disbursed on 1 January and is due on 31 January. A penalty of 10.00 is posted on 15 February and is due the same day. A fee of 20.00 is posted on 25 February and is due on 1 March. A second penalty of 10.00 is posted on 5 March and is due the same day. The borrower repays 1,040.00 on 8 March. If only one penalty existed, the repayment would clear that penalty first and then move to principal.

| Date | Transaction | Amount | Penalty 15-Feb paid | Penalty 5-Mar paid | Due principal paid | Due fee paid | Principal balance | Penalty balance | Fee balance | Total balance |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 January | Disbursement | 1,000.00 | – | – | – | – | 1,000.00 | 0.00 | 0.00 | 1,000.00 |
| 15 February | Penalty posted | 10.00 | – | – | – | – | 1,000.00 | 10.00 | 0.00 | 1,010.00 |
| 25 February | Fee posted | 20.00 | – | – | – | – | 1,000.00 | 10.00 | 20.00 | 1,030.00 |
| 5 March | Penalty posted | 10.00 | – | – | – | – | 1,000.00 | 20.00 | 20.00 | 1,040.00 |
| 8 March | Repayment | (1,040.00) | 10.00 | 10.00 | 1,000.00 | 20.00 | 0.00 | 0.00 | 0.00 |  |
| Total |  | 0.00 | 10.00 | 10.00 | 1,000.00 | 20.00 |  |  |  |  |
