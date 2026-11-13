# Accounting

## Accounting options for Working Capital loans

Working Capital loans have two accounting options: None (default) and Cash based. The accounting rule is mandatory when you create a Working Capital product and must be NONE or CASH_BASED.

None accounting:

- No accounting configuration is needed.
- No journal entries are created during the loan lifecycle.

Cash based accounting:

- Recognizes interest only when a monetary event such as a repayment occurs, and calculates income based on the transaction amount.
- Creating or editing the product fails unless receivable fee account id is set, showing the error '[receivable fee account id] The parameter receivable fee account id is mandatory.'

You can view the journal entry created for any transaction, similar to the progressive loan feature.

## Configuring GL mapping on a loan product

GL mapping on a loan product links accounting entries to general ledger accounts based on income type, such as fees or interest. You can configure it when you create a loan product and on the modify screen.

Cash Based accounting supports GL mapping for Working Capital loan products, including advance accounting rules mapping. Advance accounting rules mapping for Working Capital is similar to term loan products except for capitalized income and buydown fees mapping.

You can update or delete GL accounting mapping on the loan product. Backend validations are adapted to the UI, so each parameter must be mapped to a GL before you submit.

Charge-off mapping parameters are optional.

| Parameter | Required |
| --- | --- |
| Charge-off GL mapping parameters | No |

## Journal entries by transaction

Each transaction posts debit and credit entries to general ledger accounts. The accounts and allocation types depend on the transaction type and whether the loan account is active, closed, or charged off.

Transaction entries

| Transaction | Debit entry | Credit entry |
| --- | --- | --- |
| Repayment | Suspence/clearing account GL 145023 (Fund source, Asset/Liability, Prin, Fees, Penalty, excess) | Loans Receivable Principal GL 112601 (Loan Portfolio, Asset, Prin); Other Credit liability GL 245000 (Overpayment Liability, Liability, excess); Fee Receivable GL 112603 (Penalty Receivable, Asset, Penalty); Fee Receivable GL 112603 (Fees Receivable, Asset, fees) |
| Repayment Reversal | Loans Receivable Principal GL 112601 (Loan Portfolio, Asset, Prin); Other Credit liability GL 245000 (Overpayment Liability, Liability, excess); Fee Receivable GL 112603 (Fees Receivable, Asset, fees); Fee Receivable GL 112603 (Penalty Receivable, Asset, Penalty) | Suspence/clearing account GL 145023 (Fund source, Asset/Liability, Prin, Fees, Penalty, excess) |
| Repayment on closed loan account | Suspence/clearing account GL 145023 (Fund source, Liability, Allocation Type Prin, Fees, Penalty and excess) | Fee Receivable GL 112603 (Fees Receivable, Asset, fees) |
| Repayment after charge-off | Suspence/clearing account GL 145023 (Fund source, Asset/Liability, Prin, Fees, Penalty, excess) | Recoveries GL 744008 (Income from Recovery Repayment, Income, Prin); Other Credit liability GL 245000 (Overpayment Liability, Liability, excess); Recoveries GL 744008 (Income from Recovery Repayment, Income, Penalty); Recoveries GL 744008 (Income from Recovery Repayment, Income, fees) |
| Repayment Reversal after charge-off | Recoveries GL 744008 (Income from Recovery Repayment, Income, Prin); Other Credit liability GL 245000 (Overpayment Liability, Liability, excess); Recoveries GL 744008 (Income from Recovery Repayment, Income, Penalty); Recoveries GL 744008 (Income from Recovery Repayment, Income, fees) | Suspence/clearing account GL 145023 (Fund source, Asset/Liability, Prin, Fees, Penalty, excess) |
| Disbursement | Loans Receivable Principal GL 112601 (Loan Portfolio, Asset, Prin) | Suspence/clearing account GL 145023 (Fund source, Asset/Liability, Prin) |
| Disbursement Reversal | Suspence/clearing account GL 145023 (Fund source, Asset/Liability, Prin) | Loans Receivable Principal GL 112601 (Loan Portfolio, Asset, Prin) |
| Amortization | Deferred Interest GL 240005 (Deferred Income, Liability, Int) | Interest income GL 404000 (Income from Amortization, Income, Int) |
| Amortization after charge-off | Deferred Interest GL 240005 (Deferred Income, Liability, Int) | Interest income GL 404000 (Income from Amortization, Income, Int) |
| CBR | Other Credit liability GL 245000 (Overpayment Liability, Liability, excess) | Suspence/clearing account GL 145023 (Fund source, Asset/Liability, excess) |
| CBR Reversal | Suspence/clearing account GL 145023 (Fund source, Asset/Liability, excess) | Other Credit liability GL 245000 (Overpayment Liability, Liability, excess) |
| CBR after charge-off | Other Credit liability GL 245000 (Overpayment Liability, Liability, excess) | Suspence/clearing account GL 145023 (Fund source, Asset/Liability, excess) |
| CBR Reversal after charge-off | Suspence/clearing account GL 145023 (Fund source, Asset/Liability, excess) | Other Credit liability GL 245000 (Overpayment Liability, Liability, excess) |
| Charge addition | Fee Receivable GL 112603 (Fees Receivable, Asset, fees) | Fee Income GL 404007 (Income from Fees, Income, fees) |
| Charge waive | Fee Income GL 404007 (Income from Fees, Income, fees) | Fee Receivable GL 112603 (Fees Receivable, Asset, fees) |
| Charge Adjustment | Fee Income / Penalty Income GL 404007 (Income from charges, Income, prin, fees, excess) | Loans Receivable Principal GL 112601 (Loan Portfolio, Asset, prin); Fee Receivable GL 112603 (Fees Receivable, Asset, fees); Fee Receivable GL 112603 (Penalty Receivable, Asset, Penalty); Other Credit liability GL 245000 (Overpayment Liability, Liability, excess) |
| Charge Adjustment on charge-off loan account | Fee Income GL 404007 (Income from fees/Penalty, Income, prin, fees, excess) | Fee Charge off GL 404008 (Income from ChargeOff Fees, Asset, fees); Other Credit liability GL 245000 (Overpayment Liability, Liability, excess) |
| Charge-off | Credit loss-bad dept/credit loss-bad dept- fraud GL 744007/744037 (Charge off expense/charge-off fraud expense, Expense, Prin); Fee Charge off GL 404008 (Income from ChargeOff Fees, Income, fees); Fee Charge off GL 404008 (Income from ChargeOff Penalties, Income, Penalty) | Loans Receivable Principal GL 112601 (Loan Portfolio, Asset, Prin); Fee Receivable GL 112603 (Fees Receivable, Asset, fees); Fee Receivable GL 112603 (Penalty Receivable, Asset, Penalty) |
| Charge-off Reversal | Fee Receivable GL 112603 (Fees Receivable, Asset, fees); Fee Receivable GL 112603 (Penalty Receivable, Asset, Penalty) | Loans Receivable Principal GL 112601 (Loan Portfolio, Asset, Prin); Fee Charge off GL 404008 (Income from ChargeOff Fees, Income, fees); Fee Charge off GL 404008 (Income from ChargeOff Penalties, Income, Penalty) |
| Write-off | Recoveries GL 744008 (Losses Written-off, Expense, Prin, fees, Penalty) | Fee Receivable GL 112603 (Fees Receivable, Asset, fees); Fee Receivable GL 112603 (Penalty Receivable, Asset, Penalty); Loans Receivable Principal GL 112601 (Loan Portfolio, Asset, Prin) |
| Write-off Reversal | Loans Receivable Principal GL 112601 (Loan Portfolio, Asset, Prin); Fee Receivable GL 112603 (Fees Receivable, Asset, fees); Fee Receivable GL 112603 (Penalty Receivable, Asset, Penalty) | Recoveries GL 744008 (Losses Written-off, Expense, Prin, fees, Penalty) |
| Goodwill Credit | Principal bal adjustment GL 744003 (Expense, Prin, excess); Fee Charge off GL 404008 (Income, fees); Fee Charge off GL 404008 (Income, Penalty) | Loans Receivable Principal GL 112601 (Asset, prin); Fee Receivable GL 112603 (Asset, fees); Fee Receivable GL 112603 (Asset, Penalty); Other Credit liability GL 245000 (Liability, excess) |
| Goodwill Credit on closed loan account | Principal bal adjustment GL 744003 (Expense from Goodwill Credit, Expense, Prin, excess) |  |
| Goodwill Credit after charge-off | Principal bal adjustment GL 744003 (Expense from Goodwill Credit, Expense, Prin, excess); Fee Charge off GL 404008 (Income from Goodwill Credit Fees, Income, fees); Fee Charge off GL 404008 (Income from Goodwill Credit Penalty, Income, Penalty) | Recoveries GL 744008 (Income from Recovery Repayment, Income, prin); Recoveries GL 744008 (Income from Recovery Repayment, Income, fees); Recoveries GL 744008 (Income from Recovery Repayment, Income, Penalty); Other Credit liability GL 245000 (Overpayment Liability, Liability, excess) |
| Goodwill Credit Reversal after charge-off | Recoveries GL 744008 (Income from Recovery Repayment, Income, prin); Recoveries GL 744008 (Income from Recovery Repayment, Income, fees); Recoveries GL 744008 (Income from Recovery Repayment, Income, Penalty); Other Credit liability GL 245000 (Overpayment Liability, Liability, excess) | Fee Charge off GL 404008 (Income from Goodwill Credit Fees, Income, fees); Fee Charge off GL 404008 (Income from Goodwill Credit Penalty, Income, Penalty) |
| Discount fees | Loans Receivable Principal GL 112601 (Loan Portfolio, Asset, Prin, Fees, Penalty) | Deferred Interest GL 240005 (Deferred Income, Liability, Prin, Fees, Penalty) |
| Discount fees Adjustment | Deferred Interest GL 240005 (Deferred Income, Liability, Prin, Fees, Penalty) | Loans Receivable Principal GL 112601 (Loan Portfolio, Asset, Prin, Fees, Penalty) |
| Payout refund payment on active loan account - Penalty | Fund source GL 145023 | Penalties Receivable GL 112603 |
| Payout refund payment on active loan account - Fees | Fund source GL 145023 | Fees Receivable GL 112603 |
| Payout refund payment on active loan account - Principal | Fund source GL 145023 | Loan portfolio GL 112601 |
| Payout refund payment on active loan account - Unallocated Credit (UNC) | Fund source GL 145023 | Over payment liability GL 245000 |
| Payout refund payment on charge-off loan account - Penalty | Fund source GL 145023 | Income from ChargeOff Penalty GL 404008 |
| Payout refund payment on charge-off loan account - Fees | Fund source GL 145023 | Income from ChargeOff Fees GL 404008 |
| Payout refund payment on charge-off loan account - Principal | Fund source GL 145023 | ChargeOff Expense/Charge Off Fraud Expense GL 744007/740037 |
| Payout refund payment on charge-off loan account - Unallocated Credit (UNC) | Fund source GL 145023 | Over payment liability GL 245000 |
| Payout refund reversal payment on active loan account - Penalty | Penalties Receivable GL 112603 | Fund source GL 145023 |
| Payout refund reversal payment on active loan account - Fees | Fees Receivable GL 112603 | Fund source GL 145023 |
| Payout refund reversal payment on active loan account - Principal | Loan portfolio GL 112601 | Fund source GL 145023 |
| Payout refund reversal payment on active loan account - Unallocated Credit (UNC) | Over payment liability GL 245000 | Fund source GL 145023 |
| Payout refund reversal payment on charge-off loan account - Penalty | Income from ChargeOff Penalty GL 404008 | Fund source GL 145023 |
| Payout refund reversal payment on charge-off loan account - Fees | Income from ChargeOff Fees GL 404008 | Fund source GL 145023 |
| Payout refund reversal payment on charge-off loan account - Principal | ChargeOff Expense/Charge Off Fraud Expense GL 744007/740037 | Fund source GL 145023 |
| Payout refund reversal payment on charge-off loan account - Unallocated Credit (UNC) | Over payment liability GL 245000 | Fund source GL 145023 |
