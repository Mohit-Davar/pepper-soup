# Spring Batch Framework

## Loan COB business steps

You can configure two business steps for Loan COB: ADD_PERIODIC_ACCRUAL_ENTRIES and UPDATE_LOAN_ARREARS_AGEING. Each step produces the same result as running its standalone job. The system returns the stored business date instead of fetching it from the job explorer.

## Inline COB execution

Inline COB runs for a loan when its last closed business date does not match the actual COB business date. The system posts monetary transactions to the Loan API endpoint for this execution.

## Inline COB item limit

Inline COB jobs process at most 1000 items.

Requests beyond the limit receive:

- HTTP 400 response.

## Regular COB processing

Regular close of business (COB) processing runs without catchup and skips workers whose last closed business date matches the COB business date or who have a hard lock.

The RECALCULATE_INTEREST_FOR_LOAN job recalculates loan interest by partitioning loan IDs into chunks and processing each chunk with a custom ThreadPoolTaskExecutor.

## COB job completion status

When Close of Business (COB) runs with no loans to process, it finishes successfully with status COMPLETED.

## COB locking mechanism

The COB locking mechanism relies only on last_closed_business_date of Loan. The COB worker fails when it tries to insert a lock record with LOAN_COB_CHUNK_PROCESSING as the owner and a unique key error occurs because the loan_id already exists in m_loan_account_locks. ActiveMQ never replays the COB worker message to retry later after this failure. A race condition occurs when loanLockingService.applyLock locks a loan with LockOwner.LOAN_COB_CHUNK_PROCESSING and then Inline COB puts the lock before regular COB, causing the same duplicate key error and failing the COB worker.

## COB job execution parameters

Do not store loan IDs in Loan COB job execution parameters. Pass loan IDs as described in Solution #2.

## Stuck COB job handling

The Loan COB job can remain stuck with the Fetch and Lock loan accounts step in STARTED state, and restarting the job does not resolve it.

The system identifies stuck jobs using the query getRunningJobsIdsByExecutionParameter:

- It selects BATCH_JOB_EXECUTION.JOB_EXECUTION_ID where status is STARTED or STARTING.
- It matches the job name.
- It matches the custom job parameter key and long value from the subquery for custom job parameters.
- It excludes job instances that have a COMPLETED execution for the same job name.

## Stuck job listener authentication

When a Loan COB job fails and the StuckJob listener retries it, user authentication from the Loan COB job is not propagated to the listener.

A failing Loan COB job step that makes an API call throws:

- org.apache.fineract.useradministration.exception.UnAuthenticatedUserException

## Application shutdown behavior

When the application receives the SIGTERM signal, it stops accepting new HTTP requests and new partitions through JMS, then finishes any in-flight requests and partitions before shutting down.

## COB configuration properties

You control Close of Business (COB) processing with application properties. One property enables or disables inline COB execution for loan-related APIs.
