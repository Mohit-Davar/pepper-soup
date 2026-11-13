# Pausing Delinquency

## About pausing delinquency

Pausing delinquency stops delinquency evaluation for an active loan while the pause remains in effect. The feature belongs to the loan, not the loan product, and applies to both loan-level and installment-level delinquency calculation.

Rules:

- Pause and resume apply only to active loans.
- Payment in full of delinquent amounts removes any delinquent state or tag even while delinquency is paused.

## Eligibility and timing

A pause starts today or later and must last at least one day, so the start date is before the end date. Overlapping pause periods are not allowed. When a pause period already exists, its start date cannot be before the last pause period's end date. When no pause period exists, its start date cannot be before the loan's first disbursement date.

Resume rules:

- Resume is available only when an active pause period exists.
- Resume applies only to the current active pause period.
- Resume start date is always the current business date; no future resume is possible.
- End date must not be specified for a resume.
- Resume cannot be undone, backdated, or performed multiple times.

## Pause and resume actions

You can pause delinquency at the loan account level. While the current date falls within a pause period, the pause flag is true.

Pause and resume behaviour:

- You cannot undo a pause by updating or deleting the pause itself; you must use the resume action.
- When you resume a pause period, delinquency is recalculated at the next close of business (COB), the nightly job that posts interest and fees.
- The resume date becomes the pause end date for that pause period.
- Pause days calculation runs only until the new end date (the resume date).
- A new pause start date can begin as of an old past end date, because pause days calculation works on N+1 days.
- Multiple pauses are allowed for the same period with the same start date but different idempotency keys.
- Multiple resumes are allowed for the same date with different idempotency keys; the same idempotency key returns an idempotent response.
- If pauses overlap, one resume on an overlapping date resumes both pauses.
- In an overlapping pause scenario, a resume action removes the pause on both pause periods.

Backdated pause behaviour:

- If both the pause start date and end date are backdated, there is no effect.
- If the start date is backdated and the end date is in the future, the pause takes effect.
- If both dates are in the future or current date, the pause works normally.

> **Note:** A pause resumes automatically after the pause period if it was not manually resumed during the period.

## Backdated pauses

You can set a pause start date in the past. When you create a backdated pause, the system recalculates delinquency as of the current loan status and updates the pause flag at loan level in real time. Backdated payments reverse and replay the loan account, which recalculates the pause and delinquency days. WC delinquency backdated pause is supported.

## Events

The system emits events when the delinquency pause flag changes on a loan account, including the pause flag status, pause start date, and pause end date.

The COB job triggers a LoanDelinquencyRangeChangeBusinessEvent when:

- A loan was not paused on the previous day but became paused today.
- A loan was paused on the previous day but came out of pause today.
- The calculated delinquency ranges change.

At the COB job:

- The pause flag of the loan account is set to false.

When the assigned delinquency tags change, the external event LoanAccountDelinquencyRangeDataV1 is generated.

## Delinquency calculation during pause

While a loan account has an active delinquency pause, COB does not evaluate delinquency and the existing delinquency bucket remains unchanged. Delinquency calculation still considers past pauses when it runs after the pause period ends. Active, expired, or future delinquency pause information is sent in the event; if the loan never had a delinquency pause set, the fields remain empty.

The system determines whether delinquency calculation is paused by querying m_loan_delinquency_action for the loan:

- A pause entry with a non-null end_date where the business date falls between start_date and end_date inclusive means calculation is paused.
- The query returns the most recent matching record by created_on_utc descending, limited to one row.

To calculate delinquency ranges, the system retrieves all pause and resume entries for the loan:

- For each installment, entries that do not overlap with a pause period are filtered out.
- Effective delinquency equals current date minus unpaid installment date minus the sum of relevant pause days.

Already evaluated periods, where minPaymentCriteriaMet is not null, are not affected and historical data is preserved.

## Delinquency buckets and tags

Delinquency is calculated at the installment level. Each overdue installment is assigned to a delinquency bucket based on its days past due, and the loan is marked delinquent when at least one installment falls into a bucket.

| Days past due | Tag | Bucket | Past due balance moves to |
| --- | --- | --- | --- |
| 1 | PAST_DUE | - | - |
| 4 | DELINQUENT (PAST_DUE tag removed) | - | D03 |
| 10 | - | - | D10 |
| 15 | - | - | D15 |
| 30 | - | - | D30 |
| 45 | - | - | D45 |
| 60 | - | - | D60 |
| 90 | - | - | D90 |
| 120 | - | - | 120 |
| 150 | - | - | 150 |
| 180 | - | - | 180 |
| 210 | - | - | 210 |

| Bucket | Condition | Delinquency state | Delinquency amount |
| --- | --- | --- | --- |
| Bucket 1 Delinquent 3 Days | Pause delinquency is FALSE, past due balance is greater than 0.00, and days past due minus days paused is greater than or equal to 3 days and less than 15 days | Bucket 1 | Past due amount |
| Bucket 2 Delinquent 15 Days | Pause delinquency is FALSE, past due balance is greater than 0.00, and days past due minus days paused is greater than or equal to 15 days and less than 30 days | Bucket 2 | Past due amount |

## API endpoints

Use the loan read endpoints to check whether delinquency calculation is paused and to see the pause period dates. Use the delinquency-actions endpoints to list all delinquency actions for a loan or to create a new one. There is no endpoint to update or delete an existing delinquency action.

| Endpoint | Description |
| --- | --- |
| GET /loans/{loanId} | Returns delinquencyCalculationPaused, delinquencyPausePeriodStartDate, delinquencyPausePeriodEndDate, the current delinquency bucket and amount, and the number of times delinquency has been paused. |
| GET /loans/external-id/{loanExternalId} | Returns the same delinquency pause fields and delinquency state for a loan identified by external ID. |
| GET /loans/{loanId}/delinquency-actions | Retrieves all delinquency actions created for a loan. |
| GET /loans/external-id/{loanExternalId}/delinquency-actions | Retrieves all delinquency actions created for a loan identified by external ID. |
| POST /loans/{loanId}/delinquency-actions | Creates a new delinquency action for a loan. The request body contains action, startDate and endDate. |
| POST /loans/external-id/{loanExternalId}/delinquency-actions | Creates a new delinquency action for a loan identified by external ID. The request body contains action, startDate and endDate. |

## Database table

The m_loan_delinquency_action table records each delinquency action applied to a loan, such as a pause, and the period during which it applies.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| action | VARCHAR(128) | Yes | The enum type of the action, e.g. pause. |
| start_date | Date | Yes | The effective start date of the action, inclusive. |
| end_date | Date | No | The effective end date of the action, inclusive. |
| created_by | Audit column | Yes | The user who created the record. |
| created_on_utc | Audit column | Yes | The time the record was created in UTC. |
| last_modified_by | Audit column | Yes | The user who last modified the record. |
| last_modified_on_utc | Audit column | Yes | The time the record was last modified in UTC. |

## Worked examples

Figures are illustrative. A loan of 1,000.00 is disbursed on 1-Jan-2025 with three monthly installments of 250.00 due on 1-Jan-2025, 1-Feb-2025 and 1-Mar-2025. No payments are made. Delinquency is paused from 3-Jan-2025 through 10-Jan-2025 inclusive, and the pause is manually resumed on 10-Jan-2025, so the resume date becomes the pause end date and pause days are counted from 3-Jan-2025 through 10-Jan-2025.

| Business date | Paused | Days past due | Pause days | Effective days | Bucket / state | Delinquent amount |
| --- | --- | --- | --- | --- | --- | --- |
| 2-Jan-2025 | No | 1 | 0 | 1 | PAST_DUE | – |
| 5-Jan-2025 | Yes | 4 | 3 | 1 | PAST_DUE | – |
| 10-Jan-2025 | Yes | 9 | 8 | 1 | PAST_DUE | – |
| 11-Jan-2025 | No | 10 | 8 | 2 | PAST_DUE | – |
| 12-Jan-2025 | No | 11 | 8 | 3 | DELINQUENT (Bucket 1) | 250.00 |

While the loan is paused, the delinquency age stops growing even though calendar days pass. After the resume date, the paused days continue to be subtracted, so Installment 1 reaches Bucket 1 on 12-Jan-2025 instead of 4-Jan-2025. If the loan were never paused, the same installment would reach Bucket 1 on 4-Jan-2025.

Figures are illustrative. Installment 1 of 250.00 due 1-Jan-2025 is unpaid and the loan is in Bucket 1 with a delinquent amount of 250.00. Delinquency is paused from 3-Jan-2025 through 10-Jan-2025. On 5-Jan-2025, while the pause is active, the full past due amount of 250.00 is paid.

| Business date | Paused | Payment applied | Past due balance | Delinquent state | Delinquent amount | Tag |
| --- | --- | --- | --- | --- | --- | --- |
| 4-Jan-2025 | Yes | – | 250.00 | DELINQUENT (Bucket 1) | 250.00 | DELINQUENT |
| 5-Jan-2025 | Yes | 250.00 | 0.00 | Not delinquent | 0.00 | – |
| 6-Jan-2025 | Yes | – | 0.00 | Not delinquent | 0.00 | – |

An active pause stops delinquency evaluation, but paying the full delinquent amount still clears the delinquent state and tag immediately, even while the pause remains active.

Figures are illustrative. The m_loan_delinquency_action table holds one row per pause or resume action. To decide whether calculation is paused on a business date, take the most recent row for the loan by created_on_utc: a PAUSE row with a non-null end_date pauses calculation when the business date falls between start_date and end_date inclusive; a RESUME row with a null end_date enables calculation from its start_date onward.

| id | Action | Start date | End date | Created on UTC | Business date | Paused? |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | PAUSE | 3-Jan-2025 | 10-Jan-2025 | 3-Jan-2025T09:00:00Z | 5-Jan-2025 | Yes |
| 2 | RESUME | 10-Jan-2025 | – | 10-Jan-2025T09:00:00Z | 11-Jan-2025 | No |
| 1 | PAUSE | 3-Jan-2025 | 10-Jan-2025 | 3-Jan-2025T09:00:00Z | 2-Jan-2025 | No |

The resume row has a null end_date and moves the effective pause end earlier; once a resume row is the most recent record and the business date is on or after its start_date, delinquency calculation is enabled.
