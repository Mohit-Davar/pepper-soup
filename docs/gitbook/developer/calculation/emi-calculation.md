# EMI calculation

The EMI calculation component in Pepper-Soup operates within the Interest and Accrual subsystem under Calculation. It supports the standard fixed-rate installment framework typically used to amortize a loan over a sequence of periods, and it also accommodates variations in day-count conventions (monthly, daily, weekly) and period boundaries. The implementation shows a primary calculation flow that produces an amortization schedule, computes per-period interest as a function of the elapsed days, and allocates each payment between interest and principal. In particular, the system references an EMI calculation pathway that uses a per-period rate factor and a per-period EMI, together with an amortization schedule derived from the initial principal balance. The EMI calculation workflow is exercised during regular repayment cycles and during early repayment scenarios where customer payments occur outside the standard due-date sequence.

At a high level, the EMI calculation relies on these core concepts observed in the reference data:

- A per-period rate factor (rate factor) is derived from the loan’s interest rate, the repayment cadence, and day-count conventions. The rate factor feeds the per-period interest calculation.
- The per-period EMI is computed from the rate factor and the outstanding balance, and then allocated between interest and principal for that period.
- The opening balance of each period equals the previous period’s closing balance, and the schedule advances by reducing the balance by the principal portion of the EMI while accruing interest for the period.
- The system explicitly represents the per-period interest as a function of the rate factor, using the relationship Installment Interest = Principal balance × (ratefactor − 1).

To ground these ideas in concrete formulas, the reference data provide the following exact expressions used by the EMI calculations:

- EMI formula (as evidenced in the reference sheets):
 EMI = (ratefactor_i × Ri × principal) / fn (for i = 1..n)
 where ratefactor is the per-period growth factor and Ri represents period-specific components that contribute to the EMI sum. The expression appears in the reference calculations as EMI =( ratefactor_i..n × Ri × principal)/fn, with the exact notation showing a summation across periods and a normalization by fn.

- Rate factor definitions by cadence:
 - Monthly (360-day year, fixed 30-day months default in the reference):
 Rate factor = 1 + (rate of interest × (repaid every × days in month / days in year) × actual days in period / calculated days in period)
 - Daily (360-day year) and Weekly fall under analogous structures but with the standard daily or weekly cadence multipliers, e.g.:
 Rate factor = 1 + (rate of interest × (repaid every / days in year) × actual days in period / calculated days in period)
 The reference explicitly lists these forms under the daily/weekly schedules and under the 360–30 cadence families.

- Installment Interest (per period):
 Installment Interest = Principal balance × (ratefactor − 1)

The following worked example uses the monthly 360-30 cadence as demonstrated in the reference data to illustrate how the EMI and amortization are produced over a sequence of periods.

<div class="calc-box">
 <div class="calc-title">Calculation</div>
 <div class="calc-step"><strong>Formula:</strong> EMI = (ratefactor × Ri × principal) / fn and Installment Interest = Principal × (ratefactor − 1)</div>
 <div class="calc-step"><strong>Rate factor (monthly, 360-day year, 30-day month):</strong> Rate factor = 1 + (rate of interest × (repaid every × days in month / days in year) × actual days in period / calculated days in period)</div>
 <div class="calc-step"><strong>Substitution (example inputs):</strong> Principal = 100, Rate = 9.4822% annualized over a 360-day year, repaid every 1 month, days in month = 30</div>
 <div class="calc-step calc-result"><strong>Result (illustrative):</strong> EMI shown in the reference for the first period is 17.01; per-period interest and principal portions follow in the schedule excerpt below.</div>
</div>

### Worked monthly amortization (360-30 cadence)
The reference schedule for a loan with principal 100 and a monthly repayment cadence shows a progression over seven periods. The dates and balances below illustrate the amortization semantics and the allocation between EMI, principal, and interest.

| Date | Balance | EMI | Prin | Int | notes |
| :--- | :---: | :---: | :---: | :---: | :--- |
| 1/1/24 | 100.00 | 17.01 | 16.43 | 0.58 | opening period; first payment due 2/1/24 |
| 2/1/24 | 83.57 | 17.01 | 16.43 | 0.58 | after first payment; balance reduced by principal portion |
| 3/1/24 | 67.05 | 17.01 | 16.52 | 0.49 | second period;
| 4/1/24 | 50.43 | 17.01 | 16.62 | 0.39 |
| 5/1/24 | 33.71 | 17.01 | 16.72 | 0.29 |
| 6/1/24 | 16.90 | 17.01 | 16.81 | 0.20 |
| 7/1/24 | 0.00 | 17.00 | 16.90 | 0.10 | fully repaid

Notes:
- The opening balance for the period equals the previous period’s closing balance, and the closing balance after each period equals the opening balance minus the principal portion.
- The EMI remains consistent at 17.01 for these periods, while the principal and interest components adjust based on the evolving balance and the rate factor.
- The per-period interest values are consistent with the formula Installment Interest = Principal × (ratefactor − 1) as shown in the reference calculations.

### Alternative cadences and debt-repayment variants
The reference data encompass several cadences beyond the standard monthly 360-30 scheme, including daily and weekly repetitions, and variants such as early repayment adjustments (RPMT-adjst nxt, RPMT-adjst lst) and combinations of multiple disbursements. In all cases, the same core constructs apply: a rate factor derived from day-count conventions, an EMI computed from that rate factor and the balance, and an allocation of each EMI to interest and principal. The cadence-specific rate factor definitions are provided in the reference materials and are used to derive Installment Interest and the principal reduction per period.

<div class="param-grid" style="margin-top:12px;">
 <div class="param-card"><span class="param-label">Principal</span><span class="param-value">100</span></div>
 <div class="param-card"><span class="param-label">Rate factor (monthly)</span><span class="param-value">1.005833333</span></div>
 <div class="param-card"><span class="param-label">EMI</span><span class="param-value">17.01</span></div>
</div>

#### Early repayment scenarios (S1, S2, S3, S4)
The EMI calculation implementation includes explicit handling for early repayments that alter the amortization trajectory within or across periods. The reference describes the following patterns:
- S1: Lesser-than-EMI payments (partial payments within a period) are processed by first determining payable details via EMICalculator.getPayableDetails(). If the repayment amount is not enough to cover the EMI, the period remains open, and the payable details adjust the split between interest and principal for the transaction date. If the repayment amount is large enough to cover the EMI, the principal due may be reduced and the period can be closed with the remaining amount applied to subsequent periods.
- When the outstanding principal is reduced or the balance becomes small enough to close the period, the from-date for calculating the interest of the upcoming period shifts to the current date plus one day and the period membership is updated .
- If so much principal is paid that the remaining interest would not be recognized within the period, the calculation pushes that interest to the next period and recalculates against the newer loan balance.
- S2: EMI Amount paid (the payment equals the EMI). The reference shows a snapshot where EMI is allocated to the period and the balance is updated ; if the payment exactly matches EMI, the principal and interest are allocated as shown in the period table and the next period proceeds with the next installment.
- S3 and beyond describe additional early repayment variants (e.g., partial paydowns and payoffs) where recalibration of interest and principal within subsequent periods is described; the texts explain the looping behavior where any remaining amount is allocated to the next due periods until fully applied or the loan is paid off.

In all cases, the system uses a planning model that recomputes the repayment schedule after applying the repayment, updating the period principal due, due interest, and the period balance, then continues processing any remaining amount against subsequent periods. The design aims to maintain the integrity of the amortization model while accurately reflecting the customer’s early repayments in future periods.

> Execution notes: The flows reference EMICalculator.getPayableDetails() to determine payable components and then apply balance corrections through the EMI calculator to re-evaluate the schedule. The process repeats until all funds are allocated or the loan is paid off.

### Data flow and invariants
- The system maintains a clear mapping from each period to a single balance, EMI, principal, and interest value. The following invariants are observed in the reference data:
 - Opening balance of a period equals the preceding period’s closing balance.
 - The sum of principal and interest components for a period equals the EMI for that period (subject to any early repayment adjustments).
 - The total of payments allocated across periods equals the amount paid, with any remaining cash reflected as a balance until fully allocated.
- The cadence and day-count conventions influence the rate factor and thus the per-period interest; the schedules illustrate how the rate factor and days-in-year conventions propagate to the EMI and per-period interest.

### Summary of the relevant equations (-based)
- EMI formula across periods: EMI = (ratefactor × Ri × principal) / fn, where ratefactor is the per-period growth factor, and Ri are components contributing to the EMI (summed across n periods and normalized by fn).
- Rate factor for monthly cadence (360-day year, 30-day month): Rate factor = 1 + (rate of interest × (repaid every × days in month / days in year) × actual days in period / calculated days in period).
- Installment Interest per period: Installment Interest = Principal balance × (ratefactor − 1).

### Important considerations for implementation
- The EMI calculation is tightly coupled to the day-count convention chosen for a loan: 360-day year schemes (e.g., 360-30 monthly) and daily/weekly variants are supported with their respective rate factor formulas.
- Early repayments trigger recalculation of the schedule and may advance or close periods, shifting the start date for calculating subsequent interest (current date + 1 day, per the early repayment rules in S1).
- The amortization schedule must maintain consistency between opening and closing balances across periods; mismatches indicate a deviation from the verified rules and should be surfaced for remediation during testing and validation.

If you need a compact, copy-ready excerpt of a complete monthly amortization snippet from the reference, the following brief excerpt demonstrates the standard monthly 360-30 progression (first seven periods).

| Date | Balance | EMI | Prin | Int |
| :--- | :---: | :---: | :---: | :---: |
| 1/1/24 | 100.00 | 17.01 | 16.43 | 0.58 |
| 2/1/24 | 83.57 | 17.01 | 16.43 | 0.58 |
| 3/1/24 | 67.05 | 17.01 | 16.52 | 0.49 |
| 4/1/24 | 50.43 | 17.01 | 16.62 | 0.39 |
| 5/1/24 | 33.71 | 17.01 | 16.72 | 0.29 |
| 6/1/24 | 16.90 | 17.01 | 16.81 | 0.20 |
| 7/1/24 | 0.00 | 17.00 | 16.90 | 0.10 |

The exact numbers in this excerpt reflect the reference schedule for the Monthly 360-30 cadence as presented in the EMI calculation reference data.

If you require deeper traces of every cadence variant (daily, weekly, 360-30-ERLY RPMT-adjst nxt, etc.), the reference material provides dedicated tables and narrative sections detailing how rate factors, installments, and payable details are recalculated under those scenarios. The core interpretation remains the same: the EMI is driven by a rate factor derived from day-count conventions, per-period interest is computed from that rate factor, and the principal portion reduces the balance while the schedule is updated to reflect early repayment actions.