<!-- Labels: developer, fixed-length -->
# Fixed Length Loan (for French market)

The Fixed Length Loan feature introduces an optional maximum loan length to support regulatory constraints in France. Implemented as an extension to the loan disbursement and schedule subsystem, it adds a maximum overall repayment horizon for loans whose term unit is days, weeks, or monthly. When provided, the repayment schedule generator adjusts the final installment so the total duration does not exceed the configured maximum, while preserving the configured frequency and the lengths of all preceding installments. For France, the design goal is to keep the loan within a maximum length and to reflect that the final installment may be shorter than the preceding ones.

### Concept and boundaries
- Primary responsibility: extend the loan product with an optional maximum length field and adjust the repayment schedule during schedule generation.
- Modules involved: the loan scheduling logic that interprets term units (days, weeks, or months) and generates installments. The behavior is scoped to fixed-length scenarios and does not alter trailing activities post-maturity beyond the maximum length boundary.
- Design guarantees: when a maximum length is defined, the sum of the lengths of the first (N-1) installments remains as configured; the last installment length is computed to fit within the maximum length. If the computed last installment would be less than 1 day (or 1 unit when using weeks or months), configuration is invalid and rejected.

### Design goals and constraints
- Regulatory alignment: loans in France cannot exceed 89 days in total length. The maximum length field, when provided, constrains the repayment schedule to respect this limit.
- Installment lengths: the first installations follow the user-defined lengths; the final installation length is adjusted to verify the total does not exceed the maximum length.
- Frequency preservation: the repayment frequency remains as configured (for example, every 30 days or every 2 weeks).
- Applicability: this feature applies only to loans that are defined with 0% interest (0-interest products).
- Post-maturity behavior: N+1 periods or activities after the maturity are not affected by this feature; post-maturity actions may occur, but they do not extend the maximum length boundary.
- Exceptional cases: if a fixed length cannot derive the number of repayments entered, the system should not approve the configuration.
- Rescheduling and holidays: payment holidays, skipped payments, or rescheduling keep the length of the last installment fixed, i.e., the final installment still respects the configured maximum length.
- Extending schedules: it is permissible to extend the schedule while maintaining the fixed length constraint for the final installment.

> Qualifying example for the French market: a loan with a maximum length of 89 days and three installments with a fixed frequency of 30 days would be scheduled as 30 days, 30 days, and 29 days respectively. The total remains within the 89-day limit.

### Scheduling algorithm and exact rules
When a maximum length is defined on the loan product, the repayment schedule generator follows these steps:
1. Identify the number of installments (no. of repayments) and the configured lengths for the first (N-1) installments according to the loan term and frequency.
2. Compute the length of the final (Nth) installment as: final_length = maximum_length - sum(lengths of first N-1 installments).
3. If final_length is less than 1 unit (1 day, 1 week, or 1 month, associated to the term unit), the configuration is invalid and must be rejected.
4. The resulting schedule consists of the N installments with the lengths [length1, length2, ..., final_length], preserving the configured frequency between installments.
5. If the maximum length is not compatible with the given number of installments and their configured lengths (e.g., the calculation would yield a non-positive final_length), the system must not approve the configuration.
6. If a fixed length is adjusted due to the maximum length, the rest of the installment lengths remain as configured, subject to the final adjustment for the last installment.

This behavior verifies the initial portion of the repayment schedule honors user configuration while the tail of the schedule conforms to the maximum length constraint.

### Example: fixed length with 89-day maximum (two 30-day installments and a final 29-day installment)
- Context: a French-market loan with term unit in days, max_length = 89 days, 3 repayments, frequency = 30 days.
- Computation:
 - Installment 1 length: 30 days
 - Installment 2 length: 30 days
 - Sum of first two installments = 60 days
 - Final installment length = 89 - 60 = 29 days
- Resulting schedule: [30 days, 30 days, 29 days], total duration = 89 days, frequency preserved, final installment shortened .

<div class="calc-box"><div class="calc-title">Calculation</div><div class="calc-step"><strong>Formula:</strong> final_length = maximum_length - sum(lengths of first N-1 installments)</div><div class="calc-step"><strong>Substitution:</strong> final_length = 89 days - (30 days + 30 days) = 29 days</div><div class="calc-step calc-result"><strong>Result:</strong> Installment lengths = [30, 30, 29] days; total length = 89 days</div></div>

### Validation guards and error handling
- Preconditions:
 - A maximum length must be defined on the loan product, with unit consistent with the term unit (days, weeks, or months).
 - The loan must be configured as a 0-interest product.
 - The number of installments and the lengths of the first N-1 installments must be such that a positive final_length can be derived.
- Invariant checks:
 - The calculated final_length must be at least 1 unit; otherwise, the configuration is invalid and rejected.
 - If after applying the maximum length the sum of the initial installments already equals or exceeds the maximum length, the configuration is invalid and rejected.
- Error scenarios:
 - If fixed length cannot derive the required number of repayments entered, the system should not approve such config.
 - If any validation fails, the loan product configuration that allows fixed-length behavior is rejected and must be corrected before approval.

### Impact on operations and repayment scenarios
- Rescheduling and holidays: When a payment holiday, skip, or reschedule occurs, the length of the last installment remains fixed to the value derived from the maximum length rule. The overall maximum length boundary remains the same.
- Extending or revising schedules: Extending the schedule through edits to the repayment dates is allowed, but the last installment must continue to honor the fixed maximum length.
- Post-maturity behavior: The N+1 scenario is not affected by this feature; trailing activities can post beyond the maximum loan length if applicable, but the core schedule remains constrained up to the defined maximum length.

### Reference calculations and schedules (illustrative)
The following excerpts illustrate how the system represents fixed-length logic in a schedule, using the France-specific constraint as a concrete example. The core ideas follows the reference material, which describes the fixed-length concept, its interaction with frequency, and the final-installment adjustment.

### Example repayment schedule (illustrative)
If a loan has 3 repayments with a fixed frequency and a maximum length of 89 days, the schedule entries reflect the adjusted final installment length. The table below uses a simplified representation with the same logic as the example above.

<div class="param-grid"><div class="param-card"><span class="param-label">Maximum length</span><span class="param-value">89 days</span></div><div class="param-card"><span class="param-label">Installments</span><span class="param-value">3</span></div><div class="param-card"><span class="param-label">Frequency</span><span class="param-value">Every 30 days</span></div></div>

<div class="calc-box"><div class="calc-title">Sample amortization (days)</div><div class="calc-step">1st Installment: 30 days</div><div class="calc-step">2nd Installment: 30 days</div><div class="calc-step">3rd Installment (final): 29 days</div><div class="calc-step calc-result"><strong>Total duration:</strong> 89 days</div></div>

### Practical notes for implementation and integration
- The maximum length is defined as an optional field on the loan product. When present, the repository and scheduling components must treat it as the authoritative bound for the overall repayment horizon for that loan instance.
- All calculations preserve the original frequency between installments; only the final installment length is adjusted to fit within the maximum length.
- The rule that the final installment must be at least 1 day (or unit) remains a hard constraint for validity checks.
- The behavior is scoped to 0-interest products; other products are not eligible for this fixed-length constraint.
- If a user attempts to configure a fixed length that cannot derive the given number of repayments (e.g., the fixed length is too short to accommodate all installments while preserving frequency), the system must reject the configuration and present a validation error.

### Summary of behavior
- Purpose: enforce a regulatory maximum loan length for French market loans, by adjusting the final installment length.
- How it works: the schedule uses the configured installment lengths for the first N-1 installments, and computes the last installment as the remainder to meet the maximum length; the last installment must be at least 1 unit long.
- Constraints: applies only to 0-interest products, units must be consistent with term unit, and validation must fail invalid configurations.
- Outcomes: the repayment schedule remains within the maximum length, preserves frequency, and allows post-maturity activities to occur without altering the fixed-length constraint.