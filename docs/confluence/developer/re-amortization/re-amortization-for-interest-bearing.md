<!-- Labels: developer, re-amortization -->
# Re-amortization for Interest Bearing

Re-amortization in Pepper-Soup applies to the Interest Bearing progressive loan repayment strategy. On remortization dates, the loan's repayment plan is recast to reflect the new terms, recalculating interest accrual and the installment schedule. The implementation shows that re-amortization uses a fixed daily accrual model with a defined day-count convention, and then generates a new fixed monthly installment (the re-amortized amount) that amortizes the remaining balance over the remaining horizon. The behavior below documents the verified mechanics, the exact formulas evidenced in the reference data, and the concrete patterns for how interest handling is treated during re-amortization.

### Component role and boundaries
- The re-amortization feature operates within the progressive-loan domain, interacting with the broader loan lifecycle. Its observable behavior in the provided references centers on recalculating an updated amortization schedule when remortization occurs for an interest-bearing loan. The re-amortization uses a fixed rate and a fixed installment to extinguish the remaining balance by the end of the defined period.
- The core calculations and schedules rely on a consistent day-count convention and per-period rate factors, which are applied to determine interest, principal, and the resulting balance for each payment date in the re-amortized plan.

### Evidenced day-count conventions and rate factors
- The references consistently use:
 - Days In year: 360
 - Days In month: 30
 - Interest rate: 7% per annum (0.07)
 - Daily rate: 0.07 / 360 = 0.000194444...
- For a 30-day period, the rate factor is computed as 1 + (annualRate / DaysInYear) * DaysInMonth = 1 + 0.000194444... * 30 = 1.005833333. The associated rate increment per period is 0.005833333.
- The schedule examples show a fixed EMI per remortization period equal to the “RE-amortized Amount” (for the primary example, 17.01). The first period after remortization begins with a balance of 100.00 before remapping, and an EMI of 17.01 is applied with an interest charge of 0.58 for the period (2/1 to 3/1 or equivalent). The remainder of the EMI reduces the principal, updating the balance subsequently.

### Calculation method and worked example
Financial operation overview: Re-amortization recalculates a new payment plan starting from the remortization date, using the outstanding balance as the new principal base and applying a fixed EMI (the re-amortized amount) over the remaining term, with a fixed day-count convention for interest accrual.

Key formulas evidenced in the source:
- Daily rate dr = annualRate / DaysInYear = 0.07 / 360 = 0.000194444...
- Per-period interest for a 30-day window: I = OpeningBalance × dr × 30
- Rate factor for a 30-day period: RF = 1 + dr × 30 = 1.005833333...
- EMI (per remortization) is taken as the Re-amortized Amount (e.g., 17.01 in the primary example). The principal portion is P = EMI − I, and the new balance after payment is NB = OpeningBalance − P.
- Rounding: monetary amounts are presented to two decimal places using HALF_UP rounding, as demonstrated by the displayed interest values (e.g., 0.58) and the principal components (e.g., 16.43).

Applied calculation trace (two representative steps from the reference data):
- Step 1 (2/1/24):
 - OpeningBalance = 100.00
 - EMI = 17.01
 - I = 100.00 × 0.07 / 360 × 30 = 0.58
 - Principal = EMI − I = 17.01 − 0.58 = 16.43
 - ClosingBalance = OpeningBalance − Principal = 100.00 − 16.43 = 83.57
 - Observed: EMI = 17.01, Int = 0.58, Prin = 16.43, Balance = 83.57.
- Step 2 (3/1/24):
 - OpeningBalance = 83.57
 - EMI = 17.01
 - I = 83.57 × 0.07 / 360 × 30 = 0.49
 - Principal = 17.01 − 0.49 = 16.52
 - ClosingBalance = 83.57 − 16.52 = 67.05
 - Observed: EMI = 17.01, Int = 0.49, Prin = 16.52, Balance = 67.05.

These steps reproduce the repeating pattern observed in the re-amortization schedules and demonstrate the core mechanics: a constant EMI, period-by-period interest based on the opening balance, and progressive reduction of the balance until fully repaid.

<div class="calc-box">
 <div class="calc-title">Calculation</div>
 <div class="calc-step"><strong>Formula:</strong> <code>Interest = OpeningBalance × (annualRate / DaysInYear) × DaysInPeriod</code></div>
 <div class="calc-step"><strong>Substitution (Step 1, 2/1/24):</strong> <code>Interest = 100 × (0.07 / 360) × 30 = 0.58</code></div>
 <div class="calc-step"><strong>Substitution (Step 1, Principal):</strong> <code>Principal = EMI − Interest = 17.01 − 0.58 = 16.43</code></div>
 <div class="calc-step"><strong>Substitution (Step 1, Balance):</strong> <code>Balance = OpeningBalance − Principal = 100.00 − 16.43 = 83.57</code></div>
 <div class="calc-step"><strong>Substitution (Step 2, 3/1/24):</strong> <code>Interest = 83.57 × (0.07 / 360) × 30 ≈ 0.49</code></div>
 <div class="calc-step calc-result"><strong>Result:</strong> <code>ClosingBalance ≈ 67.05 after Step 2</code></div>
</div>

<div class="param-grid"><div class="param-card"><span class="param-label">EMI (Re-amortized Amount)</span><span class="param-value">17.01</span></div><div class="param-card"><span class="param-label">Rate factor (30 days)</span><span class="param-value">1.005833333</span></div><div class="param-card"><span class="param-label">Daily rate</span><span class="param-value">0.000194444</span></div></div>

### Variants demonstrated 
The reference data contains multiple sheets that illustrate different handling patterns for interest and cash flows during re-amortization. Each sheet documents a distinct configuration for post-remortization cash flows and interest treatment:
- RE-amortization - S1: Principal and interest re-amortization with standard accrual continuing after remortization. The remortization date is shown as 3/15/24, with a re-amortized amount of 17.01 and a scheduled six-month repayment path finishing with zero balance.
- RE-amortization - S2: Interest pause after remortization. The structure mirrors S1 but demonstrates a pause in interest accrual at the remortization moment.
- RE-amortization - S3: Reschedule on remortized loan account. The schedule illustrates re-amortization happening mid-term with subsequent installments following the new plan.
- RE-amortization - S4: Charge-back example. This variant introduces a charge-back flow (fees and adjustments) within the re-amortization sequence.
- RE-amortization - S5: Charge-off to accelerate maturity date. The final schedule accelerates repayment by adjusting the timeline and installment sizes to complete earlier.

In all cases, the underlying rate and day-count conventions remain the same: 7% annual rate, 360-day year, 30-day month, daily rate 0.07/360, and rate factor for a 30-day period equal to 1.005833333. The re-amortized amount (the EMI for the post-remortization schedule) is consistently presented in the reference data as the accountable installment amount for the remainder of the loan in each variant, with the balance and interest components adapting per variant specifics.

### Lifecycle and sequencing (verified transitions)
- Trigger: remortization occurs on the documented remortization date (for the primary example, 3/15/24). The reference indicates a remortization date field and a associated re-amortization amount.
- Schedule re-generation: upon remortization, a new amortization schedule is generated using the re-amortized amount, the outstanding balance, and the agreed post-remortization terms. The examples show a single re-amortization event followed by a sequence of payments under the new terms.
- Payment allocation and progression: each period computes interest on the opening balance, allocates the EMI between interest and principal, updates the balance, and advances to the next period until repayment completes. shows that the opening balance of a period equals the previous period’s closing balance, verifying consistency across the schedule.
- Edge-case patterns: several variants demonstrate scenarios such as pausing interest, rescheduling with fees, or accelerating maturity via charge-off mechanics. These demonstrate how the system accommodates different post-remortization policies while preserving the core amortization logic.

### Observed data patterns and rules
- Opening balance propagation: Each period’s opening balance equals the previous period’s closing balance.
- Interest accrual: Interest per period equals OpeningBalance × (annualRate / DaysInYear) × DaysInPeriod (typically 30 days for the monthly periods in the references). Interest is rounded to two decimals using the standard monetary rounding approach shown in the data (e.g., 0.58, 0.49).
- Principal allocation: Principal per period is EMI minus Interest. This principal reduces the balance for the next period.
- Balance update: New balance after a payment equals OpeningBalance − Principal.
- Finalization: The final schedule in each variant reaches a zero balance (or an agreed alternate endpoint in the accelerated/mutual-exception patterns) and marks the iteration as complete.

### Publication-grade representation of a sample re-amortization trace
Here is a compact, -based reconstruction of the core re-amortization trace for the primary S1 scenario around the remortization date and the first two post-remortization payments:
- Remortization date: 3/15/24. Re-amortized amount: 17.01.
- Pre-remortization payment (2/1/24): OpeningBalance = 100.00; EMI = 17.01; Interest = 0.58; Principal = 16.43; ClosingBalance = 83.57.
- First post-remortization period (3/1/24): OpeningBalance = 83.57; EMI = 17.01; Interest = 0.49; Principal = 16.52; ClosingBalance = 67.05.
- The subsequent periods continue with the same EMI, following the rate-factor-based interest and the updating balance until the loan is fully paid.

<div class="comparison-grid">
 <div class="comparison-card before">
 <div class="comparison-header">Before remortization</div>
 <div class="calc-box terse">
 <div class="calc-title">Opening balance prior to remortization</div>
 <div class="calc-step"><strong>Balance:</strong> 100.00</div>
 <div class="calc-step"><strong>Interest (30 days):</strong> 0.58</div>
 <div class="calc-step"><strong>Principal:</strong> 16.43</div>
 <div class="calc-step"><strong>Closing balance:</strong> 83.57 (after 2/1 payment)</div>
 </div>
 </div>
 <div class="comparison-card after">
 <div class="comparison-header">After remortization (S1)</div>
 <div class="calc-box terse">
 <div class="calc-title">Post-remortization payment (3/1 to 4/1 window)</div>
 <div class="calc-step"><strong>Opening balance:</strong> 83.57</div>
 <div class="calc-step"><strong>Interest (30 days):</strong> 0.49</div>
 <div class="calc-step"><strong>Principal:</strong> 16.52</div>
 <div class="calc-step"><strong>Closing balance:</strong> 67.05</div>
 </div>
 </div>
</div>

### How different patterns alter the post-remortization cash flow
 shows multiple variants that adapt the handling of interest and cash flows after remortization. In all cases, the core computation of per-period interest uses the same daily rate and day-count convention, but the post-remortization rules differ:
- Interest continues as normal in S1 and S3, with the EMI fixed at the re-amortized amount.
- Interest pause in S2 can result in no interest accrual during the pause window, affecting the distribution of the EMI between interest and principal during that window.
- S4 introduces a charge-back sequence, affecting the cash flow with additional items such as fees, chargeable amounts, and subsequent adjustments.
- S5 shows a scenario where the pattern accelerates maturity, adjusting the remaining installments and potentially shortening the payoff horizon.

These patterns document how the re-amortization engine can be configured to reflect different business rules around post-remortization interest, fees, and schedule shape. Each sheet uses the same foundational rate, day-count rules, and EMI basis, but demonstrates how alternative post-remortization policies affect the incremental cash flows and final schedule shape.

### Implications for integration and extension
- When integrating or extending the re-amortization feature, verify that the remortization date is honored as the trigger for schedule regeneration and that the re-amortized amount is used as the fixed EMI for the remainder of the term (or for the period defined by the particular variant).
- Maintain the invariant that each period’s opening balance equals the previous period’s closing balance, across all post-remortization patterns.
- Apply the day-count convention consistently (360-day year, 30-day month) for interest accrual and rate factor calculations.
- If introducing additional post-remortization variants, preserve -based pattern of recalculating interest, allocating principal, and updating the balance per period while following the chosen policy on pauses, fees, or early payoff.

### Appendix: Key data points ( excerpts)
- Interest rate: 7% per annum; Days in year: 360; Days in month: 30.
- Daily rate: 0.07 / 360 = 0.000194444...
- Rate factor for 30 days: 1.005833333 (equal to 1 + dailyRate × 30).
- Example EMI (Re-amortized Amount): 17.01 in the primary scenario.
- Example first post-remortization period: OpeningBalance 83.57; EMI 17.01; Interest 0.49; Principal 16.52; ClosingBalance 67.05.
- Final payoff in the primary scenario: Final balance reaches 0.00 after the 7/1/24 payment cycle.

This page presents the verified behavior and calculations for Re-amortization for Interest Bearing as evidenced by the reference data. It documents the exact formulas, the progression of balances, and the different post-remortization patterns that are implemented and tested within the reference material.