# Backbook Migration

## Backbook Migration

### Backbook migration acceptance criteria

Backbook migration acceptance criteria cover multi-disbursement loans and loans with charges and fees. Each set defines how backdated loans and transactions are processed, what a single COB execution creates, and how post-migration COB behaves.

Multi-disbursement loan migration acceptance criteria:

- Backdated multi-disbursement loans are created successfully.
- Backdated transactions are processed correctly.
- A single COB execution creates one aggregated accrual entry reflecting total interest on consolidated principal and N accrual activities, where N equals overdue periods on respective due dates.
- Post-migration daily COB operates normally on the consolidated loan schedule.

Loans with charges and fees migration acceptance criteria:

- Backdated loans with charges and fees are created successfully.
- Backdated charge applications and payment reversals are processed.
- A single COB execution creates one aggregated accrual entry including interest plus charges and N accrual activities reflecting charge impact on due dates.
- Delinquency calculations include all unpaid amounts: principal plus interest plus charges.
- Post-migration COB continues accurate charge processing.

### Multi-disbursement loan migration

Multi-disbursement loan migration supports backdated loans created while the current business date remains unchanged, with no COB run during migration and a single inline COB before completion to produce aggregated accrual entries for consolidated disbursements plus accrual activities for each overdue period. Loans with charges and fees can be migrated by backdating charge application dates and applying payment reversals or refunds in a backdated manner, followed by a single inline COB execution that generates aggregated accruals including charge components.

Migration configuration covers the following settings:

- A multidisbursal loan that does not expect a tranche can have the 'Disallow Expected Disbursements' setting enabled at loan level.
- Disbursement charge calculation type is '% loan amount + interest' with an amount of 2.00.

### COB job behavior

COB jobs run correctly across multiple tenants when executions overlap. A single migration COB processes all backdated accruals and creates one aggregated Accrual entry per loan, differentiated by loan status: active loans receive full accrual, closed loans receive final accrual ending at the closure date, and overpaid loans receive no ongoing accrual. Accrual Activities are created only for applicable periods, with N activities for active periods and none after closure. Post-migration daily COB generates incremental accruals correctly.

### Accrual activity creation

The system creates accrual activity for each day with proper interest amounts. Accruals are recognized until the closure date for preclosed loans and until the current date for active loans. Aggregation is proper for extensive past-due periods.

Accrual activity is created in the following cases:

- Accrual activity is created on loans that were already closed or overpaid.
- Accrual activity is created on loans that stay in overpaid status if the credit balance refund step is ignored.
- Accrual activity is created for both backdated loans and regular loans created on the current date.

### Accrual calculation accuracy

Accrual calculation remains accurate across leap year boundaries, month-end dates, and leap day processing, and it accounts for special transaction impacts such as reduced principal and loan closure. Delinquency is not set on properly closed or overpaid loans, and delinquency calculation remains correct for long overdue loans. Holiday and weekend transaction processing follows business rules configuration without inappropriate date shifting at month-end.

### Accrual activity reporting issues

Accrual activity is excluded from the transaction summary report.

The field totalUnpaidPayableNotDueInterest holds the cumulative unpaid interest amount after an accrual is created.

After reversing the first repayment, MIR and CBR do not show in transactions and the current balance reflects an incorrect amount.

Accounting entries of transactions made before the fraud tag keep the same non-fraud accounting entries during the replay after the fraud flag is in place.

Fraud related GL accounting entries are applied for backdated transactions when the fraud flag was applied on the loan.

### Loan schedule and repayment issues

A loan product with a progressive loan schedule, interest recalculation enabled, a 7% interest rate, no accounting entries, and six repayments fails when fetching loan details after an on-time first repayment and a charge-off on the due date of the second period because reverse-replay is not allowed. The loan schedule must not contain a middle installment with a higher amount while the last installment is paid. If this occurs, the loan becomes OVERPAID and the repayment schedule breaks. None of these interest rate reschedule cases are allowed.

### Merchant Issued Refund configuration

Merchant Issued Refund applies to progressive, horizontal, interest-bearing loans with interest recalculation disabled and in-advanced allocation set to reamortization. MIR allocation uses LAST_INSTALLMENT.

Allocation settings for multi-disbursal loans are:

- Multidisbursal loans with an enabled 25% downpayment use NEXT_INSTALLMENT for downpayment allocation.
- The default allocation is REAMORTIZATION.

Further disbursement rules are:

- Further disbursement is allowed on the UI for multi-disbursal loans, including closed or overpaid loans.
- The disbursement charge amount is calculated based on the disbursement amount plus interest.

### Goodwill credit journal entries

Goodwill credit journal entries are invalid after reverse and replay because allocations go to the chargeoff GL account even though the account is not charged off. The loan product configuration for the goodwill credit issue is progressive, interest bearing, with interest recalculation true. Goodwill credit journal entries must not be allocated to the charged off GL account.

### Loan transaction business events

Loan transaction business events expose details of loan transactions for downstream systems. The GET Loan details call is the only available API that retrieves loan transactions but does not support filtering loan transactions based on type.

The following behaviour applies to loan transaction business events:

- LoanAdjustTransactionBusinessEvent does not show if the transaction was reversed or not.
- For an accrual activity that is reversed and replayed, manually_adjusted_or_reversed is marked as false in m_loan_transaction and in LoanAdjustTransactionBusinessEvent, so downstream systems cannot determine if it is an adjustment.
- The loan transaction business events should include the reverted flag to support downstream systems.

The following behaviour applies to Fee Waiver responses:

- The subResourceExternalId field is not returned in the Fee Waiver response object when a loan is charged off, and this only happens for interest bearing loans.
- subResourceExternalId must be returned in the Fee Waiver response.

The customer concern was about Accrual transactions and their multiplicity.

- When the global configuration does not exist with the name, Fineract should raise a proper exception with message Configuration property " + propertyName + " does not exist."
- When fetching by id and the configuration identifier does not exist, Fineract should raise a proper exception with message Configuration identifier " + configId + " does not exist."

### Configuration fetching by name and id

You can fetch a global configuration entry by name or by id using GET /configurations/name/{name} or GET /configurations/{id}. If the configuration does not exist, the API returns HTTP 500. The getLoan API call and LoanAccountCustomSnapshotBusinessEvents return the totalUnpaidPayableNotDueInterest field.

### Configuration service implementation

ConfigurationReadPlatformServiceImpl fetches configuration by id or name and is slated to use GlobalConfigurationRepositoryWrapper for cached property fetching with not found handling, with native queries removed entirely. The COB job retrieves loan ids through RetrieveAllNonClosedLoanIdServiceImpl#retrieveLoanCOBPartitions.

### Rounding mode configuration

Rounding mode configuration controls how decimal values are rounded during backbook migration calculations. The default rounding mode is HALF_EVEN (6) and cannot be changed in Fineract. The initial rounding mode value may be set from application.properties and initialized from there.

The trap_door configuration may be changed if no loans, savings, etc. were created.

Events publishing has an int overflow issue when the sequence id goes beyond Integer.MAX_VALUE. Part of the issue was fixed, but a piece of code in MessageFactory was missed which still results in issues.

The datatype of a database stored field and its backend field must match and be correct to avoid overflow. ExternalEvent id is bigint in the database but is sent as an int in external business events.

Closed loans and overpaid loans are handled as follows:

- Closed loans are marked appropriately with no ongoing delinquency.
- Overpaid loans are tracked with excess amounts and no further interest accrual.

Accrual and delinquency calculations for complex date scenario loans work as follows:

- A single COB execution creates one aggregated Accrual with accurate leap year and month-end calculations.
- N Accrual Activities are correctly distributed across complex date boundaries.
- Long past-due scenarios generate accurate aggregated delinquency amounts.

Migration workflows behave as follows:

- During migration, schedule recalculation after same-day partial repayments reduces subsequent installments.
- Preclosure transactions mark the loan as closed with final balance calculations.
- Refund transactions adjust principal and interest calculations appropriately.
- Future installments remain unprocessed until their due dates are reached.
- Future installments process normally when due dates are reached.
- Payment allocation strategies (next/final installment) work correctly for early payments.

ProgressiveLoanSummaryDataProvider computeTotalUnpaidPayableNotDueInterestAmountOnActualPeriod calculates totalUnpaidPayableNotDueInterest incorrectly for interestRecalculation = false because it does not expect more interest paid than the actual due, but with interest recalculation false it is possible.

The loan is progressive, interest recalculation is enabled, 360/30, single disbursement, e.g. LP2_ADV_PYMNT_INTEREST_DAILY_EMI_360_30_INTEREST_RECALCULATION_DAILY_TILL_PRECLOSE.

### Worked examples

A backdated loan is disbursed, accrues interest while active, is closed by a credit balance refund, and a later close of business must not create post-closure accrual activity. The figures are illustrative: principal 1,000.00, annual interest rate 12%, 30-day months, and a 360-day year. The loan is disbursed on day 1, the first close of business runs on day 30 while the loan is active, a credit balance refund closes the loan on day 31, and a second close of business runs on day 60 after closure.

| Day | Event | Principal balance | Interest accrued | Accrual activity | Loan state |
| --- | --- | --- | --- | --- | --- |
| 1 | Disburse | 1,000.00 | 0.00 | None | Active |
| 30 | Close of business | 1,000.00 | 10.00 | One aggregated entry | Active |
| 31 | Credit balance refund closes loan | 0.00 | 0.00 | Final accrual ends | Closed |
| 60 | Close of business | 0.00 | 0.00 | None | Closed |

If the loan stayed open, the day-60 close of business would add another accrual activity; because the loan is closed, only the final accrual ending at the closure date exists and no post-closure activities are created.

An interest-bearing loan accrues daily interest. After a partial repayment, each subsequent close of business adds the day's interest to the cumulative unpaid not-due interest. The figures are illustrative: principal 1,000.00, annual interest rate 12%, 30-day months, and a 360-day year. A repayment of 100.00 on day 15 pays 90.00 toward principal and 10.00 toward interest, leaving a principal balance of 910.00. Daily interest on 910.00 is 0.30. Close of business runs on days 16 through 19.

| Day | Event | Principal balance | Daily interest | Cumulative unpaid interest | totalUnpaidPayableNotDueInterest |
| --- | --- | --- | --- | --- | --- |
| 1 | Disburse | 1,000.00 | 0.00 | 0.00 | 0.00 |
| 15 | Repayment 100.00 | 910.00 | 0.00 | 0.00 | 0.00 |
| 16 | Close of business | 910.00 | 0.30 | 0.30 | 0.30 |
| 17 | Close of business | 910.00 | 0.30 | 0.60 | 0.60 |
| 18 | Close of business | 910.00 | 0.30 | 0.90 | 0.90 |
| 19 | Close of business | 910.00 | 0.30 | 1.20 | 1.20 |

The summary field must hold the cumulative unpaid not-due interest, here 1.20, rather than remaining at 0 after accruals are posted.

Backdated repayments and a merchant issued refund overpay the loan, a credit balance refund pays out part of the excess, and reversing the first repayment must restore the ledger while keeping the refund transactions visible. Principal 120.00, annual interest rate 12%, 30-day months. The loan is disbursed two days before the current business date, two repayments of 20.00 and a merchant issued refund of 120.00 are posted one day before the current date, a credit balance refund of 20.00 posts on the current date, and the first repayment is reversed on the current date.

| Day | Transaction | Amount | Balance after |
| --- | --- | --- | --- |
| -2 | Disbursement | +120.00 | 120.00 |
| -1 | Repayment | -20.00 | 100.00 |
| -1 | Repayment | -20.00 | 80.00 |
| -1 | Merchant issued refund | -120.00 | -40.00 |
| 0 | Credit balance refund | +20.00 | -20.00 |
| 0 | Reverse first repayment | +20.00 | 0.00 |

Reversing the repayment returns the balance to zero, and the merchant issued refund and credit balance refund remain in the transaction history, so the current balance stays correct and no transaction is hidden.

A progressive loan with interest recalculation disabled receives a merchant issued refund. The in-advance horizontal allocation divides the unprocessed amount across the remaining installments, and rounding the even portion upward can leave a negative balancing adjustment on the final installment. Principal 50.00, annual interest rate 19.99%, 12 monthly installments. After a 5.00 repayment and a 25.00 merchant issued refund, 0.06 remains to allocate across 11 installments.

| Step | Value | Result |
| --- | --- | --- |
| Unprocessed amount | 0.06 | — |
| Remaining installments | 11 | — |
| Even portion per installment | 0.01 | Rounded from 0.00545 |
| Total even portions | 0.11 | 11 x 0.01 |
| Balance adjustment | -0.05 | 0.06 - 0.11 |
| Final installment portion | -0.05 | Even portion plus balance adjustment |

Rounding the even portion upward makes the distributed total exceed the unprocessed amount, so the balancing adjustment is negative and produces a negative installment portion.
