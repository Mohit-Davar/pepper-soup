<!-- Labels: developer, delayed-captures -->
# Delayed Schedule Captures/Full Term tranches

This page documents the Delayed Schedule Captures/Full Term Tranches feature within Pepper-Soup, focusing on the Disbursement and Schedule domain. The component handles delayed captures for installment term loans, allowing disbursements and their associated repayment schedules to be created, adjusted, or replayed within the context of a long-term installment loan. The feature specifically addresses capture scenarios up to 56 days after the customer completes their order (for example, an Amazon order) and is approved for a long-term loan, enabling the lender to fund disbursements in multiple tranches while preserving a coherent repayment schedule.

Navigation context: Disbursement and Schedule > Delayed captures > Delayed Schedule Captures/Full Term tranches.

> Important note on scope and guarantees: The documentation below reflects verified behavior and schedules observed in the reference data. It covers events such as Disbursement, Repayment, Refund, Reversal, and related fees, as well as the handling of delayed capture windows and multi-disbursement scenarios. Where day-count conventions and calculation patterns are evidenced in the reference data, those conventions are described explicitly.

---

### Conceptual role and boundaries

- The feature models delayed disbursement captures for term loans, including single and multiple disbursement scenarios across one or more billing periods. It supports the creation of an aggregated repayment schedule (often shown as a combined or “Loan Repayment Schedule Combined”) that reconciles all disbursements to a single set of periodic payments.
- Core events observed in the reference data include: Disbursement, Repayment, Refund, Reversal, and, in some cases, charges (Fees). The data shows per-period principal and interest allocations, with totals that reconcile to the original loan amount and the accrued interest across the term.
- The reference material emphasizes a 56-day delayed-capture window and multiple billing periods, including cases with partial disbursements and multiple disbursement dates within the term.

---

### Calculation framework and day-count conventions (-backed)

The calculation framework uses standard amortization logic over a 360-day year, with per-period interest accrual derived from the nominal annual rate. Periodic interest is computed on the opening balance of the period using the day-count convention that ties interest accrual to the number of days in the current period. The following -based rules are observed in the reference data:

- Day-count convention: Days In year = 360. This is shown across multiple sheets in the reference calculations. 
- Per-period interest accrual: Interest for a period is computed as OpeningBalance × (NominalAnnualRate ÷ 360) × DaysInPeriod.
- Per-period payments (EMI): Each period has a fixed payment (EMI) amount for the standard cases, with minor rounding adjustments in the final period (e.g., 860.83 in the single-disbursement Use Case 1 vs. 860.84 in earlier periods).
- Principal reconciliation: Principal for a period = EMI − Interest. The cumulative principal across all periods equals the original loan amount (balance returns to zero by the end of the term). The total interest is the sum of all period interests.
- Rounding: Monetary values are represented with two decimals and rounded according to standard financial rounding in the reference data (e.g., 46.79, 814.05, 5,000.00, 165.03 totals).

These rules are evidenced by the detailed use cases and the associated repayment schedules in the reference data, including single and multi-disbursement scenarios and their combined repayment totals.

---

### Calculation reference: representative use cases and schedules

The reference data includes several use cases under the banner Fineract DE LT Delayed Capture Use Cases. The core pattern across Use Case 1, 2, 3, 4, and 5 shows a loan of 5,000.00 with a nominal rate around 9–11% and a term up to 6 months, with either a single disbursement or multiple disbursements across one or more billing periods. The primary numbers for Use Case 1 (Single Disbursement) are illustrated below and follows the general rules described above.

- Loan amount: 5,000.00
- Disbursement date for Use Case 1: 1-Sep
- Nominal interest rate: 11.23%
- Term length: 6M
- Schedule excerpt (Use Case 1: Single Disbursement)

| Period | EMI | Principal | Interest |
|--------|----------|-----------|----------|
| 1 | 860.84 | 814.05 | 46.79 |
| 2 | 860.84 | 821.67 | 39.17 |
| 3 | 860.84 | 829.36 | 31.48 |
| 4 | 860.84 | 837.12 | 23.72 |
| 5 | 860.84 | 844.95 | 15.89 |
| 6 | 860.83 | 852.85 | 7.98 |
| Totals | 5,165.03 | 5,000.00 | 165.03 |

The combined schedule demonstrates how interest accrues over the term, the EMI is largely constant, and the total interest accrued over the six periods sums to 165.03, with the remaining portion of each EMI applied as principal.

> For completeness, the reference data also contains multi-disbursement cases with two or more disbursements within or across billing periods. In these cases, the per-period EMI remains consistent, while the breakdown of principal and interest per period reflects the revised opening balances after each disbursement. A representative multi-disbursement pattern is shown in the reference data under Use Case 4 (Multi Disb, multiple billing periods) and Use Case 5 (Multi Disb, multiple billing periods with different timing). The combined totals in these cases reconcile to the same overall loan principal and accrued interest, with the repayment schedule presented as a consolidated view.

---

### Calculation walkthrough: Use Case 1 (Single Disbursement)

- Parameters

<div class="param-grid">
 <div class="param-card"><span class="param-label">Principal</span><span class="param-value">5,000.00</span></div>
 <div class="param-card"><span class="param-label">Nominal annual rate</span><span class="param-value">11.23%</span></div>
 <div class="param-card"><span class="param-label">Term length</span><span class="param-value">6 months</span></div>
 <div class="param-card"><span class="param-label">Disbursement date</span><span class="param-value">1-Sep</span></div>
 <div class="param-card"><span class="param-label">Day-count convention</span><span class="param-value">Days In year = 360</span></div>
</div>

- Calculation steps

<div class="calc-box">
 <div class="calc-title">Calculation</div>
 <div class="calc-step"><strong>Formula:</strong> <code>Interest_t = Balance_{t-1} × (NominalAnnualRate / DaysInYear) × DaysInPeriod_t</code></div>
 <div class="calc-step"><strong>Substitution (Use Case 1, Period 1):</strong> <code>Interest_1 = 5000 × (0.1123 / 360) × 30 = 46.79</code></div>
 <div class="calc-step"><strong>Substitution (Period 1):</strong> <code>Balance_0 = 5,000.00</code></div>
 <div class="calc-step"><strong>Result (Period 1):</strong> <code>Interest_1 = 46.79; Principal_1 = EMI − Interest_1 = 860.84 − 46.79 = 814.05; Balance_1 = 5,000.00 − 814.05 = 4,185.95</code></div>
 <div class="calc-step"><strong>Subsequent periods:</strong> Balance_t evolves by subtracting the period principal; Interest_t uses the same formula with the new opening balance; EMI remains the same for the period until rounding adjustments occur (e.g., Period 6 uses 860.83 and Principal_6 = 852.85; Interest_6 = 7.98).</div>
 <div class="calc-step calc-result"><strong>Result (Totals):</strong> <code>Principal total = 5,000.00; Interest total = 165.03</code></div>
</div>

- Worked sample excerpt (Use Case 1):

| Period | EMI | Principal | Interest |
|--------|-------|-----------|----------|
| 1 | 860.84| 814.05 | 46.79 |
| 2 | 860.84| 821.67 | 39.17 |
| 3 | 860.84| 829.36 | 31.48 |
| 4 | 860.84| 837.12 | 23.72 |
| 5 | 860.84| 844.95 | 15.89 |
| 6 | 860.83| 852.85 | 7.98 |
| Totals |5,165.03|5,000.00 |165.03 |

---

### Calculation reference: broader patterns (summary)

- Use Case 2 and Use Case 3 illustrate partial disbursements within the same billing period, guided by the same amortization logic, resulting in a total principal of 5,000.00 and a lower total interest than the single disbursement scenario due to altered opening balances across periods.
- Use Case 4 and Use Case 5 demonstrate multi-disbursement scenarios across multiple billing periods, where the repayment schedule remains consolidated for the borrower-facing view, and the totals reconcile to 5,000 in principal and a cumulative interest consistent with the observed patterns in the reference data.
- Refund and reversal use cases (Scenario Breakdown

---

### Diagrams: high-level flow (delayed capture lifecycle)

flowchart TD
 A[Disbursement(s) created] --> B[Delayed Capture Window (up to 56 days)]
 B --> C[Repayment Schedule Generated] 
 C --> D[Payments processed per schedule] 
 D --> E{Refund or Reversal events?}
 E -->|Yes| F[Adjust balances and schedule ]
 E -->|No| G[Loan fully paid as scheduled]
 style A fill:#e8f4ff,stroke:#7ea7d8
 style B fill:#f9fbff,stroke:#7ea7d8
 style C fill:#f4fff0,stroke:#7ea7d8
 style D fill:#eaf2ff,stroke:#7ea7d8
 style E fill:#fff4db,stroke:#e0a800
 style F fill:#ffd6e0,stroke:#e05a65
 style G fill:#e8f4ff,stroke:#7ea7d8

---

### Section: statuses, validations, and edge cases

The reference data depicts a set of status indicators and invariants that govern the life of a delayed-capture loan:

- Payment status values observed include PAID, Due, and Past Due (45 days).
- The system tracks a Fully Paid? flag per repayment schedule row, aiding reconciliations and reporting.
- The combined or loan-level repayment schedule (Loan Repayment Schedule Combined) aggregates disbursements to provide a consolidated view of the borrower’s payment commitments across potentially multiple billing periods.
- Edge cases documented in the reference data include partial disbursements, mid-period disbursement timing, and refunds or reversals that adjust both the outstanding balance and the interest accrued.

---

### Implications for integration and persistence

- The delayed capture feature relies on the ability to model multiple disbursements against a single loan, with a common repayment cadence. Implementations should support creating a composite initial balance from multiple disbursements, updating the opening balance for each subsequent period as principal repayments reduce the loan balance.
- The per-period calculation must rely on the 360-day convention, with per-period days derived from the actual period length (e.g., 30 days, 31 days, or other durations as observed in multi-period scenarios). Interest is computed on the opening balance for the period and is added to the EMI for the period, with the remainder applied to principal.
- Adjustments due to refunds or reversals require proper allocation of refunds to principal and interest, and adjustments to the remaining balance and future payments, with the Fully Paid? flag updated .

---

If you need a translated, end-to-end synthetic example in your preferred format (e.g., a compact JSON payload for a test harness, or a compact Java-driven amortization snippet), I can produce it consistent with the explicit calculations and the exact figures shown in the reference data.