# Accounting Entry Verification

## Accounting Entry Verification

### Loan disbursement principal cash out

The Loan Disbursement Principal Cash Out entry debits account 112601 and credits account 145023 with status pass, mapping Loan portfolio to Fund source.

### Transaction refund provisional credit cash in

A Transaction Refund/Provisional Credit cash-in entry debits account 145023 and credits the receivable or liability account that matches the payment type, with status pass and the fund source mapped to the corresponding receivable or liability.

| Payment type | Debit account | Credit account | Fund source mapping |
| --- | --- | --- | --- |
| Interest | 145023 | 112603 | Interest Receivable |
| Late fee | 145023 | 112603 | Penalties Receivable |
| NSF fee | 145023 | 112603 | Fees Receivable |
| Snooze fee | 145023 | 112603 | Fees Receivable |
| Principal | 145023 | 112601 | Loan portfolio |
| Unallocated credit | 145023 | 245000 | Over payment liability |

### Transaction refund provisional credit cash in charge-off

A transaction refund or provisional credit repayment cash-in entry with the Y flag debits account 145023 and credits an income or expense account based on the payment type, mapping the fund source to charge-off income or expense. This applies to interest, late fee, NSF fee, snooze fee, principal, and unallocated credit payments.

| Payment type | Debit account | Credit account | Fund source mapping |
| --- | --- | --- | --- |
| Interest | 145023 | 404001 | Income from ChargeOff Interest |
| Late fee | 145023 | 404008 | Income from ChargeOff Penalty |
| NSF fee | 145023 | 404008 | Income from ChargeOff Fees |
| Snooze fee | 145023 | 404008 | Income from ChargeOff Fees |
| Principal | 145023 | 744007/740037 | ChargeOff Expense/Charge Off Fraud Expense |
| Unallocated credit | 145023 | 245000 | Over payment liability |

### Transaction refund provisional credit cash out

A Transaction Refund/Provisional Credit Cash Out entry with the Y flag posts a debit to a cash account and a credit to account 145023, mapping the affected receivable or liability to the Fund source. The debit account depends on the payment type. All entries pass verification.

| Entry | Debit account | Credit account | Mapping | Status |
| --- | --- | --- | --- | --- |
| Interest repayment cash out | 112603 | 145023 | Interest Receivable to Fund source | pass |
| Late fee payment cash out | 112603 | 145023 | Penalties Receivable to Fund source | pass |
| NSF fee payment cash out | 112603 | 145023 | Fees Receivable to Fund source | pass |
| Snooze fee payment cash out | 112603 | 145023 | Fees Receivable to Fund source | pass |
| Principal payment cash out | 112601 | 145023 | Loan portfolio to Fund source | pass |
| Unallocated Credit (UNC) cash out | 245000 | 145023 | Over payment liability to Fund source | pass |

### Transaction refund provisional credit cash out charge-off

Transaction refund or provisional credit cash out entries apply to repayment, late fee, NSF fee, snooze fee, principal, and unallocated credit payments when both flags are Y. Each entry debits a charge-off or liability account and credits account 145023, mapping income or expense to the fund source.

| Entry | Debit account | Credit account | Mapping |
| --- | --- | --- | --- |
| Transaction Refund/Provisional Credit Interest - Repayment Cash Out | 404001 | 145023 | Income from ChargeOff Interest to Fund source |
| Transaction Refund/Provisional Credit Late Fee Payment Cash Out | 404008 | 145023 | Income from ChargeOff Penalty to Fund source |
| Transaction Refund/Provisional Credit NSF Fee Payment Cash Out | 404008 | 145023 | Income from ChargeOff Fees to Fund source |
| Transaction Refund/Provisional Credit Snooze Fee Payment Cash Out | 404008 | 145023 | Income from ChargeOff Fees to Fund source |
| Transaction Refund/Provisional Credit Principal Payment Cash Out | 744007/740037 | 145023 | ChargeOff Expense/Charge Off Fraud Expense to Fund source |
| Transaction Refund/Provisional Credit Unallocated Credit (UNC) Cash Out | 245000 | 145023 | Over payment liability to Fund source |

### Good will no cash entries

Good will no cash entries record goodwill adjustments without moving cash. Each entry debits an income or expense account and credits a receivable or liability account.

| Entry | Debit account | Credit account | Status | Mapping |
| --- | --- | --- | --- | --- |
| Good Will Interest - Repayment No Cash | 404001 | 112603 | TBD | Income from Goodwill Credit Interest to Interest Receivable |
| Good Will Late Fee Payment No Cash | 404008 | 112603 | pass | Income from Goodwill Credit Penalty to Penalties Receivable |
| Good Will NSF Fee Payment No Cash | 404008 | 112603 | pass | Income from Goodwill Credit Fees to Fees Receivable |
| Good Will Snooze Fee Payment No Cash | 404008 | 112603 | pass | Income from Goodwill Credit Fees to Fees Receivable |
| Good Will Principal Payment No Cash | 744003 | 112601 | pass | Expense from Goodwill Credit to Loan portfolio |
| Good Will Unallocated Credit (UNC) No Cash | 744003 | 245000 | pass | Expense from Goodwill Credit to Over payment liability |

### Good will no cash entries charge-off

Good will no cash entries apply when a repayment uses the Y flag and no cash moves. Each entry debits one goodwill account and credits account 744008, mapping income or expense from goodwill credit to income from recovery repayment. All entries have a status of in development.

| Entry type | Debit account | Credit account | Mapping |
| --- | --- | --- | --- |
| Good Will Interest - Repayment No Cash entry | 404001 | 744008 | Income from Goodwill Credit Interest to Income from Recovery Repayment |
| Good Will Late Fee Payment No Cash entry | 404008 | 744008 | Income from Goodwill Credit Penalty to Income from Recovery Repayment |
| Good Will NSF Fee Payment No Cash entry | 404008 | 744008 | Income from Goodwill Credit Fees to Income from Recovery Repayment |
| Good Will Snooze Fee Payment No Cash entry | 404008 | 744008 | Income from Goodwill Credit Fees to Income from Recovery Repayment |
| Good Will Principal Payment No Cash entry | 744003 | 744008 | Expense from Goodwill Credit to Income from Recovery Repayment |

### Late fee waiver no cash entries

A Late Fee Waiver Late Fee Payment No Cash entry records the accounting movement for waived late fees without creating cash entries. The debit and credit accounts depend on the flag combination applied to the entry.

| Flags | Debit account | Credit account | Mapping |
| --- | --- | --- | --- |
| None | 404007 | 112603 | Income from Penalties to Penalties Receivable |
| Y | 404007 | 404008 | Income from Penalties to Income from ChargeOff Penalty |
| Y | 112603 | 404007 | Penalties Receivable to Income from Penalties |
| Y Y | 404008 | 404007 | Income from ChargeOff Penalty to Income from Penalties |

### NSF fee waiver no cash entries

| Flags | Debit account | Credit account | Mapping |
| --- | --- | --- | --- |
| No Y flag | 404007 | 112603 | Income from Fees to Fees Receivable |
| Y flag | 112603 | 404007 | Fees Receivable to Income from Fees |
| Y Y flags | 404008 | 404007 | Income from ChargeOff Fees to Income from Fees |

### Auto payment cash in

Auto payment cash in entries debit account 145023 and credit the receivable or liability account that matches the payment type, with status pass and the fund source mapped to the corresponding account. Each entry type uses a different credit account.

| Entry type | Debit account | Credit account | Fund source mapping |
| --- | --- | --- | --- |
| Auto Payment Interest | 145023 | 112603 | Interest Receivable |
| Auto Payment Late Fee Payment | 145023 | 112603 | Penalties Receivable |
| Auto Payment NSF Fee Payment | 145023 | 112603 | Fees Receivable |
| Auto Payment Snooze Fee Payment | 145023 | 112603 | Fees Receivable |
| Auto Payment Principal Payment | 145023 | 112601 | Loan portfolio |
| Auto Payment Unallocated Credit (UNC) | 145023 | 245000 | Over payment liability |

### Auto payment cash in charge-off

Auto payment cash-in entries with the Y flag debit account 145023 and credit either account 744008 or account 245000, depending on the payment type, with both accounts in development status.

| Entry type | Debit account | Credit account | Fund source mapping |
| --- | --- | --- | --- |
| Auto Payment Interest | 145023 | 744008 | Income from Recovery Repayment |
| Auto Payment Late Fee Payment | 145023 | 744008 | Income from Recovery Repayment |
| Auto Payment NSF Fee Payment | 145023 | 744008 | Income from Recovery Repayment |
| Auto Payment Snooze Fee Payment | 145023 | 744008 | Income from Recovery Repayment |
| Auto Payment Principal Payment | 145023 | 744008 | Income from Recovery Repayment |
| Auto Payment Unallocated Credit (UNC) | 145023 | 245000 | Over payment liability |

### Auto payment cash out

| Entry | Debit account | Credit account | Status | Mapping |
| --- | --- | --- | --- | --- |
| Auto Payment Interest - Repayment Cash Out | 112603 | 145023 | pass | Interest Receivable to Fund source |
| Auto Payment Late Fee Payment Cash Out | 112603 | 145023 | pass | Penalties Receivable to Fund source |
| Auto Payment NSF Fee Payment Cash Out | 112603 | 145023 | pass | Fees Receivable to Fund source |
| Auto Payment Snooze Fee Payment Cash in | 112603 | 145023 | pass | Fees Receivable to Fund source |
| Auto Payment Principal Payment Cash Out | 112601 | 145023 | pass | Loan portfolio to Fund source |
| Auto Payment Unallocated Credit (UNC) Cash Out | 245000 | 145023 | pass | Over payment liability to Fund source |

### Auto payment cash out charge-off

Auto payment cash out charge-off creates accounting entries for interest, late fees, NSF fees, principal, and unallocated credit. Each entry uses Y Y flags and maps its income or liability to the fund source.

| Entry | Debit account | Credit account | Mapping |
| --- | --- | --- | --- |
| Auto Payment Interest - Repayment Cash Out | 744008 | 145023 | Income from Recovery Repayment to Fund source |
| Auto Payment Late Fee Payment Cash Out | 744008 | 145023 | Income from Recovery Repayment to Fund source |
| Auto Payment NSF Fee Payment Cash Out | 744008 | 145023 | Income from Recovery Repayment to Fund source |
| Auto Payment Snooze Fee Payment Cash In | 744008 | 145023 | Income from Recovery Repayment to Fund source |
| Auto Payment Principal Payment Cash Out | 744008 | 145023 | Income from Recovery Repayment to Fund source |
| Auto Payment Unallocated Credit (UNC) Cash Out | 245000 | 145023 | Over payment liability to Fund source |

### Scheduled payment cash in

Scheduled payment cash in entries debit account 145023 and credit a receivable, liability, or loan portfolio account depending on the payment type, with status pass and the fund source mapped to the corresponding receivable category.

| Payment type | Debit account | Credit account | Fund source mapping |
| --- | --- | --- | --- |
| Interest | 145023 | 112603 | Interest Receivable |
| Late fee | 145023 | 112603 | Penalties Receivable |
| NSF fee | 145023 | 112603 | Fees Receivable |
| Snooze fee | 145023 | 112603 | Fees Receivable |
| Principal | 145023 | 112601 | Loan portfolio |
| Unallocated credit | 145023 | 245000 | Over payment liability |

### Scheduled payment cash in charge-off

A scheduled payment cash-in entry with the Y flag debits account 145023 and credits an account that depends on the payment type, with the entry status set to in development.

| Payment type | Credit account | Fund source mapping |
| --- | --- | --- |
| Interest | 744008 | Income from Recovery Repayment |
| Late fee payment | 744008 | Income from Recovery Repayment |
| NSF fee payment | 744008 | Income from Recovery Repayment |
| Snooze fee payment | 744008 | Income from Recovery Repayment |
| Principal payment | 744008 | Income from Recovery Repayment |
| Unallocated credit | 245000 | Over payment liability |

### Worked examples

Situation: a loan is disbursed in cash. Setup: principal of 1,000.00. The Loan Disbursement Principal Cash Out entry debits Loans Receivable account 112601 and credits Suspense/Clearing account 145023 for 1,000.00, with status pass and mapping Loan portfolio to Fund source. The figures are illustrative. This entry creates the loan asset and the clearing balance before any repayment.

| Entry | Debit account | Credit account | Amount | Status | Mapping |
| --- | --- | --- | --- | --- | --- |
| Loan disbursement principal cash out | 112601 | 145023 | 1,000.00 | Pass | Loan portfolio → Fund source |

Situation: a borrower repays principal in three equal monthly installments. Setup: opening principal of 1,000.00 and installment of 250.00. Each Principal Payment Cash in entry debits Suspense/Clearing account 145023 and credits Loans Receivable account 112601 for 250.00, with status pass and mapping Fund source to Loan portfolio. The loan balance falls by the principal paid in each row. With a Y flag the credit would post to ChargeOff Expense/Charge Off Fraud Expense instead of the loan portfolio, while the debit and amount stay unchanged.

| Installment | Debit account | Credit account | Amount | Balance after |
| --- | --- | --- | --- | --- |
| 1 | 145023 | 112601 | 250.00 | 750.00 |
| 2 | 145023 | 112601 | 250.00 | 500.00 |
| 3 | 145023 | 112601 | 250.00 | 250.00 |
| Total |  |  | 750.00 |  |

Situation: an unallocated credit is received in cash. Setup: amount of 100.00. The Unallocated Credit Cash in entry debits Suspense/Clearing account 145023 and credits Other Credit liability account 245000 for 100.00, with status pass and mapping Fund source to Over payment liability. No loan balance is affected. With a Y flag the credit remains 245000 but the status moves to in development, so the liability still grows while the entry is not yet verified.

| Entry | Debit account | Credit account | Amount | Status | Mapping |
| --- | --- | --- | --- | --- | --- |
| UNC cash in | 145023 | 245000 | 100.00 | Pass | Fund source → Over payment liability |

Situation: a charge-off fraud interest portion is recovered in cash. Setup: recovery amount of 50.00. The Interest - Repayment Cash in entry with Y flag debits Suspense/Clearing account 145023 and credits Interest income charge off account 404001 for 50.00, with status in development and mapping Fund source to Income from ChargeOff Interest. This maps the recovered interest to charge-off income rather than to a receivable.

| Entry | Debit account | Credit account | Amount | Status | Mapping |
| --- | --- | --- | --- | --- | --- |
| Charge-off interest cash in (Y flag) | 145023 | 404001 | 50.00 | In development | Fund source → Income from ChargeOff Interest |
