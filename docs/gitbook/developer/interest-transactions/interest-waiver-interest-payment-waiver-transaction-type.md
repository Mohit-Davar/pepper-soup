# Interest Waiver/Interest Payment Waiver transaction type

The Interest Waiver and Interest Payment Waiver transaction type provides a controlled mechanism for customer service staff to reduce the interest component associated with a loan while recording a associated payment against the loan's repayment schedule. In the Pepper-Soup implementation, waivers are part of the Interest and Accrual domain and interact with the loan's repayment schedule, the opening and subsequent closing balance, and the allocation of a single payment across principal, interest, and, where evidenced, fees. The verified material shows distinct waiver scenarios where the waiver amount is allocated between principal reduction and interest reduction, with or without accompanying fees, and the resulting updates to the repayment schedule and loan balance. This section documents the observed behavior, calculation patterns, and the resulting state changes that a backend Java engineer or integrator should anticipate when integrating or extending this feature.

### Component role and scope

Within the loan processing lifecycle, the waiver transaction type operates as a specialized payment event that can accompany or replace standard EMI payments for a given installment. The primary effects are:

- Allocation of the waiver amount between principal, interest, and (in some scenarios) fees, as evidenced by the detailed calculation references.
- Update of the repayment schedule entries to reflect the portions paid for principal and interest, and any fee-related components that are part of the waiver.
- Update of the loan balance by subtracting the principal portion of the waiver, while the interest portion reduces the accrued (or due) interest component, depending on the allocation rules demonstrated in the reference data.

The material references to sample scenarios imply that the waiver transactions are intended to resolve overdue or outstanding interest while moving the loan toward current status, using the same schedule structure used for regular repayments.

### Execution lifecycle and state considerations
The reference material presents a sequence of waiver events tied to a loan’s repayment schedule. While a formal, published state machine is not provided, the verified behavior follows a clear progression: a disbursement initializes a balance, waiver transactions are processed on specific dates, each waiver reduces the principal by the principal portion and records the associated interest portion as paid, and the loan balance is adjusted . The sequence shown in the example confirms that the balance after each waiver equals the previous balance minus the principal portion paid in that waiver. There is an implicit invariant: opening balance of a period must equal the previous period’s closing balance, prior to applying the next waiver or installment. When a waiver occurs, the associated “Prin Paid” and “Interest paid” fields in the repayment schedule reflect the actual allocations, and the “Loan balance” is reduced by the principal portion of the waiver.

If a waiver is configured to include a fee component, the data show a separate fee amount being associated with the waiver and paid, with the principal portion continuing to drive the balance reduction. Specific observed patterns include scenarios where a waiver covers the interest portion first, with the remaining amount reducing principal (or where the allocation order switches between principal and interest as described in the reference calculations).

### Calculation patterns and exact formulas (-based)
The reference material provides explicit calculation examples for waiver scenarios. Calculations are anchored in the following observable rules:

- The waiver transaction has an amount (the total payment applied in that event) and a breakdown into principal, interest, and optionally fee components.
- The principal portion paid by a waiver reduces the outstanding loan balance by exactly the principal amount paid in that waiver.
- The interest portion paid by a waiver reduces the interest due, and is recorded as paid in the Interest paid field of the repayment schedule.
- The EMI (scheduled installment) amount shown for the waiver event equals the waiver amount, but the actual reconciliation depends on the allocation to principal and interest; the due amount in the row reflects the same total value when relevant to the schedule.

The following worked example is drawn directly from the verification material to illustrate exact numbers and the resulting balance changes for a single loan scenario.

<div class="calc-box">
 <div class="calc-title">Calculation example: Scenario 1 (on-time payments with waivers)</div>
 <div class="calc-step"><strong>Context:</strong> A loan disbursed on 01/01/22 with an initial balance of

690. A waiver occurs on 02/01/22.
 </div>
 <div class="calc-step"><strong>Step 1 — Waiver on 02/01/22</strong></div>
 <div class="calc-step"><strong>Inputs:</strong> waiver amount A = 250; principal portion p = 230; interest portion i = 20; EMI due = 250; Due = 250.</div>
 <div class="calc-step"><strong>Effect on repayment schedule:</strong> Prin Paid = 230; Interest paid = 20; EMI = 250; Due = 250.</div>
 <div class="calc-step"><strong>Balance update:</strong> Balance before = 690; Balance after = 690 - 230 = 460.</div>
 <div class="calc-step"><strong>Step 2 — Waiver on 03/01/22</strong></div>
 <div class="calc-step"><strong>Inputs:</strong> waiver amount A = 250; principal portion p = 230; interest portion i = 20.</div>
 <div class="calc-step"><strong>Balance update:</strong> Balance before = 460; Balance after = 460 - 230 = 230.</div>
 <div class="calc-step"><strong>Step 3 — Waiver on 04/01/22</strong></div>
 <div class="calc-step"><strong>Inputs:</strong> waiver amount A = 250; principal portion p = 230; interest portion i = 20.</div>
 <div class="calc-step"><strong>Balance update:</strong> Balance before = 230; Balance after = 230 - 230 = 0.</div>
</div>

The above sequence is representative of Scenario 1 in the reference materials, where successive waivers fully amortize the loan by the end of the fourth month. The key takeaways are:

- The principal portion of each waiver reduces the outstanding balance by the stated principal paid in that waiver.
- The interest portion is recorded as paid within the waiver and does not contribute to reducing the balance directly.
- The repayment schedule entries reflect Prin Paid and Interest paid for each waiver event, and the Loan balance updates follows the principal reductions.

### Calculation references: observed scenarios
The reference provides multiple waiver scenarios with varying allocation rules and additional components such as fees. The first scenario demonstrates straightforward allocation where the waiver covers both principal and interest, resulting in a direct reduction of the balance by the principal portion. The data show that a waiver can be accompanied by a fee in some cases, and the allocation rules can differ between scenarios (for example, scenarios that allocate waivers to interest first, or to principal first, or to both principal and fees). The exact allocation order and the presence of fees are evidenced in the tables labeled Payment Waiver scenarios and Payment Waiver scenarios v2.

- Scenario 1 (early payment calculations) illustrates a straightforward allocation: each waiver reduces the balance by the principal portion (230 in the examples), while the interest portion (20) is recorded as paid. The balance sequence for the example shows 690 (opening), then 460 after the first waiver, 230 after the second waiver, and 0 after the final waiver, consistent with the cumulative principal paid.
- Scenario 2 (allocation involving a fee) demonstrates that a charge can be added to the loan balance prior to waiving principal and interest, and that the waiver can allocate portions to principal, interest, and fee across subsequent events. The exact numeric progression, including balance changes, is shown in the Calculation Reference: Payment Wavier scenarios v2, where an add-charge event and subsequent waiver entries are recorded with associated principal, interest, and fee components.

> Note: The reference data provides multiple variation stories (Scenario 1 through Scenario 6) to illustrate how different allocation rules and timing can affect the repayment schedule and balance. The exact numeric outcomes for scenarios other than Scenario 1 are shown in the reference tables, but the descriptions above capture the core mechanism: waiver amounts are split into principal, interest, and possibly fees, and the principal portion reduces the loan balance .

### Practical implications for integration
- Data model: The waiver transaction must carry fields for the total waiver amount, and the component breakdown (principal portion, interest portion, and optional fee portion). The repayment schedule must record these components as Prin Paid, Interest paid, and Fee paid, respectively, and the Loan balance must reflect the principal paid.
- Scheduling: Waivers are associated with specific installment dates and may occur on or before the scheduled installment date. They affect the associated entry in the repayment schedule, potentially altering the remaining amount due for that period.
- Balance integrity: A core invariants observed in the reference is that the opening balance of a period equals the previous period's closing balance, prior to applying the waiver. The balance must be reduced by the principal portion of any waiver that reduces the balance.
- Edge cases: Some scenarios show waivers coupled with additional charges; the presence of fees in the waiver is reflected in the Fee paid column and may affect the remaining balance indirectly via the principal portion. If a waiver allocates no principal (or insufficient principal to cover the installment), the schedule would still record the incident with the associated interest/fee components. The material does not present a universal fixed allocation rule across all cases; observed patterns indicate configuration- or scenario-driven allocation behavior.

### Diagram: high-level waiver processing (Mermaid)

```
stateDiagram-v2
 [*] --> WaiverCreated : Waiver transaction created
 WaiverCreated --> Allocation : Allocate to principal/interest/fee
 Allocation --> ScheduleUpdate : Update PrinPaid / InterestPaid / FeePaid
 ScheduleUpdate --> BalanceUpdate : Balance = Balance - PrincipalPaid
 BalanceUpdate --> [*] : End
```

This diagram provides a compact, verified view of the core steps in a waiver processing cycle: creation, allocation, schedule update, and balance adjustment. It preserves the observed order of operations and the relationships between components (waiver event, allocation, schedule, and balance).

### Summary for engineers and integrators
- The Interest Waiver/Interest Payment Waiver transaction type is a specialized payment event that reduces accrued interest and (depending on the scenario) reduces principal on the loan, while updating the repayment schedule .
- The exact allocation of a waiver across principal, interest, and fees is evidenced by the reference scenarios and can vary by scenario or configuration.
- The principal portion of each waiver reduces the loan balance; the interest portion is recorded as paid and reduces the interest due component rather than the balance directly.
- A concrete, fully worked example (Scenario 1) demonstrates balance progression: starting balance 690, after first waiver balance 460, after second waiver balance 230, after third waiver balance 0.

If you are extending this feature, verify your implementation preserves the integrity of the repayment schedule and balance invariants, correctly records Prin Paid, Interest paid, and Fee paid, and handles the allocation rules observed in the reference data for the different scenarios.