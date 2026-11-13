# What's New

## Loan Entity Design

The Loan entity keeps its core loan behaviour while several methods are moved to services, utilities, assembler classes, or the LoanCharge entity.

- Loan#addLoanCharge keeps adding a new loan charge, while charge amount calculations, reprocessing via SingleLoanChargeRepaymentScheduleProcessingWrapper, and loan status transition are handled by the caller.
- Loan#reprocessTransactions is moved into ReprocessLoanTransactionsServiceImpl.
- Loan#reprocessTransactionsWithPostTransactionChecks is moved into ReprocessLoanTransactionsServiceImpl.
- Loan#handleChargeAppliedTransaction is split into smaller pieces and moved into a service or util/assembler class that fetches and calculates all necessary things.
- Loan#handleChargePaidTransaction is split into smaller pieces and moved into a service or util/assembler class that fetches and calculates all necessary things.
- Loan#removeLoanCharge keeps removing a loan charge, while all extra logic and calculations are handled by the caller service.
- Loan#removeOrModifyTransactionAssociatedWithLoanChargeIfDueAtDisbursement keeps removing a transaction from the loan if needed, while calculation logic is handled by the caller.
- Loan#updateLoanCharges is split into smaller pieces and moved into an assembler class.
- Loan#updateLoanSchedule uses an assembler class prepared to update loan installment periods, with incoming parameters being already calculated and updated installment periods rather than a model.
- Loan#updateLoanSchedule keeps updating periods, while updating dependent and summary derived fields is left to the caller.
- Loan#updateLoanSummaryDerivedFields recalculates calculateTotalOverpayment, calculateTotalRecoveredPayments, and updateLoanOutstandingBalances only when it makes sense, not every time.
- Loan#updateLoanSummaryAndStatus is split up so it is clear why and when it is called.
- Loan#updateOverdueScheduleInstallment is moved to the LoanCharge entity.
- Loan#clearLoanInstallmentChargesBeforeRegeneration is moved to the LoanCharge entity or into the caller service.
- Loan#undoApproval keeps loan internal state changes and field value updates, while collecting changes into a map, loan status change, and triggering events are handled outside the Loan entity.
- Loan#handlePayDisbursementTransaction is moved into the caller service or a utility class responsible for calculating and creating everything needed, including pay charge, paid by relation, and update transaction balances.
- doPostLoanTransactionChecks is split into smaller pieces and extracted into caller services, which decide when to recalculate or handle full repayment or overpayment steps.
- Loan#deriveDefaultInterestWaiverTransaction creates a new transaction and is moved out of the Loan entity.
- Loan#updateLoanRepaymentScheduleDates is moved to the caller service.
- Loan#generateInstallmentLoanCharges is moved to the LoanCharge entity or into a service.
- Loan#processPostDisbursementTransactions is moved into ReprocessLoanTransactionsServiceImpl.
- Loan#updateLoanOutstandingBalances is calculated by a utility class instead of the Loan entity.
- The transient field accountNumberRequiresAutoGeneration is removed from the Loan entity.
- The caller decides whether an account number needs to be generated and passes it to the loan entity if applicable.
- The external dependency loanLifecycleStateMachine is removed from the Loan entity.
- Checking whether a loan status change should occur is extracted from the Loan entity and called by the caller if applicable.

- A new module fineract-progressive-loan is created, which depends on the existing fineract-loan module.
- Loan schedule generation is moved into the fineract-progressive-loan module.
- Advance payment allocation is moved into the fineract-progressive-loan module.
- Transaction processor is moved into the fineract-progressive-loan module.
- Allocation rules are moved into the fineract-progressive-loan module.
- Allocation rules are set or updated in the fineract-progressive-loan module.
- Validations which only apply for progressive loan configuration are moved into the fineract-progressive-loan module.

- The Datatables infrastructure splits the Loan entity into two independent entities and extends the same functionality to the Working Capital side.

See also: [Loan Entity Design](architecture/loan-entity-refactoring.md).

## Interest-Bearing Loan Products

- Zero-interest bearing BNPL products are now supported.
- The progressive strategy now supports additional loan module features previously supported only by the cumulative strategy.
- Interest calculation and reverse-replay scenarios for progressive loans, re-aging and re-amortization, charge-backs, charge-off, reschedule, and asset externalization are now supported for interest-bearing loans.

See also: [Interest-Bearing Loan Products](interest/interest-bearing-products.md).

## Progressive Loan Accruals

- Accrual processing leaves out amortized charges.
- The progressive schedule supports additional excess payment handling scenarios and interest-bearing scenarios; earlier it supported only cumulative disbursement recalculation.

See also: [Progressive Loan Accruals](interest/accrual-rework.md).

## Pausing and Resuming Accruals

- Update and delete of an existing interest pause are supported.

See also: [Pausing and Resuming Accruals](interest/pause-resume.md).

## Interest Rate Changes

- Interest modification now supports both cumulative and progressive schedule types and both flat and declining balance interest calculation types.
- Interest rate recalculation now supports flat-type interest calculations in addition to declining interest rate.
- Interest can be modified in the middle of the loan at the installment level without relying on configuring a floating or fixed interest rate at loan creation time.

See also: [Interest Rate Changes](interest/rate-changes.md).

## First-Day Interest

- Interest calculation can start from the disbursement date itself.

See also: [First-Day Interest](interest/first-day.md).

## Payment Allocation Strategies

- Advanced payment allocation now supports excess amount in payment handling and write-off, excess payment handling, interest handling, and the progressive type of strategy.
- Advanced payment allocation now lets a user select the allocation rule or priority of the amount to be allocated at each portion level, broadly classified as past due amount, due amount, and in-advance amount—right in that penalty, fees, principal, interest.

See also: [Payment Allocation Strategies](repayment/strategies.md).

## Loan Payoff

- OverpaidOnDate is now set as submittedOnDate instead of transactionDate.

See also: [Loan Payoff](repayment/payoff.md).

## Chargeback Distribution

- Chargeback Distribution now reprocesses all transactions including the Chargeback to recalculate interest for progressive loans where interest recalculation is enabled if the principal due amount changed.
- Chargeback Distribution now supports chargeback adjustment on the installment due date.
- Chargeback Distribution now supports chargeback of a partial fee.
- Chargeback Distribution now supports chargeback after CBR.
- Chargeback Distribution now supports fees and penalties portion after maturity.
- Chargeback Distribution now supports chargeback after chargeoff.

See also: [Chargeback Distribution](chargeback/distribution.md).

## Interest on Chargebacks

- Chargeback now supports interest calculations and interest chargeback.
- The credited principal is applied as a static, additional value alongside the calculated due principal on the ProgressiveLoanInterestScheduleModel, and these amounts together are used to calculate the due interest of the period.
- The credited interest is applied as a static, additional value alongside the calculated due interest on the model.

See also: [Interest on Chargebacks](chargeback/interest.md).

## Down Payments

- Origination fees can be added to multi disbursements, with each disbursement able to enable or disable them.

See also: [Down Payments](disbursement/down-payments.md).

## Backdated Loans

- Features now support backdated actions and EMI and interest fix.

See also: [Backdated Loans](disbursement/backdated-loans.md).

## Delayed Captures and Full-Term Tranches

- The product supports flexible disbursement options on the same active loan account for complex scenarios or disbursement flows, replacing support for only fixed plan transactions.
- Disbursement changes support planned tranches in addition to progressive disbursements.
- The disbursement module supports multiple disbursements on a loan smoothly and provides capabilities for reschedule, as well as a few changes to the chart of accounts.
- Tranche disbursement supports disbursement without planning for buy-now-pay-later and enables the option to do a disbursement on a closed loan.

See also: [Delayed Captures and Full-Term Tranches](disbursement/delayed-captures.md).

## Repayment Due Date Strategy

- Loan products and loans now support a month-end due date strategy stored in the new nullable month_end_due_date_strategy column on m_product_loan and m_loan.
- Schedule generation now uses the month-end due date strategy from the loan configuration.

See also: [Repayment Due Date Strategy](disbursement/due-date-strategy.md).

## Re-aging

- Re-aging and re-amortization now support interest-bearing loans as well as non-interest-bearing loans.
- These now support interest.

See also: [Re-aging](restructuring/re-aging.md).

## Buy-Down Fees

- Maximum allowed amount equals Approved amount of the loan minus total disbursed amount minus total capitalized income; total buy down fees are removed from the calculation.
- Origination fees adjustments/fee credits are shared.

See also: [Buy-Down Fees](fees/buy-down-fees.md).

## Charge Amortization

- The deferred charge service creates DEFERRED_CHARGE transactions and handles charge lifecycle changes.
- The amortization calculator provides FLAT and EFFECTIVE_RATE engines.
- The amortization processing service calculates amortization to a date, combines charges, writes allocation mappings, and handles closure, charge-off and sale releases.
- The event listener service reacts to close, balance-changed, charge-off (before and after) and undo charge-off events.

See also: [Charge Amortization](fees/charge-amortization.md).

## Delinquency Restrictions

- Delinquency grace days now applies to the schedule; delinquency grace days extends the first delinquency period by the configured grace days, resulting in an extended longer first period.
- The first delinquency period start date is the original start date (submitted on / disbursed on date) and its end date is shifted by the configured grace days.
- Breach grace days calculation is modified; the first breach period start date is the original start date (submitted on / disbursed on date) and its end date is shifted by the configured grace days.
- The first breach/delinquency period is now repayable when the customer pays it before the grace days.

See also: [Delinquency Restrictions](working-capital/delinquency-restrictions.md).

## Transaction Types

- BNPL-specific transactions such as refunds, goodwill, and credit are now incorporated into the loan system.

See also: [Transaction Types](working-capital/transaction-types.md).

## Loan API

- Write API responses now use resourceId and subresourceId for providing back the created or modified resource.
- Write API responses now include resourceType and subResourceType to increase readability and maintainability while keeping backward compatibility.

See also: [Loan API](apis/loan-api.md).

## Loan Originator Metadata

- The Transaction Summary Report and Trial Balance Report now show originator external ids.

See also: [Loan Originator Metadata](apis/loan-originator.md).

## Events and Notifications

- Existing events now include owner.
- A new event is emitted for ownership change.

See also: [Events and Notifications](apis/events.md).

## Spring Batch Framework

- Inline COB locked accounts are skipped from locking because all locked loans are removed from toBeProcessedLoanIds.
- The locking service logic moves to one of the processors in loanBusinessStep processor as a composite processor so that only a chunk of accounts are locked at once and lock failures are retried without ActiveMQ’s involvement.
- Inline-COB locked accounts are excluded from processing in FIND_ALL_NON_CLOSED_LOANS_BY_LAST_CLOSED_BUSINESS_DATE_AND_MIN_AND_MAX_LOAN_ID by joining the m_loan table with m_loan_account_locks table.
- The loanRepository.findAllNonClosedLoansBehindByLoanIds call updates to a service so it can be overridden.
- A new business step recalculates interest of loan.
- A new DeferredChargeAmortizationBusinessStep is added plus a Liquibase row in batch_business_steps.

See also: [Spring Batch Framework](batch/spring-batch.md).

## Migration Tracking

- Migration tracking was introduced so migrated loans are tracked in separate tables with their own audit trail.

See also: [Migration Tracking](migration/tracking.md).

## Backbook Migration

- Back-book migration now introduces a tracking activity where an audit trail is maintained for all migrated loans.

See also: [Backbook Migration](migration/backbook.md).

## Asset Externalization

- Asset externalization now supports interest-bearing loans; previously it supported only non-interest-bearing loans.

See also: [Asset Externalization](assets-investors/asset-externalization.md).

## Accounting Entry Verification

- Accounting mappings when charge-off happens are provided and clear.
- The accounting entries for Origination Fee Adjustment (DR Deferred Income, CR Loan Receivable) are correct.

See also: [Accounting Entry Verification](accounting-reporting/entry-verification.md).
