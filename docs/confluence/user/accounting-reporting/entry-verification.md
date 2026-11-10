# Accounting Entry Verification

## Accounting Entry Verification

### Charge-off and charge adjustment mappings

Charge-off and charge adjustment mappings determine which accounts receive debits and credits when non-fraud fees or penalties are charged off or adjusted.

| Mapping | Debit account | Credit account | Income accounts |
| --- | --- | --- | --- |
| Charge off Non Fraud Fees portion | Fee Charge off | Fee Receivable | charge-off fees Income |
| Charge off Non Fraud Penalty portion | Fee Charge off | Penalty Receivable | charge-off Penalty Income |
| charge adjustment Fees portion | Fee Income | Other Credit liability | income from fees and charge-off fees Income |
| charge adjustment Penalty portion | Fee Income | Fee Charge off | income from penalties and charge-off Penalty Income |

### OCA repayment mappings

OCA repayment mappings determine how the system posts fees, unallocated credit and penalty portions during repayment verification.

| OCA repayment portion | Debit account | Credit account | Fund source | Income account |
| --- | --- | --- | --- | --- |
| Fees | Other receivables | recoveries | /advance accounting | Income from Recovery payment |
| Unallocated Credit (UNC) | Other receivables | Other Credit liability | /advance accounting | Overpayment Liability |
| Penalty | Other receivables | recoveries | /advance accounting | Income from Recovery payment |

A loan disbursement with Principal allocation type and Cash Out status debits account 112601 and credits account 145023.

### Transaction Refund/Provisional Credit Cash in entries

Transaction Refund/Provisional Credit Cash in entries post according to the repayment allocation type.

| Allocation type | Debit account | Credit account |
| --- | --- | --- |
| Interest | 145023 | 112603 |
| Late Fee Payment | 145023 | 112603 |
| NSF Fee Payment | 145023 | 112603 |
| Snooze Fee Payment | 145023 | 112603 |
| Principal Payment | 145023 | 112601 |
| Unallocated Credit (UNC) | 145023 | 245000 |

### Transaction Refund/Provisional Credit Cash in reversal entries

A Transaction Refund/Provisional Credit Cash in reversal entry debits account 145023 and credits an account based on the repayment allocation type. This applies when the reversal indicator is Y.

| Allocation type | Credit account |
| --- | --- |
| Transaction Refund/Provisional Credit with Interest | 404001 |
| Transaction Refund/Provisional Credit with Late Fee Payment | 404008 |
| Transaction Refund/Provisional Credit with NSF Fee Payment | 404008 |
| Transaction Refund/Provisional Credit with Snooze Fee Payment | 404008 |
| Transaction Refund/Provisional Credit with Principal Payment | 744007/740037 |
| Transaction Refund/Provisional Credit with Unallocated Credit (UNC) | 245000 |

### Transaction Refund/Provisional Credit Cash Out reversal entries

Transaction Refund/Provisional Credit Cash Out reversal entries apply when the reversal indicator is Y and the status is Cash Out. The debit account depends on the repayment allocation type, while the credit account is always 145023.

| Repayment allocation type | Debit account | Credit account |
| --- | --- | --- |
| Interest | 112603 | 145023 |
| Late Fee Payment | 112603 | 145023 |
| NSF Fee Payment | 112603 | 145023 |
| Snooze Fee Payment | 112603 | 145023 |
| Principal Payment | 112601 | 145023 |
| Unallocated Credit (UNC) | 245000 | 145023 |

### Transaction Refund/Provisional Credit Cash Out charged-off entries

A Transaction Refund/Provisional Credit Cash Out reversal on a charged-off account posts to the accounts shown below, depending on the repayment allocation type. The credit account is always 145023.

| Allocation type | Debit account | Credit account |
| --- | --- | --- |
| Transaction Refund/Provisional Credit with Interest | 404001 | 145023 |
| Late Fee Payment | 404008 | 145023 |
| NSF Fee Payment | 404008 | 145023 |
| Snooze Fee Payment | 404008 | 145023 |
| Principal Payment | 744007/740037 | 145023 |
| Unallocated Credit (UNC) | 245000 | 145023 |

### Good Will No Cash entries

Good Will No Cash entries record goodwill adjustments without moving cash. The debit and credit accounts depend on the repayment allocation type.

| Allocation type | Debit account | Credit account |
| --- | --- | --- |
| Good Will with Interest | 404001 | 112603 |
| Good Will with Late Fee Payment | 744003 | 112603 |
| Good Will with NSF Fee Payment | 744003 | 112603 |
| Good Will with Snooze Fee Payment | 744003 | 112603 |
| Good Will with Principal Payment | 744003 | 112601 |
| Good Will with Unallocated Credit (UNC) | 744003 | 245000 |

### Good Will No Cash charged-off entries

| Allocation type | Debit account | Credit account |
| --- | --- | --- |
| Good Will with Interest | 404001 | 744008 |
| Good Will with Late Fee Payment | 744003 | 744008 |
| Good Will with NSF Fee Payment | 744003 | 744008 |
| Good Will with Snooze Fee Payment | 744003 | 744008 |

### Late Fee Waiver entries

A Late Fee Waiver entry with Late Fee Payment allocation type and No Cash status debits account 404007 and credits account 112603.

When the Reversal Indicator is Y, the entry posts as follows:

- With Late Fee Payment allocation type, No Cash status, and Reversal Indicator Y, the entry debits account 404007 and credits account 404008.
- With Late Fee Payment allocation type, No Cash status, Reversal Indicator Y, and Charged off Flag Y, the entry debits account 404008 and credits account 404007.

### NSF Fee Waiver entries

An NSF Fee Waiver entry with NSF Fee Payment allocation type and No Cash status debits account 404007 and credits account 112603.

When Reversal Indicator Y applies, the entry depends on the charged off flag:

- With Charged off Flag Y, the entry debits account 112603 and credits account 404007.
- Without Charged off Flag Y, the entry debits account 404007 and credits account 404008.

### Auto Payment Cash in charged-off entries

Auto Payment Cash in charged-off entries apply when an auto payment is received on a charged-off loan. The debit and credit accounts depend on the repayment allocation type. All allocation types debit account 145023; most credit account 744008, while Unallocated Credit credits account 245000.

| Allocation type | Debit account | Credit account |
| --- | --- | --- |
| Interest | 145023 | 744008 |
| Late Fee Payment | 145023 | 744008 |
| NSF Fee Payment | 145023 | 744008 |
| Snooze Fee Payment | 145023 | 744008 |
| Principal Payment | 145023 | 744008 |
| Unallocated Credit (UNC) | 145023 | 245000 |

### Auto Payment Cash Out reversal entries

Auto Payment Cash Out reversal entries apply when an Auto Payment reversal has Cash Out status. The debit and credit accounts depend on the repayment allocation type. The system credits account 145023 for every reversal entry listed here. The debit account is 112603 for interest, late fee, NSF fee and snooze fee allocations, 112601 for principal allocations, and 245000 for unallocated credit allocations.

| Allocation type | Status | Reversal indicator | Debit account | Credit account |
| --- | --- | --- | --- | --- |
| Interest | Cash Out | Y | 112603 | 145023 |
| Late Fee Payment | Cash Out | Y | 112603 | 145023 |
| NSF Fee Payment | Cash Out | Y | 112603 | 145023 |
| Snooze Fee Payment | Cash in | Y | 112603 | 145023 |
| Principal Payment | Cash Out | Y | 112601 | 145023 |
| Unallocated Credit (UNC) | Cash Out | Y | 245000 | 145023 |

### Auto Payment Cash Out charged-off reversal entries

Auto Payment Cash Out charged-off reversal entries apply when an Auto Payment has Cash Out status, reversal indicator Y, and charged off flag Y. The debit and credit accounts depend on the repayment allocation type.

| Allocation type | Debit account | Credit account |
| --- | --- | --- |
| Interest | 744008 | 145023 |
| Late Fee Payment | 744008 | 145023 |
| NSF Fee Payment | 744008 | 145023 |
| Principal Payment | 744008 | 145023 |
| Unallocated Credit (UNC) | 245000 | 145023 |

Snooze Fee Payment entries use Cash in status rather than Cash Out status.

### Scheduled Payment Cash in entries

Scheduled Payment Cash in entries record the accounting effect when a scheduled payment is received, with the debit and credit accounts depending on the allocation type.

| Allocation type | Debit account | Credit account |
| --- | --- | --- |
| Interest | 145023 | 112603 |
| Late Fee Payment | 145023 | 112603 |
| NSF Fee Payment | 145023 | 112603 |
| Snooze Fee Payment | 145023 | 112603 |
| Principal Payment | 145023 | 112601 |
| Unallocated Credit (UNC) | 145023 | 245000 |

### Scheduled Payment Cash in charged-off entries

| Allocation type | Debit account | Credit account |
| --- | --- | --- |
| Interest | 145023 | 744008 |
| Late Fee Payment | 145023 | 744008 |
| NSF Fee Payment | 145023 | 744008 |
| Snooze Fee Payment | 145023 | 744008 |
| Principal Payment | 145023 | 744008 |
| Unallocated Credit (UNC) | 145023 | 245000 |

### Scheduled Payment Cash Out reversal entries

Scheduled Payment Cash Out reversal entries apply when a scheduled payment has Cash Out status and Reversal Indicator Y. The debit account depends on the allocation type, while the credit account stays the same.

| Allocation type | Debit account | Credit account |
| --- | --- | --- |
| Interest - Repayment | 112603 | 145023 |
| Late Fee Payment | 112603 | 145023 |
| NSF Fee Payment | 112603 | 145023 |
| Snooze Fee Payment | 112603 | 145023 |
| Principal Payment | 112601 | 145023 |
| Unallocated Credit (UNC) | 245000 | 145023 |

Apply Fee Return with Late Fee Payment allocation type and No Cash status has no accounting entries, whether or not Reversal Indicator Y is set.

A Loan Disbursement Principal Cash Out entry debits account 112601 and credits account 145023 with status pass, mapping Loan portfolio to Fund source.

### Verified Transaction Refund/Provisional Credit Cash in entries

A Verified Transaction Refund/Provisional Credit Cash in entry posts to account 145023 as a debit and credits the receiving account with status pass, mapping the fund source to the relevant receivable, liability, or loan portfolio account.

| Entry type | Debit account | Credit account | Status | Fund source mapping |
| --- | --- | --- | --- | --- |
| Interest - Repayment Cash in | 145023 | 112603 | pass | Interest Receivable |
| Late Fee Payment Cash in | 145023 | 112603 | pass | Penalties Receivable |
| NSF Fee Payment Cash in | 145023 | 112603 | pass | Fees Receivable |
| Snooze Fee Payment Cash in | 145023 | 112603 | pass | Fees Receivable |
| Principal Payment Cash in | 145023 | 112601 | pass | Loan portfolio |
| Unallocated Credit (UNC) Cash in | 145023 | 245000 | pass | Over payment liability |

### Verified Transaction Refund/Provisional Credit Cash in reversal entries

A Transaction Refund/Provisional Credit Cash in entry with the Y flag debits account 145023 and credits an income or expense account based on the payment type, with the Fund source mapped to the corresponding charge-off income or expense account.

| Entry type | Debit account | Credit account | Fund source mapping |
| --- | --- | --- | --- |
| Interest - Repayment | 145023 | 404001 | Income from ChargeOff Interest |
| Late Fee Payment | 145023 | 404008 | Income from ChargeOff Penalty |
| NSF Fee Payment | 145023 | 404008 | Income from ChargeOff Fees |
| Snooze Fee Payment | 145023 | 404008 | Income from ChargeOff Fees |
| Principal Payment | 145023 | 744007/740037 | ChargeOff Expense/Charge Off Fraud Expense |
| Unallocated Credit (UNC) | 145023 | 245000 | Over payment liability |

### Verified Transaction Refund/Provisional Credit Cash Out reversal entries

A Verified Transaction Refund/Provisional Credit Cash Out entry reverses a cash-out payment by debiting a cash account and crediting the fund source account. The entry applies when the Y flag is set and carries a pass status.

| Entry type | Debit account | Credit account | Status | Mapping |
| --- | --- | --- | --- | --- |
| Interest repayment | 112603 | 145023 | pass | Interest Receivable to Fund source |
| Late fee payment | 112603 | 145023 | pass | Penalties Receivable to Fund source |
| NSF fee payment | 112603 | 145023 | pass | Fees Receivable to Fund source |
| Snooze fee payment | 112603 | 145023 | pass | Fees Receivable to Fund source |
| Principal payment | 112601 | 145023 | pass | Loan portfolio to Fund source |
| Unallocated credit | 245000 | 145023 | pass | Over payment liability to Fund source |

### Verified Transaction Refund/Provisional Credit Cash Out charged-off reversal entries

Verified Transaction Refund/Provisional Credit Cash Out charged-off reversal entries post with Y Y flags and credit account 145023 while debiting the account mapped to the payment type. Each entry has a status of in development.

| Entry | Debit account | Credit account | Mapping |
| --- | --- | --- | --- |
| Transaction Refund/Provisional Credit Interest - Repayment Cash Out | 404001 | 145023 | Income from ChargeOff Interest to Fund source |
| Transaction Refund/Provisional Credit Late Fee Payment Cash Out | 404008 | 145023 | Income from ChargeOff Penalty to Fund source |
| Transaction Refund/Provisional Credit NSF Fee Payment Cash Out | 404008 | 145023 | Income from ChargeOff Fees to Fund source |
| Transaction Refund/Provisional Credit Snooze Fee Payment Cash Out | 404008 | 145023 | Income from ChargeOff Fees to Fund source |
| Transaction Refund/Provisional Credit Principal Payment Cash Out | 744007/740037 | 145023 | ChargeOff Expense/Charge Off Fraud Expense to Fund source |
| Transaction Refund/Provisional Credit Unallocated Credit (UNC) Cash Out | 245000 | 145023 | Over payment liability to Fund source |

### Verified Good Will No Cash entries

Verified Good Will No Cash entries record goodwill credit adjustments without moving cash, mapping income or expense to receivable or loan portfolio accounts.

| Entry | Debit account | Credit account | Status | Mapping |
| --- | --- | --- | --- | --- |
| Good Will Interest - Repayment No Cash | 404001 | 112603 | TBD | Income from Goodwill Credit Interest to Interest Receivable |
| Good Will Late Fee Payment No Cash | 404008 | 112603 | pass | Income from Goodwill Credit Penalty to Penalties Receivable |
| Good Will NSF Fee Payment No Cash | 404008 | 112603 | pass | Income from Goodwill Credit Fees to Fees Receivable |
| Good Will Snooze Fee Payment No Cash | 404008 | 112603 | pass | Income from Goodwill Credit Fees to Fees Receivable |
| Good Will Principal Payment No Cash | 744003 | 112601 | pass | Expense from Goodwill Credit to Loan portfolio |
| Good Will Unallocated Credit (UNC) No Cash | 744003 | 245000 | pass | Expense from Goodwill Credit to Over payment liability |

### Verified Good Will No Cash charged-off entries

A Verified Good Will No Cash charged-off entry applies when a goodwill repayment entry carries the Y flag and the underlying account is charged off. It debits one goodwill income or expense account and credits account 744008, mapping the goodwill income or expense to Income from Recovery Repayment.

| Entry type | Debit account | Credit account | Mapping |
| --- | --- | --- | --- |
| Good Will Interest - Repayment No Cash | 404001 | 744008 | Income from Goodwill Credit Interest to Income from Recovery Repayment |
| Good Will Late Fee Payment No Cash | 404008 | 744008 | Income from Goodwill Credit Penalty to Income from Recovery Repayment |
| Good Will NSF Fee Payment No Cash | 404008 | 744008 | Income from Goodwill Credit Fees to Income from Recovery Repayment |
| Good Will Snooze Fee Payment No Cash | 404008 | 744008 | Income from Goodwill Credit Fees to Income from Recovery Repayment |
| Good Will Principal Payment No Cash | 744003 | 744008 | Expense from Goodwill Credit to Income from Recovery Repayment |

### Verified Late Fee Waiver entries

A Verified Late Fee Waiver entry records a late fee waiver without cash movement and uses one of four account mappings depending on the flag combination.

| Flags | Debit account | Credit account | Mapping |
| --- | --- | --- | --- |
| None | 404007 | 112603 | Income from Penalties to Penalties Receivable |
| Y | 404007 | 404008 | Income from Penalties to Income from ChargeOff Penalty |
| Y | 112603 | 404007 | Penalties Receivable to Income from Penalties |
| Y Y | 404008 | 404007 | Income from ChargeOff Penalty to Income from Penalties |

### Verified NSF Fee Waiver entries

A Verified NSF Fee Waiver entry records an NSF Fee Payment No Cash transaction with one of four flag combinations, each mapping fee income to a different receivable or income account.

| Flags | Debit account | Credit account | Mapping |
| --- | --- | --- | --- |
| No flag | 404007 | 112603 | Income from Fees to Fees Receivable |
| Y flag | 404007 | 404008 | Income from Fees to Income from ChargeOff Fees |
| Y flag | 112603 | 404007 | Fees Receivable to Income from Fees |
| Y Y flags | 404008 | 404007 | Income from ChargeOff Fees to Income from Fees |

### Verified Auto Payment Cash in entries

A verified Auto Payment Cash in entry records the accounting mapping for each payment component when the entry passes verification.

| Payment component | Debit account | Credit account | Status | Fund source mapping |
| --- | --- | --- | --- | --- |
| Interest | 145023 | 112603 | pass | Interest Receivable |
| Late fee payment | 145023 | 112603 | pass | Penalties Receivable |
| NSF fee payment | 145023 | 112603 | pass | Fees Receivable |
| Snooze fee payment | 145023 | 112603 | pass | Fees Receivable |
| Principal payment | 145023 | 112601 | pass | Loan portfolio |
| Unallocated credit (UNC) | 145023 | 245000 | pass | Over payment liability |

### Verified Auto Payment Cash in charged-off entries

A verified Auto Payment Cash in charged-off entry uses the Y flag and maps the fund source to income or liability accounts.

| Entry type | Debit account | Credit account | Fund source mapping | Status |
| --- | --- | --- | --- | --- |
| Auto Payment Interest - Repayment Cash in | 145023 | 744008 | Income from Recovery Repayment | in development |
| Auto Payment Late Fee Payment Cash in | 145023 | 744008 | Income from Recovery Repayment | in development |
| Auto Payment NSF Fee Payment Cash in | 145023 | 744008 | Income from Recovery Repayment | in development |
| Auto Payment Snooze Fee Payment Cash in | 145023 | 744008 | Income from Recovery Repayment | in development |
| Auto Payment Principal Payment Cash in | 145023 | 744008 | Income from Recovery Repayment | in development |
| Auto Payment Unallocated Credit (UNC) Cash in | 145023 | 245000 | Over payment liability | in development |

### Verified Auto Payment Cash Out reversal entries

Verified Auto Payment Cash Out reversal entries apply to Auto Payment entries marked with a Y flag and use status pass.

| Entry type | Debit account | Credit account | Mapping |
| --- | --- | --- | --- |
| Auto Payment Interest - Repayment Cash Out | 112603 | 145023 | Interest Receivable to Fund source |
| Auto Payment Late Fee Payment Cash Out | 112603 | 145023 | Penalties Receivable to Fund source |
| Auto Payment NSF Fee Payment Cash Out | 112603 | 145023 | Fees Receivable to Fund source |
| Auto Payment Snooze Fee Payment Cash in | 112603 | 145023 | Fees Receivable to Fund source |
| Auto Payment Principal Payment Cash Out | 112601 | 145023 | Loan portfolio to Fund source |
| Auto Payment Unallocated Credit (UNC) Cash Out | 245000 | 145023 | Over payment liability to Fund source |

### Verified Auto Payment Cash Out charged-off reversal entries

| Entry | Debit account | Credit account | Mapping |
| --- | --- | --- | --- |
| Auto Payment Interest - Repayment Cash Out | 744008 | 145023 | Income from Recovery Repayment to Fund source |
| Auto Payment Late Fee Payment Cash Out | 744008 | 145023 | Income from Recovery Repayment to Fund source |
| Auto Payment NSF Fee Payment Cash Out | 744008 | 145023 | Income from Recovery Repayment to Fund source |
| Auto Payment Snooze Fee Payment Cash in | 744008 | 145023 | Income from Recovery Repayment to Fund source |
| Auto Payment Principal Payment Cash Out | 744008 | 145023 | Income from Recovery Repayment to Fund source |
| Auto Payment Unallocated Credit (UNC) Cash Out | 245000 | 145023 | Over payment liability to Fund source |

### Verified Scheduled Payment Cash in entries

A verified Scheduled Payment Cash in entry records the accounting mapping for each repayment component when the payment status is pass.

| Entry type | Debit account | Credit account | Status | Fund source mapping |
| --- | --- | --- | --- | --- |
| Scheduled Payment Interest - Repayment Cash in | 145023 | 112603 | pass | Interest Receivable |
| Scheduled Payment Late Fee Payment Cash in | 145023 | 112603 | pass | Penalties Receivable |
| Scheduled Payment NSF Fee Payment Cash in | 145023 | 112603 | pass | Fees Receivable |
| Scheduled Payment Snooze Fee Payment Cash in | 145023 | 112603 | pass | Fees Receivable |
| Scheduled Payment Principal Payment Cash in | 145023 | 112601 | pass | Loan portfolio |
| Scheduled Payment Unallocated Credit (UNC) Cash in | 145023 | 245000 | pass | Over payment liability |

### Verified Scheduled Payment Cash in charged-off entries

A Verified Scheduled Payment Cash in charged-off entry posts to the recovery repayment account when the Y flag is set.

| Entry type | Debit account | Credit account | Fund source mapping |
| --- | --- | --- | --- |
| Scheduled Payment Interest - Repayment Cash in | 145023 | 744008 | Income from Recovery Repayment |
| Scheduled Payment Late Fee Payment Cash in | 145023 | 744008 | Income from Recovery Repayment |
| Scheduled Payment NSF Fee Payment Cash in | 145023 | 744008 | Income from Recovery Repayment |
| Scheduled Payment Snooze Fee Payment Cash in | 145023 | 744008 | Income from Recovery Repayment |
| Scheduled Payment Principal Payment Cash in | 145023 | 744008 | Income from Recovery Repayment |

A Verified Scheduled Payment Unallocated Credit Cash in entry debits account 145023 and credits account 245000, mapping the Fund source to Over payment liability.

### Worked examples

A fraudulent loan with a principal of 1,000 has overdue amounts of 100.00 interest, 50.00 fees, and 30.00 penalties. An operations user verifies the charge-off entries before posting them. The figures are illustrative. The example shows how interest, fees, and penalties split into different debit and credit accounts during a fraud charge-off.

| Portion | Debit account | Credit account | Amount |
| --- | --- | --- | --- |
| Fraud interest | Interest income charge off | Interest Receivable | 100.00 |
| Fraud fees | Fee Charge off | Fee Receivable | 50.00 |
| Fraud penalty | Fee Charge off | Penalty Receivable | 30.00 |
| Total |  |  | 180.00 |

A non-fraud loan with a principal of 1,000 carries 40.00 in overdue fees and 20.00 in overdue penalties. A product administrator verifies the charge-off entries for both portions. The fee portion credits Fee Receivable while the penalty portion credits Penalty Receivable.

| Portion | Debit account | Credit account | Amount |
| --- | --- | --- | --- |
| Non-fraud fees | Fee Charge off | Fee Receivable | 40.00 |
| Non-fraud penalty | Fee Charge off | Penalty Receivable | 20.00 |
| Total |  |  | 60.00 |

A recovered payment of 80.00 includes 60.00 in fees and 20.00 in penalties. An operations user posts the OCA repayment entries and checks the debit and credit accounts. Both portions debit Other receivables and credit recoveries, so changing the portion type does not change the accounts.

| Portion | Debit account | Credit account | Amount |
| --- | --- | --- | --- |
| OCA fees | Other receivables | recoveries | 60.00 |
| OCA penalty | Other receivables | recoveries | 20.00 |
| Total |  |  | 80.00 |

A loan disbursement of 1,000 uses the Principal allocation type and Cash Out status. A loan officer verifies that the entry debits Loans Receivable and credits the Suspense/Clearing account. The entry moves the disbursed principal from the clearing account to the loan portfolio.

| Step | Debit account | Credit account | Amount |
| --- | --- | --- | --- |
| Disburse principal | Loans Receivable (112601) | Suspense/Clearing (145023) | 1,000.00 |
