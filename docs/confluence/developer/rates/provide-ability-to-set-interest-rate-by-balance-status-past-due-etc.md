<!-- Labels: developer, rates -->
# Interest Rate by Balance Status and Past Due

This feature allows configuration of interest rates by balance status (Past Due, Current, Future) for each balance type within a loan product. It is part of the Interest and Accrual domain and is surfaced under Rates. The configuration governs how interest accrues across different components of a loan balance, with a crucial constraint: interest is not calculated on the past-due portion of the Principal. The capability is scoped to loan products and is currently limited to the Advance repayment strategy type.

### Overview and design guarantees

- Purpose and scope: For each loan product, administrators can define interest rates by balance status for four balance types: Principal, Fees, Penalties, and Interest. The balance status partitions the outstanding amount into Past Due, Current, and Future segments. The system applies the configured rate for each segment to the associated balance portion when calculating accruals.
- Principal handling: Interest is not calculated on the Past Due portion of Principal. The Current Principal Balance is defined as the total Principal Balance minus the Past Due Principal Balance, and this remaining amount is eligible for interest according to the configured Principal Current rate.
- Configuration location: The rate configuration is set at the loan product level, enabling reuse across loans that share the same product configuration.
- Current limitation: As of the reference requirements, this feature is limited to the Advance repayment strategy type.

### Configuration model (rates by balance status and balance type)

The configuration defines a mapping from each Balance Type and Balance Status to an interest rate. The four balance types are Principal, Fees, Penalties, and Interest. The three balance statuses are Past Due, Current, and Future. For each (Balance Type, Balance Status) pair, a rate r(Balance Type, Balance Status) is configured at the loan product level.

- Balance Types: Principal, Fees, Penalties, Interest
- Balance Statuses: Past Due, Current, Future

Note: The Past Due portion of Principal is explicitly excluded from interest computation, per the acceptance criteria. Other balance types follow their respective status-based rates unless constrained by future product behavior.

### Calculation model and rules

Interest is computed by applying the configured rate to the associated balance portions, with a specific rule for Principal as described above. The following calculation model describes how to determine the period's interest accrual.

- For Principal:
 - Current Principal Balance = Total Principal Balance − Past Due Principal Balance
 - Interest on Principal = r(Principal, Current) × Current Principal Balance
 - Past Due Principal portion contributes zero interest in this period
- For each of the remaining Balance Types (Fees, Penalties, Interest):
 - Interest contributions are computed by applying the rate for each status to the associated balance portion:
 - Fees: r(Fees, Past Due) × Fees Past Due Balance + r(Fees, Current) × Fees Current Balance + r(Fees, Future) × Fees Future Balance
 - Penalties: r(Penalties, Past Due) × Penalties Past Due Balance + r(Penalties, Current) × Penalties Current Balance + r(Penalties, Future) × Penalties Future Balance
 - Interest: r(Interest, Past Due) × Interest Past Due Balance + r(Interest, Current) × Interest Current Balance + r(Interest, Future) × Interest Future Balance
- Total period interest = Sum of all the above contributions

Where Balance Type and Balance Status partition the outstanding amounts into discrete buckets. The Total Principal Balance used for the Principal calculation is the sum of all Principal components; the Past Due portion is the portion excluded from interest per the rule above.

<div class="calc-box">
 <div class="calc-title">Calculation</div>
 <div class="calc-step"><strong>Formula:</strong> <code>TotalInterest = r(Principal, Current) × (PrincipalTotal − PrincipalPastDue) + r(Fees, PastDue) × FeesPastDue + r(Fees, Current) × FeesCurrent + r(Fees, Future) × FeesFuture + r(Penalties, PastDue) × PenaltiesPastDue + r(Penalties, Current) × PenaltiesCurrent + r(Penalties, Future) × PenaltiesFuture + r(Interest, PastDue) × InterestPastDue + r(Interest, Current) × InterestCurrent + r(Interest, Future) × InterestFuture</code></div>
 <div class="calc-step"><strong>Notes:</strong> Principal Past Due term is intentionally omitted from the calculation. Principal Current uses the Current Principal Balance defined above. All other balance-type terms multiply their respective status buckets by the configured rate.</div>
 <div class="calc-step calc-result"><strong>Result:</strong> <code>TotalInterest per accrual period</code></div>
</div>

### Worked illustration (conceptual, no numeric values)

To illustrate the control flow and financial effect, consider a loan product with the following abstract balances for a given accrual period:
- Principal: Total Principal = P_total; Past Due Principal = P_past; Current Principal = P_total − P_past
- Fees: Balances partitioned into FeesPastDue, FeesCurrent, FeesFuture
- Penalties: Balances partitioned into PenaltiesPastDue, PenaltiesCurrent, PenaltiesFuture
- Interest: Balances partitioned into InterestPastDue, InterestCurrent, InterestFuture

With configured rates r(B,S) for each balance type B and status S, the accrual for the period is computed as described in the calculation rules above. The only principal-related adjustment is that the Past Due portion of Principal does not accrue interest; all other status buckets for all balance types contribute according to their respective rates.

### Data model implications and persistence

- Configuration scope: The rate mappings are defined at the loan product level, enabling reuse across loans that reference that product.
- Storage concern: Each loan product maintains a 4×3 mapping (Balance Type × Balance Status) to rate values, with an explicit rule to ignore Principal Past Due in accrual.
- Validation: The system relies on the product-level configuration to drive accrual calculations for all loan accounts using that product. The reference data does not specify endpoint contracts, field-level validations, or persistence formats beyond the general rule set above.

### Behavioral notes and edge cases

- Boundary condition for Principal: If PrincipalPastDue equals Total Principal, the Principal Current Balance becomes zero and the Principal accrual contributes zero interest for that period under the Principal Current rate.
- Future buckets: Balances allocated to Future status participate in accrual only if a configured rate exists and the bucket is non-zero; otherwise, their contribution to total interest is zero.
- Repayment strategy constraint: The feature is currently described as limited to Advance repayment strategy type; behavior for other strategies is outside the scope of the verified guidance.

### Diagram: high-level calculation flow

flowchart TD
 A(Start accrual) --> B(Partition balances by Type and Status)
 B --> C{Principal?}
 C -- Yes --> D(Compute Principal Current: CurrentPrincipal = PrincipalTotal − PrincipalPastDue)
 D --> E(InterestPrincipal = r(Principal, Current) × CurrentPrincipal)
 C -- No --> F(Compute principal-like contributions per status)
 E --> G(Compute Fees, Penalties, Interest contributions per status)
 F --> G
 G --> H(Sum all contributions to TotalInterest)
 H --> I(Record accrual for period)
 I --> J(End)

Note: The diagram reflects the verified flow: a principal-specific rule excludes past-due principal from interest, while other balance types follow their status-based rates.

### Summary for integration teams

- The feature introduces a product-level rate matrix covering all balance types by status, with a concrete rule to exclude past-due principal from interest calculations.
- The calculation aggregates interest across balance types and statuses, using Principal Current to compute the principal-related accrual and applying standard rates to each bucket for the other types.
- The design is aligned with the acceptance criteria: interest is calculated only on the Current Principal Balance, and configuration happens at the loan product level. The Advance repayment strategy is the current scope limitation.

If further refinement is needed to adapt to additional repayment strategies, or to expose API contracts for configuring rates, those requirements should be handled in a separate, scoped change request and documented with explicit field semantics and validation rules.