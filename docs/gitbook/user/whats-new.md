# What's New

## BNPL Products

- The product now supports zero-interest bearing BNPL products.
- New transaction types relevant to BNPL were introduced, such as goodwill, credit, and refund transactions.

See also: [BNPL Products: Pay in 30 Days](loan-products/bnpl.md#pay-in-30-days), [BNPL Products: Pay in 3 and Pay in 4](loan-products/bnpl.md#pay-in-3-and-pay-in-4).

## Buy-Down Fees

- The maximum allowed amount equals the approved amount of the loan minus the total disbursed amount minus the total capitalized income; total buy down fees are removed from the calculation.

See also: [Buy-Down Fees](fees/buy-down-fees.md).

## Capitalized Income

- Fees amortization starts from the disbursement date, same as accruals.
- Fees amortization sits in a new bucket rather than the principal portion or fee portion bucket.
- Deferred Income is a LIABILITY account.

See also: [Capitalized Income](fees/capitalized-income.md).

## Fee Classification

- Origination fees can be added to multi disbursements, with each disbursement able to enable or disable them.
- Origination fees adjustments or fee credits are shared.

See also: [Fee Classification](fees/classification.md).

## Delinquency Restrictions

- Delinquency grace days now applies to the schedule; delinquency grace days extends the first delinquency period by the configured grace days, resulting in an extended longer first period.
- The first delinquency period start date is the original start date (submitted on / disbursed on date) and its end date is shifted by the configured grace days.
- Breach grace days calculation is modified; the first breach period start date is the original start date (submitted on / disbursed on date) and its end date is shifted by the configured grace days.
- The first breach/delinquency period is now repayable when the customer pays it before the grace days.

See also: [Delinquency Restrictions](working-capital/delinquency-restrictions.md).

## Loan Originator Details

- Originator type codes are MERCHAT, BROKER, AFFILIATE, PLATFORM.
- Channel type codes are ONLINE, IN_STORE, API, AGGREGATOR.

See also: [Loan Originator Details](loan-origination/loan-originator.md).

## Backdated Loans

- Backdated actions now support EMI and interest fix.

See also: [Backdated Loans](loan-origination/backdated-loans.md).

## Rate Changes

- Interest modification now supports both cumulative and progressive schedule types and both declining and flat interest calculation types; previously it supported only the cumulative strategy and flat interest calculation types.
- Interest modification now allows interest to be changed in the middle of the loan at the installment level without configuring a floating or fixed interest rate at loan creation time.

See also: [Rate Changes: Overview](interest/rate-changes.md#overview).

## Interest Timing

- Interest calculation now starts from the disbursement date itself.

See also: [Interest Timing: First-Day Interest](interest/timing.md#first-day-interest).

## Accruals

- Accrual processing now leaves out amortized charges.

See also: [Accruals: Progressive Loan Accruals](interest/accruals.md#progressive-loan-accruals), [Accruals: Accrual Activity on Installment Dates](interest/accruals.md#accrual-activity-on-installment-dates).

## Payment Allocation Strategies

- Users can select the allocation rule or priority for each portion level, covering past due amount, due amount, and in-advance amount, in the order penalty, fees, principal, interest.
- Advanced payment allocation now supports excess amount handling in payment handling and write-off, and supports the progressive type of strategy.
- Advanced payment allocation now supports excess payment handling and interest handling.

See also: [Payment Allocation Strategies](repayments/allocation-strategies.md).

## Chargeback Distribution

- Chargeback processing now reprocesses all transactions, including the Chargeback, to recalculate interest for progressive loans with interest recalculation enabled when the principal due amount changes.
- Chargeback now applies to chargeback adjustment on an installment due date.
- Chargeback now applies to chargeback of a partial fee.
- Chargeback now applies after a chargeback reversal.
- Chargeback now applies to fees and penalties after maturity.
- Chargeback now applies after chargeoff.

See also: [Chargeback Distribution](chargebacks/distribution.md).

## Interest on Chargebacks

- Chargeback now supports interest calculations and interest chargeback.

See also: [Interest on Chargebacks](chargebacks/interest.md).

## Re-aging

- Re-aging and re-amortization now support interest-bearing loans as well as non-interest-bearing loans.

See also: [Re-aging](restructuring/re-aging.md).

## Asset Externalization

- Asset externalization now supports interest-bearing loans; previously it supported only non-interest-bearing loans.

See also: [Asset Externalization](assets-investors/asset-externalization.md).

## Transaction Summary Report

- The Transaction Summary Report now shows originator external ids.

See also: [Transaction Summary Report](accounting-reporting/transaction-summary.md).
