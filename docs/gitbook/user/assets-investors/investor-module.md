# Investor Module

## Investor Module

The investor module shows loan accounts associated with investors and handles the sale and buyback of interest-bearing loans to external investors. Sale and buyback amounts include all balances on the loan, including any interest due, and interest balances are accounted for using the interest receivables GL mapping.

The investor screen provides the following views and actions:

- A global filter view shows loan account details associated with investors.
- The top of the screen summarises the total loan amount associated at each investor level.
- Investors and the total balance appear as a pie chart.
- You can drill down to each loan account by clicking on any loan from the view screen.

A loan officer sells an interest-bearing loan to an external investor. The loan has a principal of 1,000.00 and 10.00 in accrued interest and fees, so the total balance to sell is 1,010.00. The figures in this example are illustrative. This example shows that the total balance to sell includes both principal and accrued interest and fees.

| Entry | Account | Debit | Credit | Counterparty |
| --- | --- | --- | --- | --- |
| Record sale | Receivable/clearing account | 1,010.00 |  |  |
|  | Loan Receivables |  | 1,000.00 |  |
|  | Interest and fees receivables |  | 10.00 |  |
| Transfer to investor | Receivable/clearing account |  | 1,010.00 |  |
|  | Loan Receivables | 1,000.00 |  | Investor A |
|  | Interest and fees receivables | 10.00 |  | Investor A |

The same loan is bought back from the external investor. The buyback amount is the full balance of 1,010.00, consisting of 1,000.00 principal and 10.00 interest and fees. Compared with the sale, the debit and credit sides reverse because the loan returns to the asset owner.

| Entry | Account | Debit | Credit | Counterparty |
| --- | --- | --- | --- | --- |
| Record buyback | Receivable/clearing account |  | 1,010.00 |  |
|  | Loan Receivables | 1,000.00 |  |  |
|  | Interest and fees receivables | 10.00 |  |  |
| Transfer from investor | Receivable/clearing account | 1,010.00 |  |  |
|  | Loan Receivables |  | 1,000.00 | Investor A |
|  | Interest and fees receivables |  | 10.00 | Investor A |

See also: [Asset Externalization: Asset Externalization](asset-externalization.md#asset-externalization), [BNPL Products: Pay in 3 and Pay in 4](../loan-products/bnpl.md#pay-in-3-and-pay-in-4).
