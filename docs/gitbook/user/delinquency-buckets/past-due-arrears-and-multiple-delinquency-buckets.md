# Past Due (Arrears) and Multiple Delinquency Buckets

Past Due (Arrears) and Multiple Delinquency Buckets is a feature that identifies, groups, and tracks delinquent instalments at the level of each loan installment. For every installment, the system assigns a delinquency bucket based on the age of delinquency and the configured delinquency ranges. Each bucket records the component amounts that remain outstanding in that bucket (principal, interest, fees, penalties) and the total outstanding in that bucket, along with any charges applicable to the delinquent installments. This structure supports targeted collections activities and bureau reporting, by providing visibility into how much is overdue, for which components, and how long the delinquency has persisted. The feature is used by operations staff, loan officers, branch managers, and credit agents to identify delinquent accounts, plan outreach, and monitor reporting requirements.

The lifecycle of delinquency information is event-driven. A Delinquency Event is produced when an instalment moves into a delinquency bucket, changes buckets, comes out of delinquency (cured), or undergoes a pause transition (start or end of a pause such as a re-age or payment holiday). These events allows timely collections actions and accurate bureau reporting.

### Concepts and data model in the product

- Delinquency bucket per instalment
 - Each loan may have an array named instalmentDelinquencyBuckets. Each element represents the delinquency information for the associated installment within the current delinquency context.
 - Each bucket contains a delinquencyRange and an amount breakdown for the installments in that bucket.

- Delinquency range (bucket classification)
 - The delinquencyRange carries an id, a minimumAgeDays, and a maximumAgeDays, and a classification name (for example Range 1).
 - The combination of age and classification determines which bucket an overdue instalment resides in.

- Amount breakdown for a bucket
 - amount.principal: principal portion outstanding in the current delinquency bucket.
 - amount.interest: interest portion outstanding in the current delinquency bucket.
 - amount.fees: fees outstanding in the current delinquency bucket.
 - amount.penalties: penalties outstanding in the current delinquency bucket.
 - amount.total: total delinquency amount for the bucket, i.e., the sum of principal, interest, fees, and penalties for the installments in this bucket.
 - The dedicated field amount.total is the sum of the component amounts for the bucket: total = principal + interest + fees + penalties.

- Charges associated with the delinquency bucket
 - Each bucket may include a charges list. Each charge entry has an id, a name, an amount, and a currency. These charges are applied to the installments within the current bucket as part of the delinquency calculation.

- Identifiers and context for reporting
 - Each bucket entry is associated with a nominal bucket for the loan’s current delinquency state and includes identifiers that link to the loan, the loan’s external id, and the loan account number. The currency field records the loan’s currency.

> Illustration from the reference data shows an instalment in a bucket with principal 250, fees 25, penalties 5, interest 0, giving a total of 280 for that bucket (amount.total = 280; amount.principal = 250; amount.fees = 25; amount.penalties = 5; amount.interest = 0).
>
> The bucket’s denomination (Range 1, Range 2, etc.) is derived from the delinquencyRange.minimumAgeDays and maximumAgeDays values, which define the age window for that bucket.

### Worked example: per-bucket calculation
To illustrate the calculation that defines a bucket’s total, consider a bucket where the components are as follows: principal 250, fees 25, penalties 5, interest

0. The total delinquency amount for this bucket is calculated as follows:

<div class="calc-box">
 <div class="calc-title">Calculation</div>
 <div class="calc-step"><strong>Formula:</strong> total = principal + fees + penalties + interest</div>
 <div class="calc-step"><strong>Substitution:</strong> 250 + 25 + 5 + 0</div>
 <div class="calc-step calc-result"><strong>Result:</strong> 280</div>
</div>

This bucket represents the portion of the loan’s overdue amount that is attributed to the associated delinquency age window (e.g., Range 1) and is used to drive collections outreach and reporting.

### Where to find and interpret the data in the user interface
- Delinquency buckets page: Navigate to Delinquency and Collections > Delinquency buckets > Past Due (Arrears) and Multiple Delinquency Buckets.
- For a given loan account, open the loan's account view and locate the instalment-level delinquency bucket section. Each instalment entry shows the current bucket’s classification (Range name) and the amounts by component (principal, interest, fees, penalties) along with the bucket total and any associated charges.
- The array instalmentDelinquencyBuckets holds the per-bucket data for the current delinquency context. Each bucket entry includes:
 - delinquencyRange: id, minimumAgeDays, maximumAgeDays, classification
 - amount: principal, interest, fees, penalties, total
 - charges: a list of charge objects with id, name, amount, currency

### Event usage and business rules by scenario
- Bucket entry: When a loan’s installment goes into delinquency and is assigned to a bucket, a Delinquency Event is generated to mark the new bucket for that installment.
- Bucket transition: If an installment moves from one bucket to a different bucket (for example, due to aging or partial recovery), a Delinquency Event is generated to reflect the bucket change.
- Cure of delinquency: When an installment is cured (no longer delinquent), a Delinquency Event is generated to indicate that the loan has exited delinquency for that installment.
- Pause delinquency: If a pause is started (for example, a re-age or payment holiday), a Delinquency Event is generated for the transition into the pause state.
- Pause end: When the pause ends (the program remainder resumes), a Delinquency Event may be generated to reflect the end of the pause state.

These events support two primary business needs: (1) enabling collections teams to time outreach and negotiation activities based on bucket ageing, and (2) providing accurate data for bureau reporting. The system uses the interval boundaries defined by minimumAgeDays and maximumAgeDays to determine bucket eligibility and aging.

### Data integrity and verification rules
Operational integrity requires that the following remain true across periods and actions:
- Each period’s opening balance must equal the previous period’s closing balance. This verifies a continuous ledger of the delinquency amounts across time.
- Payment allocations must reconcile with the transaction amount and the applicable bucket’s outstanding total. Allocation rules verify that principal, interest, fees, and penalties are charged to the correct bucket and that the sum of bucket totals matches the loan’s overall outstanding amounts.
- Remaining cash and outstanding dues must reconcile at every step. When a payment is posted, the system updates the standard bucket(s) and recomputes the totals to reflect the new outstanding amounts per bucket.
- When detailed accounting data (if present) is available, journal entries should balance with debits equaling credits for the related events and buckets. The bucket totals must follows the sum of component amounts across all buckets for a given loan.
- Rounding and precision use the configured rounding conventions. When intermediate calculations or totals involve fractional amounts, apply the platform’s rounding rules consistently (e.g., HALF_UP or HALF_EVEN, as defined by the system).

### Operational procedures (quick reference)
1) Access the delinquency view for a loan
- Open the loan account and navigate to the Delinquency Buckets area via Delinquency and Collections > Delinquency buckets > Past Due (Arrears) and Multiple Delinquency Buckets.
- The view presents the instalment-level buckets for the loan, showing each instalment’s current bucket, age window, and component amounts.

2) Inspect a bucket’s financial details
- For a given bucket, review the fields: delinquencyRange (minimumAgeDays, maximumAgeDays, classification) and amount (principal, interest, fees, penalties, total).
- If charges exist for the bucket’s installments, inspect the charges list for id, name, amount, and currency.

3) Interpret a bucket’s calculation
- Confirm that amount.total equals the sum of amount.principal, amount.interest, amount.fees, and amount.penalties for the installments in this bucket.
- Validate that the per-bucket totals reconcile with the loan’s overall delinquency balance across all buckets.

4) Review event history and triggers
- Confirm that a Delinquency Event exists for bucket entries, bucket changes, cures, or pause transitions, to the loan’s lifecycle.

### Reference and context notes
- The feature uses instalment-level delinquency buckets to identify delinquent loans and to support outbound collections calls and bureau reporting.
- The bucket classification is defined by delinquency ranges with ranges identified by minimum and maximum age in days and a descriptive classification name.
- The per-bucket amounts are shown as a breakdown by component, with total computed as the sum of components for the bucket’s installments.
- The event model records transitions between delinquency states and pause states to support downstream processes.

### Quick data reference (illustrative values from the reference data)
- Example bucket data (per the reference): a bucket with principal 250, fees 25, penalties 5, interest 0 yields total 280 for that bucket. This illustrates the per-bucket composition and the resulting total delinquency amount.
- Delinquency range example: minimumAgeDays 1, maximumAgeDays 3, classification Range

1. This defines a bucket associated to the early stage of delinquency.
- The data model includes the following per-bucket fields:
 - delinquencyRange.id, delinquencyRange.minimumAgeDays, delinquencyRange.maximumAgeDays, delinquencyRange.classification
 - amount.principal, amount.fees, amount.penalties, amount.interest, amount.total
 - charges (list of {id, name, amount, currency})
 - loanId, loanExternalId, loanAccountNo, currency

This page provides a concise, operation-focused view of the Past Due (Arrears) and Multiple Delinquency Buckets feature, grounded in the verified data and terminology described in the reference materials. It explains what the feature does, how buckets are determined, how amounts are calculated per bucket, and how events reflect changes in delinquency status for collections and reporting purposes.