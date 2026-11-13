# Configurable Payment Allocations

## Feature overview

Configurable payment allocations let you customize how payments are allocated by payment type across specific BNPL products and markets. You configure allocation at the transaction type level, and each loan product can have its own advanced payment allocation configuration. The configuration covers Repayment, Goodwill credit, payout refund, Merchant refund, Charge Adjustments, and Downpayment. Payment allocation remains the same for all sub-payment types of each transaction type. Fineract supports an “Advanced payment allocation” repayment strategy, configured for a loan product, and an “Advanced repayment allocation” strategy.

## Repayment strategy and loan product setup

The Advanced payment allocation repayment strategy lets you define how payments are allocated across transaction types on a loan product. It is supported only for Progressive loan disbursement handling; CUMULATIVE (legacy) disbursement handling loans cannot select it. When Progressive is selected, it automatically selects the Advanced payment allocation strategy and the loan processing type can be Horizontal or Vertical. When Advanced payment allocation is not chosen, Cumulative disbursement remains the only option.

Setup requirements:

- Default payment allocation rules are required when Advanced payment allocation is selected.
- If Advanced repayment allocation is set as the repayment strategy, paymentAllocation must be set for the default transaction type.
- Advanced repayment allocation rules can be configured on the Loan product screen by transaction type.

| Property | Value |
| --- | --- |
| Strategy code | advanced-payment-allocation-strategy |
| Strategy order | 8 |

> **Note:** Validation that Advanced payment allocation is not selected for CUMULATIVE disbursement handling loans happens at loan product creation or edit and at loan account creation, throwing a validation exception.

## Payment allocation rules

Payment allocation rules decide the order in which a payment amount is distributed across installments and outstanding balances. You can set rules for past due, due, and in advance installments, and across penalty, fee, principal, and interest balances. A DEFAULT transaction type configuration always exists and acts as the fallback when no rules are configured for a specific transaction type.

Allocation rule codes:

- Past due penalty: PAST_DUE_PENALTY
- Past due fee: PAST_DUE_FEE
- Past due principal: PAST_DUE_PRINCIPAL
- Past due interest: PAST_DUE_INTEREST
- Due penalty: DUE_PENALTY
- Due fee: DUE_FEE
- Due principal: DUE_PRINCIPAL
- Due interest: DUE_INTEREST
- In advance penalty: IN_ADVANCE_PENALTY
- In advance fee: IN_ADVANCE_FEE
- In advance principal: IN_ADVANCE_PRINCIPAL
- In advance interest: IN_ADVANCE_INTEREST

Future installment allocation rule codes:

- Next installment: NEXT_INSTALLMENT (default)
- Last installment: LAST_INSTALLMENT
- Reamortization: REAMORTIZATION

The tables store allocation rules per loan product and per loan.

| Table | Stored fields |
| --- | --- |
| m_loan_product_payment_allocation_rule | loan_product_id, transaction_type_code (default DEFAULT), allocation_order, future_installment_allocation_rule |
| m_loan_payment_allocation_rule | loan_id, transaction_type_code (default DEFAULT), allocation_order, future_installment_allocation_rule |

Allocation behaviour:

- When default allocation rule is set, payment transactions are allocated in the order it was set across the installments.
- When no repayment allocation rule is set for a transaction, the default allocation rule is used.
- Default allocation can be overruled by configuring payment allocation order for a specific transaction type.
- Default allocation order cannot be deleted.
- When HORIZONTAL processing is configured, allocation rules must be grouped by due type. With VERTICAL processing, the grouping restriction does not apply.

## Transaction types

Advanced payment allocation supports specific transaction types, each with its own allocation order. The supported types are Repayment, Down payment, Merchant issued refund, Payout refund, Goodwill credit, Charge refund, Charge adjustment, Interest waiver, Refund for active loan, Charge payment, and Writeoff. The list of transaction types is fixed.

| Transaction type | Allocation behaviour |
| --- | --- |
| Repayment | Standard allocation order applies. |
| Down payment | Standard allocation order applies. |
| Merchant issued refund | Standard allocation order applies. |
| Payout refund | Standard allocation order applies. |
| Goodwill credit | Standard allocation order applies. |
| Charge refund | Standard allocation order applies. |
| Charge adjustment | Standard allocation order applies. |
| Interest waiver | Standard allocation order applies. |
| Refund for active loan | Has its own allocation order and is the opposite of repayment. |
| Charge payment | Default allocation can be overruled by configuring payment allocation order for this transaction type. |
| Writeoff | Sets the loan balance to 0, closes the loan, and writes off all outstanding amounts. |

> **Note:** Pre-write-off payment reversal is not allowed for loans with Advanced payment allocation configured.

## Processing order and reverse replay

For loans with Advanced payment allocation configured, transactions and charges are ordered and processed in chronological order comparing charge due date versus transaction date, then submitted on date, then creation date time. The new repayment strategy processes and reprocesses transactions, disbursement and charges in chronological order and rebuilds the repayment schedule from ground up.

Reverse replay happens only when a backdated transaction or backdated charge is added and something changed that shall have this side-effect. Reprocessing is unnecessary when a repayment is on or after the prior last processed transaction, when a charge is added with a due date after the last processed transaction, or even for backdated transactions or charges if they are last in chronological order.

Adding a charge later than a repayment does not require reprocessing the repayment, and adding a charge with a due date after a backdated repayment does not lead to reverse replay.

Reprocessing may be needed only because interest handling might result in different interest. Loan charges can be configured whether they participate in reverse-replaying or not, and by default loan charges were not reverse-replayed. Loan charges can be reverse-replayed when advanced repayment allocation strategy is set.

Undo write-off, close loan, and refund scenarios have no reverse replay.

When down payment is enabled, the newly created installment is excluded from recalculation, reprocessing, and reallocation until the relevant transaction is processed, such as ignoring the second down payment installment until the second disbursement is processed.

## Installment processing types

Installment processing uses one of two strategies: HORIZONTAL (default) or VERTICAL. The loanScheduleProcessingType field controls the strategy. Horizontal processing applies allocation rules in installment scope, processing installments from oldest to latest one by one. Vertical processing applies allocation rules in repayment schedule scope, processing balances one by one based on whether they are past due, due, or in advance.

Horizontal processing example:

- For a past due installment not fully paid, allocation pays unpaid penalty first, then unpaid fee, then unpaid interest, then unpaid principal.

Vertical processing example:

- For past due installments not fully paid, allocation pays oldest unpaid penalty first, then remaining past due penalties, then oldest unpaid fee, then remaining past due fees, then past due interest.

## Future installment allocation rules

Future installment allocation applies when Advanced payment allocation is configured and a payment is made before an installment is due. The remaining amount after covering past due and current due installments is allocated to future installments according to the chosen rule.

The future installment rule options are:

- From Next Installment allocates the payment to the next due installment first, then to subsequent due installments if the amount remains.
- From Last Installment allocates the payment to the last installment by due date first, then to the last but one installment if the amount remains.
- Re-Amortize to future Installments divides the payment into equal amounts across all future installments.

Additional rules for future installment allocation:

- The secondary allocation rule order follows the IN_ADVANCE_XXX rules order.
- If an N+1 installment exists, it is considered as well for re-amortization.
- When re-amortization overpays the principal portion of all installments, the excess allocates to other portions as per the secondary allocation set, such as unpaid penalty or fees amounts.
- Future installment allocation applies only to the principal portion of installments.

## Refunds and credits

A refund applies to any past due installments first and the remaining credit balance is reamortized across future due installments. When nothing is past due or due, a refund applies to the final installments.

## Validation and inheritance

When you select the Advanced payment allocation repayment strategy and create a loan, the loan inherits the loan product's configured payment allocation rules by copying them into the m_loan_payment_allocation_rule table. Changes to a loan product's allocation rules apply only to loans created after the change; existing loans keep their original rules.

> **Note:** Configured allocation rules must be stored in the database.

## UI behavior

On the Payment allocation tab, you select a transaction type from a dropdown. The dropdown lists Default (code: DEFAULT), which is selected by default. You also select a future installment allocation rule from a dropdown on the same tab.

## Worked examples

A loan product is configured with a principal of 1,000, an annual interest rate of 12%, 3 monthly installments, and 30-day months. The figures are illustrative. When the repayment strategy is Advanced payment allocation, the product must define a default payment allocation for the DEFAULT transaction type. The configuration lists every allocation entry in order and sets the future installment allocation rule. The DEFAULT row is mandatory and acts as the fallback for any transaction type that does not define its own order.

| Step | Transaction type | Installment scope | Balance type | Allocation order |
| --- | --- | --- | --- | --- |
| 1 | DEFAULT | Past due | Penalty | 1 |
| 2 | DEFAULT | Past due | Fee | 2 |
| 3 | DEFAULT | Past due | Interest | 3 |
| 4 | DEFAULT | Past due | Principal | 4 |
| 5 | DEFAULT | Due | Penalty | 5 |
| 6 | DEFAULT | Due | Fee | 6 |
| 7 | DEFAULT | Due | Interest | 7 |
| 8 | DEFAULT | Due | Principal | 8 |
| 9 | DEFAULT | In advance | Penalty | 9 |
| 10 | DEFAULT | In advance | Fee | 10 |
| 11 | DEFAULT | In advance | Interest | 11 |
| 12 | DEFAULT | In advance | Principal | 12 |
| 13 | DEFAULT | - | Future installment rule | NEXT_INSTALLMENT |

A loan of 1,000 with an annual interest rate of 12%, 3 monthly installments, and 30-day months produces three installments each due 100. A repayment of 150 is posted. The futureInstallmentAllocationRule determines which installment receives the in-advance portion first. Changing only the future installment rule moves the repayment from the earliest installment to the latest installment or splits it evenly across all three.

| Future installment rule | Installment 1 | Installment 2 | Installment 3 | Unallocated |
| --- | --- | --- | --- | --- |
| NEXT_INSTALLMENT | 100.00 paid | 50.00 paid | 0.00 paid | 0.00 |
| LAST_INSTALLMENT | 0.00 paid | 50.00 paid | 100.00 paid | 0.00 |
| REAMORTIZATION | 50.00 paid | 50.00 paid | 50.00 paid | 0.00 |

A loan of 1,000 with an annual interest rate of 12%, 4 monthly installments, and 30-day months produces four installments of 250 each. A fee of 20 and a penalty of 10 are added to the first installment, a penalty of 10 to the second, and a penalty of 10 to the third. A repayment of 275 is posted. The loanScheduleProcessingType controls whether allocation stays inside each installment or groups by balance type across installments. With HORIZONTAL processing the repayment clears the first installment's penalty, fee and most of its principal; with VERTICAL processing it clears all penalties first, then the fee, then principal on the first installment.

| Sequence | Processing type | Installment | Balance type | Amount applied |
| --- | --- | --- | --- | --- |
| 1 | HORIZONTAL | 1 | Penalty | 10.00 |
| 2 | HORIZONTAL | 1 | Fee | 20.00 |
| 3 | HORIZONTAL | 1 | Principal | 245.00 |
| 1 | VERTICAL | 1 | Penalty | 10.00 |
| 2 | VERTICAL | 2 | Penalty | 10.00 |
| 3 | VERTICAL | 3 | Penalty | 10.00 |
| 4 | VERTICAL | 1 | Fee | 20.00 |
| 5 | VERTICAL | 1 | Principal | 225.00 |
