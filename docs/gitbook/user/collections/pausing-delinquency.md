# Pausing Delinquency

## About pausing delinquency

Pausing delinquency stops delinquency evaluation for an active loan while the pause remains in effect. It applies to both loan-level and installment-level delinquency calculation. You can change delinquency settings at the loan level, including pausing delinquency; re-age delinquency and reset delinquency are not part of this feature.

Rules:

- Pause and resume apply only to active loans.
- While a loan is actively paused, no delinquency evaluation runs and the existing delinquency bucket stays as is.
- Paying all delinquent amounts removes the delinquent state or tag even while delinquency is paused.

## Pause delinquency on a loan

Use the Loan Delinquency Actions dialog to pause delinquency for an active loan by setting a pause period.

1. Select **Institution** > **Clients** and open the client.
2. Under **Loan Accounts**, select the loan account.
3. Open the **Delinquency Tags** tab.
4. Select **Create Delinquency Action**.
5. Enter the details described below, then select **Submit**.

| Field | Required | Description |
| --- | --- | --- |
| Start Date | Yes | Enter the date the pause starts. It must be today or later and cannot be backdated. |
| End Date | Yes | Enter the date the pause ends. It must be after the start date and cannot be the same day. |

Delinquency calculation is paused for the loan account during the pause period and no delinquency evaluation is required while it is actively paused.

## Pause delinquency classification

Use the loan delinquency tags tab to stop delinquency evaluation for an active loan so its delinquency bucket stays as is while the pause is active.

1. Select **Institution** > **Clients** and open the client.
2. Under **Loan Accounts**, select the loan account.
3. Open the **Loan Delinquency Tags** tab.

Delinquency evaluation is disabled for the loan and the pause appears as active on the tab until you resume it or the pause period ends.

## Eligibility and timing

A pause starts today or later and must last at least one day, so the start date must be before the end date. If no pause period exists yet, the start date cannot be before the loan's first disbursement date. If a pause period already exists, the start date cannot be before that period's end date. The end date cannot be the same as the start date. Delinquency recalculation happens on the last day of the pause. If the loan is repaid, the delinquency pause stops.

## Pausing delinquency

You can pause delinquency on a loan account from the loan account level. Pause and resume buttons appear under the More button on the loan account view. You can set a pause start date in the past. The system shows a validation error if the pause start date is before an existing pause end date or before the disbursement date.

## Resuming delinquency

When you resume delinquency after a pause, delinquency is recalculated at the next close of business (COB), the nightly job that posts interest and fees. The resume date becomes the pause end date for that pause period, and pause days are calculated only up to that date. Resume affects only the delinquency schedule and calculation; it has no impact on breach management.

Resume rules:

- You cannot undo a resume.
- You cannot backdate a resume.
- You cannot resume multiple times.
- Only a user with specific permission or all functions permissions can perform the resume action.

## Pause periods and overlaps

A loan account can have multiple pause periods. Pause dates do not overlap with one another, except in some scenarios where overlapping pauses can both be created successfully.

When pauses overlap:

- One resume on an overlapping date resumes both pauses.

Multiple pauses and resumes:

- Multiple pauses are allowed for the same period with the same start date but different idempotency key.
- Multiple resumes are allowed for the same date with different idempotency key; the same idempotency key returns an idempotent response.

## Pause flag and status

A pause flag shows whether delinquency calculation is paused for a loan. The flag is true when the current date falls within the pause period.

The pause status query returns one of the following results:

- No result means delinquency calculation is enabled.
- A PAUSE entry means delinquency calculation is paused.
- A Resume entry means delinquency calculation is enabled.

## Events and history

The system records changes to the pause flag on a loan account and keeps a reschedule history. Each event includes the pause flag status, the pause start date and the pause end date.

The COB job triggers a LoanDelinquencyRangeChangeBusinessEvent when:

- A loan that was not paused on the previous day becomes paused today.
- A loan that was paused on the previous day comes out of pause today.

At the COB job:

- The system sets the pause flag of the loan account to false.

If a user creates a pause on 27th November with a start date of 25th November, the system sends a loan account change event as of 27th November because a new pause period was just added.

## Backdated pauses

A backdated pause applies a pause to a loan account starting from a date in the past. When you create one, the system recalculates delinquency as of the current loan status and updates the loan-level pause flag in real time. It then retriggers and recomputes the delinquency schedule and evaluation based on the new backdated pause. Only pause and resume actions are supported.

## Delinquency calculation during and after pause

The daily delinquency job runs at close of business (COB), evaluates each loan, and assigns it to the correct delinquency bucket. COB disregards delinquency calculation during a pause, so delinquency does not change for loans with paused calculation. Delinquency calculation takes into account a pause that was paused in the past.

The system retrieves all pause and resume entries for the loan, merges them into effective pause periods, and filters out entries that do not overlap with a pause period.

Effective delinquency is calculated as:

- current date minus unpaid installment date minus sum of relevant pause days

## Delinquency buckets and levels

Delinquency is calculated at the installment level because both the outstanding amount and the time it is due change per installment. At the loan level under the delinquency tab, the system shows all configured delinquency buckets, evaluates each overdue installment, assigns installment amounts to the respective bucket, and marks the loan delinquent. The loan remains marked delinquent even if only one installment is in a delinquency bucket. Delinquency calculation is real-time; when an installment moves from one bucket to another, only the new bucket is shown and no history of the old bucket is stored. When an overdue loan account is paid and one old installment is paid fully, only that installment comes out of the delinquency bucket; the loan remains delinquent until all installments come out.

Days past due and the bucket where the past due balance moves:

| Days past due | Bucket |
| --- | --- |
| 1 | PAST_DUE |
| 4 | DELINQUENT (PAST_DUE tag removed) |
| 4 | D03 |
| 10 | D10 |
| 15 | D15 |
| 30 | D30 |
| 45 | D45 |
| 60 | D60 |
| 90 | D90 |
| 120 | 120 |
| 150 | 150 |
| 180 | 180 |
| 210 | 210 |

Delinquency buckets that apply when pause delinquency is FALSE and the past due balance is greater than 0.00:

| Bucket | Condition | Delinquency state | Delinquency amount |
| --- | --- | --- | --- |
| Bucket 1 Delinquent 3 Days | Days past due minus days paused is greater than or equal to 3 days and less than 15 days | Bucket 1 | Past due amount |
| Bucket 2 Delinquent 15 Days | Days past due minus days paused is greater than or equal to 15 days and less than 30 days | Bucket 2 | Past due amount |

There is an option to select the delinquency level (loan level or installment level) at the loan product level.

## Worked examples

An operations user pauses delinquency on an active loan so the delinquency clock stops while the borrower is temporarily unable to pay. The figures below are illustrative: a $1,000.00 loan has one $250.00 installment due on January 1. No payment is made. The user pauses delinquency from January 5 through January 10. While the loan is paused, no delinquency evaluation runs and the existing bucket remains as is. When the pause ends, the system recalculates delinquency using the raw days past due minus the pause days. The example shows that pause days are subtracted from the days past due, and the delinquency bucket only changes after the pause ends. If the user resumes the pause early on January 8 instead of January 10, the pause days are counted only through January 8, so effective days past due grow faster after the resume date.

| Date | Raw days past due | Pause days | Effective days past due | Evaluation runs? | Delinquency bucket |
| --- | --- | --- | --- | --- | --- |
| Jan 2 | 1 | 0 | 1 | Yes | Not delinquent (Past Due) |
| Jan 5 | 4 | 1 | 3 | No | Remains as is (Not delinquent) |
| Jan 6 | 5 | 2 | 3 | No | Remains as is (Not delinquent) |
| Jan 10 | 9 | 6 | 3 | No | Remains as is (Not delinquent) |
| Jan 11 | 10 | 6 | 4 | Yes | Bucket 1 |
| Jan 22 | 21 | 6 | 15 | Yes | Bucket 2 |

An operations user has paused delinquency on an active loan, but the borrower pays the full past due amount while the pause is still active. The figures below are illustrative: a $1,000.00 loan has one $250.00 installment due on January 1 that remains unpaid. Delinquency is paused from January 5 through January 20. On January 10 the loan is in Bucket 1 with $250.00 past due. On January 12 the borrower pays $250.00 in full. Even though delinquency evaluation is paused, paying the delinquent amount in full removes the delinquent state and tag. The example shows that a full payment of delinquent amounts clears the delinquent state even while delinquency calculation is paused.

| Date | Event | Past due balance | Delinquency tag | Pause flag |
| --- | --- | --- | --- | --- |
| Jan 10 | Delinquency evaluated before payment | $250.00 | Delinquent (Bucket 1) | Paused |
| Jan 12 | Payment of $250.00 posted in full | $0.00 | Not delinquent | Paused |
