# Charge-Off: Immediate Due of Future Balances

This page documents the enhanced charge-off behavior where, on the date a loan is charged-off, all future balances on the loan become due immediately. The change verifies that the full loan balance is collectible as of the charge-off date and that interest accrual stops from the day after charge-off. It also describes the updated workflow, supported constraints, and the accounting implications that operations staff must understand to execute and reconcile charge-off events consistently.

---------------------------------------------------------------------

## What changed and why it matters to daily operations

Previously, when a loan was charged-off, the system accelerated the recognition of losses but did not necessarily accelerate every future cash flow on the loan to be due immediately. The enhancement standardizes the treatment so that the entire remaining balance, including any future principal, interest, fees, and penalties that would have become due after the charge-off date, is treated as due on the charge-off date itself. This change matters in day-to-day collections, reconciliations, and reporting because:

- The customer-facing balance and the ledger reflect a single, definitive due amount at charge-off, reducing ambiguity about what remains collectible.
- Accrual of interest stops from the day after charge-off, simplifying post-charge-off accounting and avoidance of phantom accrued interest on future periods.
- Any backdated repayments or reversals trigger a reverse-replay of the charge-off and associated transactions to preserve correct balances and income/loss recognition.
- The rule that charge-off cannot occur on a future date remains in effect; the charge-off date must be a date that is not later than the latest transaction on the loan account.

---------------------------------------------------------------------

## Core concepts and rules

- Immediate due of future balances on charge-off: When a charge-off is processed, the system marks all remaining scheduled cash flows as due immediately. This includes portions of the balance that would have become due in later periods.
- Charge-off date validity: The charge-off date must be on or after the most recent transaction date on the loan account and cannot be a future date relative to the system’s current business date.
- Interest timing: Interest is calculated up to the charge-off date as the charge-off interest portion. Interest accrual stops from the day after the charge-off date; no further accrual occurs for days beyond the charge-off date.
- N+1 installments: The existence of one or more installments after the charge-off date does not affect the charge-off mechanics; those future installments are accelerated into immediate due amounts.
- Reversals and backdating: Backdated repayments and reversals trigger reverse-replay of all transactions and the charge-off event to verify that the loan’s ledger and income/expense impacts reflect the updated sequence of events.
- Optional maturity acceleration: Accelerate maturity is available for interest-bearing, progressive loan products. For non-interest-bearing, progressive products, the option is described as optional.

These rules are implemented to follows the principle that the full loan balance should be recoverable as of the charge-off date and that future accruals cease once the charge-off has occurred.

---------------------------------------------------------------------

## Updated workflow (UI-driven procedures)
If you are performing a charge-off in the system, follow these steps to apply the enhancement and record the event consistently:

1) Open the customer loan account and navigate to the Charge-off workflow area (Charge-off balances > Charge-Off).
2) Choose the standard loan and select the charge-off action. Confirm that the charge-off type is intended to accelerate all future balances.
3) Enter the charge-off date. The date must be on or after the most recent transaction date on the loan and must not be a future date relative to the system date.
4) Review the calculated results presented by the system, including:
 - The amount due on the charge-off date (outstanding principal plus accrued interest up to that date).
 - The set of future balances that will be accelerated to due immediately (principal, interest, fees, penalties).
 - The instruction that interest accrual stops on the day after the charge-off date.
5) Confirm the action. The system posts the charge-off event, adjusts the loan balance to reflect immediate due amounts, and stops further interest accrual after the charge-off date.
6) Validate reconciliations: verify that the opening balance equals the prior period’s closing balance and that total due equals the sum of accelerated future balances plus accrued interest up to the charge-off date.
7) If there are backdated repayments or reversals after the charge-off, trigger the reverse-replay process so that all affected transactions and the charge-off are re-flagged and balances updated .
8) Complete any required post-charge-off tasks (notifications, reporting, and any required journal postings) per institutional procedures.

Notes:
- The workflow is designed to verify that the charge-off event is the authoritative trigger for accelerating future cash flows and for stopping post-date accrual.
- The exact user interface presentation may vary by release, but the core steps and validation points described above are the verified behavior.

---------------------------------------------------------------------

## Calculations and financial implications

Principles and inputs used in charge-off calculations:
- Interest rate and day-count conventions: The charge-off calculation uses the loan’s interest rate and the institution’s standard day-count conventions as verified in the reference scenarios. In the documented scenarios, interest accrues until the charge-off date, and accrual stops from the day after charge-off.
- Components of the charge-off amount: The charge-off amount comprises the outstanding principal as of the charge-off date plus the accrued interest up to that date. All remaining future cash flows (future principal, future interest, fees, and penalties) are accelerated to become due immediately as of the charge-off date.
- Balances and consistency: The period-by-period opening balance for a given period equals the preceding period’s closing balance, preserved to maintain financial integrity. Reconciliations require that remaining cash, outstanding balance, and charge-off totals reconcile after the event.
- Rounding: Where rounding is needed, the system applies the evidenced rounding conventions captured in the reference data (e.g., HALF_UP or HALF_EVEN as described in the calculations). All intermediate values, balances, and totals are presented with the verified precision from the implemented logic.

Calculation outline (conceptual, without prescribing specific numbers):
- Step 1: Determine charge-off date t_co. Validate that t_co is not in the future and is the latest transaction date on the loan account.
- Step 2: Compute accrued interest I_co from the last interest accrual date up to t_co, using the loan’s rate and day-count conventions.
- Step 3: Determine the outstanding principal P_co as of t_co.
- Step 4: Calculate the amount due on t_co as follows:
 - Amount_due_at_co = P_co + I_co + any outstanding fees/penalties due as of t_co
- Step 5: Accelerate all future cash flows after t_co to be due immediately. The system sets the due balance to include all remaining scheduled principal, interest, fees, and penalties that would have occurred after t_co, but stops all further interest accrual after t_co.
- Step 6: Post accounting entries consistent with the accelerated balance and the stop of accrual (see Accounting implications).

Illustrative note (structure only):
- Original schedule shows the loan balance, each installment’s principal and interest, and how the balance evolves with each payment. On charge-off, the future installments are treated as due immediately, and interest accrual is halted after the charge-off date. The resulting reconciled figures should show that a single charge-off event is the sole driver of the new due balance, and that the balance balance-open equals the prior closing balance, verifying financial integrity.

---------------------------------------------------------------------

## Accounting and reconciliation implications

When a charge-off with immediate due of future balances is processed, the system performs the following high-level accounting treatments:
- Recognize loss related to the uncollected portion of the loan: the portion of the outstanding principal and related items that will not be collected as a result of the charge-off is recognized as a loss in the income statement and reduces the Loans Receivable balance .
- Recognize the accrued interest up to the charge-off date as part of the charge-off impact: interest earned up to t_co is recognized as part of the charge-off expense, and any unearned interest beyond t_co is not subsequently recognized.
- Reverse post-charge-off interest income for the portion no longer earned: interest income that would have been recorded after the charge-off date is reversed as part of the charge-off process.
- Present a single, accelerated due balance: following the charge-off, the system shows a due amount that includes all remaining future cash flows that would have been collectible, and no further accrual occurs beyond t_co.
- Backdated repayments and reversals: if a repayment or reversal is backdated after charge-off, the system triggers a reverse-replay of all transactions associated with the loan, including the charge-off, to maintain internal consistency and proper income/expense recognition.

If you need the precise journal entries mapped to your chart of accounts, the system will generate the postings to reflect:
- Loss on charge-off against the Loans Receivable balance
- Reversal or adjustment of previously recognized Interest Income and related receivables
- Movement of the accelerated future balances into the current due amounts for collections

Note on transparency and reconciliation:
- The integrity requirements verify that each period’s opening balance equals the prior period’s closing balance, and that allocations reconcile to the total transaction amount. All running totals, intermediate calculations, and final balances are subject to the defined rounding conventions and day-count rules.

---------------------------------------------------------------------

## Migration, training, and operational considerations

- Training and user guidance: Operations staff should be trained on the updated charge-off workflow, including the requirement that the charge-off date cannot be in the future and must reflect the latest transaction on the loan account. Staff should be aware that all future balances will be accelerated to due immediately on charge-off.
- Reconciliation practices: After charge-off, reconciliations should reflect that the accrued interest stops after the charge-off date and that the accelerated future balances have been posted as due immediately. Any backdated repayments or reversals will trigger reverse-replay of the charge-off to maintain accurate balances and income recognition.
- Reporting implications: Reports that show outstanding balance, recoverable amount, and charge-off totals must reflect the immediate-due treatment and the cessation of accrual from the charge-off date.
- Compatibility and scope: The enhancement applies to charge-off scenarios where future balances would otherwise be outstanding after the charge-off date. It is designed to integrate with the existing charge-off workflow and does not require a separate, separate data migration path beyond standard training and process updates.

---------------------------------------------------------------------

## Glossary of key terms

- Charge-off date: The date on which a loan is deemed uncollectible and all future balances become due immediately. Interest accrual stops after the day following this date.
- Immediate due of future balances: The process by which all remaining scheduled cash flows (principal, interest, fees, penalties) are accelerated and become due on the charge-off date.
- Accrued interest up to charge-off: Interest that would have been earned from the start of the current accrual period up to the charge-off date.
- Reversal and reverse-replay: If a repayment or other transaction is rolled back after charge-off, the system reprocesses the sequence of events to verify the balances and income impact reflect the corrected order of transactions.

---------------------------------------------------------------------

## Quick reference: verification checks for integrity
- Opening balance for the period equals the previous period’s closing balance.
- The sum of the accelerated future balances plus the outstanding balance as of the charge-off date equals the total charge-off amount.
- Interest accrual stops on the day after the charge-off date and is not accrued in subsequent periods.
- All backdated repayments or reversals trigger reverse-replay of the charge-off and related transactions to preserve balance correctness.

If you require additional detail on the exact journal postings or mappings to your organization’s GL accounts, refer to your internal accounting procedures for charge-off events, which describe the general intent and structure of the postings without exposing internal system identifiers.

--------------------------------------------------------------------------------

This document presents the verified, operationally actionable behavior for Charge-Off: Immediate Due of Future Balances. It explains what changes, why they matter to day-to-day operations, how to execute the workflow, and how the resulting financial effects are reflected in balances and reconciliations.