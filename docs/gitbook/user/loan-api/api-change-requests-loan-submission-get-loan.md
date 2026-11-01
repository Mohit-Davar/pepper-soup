# API Change requests - Loan submission / get loan

This page documents an enhancement to the loan retrieval workflow focused on GET Loan by ID. Specifically, when a loan is retrieved, the response now includes additional accrual-related fields that support visibility into accrued interest and payable amounts. The reference materials also indicate a related change to the POST - create loan API to support related functionality; however, this page documents the GET loan field changes and notes that the exact POST changes are not described in the provided materials.

### What changed and why it matters

The GET Loan by ID (and by external-id, ) response now includes three accrual-focused fields that were not part of the baseline response previously:

- totalUnpaidAccruedDueInterest: The aggregate accrued interest that remains unpaid as of the current close of business (COB). This field provides a snapshot of the total accrual outstanding for the loan at retrieval time.
- PayPal Derived Field (accrued interest amount): The accrued interest amount derived by the accrual model for the current or recent accrual period. This field supports reconciliation and external integrations that require an explicit accrued-interest figure.
- currentInstallmentPayableInterest (After COB): The portion of the current installment's interest that is payable after COB, reflecting the status of accruals and any outstanding interest that will be due with the next payment event.

These fields appear in the loan retrieval output alongside existing loan data. The enhancement is described in the reference material as part of the GET API Field changes Examples for progressive loan scenarios, including cases with and without post-disbursement repayments.

### How the change affects day-to-day operations

- Operations and finance staff gain immediate visibility into accrued interest and payable amounts when reviewing a loan’s status. This supports more accurate cashflow planning, daily reconciliations, and dispute resolutions related to interest accruals.
- For reconciliations and accounting processes, the totalUnpaidAccruedDueInterest provides a single figure to compare against internal schedules and GL postings related to accrued interest.
- External integrations that consume loan retrieval data can read the new fields to surface accrual information without requiring separate API calls or calculations.

### Scope and limitations

- The documented changes focus on the GET loan by ID/external-id response. The reference also mentions a modification to the POST - create loan API to support related features, but the exact details are not provided in the current materials. This page describes only the GET loan field changes.

### Field definitions and behavior

- totalUnpaidAccruedDueInterest
 - Description: The sum of accrued interest that has not yet been paid as of COB for the loan.
 - When populated: On loan retrieval, the field reflects the current accrued interest balance that remains unpaid.
 - Operational note: This value aids reconciliations and operational decision-making when assessing short-term liquidity needs.

- PayPal Derived Field (accrued interest amount)
 - Description: The accrued interest amount computed by the accrual model for the relevant accrual window. This field is intended to expose the accrued amount in a readily consumable form for integrations that reference PayPal-era terminology or similar accounting flows.
 - When populated: Present in the GET loan response when accruals are active.

- currentInstallmentPayableInterest (After COB)
 - Description: The portion of the current installment’s interest that becomes payable after COB, considering accrued interest and any interim repayments.
 - When populated: Available in the GET loan response in the context of the current installment and accrual cycle.

### How accrual is modeled (context from reference calculations)

The reference material provides calculation references for Accrual and Accrual Activity across progressive loan variants. The accrual model progresses daily, aggregating daily accruals into a running balance of unpaid accrued interest. The payable interest surfaces through the PayPal-derived field and the current installment payable amount, enabling visibility into both accumulated and upcoming interest obligations. The two example sheets show scenarios with and without repayments and illustrate how accruals and payables evolve over time. In practice, the values depend on loan terms, the daily accrual logic, and the COB processing schedule.

For transparency, the reference includes a dedicated calculation sheet that demonstrates how payable interest is derived from daily accruals, including the use of daily rates, rounding of intermediate values, and the aggregation of daily accruals into period totals. Two progressive-loan variants (v2 and v3) illustrate the same concepts across different term structures and repayment patterns.

### Visual overview (high level)

```mermaid
flowchart TD
 A[Disbursement] --> B[Accrual Periods]
 B --> C[totalUnpaidAccruedDueInterest]
 B --> D[PayPal Derived Field (accrued interest amount)]
 B --> E[currentInstallmentPayableInterest (After COB)]
```

### Example scenarios (conceptual, non-exhaustive)

- Without repayment during the accrual window: GET loan by ID returns the accrual fields showing the accumulation of interest that remains unpaid as of COB. The numbers reflect the accrual logic over the observed days and the status of the current installment’s payable interest.
- With repayment during the accrual window: GET loan by ID still returns the accrual fields, but the values adjust to reflect the repayment reducing the outstanding accrued interest and affecting current installment payable interest as of COB. The exact figures depend on the repayment date, the amount paid, and the schedule of accruals.

### Operations guidance and validation tips

- When reviewing a retrieved loan, validate that the new fields are present and populated as described. If any of the accrual fields are missing or appear as null, investigate whether accruals are active for the loan and whether COB processing has occurred.
- Use totalUnpaidAccruedDueInterest in reconciliation with suspense or accrued-interest GL postings, and use currentInstallmentPayableInterest to anticipate upcoming payments.
- If downstream systems rely on a fixed schema, implement tolerant parsing to ignore unknown fields while still validating the presence and reasonableness of the new fields.

### Implementation notes (non-functional considerations)

- The changes are additive to the GET loan response. No existing navigation or workflow changes are required to access the new fields; they appear in the loan retrieval payload alongside existing loan details.
- The enhancement does not mandate changes to the loan submission workflow as described in the referenced materials. Any interaction with the POST create loan API to support related features is not detailed in this page.

If you need deeper walkthroughs of accrual calculations and the available sample data, refer to the referenced calculation materials in the provided sheets which illustrate progressive loan accruals under varying repayment patterns and COB processing assumptions.