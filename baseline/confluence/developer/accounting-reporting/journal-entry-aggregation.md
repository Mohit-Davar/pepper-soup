# Journal Entry Aggregation

## Journal Entry Aggregation overview

Journal Entry Aggregation runs a batch job that prepares a summary table, and the Trial Balance Report uses that pre-baked data instead of aggregating every day. Journal entries trigger and use the same legacy events when created.

## Aggregation job filters

The aggregation job filters journal entries by office, entry type, manual flag, and submission date relative to the latest aggregated date.

The post_snapshot_delta_data where clause filters acc_gl_journal_entry where:

- entity_type_enum equals 1
- manual_entry equals false
- the latest aggregated date is null or submitted_on_date is greater than the latest aggregated date
- submitted_on_date is less than endDate
- office_id matches the office parameter

The summary_snapshot_baseline_data where clause filters ags where:

- entity_type_enum equals 1
- manual_entry equals false
- aggregated_on_date is less than or equal to the latest aggregated date
- office_id matches the office parameter

summary_snapshot_baseline_data groups results by productname, glcode, glname, and assetowner.

## Payment Waiver journal entries

A Payment Waiver posts credits to Loan portfolio, Interest Receivable, Fees Receivable, Penalties Receivable, and Overpayment for their allocated portions on non charge-off loan accounts. On charge-off loan accounts, it debits Income from Interest and credits Income from charge-off Interest and Overpayment. Reversals post the opposite entries.

| Account type | Transaction | Debit | Credit |
| --- | --- | --- | --- |
| Non charge-off | Payment Waiver | — | Loan portfolio (GL 112601) for total principal; Interest Receivable (GL 112603) for total interest; Fees Receivable (GL 112603) for total fees; Penalties Receivable (GL 112603) for total penalties; Overpayment for total overpayment |
| Non charge-off | Payment Waiver reversal | Income from Interest (GL 404000) for total amount entered | Loan portfolio (GL 112601), Interest Receivable (GL 112603), Fees Receivable (GL 112603), Penalties Receivable (GL 112603), and Overpayment for their respective allocated portions |
| Charge-off | Payment Waiver | Income from Interest (GL 404000) for total amount entered | Income from charge-off Interest (GL 404001) for total principal, interest, fees, and penalties; Overpayment for total overpayment |
| Charge-off | Payment Waiver reversal | Income from charge-off Interest (GL 404001) for total principal, interest, fees, and penalties; Overpayment for total overpayment | Income from Interest (GL 404000) for total amount entered |

## Charge-off account mappings

Charge-off account mappings decide which ledger accounts receive the interest, fees and penalty portions of a charge-off, charge adjustment or repayment entry.

Each entry type maps its portions to accounts as follows:

| Entry type | Interest portion | Fees portion | Penalty portion |
| --- | --- | --- | --- |
| Charge off Fraud | Interest income charge off | charge-off fees Income | charge-off Penalty Income |
| Charge off Non Fraud | Interest income charge off | charge-off fees Income | charge-off Penalty Income |
| Charge adjustment | income from fees | income from fees and charge-off fees Income | income from penalties and charge-off Penalty Income |
| OCA Repayment / Repayment | recoveries and fund source /advance accounting | recoveries and fund source /advance accounting | recoveries and fund source /advance accounting |

## Transaction Refund and Provisional Credit entries

Transaction Refund and Provisional Credit entries post cash in and cash out movements for loan disbursement principal, interest repayment, late fee, NSF fee, snooze fee, principal payment, and unallocated credit transactions. Each entry debits or credits fund source account 145023 and the matching receivable, liability, income, or expense account. The credit account depends on whether the entry carries the Y flag and whether it carries two Y flags.

| Transaction | Flags | Debit account | Debit label | Credit account | Credit label | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Loan Disbursement Principal Cash Out | none | 112601 | Loan portfolio | 145023 | Fund source | pass |
| Interest - Repayment Cash in | no Y flag | 145023 | Fund source | 112603 | Interest Receivable | pass |
| Late Fee Payment Cash in | no Y flag | 145023 | Fund source | 112603 | Penalties Receivable | pass |
| NSF Fee Payment Cash in | no Y flag | 145023 | Fund source | 112603 | Fees Receivable | pass |
| Snooze Fee Payment Cash in | no Y flag | 145023 | Fund source | 112603 | Fees Receivable | pass |
| Principal Payment Cash in | no Y flag | 145023 | Fund source | 112601 | Loan portfolio | pass |
| Unallocated Credit (UNC) Cash in | no Y flag | 145023 | Fund source | 245000 | Over payment liability | pass |
| Interest - Repayment Cash in | Y flag | 145023 | Fund source | 404001 | Income from ChargeOff Interest | in development |
| Late Fee Payment Cash in | Y flag | 145023 | Fund source | 404008 | Income from ChargeOff Penalty | in development |
| NSF Fee Payment Cash in | Y flag | 145023 | Fund source | 404008 | Income from ChargeOff Fees | in development |
| Snooze Fee Payment Cash in | Y flag | 145023 | Fund source | 404008 | Income from ChargeOff Fees | in development |
| Principal Payment Cash in | Y flag | 145023 | Fund source | 744007/740037 | ChargeOff Expense/Charge Off Fraud Expense | in development |
| Unallocated Credit (UNC) Cash in | Y flag | 145023 | Fund source | 245000 | Over payment liability | in development |
| Interest - Repayment Cash Out | Y flag | 112603 | Interest Receivable | 145023 | Fund source | pass |
| Late Fee Payment Cash Out | Y flag | 112603 | Penalties Receivable | 145023 | Fund source | pass |
| NSF Fee Payment Cash Out | Y flag | 112603 | Fees Receivable | 145023 | Fund source | pass |
| Snooze Fee Payment Cash Out | Y flag | 112603 | Fees Receivable | 145023 | Fund source | pass |
| Principal Payment Cash Out | Y flag | 112601 | Loan portfolio | 145023 | Fund source | pass |
| Unallocated Credit (UNC) Cash Out | Y flag | 245000 | Over payment liability | 145023 | Fund source | pass |
| Interest - Repayment Cash Out | Y and Y flags | 404001 | Income from ChargeOff Interest | 145023 | Fund source | in development |
| Late Fee Payment Cash Out | Y and Y flags | 404008 | Income from ChargeOff Penalty | 145023 | Fund source | in development |
| NSF Fee Payment Cash Out | Y and Y flags | 404008 | Income from ChargeOff Fees | 145023 | Fund source | in development |
| Snooze Fee Payment Cash Out | Y and Y flags | 404008 | Income from ChargeOff Fees | 145023 | Fund source | in development |
| Principal Payment Cash Out | Y and Y flags | 744007/740037 | ChargeOff Expense/Charge Off Fraud Expense | 145023 | Fund source | in development |
| Unallocated Credit (UNC) Cash Out | Y and Y flags | 245000 | Over payment liability | 145023 | Fund source | in development |

## Good Will entries

Good Will entries post accounting entries for goodwill credit transactions that involve no cash movement. The debit and credit accounts depend on the transaction type and whether the Y flag is set.

| Transaction type | Y flag | Debit account | Credit account | Debit label | Credit label | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Good Will Interest - Repayment No Cash | No | 404001 | 112603 | Income from Goodwill Credit Interest | Interest Receivable | TBD |
| Good Will Interest - Repayment No Cash | Yes | 404001 | 744008 | Income from Goodwill Credit Interest | Income from Recovery Repayment | in development |
| Good Will Late Fee Payment No Cash | No | 404008 | 112603 | Income from Goodwill Credit Penalty | Penalties Receivable | pass |
| Good Will Late Fee Payment No Cash | Yes | 404008 | 744008 | Income from Goodwill Credit Penalty | Income from Recovery Repayment | in development |
| Good Will NSF Fee Payment No Cash | No | 404008 | 112603 | Income from Goodwill Credit Fees | Fees Receivable | pass |
| Good Will NSF Fee Payment No Cash | Yes | 404008 | 744008 | Income from Goodwill Credit Fees | Income from Recovery Repayment | in development |
| Good Will Snooze Fee Payment No Cash | No | 404008 | 112603 | Income from Goodwill Credit Fees | Fees Receivable | pass |
| Good Will Snooze Fee Payment No Cash | Yes | 404008 | 744008 | Income from Goodwill Credit Fees | Income from Recovery Repayment | in development |
| Good Will Principal Payment No Cash | No | 744003 | 112601 | Expense from Goodwill Credit | Loan portfolio | pass |
| Good Will Principal Payment No Cash | Yes | 744003 | 744008 | Expense from Goodwill Credit | Income from Recovery Repayment | in development |
| Good Will Unallocated Credit (UNC) No Cash | No | 744003 | 245000 | Expense from Goodwill Credit | Over payment liability | pass |

## Late Fee Waiver entries

Late Fee Waiver entries post when a late fee is waived without a cash payment. The debit and credit accounts depend on the flag settings. All entries are in development.

| Flag settings | Debit account | Debit label | Credit account | Credit label |
| --- | --- | --- | --- | --- |
| No Y flag | 404007 | Income from Penalties | 112603 | Penalties Receivable |
| Y flag | 404007 | Income from Penalties | 404008 | Income from ChargeOff Penalty |
| Y flag | 112603 | Penalties Receivable | 404007 | Income from Penalties |
| Y and Y flags | 404008 | Income from ChargeOff Penalty | 404007 | Income from Penalties |

## NSF Fee Waiver entries

NSF Fee Waiver entries post fee waivers when no cash payment is made. The debit and credit accounts depend on the flag setting.

| Flag | Debit account | Debit label | Credit account | Credit label |
| --- | --- | --- | --- | --- |
| Without Y flag | 404007 | Income from Fees | 112603 | Fees Receivable |
| With Y flag | 404007 | Income from Fees | 404008 | Income from ChargeOff Fees |
| With Y flag | 112603 | Fees Receivable | 404007 | Income from Fees |
| With Y and Y flags | 404008 | Income from ChargeOff Fees | 404007 | Income from Fees |

## Auto Payment entries

Auto Payment entries post journal entries for Auto Payment Interest - Repayment transactions. The debit and credit accounts depend on the transaction direction, whether the Y flag is set, and the payment type. Entries marked in development are not yet complete.

| Transaction | Y flag | Payment type | Debit account | Credit account | Status |
| --- | --- | --- | --- | --- | --- |
| Auto Payment Interest - Repayment Cash in | Not set | Late Fee Payment | Fund source 145023 | Penalties Receivable 112603 |  |
| Auto Payment Interest - Repayment Cash in | Not set | NSF Fee Payment | Fund source 145023 | Fees Receivable 112603 |  |
| Auto Payment Interest - Repayment Cash in | Not set | Snooze Fee Payment | Fund source 145023 | Fees Receivable 112603 |  |
| Auto Payment Interest - Repayment Cash in | Not set | Principal Payment | Fund source 145023 | Loan portfolio 112601 |  |
| Auto Payment Interest - Repayment Cash in | Not set | Unallocated Credit (UNC) | Fund source 145023 | Over payment liability 245000 |  |
| Auto Payment Interest - Repayment Cash in | Set | Late Fee Payment | Fund source 145023 | Income from Recovery Repayment 744008 | In development |
| Auto Payment Interest - Repayment Cash in | Set | NSF Fee Payment | Fund source 145023 | Income from Recovery Repayment 744008 | In development |
| Auto Payment Interest - Repayment Cash in | Set | Snooze Fee Payment | Fund source 145023 | Income from Recovery Repayment 744008 | In development |
| Auto Payment Interest - Repayment Cash in | Set | Principal Payment | Fund source 145023 | Income from Recovery Repayment 744008 | In development |
| Auto Payment Interest - Repayment Cash in | Set | Unallocated Credit (UNC) | Fund source 145023 | Over payment liability 245000 | In development |
| Auto Payment Interest - Repayment Cash Out | Set | Late Fee Payment | Penalties Receivable 112603 | Fund source 145023 |  |
| Auto Payment Interest - Repayment Cash Out | Set | NSF Fee Payment | Fees Receivable 112603 | Fund source 145023 |  |
| Auto Payment Interest - Repayment Cash Out | Set | Snooze Fee Payment | 112603 | Fund source 145023 |  |
| Auto Payment Interest - Repayment Cash Out | Set | Principal Payment | Loan portfolio 112601 | Fund source 145023 |  |
| Auto Payment Interest - Repayment Cash Out | Set | Unallocated Credit (UNC) | Over payment liability 245000 | Fund source 145023 |  |
| Auto Payment Interest - Repayment Cash Out | Both Y flags | Late Fee Payment | Income from Recovery Repayment 744008 | Fund source 145023 | In development |
| Auto Payment Interest - Repayment Cash Out | Both Y flags | NSF Fee Payment | Income from Recovery Repayment 744008 | Fund source 145023 | In development |
| Auto Payment Interest - Repayment Cash Out | Both Y flags | Snooze Fee Payment | Income from Recovery Repayment 744008 | Fund source 145023 | In development |
| Auto Payment Interest - Repayment Cash Out | Both Y flags | Principal Payment | Income from Recovery Repayment 744008 | Fund source 145023 | In development |
| Auto Payment Interest - Repayment Cash Out | Both Y flags | Unallocated Credit (UNC) | Over payment liability 245000 | Fund source 145023 | In development |

## Scheduled Payment entries

Scheduled Payment entries record the accounting for cash received against a scheduled payment. The debit account and credit account depend on the payment type and whether the transaction carries the Y flag.

| Transaction type | Y flag | Debit account | Credit account |
| --- | --- | --- | --- |
| Late Fee Payment | Absent | Fund source 145023 | Penalties Receivable 112603 |
| NSF Fee Payment | Absent | Fund source 145023 | Fees Receivable 112603 |
| Snooze Fee Payment | Absent | Fund source 145023 | Fees Receivable 112603 |
| Principal Payment | Absent | Fund source 145023 | Loan portfolio 112601 |
| Unallocated Credit (UNC) | Absent | Fund source 145023 | Over payment liability 245000 |
| Late Fee Payment | Present | Fund source 145023 | Income from Recovery Repayment 744008 |
| NSF Fee Payment | Present | Fund source 145023 | Income from Recovery Repayment 744008 |
| Snooze Fee Payment | Present | Fund source 145023 | Income from Recovery Repayment 744008 |
| Principal Payment | Present | Fund source 145023 | Income from Recovery Repayment 744008 |
| Unallocated Credit (UNC) | Present | Fund source 145023 | Over payment liability 245000 |

## Apply Fee Return entries

Apply Fee Return entries post journal rows for late fee payments that have no cash applied. The row used depends on whether the payment carries the Y flag.

| Condition | Journal row |
| --- | --- |
| Late fee payment with no cash and N/A flags | R290 |
| Late fee payment with no cash and Y flags | R291 |

## Legacy accounting driver rows

Legacy accounting driver rows map transaction types to source systems, lifecycle events, helper and batch type labels, rule IDs, lifecycle names, SL accounts, and GL accounts.

define fixed fee and charge-off mappings.

| Row | Transaction | Count US | Source System | Lifecycle | Sublifecycle | Helper 1 | SL Account | GL Account |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R3 | Cash Advance | 6 | FDR_PPWC | Fixed Fee | Fixed Fee | Cash Advance-AU-Initialized-1 | 10010101 Receivables/Payables (Not Due) | ZAC1100000 TOTAL ASSETS |
| R6 | Charge-Off (Fraud) | 1 | B_FDR_PPWC | Fixed Fee | Premium WB (5%) - FixFee | Cash Advance-AU-Initialized-4 | 10020101 Accruals: Interest Income (Debit) | ZAC1100030 Cash & Cash Equivalents |
| R7 | Charge-Off (Non-Fraud) | 1 | FDR_PPWC | Fixed Fee Adjustment (Increase) | Fixed Fee Adj Inc | Cash Advance-AU-Initialized-5 | 10020102 Accruals: Income from Fees (Debit) | ZAC1100031 Cash & Cash Equivalents Main |
| R10 | Fixed Fee Adjustment (Decrease) | 4 | B_FDR_PPWC | Fixed Fee Adjustment (Increase) | Premium WB (5%) Adj INC - FixFee | Cash Advance-AU-New-1 | 10030101 Deferrals: Interest Income (Debit) | 103002 Payroll - outgoing |
| R11 | Fixed Fee Adjustment (Increase) | 4 | FDR_PPWC | Fixed Fee Adjustment (Decrease) | Fixed Fee Adj Dec | Cash Advance-AU-New-2 | 10030102 Deferrals: Interest Income (Credit) | 111194 GCE-UK Disbursements Clearing |

define currency position and equivalent value mappings with additional driver details.

| Row | Transaction | Source System | Helper 1 | Batch Type | Source System | FT | Rule ID | Lifecycle | SL Account | GL Account |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R123 | Payment Reversal | FDR | Cash Advance Adjustment (Increase) | Cash Advance Adjustment (Increase)-US-New-2 | B_FDR_PPWC | WebBank-Funding | 38 | NS LifeCycle Cash Advance Adjustment | 70010201 Currency Position Balance Sheet | 193011 Trademark & tradenames (RN) |
| R124 | Collector Receivable | BETL | Cash Advance Adjustment (Increase) | Cash Advance Adjustment (Increase)-US-New-3 | B_FDR_PPWC | WebBank-Funding | 39 | NS LifeCycle Cash Advance Adjustment | 70020101 Currency Position Income Statement | ZAC1100450 Customer list |
| R125 | Collection Agency Fee | BETL | Cash Advance Adjustment (Increase) | Cash Advance Adjustment (Increase)-US-New-4 | B_FDR_PPWC | Customer | 41 | NS LifeCycle Cash Advance Adjustment | 70020201 Currency Position Income Statement | 192511 Customer list(RN) |
| R126 | Unposted Transaction | BETL | Cash Advance Adjustment (Increase) | Cash Advance Adjustment (Increase)-US-New-5 | B_FDR_PPWC | WebBank-Funding | 40 | NS LifeCycle Cash Advance Adjustment | 70030101 Currency Position Reserve | ZAC1100460 Covenant not to compete |
| R127 | PPWC Error | FDR | Cash Advance Adjustment (Increase) | Cash Advance Adjustment (Increase)-US-New-6 | B_FDR_PPWC | WebBank-Investor | 42 | NS LifeCycle Cash Advance Adjustment | 70030201 Currency Position Reserve | 192011 Covenant not to compete (RN) |
| R128 | Payment | FDR | Cash Advance Adjustment (Increase) | Cash Advance Adjustment (Increase)-US-New-7 | B_FDR_PPWC | WebBank-Funding | 473 | NS LifeCycle Cash Advance Adjustment | 70090101 Equivalent Value | ZAC1100470 Developed Technology |
| R129 | Payment Reversal | FDR | Charge-Off (Fraud) | Charge-Off (Fraud)-AU-Initialized-1 | FDR_PPWC |  | 103 | NS LifeCycle Charge Off Principal (Fraud) | 70090201 Equivalent Value | 191011 Developed technology(RN) |
| R130 | Collector Receivable | BETL | Charge-Off (Fraud) | Charge-Off (Fraud)-AU-Initialized-2 |  |  |  |  | 80010101 Preliminary Currency Pos. Balance Sheet | ZAC1100480 Goodwill |
| R131 | LUX NET Collection | BETL | Charge-Off (Fraud) | Charge-Off (Fraud)-AU-Initialized-3 |  |  |  |  | 80010201 Preliminary Currency Pos. Balance Sheet | ZAC1100510 Goodwill |
| R132 | LUX NET Collection Replication | BETL | Charge-Off (Fraud) | Charge-Off (Fraud)-AU-Initialized-4 |  |  |  |  | 80090101 Preliminary Equivalent Value | 194010 Goodwill |
