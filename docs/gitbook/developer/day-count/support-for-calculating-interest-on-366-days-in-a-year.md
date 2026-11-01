# Calculating interest on 366 days in a year

The Pepper-Soup financial module supports region-aware day-count conventions for interest accrual, including explicit handling of leap years. This enhancement allows per-region calculation rules that follows regulatory expectations in US and German loan terms, and provides configurable leap-year strategies for how the denominator in the interest fraction is determined. The core idea is that the interest earned over a period is proportional to the actual number of days in that period (the numerator) divided by a denominator that reflects whether that period falls in a leap-year context. The resulting ratio is multiplied by the nominal annual rate and the principal to yield the accrued interest for the period.

### Day-count conventions by region

The reference specifications describe two regional conventions, each expressed as an interest accrual formula using a day-count fraction of the form (days in period) / (denominator). The numerator is the actual number of days in the interest period. The denominator depends on the region and the leap-year rules in force for that region.

- **US LT – Interest Basis/Accrual: C 366/366 / FIRST**. In this method, the exact number of days in the period is used as the numerator. The denominator is 365 in a non-leap year and 366 in a leap year. The calculation follows the standard currency accrual pattern where the period’s day count is scaled by the standard year-length.

- **DE LT – Interest Basis/Accrual: C2 366/366 / FIRST**. This method is similar to the US approach but requires a leap-year condition to adjust the denominator. The denominator is 366 only if the 29th of February falls within the interest period; otherwise, the denominator is 365 even if the calendar year is a leap year and the period does not include February 29.

These rules determine how much interest accrues over each period, and they directly influence daily accrual schedules, period-end balances, and downstream accounting entries.

### Leap-year handling and configuration options

Acceptance criteria define two configurability options for leap-year handling, allowing systems to adapt to regulatory or product-specific preferences.

- Option A: yearly leap-year adjustment. The yearly calculation uses 366 days when the loan term includes a leap year (i.e., the term contains February 29 at least once) and 365 days when it does not. In practice, this means Denominator is 366 for periods overlapping a leap-year year and 365 otherwise.

- Option B: February-29 dependent adjustment. The denominator is 366 only if the interest period actually includes February

29. If the period does not include February 29, the denominator remains 365, even in a leap year.

These options map to the regional conventions as follows:

- For US LT, the baseline concept is that the denominator depends on whether the year containing the period is a leap year. Option A interprets this as a per-loan-year rule (the loan as a whole having a leap-year in its term). Option B follows the DE LT approach, where the inclusion of February 29 within the specific interest period drives the denominator.

- For DE LT, Option B is effectively the embodiment of the specification’s rule: 366 only if the period includes Feb 29; otherwise 365.

The system must expose these choices so that administrators can select the standard strategy for a given loan product or jurisdiction. The selected option governs all interest calculations within the loan’s accrual periods.

### Calculation method and formula

For a given interest period, the interest is calculated using a day-count fraction times the annual rate and the principal. The general form is:

- Interest for the period = Principal × AnnualRate × (D / Den)

Where:

- D = the actual number of days in the interest period (the numerator).
- Den = the chosen denominator according to the region and leap-year policy described above.

Region-specific semantics:

- US LT (C 366/366 / FIRST): Den = 365 if the period is entirely within a non-leap-year year; Den = 366 if the period lies within a leap-year year. D is the exact count of days in the period.
- DE LT (C2 366/366 / FIRST): Den = 366 if the interest period includes February 29; otherwise Den = 365, regardless of whether the calendar year is a leap year.

Under both conventions, the numerator D must represent the true length of the period, and the denominator must reflect the selected leap-year rule. Interest accrual calculations must be performed with precise arithmetic and consistent rounding according to the system-wide financial rounding policy.

### Calculation workflow (high level)

1) Determine regional convention and the active leap-year handling option (A or B) for the loan.
2) Identify the interest period (start date to end date) and compute D as the number of days in that period.
3) Compute Den using the region-specific rules and the selected leap-year option:
 - For US LT: Den = 365 for non-leap-year periods; Den = 366 for leap-year periods.
 - For DE LT: Den = 366 if Feb 29 falls within the period; else Den = 365.
4) Calculate Interest = Principal × AnnualRate × (D / Den).
5) Apply the calculated interest to the period’s accrual schedule and, , post to accounting entries according to the standard reconciliation rules.

Notes:
- When a loan spans multiple years with differing leap-year statuses, the calculation for each period should apply the applicable Den for that period, as determined by the active regional rule and chosen leap-year option.
- The acceptance criteria emphasize configurability rather than a single, fixed rule, so the system must consistently honor the selected option across accrual periods for a loan.

### Edge cases and guidance

- Periods entirely within a non-leap year use Den = 365 under the given conventions.
- Periods that include February 29 vary by region:
 - US LT: Den is determined by whether the period is within a leap-year calendar context (as described).
 - DE LT: Den is 366 only if February 29 lies within the period; otherwise, Den is 365 regardless of whether the year is a leap year.
- If a period begins before February 29 and ends after February 29 within a leap year, the period includes February 29, and Den adjustments follow the regional rule in force.

### Example structure (symbolic values)

To illustrate the calculation in a non-numeric form, consider a loan with principal P and annual rate r over a period containing D days. Under a chosen Den, the period interest is:

- I = P × r × (D / Den)

Where Den is determined by the regional rule and leap-year option in force.

If you substitute actual numeric values for P, r, and D, the computation yields the period’s accrued interest, which then integrates into the loan’s daily accrual schedule and, subsequently, the general ledger posting workflow.

### Architecture and persistence impact

This enhancement introduces region-aware day count logic into the interest accrual pathway. The accrual engine now consults a per-loan configuration that selects the leap-year policy (Option A or Option B) and the regional convention (US LT or DE LT). The engine uses the chosen policy to determine the denominator for each accrual period, computes the day-count fraction, and derives the period’s interest amount. The resulting interest is added to the period’s accrual record and reconciled against the loan balance. Downstream, accrual updates propagate to the periodic schedule calculations and to the accounting layer, verifying consistency between calculated interest, posted entries, and the resulting balances.

### Diagram: decision flow for leap-year handling

````mermaid
flowchart TD
 A[Start] --> B{Region}
 B -->|US LT| C[Use US leap-year rule]
 B -->|DE LT| D[Use DE leap-year rule]
 C --> E{Leap-year option}
 D --> E
 E -->|Option A| F[Determine Den: 366 if term includes a leap year, else 365]
 E -->|Option B| G[Determine Den: 366 if period includes Feb 29, else 365]
 F --> H[Compute D: actual days in period]
 G --> H
 H --> I[Compute I = P * r * (D / Den)]
 I --> J[Update accrual schedule and GL postings]
 J --> K[End]
````

### Summary of behavior

- The system supports region-based day-count conventions for interest accrual with explicit leap-year handling.
- Two configurable leap-year strategies are available to determine the denominator used in the day-count fraction.
- US LT and DE LT define their own sensitivities to leap years and February 29 in determining Den and thus the resulting interest for any period.
- Administrators can configure which leap-year policy applies to a loan, enabling alignment with local regulations and product-specific requirements.

If you require further elaboration on how these rules map to specific loan products or how to surface the configuration in the user interface, refer to the system-wide configuration documentation for region-based day-count conventions and leap-year options.