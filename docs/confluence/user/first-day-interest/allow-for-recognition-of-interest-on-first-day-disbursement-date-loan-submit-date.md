<!-- Labels: user, first-day-interest -->
# First-Day Interest Recognition on Disbursement

This page describes the enhancement that allows configurable recognition of interest on the first day of loan disbursement. Historically, the system accrued interest according to the chosen accrual rules, but this enhancement makes it possible to recognize and record interest on the disbursement date itself (the first day of the period), rather than starting accrual on a subsequent day. The change matters in day-to-day operations because it affects when interest begins to accrue, how daily accruals are posted, and how repayments are allocated between principal and interest from the very first day of a loan. The reference material demonstrates the treatment using a 7% annual rate with a 360-day year and illustrates the Day 0 (first day) accrual pattern and its continuation through the repayment cycle.

### What changed and why it matters
- The system now supports first-day recognition of interest on the disbursement date, enabling customization of how interest accrues for new loans. This aligns accruals with policy choices that treat the disbursement day as Day 0 for interest purposes.
- The accrual framework uses a 360-day year and a 7% annual rate, with a daily accrual rate derived from these values. This verifies consistency across calculations and reporting, and it preserves the same basis used for standard daily accruals.
- A concrete reference pattern is shown in the calculation data: on a loan disbursed on 1/1/24, an initial Day 0 accrual is recorded, and subsequent accruals continue on the daily cadence defined by the 360-day year convention.

### How the feature works (conceptual overview)
- When a loan is disbursed and the first-day recognition is enabled for the loan product, the system posts an accrual entry for Day 0 on the disbursement date. This entry represents the portion of interest that accrues on the first day.
- Daily accruals thereafter follow the standard pattern using the annual rate divided by the days-in-year (360) to determine the daily rate. The credit-management and accounting consequences of these accruals are visible in the daily accrual schedule and in related repayment postings.
- The calculation reference demonstrates the base rate and day-count convention (7% annual rate with 360 days per year) and provides an example schedule that includes Day 0 accrual alongside subsequent accrual entries through the loan term.

### Calculation foundations and key constants
- Interest rate: 7% per annum
- Day-count convention: 360 days in a year
- Daily accrual rate: 7% / 360 = 0.000194444 (approximately)
- Day 0 concept: the first accrual date coincides with the disbursement date (the Day 0 entry).

The reference data includes explicit example values that illustrate Day 0 accrual on disbursement and subsequent accrual entries. For a loan disbursed on 1/1/24 with a principal of 2000, the reference shows a Day 0 entry for payable interest with a value of 0.376344086 (the “First-day” or Day 0 accrual amount in that example). This exemplar demonstrates how Day 0 accrual can appear in the schedule and how it relates to the outstanding balance at disbursement, prior to the first repayment.

### Calculation example excerpts (from reference patterns)
- Example loan: Principal 2000, disbursed 1/1/24. Day 0 (1/1/24) accrual posts a payable interest amount of 0.376344086.
- The Day 0 entry is followed by subsequent accrual entries on the days that comprise the first accrual window, continuing with the same daily-rate logic until the first repayment occurs.

<div class="param-grid">
 <div class="param-card"><span class="param-label">Principal</span><span class="param-value">2000</span></div>
 <div class="param-card"><span class="param-label">Interest rate</span><span class="param-value">7%</span></div>
 <div class="param-card"><span class="param-label">Days in year</span><span class="param-value">360</span></div>
 <div class="param-card"><span class="param-label">Daily rate (approx.)</span><span class="param-value">0.000194444</span></div>
 <div class="param-card"><span class="param-label">Day 0 (disbursement) payable interest</span><span class="param-value">0.376344086</span></div>
 <div class="param-card"><span class="param-label">Disbursement date</span><span class="param-value">1/1/24</span></div>
</div>

<div class="calc-box"><div class="calc-title">Calculation</div>
 <div class="calc-step"><strong>Formula:</strong> Daily rate = annualRate / daysInYear</div>
 <div class="calc-step"><strong>Substitution:</strong> Daily rate = 0.07 / 360 = 0.000194444</div>
 <div class="calc-step calc-result"><strong>Result (illustrative Day 0 entry):</strong> First-day payable interest for Day 0 (example balance 2000) is 0.376344086 on 1/1/24</div>
</div>

### Operational workflow (updated interactions)
1) Access the Interest and Accrual area and locate the First-Day Interest Recognition on Disbursement workflow. The feature applies to the loan product configuration and loan-level disbursement events as shown in the reference patterns.
2) allows or configure first-day recognition for the relevant loan products or loans, selecting the Day 0 option so that interest accrual can begin on the disbursement date. This mirrors the reference examples that show Day 0 being used for accrual calculations.
3) When a loan is disbursed, the system posts an accrual entry on the disbursement date (Day 0) for the first-day payable interest. The example demonstrates a Day 0 accrual value associated with the disbursement.
4) On subsequent days, the system continues accrual entries at the daily rate derived from the 7% annual rate and 360-day year, updating the payable interest amounts as the loan balance changes due to repayments.
5) At each repayment, the allocation between principal and interest reflects the accrued interest up to that point, and the loan balance is reduced by the principal component of the payment.
6) Reports, schedules, and reconciliations after enabling the feature present first-day accruals alongside normal daily accruals, preserving the integrity of balances, interest earned, and repayment allocations.

### Implications for reporting and reconciliation
- Opening balances and period totals will include first-day accruals when Day 0 is enabled, and daily accruals thereafter will follow the same 360-day-year convention.
- Repayments will continue to allocate to principal and interest portions consistent with the scheduled EMI and the accrued interest up to each payment date.
- Rounding follows the standard conventions evidenced in the reference: use the corroborated rounding behavior and preserve exact balances and allocations as shown in the accrual schedules.

### Diagram: First-Day Interest Recognition lifecycle

```mermaid
flowchart TD
 A[Loan disbursement (Day 0)] --> B[First-day accrual entry posted]
 B --> C[Daily accrual entries continue across the first period]
 C --> D[First repayment date arrives]
 D --> E[Repayment allocated to principal and interest]
 E --> F[Balance updated; subsequent accruals continue or pause per policy]
```

### Relationship to the existing accrual framework
- The enhancement is described within the Interest and Accrual area under the First-Day Interest Recognition on Disbursement path, indicating an enhancement to existing accrual behavior to accommodate Day 0 recognition on disbursement dates.
- The calculation basis remains: 7% annual rate with a 360-day year, resulting in a daily accrual rate that governs the daily accrual entries and the Day 0 first-day accrual amount when applicable.
- The Day 0 concept follows the reference examples that illustrate first-day accrual patterns and subsequent daily accruals through the repayment sequence, verifying consistency with the overall accrual model.

### Key takeaways for operations
- This enhancement provides a configurable approach to recognizing interest on the disbursement date, enabling policies that differ in when interest begins to accrue.
- The 360-day year and 7% rate remain the foundational parameters for accrual calculations, and Day 0 accruals use the same base rate framework as subsequent accruals.
- Day 0 accruals appear in the accrual schedule alongside future accrual entries and are incorporated into the calculation of interest when repayments occur.

If you need the Day 0 accrual example reproduced for a specific loan amount or date, the reference material provides a worked pattern that you can compare against your current schedules to validate alignment with the Day 0 recognition behavior.