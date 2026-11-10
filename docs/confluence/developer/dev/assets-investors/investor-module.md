# Investor Module

## Investor Module

The investor module handles sale and buyback of interest-bearing loans to external investors, including outstanding interest balances in the total balance and accounting entries.

Sale and buyback behaviour:

- Sale and buyback logic includes interest balances when determining the total balance to sell or buy back.
- The asset transfer amount includes all balances on the loan, including any interest due.
- The buyback amount includes all balances on the loan, including any interest due.
- Interest balances are handled correctly during sale to an external investor and buyback from an external investor.
- Accounting entries are properly configured and set, and accounting entries are created properly.
- For interest, the interest receivables GL mapping is used.

An interest-bearing loan has a principal of 1,000.00 and accrued interest and fees of 10.00, so its total balance is 1,010.00. The asset owner sells the loan to an external investor, Investor A. The sale removes the loan and its interest balance from the asset owner’s books and creates a receivable from the investor. The figures are illustrative. For a buyback, the same entries post with debits and credits reversed, returning the loan and its interest balance to the asset owner.

| Entry | Account | Debit | Credit | Counterparty |
| --- | --- | --- | --- | --- |
| Sale 1 | 146000 Receivable/clearing | 1,010.00 |  |  |
| Sale 1 | 112601 Loan Receivables |  | 1,000.00 |  |
| Sale 1 | 112603 Interest fees receivables |  | 10.00 |  |
| Sale 2 | 146000 Receivable/clearing |  | 1,010.00 |  |
| Sale 2 | 112601 Loan Receivables | 1,000.00 |  | Investor A |
| Sale 2 | 112603 Interest fees receivables | 10.00 |  | Investor A |

See also: [BNPL: Pay in 3 and 4](confluence-link:BNPL#pay-in-3-and-4), [Asset Externalization: Asset Externalization](confluence-link:Asset%20Externalization#asset-externalization).
