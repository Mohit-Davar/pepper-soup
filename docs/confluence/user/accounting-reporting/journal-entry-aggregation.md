# Journal Entry Aggregation

## Journal Entry Aggregation

### Job execution and report readiness

Before a journal entry aggregation job runs, reports that read aggregated tables require a null check because those tables contain no data yet.

### Undo Charge Adjustment Transaction postings

| Debit GL code | Credit GL code |
| --- | --- |
| 112601 Loans Receivable Principal | 404007 Fee Income / Penalty Income |
| 245000 Other Credit liability | 404007 Fee Income / Penalty Income |
| 112603 Fee Receivable | 404007 Fee Income / Penalty Income |

### Refund and Provisional Credit postings

Refund and Provisional Credit postings record cash-out transactions against specific accounts and credit the same suspense account. The debit account depends on the transaction type and the number of Y flags.

| Transaction type | Cash-out flags | Debit account | Credit account |
| --- | --- | --- | --- |
| Principal Payment | Y | 112601 | 145023 |
| Unallocated Credit (UNC) | Y | 245000 | 145023 |
| Late Fee Payment | Y Y | 404008 | 145023 |
| NSF Fee Payment | Y Y | 404008 | 145023 |
| Snooze Fee Payment | Y Y | 404008 | 145023 |
| Principal Payment | Y Y | 744007/740037 | 145023 |
| Unallocated Credit (UNC) | Y Y | 245000 | 145023 |

### Good Will postings

Good Will postings record fee and principal adjustments without moving cash. The debit account depends on the charge type, while the credit account depends on whether the posting includes the Y indicator.

| Posting type | Debit account | Credit account |
| --- | --- | --- |
| Good Will Late Fee Payment No Cash | 744003 | 112603 |
| Good Will NSF Fee Payment No Cash | 744003 | 112603 |
| Good Will Snooze Fee Payment No Cash | 744003 | 112603 |
| Good Will Principal Payment No Cash | 744003 | 112601 |
| Good Will Unallocated Credit (UNC) No Cash | 744003 | 245000 |
| Good Will Late Fee Payment No Cash with Y | 744003 | 744008 |
| Good Will NSF Fee Payment No Cash with Y | 744003 | 744008 |
| Good Will Snooze Fee Payment No Cash with Y | 744003 | 744008 |

### Late Fee Waiver postings

| Posting type | Debit account | Credit account | Reference |
| --- | --- | --- | --- |
| Late Fee Waiver Late Fee Payment No Cash | 404007 | 112603 | R61 |
| Late Fee Waiver Late Fee Payment No Cash with Y | 404007 | 404008 | R68 |
| Late Fee Waiver Late Fee Payment No Cash with Y Y | 404008 | 404007 | R82 |

### NSF Fee Waiver postings

| Condition | Debit account | Credit account | Reference |
| --- | --- | --- | --- |
| NSF Fee Waiver NSF Fee Payment No Cash | 404007 | 112603 | R89 |
| NSF Fee Waiver NSF Fee Payment No Cash with Y | 404007 | 404008 | R96 |
| NSF Fee Waiver NSF Fee payment No Cash with Y | 112603 | 404007 | R103 |
| NSF Fee Waiver NSF Fee payment No Cash with Y Y | 404008 | 404007 | R110 |

### Auto Payment postings

| Auto Payment posting | GL accounts |
| --- | --- |
| Auto Payment Late Fee Payment Cash in | 145023 and 744008 |
| Auto Payment NSF Fee Payment Cash in | 145023 and 744008 |
| Auto Payment Snooze Fee Payment Cash in | 145023 and 744008 |
| Auto Payment Principal Payment Cash in | 145023 and 744008 |
| Auto Payment Unallocated Credit (UNC) Cash in | 145023 and 245000 |
| Auto Payment Late Fee Payment Cash Out | 112603 and 145023 |
| Auto Payment NSF Fee Payment Cash Out | 112603 and 145023 |
| Auto Payment Snooze Fee Payment Cash in | 112603 and 145023 |
| Auto Payment Principal Payment Cash Out | 112601 and 145023 |
| Auto Payment Unallocated Credit (UNC) Cash Out | 245000 and 145023 |

### Scheduled Payment postings

Scheduled Payment postings record cash movements for principal, late fees, NSF fees, snooze fees and unallocated credit using fixed general ledger account pairs.

| Scheduled Payment type | Direction | GL accounts |
| --- | --- | --- |
| Late Fee Payment | Cash in | 145023 and 112603 |
| NSF Fee Payment | Cash in | 145023 and 112603 |
| Snooze Fee Payment | Cash in | 145023 and 112603 |
| Principal Payment | Cash in | 145023 and 112601 |
| Unallocated Credit (UNC) | Cash in | 145023 and 245000 |
| Late Fee Payment | Cash Out | 112603 and 145023 |
| NSF Fee Payment | Cash Out | 112603 and 145023 |
| Principal Payment | Cash Out | 112601 and 145023 |
| Unallocated Credit (UNC) | Cash Out | 245000 and 145023 |

| Scheduled Payment type | Direction | GL accounts |
| --- | --- | --- |
| Late Fee Payment | Cash in | 145023 and 744008 |
| NSF Fee Payment | Cash in | 145023 and 744008 |
| Snooze Fee Payment | Cash in | 145023 and 744008 |
| Principal Payment | Cash in | 145023 and 744008 |
| Late Fee Payment | Cash Out | 112603 and 145023 |
| NSF Fee Payment | Cash Out | 112603 and 145023 |
| Snooze Fee Payment | Cash in | 112603 and 145023 |

Apply Fee Return Late Fee Payment No Cash uses N/A for all columns.

- Apply Fee Return Late Fee Payment No Cash uses N/A for all columns.

### Charge Off Principal postings

Charge Off Principal postings map credit and debit rows to general ledger accounts under Separate GL Rule, depending on whether the charge off is classified as fraud or non fraud. All charge off rows use Batch Type Code 5 and Batch Alpha Code Blank.

| Charge off type | Row type | FDR GL | PPWC GL |
| --- | --- | --- | --- |
| Fraud | Credit | 744037 Fraud Loss Provision | 112601 Loans Receivable Principal |
| Fraud | Debit | 112601 Loans Receivable Principal | 744037 Fraud Loss Provision |
| Non Fraud | Credit | 744007 Credit Loss/Bad Debt Charge-off | 112601 Loans Receivable Principal |
| Non Fraud | Debit | 112601 Loans Receivable Principal | 744007 Credit Loss/Bad Debt Charge-off |

1. Create a Journal Entry Aggregation batch job so that the Journal Entry Aggregation summary is ready.
2. Hook up the Journal Entry Aggregation Summary table into the Trial Balance Report so the report uses pre-baked Journal Entry Aggregation data instead of aggregating journal entries every day.

### Charge-off loan account transaction postings

A repayment transaction on a charge-off loan account posts a credit to GLCode 744008 recoveries (Income from Recovery Repayment, Income, Allocation Type fees).

A goodwill credit transaction on a charge-off loan account posts the following entries:

- A debit to GLCode 744003 Principal bal adjustment (Expense from Goodwill Credit, Expense, Allocation Type Prin,excess).
- A debit to GLCode 404008 Fee Charge off (Income from Goodwill Credit Fees, Income, Allocation Type fees).
- A debit to GLCode 404008 Fee Charge off (Income from Goodwill Credit Penalty, Income, Allocation Type Penatly).
- A credit to GLCode 744008 recoveries (Income from Recovery Repayment, Income, Allocation Type prin).
- A credit to GLCode 744008 recoveries (Income from Recovery Repayment, Income, Allocation Type fees).
- A credit to GLCode 744008 recoveries (Income from Recovery Repayment, Income, Allocation Type Penalty).
- A credit to GLCode 245000 Other Credit liability (Overpayment Liability, Liability, Allocation Type excess).
