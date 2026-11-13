# Collections Programs

## Working Capital business events

A Working Capital business event carries the generic loan details from LoanAccountDataV1 together with Working Capital-specific fields. The system triggers Working Capital business events for the same actions as progressive loans.

Progressive loan lifecycle events and their Working Capital equivalents:

| Action | Working Capital business events |
| --- | --- |
| Create new loan | WorkingCapitalLoanCreatedBusinessEvent |
| Modified | WorkingCapitalLoanApplicationModifiedBusinessEvent |
| Approve | WorkingCapitalLoanApprovedBusinessEvent, WorkingCapitalLoanStatusChangedBusinessEvent, WorkingCapitalLoanBalanceChangedBusinessEvent |
| Undo approve | WorkingCapitalLoanUndoApprovalBusinessEvent, WorkingCapitalLoanStatusChangedBusinessEvent, WorkingCapitalLoanBalanceChangedBusinessEvent |
| Reject | WorkingCapitalLoanRejectedBusinessEvent, WorkingCapitalLoanStatusChangedBusinessEvent |
| Disburse | WorkingCapitalLoanDisbursalBusinessEvent, WorkingCapitalLoanStatusChangedBusinessEvent, WorkingCapitalLoanBalanceChangedBusinessEvent |
| Charge-off | WorkingCapitalLoanChargeOffBusinessEvent |
| Undo charge-off | WorkingCapitalLoanUndoChargeOffBusinessEvent |
| Fully-paid | WorkingCapitalLoanStatusChangedBusinessEvent, WorkingCapitalLoanBalanceChangedBusinessEvent |
| Overpaid | WorkingCapitalLoanStatusChangedBusinessEvent, WorkingCapitalLoanBalanceChangedBusinessEvent |

## Payment type on working capital loans

Payment type is optional for monetary transactions on working capital loans. You can provide a payment type id, which the system assigns to the transaction and stores. You can fetch payment type details through the loan transaction details API.

## Delinquency and breach bucket overrides

You can override the delinquency bucket and breach bucket configuration when you create a working capital loan. The loan level override takes effect instead of the product level default. Changing the repayment percentage updates how the system evaluates delinquency and breach for the loan.

## Working Capital loan data model

WorkingCapitalLoanAccountDataV1 exposes pre-calculated fields from Loan.java such as isApproved and isDisbursed when applicable.

WorkingCapitalLoanAccountDataV1 fields:

| Field | Type | Notes |
| --- | --- | --- |
| id | matches LoanAccountDataV1 |  |
| accountNo | matches LoanAccountDataV1 |  |
| externalId | string (ExternalIdMapper) | matches LoanAccountDataV1 |
| status | LoanStatusEnumData (loan.v1.LoanStatusEnumDataV1) | matches LoanAccountDataV1 |
| clientId | matches LoanAccountDataV1 |  |
| clientAccountNo | matches LoanAccountDataV1 |  |
| summary.totalWrittenOff | matches LoanAccountDataV1 |  |
| summary.totalOutstanding | matches LoanAccountDataV1 |  |
| summary.totalRecovered | matches LoanAccountDataV1 |  |
| summary.overdueSinceDate | matches LoanAccountDataV1 |  |
| summary.writeoffReasonId | matches LoanAccountDataV1 |  |
| summary.writeoffReason | matches LoanAccountDataV1 |  |
| product.repaymentEvery | matches LoanAccountDataV1 |  |
| product.repaymentFrequencyType | StringEnumOptionDataV1 | legacy LoanAccountDataV1 uses EnumOptionDataV1 |
| delinquent.installmentDelinquencyBuckets.classification | flattened | legacy nests under delinquencyRange |
| delinquent.installmentDelinquencyBuckets.minimumAgeDays | flattened | legacy nests under delinquencyRange |
| delinquent.installmentDelinquencyBuckets.maximumAgeDays | flattened | legacy nests under delinquencyRange |
| delinquent.installmentDelinquencyBuckets.delinquentAmount | single amount per range | legacy uses principal/interest/fee/penalty breakdown |

## LoanAccountDataV1 exposed fields

LoanAccountDataV1 exposes these fields with no comment unless noted.

| Field | Comment |
| --- | --- |
| getId | None |
| getExternalId | None |
| getStatus.getId | None |
| getTimeline.getSubmittedOnDate | None |
| getTimeline.getActualDisbursementDate | None |
| getSummary.getPrincipalOutstanding | None |
| getSummary.getFeeChargesOutstanding | None |
| getSummary.getPenaltyChargesOutstanding | None |
| getSummary.getTotalOverpaid | None |
| getCharges[].getAmountOutstanding | None |
| list of charges | None |
| getSummary.getChargeOffReason | None |
| getSummary.getPrincipalDisbursed | None |
| getDelinquent.getNextPaymentAmount | Can we give this as next breach amount |

One field is derived from getTimeline.getClosedOnDate, getSummary.getTotalOutstanding, and getTotalOverpaid.

## Transaction events

Transaction events record activity on a loan account, such as disbursal, payout refund, adding or waiving a fee, adding or reversing a repayment, goodwill credit, goodwill reversal, charge-off, discount fee amortization, chargeback, balance write-off, debt sale, and account closure.

Each transaction event maps to a business event:

- Repayment triggers WorkingCapitalLoanRepaymentTransactionBusinessEvent.
- Goodwill credit triggers WorkingCapitalLoanGoodWillCreditTransactionBusinessEvent.
- Payout refund triggers WorkingCapitalLoanPayoutRefundTransactionBusinessEvent.
- Discount fee triggers WorkingCapitalLoanDiscountFeeTransactionBusinessEvent.
- Discount fee adjustment triggers WorkingCapitalLoanDiscountFeeAdjustmentTransactionBusinessEvent.
- Discount fee amortization triggers WorkingCapitalLoanDiscountFeeAmortizationTransactionBusinessEvent.
- Discount fee amortization adjustment triggers WorkingCapitalLoanDiscountFeeAmortizationAdjustmentTransactionBusinessEvent.
- Charge adjustment triggers WorkingCapitalLoanChargeAdjustmentBusinessEvent.
- Credit balance refund triggers WorkingCapitalLoanCreditBalanceRefundTransactionBusinessEvent.
- Disbursement triggers WorkingCapitalLoanDisbursalTransactionBusinessEvent.
- Charge-off triggers WorkingCapitalLoanChargeOffTransactionBusinessEvent.
- Accrual triggers WorkingCapitalLoanAccrualTransactionBusinessEvent.
- Accrual adjustment triggers WorkingCapitalLoanAccrualAdjustmentTransactionBusinessEvent.
- Write-off triggers WorkingCapitalLoanWriteOffTransactionBusinessEvent.
- Adding a charge triggers WorkingCapitalLoanAddChargeBusinessEvent.

## Delinquency and breach events

Delinquency and breach events notify integrators when a working capital loan enters or leaves a delinquent state, moves between delinquency buckets, or changes breach status. The system also emits events when delinquency or breach is paused, resumed, reset, enabled, disabled, or rescheduled. Delinquent amount changes do not trigger any event.

Event triggers

| Trigger | Event |
| --- | --- |
| Delinquency range changed or lifted | WorkingCapitalLoanDelinquencyRangeChangeBusinessEvent |
| Delinquency paused | WorkingCapitalLoanDelinquencyPauseBusinessEvent |
| Delinquency resumed | WorkingCapitalLoanDelinquencyResumeBusinessEvent |
| Delinquency rescheduled | WorkingCapitalLoanDelinquencyRescheduleBusinessEvent |
| Delinquency reset | WorkingCapitalLoanDelinquencyResetBusinessEvent |
| Delinquency reset undone | WorkingCapitalLoanDelinquencyUndoResetBusinessEvent |
| Delinquency disabled | WorkingCapitalLoanDelinquencyDisableBusinessEvent |
| Delinquency enabled | WorkingCapitalLoanDelinquencyEnableBusinessEvent |
| Breach or not breach | WorkingCapitalLoanBreachChangeBusinessEvent |
| Near breach | WorkingCapitalLoanNearBreachChangeBusinessEvent |
| Breach past due changed | WorkingCapitalLoanBreachPastDueChangeBusinessEvent |
| Breach paused | WorkingCapitalLoanBreachPauseBusinessEvent |
| Breach resumed | WorkingCapitalLoanBreachResumeBusinessEvent |
| Breach rescheduled | WorkingCapitalLoanBreachRescheduleBusinessEvent |
| Breach reset | WorkingCapitalLoanBreachResetBusinessEvent |
| Breach reset undone | WorkingCapitalLoanBreachUndoResetBusinessEvent |
| Breach disabled | WorkingCapitalLoanBreachDisableBusinessEvent |
| Breach enabled | WorkingCapitalLoanBreachEnableBusinessEvent |

## Worked examples

A working capital loan is created with a principal of 1,000.00, three monthly installments, and 30-day months; the figures are illustrative. The WorkingCapitalLoanAccountDataV1 event carries the generic loan details found in LoanAccountDataV1, but it omits fields that belong to investor or loan-sale workflows and to sub-status tracking, because working capital loans do not support those features. This example shows that investor-related and sub-status fields are absent from the WC event.

| Field | In LoanAccountDataV1 | In WorkingCapitalLoanAccountDataV1 | Reason |
| --- | --- | --- | --- |
| externalOwnerId | Yes | No | No investor or loan-sale functionality in WC |
| settlementDate | Yes | No | No investor or loan-sale functionality in WC |
| purchasePriceRatio | Yes | No | No investor or loan-sale functionality in WC |
| subStatus | Yes | No | No sub-status in WC |

For the same 1,000.00 working capital loan, the summary block omits totals that WC does not track or that appear elsewhere in the event. The overdue total is not repeated because it is carried by delinquent.delinquentAmount. This example shows that summary totals are omitted when WC does not track them or when another field carries the value.

| Summary field | In LoanAccountDataV1 | In WorkingCapitalLoanAccountDataV1 | Reason |
| --- | --- | --- | --- |
| totalCostOfLoan | Yes | No | Not in WC summary |
| totalWaived | Yes | No | No waiver in WC summary |
| totalOverdue | Yes | No | Overdue total carried by delinquent.delinquentAmount |
| totalMerchantRefund | Yes | No | Per-transaction-type totals not in WC summary |

The product block of the event omits every rate and term field because there is no WC product equivalent, and the delinquent block omits installment delinquency bucket amounts and charges because they are not carried by the WC element record. This example shows that product and delinquency bucket fields disappear from the WC event when they have no WC equivalent or carrier.

| Field | In LoanAccountDataV1 | In WorkingCapitalLoanAccountDataV1 | Reason |
| --- | --- | --- | --- |
| product.numberOfRepayments | Yes | No | No WC product equivalent |
| product.minNumberOfRepayments | Yes | No | No WC product equivalent |
| product.maxNumberOfRepayments | Yes | No | No WC product equivalent |
| product.interestRatePerPeriod | Yes | No | No WC product equivalent |
| product.minInterestRatePerPeriod | Yes | No | No WC product equivalent |
| product.maxInterestRatePerPeriod | Yes | No | No WC product equivalent |
| product.interestRateFrequencyType | Yes | No | No WC product equivalent |
| product.annualInterestRate | Yes | No | No WC product equivalent |
| delinquent.installmentDelinquencyBuckets.amount | Yes | No | Not carried by WC element record |
| delinquent.installmentDelinquencyBuckets.amount.principalAmount | Yes | No | Not carried by WC element record |
| delinquent.installmentDelinquencyBuckets.amount.interestAmount | Yes | No | Not carried by WC element record |
| delinquent.installmentDelinquencyBuckets.amount.feeAmount | Yes | No | Not carried by WC element record |
| delinquent.installmentDelinquencyBuckets.amount.penaltyAmount | Yes | No | Not carried by WC element record |
| delinquent.installmentDelinquencyBuckets.charges | Yes | No | Not carried by WC element record |
