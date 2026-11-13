# Fee Classification

## Fee classification overview

Fee classification applies slab-based flat charges to overdue loans. The charge applies to loan charges with charge time type Overdue Fees and charge calculation Fixed fees for various slabs or ranges of overdue amount plus interest plus any fees. The late fee depends on which overdue amount slab the overdue amount falls into, and each slab has a fixed fee.

An administrator defines each slab row with these fields:

- Overdue Amount From
- Overdue Amount To
- Fixed Fee

## Capitalized income and buydown fee classifications

You can classify Capitalized Income and Buydown Fee transactions. Classification is optional when you create either transaction type. If you do not provide one, it remains null. Fineract validates any classification you provide against the related codes.

| Transaction type | Classification code |
| --- | --- |
| Capitalized Income | capitalized_income_transaction_classification |
| Buydown Fee | buydown_fee_transaction_classification |

## Daily amortization schedules

The system calculates and stores Daily Amortization schedules at each Classification level. When an Adjustment transaction happens, the system recalculates the schedule. A Daily Amortization transaction can be aggregated to one entry at transaction level while allowing drill-down to classification level.

## Advanced accounting rules for classifications

Advanced accounting rules let you map a different income account for daily amortization based on a fee classification. You can also define a different credit income account for a classification added at code value.

The advanced accounting rules view includes two classification options:

| Option | Classification code value | Mapping field |
| --- | --- | --- |
| Capitalized Income | capitalized_income_transaction_classification | GL Income account |
| Buy down fee | buydown_fee_transaction_classification | GL Income account |

## Classification inheritance and adjustments

When you create an adjustment transaction for an existing Capitalized Income or Buydown Fee transaction, the adjustment inherits that transaction's classification. You cannot set a different classification. This inheritance rule does not apply to Amortization transactions, which contain only aggregated amounts.

## Amortization mappings and income accounts

When the system creates a Capitalized income amortization or Buy Down fees amortization transaction, it also creates amortization mappings. A mapping links one classification code to one GL account. You can add, update, and delete mappings, with a maximum of one GL account per classification code value.

Default mappings when no classification is selected:

| Transaction | Debit parameter | Debit GL | Credit parameter | Credit GL |
| --- | --- | --- | --- | --- |
| Capitalized income amortization | Differed Income | Liability | Income from Amortization | Interest/fees Income |
| Buy Down fees amortization | Differed Income | Liability | Buy Down fees Amortization | Interest/fees Income |

The system determines the allocation amount as follows:

- When only one Capitalized Income or Buydown fee transaction exists, the full amount is considered.
- When multiple Capitalized Income or Buydown fee transactions exist with the same classification, the full amount is considered.
- When multiple Capitalized Income or Buydown fee transactions exist with different classifications, the system fetches the allocation mapping from the amortization mapping table.
- If the mapping table does not exist or has no entry, the system calculates today's amortization for each transaction on the fly, groups them by classification, and uses the appropriate income GL account.

## Transaction details and API

The loan transaction details view shows the classification when one is set. The template API lists available classification values for Capitalized Income and Buydown Fee transaction types only; if none are set, it returns none.

## Origination fees

Origination fees are flat fees that you enter when you set up the loan. The system adds them to the loan account at disbursement level on the disbursement date only. The disbursement amount plus origination fees must not exceed the approved amount. The system treats origination fees as part of the principal, so schedule calculation and interest calculation are based on the disbursement amount plus origination fees, and allocation does not change during monetary transactions. The system maintains the fees balance during amortization as origination fee minus fee credits minus fee income recognized. No other monetary transactions or their accounting entries change.

## Worked examples

A loan officer creates a Capitalized Income transaction of 1,000 on a loan account. The Classification field is optional, so the officer selects Usage Fees. In the Advanced accounting rule section, the administrator has mapped Usage Fees to the Usage Fees Income account. When the system calculates a daily amortization of 10, it posts a debit to Deferred Income and a credit to Usage Fees Income. The figures in this example are illustrative. If no classification is selected, the credit account defaults to Interest/fees Income instead of Usage Fees Income.

| Date | Transaction | Amount | Classification | Debit account | Credit account |
| --- | --- | --- | --- | --- | --- |
| 1 Jan | Capitalized Income amortization | 10.00 | Usage Fees | Deferred Income (Liability) | Usage Fees Income |
| 1 Jan | Capitalized Income amortization | 10.00 | None | Deferred Income (Liability) | Interest/fees Income |

A loan carries two Capitalized Income transactions: 600 classified as Late Fees and 400 classified as Service Fees. On a given day the system calculates 6 of amortization for the first transaction and 4 for the second. Because the classifications differ, the system reads the allocation mapping table to find the income account for each classification. If the mapping table has no entry, it calculates each transaction's amortization on the fly, groups the amounts by classification, and applies the matching income account. When all transactions share one classification, the full amount is considered without consulting the mapping table.

| Date | Transaction | Amount | Classification | Amortization | Credit account |
| --- | --- | --- | --- | --- | --- |
| 1 Jan | Capitalized Income #1 | 600.00 | Late Fees | 6.00 | Late Fees Income |
| 1 Jan | Capitalized Income #2 | 400.00 | Service Fees | 4.00 | Service Fees Income |
| 1 Jan | Total | 1,000.00 |  | 10.00 |  |

A loan officer creates an adjustment for an existing Capitalized Income transaction that carries the classification Usage Fees. The adjustment automatically inherits Usage Fees, and the officer cannot select a different classification. Aggregated amortization transactions are not subject to this inheritance rule because they contain only combined amounts.

| Transaction | Source classification | Adjustment classification | User can change classification? |
| --- | --- | --- | --- |
| Capitalized Income | Usage Fees | — | Yes |
| Adjustment for that Capitalized Income | Usage Fees | Usage Fees | No |
| Amortization transaction | — | Aggregated | Not applicable |

See also: [Capitalized Income](capitalized-income.md), [Buy-Down Fees](buy-down-fees.md).
