# Journal Entry Aggregation

## About Journal Entry Aggregation

Journal Entry Aggregation prepares summary data so the Trial Balance Report uses pre-baked data instead of aggregating every day.

## Aggregation job and report data

The aggregation job populates the tables that reports read from. Before the job runs, reports must check for null values in those tables.

The post snapshot delta data query includes journal entries where:

- entity_type_enum equals 1
- manual_entry equals false
- the latest aggregated date is null or submitted_on_date is later than the latest aggregated date
- submitted_on_date is earlier than the end date
- office_id matches the office parameter

The summary snapshot baseline data query includes aggregated journal entries where:

- aggregated_on_date is on or before the latest aggregated date

## Charge off journal entries

Charge off journal entries record how the interest, fees, and penalty portions of a charged-off loan map to income and receivable accounts. The mapping depends on whether the charge off is classified as Fraud or Non Fraud.

| Charge off type | Portion | Accounts |
| --- | --- | --- |
| Fraud | Interest | Interest income charge off, Interest Receivable |
| Fraud | Fees | Fee Charge off, Fee Receivable, charge-off fees Income |
| Fraud | Penalty | Fee Charge off, Fee Receivable, charge-off Penalty Income |
| Non Fraud | Interest | Interest income charge off |
| Non Fraud | Fees | charge-off fees Income |
| Non Fraud | Penalty | charge-off Penalty Income |

## Charge adjustment journal entries

Charge adjustment journal entries map each charge portion to income and liability accounts.

| Charge portion | Accounts |
| --- | --- |
| Fees | Fee Income, Fee Charge off, income from fees, charge-off fees Income |
| Unallocated Credit (UNC) | Fee Income, Other Credit liability, income from fees, Overpayment Liability |
| Penalty | Fee Income, Fee Charge off, income from penalties, charge-off Penalty Income |

## OCA Repayment journal entries

OCA Repayment journal entries post the interest, fees, penalty, and Unallocated Credit portions of a repayment to their respective accounts.

| Portion | Accounts |
| --- | --- |
| Interest | Other receivables, recoveries, fund source /advance accounting, Income from Recovery payment |
| Fees | Other receivables, recoveries, fund source /advance accounting, Income from Recovery payment |
| Penalty | Other receivables, recoveries, fund source /advance accounting, Income from Recovery payment |
| Unallocated Credit (UNC) | Other receivables, Other Credit liability, fund source /advance accounting, Overpayment Liability |

## Ownership sale and buyback journal entries

Ownership sale and buyback journal entries record the movement of a loan balance between the investor and PayPal accounts at the close of business on the settlement date.

| Transaction type | Close of business entries |
| --- | --- |
| Sale of ownership | CR 112601 /112603 - DR 146000 - PayPal CR 146000 - DR 112601 /112603 - Investor |
| Buyback | DR 112601 /112603 - CR 146000 - PayPal DR 146000 - CR 112601 /112603 - Investor |

The system passes general ledger entries for the loan balance amount at the close of business of the settlement date:

- For a sale of ownership: DR Loan/Fee Rec-Investor CR Loan/Fee Rec-PayPal.

## Asset sale and buyback journal entries

At close of business (COB), the system posts asset sale and asset buyback transactions using the closing balance of the loan account. Each transaction creates two journal entries: DR 145600, CR 112601/112603 and DR 112601/112603, CR 145600. The system publishes events for both journal entries.

| Transaction | Loan condition | Ownership condition |
| --- | --- | --- |
| Asset sale | Active loan | No active ownership record |
| Asset sale | Active loan | Previous inactive ownership records and no active ownership record |
| Asset buyback | Active loan | Active ownership record |
| Asset buyback | FRAUD loan | No active ownership record |

## Transaction refund and provisional credit cash in

Transaction refund and provisional credit cash in posts cash received for interest, late fees, NSF fees, snooze fees, principal or unallocated credit to the fund source account and credits the matching receivable or liability account.

| Transaction type | Debit account | Credit account | Status | Debit label | Credit label |
| --- | --- | --- | --- | --- | --- |
| Interest repayment cash in | 145023 | 112603 | pass | Fund source | Interest Receivable |
| Late fee payment cash in | 145023 | 112603 | pass | Fund source | Penalties Receivable |
| NSF fee payment cash in | 145023 | 112603 | pass | Fund source | Fees Receivable |
| Snooze fee payment cash in | 145023 | 112603 | pass | Fund source | Fees Receivable |
| Principal payment cash in | 145023 | 112601 | pass | Fund source | Loan portfolio |
| Unallocated credit cash in | 145023 | 245000 | pass | Fund source | Over payment liability |

## Transaction refund and provisional credit cash in with Y flag

Transaction Refund/Provisional Credit Cash in with Y flag posts repayment journal entries for interest, late fees, NSF fees, snooze fees, principal and unallocated credit. Each entry debits account 145023 (Fund source) and credits the account shown below.

| Entry type | Credit account | Credit label |
| --- | --- | --- |
| Interest repayment | 404001 | Income from ChargeOff Interest |
| Late fee payment | 404008 | Income from ChargeOff Penalty |
| NSF fee payment | 404008 | Income from ChargeOff Fees |
| Snooze fee payment | 404008 | Income from ChargeOff Fees |
| Principal payment | 744007/740037 | ChargeOff Expense/Charge Off Fraud Expense |
| Unallocated credit (UNC) | 245000 | Over payment liability |

## Transaction refund and provisional credit cash out with Y flag

Transaction Refund/Provisional Credit Cash Out with Y flag posts a cash-out journal entry for interest, late fees, NSF fees, snooze fees, principal or unallocated credit. The debit account and label depend on the payment type; the credit account and label are always Fund source.

| Payment type | Debit account | Debit label | Credit account | Credit label | Status |
| --- | --- | --- | --- | --- | --- |
| Interest | 112603 | Interest Receivable | 145023 | Fund source | pass |
| Late fee | 112603 | Penalties Receivable | 145023 | Fund source | pass |
| NSF fee | 112603 | Fees Receivable | 145023 | Fund source | pass |
| Snooze fee | 112603 | Fees Receivable | 145023 | Fund source | pass |
| Principal | 112601 | Loan portfolio | 145023 | Fund source | pass |
| Unallocated credit | 245000 | Over payment liability | 145023 | Fund source | pass |

## Transaction refund and provisional credit cash out with Y and Y flags

Transaction Refund/Provisional Credit Cash Out with Y and Y flags posts a debit to an income or expense account and a credit to Fund source account 145023.

| Transaction type | Debit account | Debit label | Credit account | Credit label |
| --- | --- | --- | --- | --- |
| Interest repayment cash out | 404001 | Income from ChargeOff Interest | 145023 | Fund source |
| Late fee payment cash out | 404008 | Income from ChargeOff Penalty | 145023 | Fund source |
| NSF fee payment cash out | 404008 | Income from ChargeOff Fees | 145023 | Fund source |
| Snooze fee payment cash out | 404008 | Income from ChargeOff Fees | 145023 | Fund source |
| Principal payment cash out | 744007/740037 | ChargeOff Expense/Charge Off Fraud Expense | 145023 | Fund source |
| Unallocated Credit (UNC) cash out | 245000 | Over payment liability | 145023 | Fund source |

## Good will no cash journal entries

Good will no cash journal entries record goodwill credit postings that do not move cash. Each entry debits an income or expense account and credits a receivable, liability or loan portfolio account, with status pass. The debit and credit labels depend on the fee type or principal payment.

| Entry type | Debit account | Credit account | Debit label | Credit label |
| --- | --- | --- | --- | --- |
| Good Will Late Fee Payment No Cash | 404008 | 112603 | Income from Goodwill Credit Penalty | Penalties Receivable |
| Good Will NSF Fee Payment No Cash | 404008 | 112603 | Income from Goodwill Credit Fees | Fees Receivable |
| Good Will Snooze Fee Payment No Cash | 404008 | 112603 | Income from Goodwill Credit Fees | Fees Receivable |
| Good Will Principal Payment No Cash | 744003 | 112601 | Expense from Goodwill Credit | Loan portfolio |
| Good Will Unallocated Credit (UNC) No Cash | 744003 | 245000 | Expense from Goodwill Credit | Over payment liability |

## Good will no cash journal entries with Y flag

Good will no cash journal entries with a Y flag record goodwill credit income without moving cash. Each entry debits one goodwill income account and credits the recovery repayment account.

| Entry type | Debit account | Debit label | Credit account | Credit label |
| --- | --- | --- | --- | --- |
| Good Will Interest - Repayment No Cash with Y flag | 404001 | Income from Goodwill Credit Interest | 744008 | Income from Recovery Repayment |
| Good Will Late Fee Payment No Cash with Y flag | 404008 | Income from Goodwill Credit Penalty | 744008 | Income from Recovery Repayment |
| Good Will NSF Fee Payment No Cash with Y flag | 404008 | Income from Goodwill Credit Fees | 744008 | Income from Recovery Repayment |
| Good Will Snooze Fee Payment No Cash with Y flag | 404008 | Income from Goodwill Credit Fees | 744008 | Income from Recovery Repayment |
| Good Will Principal Payment No Cash with Y flag | 744003 | Expense from Goodwill Credit | 744008 | Income from Recovery Repayment |

## Late fee waiver journal entries

Late fee waiver journal entries record how waived late fees move between penalty income and receivable accounts without cash changing hands. The entry depends on whether the Y flag and Y and Y flags are set.

| Flag setting | Debit account | Debit label | Credit account | Credit label |
| --- | --- | --- | --- | --- |
| No Y flag | 404007 | Income from Penalties | 112603 | Penalties Receivable |
| Y flag | 404007 | Income from Penalties | 404008 | Income from ChargeOff Penalty |
| Y flag | 112603 | Penalties Receivable | 404007 | Income from Penalties |
| Y and Y flags | 404008 | Income from ChargeOff Penalty | 404007 | Income from Penalties |

## NSF fee waiver journal entries

NSF fee waiver journal entries post without cash and use four flag combinations.

| Flag combination | Debit account | Debit label | Credit account | Credit label |
| --- | --- | --- | --- | --- |
| No Y flag | 404007 | Income from Fees | 112603 | Fees Receivable |
| Y flag | 404007 | Income from Fees | 404008 | Income from ChargeOff Fees |
| Y flag | 112603 | Fees Receivable | 404007 | Income from Fees |
| Y and Y flags | 404008 | Income from ChargeOff Fees | 404007 | Income from Fees |

## Auto payment interest repayment cash in

Auto Payment Interest - Repayment Cash in posts each payment type to its own receivable or liability account, always debiting Fund source 145023.

Each payment type credits the account shown:

| Payment type | Debit account | Credit account |
| --- | --- | --- |
| Late Fee Payment | Fund source 145023 | Penalties Receivable 112603 |
| NSF Fee Payment | Fund source 145023 | Fees Receivable 112603 |
| Snooze Fee Payment | Fund source 145023 | Fees Receivable 112603 |
| Principal Payment | Fund source 145023 | Loan portfolio 112601 |
| Unallocated Credit (UNC) | Fund source 145023 | Over payment liability 245000 |

## Auto payment interest repayment cash in with Y flag

Late Fee Payment, NSF Fee Payment, Snooze Fee Payment and Principal Payment credit Income from Recovery Repayment 744008. Unallocated Credit (UNC) credits Over payment liability 245000.

| Payment type | Debit | Credit |
| --- | --- | --- |
| Late Fee Payment | Fund source 145023 | Income from Recovery Repayment 744008 |
| NSF Fee Payment | Fund source 145023 | Income from Recovery Repayment 744008 |
| Snooze Fee Payment | Fund source 145023 | Income from Recovery Repayment 744008 |
| Principal Payment | Fund source 145023 | Income from Recovery Repayment 744008 |
| Unallocated Credit (UNC) | Fund source 145023 | Over payment liability 245000 |

## Auto payment interest repayment cash out with Y flag

For an Auto Payment Interest - Repayment Cash Out transaction with the Y flag, each payment type posts to its own receivable or liability account and credits Fund source 145023.

| Payment type | Debit account | Credit account |
| --- | --- | --- |
| Late Fee Payment | Penalties Receivable 112603 | Fund source 145023 |
| NSF Fee Payment | Fees Receivable 112603 | Fund source 145023 |
| Principal Payment | Loan portfolio 112601 | Fund source 145023 |
| Unallocated Credit (UNC) | Over payment liability 245000 | Fund source 145023 |

## Auto payment interest repayment cash out with both Y flags

For an Auto Payment Interest - Repayment Cash Out transaction with both Y flags, each payment type posts to Income from Recovery Repayment 744008 and Fund source 145023.

| Payment type | Debit account | Credit account |
| --- | --- | --- |
| Late Fee Payment | Income from Recovery Repayment 744008 | Fund source 145023 |
| NSF Fee Payment | Income from Recovery Repayment 744008 | Fund source 145023 |
| Principal Payment | Income from Recovery Repayment 744008 | Fund source 145023 |
| Unallocated Credit (UNC) | Over payment liability 245000 | Fund source 145023 |

## Scheduled payment interest repayment cash in

A Scheduled Payment Interest - Repayment Cash in transaction without the Y flag posts each payment type to its own debit and credit accounts. The debit always comes from Fund source 145023.

| Payment type | Debit account | Credit account |
| --- | --- | --- |
| Late Fee Payment | Fund source 145023 | Penalties Receivable 112603 |
| NSF Fee Payment | Fund source 145023 | Fees Receivable 112603 |
| Snooze Fee Payment | Fund source 145023 | Fees Receivable 112603 |
| Principal Payment | Fund source 145023 | Loan portfolio 112601 |
| Unallocated Credit (UNC) | Fund source 145023 | Over payment liability 245000 |

## Scheduled payment interest repayment cash in with Y flag

| Payment type | Debit account | Credit account |
| --- | --- | --- |
| Late Fee Payment | Fund source 145023 | Income from Recovery Repayment 744008 |
| NSF Fee Payment | Fund source 145023 | Income from Recovery Repayment 744008 |
| Snooze Fee Payment | Fund source 145023 | Income from Recovery Repayment 744008 |
| Principal Payment | Fund source 145023 | Income from Recovery Repayment 744008 |
| Unallocated Credit (UNC) | Fund source 145023 | Over payment liability 245000 |
