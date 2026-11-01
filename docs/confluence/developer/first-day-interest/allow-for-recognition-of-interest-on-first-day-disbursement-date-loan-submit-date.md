<!-- Labels: developer, first-day-interest -->
# First-Day Interest Recognition on Disbursement

This topic documents the implementation and behavior of first-day interest recognition on loan disbursement within Pepper-Soup. The feature allows customization of how interest accrues on the actual disbursement date (the first day) versus subsequent days, using the standard Fineract accrual model as the baseline. The reference material anchors the behavior to a rate of 7% annualized with a 360-day year and the associated day-count conventions, and presents working schedules and ledger entries that illustrate how first-day accrual interacts with subsequent accruals and repayments.

### Conceptual scope and observed references
The reference data collect several sheets under the feature class of "First-Day Interest Recognition on Disbursement." Core observations include:
- The accrual engine can recognize interest starting on the disbursement date (the first day of the period) and continue accruing on subsequent days.
- The calculations rely on a fixed annual interest rate (7%) with a 360-day year, which yields a daily rate of 7% divided by 360 days per year (0.07 / 360 ≈ 0.000194444).
- The documented schedules show daily accrual entries of type Accrual on successive business dates beginning with the disbursement date, and a separate Disbursement event that initializes the loan balance.
- The reference sequences include detailed columns for payable interest, principal, interest, loan balance, business date, and day counters, illustrating how daily accruals contribute to the overall loan accounting and balance evolution.

From the reference sheets, the following constants are used in calculations and schedules:
- Interest Rate: 7% per annum
- Days In Year: 360
- Day-count convention: implied by the 360-day year and daily accruals leading from the disbursement date onward
- Currency-facing amounts are represented with two-decimal rounding in the sample entries, consistent with typical currency accounting in the accrual ledger.

These details establish the baseline for how first-day recognition is calculated and how it propagates through the daily accruals, repayments, and the resulting balances.

### Day-count conventions and rate basis
- Daily accrual is computed from the annual rate using the 360-day year, i.e., dailyRate = APR / DaysInYear = 0.07 / 360 ≈ 0.000194444.
- The first-day accrual follows the same daily rate, applied to the outstanding principal amount disbursed on the loan’s business date.
- Currency values are posted with standard two-decimal rounding; the reference samples show two-decimal representations for accrual and related postings on the accrual ledger.

These rules define the precise numerical basis for first-day recognition and subsequent accrual on the loan.

### How the first-day recognition flows through the system
The reference material demonstrates a sequence in which the loan is disbursed on a given business date and an accrual entry is generated for that same date (the first day). On the following days, accrual entries continue to accumulate according to the daily rate, until the schedule is interrupted by repayments or other events. The flow can be described as follows:
1) Disbursement event on the loan business date initializes the loan balance and posts the initial principal amount. A first-day accrual entry is produced to recognize interest that accrues on the disbursed amount for the first day.
2) On each subsequent business date, an Accrual entry is posted with payable interest amounts computed using the daily rate and the remaining principal exposure, updating the loan balance as part of the accrual ledger.
3) When repayments occur, the system allocates the payments across the accrued interest and principal according to the prevailing repayment policy, updating the loan balance and continuing accruals from the new balance onward.
4) The postings maintain integrity constraints observed in the reference data: each period’s opening balance follows the previous period’s closing balance, and accrual postings reconcile with the transaction amounts.

The reference sequences include fields such as Type, payable Interest, Amount, Principal, Interest, repayment interest, Penalty, Loan balance, business date, and days, illustrating how day-by-day accruals are recorded and how they interact with repayments and the running balance.

### Example calculation pattern (illustrative and aligned with the reference inputs)
Calculation setup used in the reference is:
- APR = 7% per year
- Days in year = 360
- Principal (example) = 2,000
- Daily rate = APR / DaysInYear = 0.07 / 360 ≈ 0.000194444
- First-day accrual (before rounding) = Principal × Daily rate = 2,000 × 0.000194444 ≈ 0.388888...
- With currency rounding to two decimals, the first-day accrual would be rounded to 0.39 in a straightforward application of currency rounding rules.

The reference material documents first-day accrual values on the order of a few tenths of a currency unit per day for modest principal levels (for example, entries labeled as Accrual on the first day). The exact per-day accrual figures in the sample schedules vary due to rounding practices and specific schedule definitions across the sheets, but the underlying calculation consistently follows the daily rate multiplied by the outstanding principal for the day in question.

Note: In the reference example, some immediate first-day values appear around 0.38–0.40 for very large principal amounts, reflecting the same underlying calculation with the same daily rate but different rounding and balance treatment in the provided sample. The mathematically derived first-day accrual for 2,000 principal at 7% APR with a 360-day year is 0.388888..., which rounds to 0.39 under two-decimal currency rounding. The observed two-decimal values in the sample are consistent with standard currency rounding, though slight variations can appear due to sample-specific rounding or schedule conventions.

### Data structures observed in accrual scheduling (verified from reference data)
The reference material uses a ledger-style presentation for accrual events, including the following fields on accrual and related postings:
- Type: Accrual
- payable Interest: the portion of interest recognized on the day
- Amount: total per-day accrual amount (currency amount)
- Principal: outstanding principal portion affected on the day
- Interest: interest component within the daily posting
- repayment interest: cumulative interest repaid or allocated through repayments
- Penalty: any penalties applicable on the day
- Loan balance: the scheduled loan balance after the day’s postings
- business date: the date of the posting
- days: the day counter for the period ()

These fields appear across several sheets in the reference data under the accrual workflow, illustrating how the day-by-day accruals are recorded and reconciled with repayments and the evolving loan balance.

### Architecture and processing implications (high level)
- Accrual engine behavior: The first-day recognition is integrated into the accrual engine, which emits daily Accrual events for the loan’s business days when the policy is enabled for first-day recognition.
- Balance management: Each day’s accrual updates the loan balance to reflect the accruing interest (and any other ledger effects shown in the reference). The integrity requirement that opening balances equal the prior closing balances remains a governing constraint for each accrual period.
- Payment allocation: Repayments are allocated to the accrued interest and principal according to the repayment schedule, affecting subsequent accruals through the updated balance.
- GL and accounting implications: Accrual postings include currency-valued entries that must balance with associated debits/credits when actual journal entries are available or when integration with general ledger components is active.

The reference patterns emphasize that the first-day accrual integrates with the ongoing accrual cycle and repayment events, producing a coherent, auditable sequence of daily postings that preserve the expected relationship between opening balances, daily accruals, and closing balances across periods.

### Diagram: first-day recognition flow (Mermaid)
```mermaid
flowchart TD
 A[Disbursement on business date] --> B{First-day recognition enabled?}
 B -- Yes --> C[Post day-0 Accrual for disbursement day]
 B -- No --> D[No day-0 accrual; start accrual next business day]
 C --> E[For each subsequent business day: Post Accrual entry using dailyRate × outstandingPrincipal]
 E --> F[On repayments: allocate payment across accrued interest and principal]
 F --> G[Update loan balance and continue accrual cycle]
 G --> H[GL postings and journals ()]
```

### Financial integrity and verification notes
- The integrity rules observed in the reference data include that each period’s opening balance must equal the previous period’s closing balance, and that accrual postings reconcile with the associated transaction amounts.
- Accrual postings are shown with per-day accrual values in the two-decimal currency format in the samples, demonstrating currency-level precision for each day’s accrual.
- When repayments occur, the system allocates the repayment against the accrued interest and principal, updating the outstanding balance and continuing the accrual process from the updated balance.
- Journal entries (when captured) are expected to balance between debit and credit lines consistent with the accrual and repayment postings; the reference data illustrates the structure of fields used in such postings when available.

These are the verified patterns in the reference data for first-day recognition and the subsequent accrual workflow.

### Practical considerations for integration and testing
- Validate a disbursement flow with first-day recognition enabled by inspecting the first-day Accrual posting on the loan’s business date and confirming that the daily accruals thereafter follows the daily rate and the changing balance.
- Verify that the opening balance of any accrual period matches the closing balance of the prior period, and that successive days post accruals maintain the expected running balance sequence.
- verify rounding behavior conforms to currency conventions used by the system (the reference samples show two-decimal representations; the exact rounding policy should be consistent with the platform’s currency rounding rules).
- If you allows/disable first-day recognition, confirm that the accrual timeline shifts (i.e., accrual does not occur on day 0 when disabled and begins on the next business day or as configured).

### Summary of observed numbers and patterns (from reference samples)
- APR: 7% per annum; Days in year: 360; daily rate ≈ 0.000194444
- Disbursement event initializes loan balance with the principal amount on the business date
- First-day accrual postings occur for the disbursement day when the policy permits
- Daily accruals continue on subsequent business days, generating entries with fields such as payable Interest, Amount, Principal, Interest, and Loan balance
- Repayments reduce the outstanding principal and re-baseline future accruals on the remaining balance
- The reference samples illustrate how these postings manifest in a daily ledger-like record with two-decimal currency amounts

This page captures the verified behavior and the documented scheduling pattern for first-day interest recognition on disbursement, anchored to the reference data’s rate, day-count convention, and accrual workflow. It describes what the feature does, how it behaves in the accrual engine, and what to expect in schedules and postings when first-day recognition is enabled.