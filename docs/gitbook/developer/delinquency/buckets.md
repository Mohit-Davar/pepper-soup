# Delinquency Buckets

## Delinquency level configuration

You select the delinquency level at the loan product level: loan level or installment level.

## Delinquency bucket setup

A Basic Delinquency Bucket is defined with a Name, Classification Name, and a sequence of delinquency ranges, each with Days From and Days Till. Delinquency Management supports flexible monitoring, identifying, and handling of overdue payments on loans with customized bucketing.

## Delinquency calculation and bucket assignment

Delinquency calculation assigns each overdue installment to a delinquency bucket and stores the loan ID, installment, bucket, outstanding amount, and first overdue date in the database. The loan remains delinquent if any installment is in a bucket, and its delinquency bucket equals the longest overdue bucket.

## Installment-level delinquency

Down-payment installments are also considered for delinquency classification.

Delinquency calculation is not real-time and no history of bucket changes is maintained; when an installment moves from one bucket to another, only the new bucket is shown.

- When an overdue loan account is paid and one old installment is paid fully, only that installment comes out of the delinquency bucket; the loan remains delinquent until all installments come out of the delinquency bucket.
- When a reverse or backdated repayment happens, each installment delinquency is recalculated and assigned to the respective new buckets.

The database table m_loan_instalment_delinquency_tag_history extends m_loan_delinquency_tag_history and stores delinquent installments.

| Field | Stored value |
| --- | --- |
| Instalment sequence | Sequence of the delinquent installment |
| Outstanding amount | Amount outstanding on the installment |
| First overdue date | Date the installment first became overdue |

## Delinquency history and tracking

Delinquency history is not available on the UI; it is only available at database level. Changes made by the Loan Delinquency Calculation (LDC) job are captured in delinquency history. A feature toggle is available to disable or enable the delinquency history feature.

Delinquency history maintains the following fields:

- Delinquent Installment number/Date (overdue since)
- Delinquent Principal Amount
- Delinquent Interest Amount
- Delinquent Fees Amount
- Delinquent Penalty Amount

## Delinquency events

The delinquency change event identifies a loan in delinquency with bucket information so collections teams can call customers to schedule repayment and so the data can be used for bureau reporting. The event is an alternation or descendent of the Delinquency event.

The event is emitted when:

- an installment-level delinquency bucket changes at close of business or through a payment
- a loan enters a delinquency bucket
- a loan moves from one delinquency bucket to another
- a loan comes out of delinquency (cured)
- delinquency pause starts
- delinquency pause ends

Event contents:

- Only buckets with an outstanding amount are listed.
- Multiple installments can feed past due amount into the buckets, and each bucket shows the aggregated amount per bucket.
- When installment-level delinquency is enabled by configuration, the event reflects installment-level bucket changes.
- The event contains a field called delinquencyCalculationPaused.
- The installmentLevelDelinquency field is populated only when the related loan has the enableInstallmentLevelDelinquency flag turned on.

## Delinquency pause and reset

A delinquency reset clears all delinquency records and evaluations before the reset date so they are not used for future delinquency tracking or calculations. The reset takes effect from the current system date only; backdated resets are not permitted. Reset history is kept so you can undo or delete the latest reset, and you can perform multiple resets from the UI.

## Delinquency display and reporting

At the loan level, the delinquency tab shows every configured delinquency bucket and the delinquency amount under each delinquent bucket. A GET API returns the same aggregated delinquency amounts and buckets to support that tab. The current loan-level delinquent display stays unchanged until all installments come out of delinquency.

## Overdue fee slabs

Overdue fee slabs apply flat late fees to loan charges with charge time type Overdue Fees and charge calculation type Fixed fees. Each slab covers a range of overdue amount plus interest plus any fees, and the fee depends on which slab the overdue amount falls into. An administrator can add, edit, and remove slab rows.

| Field | Description |
| --- | --- |
| Overdue Amount From | Lower bound of the overdue amount range |
| Overdue Amount To | Upper bound of the overdue amount range |
| Fixed Fee | Flat fee applied when the overdue amount falls within this slab |

## Grace period

The grace period lets you delay classifying an installment as delinquent. You can set a grace period for each product, or leave it unset so the past due bucket covers the first one to three days as a grace period.

Multiple installments can add to the past due amount in a bucket.

- Empty ranges do not have to be shown.

## Delinquency bucket management

You can attach a bucket to a loan product when you create or update it, but the selection is optional in both the UI and the backend.

Bucket rules:

- You cannot delete a WC delinquency bucket when it is linked to a WC product.
- You can edit a WC bucket while it has open loans.

## Rescheduling and delinquency

The system keeps a reschedule history for each loan account. You can reschedule an active loan account multiple times from the UI, including on the same date.

## Worked examples

When installment-level delinquency is enabled on a loan product, the loan inherits the setting and the end-of-day job evaluates each overdue installment. The figures below are illustrative. A loan with principal 500, annual interest 12 percent, two monthly installments, and 30-day months has two installments that are two days past due. The delinquency range is Range 1, with identifier 1, minimum age 1 day, maximum age 3 days, and classification Bucket 1. The system assigns each overdue installment to that bucket and emits a delinquency change event that identifies the loan and lists only buckets that have an outstanding amount.

| Installment | Days past due | Bucket range | Principal | Interest | Fees | Penalties | Total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 2 | Range 1 (1-3) | 250.00 | 10.00 | 0.00 | 0.00 | 260.00 |
| 2 | 2 | Range 1 (1-3) | 250.00 | 10.00 | 0.00 | 0.00 | 260.00 |
| Bucket total |  | Range 1 (1-3) | 500.00 | 20.00 | 0.00 | 0.00 | 520.00 |

A loan can carry overdue installments in different delinquency ranges, and each range keeps its own aggregated past-due amount. The figures below are illustrative. Using a 1,000 principal loan with three monthly installments and 30-day months, installment 1 is five days past due with 250.00 past due, installment 2 is twenty days past due with 300.00 past due, and installment 3 is ten days past due with 250.00 past due. Bucket 1 applies when days past due are at least 3 and below 15, and Bucket 2 applies when days past due are at least 15 and below 30. The delinquency amount for an installment equals its past due amount. The installmentLevelDelinquency field is populated only when the loan has installment-level delinquency enabled, and the response includes every configured range, even one with zero delinquent amount.

| Bucket range | Minimum age days | Maximum age days | Aggregated delinquent amount |
| --- | --- | --- | --- |
| Bucket 0 (0-2) | 0 | 2 | 0.00 |
| Bucket 1 (3-14) | 3 | 14 | 500.00 |
| Bucket 2 (15-29) | 15 | 29 | 300.00 |
