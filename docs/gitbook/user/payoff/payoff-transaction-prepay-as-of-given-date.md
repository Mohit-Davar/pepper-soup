# Payoff transaction(prepay as of given date)

The payoff transaction feature provides a dedicated API-based capability to determine the amount required to close a loan on a specific date. It returns the payoff amount that covers the loan's current outstanding balance plus any accrued interest up to the chosen date, including interest that has accrued but has not yet been billed. This capability supports early payoff scenarios and is used by operations staff, loan officers, branch managers, and credit agents to quote and process settlements with borrowers.

### What the payoff calculation does and why it matters

When a customer asks to close a loan early, the servicing system needs a precise, date-specific payoff quote. The payoff amount reflects the loan’s current amortization state and the accrual of interest from the last posting date through the requested payoff date. The calculation relies on the loan’s nominal interest rate and the standard day-count conventions used by the system, verifying the quote follows the amortization schedule and the loan’s accrual rules.

Key aspects of the operation:
- The payoff amount is calculated as the outstanding balance on the payoff date plus accrued interest up to that date.
- Accrued interest is determined using a daily rate derived from the loan’s nominal rate and the configured day-count convention: a 360-day year and 30-day months are used for accrual calculations in the payoff context.
- The result represents the amount needed to close the loan on the specified date and may be used to issue a payoff quote or to drive payoff processing.

### Calculation framework and verified behavior

The payoff engine uses the following verified inputs and conventions when computing the payoff amount:
- Nominal annual interest rate (for example, 7%).
- Day-count convention: 360 days in a year; 30 days in a month.
- Daily interest rate = annual rate / 360.
- The outstanding balance used in the payoff calculation is the balance visible on the loan amortization schedule as of the payoff date.
- Accrued interest is the product of the daily rate, the balance, and the number of days elapsing from the last payment date up to the payoff date, following the 360/30 convention.
- The payoff amount equals the balance as of the payoff date plus the accrued interest up to that date.

These rules are grounded in the reference data showing the standard interest parameters and the 360-day year with 30-day months used for accrual calculations. The payoff workflow maintains alignment with the current amortization state, verifying consistency between the opening balance of the period and the closing balance after payoff processing.

<div class="calc-box">
 <div class="calc-title">Calculation</div>
 <div class="calc-step"><strong>Formula:</strong> <code>Payoff = Balance_as_of_payoffDate + Accrued_interest(from_last_payment_date_to_payoffDate)</code></div>
 <div class="calc-step"><strong>Inputs:</strong> <code>Nominal_rate, DaysInYear=360, DaysInMonth=30, Balance, LastPaymentDate, PayoffDate</code></div>
 <div class="calc-step calc-result"><strong>Result:</strong> <code>Payoff amount owed to close the loan on the payoff date</code></div>
</div>

> Note: The payoff amount reflects only the amount to close the loan as of the requested date. It does not imply inclusion of other closing costs or discretionary fees unless such items are defined as part of the official payoff policy for the loan type and servicing channel.

### Inputs and outputs

1) Inputs required to perform a payoff calculation
- Loan identifier (loanId)
- Payoff date (PayoffDate)

2) Outputs provided by the payoff API
- Payoff amount: the amount required to close the loan on the specified date, including accrued interest not yet billed.

### How to perform a payoff calculation in the UI (procedure)

1) Open the payoff page via the navigation path: **Repayment and Allocation > Payoff > Payoff transaction(prepay as of given date)**.
2) In the payoff page, enter the borrower’s loan identifier in the field labeled **Loan ID**. The system validates the loan and loads the current amortization state.
3) Enter the desired payoff date in the field labeled **Payoff Date**. The date must be a valid date in the servicing system.
4) Click the button labeled **Calculate Payoff**. The system computes the payoff amount using the loan’s current balance and accrued interest up to the payoff date and then displays the result.
5) Review the displayed **Payoff Amount**. This figure represents the amount required to close the loan on the specified date. If you intend to proceed with closure, follow the standard payoff processing steps in your flow; otherwise you can save or export the quote for borrower discussion.
6) If the payoff is being committed, initiate the payoff transaction by following the institution’s closing procedures. The system will record the payoff as a closing event and update the loan status .

### Scenarios and rules (edge cases and policy families)

The payoff calculation supports several scenario families documented in the reference material. These describe how accruals are handled when a payoff occurs during or between scheduled payments, and how early payoff interacts with the normal amortization rhythm:
- S1 — Early payment with adjustment to next installment (preclose as of a given date): The calculation may use two strategies to define timing for accruals:
 - Strategy A: until the pre-closure date (preclose date), with optional interest recalculation enabled.
 - Strategy B: until the rest of the period’s frequency, with accruals continuing according to the original schedule until the defined rest frequency.
 In both variants, the payoff amount includes accrued interest up to the chosen payoff date and follows the loan’s rate and day-count conventions.
- S2 — On overdue loans (late prepayment): For loans overdue by a scheduled installment, the payoff calculation continues to accrue interest using the same rate conventions, with the accruals based on the rate factor and the defined daily accrual, up to the payoff date.
- S3 and S4 — Early payoff adjustments to the next or last installment: These families describe adjustments to the next installment or the last installment when performing an early payoff. The core principle remains that the payoff amount reflects the outstanding balance plus accrued interest through the payoff date, and the calculation follows the consistent 360-day year and 30-day month convention.

In all cases, the payoff result is anchored to the loan’s current amortization state as maintained by the servicing system, and it remains consistent with the balance progression across periods.

### Data integrity and reconciliation notes

To preserve financial integrity, the payoff process adheres to the following principles:
- The opening balance of any period equals the previous period’s closing balance, verifying continuity across the amortization timeline.
- The payoff amount reconciles with the transaction amount by closely mirroring the sum of the outstanding balance and the accrued interest up to the payoff date.
- When a payoff is committed, the loan’s balance should reach zero on the payoff date, reflecting the loan’s closure.
- All numeric results are subject to the system’s rounding conventions. The platform applies standard rounding rules consistent with documented practice, including possible HALF_UP or HALF_EVEN rounding .
- If accounting entries are produced for the payoff event, they balance by construction when debit and credit data are available in the system’s ledger view.

### Glossary of terms

- Payoff date: The date on which the loan is intended to be closed.
- Payoff amount: The total amount required to close the loan on the payoff date, including accrued interest not yet billed.
- Accrued interest: Interest that has accumulated from the last payment date up to the payoff date.
- Balance: The outstanding loan balance from the amortization schedule as of the payoff date.
- Day-count convention: The method used to calculate interest accrual, here using a 360-day year and 30-day months.

### Important design notes

- The described payoff calculation is tied to the loan’s current amortization state and the servicing rules for accrual. It is intended to provide an accurate, date-specific quote for customers seeking early payoff.
- The user-facing payoff amount is the primary output of this feature; further actions (quote export, payoff submission, or settlement) follow the standard servicing workflow.
- The same payoff mechanism underpins both on-time and overdue payoff scenarios, with scenario-specific adjustments described in the strategy sections above.

If you need to reference the exact scenario families (S1, S2, S3, S4) in training or governance materials, treat them as documented workflow families for early payoff calculations, each influencing how accruals are applied when the payoff date interacts with the current amortization cycle.