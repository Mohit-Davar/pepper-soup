# Accounting Entry Verification

## Transaction refund or provisional credit cash in

A Transaction Refund or Provisional Credit cash-in entry debits Fund source account 145023 and credits the receivable or liability account that matches the payment type.

| Payment type | Debit account | Credit account |
| --- | --- | --- |
| Interest - Repayment | Fund source account 145023 | Interest Receivable account 112603 |
| Late Fee Payment | Fund source account 145023 | Penalties Receivable account 112603 |
| NSF Fee Payment | Fund source account 145023 | Fees Receivable account 112603 |
| Snooze Fee Payment | Fund source account 145023 | Fees Receivable account 112603 |
| Principal Payment | Fund source account 145023 | Loan portfolio account 112601 |
| Unallocated Credit (UNC) | Fund source account 145023 | Over payment liability account 245000 |

## Transaction refund or provisional credit cash in with Y flag

All entries are in development.

| Payment type | Debit account | Credit account |
| --- | --- | --- |
| Interest | 145023 Fund source | 404001 Income from ChargeOff Interest |
| Late fee | 145023 Fund source | 404008 Income from ChargeOff Penalty |
| NSF fee | 145023 Fund source | 404008 Income from ChargeOff Fees |
| Snooze fee | 145023 Fund source | 404008 Income from ChargeOff Fees |
| Principal | 145023 Fund source | 744007 ChargeOff Expense / 740037 Charge Off Fraud Expense |
| Unallocated credit | 145023 Fund source | 245000 Over payment liability |

## Transaction refund or provisional credit cash out with Y flag

A transaction refund or provisional credit cash out with Y flag posts one accounting entry that debits a receivable, loan portfolio, or unallocated credit account and credits the fund source account. The debit account depends on the payment type.

| Payment type | Debit account | Credit account |
| --- | --- | --- |
| Interest repayment | Interest Receivable 112603 | Fund source 145023 |
| Late fee payment | Penalties Receivable 112603 | Fund source 145023 |
| NSF fee payment | Fees Receivable 112603 | Fund source 145023 |
| Snooze fee payment | Fees Receivable 112603 | Fund source 145023 |
| Principal payment | Loan portfolio 112601 | Fund source 145023 |
| Unallocated credit (UNC) | Over payment liability 245000 | Fund source 145023 |

## Transaction refund or provisional credit cash out with Y Y flags

| Entry type | Debit account | Credit account |
| --- | --- | --- |
| Interest | Income from ChargeOff Interest account 404001 | Fund source account 145023 |
| Late fee payment | Income from ChargeOff Penalty account 404008 | Fund source account 145023 |
| NSF fee payment | Income from ChargeOff Fees account 404008 | Fund source account 145023 |
| Snooze fee payment | Income from ChargeOff Fees account 404008 | Fund source account 145023 |
| Principal payment | ChargeOff Expense/Charge Off Fraud Expense account 744007/740037 | Fund source account 145023 |
| Unallocated Credit (UNC) | Over payment liability account 245000 | Fund source account 145023 |

## Good will no cash entries

Good will no cash entries post goodwill credit income or expense against receivable, loan portfolio, or overpayment liability accounts without moving cash.

| Entry type | Debit account | Credit account |
| --- | --- | --- |
| Good Will Late Fee Payment No Cash | Income from Goodwill Credit Penalty (404008) | Penalties Receivable (112603) |
| Good Will NSF Fee Payment No Cash | Income from Goodwill Credit Fees (404008) | Fees Receivable (112603) |
| Good Will Snooze Fee Payment No Cash | Income from Goodwill Credit Fees (404008) | Fees Receivable (112603) |
| Good Will Principal Payment No Cash | Expense from Goodwill Credit (744003) | Loan portfolio (112601) |
| Good Will Unallocated Credit (UNC) No Cash | Expense from Goodwill Credit (744003) | Over payment liability (245000) |

## Good will no cash entries with Y flag

| Entry type | Debit account | Credit account |
| --- | --- | --- |
| Good Will Interest - Repayment No Cash with Y flag | Income from Goodwill Credit Interest account 404001 | Income from Recovery Repayment account 744008 |
| Good Will Late Fee Payment No Cash with Y flag | Income from Goodwill Credit Penalty account 404008 | Income from Recovery Repayment account 744008 |
| Good Will NSF Fee Payment No Cash with Y flag | Income from Goodwill Credit Fees account 404008 | Income from Recovery Repayment account 744008 |
| Good Will Snooze Fee Payment No Cash with Y flag | Income from Goodwill Credit Fees account 404008 | Income from Recovery Repayment account 744008 |
| Good Will Principal Payment No Cash with Y flag | Expense from Goodwill Credit account 744003 | Income from Recovery Repayment account 744008 |

## Late fee waiver no cash entries

| Entry type | Debits account | Credits account |
| --- | --- | --- |
| Late Fee Waiver Late Fee Payment No Cash | Income from Penalties 404007 | Penalties Receivable 112603 |
| Late Fee Waiver Late Fee Payment No Cash with Y flag | Income from Penalties 404007 | Income from ChargeOff Penalty 404008 |
| Late Fee Waiver Late Fee Payment No Cash with Y flag | Penalties Receivable 112603 | Income from Penalties 404007 |
| Late Fee Waiver Late Fee Payment No Cash with Y Y flags | Income from ChargeOff Penalty 404008 | Income from Penalties 404007 |

## NSF fee waiver no cash entries

NSF fee waiver entries with no cash movement post between income and receivable accounts depending on the flag combination.

| Flag combination | Debit account | Credit account |
| --- | --- | --- |
| No flags | Income from Fees (404007) | Fees Receivable (112603) |
| Y flag | Income from Fees (404007) | Income from ChargeOff Fees (404008) |
| Y flag | Fees Receivable (112603) | Income from Fees (404007) |
| Y Y flags | Income from ChargeOff Fees (404008) | Income from Fees (404007) |

## Auto payment cash in

Auto payment cash in entries debit Fund source account 145023 and credit the receivable or liability account for the payment type. The entry type depends on what the payment covers: interest, late fee, NSF fee, snooze fee, principal, or unallocated credit.

| Entry type | Debit account | Credit account |
| --- | --- | --- |
| Auto Payment Interest - Repayment Cash in | Fund source account 145023 | Interest Receivable account 112603 |
| Auto Payment Late Fee Payment Cash in | Fund source account 145023 | Penalties Receivable account 112603 |
| Auto Payment NSF Fee Payment Cash in | Fund source account 145023 | Fees Receivable account 112603 |
| Auto Payment Snooze Fee Payment Cash in | Fund source account 145023 | Fees Receivable account 112603 |
| Auto Payment Principal Payment Cash in | Fund source account 145023 | Loan portfolio account 112601 |
| Auto Payment Unallocated Credit (UNC) Cash in | Fund source account 145023 | Over payment liability account 245000 |

## Auto payment cash in with Y flag

Auto payment cash in with Y flag posts recovery repayment entries to the fund source account and either income from recovery repayment or over payment liability, depending on the payment type.

| Payment type | Debit account | Credit account |
| --- | --- | --- |
| Interest | Fund source account 145023 | Income from Recovery Repayment account 744008 |
| Late fee payment | Fund source account 145023 | Income from Recovery Repayment account 744008 |
| NSF fee payment | Fund source account 145023 | Income from Recovery Repayment account 744008 |
| Snooze fee payment | Fund source account 145023 | Income from Recovery Repayment account 744008 |
| Principal payment | Fund source account 145023 | Income from Recovery Repayment account 744008 |
| Unallocated credit (UNC) | Fund source account 145023 | Over payment liability account 245000 |

## Auto payment cash out with Y flag

Auto payment cash out with Y flag moves cash out of the fund source account and debits the receivable or liability account for the payment type.

| Payment type | Debit account | Credit account |
| --- | --- | --- |
| Interest | Interest Receivable 112603 | Fund source 145023 |
| Late fee | Penalties Receivable 112603 | Fund source 145023 |
| NSF fee | Fees Receivable 112603 | Fund source 145023 |
| Snooze fee | Fees Receivable 112603 | Fund source 145023 |
| Principal | Loan portfolio 112601 | Fund source 145023 |
| Unallocated credit | Over payment liability 245000 | Fund source 145023 |

## Auto payment cash out with Y Y flags

Auto payment cash out with Y Y flags posts recovery repayment income and unallocated credit entries.

| Entry type | Debit account | Credit account |
| --- | --- | --- |
| Auto Payment Interest - Repayment Cash Out | Income from Recovery Repayment account 744008 | Fund source account 145023 |
| Auto Payment Late Fee Payment Cash Out | Income from Recovery Repayment account 744008 | Fund source account 145023 |
| Auto Payment NSF Fee Payment Cash Out | Income from Recovery Repayment account 744008 | Fund source account 145023 |
| Auto Payment Snooze Fee Payment Cash Out | Income from Recovery Repayment account 744008 | Fund source account 145023 |
| Auto Payment Principal Payment Cash Out | Income from Recovery Repayment account 744008 | Fund source account 145023 |
| Auto Payment Unallocated Credit (UNC) Cash Out | Over payment liability account 245000 | Fund source account 145023 |

## Scheduled payment cash in

A scheduled payment cash-in entry debits Fund source account 145023 and credits the receivable account for the payment type.

| Payment type | Debit account | Credit account |
| --- | --- | --- |
| Interest | Fund source account 145023 | Interest Receivable account 112603 |
| Late fee | Fund source account 145023 | Penalties Receivable account 112603 |
| NSF fee | Fund source account 145023 | Fees Receivable account 112603 |
| Snooze fee | Fund source account 145023 | Fees Receivable account 112603 |
| Principal | Fund source account 145023 | Loan portfolio account 112601 |
| Unallocated credit | Fund source account 145023 | Over payment liability account 245000 |

## Scheduled payment cash in with Y flag

Scheduled payment cash in with Y flag posts accounting entries for interest, late fee, NSF fee, snooze fee, principal, and unallocated credit recoveries. Interest, late fee, NSF fee, snooze fee, and principal payments credit Income from Recovery Repayment account 744008. Unallocated credit payments credit Over payment liability account 245000.

| Payment type | Debit account | Credit account |
| --- | --- | --- |
| Interest | 145023 Fund source | 744008 Income from Recovery Repayment |
| Late fee | 145023 Fund source | 744008 Income from Recovery Repayment |
| NSF fee | 145023 Fund source | 744008 Income from Recovery Repayment |
| Snooze fee | 145023 Fund source | 744008 Income from Recovery Repayment |
| Principal | 145023 Fund source | 744008 Income from Recovery Repayment |
| Unallocated Credit (UNC) | 145023 Fund source | 245000 Over payment liability |

## Apply fee return entries

Apply fee return entries record the reversal of a late fee payment without moving cash. Two variants exist: one without a flag and one with a Y flag.

| Entry | Reference |
| --- | --- |
| Apply Fee Return Late Fee Payment No Cash entry | R290 |
| Apply Fee Return Late Fee Payment No Cash with Y flag entry | R291 |

## Worked examples

A borrower repays a 1,200.00 loan in three equal monthly installments. The annual interest rate is 12%, or 1% per 30-day month, and interest is charged on the opening balance of each month. Each installment repays 400.00 of principal plus the month's interest. Cash is received into the fund source clearing account 145023; the principal portion credits the loan portfolio 112601 and the interest portion credits interest receivable 112603. The figures are illustrative. The example shows that every entry balances, the loan balance falls by the principal paid each month, and the closing balance reaches zero.

| Installment | Opening balance | Principal paid | Interest due | Cash in | Dr 145023 | Cr 112601 | Cr 112603 | Closing balance |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 1,200.00 | 400.00 | 12.00 | 412.00 | 412.00 | 400.00 | 12.00 | 800.00 |
| 2 | 800.00 | 400.00 | 8.00 | 408.00 | 408.00 | 400.00 | 8.00 | 400.00 |
| 3 | 400.00 | 400.00 | 4.00 | 404.00 | 404.00 | 400.00 | 4.00 | 0.00 |
| Total | — | 1,200.00 | 24.00 | 1,224.00 | 1,224.00 | 1,200.00 | 24.00 | — |

A borrower pays 250.00 in excess of the amount due, so the excess has no related loan or interest receivable. The excess is treated as an unallocated credit. Cash is received into the fund source clearing account 145023 and the over-payment liability 245000 is credited. The cash-in debit to 145023 is the same as in a normal repayment, but the credit goes to the over-payment liability 245000 instead of the loan portfolio or interest receivable because there is no outstanding receivable to reduce.

| Entry line | Account | Account type | Debit | Credit |
| --- | --- | --- | --- | --- |
| 1 | Fund source / clearing (145023) | Suspense/clearing | 250.00 | 0.00 |
| 2 | Over-payment liability (245000) | Liability | 0.00 | 250.00 |
| Total |  |  | 250.00 | 250.00 |

The bank grants a goodwill reduction of 300.00 on the loan principal and no cash moves. The goodwill expense 744003 is debited and the loan portfolio 112601 is credited, reducing the outstanding balance through an expense-driven adjustment. Unlike a cash repayment, no fund source account is involved and the entry changes the balance without a collection.

| Entry line | Account | Account type | Debit | Credit |
| --- | --- | --- | --- | --- |
| 1 | Expense from goodwill credit (744003) | Expense | 300.00 | 0.00 |
| 2 | Loan portfolio (112601) | Asset | 0.00 | 300.00 |
| Total |  |  | 300.00 | 300.00 |
