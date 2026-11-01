# Pause/resume interest accruals on a loan

This feature allows pausing interest accrual on eligible loans during user-specified holiday windows, with planned recomputation of subsequent accruals when the pause ends. The implementation targets progressive loans where recalculation of interest is enabled (recalculate interest = true). The behavior is expressed through the loan processing and accrual components in Pepper-Soup's loan domain. The reference material documents both the calculation framework and the safe-guards around pause timing, multiple pauses, backdating, and accounting implications for penalties and payoff scenarios. 

### Scope and module boundaries

- The pause/resume interest accrual capability operates within the loan calculation and accrual pathways for progressive loans. It assumes the broader loan lifecycle (originations, repayments, reschedule, payoff) remains governed by the standard progressive loan logic, with adjustments described here applied to interest accrual during pause windows. 
- The feature is described in terms of accrual calculation rules, pause intervals, and post-pause replays, rather than as a separate REST contract or external integration endpoint. No UI controls or external API contracts are introduced in the verified material. 
- The core rules and examples assume a 7% annual interest rate, a 360-day year, and 30-day month segments as used throughout the reference calculations. 

### Eligibility and constraints

- It is supported only for progressive loans with recalculation of interest enabled (recalculate interest = true).
- Pause intervals are defined by a start date and an end date. Start and end dates are inclusive for the purposes of interest pause calculation. End date cannot extend beyond the loan maturity date, and start date cannot be on or after the maturity date.
- A loan may have multiple pause intervals, but they must not overlap. Overlapping pauses are not permitted.
- During any pause interval, no interest accrues for the paused days; there will be no accrual postings for the pause dates themselves.
- The pause mechanism propagates to payoff, charge-off, and reschedule calculations in the same manner as other interest accrual calculations.
- Backdated start dates are allowed. If a pause starts on a backdated date and repayments occurred between the pause start and end, the schedule is recalculated by reversing and replaying those repayments. An accrual adjustment is performed if there is any difference in interest recognition caused by the backdated pause.
- Penalties and charges created on basis of interest may be reversed and replayed according to the new interest schedule; other charges or penalties are treated as described in the referenced acceptance criteria (charges created based on percentage interest are subject to reversal/replay when affected by the pause).

### Calculation framework and day-count conventions

The reference material specifies the following constants for accrual calculations and period-based scheduling:

- Interest rate: 7% per year
- Days in year: 360
- Days in month: 30
- Principal (example): 100
- Repayment cadence (example): every 1 month
- Per-period rate factor (monthly): 1.005833333 (which corresponds to 0.07/12 per period, or 7% annual rate translated to a 30-day period)
- Per-period interest for the initial balance of 100: 0.58 (which is 100 × 0.07/12)
- Balance progression follows EMI = 17.01 for the example, with principal and interest split as shown in the reference tables.

The reference calculations illustrate the standard pre-pause progression and the effects of a pause on the subsequent period. A concise summary of the pre-pause progression with a principal of 100 and a monthly EMI of 17.01 is:

- 1st period (start 1/1/24): Balance 100; Interest 0.58 (0.07/12 × 100); Principal 16.43; EMI 17.01; New balance 83.57.
- 2nd period (start 2/1/24): Balance 83.57; Interest 0.58; Principal 16.43; EMI 17.01; New balance 66.95 (example in the subsequent pause scenarios).

<div class="param-grid" aria-label="Calculation parameters">
 <div class="param-card"><span class="param-label">Principal</span><span class="param-value">100</span></div>
 <div class="param-card"><span class="param-label">Interest rate</span><span class="param-value">7% per year</span></div>
 <div class="param-card"><span class="param-label">Days in year</span><span class="param-value">360</span></div>
 <div class="param-card"><span class="param-label">Days in month</span><span class="param-value">30</span></div>
 <div class="param-card"><span class="param-label">Monthly factor</span><span class="param-value">1.005833333</span></div>
</div>

<div class="calc-box">
 <div class="calc-title">Calculation</div>
 <div class="calc-step"><strong>Formula:</strong> <code>Interest = Balance × (annual rate / 12)</code></div>
 <div class="calc-step"><strong>Substitution:</strong> <code>Interest = 100 × 0.07/12 = 0.58</code></div>
 <div class="calc-step calc-result"><strong>Result:</strong> <code>Interest = 0.58; Principal = EMI − Interest = 17.01 − 0.58 = 16.43; New balance = 100 − 16.43 = 83.57</code></div>
</div>

> Note: The per-period rate factor and the cadence assume 30-day fixed segments as reflected in the reference sheets (Days In year = 360, Days In month = 30). The actual implementation in a live deployment uses the configured day-count conventions for each loan product.

### Pause scenarios and observed outcomes (worked examples)

The reference material documents two illustrative pause scenarios, S1 and S2, to demonstrate calculation behavior and balance evolution around pauses.

- S1: Pause calculation within the same period
 - Pause window: Start 2/5/24, End 2/10/24 (5 days); Pause start and end are inclusive.
 - Pre-pause progression (before 2/5/24) follows the standard schedule: Balance on 2/1/24 is 83.57; EMI 17.01; Principal 16.43; Interest 0.58; New balance 83.57.
 - Pause effect: No interest accrues during 2/5/24–2/10/24; no accrual postings for these days.
 - Post-pause recalculation: On 3/1/24, Balance 66.95; EMI 17.01; Principal 16.62; Interest 0.34; New balance 50.33. The subsequent months continue with the updated balance and normal EMI allocations (4/1/24 balance 50.33; 5/1/24 balance 33.61; 6/1/24 balance 16.81; 7/1/24 balance 0.00).
 - Observed totals: The period after the pause shows a recalibrated principal portion (e.g., 16.62 in the 3/1/24 payment) and adjusted interest (0.34) for the resumed cycle.

- S2: Pause calculation between two periods
 - Pause window: Start 2/10/24, End 3/10/24 (29 days); Pause inclusive, spanning two calendar periods.
 - Pre-pause progression (before 2/10/24) mirrors the standard schedule: Balance on 2/1/24 is 83.57; EMI 17.01; Principal 16.43; Interest 0.58; Balance after 2/1/24 payment 83.57.
 - Pause effect: No interest accrues within the pause window; the balance remains at the level reached at the last payment prior to the pause.
 - Post-pause recalculation: On 3/1/24, Balance 66.95; EMI 17.01; Principal 16.62; Interest 0.34; Balance after payment 50.33. The remaining schedule continues with the updated balance (4/1/24 balance 50.33; 5/1/24 balance 33.61; 6/1/24 balance 16.81; 7/1/24 balance 0.00).

<div class="calc-box" aria-label="Pause within period results">
 <div class="calc-title">Pause within period - consolidated results</div>
 <div class="calc-step"><strong>Pre-pause balance (2/1/24):</strong> 83.57</div>
 <div class="calc-step"><strong>Pause period:</strong> 2/5/24 – 2/10/24 (5 days); no accrual</div>
 <div class="calc-step"><strong>Post-pause (3/1/24):</strong> Balance 66.95; EMI 17.01; Principal 16.62; Interest 0.34; New balance 50.33</div>
</div>

> The above figures are extracted from the reference calculations labeled S1 and S2 and illustrate the mechanics of pausing, resuming accruals, and recalculating the schedule after the pause.

### Backdating pauses and accrual adjustments

- Backdated pause intervals are allowed. When a pause start date is backdated and repayments occur between the pause’s start and end, the system reverses and replays those repayments as part of the recalculation process. An accrual adjustment is performed if there is any difference in interest recognition caused by the backdated pause.
- If repayments occurred during the pause window or between the pause start and end, the resulting difference in accrued interest is addressed by accrual adjustments to maintain accounting accuracy.
- Accrual postings for the days within the pause itself do not occur; only adjustments after the pause are reflected in the ongoing schedule and any associated accounting entries.

### Accounting implications and penalties

- Because no accrual is posted for the pause days, the nominal interest accrual line items in the period ledger do not include the paused days.
- When a backdated pause affects interest calculation, penalties and charges that depend on interest rates may be reversed and replayed to follows the new interest schedule. Other charges and penalties are not automatically adjusted unless they are explicitly governed by the same rule set.
- If the pause results in differences in interest recognition, an accrual adjustment entry is generated to reconcile the discrepancy between the originally recognized interest and the updated calculation after pause and replay.

### Observed references to accruals adjustments and QA scenarios

The reference material includes extensive QA-oriented calculations for accruals adjustment scenarios, illustrating how accruals evolve across days and how backdated pauses interact with repayments and with accrual postings. A representative excerpt shows a progression of accrual entries for daily calculations, and how a backdated pause interacts with repayment reversals and replayed entries to follows the revised interest schedule. These examples demonstrate the intended accounting integrity: running balances must reconcile, accruals must reflect the paused period accurately, and any backdating must be compensated through adjustments.

### Summary of rules and their implications

- Pause windows stop interest accrual for the paused days and do not produce accrual postings in that interval.
- Pause start and end dates are inclusive for the pause calculation. The end date cannot exceed maturity, and the start date cannot be on or after maturity.
- Multiple pauses are allowed if non-overlapping; the system replays repayments that occur in relation to backdated pauses and triggers accrual adjustments when needed.
- The pause mechanism applies consistently to payoff, charge-off, and reschedule calculations, so that the impact of pauses does not create inconsistencies across different loan outcomes.

### Diagram: high-level flow of pause processing

````mermaid
flowchart TD
 A[Loan accrual cycle] --> B{Pause window active?}
 B -- Yes --> C[Do not accrue interest for paused days]
 C --> D[At pause end: resume accruals]
 D --> E[Recalculate subsequent schedule if needed]
 B -- No --> F[Continue normal accruals]
 F --> G[Next period payment/entry]
 G --> A
````

### Worked references (selected excerpts)

- Pre-pause progression example (standard monthly cycle):
 - 1st period: Balance 100; Interest 0.58; Principal 16.43; EMI 17.01; New balance 83.57.
- Pause within period (S1):
 - Pause 2/5/24–2/10/24; after pause, 3/1/24: Balance 66.95; Principal 16.62; Interest 0.34; New balance 50.33; subsequent months continue with adjusted values (4/1/24: 50.33; 5/1/24: 33.61; 6/1/24: 16.80; 7/1/24: 0.00).
- Pause between periods (S2):
 - Pause 2/10/24–3/10/24 (29 days); 3/1/24: Balance 66.95; Principal 16.62; Interest 0.34; New balance 50.33; subsequent schedule proceeds with the adjusted balance.

These concrete numbers are derived from the reference calculations labeled under the S1 and S2 sections of the pause calculation material.

### Impact on the public API surface and integration points

The documented behavior centers on internal accrual logic and does not introduce new public REST endpoints in the verified material. The agreements around pause intervals, non-overlapping constraints, and backdating behavior are expressed as domain rules and calculation semantics, to be enforced within the loan processing and accrual modules of the progressive loan pathway.

If you need a compact reference to the exact numerical traces used in the samples, the calculations are grounded in a 7% annual rate, 360-day year, and 30-day months, with the per-period rate factor equal to 1.005833333 and per-period interest equal to Balance × 0.07/12 for the standard progression, adjusted by pause and backdating effects as described above.