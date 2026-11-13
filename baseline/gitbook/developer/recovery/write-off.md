# Write-Off

## Write-off overview

A write-off removes a loan balance from the books when the loan is not expected to be recovered. You can write off a loan only if it has not already been charged off. A write-off is a final state, so backdated monetary actions are not allowed. Whenever a charge-off is triggered, an accounting write-off happens on the accounting side.

## Write-off reasons

During write-off, the system lists all available write-off reason code values and lets you select one. The selected reason is set on the loan, and loan details retrieve the selected reason code value.

## Write-off accounting

When a loan is written off, the system debits the Losses Written-off accounting GL account. If the write-off reason has an advance accounting mapping and that reason was used, the system uses the mapped GL account instead of the default mapping. If a loan product has no write-off reason configurations and a loan is written off with a write-off reason, the system shows the default mapping.

## Write-off reason to GL account mapping

Map each write-off reason code to one expense GL account. You can configure multiple mappings, but the same reason code cannot appear twice. The same expense GL account can be used for several write-off reasons.

| Field | Requirement |
| --- | --- |
| writeOffReasonCodeValueId | Must be a valid, existing write-off reason code value id |
| expenseGLAccountId | Must be a valid, existing Expense GL account id |

> **Note:** Setting two different expense accounts for the same write-off reason is prohibited and shows an error on submit.

## Loan product write-off configuration

Configure write-off reasons to expense account mappings on a loan product so that each write-off reason posts to the correct expense GL account. The field is optional. Use the loan product template API to see all available configuration options and write-off reason code values, or call the specific loan product details API with template details to return the same options along with the product's current mappings. You can also retrieve write-off reason code values using CodeValueReadPlatformService.retrieveCodeValuesByCode("WriteOffReasons").

Each mapping in writeOffReasonsToExpenseMappings contains:

| Field | Description |
| --- | --- |
| writeOffReasonCodeValueId | Code value ID of the write-off reason |
| expenseGLAccountId | GL account ID of the expense account |

## Write-off reason code values

## Undoing a write-off

You can undo a write-off on a loan account.

Call one of these API endpoints with the command undowriteoff:

- loans/1/transactions?command=undowriteoff
- loans/external-id/123123123-12312321312-12313123/transactions?command=undowriteoff

## Recovery payments

You can initiate a recovery payment on a written-off loan account. A recovery payment works like a term loan payment, but it cannot exceed the written-off amount and must be dated on or after the write-off date. The loan balance remains zero and the loan stays written-off after the payment. You can reverse a recovery payment; its accounting entry is the mirror of the original recovery payment entry.

## Worked examples

A loan with a principal of 1,000, an annual interest rate of 12%, 3 monthly installments, and 30-day months has already been charged off, so its receivable GL accounts were credited. When a write-off is triggered for 600.00 of principal, 100.00 of interest, 50.00 of fees, and 30.00 of penalties, the figures are illustrative. The system does not credit the receivable again; instead it maps principal to Charge-off Expense, interest to Income from Charge-off Expense, fees to Income from Charge-off Fee, and penalties to Income from Charge-off Penalty. This shows that a write-off on an already charged-off loan avoids a second receivable credit and uses the component-specific charge-off GL accounts.

| Component | Amount | GL account used | Receivable credited? |
| --- | --- | --- | --- |
| Principal | 600.00 | Charge-off Expense | No |
| Interest | 100.00 | Income from Charge-off Expense | No |
| Fee | 50.00 | Income from Charge-off Fee | No |
| Penalty | 30.00 | Income from Charge-off Penalty | No |
| Total | 780.00 | — | No |
