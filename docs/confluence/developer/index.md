<!-- Labels: developer, index -->
# Pepper-Soup Developer Reference

Architecture, technical specifications, and extension guides for Pepper-Soup.

---

## Page Tree

### Requirements

- [Interest Calculation Products Requirement gathering](requirements/interest-calculation-products-requirement-gathering.md)

### Interest Bearing Products

- [Interest-bearing loan products on Fineract](interest-bearing-products/support-of-interest-bearing-loan-products-on-fineract.md)

### Calculation

- [EMI calculation](calculation/emi-calculation.md)

### Rates

- [Interest Rate by Balance Status and Past Due](rates/provide-ability-to-set-interest-rate-by-balance-status-past-due-etc.md)

### Day Count

- [Calculating interest on 366 days in a year](day-count/support-for-calculating-interest-on-366-days-in-a-year.md)
- [Actual year calculation considering leap year](day-count/actual-year-calculation-considering-leap-year.md)

### Interest Transactions

- [Interest Waiver/Interest Payment Waiver transaction type](interest-transactions/interest-waiver-interest-payment-waiver-transaction-type.md)
- [Transaction type - Interest refund](interest-transactions/transaction-type-interest-refund.md)

### Accruals

- [Enhanced accrual handling](accruals/enhanced-accrual-handling.md)
- [Rework on Accruals](accruals/rework-on-accruals.md)
- [Accrual Activity Posting on Installment date](accruals/accrual-activity-posting-on-installment-date.md)
- [Pause/resume interest accruals on a loan](accruals/pause-resume-interest-accruals-on-a-loan.md)

### Early And Late Repayment

- [Early Repayment/Late repayment Interest Calculation](early-and-late-repayment/early-repayment-late-repayment-interest-calculation.md)

### Rate Change

- [Interest rate modification](rate-change/interest-rate-modification.md)
- [Backdated Interest Modification](rate-change/backdated-interest-modification.md)

### First Day Interest

- [First-Day Interest Recognition on Disbursement](first-day-interest/allow-for-recognition-of-interest-on-first-day-disbursement-date-loan-submit-date.md)

### Allocation Strategies

- [Payment strategy by timely order](allocation-strategies/payment-strategy-by-timely-order.md)

### Configurable Allocation

- [Configurable payment allocations for transactions](configurable-allocation/configurable-payment-allocations-for-transactions.md)

### Advanced Allocation

- [Advanced payment allocation - Add further in advance allocation rules](advanced-allocation/advanced-payment-allocation-add-further-in-advance-allocation-rules.md)

### Credit Adjustments

- [Payment allocation rules for applying credit adjustments to loan balances with interest balances and accruals](credit-adjustments/enhance-payment-allocation-rules-for-applying-credit-adjustments-to-loan-balances-with-interest-balances-and-accruals.md)

### Payoff

- [Payoff transaction(prepay as of given date)](payoff/payoff-transaction-prepay-as-of-given-date.md)

### Next Last

- [New Allocation rule - Next/Last](next-last/new-allocation-rule-next-last.md)

### Distribution Rules

- [Chargeback amount distribution](distribution-rules/chargeback-amount-distribution.md)

### Interest On Chargeback

- [Chargeback transaction posting for interest component](interest-on-chargeback/enhance-chargeback-transaction-posting-for-interest-component.md)

### Down Payment

- [Same day Instalment & Disbursement (down-payment)](down-payment/same-day-instalment-disbursement-down-payment.md)

### Payment Holidays

- [Payment Holidays](payment-holidays/payment-holidays.md)

### Lifecycle Dates

- [Loan lifecycle changes with extra dates](lifecycle-dates/enhance-loan-lifecycle-changes-with-extra-dates.md)

### Fixed Length

- [Fixed Length Loan (for French market)](fixed-length/fixed-length-loan-for-french-market.md)

### Same Day Scenarios

- [Same day CBR/Disbursement Scenarios](same-day-scenarios/same-day-cbr-disbursement-scenarios.md)

### Backdated Loans

- [Backdated Loan Creation and Lifecycle](backdated-loans/backdated-loan-creation-and-lifecycle.md)

### Delayed Captures

- [Delayed Schedule Captures/Full Term tranches](delayed-captures/delayed-schedule-captures-full-term-tranches.md)

### Re Aging

- [Re-aging for Interest bearing products](re-aging/re-aging-for-interest-bearing-products.md)

### Re Amortization

- [Re-amortization for Interest Bearing](re-amortization/re-amortization-for-interest-bearing.md)

### Requirements Parent

- [Re-Amortization / Re-Aging](requirements-parent/re-amortization-re-aging.md)

### Schedule Recalculation

- [Schedule recalculation for overdue loan accounts](schedule-recalculation/schedule-recalculation-for-overdue-loan-accounts.md)

### Delinquency Buckets

- [Past Due (Arrears) and Multiple Delinquency Buckets](delinquency-buckets/past-due-arrears-and-multiple-delinquency-buckets.md)

### Pause Delinquency

- [Pause Delinquency](pause-delinquency/pause-delinquency.md)

### Collections

- [Enhancements to extend support of existing and/or new collections programs to support PPWC i.e. Breathing Space, Re-Age, etc](collections/enhancements-to-extend-support-of-existing-and-or-new-collections-programs-to-support-ppwc-i-e-breathing-space-re-age-etc.md)

### Charge Off

- [Charge-off](charge-off/charge-off.md)

### Write Off

- [Write-off functionality for Progressive loans](write-off/write-off-functionality-for-progressive-loans.md)

### Settlement

- [Settlement Plan](settlement/settlement-plan.md)

### Charge Off Interest

- [Interest Accrual Handling for Charge-off loans](charge-off-interest/interest-accrual-handling-for-charge-off-loans.md)
- [Charge off process to charge off interest due](charge-off-interest/enhance-charge-off-process-to-charge-off-interest-due.md)

### Charge Off Balances

- [Charge-Off: Immediate Due of Future Balances](charge-off-balances/enhance-charge-off-logic-to-make-all-future-balances-on-the-loan-due-immediately.md)

### Contract Termination

- [Contract Termination Feature](contract-termination/contract-termination-feature.md)
- [Contract Termination](contract-termination/contract-termination.md)

### Buy Down Fees

- [Buy-Down fees](buy-down-fees/buy-down-fees.md)

### Fee Classification

- [Buy-Down Fee & Capitalized Income Subtypes](fee-classification/buy-down-fee-capitalized-income-should-have-sub-type-or-payment-type-classification.md)

### Capitalized Income

- [Origination fee -> Capitalized income](capitalized-income/origination-fee-capitalized-income.md)

### Pay In 30 Days

- [Pay in 30 days - Phase 2 [Nice to have]](pay-in-30-days/pay-in-30-days-phase-2-nice-to-have.md)

### Pay In 3 4

- [Scoping & Planning for Pay in 3 and Pay in 4 rollout](pay-in-3-4/scoping-planning-for-pay-in-3-and-pay-in-4-rollout.md)

### Cross Cutting

- [Cross cutting changes for Pay in 3/4](cross-cutting/cross-cutting-changes-for-pay-in-3-4.md)
- [Enhancements to existing cross-cutting capbailities in SOR to support PPWC and EWC products such as charge module, credit balance refund, flat amortization calculation, and chargeback support](cross-cutting/enhancements-to-existing-cross-cutting-capbailities-in-sor-to-support-ppwc-and-ewc-products-such-as-charge-module-credit-balance-refund-flat-amortization-calculation-and-chargeback-support.md)

### Scope

- [EIR / PPWC new scope](scope/eir-ppwc-new-scope.md)

### Product

- [Loan product support for Effective interest rate (PPWC)](product/loan-product-support-for-effective-interest-rate-ppwc.md)

### Phase 2

- [EIR inspaction and design](phase-2/eir-inspaction-and-design.md)
- [EIR Calculation Phase 2 - Batch Job Foundation](phase-2/eir-calculation-phase-2-batch-job-foundation.md)
- [EIR Calculation Phase 2 - Restrictions (lDelinquency)](phase-2/eir-calculation-phase-2-restrictions-ldelinquency.md)
- [EIR Calculation Phase 2 - Transaction Types](phase-2/eir-calculation-phase-2-transaction-types.md)
- [EIR Calculation Phase 2 - Accounting](phase-2/eir-calculation-phase-2-accounting.md)
- [EIR Calculation Phase 2 - Breach Management](phase-2/eir-calculation-phase-2-breach-management.md)

### Projected Balances

- [Planned / Projected balances and calculation to support new EIR calculation method](projected-balances/planned-projected-balances-and-calculation-to-support-new-eir-calculation-method.md)

### Repayment Percentage

- [API: modifying repayment percentage](repayment-percentage/design-only-of-the-api-to-support-modifying-repayment-percentage.md)

### Loan Api

- [API Change requests - Loan submission / get loan](loan-api/api-change-requests-loan-submission-get-loan.md)

### Events

- [Events related changes](events/events-related-changes.md)

### Pre Creation

- [Repayment Summary before loan creation](pre-creation/repayment-summary-before-loan-creation.md)

### Api

- [API implementation - new requests](api/api-implementation-new-requests.md)

### Originator

- [Loan origination details (Merchant BNPL Checkout Capabilities)](originator/loan-origination-details-merchant-bnpl-checkout-capabilities.md)

### Asset Transfer

- [Asset Externalization in Fineract](asset-transfer/asset-externalization-in-fineract.md)

### Danube Rollout

- [Epic to track issues and tickets related to Project Danube Rollout for Asset Externalization](danube-rollout/epic-to-track-issues-and-tickets-related-to-project-danube-rollout-for-asset-externalization.md)

### Investor

- [Investor Module changes](investor/investor-module-changes.md)

### Investor 2 0

- [Investor Module Enhancement](investor-2-0/investor-module-enhancement.md)

### Asset Owner

- [Accounting and Asset related changes](asset-owner/accounting-and-asset-related-changes.md)

### Financial Year

- [Financial Year Ending](financial-year/financial-year-ending.md)

### Reports

- [Transaction summary report changes](reports/transaction-summary-report-changes.md)
- [Trial Balance report changes](reports/trial-balance-report-changes.md)

### Accounting Verification

- [Interest Bearing Accounting entries verification for all Monetory transactions](accounting-verification/interest-bearing-accounting-entries-verification-for-all-monetory-transactions.md)

### Journal Entries

- [Journal entry aggregation](journal-entries/journal-entry-aggregation.md)

### Migration Tracking

- [Allow us to track migration activities](migration-tracking/allow-us-to-track-migration-activities.md)

### Backbook Migration

- [Backbook Migration - Analysis, Preparation & Support](backbook-migration/backbook-migration-analysis-preparation-support.md)

### Code Refactoring

- [Interest bearing Progressive Loan performance improvements](code-refactoring/interest-bearing-progressive-loan-performance-improvements.md)

### Batch And Cob

- [Spring Batch - Ph3 [CoB extension]](batch-and-cob/spring-batch-ph3-cob-extension.md)
- [CoB Performance, stability and reliability improvements](batch-and-cob/cob-performance-stability-and-reliability-improvements.md)

### Reliability

- [Graceful shutdown and recovery](reliability/graceful-shutdown-and-recovery.md)

### Infrastructure

- [Well-managed infrastructure setup](infrastructure/well-managed-infrastructure-setup.md)

### Architecture

- [Modularisation of components](architecture/modularisation-of-components.md)

### Security

- [Self-Service API](security/separate-out-self-service-api.md)
- [Improve tenant separation and security](security/improve-tenant-separation-and-security.md)
- [For when Pepper Soup support staff are more active in system and need to integrate with PP user directory](security/for-when-pepper-soup-support-staff-are-more-active-in-system-and-need-to-integrate-with-pp-user-directory.md)
- [Vulnerability issues](security/vulnerability-issues.md)

### Data Integrity

- [Write serialization](data-integrity/write-serialization.md)

### Ci Cd

- [CI/CD improvment](ci-cd/ci-cd-improvment.md)

### Async Jobs

- [Enhancing SendAsynchronous Job](async-jobs/enhancing-sendasynchronous-job.md)

### Libraries

- [Deprecate OkHttp and migrate to Apache HTTP client](libraries/deprecate-okhttp-and-migrate-to-apache-http-client.md)

### Persistence

- [Moving away from DB-enforced auto-increment primary keys](persistence/moving-away-from-db-enforced-auto-increment-primary-keys.md)

### Bugs And Security

- [Business Logic related error ➡️ http403](bugs-and-security/business-logic-related-error-http403.md)

### Stability

- [Dev - Pi 30 - Post-Production Stability](stability/dev-pi-30-post-production-stability.md)
- [Dev - Pi 3 & 4 Post-Production Stability](stability/dev-pi-3-4-post-production-stability.md)

### Quality 2024 Q3

- [Quality issues and support 2024 Q3](quality-2024-q3/quality-issues-and-support-2024-q3.md)

### Quality 2025 Q1

- [Quality issues and support 2025Q1](quality-2025-q1/quality-issues-and-support-2025q1.md)

### Re Aging Fixes

- [Re-aging bug fixes and post production support](re-aging-fixes/re-aging-bug-fixes-and-post-production-support.md)

### Team Process

- [Project Internal Meetings](team-process/project-internal-meetings.md)
- [PepperSoup POC Report Out](team-process/peppersoup-poc-report-out.md)
- [Agile Ceremonies](team-process/agile-ceremonies.md)

### Documentation

- [Documentation extension for 1.7.0 release](documentation/documentation-extension-for-1-7-0-release.md)

### Partner Collaboration

- [Workshop between Mifos and PP team for long-term relationship-building and collaboration](partner-collaboration/workshop-between-mifos-and-pp-team-for-long-term-relationship-building-and-collaboration.md)

### Reuse

- [REUSABLE](reuse/reusable.md)

### Onboarding

- [Onboarding, knowledge transfer](onboarding/onboarding-knowledge-transfer.md)
