# Actual year calculation considering leap year

The enhancement to Pepper-Soup's Interest and Accrual capabilities introduces support for the Actual/Actual day-count convention, i.e., calculating interest using actual days in each year and adjusting for leap-year periods. This change matters for day-to-day operations because it improves precision in interest accrual when loan cash flows occur across February and across leap-year boundaries. In practice, this means interest is accrued using the exact number of days in the relevant year (including February 29 in leap years) rather than assuming a fixed 365-day year. The reference calculations demonstrate how period-by-period accrual factors and day counts interact with loan terms and repayments under this convention.

### What changed and why it matters
- The system now supports actual days in year for interest rate calculations, which aligns accrual with the real calendar in periods that cross year boundaries or leap days. This reduces rounding drift and improves alignment between the scheduled cash flows and the actual days outstanding.
- Day-count configuration for affected loans uses:
 - Days In year: ACTUAL
 - Days In month: ACTUAL
 These settings drive per-period accrual with true calendar days rather than a fixed year assumption.
- The calculation context now includes per-period rate factors that reflect actual days in the period, including months with different day counts (notably February in leap vs non-leap years). The reference calculations show rate-factor values such as 1.036986301 for a 30-day period and 1.038219178 for a 31-day period, illustrating how period length influences the accrual multiplier.
- For operational integrity, the opening balance of each period equals the preceding period's closing balance, and repayment allocations reconcile with the scheduled EMI so that principal and interest components add up to each period’s payment.

### How the system applies actual year day counting
- For each accrual period, the system determines the actual number of days in that period and the actual number of days in the year(s) that contain that period. If a period spans year boundaries or includes February in a leap year, the calculation uses the standard per-year day counts.
- The interest for a period is calculated using the loan’s stated annual rate and the exact proportion of days in the period relative to the days in the year. The result is expressed via a period rate factor (Rate factor) and a Rate factor minus one (Rate factor-1) value, which together reflect the exact accrual for that period.
- The detailed schedules illustrate how a loan’s balance evolves with each payment under this convention, including the distribution of interest and principal and the resulting opening and closing balances.

### Example scenarios from the calculation references
Note: The cases below are extracted from the reference calculations and demonstrate actual-year day counting in practice. Values shown are observed in the system's published calculation references.
- S1 – Feb month split between periods
 - Principal: 10,000
 - Interest Rate context: 0.09482 with day-count elements shown as actual-year fractions in the period calculations
 - Periods exhibit monthly repayments with an EMI of 1,713.21 and a total interest of 279.23 across the schedule, with Day Count configured as ACTUAL for the period. The per-period rate factor observed is 1.008053205 for the initial sub-periods and progresses as periods advance.
- S2 – No February month, leap year
 - Principal: 15,000
 - Interest rate context: 12% with ACTUAL days in year and ACTUAL days in month
 - A 4-payment schedule shows EMI of 3,845.41, with interest portions per period (for example, 152.88 in the first month) and a total interest of 381.66 over the full schedule. The balance evolves from 15,000 down to 0 across the four payments, reflecting actual-day accrual in a leap-year context.
- S3 – February in one period (disbursement on 31 October 2023)
 - Principal: 245,000
 - Interest Rate context: 0.45% (annualized), with per-period factors reflecting actual days in the period
 - The first period shows a 30-day window with a rate factor of 1.036986301 and a per-period interest component that contributes to the period’s EMI, yielding a closing balance aligned with the schedule.

> These examples illustrate how actual-year day counting affects per-period accrual factors and the resulting repayment schedules when leap-year days are present or when periods cross year boundaries. The per-period rate factors (Rate factor) and their complements (Rate factor-1) serve as the primary indicators of accrual magnitude for each period.

### How business rules are applied (summary)
- Day count method for affected loans must be set to Actual year with Days In year = ACTUAL and Days In month = ACTUAL.
- Each accrual period uses the exact number of days in that period and the number of days in the associated year, including leap-day handling .
- The per-period interest portion and the remaining principal are derived from the period’s accrual factor and the EMI, with the opening balance of the period equal to the prior period’s closing balance.
- Repayment and interest allocations reconcile to verify total repayments equal the scheduled EMI, and all balances reconcile period-to-period.

### Operational considerations and migration
- If loans are already configured with the Actual year day-count settings, accruals and repayment schedules will automatically use the updated Actual year logic without manual migration steps.
- For periods that cross February and leap-year boundaries, expect slight adjustments in per-period accrual amounts and rate factors compared with a fixed-year assumption. The reference calculations demonstrate how the rate factors adjust with month length and leap-year context.
- When generating or reviewing repayment schedules, verify the per-period Rate factor and Rate factor-1 values, the period's actual days, and the alignment of opening balances with prior closing balances. These checks help verify financial integrity and reconciliation across the schedule.

### Navigation and verification
- Location for day-count behavior: Interest and Accrual > Day count > Actual year calculation
- Verification steps (operational workflow):
 1) Open the loan’s day-count configuration and confirm Day Count Method is set to Actual year.
 2) Confirm Days In year and Days In month are set to ACTUAL for the loan.
 3) Generate or view the repayment schedule to observe per-period Rate factors (Rate factor) and the per-period interest (Int column in the schedules).
 4) Check that the opening balance of each period equals the previous period’s closing balance, and that the sum of principal and interest for each period equals the EMI.
 5) For periods spanning February of a leap year, verify that the schedule reflects the standard period lengths and rate factors consistent with actual days in the year.

### Quick reference: practical takeaways
- Actual year day counting uses the true number of days in each year to proportion the annual rate across periods.
- February’s leap-day effects are handled automatically, resulting in period-specific rate factors that reflect the exact days in the year.
- Opening balances and period allocations remain reconciled on every period, verifying an auditable, consistent repayment progression.

### Appendix: terminology and concepts
- Actual year calculation: A day-count convention that uses actual days in the year for interest accrual; February days and leap-year adjustments are incorporated into period calculations.
- Rate factor: The per-period accrual multiplier derived from the period’s day count and the loan’s annual rate; used to compute the period's interest portion.
- Rate factor-1: The incremental daily/period rate implied by the rate factor, representing the portion of the period’s accrual attributed to interest.
- Opening balance: The loan balance at the start of a period, which must equal the previous period’s closing balance.

This page documents the verified behavior of Actual year calculations as implemented. It describes how day counts, period lengths, and leap-year considerations influence per-period accruals, repayment schedules, and balance reconciliation, and it provides representative examples from the system’s calculation references to illustrate expected outcomes in practice.