<!-- Labels: user, fixed-length -->
# Fixed Length Loan (for French market)

The Fixed Length Loan feature introduces a controlled maximum tenure for loans issued under the French market configuration. When a maximum length is defined, the repayment schedule is generated so that the sum of the first N-1 installments fits within that maximum length, and the last installment length is adjusted to complete the period without exceeding the limit. For example, France requires loans to stay within an 89-day maximum. In this scenario, a repayment plan could consist of two 30-day installments followed by a final 29-day installment. The initial plan remains valid as long as the total length does not exceed the maximum. Trailing activities after maturity that post to the loan beyond the maximum length period are permitted.

### What the feature does and why it matters

- Provides an optional maximum tenure on a loan product to satisfy regulatory constraints in France. The maximum length defines the reference window for the entire repayment schedule. The system verifies the last installment length is adjusted to keep the overall schedule within that maximum period.
- Keeps the fixed length behavior limited to loans with terms defined in days, weeks, or monthly, respectively. The maximum length is defined in the associated unit (days, weeks, or months).
- Applies only to zero-interest products. Post-maturity, N+1 is not affected by this feature, and rescheduling, if performed, preserves the fixed-length constraint for the last installment.

### How it works (conceptual workflow)

- A loan product can include an optional field that defines the maximum length of the loan in the standard unit. When provided, the repayment schedule generator adjusts the last installment to fit the configured maximum length.
- The first installments have fixed lengths as defined by the product or customer configuration. The last installment length becomes MaxLength minus the sum of the preceding installments.
- If the fixed length configuration cannot derive a valid last installment (for example, the sum of prior installments leaves less than 1 day for the final period), the system returns a validation error and does not approve the configuration.

### Data entry and operational steps (UI navigation)
1. In the French-market loan product configuration, open the product and select **Edit**. After saving, the product will reflect the option to specify a maximum fixed length.
 - Outcome: The product now includes a field to define the maximum length for loans under this product.
2. In the field labeled **Maximum Length**, enter the value in the standard unit (days, weeks, or months) and allows the concept of a fixed-length tenure (often via a toggle or checkbox labeled **Fixed Length**).
 - Outcome: The system records the maximum allowed term for loans of this product and marks the loan as using fixed-length tenure.
3. Click **Save** to persist the configuration.
 - Outcome: The product configuration is stored with the defined maximum length. The repayment schedule generator will enforce the fixed-length constraint for new loans created under this product.
4. When creating a new loan under this product, review the generated repayment schedule. The last installment length should be adjusted to fit within the maximum length while prior installments retain their defined durations.
 - Outcome: The repayment schedule reflects a final installment whose length completes the maximum length without exceeding it.

### Worked example: France up to 89 days

 France regulation example: a loan may not exceed 89 days in total. With a fixed-length tenure defined as 89 days, a three-installment plan could be two 30-day installments followed by a 29-day final installment.

<div class="calc-box">
 <div class="calc-title">Calculation</div>
 <div class="calc-step"><strong>Formula:</strong> LastInstallmentLength = MaxLength - Sum(Lengths of preceding installments)</div>
 <div class="calc-step"><strong>Substitution:</strong> 89 days - (30 days + 30 days) = 29 days</div>
 <div class="calc-step calc-result"><strong>Result:</strong> 29 days</div>
</div>

- Frequency remains the same as the loan term configuration and fixed length applies only to the final installment.
- If a calculation would yield less than 1 day for the last installment, the configuration is invalid and should be rejected with a validation error.

Sample repayment schedule (illustrative, using the 89-day maximum):

| Installment | Days to Installment | Installment Date | Principal | EMI | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 30 | 2022-01-31 | 250.00 | 250.00 | First installment (30 days) |
| 2 | 30 | 2022-03-02 | 250.00 | 250.00 | Second installment (30 days) |
| 3 | 29 | 2022-03-31 | 250.00 | 250.00 | Final installment (29 days) |

Totals: Principal 750.00; EMI 750.00; Fees 0.00; Penalties 0.00.

### Rules and edge cases

- Eligibility and scope
 - The fixed-length feature is available for loans whose terms are defined in days, weeks, or monthly, and only for zero-interest products.
 - The fixed-length constraint does not affect post-maturity activity labeled as N+1.
 - Reschedule transactions are supported, but they must preserve the fixed-length constraint for the last installment.
- Validation and errors
 - Validation applies when the fixed-length configuration cannot derive the required number of repayments and their lengths from the inputs. In such cases, the system should not approve the configuration.
 - The last installment must have a length of at least 1 day. If the calculation would yield a shorter duration, an error is returned.
- Edge case: division rule
 - There is no separate rule of division for the days between installments. The number of installments and their lengths are defined by the configuration. Any remaining days are added to the last installment.

### Important references from the feature specification

- The maximum length is an optional field on the loan product and defines the maximum allowed loan duration.
- The repayment schedule is generated so that the last installment length is adjusted to fit within the configured maximum length.
- The approach is compatible with 0-interest products and does not require changes to N+1 post-maturity scenarios.

If you are configuring a new fixed-length loan product for the French market, begin with the Maximum Length field, set the unit to days, weeks, or months , and allows the Fixed Length option. After saving, verify that new loans under this product produce repayment schedules where the final installment length completes the maximum length exactly, without exceeding it, and that the total principal remains correctly allocated across all installments.