# Past Due (Arrears) and Multiple Delinquency Buckets

This page documents the Instalment level delinquency bucket feature and its role in Pepper-Soup's delinquency and collections workflow. The concept attaches to individual loan installments, producing per-installment bucketed delinquency summaries that drive collections outreach and bureau reporting. The official data model represents delinquency at the granularity of each installment through an array of installmentDelinquencyBuckets, where each bucket specifies a delinquency range and the associated amounts and charges outstanding for installments in that bucket. The payload structure is designed to support per-bucket aggregation and per-bucket charging details, alongside high-level loan identifiers and currency metadata.

### Conceptual scope and component boundaries

- Instalment level delinquency bucket: A per-installment construct that aggregates delinquency amounts by defined delinquency ranges. Each installment may belong to one or more delinquency buckets, each with its own amount composition and associated charges.
- Purpose and usage: The bucketed data is consumed by collections workflows (to inform outreach and repayment scheduling) and by bureau reporting. The feature provides the data needed to identify loans in delinquency with bucket-specific information.
- Data model at a glance: The central data shape is an array named installmentDelinquencyBuckets attached to each installment. Each element contains:
 - delinquencyRange: defines the bucket by id, age range, and classification.
 - amount: principal, interest, fees, penalties, and total amounts outstanding for the installments within that bucket.
 - charges: any charges associated with the installments in that bucket.
 - currency: the currency context for the bucket’s amounts.
- Top-level loan context: The collection of buckets is tied to the loan via loanId, loanExternalId, loanAccountNo, and a currency field.

### Delinquency lifecycle events (bucket transitions)

The system emits a Delinquency event to reflect changes in the per-installment delinquency bucket information. Event semantics (as evidenced) cover the following transitions:
- Entering a delinquency bucket: A loan first becomes delinquent and attaches to a bucket.
- Moving between buckets: When the delinquency age or classification changes, the installment moves to a different bucket.
- Exiting delinquency (cured): The loan comes out of delinquency and the bucket association is updated .
- Pause transitions: Delinquency can be paused (start of a payment holiday or re-age period) and later resumed (pause ended). The design notes consider similar handling for other programs like re-age.

These transitions are described as triggers for a Delinquency event and are used to communicate bucket changes to downstream consumers.

### Data model: per-installment delinquency buckets

Each installment holds an array named installmentDelinquencyBuckets. The collection for a given installment represents the current bucketed view of delinquency for that installment. Each bucket includes the following fields (as evidenced):
- delinquencyRange
 - id: The identifier of the delinquency range.
 - minimumAgeDays: The minimum age in days for this range.
 - maximumAgeDays: The maximum age in days for this range.
 - classification: The name of the delinquency range (e.g., the bucket name).
- amount
 - principal: Principal portion of the installment or the bucket portion attributed to principal.
 - fees: Fees attributed to the bucket.
 - penalties: Penalties attributed to the bucket.
 - interest: Interest attributed to the bucket.
 - total: The total amount for the bucket (sum of principal, fees, penalties, and interest).
- charges: A list of charges applicable to the installments in this bucket. Each charge includes:
 - id: Charge identifier.
 - name: Charge name (e.g., NSF Fee).
 - amount: Charge amount.
 - currency: Currency context for the charge.
- currency: The currency applied to the bucket and its amounts.

Top-level loan fields accompanying the bucket data include:
- loanId: The loan’s internal identifier.
- loanExternalId: The external loan identifier.
- loanAccountNo: The loan account number used for display and reference.
- currency: The loan’s currency context (reaffirmed at the loan level).

#### Payload shape (illustrative, aligned with )
```
{
 "loanId": 325,
 "loanExternalId": "a4daa9a6-20ed-48e3-8fe8-b0c7d17ef633",
 "loanAccountNo": "000000001",
 "currency": { "code": "EUR", "name": "Euro" },
 "installmentDelinquencyBuckets": [
 {
 "delinquencyRange": {
 "id": 1,
 "minimumAgeDays": 1,
 "maximumAgeDays": 3,
 "classification": "Range 1"
 },
 "amount": {
 "principal": 250,
 "fees": 25,
 "penalties": 5,
 "interest": 0,
 "total": 280
 },
 "charges": [
 { "id": 1, "name": "NSF Fee", "amount": 25, "currency": {"code":"EUR"} }
 ],
 "currency": {"code": "EUR"}
 }
 // additional buckets may appear for the same or other installments
 ]
}
```

Notes:
- The field mappings for the per-bucket amounts are defined as sums across the relevant installments, restricted to the current delinquency bucket .
- The data model is designed to support bucket-level aggregation and per-bucket charging details, enabling downstream systems to report delinquency by bucket and to drive collections workflows.
```

### Calculation context and reference data (delinquency use cases)

The reference calculations illustrate how delinquency and bucket categorization can be populated over time for a loan, using the Delinquency Use Cases (1) scenario. The source data shows a sequence of transactions (Disbursement, charge, repayment) with associated due dates and delinquency markers. A portion of the reference table is reproduced here to indicate the typical fields involved in determining bucket placement and past-due status:

<div class="calc-box">
 <div class="calc-title">Calculation Reference: Delinquency Use Cases (1)</div>
 <div class="calc-step"><strong>Context:</strong> Records the evolving delinquency state of loan installments, with bucket boundaries expressed as days past due (D3, D10, D15, D30, D45, D60, D90, D120, D150, D180).</div>
 <div class="calc-step"><strong>Structure (excerpt):</strong> 
 <code>
 | Transactions | Business Date | Transaction Date | amount | Past Due | D3 | D10 | D15 | D30 | ... |
 | Disbursement | 1/1/22 | 1/1/22 | 1000 | 1/2/22 | | | | |
 | charge | 1/1/22 | 1/1/22 | 50 | | 250| | | | ... |
 | repayment | 3/3/22 | 3/3/22 | 250 | 2/2/22 | | | | 300 | |
 </code>
 </div>
 <div class="calc-step"><strong>Notes:</strong> The table shows where delinquency indicators (Past Due, D3, D30, etc.) follows transactions and due dates to determine the applicable bucket. The exact values shown in the reference are part of the source data and illustrate how bucket placement can be tracked across a repayment schedule.
 </div>
</div>

The reference data also includes an illustrative Installment Schedule with columns such as Installment Date, Principal, Interest, Fees, EMI, Due, and Paid. Example lines demonstrate how installments contribute to the overall delinquency state when they become outstanding or are paid:

- Installment Date 1/1/22: Principal 1000; EMI 250; Due and Paid values tracked per installment.
- Installment Date 2/1/22: Principal 250; Fees 50; EMI 300; Due 200; Paid 100.
- Installment Date 3/1/22: Principal 250; EMI 250; Due 250; Paid 0.
- Installment Date 4/1/22: Principal 250; EMI 250; Due 250; Paid 0.

These schedules underpin bucket calculations by providing the underlying installment-level cash flow against which bucket sums are computed.

### Validation and integrity considerations

- Per-installment buckets are designed so that the total of all bucket amounts for an installment equals the installment's total outstanding amount. Across the entire repayment schedule, the sum of outstanding amounts in buckets must reconcile with the installment’s outstanding balance.
- The bucket-level amounts (principal, interest, fees, penalties) are sums over the installments that belong to the current bucket. The documentation specifies that:
 - amount.totalAmount = sum of loan.repaymentScheduleInstallments.getTotalOutstanding() for the current bucket.
 - amount.principalAmount = sum of loan.repaymentScheduleInstallments.getPrincipalOutstanding() for the current bucket.
 - amount.interestAmount = sum of loan.repaymentScheduleInstallments.getInterestOutstanding() for the current bucket.
 - amount.feeAmount = sum of loan.repaymentScheduleInstallments.getFeeChargesOutstanding() for the current bucket.
 - amount.penaltyAmount = sum of loan.repaymentScheduleInstallments.getPenaltyChargesOutstanding() for the current bucket.
- The bucket data includes the currency context and the loan identifiers to verify consistency across systems consuming the event payload.

### Impact areas and downstream usage

- Collections and outreach: The per-installment, per-bucket delinquencies allows targeted outreach with bucket-aware messaging and scheduling. Collections teams can reference the bucket classification to tailor contact strategies and repayment plans.
- Bureau reporting: The bucketed delinquency data provides granular visibility for reporting obligations, supporting regulatory and risk-management activities.
- Reuse and extensibility: The current data model provides a structured way to extend bucket definitions or add additional charges at the bucket level without altering the underlying repayment schedule representation.

### Summary of verified behavior and rules

- Delinquency state is represented at the installment level via an array of installmentDelinquencyBuckets, each with a delinquencyRange and amount composition.
- Each bucket captures a localized view of outstanding amounts (principal, interest, fees, penalties, and total) and any related charges for the installments within that bucket.
- The payload includes loan identifiers and currency context, verifying traceability across systems.
- A Delinquency event is emitted to signal bucket changes, including transitions into buckets, bucket-to-bucket moves, cures (out of delinquency), and pause-related transitions (start and end of a pause).
- The explicit fields for delinquency ranges (id, minimumAgeDays, maximumAgeDays, classification) are sourced from the delinquency range metadata and are used to categorize each bucket.

 - amount.totalAmount: total of installments’ outstanding amounts for the current bucket (Σ loan.repaymentScheduleInstallments.getTotalOutstanding()).
 - amount.principalAmount: Σ loan.repaymentScheduleInstallments.getPrincipalOutstanding() for the current bucket.
 - amount.interestAmount: Σ loan.repaymentScheduleInstallments.getInterestOutstanding().
 - amount.feeAmount: Σ loan.repaymentScheduleInstallments.getFeeChargesOutstanding().
 - amount.penaltyAmount: Σ loan.repaymentScheduleInstallments.getPenaltyChargesOutstanding().
- The per-bucket structure includes the following nested fields:
 - delinquencyRange fields: id, minimumAgeDays, maximumAgeDays, classification.
 - amount fields: principal, fees, penalties, interest, total.
 - charges: list of charges with id, name, amount, currency.
- The top-level data envelope includes loanId, loanExternalId, loanAccountNo, and currency, providing the loan context for the bucket data.

This document reflects the verified concepts and data structures disclosed in the reference material for Past Due (Arrears) and Multiple Delinquency Buckets. It presents the role, data model, event semantics, and calculation guidance that underpin the feature, along with representative reference data to illustrate how bucket information is captured and surfaced.