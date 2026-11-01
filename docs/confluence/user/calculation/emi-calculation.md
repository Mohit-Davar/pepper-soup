<!-- Labels: user, calculation -->
# EMI calculation

The EMI calculation feature computes the fixed periodic payment required to amortize a loan over a defined repayment schedule. It supports different repayment frequencies (monthly, weekly, daily) and multiple day-count conventions. The core mechanism relies on a rate-factor approach to determine interest and a fixed installment (EMI) that reduces the loan balance toward zero over the period. This page documents verified behavior, the business rules that govern EMI calculation and adjustment, and concrete examples drawn from the reference data.

### How EMI calculation works (concepts and why it matters)

- Rate factor concept: For each repayment period, the system computes a rate factor that reflects the impact of the interest rate and the chosen day-count convention on that period. The rate factor is then used to derive the interest charge for that period and the portion of the EMI that goes to principal.
 - Monthly (repaid every 1 month): Rate factor is typically derived from the annual rate and the month’s length. The reference data shows, for a 360-day year and a 30-day month, a rate factor of 1.007901833 for an annual rate around 9.48%. This factor implies a per-period interest component that, together with the fixed EMI, reduces the outstanding balance across periods.
 - Daily/weekly (360-actual with varying days per period): The rate factor is computed as 1 plus the proportionate interest for the actual days in the period, scaled by the year-length convention. The calculation is described as Rate factor = 1 + (rate of interest × (repaid every × days in period / days in year) × actual days in period / calculated days in period).
- EMI as a fixed installment: The EMI is the level payment that amortizes the loan according to the selected schedule. The reference shows EMI values such as 17.13 for a 100 principal under a 6-month actual schedule and 17.01 in other 360-30 examples. The exact numeric EMI depends on the chosen rate, period length, and day-count conventions, but the behavior is consistent: the EMI remains the same within a given calculation context, while principal and interest components vary by period.
- Interest and principal split: For each period, Interest = Opening balance × (rate factor − 1) (subject to day-count conventions and rounding), and Principal = EMI − Interest. The opening balance in a period equals the previous period’s closing balance. The sum of principal across periods equals the initial loan principal, subject to rounding.
- Balance progression and integrity: Each period’s opening balance must equal the previous period’s closing balance. The total of principal repaid across periods must equal the loan’s initial balance (allowing for minor rounding). The schedule must reconcile with the EMI totals and the remaining cash or due amounts.
- Handling of unusual periods: For non-standard periods (for example, daily or weekly repaid periods), the system uses the associated rate factor and period length in calculating EMI, interest, and principal per period. The reference includes several specialized schedules (360-30, 360-ACTUAL daily/weekly, ERLY RPMT variants) that illustrate how the mechanics adapt to different periods and early repayment behavior.

### Representative amortization (monthly, 6 months)
The reference data includes a concrete 6-month amortization example that starts with a principal of 100 and a fixed EMI over monthly periods, progressing from a balance of 100 down to

0. The table below reproduces the observed balances and allocations for clarity. Values are taken as published in the reference dataset and reflect the exact conditions of that calculation run (date ranges, rate factor, and day-count conventions baked into the sheet).

<div class="param-grid">
 <div class="param-card"><span class="param-label">Principal</span><span class="param-value">100</span></div>
 <div class="param-card"><span class="param-label">EMI (periodic installment)</span><span class="param-value">17.13</span></div>
 <div class="param-card"><span class="param-label">Interest rate (annual)</span><span class="param-value">9.4822%</span></div>
 <div class="param-card"><span class="param-label">Days in year</span><span class="param-value">360</span></div>
</div>

| Date | Balance | EMI | Prin | Int | days gap | Rate factor |
|:---|:---|:---|:---|:---|:---|:---|
| 2/1/24 | 83.68 | 17.13 | 16.32 | 0.81 | 31 | 1.008053375 |
| 3/1/24 | 67.18 | 17.13 | 16.50 | 0.63 | 28-29 | 1.007533803 |
| 4/1/24 | 50.59 | 17.13 | 16.59 | 0.54 | 30-31 | 1.008053375 |
| 5/1/24 | 33.85 | 17.13 | 16.74 | 0.39 | 30 | 1.007793589 |
| 6/1/24 | 17.00 | 17.13 | 16.86 | 0.27 | 31 | 1.008053375 |
| 7/1/24 | 0.00 | 17.13 | 17.00 | 0.13 | 30 | 1.007793589 |

Notes:
- The table shows the period-by-period allocation of EMI between principal and interest, confirming the opening balance and closing balance relationship, and the amortization toward zero.
- The exact rate factor values reflect the 360-day year convention and 30-day month in this scenario; other scenarios in the reference use 365 days and different period lengths.

### EMI calculation modes and data inputs (UI-facing behavior)

- The EMI calculation feature is accessed via: Interest and Accrual > Calculation > EMI calculation.
- When configuring an EMI calculation, operators select the loan context (the principal amount is the starting point for the calculation) and the repayment cadence (for example, repaid every 1 month for a monthly schedule).
- The system displays the rate factor per period based on the selected day-count convention and the current rate inputs. It then computes the EMI and renders the repayment schedule with per-period Principal and Interest allocations.
- The primary observable outputs after a calculation run are:
 - EMI per period (the fixed installment value for the chosen schedule).
 - A per-period breakdown of Principal and Interest.
 - An evolving loan balance across the repayment horizon until the balance reaches zero (or the schedule reaches its end).

### Operational steps: performing an EMI calculation (UI navigation and outcomes)
1. Navigate to the EMI calculation page at Interest and Accrual > Calculation > EMI calculation.
 - Outcome: The page opens with input fields for principal, repayment cadence, rate, and day-count conventions; a rate factor view is available to understand period-level adjustments.
2. Enter the loan principal amount. For example, set Principal to 100.
 - Outcome: The system acknowledges the principal and prepares the calculation context for the selected cadence.
3. Choose the repayment cadence (e.g., repaid every 1 month).
 - Outcome: The calculation logic configures period lengths; for monthly cadence with a 360-day year and 30-day month, the rate factor for typical periods appears (e.g., 1.007901833 for a 9.4822% annual rate).
4. Select the day-count convention (e.g., Days In year = 360, Days In month = 30).
 - Outcome: The per-period rate factor is stabilized according to the convention, and the EMI is computed.
5. View the calculated EMI and the repayment schedule.
 - Outcome: The system presents the EMI per period and a detailed schedule showing Date, Balance, EMI, Principal, and Interest. The opening balance of the first period equals the initial principal, and each period’s opening balance equals the previous period’s closing balance, culminating in zero balance if fully amortized.
6. Validate results against business rules:
 - The total principal repaid equals the initial principal (subject to rounding).
 - The per-period Interest plus Principal equals the EMI for each period (subject to rounding).
 - The final period closes with the remaining balance reduced to zero or to the end of the schedule as defined.
 - Observed figures in the example timetable follows the reference behavior for the 6-month actual scenario described above.

### Special cases and edge behavior evidenced in the reference data

- Early repayment and recalculation (S1): If an early repayment occurs within the current period, the system recalculates interest on the updated balance for the remaining days. Depending on the amount paid, the system may move some projected interest into the next period or close the current period early if the payment fully covers the period’s EMI and interest, effectively advancing the schedule.
 - Example interpretation: When an early repayment is smaller than EMI, the system may leave the current period open and reallocate a portion of the payment between principal and interest, potentially moving any unrecognized interest to a future period.
 - If the repayment amount is large enough to cover EMI plus accrued interest and more, the period may be closed early, and the balance for the next period recalculated from the new current date.
- EMI amount paid (S2): When the user pays the full EMI amount in a period, the allocation reduces the principal as scheduled by the EMI, and the balance advances to the next period with the balance updated . The reference shows plans where EMI payments lead to immediate reductions in balance and updates to the following period’s principal and interest allocations.
- Daily/weekly and 360-actual variants: The EMI engine supports non-standard periods (daily or weekly repayments) by applying the associated rate factor equations and period definitions. The resulting schedules reflect the chosen cadence and verify that the balance progression remains consistent with the amortization logic.

### Calculations and verification: what you should expect to see

- Parameter grid and calculations (example):
 - Principal: 100
 - EMI: 17.13 (monthly schedule in the 6-month example)
 - Interest rate (annual): 9.4822%
 - Days in year: 360
 - Repaid every: 1 month
 - Rate factor per period examples: 1.008053375 (for the first month in one observed run) and 1.007533803 (for another observed run, reflecting day-count differences)
 - Period 1 (2/1/24): Balance 83.68, EMI 17.13, Principal 16.32, Interest 0.81
 - Period 2 (3/1/24): Balance 67.18, EMI 17.13, Principal 16.50, Interest 0.63
 - Period 3 (4/1/24): Balance 50.59, EMI 17.13, Principal 16.59, Interest 0.54
 - Period 4 (5/1/24): Balance 33.85, EMI 17.13, Principal 16.74, Interest 0.39
 - Period 5 (6/1/24): Balance 17.00, EMI 17.13, Principal 16.86, Interest 0.27
 - Period 6 (7/1/24): Balance 0.00, EMI 17.13, Principal 17.00, Interest 0.13
- Observed totals for this 6-month excerpt: Total Principal repaid ≈ 100.00; Total Interest ≈ 2.77; Total EMI across six periods ≈ 102.78. Rounding conventions apply per period (HALF_UP or HALF_EVEN as configured); the final reconciliation should balance to the loan’s initial principal with the posted schedule.

### Verification and integrity considerations

- Period-opening balances match the prior period’s closing balances, verifying continuity of the schedule.
- The sum of period principals equals the initial balance within rounding tolerance.
- The sum of period interests reflects the interest accrued under the chosen rate factor and day-count convention for each period.
- When data is available, journal entries (if shown) balance with debits equaling credits per typical accrual accounting rules; where such entries are not shown, the calculation outputs are the primary source of financial effect for the loan.

### Quick reference: terminology and formulas (as evidenced in the reference data)

- Rate factor (monthly example): Rate factor = 1 + (rate of interest × (days in month / days in year) × actual days in period / calculated days in period).
- Installment Interest: Installment Interest = Principal balance × (rate factor − 1).
- EMI: EMI calculation is shown as EMI = (rate factor × Ri × principal) / fn in several sheets; the practical outcome is a fixed periodic installment that amortizes the loan given the rate factor and period definitions.
- Repaid cadence examples in the reference include monthly (1 month), weekly (2 weeks), and daily (repaid every 1 day or 7 days) patterns, each with associated rate-factor formulas and resulting schedules.

### Summary: value to users and branch operations

EMI calculation provides a precise, auditable way to plan and monitor loan amortization under a consistent set of day-count conventions. By showing per-period EMI, principal, interest, and balance, operations staff can verify that repayment assumptions follows customer agreements, respond to early repayments with defined rules for recalculations, and present customers with transparent timelines and costs. The feature supports multiple cadences and day-count conventions, enabling accurate modeling for standard and non-standard payment scenarios while preserving the integrity of the loan’s balance and the amortization schedule.