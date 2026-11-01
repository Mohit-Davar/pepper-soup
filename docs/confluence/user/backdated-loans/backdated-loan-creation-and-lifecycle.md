<!-- Labels: user, backdated-loans -->
# Backdated Loan Creation and Lifecycle

This page documents how Pepper-Soup supports backdated loan creation and the associated lifecycle. The feature allows creating loans where the disbursement date may precede the current date and then walking through the resulting repayment schedule, including adjustments when dates are rescheduled, when early or late payments occur, and when multiple disbursements or adjustments are involved. The calculations and schedules described here are grounded in the system’s backdated loan capabilities and their impact on opening balances, principal and interest allocations, and the ongoing loan balance through each period.

Audience-focused summary
- Operations staff, loan officers, branch managers, and credit agents use backdated loan functionality to reflect real-world origination dates and to align repayment expectations with contractual terms.
- The lifecycle governs how the loan’s balance and instalment schedule respond to backdated creation, rescheduling of due dates, and subsequent payments, including early payments and prepayments.

Scope and concepts
- Backdated creation starts with issuing a loan whose disbursement date is in the past relative to the current date. The system then generates or adjusts the repayment schedule to reflect that backdated start.
- The loan’s lifecycle includes rescheduling of due dates, which can change the timing of principal and interest allocations for affected periods.
- For clarity, each period in the repayment schedule has an opening balance, an instalment (EMI), and a breakdown into principal and interest. The opening balance of a period must equal the closing balance of the preceding period.
- The calculation engine uses the period’s rate factor to determine interest and EMI allocations. When a period is rescheduled, the balance and allocation for that and subsequent periods are updated .

Key terminology and rules (high level)
- Balance progression: Each period’s opening balance equals the previous period’s closing balance. As payments are recorded, the balance decreases by the principal portion of the instalment.
- Interest accrual per period: Interest for a period is calculated on the outstanding balance at the start of the period, using the period’s rate factor and the days in the period. The general form is discussed in the calculation section below.
- Principal allocation: The EMI is split between principal and interest. Any adjustment to the schedule (for example due-date changes) recalculates these allocations, and the resulting new balance feeds into subsequent periods.
- Rescheduling outcomes: When the due date(s) are moved, the period(s) affected by the reschedule show revised principal, interest, and balance values in the new timeline. See the illustrative examples in this page for concrete numbers.
- Early and late payments: The system supports early repayments and late payments with associated recalculations. In early repayment scenarios, portions of interest and/or principal may be allocated differently to follows the actual payment date; subsequent periods’ interest is recalculated against the updated balance.

## Calculation model at a glance
The backdated loan calculation relies on standard amortization concepts adapted to backdated scenarios. The core formulas used by the system are as follows:

- Interest for a period (per period):
 Interest = Balance × (Rate / Year) × (ActualDaysInPeriod / DaysInYear)
 Notes:
 - Rate is the annual nominal rate (expressed as a decimal, e.g., 7% = 0.07).
 - DaysInYear depends on the configured convention (commonly 360 or 365; see the period convention used for the loan).
 - ActualDaysInPeriod reflects the number of days from the period start to period end used in the calculation.
 - Rounding: values are shown with two decimal places in the schedules.

- EMI (per period) and its principal and interest components:
 EMI and the split between principal and interest are derived from the period’s rate factor (RateFactor). The system uses a rate factor that reflects the interest accrual for the period. A representative form used in backdated calculations is:
 EMI = (RateFactor × Principal) / Fn
 where RateFactor is computed from the defined rate conventions for the period (monthly, weekly, or daily variants), and Fn is a normalization factor based on the total number of periods.

- Rate factor (monthly convention, example):
 RateFactor = 1 + (Rate × (RepaidEvery × DaysInMonth / DaysInYear) × ActualDaysInPeriod / CalculatedDaysInPeriod)
 This formulation captures how the period’s accrual interacts with the loan’s schedule when dates shift.

- Installment breakdown (example structure):
 EMI, Principal, and Interest are presented per period. The balance after a period equals the opening balance minus the principal paid in that period.

The following calculation example uses a standard monthly period with a backdated start to illustrate the mechanics. It mirrors the approach demonstrated in exposure data for a single-period reschedule scenario.

## Illustrative calculation: single-period backdated start with one due-date reschedule (S1)
Context: A loan with a principal of 100, an annual interest rate of 7%, a 360-day year, and a 30-day month, with repayments every month. The first period begins on the disbursement date and ends one month later. The example demonstrates the first period’s calculations and confirms consistency with the schedule data.

- Inputs for the first period:
 - Opening Balance (Day 0): 100.00
 - EMI (period instalment): 17.01
 - Interest rate: 7% per year
 - Days in year: 360
 - Days in period (first month): 30
 - Days in month as the calendar used for the example: 30

- Step-by-step calculation for the first period:
 1) Calculate interest for the first period:
 Interest = Opening Balance × Rate × (Days in period / Days in year)
 = 100.00 × 0.07 × (30 / 360)
 = 100.00 × 0.07 × 0.083333...
 = 0.5833, which is shown as 0.58 in the schedule (rounded to two decimals).
 2) Determine principal component of the EMI:
 Principal = EMI − Interest
 = 17.01 − 0.58
 = 16.43 (rounded to two decimals).
 3) Update the period balance:
 New Balance = Opening Balance − Principal
 = 100.00 − 16.43
 = 83.57.

- Result verified against the period data:
 - Period date: 2/1/24
 - Opening balance: 100.00
 - EMI: 17.01
 - Principal: 16.43
 - Interest: 0.58
 - Balance after payment: 83.57
 This matches the calculation steps above and the first-entry values shown in the calculation reference data.

Notes:
- This single-period calculation demonstrates the fundamental relationship among EMI, interest, principal, and balance in a backdated setup. Subsequent periods follow the same logic with updated opening balances.
- When a schedule is later rescheduled (for example, moving a due date from 2/1/24 to 3/1/24), the balance and the period’s principal/interest allocations for that and affected periods adjust , as shown in the S1/S2 examples documented below.

## Scenarios: how backdating interacts with rescheduling and lifecycle events
The reference materials illustrate a set of representative backdated scenarios. The key takeaways for operations and servicing staff are:
- S1: One due date reschedule
 - The original state shows the schedule with a single due date and its associated balance, EMI, principal, and interest values.
 - When the due date is moved from 2/1/24 to 3/1/24, the original and new timelines show different opening and closing balances and different allocations per period. For example, after rescheduling, the 3/1/24 line shows Balance of 84.12, EMI 17.01, Principal 15.88, Interest 1.13, with actual gap 60 days and a 30-day fixed window.
- S2: Two due date reschedules
 - This scenario documents moving two due dates (for example, from 2/1/24 to 3/1/24 and subsequent period adjustments). The original state has a first-period balance of 100.00 and then 2/1/24 shows Balance 83.57 with EMI 17.01, Principal 16.43, and Interest 0.58. After the reschedule to 3/1/24, the subsequent line shows Balance 84.12, EMI 17.01, Principal 15.88, Interest 1.13, reflecting the revised amortization path.
- The charts and tables in the reference material illustrate the mechanics of how opening balances, principal, and interest allocations shift when backdated disbursements and reschedules occur.

Note: The calculation references include additional scenarios describing early repayments, preclosures, partial refunds, and multi-disbursement cases. These scenarios demonstrate how the system reallocates interest and principal as payments are aligned with actual dates and how the balance tracks through subsequent periods. The core principle remains: the schedule is dynamically adjusted to reflect backdated events, while maintaining the integrity constraints that govern period-to-period balances.

## 1) Parameter and calculation reference (illustrative views)
The following two formulas capture the core logic used by the system in backdated scenarios. They are presented here to illustrate the consistent, rule-based approach the system applies when building and adjusting repayment schedules.

- Installment and balance mechanics (monthly convention):
 - Interest for a period: Balance × Rate × (ActualDaysInPeriod / DaysInYear)
 - EMI allocation: EMI is the fixed period instalment; Principal = EMI − Interest
 - New balance after period: Opening Balance − Principal

- EMI computation placeholder (rate factor view):
 EMI = (RateFactor × Principal) / Fn
 RateFactor is derived from the period’s rate conventions (monthly/daily/weekly) and the alignment of days in period versus the year.

The reference materials present concrete exemplars for the single-period and multi-period reschedule cases (S1, S2, etc.) and show how the numbers propagate through the loan’s life when the backdated date(s) impact the schedule. Where a period’s dates shift, subsequent periods adopt the updated opening balance and recalculate their interest and principal portions .

## 2) Operational outcomes and reconciliations
- Opening balances for each period must equal the closing balance of the preceding period, preserving consistency across the lifecycle.
- Payment allocations must reconcile with the transaction amount and with the EMI as defined by the schedule for that period. If a payment arrives earlier or later than the scheduled date, the system uses the actual date to determine how much of the EMI is allocated to interest versus principal for the affected period(s).
- Remaining cash and outstanding dues must reconcile with the updated balances and the attempted payments; when backdated adjustments occur, the system replays the amortization with the new starting point and recalculates subsequent periods .
- In edge cases involving early repayments, partial payments, or payoffs, the system reallocates amounts first to interest as standard for the period, and then to principal; any remaining balance carries forward to the next period with recalculated interest based on the updated balance.

## 3) Important considerations for operations
- Backdated loan creation introduces a revised amortization path. Staff should review the resulting schedule to verify the balance progression remains coherent (opening balance equals prior closing balance, period EMI follows the period’s allocation, and totals reconcile).
- When rescheduling due dates, look for changes in the principal and interest components in the affected periods. The examples show how the same EMI can be allocated differently across periods when dates shift.
- If multiple disbursements are involved in a backdated loan, the calculation engine re-aggregates the balance and recalculates periods to reflect the consolidated exposure; the resulting EMI and allocations reflect the combined effect of all disbursements on the repayment timeline.
- For accurate servicing, compare the backdated loan’s current period balance and next-period projections against the recorded payments to verify the schedule remains aligned with the loan’s contractual terms.

## Appendix: quick references (conceptual, not UI specifics)
- Backdated loan lifecycle centers on the dynamic recalculation of repayment schedules when dates are changed or payments are made ahead of schedule, with the balance progression remaining the anchor of truth across periods.
- Core calculations rely on the standard amortization concepts described above, applied with backdated start dates and date-aligned days-in-period conventions.

If you need to see the concrete numbers for a specific backdated scenario (dates, balances, and allocations) from the reference view, refer to the representative S1 and S2 example entries for single and dual due-date reschedules, which illustrate how balances and allocations shift when a due date is moved forward.