# Delinquency Buckets

## Delinquency Buckets

### Delinquency bucket setup

A delinquency bucket is a set of preconfigured delinquency ranges that a loan product refers to. Each bucket has a name shown on the user interface, and the same range can belong to more than one bucket.

1. Open "Manage Delinquency Buckets".
2. Enter Name, Frequency, Frequency Type, Minimum Payment and Minimum Payment Type.
3. Choose Add, Delete, Cancel or Submit.

The delinquency bucket screen shows the following columns and controls:

- Name and Type columns.
- A Filter field.
- Create, Regular and Working Capital buttons.

Viewing a delinquency bucket shows the following details:

- Type, Name, Frequency, Frequency Type, Minimum Payment, Minimum Payment Type, Classification, Days From and Days Till.
- Edit and Delete buttons.

Editing a delinquency bucket requires entering the following fields:

- Name.
- Frequency.
- Frequency Type.
- Minimum Payment.
- Minimum Payment Type.

### Delinquency configuration at loan product level

You can configure delinquency at the installment level for a loan product. Delinquency bucket selection is optional when you create or update a loan product, and the option is available in both the UI and backend.

The configuration works as follows:

- A checkbox enables delinquency buckets at the installment level.
- The delinquency bucket classification configuration remains the same for both levels.
- The UI lists delinquency buckets and shows which installments have outstanding amounts or dates that make them delinquent.

### Delinquency calculation and bucket assignment

The system calculates delinquency at the installment level and assigns each overdue installment to its delinquency bucket for the loan account. When any installment is overdue, the loan is marked delinquent and its delinquency bucket equals the longest overdue bucket. The calculation runs in real time and stores the bucket and related information in the database.

The following rules apply to bucket assignment and repayment:

- When an installment moves from one bucket to another, it appears only in the new bucket; no history of the old bucket is stored.
- If one overdue installment is paid in full, only that installment leaves the delinquency bucket; the loan remains delinquent until all installments leave the bucket.
- When a reverse or backdated repayment occurs, each installment's delinquency is recalculated and assigned to its new bucket.
- The system stores the loan ID, installment, bucket, outstanding amount, and first overdue date for each bucket assignment.

Close of business calculates delinquency buckets.

### Delinquency display at loan level

On the Delinquency tab of a loan, the system lists every configured delinquency bucket and shows the delinquent amount under each bucket. Multiple installments can feed past-due amounts into the same bucket, and the bucket shows the aggregated amount. A bucket range with zero delinquent amount still appears in the response so the UI can draw the full table.

The following rules apply to the delinquency display at loan level:

- The current loan-level delinquent display remains unchanged until all installments come out of delinquency.
- Empty delinquency ranges are not shown.

### Special cases in delinquency

A loan inherits its delinquency level configuration from its loan product. Delinquency classification also considers down-payment installments, and charge-off tagged loan accounts follow normal delinquency processing. When grace options for installment delinquency are not required, the past due bucket configured for 1-3 days acts as the grace period.

### Worked examples

A loan product is configured for delinquency at the installment level, and the loan inherits that configuration. Consider a loan of 1,000.00 with two monthly installments of 500.00 each and 30-day months; the figures are illustrative. The first installment is due on 1 January and today is 10 January, so it is nine days past due with no payment received. Bucket 1 covers three to fourteen days past due, and Bucket 2 covers fifteen to twenty-nine days past due. Because the past due balance is greater than zero and the installment is nine days overdue, the system assigns the installment to Bucket 1, sets the delinquency amount to 500.00, and marks the loan as delinquent. The loan’s delinquency bucket is Bucket 1, the longest overdue bucket for the account. This example shows that a single overdue installment places the loan in the matching bucket and marks the loan delinquent.

| Installment | Due date | Days past due | Past due amount | Bucket | Delinquency amount | Loan status |
| --- | --- | --- | --- | --- | --- | --- |
| Installment 1 | 1 Jan | 9 | 500.00 | Bucket 1 (3–14 days) | 500.00 | Delinquent |
| Installment 2 | 1 Feb | 0 | 0.00 | — | 0.00 | — |
| Total | — | — | 500.00 | Bucket 1 | 500.00 | Delinquent |

A loan has three monthly installments of 500.00 each on a 1,000.00 principal, with 30-day months. Installment 1, due on 1 January, is twenty days past due and falls in Bucket 2 (fifteen to twenty-nine days). Installment 2, due on 1 February, is ten days past due and falls in Bucket 1 (three to fourteen days). Installment 3 is current. Before repayment, Bucket 1 holds 500.00 and Bucket 2 holds 500.00, so the loan’s delinquency bucket is Bucket 2 and the loan is delinquent. When the user repays Installment 1 in full, only that installment leaves its bucket; Bucket 2 falls to zero while Bucket 1 keeps 500.00. The loan remains delinquent because Installment 2 is still overdue, and Bucket 1 becomes the loan’s delinquency bucket. This example shows that repaying one installment removes only that installment from its bucket, while the loan stays delinquent until every installment is current.

| Installment | Days past due | Bucket before repayment | Amount before | Bucket after repayment | Amount after |
| --- | --- | --- | --- | --- | --- |
| Installment 1 | 20 | Bucket 2 (15–29 days) | 500.00 | — | 0.00 |
| Installment 2 | 10 | Bucket 1 (3–14 days) | 500.00 | Bucket 1 (3–14 days) | 500.00 |
| Installment 3 | 0 | — | 0.00 | — | 0.00 |
| Total | — | — | 1,000.00 | — | 500.00 |
| Loan’s delinquency bucket | — | Bucket 2 | — | Bucket 1 | — |
| Loan status | — | Delinquent | — | Delinquent | — |

A user opens the delinquency tab on a loan account. The product is configured with buckets Past Due (D0), D3, D10, D15, D30, D45, D60, D90, D120, D150 and D180. The loan holds 300.00 in D3 and 250.00 in D90; every other bucket is zero. The screen lists all configured buckets, shows the aggregated delinquency amount under each, keeps zero buckets in the response so the interface can draw the full table, and marks the loan delinquent because at least one bucket contains an amount. The API returns the same bucket rows as the screen; only the channel changes. This example shows that the delinquency tab aggregates amounts per bucket and retains empty buckets so the full range table can be rendered.

| Bucket | Days past due band | Delinquent amount |
| --- | --- | --- |
| D0 (past due) | 0 days | 0.00 |
| D3 | 3–14 days | 300.00 |
| D15 | 15–29 days | 0.00 |
| D30 | 30–59 days | 0.00 |
| D90 | 60–89 days | 250.00 |
| Total | — | 550.00 |
