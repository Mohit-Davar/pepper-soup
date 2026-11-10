# Events and Notifications

## Events and Notifications

Loan changed events use camelCase field names, and every field added to them is optional. Loan details based business events contain loan details, including the annual effective interest rate only. Working capital loans trigger business events similarly as legacy and progressive loans.

Working capital loan business events include:

- WorkingCapitalLoanApplicationModifiedBusinessEvent
- WorkingCapitalLoanUndoDisbursalBusinessEvent
- WorkingCapitalLoanDelinquencyRangeChangeBusinessEvent
- WorkingCapitalLoanBalanceChangedBusinessEvent
- WorkingCapitalLoanUndoApprovalBusinessEvent
- WorkingCapitalLoanRejectedBusinessEvent
- WorkingCapitalLoanStatusChangedBusinessEvent
- WorkingCapitalLoanApprovedBusinessEvent
- WorkingCapitalLoanDisbursalBusinessEvent
- WorkingCapitalLoanCreatedBusinessEvent

The WorkingCapitalLoanAccountDataV1.avsc schema follows these rules:

- Common fields match LoanAccountDataV1.avsc in name, datatype, and flat versus inclined object structure.
- Fields not relevant to working capital loans, such as interest and repayment schedule, are excluded.
- Fields new and only relevant to working capital loans are included.

Loan details API fields map to business event fields as follows:

| API field | Mapped field | Type | Description | Example |
| --- | --- | --- | --- | --- |
| total_unpaid_posted_interest | totalUnpaidAccruedDueInterest | BigDecimal | The total unpaid posted interest amount on the loan | 30.00 |
| total_unpaid_accrued_interest | totalUnpaidAccruedNotDueInterest | BigDecimal | The total unpaid accrued interest amount (calculated from last non-monetary interest activity posting date) and not yet posted on the billing period | 1.00 |
| delinquent_interest | delinquentInterest, delinquentFee | BigDecimal | The delinquent amount with interest portion | 0.10 |
| total_interest_refund | totalInterestRefund | BigDecimal | The total refund amount when a merchant or agent initiates the disbursement refund (not reversed) | 0.10 |
| total_interest_waiver | totalInterestPaymentWaiver | BigDecimal | The total interest waiver amount when PayPal initiates the interest waiver transaction (not reversed) | 0.10 |

LoanTransactionBusinessEvent accepts an optional flags argument. The changedTerms flag is optional in LoanTransaction business events and applies to DisbursementTransactionBusinessEvent and ReageTransactionBusinessEvent.

Some loan events keep the loan status at 300 (active) even when the loan is fully paid, instead of changing it to 600 (closed). After a second disbursement followed by a repayment, the LoanBalanceChangedBusinessEvent is not refreshed at the principalDisbursed field.

Inline COB for working capital loans is not triggered as part of monetary activity even when the loan is eligible for inline COB. Register and wire WorkingCapitalLoanCOBApiFilter so it can ensure up to date COB state before monetary transaction.
