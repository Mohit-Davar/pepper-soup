# Pause Delinquency

Pause Delinquency is a feature that allows loan servicing staff to temporarily suspend the delinquency calculation for a loan for a defined period. When active, the system will refrain from reclassifying delinquency buckets for the loan and will preserve the current bucket state. The feature applies to both loan-level delinquency (the loan’s overall delinquency state) and installment-level delinquency (the status of individual installments) and is tracked as a loan-level pause with a start date and an end date. The pause state is observable to users and is emitted as events when the pause state changes. The capability is available to users who manage and service loans, including operations staff, loan officers, branch managers, and credit agents.

### What the feature does and why it matters

- The Pause Delinquency function temporarily halts the evaluation of delinquency buckets for a loan account. During the pause period, the existing delinquency bucket assignments for each installment are retained and are not recalculated by the ongoing delinquency process.
- The feature is designed to help customers during temporary circumstances (for example, administrative interruptions, holidays, or other approved pauses) while so that the loan’s delinquency posture can be resumed later without erasing prior history.
- On pause, the system will continue to reflect the existing bucket configuration if a delinquency state exists, but no new bucket transitions are performed until the pause is lifted.
- If a delinquent amount is paid in full while the delinquency is paused, the loan’s delinquent state or tag can be removed, even though the pause is still in effect. The underlying bucket assignment remains as configured until the pause ends and normal evaluation resumes.

### Core concepts and data relationships

- Pause action and history: A pause (action = PAUSE) is stored per loan in a dedicated history table, including a start date and optional end date. The action history tracks the pause period and is the basis for calculating effective pauses during subsequent delinquency evaluations.
- Active pause indicator on the loan: A boolean flag on the loan (delinquencyCalculationPaused) indicates whether delinquency calculations are currently paused. This flag is true when the current business date falls within an active pause period; otherwise it is false.
- Pause period visibility: The loan record stores the start date and end date of the current or most recent pause period (delinquencyPausePeriodStartDate and delinquencyPausePeriodEndDate) so users can view when the pause started and when it ends.
- Events: When the pause state changes (paused or resumed), events are emitted to signal the updated delinquency calculation state.
- Calculation effect: The delinquency calculation you see after a pause ends will take into account the duration of the pause period in determining the effective delinquency on the day calculation resumes.

### How to observe paused state on a loan

- While viewing a loan, look for the delinquency pause indicators on the loan screen: the flag that indicates whether delinquency calculation is paused, and the start/end dates of the current pause period.
- If a pause is active, the system will not reclassify installments into new delinquency buckets until the pause ends.
- Once the pause ends, the delinquency engine resumes, and the calculation will consider the duration of the pause when determining current delinquency levels.

### When and how the pause is created or resumed

- Pause creation: A user with access to loan delinquency settings can establish a new pause by selecting a loan and choosing a pause action with a start date (which may be today or later) and an end date. Pause must last at least one day (end date strictly after start date).
- Pause constraints and validation: Pause is permitted only for active loans. Overlapping pause periods for the same loan are not allowed. Pause can start today or later.
- Pause duration and behavior: The pause period is defined by the start and end dates; during this period, delinquency calculations are suppressed for the loan. The bucket values for installments are preserved and will be recalculated when the pause ends.
- Resume action: To end a pause, a resume action is issued. The resume date is the current business date, and the resume action does not include an end date. The system will then resume normal delinquency evaluation and apply the duration of the pause to future calculations as the period has lapsed.

> Note: The pause feature is designed to be a loan-level configuration that controls whether delinquency recalculation should run. It does not permanently delete historical delinquency states; it temporarily halts progression and then resumes with the original bucket configuration once the pause period completes.

### How the system calculates delinquency during and after a pause

The calculation for effective delinquency uses the following concept and formula:

<div class="calc-box">
 <div class="calc-title">Calculation</div>
 <div class="calc-step"><strong>Formula:</strong> delinquency = currentDate - unpaidInstallmentDate - sum(relevantPauseDays)</div>
 <div class="calc-step"><strong>Substitution principle:</strong> For each installment, identify the period(s) during which a pause applies and sum the days of pause that overlap with the installment’s overdue window. The current date minus the unpaid date of the installment, reduced by the total relevant pause days, yields the effective delinquency period for bucket assignment.</div>
 <div class="calc-step calc-result"><strong>Result:</strong> The effective delinquency for an installment takes into account the time the delinquency calculation was paused, thereby delaying bucket progression while the pause is active. When the pause ends, normal progression resumes using the accumulated pause duration as part of the calculation window.</div>
</div>

This approach verifies that the pause period is treated as a temporary adjustment to the delinquency timeline rather than a change to historical buckets.

### Worked examples: Pause days calculation (v2)

The reference calculations for Pause Days Calculation (v2) provide concrete scenarios that illustrate how the pause period interacts with repayment schedules and delinquency progression. The base repayment schedule used in these scenarios is shown below for reference.

<div class="calc-box">
 <div class="calc-title">Repayment Schedule (reference)</div>
 <div class="calc-step">Installment Date | Principal | DP Principal | Interest | Fees | EMI | Due | Paid</div>
 <div class="calc-step">1/1/22 | 1000 | | | | | | </div>
 <div class="calc-step">1/1/22 | - | 250.00 | - | - | 250.00 | 250.00 | -</div>
 <div class="calc-step">1/15/22 | 250.00 | | | 50.00 | 300.00 | 300.00 | -</div>
 <div class="calc-step">1/30/22 | 250.00 | | | - | 250.00 | 250.00 | -</div>
 <div class="calc-step">2/14/22 | 250.00 | | | - | 250.00 | 250.00 | -</div>
</div>

#### Scenario 1: Pause days 02-01-2022 to 20-01-2022

- Total Pause days calculation shows how the pause window affects each installment's delinquency timing.

| As On Date | Installment 1 | Installment 2 | loan pause flag |
| :--- | :---: | :---: | :---: |
| 1/2/22 | 1 | -13 | TRUE |
| 1/3/22 | 1 | -12 | TRUE |
| 1/10/22 | 1 | -5 | TRUE |
| 1/18/22 | 1 | 0 | TRUE |
| 2/2/22 | 14 | 13 | FALSE |
| 3/5/22 | 45 | 44 | FALSE |

The table shows the evolving view of Installment 1 and Installment 2 across relevant dates, with the loan pause flag indicating whether the pause window is active for that date.

> The above values are excerpts from the Pause Days Calculation v2 reference for Scenario 1 and illustrate how the pause window delays delinquency progression while active and how progression resumes after the pause ends.

#### Scenario 2, Scenario 3, and Scenario 4 (high-level summaries)

- Scenario 2: Pause days 15-01-2022 to 14-02-2022. The reference progression shows sections where the loan pause flag is FALSE for some early dates and TRUE for later dates as the pause window interacts with installment overdue dates, with the Installment 1, Installment 2, and Installment 3 values adjusting when the pause is in effect.
- Scenario 3: Pause -1 and Pause -2 illustrate multiple pause segments interleaved with installments, demonstrating how re-application of pauses affects the calculation as the system merges pause and resume periods to determine effective paused durations.
- Scenario 4: Pause days 01-01-2022 to 02-01-2022 shows a different pattern of the pause flag and installment progress across the repayment schedule, reinforcing the rule that when a pause is active, the delinquency evaluation is suspended, and when the pause ends, normal evaluation resumes.

The full, exact values for Scenarios 2 through 4 are documented in the reference calculations and shown in the Pause Days Calculation v2 sheets. The intent here is to demonstrate how pause periods alter the calculation window and the resulting postponement of delinquency bucket transitions.

### Validation rules and edge cases

- Pause can start today or a future date and must last at least one day (end date must be after start date).
- Pause applies only to active loan accounts.
- Overlapping pause periods for the same loan are not allowed.
- Resume can only occur when there is an active pause; the resume date is the current business date, and end_date should not be supplied for a resume action.
- The delinquency calculation pause is visible on the loan as a boolean flag (delinquencyCalculationPaused) and as the pause period (delinquencyPausePeriodStartDate, delinquencyPausePeriodEndDate).
- When a loan is paused, the system does not re-evaluate or reclassify installments; the existing bucket configuration remains until the pause ends.
- If a delinquent amount is paid in full while paused, the system will remove any delinquent state or tag, even though the pause remains in effect.
- Delinquency events are emitted when the eligibility or state of the delinquency calculation changes.

### What happens after a pause ends

- Delinquency calculation resumes on the business date following the end date of the pause (or on the end date if the system is designed to evaluate on that date).
- The calculation takes into account the duration of the pause, verifying the effective delinquency window reflects the actual time the calculation was paused.
- Buckets are updated only as part of the normal delinquency process after the pause ends; there is no retroactive change to bucket history beyond what the standard delinquency progression would produce.

### Related concepts and governance

- The feature is implemented as loan-level configuration and is represented in the loan’s data model, including the paused state and the associated start and end dates.
- A new loan-delinquency-action record is created for pause events, documenting the loan_id, the action type (pause), and the effective start and end dates.
- When the status of the pause changes, events are emitted to reflect the updated delinquency calculation state for the loan.

### Summary for operators

Pause Delinquency provides a controlled, auditable way to temporarily halt delinquency evaluation for a loan. It preserves the current bucket assignments during the pause and resumes normal processing after the pause ends, taking the duration of the pause into account for the subsequent delinquency calculations. It is visible in the loan’s delinquency area, including the pause flag and the start/end of the pause period, and is accompanied by events to surface the state change to downstream consumers.

If you need to pause delinquency, select a loan, navigate to Delinquency Settings, choose Pause Delinquency, specify Start Date and End Date, and confirm. To end the pause, use the Resume action. Remember that overlapping pauses are not allowed and that pausing is intended to be a controlled, time-bound operation tied to an active loan.