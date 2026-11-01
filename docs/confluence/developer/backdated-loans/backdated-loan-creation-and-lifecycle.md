<!-- Labels: developer, backdated-loans -->
# Backdated Loan Creation and Lifecycle

This page defines the backdated loan creation and lifecycle feature as observed in the Pepper-Soup scope, focusing on architecture, processing behavior, and the algorithms that drive backdated disbursement, migration marking, repayment scheduling, and payment allocation. It documents verified behavior, concrete calculations, and the relationships between disbursement dates, day-count conventions, rate factors, and the repayment schedule. The material emphasizes the lifecycle from loan creation through migration-mode operation to regular repayment processing, and it explains how schedules are generated and adjusted in response to payments that occur before or after their due dates.

### Conceptual overview and component boundaries

Backdated loan creation belongs to the domain that governs disbursement timing and repayment scheduling. The feature allows creating a loan with a backdated disbursement date and, during a migration or backbook process, marks the loan as being in migration. The repayment schedule is generated according to the selected day-count conventions and rate application rules, and it remains subject to subsequent payment events and schedule replays.

In terms of module boundaries, the behavior is implemented within the disbursement and schedule calculus domain (the component responsible for calculating loan amortization, accruals, and repayment allocations). The implementation relies on a fixed set of calculation primitives, including rate factors, installment arithmetic, and a per-period balance progression, to produce a consistent opening balance for each period and a closing balance after every installment.

### Key concepts and rules that drive the lifecycle

- Backdated loan creation is supported with a migration-marking step. The loan instance can be created with a backdated disbursement date and then placed into a migration state for subsequent processing. This is reflected in the lifecycle where the schedule is derived from the backdated context before standard repayments resume.
- The repayment schedule is computed using period-by-period rate factors that translate the annual interest rate into per-period accrual. The per-period rate factor is used to derive installment interest and principal portions.
- The opening balance of each period must equal the previous period’s closing balance, preserving schedule integrity across the entire amortization. Where the period is the first entry, the opening balance is the loan’s initial disbursed balance.
- Payment allocations follow an explicit rule set that prioritizes interest first, then principal, consistent with the repayment logic observed in the reference calculations.
- The system supports multiple day-count conventions and period definitions (monthly, daily, weekly), affecting how rate factors are computed and how EMI components are allocated. The common monthly convention uses a 360-day year with 30-day months in the provided references, while other variations employ different day-count rules.

### Formulas and exact calculations used for standard backdated scenarios

The reference calculations describe two core formulas used to generate and evaluate the repayment schedule for backdated loans.

1) EMI and rate factor foundations
- EMI calculation approach (per-period amortization with rate-factor adjustments):
 EMI = sum over i from 1 to n of (Ri × principal) ÷ fn
 where:
 - Ri represents the rate factor for period i, a per-period multiplicative engagement of interest into the balance.
 - fn denotes the total number of periods in the amortization, i.e., the divisor to normalize the per-period contributions into a single installment amount.
- Installment interest per period: 
 Interest for a period = base principal balance × (RateFactor − 1)
 The RateFactor for a given period captures the effect of the interest accretion over that period.

2) Rate factor definitions and day-count conventions (monthly, with common 360-30 convention)
- For the monthly, fixed- EMI context, Rate factor is defined as:
 Rate factor = 1 + [ (rate of interest) × (repaid every × days in month ÷ days in year) × (actual days in period ÷ calculated days in period) ]
 In the 360-day year with 30-day months interpretation (typical for the examples in the reference), this reduces to a per-month factor close to 1 + (annual rate) × (30/360).
- A concrete illustration under a 7% annual rate with a 30-day month and a 360-day year yields:
 - Rate factor ≈ 1.005833333 per month (since 7% × 30/360 = 0.005833333). This follows the observed value in the schedule examples.
 - Starting balance: 100. The first period assigns an interest component of approximately 0.58 (rounded to two decimals) and a principal component of approximately 16.43, yielding a total EMI of 17.01 and a new balance of 83.57 after the first payment.

3) Example from the reference (360-30, single monthly period scenario)
- Inputs: Principal = 100, Interest Rate = 7% p.a., Days In Year = 360, Days In Month = 30, EMI cadence = 1 month, EMI = 17.01, resulting period values:
 - Opening balance (Period 1): 100
 - EMI: 17.01
 - Interest (Period 1): 0.58
 - Principal (Period 1): 16.43
 - Closing balance (Period 1): 83.57
- Verification steps show the following relationship:
 - Interest ≈ Balance × (RateFactor − 1) where RateFactor ≈ 1.005833333
 - Principal = EMI − Interest
 - Balance after payment = Opening balance − Principal
 The sequence then continues for subsequent periods with updated balances and recalculated interest and principal portions based on the new balance.

> Note: The reference materials include variations for daily, weekly, and other day-count conventions, as well as special cases like early repayments and backdated adjustments. The formulas above capture the standard monthly, 360/30 convention as demonstrated in the S1 calculation example; other variants follow the same structural pattern but with their respective rate-factor definitions and day-count parameters.

### Payment allocation and schedule replay semantics

- Allocation order: when a payment arrives, the system allocates to the current period by first applying any payable interest, then applying the remainder to principal, in accordance with the general payment allocation policy documented in the reference calculations.
- Recalculation on repayments: when a repayment occurs, the system may recalculate the remainder of the schedule. The reference describes a payable-details-driven flow that can result in updating the period-by-period principal and interest allocations as the outstanding balance evolves. In scenarios where a payment amount exceeds EMI minus payable interest plus projected interest, the system is described to move the excess principal to the next period and recalibrate future interest on the newer outstanding balance.
- Schedule integrity: the calculations verify opening balances per period follows the preceding period’s closing balances, maintaining a consistent and reconcilable amortization trail.

### Backdating and migration lifecycle in practice

- Creation: a backdated loan is created with a backdated disbursement date and marked as migrating. This signals that the loan will be processed with the specialized computation path that generates the repayment schedule under backdated conditions.
- Schedule generation: once created, the repayment schedule is produced using the chosen day-count convention and rate application rules (for example, the 360-30 monthly convention described above). The settlement of the schedule yields a per-period EMI, principal, and interest breakdown, along with opening and closing balances for each period.
- Migration and ongoing processing: during migration, the loan remains in the migration state while calculations and reconciliations proceed. After the migration processing completes and the loan transitions into normal operation, regular repayment processing continues with the existing balance and any new payments that arrive.

### Data and calculations: representative example (360-30 convention)
- Initial setup (S1 original state):
 - Disbursement date: 1/1/24
 - Principal: 100
 - Interest rate: 7% per annum (0.07)
 - Days in year: 360; Days in month: 30; Repaid every: 1 month
- First period (2/1/24):
 - Opening balance: 100.00
 - EMI: 17.01
 - Principal paid: 16.43
 - Interest paid: 0.58
 - Closing balance: 83.57
- This example confirms the application of a monthly rate factor of 1.005833333 and the resulting split EMI into interest and principal components that sum to the EMI amount.

<div class="calc-box">
 <div class="calc-title">Calculation</div>
 <div class="calc-step"><strong>Formula:</strong> EMI = sum_{i=1..n} Ri × principal ÷ fn; Installment Interest = Principal balance × (RateFactor − 1)
 </div>
 <div class="calc-step"><strong>Substitution (360-30 example):</strong> Rate factor ≈ 1 + 0.07 × (30/360) = 1.005833333; Interest ≈ 100 × (1.005833333 − 1) = 0.58 (rounded to 0.58); Principal ≈ 17.01 − 0.58 = 16.43; New balance ≈ 100 − 16.43 = 83.57</div>
 <div class="calc-step calc-result"><strong>Result:</strong> For the first period, Balance after payment ≈ 83.57; EMI ≈ 17.01; Interest ≈ 0.58; Principal ≈ 16.43.</div>
</div>

### Diagram: backdated loan lifecycle (high level)

<div class="mermaid">
flowchart TD
 A[Backdated Loan Creation] --> B[Mark loan as Migration] 
 B --> C[Generate Repayment Schedule (day-count conventions applied)] 
 C --> D[Opening Balance per period follows previous closing balance]
 D --> E[Apply Repayments] 
 E --> F[Allocate Interest First, then Principal]
 F --> G[Recalculate future periods if needed (payable details flow)]
 G --> H[Continue with standard repayment processing or complete migration]
</div>

### Edge cases and known considerations

- Day-count conventions: The reference materials illustrate multiple conventions (e.g., 360-day year with 30-day months; 365-day year; daily and weekly recalculation variants). The rate factor and EMI calculations adapt to the chosen convention. The standard monthly convention presented above is consistent with 360/30 in the provided examples.
- Leap year and year-split scenarios: Backdated and migration scenarios can interact with year boundaries (e.g., leap year boundaries) and yield small numerical differences (for example, EMI and period interest differences of the order of cents). The documents note observed discrepancies in cross-year comparisons when backdating and leap-year boundaries are involved; such cases require careful handling in scheduling and could lead to rounding differences if day-count conventions are altered across periods.
- Early, advance, and partial repayments: In events where a payment is made early or upfront relative to the scheduled due date, the reference describes a payable-details-driven flow to determine how much interest is payable in the current period and whether any part of the projected interest should be carried forward. The model may adjust the balance correction to avoid over-recognizing projected interest and may reallocate amounts to subsequent periods as needed.
- Balance and schedule integrity: The design guarantees that each period’s opening balance equals the previous period’s closing balance, verifying a traceable amortization path. Schedule replays and recalculations preserve that invariant, subject to the day-count conventions in use.

### Limitations and notes for integrators

- The materials focus on backdated loan creation, migration marking, and the amortization logic under various day-count conventions. They do not define REST API contracts, REST endpoints, or explicit event payload schemas for backdated loans. For integration work, rely on the module’s public interfaces and the documented calculation primitives rather than assuming specific REST paths or event formats beyond what is evidenced in the calculation and scheduling sections.
- The backdated migration feature is described in terms of its impact on scheduling and repayment processing, not as a separate external contract. When integrating with migration workflows, verify the loan is flagged as migrating and that the schedule is generated with the intended day-count convention before normal repayment flows resume.

### Glossary and quick references

- Rate factor: The per-period multiplier that translates the annual interest into per-period accrual for calculating installment components. It depends on the day-count convention in use.
- EMI (Equated Monthly Installment): The fixed payment amount that covers both interest and principal portions, derived from period rate factors and the loan principal according to the chosen convention.
- Installment Interest: The portion of an EMI that represents accruing interest for the current period, computed as OpeningBalance × (RateFactor − 1).
- Migration flag: A status indicating that a loan is in the process of being migrated/backdated and processed under backdated calculation rules before resuming standard operation.

If you are implementing or reviewing backdated loan functionality, focus on the alignment between the disbursement context, the chosen day-count convention, the rate-factor computation, and the per-period balance progression. The approach documented here intentionally preserves per-period balance continuity, applies interest accrual through rate factors, and respects the priority of allocating interest before principal during repayments, while providing a path to adjust calculations in response to early or advance payments in migration scenarios.