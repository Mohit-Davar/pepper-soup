# Configurable Payment Allocations

## Configurable Payment Allocations

### Strategy overview and activation

Advanced payment allocation lets you customize how payments are allocated by payment type across specific BNPL products and markets. You activate it by selecting “Advanced payment allocation” from the repayment strategy dropdown on the loan product screen, which enables the Payment allocation tab where rules are configured by transaction type. The strategy uses the name Advanced payment allocation, code advanced-payment-allocation-strategy, and order 8.

### Configuration scope and inheritance

Payment allocation rules can be stored on a loan product and fetched from the database. Each loan product can have its own advanced payment allocation configuration options. When Advanced payment allocation is selected and a loan is created, the loan inherits the configured payment allocation rules of the loan product. Changes to the loan product rules affect only new loan accounts created after the change; existing loans honor the old rules.

Main allocation rules can be defined for past due, due and in advance installments.

- Main allocation rules can be defined for past due, due and in advance installments.
- Secondary allocation covers Penalty, Fee, Principal and Interest.

Loan charges can be configured whether they participate in reverse-replaying or not. By default, loan charges were not reverse-replayed. During transaction reprocessing, some transactions might be reverse-replayed based on new repayment schedules and repayment strategy. Only newly added payment transactions consider repaying newly added charges based on repayment strategy. Prior payment transactions are not affected by later added charges. Loan charges can be reverse-replayed when advanced repayment allocation strategy is set. Payment allocation rules can be updated on the loan product. Payment allocation rules can be updated. Future allocations already done to the installment have no impact during reverse replay or future repayments.

### Default allocation rules

Default payment allocation rules decide how a payment is distributed across installments and balances. They apply when “Advanced payment allocation” is selected as the repayment strategy, and a default payment allocation order must be set. “Advanced repayment allocation” requires the payment allocation setting to be set for the default transaction type, and it must contain all 12 valid values. The future installment allocation rule must be set and have a valid value.

The following rules govern default allocation:

- A DEFAULT transaction type configuration always exists and acts as the fallback when no rule is configured for a specific transaction type.
- The default allocation order cannot be deleted.
- A configured order for a transaction type can be removed except for DEFAULT.
- Default allocation can be overruled by configuring a payment allocation order for a specific transaction type.
- When no repayment allocation rule is set for a transaction, the default allocation rule is used.
- When a repayment allocation rule is set, a repayment is allocated accordingly across the installments.
- When a default allocation rule is set, payment transactions are allocated in the order it was set across the installments.
- When no payment allocation rules are set for a payment transaction type, the system falls back to the DEFAULT allocation rule.

The UI sends allocation rules as follows:

- The UI always sends all allocation rules for all transaction types.
- All elements for all configured transaction types are sent even if there was no change in the order.
- If something is not sent, it is considered deleted.
- If a transaction type is missing, it needs to be deleted.

### Transaction-specific allocation rules

You can configure how the system allocates a payment for each supported transaction type. This applies to Repayment, Down payment, Merchant issued refund, Payout refund, Goodwill credit, Charge refund, Charge adjustment, and Interest waiver.

The following rules govern transaction-specific allocation:

- The set of supported transaction types is fixed.
- Payment allocation remains the same for all sub-payment types of each transaction type.
- Loan transactions and loan charges are ordered chronologically by loan transaction date and created date time.
- Loan charges are ordered by submitted on date and created date time.
- For future installments, the default behaviour processes the next installment first for in advance rules.
- Default allocation for a Charge payment transaction type can be overruled by configuring its payment allocation order.
- Charge payment transaction type is a legacy payment type where charges paid off by charge payment are processed first, and paying off an already paid-off charge should not happen.
- When a Charge payment transaction type allocation rule is set, that transaction type is allocated accordingly across the installments.

Payment allocation is configurable at the transaction type level for Repayment, Goodwill credit, payout refund, Merchant refund, Charge Adjustments, and Downpayment.

### Processing order and reverse replay

Advanced payment allocation processes transactions, charges, and disbursements in chronological order to minimize reverse replaying. Reverse replaying and reprocessing usually happen only when a backdated transaction or backdated charge is added and something changes that requires this side effect.

The system applies the following ordering and reprocessing rules:

- Transactions are ordered first by transaction date, then by submitted on date, then by created date time.
- Charges are ordered first by due date, then by submitted on date, then by creation date time.
- Transactions and charges are ordered and processed chronologically by comparing charge due date against transaction date, then charge submitted on date against transaction submitted on date, then charge creation date time against transaction creation date time.
- Disbursement transactions are reprocessed and the repayment schedule is rebuilt from the ground up.
- Only transactions with dates later than a newly added transaction can be reallocated; transactions paid in advance do not change anymore.
- After disbursement, an installment paid in advance is not revert-replayed.
- Adding a charge later than a repayment does not require reprocessing the repayment because it has no effect on the earlier repayment.
- Transactions might need to be reprocessed only because interest might be different.
- When a repayment is on or after the prior last processed transaction, reprocessing is unnecessary.
- When a charge is added with a due date after the last processed transaction, reprocessing is unnecessary.
- When a charge is added, prior repayments are not reverse-replayed.
- Adding a charge with a due date after a backdated repayment does not lead to reverse replay for the Advanced payment strategy.
- If a loan charge due date is earlier than the last transaction date, then reprocess.

The new repayment strategy processes and reprocesses transactions, disbursements, and charges in chronological order and rebuilds the repayment schedule from the ground up.

### Disbursement handling

Advanced payment allocation supports Progressive loan disbursement handling only; cumulative disbursement handling does not fit the chronological ordering idea.

The system enforces the following restrictions:

- Selecting Advanced payment allocation is not allowed for loans with CUMULATIVE (legacy) disbursement handling and throws a validation exception.
- When another payment allocation is chosen, cumulative disbursement remains the only option.
- Validation for Advanced payment allocation and disbursement handling occurs at loan product creation or edit and at loan account creation.

### Installment processing modes

Installment processing uses either horizontal or vertical mode. Horizontal processing is the default and processes installments one by one from oldest to latest. Vertical processing pays balances across the repayment schedule based on whether they are past due, due or in advance.

The processing mode is controlled by the loan schedule processing type field.

- The field accepts HORIZONTAL or VERTICAL, with HORIZONTAL as the default.
- The field is visible only when the Advanced payment allocation repayment strategy is selected.

Horizontal processing applies allocation rules per installment in the set order.

- It processes installments from oldest to latest, one by one.
- For each installment it pays any unpaid penalty first, then any unpaid fee, then any unpaid interest, then any unpaid principal.
- The example allocation order is PAST_DUE_PENALTY, PAST_DUE_FEE, PAST_DUE_INTEREST, PAST_DUE_PRINCIPAL.

Vertical processing applies allocation rules across the repayment schedule rather than per installment.

- It processes balances one by one based on whether they are past due, due or in advance.
- It pays the oldest unpaid penalty first, then remaining unpaid past due penalties, then oldest unpaid past due fee, then remaining unpaid past due fees, then past due interest.
- The example allocation order is PAST_DUE_PENALTY, PAST_DUE_FEE, PAST_DUE_INTEREST, PAST_DUE_PRINCIPAL.

### Future installment allocation rules

You can set how an in-advance payment is allocated to future installments. Three options are available: Next installment, Last installment, and Reamortization. Next installment is the default rule.

Each rule allocates the transaction amount as follows:

- Under Next installment, the allocation goes to the next due installment first based on due date, then to subsequent due installments if any amount remains.
- Under Last installment, the allocation goes to the last installment based on due date first, then to the last but one installment based on due date if any amount remains.
- Under Reamortization, the transaction amount is divided into equal amounts across all future installments.

The following conditions apply to future installment allocation:

- Re-amortization applies only to the principal balance; charges or penalties are not considered for the re-amortization calculation.
- If the re-amortization amount overpays the principal portion of all installments, the remaining amount allocates to other portions according to the secondary allocation set, such as unpaid penalty or fees.
- When an N+1 installment is present, it must be considered as well for re-amortization.
- When future installment allocation is Last installment, an in-advanced payment does not take the N+1 installment into account.

The same error occurs in these situations:

- An N+1 installment is present and future installment allocation is Last installment with an in-advanced payment.
- An in-advanced Merchant issued refund transaction occurs when future installment allocation is Reamortization.

| Rule | Code |
| --- | --- |
| Next installment | NEXT_INSTALLMENT |
| Last installment | LAST_INSTALLMENT |
| Reamortization | REAMORTIZATION |

Chargeback allocation follows these rules:

- Chargeback allocation is proportional according to what the original payment paid off.
- Past Due Installment has no option and is always allocated from the oldest Installment.
- Due Installment has no option and is allocated only to the current due installment when transaction date is same as due date.
- Future Installments has sub options: From Next Installment, From last Installment, and Re-Amortize to future Installments, which will only be allocated to principal portion of installments.

Secondary allocation rules apply in this order:

- Penalties.
- Fees.
- Principal.
- Interest.

Allocation rules are followed when an in-advance amount is allocated for future installments:

- Allocation rule for future installments can be set.
- Secondary allocation rule is based on the IN_ADVANCE_XXX rules order.

### Allocation rule codes and categories

Allocation rule codes combine a timing category with a secondary category. The timing categories are Past due, Due, and Future / in advance. The secondary categories are Penalty, Fee, Principal, and Interest.

| Timing category | Code | Secondary category | Code |
| --- | --- | --- | --- |
| Past due | PAST_DUE | Penalty | PENALTY |
| Past due | PAST_DUE | Fee | FEE |
| Past due | PAST_DUE | Principal | PRINCIPAL |
| Past due | PAST_DUE | Interest | INTEREST |
| Due | DUE | Penalty | PENALTY |
| Due | DUE | Fee | FEE |
| Due | DUE | Principal | PRINCIPAL |
| Due | DUE | Interest | INTEREST |
| Future / in advance | IN_ADVANCE | Penalty | PENALTY |
| Future / in advance | IN_ADVANCE | Fee | FEE |
| Future / in advance | IN_ADVANCE | Principal | PRINCIPAL |
| Future / in advance | IN_ADVANCE | Interest | INTEREST |

The full allocation rule codes are Past due penalty (PAST_DUE_PENALTY), Past due fee (PAST_DUE_FEE), Past due principal (PAST_DUE_PRINCIPAL), Past due interest (PAST_DUE_INTEREST), Due penalty (DUE_PENALTY), Due fee (DUE_FEE), Due principal (DUE_PRINCIPAL), Due interest (DUE_INTEREST), In advance penalty (IN_ADVANCE_PENALTY), In advance fee (IN_ADVANCE_FEE), In advance principal (IN_ADVANCE_PRINCIPAL), and In advance interest (IN_ADVANCE_INTEREST). The default payment allocation code is DEFAULT.

Future installment allocation rule codes are Next installment (NEXT_INSTALLMENT), Last installment (LAST_INSTALLMENT), and Reamortization (REAMORTIZATION). Configured allocation rules for future installments are stored in the database via future_installment_allocation_rule.

The default payment allocation rule code is DEFAULT and the default transaction type code is DEFAULT.

Loan processing type can be HORIZONTAL (default) or VERTICAL, and the LoanScheduleType field defines if disbursement is progressive or cumulative.

Configuration is extended to support refund for active loans as a transaction type with its own allocation order.

The individual past due and in advance codes are:

- Past due penalty code is PAST_DUE_PENALTY.
- Past due fee code is PAST_DUE_FEE.
- Past due principal code is PAST_DUE_PRINCIPAL.
- Past due interest code is PAST_DUE_INTEREST.
- Due penalty code is DUE_PENALTY.
- Due fee code is DUE_FEE.
- Due principal code is DUE_PRINCIPAL.
- Due interest code is DUE_INTEREST.
- In advance penalty code is IN_ADVANCE_PENALTY.
- In advance fee code is IN_ADVANCE_FEE.
- In advance principal code is IN_ADVANCE_PRINCIPAL.
- In advance interest code is IN_ADVANCE_INTEREST.

### Write-off and charge-off

Advanced payment allocation supports write-off and charge-off. Pre-write-off payment reversal is not allowed.

Write-off and charge-off behave as follows:

- A write-off transaction sets the loan balance to 0, closes the loan, and writes off every outstanding amount.
- A charge-off transaction matches all outstanding balances and is handled the same way as before with minimal changes to existing charge-off logic.
- Reverse replay of a charge-off transaction occurs only when a change modifies the outstanding balance.

When transactions are reprocessed and the repayment schedule is rebuilt, disbursement transactions are reprocessed and added again to the installment.

### Refunds and credit balance refund

A credit balance refund is a transaction type for an active loan that works like the opposite of a repayment and can have its own allocation order. Advanced payment allocation supports credit balance refunds and calculates the balance so that the refund covers only that balance. A loan using Advanced payment allocation supports credit balance refund transactions, and during loan transaction reprocessing the system can reverse-replay a credit balance refund transaction. Reverse replay requires correct balances on the credit balance refund transaction and correct balances on the loan schedule.

### Chargeback

Chargeback allocation works like a disbursement: it increases the amount due, is due immediately, and delinquency is calculated immediately. Advanced payment allocation supports chargeback, and it is handled the same way as before under Advanced payment allocation even though it looks like a reverted payment. When chargeback is added after maturity, the system creates an N+1 instalment.

### Charge waiver

You can waive loan charges using Advanced payment allocation. The system calculates correct balances for the waive loan charges transaction and supports reprocessing of that transaction. If Installment Percentage Fee is not supported for Advanced payment allocation repayment strategy, it is handled correctly instead of producing an internal server error.

### Backdated transactions and reprocessing

Backdated transactions added before the second disbursement are processed using reverse and replay logic with chronological order processing. This handles second disbursement and downpayment behaviour without affecting existing allocations. Charges cannot be removed or updated after approval. You cannot remove a charge after approval, and you cannot update a charge after approval.

### Use case examples

Use cases show how refunds, goodwill credits, provisional credits, overpayments and credit balance refunds are allocated across installments depending on what is past due, due or future due.

Refunds follow these patterns across the documented use cases:

- In UC05, UC07 and UC08, the refund applies to past due installments and any remaining credit balance is reamortized across future due installments.
- In UC08, the refund also applies to due installments before reamortizing the remaining credit balance across installments 3 and 4.
- In UC09, the refund applies to the next installment (installments 2 and 3).
- In UC10, the refund applies to the past due amount for installment 2 and then to installment 3.
- In UC11, the refund applies to the past due amount for installment 1 and then to installments 2, 3 and 4.
- In UC12, nothing is past due or due, so the refund applies to the final installments.
- In UC13, the refund applies to due, past due and delinquent amounts oldest first, and any remainder applies to the final installment.
- In UC14, the refund applies to any past due amount and then to any due amount.
- Partial merchant refunds are first allocated to the next due installment.

Goodwill credits follow these patterns across the documented use cases:

- In UC15, the goodwill credit is allocated to past due principal and then to the last installment.
- In UC16, the goodwill credit is allocated to the next installment.

Provisional credits follow these patterns across the documented use cases:

- Provisional credit applies to the oldest due installments first.
- Provisional credit triggers a re-amortization across all remaining installments.

Overpayments follow these patterns across the documented use cases:

- Overpayment is allocated to the next installment due.
- Overpayment is allocated to the final installment due.

### User interface

When you select Advanced payment allocation as the repayment strategy, the Payment allocation tab appears as the next screen. You can define the default payment allocation order there, and you can also define the order for a specific transaction type.

The Payment allocation tab includes the following controls:

- A dropdown lists transaction types, with Default (code: DEFAULT) selected by default.
- A dropdown lets you select the future installment allocation rule.
- Clicking a button lets you choose a transaction type: Repayment, Down payment, Merchant issues refund, Payout refund, Goodwill credit, Charge refund, Charge adjustment, Refund for active loans, or Interest waiver.
- For the selected transaction type, you can set payment allocation rules in order.
- Drag and drop shows a draggable icon on each row and changes the mouse pointer, as in Jira.
- Payment allocation rules display human-readable values, such as Next installment instead of NEXT_INSTALLMENT.

Additional user interface behaviour includes:

- Ordering appears on the left side of the advanced repayment allocation strategy configuration page.
- On the loan product configuration summary page, the Advanced payment allocation details are expandable and collapsed by default.
- A new field appears on the loan product screen, possibly below the repayment strategy dropdown, using the human-readable value.
- A new field appears on the loan screen; its dropdown is visible and configurable only when Advanced payment allocation repayment strategy is selected.

### Worked examples

A product administrator sets up advanced payment allocation on a loan product. The figures in this example are illustrative. The administrator chooses the Advanced payment allocation repayment strategy and defines the default order as past due penalty, past due fee, past due interest, and past due principal, with future installments handled from the next installment. A loan of 300.00 is disbursed and scheduled in three monthly installments of 100.00 each. A repayment of 150.00 is received. If the future installment rule were Last installment, the same 150.00 would pay the third installment first; under Reamortization it would be split as 50.00 against each installment.

| Installment | Due | Paid | Remaining |
| --- | --- | --- | --- |
| 1 | 100.00 | 100.00 | 0.00 |
| 2 | 100.00 | 50.00 | 50.00 |
| 3 | 100.00 | 0.00 | 100.00 |
| Total | 300.00 | 150.00 | 150.00 |

A loan officer applies a repayment of 275.00 to a loan that uses vertical schedule processing. The loan was disbursed for 1,000.00 and scheduled in four installments of 250.00 each. A fee of 20.00 and a penalty of 10.00 sit on the first installment, and penalties of 10.00 each sit on the second and third installments. Under horizontal processing the first installment still owes 5.00 of principal; under vertical processing it owes 25.00 of principal while the penalties on installments 2 and 3 are cleared.

| Step | Horizontal processing | Vertical processing |
| --- | --- | --- |
| 1 | Pay 10.00 penalty on installment 1 | Pay 10.00 penalty on installment 1 |
| 2 | Pay 20.00 fee on installment 1 | Pay 10.00 penalty on installment 2 |
| 3 | Pay 245.00 principal on installment 1 | Pay 10.00 penalty on installment 3 |
| 4 | — | Pay 20.00 fee on installment 1 |
| 5 | — | Pay 225.00 principal on installment 1 |
| Total | 275.00 | 275.00 |

A merchant refund of 300.00 is posted to an active loan. The loan was disbursed for 500.00 with four installments of 125.00 each. No down payment was posted, and the first two installments are unpaid when the refund arrives. The refund clears the past due and due installments first, and the remaining credit is reamortized across the future installments. The same refund rule applies to goodwill credit, except the credit is first applied to past due principal and then to the final installment.

| Step | Transaction | Installment 1 | Installment 2 | Installment 3 | Installment 4 |
| --- | --- | --- | --- | --- | --- |
| 1 | Setup | 125.00 | 125.00 | 125.00 | 125.00 |
| 2 | First two installments unpaid | 125.00 past due | 125.00 due | 125.00 | 125.00 |
| 3 | Merchant refund 300.00 | 0.00 | 0.00 | 100.00 | 100.00 |
| 4 | Payment 100.00 | 0.00 | 0.00 | 100.00 | 0.00 |
| 5 | Payment 100.00 | 0.00 | 0.00 | 0.00 | 0.00 |

A goodwill credit of 20.00 is posted to an active loan. The loan was disbursed for 500.00 with four installments of 125.00 each. A down payment of 125.00 clears the first installment. The goodwill credit reduces the next installment from 125.00 to 105.00. Under the alternative goodwill credit rule, the credit would first clear past due principal and then reduce the last installment.

| Step | Transaction | Installment 1 | Installment 2 | Installment 3 | Installment 4 |
| --- | --- | --- | --- | --- | --- |
| 1 | Down payment 125.00 | 0.00 | 125.00 | 125.00 | 125.00 |
| 2 | Goodwill credit 20.00 | 0.00 | 105.00 | 125.00 | 125.00 |
| 3 | Payment 105.00 | 0.00 | 0.00 | 125.00 | 125.00 |
| 4 | Payment 125.00 | 0.00 | 0.00 | 0.00 | 125.00 |
| 5 | Payment 125.00 | 0.00 | 0.00 | 0.00 | 0.00 |

See also: [Payment Allocation Strategies: Payment Allocation Strategies](confluence-link:Payment%20Allocation%20Strategies#payment-allocation-strategies).
