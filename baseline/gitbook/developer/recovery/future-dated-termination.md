# Future-Dated Termination and Loan Withdrawal

## Feature overview

Contract termination supports a user-selected transaction date, including a future date before the loan’s current maturity date. Loan withdrawal is a separate transaction type with comparable early termination behavior, so business processes can distinguish loan withdrawal from contract termination while sharing date validation, interest calculation, and transaction processing. Both operations use the shared early termination service, LoanEarlyTerminationServiceImpl, which runs through the legacy command pipeline. Each operation supplies its own transaction type, loan substatus, validation rules, and business events.

## Transaction date rules

You supply an optional transaction date as the effective date for contract termination or loan withdrawal. When omitted, the system uses the current tenant business date. UI and API apply the same business rules, and server validation is authoritative.

An explicitly supplied date must parse successfully; a malformed date fails validation and does not fall back to the business date.

- An explicitly supplied date that cannot be parsed produces a validation error.

The requested date D is compared with the business date B and the loan maturity date M.

| Condition | Contract termination | Loan withdrawal |
| --- | --- | --- |
| D < B | Rejected | Allowed only when D is not earlier than the latest relevant transaction or charge submission |
| D = B | Allowed when eligible | Allowed when eligible |
| B < D < M | Allowed when eligible | Allowed when eligible |
| D ≥ M | Rejected | Rejected |

Same-day and same-maturity edge cases:

- Same-day termination after maturity retains existing behavior.
- A future date equal to maturity is rejected.
- A future date after maturity is rejected.
- For past-dated withdrawal, equal dates are permitted by the current date comparisons.
- Existing transaction ordering determines ordering within the same day.

Historical withdrawal conditions:

- Historical withdrawal after all relevant transactions and charge submissions is accepted.
- Historical withdrawal before a relevant transaction is rejected.
- Historical withdrawal before an active charge submission is rejected.

> **Note:** Contract termination before the business date is rejected.

Contract termination and loan withdrawal date rules:

- Loan withdrawal allows the current business date, eligible future dates, and eligible past dates.
- The current implementation applies the maturity boundary specifically to future dates.

Business-date operations:

- Either operation on the business date is accepted when eligible.
- A future date before maturity is accepted when eligible.

## Request parameters

The request accepts a date, an optional external transaction identifier, and an optional transaction note. The date format and locale determine how the date is parsed. The external identifier is optional and subject to existing validation. The note is optional.

## Eligibility and permissions

Future-dated termination and loan withdrawal keep the existing loan eligibility, permission, and transaction processing restrictions. The service requires an open loan, an active client or group, and a progressive repayment schedule, and it applies the remaining existing eligibility checks.

The validator applies these date rules:

- For loan withdrawal, the system rejects a date earlier than the last user transaction date, excluding amortization transactions.
- For loan withdrawal, the system rejects a date earlier than the submission date of any active charge.

> **Note:** When maturity is absent, the validator skips the maturity comparison. Whether such a loan permits future termination remains a business-rule decision.

## Endpoints

Use these endpoints to terminate a loan contract or withdraw a loan at a future date. The same routes support undoing either action.

| Endpoint | Purpose |
| --- | --- |
| POST /fineract-provider/api/v1/loans/{loanId}?command=contractTermination | Terminate a loan contract at a future date |
| POST /fineract-provider/api/v1/loans/{loanId}?command=loanWithdrawal | Withdraw a loan at a future date |
| POST /fineract-provider/api/v1/loans/{loanId}?command=undoContractTermination | Undo a contract termination |
| POST /fineract-provider/api/v1/loans/{loanId}?command=undoLoanWithdrawal | Undo a loan withdrawal |

## Processing flow

The service records the transaction with that future date, updates the loan substatus, and processes the financial consequences immediately; no scheduled job waits until the selected date.

The processing flow runs as follows:

- The UI or API request resolves the operation and transaction date.
- The service validates loan eligibility and date rules.
- It creates the early termination transaction.
- It recalculates the schedule and processes the transaction.
- It persists the transaction and loan changes.
- It publishes the existing balance-change and operation-specific post-business events.
- It returns the transaction identifier and changes.

## Interest and schedule

Interest is calculated up to the selected termination or withdrawal date using the loan’s configured calculation conventions, and the selected transaction date is used throughout the early termination calculation.

The system applies the following rules:

- Existing interest, rounding, allocation, and schedule calculation logic is reused.
- For interest-bearing loans with interest recalculation enabled, the repayment schedule is regenerated and transactions are reprocessed with the new transaction.
- Otherwise, the new transaction is processed through the existing latest-transaction path.
- Existing rules for principal, fees, penalties, and transaction allocation apply.
- The revised schedule and outstanding balances reflect early termination.
- Subsequent business-date processing does not introduce interest beyond the effective termination date contrary to the revised schedule.

## Transaction types and identifiers

The system records loan withdrawal as a distinct transaction type and keeps it distinguishable from withdrawal of a loan application. Transaction responses, history, reporting, and event mappings retain the distinction between loan withdrawal and contract termination.

| Operation | Transaction type | Transaction type ID | Loan substatus |
| --- | --- | --- | --- |
| Contract termination | CONTRACT_TERMINATION | 38 | CONTRACT_TERMINATION — 900 |
| Loan withdrawal | LOAN_WITHDRAWAL | 48 | LOAN_WITHDRAWAL — 901 |

## Persistence and events

The system persists the transaction, loan changes, and related accounting changes within the existing transaction boundary. It preserves the effective transaction date, transaction type, external identifier, notes, and existing command audit information. It applies existing permission and maker-checker mechanisms where configured. The response contains the created transaction identifier, loan identifier, and applicable changes.

## Undo

You can undo a future-dated termination when the termination transaction is the last user transaction on the loan account. Undo reverses the transaction, clears the early termination substatus, regenerates the schedule where applicable, reprocesses transactions, and emits the corresponding events.

## Errors

The system rejects malformed dates and unsupported parameters with meaningful errors, and retains operation-specific error context so clients can identify the failed action.

Date validation errors use these suffixes:

- Supplied date cannot be parsed — invalid.date.format.
- Contract termination predates the business date — cannot.be.before.business.date.
- Future date is on or after the maturity date — must.be.before.maturity.date.
- Withdrawal predates the last relevant transaction — cannot.be.before.last.transaction.date.
- Withdrawal predates an active charge submission — cannot.be.before.charge.submitted.on.date.

## Worked examples

A customer terminates an open loan on a scheduled due date. The illustrative loan has a principal of 1,000, an annual interest rate of 12%, three monthly installments, and 30-day months. The figures are illustrative. Interest accrues at 1% per month. The first installment falls due after 30 days and the second after 60 days. Termination is requested for the second due date, so interest is calculated only up to that date and the outstanding principal is repaid in full.

| Day | Event | Interest | Principal repaid | Amount paid | Balance |
| --- | --- | --- | --- | --- | --- |
| 0 | Disbursement | 0.00 | 0.00 | 1,000.00 | 1,000.00 |
| 30 | Installment 1 | 10.00 | 330.00 | 340.00 | 670.00 |
| 60 | Termination | 6.70 | 670.00 | 676.70 | 0.00 |

The same loan is terminated between installments. The business date is day 60, the maturity date is day 90, and the customer requests termination for day 45, which is after the first installment on day 30 and before the second due date on day 60. Because the requested date is before maturity, it is accepted. Interest accrues on the outstanding principal of 670 for the 15 days from day 30 to day 45.

| Day | Event | Interest | Principal repaid | Amount paid | Balance |
| --- | --- | --- | --- | --- | --- |
| 0 | Disbursement | 0.00 | 0.00 | 1,000.00 | 1,000.00 |
| 30 | Installment 1 | 10.00 | 330.00 | 340.00 | 670.00 |
| 45 | Termination | 3.35 | 670.00 | 673.35 | 0.00 |

Date eligibility differs between the two operations. The business date is day 60, maturity is day 90, and the last relevant transaction or charge submission is day 30. A request dated day 45 is in the past relative to the business date. Contract termination, transaction type CONTRACT_TERMINATION with ID 38 and substatus CONTRACT_TERMINATION — 900, rejects any date before the business date. Loan withdrawal, transaction type LOAN_WITHDRAWAL with ID 48 and substatus LOAN_WITHDRAWAL — 901, accepts a past date only when it is not earlier than the last relevant transaction or charge submission. A date on or after maturity is rejected for both operations.

| Operation | Requested date | Check | Result |
| --- | --- | --- | --- |
| Contract termination | Day 45 | Day 45 is before business date day 60 | Rejected |
| Loan withdrawal | Day 45 | Day 45 is on or after last transaction day 30 | Accepted |
| Loan withdrawal | Day 20 | Day 20 is before last transaction day 30 | Rejected |
| Contract termination | Day 90 | Day 90 is on or after maturity day 90 | Rejected |
| Loan withdrawal | Day 100 | Day 100 is after maturity day 90 | Rejected |
