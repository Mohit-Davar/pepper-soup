# Delinquency Restrictions

Delinquency restrictions apply to Working Capital loans, which use minimum payment ranges instead of installments. Delinquency tracking can be paused, reset, disabled, or rescheduled, and each action changes how the system evaluates the loan. Some actions are blocked while delinquency is disabled, and backdated changes are not permitted for several actions.

Configure delinquency at the loan account level with these parameters:

- Name of the delinquency configuration.
- Frequency, a positive integer representing the range interval.
- Frequency Type, the time unit of the range interval such as days, weeks, or months.
- Minimum payment amount type, either Percentage of loan amount or Flat amount.
- Minimum payment amount, which must be greater than zero.
- Minimum payment period and rule.
- Numeric value representing the range interval.

The following rules apply to delinquency pauses:

- A pause is created with a start date and an end date.
- The start date must be before the end date and cannot be before the first disbursement date.
- The pause is applied as of the current business date at initiation.
- Backdated pauses for delinquency evaluation are available from the UI.
- During the pause, the active and all future range periods are shifted forward by the pause duration.
- Resume is permitted only during an active pause period, between the configured pause start date and end date.
- Upon resume, the pause effective end date is updated to the resume date and the pause is considered terminated as of that date.
- After resumption, the system recalculates delinquency based on the revised shortened pause duration.

The following rules apply to delinquency reschedule:

- A delinquency range schedule must already be generated for the loan.
- The action changes the minimum payment amount and/or the frequency of the delinquency range schedule.
- Minimum payment can be a percentage amount calculated based on principal plus discount, or a flat amount provided by the user.
- All future periods not yet evaluated are deleted and regenerated with the new frequency and expected amount.
- Already evaluated periods where minimum payment criteria met is not null are not affected, and historical data is preserved.
- Evaluated periods are unchanged before and after reschedule and are preserved as-is.
- Changes affect only the future schedule from the current date.

The following rules apply to delinquency reset:

- A reset marks a delinquent Working Capital account as regularized once compliance is restored.
- The reset restarts delinquency monitoring cycles and stops further penal actions if applicable.
- Multiple resets are allowed over time, but only one reset per period is permitted.
- A validation message is shown if a user tries to reset a second time on the same delinquency period.
- All reset history is maintained and shown to help with undo or delete of the latest reset.
- Delinquency evaluation is reset effective only from the current system date; backdated resets are not permitted.
- A user can choose the optional option to start a new period from the reset date.

The following rules apply to delinquency disable:

- Delinquency disable is applied only as of the current date; backdated disable is not permitted.
- Once applied, delinquency evaluation is stopped for the account from the disable date onward.
- Delinquency disable is allowed only once until the current disable is reversed.
- Once delinquency is disabled, delinquency reschedule, reset, and pause are not allowed.
- Delinquency disable can be reversed or undone, and can be applied again as of the current date.
- When reversed, delinquency evaluation is re-triggered and recomputed as of the undo date.

The following restrictions apply to delinquency actions:

- Only a user with the specific delinquency reset permission, or a super user with all functions access, can perform a delinquency reset.
- Only a user with the specific permission "disable Delinquency" or with "all functions" can perform delinquency disable.
- Delinquency and breach evaluation are automatically disabled upon write-off.
- Only recovery payments are allowed on a written-off account.
- All actions must be auditable with proper user or system traceability.

The following rules apply to minimum payment evaluation:

- When the loan's remaining principal balance is lower than the computed minimum payment, the delinquency period's expected amount equals the remaining balance.
- A delinquency period where the expected amount equals the remaining balance is evaluated as minimum payment criteria met once the remaining balance is fully paid.
- The remaining balance as minimum payment rule applies both to product-configuration-based amounts and to reschedule-based amounts.

> **Note:** Delinquency grace days are used only at read time to compute a cosmetic delinquency start date; they are not applied in the delinquency evaluation path, so a loan is tagged delinquent as soon as the business date passes the period end date by even one day.

A working capital loan is disbursed on 1 April. The delinquency configuration adds five grace days to the first start date, uses monthly periods of thirty days, and sets a flat minimum payment of 100.00 for each of three periods. The figures are illustrative. The first period starts on the disbursement date plus the grace days, and each period ends thirty days later. Expected Amount is the flat minimum payment for the period, Paid Amount is the total received in that period, and Outstanding Amount is Expected Amount minus Paid Amount. The example shows that grace days shift only the first start date, each To Date is the period end, and Outstanding Amount falls as payments are recorded.

| Period | From | To | Expected | Paid | Outstanding | Delinquent days | Delinquent amount |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 6 Apr | 5 May | 100.00 | 0.00 | 100.00 | — | — |
| 2 | 6 May | 4 Jun | 100.00 | 40.00 | 60.00 | — | — |
| 3 | 5 Jun | 4 Jul | 100.00 | 100.00 | 0.00 | — | — |
| Total |  |  | 300.00 | 140.00 | 160.00 |  |  |

A delinquency pause suspends delinquency tracking for a working capital loan. Suppose a pause of thirty days is applied while the current period runs from 1 April to 30 April with an expected amount of 120.00 and nothing paid yet. The pause is applied as of the current business date, and the To Date of the active period and of every future non-evaluated period that overlaps or follows the pause start is shifted forward by the pause duration; From Dates stay as scheduled. A second pause whose window overlaps an active pause is rejected with an overlap error. When the pause is resumed, the pause end date is set to the resume date, the pause ends, and delinquency is recalculated over the shortened pause.

| Period | From | To before pause | Pause days | To after pause | Expected | Paid | Outstanding |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 Apr | 30 Apr | 30 | 30 May | 120.00 | 0.00 | 120.00 |
| 2 | 1 May | 30 May | 30 | 29 Jun | 120.00 | 0.00 | 120.00 |
| Total |  |  |  |  | 240.00 | 0.00 | 240.00 |

A delinquency period's Expected Amount cannot exceed what is still owed. If the remaining principal balance is 60.00 but the computed minimum payment for the period is 100.00, the Expected Amount is capped at the remaining balance, 60.00. This cap applies whether the amount comes from the product configuration or from a reschedule. Once the full 60.00 is paid, the period is evaluated as meeting the minimum-payment criteria. The example shows the remaining-balance cap and that paying the capped amount in full meets the minimum-payment criteria.

| Period | Remaining balance | Computed minimum | Expected | Paid | Outstanding |
| --- | --- | --- | --- | --- | --- |
| 1 | 60.00 | 100.00 | 60.00 | 60.00 | 0.00 |
| Total |  |  | 60.00 | 60.00 | 0.00 |

A reschedule changes the minimum payment amount or frequency for future periods only. Suppose a loan already has a generated range schedule and periods 1 and 2 are evaluated, so their history is preserved. On 1 July the minimum payment changes from a flat 100.00 to 5.00 percent of the approved principal of 1,000.00, which is 50.00 per period, keeping the monthly frequency. All future non-evaluated periods are deleted and regenerated with the new expected amount; evaluated periods keep their values. Evaluated periods are preserved unchanged, while future non-evaluated periods are regenerated with the new amount and frequency.

| Period | Status | Expected before | Expected after | Paid | Outstanding |
| --- | --- | --- | --- | --- | --- |
| 1 | Evaluated | 100.00 | 100.00 | 100.00 | 0.00 |
| 2 | Evaluated | 100.00 | 100.00 | 40.00 | 60.00 |
| 3 | Future | 100.00 | 50.00 | 0.00 | 50.00 |
| 4 | Future | 100.00 | 50.00 | 0.00 | 50.00 |
| Total |  | 400.00 | 300.00 | 140.00 | 160.00 |

See also: [Breach Management](breach-management.md), [Projected Balances](projected-balances.md).
