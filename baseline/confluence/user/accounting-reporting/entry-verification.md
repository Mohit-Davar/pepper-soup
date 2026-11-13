# Accounting Entry Verification

## Refund and provisional credit entries

Refund and provisional credit entries move money between the Fund source account and a receivable, liability or loan portfolio account. A Cash in entry debits the Fund source account and credits the other account; a Cash Out entry with the Y flag reverses the debit and credit.

| Entry type | Debit account | Credit account |
| --- | --- | --- |
| Interest - Repayment Cash in | Fund source account 145023 | Interest Receivable account 112603 |
| Late Fee Payment Cash in | Fund source account 145023 | Penalties Receivable account 112603 |
| NSF Fee Payment Cash in | Fund source account 145023 | Fees Receivable account 112603 |
| Snooze Fee Payment Cash in | Fund source account 145023 | Fees Receivable account 112603 |
| Principal Payment Cash in | Fund source account 145023 | Loan portfolio account 112601 |
| Unallocated Credit (UNC) Cash in | Fund source account 145023 | Over payment liability account 245000 |
| Interest - Repayment Cash Out with Y flag | Interest Receivable account 112603 | Fund source account 145023 |
| Late Fee Payment Cash Out with Y flag | Penalties Receivable account 112603 | Fund source account 145023 |
| NSF Fee Payment Cash Out with Y flag | Fees Receivable account 112603 | Fund source account 145023 |
| Snooze Fee Payment Cash Out with Y flag | Fees Receivable account 112603 | Fund source account 145023 |
| Principal Payment Cash Out with Y flag | Loan portfolio account 112601 | Fund source account 145023 |
| Unallocated Credit (UNC) Cash Out with Y flag | Over payment liability account 245000 | Fund source account 145023 |

## Goodwill entries

Goodwill entries record accounting entries when the bank waives a charge without receiving cash.

| Entry | Debits | Credits |
| --- | --- | --- |
| Good Will Late Fee Payment No Cash | Income from Goodwill Credit Penalty account 404008 | Penalties Receivable account 112603 |
| Good Will NSF Fee Payment No Cash | Income from Goodwill Credit Fees account 404008 | Fees Receivable account 112603 |
| Good Will Snooze Fee Payment No Cash | Income from Goodwill Credit Fees account 404008 | Fees Receivable account 112603 |
| Good Will Principal Payment No Cash | Expense from Goodwill Credit account 744003 | Loan portfolio account 112601 |
| Good Will Unallocated Credit (UNC) No Cash | Expense from Goodwill Credit account 744003 | Over payment liability account 245000 |

## Auto payment entries

Auto payment entries record how cash moves between the Fund source account and receivable, liability, or loan portfolio accounts when a payment posts automatically. Each entry lists the account debited and the account credited.

| Entry type | Debits | Credits |
| --- | --- | --- |
| Auto Payment Interest - Repayment Cash in | Fund source account 145023 | Interest Receivable account 112603 |
| Auto Payment Late Fee Payment Cash in | Fund source account 145023 | Penalties Receivable account 112603 |
| Auto Payment NSF Fee Payment Cash in | Fund source account 145023 | Fees Receivable account 112603 |
| Auto Payment Snooze Fee Payment Cash in | Fund source account 145023 | Fees Receivable account 112603 |
| Auto Payment Principal Payment Cash in | Fund source account 145023 | Loan portfolio account 112601 |
| Auto Payment Unallocated Credit (UNC) Cash in | Fund source account 145023 | Over payment liability account 245000 |
| Auto Payment Interest - Repayment Cash Out with Y flag | Interest Receivable account 112603 | Fund source account 145023 |
| Auto Payment Late Fee Payment Cash Out with Y flag | Penalties Receivable account 112603 | Fund source account 145023 |
| Auto Payment NSF Fee Payment Cash Out with Y flag | Fees Receivable account 112603 | Fund source account 145023 |
| Auto Payment Snooze Fee Payment Cash Out with Y flag | Fees Receivable account 112603 | Fund source account 145023 |
| Auto Payment Principal Payment Cash Out with Y flag | Loan portfolio account 112601 | Fund source account 145023 |
| Auto Payment Unallocated Credit (UNC) Cash Out with Y flag | Over payment liability account 245000 | Fund source account 145023 |
| Loan Disbursement Principal Cash Out | Loan portfolio account 112601 | Fund source account 145023 |

## Scheduled payment entries

A scheduled payment entry records the accounting effect when a borrower pays an installment. Every entry debits Fund source account 145023; the credit account depends on what the payment covers.

| Entry type | Debit account | Credit account |
| --- | --- | --- |
| Scheduled Payment Interest - Repayment Cash in | Fund source account 145023 | Interest Receivable account 112603 |
| Scheduled Payment Late Fee Payment Cash in | Fund source account 145023 | Penalties Receivable account 112603 |
| Scheduled Payment NSF Fee Payment Cash in | Fund source account 145023 | Fees Receivable account 112603 |
| Scheduled Payment Snooze Fee Payment Cash in | Fund source account 145023 | Fees Receivable account 112603 |
| Scheduled Payment Principal Payment Cash in | Fund source account 145023 | Loan portfolio account 112601 |
| Scheduled Payment Unallocated Credit (UNC) Cash in | Fund source account 145023 | Over payment liability account 245000 |

## Fee return entries

Fee return entries record the reversal of a fee payment when no cash changes hands. Two entry types apply, depending on whether the late fee payment carries the Y flag.

| Entry type | Reference |
| --- | --- |
| Apply Fee Return Late Fee Payment No Cash | R290 |
| Apply Fee Return Late Fee Payment No Cash with Y flag | R291 |

## Worked examples

A borrower pays 250.00 toward principal on a 1,000.00 loan. The loan carries a 12% annual interest rate, 3 monthly installments, and 30-day months; the figures are illustrative. The user verifies the cash-in accounting entry for a scheduled principal payment. This example shows that every cash-in receipt debits Fund source 145023 and credits the account matching the payment type.

| Account | Debit | Credit |
| --- | --- | --- |
| Fund source 145023 | 250.00 |  |
| Loan portfolio 112601 |  | 250.00 |
| Totals | 250.00 | 250.00 |

A refund of 250.00 principal is posted with the Y flag, or a 1,000.00 loan is disbursed to a borrower. The entry moves money out of the fund source and adjusts the loan asset. This example shows that every cash-out with Y flag entry, and every loan disbursement, credits Fund source 145023 and debits the account matching the payment type.

| Account | Debit | Credit |
| --- | --- | --- |
| Loan portfolio 112601 | 250.00 |  |
| Fund source 145023 |  | 250.00 |
| Totals | 250.00 | 250.00 |

An administrator waives a 100.00 unallocated credit as goodwill. No cash moves; the entry adjusts an expense account and a liability account. This example shows that a goodwill no-cash adjustment debits an expense or income account and credits the related receivable or liability account without touching cash.

| Account | Debit | Credit |
| --- | --- | --- |
| Expense from Goodwill Credit 744003 | 100.00 |  |
| Over payment liability 245000 |  | 100.00 |
| Totals | 100.00 | 100.00 |
