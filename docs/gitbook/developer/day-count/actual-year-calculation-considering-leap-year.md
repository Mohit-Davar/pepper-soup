# Actual year calculation considering leap year

This page documents the Verified behavior of the day-count logic used for interest accrual when the system applies Actual/Actual year conventions. The enhancement supports accurate interest calculation based on the precise number of days in the applicable year, including leap-year conditions, and handles February-related period splits as shown in the reference scenarios. The examples demonstrate how periods are lengthened or shortened by the actual days in the year and in each month, and how those day-count decisions propagate into interest, principal allocation, and loan balance progression.

### Conceptual scope and observable behavior

The reference data demonstrates an Actual/Actual day-count approach where:
- The number of days in the year is treated as ACTUAL, i.e., the actual calendar year length (365 or 366) influences the daily interest rate. In the examples, the daily rate appears derived from the cited annual rate divided by the days-in-year basis.
- The number of days in a period (DaysInPeriod) is the actual number of days between period start and period end dates (the "actual gap" in the tables).
- Interest for a period is computed using the daily rate and the actual period length, then allocated against the period’s EMI to determine interest, principal, and the resulting balance.
- February handling is explicit: the system can split or consolidate February within period calculations depending on how dates fall within the amortization schedule, verifying accurate accrual when February has 28, 29, or no discrete month boundary in the loan’s repayment cadence.

The reference scenarios illustrate how these rules manifest across different loan shapes, interest rates, and calendar configurations. While the exact internal implementation details (class names, APIs, or persistence changes) are not exposed in the reference data, the observed numerical results reveal the following core pattern: the period interest equals opening balance multiplied by the daily rate and the number of days in the period, with principal paid and closing balance derived from the EMI allocation.

### Day-count convention and the calculation model

The calculation model relies on two interconnected inputs per period:
- The daily rate, obtained from the annual rate and the days-in-year basis, and
- The period length in days (actual days spanned by the payment interval).

Together, these yield the period interest, which drives the EMI allocation between interest and principal and, consequently, the loan balance evolution.

Key formulae observed in the reference data (expressed in a straightforward, auditable form):
- DailyRate = AnnualRate / DaysInYear
- PeriodInterest = OpeningBalance × DailyRate × DaysInPeriod
- PrincipalPaid = EMI − PeriodInterest (subject to remaining balance constraints)
- EndingBalance = OpeningBalance − PrincipalPaid

These equations match the numerical results shown in the reference schedules where OpeningBalance, EMI, and the computed interest follows the given days-in-period and rate values. The use of ACTUAL for DaysInYear and DaysInMonth is explicit in the reference sections labeled as ACTUAL.

### Worked example from the reference (S1: Feb month split between periods)

Input observations from the reference:
- Opening balance: 10,000
- EMI (period payment): 1,713.21
- Interest rate (annual): 9.482% (0.09482)
- Daily rate (as shown): 0.000259071
- Period length (actual gap): 31 days
- After the first period:
 - Interest: 80.53
 - Principal repaid: 1,632.68
 - Ending balance: 8,367.32

Calculation interpretation (substitution of the observed values):
- DailyRate = 0.09482 / 365 ≈ 0.000259071 (as evidenced by the reference daily rate)
- PeriodInterest = 10,000 × 0.000259071 × 31 ≈ 80.53
- PrincipalPaid = EMI − PeriodInterest = 1,713.21 − 80.53 ≈ 1,632.68
- EndingBalance = OpeningBalance − PrincipalPaid = 10,000 − 1,632.68 = 8,367.32

The sequence continues with subsequent periods showing the same calculation pattern, adjusting for the actual days in each period and the changing opening balance.

The observed numbers from the reference support the two central premises: (1) interest accrues on the actual balance for the actual number of days in the period, using a daily rate derived from the annual rate and the days-in-year, and (2) EMI allocations are applied to reduce the balance , with closing balances matching the expected arithmetic progression.

### Additional scenarios (highlights from S2 and S3)

- S2: No February month, but leap year
 - Principal: 15,000
 - EMI: 3,845.41
 - The daily rate used follows the same daily-rate pattern, and the period lengths (days-in-period) are consistent with actual calendar days. The resulting interest and principal allocations progress the balance to zero over the observed periods.
 - The totals shown in the reference indicate cumulative interest and principal across the sequence consistent with Actual/Actual day-count behavior.

- S3: February in a single period (Disbursement on 31 October 2023)
 - The schedule covers multiple months through February 2024, including a February 29 occurrence (leap year). The presence of February 29 alters the per-period day count, which in turn affects the daily rate and the period-interest calculation, reflecting the Actual/Actual convention across a leap year boundary.
 - The period-by-period results (prin, int, balance) follow the same arithmetic pattern described above, reaffirming that period-length and year-length interact to determine accrual.

### Diagram: calculation flow (Mermaid)

flowchart TD
 A[Loan Disbursement] --> B[Identify period start and end dates]
 B --> C[Determine DaysInMonth (ACTUAL) and DaysInYear (ACTUAL)]
 C --> D[Compute DailyRate = AnnualRate / DaysInYear]
 D --> E[Compute DaysInPeriod from dates]
 E --> F[Compute PeriodInterest = OpeningBalance × DailyRate × DaysInPeriod]
 F --> G[Allocate: EMI = PeriodInterest + Principal portion]
 G --> H[Update Balance = OpeningBalance − PrincipalPaid]
 H --> I{More periods?}
 I -->|Yes| B
 I -->|No| J[End]

### Worked representation: formula and substitution (HTML snippet)

<div class="param-grid">
 <div class="param-card"><span class="param-label">Opening Balance</span><span class="param-value">10,000</span></div>
 <div class="param-card"><span class="param-label">Annual Rate</span><span class="param-value">0.09482</span></div>
 <div class="param-card"><span class="param-label">Days In Year</span><span class="param-value">ACTUAL</span></div>
 <div class="param-card"><span class="param-label">Days In Period</span><span class="param-value">31</span></div>
 <div class="param-card"><span class="param-label">Daily Rate</span><span class="param-value">0.000259071</span></div>
 <div class="param-card"><span class="param-label">Interest</span><span class="param-value">80.53</span></div>
 <div class="param-card"><span class="param-label">Principal Repaid</span><span class="param-value">1,632.68</span></div>
 <div class="param-card"><span class="param-label">EMI</span><span class="param-value">1,713.21</span></div>
 <div class="param-card"><span class="param-label">Ending Balance</span><span class="param-value">8,367.32</span></div>
</div>

### Implications for integration, persistence and accounting

- The Actual/Actual day-count convention directly influences the daily rate and, by extension, every period's interest. Systems that rely on a fixed 365-day year will produce different per-period interests when a leap year boundary occurs or when February spans two calendar periods. The reference data shows multiple scenarios where February handling and leap-year consideration affect period lengths and interest allocations.
- Schedules produced under Actual/Actual must preserve consistency between opening and closing balances across consecutive periods. The reference data emphasizes that each period's opening balance equals the previous period's closing balance, and that the total interest and principal over all periods reconcile with the loan’s amortization plan.
- In practice, this affects month-by-month amortization schedules, GL postings (where available), and any downstream reporting that depends on daily accrual precision. The examples demonstrate that the same underlying framework can accommodate both February-split and February-contained periods, and can adjust for leap-year day counts without violating the integrity of the amortization sequence.

### Summary of verified behavior

- The system applies an Actual/Actual day-count convention for interest accrual, using ACTUAL days in the year and ACTUAL days in each month/period.
- Interest for a period is computed from the opening balance, the daily rate derived from the annual rate and the days-in-year, and the number of days in the period.
- EMI allocations split into interest and principal according to the calculated period interest, updating the loan balance .
- February-specific scenarios, including leap-year occurrences, are supported and reflected in the period lengths and resulting interest and principal values.

If you need an explicit, end-to-end walkthrough of a particular scenario from the reference set (S1, S2, or S3) mapped to your loan parameters, I can extract the relevant inputs and reproduce the step-by-step arithmetic for that case.