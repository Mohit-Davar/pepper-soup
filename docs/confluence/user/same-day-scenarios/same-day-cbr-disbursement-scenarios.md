<!-- Labels: user, same-day-scenarios -->
# Same day CBR/Disbursement Scenarios

This page documents verified behaviors for same-day Credit Balance Refund (CBR), chargeback, and disbursement on overpaid loans. It describes how CBRs interact with overpayments, how disbursements on overpaid loans affect outstanding balances and loan status, and how chargebacks are handled in these scenarios. The guidance reflects the operational rules and observed outcomes from the reference calculations and specification materials. It is written for operations staff, loan officers, branch managers, and credit agents who manage loan servicing on the same day.

### Core concepts and rules

- An overpaid loan is one whose repayment activity has produced a positive overpayment amount while the loan balance remains, or becomes, zero. When a repayment causes the loan to move to OVERPAID, the outstanding balance is 0 and the overpaid amount reflects the excess paid.
- Credit Balance Refund (CBR): a credit-type transaction used to refund an overpaid amount to the customer. A CBR can only be performed on loans that are in the OVERPAID status. The CBR amount must not exceed the current overpaid amount on the loan.
 - If the CBR amount equals the current overpayment while the loan is OVERPAID, the loan moves to CLOSED (OBLIGATIONS MET) with outstanding 0 and overpaid 0.
 - If the CBR amount is less than the overpaid amount, the loan remains in OVERPAID status and the overpaid amount decreases . The GL entries reflect a debit to the Overpayment account for the CBR amount.
 - If the CBR amount would be higher than the overpayment after reprocessing, the outstanding principal of the actual installment is increased by the full CBR amount and the overpayment amount is allocated as repayment (for principal). On the repayment schedule, the full CBR appears as a credit to principal.
- Disbursement on an overpaid loan: Disbursement transactions can occur on ACTIVE, OVERPAID, or CLOSED (OBLIGATIONS MET) loans. The mechanism allocates the disbursement such that the overpayment is reduced by a portion allocated to repayment, and the remaining portion increases the outstanding principal of the current installment. In effect, the disbursement is split between repayment of the overpayment and the installation principal, with the exact split depending on the scenario.
- Chargeback on an overpaid loan: A chargeback transaction undoes or reweights a prior repayment or refund. The rules describe how chargeback interacts with the overpayment and the repayment schedule, including behavior before and after maturity and, in later releases, enhanced allocation across principal, fees, and penalties.
- Release 1.10 enhancements (chargeback handling): Chargeback now supports allocating not only principal but also fee or penalty, based on the target repayment’s composition. Allocation can be configured when the repayment strategy uses Advanced payment allocation, enabling a priority order for chargeback distribution among principal, fee, and penalty.

### Credit Balance Refund (CBR) on overpaid loans

#### Situation #1: Partial CBR applied on overpaid loan
GIVEN a loan is ACTIVE with an outstanding balance of 50
WHEN a repayment of 100 occurs
THEN the loan moves to OVERPAID, with outstanding 0 and overpaid

50. The Overpayment GL is credited by 50.
WHEN a CBR occurs with amount 25
THEN the loan remains OVERPAID, outstanding 0, and overpaid

25. The Overpayment GL is debited by 25.

Interpretation: The repayment of 100 first exhausted the outstanding balance (50) and created an overpayment of

50. A partial CBR of 25 reduces the overpaid amount to 25, without changing the status from OVERPAID. The accounting reflects a 50 credit to the Overpayment liability on the repayment and a 25 debit to the Overpayment liability on the CBR.

#### Situation #2: Full CBR applied on overpaid loan
GIVEN a loan is ACTIVE with an outstanding balance of 50
WHEN a repayment of 100 occurs
THEN the loan goes ACTIVE → OVERPAID with outstanding 0 and overpaid 50 (same as Situation #1).
WHEN a CBR occurs with amount 50
THEN the loan goes from OVERPAID to CLOSED (OBLIGATIONS MET) with outstanding 0 and overpaid

0. The Overpayment GL is debited by 50.

Interpretation: A full CBR equal to the current overpayment clears the overpaid balance and transitions the loan to a closed state, reflecting that obligations have been met for the period. The journal entry reduces the overpayment balance by the full CBR amount.

#### Situation #3: Full CBR applied on overpaid loan, with backdated transaction affecting overpayment
GIVEN a loan is ACTIVE with an outstanding balance of 50
WHEN repayments occur of 25 (first) and 75 (second)
THEN after the first repayment, the loan remains ACTIVE with outstanding 25 and overpaid 50.
THEN after the second repayment, the loan moves to OVERPAID with outstanding 0 and overpaid 50.
WHEN a CBR occurs with amount 50
THEN the loan moves from OVERPAID to CLOSED (OBLIGATIONS MET) with outstanding 0 and overpaid 0, and the Overpayment GL is debited by 50.

Interpretation: In this scenario, backdating and reprocessing lead to a later overall overpayment of 50 prior to the CBR. The CBR of 50 clears the overpayment, transitioning the loan to closed status. If a prior repayment was reverted and reprocessed, the earlier GL entries would be reversed as needed and the CBR recognized against the current repayment schedule.

#### Calculation reference: CBR behavior (summary of outcomes)
- CBR amount cannot exceed current overpaid amount on the loan.
- If CBR equals the overpaid amount while the loan is OVERPAID, the loan becomes CLOSED with 0 outstanding and 0 overpaid.
- If CBR is less than the overpaid amount, the loan remains OVERPAID and the overpaid amount decreases by the CBR amount.
- If a CBR amount is larger than the overpaid amount after reprocessing, the outstanding principal increases by the full CBR amount and the overpayment is allocated as repayment to principal.

### Chargeback on overpaid loans

#### Situation #1: Partial Chargeback applied on overpaid loan
GIVEN a loan is ACTIVE with an outstanding balance of 50
WHEN a repayment of 100 occurs
THEN the loan becomes OVERPAID with outstanding 0 and overpaid 50, and the Overpayment GL is credited by 50.
WHEN a Chargeback for the 1st repayment occurs with amount 25
THEN the loan remains OVERPAID, outstanding 0, overpaid 25; the Overpayment GL is debited by 25.

#### Situation #2: Full Chargeback applied on overpaid loan
GIVEN a loan is ACTIVE with an outstanding balance of 50
WHEN a repayment of 100 occurs
THEN the loan becomes OVERPAID with outstanding 0 and overpaid 50, and the Overpayment GL is credited by 50.
WHEN a Chargeback for the 1st repayment occurs with amount 50
THEN the loan moves from OVERPAID to CLOSED (OBLIGATIONS MET) with outstanding 0 and overpaid 0; the Overpayment GL is debited by 50.

#### Situation #3: Chargeback on overpaid loan with backdated effects
GIVEN a loan is ACTIVE with an outstanding balance of 50
WHEN repayments occur of 25 and 75 (in sequence)
THEN after the first repayment, the loan is ACTIVE with outstanding 25 and overpaid 50; after the second repayment, the loan becomes OVERPAID with outstanding 0 and overpaid 50.
WHEN a Chargeback for the 2nd repayment occurs with amount 50
THEN the loan moves from OVERPAID to CLOSED (OBLIGATIONS MET) with outstanding 0 and overpaid 0, and the Overpayment GL is debited by 50.

#### New, enhanced Chargeback handling (release 1.10)
- The Chargeback transaction can now credit not only principal but also fee or penalty, allocated according to the target repayment’s composition.
- When the Repayment strategy uses Advanced payment allocation, the chargeback amount can be allocated to principal, fee, and penalty following a configured priority order.
- If the target repayment included fee and/or penalty with the principal, the same fee and/or penalty types are created during the Chargeback in parallel with principal adjustments.

#### Situation #4: Enhanced allocation (example, release 1.10)
GIVEN a loan ACTIVE with outstanding 50 and a Chargeback credit allocation order configured to prioritize FEE, PENALTY, PRINCIPAL
WHEN a repayment of 25 occurs
THEN the loan remains ACTIVE with outstanding 25
WHEN a repayment of 75 occurs and pays 65 principal and 10 fee
THEN the loan becomes OVERPAID with outstanding 0 and overpaid 50
WHEN a Chargeback for the 2nd repayment occurs with amount 50
THEN the loan becomes CLOSED with overpaid 0; the Overpayment GL is debited by 50; no new fee was created in this scenario because the chargeback fully offset the overpayment without requiring a new fee entry
WHEN the 1st repayment is reverted and reprocessed
THEN the system reworks the repayment and chargeback , restoring the expected OVERPAID/ACTIVE states and reflecting the correct allocation on the repayment schedule (including any fee and principal splits) as defined by the enhanced allocation rules.

### Disbursement on overpaid loan

#### Situation #1: Disbursement amount is lower than the overpayment amount
GIVEN a loan ACTIVE with outstanding balance 50
WHEN a repayment of 100 occurs
THEN the loan becomes OVERPAID with outstanding 0 and overpaid 50; Overpayment GL is credited by 50.
WHEN a Disbursement of 25 occurs
THEN the loan remains OVERPAID; outstanding 0; overpaid 25 (the full disbursement is split between installments and the overpayment is allocated as repayment). The Overpayment GL is debited by 25.

#### Situation #2: Disbursement amount equals the overpayment amount
GIVEN a loan ACTIVE with outstanding balance 50
WHEN a repayment of 100 occurs
THEN the loan becomes OVERPAID with outstanding 0 and overpaid 50; Overpayment GL is credited by 50.
WHEN a Disbursement of 50 occurs
THEN the loan moves from OVERPAID to CLOSED (OBLIGATIONS MET) with outstanding 0 and overpaid 0; the full Disbursement amount is split between the installments and the overpayment is allocated as repayment. The Overpayment GL is debited by 50.

#### Situation #3: Disbursement amount is higher than the overpayment amount
GIVEN a loan ACTIVE with outstanding balance 50
WHEN a repayment of 25 occurs
THEN the loan remains ACTIVE with outstanding 25
WHEN a repayment of 75 occurs
THEN the loan becomes OVERPAID with outstanding 0 and overpaid 50
WHEN a Disbursement of 75 occurs
THEN the loan moves from OVERPAID to ACTIVE with outstanding 25 and overpaid 0 (full Disbursement is split between installments and overpayment as repayment)
The Overpayment GL is debited by 25.

> Note on allocation behavior: In these same-day scenarios, disbursement is split between repayment of the overpayment (reducing overpaid amount) and increasing the current installment’s outstanding principal. The resulting loan status transitions and the remaining overpayment are captured by the displayed balances and the associated GL postings.

### Calculation references (verified patterns)
The reference specifications include detailed ledger-style records and repayment schedules for the scenarios above. Where calculations are shown, they adhere to the confirmed outcomes described in the scenarios and reflect the following principles:
- Opening balances must reconcile to the prior period’s closing balances.
- Allocation between principal repayment and installment principal follows the observed outcomes in the scenario descriptions.
- Rounding and currency precision follow the institution’s standards as evidenced in the reference data.
- Journal entries balance when debit and credit data are present in the instance records.
- When numerical is insufficient to derive a general rule, the narrative description of the verified behavior is provided instead.

<div class="calc-box">
 <div class="calc-title">Calculation</div>
 <div class="calc-step"><strong>Scenario:</strong> Situation #1 — Partial CBR on overpaid loan</div>
 <div class="calc-step"><strong>Starting position:</strong> ACTIVE loan with outstanding 50; repayment of 100 creates overpayment 50.</div>
 <div class="calc-step"><strong>Inputs:</strong> CBR amount 25; Overpaid amount before CBR: 50.</div>
 <div class="calc-step"><strong>Process:</strong> CBR reduces overpayment by 25; loan remains OVERPAID.</div>
 <div class="calc-step calc-result"><strong>Outcome:</strong> Outstanding 0; Overpaid 25; Overpayment GL debited by 25.</div>
</div>

<div class="calc-box">
 <div class="calc-title">Calculation</div>
 <div class="calc-step"><strong>Scenario:</strong> Situation #2 — Full CBR on overpaid loan</div>
 <div class="calc-step"><strong>Starting position:</strong> OVERPAID with outstanding 0 and overpaid 50 after repayment of 100.</div>
 <div class="calc-step"><strong>Inputs:</strong> CBR amount 50.</div>
 <div class="calc-step"><strong>Process:</strong> CBR reduces overpayment to 0; loan becomes CLOSED (OBLIGATIONS MET).</div>
 <div class="calc-step calc-result"><strong>Outcome:</strong> Outstanding 0; Overpaid 0; Overpayment GL debited by 50.</div>
</div>

<div class="calc-box">
 <div class="calc-title">Calculation</div>
 <div class="calc-step"><strong>Scenario:</strong> Situation #3 — CBR after backdated changes (partial overpayments before CBR)</div>
 <div class="calc-step"><strong>Starting position:</strong> ACTIVE loan; after repayments 25 then 75, overpaid 50 and outstanding 0 leading to OVERPAID with 0 outstanding after the second repayment.</div>
 <div class="calc-step"><strong>Inputs:</strong> CBR amount 50.</div>
 <div class="calc-step"><strong>Process:</strong> CBR clears the overpaid balance; loan transitions to CLOSED (OBLIGATIONS MET); any backdating adjustments are reconciled in the repayment schedule as described in the reference behavior.</div>
 <div class="calc-step calc-result"><strong>Outcome:</strong> Outstanding 0; Overpaid 0; Overpayment GL debited by 50.</div>
</div>

### Operational guidance and post-conditions

- After any same-day CBR, disbursement, or chargeback operation, verify the loan's new status, outstanding balance, and overpaid amount against the expected outcomes from the scenarios above. The visible outcomes to the borrower will reflect updated loan status and balances on the customer-facing loan page.
- verify that any GL postings shown in the system follows the described credits and debits for Overpayment Liability, Fund Source, and any other relevant accounts referenced by the transaction types. Where multiple allocations occur (for example, chargebacks that split between principal and fees), confirm the resulting schedule shows the correct principal, interest, and fee allocations.
- If backdating was performed and reprocessing occurred, confirm that repayment schedule entries reflect the recovered or reallocated amounts and that the associated GL reversals () have been posted.
- If a CBR or Chargeback results in a status change (for example, OVERPAID to CLOSED), record the date of the status transition and verify that the repayment schedule is updated to reflect no remaining due balance.

### Summary for quick reference
- CBR can only be used on OVERPAID loans and cannot exceed the current overpaid amount.
- Partial CBR reduces the overpaid amount; full CBR on an OVERPAID loan closes the loan.
- Disbursement on an overpaid loan splits into repayment of the overpaid amount and an increase in the current installment’s principal; results in a new balance of outstanding and overpaid depending on the relative sizes.
- Chargebacks on overpaid loans can partially or fully reverse a repayment/refund, with behavior defined for before/after maturity and, in release 1.10, enhanced allocation across principal, fee, and penalty.
- All scenarios have clearly defined outcomes for loan status, outstanding balance, overpaid amount, and GL postings.

If you need a compact, scenario-specific checklist or a printable workflow for branch-level use, specify which scenarios you would like captured for quick-reference cards.