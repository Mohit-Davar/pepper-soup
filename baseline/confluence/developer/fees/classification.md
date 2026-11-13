# Fee Classification

## Fee classification overview

You can configure classifications for capitalized Income and BuyDown fees transactions. Classification selection is optional when you create these transactions.

A new fee type, origination fees, is introduced at the product level. You can map origination fees to a loan product at the loan product level. The origination fees amount is flat based and entered by you.

## Classification field and validation

The loan transaction entity includes a classification field stored as a Long in the database and as a CodeValue in Java. If you do not set one, the field remains null. Fineract validates that any classification you provide exists based on the related codes.

## Daily amortization schedules

The system calculates and stores Daily Amortization schedules at each Classification level. When an Adjustment transaction happens, the system recalculates the schedules. A Daily Amortization transaction can be aggregated to ONE entry at transaction level while allowing drill-down to classification level.

## Adjustment inheritance

When you create an adjustment transaction for an existing Capitalized Income or Buydown Fee transaction, the adjustment inherits that transaction's classification. You cannot set a different classification. This rule does not apply to Amortization transactions because they contain only aggregated amounts. Business events contain the classification field.

## Amortization allocation mapping table

The amortization allocation mapping table records Capitalized Income / Buydown fee amortization allocations separately for each base transaction, because amortization transactions store only aggregated amounts. The system creates mappings when it calculates and creates Capitalized income / buy down fee amortization or amortization adjustment transactions. Mappings are not linked to loan transactions and must not be fetched via loan transactions.

Mapping table columns:

| Column | Type | Description |
| --- | --- | --- |
| type | Enum: Capitalized Income / Buydown fee | Classification of the base fee |
| loan_id | FK to Loan | The loan the fee belongs to |
| base_loan_transaction_id | FK to original Capitalized Income / Buy down fee transaction | The base fee transaction being amortized |
| date | DATE | Date of the amortization allocation |
| amortization_loan_transaction_id | FK to loan transaction | The amortization transaction this allocation belongs to |
| type | ENUM: AM amortization / AM_ADJ amortization adjustment | Whether the allocation is an amortization or an amortization adjustment |
| amount | BigDecimal | The actual amortization amount for this base transaction |
| audit fields | Audit fields | Standard audit fields |

## Default income accounts

When no fee classification is selected, capitalized income amortization debits Deferred Income and credits Interest/fees Income from amortization. Buy Down fee amortization debits Deferred Income and credits Interest/fees Income from Buy Down fees amortization.

## Advanced accounting rule mappings

Advanced accounting rule mappings let you assign a different GL income account to each classification code value for capitalized income and buy down fees. Each classification code value can map to one GL account, and you can add, update, or delete these mappings.

| Rule type | Classification code value | GL income account |
| --- | --- | --- |
| Capitalized Income | capitalized_income_transaction_classification | One GL account per classification code value |
| Buy down fee | buydown_fee_transaction_classification | One GL account per classification code value |

## Fetching allocation amounts

The system determines how to fetch allocation amounts for Capitalized Income / Buydown fee transactions based on how many exist and whether they share a classification.

Fetching rules:

- When only one Capitalized Income / Buydown fee transaction exists, the system considers the full amount.
- When multiple Capitalized Income / Buydown fee transactions exist with the same classification, the system considers the full amount.
- When multiple Capitalized Income / Buydown fee transactions exist with different classifications, the system fetches the allocation mapping from the amortization mapping table.
- If the amortization mapping table does not exist or has no entry, the system calculates today's amortization for each transaction on the fly, groups them by classification, and uses the appropriate income GL account.

## Origination fees

Origination fees are added to the loan account at disbursement level and on the disbursement date only.

Schedule calculation and interest calculation are both based on the disbursement amount plus origination fees, and monetary transactions do not change allocation.

Validation requires that the disbursement amount plus origination fees be less than or equal to the approved amount.

Amortization and charge-off rules:

- Amortization is done daily at close of business (COB), the nightly job that posts interest and fees.
- The system maintains the fees balance as origination fee minus fee credits minus fee income recognized.
- Charge-off charges off the origination fees, and no amortization is done after the charge-off date.
- Final amortization is done for the balance amount if the loan is preclosed on the same day.

## Fees adjustment and allocation strategy

When a fees adjustment amount is greater than unrecognized income, the system credits or debits the difference from the income account. The Capitalized Income Adjustment allocates amounts in this order: past due Principal, past due Int, Past due fees, Past due Penalty, due Principal, due Int, due fees, due Penalty, advance Principal, advance Int, advance fees, advance Penalty.

## APIs

Use the capitalized income APIs to list amortization allocation schedule details for capitalized income transactions, and the buydown fee APIs for buydown fee transactions. Each API identifies the loan by ID or external ID and the transaction by ID or external ID.

Available endpoints:

- /v1/loans/{loanId}/capitalized-incomes/{loanTransactionId}
- /v1/loans/external-id/{loanExternalId}/capitalized-incomes/{loanTransactionId}
- /v1/loans/{loanId}/capitalized-incomes/external-id/{loanTransactionExternalId}
- /v1/loans/external-id/{loanExternalId}/capitalized-incomes/external-id/{loanTransactionExternalId}
- /v1/loans/{loanId}/buydown-fees/{loanTransactionId}
- /v1/loans/external-id/{loanExternalId}/buydown-fees/{loanTransactionId}
- /v1/loans/{loanId}/buydown-fees/external-id/{loanTransactionExternalId}
- /v1/loans/external-id/{loanExternalId}/buydown-fees/external-id/{loanTransactionExternalId}

The response lists the loan ID, loan external ID, base loan transaction, base loan transaction date, base loan transaction amount, unrecognized amount, charged-off amount, adjustment amount, and mapping table columns: amortization loan transaction ID, amortization loan transaction external ID, date, type (Amortization or Amortization adjustment), and amount.

The template API returns available classification values for Capitalized Income and Buydown Fee transaction types through classificationOptions as a list of code values, defaulting to none when none are set.

## Worked examples

A loan is disbursed for 1,000. On the same day a capitalized income fee of 100 is created and optionally classified using the capitalized_income_transaction_classification code. The loan product has an advance accounting rule that maps the Usage Fees classification to the Usage Fees Income general ledger account. The figures are illustrative. The example shows that a selected classification routes the amortization credit to the mapped income account; if no classification is selected, the credit defaults to Interest/fees Income and all other entries are unchanged.

| Date | Transaction | Debit account | Debit amount | Credit account | Credit amount | Classification |
| --- | --- | --- | --- | --- | --- | --- |
| 1/1 | Disbursement | Loan Portfolio Loan Receivable | 1,000.00 | Fund Source Suspense/clearing | 1,000.00 | – |
| 1/1 | Capitalized Income | Loan Portfolio Loan Receivable | 100.00 | Deferred Income | 100.00 | Usage Fees |
| 1/1 | Daily amortization | Deferred Income | 1.00 | Usage Fees Income | 1.00 | Usage Fees |
| 1/2 | Daily amortization | Deferred Income | 1.00 | Usage Fees Income | 1.00 | Usage Fees |
|  | Totals |  | 1,102.00 |  | 1,102.00 |  |

A loan product carries an origination fee of 100 mapped at product level. A loan is approved for 1,100 and disbursed for 1,000 on 1/1. The system validates that disbursement plus origination fees does not exceed the approved amount. The fee is treated as principal, so schedule and interest are calculated on 1,100, and the fee amortizes daily at close of business. The example shows origination fees increase the disbursement-day principal, are validated against the approved amount including the fee, and amortize daily until the fee balance reaches zero.

| Date | Transaction | Debit account | Debit amount | Credit account | Credit amount | Origination fee balance |
| --- | --- | --- | --- | --- | --- | --- |
| 1/1 | Disbursement | Loan Portfolio Loan Receivable | 1,000.00 | Fund Source Suspense/clearing | 1,000.00 | – |
| 1/1 | Origination fees | Loan Portfolio Loan Receivable | 100.00 | Deferred Income | 100.00 | 100.00 |
| 1/1 | Daily amortization | Deferred Income | 1.00 | Interest/fees Income | 1.00 | 99.00 |
| 1/2 | Daily amortization | Deferred Income | 1.00 | Interest/fees Income | 1.00 | 98.00 |
|  | Totals |  | 1,102.00 |  | 1,102.00 |  |

A loan has two capitalized income transactions: 100 classified as Usage Fees and 50 with no classification. An adjustment of 30 is posted against the first transaction. The adjustment automatically inherits the target transaction's classification and the user cannot set a different classification. Because the base transactions carry different classifications, the system stores per-transaction amortization amounts in the amortization mapping table instead of relying on a single aggregated entry. The example shows an adjustment inherits the base transaction's classification and cannot be overridden, and that the mapping table stores each base transaction's amortization amount separately because the aggregated amortization entry hides the split.

| Date | Transaction | Classification | Debit account | Debit amount | Credit account | Credit amount | Mapping type | Mapping amount |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1/1 | Capitalized Income #1 | Usage Fees | Loan Portfolio Loan Receivable | 100.00 | Deferred Income | 100.00 | – | – |
| 1/1 | Capitalized Income #2 | null | Loan Portfolio Loan Receivable | 50.00 | Deferred Income | 50.00 | – | – |
| 1/1 | Amortization #1 | Usage Fees | Deferred Income | 1.00 | Usage Fees Income | 1.00 | AM | 1.00 |
| 1/1 | Amortization #1 | null | Deferred Income | 0.50 | Interest/fees Income | 0.50 | AM | 0.50 |
| 1/10 | Adjustment #1 | Usage Fees (inherited) | Deferred Income | 30.00 | Loan Portfolio Loan Receivable | 30.00 | AM_ADJ | 30.00 |
|  | Totals |  |  | 181.50 |  | 181.50 |  |  |

See also: [Buy-Down Fees](confluence-link:Buy-Down%20Fees).
