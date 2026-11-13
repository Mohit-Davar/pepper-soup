# COB Performance and Reliability

## COB job overview and purpose

COB batch jobs process existing loans and run automated calculations and post-processing that fix rounding issues, EMI or interest issues.

COB steps include:

- ADD_PERIODIC_ACCRUAL_ENTRIES
- LOAN_DELINQUENCY_CLASSIFICATION
- ADD_CANCELLED_TAG
- ADD_MATURED_TAG
- CHECK_LOAN_REPAYMENT_DUE
- CHECK_LOAN_REPAYMENT_OVERDUE
- REPAYMENT_DUE_EVENT
- CHECK_LOAN_ACCOUNT_NEGATIVE_BALANCE
- LOAN_CHARGEOFF
- POST_REPAYMENTS
- APPLY_CHARGE_TO_OVERDUE_LOANS
- UPDATE_LOAN_AREARS_AGING

## Threading and concurrency

The Loan COB job’s worker step runs on multiple threads by attaching a TaskExecutor to it. You set the thread count using a property or environment variable, and the worker step’s throttleLimit is set to the same value.

## Partitioning and loan ID ranges

COB partitions loans by ID range. Each partition covers a min-to-max range of loan IDs, not a fixed count of loans. Partitions are created even when they contain no loans to process, such as partitions #2 through #9 with a 100 partition size.

The min and max loan IDs used for tasklet and partitioned processing can include loan IDs that do not qualify for COB because of gaps in the range.

- The min and max loan IDs used for tasklet and partitioned processing can include loan IDs that do not qualify for COB because of gaps in the range.

Chunk-based processing is recommended in the manager. Chunk size equals partition size, and each partition contains only the loans that qualify for COB.

- Chunk-based processing is recommended in the manager. Chunk size equals partition size, and each partition contains only the loans that qualify for COB.

## Delinquency handling

Delinquency tagging applies only to overdue loans. If a loan is not overdue but already has an active delinquency range, the lifting logic removes it; otherwise no lifting logic runs.

Delinquency range lifting and validation run only when:

- The loan is not overdue.
- The loan has an active delinquency range.

## Inline COB for locked loans

Inline COB runs before a monetary activity against a locked loan when any error is attached to the lock.

## Caching and invalidation

Fineract uses Spring Cache so existing cache logic keeps working when the underlying cache manager changes.

Cache behaviour:

- The cache can become out-of-sync until its time-to-live (TTL) is reached.
- When something changes, cache invalidation messages are published through JMS publish-subscribe using a topic strategy and name the cache to drop.
- Every node must invalidate its cache when something changes.

## Database indexes

Liquibase creates database indexes at deploy to support lookups used during close of business processing.

| Index | Table | Columns |
| --- | --- | --- |
| idx_batch_step_execution_step_name_job_execution_id | batch_step_execution | job_execution_id, step_name, start_time |
| idx_batch_job_execution_job_execution_id | batch_job_execution | job_execution_id |
| idx_batch_job_execution_job_instance_id | batch_job_execution | job_instance_id |
| Index on m_loan_transaction_relation | m_loan_transaction_relation | from_loan_transaction_id |

## Notifications

Notifications are enabled by default through a feature toggle in application properties. When disabled, the backend does not check unread notifications, does not write notification records, and does not send notifications to the UI. An AMQ multi-producer setup sends events while preserving event ordering.

## Infrastructure sizing

Production and performance test environments use the same infrastructure sizing for COB processing.

| Component | Production | Performance test |
| --- | --- | --- |
| RDS DB instance | db.r6g.4xlarge, 1 write and 1 read scalable up to 2 | db.r6g.4xlarge, 1 write and 1 read scalable up to 2 |
| EKS node instance | m6i.2xlarge | m6i.2xlarge |
| EKS node group size | Min 6, max 10 | Min 6, max 10 |
| crpfineractserv pods | Worker 5, Reader 5, Batch-manager 1, Batch-worker 5 | Worker 5/10, Reader 5/10, Batch-manager 1, Batch-worker 5/10 |
| CPU per instance | 0.1 - 1 | 0.1 - 1 |
| Memory per instance | 4096Mi | 4096Mi |
| AMQ instance | mq.m5.4xlarge | mq.m5.4xlarge |

Memory allocated to pods:

- Memory allocated to pods was increased to 85% of 8GB.
- Pods use the G1GC garbage collection strategy.

## Known issues and risks

COB can fail under load or when jobs run at the same time.

Known risks:

- With about 536,000 accounts to process, the batch-manager can crash with an out-of-memory error while COB partitions are still being processed by batch-workers in the background.
- Job execution can fail because concurrent updates prevent serialized access.

## Performance testing

The performance test creates a client, loan, approves and disburses the loan to generate meaningful data for CoB.

The test measures each API call while keeping TPS:

- Mean response time
- 95% response time
- 99% response time
- 99.9% response time

## CoB validation report

You can run the CoB validation report from the UI to get the daily CoB execution numbers. Automated CoB validation runs daily.

## Worked examples

The Loan COB job runs its worker step through a task executor, and the default thread count is 1, so the worker processes loans one after another. The figures below are illustrative. Suppose six loans with IDs 101 through 106 each carry a principal of 1,000.00, and COB posts a 5.00 interest charge to every loan.

| Step | Loan ID | Thread | Principal | Charge | Balance after COB |
| --- | --- | --- | --- | --- | --- |
| 1 | 101 | 1 | 1,000.00 | 5.00 | 1,005.00 |
| 2 | 102 | 1 | 1,000.00 | 5.00 | 1,005.00 |
| 3 | 103 | 1 | 1,000.00 | 5.00 | 1,005.00 |
| 4 | 104 | 1 | 1,000.00 | 5.00 | 1,005.00 |
| 5 | 105 | 1 | 1,000.00 | 5.00 | 1,005.00 |
| 6 | 106 | 1 | 1,000.00 | 5.00 | 1,005.00 |

With one thread, loans are processed serially; increasing the thread count lets the worker handle several loans at the same time.

COB batch jobs process existing loans, and performance tests scale the number of loans and the share of delinquent or overdue loans. The figures below are illustrative. A COB run processes 200 loans, each with one repayment of 1,000.00; no loan is delinquent and no loan is overdue.

| Volume | Loans | Repayments per loan | Total repayments | Delinquent loans | Overdue loans |
| --- | --- | --- | --- | --- | --- |
| Small | 200 | 1 | 200 | 0 | 0 |
| Medium | 2,000 | 1 | 2,000 | 0 | 0 |
| Large | 20,000 | 1 | 20,000 | 0 | 0 |

Raising the loan volume multiplies the repayments the job must process, while a non-zero delinquency share adds delinquency tagging work for the affected loans only.
