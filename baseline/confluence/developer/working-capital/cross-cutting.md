# Charges, Refunds and Chargebacks

Charges are amounts applied to a loan account during the loan lifecycle, such as fees or penalties. A charge can be applied at disbursement or on a specified due date. Charges increase the charge receivable and charge income, and they add to the amount to be collected under fees or penalties based on configuration. A charge does not impact principal.

Charge timing and calculation rules:

- Disbursement charges support flat or percentage-of-amount calculation.
- Specified due date charges support flat calculation only.
- Charge payment mode is Regular by default when not specified.

When you can add a charge:

- You can add a charge backdated up to the current date.
- You can add a specified due date charge on a disbursed or active loan account on the current date or a future date.
- You can add a charge on closed or overpaid loans, or after the maturity date.
- Adding charges after charge-off is not allowed.

What happens when a charge is added:

- A charge transaction is created when the charge is applied at the loan account level.
- The charge amount increases the charge receivable and charge income.
- The charge amount adds to the amount to be collected under fees or penalties based on configuration.
- If an overpaid loan receives a charge and the overpaid amount is greater than the charge amount, the loan remains overpaid.
- If the overpaid amount matches the charge amount, the loan gets closed.
- If the overpaid amount is lower than the charge amount, the loan gets active (reopened).
- The new maturity date is the date of the charge due date.
- Delinquency and breach periods are created if any outstanding balance appears on the loan after adding a charge.

Charge waiver:

- You can waive an unpaid charge on an active loan account.
- Charge deletion is prevented if the charge is assigned to a Working Capital Loan.

Charge adjustment:

- A charge adjustment is a monetary transaction used to offset charges that have already been paid.
- Charge adjustment is triggered when previously paid charges need to be adjusted or refunded.
- Charge adjustment results in reduction of collected amount.
- Charge adjustment is adjusted to principal or charge balances depending on the allocation strategy priority.
- Charge adjustment triggers accounting entries.
- Charge adjustment works similar to a repayment transaction.
- Charge adjustment applies only to fees, penalty, or principal components based on allocation priority.
- Charge adjustment cannot exceed the paid charge amount.
- Charge adjustment cannot exceed the available charge balance.
- Charge adjustment can be performed only if charges have been previously paid.
- Charge adjustment amount must be greater than zero.
- Charge adjustment amount must not exceed the paid charge amount.
- Charge adjustment date must comply with business date rules.
- Charge adjustment date must comply with backdating rules.
- Charge adjustment results in nullification of receivables or reversal of income standard accounting entry.
- When charges are paid via repayment, the receivable is reduced.
- When charges are adjusted via charge adjustment, previously recognized income is reversed.
- Charge receivables are created at charge application.
- Charge receivables are cleared during payment or adjustment.
- Charge adjustment supports backdated processing.
- Charge adjustment transactions support reversal subject to validations.

Credit Balance Refund (CBR):

- CBR is a monetary transaction executed on a loan account in OVERPAID status.
- CBR is allowed only when loan status is OVERPAID and overpaymentAmount is greater than zero.
- CBR validation requires transactionAmount greater than zero and less than or equal to overpaymentAmount.
- CBR transaction date must follow standard transaction date rules.
- CBR results in reduction of overpaymentAmount by the refund amount.
- CBR results in persistence of transaction and allocation records.
- CBR results in loan status transition evaluation based on resulting balance fields.
- No amortization schedule recalculation is triggered by CBR.
- No delinquency or breach payment-application flow is triggered by CBR.
- CBR reversal is allowed subject to no dependency conflicts and valid loan or account status.
- CBR reversal behavior creates a linked reversal transaction.
- CBR reversal reverses credit balance adjustment and accounting entries.

Charge-off:

- Charge-off is an accounting classification, not a loan closure.
- On charge-off, the loan account status is updated from Active Delinquent to Charged-Off.
- On charge-off, a one-time amortization is performed for the total deferred income as of the charge-off date.
- On charge-off, corresponding accounting entries are posted as defined in the accounting configuration.
- Any transactions after the charge-off date must follow charge-off-specific accounting rules.
- Backdated charge-off is allowed but must not precede the last monetary transaction date.
- Backdated repayments and reversals before the charge-off date are allowed.
- Charge-off reversal is supported subject to configuration and controls.
- Charge-off reversal is not supported if any transactions were done after the charge-off transaction.

Write-off:

- The loan account status is updated to Closed (Written-Off).
- Backdated repayments or reversals before the write-off date are allowed.
- The following fields must be captured at the time of write-off: Write-Off Date, Write-Off Reason, External ID, Notes.

Transaction rules:

- Backdated transactions are supported for most transaction types.
- Transactions can be reversed subject to no dependency conflicts and valid loan status.
- All undo or deletion actions must be captured in the audit trail.

Monetary transaction types:

| Type | Description |
| --- | --- |
| Disbursement | Release of approved loan funds to the borrower; marks activation of the loan account, initiates repayment obligations, and triggers related accounting and schedule generation. |
| Repayment | Payment toward the loan. |
| Discount fees Amortization | System-driven recognition of deferred income aligned with payment events; no accounting entries are generated and it does not impact GL accounts or financial balances. |
| Prepayment | Payment made before the due date. |
| Charge Adjustment | Monetary transaction used to offset charges that have already been paid. |
| Discount Fees | Upfront income adjustment applied to a loan, typically at or as of disbursement. |
| Credit Balance Refund | Refund of excess funds paid by the borrower when the loan has an overpayment balance. |
| Goodwill Credit Transaction | Credit adjustment provided to the borrower, typically as a gesture of goodwill. |
| Recovery Payment | Payment made after write-off. |
| Payout Refund | Refund transaction on a loan account. |

Non-monetary transaction types:

| Type | Description |
| --- | --- |
| Charge Application | Application of a charge to a loan account. |
| Charge Waiver | Waiver of a charge. |
| Write-Off / Charge-Off | Accounting treatment for write-off or charge-off. |
| Adjustments / Reversals | Adjustment or reversal of transactions. |

Transaction allocation:

| Component | Effect |
| --- | --- |
| Penalties, Fees, Principal | Amounts are distributed into these components. |

Charge-off removes a loan balance from the active portfolio when repayment is no longer expected. Charge-off reversal restores the previously charged-off amounts. Credit balance refund (CBR) returns excess payments to the customer. Chargeback reverses a credit balance refund when the refunded excess must be recovered.

Charge-off accounting entries:

| Entry | Debit GL code | Credit GL code | Mapping |
| --- | --- | --- | --- |
| Charge-off principal | 744007 | 112601 | Charge off expense / charge-off fraud expense / Loan Portfolio |
| Charge-off fees | 404008 | 112603 | Income from ChargeOff Fees / Fees Receivable |
| Charge-off penalties | 404008 | 112603 | Income from ChargeOff Penalties / Penalty Receivable |

Charge-off reversal accounting entries:

| Entry | Debit GL code | Credit GL code | Mapping |
| --- | --- | --- | --- |
| Charge-off reversal fees | 112603 | 404008 | Fees Receivable / Income from ChargeOff Fees |
| Charge-off reversal penalties | 112603 | 404008 | Penalty Receivable / Income from ChargeOff Penalties |

Credit balance refund (CBR) and reversal accounting entries:

| Entry | Debit GL code | Credit GL code | Mapping |
| --- | --- | --- | --- |
| CBR | 245000 | 145023 | Overpayment Liability / Fund source for excess |
| CBR Reversal | 145023 | 245000 | Fund source for excess / Overpayment Liability |

Charges, refunds and chargebacks describe how fees and penalties are added to a Working Capital loan, reversed when needed, and recorded when a loan is charged off. Charge-off is supported with 180, 360 or full tenure charge-offs, and the charge-off period is 6 monthly. Charge-backs are supported, and repayment reversals are used.

Charge-off and charge-back behaviour for the Interest Rate modification row:

- Charge off is N, Charge Back is R, Re-age is N, Re-amortisation is R, Backdate is R, Delayed Schedule Captures is N, Instalment Due date change is R, Maturity date change is R, Interest refund is N, Accrual Activity is N, Working Capital Product (WCP) is N, Loan origination is N.
- Interest Recalculation, Accounting, Buy-Down fees, Contract Termination, Capitalized income, Asset Externalization, Delinquency pause, Delinquency bucket calculation, Arears, Write off, Interest Waiver, Late payment fee, EMI Calculation, N+1 Installments, Interest Pause Period, Downpayments, Merchant Issued/Payout Refund transactions, Credit Balance Refund, Payments on closed loans, Disbursement (post action) are blank.

Charge-off and charge-back behaviour for the Credit Balance Refund row:

- Charge off is R, Charge Back is N, Re-age is R, Re-amortisation is N, Backdate is R, Delayed Schedule Captures is N, Instalment Due date change is N, Maturity date change is N, Interest refund is I, Credit Balance Refund is '-', Payments on closed loans is N, Working Capital Product (WCP) is N, Loan origination is N.
- Interest Recalculation, Accounting, Buy-Down fees, Contract Termination, Capitalized income, Asset Externalization, Interest Rate modification, Delinquency pause, Delinquency bucket calculation, Arears, Write off, Interest Waiver, Late payment fee, EMI Calculation, N+1 Installments, Interest Pause Period, Downpayments, Merchant Issued/Payout Refund transactions, Disbursement (post action), Accrual Activity are blank.

Charge-off and charge-back behaviour for the Interest refund row:

- Charge off is R, Charge Back is N, Re-age is R, Re-amortisation is R, Backdate is R, Interest Recalculation is R, Accounting is R, Buy-Down fees is N, Contract Termination is N, Capitalized income is R, Asset Externalization is R, Interest Rate modification is N, Delinquency pause is N, Delinquency bucket calculation is N, Arears is N, Write off is R, Interest Waiver is R, Late payment fee is N, EMI Calculation is N, Delayed Schedule Captures is R, N+1 Installments is N, Interest Pause Period is R, Downpayments is N, Merchant Issued/Payout Refund transactions is N, Credit Balance Refund is N, Payments on closed loans is N, Disbursement (post action) is N, Interest refund is '-', Accrual Activity is N, Working Capital Product (WCP) is N, Loan origination is N.

Charge addition and waive accounting entries:

| Transaction | Debit GL | Credit GL |
| --- | --- | --- |
| Charge addition | 112603 Fee Receivable (Fees Receivable, Asset, fees) | 404007 Fee Income (Income from Fees, Income, fees) |
| Charge waive | 404007 Fee Income (Income from Fees, Income, fees) | 112603 Fee Receivable (Fees Receivable, Asset, fees) |

Working Capital loan events:

- Creating a new Working Capital loan triggers WorkingCapitalLoanCreatedBusinessEvent.
- Charging off a Working Capital loan triggers WorkingCapitalLoanChargeOffBusinessEvent.
- Adding a new charge to a Working Capital loan triggers WorkingCapitalLoanAddChargeBusinessEvent.
- A Working Capital loan payout refund triggers WorkingCapitalLoanPayoutRefundTransactionBusinessEvent.
- A Working Capital loan charge adjustment triggers WorkingCapitalLoanChargeAdjustmentBusinessEvent.
- A Working Capital loan credit balance refund triggers WorkingCapitalLoanCreditBalanceRefundTransactionBusinessEvent.
- A Working Capital loan charge-off triggers WorkingCapitalLoanChargeOffTransactionBusinessEvent.

Payout Refund submission:

- The user enters the refund amount.
- The user selects the transaction date.
- The system validates eligibility.
- The system applies the refund amount against the outstanding principal and Fees/Penalty balance as per allocation rules.

Other behaviour:

- If a closed loan receives a charge, it is reopened as an outstanding balance occurs.
- The delinquency pause is applied as of the current business date at the time of initiation.
- Balance is recalculated/updated when a loan is disbursed, a repayment is posted, income is accrued, income is realized, adjustments or reversals happen, or COB processing executes.

A working capital loan with a principal of 1,000.00 reaches maturity on Day 0. Ten days later, a specified due date charge of 50.00 is added with a due date on Day 15. The charge creates an N+1 row while the original maturity date stays unchanged. A repayment made before Day 15 does not clear the charge; only a repayment after the due date settles it. The same behavior applies when the loan is CLOSED or OVERPAID. These figures are illustrative. This example shows that post-maturity specified due date charges generate an N+1 row and are payable only after their due date, without moving maturity.

| Day | Event | Charge receivable | Maturity date |
| --- | --- | --- | --- |
| 0 | Loan reaches maturity | 0.00 | Day 0 |
| 10 | Specified due date charge of 50.00 added | 50.00 | Day 0 (unchanged) |
| 15 | Repayment of 50.00 after due date | 0.00 | Day 0 (unchanged) |

A working capital loan is OVERPAID with an overpaymentAmount of 100.00. The borrower requests a Credit Balance Refund of 60.00, which reduces the overpayment by the refund amount and triggers a status evaluation. A second Credit Balance Refund of 40.00 clears the remaining credit balance and moves the loan to CLOSED_OBLIGATIONS_MET. CBR does not recalculate the amortization schedule and does not start a delinquency flow; a CBR on a CLOSED loan is rejected. This example shows that Credit Balance Refund reduces only the overpayment amount and that repeated refunds can close the loan when the credit balance reaches zero.

| Step | Transaction | Refund amount | Overpayment before | Overpayment after | Loan status |
| --- | --- | --- | --- | --- | --- |
| 1 | Overpayment recorded | - | 100.00 | 100.00 | OVERPAID |
| 2 | Credit Balance Refund #1 | 60.00 | 100.00 | 40.00 | OVERPAID |
| 3 | Credit Balance Refund #2 | 40.00 | 40.00 | 0.00 | CLOSED_OBLIGATIONS_MET |

A working capital loan is ACTIVE DELINQUENT with principal outstanding of 500.00 and deferred income of 100.00. A non-fraud charge-off of 500.00 is posted as a non-monetary transaction, so the loan balance does not change; the status moves to CHARGED_OFF and the deferred income is amortized in one entry. A reversal of the charge-off, completed in error with no intervening transactions, restores the amortization and schedule. A second charge-off or a charge-off dated before the last monetary transaction is rejected. This example shows that charge-off is an accounting classification with no balance impact, and that its reversal restores prior amortization when no later transactions exist.

| Step | Event | Transaction type | Principal balance | Status | Deferred income |
| --- | --- | --- | --- | --- | --- |
| 1 | Delinquency identified | - | 500.00 | ACTIVE DELINQUENT | 100.00 |
| 2 | Charge-off (non-fraud) | Non-monetary | 500.00 | CHARGED_OFF | 0.00 |
| 3 | Undo charge-off | Reversal | 500.00 | ACTIVE DELINQUENT | 100.00 |

See also: [Delinquency Restrictions](confluence-link:Delinquency%20Restrictions), [Breach Management](confluence-link:Breach%20Management), [Batch Jobs](confluence-link:Batch%20Jobs), [Accounting](confluence-link:Accounting), [Projected Balances](confluence-link:Projected%20Balances), [Collections Programs](confluence-link:Collections%20Programs).
