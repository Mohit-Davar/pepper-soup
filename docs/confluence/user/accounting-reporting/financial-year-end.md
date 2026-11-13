# Financial Year-End

Fineract does not include a financial year-end process. You manually calculate profit and loss for the financial year and post it as a manual journal entry.

At financial year-end, the user runs the trial balance summary report to see each ledger account’s opening balance, movements during the year, and closing balance. The figures below are illustrative. The report separates balance sheet accounts, such as Loans Receivable and Interest Receivable, from income and expense accounts, such as Fee Income and Staff Expense, so the user can work out the year’s profit or loss before closing the books.

| Account | Class | Debit | Credit |
| --- | --- | --- | --- |
| Loans Receivable | Asset | 10,000.00 |  |
| Interest Receivable | Asset | 1,000.00 |  |
| Unearned Credit | Liability |  | 500.00 |
| Retained Earnings | Equity |  | 10,000.00 |
| Fee Income | Income |  | 2,000.00 |
| Interest Expense | Expense | 500.00 |  |
| Staff Expense | Expense | 1,000.00 |  |
| Trial balance totals |  | 12,500.00 | 12,500.00 |
| Fee Income | Income |  | 2,000.00 |
| Interest Expense | Expense | 500.00 |  |
| Staff Expense | Expense | 1,000.00 |  |
| Net profit for the year |  |  | 500.00 |

Because Fineract does not close the financial year automatically, the user posts a manual journal entry to close the income and expense accounts and move the profit or loss to retained earnings. The entry below uses the illustrative net profit from the previous example. A loss would be posted the other way round, with retained earnings debited instead of credited.

| Account | Debit | Credit |
| --- | --- | --- |
| Fee Income | 2,000.00 |  |
| Interest Expense |  | 500.00 |
| Staff Expense |  | 1,000.00 |
| Retained Earnings |  | 500.00 |
| Totals | 2,000.00 | 2,000.00 |

See also: [Investor Module](confluence-link:Investor%20Module).
