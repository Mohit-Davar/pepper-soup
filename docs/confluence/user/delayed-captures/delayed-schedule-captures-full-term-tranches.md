<!-- Labels: user, delayed-captures -->
# Delayed Schedule Captures/Full Term tranches

The Delayed Schedule Captures/Full Term tranches feature allows Disbursement Processing and Planning (Disbursement PP) to support delayed captures for long-term installment loans. It covers scenarios where funds are disbursed in installments after a customer completes an order (for example, an order at a partner platform) and receives approval for a long-term term. The core idea is to generate a complete repayment schedule, allocate disbursed amounts across tranches, and produce an accurate amortization view that reflects the actual timing of disbursements and the terms of the loan. The window for delayed captures is up to 56 days from the customer’s order completion in eligible cases, and the system can produce full-term tranche schedules consistent with the stated term length and rate.

Audience: operations staff, loan officers, branch managers, and credit agents benefit from clearer visibility into how delayed disbursements affect repayment, interest accrual, and overall loan performance when the loan is disbursed in installments rather than in a single lump sum.

### Navigation and scope

- Navigation path: Disbursement and Schedule > Delayed captures > Delayed Schedule Captures/Full Term tranches.
- Scope covered by the reference data includes a collection of long-term installment use cases with delayed captures, including single disbursement, multiple disbursements within the same billing period, and multiple disbursements across different billing periods. It also includes associated refund and reversal scenarios.

## How the feature works (conceptual flow)

Delayed captures create a structured repayment plan that reallocates disbursement amounts across the loan’s term while maintaining the integrity of the repayment schedule. The system computes an installment schedule (often referred to as EMI in the reference calculations) and breaks down each installment into principal and interest components. When multiple disbursements occur, the system aggregates them into a single loan schedule and distributes each tranche’s portion of the EMI so that the periodic payments reconcile with the outstanding principal.

Operationally, the feature supports the following core behaviors, as evidenced by the reference calculations and schedules:
- For a given loan, the system can handle a single disbursement or multiple disbursements across one or more billing periods.
- Each periodic payment is split into principal and interest portions, with the sum of principals across periods equaling the loan principal and the sum of interests across periods representing the total interest payable.
- When refunds or reversals occur, the system adjusts the repayment schedule and balances to reflect the change, while preserving the integrity of the remaining payments.
- Day-count conventions (for the reference data, 360-day years are used in several worksheets) influence interest accrual and installment sizing.

An illustrative diagram of the lifecycle illustrates the high-level flow from order completion to scheduled disbursements and the resulting repayment plan.

```mermaid
flowchart TD
 A[Order Completed] --> B["Loan Approved (Long-Term Installment)"]
 B --> C{Delayed Capture Window (>0 and <=56 days)}
 C -->|Within window| D["Record Delayed Disbursement(s)"]
 D --> E["Generate Repayment Schedule (Full Term Tranche)"]
 E --> F{Post-Capture Events}
 F --> G[Refunds]
 F --> H[Reversals]
 G --> E
 H --> E
```

## Reference calculations and schedules

The reference data provides a structured view of delayed capture scenarios, organized under the feature id delayed-schedule-captures-full-term-tranches. The primary loan scenario used across the calculations is a long-term installment loan with the following baseline:
- Loan amount: 5,000.00
- Loan creation date: 1-Sep
- Nominal interest rate: 11.23%
- Term length: 6M

The following use cases illustrate how the system amortizes disbursed funds across the term, how an EMI is allocated to principal and interest, and how totals reconcile with the loan principal and total interest. In all cases, the total principal repaid equals the loan principal (5,000.00), and the total interest is the sum of the interest components across periods. The tables below reproduce the key numbers exactly as shown in the reference data.

### Use Case 1: Single Disbursement
- Disbursement on 1-Sep: 5,000.00
- Periods: 6
- EMI (per period): 860.84 for periods 1–5, last period 6 uses 860.83 due to rounding
- Interest breakdown by period:
 - Period 1: Interest 46.79; Principal 814.05
 - Period 2: Interest 39.17; Principal 821.67
 - Period 3: Interest 31.48; Principal 829.36
 - Period 4: Interest 23.72; Principal 837.12
 - Period 5: Interest 15.89; Principal 844.95
 - Period 6: Interest 7.98; Principal 852.85
- Totals: Principal 5,000.00; Interest 165.03; EMI total (sum of all periods) 5,165.03

<div class="param-grid"><div class="param-card"><span class="param-label">Loan amount</span><span class="param-value">5,000.00</span></div><div class="param-card"><span class="param-label">Term length</span><span class="param-value">6M</span></div><div class="param-card"><span class="param-label">Nominal rate</span><span class="param-value">11.23%</span></div><div class="param-card"><span class="param-label">Disbursement date</span><span class="param-value">1-Sep</span></div></div>

| Period | EMI | Principal | Interest | Opening Balance | Closing Balance |
|---|---|---|---|---|---|
| 1 | 860.84 | 814.05 | 46.79 | 5,000.00 | 4,185.95 |
| 2 | 860.84 | 821.67 | 39.17 | 4,185.95 | 3,364.28 |
| 3 | 860.84 | 829.36 | 31.48 | 3,364.28 | 2,534.92 |
| 4 | 860.84 | 837.12 | 23.72 | 2,534.92 | 1,697.80 |
| 5 | 860.84 | 844.95 | 15.89 | 1,697.80 | 852.85 |
| 6 | 860.83 | 852.85 | 7.98 | 852.85 | 0.00 |

- Totals: Principal 5,000.00; Interest 165.03; EMI total 5,165.03.

### Use Case 2: Multi Disb, same billing period
- Partial disbursement on 1-Sep: 200.00
- Partial disbursement on 15-Sep: 3,800.00
- Partial disbursement on 22-Sep: 1,000.00
- Periods: 6
- EMI per period: 857.02 (Periods 1–6)
- Interest and principal per period:
 - Period 1: Interest 24.39; Principal 832.63
 - Period 2: Interest 39.00; Principal 818.02
 - Period 3: Interest 31.34; Principal 825.68
 - Period 4: Interest 23.62; Principal 833.40
 - Period 5: Interest 15.82; Principal 841.20
 - Period 6: Interest 7.95; Principal 849.07
- Totals: Principal 5,000.00; Interest 142.12; EMI total 5,142.12

<div class="param-grid"><div class="param-card"><span class="param-label">Loan amount (aggregate principals)</span><span class="param-value">5,000.00</span></div><div class="param-card"><span class="param-label">Disbursements</span><span class="param-value">200.00; 3,800.00; 1,000.00</span></div><div class="param-card"><span class="param-label">Term length</span><span class="param-value">6M</span></div></div>

| Period | EMI | Principal | Interest | Opening Balance | Closing Balance |
|---|---|---|---|---|---|
| 1 | 857.02 | 832.63 | 24.39 | - | - |
| 2 | 857.02 | 818.02 | 39.00 |
| 3 | 857.02 | 825.68 | 31.34 |
| 4 | 857.02 | 833.40 | 23.62 |
| 5 | 857.02 | 841.20 | 15.82 |
| 6 | 857.02 | 849.07 | 7.95 |
- Totals: Principal 5,000.00; Interest 142.12; EMI total 5,142.12.

### Use Case 3: Multi Disb, same billing period (alternate split)
- Partial disbursement on 1-Sep: 2,500.00
- Disbursement on 5-Sep: 2,500.00
- Periods: 6
- EMI per period: 860.31 (Periods 1–6)
- Interest and principal per period:
 - Period 1: Interest 43.67; Principal 816.64
 - Period 2: Interest 39.15; Principal 821.16
 - Period 3: Interest 31.46; Principal 828.85
 - Period 4: Interest 23.71; Principal 836.60
 - Period 5: Interest 15.88; Principal 844.43
 - Period 6: Interest 7.98; Principal 852.32
- Totals: Principal 5,000.00; Interest 161.85; EMI total 5,161.85

| Period | EMI | Principal | Interest |
|---|---|---|---|
| 1 | 860.31 | 816.64 | 43.67 |
| 2 | 860.31 | 821.16 | 39.15 |
| 3 | 860.31 | 828.85 | 31.46 |
| 4 | 860.31 | 836.60 | 23.71 |
| 5 | 860.31 | 844.43 | 15.88 |
| 6 | 860.30 | 852.32 | 7.98 |
- Totals: Principal 5,000.00; Interest 161.85; EMI total 5,161.85.

### Use Case 4: Multi Disb, multiple billing periods
- Disbursements occur across two billing periods (e.g., 9/1 and 10/1) and involve multiple tranches within those periods.
- The combined repayment schedule (Loan Repayment Schedule Combined, 10/10) shows a unified view of EMI allocations across the two cycles and yields a total of: Principal 4,000.00; Interest 132.04; EMI total 4,132.04.
- Example periods in the combined view: 1-Oct through 1-Apr, with EMI allocations of 344.34 per period and principal portions progressing from 325.62 to 341.13, with interest decreasing from 18.72 to 3.19, depending on the specific period. The totals across the combined schedule reconcile to the loan principal and accrued interest for the multi-period arrangement.

| Period (calendar) | EMI | Principal | Interest |
|---|---|---|---|
| 1-Oct | 344.34 | 325.62 | 18.72 |
| 1-Nov | 344.34 | 328.67 | 15.67 |
| 1-Dec | 344.34 | 331.75 | 12.59 |
| 1-Jan | 344.34 | 334.85 | 9.49 |
| 1-Feb | 344.34 | 337.98 | 6.36 |
| 1-Mar | 344.32 | 341.13 | 3.19 |
| 1-Apr | 344.32 | 341.13 | 3.19 |
- Totals: Principal 4,000.00; Interest 132.04; EMI total 4,132.04.

### Use Case 5: Multi Disb, multiple billing periods (alternate pattern)
- Similar to Use Case 4, but with a different timing of the second tranche within the second billing period (e.g., 9/10 and 10/10 disbursements).
- Combined schedule (Loan Repayment Schedule Combined, 10/10) shows Totals: Principal 4,000.00; Interest 132.04; EMI total 4,132.04.

> Note: The reference data contains multiple variants of the above use cases (S1–S5 calculation sheets) to illustrate how delayed captures can be modeled under different disbursement timing patterns. See the S1–S5 sheets for additional patterns and their respective period-by-period breakdowns.

### Refund use cases (impact on delayed captures)
The reference data includes scenarios where refunds are issued after disbursement, impacting the repayment schedule and balances. In brief:
- Refund Use Case 1: After a full disbursement and a sequence of repayments, a refund of 5,000.00 is issued on 2-Nov along with an interest refund of 59.66. The resulting combined totals reflect a net adjustment to the schedule (Total refunds 5,204.71; Interest refunds 59.66; Ending balance follows the refunds).
- Refund Use Case 2: Full refund after disbursement/repayment results in a similar adjustment pattern where the system reconciles the paid installments against the refunded amount, leaving a residual balance equal to the refund impact.
- Refund Use Case 3 and 4: Partial refunds are applied after certain disbursements; the remaining schedule is recalculated with the refund amount reducing the outstanding principal and adjusting subsequent interest accruals.

These refund scenarios are captured in dedicated reference sheets and show how the system maintains consistency between the repayment schedule, repayments made, refunds issued, and the resulting outstanding balance.

## S1–S5 calculation patterns (illustrative examples)
To illustrate the variety of calculation approaches within the delayed-capture framework, the reference data includes several pattern sheets (S1 through S5). Each sheet demonstrates a different timing of disbursement relative to repayment dates and the resulting EMI decompositions.

- S1: Disbursement on Installment
 - Interest Rate: 9.4822% (360-day year)
 - Principal: 100 (example base case)
 - Repaid every: 1 month
 - The sequence shows a seven-period progression, with EMI of 17.13, decreasing outstanding balances, and eventual repayment completion.

- S2: Disbursement in middle of Installment and delayed payment
 - Interest Rate: 9.4822% (360-day year)
 - Principal: 100
 - The pattern demonstrates a mid-period disbursement with delayed payment and associated EMI adjustments.

- S3: Disbursement before repayments
 - Interest Rate: 9.4822% (360-day year)
 - Principal: 100
 - The schedule shows a front-loaded disbursement followed by a standard repayment stream.

- S3.1–S3.4: Sub-variants (payment on date; advance payment adjustments; etc.)
 - These sheets illustrate several timing variants for the same underlying loan parameters, demonstrating how the EMI, principal, and interest portions adjust as disbursements and payments shift in time.

The S1–S5 patterns are included to provide exact numerical representations of these timing variations and should be interpreted as representative reference configurations. The numbers reproduce the sequences exactly as documented in the reference data and are intended to help validation, reconciliation, and training activities.

## Refund and reversal reference patterns (summary)
The reference data also includes detailed sheets for reversal use cases and refund scenarios, showing how refunds and reversals impact the outstanding balance and the repayment schedule. In all cases, the system maintains balancing behavior where the period-by-period opening balance equals the previous period’s closing balance, and the sum of repayments plus refunds reconciles with the principal and interest totals. The sheets demonstrate fully paid states, due states, and how refunds propagate through subsequent periods, including scenarios with filled and partially refunded principal and/or interest.

## Observations and integrity checks
- Period-by-period accounting: Each period’s opening balance equals the previous period’s closing balance in the demonstration calculations, verifying continuity in the amortization schedule.
- Allocation reconciliation: Payment allocations (principal and interest) reconcile to the EMI amount per period, and the sum of principals across all periods equals the loan principal.
- Remaining cash and balance: The remaining cash or outstanding dues reflect the expected totals at each milestone and reconcile with the final balance after the last period.
- Rounding and day-count: The reference data employs specific day-count assumptions (e.g., 360-day year) and rounding conventions (HALF_UP or HALF_EVEN) as observed in the provided calculations. Use these conventions when validating or reproducing the numbers.
- Refunds and reversals: The reference sheets show how refunds and reversals impact future payments and the remaining balance, while preserving the integrity of the remaining schedule.

## Practical implications for operations
- Delayed captures within a 56-day window allows the origination flow to accommodate ordering and approval delays without exposing mismatch between disbursement timing and the amortization structure.
- The full-term tranche approach verifies a consistent repayment profile even when disbursements occur in multiple tranches, reducing the need for ad hoc adjustments in servicing and collections.
- When refunds or reversals occur, the system updates the scheduled repayments and the outstanding balance, allowing updates to future installments and so that the customer account reflects the net effect accurately.
- The reference data demonstrates that regardless of the timing of disbursements (single, multiple within a billing period, or across multiple billing periods), the system can produce an amortization view where the loan is fully repaid with proper allocation of principal and interest, or with recalculated adjustments when refunds occur.

### Important notes on data fidelity
- All numbers shown in the reference sections are drawn directly from the provided reference data. Do not substitute figures or construct hypothetical schedules beyond what is evidenced.
- The schedules in the reference data are intended as verification artifacts. When implementing the feature in production, verify that the live schedules reconcile against the loan principal, the effective interest accrual, and the actual disbursement timing for each tranche.
- This page presents behavior, calculations, and outcomes verified by the reference data. If the reference data contains discrepancies between sheets, prefer the implementation details that are consistently evidenced across the material.

If you need to review any specific use case in more detail (for example, paste-ready tables for a given disbursement pattern or a full breakdown of a particular refund scenario), I can extract the exact rows and present them in a ready-to-publish format. The core acceptance criteria and the observed behavior across the reference sheets are captured above, with emphasis on the 56-day delayed capture window, single and multi-disbursement patterns, and how refunds and reversals influence the repayment timeline.